import type { NgspiceModule, SpiceProgressStage } from './spiceTypes';

export type ProgressReporter = (stage: SpiceProgressStage, percent: number, label: string) => void;

export interface AcquiredNgspiceInstance {
  instance: NgspiceModule;
  wasWarm: boolean;
}

interface WarmupToken {
  promise: Promise<NgspiceModule>;
  claimed: boolean;
}

export interface NgspiceInstancePool {
  acquire: (reportProgress?: ProgressReporter) => Promise<AcquiredNgspiceInstance>;
  prewarm: () => void;
  hasReadyInstance: () => boolean;
  isWarming: () => boolean;
}

/**
 * Coordinates one-shot Emscripten ngspice instances inside the SPICE Web Worker.
 * Each acquired instance is guaranteed to be fresh (never re-entered via _main),
 * while background pre-warming prepares the next instance after a run completes.
 */
export function createNgspiceInstancePool(
  createInstance: (reportProgress?: ProgressReporter) => Promise<NgspiceModule>,
  onWarmupError?: (err: unknown) => void,
): NgspiceInstancePool {
  let readyInstance: NgspiceModule | null = null;
  let activeWarmup: WarmupToken | null = null;

  const acquire = async (reportProgress?: ProgressReporter): Promise<AcquiredNgspiceInstance> => {
    if (readyInstance) {
      const instance = readyInstance;
      readyInstance = null;
      return { instance, wasWarm: true };
    }

    if (activeWarmup) {
      activeWarmup.claimed = true;
      const warmupPromise = activeWarmup.promise;
      reportProgress?.('initializing-wasm', 55, 'Finishing SPICE WASM warm-up...');
      const instance = await warmupPromise;
      return { instance, wasWarm: false };
    }

    const instance = await createInstance(reportProgress);
    return { instance, wasWarm: false };
  };

  const prewarm = (): void => {
    if (readyInstance || activeWarmup) return;

    const token: WarmupToken = {
      promise: createInstance(),
      claimed: false,
    };
    activeWarmup = token;

    token.promise.then(
      (instance) => {
        if (activeWarmup === token) {
          activeWarmup = null;
        }
        if (!token.claimed) {
          readyInstance = instance;
        }
      },
      (err) => {
        if (activeWarmup === token) {
          activeWarmup = null;
        }
        onWarmupError?.(err);
      },
    );
  };

  return {
    acquire,
    prewarm,
    hasReadyInstance: () => readyInstance !== null,
    isWarming: () => activeWarmup !== null,
  };
}
