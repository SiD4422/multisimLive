import { useState, useEffect, useRef } from 'react';
import {
  X, Search, ChevronRight, Zap, Cpu, Activity, Waves,
  Filter, TrendingUp, GitMerge, Radio, Sliders, ArrowUpDown,
  ToggleRight, Layers, GitBranch, Triangle
} from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

// ── Imports (existing) ──────────────────────────────────────────────────────
import lowPassFilter        from '../examples/low_pass_filter.json';
import rcHighPassFilter     from '../examples/rc_high_pass_filter.json';
import bridgeRectifier      from '../examples/bridge_rectifier.json';
import halfWaveRectifier    from '../examples/half_wave_rectifier.json';
import invertingOpamp       from '../examples/inverting_opamp.json';
import astable555           from '../examples/astable_555.json';
import voltageDivider       from '../examples/voltage_divider.json';
import voltageDividerFixed  from '../examples/voltage_divider_fixed.json';
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

const CATEGORIES = ['All', 'Filters', 'Rectifiers', 'Amplifiers', 'Power', 'Switching', 'Sources'];

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
    id: 'c1_fixed',
    name: 'Voltage Divider (Fixed)',
    category: 'Power',
    description: 'Perfectly wired resistive voltage divider, bypassing browser cache.',
    analysis: 'DC Sweep', analysisColor: C.warning,
    difficulty: 'Beginner',
    components: ['2x Resistors', 'DC Source'],
    Icon: Filter,
    accent: '#059669',
    data: voltageDividerFixed,
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
  const { components, importState } = useSchematicStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
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

  const filtered = EXAMPLES.filter(ex => {
    const matchCat   = activeCategory === 'All' || ex.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || ex.name.toLowerCase().includes(q)
      || ex.description.toLowerCase().includes(q)
      || ex.components.some(c => c.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleSelect = (data: any, name: string) => {
    // Some embedded preview environments block window.confirm which silently aborts the load
    // We will just directly load the circuit
    console.log(`Loading circuit: ${name}`);
    importState(JSON.stringify(data));
    onClose();
  };

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
                    Circuit Library
                  </h2>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                    background:`rgba(16,160,90,0.15)`, color: C.brand300,
                    border:`1px solid rgba(16,160,90,0.3)`,
                    letterSpacing:'0.6px', textTransform:'uppercase',
                  }}>
                    {EXAMPLES.length} circuits
                  </span>
                </div>
                <p style={{ margin:0, fontSize:12, color: C.gray500, marginTop:2 }}>
                  Click any card to instantly load a simulation-ready circuit
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
                placeholder="Search by name, component…"
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
                      cursor:'pointer', border:'none', transition:'all 0.15s ease',
                      fontFamily:'inherit',
                      background: isActive
                        ? `linear-gradient(135deg, ${C.brand600}, ${C.brand500})`
                        : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#fff' : C.gray500,
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

        {/* ── Grid ── */}
        <div style={{ overflowY:'auto', padding:'18px 26px 26px', flex:1 }}>
          {filtered.length === 0 ? (
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
            {filtered.length} of {EXAMPLES.length} circuits
          </span>
          <span style={{ fontSize:11, color: C.brand800, fontWeight:500 }}>
            MultiSimLab · Circuit Library
          </span>
        </div>
      </div>
    </div>
  );
}

// Trigger HMR 1

// Trigger HMR
