import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Share2, Menu, X } from 'lucide-react';
import './LandingPage.css';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo_main.png" alt="NodeSim Logo" style={{ height: '48px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/features" className="nav-link" onClick={closeMenu}>Features</Link>
          <Link to="/circuits" className="nav-link" onClick={closeMenu}>Circuits</Link>
          <Link to="/procedure" className="nav-link" onClick={closeMenu}>How to Use</Link>
          <Link to="/resources" className="nav-link" onClick={closeMenu}>Resources</Link>
          
          <Link to="/simulator" className="cta-button" onClick={closeMenu}>
            Launch Simulator →
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer-pro">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src="/logo_dark_transparent.png" alt="NodeSim Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </div>
            <p className="footer-tagline">The free, modern alternative to NI Multisim.<br />100% browser-based. No install. No account.</p>
          </div>

          <div className="footer-links-col">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/circuits">Example Circuits</Link>
            <Link to="/procedure">How to Use</Link>
            <Link to="/simulator">Launch Simulator</Link>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <Link to="/resources">Documentation</Link>
            <a href="https://ngspice.sourceforge.io/docs.html" target="_blank" rel="noopener noreferrer">ngspice Manual</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub (Open Source)</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NodeSim. Free & Open Source.</span>
          <span>Built for engineering students & educators worldwide.</span>
        </div>
      </footer>
    </div>
  );
}
