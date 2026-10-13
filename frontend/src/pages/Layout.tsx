import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
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
  borderRadius: '12px',
  padding: '6px 0',
  minWidth: '260px',
  zIndex: 1000,
  boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
  marginTop: '0',
};

export default function Layout() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLearnActive = pathname.startsWith('/tutorials') || pathname.startsWith('/compare');
  const isDarkPage = true; // All pages unify to dark emerald aesthetic

  return (
    <div className={`landing-page ${isDarkPage ? 'landing-page-dark' : ''}`} style={isDarkPage ? { background: '#060a08', color: '#eef3f0' } : undefined}>

      {/* ─── NAVBAR: matches LandingPage exactly ─── */}
      <header className={`msl-site-header ${isDarkPage ? 'msl-header-dark' : ''}`}>
        <div className="msl-container msl-nav-row">
          <Link className="msl-brand" to="/" aria-label="NodeSim home" style={{ textDecoration: 'none' }}>
            <img src={isDarkPage ? "/logo_dark_transparent.png" : "/logo_main_transparent.png"} alt="NodeSim Logo" style={{ height: '34px', objectFit: 'contain' }} />
          </Link>

          <nav className="msl-nav-links" aria-label="Primary" style={{ justifyContent: 'center' }}>
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/features" className={pathname === '/features' ? 'active' : ''}>Features</Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/circuits" className={pathname.startsWith('/circuits') ? 'active' : ''}>Circuits</Link>
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
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
                {/* Community */}
                <div className="dd-section-head">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                  Community
                </div>
                <a href="https://www.youtube.com/@NODESIM-simulation" target="_blank" rel="noopener noreferrer" className="dd-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                  YouTube Channel
                  <span className="dd-yt-pill">NEW</span>
                </a>
                <hr className="dd-divider"/>
                {/* Tutorials */}
                <div className="dd-section-head">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                  Tutorials
                </div>
                <Link to="/showcase"  className={`dd-item ${pathname === '/showcase' ? 'active' : ''}`}>↗ Video Showcase</Link>
                <Link to="/tutorials/rc-circuit" className={`dd-item ${pathname === '/tutorials/rc-circuit' ? 'active' : ''}`}>RC Circuit</Link>
                <Link to="/tutorials/op-amp" className={`dd-item ${pathname === '/tutorials/op-amp' ? 'active' : ''}`}>Op-Amp Amplifier</Link>
                <Link to="/tutorials/555-timer" className={`dd-item ${pathname === '/tutorials/555-timer' ? 'active' : ''}`}>555 Timer</Link>
                <Link to="/tutorials/transistor-amplifier" className={`dd-item ${pathname === '/tutorials/transistor-amplifier' ? 'active' : ''}`}>Transistor Amplifier</Link>
                <Link to="/tutorials/rlc-circuit" className={`dd-item ${pathname === '/tutorials/rlc-circuit' ? 'active' : ''}`}>RLC Circuit</Link>
                <Link to="/tutorials/diode-rectifier" className={`dd-item ${pathname === '/tutorials/diode-rectifier' ? 'active' : ''}`}>Diode Rectifier</Link>
                <hr className="dd-divider"/>
                {/* Comparisons */}
                <div className="dd-section-head">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/></svg>
                  Comparisons
                </div>
                <Link to="/compare/ltspice" className={`dd-item ${pathname === '/compare/ltspice' ? 'active' : ''}`}>NodeSim vs LTspice</Link>
                <Link to="/compare/falstad" className={`dd-item ${pathname === '/compare/falstad' ? 'active' : ''}`}>NodeSim vs Falstad</Link>
                <Link to="/compare/multisim" className={`dd-item ${pathname === '/compare/multisim' ? 'active' : ''}`}>NodeSim vs Multisim</Link>
                <hr className="dd-divider"/>
                {/* Free Calculators */}
                <div className="dd-section-head">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="8" y1="14" x2="8" y2="18"/></svg>
                  Free Calculators
                </div>
                <Link to="/tools/ohms-law" className={`dd-item ${pathname === '/tools/ohms-law' ? 'active' : ''}`}>Ohm's Law (V = IR)</Link>
                <Link to="/tools/voltage-divider" className={`dd-item ${pathname === '/tools/voltage-divider' ? 'active' : ''}`}>Voltage Divider</Link>
                <Link to="/tools/rc-calculator" className={`dd-item ${pathname === '/tools/rc-calculator' ? 'active' : ''}`}>RC Calculator</Link>
                <Link to="/tools/555-timer" className={`dd-item ${pathname === '/tools/555-timer' ? 'active' : ''}`}>555 Timer Calc</Link>
                <Link to="/tools/resistor-color-code" className={`dd-item ${pathname === '/tools/resistor-color-code' ? 'active' : ''}`}>Resistor Color Code</Link>
              </div>
            </div>
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
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '6px 0', paddingTop: '6px' }}>
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Inspiration
                </div>
                <Link to="/showcase" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Video Showcase</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>
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
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', marginRight: 8 }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
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
            <li><Link to="/showcase">Video Showcase</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/compare">Comparisons</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><a href="https://github.com/SiD4422/multisimLive" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://www.youtube.com/@NODESIM-simulation" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
          <p>&copy; {new Date().getFullYear()} NodeSim. Open source under the MIT License.</p>
        </div>
      </footer>

    </div>
  );
}
