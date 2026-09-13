import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve('./src/examples/transformer_stepdown.json'), 'utf-8');
console.log('Is valid JSON?', typeof JSON.parse(content) === 'object');
