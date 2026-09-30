import React from 'react';
import { BookOpen, FileText, PlayCircle, Code, ChevronRight, Download } from 'lucide-react';
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

import SEO from '../components/SEO';

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Resources & Documentation | NodeSim" 
        description="Documentation, tutorials, and ngspice reference manuals for the NodeSim circuit simulator."
        url="https://nodesimapp.com/resources"
      />
      <div style={{
        minHeight: '100vh',
        backgroundColor: C.bgApp,
      padding: '80px 20px 80px',
      color: C.textPrimary,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: C.primaryLight, color: C.primary, marginBottom: 24,
          }}>
            <BookOpen size={32} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Learn & Explore
          </h1>
          <p style={{ fontSize: '1.2rem', color: C.textSecondary, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Master circuit simulation with our comprehensive guides, component datasheets, and video tutorials. Whether you're a student or professional, we've got you covered.
          </p>
        </div>

        {/* SECTION: SPICE Guide */}
        <div style={{
          backgroundColor: C.bgCard, borderRadius: 24, padding: '40px',
          border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          marginBottom: 40,
        }}>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Code color={C.primary} size={32} /> The SPICE Engine
          </h2>
          <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '24px' }}>
            NodeSim runs on <strong>Ngspice</strong>, a powerful open-source mixed-level/mixed-signal circuit simulator. When you draw a schematic, the web app compiles a "netlist"—a text file describing every component and connection—and sends it to the WebAssembly engine.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: C.bgApp, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Transient Analysis</h4>
              <p style={{ margin: 0, color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>Simulates the circuit's behavior over time. Essential for observing oscillators, charging capacitors, and digital logic switching.</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: C.bgApp, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>AC Sweep</h4>
              <p style={{ margin: 0, color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>Computes the small-signal AC behavior of the circuit over a range of frequencies. Perfect for Bode plots and filter design.</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: C.bgApp, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Nodes & Ground</h4>
              <p style={{ margin: 0, color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>Every connection point is a "node". SPICE strictly requires a Ground component (Node 0) to establish a 0V reference point.</p>
            </div>
          </div>
        </div>

        {/* SECTION: Datasheets */}
        <div style={{
          backgroundColor: C.bgCard, borderRadius: 24, padding: '40px',
          border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          marginBottom: 40,
        }}>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FileText color={C.primary} size={32} /> Component Datasheets
          </h2>
          <p style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '30px' }}>
            Quick reference links to standard industry component datasheets and pinouts.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              { title: 'NE555 Precision Timer', desc: 'The classic 8-pin oscillator/timer IC.' },
              { title: 'LM741 Operational Amplifier', desc: 'Standard general-purpose Op-Amp.' },
              { title: '2N3904 NPN Transistor', desc: 'General purpose switching transistor.' },
              { title: '1N4148 Switching Diode', desc: 'High-speed silicon switching diode.' },
              { title: 'IRF520 N-Channel MOSFET', desc: 'Power MOSFET for high current switching.' },
              { title: 'LM7805 Voltage Regulator', desc: '5V Fixed Linear Voltage Regulator.' },
            ].map((sheet, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', backgroundColor: '#fff', borderRadius: 12,
                border: `1px solid ${C.border}`, cursor: 'pointer',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }} onMouseEnter={e => e.currentTarget.style.borderColor = C.primary} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600 }}>{sheet.title}</h4>
                  <p style={{ margin: 0, color: C.textSecondary, fontSize: '0.9rem' }}>{sheet.desc}</p>
                </div>
                <Download size={20} color={C.primary} />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Video Tutorials */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            <PlayCircle color="#ef4444" size={32} /> Video Tutorials
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>Recommended YouTube channels and videos for learning circuit simulation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'The Organic Chemistry Tutor', desc: 'Clear explanations of RC, RL, RLC circuits, transistors, and op-amps.', url: 'https://www.youtube.com/@TheOrganicChemistryTutor', tag: 'Circuit Theory' },
              { title: 'EEVblog', desc: 'Professional electronics engineering — component deep dives, oscilloscope tutorials, real-world circuits.', url: 'https://www.youtube.com/@EEVblog', tag: 'Engineering' },
              { title: 'All About Electronics', desc: 'Step-by-step explanations of BJTs, MOSFETs, op-amps and power electronics.', url: 'https://www.youtube.com/@AllAboutElectronics', tag: 'Components' },
              { title: 'Afrotechmods', desc: 'Practical circuit building — great for understanding real component behavior.', url: 'https://www.youtube.com/@Afrotechmods', tag: 'Practical' },
            ].map(v => (
              <a
                key={v.title}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ background: '#fef2f2', color: '#ef4444', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{v.tag}</span>
                  <PlayCircle size={18} color="#ef4444" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{v.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{v.desc}</div>
                <div style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 600 }}>Watch on YouTube →</div>
              </a>
            ))}
          </div>
        </section>

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
            Jump into the Lab
          </button>
        </div>

      </div>
    </div>
    </>
  );
}
