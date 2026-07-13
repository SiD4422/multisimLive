import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { Link } from 'react-router-dom';
import LZString from 'lz-string';
import { Play, MousePointer2, Settings, ZoomIn, ZoomOut, Undo, Redo, LayoutGrid, HelpCircle, Share, Maximize, Activity, PanelLeftClose, PanelLeftOpen, FileCode, Zap, CircleDot, ChevronRight, X, Search, FolderOpen, Save, CheckCircle2, AlertTriangle, BookOpen, Camera, Sparkles } from 'lucide-react';
import SchematicEditor from '../components/SchematicEditor';
import Grapher from '../components/Grapher';
import { ComponentInspectorPanel } from '../components/ComponentInspectorPanel';
import { SimulationControls } from '../components/SimulationControls';
import { AnalysisSettings } from '../components/AnalysisSettings';
import { ExampleLibraryModal } from '../components/ExampleLibraryModal';
import { AiExplainerPanel } from '../components/AiExplainerPanel';
import { OpPointTable } from '../components/OpPointTable';
import { CircuitLibrary } from '../components/CircuitLibrary';
import { useSchematicStore } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister';
import { 
  IconProbeVoltage, IconProbeCurrent,
  IconGround, IconConnector, IconJunction,
  IconACVoltage, IconDCVoltage, IconPulseVoltage, IconACCurrent, IconDCCurrent,
  IconResistor, IconLoad, IconCapacitor, IconInductor, IconOpamp, IconOpamp3T, IconOpamp5T, IconComparator, IconTimer555, IconDiode, IconDiodeZener, IconDiodeLED, IconBridgeRectifier, IconThyristor, IconOptocoupler, IconTransistor, IconTransistorNPN, IconTransistorPNP, IconMosfetN, IconMosfetP, IconJFET, IconIGBT, IconSwitch,
  IconPotentiometer, IconFuse, IconTransformers, IconTransformer1P1S, IconTransformer1P1S_CT, IconTransformer1P2S, IconTransformer2P1S, IconTransformer2P2S, IconCoupledInductors, 
  IconLossyTransmissionLine, IconLosslessTransmissionLine, IconResistorsPack,
  IconLogicGate, IconGateAND, IconGateOR, IconGateNOT, IconGateNAND, IconGateNOR, IconGateXOR,
  IconVoltageRegulator, Icon7Segment, IconCrystal, IconPhotodiode, IconPhototransistor,
  IconDIP14, IconTriac, IconDiac, IconDarlington, IconCurrentMirror
} from '../components/icons/MultisimIcons';
import { Logo } from '../components/icons/Logo';
import '../index.css';

// Error boundary to prevent Grapher crashes from blanking the whole screen
class GrapherErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || String(error) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-600 mb-2">Grapher Error</h3>
          <p className="text-sm text-center max-w-md text-gray-600 mb-4">{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


function Simulator() {
  const { 
    addComponent, components, wires, undo, redo, past, future, scale, setScale,
    selectedComponentId, selectedWireId, selectedProbeId,
    updateComponentValue, updateComponentRotation, setPendingComponent,
    runSimulation, isSimulating, exportState, importState,
    deleteComponent, deleteWire, deleteProbe, isConfigOpen, setIsConfigOpen,
    simulationError, analysisMode
  } = useSchematicStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [circuitName, setCircuitName] = useState('Untitled Circuit');
  const [isEditingName, setIsEditingName] = useState(false);
  const [arrowTop, setArrowTop] = useState<number>(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'schematic' | 'grapher' | 'split'>('schematic');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'warning'} | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isMyCktOpen, setIsMyCktOpen] = useState(false);
  const stageRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Flat list of ALL components for search
  const ALL_COMPONENTS = [
    { label: 'Ground', type: 'Ground', value: '0' },
    { label: 'Junction', type: 'Junction', value: '' },
    { label: 'Connector', type: 'Connector', value: '' },
    { label: 'AC Voltage', type: 'ACSource', value: '1Vpk 1kHz' },
    { label: 'DC Voltage', type: 'DCSource', value: '5V' },
    { label: 'AC Current', type: 'ACCurrent', value: '1A' },
    { label: 'DC Current', type: 'DCCurrent', value: '1A' },
    { label: 'Clock Voltage', type: 'ClockVoltage', value: '5V' },
    { label: 'Pulse Voltage', type: 'PulseVoltage', value: '5V' },
    { label: 'Step Voltage', type: 'StepVoltage', value: '' },
    { label: 'AM Voltage', type: 'AMVoltage', value: '' },
    { label: 'FM Voltage', type: 'FMVoltage', value: '' },
    { label: 'Triangular Voltage', type: 'TriangularVoltage', value: '' },
    { label: 'Chirp Voltage', type: 'ChirpVoltage', value: '' },
    { label: 'Thermal Noise', type: 'ThermalNoise', value: '' },
    { label: 'Resistor', type: 'Resistor', value: '1k' },
    { label: 'Capacitor', type: 'Capacitor', value: '1µF' },
    { label: 'Inductor', type: 'Inductor', value: '1mH' },
    { label: 'Potentiometer', type: 'Potentiometer', value: '10k' },
    { label: 'Fuse', type: 'Fuse', value: '' },
    { label: 'Load', type: 'Load', value: '1k' },
    { label: 'Diode', type: 'Diode', value: '1N4148' },
    { label: 'Zener Diode', type: 'DiodeZener', value: '1N4728A' },
    { label: 'Schottky Diode', type: 'DiodeSchottky', value: 'BAT54' },
    { label: 'LED', type: 'LED', value: '' },
    { label: 'Bridge Rectifier', type: 'BridgeRectifier', value: '' },
    { label: 'NPN Transistor', type: 'TransistorNPN', value: '2N3904' },
    { label: 'PNP Transistor', type: 'TransistorPNP', value: '2N3906' },
    { label: 'NMOS', type: 'MosfetN', value: '2N7000' },
    { label: 'PMOS', type: 'MosfetP', value: 'BSS84' },
    { label: 'JFET N', type: 'JFET', value: 'J201' },
    { label: 'IGBT', type: 'IGBT', value: 'FGA25N120' },
    { label: 'Opamp', type: 'Opamp', value: 'LM741' },
    { label: '5-Terminal Opamp', type: 'Opamp5', value: 'LM741' },
    { label: 'Comparator', type: 'Comparator', value: 'LM311' },
    { label: '555 Timer', type: 'Timer555', value: 'NE555' },
    { label: 'SPST Switch', type: 'SwitchSPST', value: 'SW1' },
    { label: 'SPDT Switch', type: 'SPDTSwitch', value: '' },
    { label: 'Push Button', type: 'PushButton', value: '' },
    { label: 'Relay', type: 'Relay', value: '' },
    { label: '7805 Regulator', type: 'VoltageRegulator7805', value: '' },
    { label: '7812 Regulator', type: 'VoltageRegulator7812', value: '' },
    { label: 'LM317 Regulator', type: 'VoltageRegulatorLM317', value: '' },
    { label: 'Transformer 1P1S', type: 'Transformer1P1S', value: '' },
    { label: 'Coupled Inductors', type: 'CoupledInductors', value: '' },
    { label: 'AND Gate', type: 'GateAND', value: '' },
    { label: 'OR Gate', type: 'GateOR', value: '' },
    { label: 'NOT Gate', type: 'GateNOT', value: '' },
    { label: 'NAND Gate', type: 'GateNAND', value: '' },
    { label: 'NOR Gate', type: 'GateNOR', value: '' },
    { label: 'XOR Gate', type: 'GateXOR', value: '' },
    { label: '7-Segment Display', type: 'SevenSegment', value: '' },
    { label: 'Crystal Oscillator', type: 'CrystalOscillator', value: '16MHz' },
    { label: 'Voltage Probe', type: 'ProbeVoltage', value: '' },
    { label: 'Current Probe', type: 'ProbeCurrent', value: '' },
  ];

  const generateDesc = (label: string, type: string) => {
    if (type === 'ThermalNoise') return 'Thermal noise source. Produces white noise.';
    if (type.includes('Mosfet')) return 'Automotive Grade Single N-Channel Power MOSFET.';
    if (label.includes('Voltage') || label.includes('Current')) return `Ideal ${label.toLowerCase()} source for simulation.`;
    if (label.includes('Diode')) return `Standard semiconductor ${label.toLowerCase()} model.`;
    if (label.includes('Transistor') || label.includes('Opamp') || label.includes('Timer')) return `Active ${label.toLowerCase()} component model.`;
    if (label.includes('Gate')) return `Digital logic ${label.toLowerCase()} model.`;
    return `Standard passive ${label.toLowerCase()} model.`;
  };

  const renderIcon = (type: string) => {
    const props = { size: 28, color: '#4b5563' };
    switch(type) {
      case 'Ground': return <IconGround {...props} />;
      case 'ACSource': return <IconACVoltage {...props} />;
      case 'DCSource': return <IconDCVoltage {...props} />;
      case 'ACCurrent': return <IconACCurrent {...props} />;
      case 'DCCurrent': return <IconDCCurrent {...props} />;
      case 'PulseVoltage': return <IconPulseVoltage {...props} />;
      case 'Resistor': return <IconResistor {...props} />;
      case 'Capacitor': return <IconCapacitor {...props} />;
      case 'Inductor': return <IconInductor {...props} />;
      case 'Diode': return <IconDiode {...props} />;
      case 'DiodeZener': return <IconDiodeZener {...props} />;
      case 'TransistorNPN': return <IconTransistorNPN {...props} />;
      case 'TransistorPNP': return <IconTransistorPNP {...props} />;
      case 'MosfetN': return <IconMosfetN {...props} />;
      case 'MosfetP': return <IconMosfetP {...props} />;
      case 'Opamp': return <IconOpamp {...props} />;
      case 'Timer555': return <IconTimer555 {...props} />;
      case 'GateAND': return <IconGateAND {...props} />;
      case 'GateOR': return <IconGateOR {...props} />;
      case 'GateNOT': return <IconGateNOT {...props} />;
      case 'Potentiometer': return <IconPotentiometer {...props} />;
      case 'BridgeRectifier': return <IconBridgeRectifier {...props} />;
      default: return <IconResistor {...props} />; // Fallback icon
    }
  };

  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchResults = cleanQuery.length > 0
    ? ALL_COMPONENTS.filter(c => 
        c.label.toLowerCase().includes(cleanQuery) || 
        c.type.toLowerCase().includes(cleanQuery)
      )
    : [];

  // ── Circuit DRC ────────────────────────────────────────────────────────────────
  // Pre-flight checks before simulation to surface common mistakes
  const drcIssues: string[] = useMemo(() => {
    const issues: string[] = [];
    if (components.length === 0) return issues;
    // 1. No ground
    const hasGround = components.some(c => c.type === 'Ground');
    if (!hasGround) issues.push('No Ground (GND) symbol found');
    // 2. No voltage/current source
    const hasSrc = components.some(c =>
      c.type.includes('Voltage') || c.type.includes('Current') ||
      c.type === 'DCSource' || c.type === 'ACSource'
    );
    if (!hasSrc) issues.push('No voltage or current source in circuit');
    // 3. Floating components (components with no wires attached)
    const allWirePoints = wires.flatMap(w => w.points);
    const isNearWire = (pos: {x:number,y:number}) =>
      allWirePoints.some(p => Math.abs(p.x - pos.x) < 15 && Math.abs(p.y - pos.y) < 15);
    const floating = components.filter(c =>
      c.type !== 'Ground' && c.type !== 'TextAnnotation' && !isNearWire(c.position)
    );
    if (floating.length > 0) issues.push(`${floating.length} component(s) not connected to any wire`);
    return issues;
  }, [components, wires]);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check URL hash for shared circuit on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#circuit=')) {
      try {
        const compressed = hash.substring(9);
        const jsonStr = LZString.decompressFromEncodedURIComponent(compressed);
        if (jsonStr) {
          useSchematicStore.getState().importState(jsonStr);
          showToast('Shared circuit loaded successfully!', 'success');
          // Clean up URL without triggering navigation
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to load circuit from URL:", err);
        showToast('Failed to load shared circuit. The link may be broken.', 'warning');
      }
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Rotation
      if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault(); // Prevent browser refresh
        if (selectedComponentId) {
          const comp = components.find(c => c.id === selectedComponentId);
          if (comp) {
            const currentRotation = comp.rotation || 0;
            const newRotation = (currentRotation + 90) % 360;
            updateComponentRotation(selectedComponentId, newRotation);
          }
        }
      }
      
      // Deletion
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deleting if user is typing in an input field
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        
        if (selectedComponentId) {
          deleteComponent(selectedComponentId);
        } else if (selectedWireId) {
          deleteWire(selectedWireId);
        } else if (selectedProbeId) {
          deleteProbe(selectedProbeId);
        }
      }
      
      // Undo/Redo
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && e.key === 'y') redo();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, selectedWireId, selectedProbeId, components, updateComponentRotation, deleteComponent, deleteWire, deleteProbe, undo, redo]);

  // Prevent accidental refresh if there are components placed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const state = useSchematicStore.getState();
      if (state.components.length > 0 || state.wires.length > 0) {
        e.preventDefault();
        e.returnValue = 'Changes you made may not be saved.';
        return 'Changes you made may not be saved.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
    return () => window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
  }, []);

  const handleExportNetlist = () => {
    const netlist = generateNetlist(components, wires, useSchematicStore.getState().probes);
    console.log("=== SPICE NETLIST ===");
    console.log(netlist);
    alert("Netlist printed to browser console!\n\n" + netlist);
  };

  const handleSelectComponent = (type: string, value: string) => {
    setPendingComponent({ type, value });
    setActiveCategory(null);
  };

  const handleSave = () => {
    const jsonStr = exportState();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuitName || 'multisim_circuit'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonStr = event.target?.result as string;
      if (jsonStr) {
        importState(jsonStr);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again if needed
    e.target.value = '';
  };

  const handleShare = async () => {
    try {
      const stateStr = exportState();
      const compressed = LZString.compressToEncodedURIComponent(stateStr);
      const url = `${window.location.origin}${window.location.pathname}#circuit=${compressed}`;
      
      // Browsers cap URLs typically around 2000 chars. We set limit slightly below for safety.
      if (url.length > 1900) {
        showToast('Circuit too complex to share via URL. Please use the Save button to download a JSON file instead.', 'warning');
        return;
      }
      
      await navigator.clipboard.writeText(url);
      showToast('Shareable link copied to clipboard!', 'success');
    } catch (err) {
      console.error("Share failed", err);
      showToast('Failed to copy link to clipboard.', 'warning');
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="app-container">
      {/* Hidden File Input for Loading Circuits */}
      <input 
        type="file" 
        accept=".json" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Example Library Modal */}
      <ExampleLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <AiExplainerPanel isOpen={isAiPanelOpen} onClose={() => setIsAiPanelOpen(false)} />

      {/* My Circuit Library (localStorage) */}
      <CircuitLibrary
        isOpen={isMyCktOpen}
        onClose={() => setIsMyCktOpen(false)}
        onSaveRequest={() => {
          // Grab Konva stage via the canvas element for thumbnail
          try {
            const canvas = document.querySelector('#canvas-wrapper canvas') as HTMLCanvasElement;
            return canvas?.toDataURL('image/jpeg', 0.6) || '';
          } catch { return ''; }
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-600" /> : <AlertTriangle size={20} className="text-amber-600" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="header-top relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link to="/" title="Back to Home">
              <Logo style={{ width: '210px', height: '70px', marginTop: '-12px', marginBottom: '-12px' }} />
            </Link>
            <span style={{ fontSize: '10px' }} className="border border-green-700 text-green-300 px-1.5 py-0 rounded-full ml-1 whitespace-nowrap">Beta Testing</span>
          </div>
          
          <nav style={{ display: 'flex', gap: '20px', borderLeft: '1px solid #374151', paddingLeft: '20px' }}>
             <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
             <Link to="/features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features</Link>
             <Link to="/circuits" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Circuits</Link>
             <Link to="/procedure" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procedure</Link>
          </nav>
        </div>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {isEditingName ? (
            <input 
              autoFocus
              className="header-title bg-white text-gray-900 outline-none text-center px-2 py-1 rounded shadow-inner" 
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              placeholder="Circuit Name"
              style={{ width: `${Math.max(15, circuitName.length)}ch` }}
            />
          ) : (
            <div 
              className="header-title cursor-pointer hover:bg-green-700 hover:bg-opacity-50 px-3 py-1 rounded transition-colors text-center" 
              onClick={() => setIsEditingName(true)}
              title="Click to rename"
            >
              {circuitName || 'Untitled Circuit'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div title="Example Library"><BookOpen size={24} className="cursor-pointer opacity-70 hover:opacity-100 text-blue-500" onClick={() => setIsLibraryOpen(true)} /></div>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <div title="Load Circuit"><FolderOpen size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleLoadClick} /></div>
          <div title="Save to File"><Save size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleSave} /></div>
          <div title="Share Link"><Share size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleShare} /></div>
          <div title="Snapshot Schematic (PNG)"><Camera size={24} className="cursor-pointer opacity-70 hover:opacity-100 text-green-500" onClick={() => window.dispatchEvent(new CustomEvent('export-schematic'))} /></div>
          <div title="My Circuit Library" style={{ position: 'relative' }}>
            <Save size={24} className="cursor-pointer opacity-70 hover:opacity-100 text-purple-500" onClick={() => setIsMyCktOpen(true)} />
          </div>

          <div title="Fullscreen"><Maximize size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={toggleFullScreen} /></div>
          <HelpCircle size={24} className="cursor-pointer opacity-70 hover:opacity-100" />
        </div>
      </header>

      {/* Toolbar */}
      <div className="header-bottom">
        <div 
          className="flex items-center justify-center cursor-pointer mr-4 opacity-80 hover:opacity-100"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            if (isSidebarOpen) setActiveCategory(null);
          }}
          title="Toggle Palette"
        >
          {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </div>
        <div className="flex items-center gap-2 mr-6 cursor-pointer opacity-80 hover:opacity-100">
          <span className="text-lg">Interactive ▼</span>
        </div>
        
        <SimulationControls drcIssues={drcIssues} />
        <div className={`tab ${activeView === 'schematic' ? 'active' : ''}`} onClick={() => setActiveView('schematic')}>
          <MousePointer2 size={24} className="mr-2" /> Schematic
        </div>
        <div className={`tab ${activeView === 'grapher' ? 'active' : ''}`} onClick={() => { setActiveView('grapher'); setActiveCategory(null); }}>
          Grapher
        </div>
        <div className={`tab ${activeView === 'split' ? 'active' : ''}`} onClick={() => { setActiveView('split'); setActiveCategory(null); }}>
          Split
        </div>
        <div className="flex items-center gap-4" style={{ marginLeft: 'auto' }}>
          <div className="cursor-pointer opacity-80 hover:opacity-100">
            <Settings size={24} onClick={() => setIsConfigOpen(!isConfigOpen)} />
          </div>
        </div>
      </div>

      <div className="main-area">
        {simulationError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-0 w-full z-50 absolute top-[110px] left-0 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Simulation Error</p>
                <p className="whitespace-pre-wrap">{simulationError}</p>
              </div>
              <button 
                onClick={() => useSchematicStore.setState({ simulationError: null })}
                className="text-red-700 hover:bg-red-200 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
        <div className="main-content">
        {/* Multisim Dark Vertical Toolbar */}
          {isSidebarOpen && (activeView === 'schematic' || activeView === 'split') && (
            <div className="sidebar">
              <div 
                className={`sidebar-category ${activeCategory === 'search' ? 'active-search' : ''}`} 
                style={{
                  position: 'relative',
                  backgroundColor: activeCategory === 'search' ? '#0d4a2d' : '#6b7280',
                  border: activeCategory === 'search' ? 'none' : undefined
                }}
                onClick={(e) => { 
                  if ((e.target as HTMLElement).tagName === 'INPUT') return;
                  setActiveCategory(activeCategory === 'search' ? null : 'search'); 
                  setArrowTop(e.currentTarget.offsetTop + 10);
                  if (activeCategory !== 'search') setSearchQuery('');
                }}
              >
                <Search size={20} color="#fff" />
                {activeCategory === 'search' && (
                  <div 
                    className="shadow-md" 
                    style={{ 
                      position: 'absolute',
                      left: '46px',
                      top: '-2px',
                      height: 'auto',
                      maxHeight: '700px',
                      width: '380px',
                      backgroundColor: '#fff',
                      border: 'none',
                      borderLeft: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      zIndex: 100
                    }}
                  >
                    <style>{`
                      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                      .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; }
                      .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
                    `}</style>
                    <div style={{ padding: '6px 8px 0px 8px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search components..."
                        style={{
                          width: '100%',
                          height: '32px',
                          border: '1px solid #000',
                          padding: '0 8px',
                          outline: 'none',
                          color: '#000',
                          fontSize: '14px',
                          background: '#fff',
                          flexShrink: 0,
                          boxSizing: 'border-box'
                        }}
                        autoFocus
                      />
                    </div>
                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>
                          {searchResults.length} results
                        </div>
                        {searchResults.map(item => (
                          <div
                            key={item.type}
                            onClick={() => { handleSelectComponent(item.type, item.value); setActiveCategory(null); setSearchQuery(''); }}
                            style={{
                              padding: '12px 12px',
                              cursor: 'pointer',
                              background: '#fff',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              borderBottom: '1px solid #f3f4f6',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                          >
                            {/* Chevron */}
                            <div 
                              style={{ color: '#4b5563', fontSize: '10px', marginTop: '4px', cursor: 'pointer', padding: '2px 4px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedItems(prev => ({ ...prev, [item.type]: !prev[item.type] }));
                              }}
                            >
                              {expandedItems[item.type] ? '▼' : '▶'}
                            </div>
                            
                            {/* Text Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#2c5282', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                              </div>
                              <div style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {generateDesc(item.label, item.type)}
                              </div>

                              {/* Expanded Content */}
                              {expandedItems[item.type] && (
                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#4b5563', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                                  {item.type.includes('Mosfet') || item.type.includes('Transistor') ? (
                                    <>
                                      <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Manufacturer: ON Semiconductor</div>
                                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1px solid #9ca3af' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ border: '1px solid #9ca3af', padding: '4px 6px', textAlign: 'left', fontWeight: 'normal', color: '#6b7280' }}>Part Number</th>
                                            <th style={{ border: '1px solid #9ca3af', padding: '4px 6px', textAlign: 'left', fontWeight: 'normal', color: '#6b7280' }}>Package</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td style={{ border: '1px solid #9ca3af', padding: '4px 6px' }}>{item.type.toUpperCase()}1T1G</td>
                                            <td style={{ border: '1px solid #9ca3af', padding: '4px 6px' }}>SC-88-6(CASE 419B-02Y)</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <div>Model(s): {item.type.toUpperCase()}/ON</div>
                                    </>
                                  ) : (
                                    <div>Model(s): {item.type.toUpperCase()}_MODEL</div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Icon Box */}
                            <div style={{ 
                              width: '44px', height: '44px', 
                              backgroundColor: '#d1d5db', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {renderIcon(item.type)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                      <div style={{ color: '#9ca3af', fontSize: 13, padding: '12px 10px' }}>No components found</div>
                    )}
                  </div>
                )}
              </div>
          
              <div className={`sidebar-category ${activeCategory === 'analysis' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'analysis' ? null : 'analysis'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconProbeVoltage size={24} active={activeCategory === 'analysis'} />
              </div>
              
              <div className={`sidebar-category ${activeCategory === 'connectors' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'connectors' ? null : 'connectors'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconGround size={24} active={activeCategory === 'connectors'} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'sources' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'sources' ? null : 'sources'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconACVoltage size={24} active={activeCategory === 'sources'} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'passives' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'passives' ? null : 'passives'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconResistor size={24} active={activeCategory === 'passives'} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'analog' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'analog' ? null : 'analog'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconOpamp size={24} active={activeCategory === 'analog'} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'diodes' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'diodes' ? null : 'diodes'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconDiode size={24} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'transistors' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'transistors' ? null : 'transistors'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconTransistor size={24} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'switches' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'switches' ? null : 'switches'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconSwitch size={24} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'power' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'power' ? null : 'power'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconThyristor size={24} />
              </div>

              <div className={`sidebar-category ${activeCategory === 'digital' ? 'active' : ''}`} onClick={(e) => { setActiveCategory(activeCategory === 'digital' ? null : 'digital'); setArrowTop(e.currentTarget.offsetTop + 30); }}>
                <IconLogicGate size={24} active={activeCategory === 'digital'} />
              </div>

              {/* Dynamic Flyout Menu */}
              {activeCategory && activeCategory !== 'search' && (
                <div className="sidebar-flyout" style={{ '--arrow-top': `${arrowTop}px`, top: `calc(${arrowTop}px - 20px)` } as React.CSSProperties}>
                  {activeCategory === 'analysis' && (
                    <>
                      <div className="flyout-header">Analysis and annotation</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('ProbeVoltage', '')}><IconProbeVoltage size={28} /><span>Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ProbeCurrent', '')}><IconProbeCurrent size={28} /><span>Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TextAnnotation', 'Text')}><span className="text-blue-500 font-bold mt-1 text-2xl">Abc</span><span className="text-gray-700 mt-2">Text Annotation</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'connectors' && (
                    <>
                      <div className="flyout-header">Schematic connectors</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Ground', '0')}><IconGround size={28} /><span>Ground</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Connector', '')}><IconConnector size={28} /><span>Connector</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Junction', '')}><IconJunction size={28} /><span>Junction</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'sources' && (
                    <>
                      <div className="flyout-header">Sources</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('ACSource', '1Vpk 1kHz')}><IconACVoltage size={28} /><span>AC Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ACCurrent', '1A')}><IconACCurrent size={28} /><span>AC Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ClockVoltage', '5V')}><IconPulseVoltage size={28} /><span>Clock Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ClockCurrent', '')}><IconPulseVoltage size={28} /><span>Clock Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TriangularVoltage', '')}><IconACVoltage size={28} /><span>Triangular Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TriangularCurrent', '')}><IconACCurrent size={28} /><span>Triangular Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DCSource', '5V')}><IconDCVoltage size={28} /><span>DC Voltage (VCC)</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DCCurrent', '1A')}><IconDCCurrent size={28} /><span>DC Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('StepVoltage', '')}><IconPulseVoltage size={28} /><span>Step Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('StepCurrent', '')}><IconPulseVoltage size={28} /><span>Step Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PulseVoltage', '5V')}><IconPulseVoltage size={28} /><span>Pulse Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PulseCurrent', '')}><IconPulseVoltage size={28} /><span>Pulse Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('AMVoltage', '')}><IconACVoltage size={28} /><span>AM Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('FMVoltage', '')}><IconACVoltage size={28} /><span>FM Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('FMCurrent', '')}><IconACCurrent size={28} /><span>FM Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ChirpVoltage', '')}><IconPulseVoltage size={28} /><span>Chirp Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ChirpCurrent', '')}><IconPulseVoltage size={28} /><span>Chirp Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThermalNoise', '')}><IconACVoltage size={28} /><span>Thermal Noise</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryVoltageSource', '')}><IconACVoltage size={28} /><span>Arbitrary Voltage Source</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryCurrentSource', '')}><IconACCurrent size={28} /><span>Arbitrary Current Source</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseDelta', '')}><IconACVoltage size={28} /><span>Three Phase Delta</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseWye', '')}><IconACVoltage size={28} /><span>Three Phase Wye</span></div>
                        <div className="flyout-item disabled"><Search size={28} color="#6b7280" /><span>More</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'passives' && (
                    <>
                      <div className="flyout-header">Passive</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Resistor', '1k')}><IconResistor size={28} /><span>Resistor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Load', '1k')}><IconLoad size={28} /><span>Load</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Capacitor', '1µF')}><IconCapacitor size={28} /><span>Capacitor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Inductor', '1mH')}><IconInductor size={28} /><span>Inductor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Potentiometer', '10k')}><IconPotentiometer size={28} /><span>Potentiometer</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Fuse', '')}><IconFuse size={28} /><span>Fuse</span></div>
                        <div className="flyout-item" onClick={() => setActiveCategory('transformers')}><IconTransformers size={28} /><span>Transformers...</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('CoupledInductors', '')}><IconCoupledInductors size={28} /><span>Coupled Inductors</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LossyTransmissionLine', '')}><IconLossyTransmissionLine size={28} /><span>Lossy Transmission Line</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LosslessTransmissionLine', '')}><IconLosslessTransmissionLine size={28} /><span>Lossless Transmission Line</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Resistors', '')}><IconResistorsPack size={28} /><span>Resistors...</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('CrystalOscillator', '16MHz')}><IconCrystal size={28} /><span>Crystal Oscillator</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'transformers' && (
                    <>
                      <div className="flyout-header">
                        <button className="back-button" onClick={() => setActiveCategory('passives')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginRight: '8px' }}>←</button>
                        Transformers
                      </div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P1S', '')}><IconTransformer1P1S size={28} /><span>1P1S</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P1S_CT', '')}><IconTransformer1P1S_CT size={28} /><span>1P1S with Center Tap</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P2S', '')}><IconTransformer1P2S size={28} /><span>1P2S</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformer2P1S', '')}><IconTransformer2P1S size={28} /><span>2P1S</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformer2P2S', '')}><IconTransformer2P2S size={28} /><span>2P2S</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'analog' && (
                    <>
                      <div className="flyout-header">Analog</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamp', 'LM324')}><IconOpamp3T size={28} /><span>3 Terminal Opamp</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamp5', 'LM741')}><IconOpamp5T size={28} /><span>5 Terminal Opamp</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Comparator', 'LM311')}><IconComparator size={28} /><span>Ideal Comparator</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Timer555', 'NE555')}><IconTimer555 size={28} /><span>555 Timer</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamps', '')}><IconOpamp3T size={28} /><span>Opamps...</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('CurrentMirror', '')}><IconCurrentMirror size={28} /><span>Current Mirror</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'diodes' && (
                    <>
                      <div className="flyout-header">Diodes</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Diode', '1N4148')}><IconDiode size={28} /><span>Diode</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DiodeZener', '1N4728A')}><IconDiodeZener size={28} /><span>Zener</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DiodeSchottky', 'BAT54')}><IconDiode size={28} /><span>Schottky</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LED', '')}><IconDiodeLED size={28} /><span>LED</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Photodiode', '')}><IconPhotodiode size={28} /><span>Photodiode</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'transistors' && (
                    <>
                      <div className="flyout-header">Transistors</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('TransistorNPN', '2N3904')}><IconTransistorNPN size={28} /><span>NPN</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TransistorPNP', '2N3906')}><IconTransistorPNP size={28} /><span>PNP</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('MosfetN', '2N7000')}><IconMosfetN size={28} /><span>NMOS</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('MosfetP', 'BSS84')}><IconMosfetP size={28} /><span>PMOS</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('JFET', 'J201')}><IconJFET size={28} /><span>JFET N</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('IGBT', 'FGA25N120')}><IconIGBT size={28} /><span>IGBT</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Phototransistor', '')}><IconPhototransistor size={28} /><span>Phototransistor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Darlington', '')}><IconDarlington size={28} /><span>Darlington Pair</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'switches' && (
                    <>
                      <div className="flyout-header">Switches</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('SwitchSPST', 'SW1')}><IconSwitch size={28} /><span>SPST Switch</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('SPDTSwitch', '')}><IconSwitch size={28} /><span>SPDT Switch</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PushButton', '')}><IconSwitch size={28} /><span>Push Button</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Relay', '')}><IconSwitch size={28} /><span>Relay</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'power' && (
                    <>
                      <div className="flyout-header">Power & Opto</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('BridgeRectifier', '')}><IconBridgeRectifier size={28} /><span>Bridge Rectifier</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThyristorSCR', '2N5060')}><IconThyristor size={28} /><span>SCR (Thyristor)</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TRIAC', '')}><IconTriac size={28} /><span>TRIAC</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DIAC', '')}><IconDiac size={28} /><span>DIAC</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Optocoupler', 'PC817')}><IconOptocoupler size={28} /><span>Optocoupler</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulator7805', '')}><IconVoltageRegulator size={28} /><span>7805 Regulator</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulator7812', '')}><IconVoltageRegulator size={28} /><span>7812 Regulator</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulatorLM317', '')}><IconVoltageRegulator size={28} /><span>LM317 Regulator</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'digital' && (
                    <>
                      <div className="flyout-header">Digital Logic Gates</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateAND', '')}><IconGateAND size={28} /><span>AND</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateOR', '')}><IconGateOR size={28} /><span>OR</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateNOT', '')}><IconGateNOT size={28} /><span>NOT</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateNAND', '')}><IconGateNAND size={28} /><span>NAND</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateNOR', '')}><IconGateNOR size={28} /><span>NOR</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('GateXOR', '')}><IconGateXOR size={28} /><span>XOR</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DIP14', '')}><IconDIP14 size={28} /><span>DIP-14 IC</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('SevenSegment', '')}><Icon7Segment size={28} /><span>7-Segment Display</span></div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Canvas Area */}
          <div className="canvas-container flex-1 flex flex-col md:flex-row overflow-hidden">
            {(activeView === 'schematic' || activeView === 'split') && (
              <div 
                className={`canvas-wrapper relative ${activeView === 'split' ? 'w-1/2 border-r border-gray-300' : 'w-full'}`} 
                id="canvas-wrapper"
                onClickCapture={() => {
                  if (activeCategory) {
                    setActiveCategory(null);
                    setSearchQuery('');
                  }
                }}
              >
                
                <div className="floating-toolbar">
                  <FileCode size={20} className="cursor-pointer hover:text-black" onClick={handleExportNetlist} />
                  <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  <Undo size={20} className={`cursor-pointer ${past.length > 0 ? 'hover:text-black' : 'opacity-30 cursor-not-allowed'}`} onClick={undo} />
                  <Redo size={20} className={`cursor-pointer ${future.length > 0 ? 'hover:text-black' : 'opacity-30 cursor-not-allowed'}`} onClick={redo} />
                  <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  
                  {/* Zoom Controls */}
                  <ZoomOut size={20} className="cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(Math.max(0.5, scale - 0.1))} />
                  <span className="text-sm font-semibold w-12 text-center select-none cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(1)}>{Math.round(scale * 100)}%</span>
                  <ZoomIn size={20} className="cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(Math.min(2, scale + 0.1))} />
                </div>

                <SchematicEditor />
              </div>
            )}
            
            {(activeView === 'grapher' || activeView === 'split') && (
              <div className={`canvas-wrapper relative ${activeView === 'split' ? 'w-1/2' : 'w-full'}`} id="grapher-wrapper">
                {analysisMode === 'op' ? (
                  <OpPointTable />
                ) : (
                  <GrapherErrorBoundary>
                    <Grapher />
                  </GrapherErrorBoundary>
                )}
              </div>
            )}
          </div>

          {/* Right Configuration Panel */}
          <ComponentInspectorPanel />
        </div>
      </div>

      {/* AnalysisSettings is shown as a modal via the gear icon — no bottom panel */}
    </div>
  );
}

export default Simulator;
