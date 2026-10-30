import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
  { to: '/circuits/voltage-divider', label: 'Voltage Divider Circuit' },
  { to: '/circuits/zener-diode', label: 'Zener Diode Regulator' },
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
];

export default function MosfetSwitchCircuit() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="MOSFET Switch Circuit | N-Channel MOSFET as Switch | NodeSim"
        description="N-channel MOSFET used as a digital switch/inverter. Gate controls drain-source current."
        url="https://www.nodesimapp.com/circuits/mosfet-switch"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        MOSFET Switch Circuit: N-Channel Enhancement MOSFET
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        An N-channel enhancement-mode MOSFET makes an ideal solid-state electronic switch. Controlled purely by voltage applied to its insulated gate terminal, it draws virtually zero static gate current while delivering high switching speeds and minimal on-state conduction loss. It is universally used in digital logic inverters, microcontroller load switches, motor controllers, and power converters.
      </p>

      {/* Simulate CTA */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>Simulate MOSFET Switch in real time</div>
          <div style={{ color: '#4b5563', fontSize: 14 }}>Full SPICE transient switching analysis directly in your browser</div>
        </div>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15, whiteSpace: 'nowrap' }}>
          Simulate MOSFET Switch →
        </Link>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>How It Works: Gate-Controlled Switching</h2>
        <p style={{ color: '#334155' }}>
          In an N-channel enhancement MOSFET (such as the standard 2N7000), the conductive channel between drain (D) and source (S) does not exist when the gate-to-source voltage V<sub>gs</sub> is zero. The device defaults to an open circuit (OFF state).
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          Applying a positive voltage V<sub>gs</sub> above the threshold voltage V<sub>th</sub> attracts electrons toward the silicon dioxide gate dielectric, creating an n-type inversion channel. Current can now freely flow between drain and source. When a pull-up load resistor is connected from drain to +5 V, the circuit behaves as an inverter:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155', marginTop: '0.5rem' }}>
          <li><strong>Gate Input LOW (0 V):</strong> Switch is OFF. No drain current flows (I<sub>d</sub> ≈ 0). Output V<sub>out</sub> is pulled HIGH to 5 V.</li>
          <li><strong>Gate Input HIGH (5 V):</strong> Switch is ON. Channel conducts heavily, pulling output V<sub>out</sub> down close to 0 V (LOW).</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>MOSFET Operating Regions & Key Formulas</h2>
        <p style={{ color: '#334155' }}>
          Unlike bipolar junction transistors (BJTs) which are current-driven, a MOSFET operates in three distinct regions determined by gate-to-source voltage V<sub>gs</sub> and drain-to-source voltage V<sub>ds</sub>:
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 15, color: '#1e293b' }}>
          {'1. Cutoff Region (Switch OFF):'}{'\n'}
          {'   V_gs < V_th  ==>  I_d ≈ 0,  V_out ≈ V_dd'}{'\n\n'}
          {'2. Triode / Linear Region (Switch ON):'}{'\n'}
          {'   V_gs > V_th  and  V_ds < (V_gs - V_th)'}{'\n'}
          {'   I_d = μ × C_ox × (W/L) × [(V_gs - V_th) × V_ds - 0.5 × V_ds²]'}{'\n'}
          {'   V_ds(on) = I_d × R_ds(on)  ≈ 0 V'}{'\n\n'}
          {'3. Saturation Region (Transition Phase):'}{'\n'}
          {'   V_gs > V_th  and  V_ds ≥ (V_gs - V_th)'}{'\n'}
          {'   I_d = 0.5 × μ × C_ox × (W/L) × (V_gs - V_th)²'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          <strong>Threshold Voltage (V<sub>th</sub>):</strong> For the 2N7000 NMOS, V<sub>th</sub> is typically between 1.5 V and 2.5 V. Driving the gate with a 5 V digital signal ensures the MOSFET is driven firmly into the triode region with low on-state channel resistance.
        </p>
        <p style={{ marginTop: '0.5rem', color: '#334155' }}>
          <strong>On-State Resistance (R<sub>ds(on)</sub>):</strong> Modern MOSFETs feature very low on-state resistance (ranging from &lt;5 Ω for small-signal parts like 2N7000 down to milliohms for power MOSFETs). Conduction power loss is minimal: P<sub>loss</sub> = I<sub>d</sub><sup>2</sup> × R<sub>ds(on)</sub>.
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
                <th style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>Role in Circuit</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>N-Channel MOSFET</td>
                <td style={{ padding: '10px 14px' }}>2N7000 (V<sub>ds(max)</sub> = 60 V, I<sub>d</sub> = 200 mA)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Primary low-side switching transistor</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Pull-Up Load Resistor</td>
                <td style={{ padding: '10px 14px' }}>10 kΩ (1/4 W)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Pulls output up to 5 V rail when switch is OFF</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Supply Voltage (V<sub>dd</sub>)</td>
                <td style={{ padding: '10px 14px' }}>5 V DC</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Power rail for load and output signal</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Gate Signal Source</td>
                <td style={{ padding: '10px 14px' }}>0–5 V Pulse / Square wave (1 kHz)</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Simulates microcontroller GPIO digital control signal</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>Ground (GND)</td>
                <td style={{ padding: '10px 14px' }}>0 V reference</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>Common reference node connected to Source</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place an <strong>N-channel MOSFET (2N7000)</strong> onto the canvas.</li>
          <li>Connect the <strong>Source (S)</strong> terminal directly to the GND node.</li>
          <li>Connect a <strong>DC Voltage Source (5 V)</strong> between the V<sub>dd</sub> rail and GND.</li>
          <li>Place a <strong>10 kΩ Resistor</strong> between the 5 V rail and the MOSFET <strong>Drain (D)</strong>. Label the drain node as V<sub>out</sub>.</li>
          <li>Place a <strong>Pulse Voltage Source</strong> (0 V to 5 V, 1 kHz square wave, 50% duty cycle) between Gate (G) and GND.</li>
          <li>Attach a probe to Gate (V<sub>in</sub>) and another probe to Drain (V<sub>out</sub>).</li>
          <li>Run a <strong>Transient Simulation</strong> for 3 ms.</li>
          <li>Observe the digital inversion in the Grapher: when V<sub>in</sub> goes HIGH (5 V), V<sub>out</sub> drops instantly to ~0 V; when V<sub>in</sub> goes LOW (0 V), V<sub>out</sub> pulls up to 5 V.</li>
        </ol>
      </section>

      {/* Second CTA */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '14px 36px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
          Simulate MOSFET Switch — Free →
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
