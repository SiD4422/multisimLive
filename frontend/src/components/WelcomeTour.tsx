import React, { useState, useEffect } from 'react';
import { X, Play, MousePointer2, Settings, ArrowRight } from 'lucide-react';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only show once
    const seen = localStorage.getItem('nodesim_tour_seen');
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
    if (!seen && !isEmbed) {
      setIsOpen(true);
    }
  }, []);

  const closeTour = () => {
    localStorage.setItem('nodesim_tour_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        <button onClick={closeTour} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>

        <div style={{ padding: '40px 32px 32px', textAlign: 'center' }}>
          
          {step === 1 && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <MousePointer2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Welcome to NodeSim! 🚀</h2>
              <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                You're looking at a full professional SPICE simulator running entirely in your browser. Let's take a quick look around.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Settings size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>1. Build & Connect</h2>
              <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                Drag components from the left panel onto the canvas. Click and drag between component pins to create wires. Click any component to change its value.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Play size={32} fill="currentColor" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>2. Simulate Instantly</h2>
              <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                Click the <strong>Run</strong> button at the top to simulate. Click on any wire to attach a probe and view the voltage in the Grapher.
              </p>
            </>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={closeTour} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
              Skip
            </button>
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : closeTour()} 
              style={{ flex: 2, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {step < 3 ? (
                <>Next <ArrowRight size={18} /></>
              ) : (
                'Start Simulating'
              )}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: step === i ? '#16a34a' : '#e5e7eb' }} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
