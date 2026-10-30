import { Link } from 'react-router-dom';
import SEO from '../components/SEO';


const TUTORIALS = [
  { path: '/tutorials/rc-circuit', title: 'RC Circuit Tutorial', desc: 'RC time constant, charging/discharging, cutoff frequency — with live simulation.', icon: '〜' },
  { path: '/tutorials/555-timer', title: '555 Timer Tutorial', desc: 'Astable and monostable modes. Build a blinking LED oscillator from scratch.', icon: '⏱' },
  { path: '/tutorials/transistor-amplifier', title: 'Transistor Amplifier', desc: 'Common-emitter NPN amplifier with biasing and voltage gain calculation.', icon: '📡' },
  { path: '/tutorials/op-amp', title: 'Op-Amp Amplifier', desc: 'Inverting and non-inverting configurations, virtual ground, gain formula.', icon: '⚡' },
  { path: '/tutorials/diode-rectifier', title: 'Diode Rectifier', desc: 'Half-wave rectification, peak detector, smoothing capacitor — simulated live.', icon: '▷' },
  { path: '/tutorials/rlc-circuit', title: 'RLC Circuit and Resonance', desc: 'Series RLC circuit, resonant frequency, bandwidth, and Q factor.', icon: '∿' },
];

export default function TutorialsIndex() {
  return (
    <>
      <SEO
        title="Circuit Simulation Tutorials & Interactive Labs | NodeSim"
        description="Free step-by-step electronics tutorials with live interactive SPICE simulations. RC circuits, 555 timers, BJT amplifiers, op-amps, diode rectifiers, and RLC resonance."
        url="https://www.nodesimapp.com/tutorials"
        canonical="https://www.nodesimapp.com/tutorials"
        keywords={['circuit simulation tutorials', 'electronics tutorials', 'RC circuit analysis', '555 timer tutorial', 'transistor amplifier tutorial', 'op amp tutorials', 'rectifier simulation']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tutorials', path: '/tutorials' }
        ]}
      />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Circuit Simulation Tutorials</h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 600 }}>
            Step-by-step guides with live SPICE simulation. Click any tutorial to open it — each one has a "Simulate in NodeSim" button that loads the circuit instantly.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
          {TUTORIALS.map(t => (
            <Link
              key={t.path}
              to={t.path}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ fontSize: 36, lineHeight: 1 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{t.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, flex: 1 }}>{t.desc}</div>
              <div style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>Read tutorial →</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '32px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 8 }}>Ready to simulate?</div>
          <div style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Open the free simulator — no install, no account needed.</div>
          <Link to="/simulator" style={{ background: '#16a34a', color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>Launch Simulator →</Link>
        </div>
      </div>
    </>
  );
}
