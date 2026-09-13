// spiceImporter.ts
// Parses a raw SPICE .cir netlist and returns schematic components
// that can be loaded into useSchematicStore via importState().

import type { SchematicComponent } from '../store/useSchematicStore';

// SPICE letter prefix → MultiSimLab component type (null = skip/unsupported)
const PREFIX_TYPE_MAP: Record<string, string | null> = {
  R: 'Resistor',
  C: 'Capacitor',
  L: 'Inductor',
  V: 'DCSource',   // Refined below based on value content
  I: 'DCCurrent',  // Refined below based on value content
  D: 'Diode',
  Q: 'TransistorNPN', // Refined below based on model name
  M: 'MosfetN',       // Refined below based on model name
  J: 'JFET',
  K: null,   // Coupling — skip (handled as transformer)
  X: null,   // Subcircuit — map by model name
  B: null,   // Behavioral — skip
  E: null,   // VCVS — skip
  F: null,   // CCCS — skip
  G: null,   // VCCS — skip
  H: null,   // CCVS — skip
};

// Subcircuit model names → component types
const SUBCKT_TYPE_MAP: Record<string, string> = {
  LM555: 'Timer555',
  NE555: 'Timer555',
  LM741: 'Opamp',
  LM358: 'Opamp',
  TL071: 'Opamp',
  UA741: 'Opamp',
};

// SPICE model name patterns → component type overrides
function refineTypeFromModel(prefix: string, modelName: string): string {
  const m = modelName.toUpperCase();
  if (prefix === 'Q') {
    if (m.includes('PNP') || m.includes('2N3906') || m.includes('2N2907')) return 'TransistorPNP';
    return 'TransistorNPN';
  }
  if (prefix === 'M') {
    if (m.includes('PMOS') || m.includes('BSS84') || m.includes('IRF9')) return 'MosfetP';
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

function refineVSourceType(valueParts: string[]): string {
  const joined = valueParts.join(' ').toUpperCase();
  if (joined.includes('SINE') || joined.includes('SIN')) return 'ACSource';
  if (joined.includes('PULSE')) return 'ClockVoltage';
  if (joined.includes('PWL')) return 'StepVoltage';
  if (joined.includes('AM')) return 'AMVoltage';
  if (joined.includes('SFFM')) return 'FMVoltage';
  return 'DCSource';
}

function refineISourceType(valueParts: string[]): string {
  const joined = valueParts.join(' ').toUpperCase();
  if (joined.includes('SINE') || joined.includes('SIN')) return 'ACCurrent';
  return 'DCCurrent';
}

export interface ImportResult {
  components: SchematicComponent[];
  warnings: string[];
  componentCount: number;
  skippedLines: string[];
}

/**
 * Parses a SPICE netlist string and returns schematic components.
 * Positions are auto-generated on a grid since raw netlists have no geometry.
 */
export function importSpiceNetlist(netlistText: string): ImportResult {
  const components: SchematicComponent[] = [];
  const warnings: string[] = [];
  const skippedLines: string[] = [];

  // Split into lines, strip comments, skip blank lines and control lines
  const lines = netlistText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('*') && !l.startsWith('$'));

  // Skip the first line (SPICE title card)
  const componentLines = lines.slice(1).filter(l => {
    const upper = l.toUpperCase();
    // Skip control blocks, options, models, subckt defs, .end
    return !upper.startsWith('.') && !upper.startsWith('+');
  });

  // Grid layout: components laid out left-to-right, wrapping every 6 columns
  const GRID_X_STEP = 150;
  const GRID_Y_STEP = 120;
  const COLS_PER_ROW = 6;
  const BASE_X = 200;
  const BASE_Y = 200;

  // Add a ground component
  components.push({
    id: 'GND1',
    type: 'Ground',
    position: { x: BASE_X - 60, y: BASE_Y + GRID_Y_STEP },
    rotation: 0,
  });

  let col = 0;
  let row = 0;
  const idCounters: Record<string, number> = {};

  for (const line of componentLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) {
      skippedLines.push(line);
      continue;
    }

    const rawId = parts[0];
    const prefix = rawId[0].toUpperCase();

    if (!(prefix in PREFIX_TYPE_MAP)) {
      skippedLines.push(line);
      continue;
    }

    // Skip null-mapped prefixes (behavioral, coupling, etc.)
    if (PREFIX_TYPE_MAP[prefix] === null && prefix !== 'X') {
      skippedLines.push(line);
      continue;
    }

    let compType: string;
    let value = '';

    if (prefix === 'X') {
      // Subcircuit: last token is the model/subckt name
      const modelName = parts[parts.length - 1].toUpperCase();
      const mapped = Object.entries(SUBCKT_TYPE_MAP).find(([k]) =>
        modelName.includes(k)
      );
      if (!mapped) {
        skippedLines.push(line);
        warnings.push(`Subcircuit '${modelName}' is not supported — skipped`);
        continue;
      }
      compType = mapped[1];
      value = '';
    } else if (prefix === 'V') {
      // V name node+ node- value...
      const valueParts = parts.slice(3);
      compType = refineVSourceType(valueParts);
      // Extract DC value
      const dcMatch = line.match(/DC\s+([\d.e+\-]+)/i);
      value = dcMatch ? dcMatch[1] + 'V' : valueParts[0] || '5V';
    } else if (prefix === 'I') {
      const valueParts = parts.slice(3);
      compType = refineISourceType(valueParts);
      value = parts[3] || '1';
    } else if (prefix === 'Q' || prefix === 'M' || prefix === 'D' || prefix === 'J') {
      // Model name is last token
      const modelName = parts[parts.length - 1];
      compType = refineTypeFromModel(prefix, modelName);
      value = '';
    } else if (prefix === 'K') {
      // Transformer coupling — skip
      skippedLines.push(line);
      continue;
    } else {
      // R, C, L: value is the last token
      compType = PREFIX_TYPE_MAP[prefix] as string;
      value = parts[parts.length - 1];
    }

    // Ensure unique ID
    const baseId = rawId.toUpperCase();
    const counter = idCounters[baseId] ?? 0;
    const finalId = counter === 0 ? baseId : `${baseId}_${counter}`;
    idCounters[baseId] = counter + 1;

    // Calculate grid position
    const x = BASE_X + col * GRID_X_STEP;
    const y = BASE_Y + row * GRID_Y_STEP;
    col++;
    if (col >= COLS_PER_ROW) { col = 0; row++; }

    components.push({
      id: finalId,
      type: compType,
      position: { x, y },
      rotation: 0,
      value,
    });
  }

  if (components.length <= 1) {
    warnings.push('No supported components were found in the netlist. Only Ground was added.');
  }

  return {
    components,
    warnings,
    componentCount: components.length - 1, // Exclude the auto-added GND
    skippedLines,
  };
}

/**
 * Quick validation: checks if a string looks like a SPICE netlist.
 */
export function looksLikeSpiceNetlist(text: string): boolean {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('*'));
  if (lines.length < 2) return false;
  // Should have at least one component line starting with R/C/L/V/Q/M/D/X
  return lines.slice(1).some(l => /^[RCLVIQMDJXBEFGHKrclviqmdjxbefghk]\w*\s+/i.test(l.trim()));
}