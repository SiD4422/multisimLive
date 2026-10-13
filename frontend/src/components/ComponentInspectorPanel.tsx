import React, { useState, useEffect } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { X, Info, Zap, Settings, Activity, ActivitySquare, Timer, Waves, SlidersHorizontal, Trash2, ChevronDown, ChevronRight, Palette, Check } from 'lucide-react';
import { getComponentMetadata } from '../utils/ComponentDescriptions';
import { parseSpiceToFloat } from '../utils/netlister';

const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  Resistor: 'Two-terminal passive component',
  Capacitor: 'Energy storage — blocks DC, passes AC',
  Inductor: 'Energy storage — opposes current change',
  Diode: 'One-way current valve',
  TransistorNPN: 'NPN bipolar junction transistor',
  TransistorPNP: 'PNP bipolar junction transistor',
  MosfetN: 'N-channel MOSFET switch/amplifier',
  DCSource: 'Ideal DC voltage source',
  ACSource: 'Sinusoidal AC voltage source',
  Opamp: 'Ideal operational amplifier',
  Ground: 'Reference node (0V)',
};

const UNIT_OPTIONS: Record<string, string[]> = {
  Resistor: ['Ω', 'kΩ', 'MΩ'],
  Capacitor: ['F', 'mF', 'µF', 'nF', 'pF'],
  Inductor: ['H', 'mH', 'µH', 'nH'],
  DCSource: ['V', 'mV'],
  ACSource: ['V', 'mV'],
};

function formatWithUnit(baseValue: number, unitStr: string) {
  if (unitStr === 'Ω' || unitStr === 'F' || unitStr === 'H' || unitStr === 'V') return `${baseValue}`;
  if (unitStr === 'kΩ') return `${baseValue / 1e3}k`;
  if (unitStr === 'MΩ') return `${baseValue / 1e6}Meg`;
  if (unitStr === 'mF' || unitStr === 'mH' || unitStr === 'mV') return `${baseValue * 1e3}m`;
  if (unitStr === 'µF' || unitStr === 'µH') return `${baseValue * 1e6}u`;
  if (unitStr === 'nF' || unitStr === 'nH') return `${baseValue * 1e9}n`;
  if (unitStr === 'pF') return `${baseValue * 1e12}p`;
  return `${baseValue}`;
}

// old import replaced:
import { getComponentMetadata as _unused } from '../utils/ComponentDescriptions';
import { AnalysisSettings } from './AnalysisSettings';
import { componentDisplayValue, normalizeValue, validateValue, COMPONENT_UNITS } from '../utils/valueFormatter';

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
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
      {Icon && <Icon size={12} style={{ color: '#3b82f6' }} />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
    />
  </div>
);

// ── Main Merged Panel ─────────────────────────────────────────────────────────

export const ComponentInspectorPanel: React.FC = () => {
  const { components, selectedComponentId, isConfigOpen, setIsConfigOpen, updateComponentProperties, deleteComponent } = useSchematicStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'simulation'>('properties');

const [designator, setDesignator] = useState('');
  const [fields, setFields] = useState<any>({});
  const [valueError, setValueError] = useState<string | null>(null);

  const [showVisual, setShowVisual] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localVisual, setLocalVisual] = useState<any>({ showLabel: true, labelPosition: 'Top', color: 'Default' });

  const activeComponent = components.find(c => c.id === selectedComponentId);

  // Auto-switch to properties tab when a component is selected
  useEffect(() => {
    if (activeComponent) {
      setActiveTab('properties');
      setDesignator(activeComponent.id || '');
      setFields(parseValue(activeComponent.type, activeComponent.value || ''));
      setValueError(null);
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <InputGroup label="Amplitude" value={fields.amplitude} onChange={(v: string) => updateField('amplitude', v)} placeholder="e.g. 5" icon={Waves} />
          <InputGroup label="Frequency" value={fields.frequency} onChange={(v: string) => updateField('frequency', v)} placeholder="e.g. 1k" icon={Activity} />
        </div>
      );
    }

    if (fields.v1 !== undefined) {
      return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputGroup label="V_Initial" value={fields.v1} onChange={(v: string) => updateField('v1', v)} placeholder="0" />
            <InputGroup label="V_Pulse" value={fields.v2} onChange={(v: string) => updateField('v2', v)} placeholder="5" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <InputGroup label="Delay" value={fields.delay} onChange={(v: string) => updateField('delay', v)} placeholder="0" />
            <InputGroup label="Rise Time" value={fields.rise} onChange={(v: string) => updateField('rise', v)} placeholder="1u" />
            <InputGroup label="Fall Time" value={fields.fall} onChange={(v: string) => updateField('fall', v)} placeholder="1u" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InputGroup label="Pulse Width" value={fields.width} onChange={(v: string) => updateField('width', v)} placeholder="10u" icon={Timer} />
            <InputGroup label="Period" value={fields.period} onChange={(v: string) => updateField('period', v)} placeholder="20u" icon={ActivitySquare} />
          </div>
        </>
      );
    }

    // Simple single-value component — add normalize-on-blur, validation, and display hint
    const isSimpleType = !!COMPONENT_UNITS[activeComponent.type];
    const displayHint = isSimpleType && fields.main
      ? componentDisplayValue(fields.main, activeComponent.type)
      : null;
    const showHint = displayHint && displayHint !== fields.main;
    
    const units = UNIT_OPTIONS[activeComponent.type];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings size={12} style={{ color: '#3b82f6' }} />
          Value / Parameter
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={fields.main || ''}
            onChange={(v) => {
              updateField('main', v.target.value);
              if (isSimpleType) {
                const result = validateValue(v.target.value, activeComponent.type);
                setValueError(result.valid ? null : (result.error ?? null));
              }
            }}
            onBlur={() => {
              if (isSimpleType && fields.main) {
                const normalized = normalizeValue(fields.main, activeComponent.type);
                if (normalized !== fields.main) {
                  updateField('main', normalized);
                }
                const result = validateValue(normalized || fields.main, activeComponent.type);
                setValueError(result.valid ? null : (result.error ?? null));
              }
            }}
            placeholder={DEFAULT_VALUES[activeComponent.type] ? `Default: ${DEFAULT_VALUES[activeComponent.type]}` : 'e.g. 1k, 5V, 10u'}
            style={{
              flex: 1, border: `1px solid ${valueError ? '#f87171' : '#d1d5db'}`,
              borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace',
              outline: 'none', background: '#fff', boxSizing: 'border-box',
            }}
          />
          {units && (
            <select
              style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px', fontSize: 13, background: '#fff' }}
              onChange={(e) => {
                const val = parseSpiceToFloat(fields.main || '0');
                if (!isNaN(val)) {
                  const newStr = formatWithUnit(val, e.target.value);
                  updateField('main', newStr);
                  
                  // trigger a save directly:
                  const newValue = newStr; // we know we're in the simple component view
                  updateComponentProperties(activeComponent.id, {
                    value: newValue.trim()
                  });
                }
              }}
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>
        {valueError && (
          <p style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0 0 0', lineHeight: 1.4 }}>
            ⚠ {valueError}
          </p>
        )}
        {!valueError && showHint && (
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
            = {displayHint}
          </p>
        )}
        
        {activeComponent.type === 'Resistor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Tolerance</label>
              <select 
                 value={activeComponent.metadata?.tolerance || '±5%'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, tolerance: e.target.value } })}
                 style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                {['±1%', '±5%', '±10%', '±20%'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Power Rating</label>
              <select 
                 value={activeComponent.metadata?.powerRating || '0.25W'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, powerRating: e.target.value } })}
                 style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                {['0.125W', '0.25W', '0.5W', '1W', '2W'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}
        
        {activeComponent.type === 'Capacitor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Tolerance</label>
              <select 
                 value={activeComponent.metadata?.tolerance || '±20%'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, tolerance: e.target.value } })}
                 style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                {['±5%', '±10%', '±20%'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Voltage Rating</label>
              <input 
                 type="text"
                 value={activeComponent.metadata?.voltageRating || '50V'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, voltageRating: e.target.value } })}
                 style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, background: '#fff', boxSizing: 'border-box' }} />
            </div>
          </div>
        )}
      </div>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, marginBottom: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, background: '#eff6ff', color: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dbeafe' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                    {meta?.title || activeComponent.type}
                  </h2>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4, marginBottom: 0, lineHeight: 1.5 }}>
                    {COMPONENT_DESCRIPTIONS[activeComponent.type] || meta?.description || 'Circuit Component'}
                  </p>
                </div>
              </div>

              {/* Configuration */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Settings size={12} /> Configuration
                </h4>
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    Label
                  </label>
                  <div style={{ width: '100%', border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>
                    {activeComponent.id}
                  </div>
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

                {/* Visual Section */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                  <button 
                    onClick={() => setShowVisual(!showVisual)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#374151', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showVisual ? <ChevronDown size={16} style={{ color: '#9ca3af' }} /> : <ChevronRight size={16} style={{ color: '#9ca3af' }} />}
                    Visual
                  </button>
                  {showVisual && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#4b5563' }}>Show Label</span>
                        <input type="checkbox" checked={localVisual.showLabel} onChange={e => setLocalVisual({...localVisual, showLabel: e.target.checked})} style={{ width: 16, height: 16 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#4b5563' }}>Label Position</span>
                        <select value={localVisual.labelPosition} onChange={e => setLocalVisual({...localVisual, labelPosition: e.target.value})} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 8px', fontSize: 12, background: '#fff' }}>
                          <option>Top</option>
                          <option>Bottom</option>
                          <option>Left</option>
                          <option>Right</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#4b5563' }}>Color</span>
                        <select value={localVisual.color} onChange={e => setLocalVisual({...localVisual, color: e.target.value})} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 8px', fontSize: 12, background: '#fff' }}>
                          <option>Default</option>
                          <option>Blue</option>
                          <option>Red</option>
                          <option>Orange</option>
                          <option>Purple</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Section */}
                <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#374151', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showAdvanced ? <ChevronDown size={16} style={{ color: '#9ca3af' }} /> : <ChevronRight size={16} style={{ color: '#9ca3af' }} />}
                    Advanced
                  </button>
                  {showAdvanced && (
                    <div style={{ marginTop: 12, paddingLeft: 24 }}>
                      <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <strong style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>SPICE Format Hint</strong>
                        <div style={{ fontSize: 12, color: '#4b5563', fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                          [value][unit]
                          <br/>Example: 4.7k (4.7kΩ), 100n (100nF)
                          {meta?.parameters && <><br/><br/>Guide:<br/>{meta.parameters}</>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Delete Button */}
                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={() => {
                      deleteComponent(activeComponent.id);
                      setIsConfigOpen(false);
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff5f5'; }}
                  >
                    <Trash2 size={16} />
                    Delete Component
                  </button>
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
