import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import LZString from 'lz-string';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const forkMockState = {
  currentUser: null as { uid: string } | null,
  cloudDocs: new Map<string, Record<string, unknown>>(),
};

vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    get currentUser() {
      return forkMockState.currentUser;
    },
  }),
  onAuthStateChanged: vi.fn(() => () => {}),
  GoogleAuthProvider: class {
    setCustomParameters = vi.fn();
  },
  GithubAuthProvider: class {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({ __mockDb: true }),
  collection: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  doc: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  serverTimestamp: () => '__SERVER_TIME__',
  setDoc: async (ref: { path: string }, data: Record<string, unknown>) => {
    forkMockState.cloudDocs.set(ref.path, data);
  },
  getDocs: async () => ({ docs: [] }),
  query: (col: { path: string }) => col,
  orderBy: () => ({}),
  limit: () => ({}),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  increment: vi.fn(),
}));

import { buildNewCircuitDocument } from '../../lib/firebase';
import { useSchematicStore } from '../../store/useSchematicStore';
import { loadSavedCircuits } from '../circuitSavesStorage';
import { forkCircuitToAccount, resetCloudSyncForTest } from '../cloudSync';
import {
  buildForkedCircuitName,
  formatForkAttributionLabel,
  sanitizeForkAttribution,
} from '../forkAttribution';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const FRONTEND_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = resolve(__dirname, '../..');

describe('Phase 5.4: Circuit Forking / Remix & Attribution', () => {
  let memoryStorage: Storage;

  beforeEach(() => {
    memoryStorage = createMemoryStorage();
    vi.stubGlobal('window', {
      localStorage: memoryStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('navigator', { onLine: true });
    forkMockState.currentUser = null;
    forkMockState.cloudDocs.clear();
    resetCloudSyncForTest();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats forked names cleanly, sanitizes attribution bounds, and persists forkedFrom across import/export', () => {
    expect(buildForkedCircuitName('  Wien Bridge Oscillator  ')).toBe('Wien Bridge Oscillator (Fork)');
    expect(buildForkedCircuitName('Wien Bridge Oscillator (Fork)')).toBe('Wien Bridge Oscillator (Fork)');
    expect(buildForkedCircuitName('X'.repeat(120))).toHaveLength(100);

    const sanitized = sanitizeForkAttribution({
      sourceCircuitId: 'circ-123',
      sourceName: 'Colpitts VCO',
      sourceAuthor: '',
      sourceType: 'community',
    });
    expect(sanitized).toEqual({
      sourceCircuitId: 'circ-123',
      sourceName: 'Colpitts VCO',
      sourceAuthor: 'Anonymous',
      sourceType: 'community',
    });
    expect(formatForkAttributionLabel(sanitized!)).toBe('Forked from Colpitts VCO');
    expect(sanitizeForkAttribution({ sourceCircuitId: '', sourceName: 'No ID' })).toBeUndefined();

    const payload = JSON.stringify({
      components: [{ id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 100 } }],
      wires: [],
      probes: [],
      forkedFrom: sanitized,
    });
    useSchematicStore.getState().importState(payload);
    expect(useSchematicStore.getState().forkedFrom).toEqual(sanitized);

    const exported = JSON.parse(useSchematicStore.getState().exportState()) as { forkedFrom?: unknown };
    expect(exported.forkedFrom).toEqual(sanitized);

    // Clearing or importing a non-forked circuit removes stale attribution
    useSchematicStore.getState().importState(JSON.stringify({ components: [], wires: [], probes: [] }));
    expect(useSchematicStore.getState().forkedFrom).toBeNull();
  });

  it('forks a community circuit into the signed-in user account with attribution and supports remix publishing', async () => {
    const communityCircuitData = LZString.compressToEncodedURIComponent(
      JSON.stringify({
        components: [
          { id: 'V1', type: 'DCSource', value: '5', position: { x: 0, y: 0 } },
          { id: 'R1', type: 'Resistor', value: '10k', position: { x: 100, y: 0 } },
        ],
        wires: [],
        probes: [],
      }),
    );

    // Unauthenticated fork must fail cleanly so UI prompts login
    await expect(
      forkCircuitToAccount({
        sourceCircuitId: 'comm_99',
        sourceName: '5V Divider',
        sourceAuthor: 'Alex',
        circuitData: communityCircuitData,
      }),
    ).rejects.toThrow(/AUTH_REQUIRED/);

    // Signed-in fork creates a saved copy under users/{uid}/circuits and localStorage
    forkMockState.currentUser = { uid: 'uid-remixer-7' };
    const result = await forkCircuitToAccount({
      sourceCircuitId: 'comm_99',
      sourceName: '5V Divider',
      sourceAuthor: 'Alex',
      circuitData: communityCircuitData,
      now: 1700000000000,
    });

    expect(result.syncedToCloud).toBe(true);
    expect(result.saved.name).toBe('5V Divider (Fork)');
    expect(result.forkedFrom).toEqual({
      sourceCircuitId: 'comm_99',
      sourceName: '5V Divider',
      sourceAuthor: 'Alex',
      sourceType: 'community',
    });

    // Stored payload decompresses cleanly with standard LZString.decompress (matching SavedCircuitsModal)
    const cloudDoc = forkMockState.cloudDocs.get(`users/uid-remixer-7/circuits/${result.saved.id}`);
    expect(cloudDoc).toBeDefined();
    expect(cloudDoc!.forkedFrom).toEqual(result.forkedFrom);
    const decoded = JSON.parse(LZString.decompress(String(cloudDoc!.compressed))!);
    expect(decoded.components).toHaveLength(2);
    expect(decoded.forkedFrom).toEqual(result.forkedFrom);

    // Offline localStorage fallback copy matches too
    const local = loadSavedCircuits(memoryStorage);
    expect(local).toHaveLength(1);
    expect(local[0].forkedFrom).toEqual(result.forkedFrom);

    // Republishing remix carries immutable forkedFrom attribution in public gallery doc
    const publishDoc = buildNewCircuitDocument(
      {
        name: '5V Divider (Fork)',
        description: 'Added decoupling cap',
        category: 'basic',
        authorName: 'Remixer',
        componentCount: 3,
        circuitData: communityCircuitData,
        forkedFrom: result.forkedFrom,
      },
      'uid-remixer-7',
    );
    expect(publishDoc.forkedFrom).toEqual(result.forkedFrom);
  });

  it('wires firestore.rules attribution and Fork buttons/badges across CircuitsPage, AuthModal, Simulator, PublishModal, and SavedCircuitsModal', () => {
    const rules = readFileSync(resolve(FRONTEND_ROOT, 'firestore.rules'), 'utf8');
    expect(rules).toContain('function validForkedFrom');
    expect(rules).toContain('next.forkedFrom == prev.forkedFrom');

    const circuitsSrc = readFileSync(resolve(SRC_ROOT, 'pages/CircuitsPage.tsx'), 'utf8');
    const authModalSrc = readFileSync(resolve(SRC_ROOT, 'components/AuthModal.tsx'), 'utf8');
    const simSrc = readFileSync(resolve(SRC_ROOT, 'pages/Simulator.tsx'), 'utf8');
    const publishSrc = readFileSync(resolve(SRC_ROOT, 'components/PublishModal.tsx'), 'utf8');
    const savesSrc = readFileSync(resolve(SRC_ROOT, 'components/SavedCircuitsModal.tsx'), 'utf8');

    expect(circuitsSrc).toContain('forkCircuitToAccount');
    expect(circuitsSrc).toContain('handleForkClick');
    expect(circuitsSrc).toContain('formatForkAttributionLabel');
    expect(authModalSrc).toContain('onAuthenticated');
    expect(simSrc).toContain('formatForkAttributionLabel');
    expect(publishSrc).toContain('forkedFrom');
    expect(savesSrc).toContain('formatForkAttributionLabel');
  });
});
