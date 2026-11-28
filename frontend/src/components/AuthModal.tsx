import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck, X } from 'lucide-react';
import { useAuth, type AuthProviderKind } from '../hooks/useAuth';

interface AuthProviderButtonsProps {
  onSuccess?: () => void;
  compact?: boolean;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.48 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.03 21.15 7.21 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.03 14.02A7.18 7.18 0 0 1 4.65 12c0-.7.13-1.38.38-2.02V6.84H1.02A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.02 5.16l4.01-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.03 2.85 1.02 6.84l4.01 3.14C6.01 6.94 8.76 4.75 12 4.75Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

/** Shared OAuth provider buttons for Google and GitHub Firebase authentication. */
export function AuthProviderButtons({ onSuccess, compact = false }: AuthProviderButtonsProps) {
  const { signInWithGoogle, signInWithGithub, error, clearError } = useAuth();
  const [busyProvider, setBusyProvider] = useState<AuthProviderKind | null>(null);

  const handleSignIn = async (provider: AuthProviderKind) => {
    clearError();
    setBusyProvider(provider);
    try {
      const signedInUser =
        provider === 'github' ? await signInWithGithub() : await signInWithGoogle();
      if (signedInUser) {
        onSuccess?.();
      }
    } finally {
      setBusyProvider(null);
    }
  };

  const buttonStyle = (kind: AuthProviderKind): React.CSSProperties => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: compact ? '10px 14px' : '12px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: busyProvider ? 'not-allowed' : 'pointer',
    opacity: busyProvider && busyProvider !== kind ? 0.6 : 1,
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
    ...(kind === 'google'
      ? { background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }
      : { background: '#24292f', color: '#f8fafc', border: '1px solid #475569' }),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        type="button"
        onClick={() => void handleSignIn('google')}
        disabled={Boolean(busyProvider)}
        style={buttonStyle('google')}
      >
        {busyProvider === 'google' ? (
          <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <GoogleIcon />
        )}
        <span>{busyProvider === 'google' ? 'Signing in with Google...' : 'Continue with Google'}</span>
      </button>

      <button
        type="button"
        onClick={() => void handleSignIn('github')}
        disabled={Boolean(busyProvider)}
        style={buttonStyle('github')}
      >
        {busyProvider === 'github' ? (
          <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <GitHubIcon />
        )}
        <span>{busyProvider === 'github' ? 'Signing in with GitHub...' : 'Continue with GitHub'}</span>
      </button>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            background: 'rgba(127, 29, 29, 0.35)',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 12,
            lineHeight: 1.45,
            color: '#fecaca',
            textAlign: 'left',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  title = 'Sign in to NodeSim',
  subtitle = 'Publish circuits to the community gallery, track ownership, and manage your designs.',
}: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nodesim-auth-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(2, 6, 23, 0.76)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 410,
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: 24,
          color: '#f1f5f9',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.65)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(22, 163, 74, 0.16)',
                border: '1px solid rgba(22, 163, 74, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 id="nodesim-auth-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                {title}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.45, color: '#94a3b8' }}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close sign in dialog"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              lineHeight: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <AuthProviderButtons
          onSuccess={() => {
            onAuthenticated?.();
            onClose();
          }}
        />

        <div
          style={{
            marginTop: 16,
            padding: '10px 12px',
            borderRadius: 8,
            background: '#0f172a',
            border: '1px solid #334155',
            fontSize: 11,
            color: '#94a3b8',
            lineHeight: 1.5,
          }}
        >
          No account is required to build schematics, run SPICE simulations, or save circuits locally.
        </div>
      </div>
    </div>
  );
}
