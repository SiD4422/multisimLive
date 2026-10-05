import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const COLORS = [
  { name: 'Black', value: 0, mult: 1, color: '#000000', text: '#fff' },
  { name: 'Brown', value: 1, mult: 10, tol: 1, color: '#8B4513', text: '#fff' },
  { name: 'Red', value: 2, mult: 100, tol: 2, color: '#FF0000', text: '#fff' },
  { name: 'Orange', value: 3, mult: 1000, color: '#FFA500', text: '#000' },
  { name: 'Yellow', value: 4, mult: 10000, color: '#FFFF00', text: '#000' },
  { name: 'Green', value: 5, mult: 100000, color: '#008000', text: '#fff' },
  { name: 'Blue', value: 6, mult: 1000000, color: '#0000FF', text: '#fff' },
  { name: 'Violet', value: 7, color: '#EE82EE', text: '#000' },
  { name: 'Gray', value: 8, color: '#808080', text: '#fff' },
  { name: 'White', value: 9, color: '#FFFFFF', text: '#000' },
  { name: 'Gold', mult: 0.1, tol: 5, color: '#FFD700', text: '#000' },
  { name: 'Silver', mult: 0.01, tol: 10, color: '#C0C0C0', text: '#000' }
];

export default function ResistorColorCodeCalculator() {
  const [b1, setB1] = useState(1); // Brown
  const [b2, setB2] = useState(0); // Black
  const [mult, setMult] = useState(2); // Red
  const [tol, setTol] = useState(10); // Gold

  const calculate = () => {
    const band1 = COLORS[b1].value;
    const band2 = COLORS[b2].value;
    const multiplier = COLORS[mult].mult;
    const tolerance = COLORS[tol].tol;

    if (band1 !== undefined && band2 !== undefined && multiplier !== undefined && tolerance !== undefined) {
      const res = (band1 * 10 + band2) * multiplier;
      
      let resDisplay = '';
      if (res >= 1e6) resDisplay = (res / 1e6) + ' MΩ';
      else if (res >= 1e3) resDisplay = (res / 1e3) + ' kΩ';
      else resDisplay = res + ' Ω';

      const diff = res * (tolerance / 100);
      const min = res - diff;
      const max = res + diff;

      const formatRange = (val: number) => {
        if (val >= 1e6) return (val / 1e6).toFixed(2) + ' MΩ';
        if (val >= 1e3) return (val / 1e3).toFixed(2) + ' kΩ';
        return val.toFixed(2) + ' Ω';
      };

      return { display: resDisplay, tol: tolerance, range: `${formatRange(min)} to ${formatRange(max)}` };
    }
    return null;
  };

  const result = calculate();

  const selectStyle = (colorIndex: number): React.CSSProperties => {
    const c = COLORS[colorIndex];
    return { padding: '10px', borderRadius: 8, border: '1px solid #d1d5db', backgroundColor: c.color, color: c.text, fontWeight: 'bold', outline: 'none', width: '100%', fontSize: 15 };
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 4, color: '#374151', fontSize: 14 };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem', color: '#111827' }}>
      <Helmet>
        <title>Resistor Color Code Calculator | 4 Band | NodeSim Tools</title>
        <meta name="description" content="Free 4-band resistor color code decoder. Calculate resistance and tolerance easily." />
        <meta name="keywords" content="resistor color code calculator, 4 band resistor, resistor decoder, electronics calculator" />
      </Helmet>

      <div style={{ marginBottom: 8, fontSize: 13 }}><Link to="/" style={{ color: '#16a34a' }}>NodeSim</Link> › <Link to="/tools" style={{ color: '#16a34a' }}>Tools</Link> › Resistor Color Code</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Resistor Color Code Calculator</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Decode 4-band resistors. Select the colors to find the resistance value and tolerance.</p>

      {/* Resistor visualization */}
      <div style={{ background: '#f3f4f6', padding: '24px', borderRadius: 12, marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 200, height: 60, background: '#e5cdb3', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', border: '2px solid #d1d5db', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
           {/* Wire left */}
           <div style={{ position: 'absolute', left: -40, width: 40, height: 4, background: '#9ca3af' }}></div>
           {/* Bands */}
           <div style={{ width: 12, height: 60, background: COLORS[b1].color }}></div>
           <div style={{ width: 12, height: 60, background: COLORS[b2].color }}></div>
           <div style={{ width: 12, height: 60, background: COLORS[mult].color }}></div>
           <div style={{ width: 12, height: 60, background: COLORS[tol].color, marginLeft: 20 }}></div>
           {/* Wire right */}
           <div style={{ position: 'absolute', right: -40, width: 40, height: 4, background: '#9ca3af' }}></div>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Band 1</label>
          <select style={selectStyle(b1)} value={b1} onChange={e => setB1(Number(e.target.value))}>
            {COLORS.filter(c => c.value !== undefined).map((c, i) => <option key={i} value={COLORS.indexOf(c)} style={{backgroundColor: c.color, color: c.text}}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Band 2</label>
          <select style={selectStyle(b2)} value={b2} onChange={e => setB2(Number(e.target.value))}>
            {COLORS.filter(c => c.value !== undefined).map((c, i) => <option key={i} value={COLORS.indexOf(c)} style={{backgroundColor: c.color, color: c.text}}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Multiplier</label>
          <select style={selectStyle(mult)} value={mult} onChange={e => setMult(Number(e.target.value))}>
            {COLORS.filter(c => c.mult !== undefined).map((c, i) => <option key={i} value={COLORS.indexOf(c)} style={{backgroundColor: c.color, color: c.text}}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tolerance</label>
          <select style={selectStyle(tol)} value={tol} onChange={e => setTol(Number(e.target.value))}>
            {COLORS.filter(c => c.tol !== undefined).map((c, i) => <option key={i} value={COLORS.indexOf(c)} style={{backgroundColor: c.color, color: c.text}}>{c.name} (±{c.tol}%)</option>)}
          </select>
        </div>
      </div>

      {/* Result */}
      <div style={{ background: result ? '#f0fdf4' : '#f9fafb', border: `2px solid ${result ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: '2rem' }}>
        {result && (
          <>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Resistance</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>{result.display} <span style={{ fontSize: 20 }}>±{result.tol}%</span></div>
            <div style={{ fontSize: 14, color: '#4b5563', marginTop: 8 }}>Range: {result.range}</div>
          </>
        )}
      </div>

      {/* CTA */}
      <Link to="/simulator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15, marginBottom: '2rem' }}>
        ⚡ Simulate this resistor in NodeSim →
      </Link>

      {/* Cross-links */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>More free calculators:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/tools/ohms-law" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Ohm's Law →</Link>
          <Link to="/tools/voltage-divider" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Voltage Divider →</Link>
          <Link to="/tools/rc-calculator" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>RC Time Constant →</Link>
          <Link to="/tools/555-timer" style={{ color: '#16a34a', textDecoration: 'none', background: '#f0fdf4', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>555 Timer →</Link>
        </div>
      </div>
    </div>
  );
}
