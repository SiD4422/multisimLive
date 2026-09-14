import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './LandingPage.css';

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="landing-page">

      {/* ─── NAVBAR: matches LandingPage exactly ─── */}
      <header className="msl-site-header">
        <div className="msl-container msl-nav-row">
          <Link className="msl-brand" to="/" aria-label="NodeSim home" style={{ textDecoration: 'none' }}>
            <img src="/logo_main.png" alt="NodeSim Logo" style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px' }} />
          </Link>

          <nav className="msl-nav-links" aria-label="Primary" style={{ justifyContent: 'center' }}>
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/features" className={pathname === '/features' ? 'active' : ''}>Features</Link>
            <Link to="/circuits" className={pathname === '/circuits' ? 'active' : ''}>Circuits</Link>
            <Link to="/procedure" className={pathname === '/procedure' ? 'active' : ''}>How to Use</Link>
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
            <Link to="/circuits" className={pathname === '/circuits' ? 'active' : ''}>Circuits</Link>
            <Link to="/procedure" className={pathname === '/procedure' ? 'active' : ''}>How to Use</Link>
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>
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
            <li><Link to="/circuits">Circuits</Link></li>
            <li><Link to="/procedure">How to Use</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><a href="https://github.com/SiD4422/multisimLive" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
          <p>© {new Date().getFullYear()} NodeSim. Open source under the MIT License.</p>
        </div>
      </footer>

    </div>
  );
}
