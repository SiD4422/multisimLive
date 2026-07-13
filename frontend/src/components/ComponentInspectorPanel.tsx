import React, { useState, useEffect } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { X, Info, Zap, Settings, Activity, ActivitySquare, Timer, Waves, SlidersHorizontal } from 'lucide-react';
import { getComponentMetadata } from '../utils/ComponentDescriptions';
import { AnalysisSettings } from './AnalysisSettings';

// ── Helpers ──────────────────────────────────────────────────────────────────

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
        return { v1: parts[0], v2: parts[1], delay: parts[2], rise: parts[3], fall: parts[4], width: parts[5], period: parts[6] };
      }
      return { main: val };

    case 'AMVoltage': case 'FMVoltage': case 'ChirpVoltage': case 'StepVoltage':
    case 'TriangularVoltage': case 'TriangularCurrent': case 'StepCurrent':
    case 'FMCurrent': case 'ChirpCurrent':
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
    case 'ACSource': return `${fields.amplitude || '1'}Vpk ${fields.frequency || '1k'}Hz`;
    case 'ACCurrent': return `${fields.amplitude || '1'}Apk ${fields.frequency || '1k'}Hz`;
    case 'PulseVoltage':
    case 'PulseCurrent':
      if (fields.v1 !== undefined) {
        return `${fields.v1} ${fields.v2} ${fields.delay} ${fields.rise} ${fields.fall} ${fields.width} ${fields.period}`;
      }
      return fields.main;
    case 'AMVoltage': case 'FMVoltage': case 'ChirpVoltage': case 'StepVoltage': case 'TriangularVoltage':
      if (fields.amplitude !== undefined) return `${fields.amplitude}Vpk ${fields.frequency}Hz`;
      return fields.main;
    case 'TriangularCurrent': case 'StepCurrent': case 'FMCurrent': case 'ChirpCurrent':
      if (fields.amplitude !== undefined) return `${fields.amplitude}Apk ${fields.frequency}Hz`;
      return fields.main;
    default:
      return fields.main || '';
  }
}

// Default values per component type
const DEFAULT_VALUES: Record<string, string> = {
  Resistor: '1k',
  Capacitor: '10u',
  Inductor: '1m',
  Potentiometer: '10k',
  DCSource: '5',
  DCCurrent: '1m',
  ACSource: '5Vpk 1kHz',
  ACCurrent: '1Apk 1kHz',
  PulseVoltage: '0 5 0 1u 1u 5m 10m',
  PulseCurrent: '0 1m 0 1u 1u 5m 10m',
  DiodeZener: '5.1',
  ClockVoltage: '5',
  ClockCurrent: '1m',
};

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

// ── Main Merged Panel ─────────────────────────────────────────────────────────

export const ComponentInspectorPanel: React.FC = () => {
  const { components, selectedComponentId, isConfigOpen, setIsConfigOpen, updateComponentProperties } = useSchematicStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'simulation'>('properties');

  const [designator, setDesignator] = useState('');
  const [fields, setFields] = useState<any>({});

  const activeComponent = components.find(c => c.id === selectedComponentId);

  // Auto-switch to properties tab when a component is selected
  useEffect(() => {
    if (activeComponent) {
      setActiveTab('properties');
      setDesignator(activeComponent.id || '');
      setFields(parseValue(activeComponent.type, activeComponent.value || ''));
    }
  }, [activeComponent?.id]);

  const handleSave = () => {
    if (!activeComponent || !designator.trim()) return;
    const newValue = stringifyValue(activeComponent.type, fields);
    updateComponentProperties(activeComponent.id, {
      id: designator.trim(),
      value: newValue.trim()
    });
  };

  const handleSetDefault = () => {
    if (!activeComponent) return;
    const def = DEFAULT_VALUES[activeComponent.type];
    if (def) {
      const parsed = parseValue(activeComponent.type, def);
      setFields(parsed);
      const newValue = stringifyValue(activeComponent.type, parsed);
      updateComponentProperties(activeComponent.id, { id: designator.trim(), value: newValue.trim() });
    }
  };

  const updateField = (key: string, val: string) => {
    setFields((prev: any) => ({ ...prev, [key]: val }));
  };

  const renderFields = () => {
    if (!activeComponent) return null;

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

    return (
      <InputGroup
        label="Value / Parameter"
        value={fields.main || ''}
        onChange={(v: string) => updateField('main', v)}
        placeholder={DEFAULT_VALUES[activeComponent.type] ? `Default: ${DEFAULT_VALUES[activeComponent.type]}` : 'e.g. 1k, 5V, 10u'}
        icon={Settings}
      />
    );
  };

  if (!isConfigOpen) return null;

  const meta = activeComponent ? getComponentMetadata(activeComponent.type) : null;

  return (
    <div className="right-panel-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Tab Header ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#fff', flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: 700,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            borderBottom: activeTab === 'properties' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'properties' ? '#2563eb' : '#6b7280',
            backgroundColor: 'transparent', textTransform: 'uppercase', letterSpacing: '0.05em',
            transition: 'all 0.15s'
          }}
        >
          <Zap size={14} /> Properties
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          style={{
            flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: 700,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            borderBottom: activeTab === 'simulation' ? '3px solid #16a34a' : '3px solid transparent',
            color: activeTab === 'simulation' ? '#16a34a' : '#6b7280',
            backgroundColor: 'transparent', textTransform: 'uppercase', letterSpacing: '0.05em',
            transition: 'all 0.15s'
          }}
        >
          <SlidersHorizontal size={14} /> Simulation
        </button>
        <button
          onClick={() => setIsConfigOpen(false)}
          style={{ padding: '12px', border: 'none', cursor: 'pointer', color: '#9ca3af', backgroundColor: 'transparent' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Properties Tab ── */}
      {activeTab === 'properties' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {!activeComponent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: 12, color: '#9ca3af', textAlign: 'center' }}>
              <Settings size={48} style={{ color: '#d1d5db' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                Select a component on the canvas to view its detailed properties.
              </p>
            </div>
          ) : (
            <>
              {/* Component Info */}
              <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', padding: '14px', marginBottom: '14px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', marginBottom: '8px' }}>
                  {meta?.category}
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#111827', margin: '0 0 6px 0' }}>{meta?.title}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Info size={14} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{meta?.description}</p>
                </div>
              </div>

              {/* Configuration */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Settings size={12} /> Configuration
                </h4>
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label className="input-label">Designator / RefDes</label>
                  <input
                    type="text"
                    value={designator}
                    onChange={e => setDesignator(e.target.value)}
                    onBlur={handleSave}
                    className="input-field"
                    style={{ fontWeight: 700, fontSize: '15px' }}
                    placeholder="e.g. R1, V1"
                  />
                </div>
                <div onBlur={handleSave} onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}>
                  {renderFields()}
                </div>

                {/* Default Value Button */}
                {DEFAULT_VALUES[activeComponent.type] && (
                  <button
                    onClick={handleSetDefault}
                    style={{ marginTop: '4px', width: '100%', padding: '8px', fontSize: '12px', fontWeight: 600, border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'; (e.target as HTMLElement).style.color = '#374151'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = '#f9fafb'; (e.target as HTMLElement).style.color = '#6b7280'; }}
                  >
                    ⚡ Set Default Value ({DEFAULT_VALUES[activeComponent.type]})
                  </button>
                )}
              </div>

              {/* SPICE Guide */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <strong style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>SPICE Parameter Guide</strong>
                <div style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {meta?.parameters}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Simulation Tab ── */}
      {activeTab === 'simulation' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnalysisSettings isOpen={true} onClose={undefined} />
        </div>
      )}
    </div>
  );
};
