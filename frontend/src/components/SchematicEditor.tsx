import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getTouchPointer, getPinchState, type PinchState } from '../utils/touchAdapter';

import { Stage, Layer, Line, Group, Text, Circle, Rect, Path, Arc } from 'react-konva';
import { useSchematicStore, type Point, type SchematicComponent } from '../store/useSchematicStore';
import Ground from './symbols/Ground';
import TextAnnotation from './symbols/TextAnnotation';
import { VoltageProbe } from './symbols/VoltageProbe';
import { CurrentProbe } from './symbols/CurrentProbe';
import { DigitalProbe } from './symbols/DigitalProbe';
import MultisimSymbol from './symbols/MultisimSymbol';
import { getComponentPins } from '../utils/netlister';
import { findOrthogonalPath } from '../utils/autoRouter';
import { buildWireNodeMap, buildWireVoltageResult, voltageToStrokeWidth, getPointAlongPolyline } from '../utils/wireVoltageMap';
import { computeWireCrossings } from '../utils/wireCrossings';
import { CurrentFlowOverlay } from './CurrentFlowOverlay';
import { standardICLibrary } from '../data/components';

const SNAP_GRID = 10;
const VISUAL_GRID = 45;
const PIN_SNAP_RADIUS_DESKTOP = 10;
const PIN_SNAP_RADIUS_TOUCH = 28;
const EDGE_ZONE = 40; // px from edge for mobile auto-pan
const PAN_SPEED = 5; // px per frame

const isTouchDevice = () => {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
};

const isTouchInteraction = (e?: any): boolean => {
  if (e?.evt?.pointerType === 'mouse' || e?.pointerType === 'mouse') return false;
  if (e?.evt?.pointerType === 'touch' || e?.pointerType === 'touch') return true;
  if (e?.evt?.touches && e.evt.touches.length > 0) return true;
  return isTouchDevice();
};

const getSnapRadius = (e?: any): number => {
  return isTouchInteraction(e) ? PIN_SNAP_RADIUS_TOUCH : PIN_SNAP_RADIUS_DESKTOP;
};

export default function SchematicEditor() {
  const [isFlowMode, setIsFlowMode] = useState(false);
  const {
    components, wires, addComponent, updateComponentPosition, 
    selectedComponentId, setSelectedComponent, pendingComponent, setPendingComponent,
    addWire, scale, setScale, stagePos, setStagePos, setIsConfigOpen,
    selectedWireId, setSelectedWire, clearSelection,
    deleteComponent, updateComponentRotation, copyComponent, flipComponent,
    isPlaying, simulationBuffer, playbackTime, opData,
    selectedComponentIds, setSelectedComponentIds, toggleSelectedComponentId, deleteSelectedComponents
  } = useSchematicStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dashOffset, setDashOffset] = useState(0);
  const stageRef = useRef<any>(null);
  
  const dragStateRef = useRef<{ 
    compId: string, 
    startX: number, 
    startY: number, 
    attachedWires: { wireId: string, pointIndex: number, startX: number, startY: number }[] 
  } | null>(null);

  const [wirePoints, setWirePoints] = useState<Point[] | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [wireDirOverride, setWireDirOverride] = useState<'auto' | 'h' | 'v'>('auto');
  
  const [autoRoutePath, setAutoRoutePath] = useState<Point[] | null>(null);
  const lastAStarTime = useRef(0);
  const lastAStarTarget = useRef<{x: number, y: number} | null>(null);

  const [selectionBox, setSelectionBox] = useState<{sx: number, sy: number, ex: number, ey: number} | null>(null);
  // Right-click context menu for wire deletion
  const [wireContextMenu, setWireContextMenu] = useState<{ wireId: string; x: number; y: number } | null>(null);
  // Hovered wire DC voltage tooltip
  const [hoveredWireInfo, setHoveredWireInfo] = useState<{
    wireId: string;
    voltage: number;
    x: number;
    y: number;
  } | null>(null);
  // Hovered pin for glow effect during wire drawing
  const [hoveredPinPos, setHoveredPinPos] = useState<Point | null>(null);
  // Mobile Touch Tap-to-Connect state & pulse indicator
  const [touchWireStart, setTouchWireStart] = useState<Point | null>(null);
  const [touchPulseScale, setTouchPulseScale] = useState(1.0);
  const shiftHeldRef = useRef(false);

  // Pulse animation for selected first pin in tap-to-connect mode (scale 1.0 -> 1.4 -> 1.0)
  useEffect(() => {
    if (!touchWireStart) {
      setTouchPulseScale(1.0);
      return;
    }
    let animId: number;
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const cycle = (elapsed % 0.8) / 0.8;
      const s = 1.0 + 0.4 * (0.5 - 0.5 * Math.cos(cycle * 2 * Math.PI));
      setTouchPulseScale(s);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [touchWireStart]);

  // ── Voltage Heatmap ────────────────────────────────────────────────────────
  // MEMO 1: Expensive schema-level net resolution — only recomputes on topology change
  const wireNodeMap = useMemo(
    () => buildWireNodeMap(wires, components as SchematicComponent[]),
    [wires, components]
  );

  // MEMO 2: Cheap per-frame voltage lookup — recomputes on playback time
  const { wireColorMap, wireVoltageMap, maxV } = useMemo(
    () => buildWireVoltageResult(wireNodeMap, simulationBuffer, playbackTime),
    [wireNodeMap, simulationBuffer, playbackTime]
  );

  // DC operating point node voltages for hover tooltips
  const dcNodeVoltages = useMemo(() => {
    const voltages: Record<string, number> = { '0': 0 };
    if (simulationBuffer && simulationBuffer.length > 0) {
      const row = simulationBuffer[0];
      for (const [key, val] of Object.entries(row)) {
        if (typeof val !== 'number') continue;
        const match = key.match(/^v\((.+)\)$/i);
        if (match) {
          voltages[match[1]] = val;
          voltages[match[1].toLowerCase()] = val;
        } else {
          voltages[key] = val;
          voltages[key.toLowerCase()] = val;
        }
      }
    } else if (opData && opData.length > 0) {
      for (const item of opData) {
        if (typeof item.value !== 'number') continue;
        const match = item.node.match(/^v\((.+)\)$/i);
        if (match) {
          voltages[match[1]] = item.value;
          voltages[match[1].toLowerCase()] = item.value;
        } else {
          voltages[item.node] = item.value;
          voltages[item.node.toLowerCase()] = item.value;
        }
      }
    }
    return voltages;
  }, [simulationBuffer, opData]);

  // Dot animation phase (0..1, loops via requestAnimationFrame)
  const [dotPhase, setDotPhase] = useState(0);
  const dotAnimRef = useRef<number | null>(null);
  const dotStartRef = useRef<number | null>(null);
  const DOT_SPEED = 0.12; // full wire traversal per second

  useEffect(() => {
    if (!simulationBuffer || simulationBuffer.length === 0) {
      if (dotAnimRef.current) cancelAnimationFrame(dotAnimRef.current);
      setDotPhase(0);
      return;
    }
    // When SVG overlay (CurrentFlowOverlay) is active, skip the Konva-layer dot animation
    // entirely — the overlay already animates at 30fps. Running both wastes 60fps React
    // re-renders on the 1600-line SchematicEditor component tree.
    if (isFlowMode) {
      if (dotAnimRef.current) cancelAnimationFrame(dotAnimRef.current);
      return;
    }
    const animate = (ts: number) => {
      if (dotStartRef.current === null) dotStartRef.current = ts;
      const elapsed = (ts - dotStartRef.current) / 1000;
      setDotPhase((elapsed * DOT_SPEED) % 1);
      dotAnimRef.current = requestAnimationFrame(animate);
    };
    dotStartRef.current = null;
    dotAnimRef.current = requestAnimationFrame(animate);
    return () => { if (dotAnimRef.current) cancelAnimationFrame(dotAnimRef.current); };
  }, [isPlaying, simulationBuffer, isFlowMode]);

  // Auto-enable flow mode when simulation data first arrives
  const prevSimBufferRef = useRef<typeof simulationBuffer>(null);
  useEffect(() => {
    const hadData = prevSimBufferRef.current && prevSimBufferRef.current.length > 0;
    const hasData = simulationBuffer && simulationBuffer.length > 0;
    if (!hadData && hasData) {
      setIsFlowMode(true);
    }
    prevSimBufferRef.current = simulationBuffer;
  }, [simulationBuffer]);

  useEffect(() => {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    
    // Initial size
    const initialWidth = wrapper.clientWidth;
    const initialHeight = wrapper.clientHeight;
    setDimensions({ width: initialWidth, height: initialHeight });
    
    const currentStagePos = useSchematicStore.getState().stagePos;
    if (currentStagePos.x === 0 && currentStagePos.y === 0) {
      useSchematicStore.getState().setStagePos({ x: initialWidth / 2, y: initialHeight / 2 });
    }
    
    // Use ResizeObserver to detect when sidebars/flyouts push the width
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ 
          width: entry.contentRect.width, 
          height: entry.contentRect.height 
        });
      }
    });
    
    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, []);

  // Animation Loop for Current Flow (Cosmetic)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (isPlaying) {
        const delta = time - lastTime;
        // ~20 pixels per second flow rate
        setDashOffset(prev => prev - (delta * 0.05));
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    } else {
      setDashOffset(0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  // Handle Schematic Export
  useEffect(() => {
    const handleExport = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (stageRef.current) {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        if (detail?.returnDataUrl) {
          window.dispatchEvent(new CustomEvent('schematic-exported', { detail: { dataUrl: dataURL } }));
          return;
        }
        const link = document.createElement('a');
        link.download = 'schematic_snapshot.png';
        link.href = dataURL;
        link.click();
      }
    };
    window.addEventListener('export-schematic', handleExport);
    return () => window.removeEventListener('export-schematic', handleExport);
  }, []);

  // Keyboard shortcuts (Escape to cancel/commit, Space to flip wire elbow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (wirePoints && wirePoints.length > 1) {
          addWire({ id: `W${Date.now()}`, points: wirePoints });
        }
        setWirePoints(null);
        setTouchWireStart(null);
        setPendingComponent(null);
        setMousePos(null);
        setAutoRoutePath(null);
      }
      if (e.key === ' ') {
        e.preventDefault();
        // Cycle: auto → h → v → auto
        setWireDirOverride(prev => prev === 'auto' ? 'h' : prev === 'h' ? 'v' : 'auto');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedComponentIds } = useSchematicStore.getState();
        if (selectedComponentIds.length > 1) {
          e.stopPropagation();
          useSchematicStore.getState().deleteSelectedComponents();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = false; };
    const trackShiftDown = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = true; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', trackShiftDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', trackShiftDown, { capture: true });
    };
  }, [setPendingComponent, wirePoints, addWire]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setStagePos({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  // Dynamic Pin Snap Finder: uses 28px snap on touch devices, 10px on desktop
  const findNearestPin = useCallback((pos: Point, radius?: number): Point | null => {
    const snapRadius = radius ?? (isTouchDevice() ? PIN_SNAP_RADIUS_TOUCH : PIN_SNAP_RADIUS_DESKTOP);
    let nearest: Point | null = null;
    let nearestDist = snapRadius;
    for (const comp of components) {
      const pins = getComponentPins(comp as SchematicComponent);
      for (const pin of pins) {
        if (!pin.p) continue;
        const px = pin.p.x;
        const py = pin.p.y;
        const d = Math.hypot(pos.x - px, pos.y - py);
        if (d <= nearestDist) {
          nearestDist = d;
          nearest = { x: px, y: py };
        }
      }
    }
    return nearest;
  }, [components]);

  const handleMouseMove = (e: any) => {
    if (!wirePoints && !pendingComponent) {
      return; 
    }
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const relativeX = (pointer.x - stage.x()) / scale;
    const relativeY = (pointer.y - stage.y()) / scale;
    
    const x = Math.round(relativeX / SNAP_GRID) * SNAP_GRID;
    const y = Math.round(relativeY / SNAP_GRID) * SNAP_GRID;

    // Dynamic pin snapping: 28px for touch, 10px for desktop
    const snapRadius = getSnapRadius(e);
    const snapPin = wirePoints ? findNearestPin({ x: relativeX, y: relativeY }, snapRadius) : null;
    const targetX = snapPin ? snapPin.x : x;
    const targetY = snapPin ? snapPin.y : y;
    
    if (!mousePos || mousePos.x !== targetX || mousePos.y !== targetY) {
      setMousePos({ x: targetX, y: targetY });
      setHoveredPinPos(snapPin);
      
      if (wirePoints && wirePoints.length > 0 && wireDirOverride === 'auto') {
        const now = performance.now();
        if (now - lastAStarTime.current > 32) { // roughly 30fps throttle
          const lastWirePoint = wirePoints[wirePoints.length - 1];
          if (!lastAStarTarget.current || lastAStarTarget.current.x !== targetX || lastAStarTarget.current.y !== targetY) {
            const path = findOrthogonalPath(lastWirePoint, { x: targetX, y: targetY }, components as SchematicComponent[]);
            setAutoRoutePath(path);
            lastAStarTime.current = now;
            lastAStarTarget.current = { x: targetX, y: targetY };
          }
        }
      } else {
        setAutoRoutePath(null);
      }
    }

    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, ex: x, ey: y } : null);
    }
  };

  const getPreviewPoints = () => {
    if (!wirePoints || !mousePos) return [];
    const last = wirePoints[wirePoints.length - 1];
    const dx = Math.abs(mousePos.x - last.x);
    const dy = Math.abs(mousePos.y - last.y);
    
    // Determine direction: go horizontal-first if moving more horizontally, else vertical-first
    // Unless user has manually overridden with Spacebar
    let goHFirst: boolean;
    if (wireDirOverride === 'h') goHFirst = true;
    else if (wireDirOverride === 'v') goHFirst = false;
    else goHFirst = dx >= dy; // auto: go in dominant axis first
    
    let corner;
    if (goHFirst) {
      corner = { x: mousePos.x, y: last.y };
    } else {
      corner = { x: last.x, y: mousePos.y };
    }
    // If corner is same as start, just go straight
    if (corner.x === last.x && corner.y === last.y) return [...wirePoints, mousePos];
    // If corner is same as end, just go straight
    if (corner.x === mousePos.x && corner.y === mousePos.y) return [...wirePoints, mousePos];
    return [...wirePoints, corner, mousePos];
  };


  const handleStageMouseDown = (e: any) => {
    // Right click cancels everything
    if (e.evt.button === 2) {
      setWirePoints(null);
      setTouchWireStart(null);
      setPendingComponent(null);
      setMousePos(null);
      setAutoRoutePath(null);
      return;
    }

    if (touchWireStart) {
      setTouchWireStart(null);
      return;
    }

    const currentPending = useSchematicStore.getState().pendingComponent;
    if (currentPending && mousePos) {
      const typeStr = currentPending.type;
      
      if (typeStr === 'ProbeVoltage' || typeStr === 'ProbeCurrent' || typeStr === 'ProbeDigital') {
        const id = `PR${useSchematicStore.getState().probes.length + 1}`;
        let probeType = 'Voltage';
        if (typeStr === 'ProbeCurrent') probeType = 'Current';
        if (typeStr === 'ProbeDigital') probeType = 'Digital';
        useSchematicStore.getState().addProbe({
          id,
          type: probeType,
          position: mousePos
        });
        setPendingComponent(null);
        return;
      }

      let prefix = 'U'; // Fallback IC
      if (typeStr === 'Resistor' || typeStr === 'Potentiometer' || typeStr === 'potentiometer' || typeStr === 'Load') prefix = 'R';
      else if (typeStr === 'Capacitor') prefix = 'C';
      else if (typeStr === 'Fuse') prefix = 'F';
      else if (typeStr === 'Inductor') prefix = 'L';
      else if (typeStr === 'Diode' || typeStr === 'DiodeZener' || typeStr === 'DiodeSchottky' || typeStr === 'LED' || typeStr === 'BridgeRectifier') prefix = 'D';
      else if (typeStr === 'TransistorNPN' || typeStr === 'TransistorPNP' || typeStr === 'IGBT') prefix = 'Q';
      else if (typeStr === 'MosfetN' || typeStr === 'MosfetP') prefix = 'M';
      else if (typeStr === 'JFET') prefix = 'J';
      else if (typeStr === 'SwitchSPST' || typeStr === 'switch_spst' || typeStr === 'SPDTSwitch' || typeStr === 'PushButton' || typeStr === 'Relay') prefix = 'S';
      else if (typeStr.includes('Opamp') || typeStr.includes('Comparator')) prefix = 'U';
      else if (typeStr === 'Timer555') prefix = 'A';
      else if (typeStr.includes('Voltage') || (typeStr.includes('Source') && !typeStr.includes('Current')) || typeStr.includes('Phase') || typeStr.includes('Noise')) prefix = 'V';
      else if (typeStr.includes('Current')) prefix = 'I';
      else if (typeStr.startsWith('Transformer') || typeStr === 'Transformers') prefix = 'T';
      else if (typeStr === 'CoupledInductors') prefix = 'K';
      else if (typeStr === 'LosslessTransmissionLine') prefix = 'T';
      else if (typeStr === 'LossyTransmissionLine') prefix = 'O';
      else if (typeStr === 'Resistors') prefix = 'RN';
      else if (typeStr === 'Ground') prefix = 'GND';

      let nextNum = 1;
      while (components.some(c => c.id === `${prefix}${nextNum}`)) {
        nextNum++;
      }

      const defaultRotation = 0;
      const libComp = standardICLibrary.find(c => c.id === typeStr);

      addComponent({
        id: `${prefix}${nextNum}`,
        type: typeStr,
        position: mousePos,
        value: currentPending.value,
        rotation: defaultRotation,
        props: libComp ? { ...libComp.defaultProps } : undefined
      });
      setPendingComponent(null);
      return;
    }

    // Clicking on the stage background OR the paper/grid rect deselects everything
    const targetName = e.target.getClassName?.() || '';
    const isBackground = e.target === e.target.getStage() || targetName === 'Rect' || targetName === 'Line';
    if (isBackground && !wirePoints) {
      clearSelection();
      setWireContextMenu(null); // dismiss context menu on background click
      if (touchWireStart) setTouchWireStart(null);
    }
    
    if (!wirePoints || !mousePos) {
      // Start rubber-band selection if clicking on empty canvas
      if (!wirePoints && !pendingComponent && mousePos && isBackground) {
        setSelectionBox({ sx: mousePos.x, sy: mousePos.y, ex: mousePos.x, ey: mousePos.y });
      }
      return;
    }

    // If clicking on or near a pin while drawing, snap and complete wire
    const pinTarget = hoveredPinPos ?? findNearestPin(mousePos, getSnapRadius(e));
    if (pinTarget && (pinTarget.x !== wirePoints[0].x || pinTarget.y !== wirePoints[0].y)) {
      const preview = getPreviewPoints();
      preview[preview.length - 1] = pinTarget;
      const cleaned: Point[] = [];
      for (const p of preview) {
        if (cleaned.length > 0) {
          const last = cleaned[cleaned.length - 1];
          if (last.x === p.x && last.y === p.y) continue;
        }
        cleaned.push(p);
      }
      if (cleaned.length >= 2) {
        addWire({ id: `W${Date.now()}`, points: cleaned });
      }
      setWirePoints(null);
      setMousePos(null);
      setHoveredPinPos(null);
      return;
    }
    
    const preview = getPreviewPoints();
    const corner = preview[preview.length - 2];
    
    // Check if corner is essentially duplicate
    const last = wirePoints[wirePoints.length - 1];
    if (corner.x === last.x && corner.y === last.y) {
       setWirePoints([...wirePoints, mousePos]);
    } else {
       setWirePoints([...wirePoints, corner, mousePos]);
    }
  };

  const handleStageDoubleClick = (e: any) => {
    if (wirePoints && wirePoints.length > 1) {
      addWire({ id: `W${Date.now()}`, points: wirePoints });
      setWirePoints(null);
    }
  };

  const handleStageMouseUp = useCallback(() => {
    if (!selectionBox) return;
    const minX = Math.min(selectionBox.sx, selectionBox.ex);
    const maxX = Math.max(selectionBox.sx, selectionBox.ex);
    const minY = Math.min(selectionBox.sy, selectionBox.ey);
    const maxY = Math.max(selectionBox.sy, selectionBox.ey);
    if (maxX - minX > 10 || maxY - minY > 10) {
      const inside = components.filter(c =>
        c.position.x >= minX && c.position.x <= maxX &&
        c.position.y >= minY && c.position.y <= maxY
      );
      setSelectedComponentIds(inside.map(c => c.id));
    }
    setSelectionBox(null);
  }, [selectionBox, components, setSelectedComponentIds]);

  // ── Touch / Pinch Support ──────────────────────────────────────────────────
  const lastPinchRef = useRef<PinchState | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // ── Mobile Edge Auto-Pan ──────────────────────────────────────────────────
  const applyEdgeAutoPan = useCallback((e: any) => {
    if (!stageRef.current) return;
    const isDragging = dragStateRef.current !== null;
    const isDrawingWire = wirePoints !== null || touchWireStart !== null;
    if (!isDragging && !isDrawingWire) return;

    if (!isTouchInteraction(e)) return;

    const container = stageRef.current.container();
    if (!container) return;
    const canvasRect = container.getBoundingClientRect();
    const evt = e.evt;
    if (!evt) return;
    const touch = evt.touches?.[0] ?? evt;
    if (touch?.clientX === undefined || touch?.clientY === undefined) return;
    const { clientX, clientY } = touch;

    let dx = 0, dy = 0;
    if (clientX - canvasRect.left < EDGE_ZONE) dx = PAN_SPEED;
    if (canvasRect.right - clientX < EDGE_ZONE) dx = -PAN_SPEED;
    if (clientY - canvasRect.top < EDGE_ZONE) dy = PAN_SPEED;
    if (canvasRect.bottom - clientY < EDGE_ZONE) dy = -PAN_SPEED;

    if (dx !== 0 || dy !== 0) {
      const stage = stageRef.current;
      const pos = stage.position();
      const nextPos = { x: pos.x + dx, y: pos.y + dy };
      stage.position(nextPos);
      setStagePos(nextPos);
      stage.batchDraw();
    }
  }, [setStagePos, touchWireStart, wirePoints]);

  // ── Mobile Tap-to-Connect Wiring ───────────────────────────────────────────
  const handleTouchTap = useCallback((pos: Point) => {
    if (pendingComponent) return;

    if (!touchWireStart) {
      // Tap 1 on a pin: Enter "wire start" mode
      setTouchWireStart(pos);
      clearSelection();
    } else {
      // Tap 2: If same pin tapped again, cancel
      if (touchWireStart.x === pos.x && touchWireStart.y === pos.y) {
        setTouchWireStart(null);
        return;
      }

      // Automatically route an orthogonal wire from start pin to end pin and commit it
      let route = findOrthogonalPath(touchWireStart, pos, components as SchematicComponent[]);
      if (!route || route.length < 2) {
        const dx = Math.abs(pos.x - touchWireStart.x);
        const dy = Math.abs(pos.y - touchWireStart.y);
        if (dx >= dy) {
          route = [touchWireStart, { x: pos.x, y: touchWireStart.y }, pos];
        } else {
          route = [touchWireStart, { x: touchWireStart.x, y: pos.y }, pos];
        }
      }

      const cleaned: Point[] = [];
      for (const pt of route) {
        if (cleaned.length > 0) {
          const last = cleaned[cleaned.length - 1];
          if (last.x === pt.x && last.y === pt.y) continue;
        }
        cleaned.push(pt);
      }

      if (cleaned.length >= 2) {
        addWire({
          id: `W${Date.now()}`,
          points: cleaned
        });
      }

      setTouchWireStart(null);
      setHoveredPinPos(null);
    }
  }, [pendingComponent, touchWireStart, components, addWire, clearSelection]);

  const handleTouchStart = useCallback((e: any) => {
    const nativeEvt: TouchEvent = e.evt;
    nativeEvt.preventDefault();
    if (nativeEvt.touches.length === 2) {
      lastPinchRef.current = getPinchState(nativeEvt.touches);
      return;
    }
    const pointer = getTouchPointer(nativeEvt);
    if (!pointer) return;
    lastTouchRef.current = { x: pointer.clientX, y: pointer.clientY };

    const stage = stageRef.current;
    if (stage) {
      const stagePointer = stage.getPointerPosition();
      if (stagePointer) {
        const relX = (stagePointer.x - stage.x()) / scale;
        const relY = (stagePointer.y - stage.y()) / scale;
        const nearestPin = findNearestPin({ x: relX, y: relY }, PIN_SNAP_RADIUS_TOUCH);

        if (nearestPin) {
          // Tapped on or near a pin
          handleTouchTap(nearestPin);
          return;
        } else if (touchWireStart) {
          // Tap anywhere else cancels wire drawing
          setTouchWireStart(null);
          return;
        }
      }
    }

    // Simulate mousedown on the stage
    handleStageMouseDown(e);
  }, [handleStageMouseDown, scale, touchWireStart, findNearestPin, handleTouchTap]);

  const handleTouchMove = useCallback((e: any) => {
    const nativeEvt: TouchEvent = e.evt;
    nativeEvt.preventDefault();

    // Pinch-to-zoom
    if (nativeEvt.touches.length === 2) {
      const pinch = getPinchState(nativeEvt.touches);
      if (!pinch || !lastPinchRef.current) return;
      const pinchRatio = pinch.distance / lastPinchRef.current.distance;
      const stage = stageRef.current;
      if (!stage) return;
      const oldScale = scale;
      const newScale = Math.min(Math.max(oldScale * pinchRatio, 0.1), 5);
      const centerX = pinch.centerX - stage.container().getBoundingClientRect().left;
      const centerY = pinch.centerY - stage.container().getBoundingClientRect().top;
      const mousePointTo = {
        x: centerX / oldScale - stage.x() / oldScale,
        y: centerY / oldScale - stage.y() / oldScale,
      };
      setScale(newScale);
      setStagePos({
        x: -(mousePointTo.x - centerX / newScale) * newScale,
        y: -(mousePointTo.y - centerY / newScale) * newScale,
      });
      lastPinchRef.current = pinch;
      return;
    }

    // Auto-pan when dragging near canvas edge
    applyEdgeAutoPan(e);

    // Single-finger pan / wire drawing
    handleMouseMove(e);
  }, [scale, setScale, setStagePos, handleMouseMove, applyEdgeAutoPan]);

  const handleTouchEnd = useCallback((e: any) => {
    lastPinchRef.current = null;
    lastTouchRef.current = null;
    handleStageMouseUp();

    // If user touched Pin 1 and dragged to Pin 2 on touch screen
    if (touchWireStart && stageRef.current) {
      const stage = stageRef.current;
      const stagePointer = stage.getPointerPosition();
      if (stagePointer) {
        const relX = (stagePointer.x - stage.x()) / scale;
        const relY = (stagePointer.y - stage.y()) / scale;
        const nearestPin = findNearestPin({ x: relX, y: relY }, PIN_SNAP_RADIUS_TOUCH);
        if (nearestPin && (nearestPin.x !== touchWireStart.x || nearestPin.y !== touchWireStart.y)) {
          handleTouchTap(nearestPin);
        }
      }
    }
  }, [handleStageMouseUp, touchWireStart, scale, findNearestPin, handleTouchTap]);

  const handleNodeClick = (e: any, pos: Point) => {
    if (pendingComponent) return; // don't start wiring if placing

    // Touch tap-to-connect mode
    if (isTouchInteraction(e)) {
      handleTouchTap(pos);
      return;
    }

    if (!wirePoints) {
      // Start drawing
      setWirePoints([pos]);
      setWireDirOverride('auto');
    } else {
      // Finish drawing
      const preview = getPreviewPoints();
      preview[preview.length - 1] = pos;
      
      const cleaned: Point[] = [];
      for (const p of preview) {
        if (cleaned.length > 0) {
          const last = cleaned[cleaned.length - 1];
          if (last.x === p.x && last.y === p.y) continue;
        }
        cleaned.push(p);
      }
      
      addWire({
        id: `W${Date.now()}`,
        points: cleaned
      });
      setWirePoints(null);
      setMousePos(null);
    }
  };

  // Background Grid and Paper limits
  const PAPER_WIDTH = 3000;
  const PAPER_HEIGHT = 2000;
  const paperX = -PAPER_WIDTH / 2;
  const paperY = -PAPER_HEIGHT / 2;

  // Dot grid — one circle per intersection (much cheaper visually than line grid)
  const gridDots: React.ReactNode[] = [];
  for (let gy = paperY; gy <= paperY + PAPER_HEIGHT; gy += VISUAL_GRID) {
    for (let gx = paperX; gx <= paperX + PAPER_WIDTH; gx += VISUAL_GRID) {
      const isMainDot = (Math.abs(gy) % (VISUAL_GRID * 5) < 1) && (Math.abs(gx) % (VISUAL_GRID * 5) < 1);
      gridDots.push(
        <Circle
          key={`d${gx},${gy}`}
          x={gx} y={gy}
          radius={isMainDot ? 2 : 1}
          fill={isMainDot ? '#b0b8c8' : '#ccd5e0'}
          listening={false}
        />
      );
    }
  }


  const previewPath = getPreviewPoints();

  const junctionDots: Point[] = React.useMemo(() => {
    const dots = new Set<string>();
    
    // Helper to check if point p is on segment a-b
    const isPointOnSegment = (p: Point, a: Point, b: Point) => {
      const crossProduct = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y);
      if (Math.abs(crossProduct) > 0.1) return false;
      const dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
      if (dotProduct < 0) return false;
      const squaredLength = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
      if (dotProduct > squaredLength) return false;
      return true;
    };

    wires.forEach((wire1, idx1) => {
      if (!wire1.points || wire1.points.length === 0) return;
      const endpoints = [wire1.points[0], wire1.points[wire1.points.length - 1]];
      endpoints.forEach(ep => {
        let touchesOther = false;
        for (let i = 0; i < wires.length; i++) {
          if (i === idx1) continue;
          const wire2 = wires[i];
          for (let j = 0; j < wire2.points.length - 1; j++) {
            if (isPointOnSegment(ep, wire2.points[j], wire2.points[j+1])) {
              touchesOther = true;
              break;
            }
          }
          if (touchesOther) break;
        }
        if (touchesOther) {
          dots.add(`${ep.x},${ep.y}`);
        }
      });
    });

    return Array.from(dots).map(d => {
      const [x, y] = d.split(',').map(Number);
      return { x, y };
    });
  }, [wires]);

  // ── Wire Crossing Jump Arcs ────────────────────────────────────────────────
  // Recomputes only when wires or junctions change
  const wireCrossings = React.useMemo(
    () => computeWireCrossings(wires as any, junctionDots),
    [wires, junctionDots]
  );

  const renderComponent = (comp: any, isPreview = false) => {
    const sharedProps = {
      component: comp,
      selected: !isPreview && (selectedComponentId === comp.id || selectedComponentIds.includes(comp.id)),
      onSelect: () => {
        if (!isPreview) {
          if (shiftHeldRef.current) {
            toggleSelectedComponentId(comp.id);
          } else {
            setSelectedComponent(comp.id);
            setSelectedComponentIds([]);
            setIsConfigOpen(true);
          }
        }
      },
      onDragStart: (e: any) => {
        if (isPreview) return;
        setSelectedComponent(comp.id);
        setIsConfigOpen(true);

        const pins = getComponentPins(comp);
        const attachedWires: { wireId: string, pointIndex: number, startX: number, startY: number }[] = [];
        
        const stateWires = useSchematicStore.getState().wires;
        pins.forEach(pin => {
          const pinP = pin.p;
          if (!pinP) return;
          stateWires.forEach(wire => {
            if (wire.points.length > 0) {
              const first = wire.points[0];
              const last = wire.points[wire.points.length - 1];
              if (Math.abs(first.x - pinP.x) < 2 && Math.abs(first.y - pinP.y) < 2) {
                attachedWires.push({ wireId: wire.id, pointIndex: 0, startX: first.x, startY: first.y });
              }
              if (Math.abs(last.x - pinP.x) < 2 && Math.abs(last.y - pinP.y) < 2) {
                attachedWires.push({ wireId: wire.id, pointIndex: wire.points.length - 1, startX: last.x, startY: last.y });
              }
            }
          });
        });
        
        dragStateRef.current = {
          compId: comp.id,
          startX: comp.position.x,
          startY: comp.position.y,
          attachedWires
        };
      },
      onDragMove: (e: any) => {
        if (isPreview) return;
        applyEdgeAutoPan(e);
        const x = Math.round(e.target.x() / SNAP_GRID) * SNAP_GRID;
        const y = Math.round(e.target.y() / SNAP_GRID) * SNAP_GRID;
        e.target.position({ x, y });
        
        const dragInfo = dragStateRef.current;
        if (dragInfo && dragInfo.compId === comp.id) {
          const dx = x - dragInfo.startX;
          const dy = y - dragInfo.startY;
          
          if (dragInfo.attachedWires.length > 0) {
            const wireUpdates: { id: string, points: Point[] }[] = [];
            const stateWires = useSchematicStore.getState().wires;
            const updatesByWire = new Map<string, { id: string, points: Point[] }>();
            
            dragInfo.attachedWires.forEach((aw: any) => {
              if (!updatesByWire.has(aw.wireId)) {
                const w = stateWires.find(ws => ws.id === aw.wireId);
                if (w) updatesByWire.set(aw.wireId, { id: w.id, points: [...w.points] });
              }
              const update = updatesByWire.get(aw.wireId);
              if (update) {
                update.points[aw.pointIndex] = { x: aw.startX + dx, y: aw.startY + dy };
              }
            });
            
            useSchematicStore.getState().updateComponentAndWires(comp.id, { x, y }, Array.from(updatesByWire.values()));
          }
        }
      },
      onDragEnd: (e: any) => {
        if (isPreview) return;
        const x = Math.round(e.target.x() / SNAP_GRID) * SNAP_GRID;
        const y = Math.round(e.target.y() / SNAP_GRID) * SNAP_GRID;
        e.target.position({ x, y });
        
        const dragInfo = dragStateRef.current;
        if (dragInfo && dragInfo.attachedWires.length > 0) {
           useSchematicStore.getState().commitDrag();
        } else {
           updateComponentPosition(comp.id, { x, y });
        }
        dragStateRef.current = null;
      },
      onNodeClick: handleNodeClick,
      isPreview
    };

    const textAnnotationProps = {
      ...sharedProps,
      updateComponentValue: useSchematicStore.getState().updateComponentValue
    };

    let el = null;
    if (comp.type === 'TextAnnotation') {
      el = <TextAnnotation key={comp.id} {...textAnnotationProps} />;
    } else {
      el = <MultisimSymbol key={comp.id} {...sharedProps} updateComponentValue={textAnnotationProps.updateComponentValue} />;
    }

    if (isPreview) {
      return (
        <Group key="preview-group" opacity={0.5} listening={false}>
          {el}
        </Group>
      );
    }
    return (
      <Group
        key={comp.id}
        onClick={(e) => {
          if (comp.type === 'switch_spst') {
            e.cancelBubble = true;
            const newClosed = !comp.props?.closed;
            useSchematicStore.getState().updateComponentProp(comp.id, 'closed', newClosed);
            const state = useSchematicStore.getState();
            if ((state.simulationBuffer && state.simulationBuffer.length > 0) || (state.simulationData && state.simulationData.length > 0)) {
              state.runSimulation(true);
            }
          }
        }}
        onTap={(e) => {
          if (comp.type === 'switch_spst') {
            e.cancelBubble = true;
            const newClosed = !comp.props?.closed;
            useSchematicStore.getState().updateComponentProp(comp.id, 'closed', newClosed);
            const state = useSchematicStore.getState();
            if ((state.simulationBuffer && state.simulationBuffer.length > 0) || (state.simulationData && state.simulationData.length > 0)) {
              state.runSimulation(true);
            }
          }
        }}
        onDblClick={() => { setSelectedComponent(comp.id); setIsConfigOpen(true); }}
      >
        {el}
      </Group>
    );
  };

  // ── Floating 3-button action ring ─────────────────────────────────────────
  // Buttons orbit the component center: Delete (top-left), Rotate (top-right), Copy (bottom-right)
  const renderActionMenu = () => {
    if (!selectedComponentId || pendingComponent || wirePoints || touchWireStart) return null;
    const comp = components.find(c => c.id === selectedComponentId);
    if (!comp) return null;

    const cx = comp.position.x;
    const cy = comp.position.y;
    const ORBIT = 52;  // distance from component center to button center
    const R    = 14;   // button circle radius (small)

    // Positions: top-left (-45°), top-right (+45°), bottom-right (+135°)
    const positions = [
      { angle: -135, id: 'delete',  color: '#fff1f2', border: '#f43f5e', iconColor: '#be123c', label: 'Del',
        icon: 'M -5 -5 L 5 5 M 5 -5 L -5 5',
        action: () => { deleteComponent(selectedComponentId); clearSelection(); } },
      { angle: -45,  id: 'rotate',  color: '#f0fdf4', border: '#22c55e', iconColor: '#15803d', label: 'Rot',
        icon: 'M 1 -6 A 6 6 0 1 1 -6 1 L -3.5 1 L -6 4.5 L -8.5 1 L -6 1 A 7.5 7.5 0 1 0 1 -7.5 Z',
        action: () => {
          const cur = comp.rotation || 0;
          updateComponentRotation(selectedComponentId, (cur + 90) % 360);
        } },
      { angle: 45,   id: 'copy',    color: '#fdf4ff', border: '#a855f7', iconColor: '#7e22ce', label: 'Copy',
        icon: 'M -3 -5 L 3 -5 L 5 -3 L 5 4 L -3 4 Z M -5 -3 L -5 6 L 3 6 L 3 4 L -3 4 L -3 -3 Z',
        action: () => copyComponent(selectedComponentId) },
    ];

    return (
      <Group listening={true}>
        {/* Thin selection ring around the component */}
        <Circle
          x={cx} y={cy}
          radius={ORBIT - R - 4}
          stroke="#3b82f6" strokeWidth={1.5}
          dash={[4, 4]} fill="transparent"
          listening={false}
        />
        {positions.map(btn => {
          const rad = (btn.angle * Math.PI) / 180;
          const bx = cx + ORBIT * Math.cos(rad);
          const by = cy + ORBIT * Math.sin(rad);
          return (
            <Group
              key={btn.id}
              x={bx} y={by}
              onClick={(e) => { e.cancelBubble = true; btn.action(); }}
              onTap={(e)   => { e.cancelBubble = true; btn.action(); }}
            >
              {/* Drop shadow */}
              <Circle radius={R + 1.5} fill="rgba(0,0,0,0.12)" offsetY={1.5} listening={false} />
              {/* Button fill */}
              <Circle radius={R} fill={btn.color} stroke={btn.border} strokeWidth={1.5} />
              {/* Icon */}
              <Path data={btn.icon} fill="none" stroke={btn.iconColor} strokeWidth={1.5}
                lineCap="round" lineJoin="round" listening={false} />
            </Group>
          );
        })}
      </Group>
    );
  };
    return (
      <div style={{
        width: '100%', height: '100%', backgroundColor: '#a3a3a3', position: 'absolute',
        cursor: wirePoints || touchWireStart ? 'none' : pendingComponent ? 'crosshair' : 'grab',
        touchAction: 'none'
      }}>
        {dimensions.width > 0 && (
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          style={{ touchAction: 'none' }}
          draggable={!wirePoints && !pendingComponent && !touchWireStart}
          onDragStart={() => setHoveredWireInfo(null)}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
          onWheel={(e) => { setHoveredWireInfo(null); handleWheel(e); }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleStageMouseDown}
          onMouseUp={handleStageMouseUp}
          onDblClick={handleStageDoubleClick}
          onContextMenu={(e) => e.evt.preventDefault()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerMove={(e) => {
            if (isTouchInteraction(e)) applyEdgeAutoPan(e);
          }}
          ref={stageRef}
          >
          <Layer>
            {/* Paper Background */}
            <Rect 
              x={paperX} 
              y={paperY} 
              width={PAPER_WIDTH} 
              height={PAPER_HEIGHT} 
              fill="#fbfaf6" 
              shadowColor="#000"
              shadowBlur={10}
              shadowOpacity={0.15}
              shadowOffset={{ x: 2, y: 5 }}
            />
            {gridDots}

          </Layer>
          <Layer>
            {/* Committed Wires */}
            {wires.map(wire => {
              const hasSimData = simulationBuffer && simulationBuffer.length > 0;
              const heatColor = wireColorMap.get(wire.id);
              const wireVoltage = wireVoltageMap.get(wire.id) ?? 0;
              const strokeColor = selectedWireId === wire.id
                ? '#3b82f6'
                : (heatColor ?? '#dc2626');
              const strokeW = selectedWireId === wire.id
                ? 3
                : (hasSimData && heatColor ? voltageToStrokeWidth(wireVoltage, maxV) : 2);

              return (
                <Group key={wire.id}>
                <Line 
                  points={wire.points.flatMap(p => [p.x, p.y])}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  dash={hasSimData && isPlaying ? [5, 10] : undefined}
                  dashOffset={dashOffset}
                  lineCap="round"
                  lineJoin="round"
                  hitStrokeWidth={20}
                  onMouseEnter={(e) => {
                    const hasSimRan = (simulationBuffer && simulationBuffer.length > 0) || (opData && opData.length > 0);
                    if (!hasSimRan) return;
                    const stage = e.target.getStage();
                    const pos = stage?.getPointerPosition();
                    if (!pos) return;
                    const nodeName = wireNodeMap.get(wire.id);
                    let voltage = nodeName !== undefined
                      ? (dcNodeVoltages[nodeName] ?? dcNodeVoltages[nodeName.toLowerCase()])
                      : undefined;
                    if (voltage === undefined && nodeName === '0') voltage = 0;
                    if (voltage === undefined) voltage = wireVoltageMap.get(wire.id);
                    if (voltage !== undefined) {
                      setHoveredWireInfo({
                        wireId: wire.id,
                        voltage,
                        x: pos.x,
                        y: pos.y,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const hasSimRan = (simulationBuffer && simulationBuffer.length > 0) || (opData && opData.length > 0);
                    if (!hasSimRan) return;
                    const stage = e.target.getStage();
                    const pos = stage?.getPointerPosition();
                    if (pos) {
                      setHoveredWireInfo(prev => prev && prev.wireId === wire.id ? { ...prev, x: pos.x, y: pos.y } : prev);
                    }
                  }}
                  onMouseLeave={() => setHoveredWireInfo(null)}
                  onClick={(e) => { e.cancelBubble = true; setSelectedWire(wire.id); }}
                  onContextMenu={(e) => {
                    e.evt.preventDefault();
                    e.cancelBubble = true;
                    const stage = stageRef.current;
                    if (!stage) return;
                    const pos = stage.getPointerPosition();
                    if (!pos) return;
                    setWireContextMenu({ wireId: wire.id, x: pos.x, y: pos.y });
                  }}
                  onMouseDown={(e) => {
                    e.cancelBubble = true;
                    if (!wirePoints && mousePos) {
                      setWirePoints([mousePos]);
                      setWireDirOverride('auto');
                    } else if (wirePoints && mousePos) {
                      const preview = getPreviewPoints();
                      preview[preview.length - 1] = mousePos;
                      const cleaned: Point[] = [];
                      for (const p of preview) {
                        if (cleaned.length > 0) {
                          const last = cleaned[cleaned.length - 1];
                          if (last.x === p.x && last.y === p.y) continue;
                        }
                        cleaned.push(p);
                      }
                      addWire({ id: `W${Date.now()}`, points: cleaned });
                      setWirePoints(null);
                      setMousePos(null);
                    }
                  }}
                />
                {/* Current-flow dot — travels parametrically along the polyline (hidden when SVG overlay is active) */}
                {hasSimData && !isFlowMode && wire.points.length >= 2 && (() => {
                  const voltage = wireVoltageMap.get(wire.id) ?? 0;
                  if (Math.abs(voltage) < 0.01) return null; // no dot on GND/dead nets
                  // Direction: positive voltage → forward, negative → reverse
                  const phase = voltage < 0 ? 1 - dotPhase : dotPhase;
                  const pt = getPointAlongPolyline(wire.points, phase);
                  return (
                    <Circle
                      key={`dot-${wire.id}`}
                      x={pt.x}
                      y={pt.y}
                      radius={3}
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth={1}
                      listening={false}
                    />
                  );
                })()}

                {/* Node Voltage Label (DMM style) */}
                {hasSimData && wire.points.length > 0 && (() => {
                  const voltage = wireVoltageMap.get(wire.id) ?? 0;
                  if (Math.abs(voltage) < 0.01) return null; // Skip ground/dead nets to avoid clutter
                  
                  const midPt = getPointAlongPolyline(wire.points, 0.5);
                  const vStr = Math.abs(voltage) >= 1000 ? `${(voltage/1000).toPrecision(3)}kV` 
                    : Math.abs(voltage) < 0.1 ? `${(voltage*1000).toPrecision(3)}mV`
                    : `${voltage.toPrecision(3)}V`;
                    
                  // Calculate dynamic width based on string length to look nice
                  const boxW = vStr.length * 6 + 10;
                  
                  return (
                    <Group key={`vlbl-${wire.id}`} x={midPt.x} y={midPt.y - 12} listening={false}>
                      <Rect
                        x={-boxW/2} y={-8}
                        width={boxW} height={16}
                        fill="rgba(255, 255, 255, 0.9)"
                        cornerRadius={4}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      <Text
                        text={vStr}
                        x={-boxW/2} y={-5}
                        width={boxW}
                        align="center"
                        fontSize={10}
                        fontFamily="Inter, monospace"
                        fontStyle="bold"
                        fill={strokeColor}
                      />
                    </Group>
                  );
                })()}
              </Group>
            );
            })}

            {/* Junction Dots */}
            {junctionDots.map((dot, idx) => (
              <Circle 
                key={`jdot-${idx}`}
                x={dot.x}
                y={dot.y}
                radius={4}
                fill="#000"
                listening={false}
              />
            ))}

            {/* Wire Crossing Jump Arcs — rendered after junction dots so they appear on top */}
            {wireCrossings.map((cross, idx) => (
              <Group key={`xing-${idx}`} x={cross.x} y={cross.y} rotation={cross.angle} listening={false}>
                {/* White eraser to break the wire behind */}
                <Circle radius={6} fill="#f8f8f2" stroke="none" listening={false} />
                {/* Schematic bridge arc */}
                <Arc
                  innerRadius={0}
                  outerRadius={6}
                  angle={180}
                  rotation={180}
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="transparent"
                  listening={false}
                />
              </Group>
            ))}

            {/* Rubber-band selection rectangle */}
            {selectionBox && (
              <Rect
                x={Math.min(selectionBox.sx, selectionBox.ex)}
                y={Math.min(selectionBox.sy, selectionBox.ey)}
                width={Math.abs(selectionBox.ex - selectionBox.sx)}
                height={Math.abs(selectionBox.ey - selectionBox.sy)}
                fill="rgba(59,130,246,0.07)"
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[6, 4]}
                listening={false}
              />
            )}

            {/* Active Drawing Wire — red dashed preview */}
            {previewPath.length > 0 && (
              <Line 
                points={previewPath.flatMap(p => [p.x, p.y])}
                stroke="#dc2626"
                strokeWidth={2}
                dash={[6, 4]}
                lineCap="round"
                lineJoin="round"
                listening={false}
              />
            )}

            {/* Crosshair cursor indicator at mouse position while wiring */}
            {wirePoints && mousePos && (
              <>
                {/* Start node marker */}
                <Circle
                  x={wirePoints[wirePoints.length - 1].x}
                  y={wirePoints[wirePoints.length - 1].y}
                  radius={5}
                  fill="#dc2626"
                  opacity={0.7}
                  listening={false}
                />
                {/* Crosshair at cursor */}
                <Line points={[mousePos.x - 10, mousePos.y, mousePos.x + 10, mousePos.y]} stroke="#dc2626" strokeWidth={1.5} listening={false} />
                <Line points={[mousePos.x, mousePos.y - 10, mousePos.x, mousePos.y + 10]} stroke="#dc2626" strokeWidth={1.5} listening={false} />
                <Circle x={mousePos.x} y={mousePos.y} radius={4} stroke="#dc2626" strokeWidth={1.5} fill="transparent" listening={false} />
              </>
            )}

            {/* Pin Snap Glow — bright green pulsing ring when wire is near a pin */}
            {wirePoints && hoveredPinPos && (
              <>
                <Circle
                  x={hoveredPinPos.x} y={hoveredPinPos.y}
                  radius={9}
                  fill="rgba(34,197,94,0.18)"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  listening={false}
                />
                <Circle
                  x={hoveredPinPos.x} y={hoveredPinPos.y}
                  radius={4}
                  fill="#22c55e"
                  listening={false}
                />
              </>
            )}

            {/* Mobile Touch Tap-to-Connect: Visual Indicator on Start Pin */}
            {touchWireStart && (
              <Group x={touchWireStart.x} y={touchWireStart.y} listening={false}>
                <Circle
                  radius={15}
                  fill="#84cc16"
                  opacity={0.4}
                  stroke="#65a30d"
                  strokeWidth={2}
                  scaleX={touchPulseScale}
                  scaleY={touchPulseScale}
                  listening={false}
                />
                <Circle
                  radius={4}
                  fill="#65a30d"
                  listening={false}
                />
              </Group>
            )}

            {/* Components */}
            {components.map(comp => renderComponent(comp, false))}

            {/* Floating action menu for selected component */}
            {renderActionMenu()}
            
            {useSchematicStore.getState().probes.map(probe => {
                if (probe.type === 'Current') {
                  return <CurrentProbe key={probe.id} id={probe.id} position={probe.position} />;
                } else if (probe.type === 'Digital') {
                  return <DigitalProbe key={probe.id} id={probe.id} position={probe.position} />;
                } else {
                  return <VoltageProbe key={probe.id} id={probe.id} position={probe.position} />;
                }
              })}

            {/* Pending Component Preview */}
            {pendingComponent && mousePos && (
              renderComponent({
                id: 'preview',
                type: pendingComponent.type,
                position: mousePos,
                value: pendingComponent.value,
                rotation: 0
              }, true)
            )}
          </Layer>
        </Stage>
        )}

        {/* Floating Flow Button */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 100 }}>
          <button
            onClick={() => setIsFlowMode(f => !f)}
            disabled={!simulationBuffer || simulationBuffer.length === 0}
            title={isFlowMode ? 'Stop current flow animation' : 'Show animated current flow (Falstad-style)'}
            style={{
              background: isFlowMode ? '#dcfce7' : '#ffffff',
              color: isFlowMode ? '#16a34a' : '#6b7280',
              border: `1px solid ${isFlowMode ? '#16a34a' : '#d1d5db'}`,
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: simulationBuffer && simulationBuffer.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2.5"/>
              <circle cx="12" cy="12" r="2.5" opacity="0.6"/>
              <circle cx="19" cy="12" r="2.5" opacity="0.3"/>
              <path d="M7.5 12 H9.5 M14.5 12 H16.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            ⚡ Flow
          </button>
        </div>

        {isFlowMode && (
          <CurrentFlowOverlay
            isActive={isFlowMode}
            canvasOffset={stagePos}
            canvasScale={scale}
            svgWidth={dimensions.width}
            svgHeight={dimensions.height}
          />
        )}

        {/* Mobile Component Context Menu */}
        {(() => {
          let compId = null;
          if (selectedComponentIds.length === 1) {
            compId = selectedComponentIds[0];
          } else if (selectedComponentId && selectedComponentIds.length === 0) {
            compId = selectedComponentId;
          }
          
          if (!compId || pendingComponent || wirePoints || touchWireStart) return null;
          
          const comp = components.find(c => c.id === compId);
          if (!comp) return null;
          
          const screenX = comp.position.x * scale + stagePos.x;
          // Position slightly above the component
          const screenY = comp.position.y * scale + stagePos.y - (40 * scale) - 20;

          return (
            <div
              style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                transform: 'translate(-50%, -100%)',
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                zIndex: 1000,
                pointerEvents: 'auto'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = comp.rotation || 0;
                  updateComponentRotation(comp.id, (cur + 90) % 360);
                }}
                style={{
                  background: 'transparent', border: 'none', color: 'inherit',
                  cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px'
                }}
                title="Rotate"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                </svg>
              </button>
              <div style={{ width: '1px', background: '#374151', margin: '4px 2px' }}></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteComponent(comp.id);
                  clearSelection();
                }}
                style={{
                  background: 'transparent', border: 'none', color: '#f87171',
                  cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px'
                }}
                title="Delete"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          );
        })()}

        {/* Wire right-click context menu */}
        {wireContextMenu && (
          <div
            style={{
              position: 'absolute',
              left: wireContextMenu.x,
              top: wireContextMenu.y,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: 160,
              overflow: 'hidden',
            }}
            onMouseLeave={() => setWireContextMenu(null)}
          >
            <div style={{ padding: '6px 0', fontSize: 13 }}>
              <button
                onClick={() => {
                  useSchematicStore.getState().deleteWire(wireContextMenu.wireId);
                  setWireContextMenu(null);
                }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Delete Wire
              </button>
              <button
                onClick={() => {
                  useSchematicStore.getState().setSelectedWire(wireContextMenu.wireId);
                  setWireContextMenu(null);
                }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#374151', display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Select Wire
              </button>
            </div>
          </div>
        )}

        {/* DC Operating Point Hover Tooltip */}
        {hoveredWireInfo && ((simulationBuffer && simulationBuffer.length > 0) || (opData && opData.length > 0)) && (
          <div style={{
            position: 'absolute',
            left: hoveredWireInfo.x + 12,
            top: hoveredWireInfo.y - 20,
            background: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            {hoveredWireInfo.voltage >= 0 ? '+' : ''}{hoveredWireInfo.voltage.toFixed(3)} V
          </div>
        )}
      </div>
    );
  }

