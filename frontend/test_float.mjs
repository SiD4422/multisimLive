import createNgspiceModule from '@o.z/ngspice-wasm';
import * as fs from 'fs';

async function main() {
  let ng = await createNgspiceModule({ printErr: console.error, print: console.log });
  
  try { ng.FS.mkdir('/proc'); } catch(e){}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n');

  let cir = `* test
V1 1 0 5
R1 1 2 1k
X1 0 2 3 IDEAL_OPAMP
.subckt IDEAL_OPAMP IN- IN+ OUT
E1 OUT 0 IN+ IN- 100k
.ends
.options GMIN=1e-10
.tran 1ms 10ms
.control
run
.endc
`;
  ng.FS.writeFile('/test.cir', cir);
  const args = ['ngspice', '-b', '/test.cir'];
  const ptrs = args.map(a => { const p=ng.__emscripten_stack_alloc(a.length+1); ng.stringToUTF8(a, p, a.length+1); return p; });
  const argv = ng.__emscripten_stack_alloc(args.length*4);
  ptrs.forEach((p,i) => ng.HEAP32[(argv>>2)+i]=p);
  
  try {
    ng._main(args.length, argv);
  } catch(e) {
    console.log('Exception:', e);
  }
}
main();
