import React from 'react';
import { X, GitCompare, Play } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import {
  expandParametricSweep,
  getDefaultSweepConfigForComponent,
  isSweepableComponent,
} from '../utils/parametricSweep';
import { listNoiseCandidateSources } from '../utils/noiseAnalysis';

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
    noiseSettings, setNoiseSettings,
    parametricSweep, setParametricSweep,
    runSimulation, isSimulating,
    components
  } = useSchematicStore();

  const voltageSources = React.useMemo(() => {
    return components
      .filter(c => c.type === 'ACSource' || c.type === 'DCSource')
      .map(c => c.id);
  }, [components]);

  const noiseSources = React.useMemo(
    () => listNoiseCandidateSources(components),
    [components],
  );

  const sweepableComponents = React.useMemo(
    () => components.filter((c) => isSweepableComponent(c)),
    [components],
  );

  const selectedSweepComp = React.useMemo(
    () => sweepableComponents.find((c) => c.id === parametricSweep.componentId) ?? sweepableComponents[0] ?? null,
    [sweepableComponents, parametricSweep.componentId],
  );

  const sweepPreview = React.useMemo(() => {
    if (!parametricSweep.enabled || !selectedSweepComp) return null;
    const effectiveCfg =
      parametricSweep.componentId === selectedSweepComp.id
        ? parametricSweep
        : { ...parametricSweep, componentId: selectedSweepComp.id };
    return expandParametricSweep(effectiveCfg, selectedSweepComp.type);
  }, [parametricSweep, selectedSweepComp]);

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
            {(['transient', 'ac', 'dc', 'op', 'noise'] as const).map(m => (
              <button
                key={m}
                onClick={() => setAnalysisMode(m)}
                className={`analysis-tab ${analysisMode === m ? 'active' : ''}`}
              >
                {m === 'transient'
                  ? '⏱ Transient'
                  : m === 'ac'
                  ? '〜 AC Sweep'
                  : m === 'dc'
                  ? '📈 DC Sweep'
                  : m === 'op'
                  ? '⚡ Operating Point (.op)'
                  : '🔊 Noise (.noise)'}
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

        {/* Noise Analysis Settings */}
        {analysisMode === 'noise' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Output Node</label>
                <input
                  className="input-field"
                  value={noiseSettings.outputNode}
                  onChange={e => setNoiseSettings({ outputNode: e.target.value })}
                  placeholder="Auto (from Voltage Probe)"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Input Source</label>
                <select
                  className="input-field"
                  value={noiseSettings.inputSource}
                  onChange={e => setNoiseSettings({ inputSource: e.target.value })}
                >
                  {noiseSources.length === 0 ? (
                    <option value="">-- Place a Source --</option>
                  ) : (
                    noiseSources.map(src => (
                      <option key={src.id} value={src.id}>
                        {src.id} ({src.type})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Scale</label>
                <select
                  className="input-field"
                  value={noiseSettings.variation}
                  onChange={e => setNoiseSettings({ variation: e.target.value as 'dec' | 'oct' | 'lin' })}
                >
                  <option value="dec">Decade (dec)</option>
                  <option value="oct">Octave (oct)</option>
                  <option value="lin">Linear (lin)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Pts/Dec</label>
                <input
                  className="input-field"
                  value={noiseSettings.points}
                  onChange={e => setNoiseSettings({ points: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Start Freq</label>
                <input
                  className="input-field"
                  value={noiseSettings.fStart}
                  onChange={e => setNoiseSettings({ fStart: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Stop Freq</label>
                <input
                  className="input-field"
                  value={noiseSettings.fStop}
                  onChange={e => setNoiseSettings({ fStop: e.target.value })}
                  placeholder="1Meg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Parametric Sweep (.step) Section */}
        {analysisMode !== 'op' && analysisMode !== 'noise' && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: 10, border: `1px solid ${parametricSweep.enabled ? '#7dd3fc' : '#e5e7eb'}`, background: parametricSweep.enabled ? '#f0f9ff' : '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: parametricSweep.enabled ? 10 : 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                <input
                  type="checkbox"
                  checked={parametricSweep.enabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked && selectedSweepComp && !parametricSweep.componentId) {
                      setParametricSweep(getDefaultSweepConfigForComponent(selectedSweepComp));
                    } else {
                      setParametricSweep({ enabled: checked });
                    }
                  }}
                />
                <GitCompare size={14} style={{ color: '#0284c7' }} />
                <span>Parametric Sweep (.step)</span>
              </label>
              {parametricSweep.enabled && sweepPreview && !sweepPreview.error && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1' }}>
                  {sweepPreview.steps.length} step{sweepPreview.steps.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {parametricSweep.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sweepableComponents.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Place a resistor, capacitor, inductor, potentiometer, or source on the canvas to sweep its parameter.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="input-label">Component</label>
                      <select
                        className="input-field"
                        value={selectedSweepComp?.id || ''}
                        onChange={(e) => {
                          const target = sweepableComponents.find((c) => c.id === e.target.value);
                          if (target) {
                            setParametricSweep(getDefaultSweepConfigForComponent(target));
                          }
                        }}
                      >
                        {sweepableComponents.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id} ({c.type}{c.value ? ` · ${c.value}` : ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSweepComp?.type === 'potentiometer' && (
                      <div>
                        <label className="input-label">Parameter</label>
                        <select
                          className="input-field"
                          value={parametricSweep.parameter}
                          onChange={(e) => {
                            const param = e.target.value as 'value' | 'wiper_position';
                            setParametricSweep(
                              param === 'wiper_position'
                                ? { parameter: 'wiper_position', start: '10', stop: '90', step: '20' }
                                : { parameter: 'value', start: '5k', stop: '20k', step: '5k' },
                            );
                          }}
                        >
                          <option value="wiper_position">Wiper Position (%)</option>
                          <option value="value">Total Resistance (Ω)</option>
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label">Start</label>
                        <input
                          className="input-field"
                          aria-label="Sweep Start"
                          value={parametricSweep.start}
                          onChange={(e) => setParametricSweep({ start: e.target.value })}
                          placeholder="1k"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label">Stop</label>
                        <input
                          className="input-field"
                          aria-label="Sweep Stop"
                          value={parametricSweep.stop}
                          onChange={(e) => setParametricSweep({ stop: e.target.value })}
                          placeholder="10k"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label">Step</label>
                        <input
                          className="input-field"
                          aria-label="Sweep Step"
                          value={parametricSweep.step}
                          onChange={(e) => setParametricSweep({ step: e.target.value })}
                          placeholder="2k"
                        />
                      </div>
                    </div>

                    {sweepPreview?.error ? (
                      <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                        {sweepPreview.error}
                      </div>
                    ) : sweepPreview && sweepPreview.steps.length > 0 ? (
                      <div style={{ fontSize: 11, color: '#0369a1', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                        Steps: {sweepPreview.steps.map((s) => s.label).join(', ')}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      disabled={isSimulating || Boolean(sweepPreview?.error)}
                      onClick={() => void runSimulation(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 6, border: 'none',
                        background: '#0284c7', color: '#fff', fontSize: 12, fontWeight: 700,
                        cursor: isSimulating ? 'not-allowed' : 'pointer', opacity: isSimulating || sweepPreview?.error ? 0.65 : 1,
                      }}
                    >
                      <Play size={13} fill="currentColor" />
                      Run Parametric Sweep
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #f3f4f6', margin: 0 }}>
          {analysisMode === 'ac'
            ? '💡 Use Hz, kHz, Meg (e.g. "1 → 1Meg"). Place a voltage probe to see the Bode plot.'
            : analysisMode === 'dc'
            ? '💡 Source name must match a source ID in your circuit (e.g. V1).'
            : analysisMode === 'noise'
            ? '💡 Computes Johnson/shot noise spectral density (V/√Hz) and integrated RMS noise. Place a Voltage Probe on your output wire or leave Output Node blank for auto-detection.'
            : analysisMode === 'op'
            ? '💡 Calculates the steady-state DC voltage at every node and current through sources. No graphs are generated.'
            : '💡 Use s, ms, µs units (e.g. "10ms", "0.01ms"). Step defaults to end÷1000.'}
        </p>
      </div>
    </div>
  );
}
