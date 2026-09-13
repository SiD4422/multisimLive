import { readFileSync } from 'fs';
const file = readFileSync('C:\\Users\\spart\\Desktop\\test MultiSimlab\\multisimfree\\frontend\\src\\utils\\netlister.ts', 'utf8');
console.log(file.substring(file.indexOf('comp.type === \'Diode\''), file.indexOf('comp.type === \'TransistorNPN\'')));
