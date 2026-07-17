// spiceEngine.ts

let currentJobId = 0;
let pendingJob: { 
  id: number; 
  resolve: (data: any) => void; 
  reject: (err: any) => void;
  worker: Worker;
  timeoutId: ReturnType<typeof setTimeout>;
} | null = null;

export async function runSpiceSimulation(netlist: string, isSilent = false): Promise<any[]> {
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
  
  return new Promise((resolve, reject) => {
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

    worker.onmessage = (e) => {
      const { id: incomingId, type, data, error, __plotType, __isComplex, __variables } = e.data;
      if (pendingJob && pendingJob.id === incomingId) {
        clearTimeout(pendingJob.timeoutId);
        if (type === 'SUCCESS') {
          // Re-attach the hidden properties needed by Grapher
          if (__plotType) (data as any).__plotType = __plotType;
          if (__isComplex !== undefined) (data as any).__isComplex = __isComplex;
          if (__variables) (data as any).__variables = __variables;
          
          pendingJob.resolve(data);
        } else {
          pendingJob.reject(new Error(error));
        }
        worker.terminate();
        pendingJob = null;
      }
    };
    
    worker.onerror = (e) => {
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
