import createNgspiceModule from '@o.z/ngspice-wasm';
import * as fs from 'fs';

const lm555Model = `
.subckt LM555 VCC GND RST DIS THR TRI CON OUT
R_d1 VCC CON 5k
R_d2 CON ref_lo 5k
R_d3 ref_lo GND 5k
C_latch latch GND 100p
R_leak latch GND 1G
B_set set_drv GND V = V(TRI) < V(ref_lo) ? 5 : -5
R_set set_drv set_mid 1k
D_set set_mid latch DMOD555
B_rst rst_drv GND V = V(THR) > V(CON) ? 5 : -5
R_rst rst_drv rst_mid 1k
D_rst latch rst_mid DMOD555
B_out OUT GND V = V(latch) > 2.5 ? 5 : 0
.model DMOD555 D (IS=1e-14 N=1)
.ends
`;

const components = [
  { name: 'DCSource', cir: 'V2 2 0 DC 5\nR2 2 0 1k' },
  { name: 'ACSource', cir: 'V2 2 0 SINE(0 5 1k)\nR2 2 0 1k' },
  { name: 'Opamp', cir: 'E1 2 0 1 0 100k\nR2 2 0 1k' },
  { name: 'GateAND', cir: 'B1 2 0 V = V(1) > 2 ? 5 : 0\nR2 2 0 1k' },
  { name: 'Timer555', cir: 'X1 1 0 1 0 0 0 0 2 LM555\nR2 2 0 1k\n' + lm555Model }
];

async function runTest(comp) {
  let ng = await createNgspiceModule({ printErr: () => {}, print: () => {} });
  
  try { ng.FS.mkdir('/proc'); } catch(e){}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n');

  let cir = `* test ${comp.name}
V1 1 0 DC 1
${comp.cir}
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
  
  let success = true;
  try {
    ng._main(args.length, argv);
  } catch(e) {
    if (e.name === 'ExitStatus' && e.status !== 0) success = false;
  }
  return success;
}

async function main() {
  for (let comp of components) {
    const res = await runTest(comp);
    console.log(comp.name + ': ' + (res ? 'PASS' : 'FAIL'));
  }
}
main();
