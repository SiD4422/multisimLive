import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import {
  getLocalOnlyCircuitsPendingImport,
  isCloudImportDismissed,
  loadSavedCircuits,
  mergeLocalAndCloudCircuits,
  removeLocalCircuitSave,
  sanitizeCloudCircuitId,
  setCloudImportDismissed,
  upsertLocalCircuitSave,
  type MergedSavedCircuit,
  type SavedCircuit,
} from './circuitSavesStorage';
import {
  buildForkedCircuitName,
  sanitizeForkAttribution,
  type ForkAttribution,
} from './forkAttribution';
import { useAuth } from '../hooks/useAuth';

export type CloudSyncStatus = 'offline-local' | 'saving' | 'saved-cloud';

export interface CloudSyncSnapshot {
  status: CloudSyncStatus;
  uid: string | null;
  isOnline: boolean;
  cloudSaves: SavedCircuit[];
  localSaves: SavedCircuit[];
  mergedSaves: MergedSavedCircuit[];
  pendingLocalImport: SavedCircuit[];
  importPromptDismissed: boolean;
  isImporting: boolean;
  lastError: string | null;
}

export function getCloudSyncLabel(status: CloudSyncStatus): string {
  switch (status) {
    case 'saving':
      return 'Saving...';
    case 'saved-cloud':
      return 'Saved to cloud ✓';
    case 'offline-local':
    default:
      return 'Offline (local only)';
  }
}

function getBrowserOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

const syncState: {
  status: CloudSyncStatus;
  uid: string | null;
  isOnline: boolean;
  cloudSaves: SavedCircuit[];
  localSaves: SavedCircuit[];
  importPromptDismissed: boolean;
  isImporting: boolean;
  lastError: string | null;
} = {
  status: 'offline-local',
  uid: null,
  isOnline: getBrowserOnline(),
  cloudSaves: [],
  localSaves: [],
  importPromptDismissed: false,
  isImporting: false,
  lastError: null,
};

let onlineListenersBound = false;
let loadedUid: string | null = null;
const subscribers = new Set<() => void>();

function notify() {
  for (const cb of subscribers) {
    cb();
  }
}

function recomputeLocalAndStatus() {
  syncState.localSaves = loadSavedCircuits();
  if (!syncState.uid || !syncState.isOnline) {
    syncState.status = 'offline-local';
  }
}

function ensureOnlineListeners() {
  if (onlineListenersBound || typeof window === 'undefined') return;
  onlineListenersBound = true;
  window.addEventListener('online', () => {
    syncState.isOnline = true;
    if (syncState.uid) {
      void refreshCloudCircuitsForUser(syncState.uid);
    } else {
      notify();
    }
  });
  window.addEventListener('offline', () => {
    syncState.isOnline = false;
    syncState.status = 'offline-local';
    notify();
  });
}

export async function refreshCloudCircuitsForUser(uid: string): Promise<void> {
  syncState.uid = uid;
  syncState.localSaves = loadSavedCircuits();
  syncState.importPromptDismissed = isCloudImportDismissed(uid);
  if (!getBrowserOnline()) {
    syncState.isOnline = false;
    syncState.status = 'offline-local';
    notify();
    return;
  }

  try {
    const { listUserCloudCircuits } = await import('../lib/firebase');
    const items = await listUserCloudCircuits(100);
    if (syncState.uid !== uid) return;
    syncState.cloudSaves = items;
    syncState.status = 'saved-cloud';
    syncState.lastError = null;
    notify();
  } catch (err) {
    syncState.status = 'offline-local';
    syncState.lastError = err instanceof Error ? err.message : 'Unable to reach cloud storage';
    notify();
  }
}

export interface SaveCircuitDualParams {
  id?: string;
  name: string;
  stateJson: string;
  componentCount: number;
  now?: number;
  forkedFrom?: ForkAttribution;
}

export interface SaveCircuitDualResult {
  saved: SavedCircuit;
  syncedToCloud: boolean;
  status: CloudSyncStatus;
}

/**
 * Always persists to localStorage first (offline fallback), then syncs to Firestore
 * `users/{uid}/circuits/{circuitId}` when signed in and online.
 */
export async function saveCircuitDual(params: SaveCircuitDualParams): Promise<SaveCircuitDualResult> {
  syncState.isOnline = getBrowserOnline();
  const normalizedName = params.name.trim() || 'Untitled Circuit';
  const matchedCloud =
    (params.id ? syncState.cloudSaves.find((c) => c.id === params.id) : undefined) ||
    syncState.cloudSaves.find((c) => c.name.trim().toLowerCase() === normalizedName.toLowerCase());

  const { saved, saves } = upsertLocalCircuitSave({
    ...params,
    id: params.id || matchedCloud?.id,
  });
  syncState.localSaves = saves;

  if (!syncState.uid || !syncState.isOnline) {
    syncState.status = 'offline-local';
    notify();
    return { saved, syncedToCloud: false, status: 'offline-local' };
  }

  const targetId = matchedCloud?.id || sanitizeCloudCircuitId(saved.id, saved.name);
  syncState.status = 'saving';
  syncState.lastError = null;
  notify();

  try {
    const { saveUserCloudCircuit } = await import('../lib/firebase');
    const cloudDoc = await saveUserCloudCircuit({
      ...saved,
      id: targetId,
    });
    const withoutPrev = syncState.cloudSaves.filter((c) => c.id !== cloudDoc.id);
    syncState.cloudSaves = [cloudDoc, ...withoutPrev];
    syncState.status = 'saved-cloud';
    syncState.lastError = null;
    notify();
    return { saved: cloudDoc, syncedToCloud: true, status: 'saved-cloud' };
  } catch (err) {
    syncState.status = 'offline-local';
    syncState.lastError = err instanceof Error ? err.message : 'Cloud save failed; saved locally.';
    notify();
    return { saved, syncedToCloud: false, status: 'offline-local' };
  }
}

export async function syncLocalCircuitToCloud(circuit: SavedCircuit): Promise<boolean> {
  if (!syncState.uid || !getBrowserOnline()) {
    syncState.status = 'offline-local';
    notify();
    return false;
  }
  syncState.status = 'saving';
  notify();
  try {
    const { saveUserCloudCircuit } = await import('../lib/firebase');
    const saved = await saveUserCloudCircuit({
      ...circuit,
      id: sanitizeCloudCircuitId(circuit.id, circuit.name),
    });
    const withoutPrev = syncState.cloudSaves.filter((c) => c.id !== saved.id);
    syncState.cloudSaves = [saved, ...withoutPrev];
    syncState.status = 'saved-cloud';
    syncState.lastError = null;
    notify();
    return true;
  } catch (err) {
    syncState.status = 'offline-local';
    syncState.lastError = err instanceof Error ? err.message : 'Cloud upload failed';
    notify();
    return false;
  }
}

export async function importPendingLocalCircuitsToCloud(): Promise<number> {
  const uid = syncState.uid;
  if (!uid || !getBrowserOnline()) return 0;

  syncState.localSaves = loadSavedCircuits();
  const pending = getLocalOnlyCircuitsPendingImport(syncState.localSaves, syncState.cloudSaves);
  if (pending.length === 0) return 0;

  syncState.isImporting = true;
  syncState.status = 'saving';
  syncState.lastError = null;
  notify();

  try {
    const { importLocalCircuitsToCloud } = await import('../lib/firebase');
    const { importedCount, circuits } = await importLocalCircuitsToCloud(
      pending.map((item) => ({
        ...item,
        id: sanitizeCloudCircuitId(item.id, item.name),
      })),
    );
    const importedIds = new Set(circuits.map((c) => c.id));
    syncState.cloudSaves = [
      ...circuits,
      ...syncState.cloudSaves.filter((c) => !importedIds.has(c.id)),
    ];
    syncState.status = 'saved-cloud';
    syncState.isImporting = false;
    notify();
    return importedCount;
  } catch (err) {
    syncState.status = 'offline-local';
    syncState.isImporting = false;
    syncState.lastError = err instanceof Error ? err.message : 'Failed to import local circuits';
    notify();
    return 0;
  }
}

export function dismissCloudImportPrompt(): void {
  if (syncState.uid) {
    setCloudImportDismissed(syncState.uid, true);
  }
  syncState.importPromptDismissed = true;
  notify();
}

export async function deleteSavedCircuitDual(circuit: Pick<SavedCircuit, 'id' | 'name'>): Promise<void> {
  // Remove any matching local save first
  const localMatch = loadSavedCircuits().find(
    (l) => l.id === circuit.id || sanitizeCloudCircuitId(l.id, l.name) === circuit.id,
  );
  if (localMatch) {
    syncState.localSaves = removeLocalCircuitSave(localMatch.id);
  }

  if (syncState.uid && getBrowserOnline()) {
    syncState.status = 'saving';
    notify();
    try {
      const { deleteUserCloudCircuit } = await import('../lib/firebase');
      await deleteUserCloudCircuit(circuit.id);
      syncState.cloudSaves = syncState.cloudSaves.filter((c) => c.id !== circuit.id);
      syncState.status = 'saved-cloud';
      syncState.lastError = null;
    } catch (err) {
      syncState.status = 'offline-local';
      syncState.lastError = err instanceof Error ? err.message : 'Cloud delete failed';
    }
  }
  notify();
}

export function getCloudSyncSnapshot(): CloudSyncSnapshot {
  const localSaves = syncState.localSaves.length > 0 ? syncState.localSaves : loadSavedCircuits();
  const pendingLocalImport =
    syncState.uid && !syncState.importPromptDismissed
      ? getLocalOnlyCircuitsPendingImport(localSaves, syncState.cloudSaves)
      : [];
  const mergedSaves = syncState.uid
    ? mergeLocalAndCloudCircuits(localSaves, syncState.cloudSaves)
    : localSaves.map((s) => ({ ...s, origin: 'local-only' as const }));

  return {
    status: syncState.status,
    uid: syncState.uid,
    isOnline: syncState.isOnline,
    cloudSaves: syncState.cloudSaves,
    localSaves,
    mergedSaves,
    pendingLocalImport,
    importPromptDismissed: syncState.importPromptDismissed,
    isImporting: syncState.isImporting,
    lastError: syncState.lastError,
  };
}

export function resetCloudSyncForTest(): void {
  syncState.status = 'offline-local';
  syncState.uid = null;
  syncState.isOnline = getBrowserOnline();
  syncState.cloudSaves = [];
  syncState.localSaves = [];
  syncState.importPromptDismissed = false;
  syncState.isImporting = false;
  syncState.lastError = null;
  loadedUid = null;
}

/** Reactive React hook binding Firebase auth state & online status to cloud circuit sync. */
export function useCloudSync(): CloudSyncSnapshot {
  const { user } = useAuth();
  const nextUid = user?.uid ?? null;
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    subscribers.add(listener);
    ensureOnlineListeners();
    recomputeLocalAndStatus();
    return () => {
      subscribers.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (nextUid === loadedUid) return;
    loadedUid = nextUid;
    syncState.uid = nextUid;

    if (!nextUid) {
      syncState.cloudSaves = [];
      syncState.status = 'offline-local';
      syncState.importPromptDismissed = false;
      syncState.lastError = null;
      notify();
      return;
    }

    void refreshCloudCircuitsForUser(nextUid);
  }, [nextUid]);

  return getCloudSyncSnapshot();
}

export interface ForkToAccountParams {
  sourceCircuitId: string;
  sourceName: string;
  sourceAuthor: string;
  sourceType?: 'community' | 'template';
  circuitData?: string;
  rawJson?: string;
  now?: number;
}

export interface ForkToAccountResult {
  saved: SavedCircuit;
  syncedToCloud: boolean;
  stateJson: string;
  forkedFrom: ForkAttribution;
}

/**
 * Creates a forked copy under the signed-in user's account (`users/{uid}/circuits/...` + localStorage fallback)
 * while attaching clean `forkedFrom` creator attribution.
 */
export async function forkCircuitToAccount(
  params: ForkToAccountParams,
): Promise<ForkToAccountResult> {
  if (!syncState.uid) {
    const { getFirebaseAuth } = await import('../lib/firebase');
    const { auth } = await getFirebaseAuth();
    const uid = auth.currentUser?.uid ?? null;
    if (!uid) {
      throw new Error('AUTH_REQUIRED: Please sign in to fork this circuit into your account.');
    }
    syncState.uid = uid;
    loadedUid = uid;
  }

  let decodedJson = params.rawJson || '';
  if (!decodedJson && params.circuitData) {
    decodedJson = LZString.decompressFromEncodedURIComponent(params.circuitData) || '';
  }
  if (!decodedJson) {
    throw new Error('Could not decode source circuit payload for forking.');
  }

  const parsed = JSON.parse(decodedJson) as Record<string, unknown>;
  const components = Array.isArray(parsed.components) ? parsed.components : [];
  const forkedFrom = sanitizeForkAttribution({
    sourceCircuitId: params.sourceCircuitId,
    sourceName: params.sourceName,
    sourceAuthor: params.sourceAuthor || 'Anonymous',
    sourceType: params.sourceType || 'community',
  });
  if (!forkedFrom) {
    throw new Error('Missing source metadata required for fork attribution.');
  }

  const forkedName = buildForkedCircuitName(params.sourceName);
  const now = params.now ?? Date.now();
  const forkId = sanitizeCloudCircuitId(`fork_${params.sourceCircuitId}_${now}`, forkedName);
  const enrichedStateJson = JSON.stringify({
    ...parsed,
    name: forkedName,
    forkedFrom,
  });

  const { saved, syncedToCloud } = await saveCircuitDual({
    id: forkId,
    name: forkedName,
    stateJson: enrichedStateJson,
    componentCount: components.length,
    now,
    forkedFrom,
  });

  return {
    saved,
    syncedToCloud,
    stateJson: enrichedStateJson,
    forkedFrom,
  };
}
