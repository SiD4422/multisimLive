import { describe, it, expect } from 'vitest';
import {
  PINOUT_STUB_CATEGORY,
  PINOUT_STUB_NOTES,
  getPinoutStubNote,
  isPinoutStubComponent,
  standardICLibrary,
} from '../components';

describe('Pinout stub quarantine (Phase 2.1)', () => {
  it('assigns every registered pinout stub to the quarantine category with a descriptive model note', () => {
    const stubIds = Object.keys(PINOUT_STUB_NOTES);
    expect(stubIds.length).toBeGreaterThanOrEqual(22);

    for (const id of stubIds) {
      const def = standardICLibrary.find((c) => c.id === id);
      expect(def, `Expected ${id} in standardICLibrary`).toBeDefined();
      expect(def?.category).toBe(PINOUT_STUB_CATEGORY);
      expect(def?.simulationModel).toBe('pinout-stub');
      expect(def?.modelNote).toBeTruthy();
      expect(isPinoutStubComponent(id)).toBe(true);
      expect(getPinoutStubNote(id)).toBe(def?.modelNote);
    }
  });

  it('keeps genuine analog, power, and logic gate ICs out of the pinout quarantine', () => {
    const simulatedIds = [
      'ic_lm358',
      'ic_lm555',
      'ic_lm317',
      'ic_zener_ref',
      'logic_nand2',
      'logic_nor2',
      'transistor_2n3904',
      'diode_1n4007',
      'crystal',
    ];

    for (const id of simulatedIds) {
      const def = standardICLibrary.find((c) => c.id === id);
      expect(def, `Expected ${id} in standardICLibrary`).toBeDefined();
      expect(def?.category).not.toBe(PINOUT_STUB_CATEGORY);
      expect(def?.simulationModel).not.toBe('pinout-stub');
      expect(isPinoutStubComponent(id)).toBe(false);
      expect(getPinoutStubNote(id)).toBeNull();
    }
  });

  it('retains valid non-empty pins for all quarantined components so schematic layout still works', () => {
    const quarantined = standardICLibrary.filter((c) => c.category === PINOUT_STUB_CATEGORY);
    expect(quarantined.length).toBe(Object.keys(PINOUT_STUB_NOTES).length);

    for (const item of quarantined) {
      expect(item.pins.length).toBeGreaterThanOrEqual(2);
    }
  });
});
