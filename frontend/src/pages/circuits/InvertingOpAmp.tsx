import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function InvertingOpAmp() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Inverting Op-Amp Amplifier Circuit Simulation | NodeSim"
        description="Simulate an inverting op-amp amplifier online. Calculate voltage gain with Gain = -Rf/Rin, explore virtual ground, LM741 SPICE model — free, no install needed."
        url="https://nodesimapp.com/circuits/inverting-op-amp"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Inverting Op-Amp Amplifier Circuit Simulation
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The inverting operational amplifier (op-amp) configuration is a cornerstone of analog circuit design. Using just two resistors and an op-amp such as the LM741 or TL071, you can precisely set the voltage gain while simultaneously inverting the polarity of the input signal. This topology is ubiquitous in audio pre-amplifiers, instrumentation circuits, active filter stages, and signal-conditioning chains.
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
          In the inverting configuration, the input signal is applied through a resistor R<sub>in</sub> to the op-amp's inverting (−) input. The non-inverting (+) input is tied to ground. A feedback resistor R<sub>f</sub> connects the output back to the inverting input. Due to the enormous open-loop gain of the op-amp (typically 100 dB+), the differential input voltage is driven to nearly zero — the so-called "virtual ground" principle — forcing the inverting input to stay at 0 V.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          This virtual ground means that all of the input current (V<sub>in</sub> / R<sub>in</sub>) must flow through R<sub>f</sub>. Consequently, the output voltage equals −(R<sub>f</sub> / R<sub>in</sub>) × V<sub>in</sub>. The negative sign reflects the phase inversion — a positive input produces a negative output. The beauty of this design is that the closed-loop gain depends only on passive resistor ratios, making it extremely stable and predictable even across temperature variations.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formula</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          Gain (Av) = −Rf / Rin
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          <strong>R<sub>f</sub></strong> is the feedback resistor and <strong>R<sub>in</sub></strong> is the input resistor. For a gain of −10, use R<sub>f</sub> = 100 kΩ and R<sub>in</sub> = 10 kΩ. The bandwidth shrinks with increasing gain according to the Gain-Bandwidth Product (GBW) of the specific op-amp — always check the datasheet to confirm the circuit stays within the useful frequency range.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × Op-Amp (LM741, TL071, LM358, or ideal op-amp for SPICE analysis)</li>
          <li>1 × Input resistor R<sub>in</sub> (e.g., 10 kΩ)</li>
          <li>1 × Feedback resistor R<sub>f</sub> (e.g., 100 kΩ for ×10 gain)</li>
          <li>Dual-rail supply: +15 V and −15 V (or +5 V / −5 V for rail-to-rail op-amps)</li>
          <li>1 × AC or DC signal source at the input</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place an <strong>Op-Amp</strong> element on the canvas.</li>
          <li>Connect a <strong>DC voltage source (+15 V)</strong> to V+ and a <strong>−15 V source</strong> to V−.</li>
          <li>Wire R<sub>in</sub> = 10 kΩ between the signal source node and the inverting (−) input.</li>
          <li>Wire R<sub>f</sub> = 100 kΩ from the output back to the inverting (−) input.</li>
          <li>Tie the non-inverting (+) input directly to GND.</li>
          <li>Place a <strong>Voltage Probe</strong> at the output node.</li>
          <li>Apply a 1 kHz, 0.5 V sinusoidal input and run a <strong>Transient simulation</strong> for 3 ms.</li>
          <li>Verify the output is 5 V amplitude and 180° out of phase with the input.</li>
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
