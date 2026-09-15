import React, { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuitData: string; // compressed state
}

export function EmbedModal({ isOpen, onClose, circuitData }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = `${window.location.origin}/simulator?embed=true#circuit=${circuitData}`;
  const embedCode = `<iframe src="${url}" width="100%" height="600" frameBorder="0" style="border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Embed Circuit</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, borderRadius: 4 }}><X size={20} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: 20, lineHeight: 1.5 }}>
            Copy this HTML code to embed your interactive circuit directly into a website, blog post, or learning management system (like Canvas/Blackboard).
          </p>

          <div style={{ position: 'relative' }}>
            <textarea 
              readOnly 
              value={embedCode}
              style={{ width: '100%', height: 100, padding: 16, background: '#1f2937', color: '#e5e7eb', fontFamily: 'monospace', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #374151', resize: 'none' }}
            />
            <button 
              onClick={handleCopy}
              style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: copied ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534', margin: '0 0 8px' }}>Preview</h4>
            <p style={{ color: '#15803d', fontSize: '0.85rem', margin: 0 }}>The embedded simulator will automatically hide standard navigation and run completely client-side in the user's browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
