import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { track } from '@vercel/analytics';
import type { SimulationData } from '../utils/spiceTypes';
import { generateNetlist, parseSpiceToFloat } from '../utils/netlister';
import { runSpiceSimulation } from '../utils/spiceEngine';

// Atomic flag to clear graph on switch flip without race conditions
export const shouldClearRef = { current: false };

export interface Point {
  x: number;
  y: number;
}

export interface SchematicComponent {
  id: string;
  type: string;
  position: Point;
  value?: string;
  rotation?: number;
  symbolName?: string;
  metadata?: Record<string, string>;
}

export interface Wire {
  id: string;
  points: Point[];
}

export interface Probe {
  id: string;
  position: Point;
  type: string; // e.g. 'Voltage', 'Current'
}

interface HistoryState {
  components: SchematicComponent[];
  wires: Wire[];
  probes: Probe[];
}

interface SchematicState {
  components: SchematicComponent[];
  wires: Wire[];
  probes: Probe[];
  past: HistoryState[];
  future: HistoryState[];
  scale: number;
  stagePos: Point;
  selectedComponentId: string | null;
  selectedWireId: string | null;
  selectedProbeId: string | null;
  selectedComponentIds: string[];
  setSelectedComponentIds: (ids: string[]) => void;
  toggleSelectedComponentId: (id: string) => void;
  deleteSelectedComponents: () => void;
  pendingComponent: { type: string, value: string } | null;
  isConfigOpen: boolean;
  // AI Debugger State
  aiDiagnosis: import('../lib/aiTypes').DiagnosisResult | null;
  highlightedComponentIds: string[];
  setAiDiagnosis: (d: import('../lib/aiTypes').DiagnosisResult | null) => void;
  setHighlightedComponentIds: (ids: string[]) => void;
  customModels: Record<string, string>;
  customModelPorts: Record<string, string[]>;
  addCustomModels: (incomingModels: Record<string, string>, incomingPorts?: Record<string, string[]>) => void;
  removeCustomModel: (name: string) => void;
  clearCustomModels: () => void;
  // Simulation State
  isSimulating: boolean;
  simulationData: SimulationData | null;
  opData: { node: string, value: number, unit: string }[] | null;
  simulationBuffer: SimulationData | null;
  simulationError: string | null;
  isPlaying: boolean;
  playbackTime: number;
  playbackSpeed: number;

  // Analysis Mode
  analysisMode: 'transient' | 'ac' | 'dc' | 'op';
  acSettings: { fStart: string; fStop: string; points: string };
  dcSettings: { source: string; start: string; stop: string; step: string };
  transientSettings: { endTime: string; step: string };
  setAnalysisMode: (mode: 'transient' | 'ac' | 'dc' | 'op') => void;
  setAcSettings: (s: Partial<{ fStart: string; fStop: string; points: string }>) => void;
  setDcSettings: (s: Partial<{ source: string; start: string; stop: string; step: string }>) => void;
  setTransientSettings: (s: Partial<{ endTime: string; step: string }>) => void;

  addComponent: (comp: SchematicComponent) => void;
  updateComponentPosition: (id: string, pos: Point) => void;
  updateComponentAndWires: (id: string, pos: Point, wireUpdates: { id: string, points: Point[] }[]) => void;
  commitDrag: () => void;
  updateComponentValue: (id: string, value: string) => void;
  updateComponentRotation: (id: string, rotation: number) => void;
  
  setSelectedComponent: (id: string | null) => void;
  setSelectedWire: (id: string | null) => void;
  setSelectedProbe: (id: string | null) => void;
  clearSelection: () => void;
  
  deleteComponent: (id: string) => void;
  deleteWire: (id: string) => void;
  deleteProbe: (id: string) => void;
  copyComponent: (id: string) => void;
  flipComponent: (id: string) => void;

  setPendingComponent: (comp: { type: string, value: string } | null) => void;
  setIsConfigOpen: (isOpen: boolean) => void;
  addWire: (wire: Wire) => void;
  addProbe: (probe: Probe) => void;
  updateProbePosition: (id: string, pos: Point) => void;
  
  editingComponentId: string | null;
  setEditingComponentId: (id: string | null) => void;
  updateComponentProperties: (id: string, newProps: Partial<SchematicComponent>) => void;
  
  exportState: () => string;
  importState: (jsonStr: string) => void;
  
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  setScale: (scale: number | ((s: number) => number)) => void;
  setStagePos: (pos: Point) => void;

  runSimulation: (isSilent?: boolean) => Promise<void>;
  stopSimulation: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSimulationData: (data: SimulationData | null) => void;
  setOpData: (data: { node: string, value: number, unit: string }[] | null) => void;
  setSimulationBuffer: (data: SimulationData | null) => void;
  setSimulationError: (error: string | null) => void;
  setPlaybackTime: (time: number | ((t: number) => number)) => void;
}

export const STORAGE_KEY = 'nodesim-schematic-v1';
export const SCHEMA_VERSION = 1;

/** Read pre-hydration to decide if we should show the restore banner. */
export function hadSavedCircuitAtBoot(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const st = parsed?.state;
    return !!st && ((st.components?.length ?? 0) > 0 || (st.wires?.length ?? 0) > 0);
  } catch {
    return false;
  }
}

export const useSchematicStore = create<SchematicState>()(
  persist<SchematicState>(
    (set, get) => ({
      components: [],
      wires: [],
      probes: [],
      past: [],
      future: [],
      scale: 1.0,
      stagePos: { x: 0, y: 0 },
      selectedComponentId: null,
      selectedWireId: null,
      selectedProbeId: null,
      selectedComponentIds: [],
      editingComponentId: null,
      pendingComponent: null,
      isConfigOpen: false,
      aiDiagnosis: null,
      highlightedComponentIds: [],
      isSimulating: false,
  simulationData: null,
  opData: null,
  simulationBuffer: null,
  simulationError: null,
  isPlaying: false,
      playbackTime: 0,
      playbackSpeed: 0.002,

      analysisMode: 'transient',
      acSettings: { fStart: '1', fStop: '1Meg', points: '100' },
      dcSettings: { source: 'V1', start: '0', stop: '5', step: '0.1' },
      transientSettings: { endTime: '10ms', step: '0.01ms' },

      customModels: {},
      customModelPorts: {},
      addCustomModels: (incomingModels, incomingPorts = {}) =>
        set(state => ({ 
          customModels: { ...state.customModels, ...incomingModels },
          customModelPorts: { ...state.customModelPorts, ...incomingPorts }
        })),
      removeCustomModel: (name) =>
        set(state => {
          const nextModels = { ...state.customModels };
          delete nextModels[name];
          const nextPorts = { ...state.customModelPorts };
          delete nextPorts[name];
          return { customModels: nextModels, customModelPorts: nextPorts };
        }),
      clearCustomModels: () => set({ customModels: {}, customModelPorts: {} }),

  saveHistory: () => set((state) => ({
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    return {
      past: newPast,
      future: [{ components: state.components, wires: state.wires, probes: state.probes }, ...state.future],
      components: previous.components,
      wires: previous.wires,
      probes: previous.probes || []
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
      future: newFuture,
      components: next.components,
      wires: next.wires,
      probes: next.probes || []
    };
  }),

  addComponent: (comp) => set((state) => {
    return { 
      components: [...state.components, comp],
      past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
      future: []
    };
  }),

  updateComponentPosition: (id, pos) => set((state) => {
    const comp = state.components.find(c => c.id === id);
    if (comp && comp.position.x === pos.x && comp.position.y === pos.y) return state;
    
    return {
      components: state.components.map(c => c.id === id ? { ...c, position: pos } : c),
      past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
      future: []
    };
  }),

  updateComponentAndWires: (id, pos, wireUpdates) => set((state) => {
    // This updates the component and wires without saving to history (for real-time drag)
    return {
      components: state.components.map(c => c.id === id ? { ...c, position: pos } : c),
      wires: state.wires.map(w => {
        const update = wireUpdates.find(wu => wu.id === w.id);
        return update ? { ...w, points: update.points } : w;
      })
    };
  }),

  commitDrag: () => set((state) => ({
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  addWire: (wire) => set((state) => ({ 
    wires: [...state.wires, wire],
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  addProbe: (probe) => set((state) => ({
    probes: [...state.probes, probe],
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  updateProbePosition: (id, pos) => set((state) => ({
    probes: state.probes.map(p => p.id === id ? { ...p, position: pos } : p),
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  exportState: () => {
    const state = get();
    const data = {
      components: state.components,
      wires: state.wires,
      probes: state.probes,
      stagePos: state.stagePos,
      scale: state.scale
    };
    return JSON.stringify(data, null, 2);
  },

  importState: (jsonStr) => {
    try {
      let data = JSON.parse(jsonStr);
      if (data && data.default) {
        data = data.default;
      }
      set({
        components: data.components || [],
        wires: data.wires || [],
        probes: data.probes || [],
        stagePos: data.stagePos || { x: 0, y: 0 },
        scale: data.scale || 0.34,
        past: [],
        future: [],
        selectedComponentId: null,
        selectedWireId: null,
        selectedProbeId: null,
        editingComponentId: null,
        pendingComponent: null,
        isConfigOpen: false,      // Never auto-open settings on import
        isSimulating: false,
        simulationData: null,
        opData: null,
        simulationBuffer: null,
        simulationError: null,
        isPlaying: false,         // Stop any playback
        playbackTime: 0,          // Reset playback head
        // Import analysis mode/settings if they exist in the JSON
        ...(data.analysisMode ? { analysisMode: data.analysisMode } : {}),
        ...(data.acSettings ? { acSettings: data.acSettings } : {}),
        ...(data.dcSettings ? { dcSettings: data.dcSettings } : {}),
        ...(data.transientSettings ? { transientSettings: data.transientSettings } : {}),
      });
    } catch (e) {
      console.error("Failed to import state", e);
    }

  },

  setScale: (scaleOrFn) => set((state) => ({
    scale: typeof scaleOrFn === 'function' ? scaleOrFn(state.scale) : scaleOrFn
  })),
  
  setStagePos: (pos) => set({ stagePos: pos }),

  updateComponentProperties: (id, newProps) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, ...newProps } : c),
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  clearSelection: () => set({ selectedComponentId: null, selectedWireId: null, selectedProbeId: null, selectedComponentIds: [] }),
  setSelectedComponentIds: (ids) => set({ selectedComponentIds: ids }),
  toggleSelectedComponentId: (id) => set(state => ({
    selectedComponentIds: state.selectedComponentIds.includes(id)
      ? state.selectedComponentIds.filter(x => x !== id)
      : [...state.selectedComponentIds, id]
  })),
  deleteSelectedComponents: () => {
    const { components, wires, probes, selectedComponentIds } = get();
    const hist = { components, wires, probes };
    set(state => ({
      past: [...state.past.slice(-49), hist],
      future: [],
      components: state.components.filter(c => !state.selectedComponentIds.includes(c.id)),
      selectedComponentIds: [],
    }));
  },
  setPendingComponent: (comp) => set({ pendingComponent: comp }),
  setIsConfigOpen: (isOpen) => set({ isConfigOpen: isOpen }),
  setAiDiagnosis: (d) => set({ aiDiagnosis: d }),
  setHighlightedComponentIds: (ids) => set({ highlightedComponentIds: ids }),
  setSelectedComponent: (id) => set({ selectedComponentId: id, selectedWireId: null, selectedProbeId: null }),
  setSelectedWire: (id) => set({ selectedWireId: id, selectedComponentId: null, selectedProbeId: null }),
  setSelectedProbe: (id) => set({ selectedProbeId: id, selectedComponentId: null, selectedWireId: null }),
  setEditingComponentId: (id) => set({ editingComponentId: id }),
  
  deleteComponent: (id) => set((state) => ({
    components: state.components.filter(c => c.id !== id),
    selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  deleteWire: (id) => set((state) => ({
    wires: state.wires.filter(w => w.id !== id),
    selectedWireId: state.selectedWireId === id ? null : state.selectedWireId,
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  deleteProbe: (id) => set((state) => ({
    probes: state.probes.filter(p => p.id !== id),
    selectedProbeId: state.selectedProbeId === id ? null : state.selectedProbeId,
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  updateComponentValue: (id, value) => {
    // If we're interacting with a switch, flag the graph to be cleared
    const comp = get().components.find(c => c.id === id);
    if (comp && (comp.type === 'SwitchSPST' || comp.type === 'PushButton')) {
      shouldClearRef.current = true;
    }
    
    set((state) => ({
      components: state.components.map(c => c.id === id ? { ...c, value } : c),
      past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
      future: []
    }));
  },

  updateComponentRotation: (id, rotation) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, rotation } : c),
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  copyComponent: (id) => set((state) => {
    const comp = state.components.find(c => c.id === id);
    if (!comp) return state;
    // Generate a new unique ID with same prefix
    const prefix = comp.id.replace(/\d+$/, '');
    let nextNum = 1;
    while (state.components.some(c => c.id === `${prefix}${nextNum}`)) nextNum++;
    const copy = { ...comp, id: `${prefix}${nextNum}`, position: { x: comp.position.x + 20, y: comp.position.y + 20 } };
    return {
      components: [...state.components, copy],
      selectedComponentId: copy.id,
      past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
      future: []
    };
  }),

  flipComponent: (id) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, flipped: !(c as any).flipped } : c),
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

  setAnalysisMode: (mode) => set({ analysisMode: mode }),
  setAcSettings: (s) => set((state) => ({ acSettings: { ...state.acSettings, ...s } })),
  setDcSettings: (s) => set((state) => ({ dcSettings: { ...state.dcSettings, ...s } })),
  setTransientSettings: (s) => set((state) => ({ transientSettings: { ...state.transientSettings, ...s } })),

  runSimulation: async (isSilent = false) => {
    const { components, wires, probes, analysisMode, acSettings, dcSettings, transientSettings } = get();
    
    if (!isSilent) track('Simulation_Run', { mode: analysisMode });

    // DRC: Require at least one Ground component
    // Without a ground, the netlister silently assigns node 0 to the first wire in
    // insertion order — producing wrong results with no warning. Surface it early.
    const hasGround = components.some(c => c.type === 'Ground');
    const hasActiveComponents = components.some(c =>
      ['DCSource','ACSource','PulseVoltage','ClockVoltage','StepVoltage',
       'DCCurrent','ACCurrent','TriangularVoltage','TriangularCurrent'].includes(c.type)
    );
    if (!hasGround && hasActiveComponents && !isSilent) {
      set({
        simulationError: 'No Ground component found. Add a Ground symbol to set the 0V reference node — every SPICE circuit needs one.',
        isSimulating: false,
        isPlaying: false,
      });
      return;
    }

    // T5: Prevent 0-ohm resistor infinite current crash in WASM
    const ZERO_THRESHOLD = 1e-9;
    for (const comp of components) {
      if (comp.type === 'Resistor' || comp.type === 'Load') {
        const ohms = parseSpiceToFloat(comp.value || '1k');
        if (Math.abs(ohms) < ZERO_THRESHOLD) {
          const errorMsg = `Resistor is 0Î© â€” this can cause infinite current. Use a small nonzero value (e.g. 1m) or remove it.`;
          if (!isSilent) track('Simulation_Error', { type: 'DRC', details: 'Zero Ohm Resistor' });
          set({ 
            simulationError: errorMsg, 
            isSimulating: false, 
            isPlaying: false,
            selectedComponentId: comp.id,
            isConfigOpen: true // Pop open the config panel so they can fix it immediately
          });
          return;
        }
      }
    }

    // DRC: Detect genuinely floating pins on critical components only.
    // Rules:
    //  - Q_ (BJT): all 3 nodes (C,B,E) must be connected
    //  - M_ (MOSFET): all 3 nodes (D,G,S) must be connected
    //  - D_ (Diode): both nodes must be connected
    // Excluded from blocking DRC:
    //  - V_PRB_ lines (current probe ammeters — always have one NC_ node by design)
    //  - X_ lines (op-amp/subckt — VCC/VEE optional on ideal 3-pin models)
    //  - Timer555 CON pin (commonly left unconnected — treated as warning, not error)
    const floatingCheck = generateNetlist(components, wires, probes, get().customModels, get().customModelPorts);
    const criticalFloating = floatingCheck.split('\n').filter(l => {
      if (!l.includes('NC_')) return false;
      // Only block on BJTs, MOSFETs, and diodes — never on probes or subckts
      return l.match(/^Q_/) || l.match(/^M_/) || l.match(/^D_[^_]/);
    });
    if (criticalFloating.length > 0 && !isSilent) {
      const errorMsg = `Unconnected pin detected. Check all transistor/diode terminals are wired before simulating.`;
      track('Simulation_Error', { type: 'DRC', details: 'Floating Pin' });
      set({ simulationError: errorMsg, isSimulating: false, isPlaying: false });
      return;
    }

    if (!isSilent) {
      set({ isSimulating: true, simulationError: null, isPlaying: false, playbackTime: 0 });
    }
    try {
      let netlist = generateNetlist(components, wires, probes, get().customModels, get().customModelPorts);

      // Replace the default .tran line with the correct analysis command
      let analysisCmd = '';
      if (analysisMode === 'ac') {
        // .ac dec <points> <fstart> <fstop>
        analysisCmd = `.ac dec ${acSettings.points} ${acSettings.fStart} ${acSettings.fStop}`;
      } else if (analysisMode === 'dc') {
        // .dc <source> <start> <stop> <step>
        analysisCmd = `.dc ${dcSettings.source} ${dcSettings.start} ${dcSettings.stop} ${dcSettings.step}`;
      } else if (analysisMode === 'op') {
        analysisCmd = `.op`;
      } else {
        // Default transient (without uic so SPICE calculates initial DC operating point, crucial for amplifiers)
        analysisCmd = `.tran ${transientSettings.step} ${transientSettings.endTime}`;
      }
      netlist = netlist.replace(/^\.tran .+$/m, analysisCmd);
      // If no .tran was found, append the analysis command before .end
      if (!netlist.includes(analysisCmd)) {
        netlist = netlist.replace(/\.end\s*$/, `${analysisCmd}\n.end`);
      }

      const data = await runSpiceSimulation(netlist, isSilent);

      const isAcOrDc = analysisMode === 'ac' || analysisMode === 'dc';
      set(state => {
        // Feature 4: User fix 2 - clear on switch flip atomic check
        let finalData = data;
        if (shouldClearRef.current) {
          finalData = []; // Clear the graph data visually
          shouldClearRef.current = false;
        }

        // If it was an .op analysis, data is an array of op value objects. 
        if (analysisMode === 'op' || (data as any).__plotType === 'op') {
          if (!isSilent) track('Simulation_Success', { mode: analysisMode });
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            opData: finalData as any,
            isSimulating: false,
            isPlaying: false
          };
        }
        
        if (!isSilent) track('Simulation_Success', { mode: analysisMode });
        return {
          simulationBuffer: finalData as unknown as SimulationData,
          simulationData: finalData as unknown as SimulationData,
          opData: null, // Clear op data if we did a regular simulation
          isSimulating: false,
          // Silent runs don't animate playback; they show full trace instantly
          isPlaying: isSilent ? false : (!isAcOrDc && finalData.length > 0),
          playbackTime: isSilent ? Infinity : 0
        };
      });
    } catch (e: any) {
      if (e.message === "CANCELLED_BY_NEW_JOB" || e.message === "ALREADY_SIMULATING") {
        return; // Silently ignore cancelled jobs or double-clicks
      }
      console.error("Simulation failed:", e);
      let errorMsg = e.message || "Simulation failed. See console for details.";
      if (errorMsg.includes("singular matrix")) {
        errorMsg += "\n(Hint: Your circuit might be missing a Ground component. SPICE requires a reference ground node to simulate.)";
        if (!isSilent) track('Simulation_Error', { type: 'SPICE', details: 'singular matrix' });
      } else {
        if (!isSilent) track('Simulation_Error', { type: 'SPICE', details: errorMsg.substring(0, 100) });
      }
      set({ isSimulating: false, simulationError: errorMsg });
    }
  },

  stopSimulation: () => set({ isPlaying: false }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setPlaybackTime: (timeOrFn) => set((state) => ({
    playbackTime: typeof timeOrFn === 'function' ? timeOrFn(state.playbackTime) : timeOrFn
  })),

  setSimulationData: (data) => set({ simulationData: data }),
  setOpData: (data) => set({ opData: data }),
  setSimulationBuffer: (data) => set({ simulationBuffer: data }),
  setSimulationError: (error) => set({ simulationError: error }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying }))
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Only persist schematic graph. Never sim results, WASM handles, selection, undo stack.
      partialize: (s) => ({
        components: s.components,
        wires: s.wires,
        probes: s.probes,
        customModels: s.customModels,
        customModelPorts: s.customModelPorts,
      } as unknown as SchematicState),
      // â”€â”€â”€ Schema migrations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Add an entry here BEFORE bumping SCHEMA_VERSION. Each function receives
      // the persisted state at that version and returns the upgraded shape.
      // NEVER delete old migrations â€” they form a chain for users who skipped versions.
      migrate: (persisted: unknown, version: number) => {
        // Version-chained migration: walk from the stored version up to current
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const MIGRATIONS: Record<number, (old: any) => any> = {
          // Example (add before bumping SCHEMA_VERSION to 2):
          // 1: (old) => ({ ...old, probes: old.probes ?? [] }),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let state: any = persisted;
        for (let v = version; v < SCHEMA_VERSION; v++) {
          if (MIGRATIONS[v]) {
            try { state = MIGRATIONS[v](state); }
            catch { state = null; } // migration threw â€” fall through to guard below
          }
        }

        // Defensive guard: ensure required arrays exist even after partial corruption
        return {
          components: Array.isArray(state?.components) ? state.components : [],
          wires: Array.isArray(state?.wires) ? state.wires : [],
          probes: Array.isArray(state?.probes) ? state.probes : [],
        } as unknown as SchematicState;
      },
      onRehydrateStorage: () => (_state: unknown, error: unknown) => {
        if (error) {
          console.warn('[nodesim] schematic rehydrate failed, starting clean', error);
          try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
        }
      },
    }
  )
);
