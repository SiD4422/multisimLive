import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { 
  IconProbeVoltage, IconProbeCurrent,
  IconGround, IconConnector, IconJunction,
  IconACVoltage, IconDCVoltage, IconPulseVoltage, IconACCurrent, IconDCCurrent,
  IconResistor, IconLoad, IconCapacitor, IconInductor, IconOpamp, IconOpamp3T, IconOpamp5T, IconComparator, IconTimer555, IconDiode, IconDiodeZener, IconDiodeLED, IconBridgeRectifier, IconThyristor, IconOptocoupler, IconTransistor, IconTransistorNPN, IconTransistorPNP, IconMosfetN, IconMosfetP, IconJFET, IconIGBT, IconSwitch,
  IconPotentiometer, IconFuse, IconTransformers, IconTransformer1P1S, IconTransformer1P1S_CT, IconTransformer1P2S, IconTransformer2P1S, IconTransformer2P2S, IconCoupledInductors, 
  IconLossyTransmissionLine, IconLosslessTransmissionLine, IconResistorsPack,
  IconLogicGate, IconGateAND, IconGateOR, IconGateNOT, IconGateNAND, IconGateNOR, IconGateXOR,
  IconVoltageRegulator, Icon7Segment, IconCrystal, IconPhotodiode, IconPhototransistor,
  IconDIP14, IconTriac, IconDiac, IconDarlington, IconCurrentMirror,
  IconDFlipFlop, IconJKFlipFlop, IconLamp,
  IconOpampLM358, IconOpampTL071, IconSchmittTrigger, IconVCSwitch, IconVCCS, IconInstAmp
} from './icons/MultisimIcons';

export interface ComponentPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (type: string, value: string) => void;
  isEmbed: boolean;
}

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
    { label: 'Opamp', type: 'Opamp', value: 'LM324' },
    { label: '5-Terminal Opamp', type: 'Opamp5', value: 'LM741' },
    { label: 'LM358 Op-Amp', type: 'OpampLM358', value: 'LM358' },
    { label: 'TL071 Op-Amp', type: 'OpampTL071', value: 'TL071' },
    { label: 'Schmitt Trigger', type: 'SchmittTrigger', value: '3.3/1.7' },
    { label: 'Voltage-Controlled Switch', type: 'VCSwitch', value: '2.5' },
    { label: 'VCCS', type: 'VCCS', value: '0.001' },
    { label: 'Instrumentation Amp', type: 'InstAmp', value: '100' },
    { label: 'Comparator', type: 'Comparator', value: 'LM311' },
    { label: '555 Timer', type: 'Timer555', value: 'NE555' },
    { label: 'SPST Switch', type: 'SwitchSPST', value: 'SW1' },
    { label: 'SPDT Switch', type: 'SPDTSwitch', value: '' },
    { label: 'Push Button', type: 'PushButton', value: '' },
    { label: 'Relay', type: 'Relay', value: '' },
    { label: 'Digital Switch', type: 'DigitalSwitch', value: '0' },
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
    { label: 'D Flip-Flop', type: 'DFlipFlop', value: '' },
    { label: 'JK Flip-Flop', type: 'JKFlipFlop', value: '' },
    { label: '7-Segment Display', type: 'SevenSegment', value: '' },
    { label: 'Indicator Lamp', type: 'Lamp', value: '' },
    { label: 'Crystal Oscillator', type: 'CrystalOscillator', value: '16MHz' },
    { label: 'Voltage Probe', type: 'ProbeVoltage', value: '' },
    { label: 'Current Probe', type: 'ProbeCurrent', value: '' },
    { label: 'Digital Probe', type: 'ProbeDigital', value: '' },
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
    case 'DFlipFlop': return <IconDFlipFlop {...props} />;
    case 'JKFlipFlop': return <IconJKFlipFlop {...props} />;
    case 'Lamp': return <IconLamp {...props} />;
    case 'Potentiometer': return <IconPotentiometer {...props} />;
    case 'BridgeRectifier': return <IconBridgeRectifier {...props} />;
    default: return <IconResistor {...props} />; // Fallback icon
  }
};

export function ComponentPalette({ isOpen, onToggle, onSelect, isEmbed }: ComponentPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [arrowTop, setArrowTop] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchResults = cleanQuery.length > 0
    ? ALL_COMPONENTS.filter(c => 
        c.label.toLowerCase().includes(cleanQuery) || 
        c.type.toLowerCase().includes(cleanQuery)
      )
    : [];

  const handleSelectComponent = (type: string, value: string) => {
    onSelect(type, value);
    setActiveCategory(null);
  };

  return (
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
                    onClick={() => { handleSelectComponent(item.type, item.value); setSearchQuery(''); }}
                    onTouchStart={(e) => { e.preventDefault(); handleSelectComponent(item.type, item.value); setSearchQuery(''); }}
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
                <div className="flyout-item" onClick={() => handleSelectComponent('ProbeVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ProbeVoltage', ''); }}><IconProbeVoltage size={28} /><span>Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ProbeCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ProbeCurrent', ''); }}><IconProbeCurrent size={28} /><span>Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('TextAnnotation', 'Text')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TextAnnotation', 'Text'); }}><span className="text-blue-500 font-bold mt-1 text-2xl">Abc</span><span className="text-gray-700 mt-2">Text Annotation</span></div>
              </div>
            </>
          )}

          {activeCategory === 'connectors' && (
            <>
              <div className="flyout-header">Schematic connectors</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('Ground', '0')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Ground', '0'); }}><IconGround size={28} /><span>Ground</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Connector', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Connector', ''); }}><IconConnector size={28} /><span>Connector</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Junction', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Junction', ''); }}><IconJunction size={28} /><span>Junction</span></div>
              </div>
            </>
          )}

          {activeCategory === 'sources' && (
            <>
              <div className="flyout-header">Sources</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('ACSource', '1Vpk 1kHz')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ACSource', '1Vpk 1kHz'); }}><IconACVoltage size={28} /><span>AC Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ACCurrent', '1A')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ACCurrent', '1A'); }}><IconACCurrent size={28} /><span>AC Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ClockVoltage', '5V')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ClockVoltage', '5V'); }}><IconPulseVoltage size={28} /><span>Clock Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ClockCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ClockCurrent', ''); }}><IconPulseVoltage size={28} /><span>Clock Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('TriangularVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TriangularVoltage', ''); }}><IconACVoltage size={28} /><span>Triangular Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('TriangularCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TriangularCurrent', ''); }}><IconACCurrent size={28} /><span>Triangular Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DCSource', '5V')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DCSource', '5V'); }}><IconDCVoltage size={28} /><span>DC Voltage (VCC)</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DCCurrent', '1A')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DCCurrent', '1A'); }}><IconDCCurrent size={28} /><span>DC Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('StepVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('StepVoltage', ''); }}><IconPulseVoltage size={28} /><span>Step Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('StepCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('StepCurrent', ''); }}><IconPulseVoltage size={28} /><span>Step Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('PulseVoltage', '5V')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('PulseVoltage', '5V'); }}><IconPulseVoltage size={28} /><span>Pulse Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('PulseCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('PulseCurrent', ''); }}><IconPulseVoltage size={28} /><span>Pulse Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('AMVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('AMVoltage', ''); }}><IconACVoltage size={28} /><span>AM Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('FMVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('FMVoltage', ''); }}><IconACVoltage size={28} /><span>FM Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('FMCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('FMCurrent', ''); }}><IconACCurrent size={28} /><span>FM Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ChirpVoltage', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ChirpVoltage', ''); }}><IconPulseVoltage size={28} /><span>Chirp Voltage</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ChirpCurrent', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ChirpCurrent', ''); }}><IconPulseVoltage size={28} /><span>Chirp Current</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ThermalNoise', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ThermalNoise', ''); }}><IconACVoltage size={28} /><span>Thermal Noise</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryVoltageSource', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ArbitraryVoltageSource', ''); }}><IconACVoltage size={28} /><span>Arbitrary Voltage Source</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryCurrentSource', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ArbitraryCurrentSource', ''); }}><IconACCurrent size={28} /><span>Arbitrary Current Source</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseDelta', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ThreePhaseDelta', ''); }}><IconACVoltage size={28} /><span>Three Phase Delta</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseWye', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ThreePhaseWye', ''); }}><IconACVoltage size={28} /><span>Three Phase Wye</span></div>
                <div className="flyout-item disabled"><Search size={28} color="#6b7280" /><span>More</span></div>
              </div>
            </>
          )}

          {activeCategory === 'passives' && (
            <>
              <div className="flyout-header">Passive</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('Resistor', '1k')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Resistor', '1k'); }}><IconResistor size={28} /><span>Resistor</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Load', '1k')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Load', '1k'); }}><IconLoad size={28} /><span>Load</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Capacitor', '1µF')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Capacitor', '1µF'); }}><IconCapacitor size={28} /><span>Capacitor</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Inductor', '1mH')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Inductor', '1mH'); }}><IconInductor size={28} /><span>Inductor</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Potentiometer', '10k')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Potentiometer', '10k'); }}><IconPotentiometer size={28} /><span>Potentiometer</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Fuse', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Fuse', ''); }}><IconFuse size={28} /><span>Fuse</span></div>
                <div className="flyout-item" onClick={() => setActiveCategory('transformers')}><IconTransformers size={28} /><span>Transformers...</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('CoupledInductors', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('CoupledInductors', ''); }}><IconCoupledInductors size={28} /><span>Coupled Inductors</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('LossyTransmissionLine', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('LossyTransmissionLine', ''); }}><IconLossyTransmissionLine size={28} /><span>Lossy Transmission Line</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('LosslessTransmissionLine', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('LosslessTransmissionLine', ''); }}><IconLosslessTransmissionLine size={28} /><span>Lossless Transmission Line</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Resistors', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Resistors', ''); }}><IconResistorsPack size={28} /><span>Resistors...</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('CrystalOscillator', '16MHz')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('CrystalOscillator', '16MHz'); }}><IconCrystal size={28} /><span>Crystal Oscillator</span></div>
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
                <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P1S', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Transformer1P1S', ''); }}><IconTransformer1P1S size={28} /><span>1P1S</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P1S_CT', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Transformer1P1S_CT', ''); }}><IconTransformer1P1S_CT size={28} /><span>1P1S with Center Tap</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Transformer1P2S', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Transformer1P2S', ''); }}><IconTransformer1P2S size={28} /><span>1P2S</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Transformer2P1S', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Transformer2P1S', ''); }}><IconTransformer2P1S size={28} /><span>2P1S</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Transformer2P2S', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Transformer2P2S', ''); }}><IconTransformer2P2S size={28} /><span>2P2S</span></div>
              </div>
            </>
          )}

          {activeCategory === 'analog' && (
            <>
              <div className="flyout-header">Analog ICs</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('Opamp', 'LM324')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Opamp', 'LM324'); }}><IconOpamp3T size={28} /><span>Ideal Op-Amp</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Opamp5', 'LM741')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Opamp5', 'LM741'); }}><IconOpamp5T size={28} /><span>LM741</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('OpampLM358', 'LM358')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('OpampLM358', 'LM358'); }}><IconOpampLM358 size={28} /><span>LM358</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('OpampTL071', 'TL071')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('OpampTL071', 'TL071'); }}><IconOpampTL071 size={28} /><span>TL071</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Comparator', 'LM311')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Comparator', 'LM311'); }}><IconComparator size={28} /><span>Comparator</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('SchmittTrigger', '3.3/1.7')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('SchmittTrigger', '3.3/1.7'); }}><IconSchmittTrigger size={28} /><span>Schmitt Trigger</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('VCSwitch', '2.5')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('VCSwitch', '2.5'); }}><IconVCSwitch size={28} /><span>VC Switch</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('VCCS', '0.001')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('VCCS', '0.001'); }}><IconVCCS size={28} /><span>VCCS</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('InstAmp', '100')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('InstAmp', '100'); }}><IconInstAmp size={28} /><span>Inst. Amp</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Timer555', 'NE555')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Timer555', 'NE555'); }}><IconTimer555 size={28} /><span>555 Timer</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('CurrentMirror', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('CurrentMirror', ''); }}><IconCurrentMirror size={28} /><span>Current Mirror</span></div>
              </div>
            </>
          )}
          
          {activeCategory === 'diodes' && (
            <>
              <div className="flyout-header">Diodes</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('Diode', '1N4148')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Diode', '1N4148'); }}><IconDiode size={28} /><span>Diode</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DiodeZener', '1N4728A')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DiodeZener', '1N4728A'); }}><IconDiodeZener size={28} /><span>Zener</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DiodeSchottky', 'BAT54')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DiodeSchottky', 'BAT54'); }}><IconDiode size={28} /><span>Schottky</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('LED', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('LED', ''); }}><IconDiodeLED size={28} /><span>LED</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Photodiode', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Photodiode', ''); }}><IconPhotodiode size={28} /><span>Photodiode</span></div>
              </div>
            </>
          )}
          
          {activeCategory === 'transistors' && (
            <>
              <div className="flyout-header">Transistors</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('TransistorNPN', '2N3904')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TransistorNPN', '2N3904'); }}><IconTransistorNPN size={28} /><span>NPN</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('TransistorPNP', '2N3906')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TransistorPNP', '2N3906'); }}><IconTransistorPNP size={28} /><span>PNP</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('MosfetN', '2N7000')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('MosfetN', '2N7000'); }}><IconMosfetN size={28} /><span>NMOS</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('MosfetP', 'BSS84')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('MosfetP', 'BSS84'); }}><IconMosfetP size={28} /><span>PMOS</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('JFET', 'J201')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('JFET', 'J201'); }}><IconJFET size={28} /><span>JFET N</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('IGBT', 'FGA25N120')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('IGBT', 'FGA25N120'); }}><IconIGBT size={28} /><span>IGBT</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Phototransistor', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Phototransistor', ''); }}><IconPhototransistor size={28} /><span>Phototransistor</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Darlington', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Darlington', ''); }}><IconDarlington size={28} /><span>Darlington Pair</span></div>
              </div>
            </>
          )}
          
          {activeCategory === 'switches' && (
            <>
              <div className="flyout-header">Switches</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('SwitchSPST', 'SW1')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('SwitchSPST', 'SW1'); }}><IconSwitch size={28} /><span>SPST Switch</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('SPDTSwitch', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('SPDTSwitch', ''); }}><IconSwitch size={28} /><span>SPDT Switch</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DigitalSwitch', '0')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DigitalSwitch', '0'); }}><IconSwitch size={28} /><span>Digital Switch (0/1)</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('PushButton', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('PushButton', ''); }}><IconSwitch size={28} /><span>Push Button</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Relay', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Relay', ''); }}><IconSwitch size={28} /><span>Relay</span></div>
              </div>
            </>
          )}

          {activeCategory === 'power' && (
            <>
              <div className="flyout-header">Power & Opto</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('BridgeRectifier', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('BridgeRectifier', ''); }}><IconBridgeRectifier size={28} /><span>Bridge Rectifier</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('ThyristorSCR', '2N5060')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('ThyristorSCR', '2N5060'); }}><IconThyristor size={28} /><span>SCR (Thyristor)</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('TRIAC', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('TRIAC', ''); }}><IconTriac size={28} /><span>TRIAC</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DIAC', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DIAC', ''); }}><IconDiac size={28} /><span>DIAC</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Optocoupler', 'PC817')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Optocoupler', 'PC817'); }}><IconOptocoupler size={28} /><span>Optocoupler</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulator7805', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('VoltageRegulator7805', ''); }}><IconVoltageRegulator size={28} /><span>7805 Regulator</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulator7812', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('VoltageRegulator7812', ''); }}><IconVoltageRegulator size={28} /><span>7812 Regulator</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('VoltageRegulatorLM317', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('VoltageRegulatorLM317', ''); }}><IconVoltageRegulator size={28} /><span>LM317 Regulator</span></div>
              </div>
            </>
          )}

          {activeCategory === 'digital' && (
            <>
              <div className="flyout-header">Digital Logic Gates</div>
              <div className="flyout-grid">
                <div className="flyout-item" onClick={() => handleSelectComponent('GateAND', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateAND', ''); }}><IconGateAND size={28} /><span>AND</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('GateOR', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateOR', ''); }}><IconGateOR size={28} /><span>OR</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('GateNOT', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateNOT', ''); }}><IconGateNOT size={28} /><span>NOT</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('GateNAND', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateNAND', ''); }}><IconGateNAND size={28} /><span>NAND</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('GateNOR', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateNOR', ''); }}><IconGateNOR size={28} /><span>NOR</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('GateXOR', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('GateXOR', ''); }}><IconGateXOR size={28} /><span>XOR</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('IC74HC04', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('IC74HC04', ''); }}>
                  <span className="flyout-icon">🔲</span>
                  <div><div className="flyout-label">74HC04</div><div className="flyout-sub">Hex Inverter</div></div>
                </div>
                <div className="flyout-item" onClick={() => handleSelectComponent('IC74HC00', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('IC74HC00', ''); }}>
                  <span className="flyout-icon">🔲</span>
                  <div><div className="flyout-label">74HC00</div><div className="flyout-sub">Quad NAND</div></div>
                </div>
                <div className="flyout-item" onClick={() => handleSelectComponent('IC74HC86', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('IC74HC86', ''); }}>
                  <span className="flyout-icon">🔲</span>
                  <div><div className="flyout-label">74HC86</div><div className="flyout-sub">Quad XOR</div></div>
                </div>
                <div className="flyout-item" onClick={() => handleSelectComponent('IC74HC138', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('IC74HC138', ''); }}>
                  <span className="flyout-icon">🔲</span>
                  <div><div className="flyout-label">74HC138</div><div className="flyout-sub">3-to-8 Decoder</div></div>
                </div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DFlipFlop', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DFlipFlop', ''); }}><IconDFlipFlop size={28} /><span>D Flip-Flop</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('JKFlipFlop', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('JKFlipFlop', ''); }}><IconJKFlipFlop size={28} /><span>JK Flip-Flop</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('DIP14', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('DIP14', ''); }}><IconDIP14 size={28} /><span>DIP-14 IC</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('SevenSegment', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('SevenSegment', ''); }}><Icon7Segment size={28} /><span>7-Segment Display</span></div>
                <div className="flyout-item" onClick={() => handleSelectComponent('Lamp', '')} onTouchStart={(e) => { e.preventDefault(); handleSelectComponent('Lamp', ''); }}><IconLamp size={28} /><span>Indicator Lamp</span></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
