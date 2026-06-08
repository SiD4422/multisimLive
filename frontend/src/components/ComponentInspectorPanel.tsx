import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { X, Info, Zap, Settings, Activity, ActivitySquare, Timer, Waves } from 'lucide-react';
import { getComponentMetadata } from '../utils/ComponentDescriptions';
import { AnalysisSettings } from './AnalysisSettings';

// ── Helpers for Parsing and Formatting Values ───────────────────────────────

function parseValue(type: string, rawVal: string) {
  const val = rawVal || '';
  const parts = val.split(' ');

  switch (type) {
    case 'Resistor':
    case 'Capacitor':
    case 'Inductor':
    case 'Potentiometer':
    case 'DCSource':
    case 'DCCurrent':
    case 'ClockVoltage':
    case 'ClockCurrent':
    case 'DiodeZener':
      return { main: val };
    
    case 'ACSource':
    case 'ACCurrent':
      return {
        amplitude: parts[0] ? parts[0].replace('Vpk', '').replace('Apk', '').replace('V', '').replace('A', '') : '1',
        frequency: parts[1] ? parts[1].replace('Hz', '') : '1k'
      };

    case 'PulseVoltage':
    case 'PulseCurrent':
      if (parts.length >= 7) {
        return {
          v1: parts[0],
          v2: parts[1],
          delay: parts[2],
          rise: parts[3],
          fall: parts[4],
          width: parts[5],
          period: parts[6]
        };
      }
      return { main: val }; // Fallback

    case 'AMVoltage':
    case 'FMVoltage':
    case 'ChirpVoltage':
    case 'StepVoltage':
    case 'TriangularVoltage':
    case 'TriangularCurrent':
    case 'StepCurrent':
    case 'FMCurrent':
    case 'ChirpCurrent':
      if (parts.length >= 2) {
        return {
          amplitude: parts[0] ? parts[0].replace('Vpk', '').replace('Apk', '') : '1',
          frequency: parts[1] ? parts[1].replace('Hz', '') : '1k'
        };
      }
      return { main: val };

    default:
      return { main: val };
  }
}

function stringifyValue(type: string, fields: any) {
  switch (type) {
    case 'ACSource':
      return `${fields.amplitude || '1'}Vpk ${fields.frequency || '1k'}Hz`;
    case 'ACCurrent':
      return `${fields.amplitude || '1'}Apk ${fields.frequency || '1k'}Hz`;
    
    case 'PulseVoltage':
    case 'PulseCurrent':
      if (fields.v1 !== undefined) {
        return `${fields.v1} ${fields.v2} ${fields.delay} ${fields.rise} ${fields.fall} ${fields.width} ${fields.period}`;
      }
      return fields.main;

    case 'AMVoltage':
    case 'FMVoltage':
    case 'ChirpVoltage':
    case 'StepVoltage':
    case 'TriangularVoltage':
      if (fields.amplitude !== undefined) return `${fields.amplitude}Vpk ${fields.frequency}Hz`;
      return fields.main;
      
    case 'TriangularCurrent':
    case 'StepCurrent':
    case 'FMCurrent':
    case 'ChirpCurrent':
      if (fields.amplitude !== undefined) return `${fields.amplitude}Apk ${fields.frequency}Hz`;
      return fields.main;

    default:
      return fields.main || '';
  }
}

// ── Field Sub-components ─────────────────────────────────────────────────────

const InputGroup = ({ label, value, onChange, placeholder, icon: Icon, type = 'text' }: any) => (
  <div className="flex flex-col gap-1 mb-3">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
      {Icon && <Icon size={12} className="text-blue-500" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-colors shadow-sm"
    />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const ComponentInspectorPanel: React.FC = () => {
  const { components, selectedComponentId, isConfigOpen, setIsConfigOpen, updateComponentProperties } = useSchematicStore();
  
  const [designator, setDesignator] = useState('');
  const [fields, setFields] = useState<any>({});
  
  const activeComponent = components.find(c => c.id === selectedComponentId);

  useEffect(() => {
    if (activeComponent) {
      setDesignator(activeComponent.id || '');
      setFields(parseValue(activeComponent.type, activeComponent.value || ''));
    }
  }, [activeComponent]);

  const handleSave = () => {
    if (!activeComponent || !designator.trim()) return;
    const newValue = stringifyValue(activeComponent.type, fields);
    
    updateComponentProperties(activeComponent.id, {
      id: designator.trim(),
      value: newValue.trim()
    });
  };

  const updateField = (key: string, val: string) => {
    setFields((prev: any) => ({ ...prev, [key]: val }));
  };

  // Render correct fields based on component type
  const renderFields = () => {
    if (!activeComponent) return null;
    const type = activeComponent.type;

    if (fields.amplitude !== undefined && fields.frequency !== undefined) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <InputGroup label="Amplitude" value={fields.amplitude} onChange={(v: string) => updateField('amplitude', v)} placeholder="e.g. 5" icon={Waves} />
          <InputGroup label="Frequency" value={fields.frequency} onChange={(v: string) => updateField('frequency', v)} placeholder="e.g. 1k" icon={Activity} />
        </div>
      );
    }

    if (fields.v1 !== undefined) {
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InputGroup label="V_Initial" value={fields.v1} onChange={(v: string) => updateField('v1', v)} placeholder="0" />
            <InputGroup label="V_Pulse" value={fields.v2} onChange={(v: string) => updateField('v2', v)} placeholder="5" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <InputGroup label="Delay" value={fields.delay} onChange={(v: string) => updateField('delay', v)} placeholder="0" />
            <InputGroup label="Rise Time" value={fields.rise} onChange={(v: string) => updateField('rise', v)} placeholder="1u" />
            <InputGroup label="Fall Time" value={fields.fall} onChange={(v: string) => updateField('fall', v)} placeholder="1u" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputGroup label="Pulse Width" value={fields.width} onChange={(v: string) => updateField('width', v)} placeholder="10u" icon={Timer} />
            <InputGroup label="Period" value={fields.period} onChange={(v: string) => updateField('period', v)} placeholder="20u" icon={ActivitySquare} />
          </div>
        </>
      );
    }

    // Default Single Value
    return (
      <InputGroup 
        label="Value / Parameter" 
        value={fields.main || ''} 
        onChange={(v: string) => updateField('main', v)} 
        placeholder="e.g. 1k, 5V, 10u" 
        icon={Settings} 
      />
    );
  };

  const handleClose = () => {
    setIsConfigOpen(false);
  };

  if (!isConfigOpen) return null;

  return (
    <div className="right-panel-wrapper">
      {/* Top Half: Component Inspector */}
      <div className="inspector-section">
        {!activeComponent ? (
          <>
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                <Settings size={18} />
                <span style={{ fontWeight: 700 }}>Inspector</span>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
            <div className="inspector-empty">
              <Settings size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>Select a component on the canvas to view its detailed properties.</p>
            </div>
          </>
        ) : (
          <>
            {/* Premium Header */}
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb' }}>
                <Zap size={18} fill="#dbeafe" />
                <span style={{ fontWeight: 700, color: '#1f2937' }}>Properties</span>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
            
            <div className="inspector-content">
              {/* Educational Hero Section */}
              <div className="props-card">
                <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', marginBottom: '12px' }}>
                  {getComponentMetadata(activeComponent.type).category}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '0 0 12px 0' }}>
                  {getComponentMetadata(activeComponent.type).title}
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'linear-gradient(to right, #eff6ff, transparent)', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                  <Info size={16} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                    {getComponentMetadata(activeComponent.type).description}
                  </p>
                </div>
              </div>
              
              {/* Editable Configuration Section */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
                  <Settings size={14} /> Configuration
                </h4>
                
                <div className="props-card" style={{ padding: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Designator / RefDes</label>
                    <input
                      type="text"
                      value={designator}
                      onChange={(e) => setDesignator(e.target.value)}
                      onBlur={handleSave}
                      className="input-field"
                      style={{ border: 'none', borderBottom: '2px solid #e5e7eb', borderRadius: 0, paddingLeft: 4, fontFamily: 'inherit', fontWeight: 700, fontSize: '16px' }}
                      placeholder="e.g. R1, V1"
                    />
                  </div>
                  
                  <div onBlur={handleSave} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}>
                    {renderFields()}
                  </div>
                </div>
                
                {/* Parameter Help */}
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <strong style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>SPICE Parameter Guide</strong>
                  <div style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {getComponentMetadata(activeComponent.type).parameters}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Half: Simulation Settings */}
      <div className="analysis-section">
        <AnalysisSettings isOpen={true} onClose={undefined} />
      </div>
    </div>
  );
};
