import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function CommonEmitterAmplifier() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Common Emitter BJT Amplifier Circuit Simulator | NodeSim"
        description="Simulate a common emitter BJT amplifier online. Calculate voltage gain Av = -hfe×Rc/hie, understand biasing, emitter bypass, and frequency response — free SPICE tool."
        url="https://nodesimapp.com/circuits/common-emitter-amplifier"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Common Emitter BJT Amplifier Circuit Simulator
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The common emitter (CE) amplifier is the workhorse of bipolar junction transistor (BJT) amplifier design. With the emitter terminal shared between input and output (as the "common" reference), this configuration delivers significant voltage gain, moderate input impedance, and high output impedance. It is the go-to topology for audio amplifier stages, radio-frequency preamplifiers, and general analog signal amplification in discrete BJT circuits.
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
          In the CE configuration, the base terminal receives the AC input signal (coupled via a capacitor to block DC bias), the collector is connected to V<sub>CC</sub> through a collector resistor R<sub>C</sub>, and the emitter is often bypassed to ground via a large capacitor C<sub>E</sub>. The transistor is DC-biased into its active region using a voltage divider (R1, R2) at the base, which sets a stable Q-point (quiescent operating point) largely independent of transistor β variation.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          When an AC signal is applied to the base, small variations in base current are amplified by the transistor's current gain (h<sub>FE</sub> or β) into much larger collector current variations. As collector current increases, the voltage drop across R<sub>C</sub> increases and V<sub>CE</sub> decreases — this phase inversion is characteristic of the CE stage. The emitter bypass capacitor C<sub>E</sub> short-circuits the emitter resistor R<sub>E</sub> for AC signals, preventing negative feedback and maximising the AC voltage gain.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formula</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'Voltage Gain Av = -hfe × Rc / hie'}{'\n'}
          {'Input Impedance Zin = R1 ‖ R2 ‖ hie'}{'\n'}
          {'hie = β × Vt / Ic  (Vt ≈ 26 mV at room temp)'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          <strong>h<sub>fe</sub></strong> (or β) is the AC current gain of the transistor. <strong>h<sub>ie</sub></strong> is the input impedance of the transistor (base-emitter junction). <strong>R<sub>C</sub></strong> is the collector resistor. For β = 100, I<sub>C</sub> = 1 mA: h<sub>ie</sub> = 100 × 26 mV / 1 mA = 2.6 kΩ. With R<sub>C</sub> = 4.7 kΩ, gain |A<sub>v</sub>| ≈ 181.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × NPN BJT transistor (2N2222, BC547, or 2N3904)</li>
          <li>2 × Bias resistors R1 and R2 (voltage divider for base bias, e.g., 47 kΩ / 10 kΩ)</li>
          <li>1 × Collector resistor R<sub>C</sub> (e.g., 4.7 kΩ)</li>
          <li>1 × Emitter resistor R<sub>E</sub> (e.g., 1 kΩ for thermal stability)</li>
          <li>2 × Coupling capacitors C<sub>in</sub> and C<sub>out</sub> (e.g., 10 µF, for AC coupling)</li>
          <li>1 × Bypass capacitor C<sub>E</sub> (e.g., 100 µF, bypasses R<sub>E</sub> for AC)</li>
          <li>Supply voltage V<sub>CC</sub> = 12 V</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim. Place a <strong>DC Source 12 V</strong> as V<sub>CC</sub>.</li>
          <li>Place <strong>R1 = 47 kΩ</strong> from V<sub>CC</sub> to base node, and <strong>R2 = 10 kΩ</strong> from base to GND.</li>
          <li>Place an <strong>NPN BJT (2N2222)</strong> with base connected to the voltage divider node.</li>
          <li>Connect <strong>R<sub>C</sub> = 4.7 kΩ</strong> from V<sub>CC</sub> to collector; <strong>R<sub>E</sub> = 1 kΩ</strong> from emitter to GND.</li>
          <li>Add <strong>C<sub>E</sub> = 100 µF</strong> in parallel with R<sub>E</sub>.</li>
          <li>AC-couple a 10 mV, 1 kHz source to the base via <strong>C<sub>in</sub> = 10 µF</strong>.</li>
          <li>Add <strong>C<sub>out</sub> = 10 µF</strong> from collector to output node, then a 10 kΩ load to GND.</li>
          <li>Run <strong>Transient simulation</strong> for 5 ms and measure the amplified, inverted output.</li>
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
