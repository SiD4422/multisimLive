import React from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';

interface AiWaveformPanelProps {
  onClose: () => void;
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
}

export function AiWaveformPanel({ onClose, analysis, isLoading, error }: AiWaveformPanelProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 44, // below toolbar
      right: 0,
      width: 320,
      maxHeight: 'calc(100% - 44px)',
      overflowY: 'auto',
      background: '#0f172a',
      border: '1px solid #334155',
      borderTop: 'none',
      borderRight: 'none',
      zIndex: 20,
      padding: '14px 16px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Waveform Analysis</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 10 }}>
          <Loader2 size={24} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Gemini is reading your waveform...</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 12px' }}>
          <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>{error}</span>
        </div>
      )}

      {analysis && !isLoading && (
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {analysis}
        </div>
      )}
    </div>
  );
}
