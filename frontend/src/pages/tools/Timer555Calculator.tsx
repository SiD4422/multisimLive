import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Timer555Calculator() {
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  const [c, setC] = useState('');
  const [cUnit, setCUnit] = useState('1e-6');

  const r1n = parseFloat(r1);
  const r2n = parseFloat(r2);
  const cnBase = parseFloat(c);
  const cMult = parseFloat(cUnit);

  const calculate = () => {
    if (!isNaN(r1n) && !isNaN(r2n) && !isNaN(cnBase) && r1n >= 0 && r2n > 0 && cnBase > 0) {
      const cn = cnBase * cMult;
      const f = 1.44 / ((r1n + 2 * r2n) * cn);
      const duty = ((r1n + r2n) / (r1n + 2 * r2n)) * 100;
      const ton = 0.693 * (r1n + r2n) * cn;
      const toff = 0.693 * r2n * cn;

      const formatTime = (t: number) => {
        if (t < 1e-6) return (t * 1e9).toFixed(2) + ' ns';
        if (t < 1e-3) return (t * 1e6).toFixed(2) + ' µs';
        if (t < 1) return (t * 1e3).toFixed(2) + ' ms';
        return t.toFixed(4) + ' s';
      };

      const formatFreq = (freq: number) => {
        if (freq >= 1e6) return (freq / 1e6).toFixed(2) + ' MHz';
        if (freq >= 1e3) return (freq / 1e3).toFixed(2) + ' kHz';
        return freq.toFixed(2) + ' Hz';
      };

      return { f: formatFreq(f), duty: duty.toFixed(2), ton: formatTime(ton), toff: formatTime(toff) };
    }
    return null;
  };

  const result = calculate();

  const inputStyle: React.CSSProperties = { flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, color: '#374151', fontSize: 14 };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>555 Timer Astable Calculator | NodeSim Tools</title>
        <meta name="description" content="Free 555 timer calculator. Calculate frequency, duty cycle, Ton, and Toff for astable mode. Instant results. Verify with circuit simulation." />
        <meta name="keywords" content="555 timer calculator, 555 astable frequency, NE555 calculator, electronics calculator" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › <Link to="/tools" style={{ color: '#16a34a' }}>Tools</Link> › 555 Timer</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>555 Timer Calculator</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Calculate Frequency, Duty Cycle, and Timings for a 555 Timer in Astable mode.</p>

      {/* Formula display */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: '2rem', textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', color: '#1f2937' }}>
        f = 1.44 / ((R1 + 2R2) × C)
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '1.5rem' }}>
        <div><label style={labelStyle}>R1 (Ω)</label><input style={inputStyle} type="number" placeholder="e.g. 1000" value={r1} onChange={e => setR1(e.target.value)} /></div>
        <div><label style={labelStyle}>R2 (Ω)</label><input style={inputStyle} type="number" placeholder="e.g. 10000" value={r2} onChange={e => setR2(e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Capacitance (C)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} type="number" placeholder="e.g. 10" value={c} onChange={e => setC(e.target.value)} />
            <select style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: 8 }} value={cUnit} onChange={e => setCUnit(e.target.value)}>
              <option value="1e-6">µF</option>
              <option value="1e-9">nF</option>
              <option value="1e-12">pF</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ background: result ? '#f0fdf4' : '#f9fafb', border: `2px solid ${result ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: '2rem' }}>
        {result ? (
          <>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Frequency</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>{result.f}</div>
            
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Duty Cycle</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#374151', marginBottom: 16 }}>{result.duty}%</div>
            
            <div style={{ fontSize: 14, color: '#4b5563', display: 'flex', justifyContent: 'center', gap: 16 }}>
               <span>Ton: <b>{result.ton}</b></span>
               <span>Toff: <b>{result.toff}</b></span>
            </div>
          </>
        ) : (
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Enter values above to calculate</div>
        )}
      </div>

      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '2rem', textAlign: 'center' }}>
        Note: Duty cycle is always &gt;50% in astable mode. For 50% duty cycle, set R1 = 0 and add a diode bypass.
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
          <Link to="/tools/voltage-divider" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Voltage Divider →</Link>
          <Link to="/tools/rc-calculator" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>RC Time Constant →</Link>
          <Link to="/tools/resistor-color-code" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Resistor Color Code →</Link>
        </div>
      </div>
    </div>
  );
}
