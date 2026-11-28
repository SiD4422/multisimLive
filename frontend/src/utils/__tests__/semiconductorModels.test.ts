import { describe, it, expect } from 'vitest';
import { SUBCKT_DEFINITIONS, getComponentNetlist } from '../netlister/getComponentNetlist';
import { generateNetlist, getComponentPins } from '../netlister';
import { standardICLibrary, isPinoutStubComponent } from '../../data/components';
import { runSpiceSimulationNode } from '../../../scripts/nodeSpiceRunner.mjs';
import type { SchematicComponent } from '../../store/useSchematicStore';

function firstBlock(rows: Array<Record<string, number>>, sig: string, xKey: 'time' | 'frequency' = 'time') {
  const pts: Array<{ x: number; v: number }> = [];
  let prevX = -1;
  for (const r of rows) {
    const val = r[sig];
    const x = r[xKey];
    if (val !== undefined && x !== undefined) {
      if (x < prevX) break;
      prevX = x;
      pts.push({ x, v: val });
    }
  }
  return pts;
}

async function runFinal(netlist: string, sig: string): Promise<number> {
  const rows = await runSpiceSimulationNode(netlist);
  expect(Array.isArray(rows)).toBe(true);
  const pts = firstBlock(rows, sig, 'time');
  expect(pts.length, `Missing signal ${sig}`).toBeGreaterThan(0);
  return pts[pts.length - 1].v;
}

function measureSlewRateVus(pts: Array<{ x: number; v: number }>, vLo: number, vHi: number): number {
  const pLo = pts.find((p) => p.v >= vLo);
  const pHi = pts.find((p) => p.v >= vHi);
  expect(pLo && pHi && pHi.x > pLo.x, 'Expected clean rising transition between vLo and vHi').toBe(true);
  return (pHi!.v - pLo!.v) / (pHi!.x - pLo!.x) / 1e6;
}

describe('Phase 2.3: Real Manufacturer Semiconductor & Dynamic Op-Amp Models', () => {
  describe('Catalog, Pinout & Netlister Integration', () => {
    const newIds = [
      'diode_1n4007',
      'diode_1n5819',
      'diode_bzx55c3v3',
      'diode_bzx55c4v7',
      'diode_bzx55c5v1',
      'diode_bzx55c6v8',
      'diode_bzx55c9v1',
      'diode_bzx55c12',
      'transistor_2n2222a',
      'transistor_2n3904',
      'transistor_2n3906',
      'transistor_bc547',
      'mosfet_2n7000',
      'mosfet_irf540',
      'mosfet_irf9540',
      'ic_lm741',
      'ic_lm358',
      'ic_tl072',
    ];

    it.each(newIds)('registers %s as non-quarantined verified SPICE model with valid pins and netlist', (id) => {
      const def = standardICLibrary.find((c) => c.id === id);
      expect(def).toBeDefined();
      expect(def?.simulationModel).toBe('spice');
      expect(isPinoutStubComponent(id)).toBe(false);

      const comp: SchematicComponent = { id: 'U1', type: id, position: { x: 100, y: 100 } };
      const pins = getComponentPins(comp);
      expect(pins.length).toBe(def!.pins.length);
      const res = getComponentNetlist(comp, pins.map((_, i) => `n${i + 1}`));
      expect(res).not.toBeNull();
      expect(res!.subckts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Real Diode & Zener BZX Series SPICE Curves', () => {
    it('distinguishes 1N4007 silicon Vf vs 1N5819 Schottky low Vf and 40V/1000V blocking', async () => {
      const nl4007 = `* 1N4007 10mA forward
Vs s 0 DC 5
Rs s a 430
X1 a 0 D1N4007_SUB
${SUBCKT_DEFINITIONS.D1N4007_SUB}
.tran 1u 5u
.print tran v(a)
.end`;
      const vf4007 = await runFinal(nl4007, 'v(a)');
      expect(vf4007).toBeGreaterThan(0.62);
      expect(vf4007).toBeLessThan(0.85);

      const nl5819 = `* 1N5819 10mA forward
Vs s 0 DC 5
Rs s a 470
X1 a 0 D1N5819_SUB
${SUBCKT_DEFINITIONS.D1N5819_SUB}
.tran 1u 5u
.print tran v(a)
.end`;
      const vf5819 = await runFinal(nl5819, 'v(a)');
      expect(vf5819).toBeGreaterThan(0.18);
      expect(vf5819).toBeLessThan(0.45);
      expect(vf5819).toBeLessThan(vf4007 - 0.25);

      // Reverse blocking 1N4007 at -100V (zero breakdown leakage)
      const rev4007 = await runFinal(
        `* 1N4007 -100V rev\nVs s 0 DC -100\nRs s a 10k\nX1 a 0 D1N4007_SUB\n${SUBCKT_DEFINITIONS.D1N4007_SUB}\n.tran 1u 5u\n.print tran v(a)\n.end`,
        'v(a)',
      );
      expect(rev4007).toBeLessThan(-99.5);
    });

    it.each([
      { sub: 'DBZX55C3V3_SUB', vSup: 12, expectedVz: 3.3, tol: 0.25 },
      { sub: 'DBZX55C4V7_SUB', vSup: 12, expectedVz: 4.7, tol: 0.25 },
      { sub: 'DBZX55C5V1_SUB', vSup: 12, expectedVz: 5.1, tol: 0.25 },
      { sub: 'DBZX55C6V8_SUB', vSup: 15, expectedVz: 6.8, tol: 0.25 },
      { sub: 'DBZX55C9V1_SUB', vSup: 18, expectedVz: 9.1, tol: 0.3 },
      { sub: 'DBZX55C12_SUB', vSup: 20, expectedVz: 12.0, tol: 0.3 },
    ])('verifies Philips BZX Zener breakdown regulation for $sub ($expectedVz V)', async ({ sub, vSup, expectedVz, tol }) => {
      // Cathode k pulled via Rs to Vsup, Anode a at 0V
      const nl = `* ${sub}
Vsup s 0 DC ${vSup}
Rs s k 1k
X1 0 k ${sub}
${SUBCKT_DEFINITIONS[sub]}
.tran 1u 5u
.print tran v(k)
.end`;
      const vz = await runFinal(nl, 'v(k)');
      expect(Math.abs(vz - expectedVz)).toBeLessThan(tol);
    });

    it('routes DiodeSchottky and DiodeZener part values through generateNetlist into ngspice', async () => {
      const comps: SchematicComponent[] = [
        { id: 'V1', type: 'DCSource', value: '10', position: { x: 0, y: 0 } },
        { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
        { id: 'Z1', type: 'DiodeZener', value: 'BZX55C4V7', position: { x: 200, y: 0 } },
        { id: 'G1', type: 'Ground', position: { x: 300, y: 0 } },
      ];
      const nl = generateNetlist(comps, [], []);
      expect(nl).toContain('BV=4.7');
      expect(nl).toContain('CJO=');

      const schComps: SchematicComponent[] = [
        { id: 'D1', type: 'DiodeSchottky', value: '1N5819', position: { x: 0, y: 0 } },
      ];
      const nlSch = generateNetlist(schComps, [], []);
      expect(nlSch).toContain('D1N5819');
      expect(nlSch).toContain('IS=11.5u');
    });
  });

  describe('Full Gummel-Poon BJTs (2N2222A, 2N3904, 2N3906, BC547)', () => {
    it.each(['BJT_2N2222A_SUB', 'BJT_2N3904_SUB', 'BJT_BC547_SUB'])(
      'verifies DC active bias and AC high-frequency capacitance roll-off for %s',
      async (key) => {
        const nlAc = `* ${key} CE small-signal bandwidth test
Vcc vcc 0 DC 12
Vb vb 0 DC 1.8 AC 10m
Rb vb b 10k
Rc vcc c 1k
Re e 0 100
X1 b c e ${key}
${SUBCKT_DEFINITIONS[key]}
.ac dec 10 1k 500Meg
.print ac vm(c)
.end`;
        const rows = await runSpiceSimulationNode(nlAc);
        const pts = firstBlock(rows, 'vm(c)', 'frequency');
        expect(pts.length).toBeGreaterThan(20);
        const gainLow = pts.find((p) => p.x <= 2000)!.v;
        const gain500M = pts[pts.length - 1].v;
        // Midband inverting gain exists (> 0.05V out for 10mV in = G>5) AND rolls off at 500MHz due to Cjc/Cje/Tf
        expect(gainLow).toBeGreaterThan(0.05);
        expect(gain500M).toBeLessThan(gainLow * 0.5);
      },
    );

    it('verifies DC active bias and AC high-frequency capacitance roll-off for BJT_2N3906_SUB (PNP)', async () => {
      const nlAc = `* BJT_2N3906_SUB PNP CE small-signal bandwidth test
Vcc vcc 0 DC 12
Vb vb 0 DC 10.8 AC 10m
Rb vb b 10k
Rc c 0 1k
Re vcc e 100
X1 b c e BJT_2N3906_SUB
${SUBCKT_DEFINITIONS.BJT_2N3906_SUB}
.ac dec 10 1k 500Meg
.print ac vm(c)
.end`;
      const rows = await runSpiceSimulationNode(nlAc);
      const pts = firstBlock(rows, 'vm(c)', 'frequency');
      expect(pts.length).toBeGreaterThan(20);
      const gainLow = pts.find((p) => p.x <= 2000)!.v;
      const gain500M = pts[pts.length - 1].v;
      expect(gainLow).toBeGreaterThan(0.05);
      expect(gain500M).toBeLessThan(gainLow * 0.5);
    });
  });

  describe('Real MOSFET Subcircuits (2N7000, IRF540, IRF9540)', () => {
    it('verifies 2N7000 threshold, Rds(on), cutoff, and body diode conduction', async () => {
      // ON state: Vgs=10V, Vdd=10V, Rd=100 -> Vd low -> Ids ≈ 0.1A -> Rds(on) ~ 1.5..4 ohm
      const vdOn = await runFinal(
        `* 2N7000 ON\nVdd vdd 0 DC 10\nRd vdd d 100\nVg g 0 DC 10\nX1 g d 0 NMOS_2N7000_SUB\n${SUBCKT_DEFINITIONS.NMOS_2N7000_SUB}\n.tran 1u 5u\n.print tran v(d)\n.end`,
        'v(d)',
      );
      const rds2n7000 = vdOn / ((10 - vdOn) / 100);
      expect(rds2n7000).toBeGreaterThan(1.0);
      expect(rds2n7000).toBeLessThan(5.0);

      // Cutoff Vgs=1.0V (< Vth=2.1V) -> Vd ≈ 10V
      const vdOff = await runFinal(
        `* 2N7000 OFF\nVdd vdd 0 DC 10\nRd vdd d 100\nVg g 0 DC 1.0\nX1 g d 0 NMOS_2N7000_SUB\n${SUBCKT_DEFINITIONS.NMOS_2N7000_SUB}\n.tran 1u 5u\n.print tran v(d)\n.end`,
        'v(d)',
      );
      expect(vdOff).toBeCloseTo(10.0, 1);

      // Body diode: Vgs=0V, drain pulled to -5V via 1k from 0 -> body diode clamps d around -0.7V
      const vdBody = await runFinal(
        `* 2N7000 body diode\nVneg vn 0 DC -5\nRd d vn 100\nX1 0 d 0 NMOS_2N7000_SUB\n${SUBCKT_DEFINITIONS.NMOS_2N7000_SUB}\n.tran 1u 5u\n.print tran v(d)\n.end`,
        'v(d)',
      );
      expect(vdBody).toBeGreaterThan(-1.2);
      expect(vdBody).toBeLessThan(-0.4);
    });

    it('verifies IRF540N low Rds(on) (<80mΩ) + body diode and IRF9540N P-Ch Rds(on) (<200mΩ)', async () => {
      const vd540 = await runFinal(
        `* IRF540N\nVdd vdd 0 DC 10\nRd vdd d 1\nVg g 0 DC 10\nX1 g d 0 NMOS_IRF540_SUB\n${SUBCKT_DEFINITIONS.NMOS_IRF540_SUB}\n.tran 1u 5u\n.print tran v(d)\n.end`,
        'v(d)',
      );
      const rds540 = vd540 / ((10 - vd540) / 1);
      expect(rds540).toBeGreaterThan(0.02);
      expect(rds540).toBeLessThan(0.08);

      const vd9540 = await runFinal(
        `* IRF9540N\nVs s 0 DC 10\nRd d 0 2\nX1 0 d s PMOS_IRF9540_SUB\n${SUBCKT_DEFINITIONS.PMOS_IRF9540_SUB}\n.tran 1u 5u\n.print tran v(d)\n.end`,
        'v(d)',
      );
      const rds9540 = (10 - vd9540) / (vd9540 / 2);
      expect(rds9540).toBeGreaterThan(0.05);
      expect(rds9540).toBeLessThan(0.2);

      // generateNetlist MOSFET contracts still emit M_ + D_body_
      const nlM = generateNetlist(
        [
          { id: 'M1', type: 'MosfetN', value: 'IRF540', position: { x: 0, y: 0 } },
          { id: 'M2', type: 'MosfetP', value: 'IRF9540', position: { x: 100, y: 0 } },
        ],
        [],
        [],
      );
      expect(nlM).toMatch(/^M_M1 /m);
      expect(nlM).toMatch(/^D_body_M1 /m);
      expect(nlM).toContain('IRF540');
      expect(nlM).toContain('IRF9540');
    });
  });

  describe('Dynamic Frequency & Slew-Limited Op-Amp Macromodels (LM741, LM358, TL072)', () => {
    it('verifies .ac Gain-Bandwidth roll-off for LM741 (1MHz), LM358 (1MHz), and TL072 (3MHz)', async () => {
      // LM741 / UA741_SUB at Gain = 10 -> -3dB cutoff at 100 kHz
      const rows741 = await runSpiceSimulationNode(`* LM741 AC G=10
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp 0 AC 1
Rf out inm 9k
Rg inm 0 1k
X1 inp inm vp vm out UA741_SUB
Rl out 0 10k
${SUBCKT_DEFINITIONS.UA741_SUB}
.ac dec 20 1k 10Meg
.print ac vm(out)
.end`);
      const pts741 = firstBlock(rows741, 'vm(out)', 'frequency');
      const v1k741 = pts741.find((p) => p.x <= 1200)!.v;
      const v100k741 = pts741.find((p) => p.x >= 99000 && p.x <= 105000)!.v;
      expect(v1k741).toBeCloseTo(10.0, 1);
      expect(v100k741).toBeGreaterThan(6.5);
      expect(v100k741).toBeLessThan(7.6);

      // TL072 at Gain = 10 -> 3 MHz GBW -> -3dB at 300 kHz, still ~9.5V at 100kHz
      const rows072 = await runSpiceSimulationNode(`* TL072 AC G=10
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp 0 AC 1
Rf out inm 9k
Rg inm 0 1k
X1 inm inp out 0 0 o2 vp vm OPAMP_TL072_SUB
Rl out 0 10k
${SUBCKT_DEFINITIONS.OPAMP_TL072_SUB}
.ac dec 20 1k 10Meg
.print ac vm(out)
.end`);
      const pts072 = firstBlock(rows072, 'vm(out)', 'frequency');
      const v100k072 = pts072.find((p) => p.x >= 99000 && p.x <= 105000)!.v;
      const v300k072 = pts072.find((p) => p.x >= 280000 && p.x <= 320000)!.v;
      expect(v100k072).toBeGreaterThan(9.0);
      expect(v300k072).toBeGreaterThan(6.3);
      expect(v300k072).toBeLessThan(7.7);

      // LM358 single-supply +5V AC G=10 (DC bias 0.2V -> Vout_dc = 2.0V) -> -3dB around 100kHz
      const rows358 = await runSpiceSimulationNode(`* LM358 single-supply AC G=10
Vvp vp 0 DC 5
Vin inp 0 DC 0.2 AC 0.05
Rf out1 inm1 9k
Rg inm1 0 1k
X1 inp inm1 out1 0 0 o2 vp 0 LM358
Rl out1 0 10k
${SUBCKT_DEFINITIONS.LM358}
.ac dec 20 1k 10Meg
.print ac vm(out1)
.end`);
      const pts358 = firstBlock(rows358, 'vm(out1)', 'frequency');
      const v1k358 = pts358.find((p) => p.x <= 1200)!.v;
      const v100k358 = pts358.find((p) => p.x >= 99000 && p.x <= 105000)!.v;
      expect(v1k358).toBeCloseTo(0.5, 1); // 0.05 * 10 = 0.5V
      expect(v100k358).toBeGreaterThan(0.32);
      expect(v100k358).toBeLessThan(0.39);
    });

    it('verifies transient large-signal Slew Rate limits for LM741 (0.5V/us), LM358 (0.4V/us), and TL072 (13V/us)', async () => {
      // LM741 SR ≈ 0.5 V/us
      const r741 = await runSpiceSimulationNode(`* LM741 SR
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp 0 PULSE(-4 4 1u 10n 10n 50u 100u)
X1 inp out vp vm out UA741_SUB
Rl out 0 10k
${SUBCKT_DEFINITIONS.UA741_SUB}
.tran 0.2u 30u
.print tran v(out)
.end`);
      const sr741 = measureSlewRateVus(firstBlock(r741, 'v(out)', 'time'), -2, 2);
      expect(sr741).toBeGreaterThan(0.4);
      expect(sr741).toBeLessThan(0.6);

      // LM358 SR ≈ 0.4 V/us on single +12V supply (step 0.5V -> 6.5V)
      const r358 = await runSpiceSimulationNode(`* LM358 SR
Vvp vp 0 DC 12
Vin inp 0 PULSE(0.5 6.5 1u 10n 10n 50u 100u)
X1 inp out1 out1 0 0 o2 vp 0 LM358
Rl out1 0 10k
${SUBCKT_DEFINITIONS.LM358}
.tran 0.2u 30u
.print tran v(out1)
.end`);
      const sr358 = measureSlewRateVus(firstBlock(r358, 'v(out1)', 'time'), 2.0, 5.0);
      expect(sr358).toBeGreaterThan(0.32);
      expect(sr358).toBeLessThan(0.5);

      // TL072 SR ≈ 13 V/us
      const r072 = await runSpiceSimulationNode(`* TL072 SR
Vvp vp 0 DC 12
Vvm vm 0 DC -12
Vin inp 0 PULSE(-4 4 1u 10n 10n 50u 100u)
X1 out inp out 0 0 o2 vp vm OPAMP_TL072_SUB
Rl out 0 10k
${SUBCKT_DEFINITIONS.OPAMP_TL072_SUB}
.tran 20n 4u
.print tran v(out)
.end`);
      const sr072 = measureSlewRateVus(firstBlock(r072, 'v(out)', 'time'), -2, 2);
      expect(sr072).toBeGreaterThan(10.5);
      expect(sr072).toBeLessThan(15.5);
    });
  });
});
