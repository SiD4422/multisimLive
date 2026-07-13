import createNgspiceModule from '@o.z/ngspice-wasm';

async function main() {
  let ng = await createNgspiceModule({ printErr: console.error, print: console.log });
  
  try { ng.FS.mkdir('/proc'); } catch(e){}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal:       16384000 kB\n');

  let cir = `* test
V1 VCC 0 5
V2 VEE 0 0
V3 IN 0 1
X1 0 IN VCC VEE OUT LM741
.subckt LM741 IN- IN+ VCC VEE OUT
E1 internal 0 IN+ IN- 100k
B1 OUT 0 V=V(internal) > V(VCC) ? V(VCC) : (V(internal) < V(VEE) ? V(VEE) : V(internal))
.ends
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
  
  try {
    ng._main(args.length, argv);
  } catch(e) { }
}
main();
