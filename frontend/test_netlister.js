import fs from 'fs';
import path from 'path';
import { generateNetlist } from './src/utils/netlister.ts'; // Might not work in pure Node without tsx

// Instead of complex import, let's just write a basic script to print the files
const examplesDir = './src/examples';
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
console.log('Total examples: ' + files.length);
