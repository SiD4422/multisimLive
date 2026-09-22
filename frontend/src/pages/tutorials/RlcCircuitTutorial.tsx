import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const RlcCircuitTutorial: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>RLC Circuit Simulator | Resonant Frequency Simulation</title>
        <meta name="description" content="Simulate RLC circuits online. Explore resonance, damping, and AC frequency response with our free browser-based SPICE simulator." />
        <meta name="keywords" content="RLC circuit simulator, resonant frequency simulation, AC sweep, RLC transient, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>RLC Circuit Simulation</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
        <p>
          An RLC circuit consists of a Resistor, an Inductor, and a Capacitor. These components interact to create complex behaviors such as resonance and damping. RLC circuits form the basis of electronic oscillators, tuned amplifiers, and band-pass filters used in radio transmitters and receivers.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1× AC Voltage Source (or Step Input for transients)</li>
          <li>1× Resistor (R = 100Ω)</li>
          <li>1× Inductor (L = 10mH)</li>
          <li>1× Capacitor (C = 1µF)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build it in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Place an <strong>AC Source</strong> on the canvas.</li>
          <li>Connect a <strong>Resistor</strong>, <strong>Inductor</strong>, and <strong>Capacitor</strong> in series.</li>
          <li>Complete the loop back to ground.</li>
          <li>To find the resonant frequency, setup an <strong>AC Sweep</strong> (Frequency Response) from 10Hz to 10kHz.</li>
          <li>Alternatively, use a pulse source and run a <strong>Transient Analysis</strong> to observe the damped oscillations.</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Simulation Results</h2>
        <p>
          In an AC sweep, the current or voltage across the resistor will peak sharply at the resonant frequency. In transient analysis, a step input will cause the circuit to "ring" (oscillate) at the resonant frequency, with the amplitude decaying over time based on the resistor value (damping).
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas / Concepts</h2>
        <p>
          <strong>Resonant Frequency (f_r):</strong> <code>f_r = 1 / (2 * π * √(L * C))</code><br/>
          With L = 10mH and C = 1µF, the resonant frequency is approximately 1.59kHz.
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
        <Link to="/tutorials/diode-rectifier">Diode Rectifier</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Compare:</span>
        <Link to="/compare/vs-ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/vs-falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/vs-multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default RlcCircuitTutorial;
