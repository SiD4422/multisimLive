import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function FullWaveRectifier() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Full Wave Bridge Rectifier Circuit Simulator | NodeSim"
        description="Simulate a full wave bridge rectifier online. Understand how 4 diodes convert AC to DC with 81% efficiency. Compare with half wave rectifier — free SPICE simulator."
        url="https://nodesimapp.com/circuits/full-wave-rectifier"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Full Wave Rectifier Bridge Circuit Simulator
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The full wave bridge rectifier uses four diodes arranged in a bridge topology to convert both positive and negative half-cycles of an AC waveform into a smooth, pulsating DC output. With nearly double the average DC output of a half-wave rectifier and a theoretical efficiency of 81.2 %, the bridge rectifier is the standard circuit used in virtually every AC-to-DC power supply — from phone chargers to industrial motor drives.
      </p>

      {/* Simulate CTA */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>Simulate this circuit instantly</div>
          <div style={{ color: '#4b5563', fontSize: 14 }}>Free browser-based SPICE simulator — no account, no download</div>
        </div>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15, whiteSpace: 'nowrap' }}>
          Open in NodeSim →
        </Link>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>How It Works</h2>
        <p style={{ color: '#334155' }}>
          In the bridge rectifier, four diodes (D1–D4) are connected so that current always flows through the load in the same direction, regardless of which half-cycle the AC supply is in. During the positive half-cycle, current flows through D1, through the load, and back through D3. During the negative half-cycle, current flows through D2, through the load again in the same direction, and returns through D4. Both half-cycles contribute to the output, which results in a ripple frequency of twice the supply frequency (100 Hz for a 50 Hz input).
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          The output ripple is significantly lower than that of a half-wave rectifier, and a much smaller filter capacitor is required to achieve the same ripple specification. The penalty is a voltage drop of two diode forward voltages (≈1.4 V for silicon) since current always passes through two diodes in series. This makes Schottky diodes (V<sub>f</sub> ≈ 0.3 V) attractive in low-voltage high-current supplies to minimise conduction losses.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formulas</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'V_dc (avg) = 2 × V_peak / π  ≈  0.637 × V_peak'}{'\n'}
          {'Ripple Factor  γ ≈ 0.482'}{'\n'}
          {'Efficiency     η = 81.2%'}{'\n'}
          {'Ripple Freq    f_r = 2 × f_supply'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          For a 12 V<sub>rms</sub> transformer secondary: V<sub>peak</sub> ≈ 16.97 V, so V<sub>dc</sub> ≈ 10.8 V before filtering (minus ≈1.4 V diode drops = ≈9.4 V). The ripple factor of 0.482 is far better than the half-wave's 1.21, requiring much less capacitance to smooth.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>4 × Silicon diodes (1N4007 at 50 Hz mains, or Schottky 1N5819 for low-voltage designs)</li>
          <li>1 × Load resistor R<sub>L</sub> (e.g., 1 kΩ)</li>
          <li>1 × Filter capacitor C (e.g., 470 µF to achieve &lt;200 mV ripple at 100 mA load)</li>
          <li>1 × AC voltage source (sinusoidal, e.g., 12 V<sub>rms</sub> at 50 Hz)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim. Place an <strong>AC Voltage Source</strong> (12 V<sub>rms</sub>, 50 Hz) between nodes A and B.</li>
          <li>Place <strong>D1</strong> (1N4007) with anode at A, cathode at node P (positive rail).</li>
          <li>Place <strong>D2</strong> (1N4007) with anode at B, cathode at node P.</li>
          <li>Place <strong>D3</strong> (1N4007) with anode at node N (negative rail), cathode at A.</li>
          <li>Place <strong>D4</strong> (1N4007) with anode at N, cathode at B.</li>
          <li>Connect R<sub>L</sub> = 1 kΩ between P and N; set N as GND reference.</li>
          <li>Place a <strong>Voltage Probe</strong> on P. Run <strong>Transient</strong> for 60 ms.</li>
          <li>Add a 470 µF capacitor in parallel with R<sub>L</sub> and compare ripple.</li>
        </ol>
      </section>

      {/* Second CTA */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '14px 36px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
          Simulate in NodeSim — Free →
        </Link>
      </div>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>More circuit simulations:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CROSS_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: 999, fontSize: 13, textDecoration: 'none', border: '1px solid #e2e8f0', fontWeight: 500 }}>{link.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
