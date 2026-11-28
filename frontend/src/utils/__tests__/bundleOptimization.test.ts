import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runSpiceSimulation } from '../spiceEngine';
import type { SpiceProgress } from '../spiceTypes';

const SRC_ROOT = resolve(__dirname, '../..');

describe('Phase 3.1: Bundle Optimization, Lazy Firebase & Worker Progress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('spiceEngine progress streaming & worker lifecycle', () => {
    it('streams worker PROGRESS stages without premature termination and resolves on SUCCESS', async () => {
      const stages: SpiceProgress[] = [];
      let terminated = false;
      let postedMsg: { id: number; netlist: string } | null = null;
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
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          capturedWorker = this;
        }
        postMessage(msg: unknown) {
          postedMsg = msg as { id: number; netlist: string };
        }
        terminate() {
          terminated = true;
        }
      }

      vi.stubGlobal('Worker', MockWorker);

      const simPromise = runSpiceSimulation(
        '* RC\nV1 in 0 5\nR1 in out 1k\nC1 out 0 1u\n.tran 1u 100u\n.end',
        false,
        (progress) => stages.push(progress),
      );

      expect(capturedWorker).not.toBeNull();
      expect(postedMsg).not.toBeNull();
      expect(stages.map((s) => s.stage)).toEqual(['spawning-worker']);
      expect(terminated).toBe(false);

      const jobId = postedMsg!.id;
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

      expect(terminated).toBe(false);
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
      expect(terminated).toBe(true);
      expect(res.length).toBe(2);
      expect(res.__plotType).toBe('transient');
      expect(res.__engineVersion).toBe('ngspice-44');
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
        'utils/dbUsage.ts',
        'pages/CircuitsPage.tsx',
        'components/PublishModal.tsx',
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
