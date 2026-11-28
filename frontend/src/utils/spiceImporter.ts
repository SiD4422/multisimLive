// spiceImporter.ts
// Parses a raw SPICE .cir netlist and reconstructs schematic components,
// topology-ordered coordinates, orthogonal routed wires, Ground symbols,
// and NetLabel fallbacks ready for useSchematicStore via importState().

import type { SchematicComponent, Wire, Point } from '../store/useSchematicStore';
import { getComponentPins } from './netlister/getComponentPins';
import { isPointOnSegment, PIN_TOLERANCE } from './netlister/utils';
import { findOrthogonalPath } from './autoRouter';

const PREFIX_TYPE_MAP: Record<string, string | null> = {
  R: 'Resistor',
  C: 'Capacitor',
  L: 'Inductor',
  V: 'DCSource',
  I: 'DCCurrent',
  D: 'Diode',
  Q: 'TransistorNPN',
  M: 'MosfetN',
  J: 'JFET',
  K: null,
  X: null,
  B: null,
  E: null,
  F: null,
  G: null,
  H: null,
};

const SUBCKT_TYPE_MAP: Array<{ pattern: string; type: string }> = [
  { pattern: 'LM555', type: 'Timer555' },
  { pattern: 'NE555', type: 'Timer555' },
  { pattern: 'TLC555', type: 'Timer555' },
  { pattern: '555', type: 'Timer555' },
  { pattern: 'TL072', type: 'ic_tl072' },
  { pattern: 'TL082', type: 'ic_tl072' },
  { pattern: 'LM741', type: 'Opamp5' },
  { pattern: 'UA741', type: 'Opamp5' },
  { pattern: 'LM358_MDL', type: 'OpampLM358' },
  { pattern: 'TL071', type: 'OpampTL071' },
  { pattern: 'IDEAL_OPAMP', type: 'Opamp' },
  { pattern: 'LM358', type: 'ic_lm358' },
  { pattern: 'OPAMP', type: 'Opamp' },
];

export interface ImportResult {
  components: SchematicComponent[];
  wires: Wire[];
  warnings: string[];
  componentCount: number;
  wireCount: number;
  netLabelCount: number;
  skippedLines: string[];
  analysisCommand?: string;
}

interface ParsedElement {
  id: string;
  rawId: string;
  prefix: string;
  type: string;
  value: string;
  /** Pin nets aligned strictly with `getComponentPins(comp)` index order. */
  pinNets: string[];
  isSource: boolean;
}

interface PinRef {
  compId: string;
  pinIdx: number;
  p: Point;
}

function normalizeNetName(rawNet: string): string {
  const trimmed = rawNet.trim();
  if (!trimmed) return '0';
  if (trimmed === '0' || /^GND$/i.test(trimmed)) return '0';
  return trimmed;
}

function cleanRefDes(rawId: string): string {
  const upper = rawId.trim().toUpperCase();
  // Netlists exported by NodeSim use `R_R1`, `V_V1`, `C_C1`, `X_U1`, `Q_Q1`, `M_M1`, `D_D1`.
  const m = upper.match(/^([RCLVIQMDJX])_([RCLVIQMDJU]\w*)$/);
  if (m) return m[2];
  return upper;
}

function stripInlineComment(line: string): string {
  // Strip trailing `;` comments (standard SPICE inline comment)
  const semiIdx = line.indexOf(';');
  return (semiIdx >= 0 ? line.slice(0, semiIdx) : line).trim();
}

function unfoldContinuations(netlistText: string): string[] {
  const rawLines = netlistText.split(/\r?\n/);
  const unfolded: string[] = [];
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('+') && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += ' ' + trimmed.slice(1).trim();
    } else {
      unfolded.push(trimmed);
    }
  }
  return unfolded;
}

function refineTypeFromModel(
  prefix: string,
  modelName: string,
  modelTypes: Map<string, string>,
): string {
  const m = modelName.toUpperCase();
  const declared = modelTypes.get(m);
  if (prefix === 'Q') {
    if (declared === 'PNP' || m.includes('PNP') || m.includes('2N3906') || m.includes('2N2907')) {
      return 'TransistorPNP';
    }
    return 'TransistorNPN';
  }
  if (prefix === 'M') {
    if (
      declared === 'PMOS' ||
      m.includes('PMOS') ||
      m.includes('BSS84') ||
      m.includes('IRF9') ||
      m.includes('AO3401')
    ) {
      return 'MosfetP';
    }
    return 'MosfetN';
  }
  if (prefix === 'D') {
    if (m.includes('ZENER') || m.includes('BZX') || m.includes('1N47')) return 'DiodeZener';
    if (m.includes('SCHOTTKY') || m.includes('BAT') || m.includes('1N58')) return 'DiodeSchottky';
    if (m.includes('LED') || m.includes('DLED')) return 'LED';
    return 'Diode';
  }
  return PREFIX_TYPE_MAP[prefix] || 'Resistor';
}

function parseVoltageSource(valueTokens: string[]): { type: string; value: string } {
  const joined = valueTokens.join(' ');
  const upper = joined.toUpperCase();

  const sinMatch = joined.match(/SINE?\s*\(\s*([^)]+)\s*\)/i);
  if (sinMatch || upper.includes('SINE') || upper.includes('SIN(')) {
    if (sinMatch) {
      const args = sinMatch[1].trim().split(/[\s,]+/);
      const amp = (args[1] || '1').replace(/V$/i, '');
      const freq = args[2] || '1kHz';
      const freqDisplay = /HZ$/i.test(freq) ? freq : `${freq}Hz`;
      return { type: 'ACSource', value: `${amp}Vpk ${freqDisplay}` };
    }
    const acMatch = joined.match(/\bAC\s+([^\s]+)/i);
    const amp = acMatch ? acMatch[1].replace(/V$/i, '') : '1';
    return { type: 'ACSource', value: `${amp}Vpk 1kHz` };
  }

  const pulseMatch = joined.match(/PULSE\s*\(\s*([^)]+)\s*\)/i);
  if (pulseMatch || upper.includes('PULSE')) {
    if (pulseMatch) {
      return { type: 'PulseVoltage', value: pulseMatch[1].trim().replace(/,\s*/g, ' ') };
    }
    return { type: 'ClockVoltage', value: '5V' };
  }

  if (upper.includes('PWL')) return { type: 'StepVoltage', value: '5V' };
  if (upper.includes('AM(')) return { type: 'AMVoltage', value: '5V' };
  if (upper.includes('SFFM')) return { type: 'FMVoltage', value: '5V' };

  const dcMatch = joined.match(/\bDC\s+([^\s]+)/i);
  if (dcMatch) {
    const raw = dcMatch[1];
    return { type: 'DCSource', value: /V$/i.test(raw) ? raw : `${raw}V` };
  }
  const first = valueTokens[0] || '5';
  return { type: 'DCSource', value: /V$/i.test(first) ? first : `${first}V` };
}

function parseCurrentSource(valueTokens: string[]): { type: string; value: string } {
  const joined = valueTokens.join(' ');
  const upper = joined.toUpperCase();
  const sinMatch = joined.match(/SINE?\s*\(\s*([^)]+)\s*\)/i);
  if (sinMatch || upper.includes('SINE') || upper.includes('SIN(')) {
    if (sinMatch) {
      const args = sinMatch[1].trim().split(/[\s,]+/);
      const amp = (args[1] || '1').replace(/A$/i, '');
      const freq = args[2] || '1kHz';
      const freqDisplay = /HZ$/i.test(freq) ? freq : `${freq}Hz`;
      return { type: 'ACCurrent', value: `${amp}Apk ${freqDisplay}` };
    }
    return { type: 'ACCurrent', value: '1Apk 1kHz' };
  }
  const dcMatch = joined.match(/\bDC\s+([^\s]+)/i);
  const raw = dcMatch ? dcMatch[1] : valueTokens[0] || '1A';
  return { type: 'DCCurrent', value: /A$/i.test(raw) ? raw : `${raw}A` };
}

function mapSubcktPins(
  compType: string,
  xNodes: string[],
  portNames?: string[],
): string[] {
  // Align pin nets strictly to getComponentPins(comp) index order
  if (compType === 'Opamp') {
    // getComponentPins order: [IN+, IN-, OUT]
    if (portNames && portNames.length >= 3) {
      const findPort = (re: RegExp, fallbackIdx: number) => {
        const idx = portNames.findIndex((p) => re.test(p.toUpperCase()));
        return xNodes[idx >= 0 ? idx : fallbackIdx] ?? '0';
      };
      return [
        findPort(/IN\+|INP/, 1),
        findPort(/IN-|INN/, 0),
        findPort(/OUT|VO/, 2),
      ];
    }
    // IDEAL_OPAMP exported as: IN- IN+ OUT
    return [xNodes[1] ?? '0', xNodes[0] ?? '0', xNodes[2] ?? '0'];
  }

  if (compType === 'Opamp5' || compType === 'OpampLM358' || compType === 'OpampTL071') {
    // getComponentPins Opamp5 order: [IN+, IN-, OUT, V+, V-]
    // getComponentPins OpampLM358/TL071 order: [IN+, IN-, VCC, VEE, OUT]
    const isLm358Order = compType === 'OpampLM358' || compType === 'OpampTL071';
    if (portNames && portNames.length >= 5) {
      const findPort = (re: RegExp, fallbackIdx: number) => {
        const idx = portNames.findIndex((p) => re.test(p.toUpperCase()));
        return xNodes[idx >= 0 ? idx : fallbackIdx] ?? '0';
      };
      const inp = findPort(/IN\+|INP/, 1);
      const inm = findPort(/IN-|INN/, 0);
      const out = findPort(/OUT|VO/, 4);
      const vcc = findPort(/VCC|VDD|VS\+|V\+/, 2);
      const vee = findPort(/VEE|VSS|GND|VS-|V-/, 3);
      return isLm358Order ? [inp, inm, vcc, vee, out] : [inp, inm, out, vcc, vee];
    }
    // generateNetlist export order: IN- IN+ VCC VEE OUT
    const inm = xNodes[0] ?? '0';
    const inp = xNodes[1] ?? '0';
    const vcc = xNodes[2] ?? '0';
    const vee = xNodes[3] ?? '0';
    const out = xNodes[4] ?? '0';
    return isLm358Order ? [inp, inm, vcc, vee, out] : [inp, inm, out, vcc, vee];
  }

  if (compType === 'Timer555') {
    // getComponentPins Timer555 order: [VCC, GND, RST, DIS, THR, TRI, CON, OUT]
    if (portNames && portNames.length >= 8) {
      const order = ['VCC', 'GND', 'RST', 'DIS', 'THR', 'TRI', 'CON', 'OUT'];
      return order.map((name, i) => {
        const idx = portNames.findIndex((p) => p.toUpperCase().startsWith(name));
        return xNodes[idx >= 0 ? idx : i] ?? '0';
      });
    }
    return xNodes.slice(0, 8);
  }

  if (compType === 'ic_tl072') {
    // components.ts ic_tl072 pin order: [1IN-, 1IN+, 1OUT, 2IN+, 2IN-, 2OUT, VCC, VEE]
    return xNodes.slice(0, 8);
  }

  if (compType === 'ic_lm358') {
    // components.ts ic_lm358 pin order: [IN1+, IN1-, OUT1, IN2+, IN2-, OUT2, VCC, GND]
    return xNodes.slice(0, 8);
  }

  return xNodes;
}

function parseElements(netlistText: string): {
  elements: ParsedElement[];
  warnings: string[];
  skippedLines: string[];
  analysisCommand?: string;
} {
  const warnings: string[] = [];
  const skippedLines: string[] = [];
  const unfolded = unfoldContinuations(netlistText);
  if (unfolded.length === 0) {
    return { elements: [], warnings, skippedLines };
  }

  // First non-empty line in SPICE is always the title card (even if it begins with `*`).
  const bodyLines = unfolded.slice(1);

  const subcktPorts = new Map<string, string[]>();
  const modelTypes = new Map<string, string>();
  const rawElementLines: string[] = [];
  let inSubckt = false;
  let inControl = false;
  let analysisCommand: string | undefined;

  for (const rawLine of bodyLines) {
    const line = stripInlineComment(rawLine);
    if (!line || line.startsWith('*') || line.startsWith('$')) continue;
    const upper = line.toUpperCase();

    if (upper.startsWith('.SUBCKT ')) {
      inSubckt = true;
      const parts = upper.split(/\s+/);
      if (parts.length >= 3) {
        subcktPorts.set(parts[1], parts.slice(2));
      }
      continue;
    }
    if (upper.startsWith('.ENDS')) {
      inSubckt = false;
      continue;
    }
    if (upper.startsWith('.CONTROL')) {
      inControl = true;
      continue;
    }
    if (upper.startsWith('.ENDC')) {
      inControl = false;
      continue;
    }
    if (inSubckt || inControl) continue;

    if (upper.startsWith('.MODEL ')) {
      const m = line.match(/^\.MODEL\s+([^\s]+)\s+([A-Za-z0-9_]+)/i);
      if (m) {
        modelTypes.set(m[1].toUpperCase(), m[2].toUpperCase());
      }
      continue;
    }

    if (upper.startsWith('.TRAN ') || upper.startsWith('.AC ') || upper.startsWith('.DC ') || upper === '.OP') {
      analysisCommand = line;
      continue;
    }

    if (upper.startsWith('.')) continue;

    rawElementLines.push(line);
  }

  // Pre-scan MOSFET IDs so synthetic `D_body_<mosId>` generated by NodeSim isn't duplicated
  const mosfetRawIds = new Set<string>();
  for (const line of rawElementLines) {
    const head = line.split(/\s+/)[0].toUpperCase();
    if (head.startsWith('M_')) {
      mosfetRawIds.add(head.slice(2));
    }
  }

  const elements: ParsedElement[] = [];
  const idCounters: Record<string, number> = {};

  for (const line of rawElementLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) {
      skippedLines.push(line);
      continue;
    }

    const rawId = parts[0];
    const upperId = rawId.toUpperCase();
    const prefix = upperId[0];

    // Skip synthetic MOSFET body diodes paired with M_<id>
    if (upperId.startsWith('D_BODY_') && mosfetRawIds.has(upperId.slice('D_BODY_'.length))) {
      continue;
    }

    if (!(prefix in PREFIX_TYPE_MAP) || (PREFIX_TYPE_MAP[prefix] === null && prefix !== 'X')) {
      skippedLines.push(line);
      continue;
    }

    let compType: string;
    let value: string;
    let pinNets: string[];

    if (prefix === 'X') {
      const nonParamTokens = parts.slice(1).filter((t) => !t.includes('='));
      if (nonParamTokens.length < 2) {
        skippedLines.push(line);
        continue;
      }
      const modelName = nonParamTokens[nonParamTokens.length - 1].toUpperCase();
      const xNodes = nonParamTokens.slice(0, -1).map(normalizeNetName);
      const matched = SUBCKT_TYPE_MAP.find((entry) => modelName.includes(entry.pattern));
      if (!matched) {
        skippedLines.push(line);
        warnings.push(`Subcircuit '${modelName}' is not supported — skipped`);
        continue;
      }
      compType = matched.type;
      value = modelName;
      pinNets = mapSubcktPins(compType, xNodes, subcktPorts.get(modelName));
    } else if (prefix === 'V') {
      if (parts.length < 4) {
        skippedLines.push(line);
        continue;
      }
      const parsed = parseVoltageSource(parts.slice(3));
      compType = parsed.type;
      value = parsed.value;
      pinNets = [normalizeNetName(parts[1]), normalizeNetName(parts[2])];
    } else if (prefix === 'I') {
      if (parts.length < 4) {
        skippedLines.push(line);
        continue;
      }
      const parsed = parseCurrentSource(parts.slice(3));
      compType = parsed.type;
      value = parsed.value;
      pinNets = [normalizeNetName(parts[1]), normalizeNetName(parts[2])];
    } else if (prefix === 'Q') {
      // SPICE: Qname nc nb ne [ns] model -> NodeSim: [B, C, E]
      const nonParams = parts.slice(1).filter((t) => !t.includes('='));
      if (nonParams.length < 4) {
        skippedLines.push(line);
        continue;
      }
      const modelName = nonParams[nonParams.length - 1];
      compType = refineTypeFromModel('Q', modelName, modelTypes);
      value = modelName;
      pinNets = [
        normalizeNetName(nonParams[1]), // Base
        normalizeNetName(nonParams[0]), // Collector
        normalizeNetName(nonParams[2]), // Emitter
      ];
    } else if (prefix === 'M' || prefix === 'J') {
      // SPICE: Mname nd ng ns [nb] model -> NodeSim: [G, D, S]
      const nonParams = parts.slice(1).filter((t) => !t.includes('='));
      if (nonParams.length < 4) {
        skippedLines.push(line);
        continue;
      }
      const modelName = nonParams[nonParams.length - 1];
      compType = refineTypeFromModel(prefix, modelName, modelTypes);
      value = modelName;
      pinNets = [
        normalizeNetName(nonParams[1]), // Gate
        normalizeNetName(nonParams[0]), // Drain
        normalizeNetName(nonParams[2]), // Source
      ];
    } else if (prefix === 'D') {
      if (parts.length < 4) {
        skippedLines.push(line);
        continue;
      }
      const nonParams = parts.slice(1).filter((t) => !t.includes('='));
      const modelName = nonParams[2] || '1N4148';
      compType = refineTypeFromModel('D', modelName, modelTypes);
      value = modelName;
      pinNets = [normalizeNetName(nonParams[0]), normalizeNetName(nonParams[1])];
    } else {
      // R, C, L: name n1 n2 value [params...]
      const nonParams = parts.slice(1).filter((t) => !t.includes('='));
      if (nonParams.length < 3) {
        skippedLines.push(line);
        continue;
      }
      compType = PREFIX_TYPE_MAP[prefix] as string;
      pinNets = [normalizeNetName(nonParams[0]), normalizeNetName(nonParams[1])];
      value = nonParams[2];
    }

    const baseId = cleanRefDes(rawId);
    const count = idCounters[baseId] ?? 0;
    const finalId = count === 0 ? baseId : `${baseId}_${count}`;
    idCounters[baseId] = count + 1;

    elements.push({
      id: finalId,
      rawId: upperId,
      prefix,
      type: compType,
      value,
      pinNets,
      isSource: prefix === 'V' || prefix === 'I',
    });
  }

  return { elements, warnings, skippedLines, analysisCommand };
}

function layoutElements(elements: ParsedElement[]): SchematicComponent[] {
  if (elements.length === 0) return [];

  // Build bipartite adjacency via non-ground nets for left-to-right BFS layering
  const netToElements = new Map<string, number[]>();
  elements.forEach((el, idx) => {
    for (const net of el.pinNets) {
      if (net === '0') continue;
      const list = netToElements.get(net);
      if (list) list.push(idx);
      else netToElements.set(net, [idx]);
    }
  });

  const layer = new Array<number>(elements.length).fill(-1);
  const queue: number[] = [];

  elements.forEach((el, idx) => {
    if (el.isSource) {
      layer[idx] = 0;
      queue.push(idx);
    }
  });

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    for (const net of elements[curr].pinNets) {
      if (net === '0') continue;
      for (const nxt of netToElements.get(net) ?? []) {
        if (layer[nxt] === -1) {
          layer[nxt] = layer[curr] + 1;
          queue.push(nxt);
        }
      }
    }
  }

  let fallbackCol = Math.max(0, ...layer) + (queue.length > 0 ? 1 : 0);
  for (let i = 0; i < elements.length; i++) {
    if (layer[i] === -1) {
      layer[i] = fallbackCol;
      fallbackCol++;
    }
  }

  // Group indices by layer (cap vertical height per column at 4 rows to keep aspect balanced)
  const MAX_ROWS_PER_COL = 4;
  const colRows = new Map<number, number>();
  const placed: SchematicComponent[] = [];

  const STEP_X = 240;
  const STEP_Y = 240;
  const BASE_X = 240;
  const BASE_Y = 220;

  elements.forEach((el, idx) => {
    let targetCol = layer[idx];
    let row = colRows.get(targetCol) ?? 0;
    while (row >= MAX_ROWS_PER_COL) {
      targetCol++;
      row = colRows.get(targetCol) ?? 0;
    }
    colRows.set(targetCol, row + 1);

    // Orient 2-pin grounded sources or shunt elements vertically (pin 0 top -> pin 1 bottom)
    let rotation = 0;
    if (el.pinNets.length === 2) {
      const [n0, n1] = el.pinNets;
      if (n0 !== '0' && n1 === '0') rotation = 90;
      else if (n0 === '0' && n1 !== '0') rotation = 270;
    }

    placed.push({
      id: el.id,
      type: el.type,
      position: {
        x: BASE_X + targetCol * STEP_X,
        y: BASE_Y + row * STEP_Y,
      },
      rotation,
      value: el.value,
    });
  });

  return placed;
}

function sampleSegmentPoints(a: Point, b: Point, step = 20): Point[] {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const count = Math.max(1, Math.ceil(dist / step));
  const pts: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return pts;
}

function wireClearsOtherNets(
  path: Point[],
  currentNet: string,
  avoidPinPoints: Point[],
  routedWiresByNet: Map<string, Wire[]>,
): boolean {
  if (path.length < 2) return false;

  // 1. Ensure no wire segment touches any component pin (including Ground pins) of another net
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    for (const ap of avoidPinPoints) {
      if (isPointOnSegment(ap, a, b, PIN_TOLERANCE + 2)) {
        return false;
      }
    }
  }

  // 2. Ensure no vertex or segment merges with any already-routed wire of another net
  for (const [otherNet, otherWires] of routedWiresByNet.entries()) {
    if (otherNet === currentNet) continue;
    for (const ow of otherWires) {
      // Check our vertices against other wire's segments
      for (const pt of path) {
        for (let j = 0; j < ow.points.length - 1; j++) {
          if (isPointOnSegment(pt, ow.points[j], ow.points[j + 1], PIN_TOLERANCE + 2)) {
            return false;
          }
        }
      }
      // Check other wire's vertices against our segments
      for (const opt of ow.points) {
        for (let i = 0; i < path.length - 1; i++) {
          if (isPointOnSegment(opt, path[i], path[i + 1], PIN_TOLERANCE + 2)) {
            return false;
          }
        }
      }
      // Also guard orthogonal crossing corridors via dense sample check so shared grid corners can't bridge
      for (let i = 0; i < path.length - 1; i++) {
        for (const sPt of sampleSegmentPoints(path[i], path[i + 1], 20)) {
          for (let j = 0; j < ow.points.length - 1; j++) {
            if (isPointOnSegment(sPt, ow.points[j], ow.points[j + 1], PIN_TOLERANCE)) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

function findFreeOffsetPoint(
  origin: Point,
  candidates: Point[],
  occupiedPoints: Point[],
): Point {
  for (const cand of candidates) {
    const collides = occupiedPoints.some(
      (occ) => Math.hypot(cand.x - occ.x, cand.y - occ.y) <= PIN_TOLERANCE * 1.4,
    );
    if (!collides) return cand;
  }
  return origin;
}

/**
 * Parses a SPICE netlist string and returns schematic components, orthogonal wires,
 * Ground symbols, and fallback NetLabels so the imported schematic matches the SPICE topology.
 */
export function importSpiceNetlist(netlistText: string): ImportResult {
  const { elements, warnings, skippedLines, analysisCommand } = parseElements(netlistText);
  if (elements.length === 0) {
    const gnd: SchematicComponent = {
      id: 'GND1',
      type: 'Ground',
      position: { x: 240, y: 340 },
      rotation: 0,
    };
    warnings.push('No supported components were found in the netlist. Only Ground was added.');
    return {
      components: [gnd],
      wires: [],
      warnings,
      componentCount: 0,
      wireCount: 0,
      netLabelCount: 0,
      skippedLines,
      analysisCommand,
    };
  }

  const baseComponents = layoutElements(elements);
  const allComponents: SchematicComponent[] = [...baseComponents];
  const wires: Wire[] = [];

  // Map every component pin to its world coordinates & SPICE net name
  const compById = new Map<string, SchematicComponent>();
  const pinsByNet = new Map<string, PinRef[]>();
  const allPinsFlat: { netName: string; p: Point }[] = [];

  baseComponents.forEach((comp, idx) => {
    compById.set(comp.id, comp);
    const el = elements[idx];
    const compPins = getComponentPins(comp);
    el.pinNets.forEach((netName, pinIdx) => {
      const pin = compPins[pinIdx];
      if (!pin?.p) return;
      allPinsFlat.push({ netName, p: pin.p });
      const list = pinsByNet.get(netName);
      const ref: PinRef = { compId: comp.id, pinIdx, p: pin.p };
      if (list) list.push(ref);
      else pinsByNet.set(netName, [ref]);
    });
  });

  let gndIdx = 1;
  let wireIdx = 1;
  let labelIdx = 1;
  let netLabelCount = 0;
  const routedWiresByNet = new Map<string, Wire[]>();
  const recordWire = (netName: string, wire: Wire) => {
    wires.push(wire);
    const list = routedWiresByNet.get(netName);
    if (list) list.push(wire);
    else routedWiresByNet.set(netName, [wire]);
  };

  // 1. Place dedicated local Ground symbols & short drop wires for every '0' pin
  const groundPins = pinsByNet.get('0') ?? [];
  if (groundPins.length === 0) {
    allComponents.push({
      id: 'GND1',
      type: 'Ground',
      position: { x: 200, y: 400 },
      rotation: 0,
    });
  } else {
    for (const gPin of groundPins) {
      const otherPinPoints = allPinsFlat
        .filter((x) => Math.hypot(x.p.x - gPin.p.x, x.p.y - gPin.p.y) > 1)
        .map((x) => x.p);
      const targetPos = findFreeOffsetPoint(
        gPin.p,
        [
          { x: gPin.p.x, y: gPin.p.y + 20 },
          { x: gPin.p.x, y: gPin.p.y - 20 },
          { x: gPin.p.x - 20, y: gPin.p.y },
          { x: gPin.p.x + 20, y: gPin.p.y },
        ],
        otherPinPoints,
      );
      allComponents.push({
        id: `GND${gndIdx++}`,
        type: 'Ground',
        position: targetPos,
        rotation: 0,
      });
      allPinsFlat.push({ netName: '0', p: targetPos });
      if (targetPos.x !== gPin.p.x || targetPos.y !== gPin.p.y) {
        recordWire('0', {
          id: `W_${wireIdx++}`,
          points: [
            { x: gPin.p.x, y: gPin.p.y },
            { x: targetPos.x, y: targetPos.y },
          ],
        });
      }
    }
  }

  const obstacleComponents = [...allComponents];

  // 2. Reconstruct MST orthogonal wires per non-ground net, with NetLabel fallback on congested paths
  for (const [netName, netPins] of pinsByNet.entries()) {
    if (netName === '0' || netPins.length < 2) continue;

    // Deduplicate identical physical pin coordinates before routing
    const uniquePins: PinRef[] = [];
    for (const ref of netPins) {
      if (!uniquePins.some((u) => Math.hypot(u.p.x - ref.p.x, u.p.y - ref.p.y) < 1)) {
        uniquePins.push(ref);
      }
    }
    if (uniquePins.length < 2) continue;

    const avoidPinPoints = allPinsFlat
      .filter((x) => x.netName !== netName)
      .map((x) => x.p);

    // Prim's MST ordered by Manhattan distance
    const inTree = new Set<number>([0]);
    const routedEdges: Array<[number, number]> = [];
    while (inTree.size < uniquePins.length) {
      let bestU = -1;
      let bestV = -1;
      let bestDist = Infinity;
      for (const u of inTree) {
        for (let v = 0; v < uniquePins.length; v++) {
          if (inTree.has(v)) continue;
          const d =
            Math.abs(uniquePins[u].p.x - uniquePins[v].p.x) +
            Math.abs(uniquePins[u].p.y - uniquePins[v].p.y);
          if (d < bestDist) {
            bestDist = d;
            bestU = u;
            bestV = v;
          }
        }
      }
      if (bestU === -1 || bestV === -1) break;
      inTree.add(bestV);
      routedEdges.push([bestU, bestV]);
    }

    // Track Union-Find clusters of safely wire-connected pins
    const parent = uniquePins.map((_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const unite = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };

    for (const [u, v] of routedEdges) {
      const otherWireSamplePoints: Point[] = [];
      for (const [otherNet, otherWires] of routedWiresByNet.entries()) {
        if (otherNet === netName) continue;
        for (const ow of otherWires) {
          for (let i = 0; i < ow.points.length - 1; i++) {
            otherWireSamplePoints.push(...sampleSegmentPoints(ow.points[i], ow.points[i + 1], 20));
          }
        }
      }
      const combinedAvoid = [...avoidPinPoints, ...otherWireSamplePoints];
      const candidate = findOrthogonalPath(uniquePins[u].p, uniquePins[v].p, obstacleComponents, {
        avoidPoints: combinedAvoid,
      });
      if (wireClearsOtherNets(candidate, netName, avoidPinPoints, routedWiresByNet)) {
        recordWire(netName, { id: `W_${wireIdx++}`, points: candidate });
        unite(u, v);
      }
    }

    // Group connected clusters; if >1 cluster remains, tie them cleanly with NetLabel flags
    const clusters = new Map<number, number[]>();
    for (let i = 0; i < uniquePins.length; i++) {
      const r = find(i);
      const arr = clusters.get(r);
      if (arr) arr.push(i);
      else clusters.set(r, [i]);
    }

    if (clusters.size > 1) {
      const labelText = /^[0-9]+$/.test(netName) ? `NET_${netName}` : netName;
      for (const members of clusters.values()) {
        const anchorPin = uniquePins[members[0]].p;
        allComponents.push({
          id: `LBL_${labelIdx++}`,
          type: 'NetLabel',
          position: { x: anchorPin.x, y: anchorPin.y },
          rotation: 0,
          value: labelText,
        });
        netLabelCount++;
      }
    }
  }

  return {
    components: allComponents,
    wires,
    warnings,
    componentCount: elements.length,
    wireCount: wires.length,
    netLabelCount,
    skippedLines,
    analysisCommand,
  };
}

/**
 * Quick validation: checks if a string looks like a SPICE netlist.
 */
export function looksLikeSpiceNetlist(text: string): boolean {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('*'));
  if (lines.length < 2) return false;
  return lines.some((l) => /^[RCLVIQMDJXBEFGHKrclviqmdjxbefghk]\w*\s+/i.test(l.trim()));
}
