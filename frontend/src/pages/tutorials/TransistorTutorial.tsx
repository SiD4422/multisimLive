import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const TransistorTutorial: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', lineHeight: '1.6' }}>
      <Helmet>
        <title>Transistor Amplifier Simulation | Common Emitter Circuit</title>
        <meta name="description" content="Learn how to simulate a common emitter transistor amplifier circuit online using NodeSim." />
        <meta name="keywords" content="transistor amplifier simulation, common emitter circuit, BJT simulator online, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Transistor Amplifier Simulation</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
        <p>
          The Common Emitter (CE) amplifier is one of the most basic and widely used BJT (Bipolar Junction Transistor) circuit configurations. It takes a small AC input signal and amplifies it to produce a larger AC output signal. The output is inverted (180 degrees out of phase) relative to the input.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1× NPN Transistor (e.g., 2N3904)</li>
          <li>1× DC Power Supply (Vcc = 12V)</li>
          <li>1× AC Signal Source (Vin = 10mV peak, 1kHz)</li>
          <li>Resistors for biasing (e.g., R1=47kΩ, R2=10kΩ, Rc=4.7kΩ, Re=1kΩ)</li>
          <li>Coupling and Bypass Capacitors (C1=10µF, C2=10µF, Ce=47µF)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build it in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Place an <strong>NPN Transistor</strong> in the workspace.</li>
          <li>Set up the voltage divider bias using R1 and R2 at the base.</li>
          <li>Connect Rc to the collector and Re to the emitter.</li>
          <li>Add coupling capacitors (C1 at base, C2 at collector) and the bypass capacitor (Ce across Re).</li>
          <li>Connect the AC source to the input through C1, and wire the Vcc and Ground lines.</li>
          <li>Run a <strong>Transient Analysis</strong> for 5ms to see the waveform amplification.</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Simulation Results</h2>
        <p>
          In the transient plot, you should see a small 10mV input sine wave and a significantly larger, inverted output sine wave (typically a few volts, depending on the gain). The DC bias points should show the transistor operating in the active region.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas / Concepts</h2>
        <p>
          <strong>Voltage Gain (Av):</strong> <code>Av ≈ -Rc / re'</code> (with bypass capacitor)<br/>
          <strong>Phase Shift:</strong> 180 degrees between input and output.
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

export default TransistorTutorial;
