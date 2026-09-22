import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const OpAmpTutorial: React.FC = () => {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Helmet>
        <title>Op Amp Circuit Simulator | Inverting Amplifier Simulation</title>
        <meta name="description" content="Simulate an operational amplifier circuit online. Learn about inverting amplifiers and op-amp behavior using NodeSim." />
        <meta name="keywords" content="op amp circuit simulator, inverting amplifier simulation, operational amplifier online, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Op-Amp Circuit Simulation</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
        <p>
          The Inverting Amplifier is a standard Operational Amplifier (Op-Amp) configuration. It takes an input voltage and multiplies it by a fixed negative gain determined by two resistors. This circuit is foundational for analog signal processing, active filters, and mathematical operations in analog computing.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1× Operational Amplifier (e.g., Ideal or LM741)</li>
          <li>1× Input Resistor (R_in = 10kΩ)</li>
          <li>1× Feedback Resistor (R_f = 100kΩ)</li>
          <li>1× AC or DC Input Voltage Source</li>
          <li>Dual Power Supply (+15V, -15V) for the op-amp</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build it in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Place an <strong>Op-Amp</strong> from the component library.</li>
          <li>Connect the non-inverting terminal (+) to ground.</li>
          <li>Add <code>R_in</code> (10kΩ) in series with the input voltage source to the inverting terminal (-).</li>
          <li>Add <code>R_f</code> (100kΩ) connecting the output back to the inverting terminal (-).</li>
          <li>Apply power to the op-amp supply pins if required by the model.</li>
          <li>Run a <strong>DC Sweep</strong> or <strong>Transient Analysis</strong> to view the output.</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Simulation Results</h2>
        <p>
          With R_f = 100kΩ and R_in = 10kΩ, the circuit has a gain of -10. An input of 1V DC will yield an output of -10V DC. If an AC signal is applied, the output wave will be 10 times larger and inverted (180 degrees shifted).
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas / Concepts</h2>
        <p>
          <strong>Closed-Loop Gain (A):</strong> <code>Vout / Vin = - (R_f / R_in)</code><br/>
          <strong>Virtual Ground:</strong> The inverting input is held at approximately 0V due to negative feedback.
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
        <Link to="/tutorials/555-timer">555 Timer</Link>
        <Link to="/tutorials/rlc-circuit">RLC Circuit</Link>
        <Link to="/tutorials/diode-rectifier">Diode Rectifier</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Compare:</span>
        <Link to="/compare/vs-ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/vs-falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/vs-multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default OpAmpTutorial;
