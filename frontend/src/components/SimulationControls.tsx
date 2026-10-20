import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

export function SimulationControls({ drcIssues = [], onRun }: { drcIssues?: string[]; onRun?: () => void }) {
  const isSimulating = useSchematicStore(state => state.isSimulating);
  const isPlaying = useSchematicStore(state => state.isPlaying);
  const playbackTime = useSchematicStore(state => state.playbackTime);
  const playbackSpeed = useSchematicStore(state => state.playbackSpeed);
  const analysisMode = useSchematicStore(state => state.analysisMode);
  const simulationBuffer = useSchematicStore(state => state.simulationBuffer);
  const runSimulation = useSchematicStore(state => state.runSimulation);
  const stopSimulation = useSchematicStore(state => state.stopSimulation);
  const setPlaybackTime = useSchematicStore(state => state.setPlaybackTime);
  
  const hasData = simulationBuffer && simulationBuffer.length > 0;
  const maxTime = hasData ? simulationBuffer[simulationBuffer.length - 1].time : 0;
  const [showDrcTooltip, setShowDrcTooltip] = useState(false);

  const lastTimeRef = React.useRef<number>(0);
  const animationFrameIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    const playLoop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const dtRealMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      const dtRealSec = dtRealMs / 1000;
      const dtSimSec = dtRealSec * playbackSpeed;
      
      setPlaybackTime(prev => {
        const nextTime = prev + dtSimSec;
        if (nextTime >= maxTime && maxTime > 0) {
          return nextTime % maxTime;
        }
        return nextTime;
      });
      
      animationFrameIdRef.current = requestAnimationFrame(playLoop);
    };

    if (isPlaying && hasData) {
      lastTimeRef.current = 0; // Reset on start
      animationFrameIdRef.current = requestAnimationFrame(playLoop);
    }

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isPlaying, hasData, maxTime, playbackSpeed, setPlaybackTime, stopSimulation]);

  return (
    <div className="flex items-center gap-3 mr-6 shrink-0">
      {/* Run / Stop button */}
      <button 
        id="run-simulation-btn"
        type="button"
        title={isPlaying ? 'Stop Simulation (Ctrl+Enter)' : 'Run Simulation (Ctrl+Enter)'}
        aria-label={isPlaying ? 'Stop Simulation' : 'Run Simulation'}
        className={`flex items-center gap-2 cursor-pointer ${
          isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
        } text-white px-4 py-2 rounded-md shadow-sm transition-colors border-0 outline-none`}
        onClick={() => {
          if (isSimulating) return;
          if (isPlaying) {
            stopSimulation();
          } else {
            if (onRun) {
              onRun();
              return;
            }
            const { components } = useSchematicStore.getState();
            if (components.length === 0) {
              window.dispatchEvent(new CustomEvent('nodesim-toast', {
                detail: { message: 'Add components to the canvas before running simulation.', type: 'warning' }
              }));
              return;
            }
            runSimulation();
          }
        }}
        style={{ opacity: isSimulating ? 0.7 : 1, position: 'relative' }}
      >
        {isSimulating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : isPlaying ? (
          <Square size={18} fill="white" />
        ) : (
          <Play size={18} fill="white" />
        )}
        <span className="text-base font-semibold">
          {isSimulating ? 'Simulating...' : isPlaying ? 'Stop' : 'Run'}
        </span>
        {drcIssues.length > 0 && !isPlaying && !isSimulating && (
          <span 
            style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 4 }}
            onMouseEnter={() => setShowDrcTooltip(true)}
            onMouseLeave={() => setShowDrcTooltip(false)}
          >
            <span style={{
              background: '#f59e0b', borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', border: '1px solid #fbbf24',
              cursor: 'help'
            }}>
              !
            </span>
            {/* Tooltip / Popover - only visible on hover */}
            {showDrcTooltip && (
              <span style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 270,
                background: '#1e293b', borderRadius: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
                border: '1px solid #334155', padding: 12, zIndex: 1000, textAlign: 'left',
                color: '#f8fafc', pointerEvents: 'none', display: 'block'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <AlertTriangle size={15} /> Pre-Flight Warnings
                </span>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {drcIssues.map((issue, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{issue}</li>
                  ))}
                </ul>
              </span>
            )}
          </span>
        )}
      </button>

      {/* Time counter - always visible when simulation data exists, but ONLY for transient analysis */}
      {hasData && analysisMode === 'transient' && (
        <div className="text-white font-mono text-sm bg-[rgba(0,0,0,0.3)] px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.1)] whitespace-nowrap ml-2 shadow-inner">
          <span className="text-[rgba(255,255,255,0.5)] mr-1.5 font-semibold">t =</span>
          <span className="font-medium">
            {playbackTime >= 1e-3
              ? `${(playbackTime * 1000).toFixed(3)} ms`
              : `${(playbackTime * 1e6).toFixed(1)} µs`}
          </span>
          <span className="text-[rgba(255,255,255,0.4)] ml-1.5 font-medium">
            / {maxTime >= 1e-3 ? `${(maxTime * 1000).toFixed(0)} ms` : `${(maxTime * 1e6).toFixed(0)} µs`}
          </span>
        </div>
      )}
    </div>
  );
}

