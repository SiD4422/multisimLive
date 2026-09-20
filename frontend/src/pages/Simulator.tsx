import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SEO from '../components/SEO';

import { Link } from 'react-router-dom';
import LZString from 'lz-string';
import { Play, MousePointer2, Settings, ZoomIn, ZoomOut, Undo, Redo, LayoutGrid, HelpCircle, Share, Maximize, Activity, PanelLeftClose, PanelLeftOpen, FileCode, Zap, CircleDot, ChevronRight, X, Search, FolderOpen, Save, CheckCircle2, AlertTriangle, BookOpen, Camera, Sparkles, Upload, Download, Copy, Code } from 'lucide-react';
import { importSpiceNetlist, looksLikeSpiceNetlist } from '../utils/spiceImporter';
import SchematicEditor from '../components/SchematicEditor';
import Grapher from '../components/Grapher';
import { ComponentInspectorPanel } from '../components/ComponentInspectorPanel';
import { SimulationControls } from '../components/SimulationControls';
import { AnalysisSettings } from '../components/AnalysisSettings';
import { ExampleLibraryModal } from '../components/ExampleLibraryModal';
import AiExplainerPanel from '../components/AiExplainerPanel';
import { OpPointTable } from '../components/OpPointTable';
import { CircuitLibrary } from '../components/CircuitLibrary';
import { useSchematicStore } from '../store/useSchematicStore';
import { generateNetlist, getComponentPins } from '../utils/netlister';
import { EmbedModal } from '../components/EmbedModal';
import { WelcomeTour } from '../components/WelcomeTour';
import { useCircuitBoot } from '../hooks/useCircuitBoot';
import { RestoreBanner } from '../components/RestoreBanner';

import { ComponentPalette } from '../components/ComponentPalette';
import { SimulatorHeader } from '../components/SimulatorHeader';
import { CustomModelPanel } from '../components/CustomModelPanel';
import { StatusBar } from '../components/StatusBar';
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
  const cirFileInputRef = useRef<HTMLInputElement>(null);
  const [circuitName, setCircuitName] = useState('Untitled Circuit');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'schematic' | 'grapher' | 'split'>('schematic');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'warning'} | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isCustomModelOpen, setIsCustomModelOpen] = useState(false);
  const [isMyCktOpen, setIsMyCktOpen] = useState(false);
  const [lastSimMs, setLastSimMs] = useState<number | null>(null);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const stageRef = useRef<any>(null);

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
    // 3. Floating components — check if ANY pin (not just center) is near a wire
    // Multi-pin ICs (555, op-amps) have pins far from their center position
    const allWirePoints = wires.flatMap(w => w.points);
    const isPinNearWire = (pos: {x:number,y:number}) =>
      allWirePoints.some(p => Math.abs(p.x - pos.x) < 15 && Math.abs(p.y - pos.y) < 15);
    const floating = components.filter(c => {
      if (c.type === 'Ground' || c.type === 'TextAnnotation') return false;
      // Check center position first (fast path for most components)
      if (isPinNearWire(c.position)) return false;
      // For multi-pin components, check if any of their computed pins are near a wire
      try {
        const pins = getComponentPins(c);
        return !pins.some(pin => pin.p && isPinNearWire(pin.p));
      } catch {
        return !isPinNearWire(c.position);
      }
    });
    if (floating.length > 0) issues.push(`${floating.length} component(s) not connected to any wire`);
    return issues;
  }, [components, wires]);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const bootSource = useCircuitBoot();

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
    const blob = new Blob([netlist], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuitName || 'circuit'}.cir`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('SPICE netlist exported as .cir file!', 'success');
  };

  const handleCopyNetlist = async () => {
    const netlist = generateNetlist(components, wires, useSchematicStore.getState().probes);
    try {
      await navigator.clipboard.writeText(netlist);
      showToast('SPICE netlist copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy to clipboard — check browser permissions.', 'warning');
    }
  };

  const handleImportCirClick = () => {
    if (cirFileInputRef.current) cirFileInputRef.current.click();
  };

  const handleCirFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      if (!looksLikeSpiceNetlist(text)) {
        showToast('This file does not look like a valid SPICE netlist (.cir). Try a JSON circuit file instead.', 'warning');
        return;
      }
      const result = importSpiceNetlist(text);
      // Build a minimal state JSON and import it
      const stateJson = JSON.stringify({
        components: result.components,
        wires: [],
        probes: [],
        stagePos: { x: 400, y: 300 },
        scale: 0.8,
      });
      importState(stateJson);
      const msg = result.warnings.length > 0
        ? `Imported ${result.componentCount} components. Note: ${result.warnings[0]}`
        : `Imported ${result.componentCount} components from SPICE netlist. Wires are not reconstructed — please connect pins manually.`;
      showToast(msg, result.warnings.length > 0 ? 'warning' : 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectComponent = (type: string, value: string) => {
    setPendingComponent({ type, value });
    
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

  // Track simulation duration for the status bar
  const simStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (isSimulating) {
      simStartRef.current = Date.now();
    } else if (simStartRef.current !== null) {
      setLastSimMs(Date.now() - simStartRef.current);
      simStartRef.current = null;
    }
  }, [isSimulating]);

  return (
    <>
      <SEO 
        title="NodeSim | Online Circuit Simulator" 
        description="Design and run SPICE circuit simulations entirely in your browser with real-time waveform graphers."
        url="https://nodesimapp.com/simulator"
      />
      <div className="app-container">
        <RestoreBanner show={bootSource === 'restored'} />
      {/* Hidden File Input for Loading Circuits */}
      <input 
        type="file" 
        accept=".json" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {/* Hidden File Input for Importing SPICE .cir Netlists */}
      <input
        type="file"
        accept=".cir,.sp,.net,.spice,.spi"
        style={{ display: 'none' }}
        ref={cirFileInputRef}
        onChange={handleCirFileChange}
      />

      {/* Example Library Modal */}
      <WelcomeTour />
      <EmbedModal 
        isOpen={isEmbedModalOpen} 
        onClose={() => setIsEmbedModalOpen(false)} 
        circuitData={LZString.compressToEncodedURIComponent(exportState())}
      />
      <ExampleLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <AiExplainerPanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        onFocusNode={(_node) => { setActiveView('grapher'); }}
      />
      <CustomModelPanel
        isOpen={isCustomModelOpen}
        onClose={() => setIsCustomModelOpen(false)}
      />

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
      <SimulatorHeader
        circuitName={circuitName}
        isEditingName={isEditingName}
        onEditName={() => setIsEditingName(true)}
        onNameChange={setCircuitName}
        onNameBlur={() => setIsEditingName(false)}
        isEmbed={isEmbed}
        onShare={handleShare}
        onSave={handleSave}
        onLoadClick={handleLoadClick}
        onExportNetlist={handleExportNetlist}
        onCopyNetlist={handleCopyNetlist}
        onImportCir={handleImportCirClick}
        onToggleFullscreen={toggleFullScreen}
        isSimulating={isSimulating}
        lastSimMs={lastSimMs}
        setIsLibraryOpen={setIsLibraryOpen}
        setIsEmbedModalOpen={setIsEmbedModalOpen}
        setIsShortcutModalOpen={setIsShortcutModalOpen}
      />

      {/* Toolbar */}
      <div className="header-bottom">
        {/* Toggle sidebar */}
        <button
          title="Toggle Component Palette"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', background: 'transparent',
            border: '1px solid transparent', borderRadius: '6px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0,
            transition: 'all 0.12s ease', marginRight: '8px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {/* Mode badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 10px', borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.04em', marginRight: '8px', cursor: 'default',
          userSelect: 'none',
        }}>
          Interactive
        </div>

        <SimulationControls drcIssues={drcIssues} />

        {/* View tabs */}
        <div style={{ display: 'flex', marginLeft: '8px', gap: '2px' }}>
          <div className={`tab ${activeView === 'schematic' ? 'active' : ''}`} onClick={() => setActiveView('schematic')}>
            <MousePointer2 size={14} /> Schematic
          </div>
          <div className={`tab ${activeView === 'grapher' ? 'active' : ''}`} onClick={() => setActiveView('grapher')}>
            Grapher
          </div>
          <div className={`tab ${activeView === 'split' ? 'active' : ''}`} onClick={() => setActiveView('split')}>
            Split
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            title="Custom SPICE Models"
            onClick={() => setIsCustomModelOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', background: isCustomModelOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: '1px solid transparent', borderRadius: '6px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isCustomModelOpen ? 'rgba(255,255,255,0.15)' : 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <BookOpen size={16} />
          </button>
          <button
            title="Simulation Settings"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', background: isConfigOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: '1px solid transparent', borderRadius: '6px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isConfigOpen ? 'rgba(255,255,255,0.15)' : 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="main-area">
        {simulationError && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
            background: 'linear-gradient(to right, #fef2f2, #fff5f5)',
            borderBottom: '1px solid #fca5a5',
            padding: '10px 16px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
            boxShadow: '0 2px 8px rgba(220,38,38,0.1)',
            animation: 'fadeIn 0.15s ease',
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
              <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#991b1b', marginBottom: '2px' }}>
                  Simulation failed — check your circuit
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {simulationError}
                </p>
              </div>
            </div>
            <button
              onClick={() => useSchematicStore.setState({ simulationError: null })}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#b91c1c', padding: '2px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="main-content">
        {/* Multisim Dark Vertical Toolbar */}
          {isSidebarOpen && (activeView === 'schematic' || activeView === 'split') && (
            <ComponentPalette 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
              onSelect={handleSelectComponent} 
              isEmbed={isEmbed} 
            />
          
          )}

          {/* Canvas Area */}
          <div id="main-content" className="canvas-container flex-1 flex flex-col md:flex-row overflow-hidden">
            {(activeView === 'schematic' || activeView === 'split') && (
              <div 
                className={`canvas-wrapper relative ${activeView === 'split' ? 'w-1/2 border-r border-gray-300' : 'w-full'}`} 
                id="canvas-wrapper"
                
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

      {/* Status Bar */}
      <StatusBar onShare={handleShare} />

      {/* Keyboard Shortcuts Modal */}
      {isShortcutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsShortcutModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>⌨️ Keyboard Shortcuts</h2>
              <button onClick={() => setIsShortcutModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}>×</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {[
                  ['Space', 'Flip wire direction (H ↔ V)'],
                  ['Escape', 'Cancel wire / component placement'],
                  ['Delete / Backspace', 'Delete selected component or wire'],
                  ['Ctrl + R', 'Rotate selected component 90°'],
                  ['Ctrl + Z', 'Undo'],
                  ['Ctrl + Y', 'Redo'],
                  ['Ctrl + C', 'Copy selected component'],
                  ['Scroll wheel', 'Zoom in / out on canvas'],
                  ['Right-click', 'Cancel wire drawing'],
                  ['Double-click wire', 'Finish wire segment'],
                ].map(([key, desc]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 12px 6px 0', fontFamily: 'monospace', background: 'none' }}>
                      <kbd style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>{key}</kbd>
                    </td>
                    <td style={{ padding: '6px 0', color: '#374151' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Simulator;
