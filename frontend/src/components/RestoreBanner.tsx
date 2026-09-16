import { useState } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';

interface RestoreBannerProps {
  show: boolean;
}

export function RestoreBanner({ show }: RestoreBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const clearAll = () =>
    useSchematicStore.getState().importState(
      JSON.stringify({ components: [], wires: [], probes: [] })
    );

  if (!show || dismissed) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'rgba(15,169,104,0.12)',
        borderBottom: '1px solid rgba(15,169,104,0.3)',
        fontSize: '13px',
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#0FA968', fontWeight: 600 }}>
        Restored your last circuit.
      </span>
      <button
        type="button"
        onClick={() => { clearAll(); setDismissed(true); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '13px',
          padding: 0,
        }}
      >
        Start a new circuit
      </button>
      <button
        type="button"
        aria-label="Dismiss restore notice"
        onClick={() => setDismissed(true)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px',
          lineHeight: '1',
        }}
      >
        x
      </button>
    </div>
  );
}
