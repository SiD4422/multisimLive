/**
 * Standard Component Definitions for NodeSim
 * Defines component types, metadata, default properties, schematic symbols, and pins.
 */

export interface ComponentPinDef {
  id?: string;
  name: string;
  x: number;
  y: number;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'Logic Gates' | 'Integrated Circuits' | 'Sources & Switches' | 'Passive Components' | string;
  description: string;
  defaultProps: Record<string, any>;
  symbol: string;
  pins: ComponentPinDef[];
}

export const standardICLibrary: ComponentDefinition[] = [
  // Group A: Standard Logic Gates (74xx Series)
  {
    id: 'logic_nand2',
    name: 'NAND Gate (7400)',
    category: 'Logic Gates',
    description: 'Quad 2-input NAND gate (7400 package). Outputs LOW (0V) only when both inputs are HIGH (>1.5V).',
    defaultProps: { value: '7400' },
    symbol: 'logic_nand2',
    pins: [
      { id: 'A', name: 'A', x: 0, y: -10 },
      { id: 'B', name: 'B', x: 0, y: 10 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },
  {
    id: 'logic_nor2',
    name: 'NOR Gate (7402)',
    category: 'Logic Gates',
    description: 'Quad 2-input NOR gate (7402 package). Outputs LOW (0V) when at least one input is HIGH (>1.5V).',
    defaultProps: { value: '7402' },
    symbol: 'logic_nor2',
    pins: [
      { id: 'A', name: 'A', x: 0, y: -10 },
      { id: 'B', name: 'B', x: 0, y: 10 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },
  {
    id: 'logic_not',
    name: 'Inverter (7404)',
    category: 'Logic Gates',
    description: 'Hex Inverter (7404 package). Inverts input logic level with 1.5V threshold.',
    defaultProps: { value: '7404' },
    symbol: 'logic_not',
    pins: [
      { id: 'A', name: 'A', x: 0, y: 0 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },
  {
    id: 'logic_and2',
    name: 'AND Gate (7408)',
    category: 'Logic Gates',
    description: 'Quad 2-input AND gate (7408 package). Outputs HIGH (5V) only when both inputs are HIGH (>1.5V).',
    defaultProps: { value: '7408' },
    symbol: 'logic_and2',
    pins: [
      { id: 'A', name: 'A', x: 0, y: -10 },
      { id: 'B', name: 'B', x: 0, y: 10 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },
  {
    id: 'logic_or2',
    name: 'OR Gate (7432)',
    category: 'Logic Gates',
    description: 'Quad 2-input OR gate (7432 package). Outputs HIGH (5V) when at least one input is HIGH (>1.5V).',
    defaultProps: { value: '7432' },
    symbol: 'logic_or2',
    pins: [
      { id: 'A', name: 'A', x: 0, y: -10 },
      { id: 'B', name: 'B', x: 0, y: 10 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },
  {
    id: 'logic_xor2',
    name: 'XOR Gate (7486)',
    category: 'Logic Gates',
    description: 'Quad 2-input XOR gate (7486 package). Outputs HIGH (5V) when exactly one input is HIGH.',
    defaultProps: { value: '7486' },
    symbol: 'logic_xor2',
    pins: [
      { id: 'A', name: 'A', x: 0, y: -10 },
      { id: 'B', name: 'B', x: 0, y: 10 },
      { id: 'Y', name: 'Y', x: 55, y: 0 },
      { id: 'GND', name: 'GND', x: 25, y: 25 }
    ]
  },

  // Group B: Core Linear ICs
  {
    id: 'ic_lm358',
    name: 'LM358 Dual Op-Amp',
    category: 'Integrated Circuits',
    description: 'LM358 Dual Low-Power Operational Amplifier. Contains two independent high-gain frequency-compensated op-amps.',
    defaultProps: { value: 'LM358' },
    symbol: 'ic_lm358',
    pins: [
      { id: 'IN1+', name: 'IN1+', x: -15, y: -25 },
      { id: 'IN1-', name: 'IN1-', x: -15, y: -10 },
      { id: 'OUT1', name: 'OUT1', x: 75, y: -18 },
      { id: 'IN2+', name: 'IN2+', x: -15, y: 10 },
      { id: 'IN2-', name: 'IN2-', x: -15, y: 25 },
      { id: 'OUT2', name: 'OUT2', x: 75, y: 18 },
      { id: 'VCC', name: 'VCC', x: 30, y: -45 },
      { id: 'GND', name: 'GND', x: 30, y: 45 }
    ]
  },
  {
    id: 'ic_lm555',
    name: 'LM555 Precision Timer',
    category: 'Integrated Circuits',
    description: 'LM555 monolithic timing circuit capable of producing accurate time delays or oscillation.',
    defaultProps: { value: 'NE555' },
    symbol: 'ic_lm555',
    pins: [
      { id: 'GND', name: 'GND', x: 30, y: 50 },
      { id: 'TRIG', name: 'TRIG', x: -15, y: -15 },
      { id: 'OUT', name: 'OUT', x: 75, y: -10 },
      { id: 'RESET', name: 'RESET', x: -15, y: -30 },
      { id: 'VCC', name: 'VCC', x: 30, y: -50 },
      { id: 'DIS', name: 'DIS', x: 75, y: 15 },
      { id: 'THR', name: 'THR', x: -15, y: 15 },
      { id: 'CTRL', name: 'CTRL', x: -15, y: 0 }
    ]
  },
  {
    id: 'ic_lm317',
    name: 'LM317 Adjustable Regulator',
    category: 'Integrated Circuits',
    description: 'LM317 3-terminal adjustable positive voltage regulator capable of supplying over 1.5A over an output range of 1.25V to 37V.',
    defaultProps: { value: 'LM317' },
    symbol: 'ic_lm317',
    pins: [
      { id: 'ADJ', name: 'ADJ', x: 30, y: 25 },
      { id: 'OUT', name: 'OUT', x: 60, y: 0 },
      { id: 'IN', name: 'IN', x: 0, y: 0 }
    ]
  },
  {
    id: 'ic_zener_ref',
    name: 'TL431 Shunt Regulator',
    category: 'Integrated Circuits',
    description: 'TL431 programmable precision shunt regulator with thermal stability over temperature.',
    defaultProps: { value: 'TL431' },
    symbol: 'ic_zener_ref',
    pins: [
      { id: 'REF', name: 'REF', x: 0, y: 0 },
      { id: 'CATHODE', name: 'CATHODE', x: 30, y: -25 },
      { id: 'ANODE', name: 'ANODE', x: 30, y: 25 }
    ]
  },

  // Group C: Switches & Electromechanical
  {
    id: 'switch_spst',
    name: 'SPST Switch',
    category: 'Sources & Switches',
    description: 'Single-pole single-throw switch. Click on canvas to toggle open/closed.',
    defaultProps: {
      closed: false,   // boolean: false = open (OFF), true = closed (ON)
      r_on: 0.001,     // on-state resistance in ohms
      r_off: 1e8,      // off-state resistance in ohms
    },
    pins: [
      { id: 'A', name: 'A', x: -20, y: 0 },
      { id: 'B', name: 'B', x: 20, y: 0 },
    ],
    symbol: 'switch_spst',
  },

  // Group D: Variable Passives
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'Passive Components',
    description: 'Variable resistor (pot). Adjust wiper position (0-100%) in Component Inspector.',
    defaultProps: {
      total_resistance: 10000,  // total resistance in ohms (10kΩ default)
      wiper_position: 50,       // percentage 0-100
    },
    pins: [
      { id: 'A', name: 'A', x: -20, y: 0 },    // top terminal
      { id: 'W', name: 'W', x: 0, y: 20 },     // wiper
      { id: 'B', name: 'B', x: 20, y: 0 },     // bottom terminal
    ],
    symbol: 'potentiometer',
  },

  // Group E: Discrete Semiconductors (BJT & MOSFET)
  {
    id: 'bjt_npn',
    name: 'NPN Transistor (2N2222)',
    category: 'Passive Components',
    description: 'NPN bipolar junction transistor (2N2222 / BC547). General-purpose switching and amplification. Pins: Base (B), Collector (C), Emitter (E).',
    defaultProps: { value: '2N2222', is: 1e-14, bf: 200 },
    symbol: 'bjt_npn',
    pins: [
      { id: 'B', name: 'B', x: 0,  y: 0  },   // Base - left
      { id: 'C', name: 'C', x: 25, y: -20 },  // Collector - top right
      { id: 'E', name: 'E', x: 25, y: 20  },  // Emitter - bottom right
    ],
  },
  {
    id: 'bjt_pnp',
    name: 'PNP Transistor (2N2907)',
    category: 'Passive Components',
    description: 'PNP bipolar junction transistor (2N2907 / BC557). General-purpose switching. Pins: Base (B), Collector (C), Emitter (E).',
    defaultProps: { value: '2N2907', is: 1e-14, bf: 150 },
    symbol: 'bjt_pnp',
    pins: [
      { id: 'B', name: 'B', x: 0,  y: 0  },   // Base
      { id: 'C', name: 'C', x: 25, y: -20 },  // Collector
      { id: 'E', name: 'E', x: 25, y: 20  },  // Emitter
    ],
  },
  {
    id: 'mosfet_n',
    name: 'N-Ch MOSFET (2N7000)',
    category: 'Passive Components',
    description: 'N-Channel enhancement-mode MOSFET (2N7000). Vth ≈ 2V, low on-resistance. Pins: Gate (G), Drain (D), Source (S).',
    defaultProps: { value: '2N7000', vth: 2.0, kp: 0.5 },
    symbol: 'mosfet_n',
    pins: [
      { id: 'G', name: 'G', x: 0,  y: 0  },   // Gate
      { id: 'D', name: 'D', x: 25, y: -20 },  // Drain
      { id: 'S', name: 'S', x: 25, y: 20  },  // Source
    ],
  },
  {
    id: 'mosfet_p',
    name: 'P-Ch MOSFET (IRF9540)',
    category: 'Passive Components',
    description: 'P-Channel enhancement-mode MOSFET (IRF9540). Vth ≈ -4V. Pins: Gate (G), Drain (D), Source (S).',
    defaultProps: { value: 'IRF9540', vth: -4.0, kp: 0.5 },
    symbol: 'mosfet_p',
    pins: [
      { id: 'G', name: 'G', x: 0,  y: 0  },   // Gate
      { id: 'D', name: 'D', x: 25, y: -20 },  // Drain
      { id: 'S', name: 'S', x: 25, y: 20  },  // Source
    ],
  },
  {
    id: 'schottky_diode',
    name: 'Schottky Diode (1N5819)',
    category: 'Passive Components',
    description: '1N5819 Schottky barrier diode. Low forward voltage drop (≈0.3V), fast switching. Ideal for rectifiers and protection circuits.',
    defaultProps: { value: '1N5819', vf: 0.3 },
    symbol: 'schottky_diode',
    pins: [
      { id: 'A', name: 'A', x: 0,  y: 0 },   // Anode
      { id: 'K', name: 'K', x: 60, y: 0 },   // Cathode
    ],
  },

  // Group F: Additional Linear ICs
  {
    id: 'ic_lm741',
    name: 'LM741 Op-Amp',
    category: 'Integrated Circuits',
    description: 'UA741 / LM741 single general-purpose operational amplifier. Rail-to-rail output swing limited to ±(VCC-1.5V). 5 pins: IN+, IN-, VCC, VEE, OUT.',
    defaultProps: { value: 'LM741' },
    symbol: 'ic_lm741',
    pins: [
      { id: 'INP', name: 'IN+', x: -15, y: -15 },
      { id: 'INM', name: 'IN-', x: -15, y:  15 },
      { id: 'VCC', name: 'VCC', x:  30, y: -35 },
      { id: 'VEE', name: 'VEE', x:  30, y:  35 },
      { id: 'OUT', name: 'OUT', x:  60, y:   0 },
    ],
  },
  {
    id: 'ic_lm324',
    name: 'LM324 Quad Op-Amp',
    category: 'Integrated Circuits',
    description: 'LM324 Quad Low-Power Op-Amp. Four independent op-amps in one 14-pin DIP package. Shown as a single-channel symbol; use multiple instances for more channels.',
    defaultProps: { value: 'LM324' },
    symbol: 'ic_lm324',
    pins: [
      { id: 'IN1P', name: 'IN1+', x: -15, y: -25 },
      { id: 'IN1M', name: 'IN1-', x: -15, y: -10 },
      { id: 'OUT1', name: 'OUT1', x:  75, y: -18 },
      { id: 'IN2P', name: 'IN2+', x: -15, y:  10 },
      { id: 'IN2M', name: 'IN2-', x: -15, y:  25 },
      { id: 'OUT2', name: 'OUT2', x:  75, y:  18 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -45 },
      { id: 'GND',  name: 'GND',  x:  30, y:  45 },
    ],
  },
  {
    id: 'ic_ne5532',
    name: 'NE5532 Dual Low-Noise Op-Amp',
    category: 'Integrated Circuits',
    description: 'NE5532 Dual Low-Noise High-Speed Op-Amp. Widely used in audio pre-amplifiers and active filters. Equivalent dual structure to LM358 with lower noise floor.',
    defaultProps: { value: 'NE5532' },
    symbol: 'ic_ne5532',
    pins: [
      { id: 'IN1P', name: 'IN1+', x: -15, y: -25 },
      { id: 'IN1M', name: 'IN1-', x: -15, y: -10 },
      { id: 'OUT1', name: 'OUT1', x:  75, y: -18 },
      { id: 'IN2P', name: 'IN2+', x: -15, y:  10 },
      { id: 'IN2M', name: 'IN2-', x: -15, y:  25 },
      { id: 'OUT2', name: 'OUT2', x:  75, y:  18 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -45 },
      { id: 'GND',  name: 'GND',  x:  30, y:  45 },
    ],
  },
  {
    id: 'ic_7474',
    name: 'D Flip-Flop (7474)',
    category: 'Integrated Circuits',
    description: '74LS74 / 74HC74 Dual D-Type Positive-Edge-Triggered Flip-Flop. Clocks data on rising edge. Includes active-low PRE and CLR asynchronous controls.',
    defaultProps: { value: '7474' },
    symbol: 'ic_7474',
    pins: [
      { id: 'D',    name: 'D',    x: -15, y: -20 },
      { id: 'CLK',  name: 'CLK', x: -15, y:   0 },
      { id: 'PRE',  name: '/PRE', x: -15, y:  20 },
      { id: 'CLR',  name: '/CLR', x:  30, y:  35 },
      { id: 'Q',    name: 'Q',   x:  75, y: -15 },
      { id: 'QB',   name: '/Q',  x:  75, y:  15 },
      { id: 'VCC',  name: 'VCC', x:  30, y: -45 },
      { id: 'GND',  name: 'GND', x:  30, y:  45 },
    ],
  },
  {
    id: 'ic_l293d',
    name: 'L293D Motor Driver',
    category: 'Integrated Circuits',
    description: 'L293D Push-Pull Four-Channel Motor Driver with internal flyback diodes. Drives up to 600mA per channel, 4.5V–36V motor supply. Ideal for DC and stepper motors.',
    defaultProps: { value: 'L293D' },
    symbol: 'ic_l293d',
    pins: [
      { id: 'EN1',  name: 'EN1',  x: -15, y: -35 },
      { id: 'IN1',  name: 'IN1',  x: -15, y: -20 },
      { id: 'OUT1', name: 'OUT1', x:  75, y: -20 },
      { id: 'OUT2', name: 'OUT2', x:  75, y:   0 },
      { id: 'IN2',  name: 'IN2',  x: -15, y:   0 },
      { id: 'VCC1', name: 'VCC1', x:  30, y: -55 },
      { id: 'VCC2', name: 'VCC2', x:  30, y: -45 },
      { id: 'GND',  name: 'GND',  x:  30, y:  55 },
    ],
  },
];
