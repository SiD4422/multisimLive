import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Link2, Loader2 } from 'lucide-react';
import LZString from 'lz-string';
import { useSchematicStore } from '../store/useSchematicStore';
import { useAuth } from '../hooks/useAuth';
import { summarizeSharedComponents } from '../utils/shortShareId';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuitName?: string;
}

export function ShareModal({ isOpen, onClose, circuitName }: ShareModalProps) {
  if (!isOpen) return null;
  return <ShareModalInner onClose={onClose} circuitName={circuitName} />;
}

interface ShareSnapshot {
  name: string;
  componentCount: number;
  summary: string;
  compressed: string;
  directHashUrl: string;
  hashError: string;
  authorUid: string | null;
  origin: string;
}

function ShareModalInner({ onClose, circuitName }: { onClose: () => void; circuitName?: string }) {
  const { components, wires, probes } = useSchematicStore();
  const { user } = useAuth();
  const [snapshot] = useState<ShareSnapshot>(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nodesimapp.com';
    if (components.length === 0) {
      return {
        name: (circuitName || '').trim() || 'Shared Circuit',
        componentCount: 0,
        summary: '',
        compressed: '',
        directHashUrl: '',
        hashError: 'Add at least one component before creating a share link.',
        authorUid: user?.uid ?? null,
        origin,
      };
    }
    try {
      const payload = JSON.stringify({ components, wires, probes });
      const compressed = LZString.compressToEncodedURIComponent(payload);
      const url = `${origin}/simulator#circuit=${compressed}`;
      return {
        name: (circuitName || '').trim() || 'Shared Circuit',
        componentCount: components.length,
        summary: summarizeSharedComponents(components),
        compressed,
        directHashUrl: url.length <= 32000 ? url : '',
        hashError: '',
        authorUid: user?.uid ?? null,
        origin,
      };
    } catch {
      return {
        name: (circuitName || '').trim() || 'Shared Circuit',
        componentCount: components.length,
        summary: '',
        compressed: '',
        directHashUrl: '',
        hashError: 'Failed to encode circuit payload.',
        authorUid: user?.uid ?? null,
        origin,
      };
    }
  });

  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(Boolean(snapshot.compressed));
  const [fallbackNotice, setFallbackNotice] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!snapshot.compressed) return;
    let cancelled = false;

    import('../lib/firebase')
      .then(({ createShortShareLink }) =>
        createShortShareLink({
          name: snapshot.name,
          componentCount: snapshot.componentCount,
          componentSummary: snapshot.summary,
          circuitData: snapshot.compressed,
          authorUid: snapshot.authorUid,
        }),
      )
      .then(({ shortPath }) => {
        if (!cancelled) {
          setShortUrl(`${snapshot.origin}${shortPath}`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackNotice(
            snapshot.directHashUrl
              ? 'Offline or cloud unavailable — using full URL fallback.'
              : 'Circuit is too large and cloud short-link service is unavailable.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGenerating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [snapshot]);

  const shareUrl = shortUrl || snapshot.directHashUrl;
  const error = snapshot.hashError || (!isGenerating && !shareUrl ? fallbackNotice : '');

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8 }}>
              <Share2 size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Share Circuit</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {snapshot.componentCount} component{snapshot.componentCount !== 1 ? 's' : ''} · {shortUrl ? 'Short URL with link preview' : 'Instant SPICE share link'}
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close share dialog" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {shortUrl && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(22, 163, 74, 0.16)', border: '1px solid rgba(74, 222, 128, 0.35)', color: '#4ade80', fontSize: 11, fontWeight: 700 }}>
            <Link2 size={12} />
            <span>Short Link Ready (OpenGraph preview enabled)</span>
          </div>
        )}

        {/* URL Box */}
        {error ? (
          <div style={{ background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: 12, fontSize: 13, color: '#fca5a5', marginBottom: 20 }}>
            {error}
          </div>
        ) : (
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ flex: 1, fontSize: 12.5, color: shortUrl ? '#e2e8f0' : '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isGenerating ? 'Creating short share URL...' : shareUrl}
            </span>
            <button
              onClick={() => void handleCopy()}
              disabled={!shareUrl || isGenerating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: copied ? '#10b981' : '#334155',
                color: copied ? '#fff' : '#e2e8f0',
                border: 'none', borderRadius: 7, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: !shareUrl || isGenerating ? 'not-allowed' : 'pointer',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              {isGenerating ? (
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              ) : copied ? (
                <Check size={13} />
              ) : (
                <Copy size={13} />
              )}
              {isGenerating ? 'Saving' : copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {fallbackNotice && shareUrl && !error && (
          <div style={{ marginBottom: 14, fontSize: 11.5, color: '#fbbf24' }}>
            {fallbackNotice}
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
