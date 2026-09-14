import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;500;600;700;800;900&display=swap');

        :root {
          --ink: #0d1117;
          --muted: #57606a;
          --muted2: #8b949e;
          --green: #22c55e;
          --green-d: #16a34a;
          --green-dd: #15803d;
          --line: #e6edf3;
          --surface: #f6f8fa;
        }

        .lp2 * { box-sizing: border-box; margin: 0; padding: 0; }
        .lp2 { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: var(--ink); background: #fff; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        .lp2 a { text-decoration: none; color: inherit; }
        .lp2 button { font-family: inherit; cursor: pointer; background: none; border: none; }

        /* NAVBAR */
        .lp2-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
        .lp2-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 32px; height: 60px; display: flex; align-items: center; gap: 32px; }
        .lp2-nav-logo { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
        .lp2-nav-logo-text { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
        .lp2-nav-logo-text span { color: var(--green-d); }
        .lp2-nav-links { display: flex; align-items: center; gap: 4px; flex: 1; }
        .lp2-nav-link { padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500; color: #374151; transition: background 0.15s, color 0.15s; }
        .lp2-nav-link:hover { background: #f0fdf4; color: var(--green-dd); }
        .lp2-nav-link.active { color: var(--green-d); font-weight: 600; }
        .lp2-nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
        .lp2-search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 6px 12px; font-size: 13px; color: var(--muted2); width: 200px; }
        .lp2-search svg { width: 14px; height: 14px; flex-shrink: 0; }
        .lp2-search-kbd { display: flex; align-items: center; gap: 2px; margin-left: auto; }
        .lp2-search-kbd kbd { background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 4px; padding: 1px 5px; font-size: 10px; font-family: inherit; color: #6b7280; }
        .lp2-theme-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 7px; transition: background 0.15s; color: var(--muted); }
        .lp2-theme-btn:hover { background: var(--surface); }
        .lp2-signin { font-size: 14px; font-weight: 600; color: var(--ink); padding: 7px 16px; border-radius: 8px; border: 1px solid var(--line); transition: background 0.15s; }
        .lp2-signin:hover { background: var(--surface); }
        .lp2-launch-btn { display: inline-flex; align-items: center; gap: 7px; background: var(--green-d); color: #fff; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 700; transition: background 0.15s, transform 0.1s; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
        .lp2-launch-btn:hover { background: var(--green-dd); }
        .lp2-launch-btn:active { transform: translateY(1px); }
        .lp2-launch-btn svg { width: 13px; height: 13px; }
        .lp2-hamburger { display: none; width: 34px; height: 34px; align-items: center; justify-content: center; border-radius: 7px; }
        .lp2-hamburger:hover { background: var(--surface); }

        /* HERO */
        .lp2-hero { max-width: 1280px; margin: 0 auto; padding: 64px 32px 96px; display: grid; grid-template-columns: 1fr 1.15fr; gap: 60px; align-items: center; }

        .lp2-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 5px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.03em; margin-bottom: 24px; }
        .lp2-badge::before { content: 'lightning'; font-size: 11px; }
        .lp2-h1 { font-size: clamp(2.6rem, 4.5vw, 3.8rem); font-weight: 900; line-height: 1.06; letter-spacing: -0.035em; margin-bottom: 20px; color: var(--ink); }
        .lp2-h1 .green { color: var(--green-d); }
        .lp2-lede { font-size: 17px; line-height: 1.7; color: var(--muted); max-width: 480px; margin-bottom: 36px; }
        .lp2-cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 56px; }
        .lp2-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--green-d); color: #fff; padding: 13px 24px; border-radius: 9px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px -4px rgba(22,163,74,.55); transition: background 0.15s, transform 0.1s; }
        .lp2-btn-primary:hover { background: var(--green-dd); }
        .lp2-btn-primary:active { transform: translateY(1px); }
        .lp2-btn-primary svg { width: 14px; height: 14px; }
        .lp2-btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: var(--ink); padding: 13px 24px; border-radius: 9px; font-size: 15px; font-weight: 600; border: 1.5px solid var(--line); transition: border-color 0.15s, background 0.15s; }
        .lp2-btn-secondary:hover { border-color: #9ca3af; background: #fafafa; }

        .lp2-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .lp2-feat { display: flex; flex-direction: column; gap: 6px; }
        .lp2-feat-icon { width: 36px; height: 36px; background: #f0fdf4; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; }
        .lp2-feat-icon svg { width: 18px; height: 18px; color: var(--green-d); }
        .lp2-feat-title { font-size: 14px; font-weight: 700; color: var(--ink); }
        .lp2-feat-sub { font-size: 12px; color: var(--muted2); line-height: 1.4; }

        /* Right visual */
        .lp2-visual { position: relative; }
        .lp2-glow { position: absolute; top: -80px; right: -60px; width: 480px; height: 480px; background: radial-gradient(circle, rgba(34,197,94,.22), transparent 70%); filter: blur(60px); pointer-events: none; z-index: 0; }
        .lp2-mockup-wrap { position: relative; z-index: 1; perspective: 1200px; }
        .lp2-mockup { background: #0d1117; border-radius: 14px; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 40px 80px -20px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.05) inset; overflow: hidden; transform: rotateY(-12deg) rotateX(4deg); transform-origin: right center; transition: transform 0.4s ease; }
        .lp2-mockup:hover { transform: rotateY(-6deg) rotateX(2deg); }

        .lp2-m-titlebar { display: flex; align-items: center; gap: 6px; padding: 12px 14px 8px; }
        .lp2-m-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp2-m-dot.r { background: #ff5f57; }
        .lp2-m-dot.y { background: #febc2e; }
        .lp2-m-dot.g { background: #28c840; }
        .lp2-m-top { display: flex; align-items: center; justify-content: space-between; padding: 6px 14px 10px; border-bottom: 1px solid rgba(255,255,255,.07); }
        .lp2-m-logo { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; color: #fff; }
        .lp2-m-logo svg { width: 16px; height: 16px; }
        .lp2-m-tabs { display: flex; gap: 2px; background: rgba(255,255,255,.06); padding: 3px; border-radius: 8px; }
        .lp2-m-tab { padding: 5px 13px; border-radius: 6px; font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,.35); letter-spacing: .02em; }
        .lp2-m-tab.on { background: #22c55e; color: #fff; }
        .lp2-m-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .lp2-m-run { display: flex; align-items: center; gap: 5px; background: #22c55e; color: #fff; padding: 5px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-left: auto; }
        .lp2-m-run svg { width: 8px; height: 8px; }
        .lp2-m-analysis { font-size: 10px; color: rgba(255,255,255,.4); font-weight: 600; margin-left: 6px; }
        .lp2-m-body { display: grid; grid-template-columns: 1.1fr 1fr; }
        .lp2-m-schema { padding: 18px; border-right: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; min-height: 200px; }
        .lp2-m-schema svg { width: 100%; max-width: 230px; height: auto; }
        .lp2-m-chart { padding: 16px; }
        .lp2-m-chart-hdr { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); margin-bottom: 10px; display: flex; justify-content: space-between; }
        .lp2-m-chart svg { width: 100%; height: auto; display: block; }
        .lp2-m-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 10px 14px; border-top: 1px solid rgba(255,255,255,.06); }
        .lp2-m-stat { background: rgba(255,255,255,.04); border-radius: 6px; padding: 8px 10px; }
        .lp2-m-stat-lbl { font-size: 9px; color: rgba(255,255,255,.35); font-weight: 600; margin-bottom: 2px; }
        .lp2-m-stat-val { font-size: 13px; font-weight: 700; color: #fff; }
        .lp2-m-stat-val.green { color: #22c55e; }
        .lp2-m-footer { padding: 8px 14px; font-size: 9px; color: rgba(255,255,255,.25); display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.05); }
        .lp2-m-footer .ok { color: #22c55e; font-weight: 700; }

        .lp2-callout { position: absolute; font-family: 'Caveat', cursive; font-weight: 700; line-height: 1.2; color: var(--green-d); pointer-events: none; }
        .lp2-callout-1 { top: -36px; right: -10px; font-size: 1.4rem; transform: rotate(3deg); text-align: center; }
        .lp2-callout-2 { bottom: -50px; left: 0; font-size: 1.5rem; transform: rotate(-3deg); }
        .lp2-callout svg { display: block; }

        .lp2-ngbadge { position: absolute; top: -18px; right: -22px; z-index: 3; background: #161b22; border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 9px 14px; display: flex; align-items: center; gap: 9px; box-shadow: 0 12px 28px -8px rgba(0,0,0,.5); transform: rotate(2deg); }
        .lp2-ngbadge-icon { width: 32px; height: 32px; background: rgba(34,197,94,.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .lp2-ngbadge-icon svg { width: 18px; height: 18px; color: #22c55e; }
        .lp2-ngbadge-text { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.5); line-height: 1.3; }
        .lp2-ngbadge-text strong { color: #fff; display: block; font-size: 11.5px; }

        /* TRUST BAR */
        .lp2-trust { border-top: 1px solid var(--line); padding: 40px 32px 56px; }
        .lp2-trust-inner { max-width: 1280px; margin: 0 auto; }
        .lp2-trust-label { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: var(--muted2); text-transform: uppercase; margin-bottom: 28px; }
        .lp2-trust-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 36px; margin-bottom: 44px; }
        .lp2-trust-pill { display: flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 600; color: var(--muted); }
        .lp2-trust-pill svg { width: 20px; height: 20px; flex-shrink: 0; }
        .lp2-testimonial { max-width: 560px; margin: 0 auto; text-align: center; }
        .lp2-testimonial-quote { font-size: 1.1rem; line-height: 1.6; color: #374151; font-weight: 500; margin-bottom: 12px; }
        .lp2-testimonial-quote::before { content: '\u201c'; color: var(--green-d); font-size: 1.4em; line-height: 0; vertical-align: -0.2em; }
        .lp2-testimonial-quote::after { content: '\u201d'; color: var(--green-d); font-size: 1.4em; line-height: 0; vertical-align: -0.2em; }
        .lp2-testimonial-author { font-size: 13px; color: var(--muted2); font-weight: 600; }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .lp2-hero { grid-template-columns: 1fr; }
          .lp2-visual { max-width: 580px; margin: 0 auto; }
          .lp2-mockup { transform: none !important; }
          .lp2-callout-1 { top: -28px; right: 0; }
        }
        @media (max-width: 768px) {
          .lp2-search { display: none; }
          .lp2-nav-links { display: none; }
          .lp2-hamburger { display: flex; }
          .lp2-features { grid-template-columns: repeat(2, 1fr); }
          .lp2-hero { padding: 40px 20px 80px; gap: 48px; }
          .lp2-nav-inner { padding: 0 20px; }
        }
        @media (max-width: 480px) {
          .lp2-ngbadge, .lp2-callout { display: none; }
          .lp2-features { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
      `}</style>

      <div className="lp2">
        {/* NAVBAR */}
        <nav className="lp2-nav">
          <div className="lp2-nav-inner">
            <Link to="/" className="lp2-nav-logo">
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <path d="M4 22 L11 10 L16 18 L26 4" stroke="#16a34a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="26" cy="4" r="3" fill="#16a34a"/>
              </svg>
              <span className="lp2-nav-logo-text">Node<span>Sim</span></span>
            </Link>

            <div className="lp2-nav-links">
              <a href="#" className="lp2-nav-link active">Home</a>
              <Link to="/features" className="lp2-nav-link">Features</Link>
              <Link to="/circuits" className="lp2-nav-link">Circuits</Link>
              <a href="#learn" className="lp2-nav-link">Learn</a>
              <a href="#resources" className="lp2-nav-link">Resources</a>
              <a href="#pricing" className="lp2-nav-link">Pricing</a>
            </div>

            <div className="lp2-nav-right">
              <div className="lp2-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                Search circuits, components...
                <span className="lp2-search-kbd">
                  <kbd>⌘</kbd><kbd>K</kbd>
                </span>
              </div>
              <button className="lp2-theme-btn" aria-label="Toggle theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
              <a href="#" className="lp2-signin">Sign In</a>
              <Link to="/simulator" className="lp2-launch-btn">
                Launch Simulator
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <button className="lp2-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp2-hero">
          <div>
            <div className="lp2-badge">Free • Open Source • No Account Needed</div>
            <h1 className="lp2-h1">
              Design. Simulate.<br/>
              Understand. <span className="green">Faster.</span>
            </h1>
            <p className="lp2-lede">
              A modern, browser-based circuit simulator powered by ngspice. Build circuits, run simulations, and visualize results — all in one seamless workspace.
            </p>
            <div className="lp2-cta-row">
              <Link to="/simulator" className="lp2-btn-primary">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 20,12 5,21"/></svg>
                Launch Simulator →
              </Link>
              <Link to="/features" className="lp2-btn-secondary">Explore Features</Link>
            </div>
            <div className="lp2-features">
              <div className="lp2-feat">
                <div className="lp2-feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13,2 4,14 11,14 9,22 20,9 12,9"/></svg>
                </div>
                <div className="lp2-feat-title">100% Free</div>
                <div className="lp2-feat-sub">No paywalls</div>
              </div>
              <div className="lp2-feat">
                <div className="lp2-feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <div className="lp2-feat-title">No Account</div>
                <div className="lp2-feat-sub">Start instantly</div>
              </div>
              <div className="lp2-feat">
                <div className="lp2-feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>
                </div>
                <div className="lp2-feat-title">Browser Based</div>
                <div className="lp2-feat-sub">Works offline</div>
              </div>
              <div className="lp2-feat">
                <div className="lp2-feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="7" y="7" width="10" height="10" rx="1"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>
                </div>
                <div className="lp2-feat-title">Powered by ngspice</div>
                <div className="lp2-feat-sub">Real engineering. Real results.</div>
              </div>
            </div>
          </div>

          {/* Right - 3D Tilted Mockup */}
          <div className="lp2-visual">
            <div className="lp2-glow" aria-hidden="true"/>

            <div className="lp2-callout lp2-callout-1" aria-hidden="true">
              Same Engine.<br/>More Possibilities.
              <svg width="90" height="18" viewBox="0 0 90 18" fill="none">
                <path d="M2 10 C20 3, 50 3, 88 10" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>

            <div className="lp2-ngbadge" aria-hidden="true">
              <div className="lp2-ngbadge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="7" y="7" width="10" height="10" rx="1"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>
              </div>
              <div className="lp2-ngbadge-text">
                <strong>Powered by</strong>
                ngspice WASM
              </div>
            </div>

            <div className="lp2-mockup-wrap">
              <div className="lp2-mockup">
                <div className="lp2-m-titlebar">
                  <span className="lp2-m-dot r"/><span className="lp2-m-dot y"/><span className="lp2-m-dot g"/>
                </div>
                <div className="lp2-m-top">
                  <div className="lp2-m-logo">
                    <svg viewBox="0 0 30 30" fill="none"><path d="M4 22 L11 10 L16 18 L26 4" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26" cy="4" r="3" fill="#22c55e"/></svg>
                    NodeSim
                  </div>
                  <div className="lp2-m-tabs">
                    <span className="lp2-m-tab on">Schematic</span>
                    <span className="lp2-m-tab">Grapher</span>
                    <span className="lp2-m-tab">Split</span>
                  </div>
                </div>
                <div className="lp2-m-toolbar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M12 3v18"/></svg>
                  <span className="lp2-m-analysis">DC Analysis ▾</span>
                  <div className="lp2-m-run">
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 20,12 5,21"/></svg>
                    Run
                  </div>
                </div>
                <div className="lp2-m-body">
                  <div className="lp2-m-schema">
                    <svg viewBox="0 0 240 200">
                      <path d="M60,40 L86,40 L90,32 L96,48 L102,32 L108,48 L114,32 L118,40 L170,40" fill="none" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="40" y1="40" x2="40" y2="80" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <circle cx="40" cy="100" r="18" fill="none" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="40" y1="92" x2="40" y2="98" stroke="#e2e8f0" strokeWidth="1.5"/>
                      <line x1="37" y1="95" x2="43" y2="95" stroke="#e2e8f0" strokeWidth="1.5"/>
                      <line x1="40" y1="118" x2="40" y2="160" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="170" y1="40" x2="170" y2="70" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="152" y1="70" x2="188" y2="70" stroke="#e2e8f0" strokeWidth="2.2"/>
                      <line x1="152" y1="80" x2="188" y2="80" stroke="#e2e8f0" strokeWidth="2.2"/>
                      <line x1="170" y1="80" x2="170" y2="160" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="40" y1="160" x2="170" y2="160" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="105" y1="160" x2="105" y2="172" stroke="#e2e8f0" strokeWidth="1.6"/>
                      <line x1="97" y1="172" x2="113" y2="172" stroke="#e2e8f0" strokeWidth="1.8"/>
                      <line x1="100" y1="178" x2="110" y2="178" stroke="#e2e8f0" strokeWidth="1.8"/>
                      <line x1="103" y1="184" x2="107" y2="184" stroke="#e2e8f0" strokeWidth="1.8"/>
                      <circle cx="170" cy="40" r="3.5" fill="#22c55e"/>
                      <circle cx="40" cy="160" r="2.5" fill="#6ee7a8"/>
                      <circle cx="170" cy="160" r="2.5" fill="#6ee7a8"/>
                      <text x="6" y="97" fill="#f1f5f9" fontSize="11" fontWeight="700">V1</text>
                      <text x="6" y="112" fill="#94a3b8" fontSize="10">5V</text>
                      <text x="112" y="24" fill="#f1f5f9" fontSize="11" fontWeight="700" textAnchor="middle">R1</text>
                      <text x="112" y="36" fill="#94a3b8" fontSize="10" textAnchor="middle">1k&#937;</text>
                      <text x="194" y="72" fill="#f1f5f9" fontSize="11" fontWeight="700">C1</text>
                      <text x="194" y="86" fill="#94a3b8" fontSize="10">10&#956;F</text>
                    </svg>
                  </div>
                  <div className="lp2-m-chart">
                    <div className="lp2-m-chart-hdr">
                      <span>V(out)</span>
                      <span>Time (ms)</span>
                    </div>
                    <svg viewBox="0 0 200 120">
                      <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
                      <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
                      <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
                      <line x1="0" y1="110" x2="200" y2="110" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
                      <text x="2" y="24" fill="rgba(255,255,255,.4)" fontSize="8">5V</text>
                      <text x="2" y="54" fill="rgba(255,255,255,.4)" fontSize="8">0V</text>
                      <text x="0" y="84" fill="rgba(255,255,255,.4)" fontSize="8">-5V</text>
                      <text x="2" y="118" fill="rgba(255,255,255,.3)" fontSize="7">0</text>
                      <text x="48" y="118" fill="rgba(255,255,255,.3)" fontSize="7">10</text>
                      <text x="98" y="118" fill="rgba(255,255,255,.3)" fontSize="7">20</text>
                      <text x="148" y="118" fill="rgba(255,255,255,.3)" fontSize="7">30</text>
                      <text x="185" y="118" fill="rgba(255,255,255,.3)" fontSize="7">40</text>
                      <path d="M0,50 C5,50 8,20 16,20 C24,20 27,50 35,50 C43,50 46,80 54,80 C62,80 65,50 73,50 C81,50 84,20 92,20 C100,20 103,50 111,50 C119,50 122,80 130,80 C138,80 141,50 149,50 C157,50 160,20 168,20 C176,20 179,50 187,50 C195,50 198,80 200,80" fill="none" stroke="#22c55e" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className="lp2-m-stats">
                  <div className="lp2-m-stat">
                    <div className="lp2-m-stat-lbl">Vmax</div>
                    <div className="lp2-m-stat-val green">4.98 V</div>
                  </div>
                  <div className="lp2-m-stat">
                    <div className="lp2-m-stat-lbl">Vmin</div>
                    <div className="lp2-m-stat-val">-4.97 V</div>
                  </div>
                  <div className="lp2-m-stat">
                    <div className="lp2-m-stat-lbl">Vpp</div>
                    <div className="lp2-m-stat-val">9.95 V</div>
                  </div>
                  <div className="lp2-m-stat">
                    <div className="lp2-m-stat-lbl">Freq</div>
                    <div className="lp2-m-stat-val">1.00 kHz</div>
                  </div>
                </div>
                <div className="lp2-m-footer">
                  <span className="ok">&#9679; Simulation completed</span>
                  <span>12.4 ms</span>
                </div>
              </div>
            </div>

            <div className="lp2-callout lp2-callout-2" aria-hidden="true">
              Ideas to Insights
              <svg width="130" height="14" viewBox="0 0 130 14">
                <path d="M2 8 C25 1, 65 1, 128 8" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="lp2-trust">
          <div className="lp2-trust-inner">
            <p className="lp2-trust-label">Trusted by Learners, Educators &amp; Engineers</p>
            <div className="lp2-trust-pills">
              <div className="lp2-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                Students
              </div>
              <div className="lp2-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                Educators
              </div>
              <div className="lp2-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
                Hobbyists
              </div>
              <div className="lp2-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
                Researchers
              </div>
              <div className="lp2-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                Professionals
              </div>
            </div>
            <div className="lp2-testimonial">
              <p className="lp2-testimonial-quote">Finally, a circuit simulator that just works in the browser.</p>
              <p className="lp2-testimonial-author">&#8212; Engineering Student</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
