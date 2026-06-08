import { useSchematicStore } from './src/store/useSchematicStore.ts';
import { generateNetlist } from './src/utils/netlister.ts';

const circuitJson = {
  components: [
    { id: "V1", type: "ACSource", position: { x: 100, y: 300 }, value: "5Vpk 1kHz" },
    { id: "R1", type: "Resistor", position: { x: 300, y: 300 }, value: "1k" },
    { id: "GND1", type: "Ground", position: { x: 185, y: 450 }, value: "0" }
  ],
  wires: [
    { id: "w1", points: [{ x: 150, y: 300 }, { x: 300, y: 300 }] },
    { id: "w2", points: [{ x: 350, y: 300 }, { x: 350, y: 450 }, { x: 210, y: 450 }] },
    { id: "w3", points: [{ x: 210, y: 450 }, { x: 100, y: 450 }, { x: 100, y: 300 }] }
  ],
  probes: [
    { id: "P1", type: "Voltage", position: { x: 300, y: 300 } }
  ]
};

// Copy the node generation logic here to see what's failing
import { getSegments, distanceToSegment, getSpiceNodeForPoint } from './src/utils/netlister.ts';
console.log('Wires:', circuitJson.wires);
console.log('R1 right pin (350,300) Node:', getSpiceNodeForPoint({x:350,y:300}, circuitJson.components as any, circuitJson.wires));
console.log('w2 Node at 350,300:', getSpiceNodeForPoint({x:350,y:300}, [], circuitJson.wires));
console.log('GND pin (210,450) Node:', getSpiceNodeForPoint({x:210,y:450}, circuitJson.components as any, circuitJson.wires));
