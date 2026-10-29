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

  // Group G: Common Discrete Diodes & Passives
  {
    id: 'led',
    name: 'LED',
    category: 'Passive Components',
    description: 'Light Emitting Diode. Forward voltage ≈ 2V (red). Use a series resistor (220Ω–1kΩ) to limit current. Standard 2-pin anode/cathode.',
    defaultProps: { value: 'LED', vf: 2.0, color: 'red' },
    symbol: 'led',
    pins: [
      { id: 'A', name: 'A', x: 0,  y: 0 },  // Anode
      { id: 'K', name: 'K', x: 60, y: 0 },  // Cathode
    ],
  },
  {
    id: 'zener_diode',
    name: 'Zener Diode (5.1V)',
    category: 'Passive Components',
    description: 'BZX55C5V1 5.1V Zener diode. Conducts in reverse above the breakdown voltage. Used for voltage clamping and regulation.',
    defaultProps: { value: '5.1V', vz: 5.1 },
    symbol: 'zener_diode',
    pins: [
      { id: 'A', name: 'A', x: 0,  y: 0 },  // Anode
      { id: 'K', name: 'K', x: 60, y: 0 },  // Cathode
    ],
  },
  {
    id: 'crystal',
    name: 'Quartz Crystal (XTAL)',
    category: 'Passive Components',
    description: 'Quartz crystal oscillator. Provides a highly stable reference frequency. Modelled as a series RLC with parallel plate capacitor. Default 16 MHz.',
    defaultProps: { value: '16MHz', freq: 16e6 },
    symbol: 'crystal',
    pins: [
      { id: 'P1', name: 'P1', x: 0,  y: 0 },
      { id: 'P2', name: 'P2', x: 60, y: 0 },
    ],
  },
  {
    id: 'variable_capacitor',
    name: 'Variable Capacitor (Trimmer)',
    category: 'Passive Components',
    description: 'Variable (trimmer) capacitor. Adjust capacitance (1pF–100pF) in Component Inspector. Used for tuning and fine frequency adjustment.',
    defaultProps: { capacitance: 30e-12, min_cap: 1e-12, max_cap: 100e-12 },
    symbol: 'variable_capacitor',
    pins: [
      { id: 'P1', name: 'P1', x: 0,  y: 0 },
      { id: 'P2', name: 'P2', x: 60, y: 0 },
    ],
  },
  {
    id: 'relay_spdt',
    name: 'SPDT Relay (5V)',
    category: 'Sources & Switches',
    description: '5V SPDT electromagnetic relay. Coil energises at ≥3.5V between COIL+ and COIL-. COM switches to NO (normally open) when active, NC (normally closed) when off.',
    defaultProps: { value: '5V Relay', coil_resistance: 70 },
    symbol: 'relay_spdt',
    pins: [
      { id: 'COIL_P', name: 'COIL+', x: -20, y: -15 },
      { id: 'COIL_N', name: 'COIL-', x: -20, y:  15 },
      { id: 'COM',    name: 'COM',   x:  60, y:   0 },
      { id: 'NO',     name: 'NO',    x:  60, y: -20 },
      { id: 'NC',     name: 'NC',    x:  60, y:  20 },
    ],
  },

  // Group H: Additional ICs
  {
    id: 'ic_lm386',
    name: 'LM386 Audio Amplifier',
    category: 'Integrated Circuits',
    description: 'LM386 Low-Voltage Audio Power Amplifier. Voltage gain from 20 to 200 (set by pins 1 & 8). Output drives 8Ω speaker directly. Single 5V–12V supply.',
    defaultProps: { value: 'LM386', gain: 20 },
    symbol: 'ic_lm386',
    pins: [
      { id: 'INP',  name: 'IN+',  x: -15, y: -20 },
      { id: 'INM',  name: 'IN-',  x: -15, y:   0 },
      { id: 'VS',   name: 'VS',   x:  30, y: -45 },
      { id: 'GND',  name: 'GND',  x:  30, y:  45 },
      { id: 'OUT',  name: 'OUT',  x:  75, y:   0 },
      { id: 'GAIN', name: 'GAIN', x:  30, y:  30 },
    ],
  },
  {
    id: 'ic_lm393',
    name: 'LM393 Dual Comparator',
    category: 'Integrated Circuits',
    description: 'LM393 Dual Differential Comparator. Open-collector output requires a pull-up resistor. Operates from ±1.5V to ±18V supply.',
    defaultProps: { value: 'LM393' },
    symbol: 'ic_lm393',
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
    id: 'ic_7490',
    name: 'Decade Counter (7490)',
    category: 'Integrated Circuits',
    description: '74LS90 Asynchronous Decade Counter (BCD). Counts 0–9 on rising edge of CLK. RESET inputs (R01/R02) force output to 0; SET inputs (R91/R92) force output to 9.',
    defaultProps: { value: '7490' },
    symbol: 'ic_7490',
    pins: [
      { id: 'CLKA', name: 'CLKA', x: -15, y: -30 },
      { id: 'CLKB', name: 'CLKB', x: -15, y: -15 },
      { id: 'R01',  name: 'R01',  x: -15, y:   0 },
      { id: 'R02',  name: 'R02',  x: -15, y:  15 },
      { id: 'QA',   name: 'QA',   x:  75, y: -30 },
      { id: 'QB',   name: 'QB',   x:  75, y: -15 },
      { id: 'QC',   name: 'QC',   x:  75, y:   0 },
      { id: 'QD',   name: 'QD',   x:  75, y:  15 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -50 },
      { id: 'GND',  name: 'GND',  x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_uln2003',
    name: 'ULN2003 Darlington Array',
    category: 'Integrated Circuits',
    description: 'ULN2003A Seven-Channel Darlington Transistor Array. Each channel handles up to 500mA / 50V. Internal flyback diodes protect against inductive loads (relays, steppers).',
    defaultProps: { value: 'ULN2003' },
    symbol: 'ic_uln2003',
    pins: [
      { id: 'IN1',  name: 'IN1',  x: -15, y: -30 },
      { id: 'IN2',  name: 'IN2',  x: -15, y: -15 },
      { id: 'IN3',  name: 'IN3',  x: -15, y:   0 },
      { id: 'IN4',  name: 'IN4',  x: -15, y:  15 },
      { id: 'OUT1', name: 'OUT1', x:  75, y: -30 },
      { id: 'OUT2', name: 'OUT2', x:  75, y: -15 },
      { id: 'OUT3', name: 'OUT3', x:  75, y:   0 },
      { id: 'OUT4', name: 'OUT4', x:  75, y:  15 },
      { id: 'COM',  name: 'COM',  x:  30, y: -50 },
      { id: 'GND',  name: 'GND',  x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_74hc595',
    name: '74HC595 Shift Register',
    category: 'Integrated Circuits',
    description: '74HC595 8-Bit Serial-In Parallel-Out Shift Register with output latch. SPI-compatible. Cascade multiple chips via Q7S for wide parallel output from 3 MCU pins.',
    defaultProps: { value: '74HC595' },
    symbol: 'ic_74hc595',
    pins: [
      { id: 'SER',   name: 'SER',   x: -15, y: -35 },
      { id: 'SRCLK', name: 'SRCLK', x: -15, y: -20 },
      { id: 'RCLK',  name: 'RCLK',  x: -15, y:  -5 },
      { id: 'SRCLR', name: '/SRCLR',x: -15, y:  10 },
      { id: 'OE',    name: '/OE',   x: -15, y:  25 },
      { id: 'Q7S',   name: 'Q7S',   x:  75, y:  25 },
      { id: 'VCC',   name: 'VCC',   x:  30, y: -50 },
      { id: 'GND',   name: 'GND',   x:  30, y:  50 },
    ],
  },

  // Group I: Fixed Voltage Regulators (78xx series)
  {
    id: 'ic_7805',
    name: '7805 Fixed +5V Regulator',
    category: 'Integrated Circuits',
    description: 'LM7805 fixed +5V linear voltage regulator. Input 7V–35V, output 5V / 1A. 3-pin TO-220: IN, GND, OUT. Add input/output bypass capacitors (0.1µF–10µF) for stability.',
    defaultProps: { value: '7805', vout: 5 },
    symbol: 'ic_7805',
    pins: [
      { id: 'IN',  name: 'IN',  x:  0, y: 0  },
      { id: 'GND', name: 'GND', x: 30, y: 25 },
      { id: 'OUT', name: 'OUT', x: 60, y: 0  },
    ],
  },
  {
    id: 'ic_7812',
    name: '7812 Fixed +12V Regulator',
    category: 'Integrated Circuits',
    description: 'LM7812 fixed +12V linear voltage regulator. Input 14.5V–35V, output 12V / 1A. 3-pin TO-220. Requires input/output decoupling capacitors.',
    defaultProps: { value: '7812', vout: 12 },
    symbol: 'ic_7812',
    pins: [
      { id: 'IN',  name: 'IN',  x:  0, y: 0  },
      { id: 'GND', name: 'GND', x: 30, y: 25 },
      { id: 'OUT', name: 'OUT', x: 60, y: 0  },
    ],
  },

  // Group J: Sensors & Special Passives
  {
    id: 'thermistor',
    name: 'NTC Thermistor (10kΩ)',
    category: 'Passive Components',
    description: 'NTC (Negative Temperature Coefficient) thermistor. Resistance decreases as temperature increases. R25 = 10kΩ at 25°C, B-constant = 3950K. Used in temperature sensing voltage dividers.',
    defaultProps: { resistance: 10000, b_constant: 3950, temp_c: 25 },
    symbol: 'thermistor',
    pins: [
      { id: 'P1', name: 'P1', x: 0,  y: 0 },
      { id: 'P2', name: 'P2', x: 60, y: 0 },
    ],
  },

  // Group K: Additional ICs
  {
    id: 'ic_7447',
    name: 'BCD to 7-Seg Decoder (7447)',
    category: 'Integrated Circuits',
    description: '74LS47 BCD-to-Seven-Segment Decoder/Driver. Active-low open-collector outputs. Drives common-anode 7-segment displays directly. Pins: A–D (BCD inputs), a–g (segment outputs), /LT, /RBI, /BI.',
    defaultProps: { value: '7447' },
    symbol: 'ic_7447',
    pins: [
      { id: 'A',   name: 'A',    x: -15, y: -35 },
      { id: 'B',   name: 'B',    x: -15, y: -20 },
      { id: 'C',   name: 'C',    x: -15, y:  -5 },
      { id: 'D',   name: 'D',    x: -15, y:  10 },
      { id: 'oa',  name: 'a',    x:  75, y: -35 },
      { id: 'ob',  name: 'b',    x:  75, y: -22 },
      { id: 'oc',  name: 'c',    x:  75, y:  -9 },
      { id: 'od',  name: 'd',    x:  75, y:   4 },
      { id: 'oe',  name: 'e',    x:  75, y:  17 },
      { id: 'of',  name: 'f',    x:  75, y:  30 },
      { id: 'og',  name: 'g',    x:  75, y:  43 },
      { id: 'VCC', name: 'VCC',  x:  30, y: -55 },
      { id: 'GND', name: 'GND',  x:  30, y:  55 },
    ],
  },
  {
    id: 'ic_74hc245',
    name: '74HC245 Octal Bus Transceiver',
    category: 'Integrated Circuits',
    description: '74HC245 Octal 3-State Non-Inverting Bus Transceiver. DIR pin controls data flow direction (A→B or B→A). /OE enables the outputs. Used for bus buffering between 3.3V and 5V logic.',
    defaultProps: { value: '74HC245' },
    symbol: 'ic_74hc245',
    pins: [
      { id: 'DIR', name: 'DIR', x: -15, y: -35 },
      { id: 'OE',  name: '/OE', x: -15, y: -20 },
      { id: 'A1',  name: 'A1',  x: -15, y:  -5 },
      { id: 'A2',  name: 'A2',  x: -15, y:  10 },
      { id: 'B1',  name: 'B1',  x:  75, y:  -5 },
      { id: 'B2',  name: 'B2',  x:  75, y:  10 },
      { id: 'VCC', name: 'VCC', x:  30, y: -50 },
      { id: 'GND', name: 'GND', x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_max232',
    name: 'MAX232 RS-232 Converter',
    category: 'Integrated Circuits',
    description: 'MAX232 Dual EIA-232 Driver/Receiver. Converts TTL/CMOS logic (0V/5V) to RS-232 levels (±12V) and vice versa. Requires four 1µF charge-pump capacitors (C1–C4). Used in serial UART communication.',
    defaultProps: { value: 'MAX232' },
    symbol: 'ic_max232',
    pins: [
      { id: 'T1IN',  name: 'T1IN',  x: -15, y: -30 },
      { id: 'T2IN',  name: 'T2IN',  x: -15, y: -15 },
      { id: 'R1OUT', name: 'R1OUT', x: -15, y:   0 },
      { id: 'R2OUT', name: 'R2OUT', x: -15, y:  15 },
      { id: 'T1OUT', name: 'T1OUT', x:  75, y: -30 },
      { id: 'T2OUT', name: 'T2OUT', x:  75, y: -15 },
      { id: 'R1IN',  name: 'R1IN',  x:  75, y:   0 },
      { id: 'R2IN',  name: 'R2IN',  x:  75, y:  15 },
      { id: 'VCC',   name: 'VCC',   x:  30, y: -50 },
      { id: 'GND',   name: 'GND',   x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_tl074',
    name: 'TL074 Quad JFET Op-Amp',
    category: 'Integrated Circuits',
    description: 'TL074 Quad JFET-Input Operational Amplifier. Low input bias current (<200pA), low noise. Wide bandwidth (3MHz). Ideal for audio, active filters, and signal conditioning.',
    defaultProps: { value: 'TL074' },
    symbol: 'ic_tl074',
    pins: [
      { id: 'IN1P', name: 'IN1+', x: -15, y: -25 },
      { id: 'IN1M', name: 'IN1-', x: -15, y: -10 },
      { id: 'OUT1', name: 'OUT1', x:  75, y: -18 },
      { id: 'IN2P', name: 'IN2+', x: -15, y:  10 },
      { id: 'IN2M', name: 'IN2-', x: -15, y:  25 },
      { id: 'OUT2', name: 'OUT2', x:  75, y:  18 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -45 },
      { id: 'VEE',  name: 'VEE',  x:  30, y:  45 },
    ],
  },
  {
    id: 'ic_ad620',
    name: 'AD620 Instrumentation Amplifier',
    category: 'Integrated Circuits',
    description: 'AD620 Low-Cost Low-Power Instrumentation Amplifier. Gain set by a single external resistor (G = 1 + 49.4kΩ/Rg). Gain range 1–1000. Excellent CMRR (100dB). Ideal for sensor bridge amplification.',
    defaultProps: { value: 'AD620', gain: 10 },
    symbol: 'ic_ad620',
    pins: [
      { id: 'INP',  name: 'IN+',  x: -15, y: -20 },
      { id: 'INM',  name: 'IN-',  x: -15, y:  20 },
      { id: 'RG1',  name: 'RG1',  x:  30, y: -45 },
      { id: 'RG2',  name: 'RG2',  x:  30, y:  45 },
      { id: 'REF',  name: 'REF',  x:  75, y:  20 },
      { id: 'OUT',  name: 'OUT',  x:  75, y: -20 },
      { id: 'VCC',  name: 'VS+',  x:  30, y: -60 },
      { id: 'VEE',  name: 'VS-',  x:  30, y:  60 },
    ],
  },
  {
    id: 'ic_ne566',
    name: 'NE566 VCO',
    category: 'Integrated Circuits',
    description: 'NE566 Voltage-Controlled Oscillator. Generates simultaneous square and triangle wave outputs. Output frequency: f ≈ 2(VCC−Vc)/(R1·C1·VCC). Used in FM synthesis, modems, and tone generators.',
    defaultProps: { value: 'NE566' },
    symbol: 'ic_ne566',
    pins: [
      { id: 'GND',    name: 'GND',    x:  30, y:  50 },
      { id: 'MODV',   name: 'MOD',    x: -15, y:   0 },
      { id: 'SQOUT',  name: 'SQ OUT', x:  75, y: -15 },
      { id: 'TRIOUT', name: 'TRI OUT',x:  75, y:  15 },
      { id: 'RTIM',   name: 'R',      x: -15, y: -20 },
      { id: 'CTIM',   name: 'C',      x: -15, y:  20 },
      { id: 'VCC',    name: 'VCC',    x:  30, y: -50 },
    ],
  },
  {
    id: 'ic_cd4017',
    name: 'CD4017 Johnson Decade Counter',
    category: 'Integrated Circuits',
    description: 'CD4017B Johnson Decade Counter with 10 decoded outputs. Each clock pulse advances active HIGH output from Q0→Q9 sequentially. Used in LED chasers, frequency dividers, and sequencers.',
    defaultProps: { value: 'CD4017' },
    symbol: 'ic_cd4017',
    pins: [
      { id: 'CLK',   name: 'CLK',   x: -15, y: -35 },
      { id: 'CLKINH',name: 'CLKINH',x: -15, y: -20 },
      { id: 'RST',   name: 'RST',   x: -15, y:  -5 },
      { id: 'Q0',    name: 'Q0',    x:  75, y: -35 },
      { id: 'Q1',    name: 'Q1',    x:  75, y: -22 },
      { id: 'Q2',    name: 'Q2',    x:  75, y:  -9 },
      { id: 'Q3',    name: 'Q3',    x:  75, y:   4 },
      { id: 'Q4',    name: 'Q4',    x:  75, y:  17 },
      { id: 'CO',    name: 'CO',    x:  75, y:  30 },
      { id: 'VDD',   name: 'VDD',   x:  30, y: -50 },
      { id: 'VSS',   name: 'VSS',   x:  30, y:  50 },
    ],
  },

  // Group L: Isolation, Protection & Power
  {
    id: 'optocoupler_4n35',
    name: '4N35 Optocoupler',
    category: 'Integrated Circuits',
    description: '4N35 general-purpose phototransistor optocoupler. Electrically isolates input from output. LED input side (A/K) drives phototransistor output (C/E). CTR ≈ 100%. Use for logic-level isolation and noise-free signal crossing.',
    defaultProps: { value: '4N35' },
    symbol: 'optocoupler_4n35',
    pins: [
      { id: 'A',   name: 'A',  x: -20, y: -15 },   // LED Anode
      { id: 'K',   name: 'K',  x: -20, y:  15 },   // LED Cathode
      { id: 'C',   name: 'C',  x:  50, y: -15 },   // Transistor Collector
      { id: 'E',   name: 'E',  x:  50, y:  15 },   // Transistor Emitter
    ],
  },
  {
    id: 'varistor',
    name: 'MOV Varistor',
    category: 'Passive Components',
    description: 'Metal Oxide Varistor (MOV). Clamps voltage spikes above rated voltage (default 275VAC / 390V peak). Provides surge and transient protection for power supplies and AC lines.',
    defaultProps: { value: '275V', v_clamp: 390 },
    symbol: 'varistor',
    pins: [
      { id: 'P1', name: 'P1', x: 0,  y: 0 },
      { id: 'P2', name: 'P2', x: 60, y: 0 },
    ],
  },

  // Group M: Power Electronics & Motor Control
  {
    id: 'ic_lm2596',
    name: 'LM2596 Buck Converter',
    category: 'Integrated Circuits',
    description: 'LM2596 3A Step-Down (Buck) Switching Regulator. Input 4.5V–40V. Output adjustable 1.23V–37V. 150kHz switching frequency. Requires external LC filter and feedback resistors for regulation.',
    defaultProps: { value: 'LM2596', vout: 5.0 },
    symbol: 'ic_lm2596',
    pins: [
      { id: 'VIN',    name: 'VIN',    x: -15, y: -20 },
      { id: 'VOUT',   name: 'VOUT',   x:  75, y: -20 },
      { id: 'FB',     name: 'FB',     x:  75, y:  20 },
      { id: 'ON_OFF', name: 'ON/OFF', x: -15, y:  20 },
      { id: 'GND',    name: 'GND',    x:  30, y:  45 },
    ],
  },
  {
    id: 'ic_ir2110',
    name: 'IR2110 Gate Driver',
    category: 'Integrated Circuits',
    description: 'IR2110 High and Low Side Gate Driver. Drives power MOSFETs and IGBTs in half-bridge / full-bridge topologies. 10A output, 500V high-side bootstrap operation. Bootstrap capacitor on VB/VS pins.',
    defaultProps: { value: 'IR2110' },
    symbol: 'ic_ir2110',
    pins: [
      { id: 'HIN',  name: 'HIN',  x: -15, y: -30 },
      { id: 'LIN',  name: 'LIN',  x: -15, y: -15 },
      { id: 'SD',   name: 'SD',   x: -15, y:   0 },
      { id: 'VDD',  name: 'VDD',  x: -15, y:  15 },
      { id: 'HO',   name: 'HO',   x:  75, y: -30 },
      { id: 'VS',   name: 'VS',   x:  75, y: -15 },
      { id: 'VB',   name: 'VB',   x:  75, y:   0 },
      { id: 'LO',   name: 'LO',   x:  75, y:  15 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -50 },
      { id: 'COM',  name: 'COM',  x:  30, y:  50 },
    ],
  },

  // Group N: Sensors & Signal Processing
  {
    id: 'ic_acs712',
    name: 'ACS712 Current Sensor',
    category: 'Integrated Circuits',
    description: 'ACS712 Fully Integrated Hall-Effect Current Sensor. Measures ±5A, ±20A or ±30A (model dependent). Sensitivity 185mV/A (5A version). 2.1kVRMS isolation. Output Vout = 2.5V + 185mV×I.',
    defaultProps: { value: 'ACS712-05', sensitivity: 0.185 },
    symbol: 'ic_acs712',
    pins: [
      { id: 'IP1',  name: 'IP+',  x: -15, y: -15 },  // Current IN+
      { id: 'IP2',  name: 'IP-',  x: -15, y:  15 },  // Current IN-
      { id: 'VOUT', name: 'VOUT', x:  75, y:   0 },  // Analog voltage output
      { id: 'VCC',  name: 'VCC',  x:  30, y: -40 },
      { id: 'GND',  name: 'GND',  x:  30, y:  40 },
    ],
  },
  {
    id: 'ic_lm567',
    name: 'LM567 Tone Decoder',
    category: 'Integrated Circuits',
    description: 'LM567 Tone Decoder / Phase-Locked Loop. Output goes LOW when input frequency matches centre frequency set by R1 and C1 (f = 1/(1.1×R1×C1)). Used in tone detection, remote control, and DTMF decoding.',
    defaultProps: { value: 'LM567' },
    symbol: 'ic_lm567',
    pins: [
      { id: 'OUT',   name: 'OUT',   x:  75, y: -15 },
      { id: 'VCC',   name: 'VCC',   x:  30, y: -45 },
      { id: 'INP',   name: 'IN',    x: -15, y:   0 },
      { id: 'GND',   name: 'GND',   x:  30, y:  45 },
      { id: 'TC1',   name: 'C1',    x: -15, y: -20 },
      { id: 'TC2',   name: 'C2',    x: -15, y:  20 },
      { id: 'TIMR',  name: 'R',     x:  75, y:  15 },
    ],
  },

  // Group O: Digital Routing & Connectivity
  {
    id: 'ic_cd4051',
    name: 'CD4051 8-Ch Analog Mux',
    category: 'Integrated Circuits',
    description: 'CD4051B Single 8-Channel Analog Multiplexer/Demultiplexer. 3 address pins (A/B/C) select one of 8 channels (Y0–Y7) to connect to common (Z) pin. INH pin disables all channels. Bidirectional signal path.',
    defaultProps: { value: 'CD4051' },
    symbol: 'ic_cd4051',
    pins: [
      { id: 'A',   name: 'A',   x: -15, y: -35 },
      { id: 'B',   name: 'B',   x: -15, y: -20 },
      { id: 'C',   name: 'C',   x: -15, y:  -5 },
      { id: 'INH', name: 'INH', x: -15, y:  10 },
      { id: 'Z',   name: 'Z',   x:  75, y:   0 },
      { id: 'Y0',  name: 'Y0',  x:  75, y: -35 },
      { id: 'Y1',  name: 'Y1',  x:  75, y: -22 },
      { id: 'Y2',  name: 'Y2',  x:  75, y:  -9 },
      { id: 'Y3',  name: 'Y3',  x:  75, y:   4 },
      { id: 'VDD', name: 'VDD', x:  30, y: -50 },
      { id: 'VSS', name: 'VSS', x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_74hc32',
    name: 'Quad OR Gate (74HC32)',
    category: 'Logic Gates',
    description: '74HC32 Quad 2-Input OR Gate. Single-supply 2V–6V. Propagation delay 7ns (5V). High-speed CMOS. Shows one gate of four; connect VCC/GND to IC package supply rails.',
    defaultProps: { value: '74HC32' },
    symbol: 'ic_74hc32',
    pins: [
      { id: 'A',   name: 'A',   x:  0, y: -10 },
      { id: 'B',   name: 'B',   x:  0, y:  10 },
      { id: 'Y',   name: 'Y',   x: 55, y:   0 },
      { id: 'GND', name: 'GND', x: 25, y:  25 },
    ],
  },
  {
    id: 'ic_tca9548',
    name: 'TCA9548A I2C Multiplexer',
    category: 'Integrated Circuits',
    description: 'TCA9548A 8-Channel I2C Bus Switch/Multiplexer. Connects one master to up to 8 separate I2C buses. Channel selected by writing to device register via I2C (address 0x70–0x77). Solves address collision between identical sensors.',
    defaultProps: { value: 'TCA9548A' },
    symbol: 'ic_tca9548',
    pins: [
      { id: 'SDA',  name: 'SDA',  x: -15, y: -20 },
      { id: 'SCL',  name: 'SCL',  x: -15, y:  -5 },
      { id: 'RST',  name: '/RST', x: -15, y:  10 },
      { id: 'SD0',  name: 'SD0',  x:  75, y: -35 },
      { id: 'SC0',  name: 'SC0',  x:  75, y: -22 },
      { id: 'SD1',  name: 'SD1',  x:  75, y:  -9 },
      { id: 'SC1',  name: 'SC1',  x:  75, y:   4 },
      { id: 'VCC',  name: 'VCC',  x:  30, y: -50 },
      { id: 'GND',  name: 'GND',  x:  30, y:  50 },
    ],
  },
  {
    id: 'ic_atmega328',
    name: 'ATmega328P MCU',
    category: 'Integrated Circuits',
    description: 'Atmel ATmega328P 8-bit AVR Microcontroller (Arduino Uno brain). 32KB Flash, 2KB SRAM. 23 GPIO pins. Hardware UART, SPI, I2C. This symbol exposes a simplified 8-pin interface: power, UART, SPI, and RESET.',
    defaultProps: { value: 'ATmega328P' },
    symbol: 'ic_atmega328',
    pins: [
      { id: 'VCC',   name: 'VCC',   x:  30, y: -55 },
      { id: 'GND',   name: 'GND',   x:  30, y:  55 },
      { id: 'RESET', name: 'RESET', x: -15, y: -30 },
      { id: 'RXD',   name: 'RX',    x: -15, y: -15 },
      { id: 'TXD',   name: 'TX',    x: -15, y:   0 },
      { id: 'MOSI',  name: 'MOSI',  x:  75, y: -30 },
      { id: 'MISO',  name: 'MISO',  x:  75, y: -15 },
      { id: 'SCK',   name: 'SCK',   x:  75, y:   0 },
      { id: 'SDA',   name: 'SDA',   x: -15, y:  15 },
      { id: 'SCL',   name: 'SCL',   x: -15, y:  30 },
    ],
  },
  // ── BATCH 5 ────────────────────────────────────────────────────────────────
  {
    id: 'triac',
    name: 'TRIAC',
    category: 'Passive Components',
    description: 'Triode for Alternating Current (TRIAC). Bidirectional thyristor for AC power control. Triggered by a gate pulse on either half-cycle. Common in light dimmers, motor speed controllers, and heater regulators. Gate trigger current typically 10–50 mA.',
    defaultProps: { value: 'BT136' },
    symbol: 'triac',
    pins: [
      { id: 'MT1', name: 'MT1', x:   0, y:  25 },
      { id: 'MT2', name: 'MT2', x:   0, y: -25 },
      { id: 'G',   name: 'G',   x: -25, y:  15 },
    ],
  },
  {
    id: 'diac',
    name: 'DIAC',
    category: 'Passive Components',
    description: 'Diode for Alternating Current (DIAC). Bidirectional trigger diode. Conducts when the applied voltage exceeds the breakover voltage (~30–32V) in either direction. Commonly used to trigger TRIACs in dimmer circuits.',
    defaultProps: { value: 'DB3' },
    symbol: 'diac',
    pins: [
      { id: 'A1', name: 'A1', x: 0, y: -20 },
      { id: 'A2', name: 'A2', x: 0, y:  20 },
    ],
  },
  {
    id: 'igbt_n',
    name: 'IGBT (N-Channel)',
    category: 'Passive Components',
    description: 'N-Channel Insulated Gate Bipolar Transistor. Combines MOSFET gate drive with BJT output stage for high-power switching. Used in inverters, motor drives, and UPS systems. Switching frequency up to 100kHz. Vce(sat) ~1.5–3V.',
    defaultProps: { value: 'IRG4PC50W' },
    symbol: 'igbt_n',
    pins: [
      { id: 'G', name: 'G', x:   0, y:   0 },
      { id: 'C', name: 'C', x:  40, y: -30 },
      { id: 'E', name: 'E', x:  40, y:  30 },
    ],
  },
  {
    id: 'photo_resistor',
    name: 'Photo Resistor (LDR)',
    category: 'Passive Components',
    description: 'Light Dependent Resistor (LDR / Photoresistor). Resistance decreases with increasing light intensity. Typical range: 1MΩ in darkness to ~50Ω in bright sunlight. Used in light-sensing circuits, automatic street lights, and brightness-controlled devices.',
    defaultProps: { value: '10k' },
    symbol: 'photo_resistor',
    pins: [
      { id: 'P1', name: 'P1', x:  0, y: 0 },
      { id: 'P2', name: 'P2', x: 50, y: 0 },
    ],
  },
  {
    id: 'ic_lm311',
    name: 'LM311 Voltage Comparator',
    category: 'Integrated Circuits',
    description: 'LM311 Single Voltage Comparator. Open-collector output with separate output supply rail. Supply: ±15V or +5V single. Response time 200ns. Output can sink 50mA — drives TTL, CMOS, lamps, and relays directly.',
    defaultProps: { value: 'LM311' },
    symbol: 'ic_lm311',
    pins: [
      { id: 'INP', name: 'IN+', x:   0, y: -10 },
      { id: 'INN', name: 'IN−', x:   0, y:  10 },
      { id: 'OUT', name: 'OUT', x:  60, y:   0 },
      { id: 'VCC', name: 'V+',  x:  30, y: -30 },
      { id: 'VEE', name: 'V−',  x:  30, y:  30 },
      { id: 'GND', name: 'GND', x:  50, y:  30 },
    ],
  },
  {
    id: 'ic_l298n',
    name: 'L298N Dual H-Bridge',
    category: 'Integrated Circuits',
    description: 'L298N Dual Full-Bridge Motor Driver. Drives two DC motors or one stepper motor. Max 2A per channel, 46V supply. Logic supply 5V, motor supply 5–46V. Enable pins allow PWM speed control. Current sense resistors on each bridge.',
    defaultProps: { value: 'L298N' },
    symbol: 'ic_l298n',
    pins: [
      { id: 'IN1',   name: 'IN1',   x:  -15, y: -40 },
      { id: 'IN2',   name: 'IN2',   x:  -15, y: -25 },
      { id: 'ENA',   name: 'ENA',   x:  -15, y: -10 },
      { id: 'IN3',   name: 'IN3',   x:  -15, y:   5 },
      { id: 'IN4',   name: 'IN4',   x:  -15, y:  20 },
      { id: 'ENB',   name: 'ENB',   x:  -15, y:  35 },
      { id: 'OUT1',  name: 'OUT1',  x:   85, y: -35 },
      { id: 'OUT2',  name: 'OUT2',  x:   85, y: -20 },
      { id: 'OUT3',  name: 'OUT3',  x:   85, y:   5 },
      { id: 'OUT4',  name: 'OUT4',  x:   85, y:  20 },
      { id: 'VCC',   name: 'VCC',   x:   35, y: -60 },
      { id: 'VSS',   name: 'VSS',   x:   35, y:  60 },
      { id: 'GND',   name: 'GND',   x:   55, y:  60 },
    ],
  },
  {
    id: 'ic_74hc08',
    name: 'Quad AND Gate (74HC08)',
    category: 'Logic Gates',
    description: '74HC08 Quad 2-Input AND Gate. Single-supply 2V–6V. Propagation delay 7ns at 5V. High-speed CMOS. Shows one gate of four; connect VCC/GND to IC package supply rails.',
    defaultProps: { value: '74HC08' },
    symbol: 'ic_74hc08',
    pins: [
      { id: 'A',   name: 'A',   x:   0, y: -10 },
      { id: 'B',   name: 'B',   x:   0, y:  10 },
      { id: 'Y',   name: 'Y',   x:  55, y:   0 },
      { id: 'GND', name: 'GND', x:  25, y:  25 },
    ],
  },
  {
    id: 'ic_74hc00',
    name: 'Quad NAND Gate (74HC00)',
    category: 'Logic Gates',
    description: '74HC00 Quad 2-Input NAND Gate. Single-supply 2V–6V. Propagation delay 7ns at 5V. High-speed CMOS. Universal gate — any logic function can be built from NAND gates alone.',
    defaultProps: { value: '74HC00' },
    symbol: 'ic_74hc00',
    pins: [
      { id: 'A',   name: 'A',   x:   0, y: -10 },
      { id: 'B',   name: 'B',   x:   0, y:  10 },
      { id: 'Y',   name: 'Y',   x:  55, y:   0 },
      { id: 'GND', name: 'GND', x:  25, y:  25 },
    ],
  },
  {
    id: 'ic_ds18b20',
    name: 'DS18B20 Temp Sensor',
    category: 'Integrated Circuits',
    description: 'Maxim DS18B20 1-Wire Digital Temperature Sensor. Range: −55°C to +125°C, ±0.5°C accuracy. Programmable 9–12 bit resolution. Each device has unique 64-bit ROM code — multiple sensors on single wire. Parasitic or external 3V–5.5V supply.',
    defaultProps: { value: 'DS18B20' },
    symbol: 'ic_ds18b20',
    pins: [
      { id: 'GND', name: 'GND', x:  0, y: 30 },
      { id: 'DQ',  name: 'DQ',  x: 50, y:  0 },
      { id: 'VDD', name: 'VDD', x:  0, y:-30 },
    ],
  },
  {
    id: 'ic_sg3525',
    name: 'SG3525 PWM Controller',
    category: 'Integrated Circuits',
    description: 'SG3525A Pulse-Width Modulation (PWM) Controller. Fixed-frequency oscillator, dual totem-pole outputs (push-pull), deadband control, soft-start, and shutdown. Used in SMPS (switched-mode power supplies), inverters, and DC-DC converters. Supply 8V–35V.',
    defaultProps: { value: 'SG3525' },
    symbol: 'ic_sg3525',
    pins: [
      { id: 'INV',  name: 'INV',    x:  -15, y: -40 },
      { id: 'NINV', name: 'NINV',   x:  -15, y: -25 },
      { id: 'SYNC', name: 'SYNC',   x:  -15, y: -10 },
      { id: 'OSC',  name: 'OSC',    x:  -15, y:   5 },
      { id: 'SD',   name: 'SD',     x:  -15, y:  20 },
      { id: 'SS',   name: 'SS',     x:  -15, y:  35 },
      { id: 'OUTA', name: 'OUT-A',  x:   85, y: -35 },
      { id: 'OUTB', name: 'OUT-B',  x:   85, y: -20 },
      { id: 'VCC',  name: 'VCC',    x:   35, y: -60 },
      { id: 'GND',  name: 'GND',    x:   35, y:  60 },
      { id: 'VREF', name: 'VREF',   x:   85, y:  20 },
    ],
  },
  // ── BATCH 6 ────────────────────────────────────────────────────────────────
  {
    id: 'tunnel_diode',
    name: 'Tunnel Diode',
    category: 'Passive Components',
    description: 'Tunnel Diode (Esaki Diode). Exploits quantum mechanical tunnelling for negative differential resistance (NDR) region. Used in microwave oscillators, fast switches, and amplifiers. Peak current at ~100mV, valley at ~400mV.',
    defaultProps: { value: '1N3712' },
    symbol: 'tunnel_diode',
    pins: [
      { id: 'A', name: 'A', x:  0, y: 0 },
      { id: 'K', name: 'K', x: 55, y: 0 },
    ],
  },
  {
    id: 'ic_74hc04',
    name: 'Hex Inverter (74HC04)',
    category: 'Logic Gates',
    description: '74HC04 Hex Inverter (6× NOT gates). Single-supply 2V–6V. Propagation delay 7ns at 5V. High-speed CMOS. Shows one inverter of six; power supply pins shared across package.',
    defaultProps: { value: '74HC04' },
    symbol: 'ic_74hc04',
    pins: [
      { id: 'A',   name: 'A',   x:   0, y: 0 },
      { id: 'Y',   name: 'Y',   x:  55, y: 0 },
      { id: 'GND', name: 'GND', x:  25, y: 25 },
    ],
  },
  {
    id: 'ic_74hc138',
    name: '3-to-8 Decoder (74HC138)',
    category: 'Integrated Circuits',
    description: '74HC138 3-to-8 Line Decoder/Demultiplexer. 3 address inputs (A,B,C) select one of 8 active-low outputs. Three enable inputs (G1, /G2A, /G2B). Used in memory address decoding, device selection, and data routing.',
    defaultProps: { value: '74HC138' },
    symbol: 'ic_74hc138',
    pins: [
      { id: 'A',   name: 'A',    x:  -15, y: -45 },
      { id: 'B',   name: 'B',    x:  -15, y: -30 },
      { id: 'C',   name: 'C',    x:  -15, y: -15 },
      { id: 'G1',  name: 'G1',   x:  -15, y:   0 },
      { id: 'G2A', name: '/G2A', x:  -15, y:  15 },
      { id: 'G2B', name: '/G2B', x:  -15, y:  30 },
      { id: 'Y0',  name: 'Y0',   x:   85, y: -45 },
      { id: 'Y1',  name: 'Y1',   x:   85, y: -30 },
      { id: 'Y2',  name: 'Y2',   x:   85, y: -15 },
      { id: 'Y3',  name: 'Y3',   x:   85, y:   0 },
      { id: 'Y4',  name: 'Y4',   x:   85, y:  15 },
      { id: 'Y5',  name: 'Y5',   x:   85, y:  30 },
      { id: 'Y6',  name: 'Y6',   x:   85, y:  45 },
      { id: 'Y7',  name: 'Y7',   x:   85, y:  60 },
      { id: 'VCC', name: 'VCC',  x:   35, y: -70 },
      { id: 'GND', name: 'GND',  x:   35, y:  75 },
    ],
  },
  {
    id: 'ic_74hc148',
    name: '8-to-3 Encoder (74HC148)',
    category: 'Integrated Circuits',
    description: '74HC148 8-to-3 Priority Encoder. 8 active-low inputs, 3 active-low binary outputs (A0-A2). Priority: highest-numbered active input wins. Enable input (EI) and enable output (EO) for cascading. Used in interrupt controllers and keyboard encoders.',
    defaultProps: { value: '74HC148' },
    symbol: 'ic_74hc148',
    pins: [
      { id: 'I0', name: 'I0', x:  -15, y: -40 },
      { id: 'I1', name: 'I1', x:  -15, y: -25 },
      { id: 'I2', name: 'I2', x:  -15, y: -10 },
      { id: 'I3', name: 'I3', x:  -15, y:   5 },
      { id: 'I4', name: 'I4', x:  -15, y:  20 },
      { id: 'I5', name: 'I5', x:  -15, y:  35 },
      { id: 'I6', name: 'I6', x:  -15, y:  50 },
      { id: 'I7', name: 'I7', x:  -15, y:  65 },
      { id: 'EI', name: 'EI', x:  -15, y:  80 },
      { id: 'A0', name: 'A0', x:   85, y: -25 },
      { id: 'A1', name: 'A1', x:   85, y: -10 },
      { id: 'A2', name: 'A2', x:   85, y:   5 },
      { id: 'GS', name: 'GS', x:   85, y:  20 },
      { id: 'EO', name: 'EO', x:   85, y:  35 },
      { id: 'VCC', name: 'VCC', x:   35, y: -65 },
      { id: 'GND', name: 'GND', x:   35, y:  95 },
    ],
  },
  {
    id: 'ic_ne5534',
    name: 'NE5534 Low-Noise Op-Amp',
    category: 'Integrated Circuits',
    description: 'NE5534 Single Low-Noise, Low-Distortion Op-Amp. Input noise: 3.5 nV/√Hz. Unity-gain bandwidth 10MHz. Output current 38mA. Supply ±3V–±20V. Optimized for high-fidelity audio and precision instrumentation.',
    defaultProps: { value: 'NE5534' },
    symbol: 'ic_ne5534',
    pins: [
      { id: 'INP',  name: 'IN+',  x:   0, y: -10 },
      { id: 'INN',  name: 'IN−',  x:   0, y:  10 },
      { id: 'OUT',  name: 'OUT',  x:  60, y:   0 },
      { id: 'VCC',  name: 'V+',   x:  30, y: -30 },
      { id: 'VEE',  name: 'V−',   x:  30, y:  30 },
      { id: 'COMP', name: 'COMP', x:  10, y: -30 },
    ],
  },
  {
    id: 'ic_lm337',
    name: 'LM337 Adjustable Neg. Reg.',
    category: 'Integrated Circuits',
    description: 'LM337 Adjustable Negative Voltage Regulator. Output: −1.2V to −37V. Max current 1.5A. Dropout voltage 1.5V. Requires two external resistors to set output voltage. Complements the LM317 for split-supply designs.',
    defaultProps: { value: 'LM337' },
    symbol: 'ic_lm337',
    pins: [
      { id: 'IN',  name: 'IN',  x:   0, y:   0 },
      { id: 'OUT', name: 'OUT', x:  60, y:   0 },
      { id: 'ADJ', name: 'ADJ', x:  30, y:  35 },
    ],
  },
  {
    id: 'ic_max7219',
    name: 'MAX7219 LED Driver',
    category: 'Integrated Circuits',
    description: 'MAX7219 Serial 8-Digit LED Display Driver. Drives 8×7-seg displays or 64 individual LEDs via SPI (DIN, CLK, CS). Internal BCD decoder, multiplexing, and brightness PWM control. Daisy-chainable for multiple displays.',
    defaultProps: { value: 'MAX7219' },
    symbol: 'ic_max7219',
    pins: [
      { id: 'DIN',  name: 'DIN',  x:  -15, y: -25 },
      { id: 'CLK',  name: 'CLK',  x:  -15, y: -10 },
      { id: 'CS',   name: '/CS',  x:  -15, y:   5 },
      { id: 'DOUT', name: 'DOUT', x:   85, y: -25 },
      { id: 'VCC',  name: 'VCC',  x:   35, y: -50 },
      { id: 'GND',  name: 'GND',  x:   35, y:  50 },
    ],
  },
  {
    id: 'ic_cd4060',
    name: 'CD4060 14-Stage Counter/OSC',
    category: 'Integrated Circuits',
    description: 'CD4060 14-Stage Binary Ripple Counter with built-in RC/Crystal oscillator. Outputs Q4–Q14 (Q1–Q3 not brought out). /RST pin clears all stages. OSC input/output for external crystal. Used for frequency division and timing.',
    defaultProps: { value: 'CD4060' },
    symbol: 'ic_cd4060',
    pins: [
      { id: 'OSC1', name: 'OSC1', x:  -15, y: -30 },
      { id: 'OSC2', name: 'OSC2', x:  -15, y: -15 },
      { id: 'RST',  name: '/RST', x:  -15, y:   0 },
      { id: 'Q4',   name: 'Q4',   x:   85, y: -45 },
      { id: 'Q5',   name: 'Q5',   x:   85, y: -30 },
      { id: 'Q6',   name: 'Q6',   x:   85, y: -15 },
      { id: 'Q7',   name: 'Q7',   x:   85, y:   0 },
      { id: 'Q8',   name: 'Q8',   x:   85, y:  15 },
      { id: 'Q9',   name: 'Q9',   x:   85, y:  30 },
      { id: 'Q10',  name: 'Q10',  x:   85, y:  45 },
      { id: 'Q14',  name: 'Q14',  x:   85, y:  60 },
      { id: 'VDD',  name: 'VDD',  x:   35, y: -65 },
      { id: 'VSS',  name: 'VSS',  x:   35, y:  75 },
    ],
  },
  {
    id: 'ic_mcp3208',
    name: 'MCP3208 SPI ADC',
    category: 'Integrated Circuits',
    description: 'MCP3208 8-Channel 12-bit SPI Analog-to-Digital Converter. Single-ended or pseudo-differential inputs. SPI-compatible interface (CS, CLK, DIN, DOUT). 100ksps max. VREF sets full-scale range. Supply 2.7V–5.5V.',
    defaultProps: { value: 'MCP3208' },
    symbol: 'ic_mcp3208',
    pins: [
      { id: 'CH0',  name: 'CH0',  x:  -15, y: -50 },
      { id: 'CH1',  name: 'CH1',  x:  -15, y: -35 },
      { id: 'CH2',  name: 'CH2',  x:  -15, y: -20 },
      { id: 'CH3',  name: 'CH3',  x:  -15, y:  -5 },
      { id: 'CH4',  name: 'CH4',  x:  -15, y:  10 },
      { id: 'CH5',  name: 'CH5',  x:  -15, y:  25 },
      { id: 'CH6',  name: 'CH6',  x:  -15, y:  40 },
      { id: 'CH7',  name: 'CH7',  x:  -15, y:  55 },
      { id: 'CS',   name: '/CS',  x:   85, y: -50 },
      { id: 'DIN',  name: 'DIN',  x:   85, y: -35 },
      { id: 'DOUT', name: 'DOUT', x:   85, y: -20 },
      { id: 'CLK',  name: 'CLK',  x:   85, y:  -5 },
      { id: 'VREF', name: 'VREF', x:   85, y:  20 },
      { id: 'VDD',  name: 'VDD',  x:   35, y: -75 },
      { id: 'AGND', name: 'AGND', x:   35, y:  70 },
      { id: 'DGND', name: 'DGND', x:   55, y:  70 },
    ],
  },
];
