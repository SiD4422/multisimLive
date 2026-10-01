import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CROSS_LINKS = [
  { to: '/circuits/rc-low-pass-filter', label: 'RC Low Pass Filter' },
  { to: '/circuits/inverting-op-amp', label: 'Inverting Op-Amp' },
  { to: '/circuits/rlc-resonance', label: 'RLC Resonance' },
  { to: '/circuits/half-wave-rectifier', label: 'Half Wave Rectifier' },
  { to: '/circuits/full-wave-rectifier', label: 'Full Wave Rectifier' },
  { to: '/circuits/common-emitter-amplifier', label: 'Common Emitter Amplifier' },
  { to: '/circuits/buck-converter', label: 'Buck Converter' },
];

export default function Timer555Astable() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '840px', margin: '0 auto', color: '#1e293b', lineHeight: 1.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="555 Timer Astable Circuit Simulator Online | NodeSim"
        description="Simulate a 555 timer astable oscillator online. Calculate frequency with f = 1.44/((R1+2R2)×C), adjust duty cycle, visualize square waves — free SPICE simulator."
        url="https://nodesimapp.com/circuits/555-timer-astable"
      />

      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, letterSpacing: '-0.5px' }}>
        555 Timer Astable Circuit Simulator Online
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: 1.8 }}>
        The NE555 (or LM555) timer IC in astable mode is a self-triggering oscillator that produces a continuous square-wave output with no external trigger needed. It is one of the most widely used ICs ever manufactured, appearing in LED flashers, tone generators, PWM motor controllers, clock sources for microcontrollers, and educational lab kits worldwide.
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
          Inside the 555, two comparators monitor the voltage across an external timing capacitor C1. The upper comparator triggers when V<sub>C</sub> reaches (2/3)V<sub>CC</sub>, resetting an internal SR flip-flop and activating the discharge transistor. This drains C1 through resistor R2 until V<sub>C</sub> drops to (1/3)V<sub>CC</sub>, at which point the lower comparator sets the flip-flop again, turning off the discharge transistor so C1 recharges through R1 + R2. This cycle repeats indefinitely, producing the square-wave output.
        </p>
        <p style={{ color: '#334155', marginTop: '1rem' }}>
          The charge time (output HIGH) depends on (R1 + R2) × C1, while the discharge time (output LOW) depends only on R2 × C1. This asymmetry means the duty cycle is always greater than 50 % in the classic configuration. To achieve a 50 % duty cycle, a diode can be placed in parallel with R2 to separate the charge and discharge paths.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Key Formula</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 16, color: '#1e293b' }}>
          {'f = 1.44 / ((R1 + 2 × R2) × C1)'}{'\n'}
          {'Duty Cycle = (R1 + R2) / (R1 + 2 × R2) × 100%'}
        </div>
        <p style={{ marginTop: '1rem', color: '#334155' }}>
          <strong>R1</strong> and <strong>R2</strong> are in Ohms, <strong>C1</strong> is in Farads. Example: R1 = 1 kΩ, R2 = 10 kΩ, C1 = 100 nF → f ≈ 1.44 / (21 000 × 0.0000001) ≈ 686 Hz, duty cycle ≈ 52.4 %.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Components Needed</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>1 × NE555 or LM555 timer IC (or SPICE subcircuit model)</li>
          <li>1 × Resistor R1 (1 kΩ – 10 MΩ, avoids internal discharge transistor stress)</li>
          <li>1 × Resistor R2 (determines both charge and discharge timing)</li>
          <li>1 × Capacitor C1 (timing capacitor, 10 nF – 100 µF)</li>
          <li>1 × Bypass capacitor (10 nF across V<sub>CC</sub> and GND, pin 5 to GND)</li>
          <li>Supply voltage V<sub>CC</sub> (5 V – 15 V)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>Step-by-Step in NodeSim</h2>
        <ol style={{ paddingLeft: '1.5rem', color: '#334155' }}>
          <li>Open NodeSim and place the <strong>555 Timer</strong> subcircuit block.</li>
          <li>Connect V<sub>CC</sub> (pin 8) to a <strong>5 V DC source</strong>; tie GND (pin 1) to ground.</li>
          <li>Wire R1 = 1 kΩ between V<sub>CC</sub> and pin 7 (DISCHARGE).</li>
          <li>Wire R2 = 10 kΩ between pin 7 and pin 6/2 (THRESHOLD/TRIGGER).</li>
          <li>Place C1 = 100 nF from pin 6/2 to GND.</li>
          <li>Add a 10 nF capacitor from pin 5 (CONTROL) to GND.</li>
          <li>Place a <strong>Voltage Probe</strong> on pin 3 (OUTPUT).</li>
          <li>Run a <strong>Transient simulation</strong> for 5 ms and observe the square wave.</li>
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
