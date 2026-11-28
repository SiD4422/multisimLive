// spiceWorker.ts

interface WorkerGlobalShim {
  window?: unknown;
  document?: { createElement: () => Record<string, never> };
}

// Global shim for ngspice-wasm inside a Web Worker.
// Emscripten generated modules often check for window or document.
if (typeof self !== 'undefined') {
  const workerSelf = self as unknown as WorkerGlobalShim;
  if (typeof workerSelf.window === 'undefined') {
    workerSelf.window = self;
    workerSelf.document = { createElement: () => ({}) };
  }
}

import type { NgspiceModule, OpDataPoint, SpiceDataRow, SpiceParsedOutput } from './spiceTypes';
import { createNgspiceInstancePool, type ProgressReporter } from './spiceInstancePool';

interface RawParserRow extends SpiceDataRow {
  __parsedVars?: number;
}

interface EmscriptenExitStatus {
  name?: string;
  status?: number;
}

type NgspiceFactory = typeof import('@o.z/ngspice-wasm').default;

let cachedNgspiceFactory: NgspiceFactory | null = null;
let detectedNgspiceVersion = 'ngspice (WebAssembly build)';

async function loadNgspiceFactory(reportProgress?: ProgressReporter): Promise<NgspiceFactory> {
  if (!cachedNgspiceFactory) {
    reportProgress?.('loading-engine', 20, 'Loading ngspice WASM engine (7 MB)...');
    const mod = await import('@o.z/ngspice-wasm');
    cachedNgspiceFactory = mod.default;
  }
  return cachedNgspiceFactory;
}

async function createNgspiceInstance(reportProgress?: ProgressReporter): Promise<NgspiceModule> {
  try {
    const factory = await loadNgspiceFactory(reportProgress);
    reportProgress?.('initializing-wasm', 55, 'Initializing SPICE WASM solver...');
    const mod = await factory({
      locateFile: (file: string) => `/${file}`,
      print: (text: string) => {
        console.log('[SPICE Worker]', text);
        const m = text.match(/ngspice[- ]?(?:version\s*)?(\d+[\w.-]*)/i);
        if (m && m[1]) {
          detectedNgspiceVersion = `ngspice-${m[1]}`;
        }
      },
      printErr: (text: string) => {
        console.error('[SPICE Worker ERR]', text);
        const m = text.match(/ngspice[- ]?(?:version\s*)?(\d+[\w.-]*)/i);
        if (m && m[1]) {
          detectedNgspiceVersion = `ngspice-${m[1]}`;
        }
      },
      noExitRuntime: false,
    });
    const instance = mod as unknown as NgspiceModule;
    try {
      instance.FS.mkdir('/proc');
    } catch {
      // /proc may already exist in the Emscripten VFS
    }
    instance.FS.writeFile('/proc/meminfo', 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n');
    return instance;
  } catch (err) {
    console.error('Failed to initialize ngspice-wasm in worker:', err);
    throw err;
  }
}

const ngspicePool = createNgspiceInstancePool(createNgspiceInstance, (err) => {
  console.warn('[SPICE Worker] Background WASM pre-warm skipped:', err);
});

function scheduleNextPrewarm(): void {
  setTimeout(() => {
    ngspicePool.prewarm();
  }, 0);
}

// Ensure the parser logic from the original engine is preserved exactly
function parseRawFile(rawStr: string): SpiceParsedOutput {
  const lines = rawStr.split('\n').map(l => l.trim());
  const variables: { name: string; type: string }[] = [];
  const data: RawParserRow[] = [];

  let mode = 'header';
  let isComplex = false;
  let plotType: 'transient' | 'ac' | 'dc' | 'op' = 'transient';

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

    if (line === 'Variables:') { mode = 'vars'; continue; }
    if (line === 'Values:') { mode = 'values'; continue; }

    if (mode === 'vars') {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        variables.push({ name: parts[1], type: parts[2] });
      }
    } else if (mode === 'values') {
      const parts = line.split(/\s+/);

      const isNewPoint = parts.length >= 2
        && !parts[0].includes('.')
        && !parts[0].includes(',')
        && /^\d+$/.test(parts[0]);

      if (isNewPoint) {
        const pointData: RawParserRow = {};
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
            currentData.__parsedVars = currentVarIndex + 1;
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
    const formattedData: OpDataPoint[] & { __plotType?: 'op' } = Object.keys(opValues)
      .filter(key => !key.startsWith('__'))
      .map(key => {
        // Determine unit based on key format (e.g. i(v1) -> A, v(1) -> V)
        let unit = 'unknown';
        if (key.toLowerCase().startsWith('i(')) unit = 'A';
        else if (key.toLowerCase().startsWith('v(') || key.toLowerCase() === 'v') unit = 'V';
        else if (key.toLowerCase() === 'time') unit = 's';

        return {
          node: key,
          value: opValues[key] ?? 0,
          unit
        };
      });

    formattedData.__plotType = plotType;
    return formattedData;
  }

  // CRITICAL: Clean up internal parser tracking property (__parsedVars) from all row records
  // so internal parser variables never leak into simulation output or measurement tables.
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row === 'object' && '__parsedVars' in row) {
      delete row.__parsedVars;
    }
  }

  const result = data as SpiceParsedOutput;
  if (result.length > 0) {
    result.__plotType = plotType;
    result.__isComplex = isComplex;
    result.__variables = variables.map(v => v.name);
  }

  return result;
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

// Core: run ngspice on an isolated one-shot module instance and return parsed data.
// Throws on any failure.
async function runNgspice(instance: NgspiceModule, fullNetlist: string): Promise<SpiceParsedOutput> {
  instance.FS.writeFile('/circuit.cir', fullNetlist);
  try {
    instance.FS.mkdir('/proc');
  } catch {
    // /proc may already exist in the Emscripten VFS across runs
  }
  instance.FS.writeFile('/proc/meminfo', 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:    8192000 kB\n');

  const args = ['ngspice', '-b', '/circuit.cir'];
  const stack = instance.stackSave
    ? instance.stackSave()
    : (instance.__emscripten_stack_get_current ? instance.__emscripten_stack_get_current() : 0);

  try {
    const ptrs: number[] = [];
    for (const arg of args) {
      const strPtr = instance.__emscripten_stack_alloc(arg.length + 1);
      instance.stringToUTF8(arg, strPtr, arg.length + 1);
      ptrs.push(strPtr);
    }
    const argv = instance.__emscripten_stack_alloc(args.length * 4);
    for (let i = 0; i < args.length; i++) {
      instance.HEAP32[(argv >> 2) + i] = ptrs[i];
    }
    instance._main(args.length, argv);
  } catch (err: unknown) {
    const exit = err as EmscriptenExitStatus | null;
    if (exit && exit.name === 'ExitStatus' && exit.status === 0) {
      // success path
    } else {
      throw err;
    }
  } finally {
    if (instance.stackRestore) {
      instance.stackRestore(stack);
    } else if (instance.__emscripten_stack_restore) {
      instance.__emscripten_stack_restore(stack);
    }
  }

  let outputRaw: string;
  try {
    outputRaw = instance.FS.readFile('/output.raw', { encoding: 'utf8' });
  } catch (err) {
    throw new Error('No output.raw found. Simulation may have failed or singular matrix encountered.', { cause: err });
  }

  const data = parseRawFile(outputRaw);
  if (data.length === 0) {
    throw new Error('Simulation produced no data points. The circuit might have a floating node, missing Ground, or a singular matrix.');
  }
  return data;
}

self.addEventListener('message', async (e: MessageEvent<{ id?: number; type?: 'WARMUP' | 'RUN'; netlist?: string }>) => {
  const { id, type, netlist } = e.data;
  if (type === 'WARMUP') {
    ngspicePool.prewarm();
    return;
  }
  if (!id || !netlist) return;

  const reportProgress: ProgressReporter = (stage, percent, label) => {
    self.postMessage({ id, type: 'PROGRESS', progress: { stage, percent, label } });
  };

  let acquiredAttempt1 = false;
  try {
    const { instance: firstInstance } = await ngspicePool.acquire(reportProgress);
    acquiredAttempt1 = true;

    let fullNetlist = netlist.trim();
    if (!fullNetlist.startsWith('Circuit') && !fullNetlist.startsWith('*')) {
      fullNetlist = 'Circuit\n' + fullNetlist;
    }
    fullNetlist += '\n.control\nrun\nset filetype=ascii\nwrite /output.raw\n.endc\n';

    // ── Attempt 1: standard simulation ──────────────────────────────────
    let originalError: string;
    try {
      reportProgress('solving', 75, 'Solving circuit MNA matrix...');
      const data = await runNgspice(firstInstance, fullNetlist);
      reportProgress('parsing', 95, 'Finalizing waveforms...');
      // Success — send result immediately
      self.postMessage({
        id,
        type: 'SUCCESS',
        data,
        __plotType: data.__plotType,
        __isComplex: data.__isComplex,
        __variables: data.__variables,
        engineVersion: detectedNgspiceVersion,
      });
      return;
    } catch (err1: unknown) {
      originalError = err1 instanceof Error ? err1.message : String(err1);
      // Only retry on convergence-class errors
      if (!isConvergenceError(originalError)) {
        throw err1;
      }
      console.warn('[SPICE Worker] Convergence failure detected — retrying with relaxed tolerances…');
    }

    // ── Attempt 2: relaxed tolerances ───────────────────────────────────
    // Use a guaranteed fresh Emscripten instance (never re-enter _main on an already executed instance)
    reportProgress('solving', 85, 'Retrying with relaxed SPICE tolerances...');
    const { instance: retryInstance } = await ngspicePool.acquire(reportProgress);

    const relaxedNetlist = injectRelaxedOptions(fullNetlist);
    try {
      const data = await runNgspice(retryInstance, relaxedNetlist);
      reportProgress('parsing', 95, 'Finalizing waveforms...');
      // Retry success — send with warning
      self.postMessage({
        id,
        type: 'SUCCESS',
        data,
        __plotType: data.__plotType,
        __isComplex: data.__isComplex,
        __variables: data.__variables,
        __warning: 'Simulation converged with relaxed tolerances. Results may be slightly less accurate.',
        engineVersion: detectedNgspiceVersion,
      });
    } catch {
      // Both attempts failed — report original error with hint
      const hint = '\n\nTip: Try adding a small resistor (1 ohm-10 ohm) in series with voltage sources, or check for floating nodes.';
      self.postMessage({ id, type: 'ERROR', error: translateSpiceError(originalError) + hint });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    self.postMessage({ id, type: 'ERROR', error: translateSpiceError(msg) });
  } finally {
    // Yield a macrotask so the main thread processes SUCCESS/ERROR first, then pre-warm a fresh WASM instance
    // for the next run while keeping every Emscripten _main() strictly one-shot.
    if (acquiredAttempt1) {
      scheduleNextPrewarm();
    }
  }
});
