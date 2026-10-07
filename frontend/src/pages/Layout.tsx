import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './LandingPage.css';

// Inline styles for the Learn dropdown
const dropdownStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  paddingBottom: '12px',  // extends hover zone so mouse doesn't leave before reaching menu
};
const dropdownMenuStyle: React.CSSProperties = {
  display: 'none',
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#0d2818',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  padding: '8px 0',
  minWidth: '220px',
  zIndex: 1000,
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  marginTop: '0',
};

export default function Layout() {
  const { pathname } = useLocation();
  const isLearnActive = pathname.startsWith('/tutorials') || pathname.startsWith('/compare');

  return (
    <div className="landing-page">

      {/* ─── NAVBAR: matches LandingPage exactly ─── */}
      <header className="msl-site-header">
        <div className="msl-container msl-nav-row">
          <Link className="msl-brand" to="/" aria-label="NodeSim home" style={{ textDecoration: 'none' }}>
            <img src="/logo_main.png" alt="NodeSim Logo" style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px', mixBlendMode: 'multiply' }} />
          </Link>

          <nav className="msl-nav-links" aria-label="Primary" style={{ justifyContent: 'center' }}>
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/features" className={pathname === '/features' ? 'active' : ''}>Features</Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/circuits" className={pathname.startsWith('/circuits') ? 'active' : ''}>Circuits</Link>
            <Link to="/procedure" className={pathname === '/procedure' ? 'active' : ''}>How to Use</Link>

            {/* ── Learn dropdown ── */}
            <div
              style={dropdownStyle}
              className="learn-dropdown-parent"
              onMouseEnter={e => {
                const menu = e.currentTarget.querySelector('.learn-dropdown-menu') as HTMLElement;
                if (menu) menu.style.display = 'block';
              }}
              onMouseLeave={e => {
                const menu = e.currentTarget.querySelector('.learn-dropdown-menu') as HTMLElement;
                if (menu) menu.style.display = 'none';
              }}
            >
              <span
                style={{
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  color: isLearnActive ? 'var(--brand-300, #4ade80)' : 'inherit',
                  fontWeight: isLearnActive ? 700 : undefined,
                }}
              >
                Learn
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
              <div className="learn-dropdown-menu" style={dropdownMenuStyle}>
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Tutorials
                </div>
                <Link to="/tutorials/rc-circuit" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">RC Circuit</Link>
                <Link to="/tutorials/op-amp" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Op-Amp Amplifier</Link>
                <Link to="/tutorials/555-timer" style={{ display:'block', padding:'7px 16px', color:'#c8d8ce', fontSize:'13px', textDecoration:'none' }} className="dropdown-item">555 Timer</Link><Link to="/tutorials/transistor-amplifier" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Transistor Amplifier</Link>
                <Link to="/tutorials/rlc-circuit" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">RLC Circuit</Link>
                <Link to="/tutorials/diode-rectifier" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Diode Rectifier</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Comparisons
                </div>
                <Link to="/compare/ltspice" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs LTspice</Link>
                <Link to="/compare/falstad" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs Falstad</Link>
                <Link to="/compare/multisim" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">NodeSim vs Multisim</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Free Calculators
                </div>
                <Link to="/tools/ohms-law" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Ohm's Law Calculator</Link>
                <Link to="/tools/voltage-divider" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Voltage Divider</Link>
                <Link to="/tools/rc-calculator" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">RC Calculator</Link>
                <Link to="/tools/555-timer" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">555 Timer</Link>
                <Link to="/tools/resistor-color-code" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Resistor Color Code</Link>
              </div>
            </div>

            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/simulator" className="msl-btn msl-btn-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z"/></svg>
              Launch Simulator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
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
              <svg className="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
              <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
        </div>

        <div className="mobile-panel" id="mobilePanel">
          <div className="mp-links">
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/features" className={pathname === '/features' ? 'active' : ''}>Features</Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/circuits" className={pathname.startsWith('/circuits') ? 'active' : ''}>Circuits</Link>
            <Link to="/procedure" className={pathname === '/procedure' ? 'active' : ''}>How to Use</Link>
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '6px 0', paddingTop: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0' }}>Tutorials</div>
              <Link to="/tutorials/rc-circuit" className={pathname === '/tutorials/rc-circuit' ? 'active' : ''}>RC Circuit</Link>
              <Link to="/tutorials/op-amp" className={pathname === '/tutorials/op-amp' ? 'active' : ''}>Op-Amp Amplifier</Link>
              <Link to="/tutorials/555-timer" className={pathname === '/tutorials/555-timer' ? 'active' : ''}>555 Timer</Link>
              <Link to="/tutorials/transistor-amplifier" className={pathname === '/tutorials/transistor-amplifier' ? 'active' : ''}>Transistor Amplifier</Link>
              <Link to="/tutorials/rlc-circuit" className={pathname === '/tutorials/rlc-circuit' ? 'active' : ''}>RLC Circuit</Link>
              <Link to="/tutorials/diode-rectifier" className={pathname === '/tutorials/diode-rectifier' ? 'active' : ''}>Diode Rectifier</Link>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 0 4px' }}>Comparisons</div>
              <Link to="/compare/ltspice" className={pathname === '/compare/ltspice' ? 'active' : ''}>vs LTspice</Link>
              <Link to="/compare/falstad" className={pathname === '/compare/falstad' ? 'active' : ''}>vs Falstad</Link>
              <Link to="/compare/multisim" className={pathname === '/compare/multisim' ? 'active' : ''}>vs Multisim</Link>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 0 4px' }}>Free Calculators</div>
              <Link to="/tools/ohms-law" className={pathname === '/tools/ohms-law' ? 'active' : ''}>Ohm's Law Calculator</Link>
              <Link to="/tools/voltage-divider" className={pathname === '/tools/voltage-divider' ? 'active' : ''}>Voltage Divider</Link>
              <Link to="/tools/rc-calculator" className={pathname === '/tools/rc-calculator' ? 'active' : ''}>RC Calculator</Link>
              <Link to="/tools/555-timer" className={pathname === '/tools/555-timer' ? 'active' : ''}>555 Timer</Link>
              <Link to="/tools/resistor-color-code" className={pathname === '/tools/resistor-color-code' ? 'active' : ''}>Resistor Color Code</Link>
            </div>
          </div>
          <div className="mp-actions">
            <Link className="msl-btn msl-btn-primary" to="/simulator">Launch Simulator</Link>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>

      {/* ─── FOOTER: matches LandingPage exactly ─── */}
      <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
        <defs>
          <linearGradient id="nGradL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3FCB8C"/>
            <stop offset="1" stopColor="#08794B"/>
          </linearGradient>
        </defs>
      </svg>

      <footer className="msl-site-footer">
        <div className="msl-container msl-footer-row">
          <div className="msl-footer-brand">
            <svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 27 L8 7 L26 27 L26 7" fill="none" stroke="url(#nGradL)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="7" r="2.5" fill="url(#nGradL)"/><circle cx="8" cy="27" r="2.5" fill="url(#nGradL)"/><circle cx="26" cy="7" r="2.5" fill="url(#nGradL)"/><circle cx="26" cy="27" r="2.5" fill="url(#nGradL)"/></svg>
            NodeSim
          </div>
          <ul className="msl-footer-links">
            <li><Link to="/features">Features</Link></li>
              <li><Link to="/about">About</Link></li>
            <li><Link to="/circuits">Circuits</Link></li>
              <li><Link to="/showcase">Showcase</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/compare">Comparisons</Link></li>
            <li><Link to="/procedure">How to Use</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
            <li><a href="https://github.com/SiD4422/multisimLive" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
          <p>&copy; {new Date().getFullYear()} NodeSim. Open source under the MIT License.</p>
        </div>
      </footer>

    </div>
  );
}
