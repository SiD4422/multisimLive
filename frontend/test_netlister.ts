import { generateNetlist } from './src/utils/netlister';

const components = [
  { id: 'V1', type: 'DCSource', position: { x: 100, y: 100 }, rotation: 0, value: '5V' },
  { id: 'R1', type: 'Resistor', position: { x: 300, y: 100 }, rotation: 90, value: '1k' },
  { id: 'GND1', type: 'Ground', position: { x: 200, y: 200 }, rotation: 0 }
];

const wires = [
  { id: 'W1', points: [{ x: 160, y: 100 }, { x: 300, y: 100 }] },
  { id: 'W2', points: [{ x: 100, y: 160 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 160 }] }
];

const probes = [
  { id: 'PR1', type: 'Current', position: { x: 200, y: 100 } }
];

console.log(generateNetlist(components as any, wires as any, probes as any));
