import { Group, Path, Circle, Line, Text } from 'react-konva';
import type { SchematicComponent } from '../../store/useSchematicStore';
import { useSchematicStore } from '../../store/useSchematicStore';
import { InteractiveSlider } from './InteractiveSlider';

interface MultisimSymbolProps {
  component: SchematicComponent;
  selected?: boolean;
  onSelect?: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
  onDragStart?: (e: any) => void;
  onNodeClick: (e: any, pos: { x: number, y: number }) => void;
  updateComponentValue?: (id: string, value: string) => void;
}

export default function MultisimSymbol({ component, selected, onSelect, onDragMove, onDragEnd, onDragStart, onNodeClick, updateComponentValue }: MultisimSymbolProps) {
  const strokeColor = selected ? "#3b82f6" : "#000000";
  const type = component.type;
  
  let paths: { data: string, fill?: string, stroke?: string }[] = [];
  let circles: { x: number, y: number, r: number, fill?: string }[] = [];
  let lines: { points: number[] }[] = [];
  let pins: { x: number, y: number }[] = [];
  let texts: { text: string, x: number, y: number, size?: number, fill?: string }[] = [];
  let labelOffset = { x: 15, y: -25 };
  let valueOffset = { x: 15, y: 15 };

  // --- PASSIVES ---
  if (type === 'Resistor' || type === 'Potentiometer') {
    // Exact Multisim Translated Polyline
    lines.push({ points: [0, 0, 16.5, 0] }); // Lead 1
    lines.push({ points: [16.5,0, 19.5,-5, 23.5,4, 28.5,-5, 32.5,4, 37.5,-5, 41.5,4, 43.5,0] }); // Zigzag
    lines.push({ points: [43.5, 0, 60, 0] }); // Lead 2
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    if (type === 'Potentiometer') {
      paths.push({ data: "M 28.5 -20 L 28.5 -11", fill: "transparent" }); // Wiper line
      paths.push({ data: "M 25 -11 L 28.5 -5 L 32 -11 Z", fill: "transparent" }); // Empty arrow head touching zig-zag peak
      pins.push({ x: 28.5, y: -20 });
      labelOffset = { x: 5, y: -45 }; // Move label further up for slider
    }
  }
  else if (type === 'Load') {
    lines.push({ points: [0, 0, 15, 0] }); // Lead 1
    paths.push({ data: "M 15 -10 L 45 -10 L 45 10 L 15 10 Z", fill: "transparent" }); // Hollow box
    texts.push({ x: 30, y: 3, text: 'LOAD', size: 8 }); // Text inside box
    lines.push({ points: [45, 0, 60, 0] }); // Lead 2
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type === 'Fuse') {
    // Fuse with large S-curve and small circles
    lines.push({ points: [0, 0, 15, 0] }); // Left wire
    lines.push({ points: [45, 0, 60, 0] }); // Right wire
    circles.push({ x: 17, y: 0, r: 2, fill: "transparent" }); // Left circle
    circles.push({ x: 43, y: 0, r: 2, fill: "transparent" }); // Right circle
    paths.push({ data: "M 19 0 A 6 6 0 0 0 31 0 A 6 6 0 0 1 43 0", fill: "transparent" }); // S-curve
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type === 'Capacitor') {
    paths.push({ data: "M 0 0 L 25 0 M 25 -10 L 25 10 M 35 -10 L 35 10 M 35 0 L 60 0", fill: "transparent" });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type === 'Inductor') {
    // Exact Multisim Translated Arcs
    lines.push({ points: [0, 0, 17.5, 0] }); // Lead 1
    paths.push({ data: "M 23.5 0 A 3 4 0 0 0 17.5 0", fill: "transparent" });
    paths.push({ data: "M 29.5 0 A 3 4 0 0 0 23.5 0", fill: "transparent" });
    paths.push({ data: "M 35.5 0 A 3 4 0 0 0 29.5 0", fill: "transparent" });
    paths.push({ data: "M 41.5 0 A 3 4 0 0 0 35.5 0", fill: "transparent" });
    lines.push({ points: [41.5, 0, 60, 0] }); // Lead 2
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  // --- DIODES ---
  else if (type === 'Diode' || type === 'LED' || type === 'DiodeZener' || type === 'DiodeSchottky') {
    // Exact Multisim Translated Diode
    paths.push({ data: "M 23 8 L 36 0 L 23 -8 Z", fill: strokeColor });
    lines.push({ points: [36, 8, 36, -8] });
    lines.push({ points: [0, 0, 23, 0] });
    lines.push({ points: [36, 0, 60, 0] });
    
    if (type === 'DiodeZener') {
      paths.push({ data: "M 32 -8 L 36 -8 L 36 8 L 40 8", fill: "transparent" });
    } else if (type === 'DiodeSchottky') {
      paths.push({ data: "M 32 -8 L 36 -8 L 36 8 L 32 8 M 32 -8 L 32 -4 M 32 8 L 32 4", fill: "transparent" });
    } else if (type === 'LED') {
      paths.push({ data: "M 25 -15 L 18 -22 M 18 -22 L 22 -22 M 18 -22 L 18 -18", fill: "transparent" });
      paths.push({ data: "M 32 -15 L 25 -22 M 25 -22 L 29 -22 M 25 -22 L 25 -18", fill: "transparent" });
      labelOffset = { x: 15, y: -35 };
      valueOffset = { x: 15, y: 15 };
    }
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type === 'BridgeRectifier') {
    paths.push({ data: "M 40 -40 L 0 0 L 40 40 L 80 0 Z", fill: "transparent" });
    
    // Diodes
    paths.push({ data: "M 25 -25 L 20 -10 L 10 -20 Z", fill: strokeColor });
    paths.push({ data: "M 30 -20 L 20 -30", fill: "transparent" });
    paths.push({ data: "M 65 15 L 60 30 L 50 20 Z", fill: strokeColor });
    paths.push({ data: "M 70 20 L 60 10", fill: "transparent" });
    paths.push({ data: "M 55 -25 L 70 -20 L 60 -10 Z", fill: strokeColor });
    paths.push({ data: "M 60 -30 L 50 -20", fill: "transparent" });
    paths.push({ data: "M 15 15 L 30 20 L 20 30 Z", fill: strokeColor });
    paths.push({ data: "M 20 10 L 10 20", fill: "transparent" });

    // Leads
    paths.push({ data: "M 40 -40 L 40 -60", fill: "transparent" });
    pins.push({ x: 40, y: -60 });
    paths.push({ data: "M 40 40 L 40 60", fill: "transparent" });
    pins.push({ x: 40, y: 60 });
    paths.push({ data: "M 0 0 L -20 0", fill: "transparent" });
    pins.push({ x: -20, y: 0 });
    paths.push({ data: "M 80 0 L 100 0", fill: "transparent" });
    pins.push({ x: 100, y: 0 });

    texts.push({ text: '+', x: 45, y: -55, size: 14 });
    texts.push({ text: '-', x: 47, y: 45, size: 16 });
    texts.push({ text: '~', x: -15, y: -20, size: 14 });
    texts.push({ text: '~', x: 85, y: -20, size: 14 });

    labelOffset = { x: 90, y: -60 };
    valueOffset = { x: 90, y: 60 };
  }
  // --- THREE-PHASE SOURCES ---
  else if (type === 'ThreePhaseDelta' || type === 'ThreePhaseWye') {
    // Box body
    paths.push({ data: "M 0 -20 L 60 -20 L 60 40 L 0 40 Z", fill: "#fff" });
    // Label inside
    texts.push({ text: type === 'ThreePhaseWye' ? 'Y' : 'Δ', x: 22, y: 2, size: 24 });
    // Phase A — top-left terminal
    paths.push({ data: "M 0 -20 L -20 -20", fill: "transparent" });
    pins.push({ x: -20, y: -20 });
    texts.push({ text: 'A', x: -16, y: -30, size: 11 });
    // Phase B — top-right terminal
    paths.push({ data: "M 60 -20 L 80 -20", fill: "transparent" });
    pins.push({ x: 80, y: -20 });
    texts.push({ text: 'B', x: 64, y: -30, size: 11 });
    // Phase C — bottom-left terminal
    paths.push({ data: "M 0 40 L -20 40", fill: "transparent" });
    pins.push({ x: -20, y: 40 });
    texts.push({ text: 'C', x: -16, y: 32, size: 11 });
    // Neutral — bottom-right terminal
    paths.push({ data: "M 60 40 L 80 40", fill: "transparent" });
    pins.push({ x: 80, y: 40 });
    texts.push({ text: 'N', x: 64, y: 32, size: 11 });
    labelOffset = { x: 65, y: -35 };
    valueOffset = { x: 65, y: 50 };
  }
  // --- SOURCES ---
  else if (type === 'DCSource') {
    // Exact Multisim Translated Battery (Rotated)
    lines.push({ points: [0, 0, 21, 0] });
    lines.push({ points: [21, -12, 21, 12] });
    lines.push({ points: [27, -6, 27, 6] });
    lines.push({ points: [33, -12, 33, 12] });
    lines.push({ points: [39, -6, 39, 6] });
    lines.push({ points: [39, 0, 60, 0] });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type.includes('Voltage') || type.includes('Current') || type === 'DCCurrent' || type.includes('Noise') || type.includes('Source')) {
    circles.push({ x: 30, y: 0, r: 18, fill: "#fff" }); // Exact radius 18
    lines.push({ points: [0, 0, 12, 0] });
    lines.push({ points: [48, 0, 60, 0] });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    
    if (type === 'DCCurrent' || type.includes('Current')) {
      paths.push({ data: "M 20 0 L 40 0 M 36 -4 L 40 0 L 36 4", fill: "transparent" });
    } else if (type === 'ACSource' || type.includes('Voltage') || type.includes('Noise')) {
      // Exact AC Sines and Terminals (Using Q and T for Konva compatibility)
      paths.push({ data: "M 24 0 Q 27 -6 30 0 T 36 0", fill: "transparent" });
      lines.push({ points: [30, -15, 30, -9] }); // + Vertical
      lines.push({ points: [27, -12, 33, -12] }); // + Horizontal
      lines.push({ points: [27, 12, 33, 12] }); // - Horizontal
    }
  }
  // --- TRANSISTORS ---
  else if (type === 'TransistorNPN' || type === 'TransistorPNP') {
    lines.push({ points: [15, -12, 15, 12] }); // Base vertical
    lines.push({ points: [15, -8, 25, -13] }); // Collector angle
    lines.push({ points: [25, -13, 25, -20] }); // Collector lead
    lines.push({ points: [15, 8, 25, 13] }); // Emitter angle
    lines.push({ points: [25, 13, 25, 20] }); // Emitter lead
    lines.push({ points: [0, 0, 15, 0] }); // Base lead
    
    if (type === 'TransistorNPN') {
      paths.push({ data: "M 22 8 L 23 12 L 19 13 Z", fill: strokeColor }); // arrow out
    } else {
      paths.push({ data: "M 18 2 L 15 3 L 20 6 Z", fill: strokeColor }); // arrow in
    }
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -20 };
    valueOffset = { x: 40, y: 15 };
  }
  else if (type === 'MosfetN' || type === 'MosfetP') {
    paths.push({ data: "M 0 0 L 12 0 M 12 -12 L 12 12", fill: "transparent" });
    paths.push({ data: "M 16 -12 L 16 -6 M 16 -3 L 16 3 M 16 6 L 16 12", fill: "transparent" });
    paths.push({ data: "M 25 -20 L 25 -9 L 16 -9", fill: "transparent" });
    paths.push({ data: "M 25 20 L 25 9 L 16 9", fill: "transparent" });
    paths.push({ data: "M 16 0 L 25 0 M 25 0 L 25 20", fill: "transparent" });
    
    if (type === 'MosfetN') {
      paths.push({ data: "M 22 -3 L 16 0 L 22 3 Z", fill: strokeColor }); // arrow in on bulk
    } else {
      paths.push({ data: "M 19 -3 L 25 0 L 19 3 Z", fill: strokeColor }); // arrow out on bulk
    }
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -20 };
    valueOffset = { x: 40, y: 15 };
  }
  else if (type === 'JFET') {
    paths.push({ data: "M 0 0 L 15 0 M 15 -12 L 15 12", fill: "transparent" });
    paths.push({ data: "M 15 -10 L 25 -10 L 25 -20", fill: "transparent" }); // Drain
    paths.push({ data: "M 15 10 L 25 10 L 25 20", fill: "transparent" }); // Source
    paths.push({ data: "M 18 -2 L 15 0 L 18 2 Z", fill: strokeColor }); // Arrow N-Ch
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -20 };
    valueOffset = { x: 40, y: 15 };
  }
  else if (type === 'IGBT') {
    paths.push({ data: "M 0 0 L 10 0 M 10 -12 L 10 12", fill: "transparent" }); // Gate
    paths.push({ data: "M 15 -12 L 15 12", fill: "transparent" }); // Insulation line
    paths.push({ data: "M 15 -8 L 25 -13 L 25 -20", fill: "transparent" }); // Collector
    paths.push({ data: "M 15 8 L 25 13 L 25 20", fill: "transparent" }); // Emitter
    paths.push({ data: "M 22 8 L 23 12 L 19 13 Z", fill: strokeColor }); // Arrow out
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -20 };
    valueOffset = { x: 40, y: 15 };
  }
  // --- GROUND ---
  else if (type === 'Ground' || type === 'Junction') {
    paths.push({ data: "M 0 0 L 0 10 M -12 10 L 12 10 M -8 14 L 8 14 M -4 18 L 4 18", fill: "transparent" });
    pins = [{ x: 0, y: 0 }];
    labelOffset = { x: 15, y: 5 };
  }
  // --- TRANSMISSION LINES ---
  else if (type === 'LosslessTransmissionLine' || type === 'LossyTransmissionLine') {
    paths.push({ data: "M 0 0 L 10 0 M 50 0 L 60 0", fill: "transparent" });
    paths.push({ data: "M 10 -10 L 50 -10 L 50 10 L 10 10 Z", fill: "#fdfdfd" }); // Box
    // Ground pins for transmission line
    paths.push({ data: "M 0 -5 L 10 -5 M 0 5 L 10 5 M 50 -5 L 60 -5 M 50 5 L 60 5", fill: "transparent" });
    pins = [{ x: 0, y: -5 }, { x: 0, y: 5 }, { x: 60, y: -5 }, { x: 60, y: 5 }];
    labelOffset = { x: 20, y: -25 };
  }
  // --- OPAMPS & ANALOG ---
  else if (type.includes('Opamp') || type === 'Comparator') {
    paths.push({ data: "M 10 -20 L 50 0 L 10 20 Z", fill: "#fff" });
    // Inverting / Non-Inverting (+ on top, - on bottom)
    paths.push({ data: "M 0 -10 L 10 -10 M 13 -10 L 17 -10 M 15 -12 L 15 -8", fill: "transparent" }); // Non-inverting (+)
    paths.push({ data: "M 0 10 L 10 10 M 13 10 L 17 10", fill: "transparent" }); // Inverting (-)
    // Output
    paths.push({ data: "M 50 0 L 60 0", fill: "transparent" });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 60, y: 0 }];
    
    if (type === 'Opamp5') {
      paths.push({ data: "M 40 -5 L 40 -20 M 40 5 L 40 20", fill: "transparent" });
      pins.push({ x: 40, y: -20 }, { x: 40, y: 20 });
    }
    
    if (type === 'Comparator') {
      paths.push({ data: "M 25 -5 L 35 0 L 25 5", fill: "transparent" });
    }
    
    labelOffset = { x: 20, y: -35 };
    valueOffset = { x: 20, y: 25 };
  }
  else if (type === 'Timer555') {
    paths.push({ data: "M 0 -50 L 80 -50 L 80 50 L 0 50 Z", fill: "#fff" });
    
    // Top pin (VCC)
    paths.push({ data: "M 40 -50 L 40 -70", fill: "transparent" });
    pins.push({ x: 40, y: -70 });
    texts.push({ text: 'VCC', x: 30, y: -45, size: 11 });
    
    // Bottom pin (GND)
    paths.push({ data: "M 40 50 L 40 70", fill: "transparent" });
    pins.push({ x: 40, y: 70 });
    texts.push({ text: 'GND', x: 30, y: 35, size: 11 });
    
    // Left pins: y = -40, -20, 0, 20, 40
    const leftYs = [-40, -20, 0, 20, 40];
    const leftLabels = ['RST', 'DIS', 'THR', 'TRI', 'CON'];
    for (let i = 0; i < 5; i++) {
      paths.push({ data: `M -20 ${leftYs[i]} L 0 ${leftYs[i]}`, fill: "transparent" });
      pins.push({ x: -20, y: leftYs[i] });
      texts.push({ text: leftLabels[i], x: 4, y: leftYs[i] - 5, size: 11 });
    }
    
    // Right pin: OUT
    paths.push({ data: `M 80 -20 L 100 -20`, fill: "transparent" });
    pins.push({ x: 100, y: -20 });
    texts.push({ text: 'OUT', x: 52, y: -25, size: 11 });

    labelOffset = { x: 90, y: -60 };
    valueOffset = { x: 90, y: 60 };
  }
  // --- SWITCHES ---
  else if (type === 'SwitchSPST' || type === 'PushButton') {
    paths.push({ data: "M 0 0 L 15 0 M 45 0 L 60 0", fill: "transparent" });
    circles.push({ x: 17, y: 0, r: 2, fill: "transparent" });
    circles.push({ x: 43, y: 0, r: 2, fill: "transparent" });
    if (type === 'PushButton') {
      paths.push({ data: "M 17 -10 L 43 -10 M 30 -10 L 30 -15 M 25 -15 L 35 -15", fill: "transparent" }); // Button top
    } else {
      paths.push({ data: "M 17 -3 L 40 -12", fill: "transparent" }); // open lever
    }
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }
  else if (type.startsWith('Transformer') || type === 'Transformers' || type === 'Relay' || type === 'CoupledInductors') {
    const pCount = (type === 'Transformer2P1S' || type === 'Transformer2P2S') ? 2 : 1;
    const sCount = (type === 'Transformer1P2S' || type === 'Transformer2P2S') ? 2 : 1;
    const isCT = type === 'Transformer1P1S_CT';

    // Base Y offset for top coils
    const topY = (pCount === 2 || sCount === 2) ? -50 : -30;
    
    // Primary Top
    paths.push({ data: `M 0 ${topY} L 15 ${topY} A 6 7.5 0 0 1 15 ${topY + 15} A 6 7.5 0 0 1 15 ${topY + 30} A 6 7.5 0 0 1 15 ${topY + 45} A 6 7.5 0 0 1 15 ${topY + 60} L 0 ${topY + 60}`, fill: "transparent" });
    circles.push({ x: 12, y: topY - 3, r: 2, fill: "transparent" });
    pins.push({ x: 0, y: topY }, { x: 0, y: topY + 60 });

    if (pCount === 2) {
      // Primary Bottom
      const botY = topY + 80; // Gap of 20 between coils
      paths.push({ data: `M 0 ${botY} L 15 ${botY} A 6 7.5 0 0 1 15 ${botY + 15} A 6 7.5 0 0 1 15 ${botY + 30} A 6 7.5 0 0 1 15 ${botY + 45} A 6 7.5 0 0 1 15 ${botY + 60} L 0 ${botY + 60}`, fill: "transparent" });
      circles.push({ x: 12, y: botY - 3, r: 2, fill: "transparent" });
      pins.push({ x: 0, y: botY }, { x: 0, y: botY + 60 });
    }

    // Secondary Top
    paths.push({ data: `M 60 ${topY} L 45 ${topY} A 6 7.5 0 0 0 45 ${topY + 15} A 6 7.5 0 0 0 45 ${topY + 30} A 6 7.5 0 0 0 45 ${topY + 45} A 6 7.5 0 0 0 45 ${topY + 60} L 60 ${topY + 60}`, fill: "transparent" });
    circles.push({ x: 48, y: topY - 3, r: 2, fill: "transparent" });
    pins.push({ x: 60, y: topY });
    if (isCT) {
      paths.push({ data: `M 45 ${topY + 30} L 60 ${topY + 30}`, fill: "transparent" });
      pins.push({ x: 60, y: topY + 30 });
    }
    pins.push({ x: 60, y: topY + 60 });

    if (sCount === 2) {
      // Secondary Bottom
      const botY = topY + 80;
      paths.push({ data: `M 60 ${botY} L 45 ${botY} A 6 7.5 0 0 0 45 ${botY + 15} A 6 7.5 0 0 0 45 ${botY + 30} A 6 7.5 0 0 0 45 ${botY + 45} A 6 7.5 0 0 0 45 ${botY + 60} L 60 ${botY + 60}`, fill: "transparent" });
      circles.push({ x: 48, y: botY - 3, r: 2, fill: "transparent" });
      pins.push({ x: 60, y: botY }, { x: 60, y: botY + 60 });
    }

    // Core lines
    let coreStartY = topY + 5;
    let coreEndY = (pCount === 2 || sCount === 2) ? (topY + 80 + 55) : (topY + 55);
    paths.push({ data: `M 26 ${coreStartY} L 26 ${coreEndY} M 34 ${coreStartY} L 34 ${coreEndY}`, fill: "transparent" });

    labelOffset = { x: 30, y: topY - 20 };
  }
  else if (type === 'Resistors') {
    // Two parallel resistors
    // Resistor 1 (Top)
    lines.push({ points: [0, -20, 15, -20] });
    lines.push({ points: [15, -20, 18, -25, 22, -16, 26, -25, 30, -16, 34, -25, 38, -16, 40, -20, 45, -20] });
    lines.push({ points: [45, -20, 60, -20] });

    // Resistor 2 (Bottom)
    lines.push({ points: [0, 20, 15, 20] });
    lines.push({ points: [15, 20, 18, 15, 22, 24, 26, 15, 30, 24, 34, 15, 38, 24, 40, 20, 45, 20] });
    lines.push({ points: [45, 20, 60, 20] });

    pins = [
      { x: 0, y: -20 },
      { x: 60, y: -20 },
      { x: 0, y: 20 },
      { x: 60, y: 20 }
    ];
    labelOffset = { x: 20, y: -40 };
    valueOffset = { x: 20, y: 40 };
  }
  // --- DIGITAL LOGIC GATES ---
  else if (type === 'GateAND') {
    // AND gate: flat left side, rounded right, 2 inputs, 1 output
    paths.push({ data: "M 5 -15 L 25 -15 Q 45 -15 45 0 Q 45 15 25 15 L 5 15 Z", fill: "#fff" });
    lines.push({ points: [0, -10, 5, -10] }); // Input A
    lines.push({ points: [0, 10, 5, 10] });  // Input B
    lines.push({ points: [45, 0, 55, 0] }); // Output Y
    texts.push({ text: '&', x: 14, y: -6, size: 12, fill: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  else if (type === 'GateOR') {
    paths.push({ data: "M 5 -15 Q 15 -15 20 -15 Q 40 -15 45 0 Q 40 15 20 15 Q 15 15 5 15 Q 12 8 12 0 Q 12 -8 5 -15 Z", fill: "#fff" });
    lines.push({ points: [0, -10, 9, -10] }); // Input A
    lines.push({ points: [0, 10, 9, 10] });  // Input B
    lines.push({ points: [45, 0, 55, 0] }); // Output Y
    texts.push({ text: '≥1', x: 14, y: -6, size: 10, fill: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  else if (type === 'GateNOT') {
    paths.push({ data: "M 5 -15 L 5 15 L 38 0 Z", fill: "#fff" });
    circles.push({ x: 41, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, 0, 5, 0] }); // Input A
    lines.push({ points: [44, 0, 55, 0] }); // Output Y
    texts.push({ text: '1', x: 12, y: -5, size: 11, fill: '#333' });
    pins = [{ x: 0, y: 0 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  else if (type === 'GateNAND') {
    paths.push({ data: "M 5 -15 L 22 -15 Q 40 -15 40 0 Q 40 15 22 15 L 5 15 Z", fill: "#fff" });
    circles.push({ x: 43, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, -10, 5, -10] });
    lines.push({ points: [0, 10, 5, 10] });
    lines.push({ points: [46, 0, 55, 0] });
    texts.push({ text: '&', x: 12, y: -6, size: 12, fill: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  else if (type === 'GateNOR') {
    paths.push({ data: "M 5 -15 Q 14 -15 18 -15 Q 36 -15 40 0 Q 36 15 18 15 Q 14 15 5 15 Q 11 8 11 0 Q 11 -8 5 -15 Z", fill: "#fff" });
    circles.push({ x: 43, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, -10, 8, -10] });
    lines.push({ points: [0, 10, 8, 10] });
    lines.push({ points: [46, 0, 55, 0] });
    texts.push({ text: '≥1', x: 12, y: -6, size: 10, fill: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  else if (type === 'GateXOR') {
    paths.push({ data: "M 10 -15 Q 19 -15 23 -15 Q 43 -15 48 0 Q 43 15 23 15 Q 19 15 10 15 Q 16 8 16 0 Q 16 -8 10 -15 Z", fill: "#fff" });
    paths.push({ data: "M 5 -15 Q 11 -8 11 0 Q 11 8 5 15", fill: "transparent" }); // XOR extra arc
    lines.push({ points: [0, -10, 12, -10] });
    lines.push({ points: [0, 10, 12, 10] });
    lines.push({ points: [48, 0, 55, 0] });
    texts.push({ text: '=1', x: 17, y: -6, size: 10, fill: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 17 };
  }
  // --- FALLBACK ---
  else {
    paths.push({ data: "M 0 0 L 15 0 M 15 -10 L 45 -10 L 45 10 L 15 10 Z M 45 0 L 60 0", fill: "#fff" });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
  }

  return (
    <Group
      x={component.position.x}
      y={component.position.y}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onMouseDown={(e) => {
        if (onSelect) onSelect();
      }}
    >
      {/* Rotated Component Graphics */}
      <Group rotation={component.rotation || 0}>
        <Group scaleX={1.5} scaleY={1.5}>
          {/* Invisible expanded hit area for easy selection */}
          <Path data={`M -10 -20 L 70 -20 L 70 20 L -10 20 Z`} fill="transparent" />

          {/* Render Circles */}
          {circles.map((c, i) => (
            <Circle key={`c${i}`} x={c.x} y={c.y} radius={c.r} stroke={strokeColor} strokeWidth={2} fill={c.fill || 'transparent'} />
          ))}
          
          {/* Render Lines */}
          {lines.map((l, i) => (
            <Line key={`l${i}`} points={l.points} stroke={strokeColor} strokeWidth={2} lineCap="round" lineJoin="round" />
          ))}

          {/* Render Paths */}
          {paths.map((p, i) => (
            <Path key={`p${i}`} data={p.data} stroke={strokeColor} strokeWidth={2} fill={p.fill || 'transparent'} lineCap="round" lineJoin="round" />
          ))}

          {/* Render Custom Texts (internal to symbol) */}
          {texts.map((t, i) => (
            <Text key={`t${i}`} text={t.text} x={t.x} y={t.y} fontSize={t.size || 10} fontFamily="monospace" fill={t.fill || "#666"} />
          ))}
        </Group>

        {/* Interaction nodes (Terminals) */}
        {pins.map((pin, i) => {
          const scaledX = pin.x * 1.5;
          const scaledY = pin.y * 1.5;
          return (
            <Circle 
              key={`pin${i}`}
              x={scaledX} y={scaledY} radius={5} fill="#fff" stroke={strokeColor} strokeWidth={2} hitStrokeWidth={15}
              onMouseDown={(e) => { 
                e.cancelBubble = true; 
                const rad = (component.rotation || 0) * Math.PI / 180;
                const rotX = scaledX * Math.cos(rad) - scaledY * Math.sin(rad);
                const rotY = scaledX * Math.sin(rad) + scaledY * Math.cos(rad);
                onNodeClick(e, { x: component.position.x + rotX, y: component.position.y + rotY }); 
              }}
              onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
              onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
            />
          );
        })}

        {/* Component ID Label - Orbits component but stays upright */}
        {component.id !== 'preview' && (
          <Group x={labelOffset.x * 1.5} y={labelOffset.y * 1.5} rotation={-(component.rotation || 0)}>
            <Text text={component.id} x={0} y={0} fontSize={16} fontFamily="Inter" fill="#111" fontStyle="bold" />
          </Group>
        )}

        {/* Component Value Label - Orbits component but stays upright */}
        <Group x={valueOffset.x * 1.5} y={valueOffset.y * 1.5} rotation={-(component.rotation || 0)}>
          <Text text={component.value || ""} x={0} y={0} fontSize={14} fontFamily="Inter" fill="#666" />
        </Group>

        {/* Interactive Slider for Potentiometer */}
        {type === 'Potentiometer' && (
          <Group rotation={-(component.rotation || 0)} x={-45} y={-65}>
            <InteractiveSlider
              min={100}
              max={parseFloat((component.value || '10k').replace('k','000').replace('M','000000').replace('m','0.001')) || 10000}
              value={(() => {
                const v = component.value || '10k';
                if (v.endsWith('M')) return parseFloat(v) * 1e6;
                if (v.endsWith('k')) return parseFloat(v) * 1e3;
                if (v.endsWith('m')) return parseFloat(v) * 1e-3;
                return parseFloat(v) || 10000;
              })()}
              width={100}
              onChange={(newVal) => {
                let display = '';
                if (newVal >= 1e6) display = `${(newVal / 1e6).toPrecision(3)}Meg`;
                else if (newVal >= 1e3) display = `${(newVal / 1e3).toPrecision(3)}k`;
                else display = `${newVal.toPrecision(3)}`;
                useSchematicStore.getState().updateComponentValue(component.id, display);
              }}
            />
          </Group>
        )}
      </Group>
    </Group>
  );
}
