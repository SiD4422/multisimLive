import React from 'react';
import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';

const MosfetTutorial: React.FC = () => (
  <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
    <SEO
        title="MOSFET Switch Circuit Simulator Online | NodeSim Tutorial"
        description="Learn how to simulate a MOSFET switch circuit online. Understand VGS threshold, drain current, and digital switching with a free browser SPICE simulator."
        url="https://www.nodesimapp.com/tutorials/mosfet-switch"
      />
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>MOSFET Switch Circuit Tutorial</h1>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
      <p>An N-channel MOSFET switch uses a small gate voltage to control a large current through the drain-source channel. When VGS exceeds the threshold voltage (V_th ≈ 2V for 2N7000), the MOSFET turns on, connecting the load to ground. This forms the basis of all digital logic, motor drivers, and power electronics.</p>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li>1× N-channel MOSFET (2N7000 or IRF540)</li>
        <li>1× DC Voltage Source (5V for gate, 12V for drain supply)</li>
        <li>1× Load Resistor (1kΩ on drain)</li>
        <li>1× Gate Resistor (10kΩ to limit gate current)</li>
        <li>1× Ground</li>
      </ul>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build in NodeSim</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Add a NMOS MOSFET from the Analog → Transistors tab.</li>
        <li>Connect a 12V DC source to the drain via a 1kΩ load resistor.</li>
        <li>Connect gate to a 5V DC source through a 10kΩ resistor.</li>
        <li>Connect source to Ground.</li>
        <li>Add a voltage probe at the drain. Run DC sweep from 0 to 5V on the gate source.</li>
      </ol>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas</h2>
      <p><strong>Drain current (saturation):</strong> <code>I_D = (k_n/2)(VGS - V_th)²</code><br/>
      <strong>On-resistance:</strong> <code>R_DS(on) ≈ 0.5Ω</code> (for IRF540 at VGS = 10V)<br/>
      <strong>Switching condition:</strong> MOSFET ON when VGS &gt; V_th; OFF when VGS &lt; V_th</p>
    </section>
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <Link to="/simulator" style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#0f172a', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        Simulate in NodeSim →
      </Link>
    </div>
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
      <strong>Related tutorials:</strong>{' '}
      <Link to="/tutorials/transistor-amplifier">BJT Amplifier</Link> ·{' '}
      <Link to="/tutorials/darlington-pair">Darlington Pair</Link> ·{' '}
      <Link to="/tutorials/pwm-circuit">PWM with 555 Timer</Link>
    </div>
  </div>
);
export default MosfetTutorial;
