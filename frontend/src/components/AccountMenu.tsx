import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Layers, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

export type AccountMenuVariant =
  | 'landing'
  | 'layout-dark'
  | 'layout-light'
  | 'simulator'
  | 'mobile';

interface AccountMenuProps {
  variant?: AccountMenuVariant;
}

function getProviderLabel(providerId?: string): string {
  if (providerId === 'github.com') return 'GitHub';
  if (providerId === 'google.com') return 'Google';
  return 'Account';
}

export function AccountMenu({ variant = 'layout-light' }: AccountMenuProps) {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const isDarkSurface = variant !== 'layout-light';
  const isSimulator = variant === 'simulator';
  const isMobile = variant === 'mobile';

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Signed In';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const providerName = getProviderLabel(user?.providerData?.[0]?.providerId);

  if (!user) {
    const signInClassName = isMobile ? 'msl-btn btn-ghost' : variant === 'landing' || variant === 'layout-light' || variant === 'layout-dark' ? 'msl-btn btn-ghost' : undefined;
    const signInStyle: React.CSSProperties = isSimulator
      ? {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 11px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: 'rgba(255,255,255,0.88)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: isMobile ? '9px 14px' : '8px 13px',
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          ...(isDarkSurface && variant !== 'landing'
            ? {
                background: 'rgba(255,255,255,0.07)',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.16)',
              }
            : {}),
        };

    return (
      <>
        <button
          type="button"
          className={signInClassName}
          style={signInStyle}
          onClick={() => setIsAuthModalOpen(true)}
          aria-label="Sign in to NodeSim"
        >
          <LogIn size={isSimulator ? 13 : 14} />
          <span>Sign In</span>
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  const triggerStyle: React.CSSProperties = isSimulator
    ? {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 9px 4px 5px',
        borderRadius: 999,
        background: 'rgba(22, 163, 74, 0.16)',
        border: '1px solid rgba(74, 222, 128, 0.35)',
        color: '#f1f5f9',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }
    : {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 10px 5px 6px',
        borderRadius: 999,
        background: isDarkSurface ? 'rgba(22, 163, 74, 0.16)' : '#f0fdf4',
        border: isDarkSurface ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid #bbf7d0',
        color: isDarkSurface ? '#f1f5f9' : '#0f172a',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flex: isMobile ? 1 : undefined,
        justifyContent: isMobile ? 'center' : undefined,
      };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', flex: isMobile ? 1 : undefined }}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        aria-label={`Account menu for ${displayName}`}
        style={triggerStyle}
      >
        {user.photoURL && !avatarFailed ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#16a34a',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initial}
          </span>
        )}
        <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown size={13} style={{ opacity: 0.75, flexShrink: 0 }} />
      </button>

      {isDropdownOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 230,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 8,
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            zIndex: 9999,
            color: '#f1f5f9',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #334155', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
              <UserIcon size={13} style={{ color: '#4ade80' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
            </div>
            {user.email && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            )}
            <div style={{ fontSize: 10.5, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>
              Signed in via {providerName}
            </div>
          </div>

          <Link
            to="/circuits"
            role="menuitem"
            onClick={() => setIsDropdownOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#e2e8f0',
              textDecoration: 'none',
            }}
          >
            <Layers size={14} style={{ color: '#94a3b8' }} />
            <span>Community Circuits</span>
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsDropdownOpen(false);
              void signOut();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#fca5a5',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
