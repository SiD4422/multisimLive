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
        <div style={{
          backgroundColor: C.bgCard, borderRadius: 24, padding: '40px',
          border: `1px solid ${C.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              <PlayCircle color="#ef4444" size={36} /> Video Tutorials
            </h2>
            <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>Coming Soon</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[1, 2].map((v) => (
              <div key={v} style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <div style={{ height: 180, backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlayCircle size={48} color="#94a3b8" />
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{v === 1 ? 'Building a 555 Astable Oscillator' : 'Analyzing Bode Plots with AC Sweep'}</h4>
                  <p style={{ margin: 0, color: C.textSecondary, fontSize: '0.95rem' }}>Learn how to wire and measure this classic circuit step-by-step.</p>
                </div>
              </div>
            ))}
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
            Jump into the Lab
          </button>
        </div>

      </div>
    </div>
    </>
  );
}
