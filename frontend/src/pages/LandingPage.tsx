import './LandingPage.css';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/useTheme';
import { Sun, Moon, Sliders, Play, Activity, Check, Minus } from 'lucide-react';
import LandingInteractiveDemo from '../components/LandingInteractiveDemo';

const LANDING_FAQS = [
  {
    question: "Is NodeSim completely free to use?",
    answer: "Yes, NodeSim is 100% free with zero paywalls, no subscription, and no account required. All 250+ SPICE & behavioral models and ngspice simulation engines run entirely in your web browser."
  },
  {
    question: "How does NodeSim compare to NI Multisim Live?",
    answer: "NodeSim is a fast, free alternative to NI Multisim Live powered by ngspice WebAssembly for analog, power, digital logic gate, and IC SPICE simulation — featuring 250+ simulated models, interactive waveform graphers, AI circuit debugging, KiCad export, and PDF lab report export without login."
  },
  {
    question: "Does NodeSim require any software download or installation?",
    answer: "No. NodeSim is a browser-based circuit simulator that runs 100% client-side in Chrome, Firefox, Safari, and Edge across Windows, macOS, Linux, ChromeOS, and iPadOS."
  },
  {
    question: "What SPICE simulation analyses does NodeSim support?",
    answer: "NodeSim supports Transient Analysis (time-domain oscilloscope waveforms), AC Sweep (frequency response and Bode plots), DC Sweep (IV characteristic curves), and DC Operating Point calculations."
  },
  {
    question: "Can I export lab reports and circuit schematics?",
    answer: "Yes. You can export complete academic PDF lab reports with waveform plots, export standard SPICE netlists (.cir), export KiCad netlists (.net), and download PNG or CSV data with a single click."
  },
  {
    question: "Does NodeSim use real SPICE math or simplified logic?",
    answer: "NodeSim compiles industry-standard ngspice directly to WebAssembly, solving full Modified Nodal Analysis (MNA) matrices locally on your CPU rather than simplified approximations."
  },
  {
    question: "Do I need an account to build or share circuits?",
    answer: "No account is needed. You can design schematics, run simulations, generate shareable circuit links, and download reports immediately without signing up."
  }
];

const POPULAR_CIRCUITS = [
  { to: '/circuits/rc-low-pass-filter', title: 'RC Low-Pass Filter', tag: 'AC Sweep', desc: 'Compute −3dB cutoff fc = 1/(2πRC) and inspect Bode magnitude roll-off.' },
  { to: '/circuits/inverting-op-amp', title: 'Inverting Op-Amp', tag: 'Transient', desc: 'Verify closed-loop gain Av = −Rf/Rin, phase inversion, and rail clipping.' },
  { to: '/circuits/555-timer-astable', title: '555 Timer Astable', tag: 'Oscillator', desc: 'Simulate square-wave clock duty cycle, frequency, and capacitor charge curves.' },
  { to: '/circuits/rlc-resonance', title: 'RLC Resonance Tank', tag: 'AC Sweep', desc: 'Find resonant frequency peak, Q factor bandwidth, and phase angle response.' },
  { to: '/circuits/full-wave-rectifier', title: 'Bridge Rectifier + Filter', tag: 'Power', desc: 'Compare ripple voltage across smoothing capacitors under variable load.' },
  { to: '/circuits/buck-converter', title: 'PWM Buck Converter', tag: 'Power', desc: 'Analyze step-down switching ripple, inductor current, and duty ratio D.' },
  { to: '/circuits/common-emitter-amplifier', title: 'Common-Emitter BJT Amp', tag: 'Analog', desc: 'Inspect DC Q-point biasing, small-signal voltage gain, and waveform distortion.' },
  { to: '/circuits/mosfet-switch', title: 'N-MOSFET Digital Switch', tag: 'Switching', desc: 'Test gate threshold Vgs, drain current saturation, and inductive switching.' },
];

const COMPARISON_ROWS = [
  { feature: 'Pricing', nodesim: '100% Free forever', multisim: 'Freemium / Paid license', ltspice: 'Free (Desktop only)', falstad: 'Free' },
  { feature: 'Runs in Browser', nodesim: 'Yes (Zero install)', multisim: 'Legacy / Discontinued', ltspice: 'No (Windows/macOS app)', falstad: 'Yes' },
  { feature: 'Account Required', nodesim: 'No', multisim: 'Yes (Required)', ltspice: 'No', falstad: 'No' },
  { feature: 'Simulation Engine', nodesim: 'Real ngspice (WASM)', multisim: 'SPICE (Server)', ltspice: 'Proprietary SPICE', falstad: 'Simplified solver' },
  { feature: 'Component Library', nodesim: '250+ SPICE & Behavioral ICs', multisim: 'Limited on free tier', ltspice: 'Analog Devices focused', falstad: '~150 basic parts' },
  { feature: 'AI Debugging & PDF Lab Reports', nodesim: 'Built-in + IEEE PDF export', multisim: 'None', ltspice: 'None', falstad: 'None' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <SEO 
        title="Free Online Circuit Simulator & Multisim Alternative | NodeSim"
        description="Run real SPICE circuit simulations in your browser. Analog, power, digital gate, and IC simulation with 250+ models, live waveform grapher, and AI tutor. Zero install."
        url="https://www.nodesimapp.com/"
        canonical="https://www.nodesimapp.com/"
        faqs={LANDING_FAQS}
      />

      {/* SVG gradient definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="nGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3FCB8C" />
            <stop offset="1" stopColor="#08794B" />
          </linearGradient>
        </defs>
      </svg>

      <a className="skip-link" href="#main">Skip to content</a>

      {/* ─── NAVBAR: ORIGINAL DESIGN WITH HIGH-CONTRAST LOGO ─── */}
      <header className="msl-site-header">
        <div className="msl-container msl-nav-row">
          <Link className="msl-brand" to="/" aria-label="NodeSim home" style={{ textDecoration: 'none' }}>
            <img src={theme === 'light' ? '/logo_main_transparent.png' : '/logo_sim.png'} alt="NodeSim Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </Link>

          <nav className="msl-nav-links" aria-label="Primary" style={{ justifyContent: 'center' }}>
            <Link to="/" className="active">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/educators">Educators</Link>
            <Link to="/about">About</Link>
            <Link to="/circuits">Circuits</Link>
            <Link to="/resources">Resources</Link>
            {/* Learn dropdown */}
            <div style={{ position: 'relative', display: 'inline-block', paddingBottom: '12px' }} onMouseEnter={e => { const m = e.currentTarget.querySelector('.lp-learn-menu') as HTMLElement; if (m) m.style.display = 'block'; }} onMouseLeave={e => { const m = e.currentTarget.querySelector('.lp-learn-menu') as HTMLElement; if (m) m.style.display = 'none'; }}>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Learn <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg></span>
              <div className="lp-learn-menu" style={{ display: 'none', position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#0d2818', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 0', minWidth: '220px', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.45)', marginTop: '0' }}>
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Community</div>
                <a href="https://www.youtube.com/@NODESIM-simulation" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">YouTube Channel</a>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Inspiration</div>
                <Link to="/showcase" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Video Showcase</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tutorials</div>
                <Link to="/tutorials/rc-circuit" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">RC Circuit</Link>
                <Link to="/tutorials/op-amp" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Op-Amp Amplifier</Link>
                <Link to="/tutorials/555-timer" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">555 Timer</Link>
                <Link to="/tutorials/transistor-amplifier" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Transistor Amplifier</Link>
                <Link to="/tutorials/rlc-circuit" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">RLC Circuit</Link>
                <Link to="/tutorials/diode-rectifier" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Diode Rectifier</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comparisons</div>
                <Link to="/compare/ltspice" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs LTspice</Link>
                <Link to="/compare/falstad" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs Falstad</Link>
                <Link to="/compare/multisim" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs Multisim</Link>
              </div>
            </div>
          </nav>

          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                marginRight: 4
              }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link to="/simulator" className="msl-btn msl-btn-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z" /></svg>
              Launch Simulator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>

            <button className="hamburger" id="hamburgerBtn" aria-label="Menu" aria-expanded="false" aria-controls="mobilePanel"
              onClick={(e) => {
                const panel = document.getElementById('mobilePanel');
                const btn = e.currentTarget as HTMLButtonElement;
                const open = panel?.classList.toggle('open');
                btn.classList.toggle('open', !!open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
              }}
            >
              <svg className="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </div>

        <div className="mobile-panel" id="mobilePanel">
          <div className="mp-links">
            <Link to="/" className="active">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/educators">Educators</Link>
            <Link to="/about">About</Link>
            <Link to="/circuits">Circuits</Link>
            <Link to="/showcase">Video Showcase</Link>
            <Link to="/resources">Resources</Link>
          </div>
          <div className="mp-actions">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                marginRight: 8
              }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link className="msl-btn msl-btn-primary" to="/simulator">Launch Simulator</Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ─── HERO WITH LIVE INTERACTIVE CIRCUIT DEMO ─── */}
        <section className="msl-hero" id="top">
          <div className="msl-container msl-hero-grid">
            <div className="msl-hero-copy">
              <span className="msl-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
                FREE • OPEN SOURCE • NO ACCOUNT NEEDED
              </span>

              <h1>Free Online SPICE<br />Circuit Simulator <span className="accent">&amp; Multisim Alternative</span></h1>

              <p className="lede">Analog, power, digital gate, and IC SPICE simulation for ECE/EEE students — running locally in your browser with 250+ SPICE &amp; behavioral models, waveform grapher, and AI tutor. Zero install, 100% free.</p>

              <div className="msl-hero-ctas">
                <Link className="msl-btn msl-btn-primary msl-btn-lg" to="/simulator">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z" /></svg>
                  Launch Simulator
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
                <Link className="msl-btn msl-btn-text" to="/circuits">Browse 24+ Circuits</Link>
              </div>

              <div className="benefits">
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg></span>
                  <div><h4>100% Free</h4><p>No paywalls</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg></span>
                  <div><h4>No Account</h4><p>Start instantly</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8.4" /><path d="M3.6 12h16.8M12 3.6c2.5 2.6 2.5 15.4 0 17M12 3.6c-2.5 2.6-2.5 15.4 0 17" /></svg></span>
                  <div><h4>Browser Based</h4><p>Works offline</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="7" width="10" height="10" rx="1.6" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></svg></span>
                  <div><h4>Powered by ngspice</h4><p>Real SPICE math</p></div>
                </div>
              </div>
            </div>

            <div className="sim-stage">
              <div className="sim-glow" aria-hidden="true"></div>
              <div className="float-pill pill-top">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="7" width="10" height="10" rx="1.6" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></svg>
                Powered by ngspice WASM
              </div>
              <p className="hand-note note-top">
                <svg width="46" height="34" viewBox="0 0 46 34" fill="none"><path d="M40 4C30 2 14 8 6 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M2 20 5 28 12 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Try the sliders!<br />Updates live.
              </p>

              <LandingInteractiveDemo />

              <p className="hand-note note-bottom">
                Ideas to<br />Insights
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none"><path d="M4 26C14 30 28 22 36 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M39 12 36 4 29 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </p>
            </div>
          </div>
        </section>

        {/* ─── TRUST BAR ─── */}
        <section className="trust">
          <div className="msl-container msl-trust-inner">
            <div style={{ flex: 1 }}>
              <p className="msl-trust-label">Proof of Performance</p>
              <ul className="msl-trust-logos">
                <li><span style={{ color: '#16a34a' }}>~42ms</span> Avg Simulation Time</li>
                <li><span style={{ color: '#16a34a' }}>100%</span> Client-Side Execution</li>
                <li><span style={{ color: '#16a34a' }}>250+</span> SPICE &amp; Behavioral Models</li>
              </ul>
            </div>
            <div style={{ flex: 1, paddingLeft: '40px', borderLeft: '1px solid var(--line)' }}>
              <p className="msl-trust-label">The SPICE Moat</p>
              <p style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500, lineHeight: 1.5, margin: '0 0 8px' }}>
                NodeSim compiles the industry-standard <strong style={{ color: '#16a34a' }}>ngspice engine into WebAssembly</strong>. You get desktop-grade transient, AC Bode, and DC sweep accuracy directly in your browser tab.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FEATURES + AI TUTOR SECTION ─── */}
        <section className="features-dark" id="features">
          <div className="msl-container msl-features-inner">
            <div className="msl-features-head">
              <h2>Why engineers choose NodeSim over desktop &amp; legacy tools</h2>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '40px', marginBottom: '48px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>
                  BUILT-IN AI TUTOR
                </div>
                <h3 style={{ fontSize: 26, color: '#fff', marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Your Personal AI Engineering Tutor
                </h3>
                <p style={{ color: '#93A99F', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                  Stuck on a lab assignment? Don't understand how a specific component affects the output? NodeSim includes an AI circuit explainer powered by Google Gemini. It analyzes your live SPICE netlist and explains circuit behavior, formulas, and operating points instantly.
                </p>
                <Link to="/simulator" className="msl-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  Try the AI Explainer
                </Link>
              </div>
              <div style={{ flex: '1 1 300px', background: '#071A14', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, width: '40%', marginBottom: 8 }}></div>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, width: '90%', marginBottom: 8 }}></div>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, width: '75%' }}></div>
                  </div>
                </div>
                <div style={{ background: 'rgba(74, 222, 128, 0.05)', borderLeft: '2px solid #4ade80', padding: '12px 16px', color: '#EAF6EF', fontSize: 13, lineHeight: 1.5, fontFamily: 'monospace' }}>
                  "This is an astable 555 timer circuit. The frequency is determined by R1, R2, and C1. The output will oscillate at approximately 1.44 / ((R1 + 2*R2) * C1)."
                </div>
              </div>
            </div>

            <div className="msl-feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px 24px', borderTop: 'none' }}>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                <h3>Instant</h3>
                <p>No installation or login. Start simulating immediately in any tab.</p>
              </div>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                <h3>SPICE-powered</h3>
                <p>Accurate Modified Nodal Analysis solved locally by ngspice WebAssembly.</p>
              </div>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <h3>Runs anywhere</h3>
                <p>Windows, macOS, Linux, Chromebook, and tablets with offline support.</p>
              </div>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                <h3>Shareable</h3>
                <p>Send a circuit link to lab partners or export KiCad &amp; .cir netlists.</p>
              </div>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                <h3>Analyze</h3>
                <p>Inspect transient waveforms, FFT spectrums, Bode plots, and DC sweeps.</p>
              </div>
              <div className="feature-item" style={{ border: 'none', padding: 0 }}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                <h3>Built for learning</h3>
                <p>Export formatted IEEE PDF lab reports and learn with guided tutorials.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (3 STEPS) ─── */}
        <section style={{ padding: '4.5rem 1.5rem', background: '#0a0f0d', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: 14 }}>From schematic idea to SPICE waveform in 3 steps</h2>
            <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.05rem' }}>No installation. No account needed. Open the browser circuit simulator and start building.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
              {[
                { step: '01', Icon: Sliders, title: 'Draw Your Circuit', desc: 'Drag and drop from 250+ SPICE parts — resistors, capacitors, BJTs, MOSFETs, op-amps, 555 timers, regulators, and logic gates.' },
                { step: '02', Icon: Play, title: 'Run SPICE Simulation', desc: 'Hit Run. Our WebAssembly ngspice engine runs full transient, AC Bode sweep, or DC operating point analysis in milliseconds.' },
                { step: '03', Icon: Activity, title: 'Analyze & Export', desc: 'Inspect voltage and current probes in the Grapher. Use the AI Tutor to verify equations and export PDF lab reports.' },
              ].map(({ step, Icon, title, desc }) => (
                <div key={step} style={{ background: '#0d1a12', border: '1px solid #1a3a24', borderRadius: 16, padding: '1.75rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', marginBottom: 10 }}>STEP {step}</div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(74,222,128,0.12)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── READY-TO-RUN CIRCUITS & CALCULATORS ─── */}
        <section style={{ padding: '4.5rem 1.5rem', background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
          <div className="msl-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: '2.25rem' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Interactive Circuit Templates</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--ink)' }}>Ready-to-Run Online Circuit Simulations</h2>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/circuits" className="msl-btn btn-ghost">All 24+ Circuits →</Link>
                <Link to="/tools" className="msl-btn btn-ghost">Calculators</Link>
                <Link to="/tutorials" className="msl-btn btn-ghost">Tutorials</Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {POPULAR_CIRCUITS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'block',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 14,
                    padding: '20px',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{item.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--mint)', color: 'var(--green-dark)' }}>{item.tag}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─── */}
        <section style={{ padding: '4.5rem 1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <div className="msl-container" style={{ maxWidth: 1020 }}>
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Compare Simulators</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 3vw, 2.2rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Best Free Online Circuit Simulator &amp; Multisim Alternative</h2>
              <p style={{ color: 'var(--ink-soft)', maxWidth: 640, margin: '0 auto', fontSize: 15 }}>See how NodeSim compares against desktop SPICE programs and browser simulators.</p>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 14, background: 'var(--paper)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#071A14', color: '#fff' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Feature</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: '#4ade80' }}>NodeSim</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>NI Multisim Live</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>LTspice</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Falstad</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={row.feature} style={{ borderTop: '1px solid var(--line)', background: idx % 2 === 1 ? 'var(--mint)' : undefined }}>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--ink)' }}>{row.feature}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--green-dark)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Check size={15} /> {row.nodesim}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', color: 'var(--ink-soft)' }}>{row.multisim}</td>
                      <td style={{ padding: '13px 16px', color: 'var(--ink-soft)' }}>{row.ltspice}</td>
                      <td style={{ padding: '13px 16px', color: 'var(--ink-soft)' }}>
                        {row.falstad === 'None' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}><Minus size={14} /> None</span> : row.falstad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <Link to="/compare/multisim" className="msl-btn btn-ghost">NodeSim vs Multisim</Link>
              <Link to="/compare/ltspice" className="msl-btn btn-ghost">NodeSim vs LTspice</Link>
              <Link to="/compare/falstad" className="msl-btn btn-ghost">NodeSim vs Falstad</Link>
              <Link to="/compare/circuitlab" className="msl-btn btn-ghost">NodeSim vs CircuitLab</Link>
            </div>
          </div>
        </section>

        {/* ─── VISIBLE FAQ SECTION (SYNCS WITH FAQPAGE SCHEMA) ─── */}
        <section style={{ padding: '4.5rem 1.5rem', background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
          <div className="msl-container" style={{ maxWidth: 880 }}>
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 3vw, 2.15rem)', fontWeight: 700, color: 'var(--ink)' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LANDING_FAQS.map((faq, index) => (
                <details
                  key={faq.question}
                  open={index < 3}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '16px 20px',
                  }}
                >
                  <summary style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--ink)', cursor: 'pointer', listStylePosition: 'inside' }}>
                    {faq.question}
                  </summary>
                  <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="msl-site-footer">
        <div className="msl-container msl-footer-row">
          <div className="msl-footer-brand">
            <svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 27 L8 7 L26 27 L26 7" fill="none" stroke="url(#nGrad)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="7" r="2.5" fill="url(#nGrad)" /><circle cx="8" cy="27" r="2.5" fill="url(#nGrad)" /><circle cx="26" cy="7" r="2.5" fill="url(#nGrad)" /><circle cx="26" cy="27" r="2.5" fill="url(#nGrad)" /></svg>
            NodeSim
          </div>
          <ul className="msl-footer-links">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/educators">Educators</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/circuits">Circuits</Link></li>
            <li><Link to="/showcase">Video Showcase</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/tools">Calculators</Link></li>
            <li><Link to="/components">Components</Link></li>
            <li><Link to="/compare">Comparisons</Link></li>
            <li style={{ marginTop: 4 }}><span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Alternatives</span></li>
            <li><Link to="/compare/multisim">Multisim Alternative</Link></li>
            <li><Link to="/compare/ltspice">LTspice Online</Link></li>
            <li><Link to="/compare/falstad">Falstad Alternative</Link></li>
            <li><Link to="/compare/circuitlab">CircuitLab Alternative</Link></li>
            <li><Link to="/compare/tinkercad">Tinkercad Alternative</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><a href="https://github.com/SiD4422/multisimLive" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://www.youtube.com/@NODESIM-simulation" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
          <p>© {new Date().getFullYear()} NodeSim. Open source under the MIT License.</p>
        </div>
      </footer>
    </>
  );
}
