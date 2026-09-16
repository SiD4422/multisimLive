import { useEffect, useRef, useState } from 'react';
import { useSchematicStore, hadSavedCircuitAtBoot } from '../store/useSchematicStore';
import LZString from 'lz-string';

type BootSource = 'url' | 'restored' | 'fresh';

export function useCircuitBoot() {
  const ranRef = useRef(false);
  const [source, setSource] = useState<BootSource>('fresh');

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const hash = window.location.hash;
    if (hash && hash.startsWith('#circuit=')) {
      try {
        const compressed = hash.substring(9);
        const jsonStr = LZString.decompressFromEncodedURIComponent(compressed);
        if (jsonStr) {
          // Wrap in setTimeout to ensure Zustand store hydration finishes before we override it
          setTimeout(() => {
            useSchematicStore.getState().importState(jsonStr);
            window.history.replaceState(null, '', window.location.pathname);
          }, 50);
          setSource('url');
          return;
        }
      } catch (err) {
        console.error("Failed to load circuit from URL:", err);
      }
    }

    setSource(hadSavedCircuitAtBoot() ? 'restored' : 'fresh');
  }, []);

  return source;
}
