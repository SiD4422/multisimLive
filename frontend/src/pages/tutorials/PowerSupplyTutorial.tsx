import React from 'react';
import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';

const PowerSupplyTutorial: React.FC = () => (
  <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#1e293b', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
    <SEO
        title="Power Supply Circuit Simulator Online | NodeSim Tutorial"
        description="Simulate a full-wave bridge rectifier and linear voltage regulator online. Learn ripple voltage, filter capacitor sizing, and regulation with a free SPICE simulator."
        url="https://www.nodesimapp.com/tutorials/power-supply"
      />
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>Linear Power Supply Tutorial</h1>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>What this circuit does</h2>
      <p>A linear power supply converts AC mains to a steady DC output. It uses a transformer (step-down), a bridge rectifier (4 diodes), a filter capacitor, and a linear voltage regulator (7805 for +5V). This classic circuit powers most bench lab equipment and embedded systems.</p>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Components Needed</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li>1× AC Voltage Source (12V peak, 50Hz)</li>
        <li>4× Rectifier Diodes (1N4007)</li>
        <li>1× Filter Capacitor (1000µF electrolytic)</li>
        <li>1× Voltage Regulator (model as 3-terminal: in=unregulated DC, out=5V, GND)</li>
        <li>1× Load Resistor (100Ω)</li>
        <li>1× Ground</li>
      </ul>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>How to Build in NodeSim</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Place an AC source at 12V, 50Hz.</li>
        <li>Add 4 diodes in a bridge configuration (use the Bridge Rectifier component from Basic → Diodes).</li>
        <li>Connect a 1000µF capacitor from the rectified output to ground.</li>
        <li>Add a Voltage Regulator component representing the 7805.</li>
        <li>Connect a 100Ω load to the output.</li>
        <li>Run transient analysis for 100ms. Observe ripple on the capacitor voltage.</li>
      </ol>
    </section>
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Formulas</h2>
      <p><strong>Ripple voltage:</strong> <code>V_ripple ≈ I_L / (f × C)</code><br/>
      For I_L = 50mA, f = 100Hz (full-wave), C = 1000µF: V_ripple ≈ 0.5V<br/>
      <strong>Minimum input to regulator:</strong> V_in(min) = V_out + V_dropout (≈ 2V for 7805)</p>
    </section>
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <Link to="/simulator" style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#0f172a', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        Simulate in NodeSim →
      </Link>
    </div>
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
      <strong>Related tutorials:</strong>{' '}
      <Link to="/tutorials/diode-rectifier">Half-Wave Rectifier</Link> ·{' '}
      <Link to="/tutorials/zener-voltage-regulator" style={{ pointerEvents: 'none', color: '#9ca3af' }}>Zener Regulator</Link> ·{' '}
      <Link to="/tutorials/rc-circuit">RC Circuit</Link>
    </div>
  </div>
);
export default PowerSupplyTutorial;
