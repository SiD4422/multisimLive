import React, { useRef, useState } from 'react';
import { X, Upload, Trash2, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import { parseLibFile } from '../utils/parseLibFile';

interface CustomModelPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomModelPanel({ isOpen, onClose }: CustomModelPanelProps) {
  const { customModels, addCustomModels, removeCustomModel, clearCustomModels } = useSchematicStore();
  const [pasteText, setPasteText] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'warning' | 'error', msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    const { models, portOrders, warnings } = parseLibFile(text);
    if (Object.keys(models).length > 0) {
      addCustomModels(models, portOrders);
      setStatus({ type: 'success', msg: `Loaded ${Object.keys(models).length} model(s): ${Object.keys(models).join(', ')}` });
      setPasteText('');
    } else {
      setStatus({ type: 'warning', msg: warnings[0] || 'No models found.' });
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleParse(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const modelCount = Object.keys(customModels).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, right: 0,
        width: Math.min(420, window.innerWidth - 16),
        height: '100vh',
        background: '#1e293b',
        borderLeft: '1px solid #334155',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} style={{ color: '#4ade80' }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Custom SPICE Models</span>
          {modelCount > 0 && (
            <span style={{ background: '#4ade8033', color: '#4ade80', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{modelCount}</span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Explainer */}
        <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          Paste a SPICE <code style={{ color: '#4ade80' }}>.lib</code> file from any manufacturer (Vishay, ON Semi, TI, etc.).
          NodeSim will automatically use your model instead of the built-in approximation when a component's value matches the model name.
        </div>

        {/* Upload button */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontSize: 13 }}
          >
            <Upload size={15} /> Upload .lib file
          </button>
          {modelCount > 0 && (
            <button
              onClick={() => { clearCustomModels(); setStatus(null); }}
              style={{ background: '#7f1d1d33', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 12 }}
              title="Remove all custom models"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".lib,.txt,.mod,.sp" style={{ display: 'none' }} onChange={handleFile} />

        {/* Paste area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or paste model text</label>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`.model 2N3904 NPN (IS=6.734f XTI=3 EG=1.11 VAF=74.03 BF=416.4 ...)`}
            style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 11, fontFamily: 'monospace', resize: 'vertical', minHeight: 120 }}
          />
          <button
            onClick={() => handleParse(pasteText)}
            disabled={!pasteText.trim()}
            style={{ background: pasteText.trim() ? '#16a34a' : '#1e293b', color: pasteText.trim() ? 'white' : '#475569', border: 'none', borderRadius: 8, padding: '10px 0', cursor: pasteText.trim() ? 'pointer' : 'default', fontSize: 13, fontWeight: 600 }}
          >
            Parse &amp; Load Models
          </button>
        </div>

        {/* Status */}
        {status && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: status.type === 'success' ? '#14532d33' : '#78350f33', border: `1px solid ${status.type === 'success' ? '#16a34a' : '#d97706'}`, borderRadius: 8, padding: 10, fontSize: 12, color: status.type === 'success' ? '#4ade80' : '#fbbf24' }}>
            {status.type === 'success' ? <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
            {status.msg}
          </div>
        )}

        {/* Loaded models list */}
        {modelCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loaded Models ({modelCount})</label>
            {Object.keys(customModels).map(name => {
              const ports = useSchematicStore.getState().customModelPorts?.[name];
              const portStr = ports ? `  [${ports.join(', ')}]` : '';
              return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderRadius: 6, padding: '6px 10px' }}>
                <code style={{ fontSize: 12, color: '#4ade80' }}>{name}{portStr}</code>
                <button onClick={() => removeCustomModel(name)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}>
                  <X size={12} />
                </button>
              </div>
              );
            })}
          </div>
        )}

        {/* Quick links to common .lib sources */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 12 }}>
          <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Where to get .lib files</label>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
            <div>• <a href="https://www.vishay.com/en/mosfets/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Vishay</a> — MOSFETs, diodes</div>
            <div>• <a href="https://www.onsemi.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>ON Semiconductor</a> — BJTs, MOSFETs</div>
            <div>• <a href="https://www.ti.com/design-resources/design-tools-simulation/spice-models.html" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Texas Instruments</a> — op-amps, ICs</div>
            <div>• <a href="https://ltspice.analog.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Analog Devices / LTspice</a> — comprehensive library</div>
          </div>
        </div>
      </div>
    </div>
  );
}
