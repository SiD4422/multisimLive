import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import LZString from 'lz-string';
import { useSchematicStore } from '../store/useSchematicStore';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { components, wires, probes } = useSchematicStore();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setIsGenerating(true);
    setError('');
    setCopied(false);
    try {
      // Strip position/scale metadata — only keep what's needed to recreate the circuit
      const payload = JSON.stringify({ components, wires, probes });
      const compressed = LZString.compressToEncodedURIComponent(payload);
      const url = `${window.location.origin}/simulator#circuit=${compressed}`;
      if (url.length > 32000) {
        setError('Circuit is too large to share via URL. Use File → Save to download as JSON instead.');
      } else {
        setShareUrl(url);
      }
    } catch {
      setError('Failed to generate share link.');
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, components, wires, probes]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent('Check out this circuit I built in NodeSim! ' + shareUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    if (!shareUrl) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Built this circuit in NodeSim — free browser-based SPICE simulator! Try it:')}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleLinkedIn = () => {
    if (!shareUrl) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  if (!isOpen) return null;

  const componentCount = components.length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
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
        maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        color: '#f1f5f9',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8 }}>
              <Share2 size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Share Circuit</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{componentCount} component{componentCount !== 1 ? 's' : ''} · Anyone with this link can open it</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* URL Box */}
        {error ? (
          <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, fontSize: 13, color: '#fca5a5', marginBottom: 20 }}>
            {error}
          </div>
        ) : (
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ flex: 1, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isGenerating ? 'Generating link...' : shareUrl}
            </span>
            <button
              onClick={handleCopy}
              disabled={!shareUrl || isGenerating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: copied ? '#10b981' : '#334155',
                color: copied ? '#fff' : '#e2e8f0',
                border: 'none', borderRadius: 7, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {/* Social Buttons */}
        {!error && shareUrl && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>Share on</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleWhatsApp}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D36620', border: '1px solid #25D36640', borderRadius: 10, padding: '10px', color: '#25D366', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button
                onClick={handleTwitter}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1DA1F220', border: '1px solid #1DA1F240', borderRadius: 10, padding: '10px', color: '#1DA1F2', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Twitter
              </button>
              <button
                onClick={handleLinkedIn}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0A66C220', border: '1px solid #0A66C240', borderRadius: 10, padding: '10px', color: '#0A66C2', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                LinkedIn
              </button>
            </div>
            <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 8, padding: 10, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              💡 <strong style={{ color: '#94a3b8' }}>Tip:</strong> Anyone who opens this link will see your exact circuit loaded instantly — no account needed.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
