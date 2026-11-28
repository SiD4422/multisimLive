import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  FolderOpen,
  Trash2,
  Clock,
  CircuitBoard,
  Cloud,
  CloudOff,
  CloudUpload,
  Loader2,
  HardDrive,
} from 'lucide-react';
import LZString from 'lz-string';
import { useSchematicStore } from '../store/useSchematicStore';
import { useAuth } from '../hooks/useAuth';
import type { MergedSavedCircuit } from '../utils/circuitSavesStorage';
import {
  deleteSavedCircuitDual,
  dismissCloudImportPrompt,
  getCloudSyncLabel,
  importPendingLocalCircuitsToCloud,
  saveCircuitDual,
  syncLocalCircuitToCloud,
  useCloudSync,
} from '../utils/cloudSync';
import { AuthProviderButtons } from './AuthModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  circuitName: string;
  onNameChange: (name: string) => void;
}

export function SavedCircuitsModal({ isOpen, onClose, circuitName, onNameChange }: Props) {
  if (!isOpen) return null;
  return <SavedCircuitsModalInner onClose={onClose} circuitName={circuitName} onNameChange={onNameChange} />;
}

function SavedCircuitsModalInner({ onClose, circuitName, onNameChange }: Omit<Props, 'isOpen'>) {
  const { exportState, importState, components } = useSchematicStore();
  const { user } = useAuth();
  const {
    status,
    isOnline,
    mergedSaves,
    pendingLocalImport,
    isImporting,
    lastError,
  } = useCloudSync();
  const [saveName, setSaveName] = useState(circuitName || 'Untitled Circuit');
  const [toast, setToast] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showSignInInline, setShowSignInInline] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleSave = async () => {
    const result = await saveCircuitDual({
      name: saveName,
      stateJson: exportState(),
      componentCount: components.length,
    });
    onNameChange(result.saved.name);
    showToast(
      result.syncedToCloud
        ? `Saved "${result.saved.name}" to cloud ✓`
        : `Saved "${result.saved.name}" locally (offline fallback)`,
    );
  };

  const handleLoad = (save: MergedSavedCircuit) => {
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

  const handleDelete = async (save: MergedSavedCircuit) => {
    await deleteSavedCircuitDual(save);
    showToast(`Deleted "${save.name}"`);
  };

  const handleImportAll = async () => {
    const count = await importPendingLocalCircuitsToCloud();
    if (count > 0) {
      showToast(`Imported ${count} local circuit${count === 1 ? '' : 's'} to cloud ✓`);
    }
  };

  const handleUploadSingle = async (save: MergedSavedCircuit) => {
    setUploadingId(save.id);
    try {
      const ok = await syncLocalCircuitToCloud(save);
      if (ok) {
        showToast(`Uploaded "${save.name}" to cloud ✓`);
      } else {
        showToast('Cloud upload failed — saved locally');
      }
    } finally {
      setUploadingId(null);
    }
  };

  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const syncLabel = getCloudSyncLabel(status);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8 }}>
              <CircuitBoard size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>My Circuits</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {user ? 'Synced to your cloud account with offline local fallback' : 'Saved in browser storage — sign in to sync across devices'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                background:
                  status === 'saved-cloud'
                    ? 'rgba(22, 163, 74, 0.16)'
                    : status === 'saving'
                    ? 'rgba(234, 179, 8, 0.16)'
                    : 'rgba(148, 163, 184, 0.14)',
                border:
                  status === 'saved-cloud'
                    ? '1px solid rgba(74, 222, 128, 0.35)'
                    : status === 'saving'
                    ? '1px solid rgba(250, 204, 21, 0.35)'
                    : '1px solid rgba(148, 163, 184, 0.25)',
                color:
                  status === 'saved-cloud'
                    ? '#4ade80'
                    : status === 'saving'
                    ? '#facc15'
                    : '#cbd5e1',
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'saving' && <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />}
              {status === 'saved-cloud' && <Cloud size={11} />}
              {status === 'offline-local' && <CloudOff size={11} />}
              <span>{syncLabel}</span>
            </span>

            <button onClick={onClose} aria-label="Close My Circuits" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sign-in prompt when unauthenticated */}
        {!user && (
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#cbd5e1' }}>
                Sign in to back up circuits under your account and import browser saves to cloud.
              </span>
              <button
                type="button"
                onClick={() => setShowSignInInline(v => !v)}
                style={{
                  background: 'rgba(22, 163, 74, 0.16)',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  color: '#4ade80',
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {showSignInInline ? 'Hide Sign In' : 'Sign In'}
              </button>
            </div>
            {showSignInInline && (
              <AuthProviderButtons compact onSuccess={() => setShowSignInInline(false)} />
            )}
          </div>
        )}

        {/* Offer to import existing localStorage circuits to cloud after sign-in */}
        {user && pendingLocalImport.length > 0 && (
          <div style={{
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 12.5, color: '#e0f2fe', lineHeight: 1.4, flex: '1 1 220px' }}>
              Found <strong>{pendingLocalImport.length}</strong> local circuit{pendingLocalImport.length === 1 ? '' : 's'} saved in this browser. Import {pendingLocalImport.length === 1 ? 'it' : 'them'} to your cloud account?
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                disabled={isImporting || !isOnline}
                onClick={() => void handleImportAll()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 7,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isImporting || !isOnline ? 'not-allowed' : 'pointer',
                  opacity: isImporting || !isOnline ? 0.65 : 1,
                }}
              >
                {isImporting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CloudUpload size={13} />}
                {isImporting ? 'Importing...' : `Import ${pendingLocalImport.length} to Cloud`}
              </button>
              <button
                type="button"
                onClick={dismissCloudImportPrompt}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  color: '#cbd5e1',
                  borderRadius: 7,
                  padding: '6px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {/* Save current */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 10 }}>Save Current Circuit</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSave(); }}
              placeholder="Circuit name..."
              style={{ flex: 1, background: '#1e293b', border: '1px solid #475569', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={() => void handleSave()}
              disabled={status === 'saving'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: status === 'saving' ? 'not-allowed' : 'pointer' }}
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* Saved list */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 10 }}>
            Saved Circuits ({mergedSaves.length})
          </div>
          {mergedSaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 13 }}>
              No saved circuits yet. Save your first circuit above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {mergedSaves.map(save => (
                <div key={save.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{save.name}</div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 7px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                          background: save.origin === 'local-only' ? 'rgba(148,163,184,0.14)' : 'rgba(22,163,74,0.16)',
                          color: save.origin === 'local-only' ? '#cbd5e1' : '#4ade80',
                        }}
                      >
                        {save.origin === 'local-only' ? <HardDrive size={9} /> : <Cloud size={9} />}
                        {save.origin === 'synced' ? 'Synced' : save.origin === 'cloud-only' ? 'Cloud' : 'Local'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Clock size={10} />
                      {fmtDate(save.savedAt)}
                      <span style={{ color: '#475569' }}>·</span>
                      {save.componentCount} component{save.componentCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {user && isOnline && save.origin === 'local-only' && (
                    <button
                      type="button"
                      disabled={uploadingId === save.id}
                      onClick={() => void handleUploadSingle(save)}
                      title="Upload to cloud account"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0c4a6e', border: '1px solid #0284c7', borderRadius: 7, padding: '6px 10px', color: '#e0f2fe', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <CloudUpload size={12} /> Sync
                    </button>
                  )}
                  <button
                    onClick={() => handleLoad(save)}
                    title="Open circuit"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '6px 12px', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FolderOpen size={13} /> Open
                  </button>
                  <button
                    onClick={() => void handleDelete(save)}
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

        {lastError && (
          <div style={{ background: 'rgba(127, 29, 29, 0.35)', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 12px', color: '#fecaca', fontSize: 12 }}>
            Cloud sync unavailable ({lastError}). Local browser saves are unaffected.
          </div>
        )}

        {toast && (
          <div style={{ background: '#10b98120', border: '1px solid #10b98140', borderRadius: 8, padding: '8px 14px', color: '#10b981', fontSize: 13, textAlign: 'center' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
