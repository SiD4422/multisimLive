// spiceTypes.ts
// Shared TypeScript interfaces for ngspice simulation data.
// Import these instead of using `any` for simulation-related types.

/**
 * A single row of SPICE simulation output data.
 * Keys are node/branch names (e.g. 'v(out)', 'i(v1)', 'time', 'frequency').
 * Values are always numbers (voltage, current, frequency, or time).
 */
export interface SpiceDataRow {
  time?: number;
  frequency?: number;
  [signal: string]: number | undefined;
}

/**
 * A single entry in an Operating Point (.op) analysis result.
 */
export interface OpDataPoint {
  node: string;
  value: number;
  unit: string;
}

/**
 * The result of a SPICE simulation — either transient/AC/DC data rows or OP data.
 */
export type SpiceResult = SpiceDataRow[] & {
  __plotType?: 'transient' | 'ac' | 'dc' | 'op';
  __isComplex?: boolean;
  __variables?: SpiceVariable[];
};

/**
 * A SPICE variable descriptor from the raw output file header.
 */
export interface SpiceVariable {
  name: string;
  type: string;
}

/**
 * Minimal interface for the ngspice WebAssembly module instance.
 * Covers only the methods/properties actually used in spiceWorker.ts.
 */
export interface NgspiceModule {
  FS: {
    mkdir: (path: string) => void;
    writeFile: (path: string, data: string) => void;
    readFile: (path: string, opts: { encoding: string }) => string;
  };
  _main: (argc: number, argv: number) => number;
  __emscripten_stack_alloc: (size: number) => number;
  stringToUTF8: (str: string, ptr: number, len: number) => void;
  HEAP32: Int32Array;
}

/**
 * A pending simulation job tracked by spiceEngine.ts.
 */
export interface SpiceJob {
  id: number;
  resolve: (data: SpiceResult) => void;
  reject: (err: Error) => void;
  worker: Worker;
  timeoutId: ReturnType<typeof setTimeout>;
}
