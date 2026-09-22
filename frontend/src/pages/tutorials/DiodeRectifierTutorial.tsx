import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DiodeRectifierTutorial: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>Diode Rectifier Simulator | Half Wave Rectifier Simulation</title>
        <meta name="description" content="Simulate diode rectifier circuits online. Learn how a half-wave rectifier converts AC to DC with our interactive SPICE simulator." />
        <meta name="keywords" content="diode rectifier simulator, half wave rectifier simulation, AC to DC, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Diode Rectifier Simulation</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
        <p>
          A Half-Wave Rectifier is the simplest form of AC-to-DC conversion. It uses a single diode to allow current to pass only during the positive half-cycle of an AC input signal, blocking the negative half-cycle. Adding a smoothing capacitor filters the output into a more steady DC voltage.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1× AC Voltage Source (e.g., 10V peak, 50Hz/60Hz)</li>
          <li>1× Rectifier Diode (e.g., 1N4007)</li>
          <li>1× Load Resistor (R = 1kΩ)</li>
          <li>1× Smoothing Capacitor (Optional, C = 470µF)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build it in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Place an <strong>AC Source</strong> on the schematic.</li>
          <li>Connect a <strong>Diode</strong> in series with the AC source.</li>
          <li>Add a <strong>Resistor</strong> (1kΩ) acting as the load.</li>
          <li>To see smoothing, add a <strong>Capacitor</strong> in parallel with the load resistor.</li>
          <li>Wire everything back to a common ground.</li>
          <li>Run a <strong>Transient Analysis</strong> for 50ms (or a few cycles of your AC frequency).</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Simulation Results</h2>
        <p>
          Without the capacitor, the output voltage will look like the positive halves of a sine wave, with a small drop (~0.7V) due to the diode's forward voltage. With the capacitor added in parallel to the load, the output becomes a DC voltage with a small "ripple" as the capacitor discharges between cycles.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas / Concepts</h2>
        <p>
          <strong>Peak Output Voltage:</strong> <code>Vout_peak ≈ Vin_peak - 0.7V</code><br/>
          <strong>Ripple Voltage:</strong> Decreases as capacitance (C) or load resistance (R) increases.
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
          Simulate in NodeSim →
        </Link>
      </div>
      {/* Cross-links for SEO and navigation */}
      <div className="tutorial-crosslinks">
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>More tutorials:</span>
        <Link to="/tutorials/rc-circuit">RC Circuit</Link>
        <Link to="/tutorials/op-amp">Op-Amp Amplifier</Link>
        <Link to="/tutorials/555-timer">555 Timer</Link>
        <Link to="/tutorials/rlc-circuit">RLC Circuit</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Compare:</span>
        <Link to="/compare/vs-ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/vs-falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/vs-multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default DiodeRectifierTutorial;
