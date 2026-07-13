import createNgspiceModule from '@o.z/ngspice-wasm';

async function main() {
  let ng = await createNgspiceModule({ printErr: console.error, print: console.log });
  
  try { ng.FS.mkdir('/proc'); } catch(e){}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal: 16384000 kB\n');

  let cir = `* test
V1 VCC 0 5
V2 VEE 0 0
V3 IN 0 1
X1 0 IN VCC VEE OUT LM741
.subckt LM741 IN- IN+ VCC VEE OUT
B1 OUT 0 V='(V(VCC)-V(VEE))/2 * tanh((V(IN+)-V(IN-))*100000) + (V(VCC)+V(VEE))/2'
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
