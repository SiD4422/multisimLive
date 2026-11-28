import LZString from 'lz-string';

export const CIRCUIT_SAVES_STORAGE_KEY = 'nodesim-saved-circuits-v1';
export const CLOUD_IMPORT_DISMISSED_PREFIX = 'nodesim-cloud-import-dismissed-v1:';

export interface SavedCircuit {
  id: string;
  name: string;
  compressed: string;
  savedAt: number;
  componentCount: number;
}

export type MergedCircuitOrigin = 'synced' | 'cloud-only' | 'local-only';

export interface MergedSavedCircuit extends SavedCircuit {
  origin: MergedCircuitOrigin;
}

export type SaveStorageReader = Pick<Storage, 'getItem'>;
export type SaveStorageWriter = Pick<Storage, 'setItem'>;
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;

function getDefaultStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function sanitizeCloudCircuitId(rawId: string, fallbackName = 'circuit'): string {
  const cleaned = rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  if (cleaned.length > 0) return cleaned;
  const fromName = fallbackName.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 48);
  return fromName ? `${fromName}_${Date.now()}` : `ckt_${Date.now()}`;
}

export function loadSavedCircuits(storage: SaveStorageReader | null = getDefaultStorage()): SavedCircuit[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(CIRCUIT_SAVES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedCircuit[]) : [];
  } catch {
    return [];
  }
}

export function writeSavedCircuits(
  saves: SavedCircuit[],
  storage: SaveStorageWriter | null = getDefaultStorage(),
): void {
  if (!storage) return;
  storage.setItem(CIRCUIT_SAVES_STORAGE_KEY, JSON.stringify(saves));
}

export interface UpsertLocalCircuitSaveParams {
  id?: string;
  name: string;
  stateJson: string;
  componentCount: number;
  now?: number;
}

export interface UpsertLocalCircuitSaveResult {
  saved: SavedCircuit;
  saves: SavedCircuit[];
  updatedExisting: boolean;
}

export function upsertLocalCircuitSave(
  params: UpsertLocalCircuitSaveParams,
  storage: SaveStorage | null = getDefaultStorage(),
): UpsertLocalCircuitSaveResult {
  const normalizedName = params.name.trim() || 'Untitled Circuit';
  const now = params.now ?? Date.now();
  const compressed = LZString.compress(params.stateJson);
  const current = loadSavedCircuits(storage);
  const existing = params.id
    ? current.find((s) => s.id === params.id) || current.find((s) => s.name === normalizedName)
    : current.find((s) => s.name === normalizedName);

  let saved: SavedCircuit;
  let next: SavedCircuit[];
  let updatedExisting = false;

  if (existing) {
    updatedExisting = true;
    saved = {
      ...existing,
      name: normalizedName,
      compressed,
      savedAt: now,
      componentCount: params.componentCount,
    };
    next = current.map((s) => (s.id === existing.id ? saved : s));
  } else {
    saved = {
      id: params.id ? sanitizeCloudCircuitId(params.id, normalizedName) : `${now}`,
      name: normalizedName,
      compressed,
      savedAt: now,
      componentCount: params.componentCount,
    };
    next = [saved, ...current];
  }

  writeSavedCircuits(next, storage);
  return { saved, saves: next, updatedExisting };
}

export function removeLocalCircuitSave(
  id: string,
  storage: SaveStorage | null = getDefaultStorage(),
): SavedCircuit[] {
  const next = loadSavedCircuits(storage).filter((s) => s.id !== id);
  writeSavedCircuits(next, storage);
  return next;
}

/**
 * Merges browser localStorage circuits and Firestore user cloud circuits by ID/name,
 * keeping the newest revision and annotating sync origin.
 */
export function mergeLocalAndCloudCircuits(
  localSaves: SavedCircuit[],
  cloudSaves: SavedCircuit[],
): MergedSavedCircuit[] {
  const byKey = new Map<string, { item: SavedCircuit; inLocal: boolean; inCloud: boolean }>();

  const findMatchKey = (candidate: SavedCircuit): string | null => {
    const idKey = sanitizeCloudCircuitId(candidate.id, candidate.name);
    if (byKey.has(idKey)) return idKey;
    const normName = candidate.name.trim().toLowerCase();
    for (const [k, entry] of byKey.entries()) {
      if (entry.item.name.trim().toLowerCase() === normName) {
        return k;
      }
    }
    return null;
  };

  for (const c of cloudSaves) {
    const key = sanitizeCloudCircuitId(c.id, c.name);
    byKey.set(key, { item: { ...c, id: key }, inLocal: false, inCloud: true });
  }

  for (const l of localSaves) {
    const matchKey = findMatchKey(l);
    if (matchKey) {
      const existing = byKey.get(matchKey)!;
      const useLocal = l.savedAt > existing.item.savedAt;
      byKey.set(matchKey, {
        item: useLocal ? { ...l, id: existing.item.id } : existing.item,
        inLocal: true,
        inCloud: existing.inCloud,
      });
    } else {
      const key = sanitizeCloudCircuitId(l.id, l.name);
      byKey.set(key, { item: l, inLocal: true, inCloud: false });
    }
  }

  return Array.from(byKey.values())
    .map(({ item, inLocal, inCloud }) => ({
      ...item,
      origin: (inLocal && inCloud ? 'synced' : inCloud ? 'cloud-only' : 'local-only') as MergedCircuitOrigin,
    }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Returns localStorage circuits not yet present in the signed-in user's cloud collection.
 */
export function getLocalOnlyCircuitsPendingImport(
  localSaves: SavedCircuit[],
  cloudSaves: SavedCircuit[],
): SavedCircuit[] {
  if (localSaves.length === 0) return [];
  const cloudIds = new Set(cloudSaves.map((c) => sanitizeCloudCircuitId(c.id, c.name)));
  const cloudFingerprints = new Set(
    cloudSaves.map((c) => `${c.name.trim().toLowerCase()}::${c.compressed}`),
  );
  return localSaves.filter((l) => {
    if (!l.compressed || !l.compressed.trim()) return false;
    const safeId = sanitizeCloudCircuitId(l.id, l.name);
    const fingerprint = `${l.name.trim().toLowerCase()}::${l.compressed}`;
    return !cloudIds.has(safeId) && !cloudFingerprints.has(fingerprint);
  });
}

export function isCloudImportDismissed(
  uid: string,
  storage: SaveStorageReader | null = getDefaultStorage(),
): boolean {
  if (!storage || !uid) return false;
  try {
    return storage.getItem(`${CLOUD_IMPORT_DISMISSED_PREFIX}${uid}`) === '1';
  } catch {
    return false;
  }
}

export function setCloudImportDismissed(
  uid: string,
  dismissed: boolean,
  storage: SaveStorageWriter | null = getDefaultStorage(),
): void {
  if (!storage || !uid) return;
  try {
    storage.setItem(`${CLOUD_IMPORT_DISMISSED_PREFIX}${uid}`, dismissed ? '1' : '0');
  } catch {
    // ignore storage quota errors
  }
}
