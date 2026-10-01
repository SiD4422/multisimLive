import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, FolderOpen, Save, Share, Code, 
  Camera, Upload, Download, Copy, Maximize, HelpCircle, Sparkles, FileText
} from 'lucide-react';
import { Logo } from './icons/Logo';

export interface SimulatorHeaderProps {
  circuitName: string;
  isEditingName: boolean;
  onEditName: () => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  isEmbed: boolean;
  onShare: () => void;
  onSave: () => void;
  onLoadClick: () => void;
  onExportNetlist: () => void;
  onCopyNetlist: () => void;
  onImportCir: () => void;
  onToggleFullscreen: () => void;
  isSimulating: boolean;
  lastSimMs: number | null;
  setIsLibraryOpen: (v: boolean) => void;
  setIsEmbedModalOpen: (v: boolean) => void;
  setIsShortcutModalOpen: (v: boolean) => void;
  onOpenAi: () => void;
  onExportKiCad: () => void;
  onLabReport: () => void;
}

export function SimulatorHeader({
  circuitName,
  isEditingName,
  onEditName,
  onNameChange,
  onNameBlur,
  isEmbed,
  onShare,
  onSave,
  onLoadClick,
  onExportNetlist,
  onCopyNetlist,
  onImportCir,
  onToggleFullscreen,
  isSimulating,
  lastSimMs,
  setIsLibraryOpen,
  setIsEmbedModalOpen,
  setIsShortcutModalOpen,
  onOpenAi,
  onExportKiCad,
  onLabReport
}: SimulatorHeaderProps) {
  return (
    <header className="header-top relative" style={{ zIndex: 10 }}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2" style={{ marginLeft: '-95px' }}>
          <a href="https://nodesimapp.com" target="_blank" rel="noopener noreferrer" title="Open NodeSim" className="flex items-center">
            <Logo style={{ width: '250px', height: '52px', transform: 'scale(1.3)', transformOrigin: 'left center' }} />
          </a>
          {!isEmbed && <span style={{ fontSize: '10px' }} className="border border-green-700 text-green-300 px-1.5 py-0 rounded-full ml-1 whitespace-nowrap">Beta Testing</span>}
        </div>
        
        {!isEmbed && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '30px', height: '30px' }}>
             <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
             <Link to="/features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features</Link>
             <Link to="/circuits" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Circuits</Link>
             <Link to="/procedure" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procedure</Link>
          </nav>
        )}
      </div>

      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {isEditingName ? (
          <input 
            autoFocus
            className="header-title bg-white outline-none text-center px-2 py-1 rounded shadow-inner" 
            value={circuitName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNameBlur();
            }}
            placeholder="Circuit Name"
            style={{ width: `${Math.max(15, circuitName.length)}ch`, color: '#0f172a' }}
          />
        ) : (
          <div 
            className="header-title cursor-pointer hover:bg-green-700 hover:bg-opacity-50 px-3 py-1 rounded transition-colors text-center" 
            onClick={onEditName}
            title="Click to rename"
          >
            {circuitName || 'Untitled Circuit'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* AI Tutor button — labeled and prominent so users can find it */}
        <button
          onClick={onOpenAi}
          title="AI Circuit Tutor — powered by Gemini"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            border: '1px solid #22c55e40',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #15803d, #166534)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,163,74,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a, #15803d)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(22,163,74,0.3)'; }}
        >
          <Sparkles size={13} />
          AI Tutor
        </button>
        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
        {[
          { icon: <BookOpen size={16}/>, label: 'Example Library', action: () => setIsLibraryOpen(true), color: undefined },
          { icon: <FolderOpen size={16}/>, label: 'Load Circuit (.json)', action: onLoadClick, color: undefined },
          { icon: <Save size={16}/>, label: 'Save Circuit (.json)', action: onSave, color: undefined },
          { icon: <Share size={16}/>, label: 'Share Link', action: onShare, color: undefined },
          { icon: <Code size={16}/>, label: 'Embed Circuit', action: () => setIsEmbedModalOpen(true), color: undefined },
          { icon: <Camera size={16}/>, label: 'Snapshot (PNG)', action: () => window.dispatchEvent(new CustomEvent('export-schematic')), color: '#4ade96' },
          { icon: <Upload size={16}/>, label: 'Import SPICE Netlist (.cir)', action: onImportCir, color: '#60a5fa' },
          { icon: <Download size={16}/>, label: 'Export SPICE Netlist (.cir)', action: onExportNetlist, color: '#60a5fa' },
          { icon: <Copy size={16}/>, label: 'Copy Netlist to Clipboard', action: onCopyNetlist, color: '#60a5fa' },
        ].map(({ icon, label, action, color }) => (
          <button
            key={label}
            title={label}
            onClick={action}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              color: color || 'rgba(255,255,255,0.65)',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = color || '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = color || 'rgba(255,255,255,0.65)'; }}
          >
            {icon}
          </button>
        ))}
        {/* KiCad Export — labeled pill button next to AI Tutor */}
        <button
          onClick={onExportKiCad}
          title="Export to KiCad (.net) — import in KiCad PCB Editor to start PCB layout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 11px',
            background: 'rgba(139,92,246,0.18)',
            border: '1px solid rgba(139,92,246,0.45)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#c4b5fd',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.32)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; }}
        >
          {/* Simple IC chip icon — square body with 4 legs each side */}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="5" y="5" width="10" height="10" rx="1.5" />
            {/* Top pins */}
            <line x1="8"  y1="5" x2="8"  y2="2" />
            <line x1="12" y1="5" x2="12" y2="2" />
            {/* Bottom pins */}
            <line x1="8"  y1="15" x2="8"  y2="18" />
            <line x1="12" y1="15" x2="12" y2="18" />
            {/* Left pins */}
            <line x1="5" y1="8"  x2="2" y2="8" />
            <line x1="5" y1="12" x2="2" y2="12" />
            {/* Right pins */}
            <line x1="15" y1="8"  x2="18" y2="8" />
            <line x1="15" y1="12" x2="18" y2="12" />
          </svg>
          → KiCad
        </button>
        {/* Lab Report — AI-generated PDF */}
        <button
          onClick={onLabReport}
          title="Generate AI Lab Report PDF — Aim, Theory, Procedure, Result, Conclusion"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 11px',
            background: 'rgba(22,163,74,0.15)',
            border: '1px solid rgba(22,163,74,0.4)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#86efac',
            fontSize: '12px', fontWeight: 700,
            whiteSpace: 'nowrap', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.3)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.15)'; e.currentTarget.style.color = '#86efac'; }}
        >
          <FileText size={13} />
          Lab Report
        </button>
        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
        <button
          title="Fullscreen"
          onClick={onToggleFullscreen}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', background: 'transparent',
            border: '1px solid transparent', borderRadius: '6px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.65)', transition: 'all 0.12s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
        >
          <Maximize size={16}/>
        </button>
        <button
          title="Keyboard Shortcuts"
          onClick={() => setIsShortcutModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', background: 'transparent',
            border: '1px solid transparent', borderRadius: '6px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.65)', transition: 'all 0.12s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
        >
          <HelpCircle size={16}/>
        </button>
      </div>
    </header>
  );
}
