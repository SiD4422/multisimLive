import { create } from 'zustand';
import { generateNetlist } from '../utils/netlister';
import { runSpiceSimulation } from '../utils/spiceEngine';

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
  pendingComponent: { type: string, value: string } | null;
  isConfigOpen: boolean;
  
  // Simulation State
  isSimulating: boolean;
  simulationData: any[] | null;
  simulationBuffer: any[] | null;
  simulationError: string | null;
  isPlaying: boolean;
  playbackTime: number;
  playbackSpeed: number;

  // Analysis Mode
  analysisMode: 'transient' | 'ac' | 'dc';
  acSettings: { fStart: string; fStop: string; points: string };
  dcSettings: { source: string; start: string; stop: string; step: string };
  transientSettings: { endTime: string; step: string };
  setAnalysisMode: (mode: 'transient' | 'ac' | 'dc') => void;
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

  runSimulation: () => Promise<void>;
  stopSimulation: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackTime: (time: number | ((t: number) => number)) => void;
}

export const useSchematicStore = create<SchematicState>()((set, get) => ({
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
      editingComponentId: null,
      pendingComponent: null,
      isConfigOpen: false,
      isSimulating: false,
      simulationData: null,
      simulationBuffer: null,
      simulationError: null,
      isPlaying: false,
      playbackTime: 0,
      playbackSpeed: 0.002,

      analysisMode: 'transient',
      acSettings: { fStart: '1', fStop: '1Meg', points: '100' },
      dcSettings: { source: 'V1', start: '0', stop: '5', step: '0.1' },
      transientSettings: { endTime: '10ms', step: '0.01ms' },

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
      const data = JSON.parse(jsonStr);
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
        simulationBuffer: null,   // Clear old simulation data
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

  clearSelection: () => set({ selectedComponentId: null, selectedWireId: null, selectedProbeId: null }),
  setPendingComponent: (comp) => set({ pendingComponent: comp }),
  setIsConfigOpen: (isOpen) => set({ isConfigOpen: isOpen }),
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

  updateComponentValue: (id, value) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, value } : c),
    past: [...state.past, { components: state.components, wires: state.wires, probes: state.probes }],
    future: []
  })),

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

  runSimulation: async () => {
    const { components, wires, probes, analysisMode, acSettings, dcSettings, transientSettings } = get();
    set({ isSimulating: true, simulationError: null, isPlaying: false, playbackTime: 0 });
    try {
      let netlist = generateNetlist(components, wires, probes);

      // Replace the default .tran line with the correct analysis command
      let analysisCmd = '';
      if (analysisMode === 'ac') {
        // .ac dec <points> <fstart> <fstop>
        analysisCmd = `.ac dec ${acSettings.points} ${acSettings.fStart} ${acSettings.fStop}`;
      } else if (analysisMode === 'dc') {
        // .dc <source> <start> <stop> <step>
        analysisCmd = `.dc ${dcSettings.source} ${dcSettings.start} ${dcSettings.stop} ${dcSettings.step}`;
      } else {
        // Default transient
        analysisCmd = `.tran ${transientSettings.step} ${transientSettings.endTime}`;
      }
      netlist = netlist.replace(/^\.tran .+$/m, analysisCmd);
      // If no .tran was found, append the analysis command before .end
      if (!netlist.includes(analysisCmd)) {
        netlist = netlist.replace(/\.end\s*$/, `${analysisCmd}\n.end`);
      }

      console.log("Generated Netlist:\n" + netlist);
      const data = await runSpiceSimulation(netlist);
      console.log("Simulation Result:", data);

      const isAcOrDc = analysisMode === 'ac' || analysisMode === 'dc';
      set({
        simulationBuffer: data,
        simulationData: data,
        isSimulating: false,
        // AC/DC are static; transient shows all data immediately (playbackTime=Infinity shows full dataset)
        isPlaying: !isAcOrDc && data.length > 0,
        playbackTime: 0   // animation counter starts at 0, but Grapher uses Infinity guard below
      });
    } catch (e: any) {
      console.error("Simulation failed:", e);
      let errorMsg = e.message || "Simulation failed. See console for details.";
      if (errorMsg.includes("singular matrix")) {
        errorMsg += "\n(Hint: Your circuit might be missing a Ground component. SPICE requires a reference ground node to simulate.)";
      }
      set({ isSimulating: false, simulationError: errorMsg });
    }
  },

  stopSimulation: () => set({ isPlaying: false }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setPlaybackTime: (timeOrFn) => set((state) => ({
    playbackTime: typeof timeOrFn === 'function' ? timeOrFn(state.playbackTime) : timeOrFn
  }))
})
);
if (typeof window !== 'undefined') { (window as any).useSchematicStore = useSchematicStore; }
