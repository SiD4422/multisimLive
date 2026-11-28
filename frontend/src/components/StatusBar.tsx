import React from 'react';
import { Share2, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

export function StatusBar({ onShare }: { onShare?: () => void }) {
  const { components, wires, isSimulating, simulationProgress, simulationError, simulationData } = useSchematicStore();
  
  const status = simulationError ? 'error'
               : isSimulating ? 'running'
               : simulationData && simulationData.length > 0 ? 'done'
               : 'ready';
  const runningPercent = simulationProgress?.percent ?? 15;
  const runningLabel = simulationProgress?.label ?? 'Simulating...';

  return (
    <div style={{
      height: 28,
      background: '#0f172a',
      borderTop: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      fontSize: 11,
      fontFamily: 'monospace',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b' }}>
        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {status === 'running' && <Loader2 size={10} style={{ color: '#facc15', animation: 'spin 1s linear infinite' }} />}
          {status === 'done' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />}
          {status === 'error' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
          {status === 'ready' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />}
          <span style={{ color: status === 'running' ? '#facc15' : status === 'done' ? '#22c55e' : status === 'error' ? '#ef4444' : '#94a3b8' }}>
            {status === 'running' ? `${runningLabel} (${runningPercent}%)` : status === 'done' ? 'Ready' : status === 'error' ? 'Error' : 'Ready'}
          </span>
          {status === 'running' && (
            <span
              role="progressbar"
              aria-valuenow={runningPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                width: 64,
                height: 4,
                background: '#1e293b',
                borderRadius: 999,
                overflow: 'hidden',
                display: 'inline-block',
              }}
            >
              <span
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${Math.min(100, Math.max(5, runningPercent))}%`,
                  background: 'linear-gradient(90deg, #facc15, #22c55e)',
                  transition: 'width 180ms ease-out',
                }}
              />
            </span>
          )}
        </div>
        <span style={{ color: '#1e293b' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={10} style={{ color: '#4ade80' }} />
          <span style={{ color: '#4ade80' }}>ngspice (WASM)</span>
        </div>
        <span style={{ color: '#1e293b' }}>|</span>
        <span>Components: <span style={{ color: '#94a3b8' }}>{components.length}</span></span>
        <span>Wires: <span style={{ color: '#94a3b8' }}>{wires.length}</span></span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
        {status === 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e' }}>
            <CheckCircle2 size={10} />
            <span>Simulation completed</span>
          </div>
        )}
        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444' }}>
            <AlertCircle size={10} />
            <span>Simulation failed</span>
          </div>
        )}
        {onShare && (
          <button
            onClick={onShare}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4 }}
          >
            <Share2 size={10} />
            Share this circuit
          </button>
        )}
      </div>
    </div>
  );
}
