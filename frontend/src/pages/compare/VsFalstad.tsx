import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VsFalstad: React.FC = () => {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Helmet>
        <title>Falstad vs SPICE | Falstad Alternative with AI</title>
        <meta name="description" content="Compare Falstad circuit simulator vs NodeSim. Discover an alternative that offers professional SPICE accuracy with a modern UI and AI assistance." />
        <meta name="keywords" content="Falstad vs SPICE, Falstad alternative with AI, NodeSim vs Falstad, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>NodeSim vs Falstad</h1>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Falstad is famous for its animated "water flow" current visualization, making it great for early beginners. However, it uses a simplified engine. NodeSim provides an easy UI but runs professional-grade SPICE under the hood.
      </p>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Comparison</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Falstad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Simulation Engine</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Industry-standard ngspice</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Custom simplified engine</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Accuracy</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Professional / Academic</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Educational / Approximated</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Visuals</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Standard Schematic + Graphs</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Animated current flow</td>
          </tr>
          <tr style={{ backgroundColor: '#1e293b' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Modern Features</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>AI Tutor, Dark Mode</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Classic Java-era UI</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Who is NodeSim for?</h2>
        <p>
          Users who have outgrown Falstad's educational models and need a simulator they can trust for actual lab reports, assignments, or real-world prototyping, while still maintaining an easy-to-use web interface.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Honest Limitations</h2>
        <p>
          If you are a complete beginner who relies heavily on the visual "moving dots" to understand current flow, Falstad is still an excellent tool. NodeSim focuses on standard electrical schematics and rigorous graphing instead.
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
        <Link to="/compare/vs-multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default VsFalstad;
