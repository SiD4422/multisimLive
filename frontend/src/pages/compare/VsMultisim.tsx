import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VsMultisim: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>Multisim Alternative | Free Multisim Replacement Online</title>
        <meta name="description" content="Looking for a free Multisim alternative? NodeSim provides professional SPICE simulations directly in your browser without accounts or paywalls." />
        <meta name="keywords" content="Multisim alternative, free Multisim replacement, NI Multisim online, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>NodeSim vs NI Multisim</h1>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        NI Multisim is widely used in universities, but its desktop version is expensive and Multisim Live has restrictions. NodeSim offers a fully free, modern alternative that runs directly in your browser.
      </p>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Comparison</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>NI Multisim Live</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Access</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Free, no login required</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Login required (Premium tier exists)</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Simulation Speed</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Instant (runs on your CPU via WASM)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Server-dependent</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Privacy</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>100% Local Processing</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Cloud-based</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>AI Assistance</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Built-in Engineering Tutor</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>None</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Who is NodeSim for?</h2>
        <p>
          Anyone tired of paywalls, server lag, or cumbersome registration processes just to simulate basic circuits. NodeSim is ideal for rapid prototyping and educational environments where accessibility is key.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Honest Limitations</h2>
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
    </div>
  );
};

export default VsMultisim;
