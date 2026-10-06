import { describe, it, expect } from 'vitest';
import { generateNetlist, getComponentPins } from './netlister';
import { componentDescriptions } from './ComponentDescriptions';
import type { SchematicComponent, Wire } from '../store/useSchematicStore';

/**
 * Netlist-level smoke test for every component type (fast, no WASM).
 * The ngspice-level equivalent is `npm run test:components`.
 *
 * Each component gets a "jig": every pin goes through a 1k resistor to ground, and pin 0 is driven
 * by a 5 V source. This catches crashes, NaN/undefined leaking into the netlist, and missing pins.
 */

const DEFAULT_VALUES: Record<string, string> = {
  PulseVoltage: '0 5 0 1n 1n 1m 2m',
  ACSource: '1 1k',
  ACCurrent: '1 1k',
  Resistor: '1k',
  Resistors: '1k',
  Load: '1k',
  Capacitor: '1u',
  Inductor: '1m',
  Potentiometer: '10k 50',
};

function buildJig(type: string) {
  const comp: SchematicComponent = {
    id: 'TEST1', type, position: { x: 100, y: 100 }, rotation: 0, value: DEFAULT_VALUES[type] ?? '',
  };
  const pins = getComponentPins(comp);
  const components: SchematicComponent[] = [comp];
  const wires: Wire[] = [];

  pins.forEach((pin, i) => {
    if (!pin.p) return;
    const rPos = { x: 100 + i * 50, y: 200 };
    const gPos = { x: 100 + i * 50, y: 250 };
    components.push({ id: `R_TEST_${i}`, type: 'Resistor', position: rPos, rotation: 90, value: '1k' });
    components.push({ id: `GND_${i}`, type: 'Ground', position: gPos, rotation: 0 });
    wires.push({ id: `W1_${i}`, points: [pin.p, rPos] });
    wires.push({ id: `W2_${i}`, points: [{ x: rPos.x, y: rPos.y + 60 }, gPos] });
    if (i === 0) {
      const vPos = { x: 50, y: 200 };
      const vGnd = { x: 50, y: 250 };
      components.push({ id: 'V_TEST', type: 'DCSource', position: vPos, rotation: 90, value: '5V' });
      components.push({ id: 'GND_I', type: 'Ground', position: vGnd, rotation: 0 });
      wires.push({ id: 'W3', points: [pin.p, vPos] });
      wires.push({ id: 'W4', points: [{ x: vPos.x, y: vPos.y + 60 }, vGnd] });
    }
  });

  return { components, wires, pins };
}

const TYPES = Object.keys(componentDescriptions).filter((t) => t !== 'Default');

describe('every component type', () => {
  it('has at least one type to test', () => {
    expect(TYPES.length).toBeGreaterThan(20);
  });

  describe.each(TYPES)('%s', (type) => {
    it('reports finite pin coordinates', () => {
      const { pins } = buildJig(type);
      for (const pin of pins) {
        expect(Number.isFinite(pin.p?.x)).toBe(true);
        expect(Number.isFinite(pin.p?.y)).toBe(true);
      }
    });

    it('generates a clean netlist', () => {
      const { components, wires } = buildJig(type);
      const spice = generateNetlist(components, wires, []);
      expect(typeof spice).toBe('string');
      expect(spice.length).toBeGreaterThan(0);
      expect(spice).not.toMatch(/\b(NaN|undefined|null|\[object Object\])\b/);
    });
  });
});
