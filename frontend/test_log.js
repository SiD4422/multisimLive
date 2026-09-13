import { readFileSync } from 'fs';
const log = readFileSync('C:\\Users\\spart\\.gemini\\antigravity\\brain\\7dcfb340-a3d5-4760-ac0b-ac05b2e31325\\.system_generated\\tasks\\task-8796.log', 'utf8');
const lines = log.split('\n');
const startIdx = lines.findIndex(l => l.includes('Generated Netlist'));
if (startIdx !== -1) {
   const nextLines = lines.slice(startIdx, startIdx + 20);
   console.log(nextLines.join('\n'));
} else {
   console.log('Not found');
}
