import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockFirebaseState = {
  currentUser: null as { uid: string } | null,
  cloudDocs: new Map<string, Record<string, unknown>>(),
  failNextWrite: false,
  writeDeferred: null as { promise: Promise<void>; onEntered: () => void } | null,
};

vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    get currentUser() {
      return mockFirebaseState.currentUser;
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
  increment: (n: number) => ({ __increment: n }),
  orderBy: () => ({ __orderBy: true }),
  limit: () => ({ __limit: true }),
  query: (col: { path: string }) => col,
  getDocs: async (col: { path: string }) => {
    const prefix = `${col.path}/`;
    const docs = Array.from(mockFirebaseState.cloudDocs.entries())
      .filter(([path]) => path.startsWith(prefix))
      .map(([path, data]) => ({
        id: path.slice(prefix.length),
        data: () => data,
      }));
    return { docs };
  },
  setDoc: async (ref: { path: string }, data: Record<string, unknown>) => {
    if (mockFirebaseState.writeDeferred) {
      const deferred = mockFirebaseState.writeDeferred;
      mockFirebaseState.writeDeferred = null;
      deferred.onEntered();
      await deferred.promise;
      mockFirebaseState.cloudDocs.set(ref.path, data);
      return;
    }
    if (mockFirebaseState.failNextWrite) {
      mockFirebaseState.failNextWrite = false;
      throw new Error('UNAVAILABLE: simulated offline network drop');
    }
    mockFirebaseState.cloudDocs.set(ref.path, data);
  },
  deleteDoc: async (ref: { path: string }) => {
    mockFirebaseState.cloudDocs.delete(ref.path);
  },
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

import {
  deleteUserCloudCircuit,
  importLocalCircuitsToCloud,
  listUserCloudCircuits,
  saveUserCloudCircuit,
} from '../../lib/firebase';
import {
  getLocalOnlyCircuitsPendingImport,
  isCloudImportDismissed,
  loadSavedCircuits,
  mergeLocalAndCloudCircuits,
  sanitizeCloudCircuitId,
  setCloudImportDismissed,
  upsertLocalCircuitSave,
} from '../circuitSavesStorage';
import {
  deleteSavedCircuitDual,
  dismissCloudImportPrompt,
  getCloudSyncLabel,
  getCloudSyncSnapshot,
  importPendingLocalCircuitsToCloud,
  refreshCloudCircuitsForUser,
  resetCloudSyncForTest,
  saveCircuitDual,
} from '../cloudSync';

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

describe('Phase 5.2: Cloud Circuit Saving, Local Fallback & Sync Indicator', () => {
  let memoryStorage: Storage;

  beforeEach(() => {
    memoryStorage = createMemoryStorage();
    vi.stubGlobal('window', {
      localStorage: memoryStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('navigator', { onLine: true });
    mockFirebaseState.currentUser = null;
    mockFirebaseState.cloudDocs.clear();
    mockFirebaseState.failNextWrite = false;
    mockFirebaseState.writeDeferred = null;
    resetCloudSyncForTest();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('merges localStorage + cloud saves newest-first and detects local circuits pending import', () => {
    const local = [
      { id: '100', name: 'RC Filter', compressed: 'loc_rc_newer', savedAt: 2000, componentCount: 3 },
      { id: '200', name: 'Only Local', compressed: 'loc_only', savedAt: 1500, componentCount: 4 },
    ];
    const cloud = [
      { id: '100', name: 'RC Filter', compressed: 'cld_rc_older', savedAt: 1000, componentCount: 3 },
      { id: '300', name: 'Only Cloud', compressed: 'cld_only', savedAt: 2500, componentCount: 6 },
    ];

    const merged = mergeLocalAndCloudCircuits(local, cloud);
    expect(merged.map((m) => [m.name, m.origin, m.compressed])).toEqual([
      ['Only Cloud', 'cloud-only', 'cld_only'],
      ['RC Filter', 'synced', 'loc_rc_newer'],
      ['Only Local', 'local-only', 'loc_only'],
    ]);

    const pending = getLocalOnlyCircuitsPendingImport(local, cloud);
    expect(pending.map((p) => p.name)).toEqual(['Only Local']);

    expect(sanitizeCloudCircuitId('ckt / My Filter #1!')).toBe('ckt___My_Filter__1_');
    expect(isCloudImportDismissed('uid-1', memoryStorage)).toBe(false);
    setCloudImportDismissed('uid-1', true, memoryStorage);
    expect(isCloudImportDismissed('uid-1', memoryStorage)).toBe(true);
    expect(isCloudImportDismissed('uid-2', memoryStorage)).toBe(false);
  });

  it('enforces authentication on users/{uid}/circuits CRUD and supports batch local import', async () => {
    await expect(listUserCloudCircuits()).rejects.toThrow(/AUTH_REQUIRED/);
    await expect(
      saveUserCloudCircuit({ id: 'c1', name: 'Test', compressed: 'abc', savedAt: 1, componentCount: 1 }),
    ).rejects.toThrow(/AUTH_REQUIRED/);
    await expect(importLocalCircuitsToCloud([])).rejects.toThrow(/AUTH_REQUIRED/);
    await expect(deleteUserCloudCircuit('c1')).rejects.toThrow(/AUTH_REQUIRED/);

    mockFirebaseState.currentUser = { uid: 'uid-user-1' };
    await saveUserCloudCircuit({
      id: 'buck_1',
      name: 'Buck Converter',
      compressed: 'comp_buck',
      savedAt: 5000,
      componentCount: 8,
    });
    expect(mockFirebaseState.cloudDocs.has('users/uid-user-1/circuits/buck_1')).toBe(true);

    const imported = await importLocalCircuitsToCloud([
      { id: 'local_1', name: 'Inverting OpAmp', compressed: 'comp_opamp', savedAt: 4000, componentCount: 5 },
      { id: 'empty_1', name: 'Corrupt', compressed: '', savedAt: 1000, componentCount: 0 },
    ]);
    expect(imported.importedCount).toBe(1);

    const listed = await listUserCloudCircuits();
    expect(listed.map((c) => c.id).sort()).toEqual(['buck_1', 'local_1']);

    await deleteUserCloudCircuit('buck_1');
    expect(mockFirebaseState.cloudDocs.has('users/uid-user-1/circuits/buck_1')).toBe(false);
  });

  it('saves locally offline/signed-out, transitions Saving... -> Saved to cloud ✓, falls back cleanly on network error, and imports local circuits', async () => {
    // 1. Pre-existing localStorage circuit saved while signed out
    upsertLocalCircuitSave(
      { id: 'pre_local_1', name: 'Voltage Divider', stateJson: '{"components":[{"id":"R1"}]}', componentCount: 1, now: 1000 },
      memoryStorage,
    );
    const offlineResult = await saveCircuitDual({
      name: 'Offline Draft',
      stateJson: '{"components":[{"id":"R2"}]}',
      componentCount: 1,
      now: 1200,
    });
    expect(offlineResult.syncedToCloud).toBe(false);
    expect(offlineResult.status).toBe('offline-local');
    expect(getCloudSyncLabel(offlineResult.status)).toBe('Offline (local only)');
    expect(loadSavedCircuits(memoryStorage).length).toBe(2);

    // 2. Sign in online -> loads cloud & offers to import the 2 localStorage circuits
    mockFirebaseState.currentUser = { uid: 'uid-alice' };
    await refreshCloudCircuitsForUser('uid-alice');
    let snap = getCloudSyncSnapshot();
    expect(snap.status).toBe('saved-cloud');
    expect(getCloudSyncLabel(snap.status)).toBe('Saved to cloud ✓');
    expect(snap.pendingLocalImport.map((c) => c.name).sort()).toEqual(['Offline Draft', 'Voltage Divider']);

    // 3. Import local circuits to cloud
    const importedCount = await importPendingLocalCircuitsToCloud();
    expect(importedCount).toBe(2);
    expect(getCloudSyncSnapshot().pendingLocalImport).toHaveLength(0);
    expect(mockFirebaseState.cloudDocs.size).toBe(2);

    // 4. Observe transient "Saving..." -> "Saved to cloud ✓" transition during cloud write
    let releaseWrite!: () => void;
    let enteredWrite!: () => void;
    const enteredPromise = new Promise<void>((res) => {
      enteredWrite = res;
    });
    const gatePromise = new Promise<void>((res) => {
      releaseWrite = res;
    });
    mockFirebaseState.writeDeferred = {
      promise: gatePromise,
      onEntered: () => enteredWrite(),
    };
    const savePromise = saveCircuitDual({
      name: 'Wien Bridge',
      stateJson: '{"components":[{"id":"U1"}]}',
      componentCount: 1,
      now: 3000,
    });
    await enteredPromise;
    expect(getCloudSyncLabel(getCloudSyncSnapshot().status)).toBe('Saving...');

    releaseWrite();
    const cloudSaveRes = await savePromise;
    expect(cloudSaveRes.syncedToCloud).toBe(true);
    expect(getCloudSyncLabel(getCloudSyncSnapshot().status)).toBe('Saved to cloud ✓');

    // 5. Simulated cloud failure still saves to localStorage as fallback
    mockFirebaseState.failNextWrite = true;
    const fallbackRes = await saveCircuitDual({
      name: 'Fallback Circuit',
      stateJson: '{"components":[{"id":"C1"}]}',
      componentCount: 1,
      now: 4000,
    });
    expect(fallbackRes.syncedToCloud).toBe(false);
    expect(fallbackRes.status).toBe('offline-local');
    expect(loadSavedCircuits(memoryStorage).some((c) => c.name === 'Fallback Circuit')).toBe(true);
    expect(getCloudSyncSnapshot().lastError).toMatch(/offline network drop/i);

    // 6. Dual delete removes from both localStorage and cloud
    await deleteSavedCircuitDual({ id: cloudSaveRes.saved.id, name: 'Wien Bridge' });
    expect(mockFirebaseState.cloudDocs.has(`users/uid-alice/circuits/${cloudSaveRes.saved.id}`)).toBe(false);
    expect(loadSavedCircuits(memoryStorage).some((c) => c.name === 'Wien Bridge')).toBe(false);

    // 7. Browser goes offline -> offline fallback
    vi.stubGlobal('navigator', { onLine: false });
    const offlineSignedInRes = await saveCircuitDual({
      name: 'Airplane Mode Edit',
      stateJson: '{"components":[{"id":"L1"}]}',
      componentCount: 1,
      now: 5000,
    });
    expect(offlineSignedInRes.syncedToCloud).toBe(false);
    expect(getCloudSyncLabel(offlineSignedInRes.status)).toBe('Offline (local only)');

    // 8. Dismissal stops import banner from reappearing
    upsertLocalCircuitSave({ id: 'extra_loc', name: 'Extra', stateJson: '{"components":[]}', componentCount: 0 }, memoryStorage);
    dismissCloudImportPrompt();
    snap = getCloudSyncSnapshot();
    expect(snap.pendingLocalImport).toHaveLength(0);
    expect(snap.importPromptDismissed).toBe(true);
  });

  it('secures users/{userId}/circuits/{circuitId} in firestore.rules and wires StatusBar, SavedCircuitsModal, and Simulator', () => {
    const rules = readFileSync(resolve(FRONTEND_ROOT, 'firestore.rules'), 'utf8');
    expect(rules).toContain('match /circuits/{circuitId}');
    expect(rules).toContain('request.auth.uid == userId');
    expect(rules).toContain('request.resource.data.id == circuitId');
    expect(rules).toContain('request.resource.data.compressed.size() <= 160000');

    const statusBarSrc = readFileSync(resolve(SRC_ROOT, 'components/StatusBar.tsx'), 'utf8');
    const savedModalSrc = readFileSync(resolve(SRC_ROOT, 'components/SavedCircuitsModal.tsx'), 'utf8');
    const simSrc = readFileSync(resolve(SRC_ROOT, 'pages/Simulator.tsx'), 'utf8');
    const cloudSyncSrc = readFileSync(resolve(SRC_ROOT, 'utils/cloudSync.ts'), 'utf8');

    expect(cloudSyncSrc).toContain('Saved to cloud ✓');
    expect(cloudSyncSrc).toContain('Saving...');
    expect(cloudSyncSrc).toContain('Offline (local only)');
    expect(statusBarSrc).toContain('useCloudSync');
    expect(statusBarSrc).toContain('getCloudSyncLabel');
    expect(savedModalSrc).toContain('saveCircuitDual');
    expect(savedModalSrc).toContain('importPendingLocalCircuitsToCloud');
    expect(simSrc).toContain('saveCircuitDual');
    expect(simSrc).toContain('importPendingLocalCircuitsToCloud');
  });
});
