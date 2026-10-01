import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function RlcResonance() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="RLC Series Resonance Circuit Simulator | NodeSim"
        description="Simulate RLC series resonance online. Calculate resonant frequency f = 1/(2π√LC) and Q-factor. Visualize impedance curves and peak current — free SPICE simulator."
        url="https://nodesimapp.com/circuits/rlc-resonance"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        RLC Series Resonance Circuit Simulator
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The RLC series circuit — combining a resistor, inductor, and capacitor in series — exhibits resonance at a specific frequency where the inductive and capacitive reactances cancel exactly. At this resonant frequency, the circuit impedance drops to its minimum value (equal to R alone), current peaks sharply, and energy oscillates between the magnetic field of L and the electric field of C. This phenomenon underpins radio tuning, bandpass filters, and wireless power transfer systems.
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
          At frequencies below resonance, the capacitor's reactance (X<sub>C</sub> = 1/ωC) dominates and the circuit behaves capacitively — current leads voltage. Above resonance, the inductor's reactance (X<sub>L</sub> = ωL) dominates and the circuit behaves inductively — current lags voltage. At the resonant frequency ω<sub>0</sub> = 1/√(LC), these two reactances are equal and opposite, they cancel, and the total impedance equals only the resistance R.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          The sharpness of the resonant peak is described by the quality factor Q. A high Q means the circuit responds strongly to a narrow range of frequencies — ideal for selective radio tuning. A low Q gives a broader, gentler peak, suitable for wideband bandpass filtering. In real inductors, the winding resistance limits the maximum achievable Q.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formulas</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'Resonant Frequency: f_r = 1 / (2π × √(L × C))'}{'\n'}
          {'Quality Factor:    Q  = (1/R) × √(L/C)'}{'\n'}
          {'Bandwidth:         BW = f_r / Q'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          For L = 10 mH and C = 10 nF: f<sub>r</sub> = 1 / (2π × √(0.01 × 10×10⁻⁹)) ≈ 15.9 kHz. With R = 10 Ω, Q = (1/10) × √(0.01/10×10⁻⁹) ≈ 100 — a very sharp resonance with a bandwidth of only 159 Hz.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × Resistor R (models winding resistance or external damping, e.g., 10 Ω – 1 kΩ)</li>
          <li>1 × Inductor L (e.g., 10 mH)</li>
          <li>1 × Capacitor C (e.g., 10 nF)</li>
          <li>1 × AC voltage source with swept frequency for Bode analysis</li>
          <li>Ground reference node</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place an <strong>AC Voltage Source</strong> (1 V amplitude) from GND to node V<sub>in</sub>.</li>
          <li>Place R = 10 Ω in series from V<sub>in</sub> to node N1.</li>
          <li>Place L = 10 mH in series from N1 to node N2.</li>
          <li>Place C = 10 nF from N2 back to GND, completing the series loop.</li>
          <li>Add a <strong>Current Probe</strong> on the main branch to observe resonance peak.</li>
          <li>Run an <strong>AC sweep</strong> from 1 kHz to 100 kHz (log scale).</li>
          <li>Identify the frequency where current is maximum — this is f<sub>r</sub>.</li>
          <li>Measure the 3 dB bandwidth and verify Q = f<sub>r</sub> / BW.</li>
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
