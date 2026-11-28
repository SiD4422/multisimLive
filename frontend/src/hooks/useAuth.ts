import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';

export type AuthProviderKind = 'google' | 'github';

interface SharedAuthSnapshot {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const snapshot: SharedAuthSnapshot = {
  user: null,
  loading: typeof window !== 'undefined',
  error: null,
};

const listeners = new Set<() => void>();
let initStarted = false;

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function ensureAuthSubscription() {
  if (initStarted || typeof window === 'undefined') return;
  initStarted = true;

  Promise.all([import('firebase/auth'), import('../lib/firebase')])
    .then(async ([{ onAuthStateChanged }, { getFirebaseAuth }]) => {
      const { auth } = await getFirebaseAuth();
      onAuthStateChanged(auth, (currentUser) => {
        snapshot.user = currentUser;
        snapshot.loading = false;
        notifyListeners();
      });
    })
    .catch((err) => {
      console.error('Error initializing auth listener:', err);
      snapshot.loading = false;
      notifyListeners();
    });
}

export function formatFirebaseAuthError(error: unknown): string | null {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const msg = error instanceof Error ? error.message : String(error || '');

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return null;
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Allow popups for this site and try again.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with the same email using a different sign-in provider. Sign in with that provider instead.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in provider is not yet enabled in Firebase Authentication Console.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for OAuth sign-in in Firebase Authentication settings.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error while signing in. Check your connection and try again.';
  }
  return msg || 'Sign-in failed. Please try again.';
}

/** Shared React hook exposing Firebase Auth state plus Google & GitHub OAuth actions. */
export function useAuth() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((v) => v + 1);
    listeners.add(listener);
    ensureAuthSubscription();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const clearError = useCallback(() => {
    if (snapshot.error !== null) {
      snapshot.error = null;
      notifyListeners();
    }
  }, []);

  const signInWithProvider = useCallback(async (providerKind: AuthProviderKind): Promise<User | null> => {
    snapshot.error = null;
    notifyListeners();
    try {
      const [{ signInWithPopup }, { getFirebaseAuth }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
      ]);
      const { auth, googleProvider, githubProvider } = await getFirebaseAuth();
      const provider = providerKind === 'github' ? githubProvider : googleProvider;
      const result = await signInWithPopup(auth, provider);
      snapshot.user = result.user;
      snapshot.loading = false;
      snapshot.error = null;
      notifyListeners();
      return result.user;
    } catch (error) {
      const formatted = formatFirebaseAuthError(error);
      if (formatted) {
        console.error(`Error signing in with ${providerKind}:`, error);
        snapshot.error = formatted;
        notifyListeners();
      }
      return null;
    }
  }, []);

  const signInWithGoogle = useCallback(() => signInWithProvider('google'), [signInWithProvider]);
  const signInWithGithub = useCallback(() => signInWithProvider('github'), [signInWithProvider]);

  const signOut = useCallback(async () => {
    try {
      const [{ signOut: firebaseSignOut }, { getFirebaseAuth }] = await Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
      ]);
      const { auth } = await getFirebaseAuth();
      await firebaseSignOut(auth);
      snapshot.user = null;
      snapshot.error = null;
      notifyListeners();
    } catch (error) {
      console.error('Error signing out:', error);
      snapshot.error = 'Failed to sign out cleanly. Please try again.';
      notifyListeners();
    }
  }, []);

  return {
    user: snapshot.user,
    loading: snapshot.loading,
    error: snapshot.error,
    clearError,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };
}
