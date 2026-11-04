import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VoltageFollowerTutorial: React.FC = () => (
  <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
    <Helmet>
      <title>Voltage Follower (Unity Gain Buffer) Simulator | NodeSim Tutorial</title>
      <meta name="description" content="Simulate an op-amp voltage follower online. Learn unity gain, impedance matching, and buffering with a free browser-based SPICE circuit simulator." />
      <meta name="keywords" content="voltage follower simulator, unity gain buffer op-amp, impedance matching circuit, op-amp buffer tutorial, free SPICE online" />
    </Helmet>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Voltage Follower (Buffer) Tutorial</h1>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
      <p>A voltage follower (unity-gain buffer) is the simplest op-amp circuit. The output equals the input (gain = 1), but the circuit provides near-infinite input impedance and near-zero output impedance. This lets you connect a sensitive source (e.g. a sensor) to a load without loading it down.</p>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li>1× Op-Amp (LM741, TL071, or LM358)</li>
        <li>1× DC or AC input voltage source</li>
        <li>1× ±15V supply (for the op-amp)</li>
        <li>1× Load resistor (1kΩ) to observe output</li>
        <li>1× Ground</li>
      </ul>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build in NodeSim</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Place a 5-terminal Op-Amp. Connect ±15V to the supply pins.</li>
        <li>Connect the input voltage source (e.g. 3V DC) to the non-inverting (+) input.</li>
        <li>Connect the output directly back to the inverting (−) input — this is the unity-gain feedback connection.</li>
        <li>Connect a 1kΩ load from output to ground. Add voltage probe at output.</li>
        <li>Run DC operating point (.op). Output should match input exactly.</li>
      </ol>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas</h2>
      <p><strong>Gain:</strong> <code>A_v = 1 + R_f/R_1 = 1 + 0/∞ = 1</code> (no resistors needed — direct feedback)<br/>
      <strong>Input impedance:</strong> <code>Z_in ≈ A_ol × R_in(diff) ≈ very high (GΩ range)</code><br/>
      <strong>Output impedance:</strong> <code>Z_out ≈ R_out / A_ol ≈ milliohms</code></p>
    </section>
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <Link to="/simulator" style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#0f172a', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        Simulate in NodeSim →
      </Link>
    </div>
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
      <strong>Related tutorials:</strong>{' '}
      <Link to="/tutorials/op-amp">Inverting Op-Amp</Link> ·{' '}
      <Link to="/tutorials/differential-amplifier">Differential Amplifier</Link> ·{' '}
      <Link to="/tutorials/active-filter">Sallen-Key Active Filter</Link>
    </div>
  </div>
);
export default VoltageFollowerTutorial;
