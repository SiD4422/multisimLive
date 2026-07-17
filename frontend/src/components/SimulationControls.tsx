import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

export function SimulationControls({ drcIssues = [] }: { drcIssues?: string[] }) {
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
      <div 
        className={`flex items-center gap-2 cursor-pointer ${
          isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
        } text-white px-4 py-2 rounded-md shadow-sm transition-colors`}
        onClick={() => {
          if (isSimulating) return;
          if (isPlaying) {
            stopSimulation();
          } else {
            runSimulation();
          }
        }}
        style={{ opacity: isSimulating ? 0.7 : 1 }}
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
          <div className="relative group flex items-center ml-1">
            <div className="bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-amber-400 cursor-help animate-pulse">
              !
            </div>
            {/* Tooltip / Popover */}
            <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[1000] text-left">
              <div className="flex items-center gap-2 text-amber-600 font-bold mb-2">
                <AlertTriangle size={16} /> Pre-Flight Warnings
              </div>
              <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                {drcIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

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

