import { getComponentPins } from './utils/netlister';

// Find pin positions for various configurations
const comps = [
  // rotation=0 DCSource at x=100, y=200: pin1={100,200}, pin2={190,200}
  { id: 'Vcc', type: 'DCSource', position: {x:100, y:200}, value: '12V', rotation: 0 },
  // Resistor rotation=90 at x=300, y=100: pin1={300,100}, pin2={300,190}
  { id: 'RC', type: 'Resistor', position: {x:300, y:100}, value: '3.3k', rotation: 90 },
  // NPN at x=300, y=200: base={300,200}, collector={337.5,170}, emitter={337.5,230}
  { id: 'Q1', type: 'TransistorNPN', position: {x:300, y:200}, value: '2N3904', rotation: 0 },
  { id: 'G1', type: 'Ground', position: {x:100, y:200}, rotation: 0 },
];
for (const c of comps) {
  const pins = getComponentPins(c as any);
  console.log(c.id, '(' + c.type + ' rot=' + c.rotation + ') pins:', JSON.stringify(pins.map(p => p.p)));
}
