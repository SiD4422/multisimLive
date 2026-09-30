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
  { value: 'basic', label: 'Basic / Beginner' },
  { value: 'analog', label: 'Analog' },
  { value: 'digital', label: 'Digital' },
  { value: 'power', label: 'Power Electronics' },
  { value: 'other', label: 'Other' },
];

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { components, wires, probes } = useSchematicStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('basic');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [publishedId, setPublishedId] = useState('');

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!name.trim()) { setErrorMsg('Please enter a circuit name.'); return; }
    if (components.length === 0) { setErrorMsg('Your circuit has no components to publish.'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const circuitData = LZString.compressToEncodedURIComponent(JSON.stringify({ components, wires, probes }));
      const id = await publishCircuit({
        name: name.trim().slice(0, 100),
        description: description.trim().slice(0, 500),
        category,
        authorName: authorName.trim().slice(0, 50) || 'Anonymous',
        componentCount: components.length,
        circuitData,
      });
      setPublishedId(id);
      setStatus('success');
    } catch (e) {
      setErrorMsg('Failed to publish. Check your internet connection.');
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: '#64748b', marginBottom: 6, display: 'block',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8 }}>
              <Globe size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Publish to Gallery</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Share your circuit with the community</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Published!</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Your circuit is now live in the Community Gallery.</div>
            <a
              href="/circuits"
              style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
            >View in Gallery →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Circuit Name *</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. RC Low Pass Filter" maxLength={100} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this circuit do? (optional)" maxLength={500} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle }} value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Your Name</label>
                <input style={inputStyle} value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Anonymous" maxLength={50} />
              </div>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fca5a5' }}>
                <AlertCircle size={14} />{errorMsg}
              </div>
            )}

            <div style={{ background: '#0f172a', borderRadius: 8, padding: 10, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              📌 <strong style={{ color: '#94a3b8' }}>Note:</strong> Anyone will be able to view and simulate your circuit. Do not include personal or sensitive information.
            </div>

            <button
              onClick={handlePublish}
              disabled={status === 'loading'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: status === 'loading' ? '#334155' : '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              {status === 'loading' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</> : <><Globe size={16} /> Publish to Gallery</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
