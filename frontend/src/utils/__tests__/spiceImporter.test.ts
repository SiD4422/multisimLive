import { describe, expect, it } from 'vitest';
import { importSpiceNetlist, looksLikeSpiceNetlist } from '../spiceImporter';
import { generateNetlist } from '../netlister';
import { runSpiceSimulationNode } from '../../../scripts/nodeSpiceRunner.mjs';
import type { SchematicComponent } from '../../store/useSchematicStore';

async function runCirSim(netlist: string, analysisCmd: string, signal: string): Promise<Array<{ x: number; v: number }>> {
  const isAc = analysisCmd.trim().toLowerCase().startsWith('.ac');
  const printSignal = isAc && !signal.includes('(') ? `vm(${signal})` : isAc ? `vm(${signal.slice(2, -1)})` : signal;
  const xKey = isAc ? 'frequency' : 'time';
  let prepared = netlist.replace(/^\.tran .+$/m, `${analysisCmd}\n.print ${isAc ? 'ac' : 'tran'} ${printSignal}`);
  if (!prepared.includes(analysisCmd)) {
    prepared = prepared.replace(/\.end\s*$/, `${analysisCmd}\n.print ${isAc ? 'ac' : 'tran'} ${printSignal}\n.end`);
  }
  const rows = (await runSpiceSimulationNode(prepared)) as Array<Record<string, number>>;
  const pts: Array<{ x: number; v: number }> = [];
  let prevX = -1;
  const colKey = isAc ? printSignal.toLowerCase() : signal.toLowerCase();
  for (const r of rows) {
    const x = r[xKey];
    const v = r[colKey];
    if (x !== undefined && v !== undefined) {
      if (x < prevX) break;
      prevX = x;
      pts.push({ x, v });
    }
  }
  return pts;
}

describe('Phase 3.2: .cir Netlist Wire Reconstruction & Round-Trip SPICE Accuracy', () => {
  it('fixes title-comment line bug, reconstructs wires & Ground, and simulates accurate DC divider voltage', async () => {
    const cir = `* WebAssembly SPICE Netlist
V_V1 in 0 DC 10
R_R1 in vout 1k
R_R2 vout 0 1k
.tran 1u 10u
.end`;
    expect(looksLikeSpiceNetlist(cir)).toBe(true);
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(3);
    expect(res.wireCount).toBeGreaterThanOrEqual(3);

    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');
    expect(rebuilt).toMatch(/^V_V1 /m);
    expect(rebuilt).toMatch(/^R_R1 /m);
    expect(rebuilt).toMatch(/^R_R2 /m);

    const r1Line = rebuilt.split('\n').find((l) => l.startsWith('R_R1 '))!;
    const r2Line = rebuilt.split('\n').find((l) => l.startsWith('R_R2 '))!;
    const r1Nodes = r1Line.split(/\s+/).slice(1, 3);
    const r2Nodes = r2Line.split(/\s+/).slice(1, 3);
    const midNode = r1Nodes.find((n) => n !== '0' && r2Nodes.includes(n));
    expect(midNode).toBeTruthy();

    const pts = await runCirSim(rebuilt, '.tran 1u 5u', `v(${midNode})`);
    expect(pts.length).toBeGreaterThan(0);
    expect(pts[pts.length - 1].v).toBeCloseTo(5.0, 2);
  });

  it('reconstructs AC RC Low-Pass Filter with -3dB cutoff near 1kHz', async () => {
    const cir = `RC Low Pass Filter
V1 in 0 AC 1 SINE(0 1 1kHz)
R1 in out 1k
C1 out 0 159.15n
.ac dec 10 100 10k
.end`;
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(3);
    expect(res.analysisCommand).toContain('.ac');
    expect(res.wireCount).toBeGreaterThanOrEqual(3);

    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');
    const cLine = rebuilt.split('\n').find((l) => l.startsWith('C_C1 '))!;
    const cNodes = cLine.split(/\s+/).slice(1, 3);
    const outNode = cNodes.find((n) => n !== '0')!;
    expect(outNode).toBeTruthy();

    const pts = await runCirSim(rebuilt, '.ac dec 10 100 10k', `v(${outNode})`);
    const at1k = pts.find((p) => p.x >= 950 && p.x <= 1050);
    expect(at1k).toBeDefined();
    expect(at1k!.v).toBeGreaterThan(0.66);
    expect(at1k!.v).toBeLessThan(0.75);
  });

  it('maps BJT C-B-E netlist pin order accurately without swapping Base & Collector', async () => {
    const cir = `Common Emitter Bias
Vcc vcc 0 DC 12
R1 vcc b 47k
R2 b 0 10k
Rc vcc c 1k
Re e 0 220
Q1 c b e 2N3904
.model 2N3904 NPN (BF=200)
.end`;
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(6);

    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');

    const qLine = rebuilt.split('\n').find((l) => l.startsWith('Q_Q1 '))!;
    const [qC, qB, qE] = qLine.split(/\s+/).slice(1, 4);
    const rcNodes = rebuilt.split('\n').find((l) => l.startsWith('R_RC '))!.split(/\s+/).slice(1, 3);
    const reNodes = rebuilt.split('\n').find((l) => l.startsWith('R_RE '))!.split(/\s+/).slice(1, 3);
    expect(rcNodes).toContain(qC);
    expect(reNodes).toContain(qE);
    expect(qC).not.toBe(qB);
    expect(qB).not.toBe(qE);

    const vc = await runCirSim(rebuilt, '.tran 1u 5u', `v(${qC})`);
    const vb = await runCirSim(rebuilt, '.tran 1u 5u', `v(${qB})`);
    const ve = await runCirSim(rebuilt, '.tran 1u 5u', `v(${qE})`);
    const vbe = vb[vb.length - 1].v - ve[ve.length - 1].v;
    expect(vbe).toBeGreaterThan(0.58);
    expect(vbe).toBeLessThan(0.8);
    expect(vc[vc.length - 1].v).toBeGreaterThan(2.0);
    expect(vc[vc.length - 1].v).toBeLessThan(11.0);
  });

  it('maps MOSFET D-G-S pins, deduplicates D_body_M1 on round-trip, and switches ON cleanly', async () => {
    const cir = `* NodeSim round-trip NMOS switch
V_Vdd vdd 0 DC 10
V_Vg gate 0 DC 10
R_Rd vdd drain 100
M_M1 drain gate 0 0 2N7000
D_body_M1 0 drain DBODY_2N7000
.end`;
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(4);
    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');

    const mLine = rebuilt.split('\n').find((l) => l.startsWith('M_M1 '))!;
    const [mD, mG, mS] = mLine.split(/\s+/).slice(1, 4);
    expect(mS).toBe('0');
    expect(mD).not.toBe(mG);

    const vd = await runCirSim(rebuilt, '.tran 1u 5u', `v(${mD})`);
    expect(vd[vd.length - 1].v).toBeLessThan(0.5);
  });

  it('reconstructs Op-Amp Inverting Amplifier (Gain = -2) via IDEAL_OPAMP or .subckt ports', async () => {
    const cir = `Inverting Opamp
Vin vin 0 DC 2
Rin vin inv 1k
Rf inv out 2k
X1 inv 0 out IDEAL_OPAMP
.end`;
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(4);

    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');
    const xLine = rebuilt.split('\n').find((l) => l.startsWith('X_X1 '))!;
    const xOut = xLine.split(/\s+/)[3];
    const vout = await runCirSim(rebuilt, '.tran 1u 10u', `v(${xOut})`);
    expect(vout[vout.length - 1].v).toBeCloseTo(-4.0, 1);
  });

  it('merges unconnected clusters electrically when NetLabel components share a net name', async () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'DCSource', value: '9V', position: { x: 100, y: 100 }, rotation: 90 },
      { id: 'GND1', type: 'Ground', position: { x: 100, y: 190 }, rotation: 0 },
      { id: 'L1', type: 'NetLabel', value: 'VIN_BUS', position: { x: 100, y: 100 }, rotation: 0 },
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 600, y: 100 }, rotation: 90 },
      { id: 'GND2', type: 'Ground', position: { x: 600, y: 190 }, rotation: 0 },
      { id: 'L2', type: 'NetLabel', value: 'VIN_BUS', position: { x: 600, y: 100 }, rotation: 0 },
    ];
    const nl = generateNetlist(components, []);
    expect(nl).not.toContain('NC_');
    const vLine = nl.split('\n').find((l) => l.startsWith('V_V1 '))!;
    const rLine = nl.split('\n').find((l) => l.startsWith('R_R1 '))!;
    const vPosNode = vLine.split(/\s+/)[1];
    const rTopNode = rLine.split(/\s+/)[1];
    expect(vPosNode).toBe(rTopNode);
    expect(vPosNode).not.toBe('0');
  });

  it('routes or net-labels a Wheatstone crossed bridge and solves exact bridge differential voltage', async () => {
    const cir = `Wheatstone Bridge Cross Net
Vs vcc 0 DC 10
Ra vcc left 1k
Rb left 0 1k
Rc vcc right 1k
Rd right 0 3k
Rload left right 10k
.end`;
    const res = importSpiceNetlist(cir);
    expect(res.componentCount).toBe(6);
    expect(res.wireCount + res.netLabelCount).toBeGreaterThanOrEqual(6);

    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');

    // Bridge unloaded V_left = 5.0V, V_right = 7.5V -> with Rload=10k:
    // R_th_left = 500, R_th_right = 750 -> I = 2.5 / 11250 -> V_left = 5.111V, V_right = 7.333V
    const rloadNodes = rebuilt.split('\n').find((l) => l.startsWith('R_RLOAD '))!.split(/\s+/).slice(1, 3);
    const vLeft = await runCirSim(rebuilt, '.tran 1u 5u', `v(${rloadNodes[0]})`);
    const vRight = await runCirSim(rebuilt, '.tran 1u 5u', `v(${rloadNodes[1]})`);
    const diff = Math.abs(vRight[vRight.length - 1].v - vLeft[vLeft.length - 1].v);
    expect(diff).toBeCloseTo(2.222, 1);
  });

  it('round-trips a NodeSim-exported 5-pin LM741 circuit without losing components or pin nets', async () => {
    const exportedFromUi = `* WebAssembly SPICE Netlist
V_Vvp vp 0 DC 12
V_Vvm 0 vm DC 12
V_Vin vin 0 DC 1
R_Rin vin inm 1k
R_Rf inm out 3k
X_U1 inm 0 vp vm out LM741
.end`;
    const res = importSpiceNetlist(exportedFromUi);
    expect(res.componentCount).toBe(6);
    const rebuilt = generateNetlist(res.components, res.wires);
    expect(rebuilt).not.toContain('NC_');

    const xLine = rebuilt.split('\n').find((l) => l.startsWith('X_U1 '))!;
    const outNode = xLine.split(/\s+/)[5];
    const vout = await runCirSim(rebuilt, '.tran 1u 50u', `v(${outNode})`);
    expect(vout[vout.length - 1].v).toBeCloseTo(-3.0, 1);
  });
});
