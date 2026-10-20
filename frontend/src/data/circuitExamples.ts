// Curated example circuits shown on /circuits and /circuits/:id.

import { Activity, ArrowUpDown, Cpu, Filter, GitBranch, GitMerge, Radio, RefreshCw, Sliders, ToggleRight, TrendingUp, Triangle, Waves, Zap } from 'lucide-react';
import { C } from './circuitsTheme';
import lowPassFilter        from '../examples/low_pass_filter.json';
import rcHighPassFilter     from '../examples/rc_high_pass_filter.json';
import bridgeRectifier      from '../examples/bridge_rectifier.json';
import halfWaveRectifier    from '../examples/half_wave_rectifier.json';
import invertingOpamp       from '../examples/inverting_opamp.json';
import astable555           from '../examples/astable_555.json';
import voltageDivider       from '../examples/voltage_divider.json';
import lcBandpassFilter     from '../examples/lc_bandpass_filter.json';
import zenerClipper         from '../examples/zener_clipper.json';
import npnAmplifier         from '../examples/npn_amplifier.json';
import transformerStepdown  from '../examples/transformer_stepdown.json';
import rlLowPass            from '../examples/rl_low_pass.json';
import mosfetSwitch         from '../examples/mosfet_switch.json';
import rcIntegrator         from '../examples/rc_integrator.json';
import commonEmitter        from '../examples/common_emitter.json';
import comparatorCircuit    from '../examples/comparator_circuit.json';
import pnpAmplifier         from '../examples/pnp_amplifier.json';
import bjtCommonBaseAmp     from '../examples/bjt_common_base_amp.json';
import schmittOscillator    from '../examples/schmitt_oscillator.json';
import wienBridge           from '../examples/wien_bridge_oscillator.json';
import mosfetInverter       from '../examples/mosfet_inverter.json';
import voltageRegulator5V   from '../examples/voltage_regulator_5v.json';
import zenerVoltageReg      from '../examples/zener_voltage_regulator.json';

export const EXAMPLES = [
  // ── FILTERS ────────────────────────────────────────────────────
  { id: 'lpf', name: 'RC Low-Pass Filter', category: 'Filters', description: 'Passes low frequencies, attenuates highs. The foundation of analog signal processing.', analysis: 'AC Sweep', analysisColor: C.acSweep, difficulty: 'Beginner', components: ['Resistor', 'Capacitor', 'AC Source'], Icon: Waves, accent: '#0284c7', data: lowPassFilter },
  { id: 'hpf', name: 'RC High-Pass Filter', category: 'Filters', description: 'Blocks DC and low frequencies, passes high-frequency signals. Coupling & noise removal.', analysis: 'AC Sweep', analysisColor: C.acSweep, difficulty: 'Beginner', components: ['Capacitor', 'Resistor', 'AC Source'], Icon: TrendingUp, accent: '#0891b2', data: rcHighPassFilter },
  { id: 'rl_lp', name: 'RL Low-Pass Filter', category: 'Filters', description: 'Inductor-resistor low-pass filter. Used in power supplies and EMI filtering applications.', analysis: 'AC Sweep', analysisColor: C.acSweep, difficulty: 'Beginner', components: ['Inductor', 'Resistor', 'AC Source'], Icon: Radio, accent: '#7c3aed', data: rlLowPass },
  { id: 'lc_bp', name: 'LC Bandpass Filter', category: 'Filters', description: 'Series LC resonates at center frequency. Used in radio tuners and RF signal selection.', analysis: 'AC Sweep', analysisColor: C.acSweep, difficulty: 'Intermediate', components: ['Inductor', 'Capacitor', 'Resistor'], Icon: Radio, accent: '#b45309', data: lcBandpassFilter },
  { id: 'integrator', name: 'RC Integrator', category: 'Filters', description: 'Converts a square wave to a triangle wave. An essential waveform shaping circuit.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Beginner', components: ['Pulse Source', 'Resistor', 'Capacitor'], Icon: Triangle, accent: '#16a34a', data: rcIntegrator },

  // ── RECTIFIERS ─────────────────────────────────────────────────
  { id: 'half_wave', name: 'Half-Wave Rectifier', category: 'Rectifiers', description: 'Simplest AC-to-DC converter. A single diode passes only the positive half-cycle.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Beginner', components: ['Diode', 'Resistor', 'AC Source'], Icon: Zap, accent: '#d97706', data: halfWaveRectifier },
  { id: 'rectifier', name: 'Bridge Rectifier', category: 'Rectifiers', description: 'Full-wave rectification using 4 diodes. Converts AC to pulsating DC with smoothing cap.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Bridge Rect.', 'Capacitor', 'AC Source'], Icon: GitMerge, accent: '#dc2626', data: bridgeRectifier },
  { id: 'transformer', name: 'Step-Down Transformer', category: 'Rectifiers', description: '120V → 12V step-down using a 10:1 transformer. Core of any AC power supply design.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Transformer', 'Resistor', 'AC Source'], Icon: ArrowUpDown, accent: '#be185d', data: transformerStepdown },

  // ── AMPLIFIERS ─────────────────────────────────────────────────
  { id: 'opamp', name: 'Inverting Op-Amp', category: 'Amplifiers', description: 'Op-Amp with negative feedback. Output is 180° phase-shifted with gain set by resistor ratio.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Op-Amp', 'Resistors', 'AC Source'], Icon: Activity, accent: '#0f766e', data: invertingOpamp },
  { id: 'ce_amp', name: 'Common-Emitter Amp', category: 'Amplifiers', description: 'Classic NPN BJT amplifier. High voltage gain, 180° phase inversion, widely used in audio.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['NPN BJT', 'Resistors', 'DC + AC'], Icon: TrendingUp, accent: '#4f46e5', data: commonEmitter },
  { id: 'npn_amp', name: 'NPN Transistor Bias', category: 'Amplifiers', description: 'Biased NPN amplifier with collector resistor. Shows Q-point and small-signal amplification.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['NPN BJT', 'Resistors', 'DC + AC'], Icon: GitBranch, accent: '#2563eb', data: npnAmplifier },
  { id: 'comparator', name: 'Voltage Comparator', category: 'Amplifiers', description: 'Op-Amp as comparator. Output swings rail-to-rail when Vin crosses the reference voltage.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Comparator', 'DC Ref', 'AC Source'], Icon: ToggleRight, accent: '#7e22ce', data: comparatorCircuit },

  // ── POWER ──────────────────────────────────────────────────────
  { id: 'zener', name: 'Zener Voltage Clipper', category: 'Power', description: 'Zener diode clamps signal to breakdown voltage. Overvoltage protection and waveform clipping.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Beginner', components: ['Zener Diode', 'Resistor', 'AC Source'], Icon: Sliders, accent: '#ea580c', data: zenerClipper },
  { id: 'vdivider', name: 'Voltage Divider', category: 'Power', description: 'Two resistors split a voltage proportionally. Fundamental circuit for biasing and sensing.', analysis: 'DC Sweep', analysisColor: C.dcSweep, difficulty: 'Beginner', components: ['2× Resistors', 'DC Source'], Icon: Filter, accent: '#059669', data: voltageDivider },

  // ── SWITCHING ──────────────────────────────────────────────────
  { id: 'mosfet_sw', name: 'MOSFET Switch', category: 'Switching', description: 'N-Channel MOSFET as a digital switch. Gate voltage controls the drain-source resistance.', analysis: 'DC Sweep', analysisColor: C.dcSweep, difficulty: 'Beginner', components: ['N-MOSFET', 'Resistor', 'DC Source'], Icon: ToggleRight, accent: '#0284c7', data: mosfetSwitch },
  { id: 'schmitt', name: 'Schmitt Trigger Oscillator', category: 'Switching', description: 'Op-amp with positive feedback creates hysteresis. Observe clean switching thresholds VUT and VLT.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Op-Amp', 'RC Network', 'Dual Supply'], Icon: ToggleRight, accent: '#7c3aed', data: schmittOscillator },
  { id: 'mosfet_inv', name: 'MOSFET Inverter (CMOS)', category: 'Switching', description: 'NMOS common-source inverter with resistive load. Digital NOT gate at transistor level.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['N-MOSFET', 'Resistor', 'Pulse Source'], Icon: RefreshCw, accent: '#0891b2', data: mosfetInverter },

  // ── SOURCES ────────────────────────────────────────────────────
  { id: '555', name: '555 Astable Oscillator', category: 'Sources', description: '555 timer in astable mode generates a continuous square wave at adjustable frequency.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Transistor Amplifier', 'RC Network'], Icon: Cpu, accent: '#e11d48', data: astable555 },
  { id: 'wien', name: 'Wien Bridge Oscillator', category: 'Sources', description: 'Op-amp RC oscillator generating a sinusoidal output. Frequency set by f = 1/(2πRC).', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Advanced', components: ['Op-Amp', 'RC Network', 'Dual Supply'], Icon: Waves, accent: '#d97706', data: wienBridge },

  // ── AMPLIFIERS (additional) ────────────────────────────────────
  { id: 'pnp_amp', name: 'PNP Transistor Amplifier', category: 'Amplifiers', description: 'PNP BJT in common-emitter config. Complementary to NPN — useful in push-pull power stages.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['PNP BJT', 'Resistors', 'DC + AC'], Icon: GitBranch, accent: '#9333ea', data: pnpAmplifier },
  { id: 'cb_amp', name: 'BJT Common-Base Amplifier', category: 'Amplifiers', description: 'Low input impedance, high voltage gain, no phase inversion. Used in RF and high-frequency apps.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Advanced', components: ['NPN BJT', 'Resistors', 'DC + AC'], Icon: Activity, accent: '#0f766e', data: bjtCommonBaseAmp },

  // ── POWER (additional) ─────────────────────────────────────────
  { id: 'vreg_5v', name: '5V Linear Voltage Regulator', category: 'Power', description: 'Behavioral voltage regulator holds output at 5V regardless of load or input variation.', analysis: 'DC Sweep', analysisColor: C.dcSweep, difficulty: 'Intermediate', components: ['B-Source Reg', 'Capacitors', 'DC Source'], Icon: Zap, accent: '#16a34a', data: voltageRegulator5V },
  { id: 'zener_reg', name: 'Zener Voltage Regulator', category: 'Power', description: 'Zener diode shunt regulator. Clamps output voltage at Vz. Simple low-current regulation.', analysis: 'DC Sweep', analysisColor: C.dcSweep, difficulty: 'Beginner', components: ['Zener Diode', 'Resistor', 'DC Source'], Icon: Sliders, accent: '#b45309', data: zenerVoltageReg },
];
