import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, Zap, Cpu, Activity, Waves,
  Filter, TrendingUp, GitMerge, Radio, Sliders, ArrowUpDown,
  ToggleRight, Layers, GitBranch, Triangle
} from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

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

// Site Light Theme Palette
const C = {
  bgApp: '#f9fafb',        // Page bg
  bgCard: '#ffffff',       // Card bg
  textPrimary: '#1f2937',  // Main text
  textSecondary: '#4b5563',// Subtitles
  textMuted: '#9ca3af',    // Muted
  border: '#e5e7eb',       // Subtle borders
  
  // Accents matching the site's Green theme (#15803d, #16a34a)
  primary: '#16a34a',
  primaryHover: '#15803d',
  primaryLight: '#dcfce7',
  
  // Specific Analysis Colors
  acSweep: '#0ea5e9',
  transient: '#16a34a',
  dcSweep: '#f59e0b'
};

const CATEGORIES = ['All', 'Filters', 'Rectifiers', 'Amplifiers', 'Power', 'Switching', 'Sources'];

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

  // ── SOURCES ────────────────────────────────────────────────────
  { id: '555', name: '555 Astable Oscillator', category: 'Sources', description: '555 timer in astable mode generates a continuous square wave at adjustable frequency.', analysis: 'Transient', analysisColor: C.transient, difficulty: 'Intermediate', components: ['Transistor Amplifier', 'RC Network'], Icon: Cpu, accent: '#e11d48', data: astable555 },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#16a34a',
  Intermediate: '#d97706',
  Advanced: '#dc2626',
};

import SEO from '../components/SEO';

export default function CircuitsPage() {
  const navigate = useNavigate();
  const importState = useSchematicStore(s => s.importState);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = EXAMPLES.filter(ex => {
    const matchCat = activeCategory === 'All' || ex.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || ex.name.toLowerCase().includes(q)
      || ex.description.toLowerCase().includes(q)
      || ex.components.some(c => c.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });



  return (
    <>
      <SEO 
        title="Example Circuits | NodeSim" 
        description="Browse our library of pre-built circuit templates including 555 timers, op-amps, filters, and rectifiers. Load them instantly into the NodeSim circuit simulator."
        url="https://nodesimapp.com/circuits"
      />
      <div style={{
        minHeight: '100vh',
        backgroundColor: C.bgApp,
      padding: '80px 20px 60px',
      color: C.textPrimary,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: C.primaryLight,
            color: C.primary,
            marginBottom: 20,
          }}>
            <Layers size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 16px' }}>
            Circuit Library
          </h1>
          <p style={{ fontSize: '1.1rem', color: C.textSecondary, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Explore our collection of fully functional, simulation-ready electronic circuits. Click any card to load it directly into the MultiSimLab simulator.
          </p>
        </div>

        {/* ── Search & Filters ── */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 32,
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, component…"
              style={{
                width: '100%', padding: '12px 16px 12px 46px',
                backgroundColor: C.bgApp,
                border: `1px solid ${C.border}`,
                borderRadius: 12, color: C.textPrimary, fontSize: 15,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => {
                e.target.style.borderColor = C.primary;
              }}
              onBlur={e => {
                e.target.style.borderColor = C.border;
              }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: isActive ? C.primary : 'transparent',
                    color: isActive ? '#fff' : C.textSecondary,
                    border: `1px solid ${isActive ? C.primary : C.border}`,
                    boxShadow: isActive ? `0 4px 14px rgba(22,163,74,0.3)` : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = C.bgApp;
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '100px 20px',
            color: C.textMuted, gap: 16,
          }}>
            <Search size={48} />
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>No circuits found</p>
            <p style={{ margin: 0, fontSize: 16 }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(ex => {
              const isHov = hovered === ex.id;
              const { Icon: IconComp } = ex;
              return (
                <div
                  key={ex.id}
                  onClick={() => navigate(`/circuits/${ex.id}`)}
                  onMouseEnter={() => setHovered(ex.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    border: `1px solid ${isHov ? ex.accent : C.border}`,
                    backgroundColor: C.bgCard,
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: isHov ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHov
                      ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${ex.accent}20`
                      : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* Accent top bar */}
                  <div style={{
                    height: 5,
                    backgroundColor: ex.accent,
                    opacity: isHov ? 1 : 0.8,
                    transition: 'all 0.3s ease',
                  }} />

                  <div style={{ padding: '24px' }}>
                    {/* Icon + badges */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        backgroundColor: `${ex.accent}15`,
                        color: ex.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.3s ease, background-color 0.3s ease',
                        transform: isHov ? 'scale(1.05)' : 'scale(1)',
                        flexShrink: 0,
                      }}>
                        <IconComp size={24} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 9px',
                          borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase',
                          background: `${ex.analysisColor}15`,
                          color: ex.analysisColor,
                          border: `1px solid ${ex.analysisColor}30`,
                        }}>
                          {ex.analysis}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 9px',
                          borderRadius: 20,
                          background: `${DIFFICULTY_COLOR[ex.difficulty]}15`,
                          color: DIFFICULTY_COLOR[ex.difficulty],
                          border: `1px solid ${DIFFICULTY_COLOR[ex.difficulty]}30`,
                        }}>
                          {ex.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      margin: '0 0 8px', fontSize: 18, fontWeight: 700,
                      color: C.textPrimary,
                      letterSpacing: '-0.3px',
                    }}>
                      {ex.name}
                    </h3>

                    {/* Description */}
                    <p style={{
                      margin: '0 0 16px', fontSize: 13, lineHeight: 1.6,
                      color: C.textSecondary,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                      overflow: 'hidden',
                      height: 42,
                    }}>
                      {ex.description}
                    </p>

                    {/* Component chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {ex.components.map(c => (
                        <span key={c} style={{
                          fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 500,
                          backgroundColor: C.bgApp,
                          color: C.textSecondary,
                          border: `1px solid ${C.border}`,
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* CTA row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: 16,
                    }}>
                      <span style={{
                        fontSize: 12, color: C.textMuted, fontWeight: 600,
                        letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}>
                        {ex.category}
                      </span>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 13, fontWeight: 700,
                        color: isHov ? ex.accent : C.textSecondary,
                        transition: 'color 0.2s',
                      }}>
                        Open in Simulator
                        <ChevronRight size={16} style={{
                          transform: isHov ? 'translateX(4px)' : 'none',
                          transition: 'transform 0.2s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// Trigger HMR 1
