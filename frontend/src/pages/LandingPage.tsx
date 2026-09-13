import { Link } from 'react-router-dom';
import {
  Play, Zap, Cpu, BarChart2, Globe, BookOpen,
  Check, X as XIcon, MousePointer2, Share2, Download
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={22} />,
    color: '#dcfce7',
    iconColor: '#16a34a',
    title: '100% Client-Side SPICE',
    desc: 'Runs entirely in your browser via WebAssembly. No servers, no queues, no waiting. Simulate complex circuits in milliseconds.',
  },
  {
    icon: <BarChart2 size={22} />,
    color: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Professional Grapher',
    desc: 'Transient, AC Bode plot, DC sweep, and FFT analysis. Measurement cursors, PNG/CSV export, and oscilloscope dark mode.',
  },
  {
    icon: <Cpu size={22} />,
    color: '#dbeafe',
    iconColor: '#2563eb',
    title: '60+ Component Library',
    desc: 'Resistors, capacitors, MOSFETs, Op-Amps, 555 timer, logic gates, flip-flops, seven-segment displays and more.',
  },
  {
    icon: <MousePointer2 size={22} />,
    color: '#fef3c7',
    iconColor: '#d97706',
    title: 'Smart Wire Routing',
    desc: 'A* pathfinding auto-routes wires cleanly around components. Wires rubber-band when you move parts.',
  },
  {
    icon: <Share2 size={22} />,
    color: '#fce7f3',
    iconColor: '#db2777',
    title: 'Instant Sharing',
    desc: 'Share any circuit with a single URL. Circuits are compressed into the link — no database, no account required.',
  },
  {
    icon: <Globe size={22} />,
    color: '#e0f2fe',
    iconColor: '#0284c7',
    title: 'AI Circuit Explainer',
    desc: 'Built-in Gemini AI explains how your circuit works, identifies issues, and suggests improvements in plain English.',
  },
];

const COMPARISON = [
  { feature: 'Price', us: 'Free forever', them: 'Freemium ($60–$300+/yr)', usWin: true },
  { feature: 'Account Required', us: 'No', them: 'Yes (mandatory)', usWin: true },
  { feature: 'Simulation Engine', us: 'Client-side ngspice WASM', them: 'Server-side cloud', usWin: true },
  { feature: 'Offline Support', us: 'Yes — works without internet', them: 'No — requires connection', usWin: true },
  { feature: 'AI Explainer', us: 'Built-in (Gemini)', them: 'None', usWin: true },
  { feature: 'Wire Voltage Heatmaps', us: 'Yes — live animation', them: 'No — static wires', usWin: true },
  { feature: 'SPICE Import / Export', us: '.cir import & export', them: 'Limited in free tier', usWin: true },
  { feature: 'Component Library', us: '60+ components', them: 'Thousands (vendor models)', usWin: false },
  { feature: 'Enterprise Support', us: 'Community (open source)', them: 'Official NI support', usWin: false },
];

const STATS = [
  { value: '60+', label: 'Components' },
  { value: '7', label: 'Analysis Types' },
  { value: '0ms', label: 'Setup Time' },
  { value: '100%', label: 'Free — Always' },
];

export default function LandingPage() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Free &amp; Open Source — No Account Needed
          </div>

          <h1>
            The Modern<br />
            <span>Circuit Simulator.</span>
          </h1>
          <p>
            Design, simulate, and analyze electronic circuits entirely in your browser.
            Powered by ngspice WASM — the same engine used by professional EDA tools.
          </p>
          <div className="hero-buttons">
            <Link to="/simulator" className="cta-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2.2rem', fontSize: '1.1rem' }}>
              <Play size={20} fill="currentColor" /> Launch Simulator Free
            </Link>
            <Link to="/features" className="secondary-button">
              See All Features
            </Link>
          </div>

          {/* Stats Strip */}
          <div className="stats-strip">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────────────── */}
      <section className="features" id="features">
        <div className="section-header">
          <p className="section-eyebrow">Why NodeSim?</p>
          <h2>Everything you need.<br />Nothing you don't.</h2>
          <p>Professional-grade simulation tools, completely free — right in your browser.</p>
        </div>

        <div className="features-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: f.color, color: f.iconColor }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ────────────────────────────────── */}
      <section className="comparison-section">
        <div className="section-header">
          <p className="section-eyebrow">Honest Comparison</p>
          <h2>NodeSim vs. NI Multisim Live</h2>
          <p>See exactly where we beat the paid competition — and where they still lead.</p>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="col-us">NodeSim <span className="badge-free">Free</span></th>
                <th className="col-them">NI Multisim Live</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <td className="feature-name">{row.feature}</td>
                  <td className={`col-us ${row.usWin ? 'win' : ''}`}>
                    {row.usWin && <Check size={15} style={{ marginRight: 6, flexShrink: 0, color: '#16a34a' }} />}
                    {row.us}
                  </td>
                  <td className={`col-them ${!row.usWin ? 'them-win' : ''}`}>
                    {!row.usWin && <Check size={15} style={{ marginRight: 6, flexShrink: 0, color: '#6b7280' }} />}
                    {row.usWin && <XIcon size={14} style={{ marginRight: 6, flexShrink: 0, color: '#ef4444', opacity: 0.7 }} />}
                    {row.them}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="how-section">
        <div className="section-header">
          <p className="section-eyebrow">Get Started in Seconds</p>
          <h2>No setup. Just simulate.</h2>
        </div>

        <div className="how-steps">
          {[
            { n: '1', title: 'Open the Simulator', desc: 'No install, no account. Click "Launch Simulator" and you are instantly on the canvas.' },
            { n: '2', title: 'Place Components', desc: 'Drag resistors, capacitors, op-amps, MOSFETs and more from the component sidebar onto the canvas.' },
            { n: '3', title: 'Draw Wires', desc: 'Click pins to connect components. The smart A* router draws clean orthogonal paths automatically.' },
            { n: '4', title: 'Run & Analyze', desc: 'Click Run to execute ngspice SPICE simulation. Watch voltage heatmaps animate live on your wires.' },
          ].map((step) => (
            <div key={step.n} className="how-step">
              <div className="how-step-num">{step.n}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <Download size={40} color="#16a34a" style={{ marginBottom: 16 }} />
          <h2>Start simulating — right now.</h2>
          <p>Free. No account. No download. Works on any device with a browser.</p>
          <Link to="/simulator" className="cta-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', fontSize: '1.15rem', marginTop: 8 }}>
            <Play size={20} fill="currentColor" /> Launch NodeSim Free
          </Link>
          <div className="cta-note">
            <BookOpen size={14} />
            New to SPICE? <Link to="/procedure" style={{ color: '#16a34a', textDecoration: 'underline' }}>Read the beginner's guide →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
