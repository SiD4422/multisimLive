import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VsLtspice: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>NodeSim vs LTspice | Online LTspice Alternative</title>
        <meta name="description" content="Compare NodeSim and LTspice. Find out why NodeSim is the best free LTspice alternative online for quick circuit simulations in your browser." />
        <meta name="keywords" content="NodeSim vs LTspice, LTspice alternative online, free SPICE simulator, browser circuit simulation" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>NodeSim vs LTspice</h1>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        LTspice is an industry powerhouse for circuit simulation, but it requires a local installation and has a steep learning curve. NodeSim provides an accessible, browser-based alternative.
      </p>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Comparison</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid #334155' }}>LTspice</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Platform</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Web Browser (No Install)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Windows / macOS (Install Required)</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Ease of Use</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Beginner Friendly</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Steep Learning Curve</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Simulation Engine</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>ngspice (WASM)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Proprietary SPICE</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Component Library</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Basic standard models</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Massive vendor library</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Price</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>100% Free</td>
            <td style={{ padding: '0.75rem', border: '1px solid #334155' }}>Free (Proprietary)</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Who is NodeSim for?</h2>
        <p>
          Students, educators, and hobbyists who need to quickly sketch a schematic and verify behavior without dealing with software installations or complex UI. It’s perfect for homework, lab prep, and conceptual learning.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Honest Limitations</h2>
        <p>
          NodeSim uses the highly capable ngspice engine, but currently lacks the massive proprietary component libraries that LTspice includes for specific commercial ICs. It also does not support PCB layout generation.
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
        <Link to="/compare/vs-falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/vs-multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default VsLtspice;
