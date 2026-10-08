import fs from 'fs';
import { generateNetlist } from '../src/utils/netlister/generateNetlist';
import { getComponentPins } from '../src/utils/netlister/getComponentPins';

const data = JSON.parse(fs.readFileSync('./src/examples/hybrid_switched_inductor.json', 'utf8'));

try {
    const netlist = generateNetlist(data.components, data.wires);
    console.log('Success:');
    console.log(netlist);
} catch (e) {
    console.error('Error generating netlist:');
    console.error(e.message);
}
