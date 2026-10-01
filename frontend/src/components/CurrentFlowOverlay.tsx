import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { getComponentPins } from '../utils/netlister/getComponentPins';
import { getSpiceNodeForPoint } from '../utils/netlister/getSpiceNodeForPoint';

interface Particle {
  wireId: string;
  progress: number;
  speed: number;
  color: string;
  reversed: boolean;
}

interface WireFlowData {
  wireId: string;
  startNode: string;
  endNode: string;
  voltage1: number;
  voltage2: number;
  deltav: number;
}

export interface CurrentFlowOverlayProps {
  isActive: boolean;
  canvasOffset: { x: number; y: number };
  canvasScale: number;
  svgWidth: number;
  svgHeight: number;
}

export function CurrentFlowOverlay({ isActive, canvasOffset, canvasScale, svgWidth, svgHeight }: CurrentFlowOverlayProps) {
  const { wires, components, simulationBuffer } = useSchematicStore();
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [, forceRender] = useState(0);

  const nodeVoltages = useMemo(() => {
    const map = new Map<string, number>();
    if (!simulationBuffer || simulationBuffer.length === 0) return map;
    const lastRow = simulationBuffer[simulationBuffer.length - 1];
    Object.entries(lastRow).forEach(([key, val]) => {
      if ((key.startsWith('v(') || key.startsWith('V(')) && typeof val === 'number') {
        const node = key.slice(2, -1);
        map.set(node, val as number);
      }
    });
    return map;
  }, [simulationBuffer]);

  const wireFlows = useMemo((): WireFlowData[] => {
    if (!isActive || nodeVoltages.size === 0) return [];
    
    return wires.map(wire => {
      let minDistStart = Infinity;
      let minDistEnd = Infinity;
      let startPinPt = wire.points[0];
      let endPinPt = wire.points[wire.points.length - 1];

      // Find closest component pins
      components.forEach(comp => {
        const pins = getComponentPins(comp);
        pins.forEach(pin => {
          if (!pin.p) return;
          const dStart = Math.hypot(pin.p.x - wire.points[0].x, pin.p.y - wire.points[0].y);
          if (dStart < minDistStart) {
            minDistStart = dStart;
            startPinPt = pin.p;
          }
          const dEnd = Math.hypot(pin.p.x - wire.points[wire.points.length - 1].x, pin.p.y - wire.points[wire.points.length - 1].y);
          if (dEnd < minDistEnd) {
            minDistEnd = dEnd;
            endPinPt = pin.p;
          }
        });
      });

      // Get SPICE nodes
      const startNode = getSpiceNodeForPoint(startPinPt, components, wires);
      const endNode = getSpiceNodeForPoint(endPinPt, components, wires);
      
      const v1 = nodeVoltages.get(startNode) ?? 0;
      const v2 = nodeVoltages.get(endNode) ?? 0;

      return {
        wireId: wire.id,
        startNode,
        endNode,
        voltage1: v1,
        voltage2: v2,
        deltav: Math.abs(v1 - v2),
      };
    });
  }, [wires, components, nodeVoltages, isActive]);

  useEffect(() => {
    if (!isActive || wireFlows.length === 0) {
      particlesRef.current = [];
      return;
    }
    const newParticles: Particle[] = [];
    wireFlows.forEach(wf => {
      const wire = wires.find(w => w.id === wf.wireId);
      if (!wire) return;
      
      const isEquipotential = wf.deltav < 0.01;
      const effectiveDelta = isEquipotential ? Math.max(0.1, Math.abs(wf.voltage1)) : wf.deltav;
      const speed = Math.min(0.008, Math.max(0.001, effectiveDelta / 1000));
      
      const color = wf.voltage1 > wf.voltage2 ? '#22c55e' : (wf.voltage1 < wf.voltage2 ? '#3b82f6' : '#a855f7'); 
      const count = Math.max(1, Math.min(3, Math.floor(effectiveDelta / 5)));
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          wireId: wf.wireId,
          progress: i / count,
          speed,
          color,
          reversed: wf.voltage1 < wf.voltage2,
        });
      }
    });
    particlesRef.current = newParticles;
  }, [wireFlows, isActive, wires]);

  useEffect(() => {
    if (!isActive) return;
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      particlesRef.current = particlesRef.current.map(p => {
        let next = p.progress + (p.reversed ? -p.speed : p.speed);
        if (next > 1) next = 0;
        if (next < 0) next = 1;
        return { ...p, progress: next };
      });
      if (frameCount % 2 === 0) forceRender(n => n + 1);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive]);

  if (!isActive || wires.length === 0) return null;

  const dots = particlesRef.current.map((particle, idx) => {
    const wire = wires.find(w => w.id === particle.wireId);
    if (!wire) return null;
    const points = wire.points && wire.points.length >= 2 ? wire.points : [wire.points[0], wire.points[wire.points.length - 1]];
    if (points.length < 2) return null;
    
    let totalLen = 0;
    const segments: { dx: number; dy: number; len: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i+1].x - points[i].x;
      const dy = points[i+1].y - points[i].y;
      const len = Math.sqrt(dx*dx + dy*dy);
      segments.push({ dx, dy, len });
      totalLen += len;
    }
    if (totalLen === 0) return null;
    
    let target = particle.progress * totalLen;
    let x = points[0].x, y = points[0].y;
    for (let i = 0; i < segments.length; i++) {
      if (target <= segments[i].len) {
        const t = target / segments[i].len;
        x = points[i].x + t * segments[i].dx;
        y = points[i].y + t * segments[i].dy;
        break;
      }
      target -= segments[i].len;
    }
    
    const screenX = x * canvasScale + canvasOffset.x;
    const screenY = y * canvasScale + canvasOffset.y;
    return (
      <circle
        key={`${particle.wireId}-${idx}`}
        cx={screenX}
        cy={screenY}
        r={3 * canvasScale}
        fill={particle.color}
        opacity={0.85}
        style={{ filter: 'blur(0.5px)' }}
      />
    );
  });

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {dots}
    </svg>
  );
}

