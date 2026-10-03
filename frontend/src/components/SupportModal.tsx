import React, { useState } from 'react';
import { X, Heart, Copy, Check, Coffee } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [copied, setCopied] = useState(false);
  const upiId = 'spartensid12@oksbi';
  const upiLink = `upi://pay?pa=${upiId}&pn=NodeSim&cu=INR`;

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '24px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        color: '#f1f5f9',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -20, position: 'relative', zIndex: 10 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ width: 56, height: 56, background: '#ec489920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Heart size={28} color="#ec4899" fill="#ec4899" />
        </div>
        
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Support NodeSim</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24, padding: '0 10px' }}>
          NodeSim is 100% free and built by a solo engineering student. If it saved you time on an assignment, consider buying me a coffee to help keep the servers running!
        </p>

        {/* QR Code Section */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>
          <QRCodeSVG value={upiLink} size={160} level="H" />
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Scan with any UPI App</div>

        {/* Deep Link for Mobile */}
        <a 
          href={upiLink}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#16a34a', color: '#fff', textDecoration: 'none',
            padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14,
            marginBottom: 12, width: '100%', boxSizing: 'border-box', transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
        >
          <Coffee size={16} /> Open UPI App Directly
        </a>

        {/* Copy UPI ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', padding: '8px 12px', borderRadius: 8, border: '1px solid #334155' }}>
          <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', textAlign: 'left' }}>
            {upiId}
          </div>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: copied ? '#16a34a' : '#334155',
              color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
