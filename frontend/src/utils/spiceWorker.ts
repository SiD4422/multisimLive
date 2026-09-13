// spiceWorker.ts

// Global shim for ngspice-wasm inside a Web Worker.
// Emscripten generated modules often check for window or document.
if (typeof self !== 'undefined' && typeof (self as any).window === 'undefined') {
  (self as any).window = self;
  (self as any).document = { createElement: () => ({}) };
}

import createNgspiceModule from '@o.z/ngspice-wasm';

let ngspiceInstance: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function initNgspice() {
  if (ngspiceInstance) return;
  if (isInitializing && initPromise) {
    await initPromise;
    return;
  }

  isInitializing = true;
  initPromise = new Promise(async (resolve, reject) => {
    try {
      ngspiceInstance = await createNgspiceModule({
        locateFile: (file: string) => `/${file}`,
        print: (text: string) => console.log('[SPICE Worker]', text),
        printErr: (text: string) => {
          console.error('[SPICE Worker ERR]', text);
        },
        noExitRuntime: false
      });
      resolve();
    } catch (err) {
      console.error("Failed to initialize ngspice-wasm in worker:", err);
      reject(err);
    } finally {
      isInitializing = false;
    }
  });

  await initPromise;
}

// Ensure the parser logic from the original engine is preserved exactly
function parseRawFile(rawStr: string): any[] {
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
      if (pn.includes('ac analysis') || pn.includes('frequency')) plotType = 'ac';
      else if (pn.includes('dc transfer characteristic') || pn.includes('dc')) plotType = 'dc';
      else if (pn.includes('operating point')) plotType = 'op';
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

      const isNewPoint = parts.length >= 2
        && !parts[0].includes('.')
        && !parts[0].includes(',')
        && /^\d+$/.test(parts[0]);

      if (isNewPoint) {
        const pointData: any = {};
        const valStr = parts[1];
        const xVarName = variables[0]?.name || (plotType === 'ac' ? 'frequency' : 'time');

        if (plotType === 'op') {
          // For .op, we just map variable values one by one. The first one is variable index 0.
          pointData[variables[0]?.name || 'unknown'] = parseFloat(valStr);
        } else if (isComplex && valStr.includes(',')) {
          pointData[xVarName] = parseFloat(valStr.split(',')[0]);
        } else {
          pointData[xVarName] = parseFloat(valStr);
        }
        pointData.__parsedVars = 1;
        data.push(pointData);
      } else {
        const currentData = data[data.length - 1];
        if (!currentData) continue;

        const currentVarIndex = currentData.__parsedVars || 1;

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
            currentData.__parsedVars++;
          }
        } else {
          parts.forEach((val) => {
            const idx = currentData.__parsedVars || 1;
            if (idx < variables.length) {
              currentData[variables[idx].name] = parseFloat(val);
              currentData.__parsedVars = idx + 1;
            }
          });
        }
      }
    }
  }

  // If this was an operating point (.op), data[0] contains all the static values as keys
  if (plotType === 'op' && data.length > 0) {
    const opValues = data[0];
    const formattedData = Object.keys(opValues).map(key => {
      // Determine unit based on key format (e.g. i(v1) -> A, v(1) -> V)
      let unit = 'unknown';
      if (key.toLowerCase().startsWith('i(')) unit = 'A';
      else if (key.toLowerCase().startsWith('v(') || key.toLowerCase() === 'v') unit = 'V';
      else if (key.toLowerCase() === 'time') unit = 's';
      
      return {
        node: key,
        value: opValues[key],
        unit: unit
      };
    });
    
    // Filter out internal variables if necessary, but returning all is fine
    (formattedData as any).__plotType = plotType;
    return formattedData;
  }

  if (data.length > 0) {
    (data as any).__plotType = plotType;
    (data as any).__isComplex = isComplex;
    (data as any).__variables = variables.map(v => v.name);
  }

  return data;
}

// ── Friendly Error Translator ───────────────────────────────────────────
// Converts raw cryptic SPICE errors into plain-English messages for students.
function translateSpiceError(raw: string): string {
  const msg = raw.toLowerCase();

  if (msg.includes('singular matrix') || msg.includes('solve failed') || msg.includes('mismatch')) {
    return '⚠️ Short circuit or floating node detected. Check that:\n' +
      '• All components are properly connected to wires\n' +
      '• There is no direct wire from + to - on a battery\n' +
      '• Every circuit branch connects back to Ground';
  }
  if (msg.includes('no output.raw') || msg.includes('no such file')) {
    return '⚠️ Simulation produced no results. Make sure:\n' +
      '• You have at least one battery (voltage source) in your circuit\n' +
      '• You have a Ground (GND) symbol connected\n' +
      '• All components have at least 2 wires connected';
  }
  if (msg.includes('convergence') || msg.includes('gmin') || msg.includes('itl')) {
    return '⚠️ The circuit could not reach a stable starting point. Try:\n' +
      '• Adding a small resistor (e.g. 1Ω) in series with any voltage sources\n' +
      '• Checking that capacitors and inductors are correctly connected\n' +
      '• Ensuring no component values are zero';
  }
  if (msg.includes('fatal error') || msg.includes('exit(1)') || msg.includes('exitstatus')) {
    return '⚠️ The simulation engine crashed. Common causes:\n' +
      '• A component has an invalid value (e.g. 0Ω resistor)\n' +
      '• Two voltage sources are wired in parallel\n' +
      '• Missing Ground connection';
  }
  if (msg.includes('undefined') || msg.includes('not found') || msg.includes('unknown')) {
    return '⚠️ An unknown component or model was used. Try removing the problematic component and adding it again.';
  }

  // Fallback — clean up raw message but keep it
  return `⚠️ Simulation error: ${raw.split('\n')[0].substring(0, 120)}`;
}

// Helper: detect convergence-class failures that are worth retrying
function isConvergenceError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('convergence') || m.includes('no convergence') ||
         m.includes('gmin') || m.includes('itl4') || m.includes('singular');
}

// Helper: inject / replace .options line just before the .control block
function injectRelaxedOptions(netlist: string): string {
  const relaxed = '.options RELTOL=0.01 ABSTOL=1e-10 GMIN=1e-10 TRTOL=7';
  // Remove any existing .options line
  const withoutOptions = netlist.replace(/^\.options\b.*$/gim, '');
  // Insert just before the first .control line
  if (withoutOptions.toLowerCase().includes('.control')) {
    return withoutOptions.replace(/^(\.control\b)/im, `${relaxed}\n$1`);
  }
  // Fallback: prepend
  return `${relaxed}\n${withoutOptions}`;
}

// Core: run ngspice on the given full netlist string and return parsed data.
// Throws on any failure.
async function runNgspice(fullNetlist: string): Promise<any[]> {
  ngspiceInstance.FS.writeFile("/circuit.cir", fullNetlist);
  try { ngspiceInstance.FS.mkdir("/proc"); } catch(e){}
  ngspiceInstance.FS.writeFile("/proc/meminfo", "MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n");

  const args = ["ngspice", "-b", "/circuit.cir"];
  const stack = ngspiceInstance.__emscripten_stack_get_current
    ? ngspiceInstance.__emscripten_stack_get_current()
    : ngspiceInstance.stackSave();

  try {
    const ptrs: number[] = [];
    for (const arg of args) {
      const strPtr = ngspiceInstance.__emscripten_stack_alloc(arg.length + 1);
      ngspiceInstance.stringToUTF8(arg, strPtr, arg.length + 1);
      ptrs.push(strPtr);
    }
    const argv = ngspiceInstance.__emscripten_stack_alloc(args.length * 4);
    for (let i = 0; i < args.length; i++) {
      ngspiceInstance.HEAP32[(argv >> 2) + i] = ptrs[i];
    }
    ngspiceInstance._main(args.length, argv);
  } catch(err: any) {
    if (err.name === "ExitStatus" && err.status === 0) {
      // success path
    } else {
      throw err;
    }
  } finally {
    if (ngspiceInstance.__emscripten_stack_restore) {
      ngspiceInstance.__emscripten_stack_restore(stack);
    } else if (ngspiceInstance.stackRestore) {
      ngspiceInstance.stackRestore(stack);
    }
  }

  let outputRaw: string;
  try {
    outputRaw = ngspiceInstance.FS.readFile("/output.raw", { encoding: "utf8" });
  } catch(err) {
    throw new Error("No output.raw found. Simulation may have failed or singular matrix encountered.");
  }

  const data = parseRawFile(outputRaw);
  if (data.length === 0) {
    throw new Error("Simulation produced no data points. The circuit might have a floating node, missing Ground, or a singular matrix.");
  }
  return data;
}

self.addEventListener('message', async (e: MessageEvent) => {
  const { id, netlist } = e.data;
  if (!id || !netlist) return;

  let originalError: string | null = null;

  try {
    await initNgspice();

    let fullNetlist = netlist.trim();
    if (!fullNetlist.startsWith("Circuit") && !fullNetlist.startsWith("*")) {
      fullNetlist = "Circuit\n" + fullNetlist;
    }
    fullNetlist += `\n.control\nrun\nset filetype=ascii\nwrite /output.raw\n.endc\n`;

    // ── Attempt 1: standard simulation ──────────────────────────────────
    let data: any[];
    try {
      data = await runNgspice(fullNetlist);
      // Success — send result normally
      self.postMessage({ id, type: 'SUCCESS', data, __plotType: (data as any).__plotType, __isComplex: (data as any).__isComplex, __variables: (data as any).__variables });
      return;
    } catch (err1: any) {
      originalError = err1.message || String(err1);
      // Only retry on convergence-class errors
      if (!isConvergenceError(originalError!)) {
        throw err1;
      }
      console.warn('[SPICE Worker] Convergence failure detected — retrying with relaxed tolerances…');
    }

    // ── Attempt 2: relaxed tolerances ───────────────────────────────────
    // Re-initialize ngspice for a fresh instance (required by Emscripten design)
    ngspiceInstance = null;
    await initNgspice();

    const relaxedNetlist = injectRelaxedOptions(fullNetlist);
    try {
      data = await runNgspice(relaxedNetlist);
      // Retry success — send with warning
      self.postMessage({
        id,
        type: 'SUCCESS',
        data,
        __plotType: (data as any).__plotType,
        __isComplex: (data as any).__isComplex,
        __variables: (data as any).__variables,
        __warning: 'Simulation converged with relaxed tolerances. Results may be slightly less accurate.',
      });
    } catch (err2: any) {
      // Both attempts failed — report original error with hint
      const hint = '\n\nTip: Try adding a small resistor (1Ω–10Ω) in series with voltage sources, or check for floating nodes.';
      self.postMessage({ id, type: 'ERROR', error: translateSpiceError(originalError!) + hint });
    }
  } catch (error: any) {
    self.postMessage({ id, type: 'ERROR', error: translateSpiceError(error.message || String(error)) });
  } finally {
    // CRITICAL: Force ngspice to re-initialize on the next run. 
    // Calling _main() multiple times on the same instance causes C-state memory corruption and exit(1) crashes.
    ngspiceInstance = null;
  }
});
