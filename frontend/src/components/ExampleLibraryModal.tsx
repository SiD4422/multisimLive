import { useState, useEffect, useRef } from 'react';
import {
  X, Search, ChevronRight, Zap, Cpu, Activity, Waves,
  Filter, TrendingUp, GitMerge, Radio, Sliders, ArrowUpDown,
  ToggleRight, Layers, GitBranch, Triangle, GraduationCap,
  HelpCircle, ChevronDown, Play
} from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import { universityLabPacks, type LabExperiment, resolveCircuitId, useActiveExperimentStore } from '../data/universityLabPacks';

// ── Imports (existing) ──────────────────────────────────────────────────────
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

// ── Imports (new) ───────────────────────────────────────────────────────────
import transformerStepdown  from '../examples/transformer_stepdown.json';
import rlLowPass            from '../examples/rl_low_pass.json';
import mosfetSwitch         from '../examples/mosfet_switch.json';
import rcIntegrator         from '../examples/rc_integrator.json';
import commonEmitter        from '../examples/common_emitter.json';
import comparatorCircuit    from '../examples/comparator_circuit.json';
import pnpAmplifier         from '../examples/pnp_amplifier.json';
import voltageRegulator5V   from '../examples/voltage_regulator_5v.json';
import schmittOscillator    from '../examples/schmitt_oscillator.json';
import wienBridgeOscillator from '../examples/wien_bridge_oscillator.json';
import bjtCommonBaseAmp       from '../examples/bjt_common_base_amp.json';
import zenerVoltageRegulator  from '../examples/zener_voltage_regulator.json';
import fullWaveBridgeRectifier from '../examples/full_wave_bridge_rectifier.json';
import mosfetInverter         from '../examples/mosfet_inverter.json';

// ── Palette (matches site CSS vars) ─────────────────────────────────────────
const C = {
  // Brand greens
  brand900: '#022c1a',
  brand800: '#053b24',
  brand700: '#065f36',
  brand600: '#0b7a44',
  brand500: '#10a05a',
  brand400: '#16c068',
  brand300: '#4ade96',
  // Neutrals
  gray950: '#030712',
  gray900: '#111827',
  gray800: '#1f2937',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  // Semantics
  danger:  '#dc2626',
  warning: '#d97706',
  info:    '#2563eb',
};

const CATEGORIES = ['All', 'Lab Packs 🎓', 'Filters', 'Rectifiers', 'Amplifiers', 'Power', 'Switching', 'Sources'];

const EXAMPLES = [
  // ── FILTERS ────────────────────────────────────────────────────
  {
    id: 'lpf', name: 'RC Low-Pass Filter', category: 'Filters',
    description: 'Passes low frequencies, attenuates highs. The foundation of analog signal processing.',
    analysis: 'AC Sweep', analysisColor: C.brand400,
    difficulty: 'Beginner',
    components: ['Resistor', 'Capacitor', 'AC Source'],
    Icon: Waves,
    accent: C.brand500,
    data: lowPassFilter,
  },
  {
    id: 'hpf', name: 'RC High-Pass Filter', category: 'Filters',
    description: 'Blocks DC and low frequencies, passes high-frequency signals. Coupling & noise removal.',
    analysis: 'AC Sweep', analysisColor: C.brand400,
    difficulty: 'Beginner',
    components: ['Capacitor', 'Resistor', 'AC Source'],
    Icon: TrendingUp,
    accent: '#0891b2',
    data: rcHighPassFilter,
  },
  {
    id: 'rl_lp', name: 'RL Low-Pass Filter', category: 'Filters',
    description: 'Inductor-resistor low-pass filter. Used in power supplies and EMI filtering applications.',
    analysis: 'AC Sweep', analysisColor: C.brand400,
    difficulty: 'Beginner',
    components: ['Inductor', 'Resistor', 'AC Source'],
    Icon: Radio,
    accent: '#7c3aed',
    data: rlLowPass,
  },
  {
    id: 'lc_bp', name: 'LC Bandpass Filter', category: 'Filters',
    description: 'Series LC resonates at center frequency. Used in radio tuners and RF signal selection.',
    analysis: 'AC Sweep', analysisColor: C.brand400,
    difficulty: 'Intermediate',
    components: ['Inductor', 'Capacitor', 'Resistor'],
    Icon: Radio,
    accent: '#b45309',
    data: lcBandpassFilter,
  },
  {
    id: 'integrator', name: 'RC Integrator', category: 'Filters',
    description: 'Converts a square wave to a triangle wave. An essential waveform shaping circuit.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Beginner',
    components: ['Pulse Source', 'Resistor', 'Capacitor'],
    Icon: Triangle,
    accent: C.brand600,
    data: rcIntegrator,
  },

  // ── RECTIFIERS ─────────────────────────────────────────────────
  {
    id: 'half_wave', name: 'Half-Wave Rectifier', category: 'Rectifiers',
    description: 'Simplest AC-to-DC converter. A single diode passes only the positive half-cycle.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Beginner',
    components: ['Diode', 'Resistor', 'AC Source'],
    Icon: Zap,
    accent: '#92400e',
    data: halfWaveRectifier,
  },
  {
    id: 'rectifier', name: 'Bridge Rectifier', category: 'Rectifiers',
    description: 'Full-wave rectification using 4 diodes. Converts AC to pulsating DC with smoothing cap.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['Bridge Rect.', 'Capacitor', 'AC Source'],
    Icon: GitMerge,
    accent: C.danger,
    data: bridgeRectifier,
  },
  {
    id: 'transformer', name: 'Step-Down Transformer', category: 'Rectifiers',
    description: '120V → 12V step-down using a 10:1 transformer. Core of any AC power supply design.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['Transformer', 'Resistor', 'AC Source'],
    Icon: ArrowUpDown,
    accent: '#be185d',
    data: transformerStepdown,
  },
  {
    id: 'full_wave_bridge', name: 'Full-Wave Bridge Rectifier', category: 'Rectifiers',
    description: '4-diode bridge rectifier converting 12V 60Hz AC to smooth DC with a 1000µF capacitor.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Beginner',
    components: ['4x Diodes', 'Capacitor', 'Resistor', 'AC Source'],
    Icon: GitMerge,
    accent: '#dc2626',
    data: fullWaveBridgeRectifier,
  },

  // ── AMPLIFIERS ─────────────────────────────────────────────────
  {
    id: 'opamp', name: 'Inverting Op-Amp', category: 'Amplifiers',
    description: 'Op-Amp with negative feedback. Output is 180° phase-shifted with gain set by resistor ratio.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['Op-Amp', 'Resistors', 'AC Source'],
    Icon: Activity,
    accent: '#0f766e',
    data: invertingOpamp,
  },
  {
    id: 'ce_amp', name: 'Common-Emitter Amp', category: 'Amplifiers',
    description: 'Classic NPN BJT amplifier. High voltage gain, 180° phase inversion, widely used in audio.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['NPN BJT', 'Resistors', 'DC + AC'],
    Icon: TrendingUp,
    accent: C.brand600,
    data: commonEmitter,
  },
  {
    id: 'npn_amp', name: 'NPN Transistor Bias', category: 'Amplifiers',
    description: 'Biased NPN amplifier with collector resistor. Shows Q-point and small-signal amplification.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['NPN BJT', 'Resistors', 'DC + AC'],
    Icon: GitBranch,
    accent: '#1d4ed8',
    data: npnAmplifier,
  },
  {
    id: 'comparator', name: 'Voltage Comparator', category: 'Amplifiers',
    description: 'Op-Amp as comparator. Output swings rail-to-rail when Vin crosses the reference voltage.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['Comparator', 'DC Ref', 'AC Source'],
    Icon: ToggleRight,
    accent: '#6d28d9',
    data: comparatorCircuit,
  },
  {
    id: 'pnp_amp', name: 'PNP Common-Emitter Amp', category: 'Amplifiers',
    description: 'Common-emitter PNP amplifier with voltage divider bias. Inverts and amplifies the input signal.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['PNP BJT', 'Resistors', 'DC + AC'],
    Icon: TrendingUp,
    accent: '#8b5cf6',
    data: pnpAmplifier,
  },
  {
    id: 'cb_amp', name: 'Common-Base BJT Amp', category: 'Amplifiers',
    description: 'NPN BJT in common-base configuration. Low input impedance and high frequency bandwidth.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['NPN BJT', 'Resistors', 'Capacitors', 'AC + DC'],
    Icon: GitBranch,
    accent: '#2563eb',
    data: bjtCommonBaseAmp,
  },

  // ── POWER ──────────────────────────────────────────────────────
  {
    id: 'voltagereg_5v', name: '5V Voltage Regulator', category: 'Power',
    description: 'AC mains to regulated 5V DC. Full-wave rectification followed by LM7805 linear regulator.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['7805', 'Bridge Rectifier', 'Capacitors'],
    Icon: Zap,
    accent: '#eab308',
    data: voltageRegulator5V,
  },
  {
    id: 'zener', name: 'Zener Voltage Clipper', category: 'Power',
    description: 'Zener diode clamps signal to breakdown voltage. Overvoltage protection and waveform clipping.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Beginner',
    components: ['Zener Diode', 'Resistor', 'AC Source'],
    Icon: Sliders,
    accent: C.warning,
    data: zenerClipper,
  },
  {
    id: 'c1',
    name: 'Voltage Divider',
    category: 'Power',
    description: 'Simple resistive voltage divider demonstrating basic DC analysis and Ohm\'s law.',
    analysis: 'DC Sweep', analysisColor: C.warning,
    difficulty: 'Beginner',
    components: ['2x Resistors', 'DC Source'],
    Icon: Filter,
    accent: '#059669',
    data: voltageDivider,
  },
  {
    id: 'zener_reg', name: 'Zener Voltage Regulator', category: 'Power',
    description: '5.1V Zener shunt regulator maintaining stable load voltage across a 0–15V DC sweep.',
    analysis: 'DC Sweep', analysisColor: C.warning,
    difficulty: 'Beginner',
    components: ['Zener Diode', 'Resistors', 'DC Source'],
    Icon: Sliders,
    accent: '#d97706',
    data: zenerVoltageRegulator,
  },

  // ── SWITCHING ──────────────────────────────────────────────────
  {
    id: 'schmitt_osc', name: 'Schmitt Trigger Oscillator', category: 'Switching',
    description: 'RC oscillator using Schmitt trigger hysteresis. Self-oscillating at ~700Hz.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['Schmitt Trigger', 'Resistor', 'Capacitor'],
    Icon: Activity,
    accent: '#f43f5e',
    data: schmittOscillator,
  },
  {
    id: 'mosfet_sw', name: 'MOSFET Switch', category: 'Switching',
    description: 'N-Channel MOSFET as a digital switch. Gate voltage controls the drain-source resistance.',
    analysis: 'DC Sweep', analysisColor: C.warning,
    difficulty: 'Beginner',
    components: ['N-MOSFET', 'Resistor', 'DC Source'],
    Icon: ToggleRight,
    accent: '#0284c7',
    data: mosfetSwitch,
  },
  {
    id: 'mosfet_inv', name: 'MOSFET Inverter', category: 'Switching',
    description: 'NMOS digital NOT gate with 10kΩ pull-up resistor driven by a 1kHz square wave.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Beginner',
    components: ['N-MOSFET', 'Resistor', 'Clock Source'],
    Icon: ToggleRight,
    accent: '#0284c7',
    data: mosfetInverter,
  },

  // ── SOURCES ────────────────────────────────────────────────────
  {
    id: 'wien_bridge', name: 'Wien Bridge Oscillator', category: 'Sources',
    description: 'Sine wave oscillator at f=1/(2πRC)=1.59kHz. Classic Wien bridge with op-amp.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Advanced',
    components: ['Op-Amp', 'RC Network'],
    Icon: Waves,
    accent: '#3b82f6',
    data: wienBridgeOscillator,
  },
  {
    id: '555', name: '555 Astable Oscillator', category: 'Sources',
    description: '555 timer in astable mode generates a continuous square wave at adjustable frequency.',
    analysis: 'Transient', analysisColor: '#16a34a',
    difficulty: 'Intermediate',
    components: ['555 Timer', 'RC Network'],
    Icon: Cpu,
    accent: '#dc2626',
    data: astable555,
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     C.brand500,
  Intermediate: C.warning,
  Advanced:     C.danger,
};

// ── Modal ────────────────────────────────────────────────────────────────────
export function ExampleLibraryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { importState } = useSchematicStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [expandedViva, setExpandedViva] = useState<Record<string, boolean>>({
    'au-ec3201-exp1': true,
    'au-ec3201-exp2': true,
    'au-ec3201-exp3': true,
    'vtu-22ecl35-exp1': true,
    'vtu-22ecl35-exp2': true,
    'jntu-eel-exp1': true,
  });
  const [hovered, setHovered]   = useState<string | null>(null);
  const [animIn,  setAnimIn]    = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimIn(true), 10);
      setTimeout(() => searchRef.current?.focus(), 200);
    } else {
      setAnimIn(false);
      setSearch('');
      setActiveCategory('All');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleViva = (id: string) => {
    setExpandedViva(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (data: any, name: string) => {
    useActiveExperimentStore.getState().setActiveExperiment(null);
    console.log(`Loading circuit: ${name}`);
    importState(JSON.stringify(data));
    onClose();
  };

  const handleLoadExperiment = (exp: LabExperiment) => {
    const resolvedId = resolveCircuitId(exp.circuitId);
    const ex = EXAMPLES.find(e => e.id === resolvedId || e.id === exp.circuitId);
    if (ex) {
      useActiveExperimentStore.getState().setActiveExperiment(exp);
      console.log(`Loading lab pack experiment: ${exp.title}`);
      importState(JSON.stringify(ex.data));
      onClose();
    } else {
      console.warn(`Could not find circuit data for ${exp.circuitId}`);
    }
  };

  const filtered = EXAMPLES.filter(ex => {
    const matchCat   = activeCategory === 'All' || ex.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || ex.name.toLowerCase().includes(q)
      || ex.description.toLowerCase().includes(q)
      || ex.components.some(c => c.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2,15,8,0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        opacity: animIn ? 1 : 0,
        transition: 'opacity 0.22s ease',
      }}
    >
      {/* ── Shell ── */}
      <div style={{
        width: '100%', maxWidth: 960,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        borderRadius: 18,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${C.brand900} 0%, #011510 100%)`,
        border: `1px solid rgba(16,160,90,0.18)`,
        boxShadow: `0 0 0 1px rgba(16,160,90,0.08), 0 40px 100px rgba(0,0,0,0.85), 0 0 60px rgba(5,95,54,0.15)`,
        transform: animIn ? 'scale(1) translateY(0)' : 'scale(0.965) translateY(20px)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '22px 26px 18px',
          background: `linear-gradient(180deg, ${C.brand800} 0%, transparent 100%)`,
          borderBottom: `1px solid rgba(16,160,90,0.14)`,
          flexShrink: 0,
        }}>
          {/* Title row */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {/* Logo mark */}
              <div style={{
                width:36, height:36, borderRadius:10,
                background:`linear-gradient(135deg, ${C.brand600}, ${C.brand400})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 4px 14px rgba(16,160,90,0.5)`,
                flexShrink:0,
              }}>
                <Layers size={18} color="#fff" />
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#f0fdf4', letterSpacing:'-0.3px' }}>
                    {activeCategory === 'Lab Packs 🎓' ? 'University Lab Packs' : 'Circuit Library'}
                  </h2>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                    background:`rgba(16,160,90,0.15)`, color: C.brand300,
                    border:`1px solid rgba(16,160,90,0.3)`,
                    letterSpacing:'0.6px', textTransform:'uppercase',
                  }}>
                    {activeCategory === 'Lab Packs 🎓'
                      ? `${universityLabPacks.reduce((a, b) => a + b.experiments.length, 0)} experiments`
                      : `${EXAMPLES.length} circuits`}
                  </span>
                </div>
                <p style={{ margin:0, fontSize:12, color: C.gray500, marginTop:2 }}>
                  {activeCategory === 'Lab Packs 🎓'
                    ? 'Syllabus-aligned university lab experiments with viva questions and one-click simulation'
                    : 'Click any card to instantly load a simulation-ready circuit'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width:34, height:34, borderRadius:9, cursor:'pointer',
                background:`rgba(255,255,255,0.04)`,
                border:`1px solid rgba(255,255,255,0.08)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color: C.gray500, transition:'all 0.15s ease', flexShrink:0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.15)'; e.currentTarget.style.color='#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color=C.gray500; }}
            >
              <X size={16}/>
            </button>
          </div>

          {/* Search + category row */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            {/* Search */}
            <div style={{ position:'relative', flex:'1 1 200px', minWidth:160 }}>
              <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color: C.gray600, pointerEvents:'none' }} />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={activeCategory === 'Lab Packs 🎓' ? 'Search experiments, aim, viva…' : 'Search by name, component…'}
                style={{
                  width:'100%', padding:'8px 11px 8px 33px',
                  background:'rgba(255,255,255,0.04)',
                  border:`1px solid rgba(16,160,90,0.2)`,
                  borderRadius:9, color:'#d1fae5', fontSize:12,
                  outline:'none', boxSizing:'border-box',
                  transition:'border-color 0.15s',
                  fontFamily:'inherit',
                }}
                onFocus={e => e.target.style.borderColor = `rgba(16,192,104,0.55)`}
                onBlur={e  => e.target.style.borderColor = `rgba(16,160,90,0.2)`}
              />
            </div>

            {/* Category pills */}
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding:'6px 13px', borderRadius:7, fontSize:11, fontWeight:600,
                      cursor:'pointer', transition:'all 0.15s ease',
                      fontFamily:'inherit',
                      background: isActive
                        ? `linear-gradient(135deg, ${C.brand600}, ${C.brand500})`
                        : (cat === 'Lab Packs 🎓' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)'),
                      color: isActive ? '#fff' : (cat === 'Lab Packs 🎓' ? C.brand300 : C.gray500),
                      border: cat === 'Lab Packs 🎓' && !isActive ? '1px solid rgba(74,222,128,0.3)' : 'none',
                      boxShadow: isActive ? `0 3px 10px rgba(16,160,90,0.4)` : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Grid or Lab Packs View ── */}
        <div style={{ overflowY:'auto', padding:'18px 26px 26px', flex:1 }}>
          {activeCategory === 'Lab Packs 🎓' ? (
            <div>
              {/* University Selector Dropdown Bar */}
              <div style={{
                marginBottom: 20,
                padding: '14px 18px',
                borderRadius: 12,
                background: 'rgba(2,44,26,0.5)',
                border: '1px solid rgba(16,160,90,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: `linear-gradient(135deg, ${C.brand600}, ${C.brand400})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f0fdf4' }}>
                      University Lab Packs
                    </div>
                    <div style={{ fontSize: 11, color: C.gray500 }}>
                      Syllabus-matched experiments with aim, theory, expected observations &amp; viva questions
                    </div>
                  </div>
                </div>

                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#03140c',
                    border: '1px solid rgba(16,160,90,0.35)',
                    color: '#d1fae5',
                    fontSize: 12,
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: 260,
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Select University...</option>
                  <option value="anna-univ-ec3201">Anna University – EC3201</option>
                  <option value="vtu-22ecl35">VTU – 22ECL35</option>
                  <option value="jntu-eel">JNTU – EEL</option>
                </select>
              </div>

              {!selectedUniversity ? (
                <div>
                  <div style={{ textAlign: 'center', padding: '12px 0 22px', color: C.gray400 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#d1fae5' }}>
                      Select a university above or choose from curated university syllabus packs:
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.gray500 }}>
                      Each pack includes lab experiments directly aligned with official departmental curricula.
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 14,
                  }}>
                    {universityLabPacks.map(pack => (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedUniversity(pack.id)}
                        style={{
                          borderRadius: 12,
                          background: 'rgba(2,44,26,0.3)',
                          border: '1px solid rgba(16,160,90,0.18)',
                          padding: 16,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(16,192,104,0.45)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(16,160,90,0.18)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                            background: 'rgba(16,160,90,0.15)', color: C.brand300,
                            letterSpacing: '0.5px', textTransform: 'uppercase',
                          }}>
                            {pack.courseCode}
                          </span>
                          <span style={{ fontSize: 11, color: C.gray500 }}>
                            {pack.experiments.length} Experiments
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>
                          {pack.universityName}
                        </h4>
                        <div style={{ fontSize: 12, color: '#a7f3d0', marginBottom: 6 }}>
                          {pack.courseName}
                        </div>
                        <div style={{ fontSize: 11, color: C.gray500, marginBottom: 12 }}>
                          {pack.semester}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700, color: C.brand400,
                        }}>
                          View Experiments <ChevronRight size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                (() => {
                  const pack = universityLabPacks.find(p => p.id === selectedUniversity);
                  if (!pack) return null;
                  const q = search.toLowerCase();
                  const experiments = pack.experiments.filter(exp => {
                    if (!q) return true;
                    return exp.title.toLowerCase().includes(q)
                      || exp.aim.toLowerCase().includes(q)
                      || exp.theory.toLowerCase().includes(q)
                      || exp.vivaQuestions.some(v => v.toLowerCase().includes(q));
                  });

                  return (
                    <div>
                      {/* Pack Header Card */}
                      <div style={{
                        padding: '14px 18px',
                        borderRadius: 10,
                        background: 'rgba(16,160,90,0.08)',
                        border: '1px solid rgba(16,160,90,0.2)',
                        marginBottom: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: C.brand600, color: '#fff' }}>
                              {pack.courseCode}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>
                              {pack.universityName}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 3 }}>
                            {pack.courseName} · {pack.semester}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedUniversity('')}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6,
                            padding: '5px 10px',
                            color: C.gray400,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Change University
                        </button>
                      </div>

                      {/* Experiments List */}
                      {experiments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray500, fontSize: 13 }}>
                          No experiments matching "{search}" in this syllabus pack.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {experiments.map(exp => (
                            <div
                              key={exp.id}
                              style={{
                                borderRadius: 12,
                                background: 'rgba(2,44,26,0.3)',
                                border: '1px solid rgba(16,160,90,0.15)',
                                padding: 18,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {/* Experiment Header */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginBottom: 12,
                                flexWrap: 'wrap',
                              }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                      fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                                      background: 'rgba(16,160,90,0.2)', color: C.brand300,
                                      border: '1px solid rgba(16,160,90,0.3)',
                                    }}>
                                      Experiment {exp.experimentNo}
                                    </span>
                                    <span style={{ fontSize: 11, color: C.gray500, fontWeight: 600 }}>
                                      {exp.courseCode}
                                    </span>
                                  </div>
                                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0fdf4' }}>
                                    {exp.title}
                                  </h3>
                                </div>

                                <button
                                  onClick={() => handleLoadExperiment(exp)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: `linear-gradient(135deg, ${C.brand600}, ${C.brand500})`,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 10px rgba(16,160,90,0.3)',
                                    transition: 'all 0.15s ease',
                                    flexShrink: 0,
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,160,90,0.5)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(16,160,90,0.3)';
                                  }}
                                >
                                  <Play size={13} fill="#fff" /> Load Circuit
                                </button>
                              </div>

                              {/* Aim */}
                              <div style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
                                <div style={{ color: C.brand300, fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.6px', marginBottom: 2 }}>
                                  Aim:
                                </div>
                                <div style={{ color: '#e2e8f0' }}>{exp.aim}</div>
                              </div>

                              {/* Theory */}
                              <div style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
                                <div style={{ color: C.brand300, fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.6px', marginBottom: 2 }}>
                                  Theory:
                                </div>
                                <div style={{ color: C.gray400 }}>{exp.theory}</div>
                              </div>

                              {/* Expected Observations */}
                              <div style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
                                <div style={{ color: C.brand300, fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.6px', marginBottom: 2 }}>
                                  Expected Observations:
                                </div>
                                <div style={{ color: '#a7f3d0' }}>{exp.expectedObservations}</div>
                              </div>

                              {/* Viva Questions (collapsible) */}
                              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(16,160,90,0.1)' }}>
                                <button
                                  onClick={() => toggleViva(exp.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(16,160,90,0.15)',
                                    borderRadius: 7,
                                    padding: '7px 12px',
                                    color: C.brand300,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <HelpCircle size={13} />
                                    Viva Voce Questions ({exp.vivaQuestions.length})
                                  </span>
                                  <ChevronDown size={14} style={{
                                    transform: expandedViva[exp.id] ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s ease',
                                  }} />
                                </button>

                                {expandedViva[exp.id] && (
                                  <div style={{
                                    marginTop: 8,
                                    padding: '10px 14px',
                                    background: '#02180e',
                                    borderRadius: 8,
                                    border: '1px solid rgba(16,160,90,0.15)',
                                  }}>
                                    <ol style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: 11.5, lineHeight: 1.7 }}>
                                      {exp.vivaQuestions.map((q, idx) => (
                                        <li key={idx} style={{ marginBottom: 4 }}>{q}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'60px 20px',
              color: C.gray600, gap:10,
            }}>
              <Search size={34} style={{ opacity:0.4 }}/>
              <p style={{ margin:0, fontSize:14, fontWeight:500 }}>No circuits found</p>
              <p style={{ margin:0, fontSize:12 }}>Try a different search or category</p>
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(268px, 1fr))',
              gap:12,
            }}>
              {filtered.map(ex => {
                const isHov = hovered === ex.id;
                const { Icon: IconComp } = ex;
                return (
                  <div
                    key={ex.id}
                    onClick={() => handleSelect(ex.data, ex.name)}
                    onMouseEnter={() => setHovered(ex.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      borderRadius:13, overflow:'hidden', cursor:'pointer',
                      border:`1px solid`,
                      borderColor: isHov ? `${ex.accent}55` : 'rgba(16,160,90,0.1)',
                      background: isHov
                        ? `linear-gradient(145deg, rgba(5,95,54,0.22) 0%, rgba(2,44,26,0.5) 100%)`
                        : `rgba(2,44,26,0.3)`,
                      transition:'all 0.2s ease',
                      transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
                      boxShadow: isHov
                        ? `0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px ${ex.accent}30, 0 0 20px ${ex.accent}10`
                        : 'none',
                    }}
                  >
                    {/* Accent top bar */}
                    <div style={{
                      height:3,
                      background: isHov
                        ? `linear-gradient(90deg, ${ex.accent}, ${ex.accent}88)`
                        : `${ex.accent}44`,
                      transition:'all 0.2s ease',
                    }}/>

                    <div style={{ padding:'14px 15px' }}>
                      {/* Icon + badges */}
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:11 }}>
                        <div style={{
                          width:38, height:38, borderRadius:10,
                          background: `linear-gradient(135deg, ${ex.accent}cc, ${ex.accent}77)`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow: isHov ? `0 6px 14px ${ex.accent}44` : `0 3px 8px rgba(0,0,0,0.4)`,
                          transition:'box-shadow 0.2s ease',
                          flexShrink:0,
                        }}>
                          <IconComp size={18} color="#fff"/>
                        </div>

                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                          <span style={{
                            fontSize:9, fontWeight:700, padding:'2px 7px',
                            borderRadius:20, letterSpacing:'0.5px', textTransform:'uppercase',
                            background:`${ex.analysisColor}18`,
                            color: ex.analysisColor,
                            border:`1px solid ${ex.analysisColor}35`,
                          }}>
                            {ex.analysis}
                          </span>
                          <span style={{
                            fontSize:9, fontWeight:600, padding:'2px 7px',
                            borderRadius:20,
                            background:`${DIFFICULTY_COLOR[ex.difficulty]}15`,
                            color: DIFFICULTY_COLOR[ex.difficulty],
                            border:`1px solid ${DIFFICULTY_COLOR[ex.difficulty]}30`,
                          }}>
                            {ex.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        margin:'0 0 5px', fontSize:13, fontWeight:700,
                        color: isHov ? '#a7f3d0' : '#d1fae5',
                        letterSpacing:'-0.2px',
                        transition:'color 0.15s',
                      }}>
                        {ex.name}
                      </h3>

                      {/* Description */}
                      <p style={{
                        margin:'0 0 11px', fontSize:11, lineHeight:1.55,
                        color: C.gray500,
                        display:'-webkit-box',
                        WebkitLineClamp:2,
                        WebkitBoxOrient:'vertical' as any,
                        overflow:'hidden',
                      }}>
                        {ex.description}
                      </p>

                      {/* Component chips */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                        {ex.components.map(c => (
                          <span key={c} style={{
                            fontSize:10, padding:'2px 7px', borderRadius:5, fontWeight:500,
                            background:'rgba(16,160,90,0.08)',
                            color: C.brand300,
                            border:'1px solid rgba(16,160,90,0.15)',
                          }}>
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* CTA row */}
                      <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        borderTop:`1px solid rgba(16,160,90,0.1)`,
                        paddingTop:11,
                      }}>
                        <span style={{
                          fontSize:10, color: C.brand700, fontWeight:600,
                          letterSpacing:'0.3px', textTransform:'uppercase',
                        }}>
                          {ex.category}
                        </span>
                        <div style={{
                          display:'flex', alignItems:'center', gap:3,
                          fontSize:11, fontWeight:700,
                          color: isHov ? C.brand400 : C.brand700,
                          transition:'color 0.15s',
                        }}>
                          Load Circuit
                          <ChevronRight size={13} style={{
                            transform: isHov ? 'translateX(2px)' : 'none',
                            transition:'transform 0.15s',
                          }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding:'12px 26px',
          borderTop:`1px solid rgba(16,160,90,0.1)`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(2,15,8,0.4)',
          flexShrink:0,
        }}>
          <span style={{ fontSize:11, color: C.brand700, fontWeight:500 }}>
            {activeCategory === 'Lab Packs 🎓'
              ? (selectedUniversity
                  ? `${universityLabPacks.find(p => p.id === selectedUniversity)?.experiments.length || 0} experiments in ${universityLabPacks.find(p => p.id === selectedUniversity)?.universityName}`
                  : `${universityLabPacks.reduce((acc, p) => acc + p.experiments.length, 0)} experiments across 3 University Syllabi`)
              : `${filtered.length} of ${EXAMPLES.length} circuits`}
          </span>
          <span style={{ fontSize:11, color: C.brand800, fontWeight:500 }}>
            {activeCategory === 'Lab Packs 🎓' ? 'NodeSim · University Lab Packs' : 'NodeSim · Circuit Library'}
          </span>
        </div>
      </div>
    </div>
  );
}
