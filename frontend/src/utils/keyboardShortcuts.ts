export type GlobalShortcutAction =
  | 'toggleShortcuts'
  | 'escape'
  | 'saveAs'
  | 'quickSave'
  | 'redo'
  | 'undo'
  | 'clearCanvas'
  | 'runSimulation'
  | 'rotate'
  | 'toggleWireMode'
  | 'delete'
  | 'copy';

export interface KeyboardEventLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  target: EventTarget | null;
}

export interface ResolveShortcutOptions {
  isShortcutModalOpen?: boolean;
  isModalOpen?: boolean;
}

export interface ShortcutMatch {
  action: GlobalShortcutAction;
  preventDefault: boolean;
}

export interface ShortcutDefinition {
  keys: string;
  description: string;
  category: 'Editing' | 'Files & History' | 'Simulation & Canvas';
}

export const SHORTCUT_DEFINITIONS: readonly ShortcutDefinition[] = [
  { keys: 'W', description: 'Toggle Wire Mode (click pins or grid)', category: 'Editing' },
  { keys: 'Space', description: 'Flip wire elbow direction (Auto ↔ H ↔ V)', category: 'Editing' },
  { keys: 'R / Ctrl + R', description: 'Rotate selected component 90°', category: 'Editing' },
  { keys: 'Delete / Backspace', description: 'Delete selected component, wire, or probe', category: 'Editing' },
  { keys: 'Ctrl + C', description: 'Duplicate selected component', category: 'Editing' },
  { keys: 'Escape', description: 'Exit tool / cancel wire / close dialog', category: 'Editing' },
  { keys: 'Ctrl + Z', description: 'Undo last edit', category: 'Files & History' },
  { keys: 'Ctrl + Y / Ctrl + Shift + Z', description: 'Redo edit', category: 'Files & History' },
  { keys: 'Ctrl + S', description: 'Quick-save circuit to local browser library', category: 'Files & History' },
  { keys: 'Ctrl + Shift + S', description: 'Save As (open My Circuits dialog)', category: 'Files & History' },
  { keys: 'Ctrl + Shift + Del', description: 'Clear entire canvas', category: 'Files & History' },
  { keys: 'Ctrl + Enter', description: 'Run / stop SPICE simulation', category: 'Simulation & Canvas' },
  { keys: '?', description: 'Toggle this keyboard shortcuts overlay', category: 'Simulation & Canvas' },
  { keys: 'Scroll / Pinch', description: 'Zoom in / out on schematic canvas', category: 'Simulation & Canvas' },
  { keys: 'Right-click / Double-click', description: 'Cancel drawing / finish multi-segment wire', category: 'Simulation & Canvas' },
];

export const SHORTCUT_CATEGORIES: readonly ShortcutDefinition['category'][] = [
  'Editing',
  'Files & History',
  'Simulation & Canvas',
];

export function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const candidate = target as { tagName?: string; isContentEditable?: boolean };
  if (candidate.isContentEditable) return true;
  const tag = typeof candidate.tagName === 'string' ? candidate.tagName.toUpperCase() : '';
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function resolveGlobalShortcut(
  e: KeyboardEventLike,
  options: ResolveShortcutOptions = {},
): ShortcutMatch | null {
  if (isEditableEventTarget(e.target)) return null;

  const key = e.key.toLowerCase();
  const primaryMod = e.ctrlKey || e.metaKey;

  if (!primaryMod && !e.altKey && e.key === '?') {
    return { action: 'toggleShortcuts', preventDefault: true };
  }

  if (!primaryMod && !e.altKey && e.key === 'Escape') {
    return { action: 'escape', preventDefault: false };
  }

  // While the shortcuts modal (or another modal dialog) is open, do not trigger canvas/file mutations behind it.
  if (options.isShortcutModalOpen || options.isModalOpen) {
    return null;
  }

  if (primaryMod && e.shiftKey && !e.altKey && e.key === 'Delete') {
    return { action: 'clearCanvas', preventDefault: true };
  }

  if (primaryMod && e.shiftKey && !e.altKey && key === 's') {
    return { action: 'saveAs', preventDefault: true };
  }

  if (primaryMod && !e.shiftKey && !e.altKey && key === 's') {
    return { action: 'quickSave', preventDefault: true };
  }

  if (primaryMod && !e.altKey && ((!e.shiftKey && key === 'y') || (e.shiftKey && key === 'z'))) {
    return { action: 'redo', preventDefault: true };
  }

  if (primaryMod && !e.shiftKey && !e.altKey && key === 'z') {
    return { action: 'undo', preventDefault: true };
  }

  if (primaryMod && !e.altKey && e.key === 'Enter') {
    return { action: 'runSimulation', preventDefault: true };
  }

  if (primaryMod && !e.shiftKey && !e.altKey && key === 'c') {
    return { action: 'copy', preventDefault: false };
  }

  // Allow plain R (without modifiers) as well as legacy Ctrl+R (without Meta/Shift/Alt so Cmd+R isn't hijacked on macOS).
  if (!primaryMod && !e.altKey && !e.shiftKey && key === 'r') {
    return { action: 'rotate', preventDefault: false };
  }
  if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && key === 'r') {
    return { action: 'rotate', preventDefault: true };
  }

  if (!primaryMod && !e.altKey && !e.shiftKey && key === 'w') {
    return { action: 'toggleWireMode', preventDefault: false };
  }

  if (!primaryMod && !e.altKey && (e.key === 'Delete' || e.key === 'Backspace')) {
    return { action: 'delete', preventDefault: e.key === 'Backspace' };
  }

  return null;
}
