import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/tools/voltage-divider', label: 'Voltage Divider Calculator' },
  { to: '/tools/ohms-law', label: "Ohm's Law Calculator" },
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/zener-diode', label: 'Zener Diode Regulator' },
  { to: '/circuits/mosfet-switch', label: 'MOSFET Switch' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
];

export default function VoltageDividerCircuit() {
  const [vin, setVin] = useState<number>(12);
  const [r1, setR1] = useState<number>(10);
  const [r2, setR2] = useState<number>(10);

  const calculatedVout = (r1 + r2) > 0 ? (vin * r2) / (r1 + r2) : 0;

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Voltage Divider Circuit | Resistor Divider Calculator | NodeSim"
        description="Voltage divider using R1 and R2. Formula: Vout = Vin × R2/(R1+R2). Common uses: sensor biasing, ADC reference."
        url="https://www.nodesimapp.com/circuits/voltage-divider"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Voltage Divider Circuit & Resistor Calculator
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        A voltage divider is one of the most essential building blocks in electronic circuit design. By placing two resistors in series across a voltage source, it scales down a higher input voltage to a lower, predictable output voltage. Voltage dividers are widely employed in analog sensor biasing, ADC reference level scaling, potentiometer attenuators, and transistor bias networks.
      </p>

      {/* Simulate CTA */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>Simulate Voltage Divider in real time</div>
          <div style={{ color: '#4b5563', fontSize: 14 }}>Free browser-based SPICE simulator — no account or installation required</div>
        </div>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15, whiteSpace: 'nowrap' }}>
          Simulate Voltage Divider →
        </Link>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>How It Works</h2>
        <p style={{ color: '#334155' }}>
          When an electrical current flows through two series resistors R<sub>1</sub> and R<sub>2</sub>, the same current <em>I</em> passes through both components. According to Ohm's law, the total current drawn from the input source is:
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b', margin: '1rem 0' }}>
          I = V<sub>in</sub> / (R<sub>1</sub> + R<sub>2</sub>)
        </div>
        <p style={{ color: '#334155' }}>
          The output voltage V<sub>out</sub> is tapped across resistor R<sub>2</sub>. Applying Ohm's law across R<sub>2</sub> gives:
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b', margin: '1rem 0' }}>
          V<sub>out</sub> = I × R<sub>2</sub> = V<sub>in</sub> × [R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)]
        </div>
        <p style={{ color: '#334155' }}>
          When R<sub>1</sub> and R<sub>2</sub> are equal (for instance, 10 kΩ and 10 kΩ), the division ratio is exactly 0.5, halving the input voltage from 12 V down to 6 V.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Interactive Formula & Example</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#16a34a', fontWeight: 700, marginBottom: '1rem' }}>
            V<sub>out</sub> = V<sub>in</sub> × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b', marginBottom: '1.5rem' }}>
            V<sub>out</sub> = {vin}V × {r2}kΩ / ({r1}kΩ + {r2}kΩ) = {calculatedVout.toFixed(2)}V
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Input Voltage V<sub>in</sub> (V):
              </label>
              <input
                type="number"
                value={vin}
                onChange={(e) => setVin(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Resistor R<sub>1</sub> (kΩ):
              </label>
              <input
                type="number"
                value={r1}
                min="0.1"
                step="0.5"
                onChange={(e) => setR1(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Resistor R<sub>2</sub> (kΩ):
              </label>
              <input
                type="number"
                value={r2}
                min="0.1"
                step="0.5"
                onChange={(e) => setR2(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: 14, color: '#64748b' }}>
            Standard values: 12 V input with R<sub>1</sub> = 10 kΩ and R<sub>2</sub> = 10 kΩ yields exactly <strong>6.00 V</strong>.
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>The Loading Effect (Important Consideration)</h2>
        <p style={{ color: '#334155' }}>
          The standard voltage divider formula assumes zero output current (ideal open-circuit condition). When you attach a load resistor R<sub>L</sub> in parallel with R<sub>2</sub>, the equivalent lower branch resistance drops to:
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b', margin: '1rem 0' }}>
          R<sub>eq</sub> = (R<sub>2</sub> × R<sub>L</sub>) / (R<sub>2</sub> + R<sub>L</sub>)
        </div>
        <p style={{ color: '#334155' }}>
          Because R<sub>eq</sub> &lt; R<sub>2</sub>, the loaded output voltage will be lower than predicted. To maintain voltage accuracy without significant loading distortion:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155', marginTop: '0.5rem' }}>
          <li>Choose divider resistors such that R<sub>2</sub> is at least 10× smaller than the load impedance R<sub>L</sub>.</li>
          <li>Alternatively, buffer the divider output using an op-amp voltage follower to present near-infinite input impedance to the divider while driving low-impedance loads.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Component</th>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Value / Spec</th>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Role in Circuit</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Resistor R<sub>1</sub></td>
                <td style={{ padding: '10px 14px' }}>10 kΩ (1/4 W)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Upper branch resistor in series with R<sub>2</sub></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Resistor R<sub>2</sub></td>
                <td style={{ padding: '10px 14px' }}>10 kΩ (1/4 W)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Lower branch resistor across which V<sub>out</sub> is measured</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>DC Voltage Source</td>
                <td style={{ padding: '10px 14px' }}>12 V DC</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Provides input voltage V<sub>in</sub></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Voltage Probe</td>
                <td style={{ padding: '10px 14px' }}>Node Probe</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Measures output voltage V<sub>out</sub> relative to GND</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Ground (GND)</td>
                <td style={{ padding: '10px 14px' }}>0 V reference</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Common reference node for SPICE simulation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place a <strong>DC Voltage Source</strong> set to <strong>12 V</strong> between node V<sub>in</sub> and GND.</li>
          <li>Place <strong>Resistor R<sub>1</sub> (10 kΩ)</strong> connected between V<sub>in</sub> and intermediate node V<sub>out</sub>.</li>
          <li>Place <strong>Resistor R<sub>2</sub> (10 kΩ)</strong> connected between node V<sub>out</sub> and GND.</li>
          <li>Attach a <strong>Voltage Probe</strong> on node V<sub>out</sub>.</li>
          <li>Click <strong>Run</strong> to execute a DC Operating Point analysis.</li>
          <li>Verify that V<sub>out</sub> reads exactly <strong>6.00 V</strong> in the simulation panel.</li>
          <li>Connect an extra load resistor R<sub>L</sub> in parallel with R<sub>2</sub> to observe the loading effect first-hand!</li>
        </ol>
      </section>

      {/* Second CTA */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '14px 36px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
          Simulate Voltage Divider — Free →
        </Link>
      </div>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Related circuits & tools:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CROSS_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: 999, fontSize: 13, textDecoration: 'none', border: '1px solid #e2e8f0', fontWeight: 500 }}>{link.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
