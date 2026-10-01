import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { 
  IconProbeVoltage, IconProbeCurrent,
  IconGround, IconConnector, IconJunction,
  IconACVoltage, IconDCVoltage, IconPulseVoltage, IconACCurrent, IconDCCurrent,
  IconResistor, IconLoad, IconCapacitor, IconInductor, IconOpamp, IconOpamp3T, IconOpamp5T, IconComparator, IconTimer555, IconDiode, IconDiodeZener, IconDiodeLED, IconBridgeRectifier, IconThyristor, IconOptocoupler, IconTransistor, IconTransistorNPN, IconTransistorPNP, IconMosfetN, IconMosfetP, IconJFET, IconIGBT, IconSwitch,
  IconPotentiometer, IconFuse, IconTransformers, IconTransformer1P1S, IconTransformer1P1S_CT, IconTransformer1P2S, IconTransformer2P1S, IconTransformer2P2S, IconCoupledInductors, 
  IconLossyTransmissionLine, IconLosslessTransmissionLine, IconResistorsPack,
  IconLogicGate, IconGateAND, IconGateOR, IconGateNOT, IconGateNAND, IconGateNOR, IconGateXOR, IconGateXNOR, IconGateBuffer,
  IconVoltageRegulator, IconBuckConverter, Icon7Segment, IconCrystal, IconPhotodiode, IconPhototransistor,
  IconDIP14, Icon74HC595, IconTriac, IconDiac, IconDarlington, IconCurrentMirror,
  IconDFlipFlop, IconJKFlipFlop, IconSRFlipFlop, IconTFlipFlop, IconLamp,
  IconOpampLM358, IconOpampTL071, IconSchmittTrigger, IconVCSwitch, IconVCCS, IconVCVS, IconCCVS, IconCCCS, IconInstAmp,
  IconVoltmeter, IconAmmeter, IconWattmeter,
  IconThermistor, IconLDR, IconVaristor, IconVaractor, IconTVSDiode
} from './icons/MultisimIcons';

export interface ComponentPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (type: string, value: string) => void;
  isEmbed: boolean;
}

const TAB_CATEGORIES: Record<string, string[]> = {
  Basic: ['Passive', 'Diodes', 'Switches', 'Misc'],
  Analog: ['Transistors', 'Op-Amps', 'Power'],
  Digital: ['Logic Gates', 'Timers & Counters', 'Flip-Flops', 'Memory'],
  Sources: ['Voltage Sources', 'Current Sources', 'Signal Generators'],
  Instruments: ['Probes & Meters'],
};

const TABS = ['Basic', 'Analog', 'Digital', 'Sources', 'Instruments'] as const;
type TabType = typeof TABS[number];

const ALL_COMPONENTS = [
  { tab: 'Basic', category: 'Passive', type: 'Resistor', value: '1k', label: 'Resistor' },
  { tab: 'Basic', category: 'Passive', type: 'Load', value: '1k', label: 'Load' },
  { tab: 'Basic', category: 'Passive', type: 'Capacitor', value: '1µF', label: 'Capacitor' },
  { tab: 'Basic', category: 'Passive', type: 'Inductor', value: '1mH', label: 'Inductor' },
  { tab: 'Basic', category: 'Passive', type: 'Potentiometer', value: '10k', label: 'Potentiometer' },
  { tab: 'Basic', category: 'Passive', type: 'Fuse', value: '', label: 'Fuse' },
  { tab: 'Basic', category: 'Passive', type: 'CoupledInductors', value: '', label: 'Coupled Inductors' },
  { tab: 'Basic', category: 'Passive', type: 'LossyTransmissionLine', value: '', label: 'Lossy Trans. Line' },
  { tab: 'Basic', category: 'Passive', type: 'LosslessTransmissionLine', value: '', label: 'Lossless Trans. Line' },
  { tab: 'Basic', category: 'Passive', type: 'Resistors', value: '', label: 'Resistors Pack' },
  { tab: 'Basic', category: 'Passive', type: 'Transformer1P1S', value: '', label: '1P1S' },
  { tab: 'Basic', category: 'Passive', type: 'Transformer1P1S_CT', value: '', label: '1P1S CT' },
  { tab: 'Basic', category: 'Passive', type: 'Transformer1P2S', value: '', label: '1P2S' },
  { tab: 'Basic', category: 'Passive', type: 'Transformer2P1S', value: '', label: '2P1S' },
  { tab: 'Basic', category: 'Passive', type: 'Transformer2P2S', value: '', label: '2P2S' },
  { tab: 'Basic', category: 'Passive', type: 'Thermistor', value: '10k', label: 'Thermistor NTC' },
  { tab: 'Basic', category: 'Passive', type: 'LDR', value: '1k', label: 'LDR' },
  { tab: 'Basic', category: 'Passive', type: 'Varistor', value: '100k', label: 'Varistor' },

  { tab: 'Basic', category: 'Diodes', type: 'Diode', value: '1N4148', label: 'Diode' },
  { tab: 'Basic', category: 'Diodes', type: 'DiodeZener', value: '1N4728A', label: 'Zener' },
  { tab: 'Basic', category: 'Diodes', type: 'DiodeSchottky', value: 'BAT54', label: 'Schottky' },
  { tab: 'Basic', category: 'Diodes', type: 'LED', value: '', label: 'LED' },
  { tab: 'Basic', category: 'Diodes', type: 'Photodiode', value: '', label: 'Photodiode' },
  { tab: 'Basic', category: 'Diodes', type: 'VaractorDiode', value: '10p', label: 'Varactor' },
  { tab: 'Basic', category: 'Diodes', type: 'TVSDiode', value: 'P6KE33A', label: 'TVS Diode' },

  { tab: 'Basic', category: 'Switches', type: 'SwitchSPST', value: 'SW1', label: 'SPST Switch' },
  { tab: 'Basic', category: 'Switches', type: 'SPDTSwitch', value: '', label: 'SPDT Switch' },
  { tab: 'Basic', category: 'Switches', type: 'DigitalSwitch', value: '0', label: 'Digital Switch' },
  { tab: 'Basic', category: 'Switches', type: 'PushButton', value: '', label: 'Push Button' },
  { tab: 'Basic', category: 'Switches', type: 'Relay', value: '', label: 'Relay' },

  { tab: 'Basic', category: 'Misc', type: 'Ground', value: '0', label: 'Ground' },
  { tab: 'Basic', category: 'Misc', type: 'Connector', value: '', label: 'Connector' },
  { tab: 'Basic', category: 'Misc', type: 'Junction', value: '', label: 'Junction' },
  { tab: 'Basic', category: 'Misc', type: 'CrystalOscillator', value: '16MHz', label: 'Crystal Osc' },
  { tab: 'Basic', category: 'Misc', type: 'Lamp', value: '', label: 'Lamp' },

  { tab: 'Analog', category: 'Transistors', type: 'TransistorNPN', value: '2N3904', label: 'NPN Transistor' },
  { tab: 'Analog', category: 'Transistors', type: 'TransistorPNP', value: '2N3906', label: 'PNP Transistor' },
  { tab: 'Analog', category: 'Transistors', type: 'MosfetN', value: '2N7000', label: 'NMOS' },
  { tab: 'Analog', category: 'Transistors', type: 'MosfetP', value: 'BSS84', label: 'PMOS' },
  { tab: 'Analog', category: 'Transistors', type: 'JFET', value: 'J201', label: 'JFET N' },
  { tab: 'Analog', category: 'Transistors', type: 'IGBT', value: 'FGA25N120', label: 'IGBT' },
  { tab: 'Analog', category: 'Transistors', type: 'Phototransistor', value: '', label: 'Phototransistor' },
  { tab: 'Analog', category: 'Transistors', type: 'Darlington', value: '', label: 'Darlington Pair' },

  { tab: 'Analog', category: 'Op-Amps', type: 'Opamp', value: 'LM324', label: 'Ideal Op-Amp' },
  { tab: 'Analog', category: 'Op-Amps', type: 'Opamp5', value: 'LM741', label: 'LM741' },
  { tab: 'Analog', category: 'Op-Amps', type: 'OpampLM358', value: 'LM358', label: 'LM358' },
  { tab: 'Analog', category: 'Op-Amps', type: 'OpampTL071', value: 'TL071', label: 'TL071' },
  { tab: 'Analog', category: 'Op-Amps', type: 'Comparator', value: 'LM311', label: 'Comparator' },
  { tab: 'Analog', category: 'Op-Amps', type: 'SchmittTrigger', value: '3.3/1.7', label: 'Schmitt Trigger' },
  { tab: 'Analog', category: 'Op-Amps', type: 'VCSwitch', value: '2.5', label: 'VC Switch' },
  { tab: 'Analog', category: 'Op-Amps', type: 'VCCS', value: '0.001', label: 'VCCS' },
  { tab: 'Analog', category: 'Op-Amps', type: 'VCVS', value: '10', label: 'VCVS' },
  { tab: 'Analog', category: 'Op-Amps', type: 'CCCS', value: '10', label: 'CCCS' },
  { tab: 'Analog', category: 'Op-Amps', type: 'CCVS', value: '1000', label: 'CCVS' },
  { tab: 'Analog', category: 'Op-Amps', type: 'InstAmp', value: '100', label: 'Inst. Amp' },

  { tab: 'Analog', category: 'Power', type: 'BridgeRectifier', value: '', label: 'Bridge Rectifier' },
  { tab: 'Analog', category: 'Power', type: 'ThyristorSCR', value: '2N5060', label: 'SCR' },
  { tab: 'Analog', category: 'Power', type: 'TRIAC', value: '', label: 'TRIAC' },
  { tab: 'Analog', category: 'Power', type: 'DIAC', value: '', label: 'DIAC' },
  { tab: 'Analog', category: 'Power', type: 'Optocoupler', value: 'PC817', label: 'Optocoupler' },
  { tab: 'Analog', category: 'Power', type: 'VoltageRegulator7805', value: '', label: '7805 Regulator' },
  { tab: 'Analog', category: 'Power', type: 'VoltageRegulator7809', value: '', label: '7809 Regulator' },
  { tab: 'Analog', category: 'Power', type: 'VoltageRegulator7812', value: '', label: '7812 Regulator' },
  { tab: 'Analog', category: 'Power', type: 'VoltageRegulatorLM317', value: '', label: 'LM317 Regulator' },
  { tab: 'Analog', category: 'Power', type: 'VoltageRegulatorAMS1117', value: '3.3V', label: 'AMS1117 LDO' },
  { tab: 'Analog', category: 'Power', type: 'BuckConverter', value: '0.5', label: 'Buck Converter' },
  { tab: 'Analog', category: 'Power', type: 'CurrentMirror', value: '', label: 'Current Mirror' },

  { tab: 'Digital', category: 'Logic Gates', type: 'GateAND', value: '', label: 'AND Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateOR', value: '', label: 'OR Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateNOT', value: '', label: 'NOT Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateNAND', value: '', label: 'NAND Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateNOR', value: '', label: 'NOR Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateXOR', value: '', label: 'XOR Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateXNOR', value: '', label: 'XNOR Gate' },
  { tab: 'Digital', category: 'Logic Gates', type: 'GateBuffer', value: '', label: 'Buffer' },
  { tab: 'Digital', category: 'Logic Gates', type: 'IC74HC04', value: '', label: '74HC04' },
  { tab: 'Digital', category: 'Logic Gates', type: 'IC74HC00', value: '', label: '74HC00' },
  { tab: 'Digital', category: 'Logic Gates', type: 'IC74HC86', value: '', label: '74HC86' },
  { tab: 'Digital', category: 'Logic Gates', type: 'IC74HC138', value: '', label: '74HC138' },
  { tab: 'Digital', category: 'Logic Gates', type: 'IC74HC164', value: '', label: '74HC164' },

  { tab: 'Digital', category: 'Timers & Counters', type: 'Timer555', value: 'NE555', label: '555 Timer' },
  { tab: 'Digital', category: 'Timers & Counters', type: 'IC74HC595', value: '', label: '74HC595' },

  { tab: 'Digital', category: 'Flip-Flops', type: 'DFlipFlop', value: '', label: 'D Flip-Flop' },
  { tab: 'Digital', category: 'Flip-Flops', type: 'JKFlipFlop', value: '', label: 'JK Flip-Flop' },
  { tab: 'Digital', category: 'Flip-Flops', type: 'SRFlipFlop', value: '', label: 'SR Flip-Flop' },
  { tab: 'Digital', category: 'Flip-Flops', type: 'TFlipFlop', value: '', label: 'T Flip-Flop' },

  { tab: 'Digital', category: 'Memory', type: 'DIP14', value: '', label: 'DIP-14 IC' },
  { tab: 'Digital', category: 'Memory', type: 'SevenSegment', value: '', label: '7-Segment' },

  { tab: 'Sources', category: 'Voltage Sources', type: 'ACSource', value: '1Vpk 1kHz', label: 'AC Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'DCSource', value: '5V', label: 'DC Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ClockVoltage', value: '5V', label: 'Clock Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'TriangularVoltage', value: '', label: 'Triangular' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'StepVoltage', value: '', label: 'Step Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'PulseVoltage', value: '5V', label: 'Pulse Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'AMVoltage', value: '', label: 'AM Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'FMVoltage', value: '', label: 'FM Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ChirpVoltage', value: '', label: 'Chirp Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ThermalNoise', value: '', label: 'Thermal Noise' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ArbitraryVoltageSource', value: '', label: 'Arb. Voltage' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ThreePhaseDelta', value: '', label: '3-Ph Delta' },
  { tab: 'Sources', category: 'Voltage Sources', type: 'ThreePhaseWye', value: '', label: '3-Ph Wye' },

  { tab: 'Sources', category: 'Current Sources', type: 'ACCurrent', value: '1A', label: 'AC Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'DCCurrent', value: '1A', label: 'DC Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'ClockCurrent', value: '', label: 'Clock Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'TriangularCurrent', value: '', label: 'Triang. Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'StepCurrent', value: '', label: 'Step Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'PulseCurrent', value: '', label: 'Pulse Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'FMCurrent', value: '', label: 'FM Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'ChirpCurrent', value: '', label: 'Chirp Current' },
  { tab: 'Sources', category: 'Current Sources', type: 'ArbitraryCurrentSource', value: '', label: 'Arb. Current' },

  { tab: 'Instruments', category: 'Probes & Meters', type: 'ProbeVoltage', value: '', label: 'Voltage Probe' },
  { tab: 'Instruments', category: 'Probes & Meters', type: 'ProbeCurrent', value: '', label: 'Current Probe' },
  { tab: 'Instruments', category: 'Probes & Meters', type: 'Voltmeter', value: '', label: 'Voltmeter' },
  { tab: 'Instruments', category: 'Probes & Meters', type: 'Ammeter', value: '', label: 'Ammeter' },
  { tab: 'Instruments', category: 'Probes & Meters', type: 'Wattmeter', value: '', label: 'Wattmeter' },
  { tab: 'Instruments', category: 'Probes & Meters', type: 'TextAnnotation', value: 'Text', label: 'Text Ann.' },
];

const renderIcon = (type: string, sizeOverride?: { width?: number; height?: number; size?: number }) => {
  const props = { size: sizeOverride?.size ?? sizeOverride?.width ?? 28, color: '#374151', width: sizeOverride?.width, height: sizeOverride?.height };
  switch(type) {
    case 'Ground': return <IconGround {...props} />;
    case 'ACSource': return <IconACVoltage {...props} />;
    case 'DCSource': return <IconDCVoltage {...props} />;
    case 'ACCurrent': return <IconACCurrent {...props} />;
    case 'DCCurrent': return <IconDCCurrent {...props} />;
    case 'PulseVoltage': 
    case 'ClockVoltage':
    case 'StepVoltage':
    case 'ChirpVoltage': return <IconPulseVoltage {...props} />;
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
    case 'ProbeVoltage': return <IconProbeVoltage {...props} />;
    case 'ProbeCurrent': return <IconProbeCurrent {...props} />;
    case 'Voltmeter': return <IconVoltmeter {...props} />;
    case 'Ammeter': return <IconAmmeter {...props} />;
    case 'Wattmeter': return <IconWattmeter {...props} />;
    case 'Connector': return <IconConnector {...props} />;
    case 'Junction': return <IconJunction {...props} />;
    case 'Load': return <IconLoad {...props} />;
    case 'Opamp3T': return <IconOpamp3T {...props} />;
    case 'Opamp5T': return <IconOpamp5T {...props} />;
    case 'Comparator': return <IconComparator {...props} />;
    case 'LED': return <IconDiodeLED {...props} />;
    case 'ThyristorSCR': return <IconThyristor {...props} />;
    case 'Optocoupler': return <IconOptocoupler {...props} />;
    case 'Transistor': return <IconTransistor {...props} />;
    case 'JFET': return <IconJFET {...props} />;
    case 'IGBT': return <IconIGBT {...props} />;
    case 'SwitchSPST': 
    case 'SPDTSwitch': 
    case 'DigitalSwitch':
    case 'PushButton':
    case 'Relay': return <IconSwitch {...props} />;
    case 'Fuse': return <IconFuse {...props} />;
    case 'Transformer1P1S': return <IconTransformer1P1S {...props} />;
    case 'Transformer1P1S_CT': return <IconTransformer1P1S_CT {...props} />;
    case 'Transformer1P2S': return <IconTransformer1P2S {...props} />;
    case 'Transformer2P1S': return <IconTransformer2P1S {...props} />;
    case 'Transformer2P2S': return <IconTransformer2P2S {...props} />;
    case 'CoupledInductors': return <IconCoupledInductors {...props} />;
    case 'LossyTransmissionLine': return <IconLossyTransmissionLine {...props} />;
    case 'LosslessTransmissionLine': return <IconLosslessTransmissionLine {...props} />;
    case 'Resistors': return <IconResistorsPack {...props} />;
    case 'GateNAND': return <IconGateNAND {...props} />;
    case 'GateNOR': return <IconGateNOR {...props} />;
    case 'GateXOR': return <IconGateXOR {...props} />;
    case 'GateXNOR': return <IconGateXNOR {...props} />;
    case 'GateBuffer': return <IconGateBuffer {...props} />;
    case 'SRFlipFlop': return <IconSRFlipFlop {...props} />;
    case 'TFlipFlop': return <IconTFlipFlop {...props} />;
    case 'IC74HC595': return <Icon74HC595 {...props} />;
    case 'VoltageRegulator7805': 
    case 'VoltageRegulator7809':
    case 'VoltageRegulator7812': 
    case 'VoltageRegulatorLM317': 
    case 'VoltageRegulatorAMS1117': return <IconVoltageRegulator {...props} />;
    case 'BuckConverter': return <IconBuckConverter {...props} />;
    case 'SevenSegment': return <Icon7Segment {...props} />;
    case 'CrystalOscillator': return <IconCrystal {...props} />;
    case 'Photodiode': return <IconPhotodiode {...props} />;
    case 'Phototransistor': return <IconPhototransistor {...props} />;
    case 'DIP14': return <IconDIP14 {...props} />;
    case 'TRIAC': return <IconTriac {...props} />;
    case 'DIAC': return <IconDiac {...props} />;
    case 'Darlington': return <IconDarlington {...props} />;
    case 'CurrentMirror': return <IconCurrentMirror {...props} />;
    case 'OpampLM358': return <IconOpampLM358 {...props} />;
    case 'OpampTL071': return <IconOpampTL071 {...props} />;
    case 'SchmittTrigger': return <IconSchmittTrigger {...props} />;
    case 'VCSwitch': return <IconVCSwitch {...props} />;
    case 'VCCS': return <IconVCCS {...props} />;
    case 'VCVS': return <IconVCVS {...props} />;
    case 'CCVS': return <IconCCVS {...props} />;
    case 'CCCS': return <IconCCCS {...props} />;
    case 'InstAmp': return <IconInstAmp {...props} />;
    case 'Thermistor': return <IconThermistor {...props} />;
    case 'LDR': return <IconLDR {...props} />;
    case 'Varistor': return <IconVaristor {...props} />;
    case 'VaractorDiode': return <IconVaractor {...props} />;
    case 'TVSDiode': return <IconTVSDiode {...props} />;
    case 'TextAnnotation': return <span style={{ fontWeight: 'bold', fontSize: 16 }}>Abc</span>;
    default: return <IconResistor {...props} />; 
  }
};

export function ComponentPalette({ isOpen, onToggle, onSelect, isEmbed }: ComponentPaletteProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: string, value: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, value }));
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.setData('componentValue', value);
  };

  const handleSelectComponent = (type: string, value: string) => {
    onSelect(type, value);
  };

  const cleanQuery = searchQuery.trim().toLowerCase();
  
  // If searching, show all matches. Otherwise, show by active tab.
  let displaySections: { category: string, components: typeof ALL_COMPONENTS }[] = [];

  if (cleanQuery) {
    const matches = ALL_COMPONENTS.filter(c => 
      c.label.toLowerCase().includes(cleanQuery) || 
      c.type.toLowerCase().includes(cleanQuery)
    );
    const grouped: Record<string, typeof ALL_COMPONENTS> = {};
    matches.forEach(c => {
      const key = `${c.tab} > ${c.category}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
    displaySections = Object.keys(grouped).map(k => ({ category: k, components: grouped[k] }));
  } else {
    // Show sections for active tab
    const categories = TAB_CATEGORIES[activeTab] || [];
    displaySections = categories.map(cat => ({
      category: cat,
      components: ALL_COMPONENTS.filter(c => c.tab === activeTab && c.category === cat)
    })).filter(section => section.components.length > 0);
  }

  return (
    <div 
      className="component-palette" 
      style={{ 
        width: '220px', 
        height: '100%', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e5e7eb', 
        display: 'flex', 
        flexDirection: 'column', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        flexShrink: 0,
        overflowX: 'hidden',
      }}
    >
      <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 12 }}>
          Component Library
        </div>
        
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            style={{
              width: '100%',
              height: '32px',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '0 8px 0 30px',
              outline: 'none',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {!cleanQuery && (
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }} className="custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab ? '#10b981' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#64748b',
                  transition: 'all 0.15s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
        {displaySections.map(section => {
          const collapsed = collapsedSections[section.category];
          return (
            <div key={section.category} style={{ marginBottom: 16 }}>
              <div
                onClick={() => toggleSection(section.category)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  padding: '6px 0', 
                  cursor: 'pointer', 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.06em',
                  userSelect: 'none'
                }}
              >
                <ChevronRight 
                  size={12} 
                  style={{ 
                    transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', 
                    transition: '0.15s' 
                  }} 
                />
                {section.category}
              </div>
              
              {!collapsed && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  padding: '4px 0',
                }}>
                  {section.components.map(comp => (
                    <div
                      key={comp.type + comp.label}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp.type, comp.value)}
                      onClick={() => handleSelectComponent(comp.type, comp.value)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleSelectComponent(comp.type, comp.value);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '10px 4px 8px',
                        borderRadius: 8,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: 11,
                        textAlign: 'center',
                        userSelect: 'none',
                        transition: 'all 0.15s',
                        minHeight: '78px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#ecfdf5';
                        e.currentTarget.style.borderColor = '#34d399';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(52,211,153,0.15)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={comp.label}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                        {renderIcon(comp.type, { width: 32, height: 32 })}
                      </span>
                      <span style={{ color: '#374151', lineHeight: 1.2, fontSize: 10.5, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {comp.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {cleanQuery && displaySections.length === 0 && (
          <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            No components found
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
