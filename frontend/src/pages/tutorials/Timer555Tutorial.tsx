import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Timer555Tutorial: React.FC = () => {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Helmet>
        <title>555 Timer Circuit Simulator Online | NodeSim Tutorial</title>
        <meta name="description" content="Learn how to simulate a 555 timer astable and monostable circuit online. Free browser-based SPICE simulation powered by ngspice." />
        <meta name="keywords" content="555 timer circuit simulator, 555 astable circuit online, NE555 simulation, free circuit simulator" />
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>555 Timer Circuit Tutorial</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What is a 555 Timer?</h2>
        <p>The NE555 (or LM555) is one of the most widely used ICs in electronics. It can operate in three modes: <strong>Astable</strong> (continuous oscillation), <strong>Monostable</strong> (single pulse), and <strong>Bistable</strong> (flip-flop). NodeSim includes a built-in 555 timer model you can place directly from the Digital tab of the component library.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Astable Mode — Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>1x 555 Timer IC (NE555)</li>
          <li>1x Resistor R1 = 1kOhm (pin 8 to pin 7)</li>
          <li>1x Resistor R2 = 10kOhm (pin 7 to pin 6/2)</li>
          <li>1x Capacitor C1 = 10uF (pin 6/2 to GND)</li>
          <li>1x DC Voltage Source = 9V</li>
          <li>1x Ground</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Frequency Formula</h2>
        <p>In astable mode: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>f = 1.44 / ((R1 + 2xR2) x C1)</code></p>
        <p style={{ marginTop: '1rem' }}>With R1=1kOhm, R2=10kOhm, C1=10uF: <strong>f = 6.7 Hz</strong>. Verify this in NodeSim by placing a Voltage Probe on the output pin and running Transient simulation.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Open NodeSim, go to the <strong>Digital</strong> tab in the component library.</li>
          <li>Drag a <strong>555 Timer</strong> onto the canvas.</li>
          <li>Add a <strong>9V DC Source</strong> — VCC to pin 8, GND to pin 1.</li>
          <li>Wire <strong>R1</strong> between VCC and pin 7 (DISCH).</li>
          <li>Wire <strong>R2</strong> between pin 7 and pins 6+2 (THRES + TRIG).</li>
          <li>Wire <strong>C1</strong> from pins 6+2 to GND.</li>
          <li>Connect pin 4 (RESET) to VCC to keep the timer enabled.</li>
          <li>Place a <strong>Voltage Probe</strong> on pin 3 (OUTPUT).</li>
          <li>Run <strong>Transient</strong> for 1 second and observe the square wave.</li>
        </ol>
      </section>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/simulator" style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>Simulate 555 Timer in NodeSim</Link>
      </div>

      <div className="tutorial-crosslinks">
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>More tutorials:</span>
        <Link to="/tutorials/rc-circuit">RC Circuit</Link>
        <Link to="/tutorials/op-amp">Op-Amp Amplifier</Link>
        <Link to="/tutorials/transistor-amplifier">Transistor Amplifier</Link>
        <Link to="/tutorials/rlc-circuit">RLC Circuit</Link>
        <Link to="/tutorials/diode-rectifier">Diode Rectifier</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Compare:</span>
        <Link to="/compare/ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/falstad">NodeSim vs Falstad</Link>
        <Link to="/compare/multisim">NodeSim vs Multisim</Link>
      </div>
    </div>
  );
};

export default Timer555Tutorial;
