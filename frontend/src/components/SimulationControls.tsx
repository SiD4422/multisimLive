import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Square } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

export function SimulationControls() {
  const isSimulating = useSchematicStore(state => state.isSimulating);
  const isPlaying = useSchematicStore(state => state.isPlaying);
  const playbackTime = useSchematicStore(state => state.playbackTime);
  const playbackSpeed = useSchematicStore(state => state.playbackSpeed);
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
        if (nextTime >= maxTime) {
          stopSimulation();
          return maxTime;
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
    <div className="flex items-center gap-3 mr-6">
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
      </div>

      {/* Time counter — always visible when simulation data exists */}
      {hasData && (
        <div className="text-white font-mono text-base bg-black bg-opacity-40 px-3 py-1 rounded border border-white border-opacity-20">
          <span className="text-xs text-gray-300 mr-1">t =</span>
          {playbackTime >= 1e-3
            ? `${(playbackTime * 1000).toFixed(3)} ms`
            : `${(playbackTime * 1e6).toFixed(1)} µs`}
          <span className="text-gray-400 text-xs ml-1">
            / {maxTime >= 1e-3 ? `${(maxTime * 1000).toFixed(0)} ms` : `${(maxTime * 1e6).toFixed(0)} µs`}
          </span>
        </div>
      )}
    </div>
  );
}

