import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { componentDescriptions } from '../src/utils/ComponentDescriptions.js';
import { generateNetlist, getComponentPins } from '../src/utils/netlister.js';
// Use the Node.js-compatible WASM runner instead of the browser Web Worker runner
import { runSpiceSimulationNode as runSpiceSimulation } from './nodeSpiceRunner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('Starting automated component tests...');
  const results: any[] = [];
  
  for (const compType of Object.keys(componentDescriptions)) {
    if (compType === 'Default') continue;

    console.log(`Testing ${compType}...`);

    // Create the test component
    const comp = { id: 'TEST1', type: compType, position: {x: 100, y: 100}, rotation: 0, value: '' };
    
    // Some components need special default values to parse correctly in netlister
    if (compType === 'PulseVoltage') comp.value = '0 5 0 1n 1n 1m 2m';
    if (compType === 'ACSource' || compType === 'ACCurrent') comp.value = '1 1k';
    if (compType === 'Resistor' || compType === 'Resistors' || compType === 'Load') comp.value = '1k';
    if (compType === 'Capacitor') comp.value = '1u';
    if (compType === 'Inductor') comp.value = '1m';
    if (compType === 'Potentiometer') comp.value = '10k 50';

    try {
      const pins = getComponentPins(comp as any);
      
      const components: any[] = [comp];
      const wires: any[] = [];
      
      // Build the Universal Smoke Test Jig
      // For each pin, we create a Ground, a Resistor to Ground, and a wire.
      pins.forEach((pin, index) => {
        const rPos = { x: 100 + index*50, y: 200 };
        const gPos = { x: 100 + index*50, y: 250 };
        
        // Resistor
        components.push({
          id: `R_TEST_${index}`, type: 'Resistor', position: rPos, rotation: 90, value: '1k'
        });
        
        // Ground
        components.push({
          id: `GND_${index}`, type: 'Ground', position: gPos, rotation: 0
        });
        
        // Wire from Component Pin to Resistor top
        wires.push({ id: `W1_${index}`, points: [pin.p, rPos] });
        
        // Wire from Resistor bottom to Ground
        const rBottom = { x: rPos.x, y: rPos.y + 60 };
        wires.push({ id: `W2_${index}`, points: [rBottom, gPos] });
        
        // For Pin 0, add a DC Voltage source to inject stimulus (safer than 1A current source)
        if (index === 0) {
           const iPos = { x: 50, y: 200 };
           const iGPos = { x: 50, y: 250 };
           components.push({
             id: `V_TEST`, type: 'DCSource', position: iPos, rotation: 90, value: '5V'
           });
           components.push({ id: `GND_I`, type: 'Ground', position: iGPos, rotation: 0 });
           wires.push({ id: `W3`, points: [pin.p, iPos] });
           wires.push({ id: `W4`, points: [{x: iPos.x, y: iPos.y+60}, iGPos] });
        }
      });

      const spice = generateNetlist(components as any, wires as any, []);
      
      // Run in engine
      let engineError = null;
      try {
         await runSpiceSimulation(spice);
      } catch (e: any) {
         engineError = e.message || String(e);
      }
      
      const spiceSnippet = spice.split('\n').find(l => l.includes('TEST1')) || '-';

      results.push({
        compType,
        spiceGenerated: 'Yes',
        engineResult: engineError ? 'Fail' : 'Pass',
        error: engineError ? engineError.replace(/\n/g, ' ') : '-',
        spiceSnippet: spiceSnippet.replace(/\|/g, '\\|')
      });
      
    } catch (e: any) {
      results.push({
        compType,
        spiceGenerated: 'No',
        engineResult: 'Fail',
        error: e.message || String(e),
        spiceSnippet: '-'
      });
    }
  }

  // Write report
  const reportLines = [
    '# Component Test Report',
    '',
    '| Component | SPICE Generated | Engine Result | Error Message | SPICE Snippet |',
    '|---|---|---|---|---|'
  ];
  
  results.forEach(r => {
    reportLines.push(`| ${r.compType} | ${r.spiceGenerated} | ${r.engineResult} | ${r.error} | \`${r.spiceSnippet}\` |`);
  });
  
  const reportPath = path.join(__dirname, '..', 'component_test_report.md');
  fs.writeFileSync(reportPath, reportLines.join('\n'));
  console.log(`Report generated at ${reportPath}`);

  const failures = results.filter(r => r.engineResult === 'Fail');
  if (failures.length > 0) {
    console.error(`\nTests finished with ${failures.length} failures.`);
    process.exit(1);
  } else {
    console.log(`\nAll tests passed successfully!`);
  }
}

runTests().catch(console.error);
