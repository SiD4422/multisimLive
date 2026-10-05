import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function OhmsLawCalculator() {
  const [v, setV] = useState('');
  const [i, setI] = useState('');
  const [r, setR] = useState('');
  const [solve, setSolve] = useState<'V' | 'I' | 'R'>('V');

  const calculate = () => {
    const vn = parseFloat(v);
    const inn = parseFloat(i);
    const rn = parseFloat(r);
    if (solve === 'V' && !isNaN(inn) && !isNaN(rn)) return (inn * rn).toFixed(4);
    if (solve === 'I' && !isNaN(vn) && !isNaN(rn) && rn !== 0) return (vn / rn).toFixed(4);
    if (solve === 'R' && !isNaN(vn) && !isNaN(inn) && inn !== 0) return (vn / inn).toFixed(4);
    return null;
  };

  const result = calculate();
  const unit = solve === 'V' ? 'V' : solve === 'I' ? 'A' : 'Ω';

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, color: '#374151', fontSize: 14 };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>Ohm's Law Calculator | V = IR | NodeSim Tools</title>
        <meta name="description" content="Free Ohm's Law calculator. Calculate voltage, current, or resistance using V = IR. Instant results. Verify with circuit simulation." />
        <meta name="keywords" content="ohm's law calculator, V=IR, voltage calculator, current calculator, resistance calculator, electronics calculator" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › <Link to="/tools" style={{ color: '#16a34a' }}>Tools</Link> › Ohm's Law</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Ohm's Law Calculator</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Calculate <strong>Voltage (V)</strong>, <strong>Current (I)</strong>, or <strong>Resistance (R)</strong> using V = I × R. Enter any two known values to find the third.</p>

      {/* Formula display */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: '2rem', textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', color: '#1f2937' }}>
        V = I × R
      </div>

      {/* Solve for selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Solve for:</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['V', 'I', 'R'] as const).map(s => (
            <button key={s} onClick={() => setSolve(s)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '2px solid', borderColor: solve === s ? '#16a34a' : '#e5e7eb', background: solve === s ? '#f0fdf4' : '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', color: solve === s ? '#16a34a' : '#374151' }}>
              {s === 'V' ? '⚡ Voltage (V)' : s === 'I' ? '〜 Current (I)' : '≋ Resistance (R)'}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '1.5rem' }}>
        {solve !== 'V' && <div><label style={labelStyle}>Voltage (V) — volts</label><input style={inputStyle} type="number" placeholder="e.g. 12" value={v} onChange={e => setV(e.target.value)} /></div>}
        {solve !== 'I' && <div><label style={labelStyle}>Current (I) — amperes</label><input style={inputStyle} type="number" placeholder="e.g. 0.5" value={i} onChange={e => setI(e.target.value)} /></div>}
        {solve !== 'R' && <div><label style={labelStyle}>Resistance (R) — ohms</label><input style={inputStyle} type="number" placeholder="e.g. 1000" value={r} onChange={e => setR(e.target.value)} /></div>}
      </div>

      {/* Result */}
      <div style={{ background: result ? '#f0fdf4' : '#f9fafb', border: `2px solid ${result ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: '2rem' }}>
        {result ? (
          <><div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{solve === 'V' ? 'Voltage' : solve === 'I' ? 'Current' : 'Resistance'}</div><div style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>{result} <span style={{ fontSize: 20 }}>{unit}</span></div></>
        ) : (
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Enter values above to calculate</div>
        )}
      </div>

      {/* CTA */}
      <Link to="/simulator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15, marginBottom: '2rem' }}>
        ⚡ Simulate this resistor circuit in NodeSim →
      </Link>

      {/* Theory */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Ohm's Law — Quick Reference</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[['V = I × R', 'Voltage', 'V (volts)'], ['I = V / R', 'Current', 'I (amperes)'], ['R = V / I', 'Resistance', 'R (ohms)']].map(([f, n, u]) => (
            <div key={n} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{n} ({u})</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>More free calculators:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/tools/voltage-divider" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Voltage Divider →</Link>
          <Link to="/tools/rc-calculator" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>RC Time Constant →</Link>
          <Link to="/tools/555-timer" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>555 Timer →</Link>
          <Link to="/tools/resistor-color-code" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Resistor Color Code →</Link>
        </div>
      </div>
    </div>
  );
}
