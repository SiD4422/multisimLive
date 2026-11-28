import { describe, it, expect } from 'vitest';
import { SUBCKT_DEFINITIONS } from '../netlister/getComponentNetlist';
import { PINOUT_STUB_NOTES } from '../../data/components';
import { runSpiceSimulationNode } from '../../../scripts/nodeSpiceRunner.mjs';

function firstBlockSeries(rows: Array<Record<string, number>>, sig: string): Array<{ t: number; v: number }> {
  const pts: Array<{ t: number; v: number }> = [];
  let prevT = -1;
  for (const r of rows) {
    const val = r[sig];
    const t = r.time;
    if (val !== undefined && t !== undefined) {
      if (t < prevT) break;
      prevT = t;
      pts.push({ t, v: val });
    }
  }
  return pts;
}

async function runAndSampleFinal(netlist: string, signals: string[]): Promise<Record<string, number>> {
  const rows = await runSpiceSimulationNode(netlist);
  expect(Array.isArray(rows)).toBe(true);
  expect(rows.length).toBeGreaterThan(0);

  const out: Record<string, number> = {};
  for (const sig of signals) {
    const pts = firstBlockSeries(rows, sig);
    expect(pts.length, `Signal ${sig} missing from simulation output`).toBeGreaterThan(0);
    out[sig] = pts[pts.length - 1].v;
  }
  return out;
}

function measureFrequencyHz(pts: Array<{ t: number; v: number }>, tStart: number, threshold = 2.0): number {
  const crossings: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].t < tStart) continue;
    if (pts[i - 1].v < threshold && pts[i].v >= threshold) {
      const dv = pts[i].v - pts[i - 1].v || 1;
      const frac = (threshold - pts[i - 1].v) / dv;
      crossings.push(pts[i - 1].t + frac * (pts[i].t - pts[i - 1].t));
    }
  }
  expect(crossings.length, 'Expected >= 2 rising crossings for oscillation frequency').toBeGreaterThanOrEqual(2);
  let totalPeriod = 0;
  for (let i = 1; i < crossings.length; i++) {
    totalPeriod += crossings[i] - crossings[i - 1];
  }
  const avgPeriod = totalPeriod / (crossings.length - 1);
  return 1 / avgPeriod;
}

function resolveSubcktDeps(keys: string[]): string {
  const nameToKey: Record<string, string> = {};
  for (const [k, body] of Object.entries(SUBCKT_DEFINITIONS)) {
    const hdr = body.split(/\r?\n/).find((l) => /^\s*\.subckt\s+/i.test(l));
    if (hdr) {
      nameToKey[hdr.trim().split(/\s+/)[1].toUpperCase()] = k;
    }
  }
  const seen = new Set<string>();
  const collected: string[] = [];
  const visit = (k: string) => {
    if (seen.has(k) || !SUBCKT_DEFINITIONS[k]) return;
    seen.add(k);
    for (const line of SUBCKT_DEFINITIONS[k].split(/\r?\n/)) {
      if (/^\s*X\S*\s+/i.test(line)) {
        const toks = line.trim().split(/\s+/);
        const depKey = nameToKey[toks[toks.length - 1].toUpperCase()];
        if (depKey) visit(depKey);
      }
    }
    collected.push(SUBCKT_DEFINITIONS[k]);
  };
  keys.forEach(visit);
  return collected.join('\n');
}

describe('Phase 2.2: Subcircuit SPICE Syntax & Behavioral Verification', () => {
  it('enforces valid native ngspice syntax across all 310 SUBCKT_DEFINITIONS (zero PSpice constructs)', () => {
    for (const [key, body] of Object.entries(SUBCKT_DEFINITIONS)) {
      const codeLines = body
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('.'));
      const hdr = body.split(/\r?\n/).find((l) => /^\s*\.subckt\s+/i.test(l));
      expect(hdr, `${key} missing .subckt header`).toBeDefined();
      const ports = hdr!.trim().split(/\s+/).slice(2).map((p) => p.toUpperCase());
      const nonDotCode = codeLines.join('\n');

      expect(nonDotCode, `${key} has PSpice VALUE=`).not.toMatch(/^[BEG]\S*\s+[^\n]*\bVALUE\s*=/im);
      expect(nonDotCode, `${key} has PSpice IF()`).not.toMatch(/\bIF\s*\(/i);
      expect(nonDotCode, `${key} has unsupported int()`).not.toMatch(/\bint\s*\(/i);
      expect(nonDotCode, `${key} has unsupported mod()`).not.toMatch(/\bmod\s*\(/i);
      expect(nonDotCode, `${key} has unsupported limit()`).not.toMatch(/\blimit\s*\(/i);
      expect(nonDotCode, `${key} has single & operator`).not.toMatch(/[^&]&[^&]/);
      expect(nonDotCode, `${key} has single | operator`).not.toMatch(/[^|]\|[^|]/);
      expect(nonDotCode, `${key} has broken 3-node B_be/B_eb`).not.toMatch(/^B(?:_be|_eb)\s+/im);
      if (!ports.includes('GND')) {
        expect(nonDotCode, `${key} references undeclared GND node`).not.toMatch(/\bGND\b/i);
      }
    }
  });

  it('compiles and converges all 253 non-quarantined SUBCKT_DEFINITIONS in real ngspice-wasm', { timeout: 60000 }, async () => {
    const quarantinedBaseNames = new Set(
      Object.keys(PINOUT_STUB_NOTES).map((id) => id.replace(/^(ic|display|sensor)_/, '').toUpperCase()),
    );
    const nonQuarantinedKeys = Object.keys(SUBCKT_DEFINITIONS).filter((name) => {
      const base = name.replace(/_SUB$/, '').replace(/^(MCU|DISPLAY|SENSOR)_/, '');
      return !quarantinedBaseNames.has(base) && !quarantinedBaseNames.has(name.toLowerCase());
    });
    expect(nonQuarantinedKeys.length).toBeGreaterThanOrEqual(250);

    const failures: string[] = [];
    for (const key of nonQuarantinedKeys) {
      const def = SUBCKT_DEFINITIONS[key];
      const hdr = def.split(/\r?\n/).find((l) => /^\s*\.subckt\s+/i.test(l))!;
      const tokens = hdr.trim().split(/\s+/);
      const subName = tokens[1];
      const ports = tokens.slice(2);

      const pinNodes: string[] = [];
      const stimLines: string[] = [];
      ports.forEach((p, idx) => {
        const up = p.toUpperCase();
        if (/^(GND|GND\d*|VSS|AGND|DGND)$/.test(up)) {
          pinNodes.push('0');
        } else if (/^(VCC|VDD|VSP|VPOS|VIN|VBUS|VSYS|AVDD|V33|V5)$/.test(up)) {
          const node = `p_${idx}`;
          pinNodes.push(node);
          stimLines.push(`V_rail_${idx} ${node} 0 DC 12`);
        } else if (/^(VEE|VSN|VNEG)$/.test(up)) {
          const node = `p_${idx}`;
          pinNodes.push(node);
          stimLines.push(`V_nrail_${idx} ${node} 0 DC -12`);
        } else {
          const node = `p_${idx}`;
          pinNodes.push(node);
          stimLines.push(`V_drv_${idx} drv_${idx} 0 DC ${idx % 2 === 0 ? 3.3 : 1.0}`);
          stimLines.push(`R_drv_${idx} drv_${idx} ${node} 1k`);
          stimLines.push(`R_pul_${idx} ${node} 0 100k`);
        }
      });

      const probe = pinNodes.find((n) => n !== '0') || '0';
      const netlist = [
        `* Audit ${key}`,
        ...stimLines,
        `X_test ${pinNodes.join(' ')} ${subName}`,
        resolveSubcktDeps([key]),
        '.tran 1u 10u',
        probe !== '0' ? `.print tran v(${probe})` : '.print tran all',
        '.end',
      ].join('\n');

      const rows = await runSpiceSimulationNode(netlist);
      if (!Array.isArray(rows) || rows.length === 0) {
        failures.push(key);
      }
    }
    expect(failures, `Failed subcircuits: ${failures.join(', ')}`).toEqual([]);
  });

  describe('74xx & CD40xx Digital Logic & Decoders/Muxes', () => {
    it.each([
      { name: 'NAND2', expected: [5, 5, 5, 0], hasVcc: false },
      { name: 'NOR2', expected: [5, 0, 0, 0], hasVcc: false },
      { name: 'AND2', expected: [0, 0, 0, 5], hasVcc: false },
      { name: 'OR2', expected: [0, 5, 5, 5], hasVcc: false },
      { name: 'XOR2', expected: [0, 5, 5, 0], hasVcc: false },
      { name: 'HC00', expected: [5, 5, 5, 0], hasVcc: false },
      { name: 'HC08', expected: [0, 0, 0, 5], hasVcc: false },
      { name: 'HC32', expected: [0, 5, 5, 5], hasVcc: false },
      { name: 'HC86', expected: [0, 5, 5, 0], hasVcc: false },
      { name: 'HC02_SUB', expected: [5, 0, 0, 0], hasVcc: true },
      { name: 'CD4001_SUB', expected: [5, 0, 0, 0], hasVcc: true },
      { name: 'CD4011_SUB', expected: [5, 5, 5, 0], hasVcc: true },
    ])('verifies 2-input truth table for $name', async ({ name, expected, hasVcc }) => {
      const def = SUBCKT_DEFINITIONS[name];
      const subName = def.match(/\.subckt\s+(\S+)/i)![1];
      const cases = [
        [0, 0],
        [0, 5],
        [5, 0],
        [5, 5],
      ];
      for (let i = 0; i < cases.length; i++) {
        const [a, b] = cases[i];
        const ports = hasVcc ? `a b y vcc 0` : `a b y 0`;
        const nl = `* ${name} case ${i}
Va a 0 DC ${a}
Vb b 0 DC ${b}
${hasVcc ? 'Vvcc vcc 0 DC 5' : ''}
R_load y 0 10k
X1 ${ports} ${subName}
${def}
.tran 1u 5u
.print tran v(y)
.end`;
        const res = await runAndSampleFinal(nl, ['v(y)']);
        expect(res['v(y)']).toBeCloseTo(expected[i], 1);
      }
    });

    it.each(['CD4070_SUB', 'CD4071_SUB', 'CD4081_SUB', 'CD4093_SUB', 'CD4077_SUB'])(
      'verifies quad CMOS gate truth table for %s',
      async (name) => {
        const table: Record<string, number[]> = {
          CD4070_SUB: [0, 5, 5, 0], // XOR
          CD4071_SUB: [0, 5, 5, 5], // OR
          CD4081_SUB: [0, 0, 0, 5], // AND
          CD4093_SUB: [5, 5, 5, 0], // NAND
          CD4077_SUB: [5, 0, 0, 5], // XNOR
        };
        const def = SUBCKT_DEFINITIONS[name];
        const inputs = [
          [0, 0],
          [0, 5],
          [5, 0],
          [5, 5],
        ];
        for (let i = 0; i < inputs.length; i++) {
          const [a, b] = inputs[i];
          const nl = `* ${name} case ${i}
Va a1 0 DC ${a}
Vb b1 0 DC ${b}
Vvdd vdd 0 DC 5
Rload y1 0 10k
X1 a1 b1 y1 0 0 y2 vdd 0 ${name}
${def}
.tran 1u 5u
.print tran v(y1)
.end`;
          const res = await runAndSampleFinal(nl, ['v(y1)']);
          expect(res['v(y1)']).toBeCloseTo(table[name][i], 1);
        }
      },
    );

    it('verifies inverters NOT1 and HC04', async () => {
      for (const name of ['NOT1', 'HC04']) {
        for (const [vin, vexp] of [
          [0, 5],
          [5, 0],
        ]) {
          const nl = `* ${name}
Va a 0 DC ${vin}
X1 a y 0 ${name}
${SUBCKT_DEFINITIONS[name]}
.tran 1u 5u
.print tran v(y)
.end`;
          const res = await runAndSampleFinal(nl, ['v(y)']);
          expect(res['v(y)']).toBeCloseTo(vexp, 1);
        }
      }
    });

    it('verifies HC283 4-bit binary adder arithmetic', async () => {
      // A=3 (A1=5,A2=5,A3=0,A4=0) + B=5 (B1=5,B2=0,B3=5,B4=0) + C0=1 -> Sum=9 (S1=5,S2=0,S3=0,S4=5,C4=0)
      const baseNl1 = `* HC283 3+5+1=9
Vvcc vcc 0 DC 5
Va1 a1 0 DC 5
Va2 a2 0 DC 5
Vb1 b1 0 DC 5
Vb3 b3 0 DC 5
Vc0 c0 0 DC 5
X1 a1 a2 0 0 b1 0 b3 0 c0 s1 s2 s3 s4 c4 vcc 0 HC283
${SUBCKT_DEFINITIONS.HC283}
.tran 1u 5u`;
      const r1a = await runAndSampleFinal(`${baseNl1}\n.print tran v(s1) v(s2) v(s3)\n.end`, ['v(s1)', 'v(s2)', 'v(s3)']);
      const r1b = await runAndSampleFinal(`${baseNl1}\n.print tran v(s4) v(c4)\n.end`, ['v(s4)', 'v(c4)']);
      expect(r1a['v(s1)']).toBeCloseTo(5, 1);
      expect(r1a['v(s2)']).toBeCloseTo(0, 1);
      expect(r1a['v(s3)']).toBeCloseTo(0, 1);
      expect(r1b['v(s4)']).toBeCloseTo(5, 1);
      expect(r1b['v(c4)']).toBeCloseTo(0, 1);

      // Carry overflow: A=15 + B=2 + C0=0 = 17 -> S1=5, S2..S4=0, C4=5
      const nl2 = `* HC283 15+2=17
Vvcc vcc 0 DC 5
Vhi hi 0 DC 5
X1 hi hi hi hi 0 hi 0 0 0 s1 s2 s3 s4 c4 vcc 0 HC283
${SUBCKT_DEFINITIONS.HC283}
.tran 1u 5u
.print tran v(s1) v(s2) v(c4)
.end`;
      const r2 = await runAndSampleFinal(nl2, ['v(s1)', 'v(s2)', 'v(c4)']);
      expect(r2['v(s1)']).toBeCloseTo(5, 1);
      expect(r2['v(s2)']).toBeCloseTo(0, 1);
      expect(r2['v(c4)']).toBeCloseTo(5, 1);
    });

    it('verifies DEC_7447 BCD-to-7-segment active-low decoding for digits 0 and 8', async () => {
      // Digit 0 -> oa..of LOW (0V), og HIGH (5V)
      const nl0 = `* DEC_7447 digit 0
Vvcc vcc 0 DC 5
X1 0 0 0 0 oa ob oc od oe of og vcc 0 DEC_7447
${SUBCKT_DEFINITIONS.DEC_7447}
.tran 1u 5u
.print tran v(oa) v(of) v(og)
.end`;
      const r0 = await runAndSampleFinal(nl0, ['v(oa)', 'v(of)', 'v(og)']);
      expect(r0['v(oa)']).toBeCloseTo(0, 1);
      expect(r0['v(of)']).toBeCloseTo(0, 1);
      expect(r0['v(og)']).toBeCloseTo(5, 1);

      // Digit 8 (D=5, C=0, B=0, A=0) -> oa..og all LOW (0V)
      const nl8 = `* DEC_7447 digit 8
Vvcc vcc 0 DC 5
Vd d 0 DC 5
X1 0 0 0 d oa ob oc od oe of og vcc 0 DEC_7447
${SUBCKT_DEFINITIONS.DEC_7447}
.tran 1u 5u
.print tran v(oa) v(oe) v(og)
.end`;
      const r8 = await runAndSampleFinal(nl8, ['v(oa)', 'v(oe)', 'v(og)']);
      expect(r8['v(oa)']).toBeCloseTo(0, 1);
      expect(r8['v(oe)']).toBeCloseTo(0, 1);
      expect(r8['v(og)']).toBeCloseTo(0, 1);
    });

    it('verifies CD4051 bilateral analog multiplexer channel selection', async () => {
      const expectedY = [1.2, 2.4, 3.6, 4.5];
      for (let ch = 0; ch < 4; ch++) {
        const a = ch & 1 ? 5 : 0;
        const b = ch & 2 ? 5 : 0;
        const nl = `* CD4051 ch=${ch}
Vvdd vdd 0 DC 5
Va a 0 DC ${a}
Vb b 0 DC ${b}
Vy0 y0 0 DC 1.2
Vy1 y1 0 DC 2.4
Vy2 y2 0 DC 3.6
Vy3 y3 0 DC 4.5
Rload z 0 100k
X1 a b 0 0 z y0 y1 y2 y3 vdd 0 CD4051
${SUBCKT_DEFINITIONS.CD4051}
.tran 1u 5u
.print tran v(z)
.end`;
        const r = await runAndSampleFinal(nl, ['v(z)']);
        expect(r['v(z)']).toBeCloseTo(expectedY[ch], 1);
      }
    });
  });

  describe('Op-Amps, Instrumentation Amps, Audio Amps & Comparators', () => {
    it.each([
      { key: 'UA741_SUB', hdr: 'INP INM VCC VEE OUT', vcc: 12, vee: -12, satClip: 10.6 },
      { key: 'LM741', hdr: 'INP INM VCC VEE OUT', vcc: 12, vee: -12, satClip: 10.6 },
      { key: 'OP07_SUB', hdr: 'INN INP OUT VCC VEE', vcc: 12, vee: -12, satClip: 11.1 },
      { key: 'OPAMP_NE5534A_SUB', hdr: 'bal1 inm inp vm bal2 out vp comp', vcc: 12, vee: -12, satClip: 10.9 },
      { key: 'OPAMP_AD823_SUB', hdr: 'dual_ch1_pins', vcc: 12, vee: -12, satClip: 12.0 },
    ])('verifies closed-loop non-inverting Gain=2.0 and rail clamping for $key', async ({ key, hdr, vcc, vee, satClip }) => {
      const wireInstance = (inP: string, inM: string, out: string) => {
        if (hdr === 'INP INM VCC VEE OUT') return `X1 ${inP} ${inM} vp vm ${out} ${key}`;
        if (hdr === 'INN INP OUT VCC VEE') return `X1 ${inM} ${inP} ${out} vp vm ${key}`;
        if (hdr === 'bal1 inm inp vm bal2 out vp comp') return `X1 0 ${inM} ${inP} vm 0 ${out} vp nc_c ${key}`;
        return `X1 ${out} ${inM} ${inP} vm 0 0 o2 nc_v ${key}`;
      };
      // Wait: AD823 last pin is vp, use vp cleanly:
      const instForKey = (inP: string, inM: string, out: string) =>
        key === 'OPAMP_AD823_SUB' ? `X1 ${out} ${inM} ${inP} vm 0 0 o2 vp ${key}` : wireInstance(inP, inM, out);

      const deps = resolveSubcktDeps([key]);
      const nlLinear = `* ${key} Gain=2
Vvp vp 0 DC ${vcc}
Vvm vm 0 DC ${vee}
Vin inp 0 DC 1.5
Rf out inm 10k
Rg inm 0 10k
Rl out 0 10k
${instForKey('inp', 'inm', 'out')}
${deps}
.tran 1u 5u
.print tran v(out)
.end`;
      const rLin = await runAndSampleFinal(nlLinear, ['v(out)']);
      expect(rLin['v(out)']).toBeGreaterThan(2.9);
      expect(rLin['v(out)']).toBeLessThan(3.1);

      // Rail clip verification (Vin=10V, Gain=2 requests 20V, must clamp <= vcc)
      const nlSat = nlLinear.replace('Vin inp 0 DC 1.5', 'Vin inp 0 DC 10');
      const rSat = await runAndSampleFinal(nlSat, ['v(out)']);
      expect(rSat['v(out)']).toBeLessThanOrEqual(satClip);
      expect(rSat['v(out)']).toBeGreaterThan(8.5);
    });

    it('verifies LM358, LM324 single-supply +5V swing down near 0V and TL074/TL082 split supply', async () => {
      for (const key of ['LM358', 'LM324']) {
        const nl = `* ${key} single-supply 5V G=2 + follower low
Vvp vp 0 DC 5
Vin1 inp1 0 DC 1.2
Rf out1 inm1 10k
Rg inm1 0 10k
Vin2 inp2 0 DC 0.2
X1 inp1 inm1 out1 inp2 out2 out2 vp 0 ${key}
${resolveSubcktDeps([key])}
.tran 1u 5u
.print tran v(out1) v(out2)
.end`;
        const r = await runAndSampleFinal(nl, ['v(out1)', 'v(out2)']);
        expect(r['v(out1)']).toBeCloseTo(2.4, 1);
        expect(r['v(out2)']).toBeCloseTo(0.2, 1);
      }

      // TL074 and TL082_SUB Gain=2 check
      const nlTl074 = `* TL074
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp1 0 DC 2.0
Rf out1 inm1 10k
Rg inm1 0 10k
X1 inp1 inm1 out1 0 0 o2 vp vm TL074
${resolveSubcktDeps(['TL074'])}
.tran 1u 5u
.print tran v(out1)
.end`;
      expect((await runAndSampleFinal(nlTl074, ['v(out1)']))['v(out1)']).toBeCloseTo(4.0, 1);

      const nlTl082 = `* TL082_SUB
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp1 0 DC 2.0
Rf out1 inm1 10k
Rg inm1 0 10k
X1 inm1 inp1 out1 0 0 o2 vp vm TL082_SUB
${SUBCKT_DEFINITIONS.TL082_SUB}
.tran 1u 5u
.print tran v(out1)
.end`;
      expect((await runAndSampleFinal(nlTl082, ['v(out1)']))['v(out1)']).toBeCloseTo(4.0, 1);
    });

    it('verifies LM386 Gain=20 audio amplifier and LM393 / LM311 open-collector comparators', async () => {
      const nl386 = `* LM386 Gain=20
Vvs vs 0 DC 9
Vin inp 0 DC 0.05
X1 inp 0 vs 0 out nc_g LM386
${SUBCKT_DEFINITIONS.LM386}
.tran 1u 5u
.print tran v(out)
.end`;
      const r386 = await runAndSampleFinal(nl386, ['v(out)']);
      expect(r386['v(out)']).toBeCloseTo(5.5, 1); // 9/2 + 20*0.05 = 5.5V

      // LM393 open-collector: IN+>IN- -> HIGH (~5V); IN+<IN- -> LOW (<0.2V)
      for (const [inp, inm, hi] of [
        [3.0, 2.0, true],
        [1.0, 2.0, false],
      ] as Array<[number, number, boolean]>) {
        const nl393 = `* LM393
Vvcc vcc 0 DC 5
V1 p1 0 DC ${inp}
V2 m1 0 DC ${inm}
Rpu vcc out1 10k
X1 p1 m1 out1 0 0 o2 vcc 0 LM393
${SUBCKT_DEFINITIONS.LM393}
.tran 1u 5u
.print tran v(out1)
.end`;
        const r = await runAndSampleFinal(nl393, ['v(out1)']);
        if (hi) expect(r['v(out1)']).toBeGreaterThan(4.8);
        else expect(r['v(out1)']).toBeLessThan(0.2);

        const nl311 = `* LM311
Vvcc vcc 0 DC 5
V1 p1 0 DC ${inp}
V2 m1 0 DC ${inm}
Rpu vcc out1 2.2k
X1 p1 m1 out1 vcc 0 0 LM311
${SUBCKT_DEFINITIONS.LM311}
.tran 1u 5u
.print tran v(out1)
.end`;
        const r311 = await runAndSampleFinal(nl311, ['v(out1)']);
        if (hi) expect(r311['v(out1)']).toBeGreaterThan(4.8);
        else expect(r311['v(out1)']).toBeLessThan(0.25);
      }
    });
  });

  describe('555 & 556 Timer Astable Oscillators (<10% Frequency Error)', () => {
    it('verifies LM555_BEHAVIORAL 4.8kHz and 0.686Hz astable accuracy', async () => {
      // Fast 4.8kHz: Ra=10k, Rb=10k, C=10nF
      const nlFast = `* LM555 Fast 4.8kHz
Vcc vcc 0 DC 5
Ra vcc dis 10k
Rb dis thr 10k
C1 thr 0 10n IC=0
Rl out 0 10k
X1 0 thr out vcc vcc dis thr ctrl LM555_BEHAVIORAL
Cctrl ctrl 0 10n
${SUBCKT_DEFINITIONS.LM555_BEHAVIORAL}
.tran 2u 1.5m UIC
.print tran v(out)
.end`;
      const rowsFast = await runSpiceSimulationNode(nlFast);
      const fFast = measureFrequencyHz(firstBlockSeries(rowsFast, 'v(out)'), 0.0003, 2.0);
      expect(fFast).toBeGreaterThan(4800 * 0.9);
      expect(fFast).toBeLessThan(4800 * 1.1);

      // Slow 0.686Hz: Ra=10k, Rb=100k, C=10uF
      const nlSlow = nlFast
        .replace('Rb dis thr 10k', 'Rb dis thr 100k')
        .replace('C1 thr 0 10n IC=0', 'C1 thr 0 10u IC=0')
        .replace('.tran 2u 1.5m UIC', '.tran 5m 5 UIC');
      const rowsSlow = await runSpiceSimulationNode(nlSlow);
      const fSlow = measureFrequencyHz(firstBlockSeries(rowsSlow, 'v(out)'), 0.5, 2.0);
      expect(fSlow).toBeGreaterThan(0.686 * 0.9);
      expect(fSlow).toBeLessThan(0.686 * 1.1);
    });

    it('verifies TLC555_SUB CMOS and NE556_SUB dual astable accuracy', async () => {
      // TLC555 uses a 100k internal divider; bypass CTRL cleanly via DC operating point (or leave CTRL unbypassed on fast UIC startup)
      const nlTlc = `* TLC555 CMOS 4.8kHz
Vcc vcc 0 DC 5
Ra vcc dis 10k
Rb dis thr 10k
C1 thr 0 10n IC=0
Rl out 0 10k
X1 0 thr out vcc vcc dis thr ctrl TLC555_SUB
${SUBCKT_DEFINITIONS.TLC555_SUB}
.tran 2u 1.5m UIC
.print tran v(out)
.end`;
      const ptsTlc = firstBlockSeries(await runSpiceSimulationNode(nlTlc), 'v(out)');
      const fTlc = measureFrequencyHz(ptsTlc, 0.0003, 2.5);
      expect(fTlc).toBeGreaterThan(4800 * 0.9);
      expect(fTlc).toBeLessThan(4800 * 1.1);
      expect(Math.max(...ptsTlc.map((p) => p.v))).toBeGreaterThan(4.7);

      const nl556 = `* NE556 Timer 1 4.8kHz
Vcc vcc 0 DC 5
Ra vcc dis 10k
Rb dis thr 10k
C1 thr 0 10n IC=0
Rl out1 0 10k
X1 dis thr cv1 vcc thr out1 out2 0 0 cv2 0 dis2 vcc 0 NE556_SUB
Cctrl cv1 0 10n
${SUBCKT_DEFINITIONS.NE556_SUB}
.tran 2u 1.5m UIC
.print tran v(out1)
.end`;
      const pts556 = firstBlockSeries(await runSpiceSimulationNode(nl556), 'v(out1)');
      const f556 = measureFrequencyHz(pts556, 0.0003, 2.0);
      expect(f556).toBeGreaterThan(4800 * 0.9);
      expect(f556).toBeLessThan(4800 * 1.1);
    });
  });

  describe('Linear/Switching Voltage Regulators & Shunt References', () => {
    it.each([
      { key: 'REG_7805', pinOrder: 'in 0 out', vin: 12, vexp: 5.0 },
      { key: 'REG_7812', pinOrder: 'in 0 out', vin: 18, vexp: 12.0 },
      { key: 'REG78L05_SUB', pinOrder: 'in out 0', vin: 12, vexp: 5.0 },
      { key: 'REG7815_SUB', pinOrder: 'in out 0', vin: 20, vexp: 15.0 },
      { key: 'REG7905_SUB', pinOrder: '0 in out', vin: -12, vexp: -5.0 },
    ])('verifies fixed regulator $key normal regulation and 0V unpowered clamp', async ({ key, pinOrder, vin, vexp }) => {
      const def = SUBCKT_DEFINITIONS[key];
      const nlOn = `* ${key} powered
Vin in 0 DC ${vin}
Rl out 0 1k
X1 ${pinOrder} ${key}
${def}
.tran 1u 10u
.print tran v(out)
.end`;
      const rOn = await runAndSampleFinal(nlOn, ['v(out)']);
      expect(rOn['v(out)']).toBeCloseTo(vexp, 1);

      const nlZero = nlOn.replace(`DC ${vin}`, 'DC 0');
      const rZero = await runAndSampleFinal(nlZero, ['v(out)']);
      expect(rZero['v(out)']).toBeCloseTo(0.0, 2);
    });

    it('verifies adjustable regulators LM317_REG, LM337, AMS1117_ADJ_SUB and buck LM2596', async () => {
      // LM317: Vout = 1.25*(1 + 1200/240) + 50u*1200 = 7.56V
      const nl317 = `* LM317
Vin in 0 DC 12
R1 out adj 240
R2 adj 0 1200
Rl out 0 1k
X1 adj out in LM317_REG
${SUBCKT_DEFINITIONS.LM317_REG}
.tran 10u 50u
.print tran v(out)
.end`;
      const r317 = await runAndSampleFinal(nl317, ['v(out)']);
      expect(r317['v(out)']).toBeCloseTo(7.56, 1);

      // LM337: Vout = -1.25*(1 + 1200/240) - 50u*1200 = -7.56V
      const nl337 = `* LM337
Vin in 0 DC -15
R1 out adj 240
R2 adj 0 1200
Rl out 0 1k
X1 in out adj LM337
${SUBCKT_DEFINITIONS.LM337}
.tran 10u 50u
.print tran v(out)
.end`;
      const r337 = await runAndSampleFinal(nl337, ['v(out)']);
      expect(r337['v(out)']).toBeCloseTo(-7.56, 1);

      // AMS1117_ADJ: Vout = 1.25*(1 + 396/240) + 50u*396 = 3.33V
      const nl1117 = `* AMS1117_ADJ
Vin in 0 DC 5
R1 out adj 240
R2 adj 0 396
Rl out 0 500
X1 adj in out AMS1117_ADJ_SUB
${SUBCKT_DEFINITIONS.AMS1117_ADJ_SUB}
.tran 10u 50u
.print tran v(out)
.end`;
      const r1117 = await runAndSampleFinal(nl1117, ['v(out)']);
      expect(r1117['v(out)']).toBeCloseTo(3.33, 1);

      // LM2596 ON -> 5V, shutdown -> 0V
      const nl2596On = `* LM2596
Vin in 0 DC 12
X1 in out out 0 0 LM2596
${SUBCKT_DEFINITIONS.LM2596}
.tran 1u 10u
.print tran v(out)
.end`;
      expect((await runAndSampleFinal(nl2596On, ['v(out)']))['v(out)']).toBeCloseTo(5.0, 1);
      const nl2596Off = nl2596On.replace('X1 in out out 0 0 LM2596', 'Von onp 0 DC 5\nX1 in out out onp 0 LM2596');
      expect((await runAndSampleFinal(nl2596Off, ['v(out)']))['v(out)']).toBeCloseTo(0.0, 1);
    });

    it('verifies TL431_REF and TL431_SUB programmable shunt regulation at 5.0V', async () => {
      for (const [key, pins] of [
        ['TL431_REF', 'ref k 0'],
        ['TL431_SUB', '0 k ref'],
      ] as Array<[string, string]>) {
        const nl = `* ${key}
Vsup sup 0 DC 10
Rsup sup k 470
R1 k ref 10k
R2 ref 0 10k
X1 ${pins} ${key}
${SUBCKT_DEFINITIONS[key]}
.tran 10u 50u
.print tran v(k)
.end`;
        const r = await runAndSampleFinal(nl, ['v(k)']);
        expect(r['v(k)']).toBeCloseTo(5.0, 1);

        // Guard against negative cathode current when REF grounded
        const nlOff = nl.replace('R1 k ref 10k', 'R1 k ref 10Meg');
        const rOff = await runAndSampleFinal(nlOff, ['v(k)']);
        expect(rOff['v(k)']).toBeLessThanOrEqual(10.05);
        expect(rOff['v(k)']).toBeGreaterThan(9.5);
      }
    });
  });

  describe('Discrete Semiconductors, Optocoupler & ADC', () => {
    it.each(['BJT_NPN', 'BJT_2N2222A_SUB', 'BJT_2N3904_SUB', 'BJT_TIP122_SUB'])(
      'verifies NPN transistor %s cutoff, active/saturation switching',
      async (key) => {
        const subName = SUBCKT_DEFINITIONS[key].match(/\.subckt\s+(\S+)/i)![1];
        const nlOn = `* ${key} ON
Vcc vcc 0 DC 10
Vbb bb 0 DC 5
Rb bb b 10k
Rc vcc c 1k
X1 b c 0 ${subName}
${SUBCKT_DEFINITIONS[key]}
.tran 1u 10u
.print tran v(c)
.end`;
        const rOn = await runAndSampleFinal(nlOn, ['v(c)']);
        expect(rOn['v(c)']).toBeLessThan(1.2); // Driven into saturation (<0.3V BJT, ~0.8V Darlington)

        const nlOff = nlOn.replace('Vbb bb 0 DC 5', 'Vbb bb 0 DC 0');
        const rOff = await runAndSampleFinal(nlOff, ['v(c)']);
        expect(rOff['v(c)']).toBeCloseTo(10.0, 1);
      },
    );

    it.each(['BJT_PNP', 'BJT_2N2907A_SUB'])('verifies PNP transistor %s saturation and cutoff', async (key) => {
      const subName = SUBCKT_DEFINITIONS[key].match(/\.subckt\s+(\S+)/i)![1];
      const nlOn = `* ${key} ON (emitter=+10V, base pulled low)
Ve e 0 DC 10
Rb b 0 10k
Rc c 0 1k
X1 b c e ${subName}
${SUBCKT_DEFINITIONS[key]}
.tran 1u 10u
.print tran v(c)
.end`;
      const rOn = await runAndSampleFinal(nlOn, ['v(c)']);
      expect(rOn['v(c)']).toBeGreaterThan(9.5);

      const nlOff = nlOn.replace('Rb b 0 10k', 'Rb b e 10k');
      const rOff = await runAndSampleFinal(nlOff, ['v(c)']);
      expect(rOff['v(c)']).toBeLessThan(0.1);
    });

    it('verifies MOSFET_N, JFET_N, JFET_P, OC_4N35 and ADC0804_SUB', async () => {
      // MOSFET_N: Vgs=5V turns ON cleanly, Vgs=0V turns OFF
      const nlMosOn = `* MOSFET_N
Vdd d_sup 0 DC 10
Rd d_sup d 100
Vg g 0 DC 5
X1 g d 0 MOSFET_N
${SUBCKT_DEFINITIONS.MOSFET_N}
.tran 1u 10u
.print tran v(d)
.end`;
      expect((await runAndSampleFinal(nlMosOn, ['v(d)']))['v(d)']).toBeLessThan(0.5);
      expect((await runAndSampleFinal(nlMosOn.replace('Vg g 0 DC 5', 'Vg g 0 DC 0'), ['v(d)']))['v(d)']).toBeCloseTo(
        10.0,
        1,
      );

      // JFET_N: Vgs=0 -> Idss = 5mA -> 10V - 5mA*1k = ~5.0V
      const nlJfetN = `* JFET_N Idss check
Vdd vdd 0 DC 10
Rd vdd d 1k
X1 0 d 0 JFET_N
${SUBCKT_DEFINITIONS.JFET_N}
.tran 1u 10u
.print tran v(d)
.end`;
      const vdJn = (await runAndSampleFinal(nlJfetN, ['v(d)']))['v(d)'];
      expect(vdJn).toBeGreaterThan(4.3);
      expect(vdJn).toBeLessThan(5.4);

      // JFET_P: Vgs=0 -> Idss = 5mA -> 5mA*1k = ~5.0V across drain resistor to 0
      const nlJfetP = `* JFET_P Idss check
Vss s_node 0 DC 10
Rd d 0 1k
X1 s_node d s_node JFET_P
${SUBCKT_DEFINITIONS.JFET_P}
.tran 1u 10u
.print tran v(d)
.end`;
      const vdJp = (await runAndSampleFinal(nlJfetP, ['v(d)']))['v(d)'];
      expect(vdJp).toBeGreaterThan(4.5);
      expect(vdJp).toBeLessThan(5.6);

      // OC_4N35 optocoupler: LED on -> collector saturates cleanly in [0, 0.4V]
      const nlOptoOn = `* OC_4N35 ON
Vled led_in 0 DC 5
Rled led_in a 330
Vvcc vcc 0 DC 5
Rc vcc c 1k
X1 a 0 c 0 OC_4N35
${SUBCKT_DEFINITIONS.OC_4N35}
.tran 1u 10u
.print tran v(c)
.end`;
      const rOptoOn = await runAndSampleFinal(nlOptoOn, ['v(c)']);
      expect(rOptoOn['v(c)']).toBeGreaterThan(0);
      expect(rOptoOn['v(c)']).toBeLessThan(0.4);
      const rOptoOff = await runAndSampleFinal(nlOptoOn.replace('Vled led_in 0 DC 5', 'Vled led_in 0 DC 0'), ['v(c)']);
      expect(rOptoOff['v(c)']).toBeCloseTo(5.0, 1);

      // ADC0804_SUB: 3.75V = 2.5 + 1.25 -> db7=5, db6=5, db5=0
      const nlAdc = `* ADC0804 3.75V
Vin inp 0 DC 3.75
Vvcc vcc 0 DC 5
X1 0 0 0 0 inp 0 vcc db7 db6 db5 db4 db3 db2 db1 db0 vcc 0 ADC0804_SUB
${SUBCKT_DEFINITIONS.ADC0804_SUB}
.tran 1u 5u
.print tran v(db7) v(db6) v(db5)
.end`;
      const rAdc = await runAndSampleFinal(nlAdc, ['v(db7)', 'v(db6)', 'v(db5)']);
      expect(rAdc['v(db7)']).toBeCloseTo(5, 1);
      expect(rAdc['v(db6)']).toBeCloseTo(5, 1);
      expect(rAdc['v(db5)']).toBeCloseTo(0, 1);
    });
  });
});
