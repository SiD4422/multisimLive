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
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
];

export default function BuckConverter() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="Buck Converter Step-Down DC-DC Circuit Simulator | NodeSim"
        description="Simulate a PWM buck converter online. Calculate output voltage with Vout = D × Vin, select inductor and capacitor values, analyse ripple — free browser SPICE simulator."
        url="https://nodesimapp.com/circuits/buck-converter"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        Buck Converter (Step-Down DC-DC) Circuit Simulator
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        A buck converter is a switching-mode power supply (SMPS) that efficiently steps down a DC input voltage to a lower DC output voltage. By rapidly switching a MOSFET or BJT transistor at frequencies ranging from tens of kilohertz to several megahertz, and filtering the switched waveform with an LC network, the buck converter can achieve conversion efficiencies exceeding 95 % — far superior to the heat-dissipating linear regulator it often replaces in battery-powered devices, laptops, and embedded systems.
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
          The buck converter operates in two phases controlled by a PWM (Pulse Width Modulation) signal driving a high-side switch (typically a MOSFET). When the switch is ON, V<sub>in</sub> is connected to the inductor L. Current through L ramps up, storing energy in its magnetic field, while simultaneously supplying current to the load and charging capacitor C. When the switch turns OFF, the inductor's magnetic field collapses, and the flyback diode (or synchronous MOSFET) provides a current path so that inductor current continues to flow — now ramping down — through the load.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          In steady-state continuous conduction mode (CCM), the average inductor current equals the load current. The output voltage is set purely by the duty cycle D = t<sub>ON</sub> / T. A feedback control loop (usually implemented with an error amplifier and PWM comparator) continuously adjusts D to regulate V<sub>out</sub> against load and input variations. The LC filter smooths the switched voltage into clean DC, with the output voltage ripple determined by ΔV<sub>out</sub> = ΔI<sub>L</sub> / (8 × f × C).
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formulas</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'Vout = D × Vin  (D = duty cycle, 0 to 1)'}{'\n'}
          {'L_min = (Vin - Vout) × D / (2 × f × I_load)'}{'\n'}
          {'C_min = I_load × (1 - D) / (8 × f × ΔVout)'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          Example: step 12 V down to 5 V → D = 5/12 ≈ 0.417. At 100 kHz switching frequency and 500 mA load: L<sub>min</sub> = (12−5) × 0.417 / (2 × 100 000 × 0.5) ≈ 29 µH. Choose 47 µH for margin. For 50 mV ripple: C<sub>min</sub> ≈ 0.5 × 0.583 / (8 × 100 000 × 0.05) ≈ 7.3 µF — a standard 10 µF ceramic works perfectly.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × High-side switch MOSFET (e.g., IRF540N or ideal switch in SPICE)</li>
          <li>1 × Flyback diode (Schottky, e.g., 1N5819 — low forward voltage critical for efficiency)</li>
          <li>1 × Inductor L (e.g., 47 µH, with low DCR for efficiency)</li>
          <li>1 × Output capacitor C (e.g., 10 µF ceramic or 100 µF electrolytic)</li>
          <li>1 × PWM voltage source (square wave, 0–12 V, 100 kHz, duty cycle = target Vout/Vin)</li>
          <li>1 × Load resistor R<sub>L</sub> (e.g., 10 Ω for 500 mA at 5 V)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim. Place a <strong>DC Source 12 V</strong> (V<sub>in</sub>) and a <strong>Pulse Source</strong> (0–12 V, 100 kHz, 41.7 % duty cycle) for PWM.</li>
          <li>Place an <strong>ideal switch</strong> (SPICE SW element) driven by the PWM signal, between V<sub>in</sub> and the switching node V<sub>sw</sub>.</li>
          <li>Place a <strong>Schottky diode (1N5819)</strong> from GND (anode) to V<sub>sw</sub> (cathode) — this is the freewheeling diode.</li>
          <li>Place <strong>L = 47 µH</strong> from V<sub>sw</sub> to the output node V<sub>out</sub>.</li>
          <li>Place <strong>C = 10 µF</strong> from V<sub>out</sub> to GND; add <strong>R<sub>L</sub> = 10 Ω</strong> in parallel with C.</li>
          <li>Probe V<sub>out</sub> and V<sub>sw</sub>. Run <strong>Transient simulation</strong> for 500 µs.</li>
          <li>Verify V<sub>out</sub> settles near 5 V and observe inductor current ramp waveform.</li>
          <li>Adjust duty cycle and re-run to confirm V<sub>out</sub> = D × V<sub>in</sub> relationship.</li>
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
