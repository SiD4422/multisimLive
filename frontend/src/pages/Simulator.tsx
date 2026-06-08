import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { Link } from 'react-router-dom';
import LZString from 'lz-string';
import { Play, MousePointer2, Settings, ZoomIn, ZoomOut, Undo, Redo, LayoutGrid, HelpCircle, Share, Maximize, Activity, PanelLeftClose, PanelLeftOpen, FileCode, Zap, CircleDot, ChevronRight, X, Search, FolderOpen, Save, CheckCircle2, AlertTriangle, BookOpen, Camera } from 'lucide-react';
import SchematicEditor from '../components/SchematicEditor';
import Grapher from '../components/Grapher';
import { ComponentInspectorPanel } from '../components/ComponentInspectorPanel';
import { SimulationControls } from '../components/SimulationControls';
import { AnalysisSettings } from '../components/AnalysisSettings';
import { ExampleLibraryModal } from '../components/ExampleLibraryModal';
import { useSchematicStore } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister';
import { 
  IconProbeVoltage, IconProbeCurrent,
  IconGround, IconConnector, IconJunction,
  IconACVoltage, IconDCVoltage, IconPulseVoltage, IconACCurrent, IconDCCurrent,
  IconResistor, IconLoad, IconCapacitor, IconInductor, IconOpamp, IconOpamp3T, IconOpamp5T, IconComparator, IconTimer555, IconDiode, IconDiodeZener, IconDiodeLED, IconBridgeRectifier, IconTransistor, IconTransistorNPN, IconTransistorPNP, IconMosfetN, IconMosfetP, IconJFET, IconIGBT, IconSwitch,
  IconPotentiometer, IconFuse, IconTransformers, IconTransformer1P1S, IconTransformer1P1S_CT, IconTransformer1P2S, IconTransformer2P1S, IconTransformer2P2S, IconCoupledInductors, 
  IconLossyTransmissionLine, IconLosslessTransmissionLine, IconResistorsPack,
  IconLogicGate, IconGateAND, IconGateOR, IconGateNOT, IconGateNAND, IconGateNOR, IconGateXOR
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
    simulationError
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
      <header className="header-top">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link to="/" title="Back to Home">
              <Logo style={{ width: '210px', height: '70px', marginTop: '-12px', marginBottom: '-12px' }} />
            </Link>
            <span className="text-xs border border-green-700 text-green-300 px-2 py-0.5 rounded-full ml-2">Beta Testing</span>
          </div>
          
          <nav style={{ display: 'flex', gap: '20px', borderLeft: '1px solid #374151', paddingLeft: '20px' }}>
             <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
             <Link to="/features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features</Link>
             <Link to="/circuits" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Circuits</Link>
             <Link to="/procedure" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procedure</Link>
          </nav>
        </div>
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
            className="header-title cursor-pointer hover:bg-green-700 hover:bg-opacity-50 px-3 py-1 rounded transition-colors" 
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
          >
            {circuitName || 'Untitled Circuit'}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div title="Example Library"><BookOpen size={24} className="cursor-pointer opacity-70 hover:opacity-100 text-blue-500" onClick={() => setIsLibraryOpen(true)} /></div>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <div title="Load Circuit"><FolderOpen size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleLoadClick} /></div>
          <div title="Save to File"><Save size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleSave} /></div>
          <div title="Share Link"><Share size={24} className="cursor-pointer opacity-70 hover:opacity-100" onClick={handleShare} /></div>
          <div title="Snapshot Schematic (PNG)"><Camera size={24} className="cursor-pointer opacity-70 hover:opacity-100 text-green-500" onClick={() => window.dispatchEvent(new CustomEvent('export-schematic'))} /></div>
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
        
        <SimulationControls />
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
                }}
              >
                <Search size={20} color="#fff" />
                {activeCategory === 'search' && (
                  <div 
                    className="shadow-lg" 
                    style={{ 
                      position: 'absolute',
                      left: '46px', // right edge of the 46px sidebar
                      top: '0px',
                      height: '100%',
                      width: '300px', // slightly smaller width for a better feel
                      backgroundColor: '#0d4a2d',
                      display: 'flex',
                      alignItems: 'center',
                      paddingRight: '8px',
                      zIndex: 100
                    }}
                  >
                    <input 
                      type="text" 
                      style={{
                        width: '100%',
                        height: '80%',
                        border: '2px solid black',
                        borderRadius: '4px',
                        padding: '0 12px',
                        outline: 'none',
                        color: 'black',
                        fontSize: '14px'
                      }}
                      autoFocus
                    />
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
                        <div className="flyout-item" onClick={() => handleSelectComponent('BridgeRectifier', '')}><IconBridgeRectifier size={28} /><span>Bridge Rectifier</span></div>
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
              <div className={`canvas-wrapper relative ${activeView === 'split' ? 'w-1/2 border-r border-gray-300' : 'w-full'}`} id="canvas-wrapper">
                
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
                <GrapherErrorBoundary>
                  <Grapher />
                </GrapherErrorBoundary>
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
