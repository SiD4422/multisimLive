import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Trash2, Clock, CircuitBoard } from 'lucide-react';
import LZString from 'lz-string';
import { useSchematicStore } from '../store/useSchematicStore';

const SAVES_KEY = 'nodesim-saved-circuits-v1';

interface SavedCircuit {
  id: string;
  name: string;
  compressed: string;
  savedAt: number;
  componentCount: number;
}

function loadSaves(): SavedCircuit[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSaves(saves: SavedCircuit[]): void {
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  circuitName: string;
  onNameChange: (name: string) => void;
}

export function SavedCircuitsModal({ isOpen, onClose, circuitName, onNameChange }: Props) {
  const { exportState, importState, components } = useSchematicStore();
  const [saves, setSaves] = useState<SavedCircuit[]>([]);
  const [saveName, setSaveName] = useState(circuitName || 'Untitled Circuit');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSaves(loadSaves());
      setSaveName(circuitName || 'Untitled Circuit');
    }
  }, [isOpen, circuitName]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = () => {
    const name = saveName.trim() || 'Untitled Circuit';
    const json = exportState();
    const compressed = LZString.compress(json);
    const existing = saves.find(s => s.name === name);
    let next: SavedCircuit[];
    if (existing) {
      next = saves.map(s =>
        s.name === name
          ? { ...s, compressed, savedAt: Date.now(), componentCount: components.length }
          : s
      );
    } else {
      const newEntry: SavedCircuit = {
        id: `${Date.now()}`,
        name,
        compressed,
        savedAt: Date.now(),
        componentCount: components.length,
      };
      next = [newEntry, ...saves];
    }
    writeSaves(next);
    setSaves(next);
    onNameChange(name);
    showToast(`Saved "${name}"`);
  };

  const handleLoad = (save: SavedCircuit) => {
    try {
      const json = LZString.decompress(save.compressed);
      if (!json) throw new Error('Decompression failed');
      importState(json);
      onNameChange(save.name);
      onClose();
    } catch {
      showToast('Failed to load circuit');
    }
  };

  const handleDelete = (id: string) => {
    const next = saves.filter(s => s.id !== id);
    writeSaves(next);
    setSaves(next);
  };

  if (!isOpen) return null;

  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8 }}>
              <CircuitBoard size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>My Circuits</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Save & restore your work locally</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Save current */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 10 }}>Save Current Circuit</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              placeholder="Circuit name..."
              style={{ flex: 1, background: '#1e293b', border: '1px solid #475569', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* Saved list */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 10 }}>
            Saved Circuits ({saves.length})
          </div>
          {saves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 13 }}>
              No saved circuits yet. Save your first circuit above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {saves.map(save => (
                <div key={save.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{save.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Clock size={10} />
                      {fmtDate(save.savedAt)}
                      <span style={{ color: '#475569' }}>·</span>
                      {save.componentCount} component{save.componentCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLoad(save)}
                    title="Open circuit"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '6px 12px', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FolderOpen size={13} /> Open
                  </button>
                  <button
                    onClick={() => handleDelete(save.id)}
                    title="Delete"
                    style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && (
          <div style={{ background: '#10b98120', border: '1px solid #10b98140', borderRadius: 8, padding: '8px 14px', color: '#10b981', fontSize: 13, textAlign: 'center' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
