import { CheckCircle2, MousePointerClick, Play, Search, Crosshair } from 'lucide-react';
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

export default function ProcedurePage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bgApp,
      padding: '80px 20px 80px',
      color: C.textPrimary,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-1px' }}>
            How to Use MultiSimLab
          </h1>
          <p style={{ fontSize: '1.2rem', color: C.textSecondary, lineHeight: 1.6 }}>
            A complete step-by-step visual procedure to building, wiring, and simulating your first circuit in our online SPICE engine.
          </p>
        </div>

        {/* ── STEPS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* STEP 1 */}
          <div style={{
            backgroundColor: C.bgCard, borderRadius: 20, padding: '32px',
            border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex', gap: '24px', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, flexShrink: 0
              }}>1</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MousePointerClick size={24} color={C.primary} /> Select Components
                </h2>
                <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  Open the left sidebar using the hamburger menu. You'll find categorized lists for <strong>Sources</strong>, <strong>Passives</strong>, <strong>Semiconductors</strong>, and more. Click any component to pick it up, then click anywhere on the canvas grid to place it.
                </p>
              </div>
            </div>
            <img src="/docs/step1_sidebar.png" alt="Sidebar Selection" style={{ width: '100%', borderRadius: '12px', border: `1px solid ${C.border}`, marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          </div>

          {/* STEP 2 */}
          <div style={{
            backgroundColor: C.bgCard, borderRadius: 20, padding: '32px',
            border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex', gap: '24px', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, flexShrink: 0
              }}>2</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={24} color={C.primary} /> Wire and Ground
                </h2>
                <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  To draw wires, simply <strong>click and drag</strong> from one component pin to another. You can also click in empty space to create wire corners.
                </p>
                <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <strong style={{ color: '#d97706', display: 'block', marginBottom: '8px' }}>CRITICAL STEP:</strong>
                  <span style={{ color: '#92400e', fontSize: '1rem', lineHeight: 1.5 }}>
                    You <strong>MUST</strong> place a Ground component in your circuit! The SPICE mathematical engine requires a 0V reference node. Without a ground, your simulation will immediately fail with a "Singular Matrix" error.
                  </span>
                </div>
              </div>
            </div>
            <img src="/docs/step2_canvas.png" alt="Wiring and Grounding" style={{ width: '100%', borderRadius: '12px', border: `1px solid ${C.border}`, marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          </div>

          {/* STEP 3 */}
          <div style={{
            backgroundColor: C.bgCard, borderRadius: 20, padding: '32px',
            border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex', gap: '24px', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, flexShrink: 0
              }}>3</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={24} color={C.primary} /> Edit Parameters
                </h2>
                <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  Need to change a 1k resistor to 10k, or adjust the frequency of your AC source? <strong>Double-click</strong> any component on the canvas. This opens the Inspector Panel on the right where you can modify values, prefixes (k, M, m, u), and rotate the component.
                </p>
              </div>
            </div>
            <img src="/docs/step3_properties.png" alt="Properties Panel" style={{ width: '100%', borderRadius: '12px', border: `1px solid ${C.border}`, marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          </div>

          {/* STEP 4 */}
          <div style={{
            backgroundColor: C.bgCard, borderRadius: 20, padding: '32px',
            border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex', gap: '24px'
          }}>
            <div style={{
              width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, flexShrink: 0
            }}>4</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crosshair size={24} color={C.primary} /> Add Probes
              </h2>
              <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                Before hitting run, you must tell the engine <em>what</em> to measure. Go to the <strong>Analysis</strong> category in the sidebar, pick up a <strong>Voltage Probe</strong>, and drop it directly onto the wire you want to observe.
              </p>
            </div>
          </div>

          {/* STEP 5 */}
          <div style={{
            backgroundColor: C.bgCard, borderRadius: 20, padding: '32px',
            border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex', gap: '24px', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: 48, height: 48, backgroundColor: C.primaryLight, color: C.primary,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, flexShrink: 0
              }}>5</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={24} color={C.primary} /> Simulate & Analyze
                </h2>
                <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Once your circuit is fully closed, hit the green <strong>Run Simulation</strong> button in the top toolbar. 
                </p>
                <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  Switch to the <strong>Grapher</strong> tab to view your waveforms. Click the <strong>Scope Mode</strong> toggle for a dark-themed oscilloscope experience. You can also click anywhere on the graph to drop measurement cursors and calculate phase shifts or frequencies!
                </p>
              </div>
            </div>
            <img src="/docs/step5_grapher.png" alt="Oscilloscope Grapher" style={{ width: '100%', borderRadius: '12px', border: `1px solid ${C.border}`, marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          </div>

        </div>
        
        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <button 
            onClick={() => navigate('/simulator')}
            style={{
              backgroundColor: C.primary, color: '#fff', padding: '16px 32px',
              borderRadius: '50px', fontSize: '1.25rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(22,163,74,0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Launch the Simulator
          </button>
        </div>

      </div>
    </div>
  );
}
