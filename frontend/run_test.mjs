import createNgspiceModule from '@o.z/ngspice-wasm';
import * as fs from 'fs';

async function run() {
  const ng = await createNgspiceModule({
    printErr: console.error,
    print: console.log
  });
  
  const cir = fs.readFileSync('test2.cir', 'utf8');
  ng.FS.writeFile('test2.cir', cir);
  
  ng.ccall('ngSpice_Command', 'number', ['string'], ['source test2.cir']);
  ng.ccall('ngSpice_Command', 'number', ['string'], ['run']);
  console.log('Done!');
}
run();
