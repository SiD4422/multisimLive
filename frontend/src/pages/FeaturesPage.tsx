import { Zap, Activity, Waves, LineChart, Code, Layers, MousePointer2, Check, X as XIcon, Sparkles, Globe, Share2, Cpu, Users, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const C = {
  bgApp: '#f9fafb', bgCard: '#ffffff', textPrimary: '#1f2937', textSecondary: '#4b5563',
  border: '#e5e7eb', primary: '#16a34a', primaryHover: '#15803d', primaryLight: '#dcfce7',
};

const COMPARISON = [
  { feature: 'Price',                   us: 'Free forever',                     them: '~$79/yr (CircuitLab)',      usWin: true },
  { feature: 'Account Required',        us: 'No — open instantly',              them: 'Yes (mandatory signup)',    usWin: true },
  { feature: 'Simulation Engine',       us: 'ngspice WASM (real SPICE)',        them: 'Simplified non-SPICE',      usWin: true },
  { feature: 'Works Offline',           us: 'Yes — runs in browser',            them: 'No — server dependent',     usWin: true },
  { feature: 'AI Circuit Tutor',        us: '✅ Built-in Gemini AI',            them: 'None',                      usWin: true },
  { feature: 'Animated Current Flow',   us: '✅ Falstad-style moving dots',     them: 'Static wires only',         usWin: true },
  { feature: 'KiCad PCB Export',        us: '✅ .net netlist with footprints',  them: 'No PCB pipeline',           usWin: true },
  { feature: 'Community Gallery',       us: '✅ Firebase-powered gallery',      them: 'No sharing',                usWin: true },
  { feature: 'SPICE Import / Export',   us: '✅ .cir + custom .lib models',     them: 'Limited',                   usWin: true },
  { feature: 'Component Library',       us: '85+ components',                   them: '~150 (Falstad)',             usWin: false },
  { feature: 'MCU Simulation',          us: 'Not yet',                          them: 'Basic only',                usWin: false },
];

const NEW_BADGES = [
  { label: '🆕 KiCad PCB Export', color: '#7c3aed' },
  { label: '🆕 Animated Current Flow', color: '#0891b2' },
  { label: '🆕 Community Gallery', color: '#d97706' },
  { label: '🆕 85+ Components', color: '#16a34a' },
  { label: '🆕 Share via WhatsApp / LinkedIn', color: '#15803d' },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Features | NodeSim — Free Browser SPICE Simulator"
        description="NodeSim features: real ngspice WASM engine, Gemini AI tutor, KiCad PCB export, animated current flow, 85+ components, community gallery. No account required."
        url="https://nodesimapp.com/features"
      />
      <div style={{ minHeight: '100vh', backgroundColor: C.bgApp, padding: '80px 20px', color: C.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: C.primaryLight, color: C.primary, marginBottom: 24 }}>
            <Zap size={32} />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-1.5px', color: '#111827' }}>
            Everything you need to<br />simulate, learn & build
          </h1>
          <p style={{ fontSize: '1.2rem', color: C.textSecondary, maxWidth: 680, margin: '0 auto 32px', lineHeight: 1.7 }}>
            NodeSim is the only browser-based circuit simulator with a real SPICE engine, built-in AI tutor, and direct KiCad PCB export — all 100% free, no account needed.
          </p>
          {/* New feature badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {NEW_BADGES.map(b => (
              <span key={b.label} style={{ background: b.color + '15', border: `1px solid ${b.color}40`, color: b.color, padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* BENTO GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          {/* Hero card — SPICE engine */}
          <div style={{ backgroundColor: C.primary, color: '#fff', padding: '40px', borderRadius: 24, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(22,163,74,0.2)' }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 }}>Core Engine</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>100% Client-Side ngspice WASM</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.92 }}>Your browser runs the same industry-standard ngspice engine used by professional engineers — entirely offline, with zero server latency. AC, DC, and Transient analyses all run locally on your device.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                {['Transient Analysis', 'DC Operating Point', 'AC Sweep', 'Parametric Sweep'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
            <Activity size={280} color="#15803d" style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.25 }} />
          </div>

          {/* AI Tutor card */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff', padding: '32px', borderRadius: 24, boxShadow: '0 10px 30px rgba(99,102,241,0.25)', cursor: 'default', transition: 'transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, background: 'rgba(165,180,252,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Sparkles size={24} color="#a5b4fc" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Gemini AI Circuit Tutor</h3>
            <p style={{ color: '#c7d2fe', lineHeight: 1.7, fontSize: '0.95rem' }}>
              The only simulator with a built-in AI. It reads your actual simulation results — node voltages, currents, waveform data — and explains in plain English exactly why your circuit isn't working. Also generates full circuit theory explanations.
            </p>
            <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(165,180,252,0.15)', border: '1px solid rgba(165,180,252,0.3)', color: '#a5b4fc', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>Powered by Gemini 3.5</div>
          </div>

          {/* KiCad Export card */}
          <div style={{ background: 'linear-gradient(135deg, #2e1065, #4c1d95)', color: '#fff', padding: '32px', borderRadius: 24, boxShadow: '0 10px 30px rgba(124,58,237,0.25)', cursor: 'default', transition: 'transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, background: 'rgba(196,181,253,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Cpu size={24} color="#c4b5fd" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>KiCad PCB Export</h3>
            <p style={{ color: '#e9d5ff', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Simulate in NodeSim, manufacture in KiCad. Export a complete <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>.net</code> netlist with real PCB footprints pre-assigned — DIP-8 for op-amps, TO-92 for transistors, DO-35 for diodes. Import into KiCad and start routing immediately.
            </p>
            <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(196,181,253,0.15)', border: '1px solid rgba(196,181,253,0.3)', color: '#c4b5fd', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>🆕 New Feature</div>
          </div>

          {/* Animated Current Flow */}
          <div style={{ background: 'linear-gradient(135deg, #083344, #0e7490)', color: '#fff', padding: '32px', borderRadius: 24, boxShadow: '0 10px 30px rgba(8,51,68,0.3)', cursor: 'default', transition: 'transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, background: 'rgba(103,232,249,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Waves size={24} color="#67e8f9" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Animated Current Flow</h3>
            <p style={{ color: '#a5f3fc', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Toggle "Flow" mode after simulation to see Falstad-style animated dots flowing through wires. Green dots flow in the direction of conventional current, with speed proportional to actual node voltage — making abstract SPICE results visual and intuitive.
            </p>
            <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(103,232,249,0.15)', border: '1px solid rgba(103,232,249,0.3)', color: '#67e8f9', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>🆕 New Feature</div>
          </div>

          {/* Component Library */}
          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#fef3c7', color: '#d97706', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Layers size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>85+ Component Library</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.7 }}>
              Resistors, capacitors, BJTs, MOSFETs, IGBTs, op-amps, logic gates, flip-flops, 555 timer, optocouplers, SCR thyristors, LDR, varistors, TVS diodes, varactors, voltage regulators (7805, 7809, AMS1117), and more — growing every week.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Basic', 'Analog', 'Digital', 'Power', 'Sensors', 'ICs'].map(cat => (
                <span key={cat} style={{ background: '#fef9c3', color: '#a16207', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{cat}</span>
              ))}
            </div>
          </div>

          {/* Community Gallery */}
          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#fce7f3', color: '#db2777', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Users size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Community Circuit Gallery</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.7 }}>
              Build something cool? Publish it to the community gallery with one click. Browse circuits shared by other engineers and students, open any of them in the simulator instantly — no download, no account needed.
            </p>
          </div>

          {/* Smart Wire Routing — wide card */}
          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, gridColumn: 'auto / span 2', display: 'flex', gap: 28, alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ flex: 1 }}>
              <div style={{ width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><MousePointer2 size={24} /></div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 12 }}>Smart Wire Routing</h3>
              <p style={{ color: C.textSecondary, lineHeight: 1.7, fontSize: '1.05rem' }}>Wires snap to grid, auto-route cleanly around components, and visually encode voltage via color heatmaps. The animated current flow overlay makes SPICE data tangible for visual learners.</p>
            </div>
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 16, minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: 36 }}>⚡</span>
              <span style={{ color: '#15803d', fontWeight: 700, fontSize: 13 }}>Live Voltage + Current Animation</span>
              <span style={{ color: '#6b7280', fontSize: 11 }}>After simulation, toggle "Flow" mode</span>
            </div>
          </div>

          {/* Share + SPICE */}
          <div style={{ backgroundColor: '#111827', color: '#fff', padding: '32px', borderRadius: 24, transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#374151', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Share2 size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 10 }}>Share Anywhere</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.7 }}>Generate a compressed shareable link and share your exact circuit to WhatsApp, Twitter, or LinkedIn — anyone who opens it sees your circuit loaded instantly, no account needed.</p>
          </div>

          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><FileCode size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Full SPICE Netlist Control</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.7 }}>Import/export <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: '0.85em' }}>.cir</code> netlists, load custom SPICE <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: '0.85em' }}>.lib</code> model files for any manufacturer component, and view the raw SPICE netlist update live as you draw.</p>
          </div>

          <div style={{ backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`, transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><LineChart size={24} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10 }}>Live Oscilloscope Grapher</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.7 }}>Oscilloscope-style waveform viewer with measurement cursors. Plot multiple channels, zoom in on glitches, export as PNG or CSV — all in the browser with zero plugins.</p>
          </div>

        </div>

        {/* COMPARISON TABLE */}
        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.primary, marginBottom: 10 }}>Honest Comparison</p>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 10px' }}>NodeSim vs. The Alternatives</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              NI Multisim Live shut down on September 15, 2026. NodeSim is the open successor.
            </p>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${C.border}`, maxWidth: 900, margin: '0 auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NodeSim <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '2px 8px', fontSize: '0.7rem', marginLeft: 4 }}>Free</span></th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Falstad / CircuitLab</th>
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
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>No account. No download. No credit card.</p>
          <button
            onClick={() => navigate('/simulator')}
            style={{ backgroundColor: C.primary, color: '#fff', padding: '16px 44px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(22,163,74,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(22,163,74,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(22,163,74,0.4)'; }}
          >
            Launch NodeSim Free →
          </button>
        </div>

      </div>
    </div>
    </>
  );
}
