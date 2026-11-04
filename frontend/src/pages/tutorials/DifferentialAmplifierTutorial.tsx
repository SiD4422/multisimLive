import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DifferentialAmplifierTutorial: React.FC = () => (
  <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
    <Helmet>
      <title>Differential Amplifier Simulator Online | NodeSim Tutorial</title>
      <meta name="description" content="Simulate an op-amp differential amplifier online. Learn CMRR, gain calculation, and noise rejection with a free browser-based SPICE circuit simulator." />
      <meta name="keywords" content="differential amplifier simulator, op-amp diff amp online, CMRR tutorial, instrumentation amplifier, free SPICE simulator" />
    </Helmet>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Differential Amplifier Tutorial</h1>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
      <p>A differential amplifier amplifies the <em>difference</em> between two input signals while rejecting common-mode signals (noise). Built with an op-amp and four resistors, it forms the core of instrumentation amplifiers, ADC front-ends, and sensor readout circuits. The LM741 or TL071 are classic choices for this topology.</p>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li>1× Op-Amp (LM741 or TL071 with ±15V supplies)</li>
        <li>2× Input Resistors R1 = R3 = 10kΩ</li>
        <li>2× Feedback Resistors R2 = R4 = 100kΩ</li>
        <li>2× AC/DC Voltage Sources for V+ and V-</li>
        <li>1× Ground</li>
      </ul>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build in NodeSim</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Place a 5-terminal Op-Amp from Analog → Op-Amps. Set supplies to ±15V.</li>
        <li>Connect V1 (1V DC) → R1 (10k) → inverting input (−).</li>
        <li>Connect V2 (2V DC) → R3 (10k) → non-inverting input (+).</li>
        <li>Connect R2 (100k) from output back to inverting input (feedback).</li>
        <li>Connect R4 (100k) from non-inverting input to ground.</li>
        <li>Add voltage probe at output. Run DC operating point (.op).</li>
      </ol>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas</h2>
      <p><strong>Differential gain:</strong> <code>A_d = R2/R1 = 100k/10k = 10</code><br/>
      <strong>Output voltage:</strong> <code>V_out = A_d × (V+ − V−) = 10 × (2 − 1) = 10V</code><br/>
      <strong>CMRR:</strong> <code>CMRR = 20 × log₁₀(A_d / A_cm)</code> — higher is better (typically &gt;80dB)</p>
    </section>
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <Link to="/simulator" style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#0f172a', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        Simulate in NodeSim →
      </Link>
    </div>
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
      <strong>Related tutorials:</strong>{' '}
      <Link to="/tutorials/op-amp">Inverting Op-Amp</Link> ·{' '}
      <Link to="/tutorials/voltage-follower">Voltage Follower</Link> ·{' '}
      <Link to="/tutorials/active-filter">Active Filter</Link>
    </div>
  </div>
);
export default DifferentialAmplifierTutorial;
