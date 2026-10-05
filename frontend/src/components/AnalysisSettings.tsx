import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

interface AnalysisSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ isOpen, onClose }) => {
  // Never render if explicitly closed
  if (!isOpen) return null;

  return <AnalysisSettingsInner onClose={onClose} />;
};

// Inner component so hooks are only called when modal is open
function AnalysisSettingsInner({ onClose }: { onClose?: () => void }) {
  const {
    analysisMode, setAnalysisMode,
    acSettings, setAcSettings,
    dcSettings, setDcSettings,
    transientSettings, setTransientSettings,
    components
  } = useSchematicStore();

  const voltageSources = React.useMemo(() => {
    return components
      .filter(c => c.type === 'ACSource' || c.type === 'DCSource')
      .map(c => c.id);
  }, [components]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#fff' }}>
      {/* Header */}
      <div className="analysis-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>Simulation Settings</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#16a34a' }}>Configure your analysis parameters</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="analysis-content">
        {/* Analysis Mode Tabs */}
        <div style={{ marginBottom: '20px' }}>
          <label className="input-label">Analysis Type</label>
          <div className="analysis-tabs">
            {(['transient', 'ac', 'dc', 'op'] as const).map(m => (
              <button
                key={m}
                onClick={() => setAnalysisMode(m)}
                className={`analysis-tab ${analysisMode === m ? 'active' : ''}`}
              >
                {m === 'transient' ? '⏱ Transient' : m === 'ac' ? '〜 AC Sweep' : m === 'dc' ? '📈 DC Sweep' : '⚡ Operating Point (.op)'}
              </button>
            ))}
          </div>
        </div>

        {/* Transient Settings */}
        {analysisMode === 'transient' && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">End Time</label>
              <input
                className="input-field"
                value={transientSettings.endTime}
                onChange={e => setTransientSettings({ endTime: e.target.value })}
                placeholder="e.g. 10ms"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Step Size</label>
              <input
                className="input-field"
                value={transientSettings.step}
                onChange={e => setTransientSettings({ step: e.target.value })}
                placeholder="e.g. 0.01ms"
              />
            </div>
          </div>
        )}

        {/* AC Sweep Settings */}
        {analysisMode === 'ac' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Quick Presets</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'Audio (20Hz–20kHz)', fStart: '20', fStop: '20k', points: '100' },
                  { label: 'Filter (1Hz–1MHz)', fStart: '1', fStop: '1Meg', points: '100' },
                  { label: 'Power (1Hz–100kHz)', fStart: '1', fStop: '100k', points: '50' },
                  { label: 'RF (1kHz–1GHz)', fStart: '1k', fStop: '1G', points: '100' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setAcSettings({ fStart: preset.fStart, fStop: preset.fStop, points: preset.points })}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >{preset.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Start Freq</label>
                <input
                  className="input-field"
                  value={acSettings.fStart}
                  onChange={e => setAcSettings({ fStart: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Stop Freq</label>
                <input
                  className="input-field"
                  value={acSettings.fStop}
                  onChange={e => setAcSettings({ fStop: e.target.value })}
                  placeholder="1Meg"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Pts/Dec</label>
                <input
                  className="input-field"
                  value={acSettings.points}
                  onChange={e => setAcSettings({ points: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#166534', lineHeight: 1.6, marginBottom: '20px' }}>
              <strong>Tip:</strong> AC Sweep plots the frequency response (Bode plot). Use an <strong>AC Voltage Source</strong> as your input. Place a Voltage Probe on the output node. The Grapher will show magnitude (dB) and phase vs. frequency.
            </div>
          </>
        )}

        {/* DC Sweep Settings */}
        {analysisMode === 'dc' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: '1 1 45%' }}>
              <label className="input-label">Source</label>
              <select
                className="input-field"
                value={dcSettings.source}
                onChange={e => setDcSettings({ source: e.target.value })}
              >
                <option value="">-- Select Source --</option>
                {voltageSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label className="input-label">Step</label>
              <input
                className="input-field"
                value={dcSettings.step}
                onChange={e => setDcSettings({ step: e.target.value })}
                placeholder="0.1"
              />
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label className="input-label">Start (V)</label>
              <input
                className="input-field"
                value={dcSettings.start}
                onChange={e => setDcSettings({ start: e.target.value })}
                placeholder="0"
              />
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label className="input-label">Stop (V)</label>
              <input
                className="input-field"
                value={dcSettings.stop}
                onChange={e => setDcSettings({ stop: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
        )}

        {/* Hint */}
        <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #f3f4f6', margin: 0 }}>
          {analysisMode === 'ac'
            ? '💡 Use Hz, kHz, Meg (e.g. "1 → 1Meg"). Place a voltage probe to see the Bode plot.'
            : analysisMode === 'dc'
            ? '💡 Source name must match a source ID in your circuit (e.g. V1).'
            : analysisMode === 'op'
            ? '💡 Calculates the steady-state DC voltage at every node and current through sources. No graphs are generated.'
            : '💡 Use s, ms, µs units (e.g. "10ms", "0.01ms"). Step defaults to end÷1000.'}
        </p>
      </div>
    </div>
  );
}
