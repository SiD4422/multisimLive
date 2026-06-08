import createNgspiceModule from './node_modules/@o.z/ngspice-wasm/ngspice.js';

(async () => {
  const ngspice = await createNgspiceModule({
    print: console.log,
    printErr: console.error,
    noExitRuntime: true // important!
  });

  const netlist = `Circuit Title
V1 1 0 SINE(0 5 1k)
R1 1 0 1k
.tran 10us 1ms
.control
run
set filetype=ascii
write /output.raw
.endc
.end
`;

  ngspice.FS.writeFile("/circuit.cir", netlist);
  
  try { ngspice.FS.mkdir("/proc"); } catch(e){}
  ngspice.FS.writeFile("/proc/meminfo", "MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n");

  const runSpice = () => {
      const args = ["ngspice", "-b", "/circuit.cir"];
      const stack = ngspice.__emscripten_stack_get_current ? ngspice.__emscripten_stack_get_current() : ngspice.stackSave();
      
      try {
        const ptrs = [];
        for (const arg of args) {
          const strPtr = ngspice.__emscripten_stack_alloc(arg.length + 1);
          ngspice.stringToUTF8(arg, strPtr, arg.length + 1);
          ptrs.push(strPtr);
        }
        
        const argv = ngspice.__emscripten_stack_alloc(args.length * 4);
        for (let i = 0; i < args.length; i++) {
          ngspice.HEAP32[(argv >> 2) + i] = ptrs[i];
        }
        
        const exitCode = ngspice._main(args.length, argv);
        console.log("Exit code:", exitCode);
    
        const raw = ngspice.FS.readFile("/output.raw", { encoding: "utf8" });
        console.log("RAW OUTPUT GENERATED! Length:", raw.length);
      } catch(e) {
         console.error("SPICE execution error:", e);
      } finally {
        if (ngspice.__emscripten_stack_restore) ngspice.__emscripten_stack_restore(stack);
        else ngspice.stackRestore(stack);
      }
  };

  console.log("RUN 1");
  runSpice();
  console.log("RUN 2");
  runSpice();
})();
