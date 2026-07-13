const LZString = require('lz-string');

const state = {
  components: [
    { id: 'v1', type: 'DCSource', position: { x: 200, y: 100 }, rotation: 0, value: '5V', label: 'V1' },
    { id: 'gnd1', type: 'Ground', position: { x: 200, y: 200 }, rotation: 0 },
    
    { id: 'u1', type: 'Timer555', position: { x: 400, y: 300 }, rotation: 0, label: '555 Timer' },
    { id: 'vcc_gnd', type: 'Ground', position: { x: 440, y: 400 }, rotation: 0 },
    
    { id: 'ra', type: 'Resistor', position: { x: 300, y: 150 }, rotation: 90, value: '1k', label: 'R_A' },
    { id: 'rb', type: 'Resistor', position: { x: 300, y: 250 }, rotation: 90, value: '10k', label: 'R_B' },
    { id: 'c1', type: 'Capacitor', position: { x: 300, y: 350 }, rotation: 90, value: '10uF', label: 'C1' },
    { id: 'gnd_c', type: 'Ground', position: { x: 300, y: 400 }, rotation: 0 }
  ],
  wires: [
    // V1 to Ra
    { id: 'w1', points: [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 110}] },
    // V1 to 555 VCC & RST
    { id: 'w2', points: [{x: 300, y: 100}, {x: 440, y: 100}, {x: 440, y: 230}] },
    { id: 'w_rst', points: [{x: 440, y: 100}, {x: 380, y: 100}, {x: 380, y: 260}] },
    // V1 gnd
    { id: 'wg1', points: [{x: 200, y: 140}, {x: 200, y: 200}] },
    
    // Ra to Rb & DIS
    { id: 'w3', points: [{x: 300, y: 190}, {x: 300, y: 210}] },
    { id: 'w4', points: [{x: 300, y: 200}, {x: 380, y: 200}, {x: 380, y: 280}] },
    
    // Rb to C1 & THR & TRI
    { id: 'w5', points: [{x: 300, y: 290}, {x: 300, y: 310}] },
    { id: 'w6', points: [{x: 300, y: 300}, {x: 380, y: 300}, {x: 380, y: 320}] }, // TRI
    { id: 'w7', points: [{x: 380, y: 300}, {x: 380, y: 280}] }, // wait, THR is y=300 in symbol?
    
    // C1 to GND
    { id: 'w8', points: [{x: 300, y: 390}, {x: 300, y: 400}] },
    
    // 555 GND
    { id: 'w9', points: [{x: 440, y: 370}, {x: 440, y: 400}] }
  ],
  probes: [
    { id: 'p1', position: { x: 500, y: 280 }, type: 'Voltage', color: '#ff0000', label: 'OUT' },
    { id: 'p2', position: { x: 300, y: 300 }, type: 'Voltage', color: '#00ff00', label: 'CAP' }
  ],
  analysisMode: 'transient',
  transientSettings: { step: '0.1ms', endTime: '500ms' }
};

const str = JSON.stringify(state);
const compressed = LZString.compressToEncodedURIComponent(str);
console.log(`http://localhost:5173/simulator#circuit=${compressed}`);
