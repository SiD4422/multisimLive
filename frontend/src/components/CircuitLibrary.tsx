import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Save, Trash2, FolderOpen, X, Clock, Cpu } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

interface SavedCircuit {
  id: string;
  name: string;
  createdAt: string;
  schematic: string;   // JSON string from exportState
  thumbnail: string;   // base64 data URL or empty
  componentCount: number;
}

const STORAGE_KEY = 'multisim_circuit_library';

function getLibrary(): SavedCircuit[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}
function saveLibrary(lib: SavedCircuit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveRequest: () => string; // returns thumbnail data URL from Konva stage
}

export function CircuitLibrary({ isOpen, onClose, onSaveRequest }: Props) {
  const { exportState, importState } = useSchematicStore();
  const [library, setLibrary] = useState<SavedCircuit[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setLibrary(getLibrary());
  }, [isOpen]);

  const handleSave = useCallback(() => {
    const name = saveName.trim() || 'Untitled Circuit';
    const schematic = exportState();
    const thumbnail = onSaveRequest();
    const components = JSON.parse(schematic).components || [];

    const entry: SavedCircuit = {
      id: 'ckt_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      schematic,
      thumbnail,
      componentCount: components.length,
    };

    const updated = [entry, ...getLibrary()].slice(0, 30); // max 30 saves
    saveLibrary(updated);
    setLibrary(updated);
    setSaveName('');
    setIsSaving(false);
  }, [saveName, exportState, onSaveRequest]);

  const handleLoad = (circuit: SavedCircuit) => {
    if (window.confirm(`Load "${circuit.name}"? Current schematic will be replaced.`)) {
      importState(circuit.schematic);
      onClose();
    }
  };

  const handleDelete = (id: string) => {
    const updated = getLibrary().filter(c => c.id !== id);
    saveLibrary(updated);
    setLibrary(updated);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, width: 680, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={20} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>My Circuits</h2>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>{library.length} / 30 saved</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Save bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(16,185,129,0.05)', display: 'flex', gap: 10 }}>
          {isSaving ? (
            <>
              <input
                autoFocus
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsSaving(false); }}
                placeholder="Enter circuit name..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(16,185,129,0.4)',
                  borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
              />
              <button onClick={handleSave} style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Save
              </button>
              <button onClick={() => setIsSaving(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#9ca3af', cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsSaving(true)} style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '9px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Save size={15} /> Save Current Circuit
            </button>
          )}
        </div>

        {/* Circuit grid */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {library.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <BookOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
              <p style={{ fontSize: 15 }}>No saved circuits yet.</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Click "Save Current Circuit" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {library.map(ckt => (
                <div key={ckt.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s, transform .15s',
                }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                   onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                  {/* Thumbnail */}
                  <div style={{ height: 100, background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                       onClick={() => handleLoad(ckt)}>
                    {ckt.thumbnail ? (
                      <img src={ckt.thumbnail} alt={ckt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Cpu size={32} color="#374151" />
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ckt.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} />{formatDate(ckt.createdAt)}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{ckt.componentCount} components</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                      <button onClick={() => handleLoad(ckt)} style={{ flex: 1, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '5px 0', color: '#10b981', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <FolderOpen size={11} /> Load
                      </button>
                      <button onClick={() => handleDelete(ckt.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '5px 8px', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
