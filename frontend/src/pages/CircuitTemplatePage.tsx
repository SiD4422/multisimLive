import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, LayoutGrid, CheckCircle2, Activity } from 'lucide-react';
import { EXAMPLES } from './CircuitsPage';
import { useSchematicStore } from '../store/useSchematicStore';
import SEO from '../components/SEO';

const C = {
  bgApp: '#f9fafb',
  bgCard: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  border: '#e5e7eb',
  primary: '#16a34a',
  primaryHover: '#15803d',
};

export default function CircuitTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const importState = useSchematicStore(s => s.importState);

  const circuit = EXAMPLES.find(ex => ex.id === id);

  if (!circuit) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bgApp, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: C.textPrimary, marginBottom: 16 }}>Circuit Not Found</h1>
        <p style={{ color: C.textSecondary, marginBottom: 24 }}>The circuit template you're looking for doesn't exist or was removed.</p>
        <Link to="/circuits" style={{ padding: '10px 20px', backgroundColor: C.primary, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Back to Circuits</Link>
      </div>
    );
  }

  const handleLaunch = () => {
    importState(JSON.stringify(circuit.data));
    navigate('/simulator');
  };

  return (
    <>
      <SEO 
        title={`${circuit.name} | Free Circuit Simulator Template`} 
        description={`Interactive simulation template for the ${circuit.name}. ${circuit.description} Load and run it instantly in NodeSim's browser-based SPICE simulator.`}
        url={`https://nodesimapp.com/circuits/${circuit.id}`}
      />
      <div style={{ minHeight: '100vh', backgroundColor: C.bgApp, padding: '60px 20px', color: C.textPrimary, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          <Link to="/circuits" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.textSecondary, textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 40, transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to Circuits
          </Link>

          <div style={{ backgroundColor: C.bgCard, borderRadius: 24, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            
            {/* Header Area */}
            <div style={{ padding: '48px 48px 32px', borderBottom: `1px solid ${C.border}`, backgroundColor: `${circuit.accent}08` }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, backgroundColor: 'white', color: circuit.accent, fontSize: 13, fontWeight: 700, border: `1px solid ${circuit.accent}30`, marginBottom: 24 }}>
                <circuit.Icon size={16} /> {circuit.category}
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px', color: '#111827' }}>
                {circuit.name}
              </h1>
              <p style={{ fontSize: '1.25rem', color: C.textSecondary, lineHeight: 1.6, maxWidth: 700, margin: 0 }}>
                {circuit.description}
              </p>

              <div style={{ marginTop: 36, display: 'flex', gap: 16 }}>
                <button 
                  onClick={handleLaunch}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', backgroundColor: C.primary, color: 'white', borderRadius: 12, fontWeight: 600, fontSize: '1.1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22,163,74,0.3)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Play size={20} /> Open in Simulator
                </button>
              </div>
            </div>

            {/* Details Area */}
            <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayoutGrid size={20} color={C.primary} /> Key Components
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {circuit.components.map((comp, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.textSecondary, fontSize: '1.05rem' }}>
                      <CheckCircle2 size={18} color={C.primary} opacity={0.6} /> {comp}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Simulation Analysis</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: 8, fontSize: '1.05rem', fontWeight: 600, color: circuit.analysisColor }}>
                  <Activity size={20} /> {circuit.analysis}
                </div>
                <p style={{ marginTop: 16, color: C.textSecondary, lineHeight: 1.5 }}>
                  This template comes pre-configured with a {circuit.analysis.toLowerCase()} profile. Just click the "Run" button inside the simulator to instantly view the waveform output.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
