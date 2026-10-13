import React from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';

function getErrorMessage(error: string): { title: string; detail: string } {
  if (error.includes('429') || error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')) {
    return { title: 'AI quota reached', detail: 'The AI service is temporarily rate-limited. Wait a few seconds and try again.' };
  }
  if (error.includes('503') || error.toLowerCase().includes('overloaded')) {
    return { title: 'AI service busy', detail: 'Gemini is overloaded right now. Try again in a moment.' };
  }
  if (error.includes('401') || error.toLowerCase().includes('key')) {
    return { title: 'AI not configured', detail: 'The AI API key is missing or invalid. Contact the site owner.' };
  }
  return { title: 'AI analysis failed', detail: error };
}

interface AiWaveformPanelProps {
  onClose: () => void;
  onRetry: () => void;
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
}

export function AiWaveformPanel({ onClose, onRetry, analysis, isLoading, error }: AiWaveformPanelProps) {
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
        <div>
          {(() => { const { title, detail } = getErrorMessage(error!); return (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#7f1d1d33', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 12px' }}>
              <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#fca5a5', lineHeight: 1.5 }}>{detail}</div>
              </div>
            </div>
          );})()}
          <button onClick={onRetry} style={{ marginTop: 8, padding: '6px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            Try again
          </button>
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
