import LZString from 'lz-string';

export const CIRCUIT_SAVES_STORAGE_KEY = 'nodesim-saved-circuits-v1';

export interface SavedCircuit {
  id: string;
  name: string;
  compressed: string;
  savedAt: number;
  componentCount: number;
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
  const existing = current.find(s => s.name === normalizedName);

  let saved: SavedCircuit;
  let next: SavedCircuit[];
  let updatedExisting = false;

  if (existing) {
    updatedExisting = true;
    saved = {
      ...existing,
      compressed,
      savedAt: now,
      componentCount: params.componentCount,
    };
    next = current.map(s => (s.name === normalizedName ? saved : s));
  } else {
    saved = {
      id: `${now}`,
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
