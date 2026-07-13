// spiceEngine.ts

let spiceWorker: Worker | null = null;
let currentJobId = 0;
let pendingJob: { id: number; resolve: (data: any) => void; reject: (err: any) => void } | null = null;

function getWorker(): Worker {
  if (!spiceWorker) {
    spiceWorker = new Worker(new URL('./spiceWorker.ts', import.meta.url), { type: 'module' });
    spiceWorker.onmessage = (e) => {
      const { id, type, data, error, __plotType, __isComplex, __variables } = e.data;
      if (pendingJob && pendingJob.id === id) {
        if (type === 'SUCCESS') {
          // Re-attach the hidden properties needed by Grapher
          if (__plotType) (data as any).__plotType = __plotType;
          if (__isComplex !== undefined) (data as any).__isComplex = __isComplex;
          if (__variables) (data as any).__variables = __variables;
          
          pendingJob.resolve(data);
        } else {
          pendingJob.reject(new Error(error));
        }
        pendingJob = null;
      }
    };
    spiceWorker.onerror = (e) => {
      console.error("Worker error:", e);
      if (pendingJob) {
        pendingJob.reject(new Error("Worker fatal error"));
        pendingJob = null;
      }
    };
  }
  return spiceWorker;
}

export async function runSpiceSimulation(netlist: string, isSilent = false): Promise<any[]> {
  const worker = getWorker();
  
  if (pendingJob) {
    if (!isSilent) {
      throw new Error("ALREADY_SIMULATING"); // Prevent double-click from killing active job
    }
    // Cancel previous job if it's still running and we are in silent (Live) mode
    pendingJob.reject(new Error("CANCELLED_BY_NEW_JOB"));
    pendingJob = null;
  }
  
  currentJobId++;
  const id = currentJobId;
  
  return new Promise((resolve, reject) => {
    pendingJob = { id, resolve, reject };
    worker.postMessage({ id, netlist });
  });
}


