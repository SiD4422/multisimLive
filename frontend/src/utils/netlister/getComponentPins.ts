import type { SchematicComponent, Point } from '../../store/useSchematicStore';
import symbolsData from '../kicad_symbols.json';
import { toGridNode } from './utils';
export function getComponentPins(comp: SchematicComponent): { id: string, name?: string, gridNode: string, p?: Point }[] {
  if (comp.type === 'Ammeter') {
    if (comp.value && comp.value.startsWith('{')) {
      const fakeP = JSON.parse(comp.value);
      return [
        { id: '1', gridNode: toGridNode({ x: comp.position.x, y: comp.position.y }), p: { x: comp.position.x, y: comp.position.y } },
        { id: '2', gridNode: toGridNode(fakeP), p: fakeP }
      ];
    } else {
      const rad = (comp.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(rad); const sin = Math.sin(rad);
      const rawPins = [
        { x: -20, y: 0, id: 'in' },
        { x: 20, y: 0, id: 'out' }
      ];
      return rawPins.map(pin => {
        const sx = pin.x * 1.5; const sy = pin.y * 1.5;
        const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
        return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
      });
    }
  }

  if (comp.type === 'Voltmeter') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x: 0, y: -20, id: '+' },
      { x: 0, y: 20, id: '-' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'Wattmeter') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x: 0, y: -20, id: 'V+' },
      { x: 0, y: 20, id: 'V-' },
      { x: -20, y: -10, id: 'I+' },
      { x: 20, y: 10, id: 'I-' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }
  // Hardcoded generic pins for basic components if they lack KiCad symbol mapping
  if (comp.type === 'Ground') return [{ id: '1', gridNode: toGridNode({ x: comp.position.x, y: comp.position.y }), p: { x: comp.position.x, y: comp.position.y } }];
  
  const twoPinHorizontal = [
    'Resistor', 'Load', 'Capacitor', 'Inductor',
    'SwitchSPST', 'PushButton',
    'DCSource', 'ACSource', 'ClockVoltage', 'PulseVoltage',
    'DCCurrent', 'ACCurrent',
    'Diode', 'DiodeZener', 'DiodeSchottky', 'LED',
    'Thermistor', 'LDR', 'Varistor', 'VaractorDiode', 'TVSDiode',
    // Sources missing from previous list:
    'StepVoltage', 'AMVoltage', 'FMVoltage', 'ChirpVoltage',
    'ThermalNoise', 'ArbitraryVoltageSource',
    'TriangularVoltage', 'TriangularCurrent',
    'StepCurrent', 'FMCurrent', 'ChirpCurrent', 'ArbitraryCurrentSource',
    // Fixed: Clock/Pulse current sources now included
    'ClockCurrent', 'PulseCurrent',
    // Potentiometer and Fuse get their own entries (special SPICE handling)
    'Potentiometer', 'Fuse',
    // New P1/P2 two-pin passives
    'CrystalOscillator', 'Photodiode', 'DIAC', 'Lamp'
  ];

  // DIGITAL SWITCH
  if (comp.type === 'DigitalSwitch') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const px = 90 * cos;
    const py = 90 * sin;
    return [
      { id: '1', gridNode: toGridNode({ x: comp.position.x + px, y: comp.position.y + py }), p: { x: comp.position.x + px, y: comp.position.y + py } }
    ];
  }

  // FLIP FLOPS
  if (comp.type === 'DFlipFlop' || comp.type === 'JKFlipFlop' || comp.type === 'SRFlipFlop' || comp.type === 'TFlipFlop') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    let rawPins: { x: number, y: number, id: string }[] = [];
    if (comp.type === 'DFlipFlop') {
      rawPins = [{ x: 0, y: -15, id: 'D' }, { x: 0, y: 15, id: 'CLK' }, { x: 60, y: -15, id: 'Q' }, { x: 60, y: 15, id: 'Q_bar' }];
    } else if (comp.type === 'JKFlipFlop') {
      rawPins = [{ x: 0, y: -15, id: 'J' }, { x: 0, y: 0, id: 'CLK' }, { x: 0, y: 15, id: 'K' }, { x: 60, y: -15, id: 'Q' }, { x: 60, y: 15, id: 'Q_bar' }];
    } else if (comp.type === 'SRFlipFlop') {
      rawPins = [{ x: 0, y: -15, id: 'S' }, { x: 0, y: 15, id: 'R' }, { x: 60, y: -15, id: 'Q' }, { x: 60, y: 15, id: 'Q_bar' }];
    } else if (comp.type === 'TFlipFlop') {
      rawPins = [{ x: 0, y: -15, id: 'T' }, { x: 0, y: 15, id: 'CLK' }, { x: 60, y: -15, id: 'Q' }, { x: 60, y: 15, id: 'Q_bar' }];
    }

    return rawPins.map(pin => {
      const dx = pin.x * 1.5;
      const dy = pin.y * 1.5;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // â”€â”€ Three-Phase Sources (4 pins: A, B, C, Neutral)
  // Renderer places pin nodes at (0,0), (90,0), (0,60), (90,60) in symbol space.
  // We approximate as square layout. Neutral hangs below at centre.
  if (comp.type === 'ThreePhaseDelta' || comp.type === 'ThreePhaseWye') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // 4 external terminals arranged in a 2Ã—2 grid (scaled 1.5Ã—)
    // A=top-left, B=top-right, C=bottom-left, N=bottom-right
    const offsets = [
      { dx: 0,   dy: -30, id: 'A' },  // Phase A
      { dx: 90,  dy: -30, id: 'B' },  // Phase B
      { dx: 0,   dy:  30, id: 'C' },  // Phase C
      { dx: 90,  dy:  30, id: 'N' },  // Neutral / Star-point
    ];
    return offsets.map(off => {
      const rx = off.dx * cos - off.dy * sin;
      const ry = off.dx * sin + off.dy * cos;
      return {
        id: off.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  if (comp.type === 'IC74HC595') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: -15, y: -24, id: 'SER' },
      { x: -15, y: -8, id: 'SRCLK' },
      { x: -15, y: 8, id: 'RCLK' },
      { x: 75, y: -24, id: 'QA' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // â”€â”€ 555 Timer (8 pins; order must match MultisimSymbol.tsx renderer exactly)
  // Symbol renders: pin[0]=VCC(40,-70), pin[1]=GND(40,70),
  //   pin[2]=RST(-20,-40), pin[3]=DIS(-20,-20), pin[4]=THR(-20,0),
  //   pin[5]=TRI(-20,20), pin[6]=CON(-20,40), pin[7]=OUT(100,-20)
  // All scaled by 1.5 in the renderer â†’ multiply raw coords by 1.5
  if (comp.type === 'Timer555') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x:  40, y: -70, id: 'VCC' },
      { x:  40, y:  70, id: 'GND' },
      { x: -20, y: -40, id: 'RST' },
      { x: -20, y: -20, id: 'DIS' },
      { x: -20, y:   0, id: 'THR' },
      { x: -20, y:  20, id: 'TRI' },
      { x: -20, y:  40, id: 'CON' },
      { x: 100, y: -20, id: 'OUT' },
    ];
    return rawPins.map(pin => {
      // Scale by 1.5 first (renderer scale), then rotate
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // â”€â”€ Digital Logic Gates (2-input: A, B, Y; NOT gate: A, Y)
  const twoInputGates = ['GateAND', 'GateOR', 'GateNAND', 'GateNOR', 'GateXOR'];
  if (twoInputGates.includes(comp.type)) {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // Match MultisimSymbol.tsx visual pins: Input A=(0,-10), Input B=(0,10), Output Y=(55,0)
    // Scaled by 1.5 in renderer, so raw coords are as placed by symbol
    const rawPins = [
      { x: 0,  y: -10, id: 'A' },
      { x: 0,  y:  10, id: 'B' },
      { x: 55, y:   0, id: 'Y' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }
  if (comp.type === 'GateNOT') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // Match MultisimSymbol.tsx visual pins: Input A=(0,0), Output Y=(55,0)
    const rawPins = [
      { x:  0, y: 0, id: 'A' },
      { x: 55, y: 0, id: 'Y' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }
  if (comp.type === 'IC74HC04') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: -15, y: 0, id: 'A' },
      { x: 75, y: 0, id: 'Y' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }
  if (comp.type === 'IC74HC00' || comp.type === 'IC74HC86') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: -15, y: -10, id: 'A' },
      { x: -15, y: 10, id: 'B' },
      { x: 75, y: 0, id: 'Y' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }
  if (comp.type === 'IC74HC138') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: -15, y: -24, id: 'A' },
      { x: -15, y: 0, id: 'B' },
      { x: -15, y: 24, id: 'C' },
      { x: 75, y: -24, id: 'Y0' },
      { x: 75, y: -8, id: 'Y1' },
      { x: 75, y: 8, id: 'Y2' },
      { x: 75, y: 24, id: 'Y3' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  if (twoPinHorizontal.includes(comp.type)) {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const rotX = 90 * Math.cos(rad); // 60 * 1.5
    const rotY = 90 * Math.sin(rad); // 60 * 1.5
    return [
      { id: '1', gridNode: toGridNode({ x: comp.position.x, y: comp.position.y }), p: { x: comp.position.x, y: comp.position.y } },
      { id: '2', gridNode: toGridNode({ x: comp.position.x + rotX, y: comp.position.y + rotY }), p: { x: comp.position.x + rotX, y: comp.position.y + rotY } }
    ];
  }

  if (comp.type === 'TransistorNPN' || comp.type === 'TransistorPNP' || comp.type === 'MosfetN' || comp.type === 'MosfetP' || comp.type === 'JFET' || comp.type === 'IGBT' || comp.type === 'ThyristorSCR' || comp.type === 'Darlington') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx2 = 57;   // 38 * 1.5
    const dy2 = -45;  // -30 * 1.5
    const dy3 = 45;   // 30 * 1.5
    return [
      { id: '1', gridNode: toGridNode({ x: comp.position.x, y: comp.position.y }), p: { x: comp.position.x, y: comp.position.y } }, // Base/Gate
      { id: '2', gridNode: toGridNode({ x: comp.position.x + dx2*cos - dy2*sin, y: comp.position.y + dx2*sin + dy2*cos }), p: { x: comp.position.x + dx2*cos - dy2*sin, y: comp.position.y + dx2*sin + dy2*cos } }, // Collector/Drain
      { id: '3', gridNode: toGridNode({ x: comp.position.x + dx2*cos - dy3*sin, y: comp.position.y + dx2*sin + dy3*cos }), p: { x: comp.position.x + dx2*cos - dy3*sin, y: comp.position.y + dx2*sin + dy3*cos } } // Emitter/Source
    ];
  }

  if (comp.type === 'Phototransistor') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx2 = 57;   // 38 * 1.5
    const dy2 = -45;  // -30 * 1.5
    const dy3 = 45;   // 30 * 1.5
    return [
      { id: '1', gridNode: toGridNode({ x: comp.position.x + dx2*cos - dy2*sin, y: comp.position.y + dx2*sin + dy2*cos }), p: { x: comp.position.x + dx2*cos - dy2*sin, y: comp.position.y + dx2*sin + dy2*cos } }, // Collector
      { id: '2', gridNode: toGridNode({ x: comp.position.x + dx2*cos - dy3*sin, y: comp.position.y + dx2*sin + dy3*cos }), p: { x: comp.position.x + dx2*cos - dy3*sin, y: comp.position.y + dx2*sin + dy3*cos } } // Emitter
    ];
  }

  if (comp.type === 'TRIAC') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: 0, y: 0, id: 'MT1' }, { x: 60, y: 0, id: 'MT2' }, { x: 45, y: 20, id: 'G' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // SCR / ThyristorSCR: 3 pins â€” Anode (0,0), Cathode (55,0), Gate (55,28)
  if (comp.type === 'ThyristorSCR') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: 0, y: 0, id: 'A' }, { x: 55, y: 0, id: 'K' }, { x: 55, y: 28, id: 'G' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // Junction: 3 pins â€” left, right, down stem
  if (comp.type === 'Junction') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: -12, y: 0, id: '1' }, { x: 12, y: 0, id: '2' }, { x: 0, y: 12, id: '3' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // Connector: 2 pins â€” left (0,0), right (40,0)
  if (comp.type === 'Connector') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: 0, y: 0, id: '1' }, { x: 40, y: 0, id: '2' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'VoltageRegulator7805' || comp.type === 'VoltageRegulator7812' || comp.type === 'VoltageRegulatorLM317' || comp.type === 'VoltageRegulator7809' || comp.type === 'VoltageRegulatorAMS1117') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: 0, y: 0, id: 'IN' }, { x: 30, y: 25, id: 'GND' }, { x: 60, y: 0, id: 'OUT' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'BuckConverter') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:  0, y: -10, id: 'Vin+' },
      { x:  0, y:  10, id: 'Vin-' },
      { x: 60, y: -10, id: 'Vout+' },
      { x: 60, y:  10, id: 'Vout-' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'SevenSegment') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // 8 pins: 7 segment inputs (A-G) on the left, 1 common cathode (K) at bottom
    // Layout: left column for segments, right side for cathode
    const rawPins = [
      { x: -15, y: -45, id: 'A' },  // Segment A (top)
      { x: -15, y: -30, id: 'B' },  // Segment B (top-right)
      { x: -15, y: -15, id: 'C' },  // Segment C (bottom-right)
      { x: -15, y:   0, id: 'D' },  // Segment D (bottom)
      { x: -15, y:  15, id: 'E' },  // Segment E (bottom-left)
      { x: -15, y:  30, id: 'F' },  // Segment F (top-left)
      { x: -15, y:  45, id: 'G' },  // Segment G (middle)
      { x:  75, y:   0, id: 'K' },  // Common Cathode
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'CurrentMirror') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [{ x: 0, y: 0, id: 'IN' }, { x: 30, y: -25, id: 'VCC' }, { x: 60, y: 0, id: 'OUT' }];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'DIP14') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins: any[] = [];
    for (let i=0; i<7; i++) rawPins.push({ x: 0, y: -30 + i * 10, id: `${i+1}` });
    for (let i=0; i<7; i++) rawPins.push({ x: 60, y: 30 - i * 10, id: `${i+8}` });
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  if (comp.type === 'BridgeRectifier') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x1 = -30, y1 = 0;   // -20 * 1.5
    const x2 = 150, y2 = 0;   // 100 * 1.5
    const x3 = 60, y3 = -90;    // 40*1.5, -60*1.5
    const x4 = 60, y4 = 90;     // 40*1.5, 60*1.5
    return [
      { id: '1', gridNode: toGridNode({ x: comp.position.x + x1*cos - y1*sin, y: comp.position.y + x1*sin + y1*cos }), p: { x: comp.position.x + x1*cos - y1*sin, y: comp.position.y + x1*sin + y1*cos } }, // Left AC
      { id: '2', gridNode: toGridNode({ x: comp.position.x + x2*cos - y2*sin, y: comp.position.y + x2*sin + y2*cos }), p: { x: comp.position.x + x2*cos - y2*sin, y: comp.position.y + x2*sin + y2*cos } }, // Right AC
      { id: '3', gridNode: toGridNode({ x: comp.position.x + x3*cos - y3*sin, y: comp.position.y + x3*sin + y3*cos }), p: { x: comp.position.x + x3*cos - y3*sin, y: comp.position.y + x3*sin + y3*cos } }, // Top +
      { id: '4', gridNode: toGridNode({ x: comp.position.x + x4*cos - y4*sin, y: comp.position.y + x4*sin + y4*cos }), p: { x: comp.position.x + x4*cos - y4*sin, y: comp.position.y + x4*sin + y4*cos } }  // Bottom -
    ];
  }

  if (comp.type === 'Optocoupler') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // 4 pins matching MultisimSymbol.tsx: Anode (-30,-20), Cathode (-30,-4), Emitter (30,30), Collector (30,-30)
    const rawPins = [
      { x: -30, y: -20, id: 'A' },
      { x: -30, y:  -4, id: 'K' },
      { x:  30, y:  30, id: 'E' },
      { x:  30, y: -30, id: 'C' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // Transformers & Coupled Inductors & Relays â€” pin positions MUST match MultisimSymbol.tsx renderer exactly.
  if (comp.type.startsWith('Transformer') || comp.type === 'Transformers' || comp.type === 'Relay' || comp.type === 'CoupledInductors') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const isCT = comp.type === 'Transformer1P1S_CT';
    const pCount = (comp.type === 'Transformer2P1S' || comp.type === 'Transformer2P2S') ? 2 : 1;
    const sCount = (comp.type === 'Transformer1P2S' || comp.type === 'Transformer2P2S') ? 2 : 1;
    const topY = (pCount === 2 || sCount === 2) ? -50 : -30;

    const rawPins: {x:number,y:number,id:string}[] = [];
    // Primary top
    rawPins.push({ x: 0, y: topY, id: 'P1+' });
    rawPins.push({ x: 0, y: topY + 60, id: 'P1-' });
    if (pCount === 2) {
      rawPins.push({ x: 0, y: topY + 80, id: 'P2+' });
      rawPins.push({ x: 0, y: topY + 140, id: 'P2-' });
    }
    // Secondary top
    rawPins.push({ x: 60, y: topY, id: 'S1+' });
    if (isCT) {
      rawPins.push({ x: 60, y: topY + 30, id: 'CT' });
    }
    rawPins.push({ x: 60, y: topY + 60, id: 'S1-' });
    if (sCount === 2) {
      rawPins.push({ x: 60, y: topY + 80, id: 'S2+' });
      rawPins.push({ x: 60, y: topY + 140, id: 'S2-' });
    }

    return rawPins.map(pin => {
      // Scale by 1.5 (as in renderer), then rotate
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // Resistors (Pack) - 4 pins arranged representing two parallel resistors
  if (comp.type === 'Resistors') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: 0,  y: -20, id: '1' },
      { x: 60, y: -20, id: '2' },
      { x: 0,  y:  20, id: '3' },
      { x: 60, y:  20, id: '4' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // Lossy & Lossless Transmission Lines - 4 pins arranged representing two terminal ports
  if (comp.type === 'LosslessTransmissionLine' || comp.type === 'LossyTransmissionLine') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: 0,  y: -5, id: '1' },
      { x: 0,  y:  5, id: '2' },
      { x: 60, y: -5, id: '3' },
      { x: 60, y:  5, id: '4' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // 3-pin Opamps and Comparators
  if (comp.type === 'Opamp' || comp.type === 'Comparator' || comp.type === 'Opamps') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: 0,  y: -10, id: 'IN+' },
      { x: 0,  y:  10, id: 'IN-' },
      { x: 60, y:   0, id: 'OUT' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // 5-pin Opamps
  if (comp.type === 'Opamp5') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rawPins = [
      { x: 0,  y: -10, id: 'IN+' },
      { x: 0,  y:  10, id: 'IN-' },
      { x: 60, y:   0, id: 'OUT' },
      { x: 40, y: -20, id: 'V+' },
      { x: 40, y:  20, id: 'V-' }
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5;
      const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        id: pin.id,
        gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }),
        p: { x: comp.position.x + rx, y: comp.position.y + ry }
      };
    });
  }

  // â”€â”€ LM358 / TL071 / SchmittTrigger â€” 5-pin opamp layout
  if (comp.type === 'OpampLM358' || comp.type === 'OpampTL071' || comp.type === 'SchmittTrigger') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:  0, y: -10, id: 'IN+' },
      { x:  0, y:  10, id: 'IN-' },
      { x: 40, y: -20, id: 'VCC' },
      { x: 40, y:  20, id: 'VEE' },
      { x: 60, y:   0, id: 'OUT' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // â”€â”€ Voltage-Controlled Switch â€” 4 pins: CTRL+, CTRL-, SW1, SW2
  if (comp.type === 'VCSwitch') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:   0, y: -20, id: 'CTRL+' },
      { x:   0, y:  20, id: 'CTRL-' },
      { x: -30, y:   0, id: 'SW1'   },
      { x:  60, y:   0, id: 'SW2'   },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // â”€â”€ VCCS â€” 4 pins: IN+, IN-, OUT+, OUT-
  if (comp.type === 'VCCS' || comp.type === 'CCCS') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:  0, y: -15, id: 'IN+'  },
      { x:  0, y:  15, id: 'IN-'  },
      { x: 60, y: -15, id: 'OUT+' },
      { x: 60, y:  15, id: 'OUT-' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // ─── VCVS / CCVS ─── 4 pins: CTRL+, CTRL-, OUT+, OUT-
  if (comp.type === 'VCVS' || comp.type === 'CCVS') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:  0, y: -15, id: 'CTRL+' },
      { x:  0, y:  15, id: 'CTRL-' },
      { x: 60, y: -15, id: 'OUT+'  },
      { x: 60, y:  15, id: 'OUT-'  },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // â”€â”€ Instrumentation Amplifier â€” 4 pins (gain via inspector value)
  if (comp.type === 'InstAmp') {
    const rad = (comp.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const rawPins = [
      { x:  0, y: -15, id: 'IN+' },
      { x:  0, y:  15, id: 'IN-' },
      { x: 30, y: -30, id: 'REF' },
      { x: 60, y:   0, id: 'OUT' },
    ];
    return rawPins.map(pin => {
      const sx = pin.x * 1.5; const sy = pin.y * 1.5;
      const rx = sx * cos - sy * sin; const ry = sx * sin + sy * cos;
      return { id: pin.id, gridNode: toGridNode({ x: comp.position.x + rx, y: comp.position.y + ry }), p: { x: comp.position.x + rx, y: comp.position.y + ry } };
    });
  }

  // Use KiCad symbol data for accurate multi-pin resolution fallback
  const symbolName = 
    comp.type === 'Transformer' ? 'Transformer_1P_1S' :
    null;

  if (!symbolName) return [];

  // @ts-ignore
  const symDef = symbolsData[symbolName];
  if (!symDef || !symDef.pins) return [];

  const SCALE = 0.3; // 0.2 original * 1.5 UI scale
  return symDef.pins.map((pin: any, i: number) => {
    const px = pin.x * SCALE;
    const py = -pin.y * SCALE;
    const len = pin.length * SCALE;
    let nodeX = px;
    let nodeY = py;

    if (pin.orientation === 'U') nodeY = py - len;
    else if (pin.orientation === 'D') nodeY = py + len;
    else if (pin.orientation === 'L') nodeX = px - len;
    else if (pin.orientation === 'R') nodeX = px + len;

    const rad = (comp.rotation || 0) * Math.PI / 180;
    const rotX = nodeX * Math.cos(rad) - nodeY * Math.sin(rad);
    const rotY = nodeX * Math.sin(rad) + nodeY * Math.cos(rad);
    const absX = comp.position.x + rotX;
    const absY = comp.position.y + rotY;

    return {
      id: pin.name || `${i + 1}`,
      gridNode: toGridNode({ x: absX, y: absY }),
      p: { x: absX, y: absY }
    };
  });
}
