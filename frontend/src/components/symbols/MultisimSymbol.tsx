import { Group, Path, Circle, Line, Text, Rect } from 'react-konva';
import type { SchematicComponent } from '../../store/useSchematicStore';
import { useSchematicStore } from '../../store/useSchematicStore';
import { InteractiveSlider } from './InteractiveSlider';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a raw component id (e.g. "r1", "cap3") into a tidy reference designator */
function formatRefDes(id: string, type: string): string {
  // If it already looks like R1 / C2 / U3 just titlecase the first char
  if (/^[a-zA-Z]{1,3}\d+$/.test(id)) return id.toUpperCase();
  // Map type → prefix
  const prefixMap: Record<string, string> = {
    Resistor: 'R', Potentiometer: 'R', Load: 'R', Fuse: 'F',
    Capacitor: 'C', Inductor: 'L',
    Diode: 'D', LED: 'D', DiodeZener: 'D', DiodeSchottky: 'D',
    TransistorNPN: 'Q', TransistorPNP: 'Q', MosfetN: 'Q', MosfetP: 'Q',
    Timer555: 'U', Opamp: 'U', Opamp5: 'U', Comparator: 'U', Opamps: 'U',
    OpampLM358: 'U', OpampTL071: 'U', SchmittTrigger: 'U', InstAmp: 'U',
    VCSwitch: 'S', VCCS: 'G',
    SwitchSPST: 'S', SPDTSwitch: 'S', PushButton: 'S', DigitalSwitch: 'S',
    DCSource: 'V', ACSource: 'V', ClockVoltage: 'V',
    Ground: 'GND',
    GateAND: 'U', GateOR: 'U', GateNOT: 'U', GateNAND: 'U', GateNOR: 'U', GateXOR: 'U',
    DFlipFlop: 'U', JKFlipFlop: 'U',
    SevenSegment: 'DS', Lamp: 'DS',
  };
  const prefix = prefixMap[type] || 'U';
  // Extract trailing digits if any
  const digits = id.replace(/\D/g, '') || '1';
  return `${prefix}${digits}`;
}

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
  let circles: { x: number, y: number, r: number, fill?: string, stroke?: string }[] = [];
  let lines: { points: number[] }[] = [];
  let pins: { x: number, y: number }[] = [];
  let texts: { text: string, x: number, y: number, size?: number, fill?: string }[] = [];
  let labelOffset = { x: 30, y: -35 };   // above symbol (centered)
  let valueOffset = { x: 30, y: 35 };    // below symbol (centered)

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
  // --- SCR / THYRISTOR ---
  else if (type === 'ThyristorSCR') {
    // Diode body: anode → cathode
    paths.push({ data: "M 20 8 L 36 0 L 20 -8 Z", fill: strokeColor }); // Triangle (anode side)
    lines.push({ points: [36, 8, 36, -8] });  // Cathode bar
    lines.push({ points: [0, 0, 20, 0] });    // Anode lead
    lines.push({ points: [36, 0, 55, 0] });   // Cathode lead
    // Gate: angled line from cathode bar downward
    lines.push({ points: [36, 8, 55, 20] });  // Gate wire diagonal
    lines.push({ points: [55, 20, 55, 28] }); // Gate lead down
    pins = [{ x: 0, y: 0 }, { x: 55, y: 0 }, { x: 55, y: 28 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 25 };
  }
  // --- OPTOCOUPLER ---
  else if (type === 'Optocoupler') {
    // Outer box
    paths.push({ data: "M -20 -30 L 40 -30 L 40 30 L -20 30 Z", fill: "#fff" });
    // LED on left side
    paths.push({ data: "M -10 -20 L -2 -12 L -10 -4 Z", fill: strokeColor }); // LED triangle
    lines.push({ points: [-2, -20, -2, -4] }); // LED cathode bar
    lines.push({ points: [-30, -20, -10, -20] }); // Anode lead
    lines.push({ points: [-30, -4, -2, -4] });  // Cathode lead
    // Light arrows going right
    paths.push({ data: "M 4 -16 L 12 -10 M 12 -10 L 9 -10 M 12 -10 L 12 -13", fill: "transparent" });
    paths.push({ data: "M 4 -12 L 12 -6 M 12 -6 L 9 -6 M 12 -6 L 12 -9", fill: "transparent" });
    // Phototransistor on right side
    lines.push({ points: [20, -20, 20, 20] }); // Base vertical line
    lines.push({ points: [20, -16, 30, -20] }); // Collector angle
    lines.push({ points: [30, -20, 30, -30] }); // Collector lead
    lines.push({ points: [20, 16, 30, 20] }); // Emitter angle
    lines.push({ points: [30, 20, 30, 30] }); // Emitter lead
    paths.push({ data: "M 27 12 L 28 17 L 24 17 Z", fill: strokeColor }); // NPN arrow out
    // External leads
    pins = [{ x: -30, y: -20 }, { x: -30, y: -4 }, { x: 30, y: 30 }, { x: 30, y: -30 }];
    labelOffset = { x: 45, y: -35 };
    valueOffset = { x: 45, y: 35 };
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
    circles.push({ x: 30, y: 0, r: 18, fill: "#fff" }); // Circle body
    lines.push({ points: [0, 0, 12, 0] });
    lines.push({ points: [48, 0, 60, 0] });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    
    if (type === 'DCCurrent' || type.includes('Current')) {
      // Arrow pointing right (DC current direction)
      paths.push({ data: "M 20 0 L 40 0 M 36 -4 L 40 0 L 36 4", fill: "transparent" });
    } else if (type === 'PulseVoltage' || type === 'ClockVoltage' || type === 'StepVoltage' || type === 'PulseCurrent' || type === 'ClockCurrent' || type === 'StepCurrent') {
      // Square/pulse wave for pulse/clock/step sources
      paths.push({ data: "M 22 4 L 22 -4 L 27 -4 L 27 4 L 32 4 L 32 -4 L 37 -4 L 37 4", fill: "transparent" });
      lines.push({ points: [30, -15, 30, -9] }); // + Vertical
      lines.push({ points: [27, -12, 33, -12] }); // + Horizontal
      lines.push({ points: [27, 12, 33, 12] }); // - Horizontal
    } else if (type === 'ACSource' || type.includes('Voltage') || type.includes('Noise')) {
      // Sine wave for AC/voltage sources
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
  else if (type === 'Ground') {
    paths.push({ data: "M 0 0 L 0 10 M -12 10 L 12 10 M -8 14 L 8 14 M -4 18 L 4 18", fill: "transparent" });
    pins = [{ x: 0, y: 0 }];
    labelOffset = { x: 15, y: 5 };
  }
  // --- JUNCTION (T-junction dot) ---
  else if (type === 'Junction') {
    // A junction is a T-connection node — cross lines with a dot
    lines.push({ points: [-12, 0, 12, 0] }); // Horizontal through-line
    lines.push({ points: [0, 0, 0, 12] });    // Downward stem
    circles.push({ x: 0, y: 0, r: 4, fill: strokeColor }); // Junction dot
    pins = [{ x: -12, y: 0 }, { x: 12, y: 0 }, { x: 0, y: 12 }];
    labelOffset = { x: 15, y: -15 };
  }
  // --- CONNECTOR ---
  else if (type === 'Connector') {
    // Simple 2-pin connector block
    paths.push({ data: "M 10 -10 L 30 -10 L 30 10 L 10 10 Z", fill: "#fff" }); // Box body
    lines.push({ points: [0, 0, 10, 0] });  // Left lead
    lines.push({ points: [30, 0, 40, 0] }); // Right lead
    circles.push({ x: 18, y: 0, r: 3, fill: strokeColor }); // Pin dot left
    circles.push({ x: 24, y: 0, r: 3, fill: strokeColor }); // Pin dot right
    pins = [{ x: 0, y: 0 }, { x: 40, y: 0 }];
    labelOffset = { x: 5, y: -22 };
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
  else if (type.includes('Opamp') || type === 'Comparator' || type === 'OpampLM358' || type === 'OpampTL071') {
    paths.push({ data: "M 10 -20 L 50 0 L 10 20 Z", fill: "#fff" });
    // Inverting / Non-Inverting (+ on top, - on bottom)
    paths.push({ data: "M 0 -10 L 10 -10 M 13 -10 L 17 -10 M 15 -12 L 15 -8", fill: "transparent" }); // Non-inverting (+)
    paths.push({ data: "M 0 10 L 10 10 M 13 10 L 17 10", fill: "transparent" }); // Inverting (-)
    // Output
    paths.push({ data: "M 50 0 L 60 0", fill: "transparent" });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 60, y: 0 }];
    
    if (type === 'Opamp5' || type === 'OpampLM358' || type === 'OpampTL071') {
      paths.push({ data: "M 40 -5 L 40 -20 M 40 5 L 40 20", fill: "transparent" });
      pins.push({ x: 40, y: -20 }, { x: 40, y: 20 });
    }
    
    if (type === 'Comparator') {
      paths.push({ data: "M 25 -5 L 35 0 L 25 5", fill: "transparent" });
    }

    // Model label inside symbol body
    if (type === 'OpampLM358') texts.push({ text: 'LM358', x: 12, y: -2, size: 8 });
    if (type === 'OpampTL071') texts.push({ text: 'TL071', x: 12, y: -2, size: 8 });
    
    labelOffset = { x: 20, y: -35 };
    valueOffset = { x: 20, y: 25 };
  }
  // --- SCHMITT TRIGGER ---
  else if (type === 'SchmittTrigger') {
    paths.push({ data: "M 10 -20 L 50 0 L 10 20 Z", fill: "#fff" });
    // Hysteresis symbol inside (square-wave loop)
    paths.push({ data: "M 18 2 L 22 2 L 22 -4 L 28 -4 L 28 2 L 34 2 L 34 -4 L 38 -4", fill: "transparent" });
    // Input leads with +/-
    paths.push({ data: "M 0 -10 L 10 -10 M 13 -10 L 17 -10 M 15 -12 L 15 -8", fill: "transparent" });
    paths.push({ data: "M 0 10 L 10 10 M 13 10 L 17 10", fill: "transparent" });
    // Output
    paths.push({ data: "M 50 0 L 60 0", fill: "transparent" });
    // VCC/VEE supply stubs
    paths.push({ data: "M 40 -5 L 40 -20 M 40 5 L 40 20", fill: "transparent" });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 40, y: -20 }, { x: 40, y: 20 }, { x: 60, y: 0 }];
    labelOffset = { x: 20, y: -35 };
    valueOffset = { x: 20, y: 25 };
  }
  // --- VOLTAGE-CONTROLLED SWITCH ---
  else if (type === 'VCSwitch') {
    // Control port (left, vertical bar)
    paths.push({ data: "M 0 -20 L 20 -20 M 0 20 L 20 20 M 20 -20 L 20 20", fill: "transparent" });
    texts.push({ text: '+', x: 3, y: -24, size: 10 });
    texts.push({ text: '−', x: 3, y: 13, size: 12 });
    // Switch contacts
    paths.push({ data: "M -30 0 L -15 0 M 45 0 L 60 0", fill: "transparent" });
    circles.push({ x: -13, y: 0, r: 2, fill: "transparent" });
    circles.push({ x: 43, y: 0, r: 2, fill: "transparent" });
    paths.push({ data: "M -13 -3 L 40 -12", fill: "transparent" }); // open lever
    texts.push({ text: 'VC', x: 22, y: -17, size: 9 });
    pins = [{ x: 0, y: -20 }, { x: 0, y: 20 }, { x: -30, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 10, y: -45 };
  }
  // --- VCCS ---
  else if (type === 'VCCS') {
    // Input port (left, vertical line)
    paths.push({ data: "M 0 -15 L 15 -15 M 0 15 L 15 15 M 15 -15 L 15 15", fill: "transparent" });
    texts.push({ text: '+', x: 2, y: -19, size: 10 });
    texts.push({ text: '−', x: 2, y: 9, size: 12 });
    // Output current source (right circle + arrow)
    circles.push({ x: 45, y: 0, r: 15, fill: "#fff" });
    paths.push({ data: "M 45 -8 L 45 8", fill: "transparent" });
    paths.push({ data: "M 42 -3 L 45 -8 L 48 -3", fill: "transparent" });
    // Output leads
    paths.push({ data: "M 45 -15 L 45 -25 M 45 15 L 45 25", fill: "transparent" });
    texts.push({ text: 'Gm', x: 36, y: -3, size: 9 });
    // Connection lines from left port to right circle
    paths.push({ data: "M 15 -15 L 30 -15 L 30 -15 M 15 15 L 30 15 L 30 15", fill: "transparent" });
    pins = [{ x: 0, y: -15 }, { x: 0, y: 15 }, { x: 45, y: -25 }, { x: 45, y: 25 }];
    labelOffset = { x: 10, y: -45 };
    valueOffset = { x: 10, y: 35 };
  }
  // --- INSTRUMENTATION AMPLIFIER ---
  else if (type === 'InstAmp') {
    // Body rectangle
    paths.push({ data: "M 15 -30 L 55 -30 L 55 30 L 15 30 Z", fill: "#fff" });
    texts.push({ text: 'INA', x: 22, y: -3, size: 12 });
    // IN+, IN- leads
    paths.push({ data: "M 0 -15 L 15 -15 M 0 15 L 15 15", fill: "transparent" });
    texts.push({ text: '+', x: 3, y: -20, size: 10 });
    texts.push({ text: '−', x: 3, y: 10, size: 12 });
    // REF lead (top)
    paths.push({ data: "M 35 -30 L 35 -45", fill: "transparent" });
    texts.push({ text: 'REF', x: 22, y: -41, size: 9 });
    // OUT lead (right)
    paths.push({ data: "M 55 0 L 70 0", fill: "transparent" });
    pins = [{ x: 0, y: -15 }, { x: 0, y: 15 }, { x: 35, y: -45 }, { x: 70, y: 0 }];
    labelOffset = { x: 25, y: -60 };
    valueOffset = { x: 25, y: 35 };
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
    const isClosed = component.value !== 'Open';
    paths.push({ data: "M 0 0 L 15 0 M 45 0 L 60 0", fill: "transparent" });
    circles.push({ x: 17, y: 0, r: 2, fill: "transparent" });
    circles.push({ x: 43, y: 0, r: 2, fill: "transparent" });
    if (type === 'PushButton') {
      if (isClosed) {
        paths.push({ data: "M 17 0 L 43 0 M 30 0 L 30 -10 M 25 -10 L 35 -10", fill: "transparent" }); // Closed button
      } else {
        paths.push({ data: "M 17 -10 L 43 -10 M 30 -10 L 30 -15 M 25 -15 L 35 -15", fill: "transparent" }); // Open button top
      }
    } else {
      if (isClosed) {
        paths.push({ data: "M 17 0 L 43 0", fill: "transparent" }); // Closed lever
      } else {
        paths.push({ data: "M 17 -3 L 40 -12", fill: "transparent" }); // Open lever
      }
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
  else if (type === 'IC74HC04') {
    // DIP rectangle body
    paths.push({ data: 'M 0 -12 L 60 -12 L 60 12 L 0 12 Z', fill: '#f0f4ff' });
    texts.push({ text: '74HC04', x: 30, y: -4, size: 7 });
    texts.push({ text: 'NOT', x: 30, y: 5, size: 6 });
    lines.push({ points: [-15, 0, 0, 0] }); // left lead
    lines.push({ points: [60, 0, 75, 0] }); // right lead
    pins = [{ x: -15, y: 0 }, { x: 75, y: 0 }];
    labelOffset = { x: 30, y: -25 };
    valueOffset = { x: 30, y: 22 };
  }
  else if (type === 'IC74HC00') {
    paths.push({ data: 'M 0 -18 L 60 -18 L 60 18 L 0 18 Z', fill: '#f0f4ff' });
    texts.push({ text: '74HC00', x: 30, y: -6, size: 7 });
    texts.push({ text: 'NAND', x: 30, y: 5, size: 6 });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15, 10, 0, 10] });
    lines.push({ points: [60, 0, 75, 0] });
    texts.push({ text: 'A', x: -12, y: -17, size: 6 });
    texts.push({ text: 'B', x: -12, y: 3, size: 6 });
    texts.push({ text: 'Y', x: 64, y: -5, size: 6 });
    pins = [{ x: -15, y: -10 }, { x: -15, y: 10 }, { x: 75, y: 0 }];
    labelOffset = { x: 30, y: -32 };
    valueOffset = { x: 30, y: 30 };
  }
  else if (type === 'IC74HC86') {
    paths.push({ data: 'M 0 -18 L 60 -18 L 60 18 L 0 18 Z', fill: '#f0fff4' });
    texts.push({ text: '74HC86', x: 30, y: -6, size: 7 });
    texts.push({ text: 'XOR', x: 30, y: 5, size: 6 });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15, 10, 0, 10] });
    lines.push({ points: [60, 0, 75, 0] });
    texts.push({ text: 'A', x: -12, y: -17, size: 6 });
    texts.push({ text: 'B', x: -12, y: 3, size: 6 });
    texts.push({ text: 'Y', x: 64, y: -5, size: 6 });
    pins = [{ x: -15, y: -10 }, { x: -15, y: 10 }, { x: 75, y: 0 }];
    labelOffset = { x: 30, y: -32 };
    valueOffset = { x: 30, y: 30 };
  }
  else if (type === 'IC74HC138') {
    paths.push({ data: 'M 0 -36 L 60 -36 L 60 36 L 0 36 Z', fill: '#fff0f4' });
    texts.push({ text: '74HC138', x: 30, y: -20, size: 7 });
    texts.push({ text: '3-to-4', x: 30, y: -10, size: 6 });
    texts.push({ text: 'Decoder', x: 30, y: 0, size: 6 });
    // Input leads (left side)
    lines.push({ points: [-15, -24, 0, -24] });
    lines.push({ points: [-15, 0, 0, 0] });
    lines.push({ points: [-15, 24, 0, 24] });
    // Output leads (right side)
    lines.push({ points: [60, -24, 75, -24] });
    lines.push({ points: [60, -8, 75, -8] });
    lines.push({ points: [60, 8, 75, 8] });
    lines.push({ points: [60, 24, 75, 24] });
    texts.push({ text: 'A', x: -12, y: -31, size: 6 });
    texts.push({ text: 'B', x: -12, y: -7, size: 6 });
    texts.push({ text: 'C', x: -12, y: 17, size: 6 });
    texts.push({ text: 'Y0', x: 62, y: -31, size: 6 });
    texts.push({ text: 'Y1', x: 62, y: -15, size: 6 });
    texts.push({ text: 'Y2', x: 62, y: 1, size: 6 });
    texts.push({ text: 'Y3', x: 62, y: 17, size: 6 });
    pins = [
      { x: -15, y: -24 }, { x: -15, y: 0 }, { x: -15, y: 24 },
      { x: 75, y: -24 }, { x: 75, y: -8 }, { x: 75, y: 8 }, { x: 75, y: 24 }
    ];
    labelOffset = { x: 30, y: -50 };
    valueOffset = { x: 30, y: 50 };
  }
  // --- FLIP FLOPS ---
  else if (type === 'DFlipFlop') {
    paths.push({ data: "M 10 -25 L 50 -25 L 50 25 L 10 25 Z", fill: "#fff" });
    texts.push({ text: 'D', x: 15, y: -15, size: 10, fill: '#333' });
    texts.push({ text: 'Q', x: 40, y: -15, size: 10, fill: '#333' });
    texts.push({ text: 'Q\'', x: 40, y: 15, size: 10, fill: '#333' });
    paths.push({ data: "M 10 10 L 15 15 L 10 20", fill: "transparent" }); // Clock triangle
    lines.push({ points: [0, -15, 10, -15] }); // D
    lines.push({ points: [0, 15, 10, 15] }); // CLK
    lines.push({ points: [50, -15, 60, -15] }); // Q
    lines.push({ points: [50, 15, 60, 15] }); // Q'
    pins = [{ x: 0, y: -15 }, { x: 0, y: 15 }, { x: 60, y: -15 }, { x: 60, y: 15 }];
    labelOffset = { x: 15, y: -40 }; valueOffset = { x: 15, y: 30 };
  }
  else if (type === 'JKFlipFlop') {
    paths.push({ data: "M 10 -25 L 50 -25 L 50 25 L 10 25 Z", fill: "#fff" });
    texts.push({ text: 'J', x: 15, y: -15, size: 10, fill: '#333' });
    texts.push({ text: 'K', x: 15, y: 15, size: 10, fill: '#333' });
    texts.push({ text: 'Q', x: 40, y: -15, size: 10, fill: '#333' });
    texts.push({ text: 'Q\'', x: 40, y: 15, size: 10, fill: '#333' });
    paths.push({ data: "M 10 -5 L 15 0 L 10 5", fill: "transparent" }); // Clock triangle
    lines.push({ points: [0, -15, 10, -15] }); // J
    lines.push({ points: [0, 0, 10, 0] }); // CLK
    lines.push({ points: [0, 15, 10, 15] }); // K
    lines.push({ points: [50, -15, 60, -15] }); // Q
    lines.push({ points: [50, 15, 60, 15] }); // Q'
    pins = [{ x: 0, y: -15 }, { x: 0, y: 0 }, { x: 0, y: 15 }, { x: 60, y: -15 }, { x: 60, y: 15 }];
    labelOffset = { x: 15, y: -40 }; valueOffset = { x: 15, y: 30 };
  }
  // --- LAMP ---
  else if (type === 'Lamp') {
    const isOn = component.value === '1'; // Natively we will use value for status, or purely visual
    circles.push({ x: 30, y: 0, r: 15, fill: isOn ? "#fef08a" : "#fff", stroke: strokeColor });
    paths.push({ data: "M 20 10 L 30 -5 L 40 10", fill: "transparent" });
    paths.push({ data: "M 30 -5 Q 30 -15 25 -10", fill: "transparent" }); // filament
    lines.push({ points: [0, 0, 15, 0] });
    lines.push({ points: [45, 0, 60, 0] });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
  }
  // --- DIGITAL SWITCH ---
  else if (type === 'DigitalSwitch') {
    const isHigh = component.value === '1';
    paths.push({ data: "M 0 -15 L 40 -15 L 40 15 L 0 15 Z", fill: isHigh ? "#ecfdf5" : "#f3f4f6" });
    texts.push({ text: isHigh ? '1' : '0', x: 20, y: -6, size: 16, fill: isHigh ? '#10b981' : '#6b7280' });
    lines.push({ points: [40, 0, 60, 0] }); // Output pin
    pins = [{ x: 60, y: 0 }];
    labelOffset = { x: 0, y: -30 };
  }
  // --- VOLTAGE REGULATORS ---
  else if (type === 'VoltageRegulator7805' || type === 'VoltageRegulator7812' || type === 'VoltageRegulatorLM317') {
    paths.push({ data: "M 10 -15 L 50 -15 L 50 15 L 10 15 Z", fill: "#fff" });
    lines.push({ points: [0, 0, 10, 0] }); // IN
    lines.push({ points: [30, 15, 30, 25] }); // GND/ADJ
    lines.push({ points: [50, 0, 60, 0] }); // OUT
    texts.push({ text: 'IN', x: 12, y: -5, size: 9, fill: '#333' });
    texts.push({ text: 'OUT', x: 33, y: -5, size: 9, fill: '#333' });
    texts.push({ text: type === 'VoltageRegulatorLM317' ? 'ADJ' : 'GND', x: 20, y: 5, size: 9, fill: '#333' });
    pins = [{ x: 0, y: 0 }, { x: 30, y: 25 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -30 };
  }
  // --- 7-SEGMENT DISPLAY ---
  else if (type === 'SevenSegment') {
    // The SevenSegment is rendered as a special visual component below in JSX.
    // We set up minimal data here; the actual rendering is done after the main
    // return statement check below using early return.
    // Pins: A-G on left (y: -45 to +45 step 15), K on right (y: 0)
    lines.push({ points: [-15, -45, 0, -45] }); // A lead
    lines.push({ points: [-15, -30, 0, -30] }); // B lead
    lines.push({ points: [-15, -15, 0, -15] }); // C lead
    lines.push({ points: [-15,   0, 0,   0] }); // D lead
    lines.push({ points: [-15,  15, 0,  15] }); // E lead
    lines.push({ points: [-15,  30, 0,  30] }); // F lead
    lines.push({ points: [-15,  45, 0,  45] }); // G lead
    lines.push({ points: [60,    0, 75,  0] }); // K lead
    pins = [
      { x: -15, y: -45 }, { x: -15, y: -30 }, { x: -15, y: -15 },
      { x: -15, y:   0 }, { x: -15, y:  15 }, { x: -15, y:  30 },
      { x: -15, y:  45 }, { x:  75, y:   0 },
    ];
    labelOffset = { x: 30, y: -85 };
    valueOffset = { x: 30, y: 90 };
  }
  // --- CRYSTAL OSCILLATOR ---
  else if (type === 'CrystalOscillator') {
    lines.push({ points: [0, 0, 20, 0] }); // Left lead
    lines.push({ points: [20, -8, 20, 8] }); // Left plate
    paths.push({ data: "M 23 -6 L 29 -6 L 29 6 L 23 6 Z", fill: "transparent" }); // Crystal
    lines.push({ points: [32, -8, 32, 8] }); // Right plate
    lines.push({ points: [32, 0, 60, 0] }); // Right lead
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
  }
  // --- PHOTODIODE ---
  else if (type === 'Photodiode') {
    paths.push({ data: "M 23 8 L 36 0 L 23 -8 Z", fill: strokeColor });
    lines.push({ points: [36, 8, 36, -8] });
    lines.push({ points: [0, 0, 23, 0] });
    lines.push({ points: [36, 0, 60, 0] });
    // Light arrows pointing IN
    paths.push({ data: "M 15 -18 L 22 -12 M 22 -12 L 18 -12 M 22 -12 L 22 -16", fill: "transparent" });
    paths.push({ data: "M 20 -20 L 27 -14 M 27 -14 L 23 -14 M 27 -14 L 27 -18", fill: "transparent" });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -35 };
  }
  // --- PHOTOTRANSISTOR ---
  else if (type === 'Phototransistor') {
    lines.push({ points: [15, -12, 15, 12] }); // Base vertical
    lines.push({ points: [15, -8, 25, -13] }); // Collector angle
    lines.push({ points: [25, -13, 25, -20] }); // Collector lead
    lines.push({ points: [15, 8, 25, 13] }); // Emitter angle
    lines.push({ points: [25, 13, 25, 20] }); // Emitter lead
    // NO base wire.
    paths.push({ data: "M 22 8 L 23 12 L 19 13 Z", fill: strokeColor }); // arrow out
    // Light arrows pointing IN
    paths.push({ data: "M 0 -8 L 10 -2 M 10 -2 L 6 -2 M 10 -2 L 10 -6", fill: "transparent" });
    paths.push({ data: "M 5 -12 L 15 -6 M 15 -6 L 11 -6 M 15 -6 L 15 -10", fill: "transparent" });
    pins = [{ x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -20 };
  }
  // --- DIP-14 ---
  else if (type === 'DIP14') {
    paths.push({ data: "M 15 -40 L 45 -40 L 45 40 L 15 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" }); // Notch
    // 7 pins left
    for (let i=0; i<7; i++) {
      let py = -30 + i * 10;
      lines.push({ points: [0, py, 15, py] });
      texts.push({ text: `${i+1}`, x: 18, y: py - 4, size: 8, fill: '#333' });
      pins.push({ x: 0, y: py });
    }
    // 7 pins right
    for (let i=0; i<7; i++) {
      let py = 30 - i * 10;
      lines.push({ points: [45, py, 60, py] });
      texts.push({ text: `${i+8}`, x: 36, y: py - 4, size: 8, fill: '#333' });
      pins.push({ x: 60, y: py });
    }
    labelOffset = { x: 20, y: -50 };
  }
  // --- TRIAC ---
  else if (type === 'TRIAC') {
    paths.push({ data: "M 20 -8 L 36 0 L 20 8 Z", fill: strokeColor });
    paths.push({ data: "M 40 8 L 24 0 L 40 -8 Z", fill: strokeColor });
    lines.push({ points: [36, 8, 36, -8] });
    lines.push({ points: [24, 8, 24, -8] });
    lines.push({ points: [0, 0, 20, 0] });
    lines.push({ points: [40, 0, 60, 0] });
    lines.push({ points: [45, 10, 45, 20] }); // Gate
    lines.push({ points: [36, 8, 45, 10] }); // Gate wire
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 45, y: 20 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 25 };
  }
  // --- DIAC ---
  else if (type === 'DIAC') {
    paths.push({ data: "M 20 -8 L 36 0 L 20 8 Z", fill: strokeColor });
    paths.push({ data: "M 40 8 L 24 0 L 40 -8 Z", fill: strokeColor });
    lines.push({ points: [36, 8, 36, -8] });
    lines.push({ points: [24, 8, 24, -8] });
    lines.push({ points: [0, 0, 20, 0] });
    lines.push({ points: [40, 0, 60, 0] });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
  }
  // --- DARLINGTON ---
  else if (type === 'Darlington') {
    circles.push({ x: 20, y: 0, r: 18, fill: "transparent" });
    // Q1
    lines.push({ points: [10, -8, 10, 2] });
    lines.push({ points: [10, -5, 16, -8] });
    lines.push({ points: [16, -8, 20, -18] });
    lines.push({ points: [10, -1, 16, 2] });
    paths.push({ data: "M 14 0 L 16 3 L 12 2 Z", fill: strokeColor }); // arrow out
    // Q2
    lines.push({ points: [16, 2, 16, 12] });
    lines.push({ points: [16, 5, 22, 2] });
    lines.push({ points: [22, 2, 25, -12] });
    lines.push({ points: [16, 9, 22, 12] });
    paths.push({ data: "M 20 10 L 22 13 L 18 12 Z", fill: strokeColor }); // arrow out
    // Connection
    lines.push({ points: [0, 0, 10, -3] }); // Base
    lines.push({ points: [20, -18, 25, -18] }); // Collector tie
    lines.push({ points: [25, -18, 25, -20] }); // Collector
    lines.push({ points: [25, -12, 25, -18] });
    lines.push({ points: [22, 12, 25, 20] }); // Emitter
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 45, y: -20 };
  }
  // --- CURRENT MIRROR ---
  else if (type === 'CurrentMirror') {
    paths.push({ data: "M 5 -15 L 55 -15 L 55 15 L 5 15 Z", fill: "#fff" });
    texts.push({ text: 'I-Mirror', x: 10, y: -4, size: 10, fill: '#333' });
    lines.push({ points: [0, 0, 5, 0] }); // IN
    lines.push({ points: [30, -25, 30, -15] }); // VCC
    lines.push({ points: [55, 0, 60, 0] }); // OUT
    // Small arrows
    paths.push({ data: "M 0 5 L 4 5 L 2 8 Z", fill: strokeColor });
    paths.push({ data: "M 60 5 L 56 5 L 58 8 Z", fill: strokeColor });
    pins = [{ x: 0, y: 0 }, { x: 30, y: -25 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -30 };
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
        if (type === 'SwitchSPST' || type === 'PushButton' || type === 'DigitalSwitch') {
          e.cancelBubble = true;
          let newVal = 'Closed';
          if (type === 'DigitalSwitch') {
            newVal = component.value === '1' ? '0' : '1';
          } else {
            newVal = component.value !== 'Open' ? 'Open' : 'Closed';
          }
          if (updateComponentValue) updateComponentValue(component.id, newVal);
          // Auto-rerun simulation silently so graph updates immediately
          setTimeout(() => useSchematicStore.getState().runSimulation(true), 50);
          return;
        }
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
          const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
          const handlePinHit = (e: any) => {
            e.cancelBubble = true; 
            const rad = (component.rotation || 0) * Math.PI / 180;
            const rotX = scaledX * Math.cos(rad) - scaledY * Math.sin(rad);
            const rotY = scaledX * Math.sin(rad) + scaledY * Math.cos(rad);
            onNodeClick(e, { x: component.position.x + rotX, y: component.position.y + rotY }); 
          };
          
          return (
            <Circle 
              key={`pin${i}`}
              x={scaledX} y={scaledY} radius={5} fill="#fff" stroke={strokeColor} strokeWidth={2} hitStrokeWidth={isTouch ? 34 : 15}
              onMouseDown={handlePinHit}
              onTouchStart={handlePinHit}
              onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
              onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
            />
          );
        })}

        {/* Labels — counter-rotated with readable background pills */}
        {(() => {
          const rot = component.rotation || 0;

          const idX = labelOffset.x * 1.5;
          const idY = labelOffset.y * 1.5;
          const valX = valueOffset.x * 1.5;
          const valY = valueOffset.y * 1.5;

          // The labels orbit with the component's rotation to avoid overlapping geometry,
          // but the text itself stays upright because of the rotation={-rot} on the label Group.
          const idLocalX = idX;
          const idLocalY = idY;
          const valLocalX = valX;
          const valLocalY = valY;

          // Clean reference designator (e.g. R1, C2, U1)
          const refDes = (component as any).label || formatRefDes(component.id, type);
          const valText = component.value || '';

          // Check LED glow from simulation
          const simBuffer = useSchematicStore.getState().simulationBuffer;
          const isLED = type === 'LED';
          let ledGlowColor: string | null = null;
          if (isLED && simBuffer && simBuffer.length > 0) {
            const ledCurrentKey = Object.keys(simBuffer[0]).find(k =>
              k.toLowerCase().includes(`d_${component.id.toLowerCase()}`)
            );
            if (ledCurrentKey) {
              const avgCurrent = simBuffer.reduce((sum: number, row: any) => sum + Math.abs(row[ledCurrentKey] || 0), 0) / simBuffer.length;
              if (avgCurrent > 0.005) {
                // Pick color based on value label
                const v = (component.value || '').toLowerCase();
                if (v.includes('red')) ledGlowColor = '#ff2222';
                else if (v.includes('green')) ledGlowColor = '#22ff44';
                else if (v.includes('blue')) ledGlowColor = '#2244ff';
                else if (v.includes('yellow') || v.includes('amber')) ledGlowColor = '#ffcc00';
                else if (v.includes('white')) ledGlowColor = '#ffffff';
                else ledGlowColor = '#ff4400'; // default orange-red
              }
            }
          }

          // ── Overload Warning (Resistor / Fuse) ──
          // Rated power threshold: 0.25W for standard 1/4-watt resistors
          let overloaded = false;
          if ((type === 'Resistor' || type === 'Fuse' || type === 'Load') && simBuffer && simBuffer.length > 0) {
            // Parse resistance from component.value
            const rStr = (component.value || '1k').replace(/Meg/gi, 'e6').replace(/k/gi, 'e3').replace(/m/gi, 'e-3');
            const R = parseFloat(rStr) || 1000;
            // Find any voltage keys that reference this component
            const compId = component.id.toLowerCase();
            const vKeys = Object.keys(simBuffer[0]).filter(k =>
              k.startsWith('v(') && k.toLowerCase().includes(compId)
            );
            if (vKeys.length > 0) {
              const avgV = simBuffer.reduce((s: number, row: any) => s + Math.abs(row[vKeys[0]] || 0), 0) / simBuffer.length;
              const power = (avgV * avgV) / R;
              if (power > 0.25) overloaded = true;
            }
          }

          // ── Relay Coil Activation ──
          let relayActive = false;
          if (type === 'Relay' && simBuffer && simBuffer.length > 0) {
            const coilKey = Object.keys(simBuffer[0]).find(k =>
              k.toLowerCase().includes(`k_${component.id.toLowerCase()}`)
              || k.toLowerCase().includes(`i(v_${component.id.toLowerCase()}`)
            );
            if (coilKey) {
              const avgI = simBuffer.reduce((s: number, row: any) => s + Math.abs(row[coilKey] || 0), 0) / simBuffer.length;
              if (avgI > 0.01) relayActive = true;
            }
          }

          // ── 7-Segment Display Live Rendering ──
          let segmentVoltages: boolean[] = [false, false, false, false, false, false, false];
          if (type === 'SevenSegment' && simBuffer && simBuffer.length > 0) {
            const lastRow = simBuffer[simBuffer.length - 1];
            const compIdLow = component.id.toLowerCase();
            // Try to find voltage at each segment node: seg_{id}_{a-g}
            const segNames = ['a','b','c','d','e','f','g'];
            segmentVoltages = segNames.map(seg => {
              const nodeKey = Object.keys(lastRow).find(k =>
                k.toLowerCase().includes(`seg_${compIdLow}_${seg}`) ||
                k.toLowerCase().includes(`v(seg_${compIdLow}_${seg})`)
              );
              if (nodeKey) return (lastRow[nodeKey] || 0) > 1.5;
              // Fallback: check input pin voltage
              const pinKey = Object.keys(lastRow).find(k =>
                k.toLowerCase().includes(compIdLow) && k.toLowerCase().includes(seg)
              );
              if (pinKey) return (lastRow[pinKey] || 0) > 2.5;
              return false;
            });
          }

          return (
            <>
              {/* LED glow overlay */}
              {ledGlowColor && (
                <Circle
                  x={45} y={0}
                  radius={22}
                  fill={ledGlowColor}
                  opacity={0.35}
                  shadowColor={ledGlowColor}
                  shadowBlur={20}
                  shadowOpacity={0.9}
                  listening={false}
                />
              )}

              {/* 7-Segment Visual Display */}
              {type === 'SevenSegment' && (() => {
                // Segment definitions in symbol space (scaled 1.5x at render)
                // Display body: x=0..60, y=-55..55
                const ON = '#ff3300';
                const OFF = '#330000';
                const segs = segmentVoltages;
                const SW = 6; // segment width
                const SL = 22; // segment length
                // Positions (in symbol units, will be scaled 1.5x):
                // A=top, B=top-right, C=bottom-right, D=bottom, E=bottom-left, F=top-left, G=middle
                return (
                  <Group scaleX={1.5} scaleY={1.5}>
                    {/* Display background */}
                    <Rect x={0} y={-55} width={60} height={110} fill="#111" cornerRadius={4} />
                    {/* Segment A - top horizontal */}
                    <Rect x={8} y={-50} width={SL} height={SW} fill={segs[0] ? ON : OFF} cornerRadius={2} />
                    {/* Segment B - top-right vertical */}
                    <Rect x={32} y={-48} width={SW} height={SL} fill={segs[1] ? ON : OFF} cornerRadius={2} />
                    {/* Segment C - bottom-right vertical */}
                    <Rect x={32} y={-2} width={SW} height={SL} fill={segs[2] ? ON : OFF} cornerRadius={2} />
                    {/* Segment D - bottom horizontal */}
                    <Rect x={8} y={24} width={SL} height={SW} fill={segs[3] ? ON : OFF} cornerRadius={2} />
                    {/* Segment E - bottom-left vertical */}
                    <Rect x={2} y={-2} width={SW} height={SL} fill={segs[4] ? ON : OFF} cornerRadius={2} />
                    {/* Segment F - top-left vertical */}
                    <Rect x={2} y={-48} width={SW} height={SL} fill={segs[5] ? ON : OFF} cornerRadius={2} />
                    {/* Segment G - middle horizontal */}
                    <Rect x={8} y={-4} width={SL} height={SW} fill={segs[6] ? ON : OFF} cornerRadius={2} />
                    {/* Decimal point */}
                    <Rect x={42} y={24} width={SW} height={SW} fill={OFF} cornerRadius={2} />
                  </Group>
                );
              })()}

              {/* Overload glow + warning badge */}
              {overloaded && (
                <>
                  <Circle
                    x={30} y={0}
                    radius={20}
                    fill="#ff4400"
                    opacity={0.22}
                    shadowColor="#ff4400"
                    shadowBlur={18}
                    shadowOpacity={0.8}
                    listening={false}
                  />
                  <Group x={48} y={-18} listening={false}>
                    <Circle radius={9} fill="#ef4444" />
                    <Text text="!" x={-3} y={-7} fontSize={13} fontStyle="bold" fill="#fff" />
                  </Group>
                </>
              )}

              {/* Relay activated indicator */}
              {relayActive && (
                <Group x={30} y={-22} listening={false}>
                  <Rect x={-14} y={-8} width={28} height={14} fill="#10b981" cornerRadius={4} opacity={0.9} />
                  <Text text="ON" x={-10} y={-6} fontSize={11} fontStyle="bold" fill="#fff" fontFamily="Inter, sans-serif" />
                </Group>
              )}

              {/* Reference Designator label pill */}
              {component.id !== 'preview' && (
                <Group x={idLocalX} y={idLocalY} rotation={-rot}>
                  <Rect
                    x={-(refDes.length * 8 + 6) / 2} y={-12}
                    width={refDes.length * 8 + 6} height={16}
                    fill="rgba(255,255,255,0.82)"
                    cornerRadius={3}
                    listening={false}
                  />
                  <Text
                    text={refDes}
                    x={-(refDes.length * 8) / 2} y={-11}
                    fontSize={13}
                    fontFamily="Inter, Arial, sans-serif"
                    fill="#1a1a2e"
                    fontStyle="bold"
                    align="center"
                  />
                </Group>
              )}

              {/* Value label pill */}
              {valText.length > 0 && (
                <Group x={valLocalX} y={valLocalY} rotation={-rot}>
                  <Rect
                    x={-(valText.length * 7 + 6) / 2} y={-11}
                    width={valText.length * 7 + 6} height={15}
                    fill="rgba(255,255,255,0.78)"
                    cornerRadius={3}
                    listening={false}
                  />
                  <Text
                    text={valText}
                    x={-(valText.length * 7) / 2} y={-10}
                    fontSize={12}
                    fontFamily="Inter, Arial, sans-serif"
                    fill="#555"
                    align="center"
                  />
                </Group>
              )}
            </>
          );
        })()}

        {/* Interactive Slider for Potentiometer — live simulation on drag */}
        {type === 'Potentiometer' && (() => {
          // Build a stable debounced runner for live drag
          const debouncedRun = (() => {
            let timer: ReturnType<typeof setTimeout>;
            return () => {
              clearTimeout(timer);
              timer = setTimeout(() => useSchematicStore.getState().runSimulation(true), 200);
            };
          })();
          return (
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
                  debouncedRun(); // live graph update while dragging
                }}
                onChangeEnd={(newVal) => {
                  let display = '';
                  if (newVal >= 1e6) display = `${(newVal / 1e6).toPrecision(3)}Meg`;
                  else if (newVal >= 1e3) display = `${(newVal / 1e3).toPrecision(3)}k`;
                  else display = `${newVal.toPrecision(3)}`;
                  useSchematicStore.getState().updateComponentValue(component.id, display);
                  // Immediate final re-run on release
                  setTimeout(() => useSchematicStore.getState().runSimulation(true), 20);
                }}
              />
            </Group>
          );
        })()}
      </Group>
    </Group>
  );
}
