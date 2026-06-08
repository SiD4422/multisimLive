import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import './LandingPage.css'; // Keep reusing the same CSS file for the landing pages

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <Activity size={28} color="#15803d" />
          MultiSym live
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/features" className="nav-link" onClick={closeMenu}>Features</Link>
          <Link to="/circuits" className="nav-link" onClick={closeMenu}>Circuits</Link>
          <Link to="/procedure" className="nav-link" onClick={closeMenu}>Procedure</Link>
          <button className="nav-link" onClick={() => { closeMenu(); alert('Help & Resources coming soon!'); }}>Resources</button>
          
          <Link to="/simulator" className="cta-button" onClick={closeMenu}>
            Launch Simulator
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} MultiSimlab. All rights reserved. Built for education and engineering.</p>
      </footer>
    </div>
  );
}
