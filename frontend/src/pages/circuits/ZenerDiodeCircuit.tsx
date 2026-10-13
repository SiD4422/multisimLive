import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
  { to: '/circuits/voltage-divider', label: 'Voltage Divider Circuit' },
  { to: '/circuits/mosfet-switch', label: 'MOSFET Switch' },
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
];

export default function ZenerDiodeCircuit() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Zener Diode Voltage Regulator Circuit | NodeSim"
        description="Zener diode used as a voltage regulator/clamp. Shows how a Zener maintains a stable output voltage."
        url="https://nodesimapp.com/circuits/zener-diode"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Zener Diode Voltage Regulator Circuit Simulation
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        A Zener diode voltage regulator is a simple yet effective shunt regulator circuit that maintains a stable, constant DC output voltage across a load despite fluctuations in supply voltage or load current. Operating in its reverse breakdown region, the Zener diode clamps voltage to a specified nominal level, making it a staple for voltage references, waveform clippers, and low-power power supplies.
      </p>

      {/* Simulate CTA */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>Simulate Zener Regulator in your browser</div>
          <div style={{ color: '#4b5563', fontSize: 14 }}>Real SPICE diode breakdown models — instant interactive simulation</div>
        </div>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15, whiteSpace: 'nowrap' }}>
          Simulate Zener Regulator →
        </Link>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>How It Works: The Reverse Breakdown Region</h2>
        <p style={{ color: '#334155' }}>
          Unlike standard silicon PN diodes that are designed to conduct exclusively in the forward direction, a Zener diode is heavily doped and designed specifically to operate continuously in its reverse breakdown region.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          When connected in reverse bias with an input voltage higher than its breakdown voltage V<sub>z</sub>, the diode enters controlled avalanche or quantum tunneling (Zener breakdown). In this region, the I-V curve becomes nearly vertical: substantial changes in current result in almost imperceptible changes in voltage across the diode. By placing a series current-limiting resistor R<sub>s</sub> ahead of the diode, the excess voltage (V<sub>in</sub> − V<sub>z</sub>) drops across R<sub>s</sub>, keeping the output clamped at V<sub>z</sub>.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formulas & Series Resistor Calculation</h2>
        <p style={{ color: '#334155' }}>
          To ensure proper regulation without burning the diode or falling below the breakdown knee current, the series resistor R<sub>s</sub> must be correctly sized:
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b' }}>
          {'R_s = (V_in - V_z) / I_total'}{'\n'}
          {'I_total = I_z + I_load'}{'\n'}
          {'I_load = V_z / R_load'}{'\n'}
          {'P_z = V_z × I_z  (must not exceed P_z(max))'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          <strong>Practical Example:</strong> Consider an unregulated 12 V input regulated down to 5.1 V using a 1N4733A Zener diode:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155', marginTop: '0.5rem' }}>
          <li>Input Voltage: V<sub>in</sub> = 12 V</li>
          <li>Zener Nominal Voltage: V<sub>z</sub> = 5.1 V</li>
          <li>Voltage drop across series resistor: V<sub>Rs</sub> = 12 V − 5.1 V = 6.9 V</li>
          <li>With R<sub>s</sub> = 470 Ω: Total current I<sub>s</sub> = 6.9 V / 470 Ω ≈ 14.68 mA</li>
          <li>Connected load R<sub>L</sub> = 1 kΩ draws: I<sub>load</sub> = 5.1 V / 1 kΩ = 5.1 mA</li>
          <li>Zener diode shunts the remaining current: I<sub>z</sub> = 14.68 mA − 5.1 mA = 9.58 mA, which is well within the healthy regulation zone.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Load & Line Regulation</h2>
        <p style={{ color: '#334155' }}>
          <strong>Line Regulation:</strong> If V<sub>in</sub> fluctuates (for example, from 10 V to 14 V), the series current I<sub>s</sub> changes accordingly. Because the dynamic resistance r<sub>z</sub> of the 1N4733A is very low (≈7 Ω), almost all of the additional current is absorbed by the Zener diode, while V<sub>out</sub> changes by mere millivolts.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          <strong>Load Regulation:</strong> When the load draws more current (lower R<sub>L</sub>), current is redirected from the Zener to the load (I<sub>z</sub> decreases as I<sub>load</sub> increases). As long as I<sub>z</sub> remains above the minimum knee current I<sub>zk</sub> (typically 0.25 to 1 mA), regulation is maintained.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Component</th>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Value / Model</th>
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Function</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Zener Diode</td>
                <td style={{ padding: '10px 14px' }}>1N4733A (5.1 V, 1 W)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Shunt voltage clamp maintaining stable 5.1 V output</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Series Resistor (R<sub>s</sub>)</td>
                <td style={{ padding: '10px 14px' }}>470 Ω (1/2 W)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Limits current and absorbs excess input voltage</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>DC Input Source</td>
                <td style={{ padding: '10px 14px' }}>12 V DC</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Unregulated DC power supply rail</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Load Resistor (R<sub>L</sub>)</td>
                <td style={{ padding: '10px 14px' }}>1 kΩ</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Simulates output load drawing current from the regulator</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Ground (GND)</td>
                <td style={{ padding: '10px 14px' }}>0 V reference</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Common circuit reference point</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place a <strong>DC Voltage Source</strong> (12 V) with negative terminal to GND and positive to node V<sub>in</sub>.</li>
          <li>Place a <strong>Resistor (470 Ω)</strong> between node V<sub>in</sub> and node V<sub>out</sub>.</li>
          <li>Place a <strong>Zener Diode (1N4733A)</strong>: orient with cathode at node V<sub>out</sub> and anode at GND (reverse-biased).</li>
          <li>Place a <strong>Load Resistor (1 kΩ)</strong> in parallel with the Zener diode between V<sub>out</sub> and GND.</li>
          <li>Place a <strong>Voltage Probe</strong> at node V<sub>out</sub> and an <strong>Ammeter probe</strong> in series with the Zener diode.</li>
          <li>Run a <strong>DC Operating Point</strong> analysis and observe that V<sub>out</sub> settles tightly around 5.1 V.</li>
          <li>Perform a <strong>DC Sweep</strong> of V<sub>in</sub> from 0 V to 20 V to plot the breakdown curve and witness the regulation threshold.</li>
        </ol>
      </section>

      {/* Second CTA */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '14px 36px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
          Simulate Zener Regulator — Free →
        </Link>
      </div>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Related circuits:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CROSS_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: 999, fontSize: 13, textDecoration: 'none', border: '1px solid #e2e8f0', fontWeight: 500 }}>{link.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
