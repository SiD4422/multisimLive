import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { disposeSpiceEngine, runSpiceSimulation } from '../spiceEngine';
import type { SpiceProgress } from '../spiceTypes';

const SRC_ROOT = resolve(__dirname, '../..');

describe('Phase 3.1: Bundle Optimization, Lazy Firebase & Worker Progress', () => {
  afterEach(() => {
    disposeSpiceEngine();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('spiceEngine progress streaming & worker lifecycle', () => {
    it('streams worker PROGRESS stages, keeps persistent worker alive across runs, and resolves on SUCCESS', async () => {
      const stages: SpiceProgress[] = [];
      let terminatedCount = 0;
      let constructedCount = 0;
      let postedMsg: { id?: number; type?: string; netlist?: string } | null = null;
      let capturedWorker: {
        onmessage: ((ev: MessageEvent) => void) | null;
        onerror: ((ev: ErrorEvent) => void) | null;
        postMessage: (msg: unknown) => void;
        terminate: () => void;
      } | null = null;

      class MockWorker {
        onmessage: ((ev: MessageEvent) => void) | null = null;
        onerror: ((ev: ErrorEvent) => void) | null = null;
        constructor() {
          constructedCount++;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          capturedWorker = this;
        }
        postMessage(msg: unknown) {
          postedMsg = msg as { id?: number; type?: string; netlist?: string };
        }
        terminate() {
          terminatedCount++;
        }
      }

      vi.stubGlobal('Worker', MockWorker);

      const simPromise = runSpiceSimulation(
        '* RC\nV1 in 0 5\nR1 in out 1k\nC1 out 0 1u\n.tran 1u 100u\n.end',
        false,
        (progress) => stages.push(progress),
      );

      expect(capturedWorker).not.toBeNull();
      expect(constructedCount).toBe(1);
      expect(postedMsg).not.toBeNull();
      expect(stages.map((s) => s.stage)).toEqual(['spawning-worker']);
      expect(terminatedCount).toBe(0);

      const jobId = postedMsg!.id!;
      const emit = (payload: unknown) => {
        capturedWorker!.onmessage?.({ data: payload } as MessageEvent);
      };

      emit({
        id: jobId,
        type: 'PROGRESS',
        progress: { stage: 'loading-engine', percent: 20, label: 'Loading ngspice WASM engine (7 MB)...' },
      });
      emit({
        id: jobId,
        type: 'PROGRESS',
        progress: { stage: 'initializing-wasm', percent: 55, label: 'Initializing SPICE WASM solver...' },
      });
      emit({
        id: jobId,
        type: 'PROGRESS',
        progress: { stage: 'solving', percent: 75, label: 'Solving circuit MNA matrix...' },
      });

      expect(terminatedCount).toBe(0);
      expect(stages.map((s) => s.stage)).toEqual([
        'spawning-worker',
        'loading-engine',
        'initializing-wasm',
        'solving',
      ]);
      expect(stages.map((s) => s.percent)).toEqual([5, 20, 55, 75]);

      emit({
        id: jobId,
        type: 'SUCCESS',
        data: [{ time: 0, 'v(out)': 0 }, { time: 1e-4, 'v(out)': 0.475 }],
        __plotType: 'transient',
        __isComplex: false,
        __variables: ['time', 'v(out)'],
        engineVersion: 'ngspice-44',
      });

      const res = await simPromise;
      // Phase 4.1: keep the healthy persistent worker alive so its pre-warmed WASM instance stays warm.
      expect(terminatedCount).toBe(0);
      expect(res.length).toBe(2);
      expect(res.__plotType).toBe('transient');
      expect(res.__engineVersion).toBe('ngspice-44');

      // Second sequential simulation reuses the exact same persistent worker instance.
      const run2Stages: SpiceProgress[] = [];
      const simPromise2 = runSpiceSimulation(
        '* RC2\nV1 in 0 5\nR1 in out 2k\nC1 out 0 1u\n.tran 1u 100u\n.end',
        false,
        (progress) => run2Stages.push(progress),
      );
      expect(constructedCount).toBe(1);
      expect(run2Stages[0]?.label).toMatch(/warm/i);
      emit({
        id: postedMsg!.id!,
        type: 'SUCCESS',
        data: [{ time: 0, 'v(out)': 0 }, { time: 1e-4, 'v(out)': 0.244 }],
        __plotType: 'transient',
      });
      const res2 = await simPromise2;
      expect(res2.length).toBe(2);
      expect(terminatedCount).toBe(0);
    });

    it('terminates blocked worker when a silent re-simulation cancels an in-flight run and spawns a replacement', async () => {
      const workers: Array<{
        terminated: boolean;
        onmessage: ((ev: MessageEvent) => void) | null;
        onerror: ((ev: ErrorEvent) => void) | null;
        lastMsg: { id?: number } | null;
        postMessage: (msg: unknown) => void;
        terminate: () => void;
      }> = [];

      class MockWorker {
        terminated = false;
        onmessage: ((ev: MessageEvent) => void) | null = null;
        onerror: ((ev: ErrorEvent) => void) | null = null;
        lastMsg: { id?: number } | null = null;
        constructor() {
          workers.push(this);
        }
        postMessage(msg: unknown) {
          this.lastMsg = msg as { id?: number };
        }
        terminate() {
          this.terminated = true;
        }
      }

      vi.stubGlobal('Worker', MockWorker);

      const job1 = runSpiceSimulation('* RC1\nV1 in 0 5\nR1 in out 1k\nC1 out 0 1u\n.tran 1u 100u\n.end', false);
      const job2 = runSpiceSimulation('* RC2\nV1 in 0 5\nR1 in out 2k\nC1 out 0 1u\n.tran 1u 100u\n.end', true);

      await expect(job1).rejects.toThrow('CANCELLED_BY_NEW_JOB');
      expect(workers).toHaveLength(2);
      expect(workers[0].terminated).toBe(true);
      expect(workers[1].terminated).toBe(false);

      workers[1].onmessage?.({
        data: {
          id: workers[1].lastMsg!.id,
          type: 'SUCCESS',
          data: [{ time: 0, 'v(out)': 0 }],
          __plotType: 'transient',
        },
      } as MessageEvent);
      const res2 = await job2;
      expect(res2).toHaveLength(1);
    });

    it('rejects unloaded voltage sources in pre-flight DRC before spawning a Worker', async () => {
      let workerConstructed = false;
      class MockWorker {
        constructor() {
          workerConstructed = true;
        }
        postMessage() {}
        terminate() {}
      }
      vi.stubGlobal('Worker', MockWorker);

      await expect(
        runSpiceSimulation('* Bad\nV1 n1 0 5\n.tran 1u 10u\n.end', false),
      ).rejects.toThrow(/shorted or floating/i);
      expect(workerConstructed).toBe(false);
    });
  });

  describe('static bundle boundary invariants', () => {
    it('keeps Firebase SDK dynamically loaded (no static runtime imports in client entry/routes/modals)', () => {
      const files = [
        'lib/firebase.ts',
        'hooks/useAuth.ts',
        'hooks/useCircuitBoot.ts',
        'utils/dbUsage.ts',
        'utils/cloudSync.ts',
        'pages/CircuitsPage.tsx',
        'components/PublishModal.tsx',
        'components/ShareModal.tsx',
        'components/AccountMenu.tsx',
        'components/AuthModal.tsx',
        'components/SavedCircuitsModal.tsx',
        'components/StatusBar.tsx',
      ];
      for (const rel of files) {
        const src = readFileSync(resolve(SRC_ROOT, rel), 'utf8');
        const staticRuntimeFirebaseImports = src
          .split(/\r?\n/)
          .filter((line) => /^\s*import(?!\s*\()\b/.test(line) && !/^\s*import\s+type\b/.test(line))
          .filter((line) => /['"](?:firebase\/|\.\.\/lib\/firebase)/.test(line));
        expect(staticRuntimeFirebaseImports, `Static Firebase runtime import found in ${rel}`).toEqual([]);
      }
    });

    it('keeps @o.z/ngspice-wasm out of static top-level worker imports', () => {
      const workerSrc = readFileSync(resolve(SRC_ROOT, 'utils/spiceWorker.ts'), 'utf8');
      const staticWasmImports = workerSrc
        .split(/\r?\n/)
        .filter((line) => /^\s*import(?!\s*\()\b/.test(line) && !/^\s*import\s+type\b/.test(line))
        .filter((line) => line.includes('@o.z/ngspice-wasm'));
      expect(staticWasmImports).toEqual([]);
      expect(workerSrc).toContain("import('@o.z/ngspice-wasm')");
    });

    it('lazy-loads heavy marketing/template pages in marketingRoutes.tsx while keeping SSR eager support', () => {
      const routesSrc = readFileSync(resolve(SRC_ROOT, 'routes/marketingRoutes.tsx'), 'utf8');
      for (const page of [
        'FeaturesPage',
        'EducatorsPage',
        'AboutPage',
        'ShowcasePage',
        'CircuitTemplatePage',
        'ProcedurePage',
        'ResourcesPage',
      ]) {
        const hasStaticImport = new RegExp(`^\\s*import\\b.*\\b${page}\\b`, 'm').test(routesSrc);
        expect(hasStaticImport, `${page} must not be statically imported in marketingRoutes.tsx`).toBe(false);
        expect(routesSrc).toContain(`import('../pages/${page}')`);
      }
    });
  });
});
