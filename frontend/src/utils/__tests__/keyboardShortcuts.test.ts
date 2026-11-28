import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import LZString from 'lz-string';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSchematicStore } from '../../store/useSchematicStore';
import {
  CIRCUIT_SAVES_STORAGE_KEY,
  loadSavedCircuits,
  upsertLocalCircuitSave,
} from '../circuitSavesStorage';
import {
  isEditableEventTarget,
  resolveGlobalShortcut,
  SHORTCUT_CATEGORIES,
  SHORTCUT_DEFINITIONS,
  type KeyboardEventLike,
} from '../keyboardShortcuts';

function makeKeyEvent(overrides: Partial<KeyboardEventLike> = {}): KeyboardEventLike {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    target: null,
    ...overrides,
  };
}

describe('Phase 3.4: Keyboard Shortcuts, Wire Mode & Quick-Save', () => {
  beforeEach(() => {
    useSchematicStore.setState({
      components: [],
      wires: [],
      probes: [],
      past: [],
      future: [],
      selectedComponentId: null,
      selectedWireId: null,
      selectedProbeId: null,
      selectedComponentIds: [],
      pendingComponent: null,
      isWireMode: false,
    });
  });

  it('resolves undo/redo shortcuts including CapsLock uppercase keys and Cmd modifier', () => {
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'z', ctrlKey: true }))).toEqual({
      action: 'undo',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Z', ctrlKey: true }))).toEqual({
      action: 'undo',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'z', metaKey: true }))).toEqual({
      action: 'undo',
      preventDefault: true,
    });

    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'y', ctrlKey: true }))).toEqual({
      action: 'redo',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Y', ctrlKey: true }))).toEqual({
      action: 'redo',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Z', ctrlKey: true, shiftKey: true }))).toEqual({
      action: 'redo',
      preventDefault: true,
    });
  });

  it('resolves R/Ctrl+R rotate, Del/Backspace delete, W wire mode, Ctrl+S, Ctrl+Shift+S, and ?', () => {
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'r' }))).toEqual({
      action: 'rotate',
      preventDefault: false,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'R' }))).toEqual({
      action: 'rotate',
      preventDefault: false,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'r', ctrlKey: true }))).toEqual({
      action: 'rotate',
      preventDefault: true,
    });
    // Avoid hijacking browser Cmd+R reload on macOS
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'r', metaKey: true }))).toBeNull();

    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Delete' }))).toEqual({
      action: 'delete',
      preventDefault: false,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Backspace' }))).toEqual({
      action: 'delete',
      preventDefault: true,
    });

    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'w' }))).toEqual({
      action: 'toggleWireMode',
      preventDefault: false,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'W' }))).toEqual({
      action: 'toggleWireMode',
      preventDefault: false,
    });

    expect(resolveGlobalShortcut(makeKeyEvent({ key: 's', ctrlKey: true }))).toEqual({
      action: 'quickSave',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'S', metaKey: true, shiftKey: true }))).toEqual({
      action: 'saveAs',
      preventDefault: true,
    });

    expect(resolveGlobalShortcut(makeKeyEvent({ key: '?', shiftKey: true }))).toEqual({
      action: 'toggleShortcuts',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Escape' }))).toEqual({
      action: 'escape',
      preventDefault: false,
    });
  });

  it('suppresses shortcuts while typing inside form inputs or while a modal blocks canvas keys', () => {
    expect(isEditableEventTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableEventTarget({ tagName: 'textarea' } as unknown as EventTarget)).toBe(true);
    expect(isEditableEventTarget({ tagName: 'SELECT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableEventTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget)).toBe(true);
    expect(isEditableEventTarget({ tagName: 'CANVAS' } as unknown as EventTarget)).toBe(false);

    expect(
      resolveGlobalShortcut(makeKeyEvent({ key: 'w', target: { tagName: 'INPUT' } as unknown as EventTarget })),
    ).toBeNull();

    // When shortcut overlay is open, only ? and Escape stay active
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'r' }), { isShortcutModalOpen: true })).toBeNull();
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Delete' }), { isModalOpen: true })).toBeNull();
    expect(resolveGlobalShortcut(makeKeyEvent({ key: '?', shiftKey: true }), { isShortcutModalOpen: true })).toEqual({
      action: 'toggleShortcuts',
      preventDefault: true,
    });
    expect(resolveGlobalShortcut(makeKeyEvent({ key: 'Escape' }), { isShortcutModalOpen: true })).toEqual({
      action: 'escape',
      preventDefault: false,
    });
  });

  it('keeps wire mode and placement mutually exclusive in useSchematicStore and supports undo/redo rotation', () => {
    const store = useSchematicStore.getState();
    store.setPendingComponent({ type: 'resistor', value: '1k' });
    expect(useSchematicStore.getState().pendingComponent).toEqual({ type: 'resistor', value: '1k' });

    store.setWireMode(true);
    expect(useSchematicStore.getState().isWireMode).toBe(true);
    expect(useSchematicStore.getState().pendingComponent).toBeNull();

    store.setPendingComponent({ type: 'capacitor', value: '10u' });
    expect(useSchematicStore.getState().isWireMode).toBe(false);
    expect(useSchematicStore.getState().pendingComponent).toEqual({ type: 'capacitor', value: '10u' });

    store.addComponent({
      id: 'R1',
      type: 'resistor',
      value: '1k',
      position: { x: 100, y: 100 },
      rotation: 0,
    });
    store.updateComponentRotation('R1', 90);
    expect(useSchematicStore.getState().components[0].rotation).toBe(90);

    store.undo();
    expect(useSchematicStore.getState().components[0].rotation).toBe(0);

    store.redo();
    expect(useSchematicStore.getState().components[0].rotation).toBe(90);
  });

  it('quick-saves compressed state to nodesim-saved-circuits-v1 and updates existing entries by name', () => {
    const map = new Map<string, string>();
    const memoryStorage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
    };

    useSchematicStore.setState({
      components: [{ id: 'R1', type: 'resistor', value: '4.7k', position: { x: 80, y: 120 }, rotation: 90 }],
      wires: [{ id: 'W1', points: [{ x: 40, y: 120 }, { x: 120, y: 120 }] }],
      probes: [],
    });

    const first = upsertLocalCircuitSave(
      {
        name: 'RC Lowpass',
        stateJson: useSchematicStore.getState().exportState(),
        componentCount: 1,
        now: 1700000000000,
      },
      memoryStorage,
    );

    expect(first.updatedExisting).toBe(false);
    expect(first.saved.name).toBe('RC Lowpass');
    expect(map.has(CIRCUIT_SAVES_STORAGE_KEY)).toBe(true);

    // Update same name with blank-padded name to confirm trimming + upsert
    useSchematicStore.setState({
      components: [
        { id: 'R1', type: 'resistor', value: '10k', position: { x: 80, y: 120 }, rotation: 90 },
        { id: 'C1', type: 'capacitor', value: '100n', position: { x: 180, y: 120 }, rotation: 0 },
      ],
    });
    const second = upsertLocalCircuitSave(
      {
        name: '  RC Lowpass  ',
        stateJson: useSchematicStore.getState().exportState(),
        componentCount: 2,
        now: 1700000005000,
      },
      memoryStorage,
    );

    expect(second.updatedExisting).toBe(true);
    const savedList = loadSavedCircuits(memoryStorage);
    expect(savedList).toHaveLength(1);
    expect(savedList[0].componentCount).toBe(2);

    const decoded = LZString.decompress(savedList[0].compressed);
    expect(decoded).toBeTruthy();
    const parsed = JSON.parse(decoded!);
    expect(parsed.components).toHaveLength(2);
    expect(parsed.components[0].value).toBe('10k');
  });

  it('documents all Phase 3.4 shortcuts in the overlay definitions and wires UI handlers cleanly', () => {
    const listedKeys = SHORTCUT_DEFINITIONS.map(d => d.keys).join(' | ');
    for (const token of ['W', 'R / Ctrl + R', 'Delete / Backspace', 'Ctrl + Z', 'Ctrl + Y', 'Ctrl + S', 'Ctrl + Shift + S', '?']) {
      expect(listedKeys).toContain(token);
    }
    expect(new Set(SHORTCUT_DEFINITIONS.map(d => d.category))).toEqual(new Set(SHORTCUT_CATEGORIES));

    const simSrc = readFileSync(resolve(__dirname, '../../pages/Simulator.tsx'), 'utf8');
    const editorSrc = readFileSync(resolve(__dirname, '../../components/SchematicEditor.tsx'), 'utf8');

    expect(simSrc).toContain('resolveGlobalShortcut');
    expect(simSrc).toContain('saveCircuitDual');
    const cloudSyncSrc = readFileSync(resolve(__dirname, '../cloudSync.ts'), 'utf8');
    expect(cloudSyncSrc).toContain('upsertLocalCircuitSave');
    expect(simSrc).toContain('SHORTCUT_DEFINITIONS');
    expect(simSrc).toContain('aria-labelledby="shortcuts-modal-title"');
    expect(editorSrc).toContain('isEditableEventTarget');
    expect(editorSrc).toContain('setWireMode(false)');
  });
});
