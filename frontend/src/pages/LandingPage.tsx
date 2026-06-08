import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <h1>
            Design Circuits.<br />
            <span>Simulate Instantly.</span>
          </h1>
          <p>
            Experience the next generation of web-based SPICE simulation. Build, test, and analyze complex electronic circuits directly in your browser with MultiSimlab.
          </p>
          <div className="hero-buttons">
            <Link to="/simulator" className="cta-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={20} fill="currentColor" /> Start Designing Free
            </Link>
            <Link to="/features" className="secondary-button" style={{ display: 'inline-block' }}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
