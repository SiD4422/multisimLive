// spiceEngine.ts
import type { SpiceJob, SpiceResult } from './spiceTypes';

let currentJobId = 0;
let pendingJob: SpiceJob | null = null;

export async function runSpiceSimulation(netlist: string, isSilent = false): Promise<SpiceResult> {
  if (pendingJob) {
    if (!isSilent) {
      throw new Error("ALREADY_SIMULATING"); // Prevent double-click from killing active job
    }
    // Cancel previous job if it's still running and we are in silent (Live) mode
    clearTimeout(pendingJob.timeoutId);
    pendingJob.worker.terminate();
    pendingJob.reject(new Error("CANCELLED_BY_NEW_JOB"));
    pendingJob = null;
  }
  
  currentJobId++;
  const id = currentJobId;
  
  return new Promise<SpiceResult>((resolve, reject) => {
    // Create a completely fresh worker for every run.
    // This prevents ngspice-wasm from crashing or hanging due to stale C-state or global scope pollution on subsequent runs.
    const worker = new Worker(new URL('./spiceWorker.ts', import.meta.url), { type: 'module' });
    
    // Safety timeout: if worker doesn't respond in 60s, auto-kill it
    const timeoutId = setTimeout(() => {
      console.error('[SpiceEngine] Worker timed out after 60s. Killing.');
      worker.terminate();
      if (pendingJob && pendingJob.id === id) {
        pendingJob = null;
      }
      reject(new Error('Simulation timed out. The WASM engine took too long to respond. Please try again.'));
    }, 60000);

    worker.onmessage = (e: MessageEvent) => {
      const { id: incomingId, type, data, error, __plotType, __isComplex, __variables } = e.data as {
        id: number;
        type: 'SUCCESS' | 'ERROR';
        data: SpiceResult;
        error: string;
        __plotType?: string;
        __isComplex?: boolean;
        __variables?: unknown[];
      };
      if (pendingJob && pendingJob.id === incomingId) {
        clearTimeout(pendingJob.timeoutId);
        if (type === 'SUCCESS') {
          // Re-attach the hidden properties needed by Grapher
          if (__plotType) (data as SpiceResult).__plotType = __plotType as SpiceResult['__plotType'];
          if (__isComplex !== undefined) (data as SpiceResult).__isComplex = __isComplex;
          if (__variables) (data as SpiceResult).__variables = __variables as SpiceResult['__variables'];
          
          pendingJob.resolve(data);
        } else {
          pendingJob.reject(new Error(error));
        }
        worker.terminate();
        pendingJob = null;
      }
    };
    
    worker.onerror = (e: ErrorEvent) => {
      console.error("Worker error:", e);
      if (pendingJob && pendingJob.id === id) {
        clearTimeout(pendingJob.timeoutId);
        pendingJob.reject(new Error("Worker fatal error"));
        pendingJob.worker.terminate();
        pendingJob = null;
      } else {
        worker.terminate();
      }
    };

    pendingJob = { id, resolve, reject, worker, timeoutId };
    worker.postMessage({ id, netlist });
  });
}
