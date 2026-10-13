/**
 * Example Library — Behavioral Contracts (Phase 4)
 *
 * Validates every example circuit's netlist generation:
 *   1. Generates without throwing
 *   2. Contains the required component tokens (V_, R_, C_, Q_, D_, B_, X_, M_, L_)
 *   3. ACSource emits "AC <amp> SINE(...)" token (Phase 1A fix verification)
 *   4. Voltage regulator uses ngspice B-source (Phase 1B fix verification)
 *   5. Fixed oscillators have no floating NC_* nodes (Phase 1B.2-4 fix verification)
 *   6. No __* internal metadata leaks into output (Phase 1C fix verification)
 *
 * Note: generateNetlist() always appends `.tran` as its default directive.
 * The AC sweep `.ac` directive is added by the store at simulation time,
 * so we verify AC correctness via the "AC <amp>" token on the source line.
 */
import { describe, it, expect } from 'vitest';
import { generateNetlist } from '../utils/netlister';

// ── Example JSONs ──────────────────────────────────────────────────────────────
import astable555          from '../examples/astable_555.json';
import bridgeRectifier     from '../examples/bridge_rectifier.json';
import commonEmitter       from '../examples/common_emitter.json';
import comparatorCircuit   from '../examples/comparator_circuit.json';
import halfWaveRectifier   from '../examples/half_wave_rectifier.json';
import invertingOpamp      from '../examples/inverting_opamp.json';
import lcBandpass          from '../examples/lc_bandpass_filter.json';
import lowPassFilter       from '../examples/low_pass_filter.json';
import mosfetSwitch        from '../examples/mosfet_switch.json';
import npnAmplifier        from '../examples/npn_amplifier.json';
import pnpAmplifier        from '../examples/pnp_amplifier.json';
import rcHighPass          from '../examples/rc_high_pass_filter.json';
import rcIntegrator        from '../examples/rc_integrator.json';
import rlLowPass           from '../examples/rl_low_pass.json';
import schmittOscillator   from '../examples/schmitt_oscillator.json';
import transformerStepdown from '../examples/transformer_stepdown.json';
import voltageDivider      from '../examples/voltage_divider.json';
import voltageRegulator5V  from '../examples/voltage_regulator_5v.json';
import wienBridge          from '../examples/wien_bridge_oscillator.json';
import zenerClipper        from '../examples/zener_clipper.json';

// ── Helper ─────────────────────────────────────────────────────────────────────
type ExampleData = {
  components: any[];
  wires: any[];
  probes?: any[];
};

/** Build netlist from a raw example JSON, passing its own probes array */
function netlist(data: ExampleData): string {
  return generateNetlist(
    data.components as any,
    data.wires as any,
    (data.probes ?? []) as any,
  );
}

/** Phase 1C guard: no internal __ metadata keys in output */
function assertNoInternalMetadata(nl: string, label: string) {
  expect(nl, `${label}: __parsedVars must not appear`).not.toMatch(/__parsedVars/);
  expect(nl, `${label}: no __ internal keys`).not.toMatch(/\b__\w/);
}

// ── AC filter circuits ─────────────────────────────────────────────────────────
describe('AC filter circuits — netlist contracts', () => {
  it('RC Low-Pass Filter: ACSource emits "AC <amp> SINE" token (Phase 1A fix)', () => {
    const nl = netlist(lowPassFilter as any);
    // Phase 1A fix: V_id node1 node2 AC <amp> SINE(0 <amp> <freq>)
    expect(nl).toMatch(/AC\s+[\d.]+\s+SINE\(/i);
    expect(nl).toMatch(/^R_/im);
    expect(nl).toMatch(/^C_/im);
    assertNoInternalMetadata(nl, 'RC Low-Pass');
  });

  it('RC High-Pass Filter: ACSource emits "AC <amp> SINE" token', () => {
    const nl = netlist(rcHighPass as any);
    expect(nl).toMatch(/AC\s+[\d.]+\s+SINE\(/i);
    expect(nl).toMatch(/^R_/im);
    expect(nl).toMatch(/^C_/im);
    assertNoInternalMetadata(nl, 'RC High-Pass');
  });

  it('LC Bandpass Filter: emits inductor (L_) and capacitor (C_)', () => {
    const nl = netlist(lcBandpass as any);
    expect(nl).toMatch(/^L_/im);
    expect(nl).toMatch(/^C_/im);
    assertNoInternalMetadata(nl, 'LC Bandpass');
  });

  it('RC Integrator: generates netlist without throwing', () => {
    const nl = netlist(rcIntegrator as any);
    expect(nl.length).toBeGreaterThan(30);
    assertNoInternalMetadata(nl, 'RC Integrator');
  });

  it('RL Low-Pass: emits inductor token (L_)', () => {
    const nl = netlist(rlLowPass as any);
    expect(nl).toMatch(/^L_/im);
    assertNoInternalMetadata(nl, 'RL Low-Pass');
  });
});

// ── Rectifier / Power circuits ─────────────────────────────────────────────────
describe('Rectifier and power circuits — netlist contracts', () => {
  it('Half-Wave Rectifier: emits diode (D_) and voltage source (V_)', () => {
    const nl = netlist(halfWaveRectifier as any);
    expect(nl).toMatch(/^D_/im);
    expect(nl).toMatch(/^V_/im);
    assertNoInternalMetadata(nl, 'Half-Wave Rectifier');
  });

  it('Bridge Rectifier: BridgeRectifier component emits 4 internal diodes and D_1N4007 model', () => {
    const nl = netlist(bridgeRectifier as any);
    // BridgeRectifier emits D1_BR1, D2_BR1, D3_BR1, D4_BR1 (prefixed, not plain D_)
    const diodeCount = (nl.match(/^D[1-4]_/gim) ?? []).length;
    expect(diodeCount).toBeGreaterThanOrEqual(4);
    expect(nl).toMatch(/D_1N4007/);  // model must be included
    assertNoInternalMetadata(nl, 'Bridge Rectifier');
  });

  it('Voltage Divider: emits 2+ resistors and a voltage source', () => {
    const nl = netlist(voltageDivider as any);
    const rCount = (nl.match(/^R_/gim) ?? []).length;
    expect(rCount).toBeGreaterThanOrEqual(2);
    expect(nl).toMatch(/^V_/im);
    assertNoInternalMetadata(nl, 'Voltage Divider');
  });

  it('5V Voltage Regulator: emits B-source behavioral model — NOT broken PSpice E_reg VALUE= (Phase 1B fix)', () => {
    const nl = netlist(voltageRegulator5V as any);
    // Phase 1B fix: replaced E_reg VALUE={IF(...)} with B_reg V=(cond)?then:else
    expect(nl).toMatch(/^B_/im);
    expect(nl).not.toMatch(/E_reg\s+VALUE=/i);
    assertNoInternalMetadata(nl, 'Voltage Regulator 5V');
  });

  it('Transformer Stepdown: generates netlist without throwing', () => {
    const nl = netlist(transformerStepdown as any);
    expect(nl.length).toBeGreaterThan(30);
    assertNoInternalMetadata(nl, 'Transformer Stepdown');
  });
});

// ── Amplifier circuits ─────────────────────────────────────────────────────────
describe('Amplifier circuits — netlist contracts', () => {
  it('NPN Common-Emitter Amplifier: emits transistor (Q_) and bias resistors', () => {
    const nl = netlist(npnAmplifier as any);
    expect(nl).toMatch(/^Q_/im);
    expect(nl).toMatch(/^R_/im);
    assertNoInternalMetadata(nl, 'NPN Amplifier');
  });

  it('PNP Amplifier: emits PNP transistor token (Q_)', () => {
    const nl = netlist(pnpAmplifier as any);
    expect(nl).toMatch(/^Q_/im);
    assertNoInternalMetadata(nl, 'PNP Amplifier');
  });

  it('Common Emitter: emits transistor and coupling capacitor', () => {
    const nl = netlist(commonEmitter as any);
    expect(nl).toMatch(/^Q_/im);
    expect(nl).toMatch(/^C_/im);
    assertNoInternalMetadata(nl, 'Common Emitter');
  });

  it('Inverting Op-Amp: emits op-amp subcircuit call (X_)', () => {
    const nl = netlist(invertingOpamp as any);
    expect(nl).toMatch(/^X_/im);
    assertNoInternalMetadata(nl, 'Inverting Op-Amp');
  });

  it('Comparator Circuit: emits op-amp subcircuit (X_)', () => {
    const nl = netlist(comparatorCircuit as any);
    expect(nl).toMatch(/^X_/im);
    assertNoInternalMetadata(nl, 'Comparator');
  });
});

// ── Oscillator circuits — Phase 1B.2–4 fixes ──────────────────────────────────
describe('Oscillator circuits — no floating NC_* nodes (Phase 1B.2-4 fixes)', () => {
  it('Schmitt Trigger Oscillator: has subcircuit + RC timing, zero NC_* nodes', () => {
    const nl = netlist(schmittOscillator as any);
    expect(nl).toMatch(/^X_/im);  // Schmitt trigger subcircuit
    expect(nl).toMatch(/^R_/im);  // timing resistor
    expect(nl).toMatch(/^C_/im);  // timing capacitor
    // Phase 1B.2 fix: VCC/OUT nodes are now wired — NC_* should be absent
    expect(nl).not.toMatch(/\bNC_\w+\b/);
    assertNoInternalMetadata(nl, 'Schmitt Trigger');
  });

  it('Wien Bridge Oscillator: op-amp powered + RC feedback, zero NC_* nodes', () => {
    const nl = netlist(wienBridge as any);
    expect(nl).toMatch(/^X_/im);
    expect(nl).toMatch(/^R_/im);
    expect(nl).toMatch(/^C_/im);
    // Phase 1B.3 fix: VCC/VEE now wired to supply nodes
    expect(nl).not.toMatch(/\bNC_\w+\b/);
    assertNoInternalMetadata(nl, 'Wien Bridge');
  });

  it('555 Astable Oscillator: 555 subcircuit + timing RC, zero NC_* nodes', () => {
    const nl = netlist(astable555 as any);
    expect(nl).toMatch(/^X_/im);  // 555 timer subcircuit
    expect(nl).toMatch(/^R_/im);
    expect(nl).toMatch(/^C_/im);
    // Phase 1B.4 fix: CON decoupled, OUT wired to probe
    expect(nl).not.toMatch(/\bNC_\w+\b/);
    assertNoInternalMetadata(nl, '555 Astable');
  });
});

// ── Switching circuits ─────────────────────────────────────────────────────────
describe('Switching circuits — netlist contracts', () => {
  it('MOSFET Switch: emits MOSFET token (M_)', () => {
    const nl = netlist(mosfetSwitch as any);
    expect(nl).toMatch(/^M_/im);
    assertNoInternalMetadata(nl, 'MOSFET Switch');
  });

  it('Zener Clipper: emits zener diode (D_)', () => {
    const nl = netlist(zenerClipper as any);
    expect(nl).toMatch(/^D_/im);
    assertNoInternalMetadata(nl, 'Zener Clipper');
  });
});

// ── AC source regression guard (Phase 1A) ─────────────────────────────────────
describe('ACSource regression guard — "AC <amp> SINE" token present', () => {
  it('low-pass filter ACSource: emits AC token before SINE (not SINE-only)', () => {
    const nl = netlist(lowPassFilter as any);
    // Old broken format: V_V1 n1 n2 SINE(0 1 1000)
    // Fixed format:      V_V1 n1 n2 AC 1 SINE(0 1 1000)
    expect(nl).toMatch(/AC\s+[\d.eE+\-]+\s+SINE\(/i);
  });

  it('high-pass filter ACSource: emits AC token before SINE', () => {
    const nl = netlist(rcHighPass as any);
    expect(nl).toMatch(/AC\s+[\d.eE+\-]+\s+SINE\(/i);
  });

  it('LC bandpass ACSource: emits AC token before SINE', () => {
    const nl = netlist(lcBandpass as any);
    expect(nl).toMatch(/AC\s+[\d.eE+\-]+\s+SINE\(/i);
  });
});
