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

    // Simple single-value component — add normalize-on-blur, validation, and display hint
    const isSimpleType = !!COMPONENT_UNITS[activeComponent.type];
    const displayHint = isSimpleType && fields.main
      ? componentDisplayValue(fields.main, activeComponent.type)
      : null;
    const showHint = displayHint && displayHint !== fields.main;
    
    const units = UNIT_OPTIONS[activeComponent.type];

    return (
      <div className="flex flex-col gap-1 mb-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Settings size={12} className="text-blue-500" />
          Value / Parameter
        </label>
        <div className="flex gap-2">
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
            className={`w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 transition-colors shadow-sm ${
              valueError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-400'
            }`}
          />
          {units && (
            <select
              className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
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
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Tolerance</label>
              <select 
                 value={activeComponent.metadata?.tolerance || '±5%'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, tolerance: e.target.value } })}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                {['±1%', '±5%', '±10%', '±20%'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Power Rating</label>
              <select 
                 value={activeComponent.metadata?.powerRating || '0.25W'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, powerRating: e.target.value } })}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                {['0.125W', '0.25W', '0.5W', '1W', '2W'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}
        
        {activeComponent.type === 'Capacitor' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Tolerance</label>
              <select 
                 value={activeComponent.metadata?.tolerance || '±20%'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, tolerance: e.target.value } })}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                {['±5%', '±10%', '±20%'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Voltage Rating</label>
              <input 
                 type="text"
                 value={activeComponent.metadata?.voltageRating || '50V'} 
                 onChange={e => updateComponentProperties(activeComponent.id, { metadata: { ...activeComponent.metadata, voltageRating: e.target.value } })}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" />
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
              <div className="flex items-start gap-4 p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 m-0">
                    {meta?.title || activeComponent.type}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 mb-0 leading-relaxed">
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    Label
                  </label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm font-mono text-gray-700">
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
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setShowVisual(!showVisual)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 w-full text-left focus:outline-none"
                  >
                    {showVisual ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    Visual
                  </button>
                  {showVisual && (
                    <div className="mt-3 flex flex-col gap-3 pl-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Show Label</span>
                        <input type="checkbox" checked={localVisual.showLabel} onChange={e => setLocalVisual({...localVisual, showLabel: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Label Position</span>
                        <select value={localVisual.labelPosition} onChange={e => setLocalVisual({...localVisual, labelPosition: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                          <option>Top</option>
                          <option>Bottom</option>
                          <option>Left</option>
                          <option>Right</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Color</span>
                        <select value={localVisual.color} onChange={e => setLocalVisual({...localVisual, color: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs bg-white">
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
                <div className="mt-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 w-full text-left focus:outline-none"
                  >
                    {showAdvanced ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    Advanced
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 pl-6">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <strong className="block text-xs font-bold text-gray-500 uppercase mb-1">SPICE Format Hint</strong>
                        <div className="text-xs text-gray-600 font-mono whitespace-pre-line leading-relaxed">
                          [value][unit]
                          <br/>Example: 4.7k (4.7kΩ), 100n (100nF)
                          {meta?.parameters && <><br/><br/>Guide:<br/>{meta.parameters}</>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Delete Button */}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      deleteComponent(activeComponent.id);
                      setIsConfigOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-lg transition-colors border border-red-200"
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
