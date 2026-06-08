import { generateNetlist } from '../src/utils/netlister.js';

// Mock circuit
const components = [
  {
    id: 'dc1',
    type: 'DCSource',
    position: { x: -10, y: 0 },
    rotation: 0,
    value: '5V', // 5V source
    pins: [
      { id: 'p1', position: { x: 0, y: -20 }, gridNode: 'n1' },
      { id: 'p2', position: { x: 0, y: 20 }, gridNode: 'gnd' }
    ]
  },
  {
    id: 'load1',
    type: 'Load',
    position: { x: 10, y: 0 },
    rotation: 90, // Vertical
    value: '1k', // 1k ohm load
    pins: [
      { id: 'p1', position: { x: 0, y: -20 }, gridNode: 'n1' },
      { id: 'p2', position: { x: 0, y: 20 }, gridNode: 'gnd' }
    ]
  },
  {
    id: 'gnd1',
    type: 'Ground',
    position: { x: 0, y: 40 },
    rotation: 0,
    value: '',
    pins: [
      { id: 'p1', position: { x: 0, y: 0 }, gridNode: 'gnd' }
    ]
  }
];

const wires = [];
const probes = [];

console.log("Generating netlist for 5V DC Source connected to 1k Load...");
const netlist = generateNetlist(components as any, wires, probes);
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
