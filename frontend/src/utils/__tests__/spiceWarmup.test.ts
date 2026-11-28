import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import createNgspiceFactory from '@o.z/ngspice-wasm';
import { disposeSpiceEngine, warmUpSpiceEngine } from '../spiceEngine';
import { createNgspiceInstancePool } from '../spiceInstancePool';
import type { NgspiceModule, SpiceProgressStage } from '../spiceTypes';

function runNgspiceOneShot(instance: NgspiceModule, netlist: string): string {
  instance.FS.writeFile('/circuit.cir', netlist);
  try {
    instance.FS.mkdir('/proc');
  } catch {
    // ignore if /proc already exists
  }
  instance.FS.writeFile('/proc/meminfo', 'MemTotal: 16384000 kB\nMemFree: 8192000 kB\n');
  const args = ['ngspice', '-b', '/circuit.cir'];
  const sp = instance.stackSave ? instance.stackSave() : 0;
  try {
    const ptrs = args.map((arg) => {
      const ptr = instance.__emscripten_stack_alloc(arg.length + 1);
      instance.stringToUTF8(arg, ptr, arg.length + 1);
      return ptr;
    });
    const argv = instance.__emscripten_stack_alloc(args.length * 4);
    for (let i = 0; i < args.length; i++) {
      instance.HEAP32[(argv >> 2) + i] = ptrs[i];
    }
    try {
      instance._main(args.length, argv);
    } catch (err: unknown) {
      const exit = err as { name?: string; status?: number } | null;
      if (!exit || exit.name !== 'ExitStatus' || exit.status !== 0) {
        throw err;
      }
    }
  } finally {
    instance.stackRestore?.(sp);
  }
  return instance.FS.readFile('/output.raw', { encoding: 'utf8' });
}

describe('Phase 4.1: Pre-warmed WASM Instance Pool & Persistent SPICE Worker', () => {
  afterEach(() => {
    disposeSpiceEngine();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns a ready pre-warmed instance immediately with zero re-initialization progress', async () => {
    let factoryCalls = 0;
    const pool = createNgspiceInstancePool(async (reportProgress) => {
      factoryCalls++;
      reportProgress?.('loading-engine', 20, 'loading');
      reportProgress?.('initializing-wasm', 55, 'init');
      return { id: factoryCalls } as unknown as NgspiceModule;
    });

    pool.prewarm();
    pool.prewarm(); // single-flight idempotency while warming
    expect(pool.isWarming()).toBe(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(factoryCalls).toBe(1);
    expect(pool.hasReadyInstance()).toBe(true);
    expect(pool.isWarming()).toBe(false);

    const progressStages: SpiceProgressStage[] = [];
    const acquired = await pool.acquire((stage) => progressStages.push(stage));

    expect(acquired.wasWarm).toBe(true);
    expect((acquired.instance as unknown as { id: number }).id).toBe(1);
    expect(factoryCalls).toBe(1);
    expect(progressStages).toEqual([]);
    expect(pool.hasReadyInstance()).toBe(false);
  });

  it('prevents concurrent warm-up double-consumption race when acquire runs mid-warmup', async () => {
    let factoryCalls = 0;
    let resolveFactory!: (mod: NgspiceModule) => void;

    const pool = createNgspiceInstancePool(() => {
      factoryCalls++;
      return new Promise<NgspiceModule>((resolvePromise) => {
        resolveFactory = resolvePromise;
      });
    });

    pool.prewarm();
    expect(pool.isWarming()).toBe(true);
    expect(factoryCalls).toBe(1);

    const stages: SpiceProgressStage[] = [];
    const pendingAcquire = pool.acquire((stage) => stages.push(stage));
    expect(factoryCalls).toBe(1); // reused in-flight warmup promise
    expect(stages).toEqual(['initializing-wasm']);

    resolveFactory({ id: 99 } as unknown as NgspiceModule);
    const first = await pendingAcquire;
    expect(first.wasWarm).toBe(false);
    expect((first.instance as unknown as { id: number }).id).toBe(99);
    // Crucial: the claimed instance must NOT be parked back into readyInstance for a later caller
    expect(pool.hasReadyInstance()).toBe(false);
    expect(pool.isWarming()).toBe(false);
  });

  it('recovers cleanly if background warmup fails and lets next acquire re-create', async () => {
    let attempt = 0;
    const errors: unknown[] = [];
    const pool = createNgspiceInstancePool(
      async () => {
        attempt++;
        if (attempt === 1) throw new Error('Network hiccup');
        return { ok: true } as unknown as NgspiceModule;
      },
      (err) => errors.push(err),
    );

    pool.prewarm();
    await new Promise((r) => setTimeout(r, 10));
    expect(errors).toHaveLength(1);
    expect(pool.isWarming()).toBe(false);
    expect(pool.hasReadyInstance()).toBe(false);

    const next = await pool.acquire();
    expect(next.wasWarm).toBe(false);
    expect((next.instance as unknown as { ok: boolean }).ok).toBe(true);
  });

  it('pre-warms real @o.z/ngspice-wasm cleanly for sequential simulations without C-state corruption', async () => {
    const pool = createNgspiceInstancePool(async () => {
      const mod = await createNgspiceFactory({ print: () => {}, printErr: () => {}, noExitRuntime: false });
      return mod as unknown as NgspiceModule;
    });

    const net1 = '* RC\nV1 in 0 5\nR1 in out 1k\nC1 out 0 1u\n.tran 1u 50u\n.control\nrun\nset filetype=ascii\nwrite /output.raw\n.endc\n.end\n';
    const net2 = '* Divider\nV1 in 0 12\nR1 in out 3k\nR2 out 0 9k\n.op\n.control\nrun\nset filetype=ascii\nwrite /output.raw\n.endc\n.end\n';

    const cold = await pool.acquire();
    expect(cold.wasWarm).toBe(false);
    const raw1 = runNgspiceOneShot(cold.instance, net1);
    expect(raw1).toContain('Transient Analysis');

    // Start pre-warming the next instance and allow it to finish before second acquire
    pool.prewarm();
    while (pool.isWarming()) {
      await new Promise((r) => setTimeout(r, 5));
    }
    expect(pool.hasReadyInstance()).toBe(true);

    const warmStart = performance.now();
    const warm = await pool.acquire();
    const warmAcquireMs = performance.now() - warmStart;
    expect(warm.wasWarm).toBe(true);
    expect(warmAcquireMs).toBeLessThan(15);

    const raw2 = runNgspiceOneShot(warm.instance, net2);
    expect(raw2).toContain('Operating Point');
    expect(raw2).not.toContain('Transient Analysis');
  });

  it('warmUpSpiceEngine posts a single WARMUP command to persistent worker and wires Simulator mount warmup', () => {
    const messages: unknown[] = [];
    let constructed = 0;

    class MockWorker {
      onmessage: ((ev: MessageEvent) => void) | null = null;
      onerror: ((ev: ErrorEvent) => void) | null = null;
      constructor() {
        constructed++;
      }
      postMessage(msg: unknown) {
        messages.push(msg);
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', MockWorker);

    warmUpSpiceEngine();
    warmUpSpiceEngine(); // idempotent while persistent worker is alive
    expect(constructed).toBe(1);
    expect(messages).toEqual([{ type: 'WARMUP' }]);

    const simSrc = readFileSync(resolve(__dirname, '../../pages/Simulator.tsx'), 'utf8');
    const workerSrc = readFileSync(resolve(__dirname, '../spiceWorker.ts'), 'utf8');
    expect(simSrc).toContain('warmUpSpiceEngine()');
    expect(workerSrc).toContain('ngspicePool.prewarm()');
  });
});
