import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function RcLowPassFilter() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="RC Low Pass Filter Circuit Simulator Online | NodeSim"
        description="Simulate an RC low pass filter online. Compute cutoff frequency with f = 1/(2πRC), visualize Bode plots, and understand signal attenuation — free, no install."
        url="https://nodesimapp.com/circuits/rc-low-pass-filter"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        RC Low Pass Filter Circuit Simulator Online
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        An RC low pass filter is one of the most fundamental passive filter circuits in electronics. Built from just a resistor (R) and a capacitor (C), it allows low-frequency signals to pass through while attenuating higher frequencies above its cutoff point. This makes it indispensable in audio processing, noise suppression, signal conditioning, and analog-to-digital conversion front-ends.
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
          The RC low pass filter exploits the frequency-dependent impedance of a capacitor. At low frequencies the capacitor's reactance (X<sub>C</sub> = 1 / 2πfC) is very high, so nearly all the input voltage drops across it and appears at the output. As the signal frequency rises, X<sub>C</sub> falls, voltage increasingly divides in favour of the resistor, and the output amplitude decreases — the circuit is "filtering out" those high frequencies.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          The transition between "passed" and "attenuated" regions is characterised by the cutoff frequency f<sub>c</sub>. Below f<sub>c</sub> the output is within 3 dB of the input; above it, the filter rolls off at −20 dB per decade. In audio engineering this gentle slope is exploited to remove high-frequency hiss from recordings, while in microcontroller designs it smooths PWM signals into steady DC analogue voltages.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formula</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          f_c = 1 / (2π × R × C)
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          Where <strong>f<sub>c</sub></strong> is the −3 dB cutoff frequency in Hz, <strong>R</strong> is the resistance in Ohms (Ω), and <strong>C</strong> is the capacitance in Farads (F). For example, a 10 kΩ resistor with a 100 nF capacitor gives f<sub>c</sub> = 1 / (2π × 10 000 × 0.0000001) ≈ 159 Hz — perfect for bass-only audio processing.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × Resistor (R) — value determines cutoff with C</li>
          <li>1 × Capacitor (C) — electrolytic or ceramic depending on frequency range</li>
          <li>1 × AC voltage source (sinusoidal) for frequency-sweep testing</li>
          <li>Ground reference node</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place a <strong>Voltage Source</strong> (AC, 1 V amplitude) between node V<sub>in</sub> and GND.</li>
          <li>Drag a <strong>Resistor</strong> (10 kΩ) from V<sub>in</sub> to an intermediate node — call it V<sub>out</sub>.</li>
          <li>Place a <strong>Capacitor</strong> (100 nF) from V<sub>out</sub> to GND.</li>
          <li>Add a <strong>Voltage Probe</strong> on V<sub>out</sub> to measure the output.</li>
          <li>Run an <strong>AC sweep</strong> from 10 Hz to 100 kHz (log scale, 100 points/decade).</li>
          <li>Observe the Bode plot — the −3 dB point should appear near 159 Hz.</li>
          <li>Adjust R or C and re-run to tune your cutoff frequency interactively.</li>
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
