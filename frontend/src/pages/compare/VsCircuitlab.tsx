import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const VsCircuitlab: React.FC = () => {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="NodeSim vs CircuitLab — Free Browser SPICE Simulator vs $24/mo"
        description="Compare NodeSim vs CircuitLab. NodeSim is 100% free with real ngspice SPICE simulation in the browser. CircuitLab charges $24/month. Full feature-by-feature comparison."
        url="https://www.nodesimapp.com/compare/circuitlab"
      />
      <Helmet>
        <meta name="keywords" content="NodeSim vs CircuitLab, CircuitLab alternative free, free online circuit simulator, SPICE browser simulation, CircuitLab pricing" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#10b981' }}>NodeSim vs CircuitLab</h1>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2rem' }}>Last updated October 2026</p>

      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        CircuitLab is a capable browser-based simulator, but it sits behind a <strong>$24/month paywall</strong> after a limited free trial. 
        NodeSim is 100% free, runs real ngspice WASM simulation, and has no login required. Here's the honest comparison.
      </p>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Feature Comparison</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left', color: '#ffffff' }}>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>CircuitLab</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Price</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', fontWeight: 700, color: '#15803d' }}>100% Free — forever</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', color: '#dc2626' }}>$24/month (paid plan required for full access)</td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Login Required</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>No — open instantly</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Yes — account required</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Simulation Engine</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>ngspice (industry-standard SPICE, compiled to WASM)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Proprietary solver</td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Platform</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Any browser — desktop, tablet, mobile</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Browser (desktop-focused)</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Simulation Types</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Transient, AC Sweep, DC Operating Point, DC Sweep</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Transient, AC Frequency, DC</td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Component Library</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>85+ components (BJT, MOSFET, Op-Amps, 74xx logic, 555 timer)</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Large component library</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Current Flow Animation</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>✅ 60 FPS animated current particles</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>❌ Not available</td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Lab Report Generator</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>✅ 1-click IEEE/DVR PDF report</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>❌ Not available</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Iframe Embedding</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>✅ Free embed with powered-by badge</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Paid plan required</td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>Open Source</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>✅ MIT licensed</td>
            <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>❌ Proprietary</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: '#15803d' }}>💡 The Key Difference: Price</h2>
        <p>
          CircuitLab's free tier is severely limited — you can't save more than a few circuits or run full SPICE simulations without upgrading to <strong>$24/month</strong>. 
          NodeSim gives you the full simulator for free, forever. No credit card. No account. No limits.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>When Should You Use CircuitLab?</h2>
        <p>
          CircuitLab has a very polished UI and excellent textbook integration. If your institution has a paid CircuitLab license already, it's a solid choice. 
          For individual engineers or students paying out of pocket, the $24/month price tag is hard to justify when NodeSim is free and uses the same industry-standard SPICE engine.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Honest Limitations of NodeSim</h2>
        <p>
          NodeSim currently has fewer schematic templates than CircuitLab and does not support mixed-signal (digital + analog) simulation in the same canvas. 
          For deeply complex analog front-end design at the professional level, LTspice or commercial tools may be more appropriate.
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
          Try NodeSim Free — No Account Needed →
        </Link>
      </div>

      {/* Cross-links for SEO and navigation */}
      <div className="tutorial-crosslinks">
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>More comparisons:</span>
        <Link to="/compare/ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/multisim">NodeSim vs Multisim</Link>
        <Link to="/compare/falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/tinkercad">NodeSim vs Tinkercad</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Tutorials:</span>
        <Link to="/tutorials/rc-circuit">RC Circuit</Link>
        <Link to="/tutorials/op-amp">Op-Amp</Link>
        <Link to="/tutorials/555-timer">555 Timer</Link>
      </div>
    </div>
  );
};

export default VsCircuitlab;
