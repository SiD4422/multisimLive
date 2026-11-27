import { useEffect, useState } from 'react';
import { useSchematicStore, hadSavedCircuitAtBoot } from '../store/useSchematicStore';
import LZString from 'lz-string';

type BootSource = 'url' | 'restored' | 'fresh' | 'demo';

interface BootPlan {
  source: BootSource;
  urlJson: string | null;
}

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

function resolveBootPlan(): BootPlan {
  if (typeof window === 'undefined') {
    return { source: 'fresh', urlJson: null };
  }

  const hash = window.location.hash;
  const rawParam = hash && hash.startsWith('#circuit=')
    ? hash.substring(9)
    : new URLSearchParams(window.location.search).get('circuit');

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
        return { source: 'url', urlJson: jsonStr };
      }
    } catch (err) {
      console.error('Failed to load circuit from URL:', err);
    }
  }

  return hadSavedCircuitAtBoot()
    ? { source: 'restored', urlJson: null }
    : { source: 'demo', urlJson: null };
}

export function useCircuitBoot() {
  const [plan] = useState<BootPlan>(resolveBootPlan);

  useEffect(() => {
    if (plan.source === 'url' && plan.urlJson) {
      const jsonStr = plan.urlJson;
      // Defer importState until Zustand store hydration finishes
      const timer = setTimeout(() => {
        useSchematicStore.getState().importState(jsonStr);
        window.history.replaceState(null, '', window.location.pathname);
      }, 50);
      return () => clearTimeout(timer);
    }

    if (plan.source === 'demo') {
      const timer = setTimeout(() => {
        useSchematicStore.getState().importState(JSON.stringify(demoCircuit));
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [plan]);

  return plan.source;
}
