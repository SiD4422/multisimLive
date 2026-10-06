import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQLl2CA3vcuKmFgxl7NMBN8krFWIoQUck',
  authDomain: 'nodesim-2c84b.firebaseapp.com',
  projectId: 'nodesim-2c84b',
  storageBucket: 'nodesim-2c84b.firebasestorage.app',
  messagingSenderId: '546330139401',
  appId: '1:546330139401:web:fd7368aeaf4ffdefbbd1d8',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  const docRef = await addDoc(collection(db, 'circuits'), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCommunityCircuits(limitCount = 50): Promise<CommunityCircuit[]> {
  const q = query(
    collection(db, 'circuits'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
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
    await updateDoc(doc(db, 'circuits', circuitId), { views: increment(1) });
  } catch {}
}
