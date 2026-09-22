import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VsMultisim: React.FC = () => {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Helmet>
        <title>Multisim Alternative | Free Multisim Replacement Online</title>
        <meta name="description" content="Looking for a free Multisim alternative? NodeSim provides professional SPICE simulations directly in your browser without accounts or paywalls." />
        <meta name="keywords" content="Multisim alternative, free Multisim replacement, NI Multisim online, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>NodeSim vs NI Multisim</h1>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        NI Multisim is widely used in universities, but its desktop version is expensive and Multisim Live has restrictions. NodeSim offers a fully free, modern alternative that runs directly in your browser.
      </p>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Comparison</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>NI Multisim Live</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Access</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Free, no login required</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Login required (Premium tier exists)</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Simulation Speed</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Instant (runs on your CPU via WASM)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Server-dependent</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Privacy</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>100% Local Processing</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Cloud-based</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>AI Assistance</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Built-in Engineering Tutor</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>None</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Who is NodeSim for?</h2>
        <p>
          Anyone tired of paywalls, server lag, or cumbersome registration processes just to simulate basic circuits. NodeSim is ideal for rapid prototyping and educational environments where accessibility is key.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Honest Limitations</h2>
        <p>
          While NodeSim excels at standard educational simulations, it does not currently offer the vast proprietary vendor models or advanced instrumentation graphics found in the paid desktop versions of Multisim.
        </p>
      </section>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link 
          to="/simulator" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#10b981', 
            color: '#0f172a', 
            padding: '1rem 2rem', 
            borderRadius: '0.5rem', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1.1rem'
          }}
        >
          Try NodeSim Now →
        </Link>
      </div>
      {/* Cross-links for SEO and navigation */}
      <div className="tutorial-crosslinks">
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>More tutorials:</span>
        <Link to="/tutorials/rc-circuit">RC Circuit</Link>
        <Link to="/tutorials/op-amp">Op-Amp Amplifier</Link>
        <Link to="/tutorials/555-timer">555 Timer</Link>
        <Link to="/tutorials/rlc-circuit">RLC Circuit</Link>
        <Link to="/tutorials/diode-rectifier">Diode Rectifier</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Compare:</span>
        <Link to="/compare/vs-ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/vs-falstad">NodeSim vs Falstad</Link>
      </div>
    </div>
  );
};

export default VsMultisim;
