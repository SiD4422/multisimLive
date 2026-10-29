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
    switch_spst: 'S', potentiometer: 'R',
    logic_nand2: 'U', logic_nor2: 'U', logic_not: 'U', logic_and2: 'U', logic_or2: 'U', logic_xor2: 'U',
    ic_lm358: 'U', ic_lm555: 'U', ic_lm317: 'U', ic_zener_ref: 'U',
    bjt_npn: 'Q', bjt_pnp: 'Q', mosfet_n: 'Q', mosfet_p: 'Q',
    schottky_diode: 'D',
    ic_lm741: 'U', ic_lm324: 'U', ic_ne5532: 'U', ic_7474: 'U', ic_l293d: 'U',
    led: 'D', zener_diode: 'D', crystal: 'Y', variable_capacitor: 'C', relay_spdt: 'K',
    ic_lm386: 'U', ic_lm393: 'U', ic_7490: 'U', ic_uln2003: 'U', ic_74hc595: 'U',
    ic_7805: 'U', ic_7812: 'U', thermistor: 'R',
    ic_7447: 'U', ic_74hc245: 'U', ic_max232: 'U', ic_tl074: 'U',
    ic_ad620: 'U', ic_ne566: 'U', ic_cd4017: 'U',
    optocoupler_4n35: 'U', varistor: 'RV', ic_lm2596: 'U', ic_ir2110: 'U',
    ic_acs712: 'U', ic_lm567: 'U', ic_cd4051: 'U', ic_74hc32: 'U',
    ic_tca9548: 'U', ic_atmega328: 'U',
    triac: 'T', diac: 'D', igbt_n: 'Q', photo_resistor: 'R',
    ic_lm311: 'U', ic_l298n: 'U', ic_74hc08: 'U', ic_74hc00: 'U',
    ic_ds18b20: 'U', ic_sg3525: 'U',
    tunnel_diode: 'D', ic_74hc04: 'U', ic_74hc138: 'U', ic_74hc148: 'U',
    ic_ne5534: 'U', ic_lm337: 'U', ic_max7219: 'U', ic_cd4060: 'U', ic_mcp3208: 'U',
    npn_darlington: 'Q', pnp_darlington: 'Q', ic_lm35: 'U', hall_sensor: 'U',
    ic_74hc573: 'U', ic_74hc165: 'U', ic_pcf8574: 'U', ic_esp8266: 'U',
    ic_74hc86: 'U', ic_uc3842: 'U',
    scr: 'Q', jfet_n: 'Q', jfet_p: 'Q',
    ic_74hc244: 'U', ic_74hc374: 'U', ic_74hc151: 'U', ic_74hc283: 'U',
    ic_mcp4725: 'U', ic_ina219: 'U', ic_nrf24l01: 'U',
    ic_tl431: 'VR',
    ic_max485: 'U',
    ic_si7021: 'U',
    ic_bmp280: 'U',
    ic_pca9685: 'U',
    ic_ws2812: 'D',
    ujt: 'Q',
    varactor: 'D',
    ic_ne555_cmos: 'U',
    ic_74hc590: 'U',
    ic_ads1115: 'U',
    ic_mpu6050: 'U',
    ic_hc05: 'U',
    ic_74hc21: 'U',
    ic_lm2575: 'U',
    ic_tps61023: 'U',
    put: 'Q',
    ic_74hc30: 'U',
    ic_cd4040: 'U',
    ic_opa2134: 'U',
  };
  const prefix = prefixMap[type] || 'U';
  // Extract trailing digits if any
  const digits = id.replace(/\D/g, '') || '1';
  return `${prefix}${digits}`;
}

// Module-level timer map for debounced potentiometer simulation runs
const sliderDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
function triggerDebouncedSliderSim(componentId: string) {
  const existing = sliderDebounceTimers.get(componentId);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    useSchematicStore.getState().runSimulation(true);
    sliderDebounceTimers.delete(componentId);
  }, 150);
  sliderDebounceTimers.set(componentId, timer);
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
  const highlightedComponentIds = useSchematicStore(s => s.highlightedComponentIds);
  const isHighlighted = highlightedComponentIds.includes(component.id);
  const strokeColor = selected ? "#3b82f6" : "#000000";
  const type = component.type;
  
  let paths: { data: string, fill?: string, stroke?: string }[] = [];
  let circles: { x: number, y: number, r: number, fill?: string, stroke?: string }[] = [];
  let rects: { x: number, y: number, width: number, height: number, stroke?: string, strokeWidth?: number, fill?: string, cornerRadius?: number }[] = [];
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
  // --- INSTRUMENTS ---
  else if (type === 'Voltmeter') {
    circles.push({ x: 0, y: 0, r: 10, fill: "#fff", stroke: strokeColor });
    texts.push({ text: 'V', x: -4, y: -4, size: 10, fill: strokeColor });
    lines.push({ points: [0, -10, 0, -20] });
    lines.push({ points: [0, 10, 0, 20] });
    pins = [{ x: 0, y: -20 }, { x: 0, y: 20 }];
    labelOffset = { x: 15, y: -25 };
  }
  else if (type === 'Ammeter') {
    circles.push({ x: 0, y: 0, r: 10, fill: "#fff", stroke: strokeColor });
    texts.push({ text: 'A', x: -4, y: -4, size: 10, fill: strokeColor });
    lines.push({ points: [-10, 0, -20, 0] });
    lines.push({ points: [10, 0, 20, 0] });
    pins = [{ x: -20, y: 0 }, { x: 20, y: 0 }];
    labelOffset = { x: 15, y: -25 };
  }
  else if (type === 'Wattmeter') {
    circles.push({ x: 0, y: 0, r: 10, fill: "#fff", stroke: strokeColor });
    texts.push({ text: 'W', x: -4, y: -4, size: 10, fill: strokeColor });
    lines.push({ points: [0, -10, 0, -20] });
    lines.push({ points: [0, 10, 0, 20] });
    lines.push({ points: [-9, -4.5, -20, -10] });
    lines.push({ points: [9, 4.5, 20, 10] });
    pins = [{ x: 0, y: -20 }, { x: 0, y: 20 }, { x: -20, y: -10 }, { x: 20, y: 10 }];
    labelOffset = { x: 15, y: -25 };
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
  // --- 74XX STANDARD LOGIC GATES (4-pin: A, B, Y, GND; 3-pin: A, Y, GND) ---
  else if (type === 'logic_nand2') {
    paths.push({ data: "M 5 -15 L 22 -15 Q 40 -15 40 0 Q 40 15 22 15 L 5 15 Z", fill: "#fff" });
    circles.push({ x: 43, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, -10, 5, -10] }); // Input A
    lines.push({ points: [0, 10, 5, 10] });   // Input B
    lines.push({ points: [46, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 15, 25, 25] }); // GND stub
    texts.push({ text: '&', x: 12, y: -6, size: 12, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  else if (type === 'logic_nor2') {
    paths.push({ data: "M 5 -15 Q 14 -15 18 -15 Q 36 -15 40 0 Q 36 15 18 15 Q 14 15 5 15 Q 11 8 11 0 Q 11 -8 5 -15 Z", fill: "#fff" });
    circles.push({ x: 43, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, -10, 8, -10] }); // Input A
    lines.push({ points: [0, 10, 8, 10] });   // Input B
    lines.push({ points: [46, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 15, 25, 25] }); // GND stub
    texts.push({ text: '≥1', x: 12, y: -6, size: 10, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  else if (type === 'logic_not') {
    paths.push({ data: "M 5 -15 L 5 15 L 38 0 Z", fill: "#fff" });
    circles.push({ x: 41, y: 0, r: 3, fill: "#fff" });
    lines.push({ points: [0, 0, 5, 0] });     // Input A
    lines.push({ points: [44, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 9, 25, 25] });  // GND stub
    texts.push({ text: '1', x: 12, y: -5, size: 11, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: 0 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  else if (type === 'logic_and2') {
    paths.push({ data: "M 5 -15 L 25 -15 Q 45 -15 45 0 Q 45 15 25 15 L 5 15 Z", fill: "#fff" });
    lines.push({ points: [0, -10, 5, -10] }); // Input A
    lines.push({ points: [0, 10, 5, 10] });   // Input B
    lines.push({ points: [45, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 15, 25, 25] }); // GND stub
    texts.push({ text: '&', x: 14, y: -6, size: 12, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  else if (type === 'logic_or2') {
    paths.push({ data: "M 5 -15 Q 15 -15 20 -15 Q 40 -15 45 0 Q 40 15 20 15 Q 15 15 5 15 Q 12 8 12 0 Q 12 -8 5 -15 Z", fill: "#fff" });
    lines.push({ points: [0, -10, 9, -10] }); // Input A
    lines.push({ points: [0, 10, 9, 10] });   // Input B
    lines.push({ points: [45, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 15, 25, 25] }); // GND stub
    texts.push({ text: '≥1', x: 14, y: -6, size: 10, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  else if (type === 'logic_xor2') {
    paths.push({ data: "M 10 -15 Q 19 -15 23 -15 Q 43 -15 48 0 Q 43 15 23 15 Q 19 15 10 15 Q 16 8 16 0 Q 16 -8 10 -15 Z", fill: "#fff" });
    paths.push({ data: "M 5 -15 Q 11 -8 11 0 Q 11 8 5 15", fill: "transparent" });
    lines.push({ points: [0, -10, 12, -10] }); // Input A
    lines.push({ points: [0, 10, 12, 10] });  // Input B
    lines.push({ points: [48, 0, 55, 0] });   // Output Y
    lines.push({ points: [25, 15, 25, 25] }); // GND stub
    texts.push({ text: '=1', x: 17, y: -6, size: 10, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  // --- CORE LINEAR ICS ---
  else if (type === 'ic_lm358') {
    // 8-pin Dual Op-Amp IC body
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" }); // Notch
    // Left pins: IN1+ (-25), IN1- (-10), IN2+ (+10), IN2- (+25)
    lines.push({ points: [-15, -25, 0, -25] });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15, 10, 0, 10] });
    lines.push({ points: [-15, 25, 0, 25] });
    texts.push({ text: '1+', x: 3, y: -29, size: 7 });
    texts.push({ text: '1-', x: 3, y: -14, size: 7 });
    texts.push({ text: '2+', x: 3, y: 6, size: 7 });
    texts.push({ text: '2-', x: 3, y: 21, size: 7 });
    // Right pins: OUT1 (-18), OUT2 (+18)
    lines.push({ points: [60, -18, 75, -18] });
    lines.push({ points: [60, 18, 75, 18] });
    texts.push({ text: 'OUT1', x: 35, y: -22, size: 7 });
    texts.push({ text: 'OUT2', x: 35, y: 14, size: 7 });
    // Supply pins: VCC (top 30, -45), GND (bottom 30, 45)
    lines.push({ points: [30, -38, 30, -45] });
    lines.push({ points: [30, 38, 30, 45] });
    texts.push({ text: 'VCC', x: 21, y: -34, size: 7 });
    texts.push({ text: 'GND', x: 21, y: 28, size: 7 });
    texts.push({ text: 'LM358', x: 18, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: 75, y: -18 },
      { x: -15, y: 10 }, { x: -15, y: 25 }, { x: 75, y: 18 },
      { x: 30, y: -45 }, { x: 30, y: 45 }
    ];
    labelOffset = { x: 30, y: -58 };
    valueOffset = { x: 30, y: 58 };
  }
  else if (type === 'ic_lm555') {
    // 8-pin Timer IC
    paths.push({ data: "M 0 -40 L 60 -40 L 60 40 L 0 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" }); // Notch
    // Left pins: RESET (-30), TRIG (-15), CTRL (0), THR (15)
    lines.push({ points: [-15, -30, 0, -30] });
    lines.push({ points: [-15, -15, 0, -15] });
    lines.push({ points: [-15, 0, 0, 0] });
    lines.push({ points: [-15, 15, 0, 15] });
    texts.push({ text: 'RST', x: 3, y: -34, size: 7 });
    texts.push({ text: 'TRG', x: 3, y: -19, size: 7 });
    texts.push({ text: 'CV',  x: 3, y: -4, size: 7 });
    texts.push({ text: 'THR', x: 3, y: 11, size: 7 });
    // Right pins: OUT (-10), DIS (15)
    lines.push({ points: [60, -10, 75, -10] });
    lines.push({ points: [60, 15, 75, 15] });
    texts.push({ text: 'OUT', x: 38, y: -14, size: 7 });
    texts.push({ text: 'DIS', x: 38, y: 11, size: 7 });
    // Supply pins: VCC (top 30, -50), GND (bottom 30, 50)
    lines.push({ points: [30, -40, 30, -50] });
    lines.push({ points: [30, 40, 30, 50] });
    texts.push({ text: 'VCC', x: 21, y: -36, size: 7 });
    texts.push({ text: 'GND', x: 21, y: 30, size: 7 });
    texts.push({ text: 'LM555', x: 18, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: 30, y: 50 }, { x: -15, y: -15 }, { x: 75, y: -10 },
      { x: -15, y: -30 }, { x: 30, y: -50 }, { x: 75, y: 15 },
      { x: -15, y: 15 }, { x: -15, y: 0 }
    ];
    labelOffset = { x: 30, y: -62 };
    valueOffset = { x: 30, y: 62 };
  }
  else if (type === 'ic_lm317') {
    paths.push({ data: "M 10 -15 L 50 -15 L 50 15 L 10 15 Z", fill: "#fff" });
    lines.push({ points: [0, 0, 10, 0] });     // IN
    lines.push({ points: [50, 0, 60, 0] });    // OUT
    lines.push({ points: [30, 15, 30, 25] });  // ADJ
    texts.push({ text: 'IN', x: 12, y: -5, size: 8, fill: '#333' });
    texts.push({ text: 'OUT', x: 32, y: -5, size: 8, fill: '#333' });
    texts.push({ text: 'ADJ', x: 21, y: 6, size: 8, fill: '#333' });
    texts.push({ text: 'LM317', x: 18, y: -13, size: 7, fill: '#666' });
    pins = [{ x: 30, y: 25 }, { x: 60, y: 0 }, { x: 0, y: 0 }];
    labelOffset = { x: 15, y: -30 };
    valueOffset = { x: 15, y: 35 };
  }
  else if (type === 'ic_zener_ref') {
    lines.push({ points: [30, -25, 30, -10] }); // Cathode lead
    lines.push({ points: [30, 10, 30, 25] });   // Anode lead
    lines.push({ points: [0, 0, 24, 0] });      // REF lead
    paths.push({ data: "M 22 10 L 38 10 L 30 -10 Z", fill: strokeColor });
    lines.push({ points: [22, -10, 38, -10] });
    lines.push({ points: [22, -10, 22, -6] });
    lines.push({ points: [38, -10, 38, -14] });
    texts.push({ text: 'REF', x: 4, y: -8, size: 7, fill: '#333' });
    texts.push({ text: 'TL431', x: 38, y: -2, size: 7, fill: '#666' });
    pins = [{ x: 0, y: 0 }, { x: 30, y: -25 }, { x: 30, y: 25 }];
    labelOffset = { x: 15, y: -35 };
    valueOffset = { x: 15, y: 35 };
  }
  // --- INTERACTIVE SPST SWITCH ---
  else if (type === 'switch_spst') {
    const isClosed = component.props?.closed === true;
    circles.push({ x: -20, y: 0, r: 3, fill: "#64748b" });
    circles.push({ x: 20, y: 0, r: 3, fill: "#64748b" });
    if (isClosed) {
      lines.push({ points: [-20, 0, 20, 0] });
    } else {
      lines.push({ points: [-20, 0, 15, -12] });
    }
    texts.push({
      text: isClosed ? 'CLOSED' : 'OPEN',
      x: -15,
      y: 10,
      size: 8,
      fill: isClosed ? '#22c55e' : '#ef4444'
    });
    pins = [{ x: -20, y: 0 }, { x: 20, y: 0 }];
    labelOffset = { x: 0, y: -22 };
    valueOffset = { x: 0, y: 22 };
  }
  // --- POTENTIOMETER (3-TERMINAL WITH WIPER) ---
  else if (type === 'potentiometer') {
    const pct = component.props?.wiper_position ?? 50;
    rects.push({ x: -20, y: -8, width: 40, height: 16, stroke: "#64748b", strokeWidth: 2, cornerRadius: 2 });
    lines.push({ points: [0, 8, 0, 20] });
    lines.push({ points: [-5, 13, 0, 8, 5, 13] });
    texts.push({ text: `${pct}%`, x: -12, y: 22, size: 8, fill: "#94a3b8" });
    pins = [{ x: -20, y: 0 }, { x: 20, y: 0 }, { x: 0, y: 20 }];
    labelOffset = { x: 0, y: -22 };
    valueOffset = { x: 0, y: 35 };
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
  // --- NPN BJT ---
  else if (type === 'bjt_npn') {
    lines.push({ points: [15, -12, 15, 12] }); // Base vertical line
    lines.push({ points: [15, -8,  25, -13] }); // Collector angle
    lines.push({ points: [25, -13, 25, -20] }); // Collector lead up
    lines.push({ points: [15,  8,  25,  13] }); // Emitter angle
    lines.push({ points: [25,  13, 25,  20] }); // Emitter lead down
    lines.push({ points: [0,   0,  15,   0] }); // Base lead left
    paths.push({ data: "M 22 8 L 23 12 L 19 13 Z", fill: strokeColor }); // NPN arrow out on emitter
    texts.push({ text: 'C', x: 27, y: -20, size: 8, fill: '#555' });
    texts.push({ text: 'B', x: -8, y: -4, size: 8, fill: '#555' });
    texts.push({ text: 'E', x: 27, y: 12, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -25 };
    valueOffset = { x: 40, y: 20 };
  }
  // --- PNP BJT ---
  else if (type === 'bjt_pnp') {
    lines.push({ points: [15, -12, 15, 12] }); // Base vertical line
    lines.push({ points: [15, -8,  25, -13] }); // Collector angle
    lines.push({ points: [25, -13, 25, -20] }); // Collector lead
    lines.push({ points: [15,  8,  25,  13] }); // Emitter angle
    lines.push({ points: [25,  13, 25,  20] }); // Emitter lead
    lines.push({ points: [0,   0,  15,   0] }); // Base lead
    paths.push({ data: "M 18 2 L 15 3 L 20 6 Z", fill: strokeColor }); // PNP arrow in on emitter
    texts.push({ text: 'C', x: 27, y: -20, size: 8, fill: '#555' });
    texts.push({ text: 'B', x: -8, y: -4, size: 8, fill: '#555' });
    texts.push({ text: 'E', x: 27, y: 12, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -25 };
    valueOffset = { x: 40, y: 20 };
  }
  // --- N-CHANNEL MOSFET ---
  else if (type === 'mosfet_n') {
    // Gate, insulating gap, three-segment channel, bulk arrow inward
    paths.push({ data: "M 0 0 L 12 0 M 12 -12 L 12 12", fill: "transparent" }); // Gate line + body contact
    paths.push({ data: "M 16 -12 L 16 -6 M 16 -3 L 16 3 M 16 6 L 16 12", fill: "transparent" }); // Channel segments
    paths.push({ data: "M 25 -20 L 25 -9 L 16 -9", fill: "transparent" }); // Drain lead
    paths.push({ data: "M 25 20 L 25 9 L 16 9", fill: "transparent" }); // Source lead
    paths.push({ data: "M 16 0 L 25 0 M 25 0 L 25 20", fill: "transparent" }); // Bulk + source tie
    paths.push({ data: "M 22 -3 L 16 0 L 22 3 Z", fill: strokeColor }); // Arrow IN (N-ch)
    texts.push({ text: 'D', x: 27, y: -20, size: 8, fill: '#555' });
    texts.push({ text: 'G', x: -8, y: -4, size: 8, fill: '#555' });
    texts.push({ text: 'S', x: 27, y: 12, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -25 };
    valueOffset = { x: 40, y: 20 };
  }
  // --- P-CHANNEL MOSFET ---
  else if (type === 'mosfet_p') {
    paths.push({ data: "M 0 0 L 12 0 M 12 -12 L 12 12", fill: "transparent" });
    paths.push({ data: "M 16 -12 L 16 -6 M 16 -3 L 16 3 M 16 6 L 16 12", fill: "transparent" });
    paths.push({ data: "M 25 -20 L 25 -9 L 16 -9", fill: "transparent" });
    paths.push({ data: "M 25 20 L 25 9 L 16 9", fill: "transparent" });
    paths.push({ data: "M 16 0 L 25 0 M 25 0 L 25 20", fill: "transparent" });
    paths.push({ data: "M 19 -3 L 25 0 L 19 3 Z", fill: strokeColor }); // Arrow OUT (P-ch)
    texts.push({ text: 'D', x: 27, y: -20, size: 8, fill: '#555' });
    texts.push({ text: 'G', x: -8, y: -4, size: 8, fill: '#555' });
    texts.push({ text: 'S', x: 27, y: 12, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 25, y: -20 }, { x: 25, y: 20 }];
    labelOffset = { x: 40, y: -25 };
    valueOffset = { x: 40, y: 20 };
  }
  // --- SCHOTTKY DIODE ---
  else if (type === 'schottky_diode') {
    // Same triangle body as DiodeSchottky but self-contained
    paths.push({ data: "M 23 8 L 36 0 L 23 -8 Z", fill: strokeColor }); // Triangle (anode→cathode)
    lines.push({ points: [36, 8, 36, -8] }); // Cathode bar
    // Schottky S-hooks on cathode bar
    paths.push({ data: "M 32 -8 L 36 -8 L 36 8 L 32 8 M 32 -8 L 32 -4 M 32 8 L 32 4", fill: "transparent" });
    lines.push({ points: [0, 0, 23, 0] });  // Anode lead
    lines.push({ points: [36, 0, 60, 0] }); // Cathode lead
    texts.push({ text: 'A', x: 2, y: -6, size: 8, fill: '#555' });
    texts.push({ text: 'K', x: 50, y: -6, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
    valueOffset = { x: 15, y: 15 };
  }
  // --- LM741 SINGLE OP-AMP ---
  else if (type === 'ic_lm741') {
    // Triangle op-amp body with 5 pins (IN+, IN-, VCC, VEE, OUT)
    paths.push({ data: "M 10 -25 L 50 0 L 10 25 Z", fill: "#fff" });
    // IN+ lead
    paths.push({ data: "M 0 -15 L 10 -15 M 13 -15 L 17 -15 M 15 -17 L 15 -13", fill: "transparent" });
    // IN- lead
    paths.push({ data: "M 0 15 L 10 15 M 13 15 L 17 15", fill: "transparent" });
    // OUT lead
    paths.push({ data: "M 50 0 L 60 0", fill: "transparent" });
    // VCC stub (top) and VEE stub (bottom)
    paths.push({ data: "M 40 -10 L 40 -35 M 40 10 L 40 35", fill: "transparent" });
    texts.push({ text: 'LM741', x: 12, y: -2, size: 8, fill: '#333' });
    pins = [
      { x: 0, y: -15 }, // INP
      { x: 0, y:  15 }, // INM
      { x: 40, y: -35 }, // VCC
      { x: 40, y:  35 }, // VEE
      { x: 60, y:   0 }, // OUT
    ];
    labelOffset = { x: 25, y: -48 };
    valueOffset = { x: 25, y: 42 };
  }
  // --- LM324 QUAD OP-AMP (shown as dual, same as LM358 body) ---
  else if (type === 'ic_lm324') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" }); // Notch
    lines.push({ points: [-15, -25, 0, -25] });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15,  10, 0,  10] });
    lines.push({ points: [-15,  25, 0,  25] });
    texts.push({ text: '1+', x: 3, y: -29, size: 7 });
    texts.push({ text: '1-', x: 3, y: -14, size: 7 });
    texts.push({ text: '2+', x: 3, y:   6, size: 7 });
    texts.push({ text: '2-', x: 3, y:  21, size: 7 });
    lines.push({ points: [60, -18, 75, -18] });
    lines.push({ points: [60,  18, 75,  18] });
    texts.push({ text: 'OUT1', x: 35, y: -22, size: 7 });
    texts.push({ text: 'OUT2', x: 35, y:  14, size: 7 });
    lines.push({ points: [30, -38, 30, -45] });
    lines.push({ points: [30,  38, 30,  45] });
    texts.push({ text: 'VCC', x: 21, y: -34, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  28, size: 7 });
    texts.push({ text: 'LM324', x: 16, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: 75, y: -18 },
      { x: -15, y:  10 }, { x: -15, y:  25 }, { x: 75, y:  18 },
      { x: 30, y: -45 }, { x: 30, y: 45 }
    ];
    labelOffset = { x: 30, y: -58 };
    valueOffset = { x: 30, y: 58 };
  }
  // --- NE5532 DUAL LOW-NOISE OP-AMP (same shape as LM358) ---
  else if (type === 'ic_ne5532') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" });
    lines.push({ points: [-15, -25, 0, -25] });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15,  10, 0,  10] });
    lines.push({ points: [-15,  25, 0,  25] });
    texts.push({ text: '1+', x: 3, y: -29, size: 7 });
    texts.push({ text: '1-', x: 3, y: -14, size: 7 });
    texts.push({ text: '2+', x: 3, y:   6, size: 7 });
    texts.push({ text: '2-', x: 3, y:  21, size: 7 });
    lines.push({ points: [60, -18, 75, -18] });
    lines.push({ points: [60,  18, 75,  18] });
    texts.push({ text: 'OUT1', x: 35, y: -22, size: 7 });
    texts.push({ text: 'OUT2', x: 35, y:  14, size: 7 });
    lines.push({ points: [30, -38, 30, -45] });
    lines.push({ points: [30,  38, 30,  45] });
    texts.push({ text: 'VCC', x: 21, y: -34, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  28, size: 7 });
    texts.push({ text: 'NE5532', x: 14, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: 75, y: -18 },
      { x: -15, y:  10 }, { x: -15, y:  25 }, { x: 75, y:  18 },
      { x: 30, y: -45 }, { x: 30, y: 45 }
    ];
    labelOffset = { x: 30, y: -58 };
    valueOffset = { x: 30, y: 58 };
  }
  // --- 7474 D FLIP-FLOP ---
  else if (type === 'ic_7474') {
    // IC rectangle body
    paths.push({ data: "M 0 -40 L 60 -40 L 60 40 L 0 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" }); // Notch
    // Left pins: D (-20), CLK (0), /PRE (20)
    lines.push({ points: [-15, -20, 0, -20] });
    lines.push({ points: [-15,   0, 0,   0] });
    lines.push({ points: [-15,  20, 0,  20] });
    texts.push({ text: 'D',    x: 3, y: -24, size: 8 });
    texts.push({ text: 'CLK',  x: 3, y:  -4, size: 7 });
    texts.push({ text: '/PRE', x: 3, y:  16, size: 7 });
    paths.push({ data: "M 0 -4 L 7 0 L 0 4", fill: "transparent" }); // Clock triangle
    // Right pins: Q (-15), /Q (15)
    lines.push({ points: [60, -15, 75, -15] });
    lines.push({ points: [60,  15, 75,  15] });
    texts.push({ text: 'Q',  x: 42, y: -19, size: 8 });
    texts.push({ text: '/Q', x: 42, y:  11, size: 8 });
    // Bottom /CLR
    lines.push({ points: [30, 40, 30, 50] });
    texts.push({ text: '/CLR', x: 18, y: 32, size: 7 });
    // Supply stubs
    lines.push({ points: [30, -40, 30, -50] });
    texts.push({ text: 'VCC', x: 21, y: -36, size: 7 });
    texts.push({ text: '7474', x: 18, y:  -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -20 }, // D
      { x: -15, y:   0 }, // CLK
      { x: -15, y:  20 }, // /PRE
      { x:  30, y:  50 }, // /CLR
      { x:  75, y: -15 }, // Q
      { x:  75, y:  15 }, // /Q
      { x:  30, y: -50 }, // VCC
      { x:  30, y:  50 }, // GND (same as /CLR lead end — user connects GND here)
    ];
    labelOffset = { x: 30, y: -62 };
    valueOffset = { x: 30, y: 62 };
  }
  // --- L293D MOTOR DRIVER ---
  else if (type === 'ic_l293d') {
    paths.push({ data: "M 0 -50 L 60 -50 L 60 50 L 0 50 Z", fill: "#fff" });
    paths.push({ data: "M 25 -50 A 5 5 0 0 0 35 -50", fill: "transparent" }); // Notch
    // Left pins
    lines.push({ points: [-15, -35, 0, -35] });
    lines.push({ points: [-15, -20, 0, -20] });
    lines.push({ points: [-15,   0, 0,   0] });
    texts.push({ text: 'EN1', x: 2, y: -39, size: 7 });
    texts.push({ text: 'IN1', x: 2, y: -24, size: 7 });
    texts.push({ text: 'IN2', x: 2, y:  -4, size: 7 });
    // Right pins
    lines.push({ points: [60, -20, 75, -20] });
    lines.push({ points: [60,   0, 75,   0] });
    texts.push({ text: 'OUT1', x: 30, y: -24, size: 7 });
    texts.push({ text: 'OUT2', x: 30, y:  -4, size: 7 });
    // Supply stubs
    lines.push({ points: [30, -50, 30, -60] });
    lines.push({ points: [30,  50, 30,  60] });
    texts.push({ text: 'VCC1', x: 18, y: -46, size: 7 });
    texts.push({ text: 'VCC2', x: 18, y:  20, size: 7 });
    texts.push({ text: 'GND',  x: 20, y:  38, size: 7 });
    texts.push({ text: 'L293D', x: 14, y:  -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -35 }, // EN1
      { x: -15, y: -20 }, // IN1
      { x:  75, y: -20 }, // OUT1
      { x:  75, y:   0 }, // OUT2
      { x: -15, y:   0 }, // IN2
      { x:  30, y: -60 }, // VCC1
      { x:  30, y: -60 }, // VCC2 (tied together visually)
      { x:  30, y:  60 }, // GND
    ];
    labelOffset = { x: 30, y: -72 };
    valueOffset = { x: 30, y: 72 };
  }
  // --- LED ---
  else if (type === 'led') {
    // Filled diode triangle + cathode bar + two light-ray arrows
    paths.push({ data: "M 23 8 L 36 0 L 23 -8 Z", fill: strokeColor }); // Diode triangle
    lines.push({ points: [36, 8, 36, -8] });                              // Cathode bar
    lines.push({ points: [0, 0, 23, 0] });                                // Anode lead
    lines.push({ points: [36, 0, 60, 0] });                               // Cathode lead
    // Emission arrows pointing away from diode
    paths.push({ data: "M 40 -12 L 48 -20 M 48 -20 L 44 -20 M 48 -20 L 48 -16", fill: "transparent" });
    paths.push({ data: "M 44 -8  L 52 -16 M 52 -16 L 48 -16 M 52 -16 L 52 -12", fill: "transparent" });
    texts.push({ text: 'A', x: 2,  y: -8, size: 8, fill: '#555' });
    texts.push({ text: 'K', x: 49, y: -8, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -30 };
    valueOffset = { x: 15, y: 15 };
  }
  // --- ZENER DIODE ---
  else if (type === 'zener_diode') {
    paths.push({ data: "M 23 8 L 36 0 L 23 -8 Z", fill: strokeColor }); // Diode triangle
    // Zener bar with Z-hooks
    paths.push({ data: "M 32 -8 L 36 -8 L 36 8 L 40 8", fill: "transparent" });
    lines.push({ points: [0, 0, 23, 0] });
    lines.push({ points: [36, 0, 60, 0] });
    texts.push({ text: 'A', x: 2,  y: -8, size: 8, fill: '#555' });
    texts.push({ text: 'K', x: 49, y: -8, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
    valueOffset = { x: 15, y: 15 };
  }
  // --- QUARTZ CRYSTAL ---
  else if (type === 'crystal') {
    lines.push({ points: [0, 0, 18, 0] });                               // Left lead
    lines.push({ points: [18, -9, 18, 9] });                             // Left plate
    paths.push({ data: "M 22 -7 L 30 -7 L 30 7 L 22 7 Z", fill: "transparent" }); // Crystal body
    lines.push({ points: [34, -9, 34, 9] });                             // Right plate
    lines.push({ points: [34, 0, 60, 0] });                              // Right lead
    texts.push({ text: 'XTAL', x: 18, y: -16, size: 8, fill: '#555' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -28 };
    valueOffset = { x: 15, y: 15 };
  }
  // --- VARIABLE CAPACITOR (TRIMMER) ---
  else if (type === 'variable_capacitor') {
    // Standard cap plates with diagonal arrow through (trimmer symbol)
    paths.push({ data: "M 0 0 L 25 0 M 25 -10 L 25 10 M 35 -10 L 35 10 M 35 0 L 60 0", fill: "transparent" });
    // Diagonal arrow indicating variability
    paths.push({ data: "M 15 12 L 45 -12 M 42 -12 L 45 -12 L 45 -9", fill: "transparent" });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -25 };
    valueOffset = { x: 15, y: 18 };
  }
  // --- SPDT RELAY ---
  else if (type === 'relay_spdt') {
    // Coil (left rectangle)
    paths.push({ data: "M -28 -10 L -8 -10 L -8 10 L -28 10 Z", fill: "#fff" });
    // Coil leads
    lines.push({ points: [-38, -15, -28, -15] });  // COIL+
    lines.push({ points: [-38,  15, -28,  15] });  // COIL-
    // Coil internal symbol (small horizontal lines)
    for (let i = 0; i < 3; i++) {
      lines.push({ points: [-25 + i*6, -10, -25 + i*6, 10] });
    }
    texts.push({ text: '+', x: -37, y: -20, size: 8, fill: '#555' });
    texts.push({ text: '−', x: -37, y:  10, size: 9, fill: '#555' });
    // Armature pivot dot
    circles.push({ x: 8, y: 0, r: 2, fill: strokeColor });
    // COM lead (centre)
    lines.push({ points: [8, 0, 30, 0] });
    // NO contact (above) — switch lever open
    lines.push({ points: [30, -20, 55, -20] });
    lines.push({ points: [30,  0,  50, -16] }); // lever
    circles.push({ x: 30, y: -20, r: 2, fill: "transparent" });
    // NC contact (below) — normally closed
    lines.push({ points: [30, 20, 55, 20] });
    circles.push({ x: 30, y: 20, r: 2, fill: "transparent" });
    texts.push({ text: 'NO', x: 57, y: -25, size: 8, fill: '#22c55e' });
    texts.push({ text: 'NC', x: 57, y:  15, size: 8, fill: '#ef4444' });
    texts.push({ text: 'COM', x: 56, y: -5, size: 7, fill: '#555' });
    pins = [
      { x: -38, y: -15 }, // COIL+
      { x: -38, y:  15 }, // COIL-
      { x:  55, y:   0 }, // COM
      { x:  55, y: -20 }, // NO
      { x:  55, y:  20 }, // NC
    ];
    labelOffset = { x: 5, y: -35 };
    valueOffset = { x: 5, y: 35 };
  }
  // --- LM386 AUDIO AMPLIFIER ---
  else if (type === 'ic_lm386') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" }); // Notch
    lines.push({ points: [-15, -20, 0, -20] }); // IN+
    lines.push({ points: [-15,   0, 0,   0] }); // IN-
    lines.push({ points: [ 60,   0, 75,   0] }); // OUT
    lines.push({ points: [ 30, -38, 30, -45] }); // VS
    lines.push({ points: [ 30,  38, 30,  45] }); // GND
    lines.push({ points: [ 30,  25, 30,  38] }); // GAIN stub
    texts.push({ text: 'IN+',  x: 3,  y: -24, size: 7 });
    texts.push({ text: 'IN-',  x: 3,  y:  -4, size: 7 });
    texts.push({ text: 'OUT',  x: 38, y:  -4, size: 7 });
    texts.push({ text: 'VS',   x: 21, y: -34, size: 7 });
    texts.push({ text: 'GND',  x: 18, y:  22, size: 7 });
    texts.push({ text: 'GAIN', x: 18, y:  14, size: 7 });
    texts.push({ text: 'LM386', x: 14, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -20 }, // INP
      { x: -15, y:   0 }, // INM
      { x:  30, y: -45 }, // VS
      { x:  30, y:  45 }, // GND
      { x:  75, y:   0 }, // OUT
      { x:  30, y:  38 }, // GAIN
    ];
    labelOffset = { x: 30, y: -58 };
    valueOffset = { x: 30, y: 58 };
  }
  // --- LM393 DUAL COMPARATOR ---
  else if (type === 'ic_lm393') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" });
    lines.push({ points: [-15, -25, 0, -25] });
    lines.push({ points: [-15, -10, 0, -10] });
    lines.push({ points: [-15,  10, 0,  10] });
    lines.push({ points: [-15,  25, 0,  25] });
    texts.push({ text: '1+', x: 3, y: -29, size: 7 });
    texts.push({ text: '1-', x: 3, y: -14, size: 7 });
    texts.push({ text: '2+', x: 3, y:   6, size: 7 });
    texts.push({ text: '2-', x: 3, y:  21, size: 7 });
    lines.push({ points: [60, -18, 75, -18] });
    lines.push({ points: [60,  18, 75,  18] });
    texts.push({ text: 'O1', x: 38, y: -22, size: 7 });
    texts.push({ text: 'O2', x: 38, y:  14, size: 7 });
    lines.push({ points: [30, -38, 30, -45] });
    lines.push({ points: [30,  38, 30,  45] });
    texts.push({ text: 'VCC', x: 21, y: -34, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  28, size: 7 });
    texts.push({ text: 'LM393', x: 14, y: -4, size: 9, fill: '#333' });
    // Open-collector marker on outputs
    circles.push({ x: 72, y: -18, r: 3, fill: "#fff" });
    circles.push({ x: 72, y:  18, r: 3, fill: "#fff" });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: 75, y: -18 },
      { x: -15, y:  10 }, { x: -15, y:  25 }, { x: 75, y:  18 },
      { x:  30, y: -45 }, { x: 30, y: 45 }
    ];
    labelOffset = { x: 30, y: -58 };
    valueOffset = { x: 30, y: 58 };
  }
  // --- 7490 DECADE COUNTER ---
  else if (type === 'ic_7490') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    // Left pins
    lines.push({ points: [-15, -30, 0, -30] }); // CLKA
    lines.push({ points: [-15, -15, 0, -15] }); // CLKB
    lines.push({ points: [-15,   0, 0,   0] }); // R01
    lines.push({ points: [-15,  15, 0,  15] }); // R02
    texts.push({ text: 'CLKA', x: 2, y: -34, size: 7 });
    texts.push({ text: 'CLKB', x: 2, y: -19, size: 7 });
    texts.push({ text: 'R01',  x: 2, y:  -4, size: 7 });
    texts.push({ text: 'R02',  x: 2, y:  11, size: 7 });
    // Right pins
    lines.push({ points: [60, -30, 75, -30] }); // QA
    lines.push({ points: [60, -15, 75, -15] }); // QB
    lines.push({ points: [60,   0, 75,   0] }); // QC
    lines.push({ points: [60,  15, 75,  15] }); // QD
    texts.push({ text: 'QA', x: 38, y: -34, size: 7 });
    texts.push({ text: 'QB', x: 38, y: -19, size: 7 });
    texts.push({ text: 'QC', x: 38, y:  -4, size: 7 });
    texts.push({ text: 'QD', x: 38, y:  11, size: 7 });
    // Supply
    lines.push({ points: [30, -45, 30, -55] });
    lines.push({ points: [30,  45, 30,  55] });
    texts.push({ text: 'VCC', x: 21, y: -41, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  34, size: 7 });
    texts.push({ text: '7490', x: 18, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -30 }, { x: -15, y: -15 }, { x: -15, y: 0 }, { x: -15, y: 15 },
      { x: 75, y: -30 }, { x: 75, y: -15 }, { x: 75, y: 0 }, { x: 75, y: 15 },
      { x: 30, y: -55 }, { x: 30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 };
    valueOffset = { x: 30, y: 68 };
  }
  // --- ULN2003 DARLINGTON ARRAY ---
  else if (type === 'ic_uln2003') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    // Left: 4 inputs
    const uln_ys = [-30, -15, 0, 15];
    ['IN1','IN2','IN3','IN4'].forEach((lbl, i) => {
      lines.push({ points: [-15, uln_ys[i], 0, uln_ys[i]] });
      texts.push({ text: lbl, x: 2, y: uln_ys[i] - 4, size: 7 });
    });
    // Right: 4 outputs
    ['O1','O2','O3','O4'].forEach((lbl, i) => {
      lines.push({ points: [60, uln_ys[i], 75, uln_ys[i]] });
      texts.push({ text: lbl, x: 38, y: uln_ys[i] - 4, size: 7 });
    });
    // Supply
    lines.push({ points: [30, -45, 30, -55] }); // COM
    lines.push({ points: [30,  45, 30,  55] }); // GND
    texts.push({ text: 'COM', x: 18, y: -41, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  34, size: 7 });
    texts.push({ text: 'ULN2003', x: 9, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -30 }, { x: -15, y: -15 }, { x: -15, y: 0 }, { x: -15, y: 15 },
      { x: 75, y: -30 }, { x: 75, y: -15 }, { x: 75, y: 0 }, { x: 75, y: 15 },
      { x: 30, y: -55 }, { x: 30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 };
    valueOffset = { x: 30, y: 68 };
  }
  // --- 74HC595 SHIFT REGISTER ---
  else if (type === 'ic_74hc595') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    // Left pins
    const sr_lbls = ['SER','SRCLK','RCLK','/SRCLR','/OE'];
    const sr_ys   = [-35, -20, -5, 10, 25];
    sr_lbls.forEach((lbl, i) => {
      lines.push({ points: [-15, sr_ys[i], 0, sr_ys[i]] });
      texts.push({ text: lbl, x: 2, y: sr_ys[i] - 4, size: 6 });
    });
    // Right: Q7S cascade output
    lines.push({ points: [60, 25, 75, 25] });
    texts.push({ text: 'Q7S', x: 38, y: 21, size: 7 });
    // Supply
    lines.push({ points: [30, -45, 30, -55] });
    lines.push({ points: [30,  45, 30,  55] });
    texts.push({ text: 'VCC', x: 21, y: -41, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  34, size: 7 });
    texts.push({ text: '74HC595', x: 8, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -35 }, { x: -15, y: -20 }, { x: -15, y: -5 },
      { x: -15, y:  10 }, { x: -15, y:  25 },
      { x: 75, y: 25 },
      { x: 30, y: -55 }, { x: 30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 };
    valueOffset = { x: 30, y: 68 };
  }
  // --- 7805 / 7812 FIXED REGULATOR ---
  else if (type === 'ic_7805' || type === 'ic_7812') {
    const label = type === 'ic_7805' ? '7805' : '7812';
    const vout  = type === 'ic_7805' ? '+5V' : '+12V';
    paths.push({ data: "M 10 -15 L 50 -15 L 50 15 L 10 15 Z", fill: "#fff" }); // Body
    lines.push({ points: [0,  0, 10,  0] }); // IN lead
    lines.push({ points: [50, 0, 60,  0] }); // OUT lead
    lines.push({ points: [30,15, 30, 25] }); // GND lead
    texts.push({ text: 'IN',  x: 12, y: -5, size: 8, fill: '#333' });
    texts.push({ text: 'OUT', x: 33, y: -5, size: 8, fill: '#333' });
    texts.push({ text: 'GND', x: 21, y:  6, size: 8, fill: '#333' });
    texts.push({ text: label, x: 13, y:-13, size: 7, fill: '#666' });
    texts.push({ text: vout,  x: 14, y: 12, size: 7, fill: '#22c55e' });
    pins = [{ x: 0, y: 0 }, { x: 30, y: 25 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -30 };
    valueOffset = { x: 15, y: 38 };
  }
  // --- NTC THERMISTOR ---
  else if (type === 'thermistor') {
    // Resistor zigzag + diagonal arrow (like variable resistor) + NTC label
    lines.push({ points: [0, 0, 16.5, 0] });
    lines.push({ points: [16.5,0, 19.5,-5, 23.5,4, 28.5,-5, 32.5,4, 37.5,-5, 41.5,4, 43.5,0] });
    lines.push({ points: [43.5, 0, 60, 0] });
    // Diagonal arrow through body
    paths.push({ data: "M 10 12 L 50 -12 M 47 -12 L 50 -12 L 50 -9", fill: "transparent" });
    texts.push({ text: 'NTC', x: 18, y: -14, size: 8, fill: '#f59e0b' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -28 };
    valueOffset = { x: 15, y: 18 };
  }
  // --- 7447 BCD TO 7-SEGMENT DECODER ---
  else if (type === 'ic_7447') {
    paths.push({ data: "M 0 -50 L 60 -50 L 60 50 L 0 50 Z", fill: "#fff" });
    paths.push({ data: "M 25 -50 A 5 5 0 0 0 35 -50", fill: "transparent" });
    // Left: BCD inputs A-D
    [['A',-35],['B',-20],['C',-5],['D',10]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number) - 4, size: 8 });
    });
    // Right: segment outputs a-g
    [['a',-35],['b',-22],['c',-9],['d',4],['e',17],['f',30],['g',43]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number) - 4, size: 8 });
    });
    lines.push({ points: [30, -50, 30, -60] });
    lines.push({ points: [30,  50, 30,  60] });
    texts.push({ text: 'VCC', x: 21, y: -46, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  38, size: 7 });
    texts.push({ text: '7447', x: 18, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -35 }, { x: -15, y: -20 }, { x: -15, y: -5 }, { x: -15, y: 10 },
      { x: 75, y: -35 }, { x: 75, y: -22 }, { x: 75, y: -9 },
      { x: 75, y: 4 }, { x: 75, y: 17 }, { x: 75, y: 30 }, { x: 75, y: 43 },
      { x: 30, y: -60 }, { x: 30, y: 60 }
    ];
    labelOffset = { x: 30, y: -72 };
    valueOffset = { x: 30, y: 72 };
  }
  // --- 74HC245 BUS TRANSCEIVER ---
  else if (type === 'ic_74hc245') {
    paths.push({ data: "M 0 -40 L 60 -40 L 60 40 L 0 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" });
    [['DIR',-35],['/OE',-20],['A1',-5],['A2',10]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number) - 4, size: 7 });
    });
    [['B1',-5],['B2',10]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number) - 4, size: 7 });
    });
    // Bidirectional arrows in body
    paths.push({ data: "M 20 0 L 40 0 M 37 -3 L 40 0 L 37 3 M 23 -3 L 20 0 L 23 3", fill: "transparent" });
    lines.push({ points: [30, -40, 30, -50] });
    lines.push({ points: [30,  40, 30,  50] });
    texts.push({ text: 'VCC', x: 21, y: -36, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  28, size: 7 });
    texts.push({ text: '74HC245', x: 6, y: -14, size: 8, fill: '#333' });
    pins = [
      { x: -15, y: -35 }, { x: -15, y: -20 }, { x: -15, y: -5 }, { x: -15, y: 10 },
      { x: 75, y: -5 }, { x: 75, y: 10 },
      { x: 30, y: -50 }, { x: 30, y: 50 }
    ];
    labelOffset = { x: 30, y: -62 };
    valueOffset = { x: 30, y: 62 };
  }
  // --- MAX232 RS-232 LEVEL CONVERTER ---
  else if (type === 'ic_max232') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    [['T1IN',-30],['T2IN',-15],['R1OUT',0],['R2OUT',15]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number) - 4, size: 6 });
    });
    [['T1OUT',-30],['T2OUT',-15],['R1IN',0],['R2IN',15]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 32, y: (y as number) - 4, size: 6 });
    });
    lines.push({ points: [30, -45, 30, -55] });
    lines.push({ points: [30,  45, 30,  55] });
    texts.push({ text: 'VCC', x: 21, y: -41, size: 7 });
    texts.push({ text: 'GND', x: 21, y:  33, size: 7 });
    texts.push({ text: 'MAX232', x: 12, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -30 }, { x: -15, y: -15 }, { x: -15, y: 0 }, { x: -15, y: 15 },
      { x: 75, y: -30 }, { x: 75, y: -15 }, { x: 75, y: 0 }, { x: 75, y: 15 },
      { x: 30, y: -55 }, { x: 30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 };
    valueOffset = { x: 30, y: 68 };
  }
  // --- TL074 QUAD JFET OP-AMP (dual shown, same body as LM358) ---
  else if (type === 'ic_tl074') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" });
    lines.push({ points: [-15,-25, 0,-25] }); lines.push({ points: [-15,-10, 0,-10] });
    lines.push({ points: [-15, 10, 0, 10] }); lines.push({ points: [-15, 25, 0, 25] });
    texts.push({ text: '1+', x: 3, y: -29, size: 7 }); texts.push({ text: '1-', x: 3, y: -14, size: 7 });
    texts.push({ text: '2+', x: 3, y:   6, size: 7 }); texts.push({ text: '2-', x: 3, y:  21, size: 7 });
    lines.push({ points: [60,-18,75,-18] }); lines.push({ points: [60, 18,75, 18] });
    texts.push({ text: 'O1', x: 38, y:-22, size: 7 }); texts.push({ text: 'O2', x: 38, y: 14, size: 7 });
    lines.push({ points: [30,-38,30,-45] }); lines.push({ points: [30, 38,30, 45] });
    texts.push({ text: 'VCC', x: 21, y:-34, size: 7 }); texts.push({ text: 'VEE', x: 21, y: 28, size: 7 });
    texts.push({ text: 'TL074', x: 14, y: -4, size: 9, fill: '#333' });
    // JFET arrow markers on input pins
    paths.push({ data: "M -7 -25 L -4 -22 M -7 -10 L -4 -7", fill: "transparent" });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: 75, y: -18 },
      { x: -15, y:  10 }, { x: -15, y:  25 }, { x: 75, y:  18 },
      { x:  30, y: -45 }, { x: 30, y: 45 }
    ];
    labelOffset = { x: 30, y: -58 }; valueOffset = { x: 30, y: 58 };
  }
  // --- AD620 INSTRUMENTATION AMPLIFIER ---
  else if (type === 'ic_ad620') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    // IN+, IN-
    lines.push({ points: [-15,-20, 0,-20] }); texts.push({ text: 'IN+', x: 2, y:-24, size: 7 });
    lines.push({ points: [-15, 20, 0, 20] }); texts.push({ text: 'IN-', x: 2, y: 16, size: 7 });
    // RG pins (top/bottom for external gain resistor)
    lines.push({ points: [30,-45,30,-55] }); texts.push({ text: 'RG1', x: 18, y:-51, size: 7 });
    lines.push({ points: [30, 45,30, 55] }); texts.push({ text: 'RG2', x: 18, y: 40, size: 7 });
    // REF, OUT
    lines.push({ points: [60, 20,75, 20] }); texts.push({ text: 'REF', x: 38, y: 16, size: 7 });
    lines.push({ points: [60,-20,75,-20] }); texts.push({ text: 'OUT', x: 38, y:-24, size: 7 });
    // VS+/VS- supply stubs inside body
    texts.push({ text: 'VS+', x: 21, y:-36, size: 7 }); texts.push({ text: 'VS-', x: 21, y: 26, size: 7 });
    texts.push({ text: 'AD620', x: 14, y: -4, size: 9, fill: '#333' });
    // G= annotation
    texts.push({ text: 'G=1+49k/Rg', x: 5, y: 8, size: 6, fill: '#888' });
    pins = [
      { x: -15, y: -20 }, { x: -15, y: 20 },
      { x:  30, y: -55 }, { x:  30, y: 55 },
      { x:  75, y:  20 }, { x:  75, y: -20 },
      { x:  30, y: -55 }, { x:  30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 }; valueOffset = { x: 30, y: 68 };
  }
  // --- NE566 VCO ---
  else if (type === 'ic_ne566') {
    paths.push({ data: "M 0 -40 L 60 -40 L 60 40 L 0 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" });
    // Left: MOD, R, C pins
    lines.push({ points: [-15,  0, 0,  0] }); texts.push({ text: 'MOD', x: 2, y: -4, size: 7 });
    lines.push({ points: [-15,-20, 0,-20] }); texts.push({ text: 'R',   x: 2, y:-24, size: 7 });
    lines.push({ points: [-15, 20, 0, 20] }); texts.push({ text: 'C',   x: 2, y: 16, size: 7 });
    // Right: SQ OUT, TRI OUT
    lines.push({ points: [60,-15,75,-15] }); texts.push({ text: 'SQ',  x: 38, y:-19, size: 7 });
    lines.push({ points: [60, 15,75, 15] }); texts.push({ text: 'TRI', x: 38, y: 11, size: 7 });
    // Sine wave visual inside body
    paths.push({ data: "M 18 2 Q 21 -5 24 2 T 30 2 T 36 2 T 42 2", fill: "transparent" });
    // Supply
    lines.push({ points: [30,-40,30,-50] }); texts.push({ text: 'VCC', x: 21, y:-36, size: 7 });
    lines.push({ points: [30, 40,30, 50] }); texts.push({ text: 'GND', x: 21, y: 28, size: 7 });
    texts.push({ text: 'NE566', x: 13, y:-14, size: 9, fill: '#333' });
    pins = [
      { x:  30, y:  50 }, // GND
      { x: -15, y:   0 }, // MODV
      { x:  75, y: -15 }, // SQOUT
      { x:  75, y:  15 }, // TRIOUT
      { x: -15, y: -20 }, // RTIM
      { x: -15, y:  20 }, // CTIM
      { x:  30, y: -50 }, // VCC
    ];
    labelOffset = { x: 30, y: -62 }; valueOffset = { x: 30, y: 62 };
  }
  // --- CD4017 JOHNSON DECADE COUNTER ---
  else if (type === 'ic_cd4017') {
    paths.push({ data: "M 0 -50 L 60 -50 L 60 50 L 0 50 Z", fill: "#fff" });
    paths.push({ data: "M 25 -50 A 5 5 0 0 0 35 -50", fill: "transparent" });
    // Left pins
    [['CLK',-35],['CLKINH',-20],['RST',-5]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number) - 4, size: 6 });
    });
    // Right pins Q0-Q4 + CO
    [['Q0',-35],['Q1',-22],['Q2',-9],['Q3',4],['Q4',17],['CO',30]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number) - 4, size: 7 });
    });
    lines.push({ points: [30,-50,30,-60] }); lines.push({ points: [30, 50,30, 60] });
    texts.push({ text: 'VDD', x: 21, y:-46, size: 7 }); texts.push({ text: 'VSS', x: 21, y: 38, size: 7 });
    texts.push({ text: 'CD4017', x: 10, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y: -35 }, { x: -15, y: -20 }, { x: -15, y: -5 },
      { x: 75, y: -35 }, { x: 75, y: -22 }, { x: 75, y: -9 },
      { x: 75, y:   4 }, { x: 75, y:  17 }, { x: 75, y:  30 },
      { x: 30, y: -60 }, { x: 30, y:  60 }
    ];
    labelOffset = { x: 30, y: -72 }; valueOffset = { x: 30, y: 72 };
  }
  // --- 4N35 OPTOCOUPLER ---
  else if (type === 'optocoupler_4n35') {
    // Outer box
    paths.push({ data: "M -28 -25 L 38 -25 L 38 25 L -28 25 Z", fill: "#fff" });
    // LED left side
    paths.push({ data: "M -18 -15 L -10 -7 L -18 1 Z", fill: strokeColor });
    lines.push({ points: [-10, -15, -10, 1] }); // Cathode bar
    lines.push({ points: [-38, -15, -18, -15] }); // Anode lead (A)
    lines.push({ points: [-38,   1, -10,   1] }); // Cathode lead (K)
    // Light arrows right
    paths.push({ data: "M -4 -13 L 4 -7 M 4 -7 L 1 -7 M 4 -7 L 4 -10", fill: "transparent" });
    paths.push({ data: "M -4 -9  L 4 -3 M 4 -3 L 1 -3 M 4 -3 L 4 -6",  fill: "transparent" });
    // Phototransistor right side
    lines.push({ points: [16, -15, 16, 15] }); // Base
    lines.push({ points: [16,  -10, 26, -14] }); // Collector angle
    lines.push({ points: [26, -14, 26, -25] }); // Collector lead (C)
    lines.push({ points: [16,  10, 26, 14] });  // Emitter angle
    lines.push({ points: [26, 14, 26, 25] });   // Emitter lead (E)
    paths.push({ data: "M 23 8 L 24 13 L 20 12 Z", fill: strokeColor }); // NPN arrow
    texts.push({ text: 'A', x: -36, y: -20, size: 8, fill: '#555' });
    texts.push({ text: 'K', x: -36, y:   4, size: 8, fill: '#555' });
    texts.push({ text: 'C', x:  28, y: -22, size: 8, fill: '#555' });
    texts.push({ text: 'E', x:  28, y:  16, size: 8, fill: '#555' });
    pins = [{ x: -38, y: -15 }, { x: -38, y: 1 }, { x: 26, y: -25 }, { x: 26, y: 25 }];
    labelOffset = { x: 40, y: -35 }; valueOffset = { x: 40, y: 35 };
  }
  // --- MOV VARISTOR ---
  else if (type === 'varistor') {
    // Resistor zigzag with diagonal bidirectional arrow
    lines.push({ points: [0, 0, 16.5, 0] });
    lines.push({ points: [16.5,0, 19.5,-5, 23.5,4, 28.5,-5, 32.5,4, 37.5,-5, 41.5,4, 43.5,0] });
    lines.push({ points: [43.5, 0, 60, 0] });
    paths.push({ data: "M 10 12 L 50 -12 M 47 -12 L 50 -12 L 50 -9 M 13 12 L 10 12 L 10 9", fill: "transparent" });
    texts.push({ text: 'MOV', x: 16, y: -16, size: 8, fill: '#f97316' });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }];
    labelOffset = { x: 15, y: -28 }; valueOffset = { x: 15, y: 18 };
  }
  // --- LM2596 BUCK CONVERTER ---
  else if (type === 'ic_lm2596') {
    paths.push({ data: "M 0 -35 L 60 -35 L 60 35 L 0 35 Z", fill: "#fff" });
    paths.push({ data: "M 25 -35 A 5 5 0 0 0 35 -35", fill: "transparent" });
    lines.push({ points: [-15,-20, 0,-20] }); texts.push({ text: 'VIN',    x: 2, y:-24, size: 7 });
    lines.push({ points: [-15, 20, 0, 20] }); texts.push({ text: 'ON/OFF', x: 2, y: 16, size: 6 });
    lines.push({ points: [ 60,-20,75,-20] }); texts.push({ text: 'VOUT',   x: 37, y:-24, size: 7 });
    lines.push({ points: [ 60, 20,75, 20] }); texts.push({ text: 'FB',     x: 40, y: 16, size: 7 });
    lines.push({ points: [ 30, 35,30, 45] }); texts.push({ text: 'GND',    x: 21, y: 28, size: 7 });
    // Buck arrow inside
    paths.push({ data: "M 15 0 L 45 0 M 40 -4 L 45 0 L 40 4", fill: "transparent" });
    texts.push({ text: 'LM2596', x: 10, y:-14, size: 8, fill: '#333' });
    texts.push({ text: 'BUCK', x: 16, y: -4, size: 9, fill: '#333' });
    pins = [{ x: -15, y: -20 }, { x: 75, y: -20 }, { x: 75, y: 20 }, { x: -15, y: 20 }, { x: 30, y: 45 }];
    labelOffset = { x: 30, y: -48 }; valueOffset = { x: 30, y: 58 };
  }
  // --- IR2110 GATE DRIVER ---
  else if (type === 'ic_ir2110') {
    paths.push({ data: "M 0 -45 L 60 -45 L 60 45 L 0 45 Z", fill: "#fff" });
    paths.push({ data: "M 25 -45 A 5 5 0 0 0 35 -45", fill: "transparent" });
    [['HIN',-30],['LIN',-15],['SD',0],['VDD',15]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number)-4, size: 7 });
    });
    [['HO',-30],['VS',-15],['VB',0],['LO',15]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number)-4, size: 7 });
    });
    lines.push({ points: [30,-45,30,-55] }); texts.push({ text: 'VCC', x: 21, y:-41, size: 7 });
    lines.push({ points: [30, 45,30, 55] }); texts.push({ text: 'COM', x: 21, y: 33, size: 7 });
    texts.push({ text: 'IR2110', x: 10, y: -4, size: 9, fill: '#333' });
    pins = [
      { x: -15, y:-30 }, { x:-15, y:-15 }, { x:-15, y:0 }, { x:-15, y:15 },
      { x:  75, y:-30 }, { x: 75, y:-15 }, { x: 75, y:0 }, { x: 75, y:15 },
      { x:  30, y:-55 }, { x: 30, y: 55 }
    ];
    labelOffset = { x: 30, y: -68 }; valueOffset = { x: 30, y: 68 };
  }
  // --- ACS712 CURRENT SENSOR ---
  else if (type === 'ic_acs712') {
    paths.push({ data: "M 0 -35 L 60 -35 L 60 35 L 0 35 Z", fill: "#fff" });
    paths.push({ data: "M 25 -35 A 5 5 0 0 0 35 -35", fill: "transparent" });
    lines.push({ points: [-15,-15, 0,-15] }); texts.push({ text: 'IP+',  x: 2, y:-19, size: 7 });
    lines.push({ points: [-15, 15, 0, 15] }); texts.push({ text: 'IP-',  x: 2, y: 11, size: 7 });
    lines.push({ points: [ 60,  0,75,  0] }); texts.push({ text: 'VOUT', x: 38, y: -4, size: 7 });
    lines.push({ points: [ 30,-35,30,-45] }); texts.push({ text: 'VCC',  x: 21, y:-31, size: 7 });
    lines.push({ points: [ 30, 35,30, 45] }); texts.push({ text: 'GND',  x: 21, y: 24, size: 7 });
    // Hall sensor symbol (H in a circle)
    circles.push({ x: 30, y: 0, r: 10, fill: "#f0f9ff" });
    texts.push({ text: 'H', x: 26, y: -4, size: 10, fill: '#0ea5e9' });
    texts.push({ text: 'ACS712', x: 9, y:-24, size: 7, fill: '#333' });
    pins = [{ x:-15,y:-15 }, { x:-15,y:15 }, { x:75,y:0 }, { x:30,y:-45 }, { x:30,y:45 }];
    labelOffset = { x: 30, y: -58 }; valueOffset = { x: 30, y: 58 };
  }
  // --- LM567 TONE DECODER ---
  else if (type === 'ic_lm567') {
    paths.push({ data: "M 0 -38 L 60 -38 L 60 38 L 0 38 Z", fill: "#fff" });
    paths.push({ data: "M 25 -38 A 5 5 0 0 0 35 -38", fill: "transparent" });
    lines.push({ points: [-15,-20, 0,-20] }); texts.push({ text: 'C1',  x: 2, y:-24, size: 7 });
    lines.push({ points: [-15,  0, 0,  0] }); texts.push({ text: 'IN',  x: 2, y: -4, size: 7 });
    lines.push({ points: [-15, 20, 0, 20] }); texts.push({ text: 'C2',  x: 2, y: 16, size: 7 });
    lines.push({ points: [ 60,-15,75,-15] }); texts.push({ text: 'OUT', x: 38, y:-19, size: 7 });
    lines.push({ points: [ 60, 15,75, 15] }); texts.push({ text: 'R',   x: 40, y: 11, size: 7 });
    lines.push({ points: [ 30,-38,30,-48] }); texts.push({ text: 'VCC', x: 21, y:-34, size: 7 });
    lines.push({ points: [ 30, 38,30, 48] }); texts.push({ text: 'GND', x: 21, y: 27, size: 7 });
    // PLL symbol
    texts.push({ text: 'PLL', x: 20, y: -8, size: 10, fill: '#7c3aed' });
    texts.push({ text: 'LM567', x: 13, y: -28, size: 8, fill: '#333' });
    pins = [{ x:75,y:-15 }, { x:30,y:-48 }, { x:-15,y:0 }, { x:30,y:48 }, { x:-15,y:-20 }, { x:-15,y:20 }, { x:75,y:15 }];
    labelOffset = { x: 30, y: -60 }; valueOffset = { x: 30, y: 60 };
  }
  // --- CD4051 8-CHANNEL ANALOG MUX ---
  else if (type === 'ic_cd4051') {
    paths.push({ data: "M 0 -50 L 60 -50 L 60 50 L 0 50 Z", fill: "#fff" });
    paths.push({ data: "M 25 -50 A 5 5 0 0 0 35 -50", fill: "transparent" });
    [['A',-35],['B',-20],['C',-5],['INH',10]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number)-4, size: 7 });
    });
    // Z common pin (right middle)
    lines.push({ points: [60, 0,75, 0] }); texts.push({ text: 'Z', x: 40, y: -4, size: 8 });
    // Y0-Y3 channel pins
    [['Y0',-35],['Y1',-22],['Y2',-9],['Y3',4]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number)-4, size: 7 });
    });
    lines.push({ points: [30,-50,30,-60] }); texts.push({ text: 'VDD', x: 21, y:-46, size: 7 });
    lines.push({ points: [30, 50,30, 60] }); texts.push({ text: 'VSS', x: 21, y: 38, size: 7 });
    texts.push({ text: 'CD4051', x: 8, y: -4, size: 9, fill: '#333' });
    texts.push({ text: '8-MUX', x: 11, y: 7, size: 8, fill: '#666' });
    pins = [
      { x:-15,y:-35 }, { x:-15,y:-20 }, { x:-15,y:-5 }, { x:-15,y:10 },
      { x: 75,y:  0 },
      { x: 75,y:-35 }, { x:75,y:-22 }, { x:75,y:-9 }, { x:75,y:4 },
      { x: 30,y:-60 }, { x:30,y: 60 }
    ];
    labelOffset = { x: 30, y: -72 }; valueOffset = { x: 30, y: 72 };
  }
  // --- 74HC32 QUAD OR GATE ---
  else if (type === 'ic_74hc32') {
    // OR gate body (same shape as logic_or2)
    paths.push({ data: "M 5 -15 Q 15 -15 20 -15 Q 40 -15 45 0 Q 40 15 20 15 Q 15 15 5 15 Q 12 8 12 0 Q 12 -8 5 -15 Z", fill: "#fff" });
    lines.push({ points: [0,-10, 9,-10] }); // A
    lines.push({ points: [0, 10, 9, 10] }); // B
    lines.push({ points: [45, 0,55,  0] }); // Y
    lines.push({ points: [25, 15,25, 25] }); // GND stub
    texts.push({ text: '≥1', x: 14, y: -6, size: 10, fill: '#333' });
    texts.push({ text: 'GND', x: 28, y: 22, size: 7, fill: '#666' });
    pins = [{ x:0,y:-10 }, { x:0,y:10 }, { x:55,y:0 }, { x:25,y:25 }];
    labelOffset = { x: 5, y: -25 }; valueOffset = { x: 5, y: 35 };
  }
  // --- TCA9548A I2C MULTIPLEXER ---
  else if (type === 'ic_tca9548') {
    paths.push({ data: "M 0 -40 L 60 -40 L 60 40 L 0 40 Z", fill: "#fff" });
    paths.push({ data: "M 25 -40 A 5 5 0 0 0 35 -40", fill: "transparent" });
    [['SDA',-20],['SCL',-5],['/RST',10]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number)-4, size: 7 });
    });
    [['SD0',-35],['SC0',-22],['SD1',-9],['SC1',4]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 40, y: (y as number)-4, size: 7 });
    });
    lines.push({ points: [30,-40,30,-50] }); texts.push({ text: 'VCC', x: 21, y:-36, size: 7 });
    lines.push({ points: [30, 40,30, 50] }); texts.push({ text: 'GND', x: 21, y: 28, size: 7 });
    texts.push({ text: 'I2C-MUX', x: 6, y: -14, size: 8, fill: '#333' });
    texts.push({ text: 'TCA9548', x: 7, y: -4,  size: 8, fill: '#333' });
    pins = [
      { x:-15,y:-20 }, { x:-15,y:-5 }, { x:-15,y:10 },
      { x:75,y:-35 }, { x:75,y:-22 }, { x:75,y:-9 }, { x:75,y:4 },
      { x:30,y:-50 }, { x:30,y: 50 }
    ];
    labelOffset = { x: 30, y: -62 }; valueOffset = { x: 30, y: 62 };
  }
  // --- ATMEGA328P MCU ---
  else if (type === 'ic_atmega328') {
    paths.push({ data: "M 0 -50 L 60 -50 L 60 50 L 0 50 Z", fill: "#eef2ff" });
    paths.push({ data: "M 25 -50 A 5 5 0 0 0 35 -50", fill: "transparent" });
    // Left: RESET, RX, TX, SDA, SCL
    [['RST',-30],['RX',-15],['TX',0],['SDA',15],['SCL',30]].forEach(([lbl, y]) => {
      lines.push({ points: [-15, y as number, 0, y as number] });
      texts.push({ text: lbl as string, x: 2, y: (y as number)-4, size: 7 });
    });
    // Right: MOSI, MISO, SCK
    [['MOSI',-30],['MISO',-15],['SCK',0]].forEach(([lbl, y]) => {
      lines.push({ points: [60, y as number, 75, y as number] });
      texts.push({ text: lbl as string, x: 37, y: (y as number)-4, size: 7 });
    });
    // Supply
    lines.push({ points: [30,-50,30,-60] }); texts.push({ text: 'VCC', x: 21, y:-46, size: 7 });
    lines.push({ points: [30, 50,30, 60] }); texts.push({ text: 'GND', x: 21, y: 38, size: 7 });
    texts.push({ text: 'ATmega', x: 12, y:-10, size: 9, fill: '#1d4ed8' });
    texts.push({ text: '328P',   x: 17, y:  2, size: 9, fill: '#1d4ed8' });
    // Arduino logo hint
    texts.push({ text: '⚡AVR', x: 14, y: 13, size: 7, fill: '#64748b' });
    pins = [
      { x:30,y:-60 }, { x:30,y: 60 },
      { x:-15,y:-30 }, { x:-15,y:-15 }, { x:-15,y:0 }, { x:-15,y:15 }, { x:-15,y:30 },
      { x: 75,y:-30 }, { x: 75,y:-15 }, { x: 75,y:  0 }
    ];
    labelOffset = { x: 30, y: -72 }; valueOffset = { x: 30, y: 72 };
  }
  // ── BATCH 5 ──────────────────────────────────────────────────────────────
  else if (type === 'triac') {
    lines.push({ points: [20, -25, 20,  25] });
    lines.push({ points: [ 0, -25, 20, -25] });
    lines.push({ points: [ 0,  25, 20,  25] });
    lines.push({ points: [20, -25, 40,   0] });
    lines.push({ points: [20,  25, 40,   0] });
    lines.push({ points: [40, -25, 20,   0] });
    lines.push({ points: [40,  25, 20,   0] });
    lines.push({ points: [40,   0, 60,   0] });
    lines.push({ points: [20,  15,-25,  15] });
    texts.push({ text: 'G', x: -30, y: 10, size: 9 });
    pins = [{ x: 0, y: 25 }, { x: 0, y: -25 }, { x: -25, y: 15 }];
    labelOffset = { x: 20, y: -40 }; valueOffset = { x: 20, y: 40 };
  }
  else if (type === 'diac') {
    lines.push({ points: [15, -20, 15,  20] });
    lines.push({ points: [ 0, -20, 15, -20] });
    lines.push({ points: [ 0,  20, 15,  20] });
    paths.push({ data: 'M 15 -20 L 35 0 L 15 0 Z', fill: '#333' });
    paths.push({ data: 'M 15 20 L 35 0 L 15 0 Z', fill: '#333' });
    lines.push({ points: [35, -5, 35, 5] });
    lines.push({ points: [35,  0, 50, 0] });
    pins = [{ x: 0, y: -20 }, { x: 0, y: 20 }];
    labelOffset = { x: 30, y: -35 }; valueOffset = { x: 30, y: 35 };
  }
  else if (type === 'igbt_n') {
    lines.push({ points: [ 0,  0, 12,  0] });
    lines.push({ points: [12,-20, 12, 20] });
    lines.push({ points: [16,-15, 16, 15] });
    lines.push({ points: [16,-10, 30,-10] });
    lines.push({ points: [16, 10, 30, 10] });
    lines.push({ points: [30,-10, 40,-30] });
    lines.push({ points: [30, 10, 40, 30] });
    lines.push({ points: [40,-30, 60,-30] });
    lines.push({ points: [40, 30, 60, 30] });
    paths.push({ data: 'M 34 22 L 30 10 L 26 18 Z', fill: '#333' });
    paths.push({ data: 'M 46 -24 L 54 -24 L 50 -18 Z', fill: '#333' });
    lines.push({ points: [50,-30, 50,-18] });
    lines.push({ points: [50,-18, 50,-10] });
    lines.push({ points: [47,-24, 53,-24] });
    texts.push({ text: 'G', x: -10, y: -5, size: 9 });
    texts.push({ text: 'C', x:  62, y: -35, size: 9 });
    texts.push({ text: 'E', x:  62, y:  25, size: 9 });
    pins = [{ x: 0, y: 0 }, { x: 60, y: -30 }, { x: 60, y: 30 }];
    labelOffset = { x: 30, y: -50 }; valueOffset = { x: 30, y: 50 };
  }
  else if (type === 'photo_resistor') {
    lines.push({ points: [ 0, 0, 15,  0] });
    lines.push({ points: [35, 0, 50,  0] });
    lines.push({ points: [18,-18, 22,-12] });
    lines.push({ points: [22,-12, 26,-18] });
    lines.push({ points: [26,-18, 30,-12] });
    lines.push({ points: [28,-18, 28,-22] });
    lines.push({ points: [30,-22, 28,-18] });
    rects.push({ x: 15, y: -8, width: 20, height: 16, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'LDR', x: 16, y: -3, size: 8 });
    pins = [{ x: 0, y: 0 }, { x: 50, y: 0 }];
    labelOffset = { x: 25, y: -30 }; valueOffset = { x: 25, y: 20 };
  }
  else if (type === 'ic_lm311') {
    paths.push({ data: 'M 5 -30 L 5 30 L 55 0 Z', fill: '#fff', stroke: '#333' });
    lines.push({ points: [ 0,-10,  5,-10] });
    lines.push({ points: [ 0, 10,  5, 10] });
    lines.push({ points: [55,  0, 60,  0] });
    lines.push({ points: [30,-30, 30,-35] });
    lines.push({ points: [30, 30, 30, 35] });
    texts.push({ text: '+', x:  8, y: -14, size: 11 });
    texts.push({ text: '\u2212', x:  8, y:   6, size: 11 });
    circles.push({ x: 62, y: 0, r: 3, fill: '#fff', stroke: '#333' });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 65, y: 0 }, { x: 30, y: -35 }, { x: 30, y: 35 }, { x: 50, y: 35 }];
    labelOffset = { x: 30, y: -45 }; valueOffset = { x: 30, y: 45 };
  }
  else if (type === 'ic_l298n') {
    rects.push({ x: 0, y: -65, width: 70, height: 130, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'L298N', x: 14, y: -6, size: 10 });
    texts.push({ text: 'H-Bridge', x: 10, y: 8, size: 8 });
    ([['IN1',-40],['IN2',-25],['ENA',-10],['IN3',5],['IN4',20],['ENB',35]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['OUT1',-35],['OUT2',-20],['OUT3',5],['OUT4',20]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-65, 35,-75] });
    lines.push({ points: [55, 65, 55, 75] });
    lines.push({ points: [35, 65, 35, 75] });
    texts.push({ text: 'VCC', x: 20, y: -77, size: 8 });
    texts.push({ text: 'VSS', x: 20, y:  80, size: 8 });
    texts.push({ text: 'GND', x: 42, y:  80, size: 8 });
    pins = [
      { x: -15, y: -40 }, { x: -15, y: -25 }, { x: -15, y: -10 },
      { x: -15, y:   5 }, { x: -15, y:  20 }, { x: -15, y:  35 },
      { x:  85, y: -35 }, { x:  85, y: -20 }, { x:  85, y:   5 }, { x:  85, y:  20 },
      { x:  35, y: -75 }, { x:  35, y:  75 }, { x:  55, y:  75 },
    ];
    labelOffset = { x: 35, y: -90 }; valueOffset = { x: 35, y: 90 };
  }
  else if (type === 'ic_74hc08') {
    paths.push({ data: 'M 5 -20 L 5 20 Q 40 20 40 0 Q 40 -20 5 -20 Z', fill: '#fff', stroke: '#333' });
    lines.push({ points: [ 0,-10,  5,-10] });
    lines.push({ points: [ 0, 10,  5, 10] });
    lines.push({ points: [40,  0, 55,  0] });
    lines.push({ points: [25, 20, 25, 28] });
    texts.push({ text: 'GND', x: 12, y: 30, size: 8 });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 28 }];
    labelOffset = { x: 25, y: -32 }; valueOffset = { x: 25, y: 35 };
  }
  else if (type === 'ic_74hc00') {
    paths.push({ data: 'M 5 -20 L 5 20 Q 40 20 40 0 Q 40 -20 5 -20 Z', fill: '#fff', stroke: '#333' });
    circles.push({ x: 43, y: 0, r: 3, fill: '#fff', stroke: '#333' });
    lines.push({ points: [ 0,-10,  5,-10] });
    lines.push({ points: [ 0, 10,  5, 10] });
    lines.push({ points: [46,  0, 55,  0] });
    lines.push({ points: [25, 20, 25, 28] });
    texts.push({ text: 'GND', x: 12, y: 30, size: 8 });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 28 }];
    labelOffset = { x: 25, y: -32 }; valueOffset = { x: 25, y: 35 };
  }
  else if (type === 'ic_ds18b20') {
    paths.push({ data: 'M 10 -20 L 10 20 Q 45 20 45 0 Q 45 -20 10 -20 Z', fill: '#fff', stroke: '#333' });
    texts.push({ text: 'DS18B20', x: 11, y: -4, size: 7 });
    texts.push({ text: '1-Wire',  x: 13, y:  6, size: 7 });
    lines.push({ points: [ 0, 30, 22, 30] });
    lines.push({ points: [45,  0, 60,  0] });
    lines.push({ points: [ 0,-30, 22,-30] });
    texts.push({ text: 'GND', x:  1, y:  35, size: 8 });
    texts.push({ text: 'DQ',  x: 48, y:  -5, size: 8 });
    texts.push({ text: 'VDD', x:  1, y: -40, size: 8 });
    pins = [{ x: 0, y: 30 }, { x: 60, y: 0 }, { x: 0, y: -30 }];
    labelOffset = { x: 28, y: -45 }; valueOffset = { x: 28, y: 48 };
  }
  else if (type === 'ic_sg3525') {
    rects.push({ x: 0, y: -65, width: 70, height: 130, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'SG3525',   x: 14, y: -6, size: 10 });
    texts.push({ text: 'PWM CTRL', x: 10, y:  8, size: 7 });
    ([['INV',-40],['NINV',-25],['SYNC',-10],['OSC',5],['SD',20],['SS',35]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['OUT-A',-35],['OUT-B',-20],['VREF',20]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 48, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-65, 35,-75] });
    lines.push({ points: [35, 65, 35, 75] });
    texts.push({ text: 'VCC', x: 20, y: -77, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  80, size: 8 });
    pins = [
      { x: -15, y: -40 }, { x: -15, y: -25 }, { x: -15, y: -10 },
      { x: -15, y:   5 }, { x: -15, y:  20 }, { x: -15, y:  35 },
      { x:  85, y: -35 }, { x:  85, y: -20 },
      { x:  35, y: -75 }, { x:  35, y:  75 },
      { x:  85, y:  20 },
    ];
    labelOffset = { x: 35, y: -90 }; valueOffset = { x: 35, y: 90 };
  }
  // ── BATCH 6 ──────────────────────────────────────────────────────────────
  else if (type === 'tunnel_diode') {
    // Tunnel diode: diode triangle + T-bar on cathode
    paths.push({ data: 'M 20 0 L 36 -12 L 36 12 Z', fill: '#333' });
    lines.push({ points: [36, -12, 36, 12] });
    lines.push({ points: [36,  -5, 36,  5] }); // extra tick marks (T-bar)
    lines.push({ points: [ 0,   0, 20,  0] });
    lines.push({ points: [36,   0, 55,  0] });
    pins = [{ x: 0, y: 0 }, { x: 55, y: 0 }];
    labelOffset = { x: 27, y: -22 }; valueOffset = { x: 27, y: 18 };
  }
  else if (type === 'ic_74hc04') {
    // Single inverter: triangle + bubble
    paths.push({ data: 'M 5 -18 L 5 18 L 38 0 Z', fill: '#fff', stroke: '#333' });
    circles.push({ x: 41, y: 0, r: 3, fill: '#fff', stroke: '#333' });
    lines.push({ points: [ 0,  0,  5,  0] });
    lines.push({ points: [44,  0, 55,  0] });
    lines.push({ points: [25, 18, 25, 26] });
    texts.push({ text: 'GND', x: 12, y: 28, size: 8 });
    pins = [{ x: 0, y: 0 }, { x: 55, y: 0 }, { x: 25, y: 26 }];
    labelOffset = { x: 25, y: -30 }; valueOffset = { x: 25, y: 35 };
  }
  else if (type === 'ic_74hc138') {
    // 74HC138 — wide IC box, 6 inputs left, 8 outputs right
    rects.push({ x: 0, y: -75, width: 70, height: 150, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC138', x: 10, y: -6, size: 9 });
    texts.push({ text: '3-8 DEC',  x: 12, y:  6, size: 8 });
    ([['A',-45],['B',-30],['C',-15],['G1',0],['/G2A',15],['/G2B',30]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['Y0',-45],['Y1',-30],['Y2',-15],['Y3',0],['Y4',15],['Y5',30],['Y6',45],['Y7',60]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35, -75, 35, -85] });
    lines.push({ points: [35,  75, 35,  85] });
    texts.push({ text: 'VCC', x: 20, y: -87, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  90, size: 8 });
    pins = [
      { x: -15, y: -45 }, { x: -15, y: -30 }, { x: -15, y: -15 },
      { x: -15, y:   0 }, { x: -15, y:  15 }, { x: -15, y:  30 },
      { x:  85, y: -45 }, { x:  85, y: -30 }, { x:  85, y: -15 }, { x:  85, y:   0 },
      { x:  85, y:  15 }, { x:  85, y:  30 }, { x:  85, y:  45 }, { x:  85, y:  60 },
      { x:  35, y: -85 }, { x:  35, y:  85 },
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 100 };
  }
  else if (type === 'ic_74hc148') {
    // 74HC148 — 8-input priority encoder
    rects.push({ x: 0, y: -75, width: 70, height: 165, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC148', x: 10, y: -6, size: 9 });
    texts.push({ text: '8-3 ENC',  x: 12, y:  6, size: 8 });
    ([['I0',-40],['I1',-25],['I2',-10],['I3',5],['I4',20],['I5',35],['I6',50],['I7',65],['EI',80]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['A0',-25],['A1',-10],['A2',5],['GS',20],['EO',35]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35, -75, 35, -85] });
    lines.push({ points: [35,  90, 35, 100] });
    texts.push({ text: 'VCC', x: 20, y: -87, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 105, size: 8 });
    pins = [
      { x: -15, y: -40 }, { x: -15, y: -25 }, { x: -15, y: -10 }, { x: -15, y:  5 },
      { x: -15, y:  20 }, { x: -15, y:  35 }, { x: -15, y:  50 }, { x: -15, y:  65 },
      { x: -15, y:  80 },
      { x:  85, y: -25 }, { x:  85, y: -10 }, { x:  85, y:   5 }, { x:  85, y:  20 }, { x:  85, y:  35 },
      { x:  35, y: -85 }, { x:  35, y: 100 },
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 115 };
  }
  else if (type === 'ic_ne5534') {
    // NE5534 — op-amp triangle with COMP pin
    paths.push({ data: 'M 5 -30 L 5 30 L 55 0 Z', fill: '#fff', stroke: '#333' });
    lines.push({ points: [ 0,-10,  5,-10] });
    lines.push({ points: [ 0, 10,  5, 10] });
    lines.push({ points: [55,  0, 60,  0] });
    lines.push({ points: [30,-30, 30,-35] });
    lines.push({ points: [30, 30, 30, 35] });
    lines.push({ points: [10,-30, 10,-38] }); // COMP pin
    texts.push({ text: '+',    x:  8, y: -14, size: 11 });
    texts.push({ text: '\u2212', x:  8, y:   6, size: 11 });
    texts.push({ text: 'COMP', x:  1, y: -48, size: 7 });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 60, y: 0 }, { x: 30, y: -35 }, { x: 30, y: 35 }, { x: 10, y: -38 }];
    labelOffset = { x: 30, y: -50 }; valueOffset = { x: 30, y: 50 };
  }
  else if (type === 'ic_lm337') {
    // LM337 — 3-pin voltage regulator (mirror of LM317 but for negative)
    rects.push({ x: 10, y: -18, width: 40, height: 36, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'LM337', x: 12, y: -5, size: 9 });
    texts.push({ text: 'NEG REG', x: 10, y:  7, size: 7 });
    lines.push({ points: [ 0,  0, 10,  0] }); // IN
    lines.push({ points: [50,  0, 60,  0] }); // OUT
    lines.push({ points: [30, 18, 30, 35] }); // ADJ
    texts.push({ text: 'IN',  x: -15, y: -4, size: 8 });
    texts.push({ text: 'OUT', x:  62, y: -4, size: 8 });
    texts.push({ text: 'ADJ', x:  20, y:  38, size: 8 });
    pins = [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 30, y: 35 }];
    labelOffset = { x: 30, y: -32 }; valueOffset = { x: 30, y: 50 };
  }
  else if (type === 'ic_max7219') {
    // MAX7219 — IC box with SPI pins
    rects.push({ x: 0, y: -45, width: 70, height: 90, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'MAX7219', x: 8, y: -5, size: 9 });
    texts.push({ text: 'LED DRV', x: 10, y:  7, size: 8 });
    ([['DIN',-25],['CLK',-10],['CS',5]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [70,-25, 85,-25] });
    texts.push({ text: 'DOUT', x: 48, y: -32, size: 8 });
    lines.push({ points: [35,-45, 35,-55] });
    lines.push({ points: [35, 45, 35, 55] });
    texts.push({ text: 'VCC', x: 20, y: -57, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  60, size: 8 });
    pins = [
      { x: -15, y: -25 }, { x: -15, y: -10 }, { x: -15, y:  5 },
      { x:  85, y: -25 }, { x:  35, y: -55 }, { x:  35, y:  55 },
    ];
    labelOffset = { x: 35, y: -70 }; valueOffset = { x: 35, y: 70 };
  }
  else if (type === 'ic_cd4060') {
    // CD4060 — counter IC box
    rects.push({ x: 0, y: -75, width: 70, height: 150, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'CD4060', x: 10, y: -6, size: 9 });
    texts.push({ text: 'OSC+CTR', x: 8, y:  6, size: 7 });
    ([['OSC1',-30],['OSC2',-15],['RST',0]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['Q4',-45],['Q5',-30],['Q6',-15],['Q7',0],['Q8',15],['Q9',30],['Q10',45],['Q14',60]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-75, 35,-85] });
    lines.push({ points: [35, 75, 35, 85] });
    texts.push({ text: 'VDD', x: 20, y: -87, size: 8 });
    texts.push({ text: 'VSS', x: 20, y:  90, size: 8 });
    pins = [
      { x: -15, y: -30 }, { x: -15, y: -15 }, { x: -15, y:   0 },
      { x:  85, y: -45 }, { x:  85, y: -30 }, { x:  85, y: -15 }, { x:  85, y:   0 },
      { x:  85, y:  15 }, { x:  85, y:  30 }, { x:  85, y:  45 }, { x:  85, y:  60 },
      { x:  35, y: -85 }, { x:  35, y:  85 },
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 100 };
  }
  else if (type === 'ic_mcp3208') {
    // MCP3208 — wide IC box, 8 analog in left, SPI right
    rects.push({ x: 0, y: -75, width: 70, height: 150, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'MCP3208', x: 8, y: -6, size: 9 });
    texts.push({ text: '12b ADC', x: 10, y:  6, size: 8 });
    ([['CH0',-50],['CH1',-35],['CH2',-20],['CH3',-5],['CH4',10],['CH5',25],['CH6',40],['CH7',55]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['CS',-50],['DIN',-35],['DOUT',-20],['CLK',-5],['VREF',20]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 48, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-75, 35,-85] });
    lines.push({ points: [35, 75, 35, 85] });
    lines.push({ points: [55, 75, 55, 85] });
    texts.push({ text: 'VDD',  x: 20, y: -87, size: 8 });
    texts.push({ text: 'AGND', x: 20, y:  90, size: 8 });
    texts.push({ text: 'DGND', x: 42, y:  90, size: 8 });
    pins = [
      { x: -15, y: -50 }, { x: -15, y: -35 }, { x: -15, y: -20 }, { x: -15, y:  -5 },
      { x: -15, y:  10 }, { x: -15, y:  25 }, { x: -15, y:  40 }, { x: -15, y:  55 },
      { x:  85, y: -50 }, { x:  85, y: -35 }, { x:  85, y: -20 }, { x:  85, y:  -5 },
      { x:  85, y:  20 }, { x:  35, y: -85 }, { x:  35, y:  85 }, { x:  55, y:  85 },
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 100 };
  }
  // -- BATCH 7 --
  else if (type === 'npn_darlington') {
    // NPN Darlington: double BJT arrow on emitter
    lines.push({ points: [20,-20, 20, 20] });
    lines.push({ points: [20,-15, 30,-20] });
    lines.push({ points: [30,-20, 30,-30] });
    lines.push({ points: [20, 15, 30, 20] });
    lines.push({ points: [30, 20, 30, 30] });
    lines.push({ points: [ 0,  0, 20,  0] });
    paths.push({ data: 'M 26 16 L 30 20 L 22 20 Z', fill: '#333' });
    paths.push({ data: 'M 23 11 L 27 15 L 19 15 Z', fill: '#333' });
    lines.push({ points: [16,-12, 16, 12] });
    texts.push({ text: 'B', x: -10, y: -5, size: 9 });
    texts.push({ text: 'C', x:  32, y: -32, size: 9 });
    texts.push({ text: 'E', x:  32, y:  25, size: 9 });
    pins = [{ x: 0, y: 0 }, { x: 30, y: -30 }, { x: 30, y: 30 }];
    labelOffset = { x: 15, y: -45 }; valueOffset = { x: 15, y: 45 };
  }
  else if (type === 'pnp_darlington') {
    // PNP Darlington: arrows pointing into base
    lines.push({ points: [20,-20, 20, 20] });
    lines.push({ points: [20,-15, 30,-20] });
    lines.push({ points: [30,-20, 30,-30] });
    lines.push({ points: [20, 15, 30, 20] });
    lines.push({ points: [30, 20, 30, 30] });
    lines.push({ points: [ 0,  0, 20,  0] });
    paths.push({ data: 'M 24 -16 L 20 -15 L 22 -10 Z', fill: '#333' });
    paths.push({ data: 'M 21 -11 L 17 -10 L 19 -5 Z', fill: '#333' });
    lines.push({ points: [16,-12, 16, 12] });
    texts.push({ text: 'B', x: -10, y: -5, size: 9 });
    texts.push({ text: 'E', x:  32, y: -32, size: 9 });
    texts.push({ text: 'C', x:  32, y:  25, size: 9 });
    pins = [{ x: 0, y: 0 }, { x: 30, y: 30 }, { x: 30, y: -30 }];
    labelOffset = { x: 15, y: -45 }; valueOffset = { x: 15, y: 45 };
  }
  else if (type === 'ic_lm35') {
    // LM35: TO-92 style half-circle + 3 pins
    paths.push({ data: 'M 10 -18 L 10 18 Q 42 18 42 0 Q 42 -18 10 -18 Z', fill: '#fff', stroke: '#333' });
    texts.push({ text: 'LM35', x: 12, y: -4, size: 9 });
    texts.push({ text: '10mV/C', x: 10, y:  6, size: 7 });
    lines.push({ points: [ 0,-25, 18,-25] });
    lines.push({ points: [42,  0, 60,  0] });
    lines.push({ points: [ 0, 25, 18, 25] });
    texts.push({ text: 'VCC', x:  1, y: -35, size: 8 });
    texts.push({ text: 'OUT', x: 48, y:  -5, size: 8 });
    texts.push({ text: 'GND', x:  1, y:  30, size: 8 });
    pins = [{ x: 0, y: -25 }, { x: 60, y: 0 }, { x: 0, y: 25 }];
    labelOffset = { x: 26, y: -40 }; valueOffset = { x: 26, y: 42 };
  }
  else if (type === 'hall_sensor') {
    // Hall sensor: rectangle with H label
    rects.push({ x: 5, y: -20, width: 40, height: 40, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'HALL', x: 8, y: -4, size: 9 });
    texts.push({ text: 'A3144', x: 6, y:  6, size: 7 });
    lines.push({ points: [ 0,-20, 5, -20] });
    lines.push({ points: [ 0, 20, 5,  20] });
    lines.push({ points: [45,  0, 60,  0] });
    texts.push({ text: 'VCC', x: -20, y: -25, size: 8 });
    texts.push({ text: 'GND', x: -20, y:  17, size: 8 });
    texts.push({ text: 'OUT', x:  48, y:  -5, size: 8 });
    pins = [{ x: 0, y: -20 }, { x: 0, y: 20 }, { x: 60, y: 0 }];
    labelOffset = { x: 25, y: -35 }; valueOffset = { x: 25, y: 35 };
  }
  else if (type === 'ic_74hc573') {
    rects.push({ x: 0, y: -80, width: 70, height: 190, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC573', x: 8, y: -5, size: 9 });
    texts.push({ text: 'D LATCH', x: 10, y:  6, size: 7 });
    ([['D0',-50],['D1',-35],['D2',-20],['D3',-5],['D4',10],['D5',25],['D6',40],['D7',55],['LE',70],['/OE',85]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['Q0',-50],['Q1',-35],['Q2',-20],['Q3',-5],['Q4',10],['Q5',25],['Q6',40],['Q7',55]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-80, 35,-90] });
    lines.push({ points: [35,110, 35,120] });
    texts.push({ text: 'VCC', x: 20, y: -92, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 125, size: 8 });
    pins = [
      { x:-15,y:-50},{x:-15,y:-35},{x:-15,y:-20},{x:-15,y:-5},{x:-15,y:10},{x:-15,y:25},{x:-15,y:40},{x:-15,y:55},
      {x:-15,y:70},{x:-15,y:85},
      {x:85,y:-50},{x:85,y:-35},{x:85,y:-20},{x:85,y:-5},{x:85,y:10},{x:85,y:25},{x:85,y:40},{x:85,y:55},
      {x:35,y:-90},{x:35,y:120},
    ];
    labelOffset = { x: 35, y: -105 }; valueOffset = { x: 35, y: 135 };
  }
  else if (type === 'ic_74hc165') {
    rects.push({ x: 0, y: -75, width: 70, height: 155, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC165', x: 8, y: -5, size: 9 });
    texts.push({ text: 'PISO', x: 14, y:  6, size: 8 });
    ([['PL',-45],['CLK',-30],['CE',-15],['SER',0],['A',15],['B',30],['C',45],['D',60]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['E',60],['F',45],['G',30],['H',15],['QH',-30],['/QH',-45]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-75, 35,-85] });
    lines.push({ points: [35, 80, 35, 90] });
    texts.push({ text: 'VCC', x: 20, y: -87, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  95, size: 8 });
    pins = [
      {x:-15,y:-45},{x:-15,y:-30},{x:-15,y:-15},{x:-15,y:0},{x:-15,y:15},{x:-15,y:30},{x:-15,y:45},{x:-15,y:60},
      {x:85,y:60},{x:85,y:45},{x:85,y:30},{x:85,y:15},{x:85,y:-30},{x:85,y:-45},
      {x:35,y:-85},{x:35,y:90},
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 105 };
  }
  else if (type === 'ic_pcf8574') {
    rects.push({ x: 0, y: -65, width: 70, height: 165, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'PCF8574', x: 8, y: -5, size: 9 });
    texts.push({ text: 'I2C GPIO', x: 8, y:  6, size: 7 });
    ([['SDA',-30],['SCL',-15],['A0',0],['A1',15],['A2',30],['/INT',45]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['P0',-30],['P1',-15],['P2',0],['P3',15],['P4',30],['P5',45],['P6',60],['P7',75]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-65, 35,-75] });
    lines.push({ points: [35,100, 35,110] });
    texts.push({ text: 'VCC', x: 20, y: -77, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 115, size: 8 });
    pins = [
      {x:-15,y:-30},{x:-15,y:-15},{x:-15,y:0},{x:-15,y:15},{x:-15,y:30},{x:-15,y:45},
      {x:85,y:-30},{x:85,y:-15},{x:85,y:0},{x:85,y:15},{x:85,y:30},{x:85,y:45},{x:85,y:60},{x:85,y:75},
      {x:35,y:-75},{x:35,y:110},
    ];
    labelOffset = { x: 35, y: -90 }; valueOffset = { x: 35, y: 125 };
  }
  else if (type === 'ic_esp8266') {
    rects.push({ x: 0, y: -65, width: 70, height: 130, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'ESP8266', x: 8, y: -5, size: 9 });
    texts.push({ text: 'WiFi SoC', x: 8, y:  6, size: 7 });
    ([['TX',-40],['RX',-25],['/RST',-10],['EN',5],['GPIO0',20],['GPIO2',35]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [70, 20, 85, 20] });
    texts.push({ text: 'ADC', x: 52, y: 13, size: 8 });
    lines.push({ points: [35,-65, 35,-75] });
    lines.push({ points: [35, 65, 35, 75] });
    texts.push({ text: 'VCC', x: 20, y: -77, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  80, size: 8 });
    pins = [
      {x:-15,y:-40},{x:-15,y:-25},{x:-15,y:-10},{x:-15,y:5},{x:-15,y:20},{x:-15,y:35},
      {x:85,y:20},{x:35,y:-75},{x:35,y:75},
    ];
    labelOffset = { x: 35, y: -90 }; valueOffset = { x: 35, y: 90 };
  }
  else if (type === 'ic_74hc86') {
    // XOR gate symbol: curved input side + output
    paths.push({ data: 'M 5 -20 L 5 20 Q 40 20 40 0 Q 40 -20 5 -20 Z', fill: '#fff', stroke: '#333' });
    paths.push({ data: 'M 2 -20 Q 10 0 2 20', fill: 'none', stroke: '#333' });
    lines.push({ points: [ 0,-10,  5,-10] });
    lines.push({ points: [ 0, 10,  5, 10] });
    lines.push({ points: [40,  0, 55,  0] });
    lines.push({ points: [25, 20, 25, 28] });
    texts.push({ text: 'GND', x: 12, y: 30, size: 8 });
    pins = [{ x: 0, y: -10 }, { x: 0, y: 10 }, { x: 55, y: 0 }, { x: 25, y: 28 }];
    labelOffset = { x: 25, y: -32 }; valueOffset = { x: 25, y: 35 };
  }
  else if (type === 'ic_uc3842') {
    rects.push({ x: 0, y: -50, width: 70, height: 100, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'UC3842', x: 10, y: -5, size: 9 });
    texts.push({ text: 'PWM', x: 18, y:  6, size: 8 });
    ([['COMP',-30],['FB',-15],['ISNS',0],['RT/CT',15],['GND',30]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['VCC',-30],['OUT',-15],['VREF',15]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    pins = [
      {x:-15,y:-30},{x:-15,y:-15},{x:-15,y:0},{x:-15,y:15},{x:-15,y:30},
      {x:85,y:-15},{x:85,y:-30},{x:85,y:15},
    ];
    labelOffset = { x: 35, y: -65 }; valueOffset = { x: 35, y: 65 };
  }
  // ── BATCH 8 ──────────────────────────────────────────────────────────────
  else if (type === 'scr') {
    // SCR: diode triangle + gate on cathode side
    paths.push({ data: 'M 5 -20 L 30 0 L 5 20 Z', fill: '#333' });
    lines.push({ points: [ 5,-20,  5, 20] });
    lines.push({ points: [ 0,-25,  5,-20] });
    lines.push({ points: [ 0, 25,  5, 25] });
    lines.push({ points: [30,  0, 50,  0] });
    lines.push({ points: [30, -8, 30,  8] });
    lines.push({ points: [30,  8,-25,  8] });
    texts.push({ text: 'G', x: -30, y:  4, size: 9 });
    texts.push({ text: 'A', x:  -8, y:-32, size: 9 });
    texts.push({ text: 'K', x:  -8, y: 32, size: 9 });
    pins = [{ x: 0, y: -25 }, { x: 0, y: 25 }, { x: -25, y: 8 }];
    labelOffset = { x: 20, y: -42 }; valueOffset = { x: 20, y: 42 };
  }
  else if (type === 'jfet_n') {
    // N-JFET: channel bar, gate arrow pointing in, D top, S bottom
    lines.push({ points: [20,-20, 20, 20] }); // channel
    lines.push({ points: [20,-12, 35,-12] }); // drain stub
    lines.push({ points: [35,-12, 35,-30] }); // drain wire
    lines.push({ points: [20, 12, 35, 12] }); // source stub
    lines.push({ points: [35, 12, 35, 30] }); // source wire
    lines.push({ points: [ 0,  0, 16,  0] }); // gate lead
    lines.push({ points: [16, -8, 16,  8] }); // gate bar
    paths.push({ data: 'M 16 0 L 20 -4 L 20 4 Z', fill: '#333' }); // gate arrow (N: arrow in)
    texts.push({ text: 'G', x: -10, y: -5, size: 9 });
    texts.push({ text: 'D', x:  37, y: -32, size: 9 });
    texts.push({ text: 'S', x:  37, y:  25, size: 9 });
    pins = [{ x: 0, y: 0 }, { x: 35, y: -30 }, { x: 35, y: 30 }];
    labelOffset = { x: 18, y: -45 }; valueOffset = { x: 18, y: 45 };
  }
  else if (type === 'jfet_p') {
    // P-JFET: gate arrow pointing out
    lines.push({ points: [20,-20, 20, 20] });
    lines.push({ points: [20,-12, 35,-12] });
    lines.push({ points: [35,-12, 35,-30] });
    lines.push({ points: [20, 12, 35, 12] });
    lines.push({ points: [35, 12, 35, 30] });
    lines.push({ points: [ 0,  0, 20,  0] });
    lines.push({ points: [16, -8, 16,  8] });
    paths.push({ data: 'M 20 0 L 16 -4 L 16 4 Z', fill: '#333' }); // gate arrow (P: arrow out)
    texts.push({ text: 'G', x: -10, y: -5, size: 9 });
    texts.push({ text: 'S', x:  37, y: -32, size: 9 });
    texts.push({ text: 'D', x:  37, y:  25, size: 9 });
    pins = [{ x: 0, y: 0 }, { x: 35, y: 30 }, { x: 35, y: -30 }];
    labelOffset = { x: 18, y: -45 }; valueOffset = { x: 18, y: 45 };
  }
  else if (type === 'ic_74hc244') {
    rects.push({ x: 0, y: -75, width: 70, height: 175, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC244', x: 8, y: -5, size: 9 });
    texts.push({ text: 'BUFFER',  x: 12, y:  6, size: 8 });
    ([['A1',-40],['A2',-25],['A3',-10],['A4',5],['A5',20],['A6',35],['A7',50],['A8',65],['/OE1',80]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['Y1',-40],['Y2',-25],['Y3',-10],['Y4',5],['Y5',20],['Y6',35],['Y7',50],['Y8',65]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-75, 35,-85] });
    lines.push({ points: [35,100, 35,110] });
    texts.push({ text: 'VCC', x: 20, y: -87, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 115, size: 8 });
    pins = [
      {x:-15,y:-40},{x:-15,y:-25},{x:-15,y:-10},{x:-15,y:5},{x:-15,y:20},{x:-15,y:35},{x:-15,y:50},{x:-15,y:65},{x:-15,y:80},
      {x:85,y:-40},{x:85,y:-25},{x:85,y:-10},{x:85,y:5},{x:85,y:20},{x:85,y:35},{x:85,y:50},{x:85,y:65},
      {x:35,y:-85},{x:35,y:110},
    ];
    labelOffset = { x: 35, y: -100 }; valueOffset = { x: 35, y: 125 };
  }
  else if (type === 'ic_74hc374') {
    rects.push({ x: 0, y: -80, width: 70, height: 195, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC374', x: 8, y: -5, size: 9 });
    texts.push({ text: 'D-FF x8', x: 10, y:  6, size: 8 });
    ([['D1',-50],['D2',-35],['D3',-20],['D4',-5],['D5',10],['D6',25],['D7',40],['D8',55],['CLK',70],['/OE',85]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['Q1',-50],['Q2',-35],['Q3',-20],['Q4',-5],['Q5',10],['Q6',25],['Q7',40],['Q8',55]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-80, 35,-90] });
    lines.push({ points: [35,115, 35,125] });
    texts.push({ text: 'VCC', x: 20, y: -92, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 130, size: 8 });
    pins = [
      {x:-15,y:-50},{x:-15,y:-35},{x:-15,y:-20},{x:-15,y:-5},{x:-15,y:10},{x:-15,y:25},{x:-15,y:40},{x:-15,y:55},{x:-15,y:70},{x:-15,y:85},
      {x:85,y:-50},{x:85,y:-35},{x:85,y:-20},{x:85,y:-5},{x:85,y:10},{x:85,y:25},{x:85,y:40},{x:85,y:55},
      {x:35,y:-90},{x:35,y:125},
    ];
    labelOffset = { x: 35, y: -105 }; valueOffset = { x: 35, y: 140 };
  }
  else if (type === 'ic_74hc151') {
    rects.push({ x: 0, y: -85, width: 70, height: 210, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC151', x: 8, y: -5, size: 9 });
    texts.push({ text: '8:1 MUX', x: 10, y:  6, size: 8 });
    ([['D0',-50],['D1',-35],['D2',-20],['D3',-5],['D4',10],['D5',25],['D6',40],['D7',55],['S0',70],['S1',85],['S2',100],['/E',115]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [70,-25, 85,-25] });
    texts.push({ text: 'Y',  x: 52, y: -32, size: 8 });
    lines.push({ points: [70,-10, 85,-10] });
    texts.push({ text: '/W', x: 52, y: -17, size: 8 });
    lines.push({ points: [35,-85, 35,-95] });
    lines.push({ points: [35,125, 35,135] });
    texts.push({ text: 'VCC', x: 20, y: -97, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 140, size: 8 });
    pins = [
      {x:-15,y:-50},{x:-15,y:-35},{x:-15,y:-20},{x:-15,y:-5},{x:-15,y:10},{x:-15,y:25},{x:-15,y:40},{x:-15,y:55},
      {x:-15,y:70},{x:-15,y:85},{x:-15,y:100},{x:-15,y:115},
      {x:85,y:-25},{x:85,y:-10},
      {x:35,y:-95},{x:35,y:135},
    ];
    labelOffset = { x: 35, y: -110 }; valueOffset = { x: 35, y: 150 };
  }
  else if (type === 'ic_74hc283') {
    rects.push({ x: 0, y: -70, width: 70, height: 175, fill: '#fff', stroke: '#333' });
    texts.push({ text: '74HC283', x: 8, y: -5, size: 9 });
    texts.push({ text: '4b ADDER', x: 8, y:  6, size: 7 });
    ([['A1',-40],['A2',-25],['A3',-10],['A4',5],['B1',20],['B2',35],['B3',50],['B4',65],['C0',80]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    ([['S1',-40],['S2',-25],['S3',-10],['S4',5],['C4',20]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [70, yy, 85, yy] });
      texts.push({ text: lbl, x: 52, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-70, 35,-80] });
    lines.push({ points: [35,105, 35,115] });
    texts.push({ text: 'VCC', x: 20, y: -82, size: 8 });
    texts.push({ text: 'GND', x: 20, y: 120, size: 8 });
    pins = [
      {x:-15,y:-40},{x:-15,y:-25},{x:-15,y:-10},{x:-15,y:5},{x:-15,y:20},{x:-15,y:35},{x:-15,y:50},{x:-15,y:65},{x:-15,y:80},
      {x:85,y:-40},{x:85,y:-25},{x:85,y:-10},{x:85,y:5},{x:85,y:20},
      {x:35,y:-80},{x:35,y:115},
    ];
    labelOffset = { x: 35, y: -95 }; valueOffset = { x: 35, y: 130 };
  }
  else if (type === 'ic_mcp4725') {
    rects.push({ x: 0, y: -45, width: 70, height: 90, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'MCP4725', x: 8, y: -5, size: 9 });
    texts.push({ text: '12b DAC', x: 10, y:  6, size: 8 });
    ([['SDA',-15],['SCL',0],['A0',15]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [70, 0, 85, 0] });
    texts.push({ text: 'VOUT', x: 48, y: -7, size: 8 });
    lines.push({ points: [35,-45, 35,-55] });
    lines.push({ points: [35, 45, 35, 55] });
    texts.push({ text: 'VCC', x: 20, y: -57, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  60, size: 8 });
    pins = [{x:-15,y:-15},{x:-15,y:0},{x:-15,y:15},{x:85,y:0},{x:35,y:-55},{x:35,y:55}];
    labelOffset = { x: 35, y: -70 }; valueOffset = { x: 35, y: 70 };
  }
  else if (type === 'ic_ina219') {
    rects.push({ x: 0, y: -50, width: 70, height: 100, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'INA219', x: 10, y: -5, size: 9 });
    texts.push({ text: 'I/V MON', x: 8, y:  6, size: 8 });
    ([['IN+',-20],['IN-',-5],['SDA',10],['SCL',25]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [70, 10, 85, 10] });
    texts.push({ text: 'A0', x: 52, y:  3, size: 8 });
    lines.push({ points: [70, 25, 85, 25] });
    texts.push({ text: 'A1', x: 52, y: 18, size: 8 });
    lines.push({ points: [35,-50, 35,-60] });
    lines.push({ points: [35, 50, 35, 60] });
    texts.push({ text: 'VCC', x: 20, y: -62, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  65, size: 8 });
    pins = [{x:-15,y:-20},{x:-15,y:-5},{x:-15,y:10},{x:-15,y:25},{x:85,y:10},{x:85,y:25},{x:35,y:-60},{x:35,y:60}];
    labelOffset = { x: 35, y: -75 }; valueOffset = { x: 35, y: 75 };
  }
  else if (type === 'ic_nrf24l01') {
    rects.push({ x: 0, y: -65, width: 70, height: 130, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'nRF24L01', x: 5, y: -5, size: 8 });
    texts.push({ text: '2.4GHz RF', x: 5, y:  6, size: 7 });
    ([['CE',-35],['CSN',-20],['SCK',-5],['MOSI',10],['MISO',25],['IRQ',40]] as [string,number][]).forEach(([lbl, yy]) => {
      lines.push({ points: [-15, yy, 0, yy] });
      texts.push({ text: lbl, x: 2, y: yy - 7, size: 8 });
    });
    lines.push({ points: [35,-65, 35,-75] });
    lines.push({ points: [35, 65, 35, 75] });
    texts.push({ text: 'VCC', x: 20, y: -77, size: 8 });
    texts.push({ text: 'GND', x: 20, y:  80, size: 8 });
    pins = [{x:-15,y:-35},{x:-15,y:-20},{x:-15,y:-5},{x:-15,y:10},{x:-15,y:25},{x:-15,y:40},{x:35,y:-75},{x:35,y:75}];
    labelOffset = { x: 35, y: -90 }; valueOffset = { x: 35, y: 90 };
  } else if (type === 'ic_tl431') {
    // TL431 shunt reference — triangular body with ref pin on top
    pins = [
      { x: -40, y: 20 },
      { x:  40, y: 20 },
      { x:   0, y: -30 },
    ];
    // Triangle body
    paths.push({ data: 'M -25 35 L 25 35 L 0 -10 Z', fill: '#fff', stroke: '#333' });
    // Anode lead
    lines.push({ points: [-40, 20, -25, 20] });
    lines.push({ points: [-25, 20, -25, 35] });
    // Cathode lead
    lines.push({ points: [40, 20, 25, 20] });
    lines.push({ points: [25, 20, 25, 35] });
    // Reference lead
    lines.push({ points: [0, -30, 0, -10] });
    // Cathode bar
    lines.push({ points: [15, 35, 35, 35] });
    texts.push({ text: 'TL431', x: -5, y: -22, size: 7 });
    labelOffset = { x: 0, y: 50 };
    valueOffset = { x: 0, y: 62 };

  } else if (type === 'ic_max485') {
    // MAX485 RS-485 — standard 8-pin DIP box
    const bx = -35, bw = 70, by = -45, bh = 90;
    rects.push({ x: bx, y: by, width: bw, height: bh, fill: '#fff', stroke: '#333', strokeWidth: 1.5 });
    texts.push({ text: 'MAX485', x: -18, y: -38, size: 7 });
    // Left pins: RO, /RE, DE, DI
    const lPins = ['RO', '/RE', 'DE', 'DI'];
    lPins.forEach((n, i) => {
      const py = -30 + i * 20;
      lines.push({ points: [-55, py, -35, py] });
      texts.push({ text: n, x: -33, y: py - 4, size: 7 });
    });
    pins = [
      { x: -55, y: -30 },
      { x: -55, y: -10 },
      { x: -55, y:  10 },
      { x: -55, y:  30 },
      { x:  55, y:  30 },
      { x:  55, y:  10 },
      { x:  55, y: -10 },
      { x:  55, y: -30 },
    ];
    // Right pins: GND, A, B, VCC (bottom to top order matches pin ids)
    const rPins = ['VCC', 'B', 'A', 'GND'];
    rPins.forEach((n, i) => {
      const py = -30 + i * 20;
      lines.push({ points: [35, py, 55, py] });
      texts.push({ text: n, x: 4, y: py - 4, size: 7 });
    });
    labelOffset = { x: 0, y: 55 };
    valueOffset = { x: 0, y: 67 };

  } else if (type === 'ic_si7021') {
    // SI7021 — compact sensor IC box
    rects.push({ x: -35, y: -35, width: 70, height: 70, fill: '#e8f4ff', stroke: '#0055aa', strokeWidth: 1.5, cornerRadius: 4 });
    texts.push({ text: 'SI7021', x: -18, y: -20, size: 8 });
    texts.push({ text: 'RH+T', x: -12, y: -4, size: 7 });
    lines.push({ points: [-50, -30, -35, -30] });
    lines.push({ points: [-50,  30, -35,  30] });
    lines.push({ points: [35, -10, 50, -10] });
    lines.push({ points: [35,  10, 50,  10] });
    texts.push({ text: 'VDD', x: -33, y: -38, size: 7 });
    texts.push({ text: 'GND', x: -33, y:  22, size: 7 });
    texts.push({ text: 'SDA', x:  2,  y: -18, size: 7 });
    texts.push({ text: 'SCL', x:  2,  y:   2, size: 7 });
    pins = [
      { x: -50, y:  30 },
      { x: -50, y: -30 },
      { x:  50, y: -10 },
      { x:  50, y:  10 },
    ];
    labelOffset = { x: 0, y: 45 };
    valueOffset = { x: 0, y: 57 };

  } else if (type === 'ic_bmp280') {
    // BMP280 — small pressure sensor box
    rects.push({ x: -35, y: -40, width: 70, height: 80, fill: '#f0fff0', stroke: '#006600', strokeWidth: 1.5, cornerRadius: 4 });
    texts.push({ text: 'BMP280', x: -22, y: -30, size: 8 });
    texts.push({ text: 'P+T', x: -10, y: -12, size: 7 });
    lines.push({ points: [-50, -30, -35, -30] });
    lines.push({ points: [-50,  30, -35,  30] });
    lines.push({ points: [35, -20, 50, -20] });
    lines.push({ points: [35,   0, 50,   0] });
    lines.push({ points: [35,  20, 50,  20] });
    texts.push({ text: 'VDD', x: -33, y: -38, size: 7 });
    texts.push({ text: 'GND', x: -33, y:  22, size: 7 });
    texts.push({ text: 'SDA', x:  2,  y: -28, size: 7 });
    texts.push({ text: 'SCL', x:  2,  y:  -8, size: 7 });
    texts.push({ text: 'CSB', x:  2,  y:  12, size: 7 });
    pins = [
      { x: -50, y:  30 },
      { x: -50, y: -30 },
      { x:  50, y: -20 },
      { x:  50, y:   0 },
      { x:  50, y:  20 },
    ];
    labelOffset = { x: 0, y: 50 };
    valueOffset = { x: 0, y: 62 };

  } else if (type === 'ic_pca9685') {
    // PCA9685 — 16ch PWM driver, wider box
    rects.push({ x: -50, y: -55, width: 100, height: 120, fill: '#fff8e8', stroke: '#885500', strokeWidth: 1.5 });
    texts.push({ text: 'PCA9685', x: -28, y: -48, size: 8 });
    texts.push({ text: '16ch PWM', x: -26, y: -32, size: 7 });
    const lPinNames = ['VCC', 'SDA', 'SCL', '/OE', 'GND'];
    lPinNames.forEach((n, i) => {
      const py = -40 + i * 20;
      lines.push({ points: [-65, py, -50, py] });
      texts.push({ text: n, x: -48, y: py - 4, size: 6 });
    });
    const rPinNames = ['V+', 'PWM0', 'PWM1', 'PWM2', 'PWM3'];
    rPinNames.forEach((n, i) => {
      const py = -40 + i * 20;
      lines.push({ points: [50, py, 65, py] });
      texts.push({ text: n, x: 6, y: py - 4, size: 6 });
    });
    pins = [
      { x: -65, y: -40 },
      { x: -65, y: -20 },
      { x: -65, y:   0 },
      { x: -65, y:  20 },
      { x: -65, y:  40 },
      { x:  65, y: -40 },
      { x:  65, y: -20 },
      { x:  65, y:   0 },
      { x:  65, y:  20 },
      { x:  65, y:  40 },
    ];
    labelOffset = { x: 0, y: 72 };
    valueOffset = { x: 0, y: 84 };

  } else if (type === 'ic_ws2812') {
    // WS2812B — RGB LED square with RGB indicator circles
    rects.push({ x: -30, y: -30, width: 60, height: 60, fill: '#1a1a1a', stroke: '#666', strokeWidth: 1.5, cornerRadius: 3 });
    // RGB dot
    circles.push({ x: -8, y: 0, r: 6, fill: '#ff2020', stroke: '#ff2020' });
    circles.push({ x:  0, y: 0, r: 6, fill: '#20ff20', stroke: '#20ff20' });
    circles.push({ x:  8, y: 0, r: 6, fill: '#2040ff', stroke: '#2040ff' });
    texts.push({ text: 'WS2812B', x: -22, y: -22, size: 6 });
    lines.push({ points: [-50, -30, -30, -30] });
    lines.push({ points: [-50,  30, -30,  30] });
    lines.push({ points: [30, -10, 50, -10] });
    lines.push({ points: [30,  10, 50,  10] });
    texts.push({ text: 'VDD', x: -28, y: -38, size: 7 });
    texts.push({ text: 'GND', x: -28, y:  22, size: 7 });
    texts.push({ text: 'DIN',  x: 6, y: -18, size: 7 });
    texts.push({ text: 'DOUT', x: 6, y:   2, size: 7 });
    pins = [
      { x: -50, y: -30 },
      { x: -50, y:  30 },
      { x:  50, y: -10 },
      { x:  50, y:  10 },
    ];
    labelOffset = { x: 0, y: 40 };
    valueOffset = { x: 0, y: 52 };

  } else if (type === 'ujt') {
    // UJT (2N2646) — body bar with emitter diode arrow
    // Interbase bar (B1 to B2) vertical
    lines.push({ points: [0, -35, 0, 35] });
    // Emitter arrow from left
    lines.push({ points: [-40, 0, -8, 0] });
    // Arrow head pointing right-down to bar
    lines.push({ points: [-8, 0, -2, 10] });
    lines.push({ points: [-8, 0, -2, -10] });
    // B1 bottom
    lines.push({ points: [0, 35, 0, 40] });
    // B2 top
    lines.push({ points: [0, -35, 0, -40] });
    // Body circle
    circles.push({ x: 0, y: 0, r: 22, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'UJT', x: 12, y: -4, size: 7 });
    texts.push({ text: 'E',  x: -48, y: -4, size: 7 });
    texts.push({ text: 'B1', x:   4, y:  34, size: 7 });
    texts.push({ text: 'B2', x:   4, y: -38, size: 7 });
    pins = [
      { x: -40, y: 0 },
      { x:   0, y: 40 },
      { x:   0, y: -40 },
    ];
    labelOffset = { x: 0, y: 55 };
    valueOffset = { x: 0, y: 67 };

  } else if (type === 'varactor') {
    // Varactor diode — standard diode symbol + capacitor lines at cathode
    // Anode line
    lines.push({ points: [-30, 0, -12, 0] });
    // Diode triangle
    paths.push({ data: 'M -12 -12 L -12 12 L 10 0 Z', fill: '#fff', stroke: '#333' });
    // Cathode bar
    lines.push({ points: [10, -12, 10, 12] });
    // Capacitor plates (parallel lines offset)
    lines.push({ points: [14, -10, 14, 10] });
    lines.push({ points: [19, -10, 19, 10] });
    // Cathode line
    lines.push({ points: [19, 0, 30, 0] });
    texts.push({ text: 'C(V)', x: -8, y: 18, size: 7 });
    pins = [
      { x: -30, y: 0 },
      { x:  30, y: 0 },
    ];
    labelOffset = { x: 0, y: 30 };
    valueOffset = { x: 0, y: 42 };

  } else if (type === 'ic_ne555_cmos') {
    // TLC555 — same layout as NE555 but labelled CMOS
    rects.push({ x: -45, y: -55, width: 90, height: 110, fill: '#f5f0ff', stroke: '#5500aa', strokeWidth: 1.5 });
    texts.push({ text: 'TLC555', x: -24, y: -48, size: 8 });
    texts.push({ text: 'CMOS', x: -16, y: -32, size: 7 });
    const l555 = ['GND', 'TRIG', 'OUT', 'RST'];
    l555.forEach((n, i) => {
      const py = -40 + i * 20;
      lines.push({ points: [-60, py, -45, py] });
      texts.push({ text: n, x: -43, y: py - 4, size: 7 });
    });
    const r555 = ['VCC', 'DISCH', 'THR', 'CTRL'];
    r555.forEach((n, i) => {
      const py = -40 + i * 20;
      lines.push({ points: [45, py, 60, py] });
      texts.push({ text: n, x: 6, y: py - 4, size: 7 });
    });
    pins = [
      { x: -60, y: -40 },
      { x: -60, y: -20 },
      { x: -60, y:   0 },
      { x: -60, y:  20 },
      { x:  60, y: -40 },
      { x:  60, y: -20 },
      { x:  60, y:   0 },
      { x:  60, y:  20 },
    ];
    labelOffset = { x: 0, y: 65 };
    valueOffset = { x: 0, y: 77 };

  } else if (type === 'ic_74hc590') {
    // 74HC590 — tall DIP box, 15 pins
    const boxH = 220;
    rects.push({ x: -50, y: -boxH/2, width: 100, height: boxH, fill: '#fff', stroke: '#333', strokeWidth: 1.5 });
    texts.push({ text: '74HC590', x: -28, y: -boxH/2 + 12, size: 8 });
    // Right pins: QA..QH, RCO (9 pins)
    const rPins590 = ['QA','QB','QC','QD','QE','QF','QG','QH','RCO'];
    rPins590.forEach((n, i) => {
      const py = -90 + i * 22;
      lines.push({ points: [50, py, 65, py] });
      texts.push({ text: n, x: 4, y: py - 4, size: 7 });
    });
    // Left pins: CCLK, RCLK, /OE, MR, VCC, GND (6 pins)
    const lPins590 = ['CCLK','RCLK','/OE','MR','VCC','GND'];
    lPins590.forEach((n, i) => {
      const py = -60 + i * 24;
      lines.push({ points: [-65, py, -50, py] });
      texts.push({ text: n, x: -48, y: py - 4, size: 7 });
    });
    pins = [
      { x:  65, y: -90 },
      { x:  65, y: -68 },
      { x:  65, y: -46 },
      { x:  65, y: -24 },
      { x:  65, y:  -2 },
      { x:  65, y:  20 },
      { x:  65, y:  42 },
      { x:  65, y:  64 },
      { x:  65, y:  86 },
      { x: -65, y: -60 },
      { x: -65, y: -36 },
      { x: -65, y: -12 },
      { x: -65, y:  12 },
      { x: -65, y:  36 },
      { x: -65, y:  60 },
    ];
    labelOffset = { x: 0, y: 118 };
    valueOffset = { x: 0, y: 130 };

  } else if (type === 'ic_ads1115') {
    // ADS1115 — ADC sensor IC box
    rects.push({ x: -40, y: -45, width: 80, height: 90, fill: '#f0f8ff', stroke: '#004488', strokeWidth: 1.5, cornerRadius: 4 });
    texts.push({ text: 'ADS1115', x: -26, y: -38, size: 8 });
    texts.push({ text: '16-bit ADC', x: -28, y: -22, size: 7 });
    // Left pins: VDD, AIN0, AIN1, GND
    const lADS = [['VDD',-30],['AIN0',-10],['AIN1',10],['GND',30]] as [string,number][];
    lADS.forEach(([n,py]) => { lines.push({ points: [-55,py,-40,py] }); texts.push({ text: n, x: -38, y: py-5, size: 7 }); });
    // Right pins: SCL, SDA, ADDR, ALRT
    const rADS = [['SCL',-30],['SDA',-10],['ADDR',10],['ALRT',30]] as [string,number][];
    rADS.forEach(([n,py]) => { lines.push({ points: [40,py,55,py] }); texts.push({ text: n, x: 4, y: py-5, size: 7 }); });
    pins = [{x:-55,y:-30},{x:-55,y:-10},{x:-55,y:10},{x:-55,y:30},{x:55,y:-30},{x:55,y:-10},{x:55,y:10},{x:55,y:30}];
    labelOffset = { x: 0, y: 55 };
    valueOffset = { x: 0, y: 67 };

  } else if (type === 'ic_mpu6050') {
    // MPU-6050 — IMU sensor box
    rects.push({ x: -38, y: -50, width: 76, height: 100, fill: '#fff5e8', stroke: '#884400', strokeWidth: 1.5, cornerRadius: 4 });
    texts.push({ text: 'MPU-6050', x: -28, y: -42, size: 8 });
    texts.push({ text: 'IMU', x: -10, y: -26, size: 7 });
    // Left: VCC, GND
    lines.push({ points: [-55,-40,-38,-40] }); texts.push({ text: 'VCC', x: -36, y: -48, size: 7 });
    lines.push({ points: [-55,40,-38,40] });   texts.push({ text: 'GND', x: -36, y:  32, size: 7 });
    // Right: SCL, SDA, AD0, INT
    const rMPU = [['SCL',-30],['SDA',-10],['AD0',10],['INT',30]] as [string,number][];
    rMPU.forEach(([n,py]) => { lines.push({ points: [38,py,55,py] }); texts.push({ text: n, x: 4, y: py-5, size: 7 }); });
    pins = [{x:-55,y:-40},{x:-55,y:40},{x:55,y:-30},{x:55,y:-10},{x:55,y:10},{x:55,y:30}];
    labelOffset = { x: 0, y: 60 };
    valueOffset = { x: 0, y: 72 };

  } else if (type === 'ic_hc05') {
    // HC-05 Bluetooth — module box with BT symbol
    rects.push({ x: -42, y: -50, width: 84, height: 100, fill: '#e8f0ff', stroke: '#0022cc', strokeWidth: 1.5, cornerRadius: 5 });
    texts.push({ text: 'HC-05', x: -18, y: -42, size: 9 });
    texts.push({ text: 'BT', x: -8, y: -24, size: 8 });
    // BT lightning bolt simplified
    lines.push({ points: [4,-18,-2,-4] });
    lines.push({ points: [-2,-4,4,4] });
    // Left: VCC, GND
    lines.push({ points: [-57,-40,-42,-40] }); texts.push({ text: 'VCC', x: -40, y: -48, size: 7 });
    lines.push({ points: [-57, 40,-42, 40] }); texts.push({ text: 'GND', x: -40, y:  32, size: 7 });
    // Right: TXD, RXD, EN, STATE
    const rHC = [['TXD',-20],['RXD',0],['EN',20],['STATE',40]] as [string,number][];
    rHC.forEach(([n,py]) => { lines.push({ points: [42,py,57,py] }); texts.push({ text: n, x: 5, y: py-5, size: 7 }); });
    pins = [{x:-57,y:-40},{x:-57,y:40},{x:57,y:-20},{x:57,y:0},{x:57,y:20},{x:57,y:40}];
    labelOffset = { x: 0, y: 60 };
    valueOffset = { x: 0, y: 72 };

  } else if (type === 'ic_74hc21') {
    // 74HC21 — AND gate body with 4 inputs
    // Gate body (D-shape)
    paths.push({ data: 'M -20 -35 L -20 35 L 0 35 Q 35 35 35 0 Q 35 -35 0 -35 Z', fill: '#fff', stroke: '#333' });
    // Input lines
    [[-30],[-10],[10],[30]].forEach(([py]) => lines.push({ points: [-40,py,-20,py] }));
    // Output
    lines.push({ points: [35,0,50,0] });
    texts.push({ text: '&', x: 2, y: -4, size: 12 });
    texts.push({ text: '×4', x: 4, y: 12, size: 7 });
    pins = [{x:-40,y:-30},{x:-40,y:-10},{x:-40,y:10},{x:-40,y:30},{x:50,y:0},{x:0,y:-50},{x:0,y:50}];
    labelOffset = { x: 0, y: 50 };
    valueOffset = { x: 0, y: 62 };

  } else if (type === 'ic_lm2575') {
    // LM2575 — buck converter box with arrow
    rects.push({ x: -40, y: -35, width: 80, height: 70, fill: '#f5ffe8', stroke: '#336600', strokeWidth: 1.5 });
    texts.push({ text: 'LM2575', x: -24, y: -28, size: 8 });
    texts.push({ text: 'BUCK', x: -14, y: -10, size: 8 });
    // Arrow body (step-down symbol)
    lines.push({ points: [-10,8,10,8] });
    lines.push({ points: [10,8,4,2] });
    lines.push({ points: [10,8,4,14] });
    // Left: VIN, /ON
    lines.push({ points: [-55,-20,-40,-20] }); texts.push({ text: 'VIN', x: -38, y: -28, size: 7 });
    lines.push({ points: [-55, 20,-40, 20] }); texts.push({ text: '/ON', x: -38, y:  12, size: 7 });
    // Right: VOUT, FB
    lines.push({ points: [40,-20,55,-20] }); texts.push({ text: 'VOUT', x: 4, y: -28, size: 7 });
    lines.push({ points: [40, 20,55, 20] }); texts.push({ text: 'FB', x: 4, y:  12, size: 7 });
    // Bottom: GND
    lines.push({ points: [0,35,0,45] }); texts.push({ text: 'GND', x: -10, y: 48, size: 7 });
    pins = [{x:-55,y:-20},{x:55,y:-20},{x:0,y:45},{x:55,y:20},{x:-55,y:20}];
    labelOffset = { x: 0, y: 55 };
    valueOffset = { x: 0, y: 67 };

  } else if (type === 'ic_tps61023') {
    // TPS61023 — boost converter box with up-arrow
    rects.push({ x: -40, y: -35, width: 80, height: 70, fill: '#fff8e0', stroke: '#886600', strokeWidth: 1.5 });
    texts.push({ text: 'TPS61023', x: -30, y: -28, size: 7 });
    texts.push({ text: 'BOOST', x: -16, y: -10, size: 8 });
    // Up arrow
    lines.push({ points: [-10,8,10,8] });
    lines.push({ points: [0,8,0,2] });
    lines.push({ points: [-5,4,0,-2] });
    lines.push({ points: [5,4,0,-2] });
    // Left: VIN, EN
    lines.push({ points: [-55,-20,-40,-20] }); texts.push({ text: 'VIN', x: -38, y: -28, size: 7 });
    lines.push({ points: [-55, 20,-40, 20] }); texts.push({ text: 'EN',  x: -38, y:  12, size: 7 });
    // Right: VOUT, FB
    lines.push({ points: [40,-20,55,-20] }); texts.push({ text: 'VOUT', x: 4, y: -28, size: 7 });
    lines.push({ points: [40, 20,55, 20] }); texts.push({ text: 'FB',   x: 4, y:  12, size: 7 });
    // Bottom: GND
    lines.push({ points: [0,35,0,45] }); texts.push({ text: 'GND', x: -10, y: 48, size: 7 });
    pins = [{x:-55,y:-20},{x:55,y:-20},{x:0,y:45},{x:-55,y:20},{x:55,y:20}];
    labelOffset = { x: 0, y: 55 };
    valueOffset = { x: 0, y: 67 };

  } else if (type === 'put') {
    // PUT (2N6027) — resembles SCR/thyristor symbol with gate
    // Vertical bar (anode to cathode)
    lines.push({ points: [0,-40,0,-12] });
    lines.push({ points: [0, 12,0, 40] });
    // Triangle (anode at top)
    paths.push({ data: 'M -12 -12 L 12 -12 L 0 12 Z', fill: '#fff', stroke: '#333' });
    // Gate line from left to midpoint
    lines.push({ points: [-40,0,-8,0] });
    lines.push({ points: [-8,0,-8,-12] });
    // Body circle
    circles.push({ x: 0, y: 0, r: 20, fill: '#fff', stroke: '#333' });
    texts.push({ text: 'PUT', x: 10, y: -4, size: 7 });
    texts.push({ text: 'A', x: -6, y: -38, size: 7 });
    texts.push({ text: 'K', x: -6, y:  36, size: 7 });
    texts.push({ text: 'G', x: -48, y: -4, size: 7 });
    pins = [{x:0,y:-40},{x:0,y:40},{x:-40,y:0}];
    labelOffset = { x: 0, y: 52 };
    valueOffset = { x: 0, y: 64 };

  } else if (type === 'ic_74hc30') {
    // 74HC30 — 8-input NAND gate with bubble
    paths.push({ data: 'M -20 -50 L -20 50 L 5 50 Q 45 50 45 0 Q 45 -50 5 -50 Z', fill: '#fff', stroke: '#333' });
    // Bubble
    circles.push({ x: 52, y: 0, r: 5, fill: '#fff', stroke: '#333' });
    // 6 left input lines + 2 top/bottom
    [[-40,-25,-10,-25],[-40,-10,-20,-10],[-40,5,-20,5],[-40,20,-20,20],[-40,35,-20,35],[-40,-40,-20,-40]].forEach(([x1,y1,x2,y2]) => lines.push({ points: [x1,y1,x2,y2] }));
    // G and H from top/bottom
    lines.push({ points: [-10,-50,-10,-58] });
    lines.push({ points: [10,-50,10,-58] });
    // Output
    lines.push({ points: [57,0,70,0] });
    texts.push({ text: '&8', x: 0, y: -4, size: 10 });
    pins = [{x:-40,y:-40},{x:-40,y:-25},{x:-40,y:-10},{x:-40,y:5},{x:-40,y:20},{x:-40,y:35},{x:-10,y:-58},{x:10,y:-58},{x:70,y:0},{x:0,y:-65},{x:10,y:65}];
    labelOffset = { x: 0, y: 70 };
    valueOffset = { x: 0, y: 82 };

  } else if (type === 'ic_cd4040') {
    // CD4040 — tall counter box
    const bh4040 = 180;
    rects.push({ x: -48, y: -bh4040/2, width: 96, height: bh4040, fill: '#fff', stroke: '#333', strokeWidth: 1.5 });
    texts.push({ text: 'CD4040', x: -22, y: -bh4040/2+12, size: 8 });
    texts.push({ text: '12-bit', x: -16, y: -bh4040/2+25, size: 7 });
    // Left: CLK, RST, VDD, VSS
    const lCD4040 = [['CLK',-70],['RST',-50],['VDD',60],['VSS',80]] as [string,number][];
    lCD4040.forEach(([n,py]) => { lines.push({ points: [-63,py,-48,py] }); texts.push({ text: n, x: -46, y: py-5, size: 7 }); });
    // Right: Q1-Q8
    for (let i=0; i<8; i++) {
      const py = -55 + i*17;
      lines.push({ points: [48,py,63,py] });
      texts.push({ text: `Q${i+1}`, x: 4, y: py-5, size: 7 });
    }
    pins = [
      {x:-63,y:-70},{x:-63,y:-50},{x:-63,y:60},{x:-63,y:80},
      {x:63,y:-55},{x:63,y:-38},{x:63,y:-21},{x:63,y:-4},{x:63,y:13},{x:63,y:30},{x:63,y:47},{x:63,y:64}
    ];
    labelOffset = { x: 0, y: 100 };
    valueOffset = { x: 0, y: 112 };

  } else if (type === 'ic_opa2134') {
    // OPA2134 dual op-amp — two triangles stacked
    // Channel 1 triangle
    paths.push({ data: 'M -30 -40 L -30 -10 L 5 -25 Z', fill: '#fff', stroke: '#333' });
    lines.push({ points: [-50,-35,-30,-35] }); texts.push({ text: 'IN1-', x: -48, y: -40, size: 6 });
    lines.push({ points: [-50,-15,-30,-15] }); texts.push({ text: 'IN1+', x: -48, y: -20, size: 6 });
    lines.push({ points: [5,-25,20,-25] });    texts.push({ text: 'OUT1', x: 4, y: -32, size: 6 });
    // Channel 2 triangle
    paths.push({ data: 'M -30 10 L -30 40 L 5 25 Z', fill: '#fff', stroke: '#333' });
    lines.push({ points: [-50,15,-30,15] }); texts.push({ text: 'IN2+', x: -48, y: 10, size: 6 });
    lines.push({ points: [-50,35,-30,35] }); texts.push({ text: 'IN2-', x: -48, y: 30, size: 6 });
    lines.push({ points: [5,25,20,25] });    texts.push({ text: 'OUT2', x: 4, y: 20, size: 6 });
    // Power supply rails
    lines.push({ points: [-12,-50,-12,-42] }); texts.push({ text: 'V+', x: -10, y: -52, size: 7 });
    lines.push({ points: [-12, 50,-12, 42] }); texts.push({ text: 'V-', x: -10, y:  58, size: 7 });
    texts.push({ text: 'OPA2134', x: -24, y: -3, size: 7 });
    pins = [{x:-50,y:-35},{x:-50,y:-15},{x:20,y:-25},{x:-50,y:15},{x:-50,y:35},{x:20,y:25},{x:-12,y:-50},{x:-12,y:50}];
    labelOffset = { x: 0, y: 65 };
    valueOffset = { x: 0, y: 77 };

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
      onPointerDown={(e) => {
        if (type === 'switch_spst') {
          e.cancelBubble = true;
          const isClosed = component.props?.closed === true;
          const newClosed = !isClosed;
          useSchematicStore.getState().updateComponentProp(component.id, 'closed', newClosed);
          setTimeout(() => {
            const state = useSchematicStore.getState();
            if ((state.simulationBuffer && state.simulationBuffer.length > 0) || (state.simulationData && state.simulationData.length > 0)) {
              state.runSimulation(true);
            }
          }, 50);
          return;
        }
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
          <Path data={`M -30 -25 L 70 -25 L 70 25 L -30 25 Z`} fill="transparent" />
          {/* AI Debugger: amber highlight ring — pulses when component is flagged */}
          {isHighlighted && (
            <Rect
              x={-14} y={-24} width={88} height={48}
              stroke="#f59e0b" strokeWidth={2.5} fill="rgba(245,158,11,0.08)"
              cornerRadius={8} listening={false}
              opacity={0.9}
            />
          )}

          {/* Render Rectangles */}
          {rects.map((r, i) => (
            <Rect
              key={`r${i}`}
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              stroke={r.stroke || strokeColor}
              strokeWidth={r.strokeWidth || 2}
              fill={r.fill || 'transparent'}
              cornerRadius={r.cornerRadius || 0}
            />
          ))}

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
              x={scaledX} y={scaledY} radius={5} fill="#fff" stroke={strokeColor} strokeWidth={2} hitStrokeWidth={isTouch ? 56 : 15}
              onPointerDown={handlePinHit}
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
                triggerDebouncedSliderSim(component.id); // debounced live simulation while dragging
              }}
              onChangeEnd={(newVal) => {
                let display = '';
                if (newVal >= 1e6) display = `${(newVal / 1e6).toPrecision(3)}Meg`;
                else if (newVal >= 1e3) display = `${(newVal / 1e3).toPrecision(3)}k`;
                else display = `${newVal.toPrecision(3)}`;
                useSchematicStore.getState().updateComponentValue(component.id, display);
                // Immediate final re-run on release
                const existing = sliderDebounceTimers.get(component.id);
                if (existing) clearTimeout(existing);
                sliderDebounceTimers.delete(component.id);
                setTimeout(() => useSchematicStore.getState().runSimulation(true), 20);
              }}
            />
          </Group>
        )}
      </Group>
    </Group>
  );
}
