import { Zap, Activity, Download, Globe, CheckCircle2, Waves, Sliders, LineChart, Code, Layers, MousePointer2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const C = {
  bgApp: '#f9fafb',
  bgCard: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  border: '#e5e7eb',
  primary: '#16a34a',
  primaryHover: '#15803d',
  primaryLight: '#dcfce7',
};

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bgApp,
      padding: '80px 20px 80px',
      color: C.textPrimary,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: C.primaryLight, color: C.primary, marginBottom: 24,
          }}>
            <Zap size={32} />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-1.5px', color: '#111827' }}>
            Next-Gen Circuit Simulation
          </h1>
          <p style={{ fontSize: '1.25rem', color: C.textSecondary, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            MultiSimLab brings the power of industry-standard SPICE simulation directly to your browser. Experience desktop-grade circuit design without the desktop.
          </p>
        </div>

        {/* BENTO BOX GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          gridAutoRows: 'minmax(250px, auto)'
        }}>
          
          {/* Bento Item 1: Large Feature */}
          <div style={{
            backgroundColor: C.primary, color: '#fff', padding: '40px', borderRadius: 24, 
            gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(22, 163, 74, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '20px' }}>100% Client-Side SPICE</h2>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9 }}>
                Powered by a compiled WebAssembly version of Ngspice. No servers, no latency, no waiting. Your browser executes complex mathematical component models in real-time.
              </p>
            </div>
            <Activity size={300} color="#15803d" style={{ position: 'absolute', right: '-50px', bottom: '-50px', opacity: 0.3 }} />
          </div>

          {/* Bento Item 2 */}
          <div style={{
            backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`,
            transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <LineChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Live Oscilloscope</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>Toggle 'Scope Mode' on the grapher to experience a dark-themed, neon-trace digital oscilloscope complete with point-and-click measurement cursors.</p>
          </div>

          {/* Bento Item 3 */}
          <div style={{
            backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`,
            transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Waves size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>AC & DC Sweeps</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>Sweep frequency ranges for Bode plots, or sweep DC voltages to analyze transistor characteristics and I-V curves instantly.</p>
          </div>

          {/* Bento Item 4 */}
          <div style={{
            backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`,
            transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#fef3c7', color: '#d97706', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Extensive Library</h3>
            <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>From basic RLC components to complex Transformers, Op-Amps, MOSFETs, and Diodes. Build exactly what you need without limitations.</p>
          </div>

          {/* Bento Item 5: Double Width */}
          <div style={{
            backgroundColor: C.bgCard, padding: '32px', borderRadius: 24, border: `1px solid ${C.border}`,
            gridColumn: 'auto / span 2', display: 'flex', gap: '24px', alignItems: 'center',
            transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ flex: 1 }}>
              <div style={{ width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <MousePointer2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>Drag & Drop Interface</h3>
              <p style={{ color: C.textSecondary, lineHeight: 1.6, fontSize: '1.1rem' }}>
                Say goodbye to clunky 90s interfaces. MultiSimLab offers a sleek, intuitive drag-and-drop schematic canvas that snaps to grid and makes wiring a breeze.
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Interactive Canvas Preview</span>
            </div>
          </div>

          {/* Bento Item 6 */}
          <div style={{
            backgroundColor: '#111827', color: '#fff', padding: '32px', borderRadius: 24,
            transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#374151', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Code size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Raw Netlists</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>The 'Code' panel updates your raw SPICE netlist in real-time as you draw, allowing you to learn the underlying engine.</p>
          </div>

        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <button 
            onClick={() => navigate('/simulator')}
            style={{
              backgroundColor: C.primary, color: '#fff', padding: '16px 40px',
              borderRadius: '50px', fontSize: '1.25rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(22,163,74,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(22,163,74,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(22,163,74,0.4)'; }}
          >
            Start Simulating Free
          </button>
        </div>

      </div>
    </div>
  );
}
