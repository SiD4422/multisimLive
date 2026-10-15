import { useEffect, useRef, useState } from 'react';
import { useSchematicStore, hadSavedCircuitAtBoot } from '../store/useSchematicStore';
import LZString from 'lz-string';

type BootSource = 'url' | 'restored' | 'fresh' | 'demo';

const demoCircuit = {
  components: [
    { id: 'V1', type: 'ACSource', position: { x: 260, y: 220 }, value: '1V 1kHz', rotation: 90 },
    { id: 'R1', type: 'Resistor', position: { x: 340, y: 220 }, value: '1k', rotation: 0 },
    { id: 'C1', type: 'Capacitor', position: { x: 500, y: 220 }, value: '1u', rotation: 90 },
    { id: 'G1', type: 'Ground', position: { x: 260, y: 350 }, value: '', rotation: 0 },
    { id: 'G2', type: 'Ground', position: { x: 500, y: 350 }, value: '', rotation: 0 }
  ],
  wires: [
    { id: 'w1', points: [{ x: 260, y: 220 }, { x: 340, y: 220 }] },
    { id: 'w2', points: [{ x: 430, y: 220 }, { x: 500, y: 220 }] },
    { id: 'w3', points: [{ x: 260, y: 310 }, { x: 260, y: 350 }] },
    { id: 'w4', points: [{ x: 500, y: 310 }, { x: 500, y: 350 }] }
  ],
  probes: [
    { id: 'PRB1', position: { x: 500, y: 220 }, type: 'Voltage', label: 'V(out)' }
  ],
  stagePos: { x: 0, y: 0 },
  scale: 1,
  analysisMode: 'ac',
  acSettings: { fStart: '10', fStop: '100k', points: '100' }
};

export function useCircuitBoot() {
  const ranRef = useRef(false);
  const [source, setSource] = useState<BootSource>('fresh');

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const hash = window.location.hash;
    let rawParam: string | null = null;
    if (hash && hash.startsWith('#circuit=')) {
      rawParam = hash.substring(9);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      rawParam = searchParams.get('circuit');
    }

    if (rawParam) {
      try {
        let jsonStr: string | null = LZString.decompressFromEncodedURIComponent(rawParam);
        if (!jsonStr) {
          try {
            jsonStr = decodeURIComponent(atob(rawParam));
          } catch {
            jsonStr = null;
          }
        }
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

    if (hadSavedCircuitAtBoot()) {
      setSource('restored');
    } else {
      setSource('demo');
      setTimeout(() => {
        useSchematicStore.getState().importState(JSON.stringify(demoCircuit));
      }, 80);
    }
  }, []);

  return source;
}
