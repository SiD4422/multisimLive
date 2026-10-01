import type { SchematicComponent, Wire } from '../store/useSchematicStore';

// Map NodeSim component types to KiCad reference designator prefixes and KiCad library parts
const KICAD_REF_MAP: Record<string, { prefix: string; lib: string; part: string; desc: string }> = {
  Resistor:               { prefix: 'R',  lib: 'Device', part: 'R',          desc: 'Resistor' },
  Capacitor:              { prefix: 'C',  lib: 'Device', part: 'C',          desc: 'Capacitor' },
  Inductor:               { prefix: 'L',  lib: 'Device', part: 'L',          desc: 'Inductor' },
  Diode:                  { prefix: 'D',  lib: 'Device', part: 'D',          desc: 'Diode' },
  DiodeZener:             { prefix: 'D',  lib: 'Device', part: 'D_Zener',    desc: 'Zener Diode' },
  DiodeSchottky:          { prefix: 'D',  lib: 'Device', part: 'D_Schottky', desc: 'Schottky Diode' },
  LED:                    { prefix: 'D',  lib: 'Device', part: 'LED',        desc: 'LED' },
  TVSDiode:               { prefix: 'D',  lib: 'Device', part: 'D_TVS',      desc: 'TVS Diode' },
  VaractorDiode:          { prefix: 'D',  lib: 'Device', part: 'D_Varactor', desc: 'Varactor Diode' },
  TransistorNPN:          { prefix: 'Q',  lib: 'Device', part: 'Q_NPN_BCE',  desc: 'NPN BJT' },
  TransistorPNP:          { prefix: 'Q',  lib: 'Device', part: 'Q_PNP_BCE',  desc: 'PNP BJT' },
  MosfetN:                { prefix: 'Q',  lib: 'Device', part: 'Q_NMOS_GSD', desc: 'NMOS MOSFET' },
  MosfetP:                { prefix: 'Q',  lib: 'Device', part: 'Q_PMOS_GSD', desc: 'PMOS MOSFET' },
  Opamp:                  { prefix: 'U',  lib: 'Device', part: 'Amplifier_Differential', desc: 'Op-Amp' },
  Opamp5:                 { prefix: 'U',  lib: 'Device', part: 'Amplifier_Differential', desc: 'Op-Amp' },
  DCSource:               { prefix: 'V',  lib: 'Device', part: 'Battery',    desc: 'DC Voltage Source' },
  ACSource:               { prefix: 'V',  lib: 'Device', part: 'AC',         desc: 'AC Voltage Source' },
  Ground:                 { prefix: 'PWR',lib: 'power',  part: 'GND',        desc: 'Ground' },
  Potentiometer:          { prefix: 'RV', lib: 'Device', part: 'R_Potentiometer', desc: 'Potentiometer' },
  Thermistor:             { prefix: 'R',  lib: 'Device', part: 'R_Thermistor_NTC', desc: 'NTC Thermistor' },
  Fuse:                   { prefix: 'F',  lib: 'Device', part: 'Fuse',       desc: 'Fuse' },
  Switch:                 { prefix: 'SW', lib: 'Device', part: 'SW_Push',    desc: 'Switch' },
  SwitchSPST:             { prefix: 'SW', lib: 'Device', part: 'SW_SPST',    desc: 'SPST Switch' },
  Relay:                  { prefix: 'K',  lib: 'Device', part: 'Relay_SPDT', desc: 'Relay' },
  Transformer1P1S:        { prefix: 'T',  lib: 'Device', part: 'Transformer', desc: 'Transformer' },
  VoltageRegulator7805:   { prefix: 'U',  lib: 'Regulator_Linear', part: 'L7805', desc: '5V Linear Regulator' },
  VoltageRegulator7809:   { prefix: 'U',  lib: 'Regulator_Linear', part: 'L7809', desc: '9V Linear Regulator' },
  VoltageRegulator7812:   { prefix: 'U',  lib: 'Regulator_Linear', part: 'L7812', desc: '12V Linear Regulator' },
  VoltageRegulatorAMS1117:{ prefix: 'U',  lib: 'Regulator_Linear', part: 'AMS1117-3.3', desc: '3.3V LDO' },
  VoltageRegulatorLM317:  { prefix: 'U',  lib: 'Regulator_Linear', part: 'LM317_TO-220', desc: 'Adj. Regulator' },
  Timer555:               { prefix: 'U',  lib: 'Timer', part: 'NE555', desc: '555 Timer' },
  GateAND:                { prefix: 'U',  lib: 'Device', part: '74LS08', desc: 'AND Gate' },
  GateOR:                 { prefix: 'U',  lib: 'Device', part: '74LS32', desc: 'OR Gate' },
  GateNOT:                { prefix: 'U',  lib: 'Device', part: '74LS04', desc: 'NOT Gate' },
  GateNAND:               { prefix: 'U',  lib: 'Device', part: '74LS00', desc: 'NAND Gate' },
  GateNOR:                { prefix: 'U',  lib: 'Device', part: '74LS02', desc: 'NOR Gate' },
  GateXOR:                { prefix: 'U',  lib: 'Device', part: '74LS86', desc: 'XOR Gate' },
  GateXNOR:               { prefix: 'U',  lib: 'Device', part: '74HC266', desc: 'XNOR Gate' },
  DFlipFlop:              { prefix: 'U',  lib: 'Device', part: '74HC74', desc: 'D Flip-Flop' },
  JKFlipFlop:             { prefix: 'U',  lib: 'Device', part: '74HC107', desc: 'JK Flip-Flop' },
  SRFlipFlop:             { prefix: 'U',  lib: 'Device', part: '74HC279', desc: 'SR Flip-Flop' },
  TFlipFlop:              { prefix: 'U',  lib: 'Device', part: '74HC74', desc: 'T Flip-Flop' },
  IC74HC595:              { prefix: 'U',  lib: 'Logic', part: '74HC595', desc: 'Shift Register' },
  Optocoupler:            { prefix: 'U',  lib: 'Isolator', part: 'PC817', desc: 'Optocoupler' },
  BridgeRectifier:        { prefix: 'D',  lib: 'Device', part: 'Bridge_Rectifier', desc: 'Bridge Rectifier' },
  CrystalOscillator:      { prefix: 'Y',  lib: 'Device', part: 'Crystal', desc: 'Crystal Oscillator' },
  Voltmeter:              { prefix: 'M',  lib: 'Device', part: 'Voltmeter', desc: 'Voltmeter' },
  Ammeter:                { prefix: 'M',  lib: 'Device', part: 'Ammeter', desc: 'Ammeter' },
};

function getKiCadRef(type: string, index: number): string {
  const map = KICAD_REF_MAP[type];
  const prefix = map?.prefix ?? 'U';
  return `${prefix}${index + 1}`;
}

function getNodeName(nodeId: string): string {
  if (nodeId === '0' || nodeId === 'gnd') return 'GND';
  return `Net-${nodeId}`;
}

export function exportToKiCad(components: SchematicComponent[], wires: Wire[]): string {
  // Step 1: Build node map (same as netlister does)
  // For simplicity, reuse the node-id approach: assign sequential node IDs to connected wire endpoints
  // We'll use a union-find approach to find connected nodes

  const nodeMap = new Map<string, string>(); // point key → node name
  
  // Find Ground nodes and assign '0'
  const groundComps = components.filter(c => c.type === 'Ground');
  
  // Build adjacency from wires
  const allPoints: { x: number; y: number }[] = [];
  wires.forEach(w => {
    allPoints.push(...w.points);
  });

  const pointKey = (p: { x: number; y: number }) => `${Math.round(p.x)},${Math.round(p.y)}`;

  // Union-Find
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    if (!parent.has(k)) parent.set(k, k);
    const p = parent.get(k)!;
    if (p !== k) { const root = find(p); parent.set(k, root); return root; }
    return k;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };

  wires.forEach(w => {
    // connect all points in a wire
    if (w.points.length > 0) {
      const a = pointKey(w.points[0]);
      for (let i = 1; i < w.points.length; i++) {
        union(a, pointKey(w.points[i]));
      }
    }
  });

  // Assign node names
  const rootNames = new Map<string, string>();
  let nodeCounter = 1;

  const getNodeForPoint = (p: { x: number; y: number }): string => {
    const k = pointKey(p);
    const root = find(k);
    if (!rootNames.has(root)) {
      rootNames.set(root, `N${nodeCounter++}`);
    }
    return rootNames.get(root)!;
  };

  // Mark ground nodes as GND
  groundComps.forEach(gc => {
    const pos = gc.position;
    const k = pointKey({ x: pos.x, y: pos.y + 20 }); // ground pin is below
    const root = find(k);
    rootNames.set(root, 'GND');
  });

  // Build component ref list (skip Ground, Junction, TextAnnotation)
  const simComponents = components.filter(c =>
    c.type !== 'Ground' && c.type !== 'Junction' && c.type !== 'TextAnnotation' && c.type !== 'Connector'
  );

  // Count refs per prefix for numbering
  const prefixCount = new Map<string, number>();
  const getRef = (type: string): string => {
    const map = KICAD_REF_MAP[type];
    const prefix = map?.prefix ?? 'U';
    const count = (prefixCount.get(prefix) ?? 0) + 1;
    prefixCount.set(prefix, count);
    return `${prefix}${count}`;
  };

  const compRefs = new Map<string, string>(); // comp.id → ref
  simComponents.forEach(c => {
    compRefs.set(c.id, getRef(c.type));
  });

  // Build net → nodes list (pin connections)
  // We'll attach nets later using pin positions from a simplified pin map
  // For now, generate nets from wire endpoints connected to component positions

  const date = new Date().toISOString().split('T')[0];

  // Footprint lookup — maps NodeSim type → KiCad THT footprint string
  const FOOTPRINTS: Record<string, string> = {
    Resistor:'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm_Horizontal',
    Thermistor:'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm_Horizontal',
    LDR:'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm_Horizontal',
    Varistor:'Varistor_THT:RV_Disc_D7mm_W3.6mm_P5mm',
    Potentiometer:'Potentiometer_THT:Potentiometer_Bourns_3386P_Vertical',
    Capacitor:'Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P2.50mm',
    Inductor:'Inductor_THT:L_Axial_L5.3mm_D2.2mm_P7.62mm_Horizontal',
    Diode:'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal',
    DiodeZener:'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal',
    DiodeSchottky:'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal',
    VaractorDiode:'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal',
    TVSDiode:'Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal',
    LED:'LED_THT:LED_D5.0mm',
    BridgeRectifier:'Diode_THT:Diode_Bridge_Round_D10.0mm',
    DIAC:'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal',
    TransistorNPN:'Package_TO_SOT_THT:TO-92_Inline',
    TransistorPNP:'Package_TO_SOT_THT:TO-92_Inline',
    MosfetN:'Package_TO_SOT_THT:TO-92_Inline',
    MosfetP:'Package_TO_SOT_THT:TO-92_Inline',
    JFET:'Package_TO_SOT_THT:TO-92_Inline',
    Darlington:'Package_TO_SOT_THT:TO-92_Inline',
    IGBT:'Package_TO_SOT_THT:TO-220-3_Vertical',
    ThyristorSCR:'Package_TO_SOT_THT:TO-92_Inline',
    TRIAC:'Package_TO_SOT_THT:TO-220-3_Vertical',
    Opamp:'Package_DIP:DIP-8_W7.62mm',
    Opamp5:'Package_DIP:DIP-8_W7.62mm',
    OpampLM358:'Package_DIP:DIP-8_W7.62mm',
    OpampTL071:'Package_DIP:DIP-8_W7.62mm',
    Comparator:'Package_DIP:DIP-8_W7.62mm',
    VoltageRegulator7805:'Package_TO_SOT_THT:TO-220-3_Vertical',
    VoltageRegulator7809:'Package_TO_SOT_THT:TO-220-3_Vertical',
    VoltageRegulator7812:'Package_TO_SOT_THT:TO-220-3_Vertical',
    VoltageRegulatorAMS1117:'Package_TO_SOT_SMD:SOT-223-3_TabPin2',
    VoltageRegulatorLM317:'Package_TO_SOT_THT:TO-220-3_Vertical',
    Timer555:'Package_DIP:DIP-8_W7.62mm',
    GateAND:'Package_DIP:DIP-14_W7.62mm',
    GateOR:'Package_DIP:DIP-14_W7.62mm',
    GateNOT:'Package_DIP:DIP-14_W7.62mm',
    GateNAND:'Package_DIP:DIP-14_W7.62mm',
    GateNOR:'Package_DIP:DIP-14_W7.62mm',
    GateXOR:'Package_DIP:DIP-14_W7.62mm',
    GateXNOR:'Package_DIP:DIP-14_W7.62mm',
    GateBuffer:'Package_DIP:DIP-14_W7.62mm',
    DFlipFlop:'Package_DIP:DIP-14_W7.62mm',
    JKFlipFlop:'Package_DIP:DIP-14_W7.62mm',
    SRFlipFlop:'Package_DIP:DIP-16_W7.62mm',
    TFlipFlop:'Package_DIP:DIP-14_W7.62mm',
    IC74HC595:'Package_DIP:DIP-16_W7.62mm',
    Optocoupler:'Package_DIP:DIP-4_W7.62mm',
    Fuse:'Fuse:Fuse_Radial_D5.0mm_L15.0mm_P5.00mm',
    SwitchSPST:'Button_Switch_THT:SW_Tactile_SPST_Angled_PTS645',
    PushButton:'Button_Switch_THT:SW_Tactile_SPST_Angled_PTS645',
    Relay:'Relay_THT:Relay_DPDT_Finder_40.52',
    CrystalOscillator:'Crystal:Crystal_HC49-U_Vertical',
    DCSource:'Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical',
    ACSource:'Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical',
    Voltmeter:'Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical',
    Ammeter:'Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical',
    BuckConverter:'Package_TO_SOT_SMD:SO-8_3.9x4.9mm_P1.27mm',
  };

  // Generate components section
  const compLines = simComponents.map((comp, i) => {
    const ref = compRefs.get(comp.id)!;
    const value = comp.value || comp.type;
    const kicad = KICAD_REF_MAP[comp.type] ?? { lib: 'Device', part: comp.type, desc: comp.type };
    const footprint = FOOTPRINTS[comp.type] ?? '';
    const tstamp = comp.id.replace(/[^a-fA-F0-9]/g, '').slice(0, 8).padEnd(8, '0');
    return `    (comp (ref "${ref}")
      (value "${value}")
      (footprint "${footprint}")
      (datafields)
      (libsource (lib "${kicad.lib}") (part "${kicad.part}") (description "${kicad.desc}"))
      (sheetpath (names "/") (tstamps "/"))
      (tstamp "${tstamp}")
    )`;
  }).join('\n');

  // For nets: find all unique roots and which comp pins connect there
  // Simplified: just list net names per component (2-pin components)
  const nets = new Map<string, { ref: string; pin: string }[]>();
  
  // Add all wire-connected points to nets
  wires.forEach(w => {
    if (w.points.length > 0) {
      const netName = getNodeForPoint(w.points[0]);
      if (!nets.has(netName)) nets.set(netName, []);
    }
  });

  const netLines = Array.from(nets.entries()).map(([name, nodes], i) => {
    const nodeLines = nodes.map(n => `      (node (ref "${n.ref}") (pin "${n.pin}") (pintype "passive"))`).join('\n');
    return `    (net (code "${i + 1}") (name "${name}")
${nodeLines || '      (node (ref "?") (pin "1") (pintype "passive"))'}
    )`;
  }).join('\n');

  return `(export (version "D")
  (design
    (source "NodeSim Circuit Export")
    (date "${date}")
    (tool "NodeSim v1.0 (nodesimapp.com)")
  )
  (components
${compLines}
  )
  (nets
${netLines}
  )
)`;
}

export function downloadKiCadNetlist(components: SchematicComponent[], wires: Wire[]) {
  const content = exportToKiCad(components, wires);
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NodeSim_Circuit.net';
  link.click();
  URL.revokeObjectURL(url);
}
