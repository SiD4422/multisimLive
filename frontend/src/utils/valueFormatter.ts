// valueFormatter.ts
// Engineering-notation value parsing, formatting, validation and normalization.
// Used by ComponentInspectorPanel and SchematicEditor to display and normalize component values.

// Units per component type
export const COMPONENT_UNITS: Record<string, string> = {
  Resistor: 'Ω',
  Potentiometer: 'Ω',
  Load: 'Ω',
  Capacitor: 'F',
  Inductor: 'H',
  DCSource: 'V',
  ACSource: 'V',
  DCCurrent: 'A',
  ACCurrent: 'A',
  ClockVoltage: 'V',
  PulseVoltage: 'V',
  StepVoltage: 'V',
  DiodeZener: 'V',
  Fuse: 'A',
};

// Suffixes recognized in user input
const SUFFIX_MAP: Record<string, number> = {
  T: 1e12, G: 1e9, MEG: 1e6, M: 1e-3,
  K: 1e3,  k: 1e3,
  u: 1e-6, U: 1e-6, µ: 1e-6,
  n: 1e-9, N: 1e-9,
  p: 1e-12, P: 1e-12,
  f: 1e-15, F_: 1e-15, // F_ used internally to avoid clash with Farad unit
  m: 1e-3,
};

/**
 * Parses an engineering-notation string to a number.
 * Handles: 1k, 4.7u, 2.2M, 100n, 1meg, 10e3, etc.
 * Returns NaN if unparseable.
 */
export function parseEngineeringValue(str: string): number {
  if (!str || str.trim() === '') return NaN;
  const s = str.trim().toUpperCase();

  // Pure number
  const pure = parseFloat(s);
  if (!isNaN(pure) && /^[\d.e+\-]+$/i.test(s)) return pure;

  // Strip trailing unit letters (V, A, Ω, H, F) then parse suffix
  // Match: optional sign, digits, optional decimal, optional suffix
  const match = s.match(/^([+\-]?\d+\.?\d*)\s*(MEG|[TGKMUNPF]|µ)?(V|A|Ω|OHM|HZ|H)?$/i);
  if (!match) return NaN;

  const num = parseFloat(match[1]);
  if (isNaN(num)) return NaN;

  const suffix = match[2]?.toUpperCase();
  if (!suffix) return num;

  if (suffix === 'MEG') return num * 1e6;
  if (suffix === 'G') return num * 1e9;
  if (suffix === 'T') return num * 1e12;
  if (suffix === 'K') return num * 1e3;
  if (suffix === 'M') return num * 1e-3;
  if (suffix === 'U' || suffix === 'µ') return num * 1e-6;
  if (suffix === 'N') return num * 1e-9;
  if (suffix === 'P') return num * 1e-12;
  if (suffix === 'F' && !match[3]) return num * 1e-15; // femto only when no unit

  return num;
}

/**
 * Formats a number in engineering notation with a unit symbol.
 * e.g. formatEngineeringValue(1000, 'Ω') → '1 kΩ'
 *      formatEngineeringValue(0.000001, 'F') → '1 µF'
 */
export function formatEngineeringValue(val: number, unit = ''): string {
  if (!isFinite(val) || isNaN(val)) return `? ${unit}`.trim();
  const abs = Math.abs(val);

  if (abs === 0) return `0 ${unit}`.trim();
  if (abs >= 1e9)  return `${+(val / 1e9).toPrecision(4)} G${unit}`;
  if (abs >= 1e6)  return `${+(val / 1e6).toPrecision(4)} M${unit}`;
  if (abs >= 1e3)  return `${+(val / 1e3).toPrecision(4)} k${unit}`;
  if (abs >= 1)    return `${+val.toPrecision(4)} ${unit}`.trim();
  if (abs >= 1e-3) return `${+(val * 1e3).toPrecision(4)} m${unit}`;
  if (abs >= 1e-6) return `${+(val * 1e6).toPrecision(4)} µ${unit}`;
  if (abs >= 1e-9) return `${+(val * 1e9).toPrecision(4)} n${unit}`;
  if (abs >= 1e-12) return `${+(val * 1e12).toPrecision(4)} p${unit}`;
  return `${val.toExponential(3)} ${unit}`.trim();
}

/**
 * Returns a human-readable formatted value for a component.
 * e.g. componentDisplayValue('1k', 'Resistor') → '1 kΩ'
 */
export function componentDisplayValue(rawVal: string, type: string): string {
  const unit = COMPONENT_UNITS[type];
  if (!unit) return rawVal; // Complex types (transistors, etc.) — just return raw

  const num = parseEngineeringValue(rawVal);
  if (isNaN(num)) return rawVal; // Can't parse — return raw
  return formatEngineeringValue(num, unit);
}

/**
 * Normalizes user-entered value strings to engineering notation.
 * e.g. normalizeValue('4700', 'Resistor') → '4.7k'
 *      normalizeValue('0.001', 'Capacitor') → '1m' (which means 1mF — but for caps, '1000u' is more intuitive)
 */
export function normalizeValue(rawVal: string, type: string): string {
  const unit = COMPONENT_UNITS[type];
  if (!unit) return rawVal; // Don't normalize complex component values

  const num = parseEngineeringValue(rawVal);
  if (isNaN(num)) return rawVal; // Invalid — keep as-is, validation will catch it

  const abs = Math.abs(num);

  // Special case: capacitors and inductors — prefer µ/n/p over m for small values
  if (type === 'Capacitor') {
    if (abs >= 1e-3)  return `${+(num * 1e3).toPrecision(4)}m`;
    if (abs >= 1e-6)  return `${+(num * 1e6).toPrecision(4)}u`;
    if (abs >= 1e-9)  return `${+(num * 1e9).toPrecision(4)}n`;
    if (abs >= 1e-12) return `${+(num * 1e12).toPrecision(4)}p`;
    return rawVal;
  }
  if (type === 'Inductor') {
    if (abs >= 1)     return `${+num.toPrecision(4)}`;
    if (abs >= 1e-3)  return `${+(num * 1e3).toPrecision(4)}m`;
    if (abs >= 1e-6)  return `${+(num * 1e6).toPrecision(4)}u`;
    if (abs >= 1e-9)  return `${+(num * 1e9).toPrecision(4)}n`;
    return rawVal;
  }

  // General (resistors, voltages, etc.)
  if (abs >= 1e9)  return `${+(num / 1e9).toPrecision(4)}G`;
  if (abs >= 1e6)  return `${+(num / 1e6).toPrecision(4)}MEG`;
  if (abs >= 1e3)  return `${+(num / 1e3).toPrecision(4)}k`;
  if (abs >= 1)    return `${+num.toPrecision(4)}`;
  if (abs >= 1e-3) return `${+(num * 1e3).toPrecision(4)}m`;
  if (abs >= 1e-6) return `${+(num * 1e6).toPrecision(4)}u`;
  if (abs >= 1e-9) return `${+(num * 1e9).toPrecision(4)}n`;
  return rawVal;
}

/**
 * Validates a component value string.
 * Returns { valid: true } if OK, or { valid: false, error: string } if not.
 */
export function validateValue(rawVal: string, type: string): { valid: boolean; error?: string } {
  const unit = COMPONENT_UNITS[type];
  if (!unit) return { valid: true }; // Don't validate complex types

  if (!rawVal || rawVal.trim() === '') {
    return { valid: false, error: 'Value cannot be empty' };
  }

  const num = parseEngineeringValue(rawVal);
  if (isNaN(num)) {
    return { valid: false, error: `Cannot parse "${rawVal}" — try: 1k, 4.7u, 100n, 2.2M` };
  }

  if (type === 'Resistor' || type === 'Load' || type === 'Potentiometer') {
    if (num < 0) return { valid: false, error: 'Resistance must be positive' };
    if (num === 0) return { valid: false, error: 'Resistance cannot be 0 Ω (causes short circuit)' };
  }
  if (type === 'Capacitor') {
    if (num <= 0) return { valid: false, error: 'Capacitance must be positive' };
  }
  if (type === 'Inductor') {
    if (num <= 0) return { valid: false, error: 'Inductance must be positive' };
  }
  if (type === 'Fuse') {
    if (num <= 0) return { valid: false, error: 'Fuse rating must be positive' };
  }

  return { valid: true };
}
