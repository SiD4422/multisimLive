import type { FirebaseApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

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
let authPromise: Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> | null = null;

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
    dbPromise = Promise.all([getFirebaseApp(), import('firebase/firestore')]).then(
      ([app, { getFirestore }]) => getFirestore(app),
    );
  }
  return dbPromise;
}

/** Lazily loads Firebase Auth only when authentication state or login is needed. */
export async function getFirebaseAuth(): Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> {
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), import('firebase/auth')]).then(
      ([app, { getAuth, GoogleAuthProvider }]) => ({
        auth: getAuth(app),
        googleProvider: new GoogleAuthProvider(),
      }),
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
  componentCount: number;
  circuitData: string;
  createdAt: Date;
  views: number;
}

export async function publishCircuit(data: Omit<CommunityCircuit, 'id' | 'createdAt' | 'views'>): Promise<string> {
  const [db, { collection, addDoc, serverTimestamp }] = await Promise.all([
    getFirebaseDb(),
    import('firebase/firestore'),
  ]);
  const docRef = await addDoc(collection(db, 'circuits'), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCommunityCircuits(limitCount = 50): Promise<CommunityCircuit[]> {
  const [db, { collection, getDocs, query, orderBy, limit }] = await Promise.all([
    getFirebaseDb(),
    import('firebase/firestore'),
  ]);
  const q = query(
    collection(db, 'circuits'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
  } as CommunityCircuit));
}

export async function incrementViews(circuitId: string): Promise<void> {
  try {
    const [db, { doc, updateDoc, increment }] = await Promise.all([
      getFirebaseDb(),
      import('firebase/firestore'),
    ]);
    await updateDoc(doc(db, 'circuits', circuitId), { views: increment(1) });
  } catch (err) {
    console.warn('Failed to increment circuit view count:', err);
  }
}
