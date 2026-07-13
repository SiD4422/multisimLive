import createNgspiceModule from '@o.z/ngspice-wasm';

async function main() {
  let ng = await createNgspiceModule({ printErr: console.error, print: console.log });
  
  try { ng.FS.mkdir('/proc'); } catch(e){}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal: 16384000 kB\n');

  let cir = `* test
V1 V1_NODE 0 5
R1 V1_NODE IN_PLUS 1k
R2 OUT IN_PLUS 1k
R3 OUT IN_MINUS 1k
V2 IN_MINUS 0 0
X1 IN_MINUS IN_PLUS OUT IDEAL_OPAMP
.subckt IDEAL_OPAMP IN- IN+ OUT
B1 OUT 0 V='15 * tanh((V(IN+)-V(IN-))*100000)'
.ends
.options GMIN=1e-10
.op
.control
run
print v(OUT)
.endc
`;
  ng.FS.writeFile('/test.cir', cir);
  const args = ['ngspice', '-b', '/test.cir'];
  const ptrs = args.map(a => { const p=ng.__emscripten_stack_alloc(a.length+1); ng.stringToUTF8(a, p, a.length+1); return p; });
  const argv = ng.__emscripten_stack_alloc(args.length*4);
  ptrs.forEach((p,i) => ng.HEAP32[(argv>>2)+i]=p);
  try { ng._main(args.length, argv); } catch(e) {}
}
main();
