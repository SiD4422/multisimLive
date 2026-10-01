import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/555-timer-astable', label: '555 Timer Astable' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function DiodeHalfWaveRectifier() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Half Wave Rectifier Circuit Simulation Online | NodeSim"
        description="Simulate a half wave rectifier online. See how a single diode converts AC to pulsating DC. Measure peak voltage, ripple factor, and efficiency — free SPICE simulator."
        url="https://nodesimapp.com/circuits/half-wave-rectifier"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Half Wave Rectifier Circuit Simulation Online
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The half wave rectifier is the simplest circuit for converting alternating current (AC) into pulsating direct current (DC). Using a single diode, it allows only the positive half-cycles of the AC waveform to pass, blocking negative half-cycles completely. While its efficiency is limited compared to full-wave designs, it is invaluable as a teaching circuit and appears in low-power applications such as signal demodulation and simple battery chargers.
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
          During the positive half-cycle of the AC input, the anode of the diode is at a higher potential than the cathode, so the diode is forward-biased and conducts. Current flows through the load resistor R<sub>L</sub>, and the output voltage mirrors the input minus the small forward-voltage drop (≈0.7 V for silicon diodes). During the negative half-cycle, the diode is reverse-biased and blocks current — the output stays at approximately 0 V, producing the characteristic "pulsed" DC waveform.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          Adding a smoothing capacitor in parallel with the load resistor fills in the gaps between pulses, significantly reducing voltage ripple. The ripple voltage V<sub>r</sub> ≈ V<sub>peak</sub> / (f × R<sub>L</sub> × C) can be calculated to select an appropriate capacitor. The efficiency of a half-wave rectifier is theoretically 40.6 % — much lower than the 81.2 % achievable with a full-wave bridge, which is why full-wave rectifiers are preferred in practical power supplies.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formulas</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'V_dc (avg) = V_peak / π  ≈  0.318 × V_peak'}{'\n'}
          {'Ripple Factor  γ = √((V_rms/V_dc)² − 1) ≈ 1.21'}{'\n'}
          {'Efficiency     η = 40.6%'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          For a 12 V<sub>rms</sub> AC source: V<sub>peak</sub> ≈ 16.97 V (after √2), V<sub>dc</sub> ≈ 5.4 V average output. The high ripple factor of 1.21 means the ripple amplitude is larger than the DC average — heavy filtering is needed for clean DC.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × Silicon diode (1N4007 for mains-level; 1N4148 for signal-level)</li>
          <li>1 × Load resistor R<sub>L</sub> (e.g., 1 kΩ)</li>
          <li>1 × Smoothing capacitor C (optional, e.g., 100 µF for 50 Hz supply)</li>
          <li>1 × AC voltage source (sinusoidal, e.g., 10 V peak at 50 Hz)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place an <strong>AC Voltage Source</strong> (10 V peak, 50 Hz) from GND to node V<sub>in</sub>.</li>
          <li>Place a <strong>Diode (1N4007)</strong> with anode at V<sub>in</sub> and cathode at node V<sub>out</sub>.</li>
          <li>Place a <strong>Resistor</strong> R<sub>L</sub> = 1 kΩ from V<sub>out</sub> to GND.</li>
          <li>Add <strong>Voltage Probes</strong> on both V<sub>in</sub> and V<sub>out</sub>.</li>
          <li>Run a <strong>Transient simulation</strong> for 60 ms (3 cycles of 50 Hz).</li>
          <li>Observe the rectified output — only positive peaks should appear.</li>
          <li>Optionally add a 100 µF capacitor in parallel with R<sub>L</sub> and re-run to see filtering effect.</li>
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
