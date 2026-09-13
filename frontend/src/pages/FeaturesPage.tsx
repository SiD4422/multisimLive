import { Zap, Activity, Waves, LineChart, Code, Layers, MousePointer2, Check, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const C = {
  bgApp: '#f9fafb', bgCard: '#ffffff', textPrimary: '#1f2937', textSecondary: '#4b5563',
  border: '#e5e7eb', primary: '#16a34a', primaryHover: '#15803d', primaryLight: '#dcfce7',
};

const COMPARISON = [
  { feature: 'Price', us: 'Free forever', them: 'Freemium ($60–$300+/yr)', usWin: true },
  { feature: 'Account Required', us: 'No', them: 'Yes (mandatory)', usWin: true },
  { feature: 'Simulation Engine', us: 'Client-side ngspice WASM', them: 'Server-side cloud', usWin: true },
  { feature: 'Works Offline', us: 'Yes', them: 'No', usWin: true },
  { feature: 'AI Circuit Explainer', us: 'Built-in (Gemini)', them: 'None', usWin: true },
  { feature: 'Wire Voltage Heatmaps', us: 'Yes — live animation', them: 'No — static wires', usWin: true },
  { feature: 'SPICE Import / Export', us: '.cir import & export', them: 'Limited in free tier', usWin: true },
  { feature: 'Component Library', us: '60+ components', them: 'Thousands (vendor models)', usWin: false },
  { feature: 'Enterprise Support', us: 'Community / Open Source', them: 'Official NI support', usWin: false },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgApp, padding: '80px 20px', color: C.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: C.primaryLight, color: C.primary, marginBottom: 24 }}>
            <Zap size={32} />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-1.5px', color: '#111827' }}>
            Next-Gen Circuit Simulation
          </h1>
          <p style={{ fontSize: '1.25rem', color: C.textSecondary, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            NodeSim brings the power of industry-standard SPICE simulation directly to your browser. Professional-grade circuit design — 100% free, no account needed.
          </p>
        </div>

        {/* BENTO GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', gridAutoRows: 'minmax(250px, auto)' }}>

          <div style={{ backgroundColor: C.primary, color: '#fff', padding: '40px', borderRadius: 24, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(22,163,74,0.2)' }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 20 }}>100% Client-Side SPICE</h2>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9 }}>Powered by a compiled WebAssembly version of ngspice. No servers, no latency, no waiting. Your browser executes complex mathematical component models in real-time.</p>
            </div>
            <Activity size={300} color="#15803d" style={{ position: 'absolute', right: '-50px', bottom: '-50px', opacity: 0.3 }} />
          </div>

          {[
            { bg: '#f3e8ff', ic: '#9333ea', Icon: LineChart, title: 'Live Oscilloscope', desc: "Toggle 'Scope Mode' on the grapher for a dark-themed neon-trace oscilloscope with point-and-click measurement cursors." },
            { bg: '#e0f2fe', ic: '#0284c7', Icon: Waves, title: 'AC & DC Sweeps', desc: 'Sweep frequency ranges for Bode plots, or sweep DC voltages to analyze transistor characteristics and I-V curves instantly.' },
            { bg: '#fef3c7', ic: '#d97706', Icon: Layers, title: '60+ Component Library', desc: 'From basic RLC to Op-Amps, MOSFETs, Logic Gates, Flip-Flops, 555 Timer, Seven-Segment Displays and more.' },
          ].map(f => (
            <div key={f.title} style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
              <div style={{ width: 48, height: 48, backgroundColor: f.bg, color: f.ic, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><f.Icon size={24} /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}

          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, gridColumn: 'auto / span 2', display: 'flex', gap: 24, alignItems: 'center', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ flex: 1 }}>
              <div style={{ width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><MousePointer2 size={24} /></div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 12 }}>Smart Wire Routing</h3>
              <p style={{ color: C.textSecondary, lineHeight: 1.6, fontSize: '1.1rem' }}>A* pathfinding auto-routes wires around components. Live voltage heatmaps and animated current dots show what's happening in real-time.</p>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', gap: 10 }}>
              <span style={{ fontSize: 40 }}>⚡</span>
              <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>Live Wire Voltage Animation</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', color: '#fff', padding: '32px', borderRadius: 24, transition: 'transform 0.3s', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#374151', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Code size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Raw SPICE Netlists</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>The 'Code' panel updates your raw SPICE netlist in real-time as you draw. Import/export .cir files and learn the engine as you build.</p>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.primary, marginBottom: 10 }}>Honest Comparison</p>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 10px' }}>NodeSim vs. NI Multisim Live</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>We win where it counts for students and engineers.</p>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${C.border}`, maxWidth: 860, margin: '0 auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NodeSim <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '2px 8px', fontSize: '0.7rem', marginLeft: 4 }}>Free</span></th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NI Multisim Live</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>{row.feature}</td>
                    <td style={{ padding: '13px 20px', fontSize: '0.92rem', fontWeight: row.usWin ? 500 : 400, background: row.usWin ? '#f0fdf4' : 'transparent' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: row.usWin ? '#15803d' : '#475569' }}>
                        {row.usWin && <Check size={14} color="#16a34a" />}
                        {row.us}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: '0.92rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {row.usWin && <XIcon size={13} color="#ef4444" style={{ opacity: 0.6 }} />}
                        {!row.usWin && <Check size={14} color="#6b7280" />}
                        {row.them}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <button
            onClick={() => navigate('/simulator')}
            style={{ backgroundColor: C.primary, color: '#fff', padding: '16px 40px', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(22,163,74,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(22,163,74,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(22,163,74,0.4)'; }}
          >
            Launch NodeSim Free →
          </button>
        </div>

      </div>
    </div>
  );
}
