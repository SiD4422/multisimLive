// spiceEngine.ts
import type { NoiseSummary, SpiceJob, SpiceProgress, SpiceResult, SweepMetadata } from './spiceTypes';

let currentJobId = 0;
let pendingJob: SpiceJob | null = null;
let persistentWorker: Worker | null = null;
let persistentWorkerCtor: typeof Worker | null = null;
let warmUpPosted = false;

interface WorkerResponsePayload {
  id: number;
  type: 'PROGRESS' | 'SUCCESS' | 'ERROR';
  progress?: SpiceProgress;
  data: SpiceResult;
  error: string;
  __plotType?: string;
  __isComplex?: boolean;
  __variables?: unknown[];
  __sweepMeta?: SweepMetadata;
  __noiseSummary?: NoiseSummary;
  engineVersion?: string;
}

function resetPersistentWorker(): void {
  if (persistentWorker) {
    persistentWorker.terminate();
    persistentWorker = null;
  }
  persistentWorkerCtor = null;
  warmUpPosted = false;
}

function handleWorkerMessage(e: MessageEvent): void {
  const { id: incomingId, type, progress, data, error, __plotType, __isComplex, __variables, __sweepMeta, __noiseSummary, engineVersion } =
    e.data as WorkerResponsePayload;

  if (!pendingJob || pendingJob.id !== incomingId) return;

  if (type === 'PROGRESS') {
    if (progress) pendingJob.onProgress?.(progress);
    return;
  }

  clearTimeout(pendingJob.timeoutId);
  const completedJob = pendingJob;
  pendingJob = null;

  if (type === 'SUCCESS') {
    // Re-attach the hidden properties needed by Grapher
    if (__plotType) (data as SpiceResult).__plotType = __plotType as SpiceResult['__plotType'];
    if (__isComplex !== undefined) (data as SpiceResult).__isComplex = __isComplex;
    if (__variables) (data as SpiceResult).__variables = __variables as SpiceResult['__variables'];
    if (__sweepMeta) (data as SpiceResult).__sweepMeta = __sweepMeta;
    if (__noiseSummary) (data as SpiceResult).__noiseSummary = __noiseSummary;
    if (engineVersion) (data as SpiceResult).__engineVersion = engineVersion;

    completedJob.resolve(data);
  } else {
    completedJob.reject(new Error(error));
  }
}

function handleWorkerError(e: ErrorEvent): void {
  console.error('Worker error:', e);
  if (pendingJob) {
    clearTimeout(pendingJob.timeoutId);
    const failedJob = pendingJob;
    pendingJob = null;
    resetPersistentWorker();
    failedJob.reject(new Error('Worker fatal error'));
  } else {
    resetPersistentWorker();
  }
}

function ensureWorker(): { worker: Worker; reused: boolean } {
  const CurrentWorker = globalThis.Worker;
  if (persistentWorker && persistentWorkerCtor === CurrentWorker) {
    return { worker: persistentWorker, reused: true };
  }

  resetPersistentWorker();
  const worker = new CurrentWorker(new URL('./spiceWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = handleWorkerMessage;
  worker.onerror = handleWorkerError;
  persistentWorker = worker;
  persistentWorkerCtor = CurrentWorker;
  warmUpPosted = false;
  return { worker, reused: false };
}

/**
 * Starts the persistent SPICE worker and pre-warms its first ngspice WASM instance in the background.
 */
export function warmUpSpiceEngine(): void {
  if (typeof globalThis.Worker === 'undefined') return;
  if (persistentWorker && persistentWorkerCtor === globalThis.Worker && warmUpPosted) return;
  const { worker } = ensureWorker();
  warmUpPosted = true;
  worker.postMessage({ type: 'WARMUP' });
}

/**
 * Terminates any active SPICE worker and resets module state (primarily for tests/cleanup).
 */
export function disposeSpiceEngine(): void {
  if (pendingJob) {
    clearTimeout(pendingJob.timeoutId);
    const cancelledJob = pendingJob;
    pendingJob = null;
    cancelledJob.reject(new Error('CANCELLED_BY_DISPOSE'));
  }
  resetPersistentWorker();
}

export async function runSpiceSimulation(
  netlist: string,
  isSilent = false,
  onProgress?: (progress: SpiceProgress) => void,
  sweep?: SweepMetadata,
): Promise<SpiceResult> {
  // Pre-flight DRC: detect netlists that contain only voltage/current sources with no load.
  // Parse actual SPICE component lines (non-comment, non-directive lines starting with component letters).
  const lines = netlist.split('\n').filter(l => {
    const t = l.trim();
    return t && !t.startsWith('*') && !t.startsWith('.') && !t.startsWith('+');
  });
  const hasSource = lines.some(l => /^[VIvi]/i.test(l));
  const hasLoad = lines.some(l => /^[RCLDQMXrcldqmx]/i.test(l));
  if (hasSource && !hasLoad) {
    throw new Error('Ideal voltage source shorted or floating. Add a resistor to prevent infinite current.');
  }

  if (pendingJob) {
    if (!isSilent) {
      throw new Error('ALREADY_SIMULATING'); // Prevent double-click from killing active job
    }
    // WASM _main blocks the worker thread mid-run, so aborting a live job requires terminating that worker.
    clearTimeout(pendingJob.timeoutId);
    const interruptedJob = pendingJob;
    pendingJob = null;
    resetPersistentWorker();
    interruptedJob.reject(new Error('CANCELLED_BY_NEW_JOB'));
  }

  currentJobId++;
  const id = currentJobId;

  return new Promise<SpiceResult>((resolve, reject) => {
    const { worker, reused } = ensureWorker();
    onProgress?.({
      stage: 'spawning-worker',
      percent: 5,
      label: reused ? 'Using warm SPICE engine...' : 'Starting SPICE worker...',
    });

    // Safety timeout: if worker doesn't respond in 60s, auto-kill and reset it
    const timeoutId = setTimeout(() => {
      console.error('[SpiceEngine] Worker timed out after 60s. Killing.');
      if (pendingJob && pendingJob.id === id) {
        pendingJob = null;
      }
      resetPersistentWorker();
      reject(new Error('Simulation timed out. The WASM engine took too long to respond. Please try again.'));
    }, 60000);

    pendingJob = { id, resolve, reject, worker, timeoutId, onProgress };
    warmUpPosted = true;
    worker.postMessage({ id, type: 'RUN', netlist, ...(sweep ? { sweep } : {}) });
  });
}
