import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const tools = [
  { path: '/tools/ohms-law', name: "Ohm's Law Calculator", desc: 'Calculate Voltage, Current, or Resistance using V=IR.', icon: '⚡' },
  { path: '/tools/voltage-divider', name: 'Voltage Divider', desc: 'Calculate Vout for a resistor divider circuit.', icon: '➗' },
  { path: '/tools/rc-calculator', name: 'RC Time Constant', desc: 'Calculate tau (τ) and cutoff frequency.', icon: '⏱️' },
  { path: '/tools/555-timer', name: '555 Timer Calculator', desc: 'Calculate astable frequency and duty cycle.', icon: '⏲️' },
  { path: '/tools/resistor-color-code', name: 'Resistor Color Code', desc: 'Decode 4-band resistor values easily.', icon: '🎨' }
];

export default function ToolsIndex() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>Free Engineering Calculators | NodeSim</title>
        <meta name="description" content="Free online electronics and engineering calculators. Ohm's Law, Voltage Divider, RC circuits, 555 timers, and more." />
        <meta name="keywords" content="free engineering calculators, electronics calculators online, circuit calculators" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › Tools</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Free Engineering Calculators</h1>
      <p style={{ color: '#6b7280', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1.1rem' }}>
        A collection of free, easy-to-use tools for electronics and electrical engineering students. Calculate values instantly and verify them in the NodeSim circuit simulator.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {tools.map(t => (
          <Link key={t.path} to={t.path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: 12, transition: 'box-shadow 0.2s, border-color 0.2s', background: '#fff', height: '100%', boxSizing: 'border-box' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{t.icon}</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>{t.name}</h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', background: '#f0fdf4', borderRadius: 12, textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#166534' }}>Want to simulate these circuits?</h3>
        <p style={{ color: '#15803d', marginBottom: '1.5rem' }}>Try our free browser-based circuit simulator. No signup required.</p>
        <Link to="/simulator" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600 }}>Launch NodeSim →</Link>
      </div>
    </div>
  );
}
