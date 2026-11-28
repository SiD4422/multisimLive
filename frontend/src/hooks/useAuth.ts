import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    Promise.all([import('firebase/auth'), import('../lib/firebase')])
      .then(async ([{ onAuthStateChanged }, { getFirebaseAuth }]) => {
        if (!active) return;
        const { auth } = await getFirebaseAuth();
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('Error initializing auth listener:', error);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const [{ signInWithPopup }, { getFirebaseAuth }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
      ]);
      const { auth, googleProvider } = await getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const [{ signOut: firebaseSignOut }, { getFirebaseAuth }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
      ]);
      const { auth } = await getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  return { user, loading, signInWithGoogle, signOut };
}
