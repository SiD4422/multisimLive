import { generateNetlist } from './frontend/src/utils/netlister';
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./lpf_debug.json', 'utf8'));
console.log(generateNetlist(data.components, data.wires, data.probes));
