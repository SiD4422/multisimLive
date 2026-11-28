import type { FirebaseApp } from 'firebase/app';
import type { Auth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { sanitizeForkAttribution, type ForkAttribution } from '../utils/forkAttribution';

const firebaseConfig = {
  apiKey: 'AIzaSyAQLl2CA3vcuKmFgxl7NMBN8krFWIoQUck',
  authDomain: 'nodesim-2c84b.firebaseapp.com',
  projectId: 'nodesim-2c84b',
  storageBucket: 'nodesim-2c84b.firebasestorage.app',
  messagingSenderId: '546330139401',
  appId: '1:546330139401:web:fd7368aeaf4ffdefbbd1d8',
};

let appPromise: Promise<FirebaseApp> | null = null;
let dbPromise: Promise<Firestore> | null = null;
let authPromise: Promise<{
  auth: Auth;
  googleProvider: GoogleAuthProvider;
  githubProvider: GithubAuthProvider;
}> | null = null;

/** Lazily initializes and caches the singleton FirebaseApp instance. */
export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig),
    );
  }
  return appPromise;
}

/** Lazily loads Firestore (~300 KB+) only when community/usage operations execute. */
export async function getFirebaseDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = getFirebaseApp().then(async (app) => {
      const { getFirestore } = await import('firebase/firestore');
      return getFirestore(app);
    });
  }
  return dbPromise;
}

async function resolveFirestore() {
  const db = await getFirebaseDb();
  const fs = await import('firebase/firestore');
  return { db, fs };
}

/** Lazily loads Firebase Auth with Google & GitHub OAuth providers only when auth is needed. */
export async function getFirebaseAuth(): Promise<{
  auth: Auth;
  googleProvider: GoogleAuthProvider;
  githubProvider: GithubAuthProvider;
}> {
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), import('firebase/auth')]).then(
      ([app, { getAuth, GithubAuthProvider, GoogleAuthProvider }]) => {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const githubProvider = new GithubAuthProvider();
        return {
          auth: getAuth(app),
          googleProvider,
          githubProvider,
        };
      },
    );
  }
  return authPromise;
}

export interface CommunityCircuit {
  id: string;
  name: string;
  description: string;
  category: string;
  authorName: string;
  authorUid: string;
  componentCount: number;
  circuitData: string;
  createdAt: Date;
  updatedAt?: Date;
  views: number;
  forkedFrom?: ForkAttribution;
}

export type PublishCircuitInput = Omit<
  CommunityCircuit,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt' | 'views'
>;

export type UpdateCommunityCircuitInput = Partial<
  Pick<CommunityCircuit, 'name' | 'description' | 'category' | 'authorName' | 'componentCount' | 'circuitData'>
>;

export function buildNewCircuitDocument(
  data: PublishCircuitInput,
  authorUid: string,
): Omit<CommunityCircuit, 'id' | 'createdAt' | 'updatedAt'> & { authorUid: string } {
  const uid = authorUid.trim();
  if (!uid) {
    throw new Error('AUTH_REQUIRED: Please sign in before publishing a circuit.');
  }
  const forkedFrom = sanitizeForkAttribution(data.forkedFrom);
  return {
    name: data.name.trim().slice(0, 100),
    description: data.description.trim().slice(0, 500),
    category: data.category.trim().slice(0, 30) || 'other',
    authorName: data.authorName.trim().slice(0, 50) || 'Anonymous',
    authorUid: uid,
    componentCount: data.componentCount,
    circuitData: data.circuitData,
    views: 0,
    ...(forkedFrom ? { forkedFrom } : {}),
  };
}

export async function publishCircuit(data: PublishCircuitInput): Promise<string> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('AUTH_REQUIRED: Please sign in before publishing a circuit.');
  }
  const payload = buildNewCircuitDocument(data, currentUser.uid);
  const docRef = await fs.addDoc(fs.collection(db, 'circuits'), {
    ...payload,
    createdAt: fs.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCommunityCircuit(
  circuitId: string,
  updates: UpdateCommunityCircuitInput,
): Promise<void> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  if (!auth.currentUser) {
    throw new Error('AUTH_REQUIRED: Please sign in to edit your circuit.');
  }
  const sanitized: Record<string, unknown> = { updatedAt: fs.serverTimestamp() };
  if (typeof updates.name === 'string') sanitized.name = updates.name.trim().slice(0, 100);
  if (typeof updates.description === 'string') sanitized.description = updates.description.trim().slice(0, 500);
  if (typeof updates.category === 'string') sanitized.category = updates.category.trim().slice(0, 30);
  if (typeof updates.authorName === 'string') sanitized.authorName = updates.authorName.trim().slice(0, 50);
  if (typeof updates.componentCount === 'number') sanitized.componentCount = updates.componentCount;
  if (typeof updates.circuitData === 'string') sanitized.circuitData = updates.circuitData;

  await fs.updateDoc(fs.doc(db, 'circuits', circuitId), sanitized);
}

export async function deleteCommunityCircuit(circuitId: string): Promise<void> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  if (!auth.currentUser) {
    throw new Error('AUTH_REQUIRED: Please sign in to delete your circuit.');
  }
  // Best-effort cleanup of view counter subcollection doc before removing parent circuit
  await fs.deleteDoc(fs.doc(db, 'circuits', circuitId, 'meta', 'views')).catch(() => {});
  await fs.deleteDoc(fs.doc(db, 'circuits', circuitId));
}

export async function getCommunityCircuits(limitCount = 50): Promise<CommunityCircuit[]> {
  const { db, fs } = await resolveFirestore();
  const q = fs.query(
    fs.collection(db, 'circuits'),
    fs.orderBy('createdAt', 'desc'),
    fs.limit(limitCount),
  );
  const snapshot = await fs.getDocs(q);
  return snapshot.docs.map((d) => {
    const raw = d.data();
    const forkedFrom = sanitizeForkAttribution(raw.forkedFrom);
    return {
      id: d.id,
      name: typeof raw.name === 'string' ? raw.name : 'Untitled Circuit',
      description: typeof raw.description === 'string' ? raw.description : '',
      category: typeof raw.category === 'string' ? raw.category : 'other',
      authorName: typeof raw.authorName === 'string' ? raw.authorName : 'Anonymous',
      authorUid: typeof raw.authorUid === 'string' ? raw.authorUid : '',
      componentCount: typeof raw.componentCount === 'number' ? raw.componentCount : 0,
      circuitData: typeof raw.circuitData === 'string' ? raw.circuitData : '',
      views: typeof raw.views === 'number' ? raw.views : 0,
      createdAt: raw.createdAt?.toDate?.() || new Date(),
      updatedAt: raw.updatedAt?.toDate?.(),
      ...(forkedFrom ? { forkedFrom } : {}),
    } as CommunityCircuit;
  });
}

export interface CloudSavedCircuit {
  id: string;
  name: string;
  compressed: string;
  savedAt: number;
  componentCount: number;
  forkedFrom?: ForkAttribution;
}

function sanitizePrivateCircuitId(rawId: string, fallbackName: string): string {
  const cleaned = rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  if (cleaned.length > 0) return cleaned;
  const fromName = fallbackName.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 48);
  return fromName ? `${fromName}_${Date.now()}` : `ckt_${Date.now()}`;
}

export function buildUserCloudCircuitDocument(circuit: CloudSavedCircuit): CloudSavedCircuit {
  const name = circuit.name.trim().slice(0, 100) || 'Untitled Circuit';
  const id = sanitizePrivateCircuitId(circuit.id, name);
  const compressed = circuit.compressed.slice(0, 160000);
  if (!compressed) {
    throw new Error('Cannot save an empty circuit payload to cloud.');
  }
  const forkedFrom = sanitizeForkAttribution(circuit.forkedFrom);
  return {
    id,
    name,
    compressed,
    savedAt: Number.isFinite(circuit.savedAt) ? Math.max(0, Math.floor(circuit.savedAt)) : Date.now(),
    componentCount: Math.max(0, Math.min(2000, Math.floor(circuit.componentCount || 0))),
    ...(forkedFrom ? { forkedFrom } : {}),
  };
}

export async function listUserCloudCircuits(limitCount = 100): Promise<CloudSavedCircuit[]> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('AUTH_REQUIRED: Please sign in to load cloud circuits.');
  }
  const q = fs.query(
    fs.collection(db, 'users', uid, 'circuits'),
    fs.orderBy('savedAt', 'desc'),
    fs.limit(limitCount),
  );
  const snapshot = await fs.getDocs(q);
  return snapshot.docs.map((d) => {
    const raw = d.data();
    const forkedFrom = sanitizeForkAttribution(raw.forkedFrom);
    return {
      id: d.id,
      name: typeof raw.name === 'string' ? raw.name : 'Untitled Circuit',
      compressed: typeof raw.compressed === 'string' ? raw.compressed : '',
      savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : Date.now(),
      componentCount: typeof raw.componentCount === 'number' ? raw.componentCount : 0,
      ...(forkedFrom ? { forkedFrom } : {}),
    };
  });
}

export async function saveUserCloudCircuit(circuit: CloudSavedCircuit): Promise<CloudSavedCircuit> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('AUTH_REQUIRED: Please sign in to save circuits to the cloud.');
  }
  const payload = buildUserCloudCircuitDocument(circuit);
  await fs.setDoc(fs.doc(db, 'users', uid, 'circuits', payload.id), {
    ...payload,
    updatedAt: fs.serverTimestamp(),
  });
  return payload;
}

export async function importLocalCircuitsToCloud(
  localCircuits: CloudSavedCircuit[],
): Promise<{ importedCount: number; circuits: CloudSavedCircuit[] }> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('AUTH_REQUIRED: Please sign in to import local circuits to cloud.');
  }
  const valid = localCircuits.filter((c) => Boolean(c.compressed && c.compressed.trim()));
  const imported: CloudSavedCircuit[] = [];
  for (const item of valid) {
    const payload = buildUserCloudCircuitDocument(item);
    await fs.setDoc(fs.doc(db, 'users', uid, 'circuits', payload.id), {
      ...payload,
      updatedAt: fs.serverTimestamp(),
    });
    imported.push(payload);
  }
  return { importedCount: imported.length, circuits: imported };
}

export async function deleteUserCloudCircuit(circuitId: string): Promise<void> {
  const [{ auth }, { db, fs }] = await Promise.all([
    getFirebaseAuth(),
    resolveFirestore(),
  ]);
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('AUTH_REQUIRED: Please sign in to delete a cloud circuit.');
  }
  await fs.deleteDoc(fs.doc(db, 'users', uid, 'circuits', circuitId));
}

export interface SharedCircuitRecord {
  id: string;
  name: string;
  componentCount: number;
  componentSummary: string;
  circuitData: string;
  authorUid: string | null;
  createdAt: Date;
}

export interface CreateShortShareInput {
  name: string;
  componentCount: number;
  componentSummary: string;
  circuitData: string;
  authorUid?: string | null;
}

export async function createShortShareLink(
  input: CreateShortShareInput,
): Promise<{ shortId: string; shortPath: string }> {
  const db = await getFirebaseDb();
  const [{ generateShortShareId }, { doc, serverTimestamp, setDoc }] = await Promise.all([
    import('../utils/shortShareId'),
    import('firebase/firestore'),
  ]);

  const payloadBase = {
    name: input.name.trim().slice(0, 100) || 'Untitled Circuit',
    componentCount: Math.max(1, Math.min(2000, Math.floor(input.componentCount))),
    componentSummary: input.componentSummary.trim().slice(0, 180),
    circuitData: input.circuitData.slice(0, 160000),
    authorUid: input.authorUid ?? null,
    createdAt: serverTimestamp(),
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const shortId = generateShortShareId();
    try {
      await setDoc(doc(db, 'sharedCircuits', shortId), {
        id: shortId,
        ...payloadBase,
      });
      return { shortId, shortPath: `/c/${shortId}` };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Failed to create short share link.');
}

export async function getSharedCircuitById(shortId: string): Promise<SharedCircuitRecord | null> {
  const { isValidShortShareId } = await import('../utils/shortShareId');
  if (!isValidShortShareId(shortId)) return null;

  const db = await getFirebaseDb();
  const { doc, getDoc } = await import('firebase/firestore');

  const snap = await getDoc(doc(db, 'sharedCircuits', shortId));
  if (!snap.exists()) return null;
  const raw = snap.data();
  return {
    id: snap.id,
    name: typeof raw.name === 'string' ? raw.name : 'Shared Circuit',
    componentCount: typeof raw.componentCount === 'number' ? raw.componentCount : 0,
    componentSummary: typeof raw.componentSummary === 'string' ? raw.componentSummary : '',
    circuitData: typeof raw.circuitData === 'string' ? raw.circuitData : '',
    authorUid: typeof raw.authorUid === 'string' ? raw.authorUid : null,
    createdAt: raw.createdAt?.toDate?.() || new Date(),
  };
}

export async function incrementViews(circuitId: string): Promise<void> {
  try {
    const { db, fs } = await resolveFirestore();
    await fs.setDoc(
      fs.doc(db, 'circuits', circuitId, 'meta', 'views'),
      { count: fs.increment(1) },
      { merge: true },
    );
  } catch (err) {
    console.warn('Failed to increment circuit view count:', err);
  }
}
