import createNgspiceModule from '@o.z/ngspice-wasm';

export async function runSpiceSimulation(netlist: string) {
  let ngspice: any = null;
  let spiceErrors: string[] = [];
  try {
    ngspice = await createNgspiceModule({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@o.z/ngspice-wasm@0.0.0/${file}`,
      print: (text: string) => console.log('[SPICE]', text),
      printErr: (text: string) => {
        console.error('[SPICE ERR]', text);
        if (text.toLowerCase().includes("error") || text.toLowerCase().includes("singular matrix") || text.toLowerCase().includes("failed") || text.toLowerCase().includes("unknown")) {
          spiceErrors.push(text);
        }
      },
      noExitRuntime: false
    });
  } catch (err) {
    console.error("Failed to initialize ngspice-wasm:", err);
    throw err;
  }

  let fullNetlist = netlist.trim();
  if (!fullNetlist.startsWith("Circuit") && !fullNetlist.startsWith("*")) {
    fullNetlist = "Circuit\n" + fullNetlist;
  }

  fullNetlist += `
.control
run
set filetype=ascii
write /output.raw
.endc
`;

  try {
    ngspice.FS.writeFile("/circuit.cir", fullNetlist);
    try { ngspice.FS.mkdir("/proc"); } catch(e){}
    ngspice.FS.writeFile("/proc/meminfo", "MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n");

    const args = ["ngspice", "-b", "/circuit.cir"];
    const stack = ngspice.__emscripten_stack_get_current
      ? ngspice.__emscripten_stack_get_current()
      : ngspice.stackSave();

    try {
      const ptrs: number[] = [];
      for (const arg of args) {
        const strPtr = ngspice.__emscripten_stack_alloc(arg.length + 1);
        ngspice.stringToUTF8(arg, strPtr, arg.length + 1);
        ptrs.push(strPtr);
      }
      const argv = ngspice.__emscripten_stack_alloc(args.length * 4);
      for (let i = 0; i < args.length; i++) {
        ngspice.HEAP32[(argv >> 2) + i] = ptrs[i];
      }
      ngspice._main(args.length, argv);
    } catch(e: any) {
      if (e.name === "ExitStatus" && e.status === 0) {
        // success
      } else {
        throw e;
      }
    } finally {
      if (ngspice.__emscripten_stack_restore) {
        ngspice.__emscripten_stack_restore(stack);
      } else if (ngspice.stackRestore) {
        ngspice.stackRestore(stack);
      }
    }

    const rawData = ngspice.FS.readFile("/output.raw", { encoding: "utf8" });
    const data = parseRawFile(rawData);

    if (data.length === 0 && spiceErrors.length > 0) {
      throw new Error(spiceErrors.join('\n'));
    }

    return data;
  } catch (e) {
    console.error("Simulation failed.", e);
    throw e;
  }
}

/**
 * Parses ngspice ASCII .raw files.
 * Supports both real (transient/DC) and complex (AC sweep) data.
 * For AC: returns { frequency, v_N__db, v_N__phase, ... }
 * For transient/DC: returns { time, v(N), ... }
 */
export function parseRawFile(rawStr: string): any[] {
  const lines = rawStr.split('\n').map(l => l.trim());
  const variables: { name: string; type: string }[] = [];
  const data: any[] = [];

  let mode = "header";
  let isComplex = false;
  let plotType = "transient";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.startsWith('Flags:') && line.toLowerCase().includes('complex')) {
      isComplex = true;
    }

    if (line.startsWith('Plotname:')) {
      const pn = line.split(':')[1].trim().toLowerCase();
      if (pn.includes('ac') || pn.includes('frequency')) plotType = 'ac';
      else if (pn.includes('dc')) plotType = 'dc';
      else plotType = 'transient';
    }

    if (line === 'Variables:') { mode = "vars"; continue; }
    if (line === 'Values:') { mode = "values"; continue; }

    if (mode === "vars") {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        variables.push({ name: parts[1], type: parts[2] });
      }
    } else if (mode === "values") {
      const parts = line.split(/\s+/);

      // New data point starts with an integer index
      const isNewPoint = parts.length >= 2
        && !parts[0].includes('.')
        && !parts[0].includes(',')
        && /^\d+$/.test(parts[0]);

      if (isNewPoint) {
        const pointData: any = {};
        const valStr = parts[1];
        const xVarName = variables[0]?.name || (plotType === 'ac' ? 'frequency' : 'time');

        if (isComplex && valStr.includes(',')) {
          pointData[xVarName] = parseFloat(valStr.split(',')[0]); // frequency is real
        } else {
          pointData[xVarName] = parseFloat(valStr);
        }
        data.push(pointData);
      } else {
        // Continuation value(s) for the current data point
        const currentData = data[data.length - 1];
        if (!currentData) continue;

        const currentVarIndex = Object.keys(currentData).length;

        if (isComplex && line.includes(',')) {
          const varDef = variables[currentVarIndex];
          if (varDef) {
            const [realStr, imagStr] = line.split(',');
            const real = parseFloat(realStr);
            const imag = parseFloat(imagStr || '0');
            const magnitude = Math.sqrt(real * real + imag * imag);
            const phase = Math.atan2(imag, real) * (180 / Math.PI);
            const db = magnitude > 0 ? 20 * Math.log10(magnitude) : -200;
            const safeName = varDef.name.replace(/[()]/g, '_');
            currentData[`${safeName}_db`] = db;
            currentData[`${safeName}_phase`] = phase;
            currentData[`${safeName}_mag`] = magnitude;
          }
        } else {
          // Real value — one per line or multiple space-separated
          parts.forEach((val) => {
            const idx = Object.keys(currentData).length;
            if (idx < variables.length) {
              currentData[variables[idx].name] = parseFloat(val);
            }
          });
        }
      }
    }
  }

  // Tag result array so Grapher knows how to render it
  if (data.length > 0) {
    (data as any).__plotType = plotType;
    (data as any).__isComplex = isComplex;
    (data as any).__variables = variables.map(v => v.name);
  }

  return data;
}
