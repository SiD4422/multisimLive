import re

with open('src/components/ComponentInspectorPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
imports = '''import React, { useState, useEffect } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { X, Info, Zap, Settings, Activity, ActivitySquare, Timer, Waves, SlidersHorizontal, Trash2, ChevronDown, ChevronRight, Palette, Check } from 'lucide-react';
import { getComponentMetadata } from '../utils/ComponentDescriptions';
import { AnalysisSettings } from './AnalysisSettings';
import { componentDisplayValue, normalizeValue, validateValue, COMPONENT_UNITS } from '../utils/valueFormatter';
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
'''
content = re.sub(r'import React.*?\nimport.*?valueFormatter\';\n', imports, content, flags=re.DOTALL)

# 2. Main panel logic
main_panel_start = '''export const ComponentInspectorPanel: React.FC = () => {
  const { components, selectedComponentId, isConfigOpen, setIsConfigOpen, updateComponentProperties, deleteComponent } = useSchematicStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'simulation'>('properties');

  const [designator, setDesignator] = useState('');
  const [fields, setFields] = useState<any>({});
  const [valueError, setValueError] = useState<string | null>(null);

  const [showVisual, setShowVisual] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localVisual, setLocalVisual] = useState<any>({ showLabel: true, labelPosition: 'Top', color: 'Default' });
'''
content = re.sub(
    r'export const ComponentInspectorPanel: React.FC = \(\) => \{.*?(?=  const activeComponent =)', 
    main_panel_start, 
    content, 
    flags=re.DOTALL
)

# 3. Simple component render replacing
render_fields_code = '''
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
                  handleSave(); // Trigger save
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
'''
content = re.sub(
    r'const isSimpleType = !!COMPONENT_UNITS\[activeComponent\.type\];.*?return \(\n      <div className="flex flex-col gap-1 mb-3">.*?\);\n    \};\n' , 
    render_fields_code + '  };\n', 
    content, 
    flags=re.DOTALL
)

# 4. Component Header
header_code = '''
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
'''
content = re.sub(
    r'\{/\* Component Info \*/\}.*?<div style=\{\{ backgroundColor: \'#eff6ff\'.*?</div>\n                </div>\n              </div>',
    header_code,
    content,
    flags=re.DOTALL
)

# 5. Label
designator_code = '''
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    Label
                  </label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm font-mono text-gray-700">
                    {activeComponent.id}
                  </div>
                </div>
'''
content = re.sub(
    r'<div className="input-group" style=\{\{ marginBottom: \'12px\' \}\}>\n                  <label className="input-label">Designator / RefDes</label>.*?</div>',
    designator_code,
    content,
    flags=re.DOTALL
)

# 6. Visual, Advanced, Delete
sections_code = '''
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
                          Example: 4.7k (4.7kΩ), 100n (100nF)
                          {meta?.parameters && `\\n\\nGuide:\\n${meta.parameters}`}
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
              </div>
'''

content = re.sub(
    r'\{/\* SPICE Guide \*/\}.*?</div>\n              </div>',
    sections_code,
    content,
    flags=re.DOTALL
)

with open('src/components/ComponentInspectorPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
