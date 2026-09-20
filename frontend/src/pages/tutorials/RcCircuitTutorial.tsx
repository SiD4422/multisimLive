import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const RcCircuitTutorial: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>RC Circuit Simulator Online | NodeSim Tutorial</title>
        <meta name="description" content="Learn how to simulate an RC circuit online. Understand the RC time constant and transient response using our free browser-based simulator." />
        <meta name="keywords" content="RC circuit simulator online, RC time constant, RC transient analysis, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>RC Circuit Simulator Tutorial</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
        <p>
          A Resistor-Capacitor (RC) circuit demonstrates fundamental concepts of electronics, including the charging and discharging phases of a capacitor. When connected to a DC voltage source, the capacitor charges through the resistor over time. This creates a predictable curve governed by the RC time constant, commonly used in timing applications and simple filters.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1× DC Voltage Source (e.g., 5V Pulse or Step)</li>
          <li>1× Resistor (R = 1kΩ)</li>
          <li>1× Capacitor (C = 1µF)</li>
          <li>1× Ground connection</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build it in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Open the NodeSim workspace.</li>
          <li>Place a <strong>Voltage Source</strong> from the toolbar. Configure it as a Pulse source (0 to 5V).</li>
          <li>Add a <strong>Resistor</strong> and set its value to <code>1k</code>.</li>
          <li>Add a <strong>Capacitor</strong> and set its value to <code>1u</code>.</li>
          <li>Connect the source to the resistor, the resistor to the capacitor, and complete the circuit to <strong>Ground</strong>.</li>
          <li>Run a <strong>Transient Analysis</strong> for 10ms to observe the charging curve.</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Simulation Results</h2>
        <p>
          In the transient analysis, the voltage across the capacitor will initially be 0V and will exponentially rise towards 5V. It reaches approximately 63.2% of the maximum voltage (3.16V) at exactly one time constant.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas / Concepts</h2>
        <p>
          <strong>Time Constant (τ):</strong> <code>τ = R × C</code><br/>
          For R = 1kΩ and C = 1µF, τ = 1ms.<br/>
          <strong>Charging Equation:</strong> <code>V(t) = V₀(1 - e^(-t/τ))</code>
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
    </div>
  );
};

export default RcCircuitTutorial;
