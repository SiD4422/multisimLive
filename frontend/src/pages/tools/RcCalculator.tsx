import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function RcCalculator() {
  const [r, setR] = useState('');
  const [c, setC] = useState('');
  const [cUnit, setCUnit] = useState('1e-6'); // Default to uF

  const rn = parseFloat(r);
  const cnBase = parseFloat(c);
  const cMult = parseFloat(cUnit);

  const calculate = () => {
    if (!isNaN(rn) && !isNaN(cnBase) && rn > 0 && cnBase > 0) {
      const cn = cnBase * cMult;
      const tau = rn * cn;
      const fc = 1 / (2 * Math.PI * tau);
      
      let tauDisplay, fcDisplay;
      
      if (tau < 1e-6) tauDisplay = (tau * 1e9).toFixed(2) + ' ns';
      else if (tau < 1e-3) tauDisplay = (tau * 1e6).toFixed(2) + ' µs';
      else if (tau < 1) tauDisplay = (tau * 1e3).toFixed(2) + ' ms';
      else tauDisplay = tau.toFixed(4) + ' s';

      if (fc > 1e6) fcDisplay = (fc / 1e6).toFixed(2) + ' MHz';
      else if (fc > 1e3) fcDisplay = (fc / 1e3).toFixed(2) + ' kHz';
      else fcDisplay = fc.toFixed(2) + ' Hz';

      return { tau, tauDisplay, fcDisplay };
    }
    return null;
  };

  const result = calculate();

  const inputStyle: React.CSSProperties = { flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, color: '#374151', fontSize: 14 };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>RC Time Constant Calculator | NodeSim Tools</title>
        <meta name="description" content="Free RC time constant calculator. Calculate tau (τ) and cutoff frequency (fc). Instant results. Verify with circuit simulation." />
        <meta name="keywords" content="RC time constant calculator, RC circuit calculator, cutoff frequency calculator, electronics calculator" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › <Link to="/tools" style={{ color: '#16a34a' }}>Tools</Link> › RC Calculator</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>RC Time Constant Calculator</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Calculate time constant (τ) and cutoff frequency (fc) for Resistor-Capacitor circuits.</p>

      {/* Formula display */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: '2rem', textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.05em', color: '#1f2937' }}>
        τ = R × C &nbsp;&nbsp;|&nbsp;&nbsp; fc = 1 / (2πRC)
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '1.5rem' }}>
        <div><label style={labelStyle}>Resistance (R) — Ω</label><input style={inputStyle} type="number" placeholder="e.g. 1000" value={r} onChange={e => setR(e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Capacitance (C)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} type="number" placeholder="e.g. 10" value={c} onChange={e => setC(e.target.value)} />
            <select style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: 8 }} value={cUnit} onChange={e => setCUnit(e.target.value)}>
              <option value="1">F</option>
              <option value="1e-3">mF</option>
              <option value="1e-6">µF</option>
              <option value="1e-9">nF</option>
              <option value="1e-12">pF</option>
            </select>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Note: 1µF = 0.000001 F</div>
        </div>
      </div>

      {/* Result */}
      <div style={{ background: result ? '#f0fdf4' : '#f9fafb', border: `2px solid ${result ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: '2rem' }}>
        {result ? (
          <>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Time Constant (τ)</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>{result.tauDisplay}</div>
            
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Cutoff Frequency (fc)</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#374151', marginBottom: 16 }}>{result.fcDisplay}</div>
            
            <div style={{ fontSize: 14, color: '#4b5563', display: 'flex', justifyContent: 'center', gap: 16 }}>
               <span>Charge (63.2%): <b>1τ</b></span>
               <span>Charge (99.3%): <b>5τ</b></span>
            </div>
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
          <Link to="/tools/voltage-divider" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Voltage Divider →</Link>
          <Link to="/tools/555-timer" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>555 Timer →</Link>
          <Link to="/tools/resistor-color-code" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Resistor Color Code →</Link>
        </div>
      </div>
    </div>
  );
}
