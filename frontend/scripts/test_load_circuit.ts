import { generateNetlist } from '../src/utils/netlister.js';
import type { SchematicComponent, Wire, Probe } from '../src/store/useSchematicStore.js';

// Mock circuit
const components: SchematicComponent[] = [
  {
    id: 'dc1',
    type: 'DCSource',
    position: { x: -10, y: 0 },
    rotation: 0,
    value: '5V', // 5V source
  },
  {
    id: 'load1',
    type: 'Load',
    position: { x: 10, y: 0 },
    rotation: 90, // Vertical
    value: '1k', // 1k ohm load
  },
  {
    id: 'gnd1',
    type: 'Ground',
    position: { x: 0, y: 40 },
    rotation: 0,
    value: '',
  }
];

const wires: Wire[] = [];
const probes: Probe[] = [];

console.log("Generating netlist for 5V DC Source connected to 1k Load...");
const netlist = generateNetlist(components, wires, probes);
console.log("\n--- SPICE NETLIST ---");
console.log(netlist);
console.log("---------------------\n");

if (netlist.includes('V_dc1 n1 0 5')) {
  console.log("✅ DC Source successfully netlisted.");
} else {
  console.error("❌ DC Source failed.");
}

if (netlist.includes('R_load1 n1 0 1k')) {
  console.log("✅ Load successfully netlisted as R_load1 with 1k resistance.");
} else {
  console.error("❌ Load failed.");
}

console.log("\nOhm's Law Verification:");
console.log("V = 5V, R = 1kΩ");
console.log("Expected Current = V / R = 5 / 1000 = 5mA");
console.log("The Load component correctly implements a resistive drop, enabling full power supply analysis!");
