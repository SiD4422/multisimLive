/**
 * Standard Component Definitions for NodeSim
 * Defines component types, metadata, default properties, schematic symbols, and pins.
 */

export interface ComponentPinDef {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'Logic Gates' | 'Integrated Circuits';
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
  }
];
