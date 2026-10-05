import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function VoltageDividerCalculator() {
  const [vin, setVin] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');

  const vn = parseFloat(vin);
  const r1n = parseFloat(r1);
  const r2n = parseFloat(r2);

  const calculate = () => {
    if (!isNaN(vn) && !isNaN(r1n) && !isNaN(r2n) && (r1n + r2n !== 0)) {
      const vout = vn * r2n / (r1n + r2n);
      const ratio = (vout / vn) * 100;
      return { vout: vout.toFixed(4), ratio: ratio.toFixed(2) };
    }
    return null;
  };

  const result = calculate();

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, color: '#374151', fontSize: 14 };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>Voltage Divider Calculator | NodeSim Tools</title>
        <meta name="description" content="Free Voltage Divider calculator. Calculate Vout given Vin, R1, and R2. Instant results. Verify with circuit simulation." />
        <meta name="keywords" content="voltage divider calculator, resistor divider, Vout formula, electronics calculator" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › <Link to="/tools" style={{ color: '#16a34a' }}>Tools</Link> › Voltage Divider</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Voltage Divider Calculator</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Calculate <strong>Vout</strong> using the formula Vout = Vin × R2 / (R1 + R2).</p>

      {/* Formula display */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: '2rem', textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', color: '#1f2937' }}>
        Vout = Vin × R2 / (R1 + R2)
      </div>

      <pre style={{ background: '#f3f4f6', padding: '16px', borderRadius: 8, textAlign: 'center', fontWeight: 'bold', overflowX: 'auto', marginBottom: '2rem' }}>
{`  Vin ─── R1 ─── Vout ─── R2 ─── GND`}
      </pre>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '1.5rem' }}>
        <div><label style={labelStyle}>Vin (V)</label><input style={inputStyle} type="number" placeholder="e.g. 5" value={vin} onChange={e => setVin(e.target.value)} /></div>
        <div><label style={labelStyle}>R1 (Ω)</label><input style={inputStyle} type="number" placeholder="e.g. 1000" value={r1} onChange={e => setR1(e.target.value)} /></div>
        <div><label style={labelStyle}>R2 (Ω)</label><input style={inputStyle} type="number" placeholder="e.g. 2000" value={r2} onChange={e => setR2(e.target.value)} /></div>
      </div>

      {/* Result */}
      <div style={{ background: result ? '#f0fdf4' : '#f9fafb', border: `2px solid ${result ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: '2rem' }}>
        {result ? (
          <>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Vout</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>{result.vout} <span style={{ fontSize: 20 }}>V</span></div>
            <div style={{ fontSize: 14, color: '#4b5563', marginTop: 8 }}>Ratio (Vout/Vin): {result.ratio}%</div>
          </>
        ) : (
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Enter values above to calculate</div>
        )}
      </div>

      {/* CTA */}
      <Link to="/simulator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15, marginBottom: '2rem' }}>
        ⚡ Simulate this circuit in NodeSim →
      </Link>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>More free calculators:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/tools/ohms-law" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Ohm's Law →</Link>
          <Link to="/tools/rc-calculator" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>RC Time Constant →</Link>
          <Link to="/tools/555-timer" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>555 Timer →</Link>
          <Link to="/tools/resistor-color-code" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Resistor Color Code →</Link>
        </div>
      </div>
    </div>
  );
}
