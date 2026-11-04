import React, { useEffect, useRef, useMemo } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import type { Point, SchematicComponent } from '../store/useSchematicStore';
import { getComponentPins } from '../utils/netlister/getComponentPins';
import { getSpiceNodeForPoint } from '../utils/netlister/getSpiceNodeForPoint';

export interface CurrentFlowOverlayProps {
  isActive: boolean;
  canvasOffset: { x: number; y: number };
  canvasScale: number;
  svgWidth: number;
  svgHeight: number;
}

interface WireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dx: number;
  dy: number;
  len: number;
  angle: number;
}

interface WireGeometry {
  wireId: string;
  points: Point[];
  segments: WireSegment[];
  totalLength: number;
}

interface FlowParticle {
  wireId: string;
  progress: number; // 0..1 along polyline
  speed: number;    // fraction of totalLength per second
  reversed: boolean;
}

interface VoltageTheme {
  color: string;
  glowColor: string;
  rgb: string;
}

/**
 * Maps voltage to a vivid electrical color palette with glowing amber, emerald, or cyan.
 */
function getVoltageTheme(voltage: number): VoltageTheme {
  if (voltage >= 6) {
    return {
      color: '#f59e0b',
      glowColor: '#fbbf24',
      rgb: '245, 158, 11',
    };
  } else if (voltage >= 1.5) {
    return {
      color: '#10b981',
      glowColor: '#34d399',
      rgb: '16, 185, 129',
    };
  } else if (voltage >= 0.1) {
    return {
      color: '#22c55e',
      glowColor: '#4ade80',
      rgb: '34, 197, 94',
    };
  } else if (voltage <= -6) {
    return {
      color: '#8b5cf6',
      glowColor: '#a78bfa',
      rgb: '139, 92, 246',
    };
  } else if (voltage <= -0.1) {
    return {
      color: '#06b6d4',
      glowColor: '#38bdf8',
      rgb: '6, 182, 212',
    };
  } else {
    // Equipotential / Ground: subtle mint green
    return {
      color: '#10b981',
      glowColor: '#34d399',
      rgb: '16, 185, 129',
    };
  }
}

/**
 * Returns point and tangent angle at given distance along wire polyline.
 */
function getPointAtDistance(
  geo: WireGeometry,
  targetDist: number
): { x: number; y: number; angle: number } {
  if (geo.segments.length === 0 || geo.totalLength === 0) {
    const p = geo.points[0] || { x: 0, y: 0 };
    return { x: p.x, y: p.y, angle: 0 };
  }

  const clampedDist = Math.max(0, Math.min(geo.totalLength, targetDist));
  let accumulated = 0;

  for (let i = 0; i < geo.segments.length; i++) {
    const seg = geo.segments[i];
    if (accumulated + seg.len >= clampedDist || i === geo.segments.length - 1) {
      const segOffset = Math.max(0, clampedDist - accumulated);
      const ratio = seg.len > 0 ? segOffset / seg.len : 0;
      return {
        x: seg.x1 + ratio * seg.dx,
        y: seg.y1 + ratio * seg.dy,
        angle: seg.angle,
      };
    }
    accumulated += seg.len;
  }

  const lastSeg = geo.segments[geo.segments.length - 1];
  return { x: lastSeg.x2, y: lastSeg.y2, angle: lastSeg.angle };
}

export function CurrentFlowOverlay({
  isActive,
  canvasOffset,
  canvasScale,
  svgWidth,
  svgHeight,
}: CurrentFlowOverlayProps) {
  const { wires, components, simulationBuffer, playbackTime } = useSchematicStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particlesRef = useRef<FlowParticle[]>([]);

  // 1. Extract node voltages from simulationBuffer matching current playback time
  const nodeVoltages = useMemo(() => {
    const map = new Map<string, number>();
    if (!simulationBuffer || simulationBuffer.length === 0) return map;

    let row: Record<string, number> | undefined;
    if (playbackTime === Infinity || playbackTime === undefined) {
      row = simulationBuffer[simulationBuffer.length - 1];
    } else {
      for (let i = simulationBuffer.length - 1; i >= 0; i--) {
        if ((simulationBuffer[i].time ?? 0) <= playbackTime) {
          row = simulationBuffer[i];
          break;
        }
      }
      if (!row) row = simulationBuffer[0];
    }

    if (!row) return map;

    Object.entries(row).forEach(([key, val]) => {
      if ((key.startsWith('v(') || key.startsWith('V(')) && typeof val === 'number') {
        const node = key.slice(2, -1);
        map.set(node, val);
      }
    });

    return map;
  }, [simulationBuffer, playbackTime]);

  // 2. Precompute geometric segment metrics for each wire
  const wireGeometries = useMemo(() => {
    const map = new Map<string, WireGeometry>();

    wires.forEach(wire => {
      const pts = wire.points && wire.points.length >= 2 ? wire.points : [];
      if (pts.length < 2) return;

      const segments: WireSegment[] = [];
      let totalLength = 0;

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        segments.push({
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          dx,
          dy,
          len,
          angle,
        });
        totalLength += len;
      }

      if (totalLength > 0) {
        map.set(wire.id, {
          wireId: wire.id,
          points: pts,
          segments,
          totalLength,
        });
      }
    });

    return map;
  }, [wires]);

  // 3. Compute flow direction, voltage and theme for each wire
  const wireFlowStates = useMemo(() => {
    if (!isActive || nodeVoltages.size === 0) {
      return new Map<string, { voltage: number; reversed: boolean; theme: VoltageTheme; isActive: boolean }>();
    }

    const stateMap = new Map<
      string,
      { voltage: number; reversed: boolean; theme: VoltageTheme; isActive: boolean }
    >();

    // Build pin lookup by component
    const compPinMap = new Map<string, { p: Point; comp: SchematicComponent; pinId: string }[]>();
    components.forEach(comp => {
      const pins = getComponentPins(comp);
      const list = pins
        .filter(pin => !!pin.p)
        .map(pin => ({ p: pin.p!, comp, pinId: pin.id }));
      compPinMap.set(comp.id, list);
    });

    wires.forEach(wire => {
      const geo = wireGeometries.get(wire.id);
      if (!geo) return;

      const pStart = geo.points[0];
      const pEnd = geo.points[geo.points.length - 1];

      interface PinMatch {
        p: Point;
        comp: SchematicComponent;
        pinId: string;
      }

      let startPin: PinMatch | null = null;
      let endPin: PinMatch | null = null;
      let minDStart = 24;
      let minDEnd = 24;

      for (const comp of components) {
        const pinList = compPinMap.get(comp.id) || [];
        for (const pin of pinList) {
          const dStart = Math.hypot(pin.p.x - pStart.x, pin.p.y - pStart.y);
          if (dStart < minDStart) {
            minDStart = dStart;
            startPin = pin;
          }
          const dEnd = Math.hypot(pin.p.x - pEnd.x, pin.p.y - pEnd.y);
          if (dEnd < minDEnd) {
            minDEnd = dEnd;
            endPin = pin;
          }
        }
      }

      const startNode = getSpiceNodeForPoint(pStart, components, wires);
      const endNode = getSpiceNodeForPoint(pEnd, components, wires);

      const vStart = nodeVoltages.get(startNode) ?? 0;
      const vEnd = nodeVoltages.get(endNode) ?? 0;
      const wireVoltage = (vStart + vEnd) / 2;

      let reversed = false;

      // Rule A: Terminal Ground (sink) attracts current
      if (endPin?.comp.type === 'Ground') {
        reversed = false; // flows into endPin (ground)
      } else if (startPin?.comp.type === 'Ground') {
        reversed = true; // flows into startPin (ground)
      }
      // Rule B: Supply/VCC pumps current outward
      else if (startPin?.comp.type === 'VCC' || startPin?.comp.type === 'DCVoltage' || startPin?.comp.type === 'Battery') {
        reversed = false; // flows away from start supply
      } else if (endPin?.comp.type === 'VCC' || endPin?.comp.type === 'DCVoltage' || endPin?.comp.type === 'Battery') {
        reversed = true; // flows away from end supply
      }
      // Rule C: Voltage gradient across connected components
      else if (startPin && endPin && startPin.comp.id !== endPin.comp.id) {
        // Average voltage of other pins on start component vs end component
        const getCompOtherPinsAvg = (
          comp: SchematicComponent,
          excludePinPt: Point
        ) => {
          const pins = compPinMap.get(comp.id) || [];
          let sum = 0;
          let count = 0;
          for (const pin of pins) {
            if (Math.hypot(pin.p.x - excludePinPt.x, pin.p.y - excludePinPt.y) > 8) {
              const node = getSpiceNodeForPoint(pin.p, components, wires);
              sum += nodeVoltages.get(node) ?? 0;
              count++;
            }
          }
          return count > 0 ? sum / count : wireVoltage;
        };

        const vCompStart = getCompOtherPinsAvg(startPin.comp, startPin.p);
        const vCompEnd = getCompOtherPinsAvg(endPin.comp, endPin.p);

        if (Math.abs(vCompStart - vCompEnd) > 0.05) {
          reversed = vCompStart < vCompEnd;
        } else if (wireVoltage < -0.05) {
          reversed = true;
        }
      } else if (wireVoltage < -0.05) {
        reversed = true;
      }

      const active = Math.abs(wireVoltage) > 0.02 || Math.abs(vStart - vEnd) > 0.02;
      const theme = getVoltageTheme(wireVoltage);

      stateMap.set(wire.id, {
        voltage: wireVoltage,
        reversed,
        theme,
        isActive: active,
      });
    });

    return stateMap;
  }, [isActive, wires, components, nodeVoltages, wireGeometries]);

  // 4. Initialize particles with uniform physical density
  useEffect(() => {
    if (!isActive || wireFlowStates.size === 0) {
      particlesRef.current = [];
      return;
    }

    const newParticles: FlowParticle[] = [];

    wires.forEach(wire => {
      const geo = wireGeometries.get(wire.id);
      const state = wireFlowStates.get(wire.id);
      if (!geo || !state || !state.isActive) return;

      // Particle count scales gracefully with wire length
      const count = Math.max(1, Math.min(8, Math.round(geo.totalLength / 65)));

      // Uniform speed in physical schematic pixels per second (40 to 85 px/s)
      const speedPxPerSec = Math.max(38, Math.min(85, 48 + Math.min(12, Math.abs(state.voltage)) * 3.5));
      const speed = geo.totalLength > 0 ? speedPxPerSec / geo.totalLength : 0.2;

      for (let i = 0; i < count; i++) {
        newParticles.push({
          wireId: wire.id,
          progress: i / count,
          speed,
          reversed: state.reversed,
        });
      }
    });

    particlesRef.current = newParticles;
  }, [isActive, wires, wireGeometries, wireFlowStates]);

  // 5. 60fps Native Canvas Animation Loop (zero React state updates)
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isRunning = true;
    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min(0.08, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Advance particles along parametric polyline
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dir = p.reversed ? -1 : 1;
        let next = p.progress + dir * p.speed * dt;
        if (next > 1) next -= 1;
        if (next < 0) next += 1;
        p.progress = next;
      }

      // Configure HiDPI resolution if needed
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(svgWidth * dpr);
      const targetH = Math.round(svgHeight * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, svgWidth, svgHeight);

      // --- LAYER 1: Wire Glow Tint (Energized circuit backdrop) ---
      wires.forEach(wire => {
        const geo = wireGeometries.get(wire.id);
        const flowState = wireFlowStates.get(wire.id);
        if (!geo || !flowState || !flowState.isActive) return;

        const pts = geo.points;
        if (pts.length < 2) return;

        ctx.save();
        ctx.beginPath();
        const p0x = pts[0].x * canvasScale + canvasOffset.x;
        const p0y = pts[0].y * canvasScale + canvasOffset.y;
        ctx.moveTo(p0x, p0y);

        for (let j = 1; j < pts.length; j++) {
          const px = pts[j].x * canvasScale + canvasOffset.x;
          const py = pts[j].y * canvasScale + canvasOffset.y;
          ctx.lineTo(px, py);
        }

        const absV = Math.abs(flowState.voltage);
        const glowAlpha = Math.min(0.26, 0.12 + Math.min(absV, 15) * 0.012);
        ctx.strokeStyle = `rgba(${flowState.theme.rgb}, ${glowAlpha})`;
        ctx.lineWidth = Math.max(3.5, 5 * canvasScale);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = flowState.theme.glowColor;
        ctx.shadowBlur = Math.max(4, 7 * canvasScale);
        ctx.stroke();
        ctx.restore();
      });

      // --- LAYER 2: Comet Trails & Arrowheads ---
      const trailSteps = 5;
      const headLen = Math.max(5.5, Math.min(10.5, 6.8 * Math.sqrt(canvasScale)));
      const headWidth = Math.max(3.2, Math.min(6.2, 4.0 * Math.sqrt(canvasScale)));

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const geo = wireGeometries.get(p.wireId);
        const flowState = wireFlowStates.get(p.wireId);
        if (!geo || !flowState) continue;

        const totalLen = geo.totalLength;
        const headDist = p.progress * totalLen;
        const trailLength = Math.max(16, Math.min(30, totalLen * 0.35));

        // Smooth fade-in/out at wire boundaries (prevents popping)
        const edgeFade = Math.min(1, Math.min(p.progress, 1 - p.progress) / 0.08);

        // 2A. Draw Comet Motion Trail (tapering backwards along polyline)
        const tailPoints: { x: number; y: number }[] = [];
        for (let s = 0; s <= trailSteps; s++) {
          const frac = s / trailSteps;
          const offsetDist = p.reversed
            ? headDist + frac * trailLength
            : headDist - frac * trailLength;

          if (offsetDist < 0 || offsetDist > totalLen) break;

          const pt = getPointAtDistance(geo, offsetDist);
          tailPoints.push({
            x: pt.x * canvasScale + canvasOffset.x,
            y: pt.y * canvasScale + canvasOffset.y,
          });
        }

        if (tailPoints.length >= 2) {
          ctx.save();
          ctx.lineCap = 'round';
          for (let s = 0; s < tailPoints.length - 1; s++) {
            const pA = tailPoints[s];
            const pB = tailPoints[s + 1];
            const tMid = (s + 0.5) / trailSteps;
            const segAlpha = (1 - tMid) * edgeFade * 0.72;

            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = `rgba(${flowState.theme.rgb}, ${segAlpha})`;
            ctx.lineWidth = Math.max(1, (headWidth * 0.85) * (1 - tMid * 0.65) * canvasScale);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 2B. Draw Aerodynamic Glowing Chevron / Arrowhead
        const headInfo = getPointAtDistance(geo, headDist);
        const screenHeadX = headInfo.x * canvasScale + canvasOffset.x;
        const screenHeadY = headInfo.y * canvasScale + canvasOffset.y;
        const motionAngle = p.reversed ? headInfo.angle + Math.PI : headInfo.angle;

        ctx.save();
        ctx.translate(screenHeadX, screenHeadY);
        ctx.rotate(motionAngle);

        // Radiant glow
        ctx.shadowColor = flowState.theme.glowColor;
        ctx.shadowBlur = Math.max(6, 9 * Math.sqrt(canvasScale));

        // Chevron arrow path
        ctx.beginPath();
        ctx.moveTo(headLen * 0.95, 0);              // Front tip
        ctx.lineTo(-headLen * 0.6, -headWidth);     // Top wing
        ctx.lineTo(-headLen * 0.22, 0);             // Inverted notch
        ctx.lineTo(-headLen * 0.6, headWidth);      // Bottom wing
        ctx.closePath();

        // White-hot core
        ctx.fillStyle = `rgba(255, 255, 255, ${edgeFade * 0.96})`;
        ctx.fill();

        // Vibrant colored outline
        ctx.strokeStyle = `rgba(${flowState.theme.rgb}, ${edgeFade})`;
        ctx.lineWidth = Math.max(1.2, 1.3 * canvasScale);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, canvasOffset, canvasScale, svgWidth, svgHeight, wires, wireGeometries, wireFlowStates]);

  if (!isActive || wires.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
