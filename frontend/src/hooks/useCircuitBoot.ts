import { useEffect, useRef, useState } from 'react';
import { useSchematicStore, hadSavedCircuitAtBoot } from '../store/useSchematicStore';
import LZString from 'lz-string';

type BootSource = 'url' | 'restored' | 'fresh' | 'demo';

const demoCircuit = {"components":[{"id":"r1","type":"Resistor","pos":{"x":380,"y":240},"value":"1k","rotation":0},{"id":"c1","type":"Capacitor","pos":{"x":520,"y":300},"value":"10u","rotation":0},{"id":"v1","type":"DCVoltage","pos":{"x":240,"y":280},"value":"5","rotation":0},{"id":"g1","type":"Ground","pos":{"x":240,"y":370},"value":"","rotation":0},{"id":"g2","type":"Ground","pos":{"x":520,"y":370},"value":"","rotation":0},{"id":"p1","type":"VoltageProbe","pos":{"x":520,"y":240},"value":"","rotation":0}],"wires":[{"id":"w1","points":[{"x":240,"y":240},{"x":340,"y":240}]},{"id":"w2","points":[{"x":420,"y":240},{"x":520,"y":240}]},{"id":"w3","points":[{"x":520,"y":260},{"x":520,"y":280}]},{"id":"w4","points":[{"x":240,"y":300},{"x":240,"y":370}]},{"id":"w5","points":[{"x":520,"y":320},{"x":520,"y":370}]}],"probes":[],"stagePos":{"x":0,"y":0},"scale":1};

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
