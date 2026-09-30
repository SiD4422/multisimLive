import React, { useState } from 'react';
import { X, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import LZString from 'lz-string';
import { useSchematicStore } from '../store/useSchematicStore';
import { publishCircuit } from '../lib/firebase';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'basic',   label: '⚡ Basic / Beginner' },
  { value: 'analog',  label: '〜 Analog' },
  { value: 'digital', label: '▷ Digital' },
  { value: 'power',   label: '🔋 Power Electronics' },
  { value: 'other',   label: '◎ Other' },
];

// Site theme constants — matching nodesimapp.com exactly
const T = {
  bg:        '#0f172a',   // darkest — page bg / deep input bg
  surface:   '#1e293b',   // card surface
  border:    '#334155',   // subtle borders
  borderFoc: '#16a34a',   // green focus ring
  textPri:   '#f1f5f9',   // primary text
  textSec:   '#94a3b8',   // secondary text
  textMut:   '#64748b',   // muted labels
  green:     '#16a34a',   // site primary green
  greenHov:  '#15803d',   // green hover state
  greenBg:   '#16a34a1a', // green tint background
  greenBdr:  '#16a34a40', // green tint border
  red:       '#ef4444',
  redBg:     '#7f1d1d33',
};

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { components, wires, probes } = useSchematicStore();
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState('basic');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus]         = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg]     = useState('');

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!name.trim()) { setErrorMsg('Please enter a circuit name.'); return; }
    if (components.length === 0) { setErrorMsg('Your circuit has no components to publish.'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const circuitData = LZString.compressToEncodedURIComponent(
        JSON.stringify({ components, wires, probes })
      );
      await publishCircuit({
        name:           name.trim().slice(0, 100),
        description:    description.trim().slice(0, 500),
        category,
        authorName:     authorName.trim().slice(0, 50) || 'Anonymous',
        componentCount: components.length,
        circuitData,
      });
      setStatus('success');
    } catch {
      setErrorMsg('Failed to publish. Check your internet connection and try again.');
      setStatus('error');
    }
  };

  // Shared field styles — all dark, consistent with the simulator UI
  const field: React.CSSProperties = {
    width: '100%',
    background: T.bg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    color: T.textPri,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  };

  const label: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: T.textMut,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 28,
        width: '100%',
        maxWidth: 468,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        color: T.textPri,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: T.greenBg, border: `1px solid ${T.greenBdr}`, borderRadius: 10, padding: 9, display: 'flex' }}>
              <Globe size={18} style={{ color: T.green }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.textPri }}>Publish to Gallery</div>
              <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>Share your circuit with the NodeSim community</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', padding: 4, borderRadius: 6, lineHeight: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Success State ── */}
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: T.greenBg, border: `1px solid ${T.greenBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={32} style={{ color: T.green }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: T.textPri }}>Published! 🎉</div>
            <div style={{ fontSize: 13, color: T.textSec, marginBottom: 24, lineHeight: 1.6 }}>
              Your circuit is now live in the Community Gallery.<br />Others can view and simulate it instantly.
            </div>
            <a
              href="/circuits"
              style={{
                display: 'inline-block',
                background: T.green, color: '#fff',
                padding: '11px 28px', borderRadius: 9,
                fontWeight: 700, textDecoration: 'none', fontSize: 14,
              }}
            >
              View in Gallery →
            </a>
          </div>

        ) : (
          /* ── Form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Circuit Name */}
            <div>
              <label style={label}>Circuit Name <span style={{ color: T.green }}>*</span></label>
              <input
                style={field}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. RC Low Pass Filter"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label style={label}>Description <span style={{ color: T.textMut, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <textarea
                style={{ ...field, resize: 'vertical', minHeight: 76, lineHeight: 1.5 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does this circuit do? What can others learn from it?"
                maxLength={500}
              />
            </div>

            {/* Category + Author row */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>Category</label>
                {/* Wrapper for custom select arrow */}
                <div style={{ position: 'relative' }}>
                  <select
                    style={{ ...field, paddingRight: 36, cursor: 'pointer' }}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value} style={{ background: T.bg, color: T.textPri }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none', color: T.textMut, fontSize: 10,
                  }}>▼</div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={label}>Your Name</label>
                <input
                  style={field}
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Anonymous"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.redBg, border: `1px solid ${T.red}`,
                borderRadius: 8, padding: '10px 12px',
                fontSize: 13, color: '#fca5a5',
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {errorMsg}
              </div>
            )}

            {/* Info note */}
            <div style={{
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: '10px 12px',
              fontSize: 11, color: T.textMut, lineHeight: 1.7,
            }}>
              📌 <strong style={{ color: T.textSec }}>Public:</strong> Anyone can view and simulate your circuit. Do not include personal or sensitive information.
            </div>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={status === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: status === 'loading' ? T.border : T.green,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '13px',
                fontSize: 14,
                fontWeight: 700,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                letterSpacing: '0.01em',
              }}
            >
              {status === 'loading'
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</>
                : <><Globe size={16} /> Publish to Gallery</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
