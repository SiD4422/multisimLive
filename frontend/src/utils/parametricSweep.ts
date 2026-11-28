import type { SchematicComponent } from '../store/useSchematicStore';
import { interpolateTraceAtX } from './ghostTraceMerge';
import { parseSpiceToFloat } from './netlister/parseSpiceToFloat';
import type { SpiceDataRow, SpiceParsedOutput, SweepMetadata, SweepStepDescriptor } from './spiceTypes';

export const MAX_PARAMETRIC_SWEEP_STEPS = 40;
export const SWEEP_TRACE_SEPARATOR = '__step_';

export type ParametricSweepParameter = 'value' | 'wiper_position';

export interface ParametricSweepConfig {
  enabled: boolean;
  componentId: string;
  parameter: ParametricSweepParameter;
  start: string;
  stop: string;
  step: string;
}

export interface TemperatureSweepConfig {
  enabled: boolean;
  start: string;
  stop: string;
  step: string;
}

export const DEFAULT_TEMPERATURE_SWEEP_CONFIG: TemperatureSweepConfig = {
  enabled: false,
  start: '-40',
  stop: '125',
  step: '55',
};

export const SWEEPABLE_COMPONENT_TYPES = new Set<string>([
  'Resistor',
  'Load',
  'Thermistor',
  'LDR',
  'Varistor',
  'Potentiometer',
  'potentiometer',
  'Capacitor',
  'VaractorDiode',
  'Inductor',
  'DCSource',
  'DCCurrent',
  'ACSource',
  'ACCurrent',
]);

export function isSweepableComponent(comp: Pick<SchematicComponent, 'type'> | null | undefined): boolean {
  return Boolean(comp && SWEEPABLE_COMPONENT_TYPES.has(comp.type));
}

export function getSweepTraceKey(baseTrace: string, stepIndex: number): string {
  return `${baseTrace}${SWEEP_TRACE_SEPARATOR}${stepIndex}`;
}

export function formatSweepStepValue(val: number, unitSuffix = ''): string {
  const abs = Math.abs(val);
  let scaled: string;
  if (abs === 0) scaled = '0';
  else if (abs >= 1e6) scaled = `${Number((val / 1e6).toPrecision(3))}M`;
  else if (abs >= 1e3) scaled = `${Number((val / 1e3).toPrecision(3))}k`;
  else if (abs >= 1) scaled = `${Number(val.toPrecision(3))}`;
  else if (abs >= 1e-3) scaled = `${Number((val * 1e3).toPrecision(3))}m`;
  else if (abs >= 1e-6) scaled = `${Number((val * 1e6).toPrecision(3))}µ`;
  else if (abs >= 1e-9) scaled = `${Number((val * 1e9).toPrecision(3))}n`;
  else scaled = `${Number((val * 1e12).toPrecision(3))}p`;
  return unitSuffix ? `${scaled}${unitSuffix}` : scaled;
}

export function getUnitSuffixForComponent(type: string, parameter: ParametricSweepParameter): string {
  if (parameter === 'wiper_position') return '%';
  if (type === 'Resistor' || type === 'Load' || type === 'Potentiometer' || type === 'potentiometer' || type === 'Thermistor' || type === 'LDR' || type === 'Varistor') {
    return 'Ω';
  }
  if (type === 'Capacitor' || type === 'VaractorDiode') return 'F';
  if (type === 'Inductor') return 'H';
  if (type === 'DCSource' || type === 'ACSource') return 'V';
  if (type === 'DCCurrent' || type === 'ACCurrent') return 'A';
  return '';
}

export function getDefaultSweepConfigForComponent(comp: SchematicComponent): ParametricSweepConfig {
  if (comp.type === 'potentiometer') {
    return {
      enabled: true,
      componentId: comp.id,
      parameter: 'wiper_position',
      start: '10',
      stop: '90',
      step: '20',
    };
  }
  const rawToken =
    comp.type === 'ACSource' || comp.type === 'ACCurrent'
      ? (comp.value || '1').split(/\s+/)[0]
      : (comp.value || '1k');
  const baseVal = parseSpiceToFloat(rawToken);
  const safeBase = Number.isFinite(baseVal) && baseVal > 0 ? baseVal : 1000;
  const startVal = safeBase * 0.5;
  const stopVal = safeBase * 2.5;
  const stepVal = safeBase * 0.5;

  return {
    enabled: true,
    componentId: comp.id,
    parameter: 'value',
    start: formatSweepValueForInput(startVal),
    stop: formatSweepValueForInput(stopVal),
    step: formatSweepValueForInput(stepVal),
  };
}

function formatSweepValueForInput(val: number): string {
  const abs = Math.abs(val);
  if (abs === 0) return '0';
  if (abs >= 1e6) return `${Number((val / 1e6).toPrecision(3))}Meg`;
  if (abs >= 1e3) return `${Number((val / 1e3).toPrecision(3))}k`;
  if (abs >= 1) return `${Number(val.toPrecision(3))}`;
  if (abs >= 1e-3) return `${Number((val * 1e3).toPrecision(3))}m`;
  if (abs >= 1e-6) return `${Number((val * 1e6).toPrecision(3))}u`;
  if (abs >= 1e-9) return `${Number((val * 1e9).toPrecision(3))}n`;
  return `${Number((val * 1e12).toPrecision(3))}p`;
}

export interface ExpandedSweepResult {
  steps: SweepStepDescriptor[];
  error?: string;
}

export function expandParametricSweep(
  config: ParametricSweepConfig,
  compType = '',
): ExpandedSweepResult {
  const start = parseSpiceToFloat(config.start);
  const stop = parseSpiceToFloat(config.stop);
  const step = parseSpiceToFloat(config.step);

  if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step)) {
    return { steps: [], error: 'Start, Stop, and Step must be valid numbers or SPICE values (e.g. 1k, 10u).' };
  }
  if (step <= 0) {
    return { steps: [], error: 'Step must be greater than 0.' };
  }
  if (stop < start) {
    return { steps: [], error: 'Stop value must be greater than or equal to Start value.' };
  }

  const suffix = getUnitSuffixForComponent(compType, config.parameter);
  const steps: SweepStepDescriptor[] = [];
  const epsilon = step * 1e-6;

  for (let i = 0; ; i++) {
    const val = start + i * step;
    if (val > stop + epsilon) break;
    if (steps.length >= MAX_PARAMETRIC_SWEEP_STEPS) {
      return {
        steps: [],
        error: `Sweep produces more than ${MAX_PARAMETRIC_SWEEP_STEPS} steps. Increase Step size to stay within ${MAX_PARAMETRIC_SWEEP_STEPS} runs.`,
      };
    }
    const clampedVal = config.parameter === 'wiper_position' ? Math.max(0.1, Math.min(99.9, val)) : val;
    if (config.parameter === 'value' && clampedVal <= 0 && !['DCSource', 'DCCurrent'].includes(compType)) {
      return {
        steps: [],
        error: `${compType || 'Component'} sweep values must be strictly > 0.`,
      };
    }
    steps.push({
      stepIndex: steps.length,
      value: clampedVal,
      label:
        config.parameter === 'wiper_position'
          ? `${Number(clampedVal.toFixed(1))}%`
          : formatSweepStepValue(clampedVal, suffix),
    });
  }

  if (steps.length === 0) {
    return { steps: [], error: 'Sweep generated zero steps.' };
  }

  return { steps };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface PreparedSweepNetlist {
  netlist: string;
  sweepMeta: SweepMetadata;
}

/**
 * Parameterizes the selected component in `baseNetlist` using `{SWEEP_VAL}` and prepends `.param SWEEP_VAL`.
 * Works with ngspice-46 `.control` `alterparam SWEEP_VAL=...` + `reset` + `run`.
 */
export function prepareParametricSweepNetlist(
  baseNetlist: string,
  components: SchematicComponent[],
  config: ParametricSweepConfig,
): PreparedSweepNetlist {
  const comp = components.find((c) => c.id === config.componentId);
  if (!comp) {
    throw new Error(`Parametric sweep component "${config.componentId}" no longer exists on the canvas.`);
  }
  if (!isSweepableComponent(comp)) {
    throw new Error(`Component "${comp.id}" (${comp.type}) does not support parametric sweeping.`);
  }

  const expanded = expandParametricSweep(config, comp.type);
  if (expanded.error || expanded.steps.length === 0) {
    throw new Error(expanded.error || 'Invalid parametric sweep range.');
  }

  const lines = baseNetlist.split(/\r?\n/);
  const escapedId = escapeRegex(comp.id);
  const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
  let replaced = false;

  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('*') || trimmed.startsWith('.')) {
      return line;
    }

    if (comp.type === 'potentiometer') {
      const potARe = new RegExp(`^RA${escapeRegex(safeId)}\\s+(\\S+)\\s+(\\S+)\\s+\\S+`, 'i');
      const potBRe = new RegExp(`^RB${escapeRegex(safeId)}\\s+(\\S+)\\s+(\\S+)\\s+\\S+`, 'i');
      const total = comp.props?.total_resistance ?? 10000;
      const pct = Math.max(0.1, Math.min(99.9, comp.props?.wiper_position ?? 50));

      const mA = trimmed.match(potARe);
      if (mA) {
        replaced = true;
        return config.parameter === 'wiper_position'
          ? `RA${safeId} ${mA[1]} ${mA[2]} {max(0.001, ${total} * SWEEP_VAL / 100)}`
          : `RA${safeId} ${mA[1]} ${mA[2]} {max(0.001, SWEEP_VAL * ${pct} / 100)}`;
      }
      const mB = trimmed.match(potBRe);
      if (mB) {
        replaced = true;
        return config.parameter === 'wiper_position'
          ? `RB${safeId} ${mB[1]} ${mB[2]} {max(0.001, ${total} * (100 - SWEEP_VAL) / 100)}`
          : `RB${safeId} ${mB[1]} ${mB[2]} {max(0.001, SWEEP_VAL * ${100 - pct} / 100)}`;
      }
      return line;
    }

    if (comp.type === 'Potentiometer') {
      const potARe = new RegExp(`^R_${escapedId}_A\\s+(\\S+)\\s+(\\S+)\\s+\\S+`, 'i');
      const potBRe = new RegExp(`^R_${escapedId}_B\\s+(\\S+)\\s+(\\S+)\\s+\\S+`, 'i');
      const mA = trimmed.match(potARe);
      if (mA) {
        replaced = true;
        return `R_${comp.id}_A ${mA[1]} ${mA[2]} {SWEEP_VAL / 2}`;
      }
      const mB = trimmed.match(potBRe);
      if (mB) {
        replaced = true;
        return `R_${comp.id}_B ${mB[1]} ${mB[2]} {SWEEP_VAL / 2}`;
      }
      return line;
    }

    if (comp.type === 'DCSource' || comp.type === 'DCCurrent') {
      const prefix = comp.type === 'DCSource' ? 'V' : 'I';
      const re = new RegExp(`^${prefix}_${escapedId}\\s+(\\S+)\\s+(\\S+)\\s+DC\\s+\\S+`, 'i');
      const m = trimmed.match(re);
      if (m) {
        replaced = true;
        return `${prefix}_${comp.id} ${m[1]} ${m[2]} DC {SWEEP_VAL}`;
      }
      return line;
    }

    if (comp.type === 'ACSource' || comp.type === 'ACCurrent') {
      const prefix = comp.type === 'ACSource' ? 'V' : 'I';
      const re = new RegExp(`^${prefix}_${escapedId}\\s+(\\S+)\\s+(\\S+)\\s+AC\\s+\\S+\\s+SINE\\(\\s*(\\S+)\\s+\\S+\\s+(\\S+)\\s*\\)`, 'i');
      const m = trimmed.match(re);
      if (m) {
        replaced = true;
        return `${prefix}_${comp.id} ${m[1]} ${m[2]} AC {SWEEP_VAL} SINE(${m[3]} {SWEEP_VAL} ${m[4]})`;
      }
      return line;
    }

    // Standard 2-terminal passive (R_id, C_id, L_id)
    const spicePrefix =
      comp.type === 'Capacitor' || comp.type === 'VaractorDiode'
        ? 'C'
        : comp.type === 'Inductor'
        ? 'L'
        : 'R';
    const re = new RegExp(`^${spicePrefix}_${escapedId}\\s+(\\S+)\\s+(\\S+)\\s+\\S+`, 'i');
    const m = trimmed.match(re);
    if (m) {
      replaced = true;
      return `${spicePrefix}_${comp.id} ${m[1]} ${m[2]} {SWEEP_VAL}`;
    }

    return line;
  });

  if (!replaced) {
    throw new Error(`Could not parameterize ${comp.id} in the netlist. Ensure it is wired on the schematic.`);
  }

  const stepMetaLine = `* .step param ${comp.id} (${config.parameter}) ${config.start} ${config.stop} ${config.step}`;
  const paramInitLine = `.param SWEEP_VAL=${expanded.steps[0].value}`;

  // Insert .param immediately after the title line
  const resultLines = [
    updatedLines[0] || '* WebAssembly SPICE Netlist',
    stepMetaLine,
    paramInitLine,
    ...updatedLines.slice(1),
  ];

  return {
    netlist: resultLines.join('\n'),
    sweepMeta: {
      kind: 'param',
      componentId: comp.id,
      parameter: config.parameter,
      steps: expanded.steps,
    },
  };
}

/**
 * Expands a Celsius temperature sweep (`start..stop` by `step`), enforcing absolute-zero bounds and max step cap.
 */
export function expandTemperatureSweep(config: TemperatureSweepConfig): ExpandedSweepResult {
  const start = parseFloat(config.start);
  const stop = parseFloat(config.stop);
  const step = parseFloat(config.step);

  if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step)) {
    return { steps: [], error: 'Start, Stop, and Step must be valid numeric temperatures in °C.' };
  }
  if (start <= -273.15) {
    return { steps: [], error: 'Start temperature must be above absolute zero (-273.15 °C).' };
  }
  if (step <= 0) {
    return { steps: [], error: 'Temperature step must be greater than 0 °C.' };
  }
  if (stop < start) {
    return { steps: [], error: 'Stop temperature must be greater than or equal to Start temperature.' };
  }

  const steps: SweepStepDescriptor[] = [];
  const epsilon = step * 1e-6;
  for (let i = 0; ; i++) {
    const tempC = Number((start + i * step).toFixed(4));
    if (tempC > stop + epsilon) break;
    if (steps.length >= MAX_PARAMETRIC_SWEEP_STEPS) {
      return {
        steps: [],
        error: `Sweep produces more than ${MAX_PARAMETRIC_SWEEP_STEPS} steps. Increase temperature step to stay within ${MAX_PARAMETRIC_SWEEP_STEPS} runs.`,
      };
    }
    steps.push({
      stepIndex: steps.length,
      value: tempC,
      label: `${Number(tempC.toFixed(1))}°C`,
    });
  }

  if (steps.length === 0) {
    return { steps: [], error: 'Temperature sweep generated zero steps.' };
  }

  return { steps };
}

/**
 * Annotates a SPICE netlist for multi-temperature simulation (`option temp=...` inside spiceWorker `.control`).
 */
export function prepareTemperatureSweepNetlist(
  baseNetlist: string,
  config: TemperatureSweepConfig,
): PreparedSweepNetlist {
  const expanded = expandTemperatureSweep(config);
  if (expanded.error || expanded.steps.length === 0) {
    throw new Error(expanded.error || 'Invalid temperature sweep range.');
  }

  const lines = baseNetlist.split(/\r?\n/);
  const tempDirectiveLine = `* .step temp ${config.start} ${config.stop} ${config.step}`;
  const resultLines = [
    lines[0] || '* WebAssembly SPICE Netlist',
    tempDirectiveLine,
    ...lines.slice(1),
  ];

  return {
    netlist: resultLines.join('\n'),
    sweepMeta: {
      kind: 'temp',
      componentId: 'TEMP',
      parameter: 'temp',
      steps: expanded.steps,
    },
  };
}

export type MergedSweepOutput = SpiceDataRow[] & {
  __plotType?: 'transient' | 'ac' | 'dc' | 'op' | 'noise';
  __isComplex?: boolean;
  __variables?: string[];
  __sweepMeta?: SweepMetadata;
};

/**
 * Merges individual step outputs (`step_0`, `step_1`, ...) onto step_0's X axis.
 * Keeps base signal names for step_0 compatibility while storing each step under `<trace>__step_<i>`.
 */
export function mergeParametricSweepOutputs(
  stepOutputs: SpiceParsedOutput[],
  sweepMeta: SweepMetadata,
): MergedSweepOutput {
  if (!stepOutputs.length || !stepOutputs[0]?.length) {
    return Object.assign([], { __plotType: 'transient' as const, __sweepMeta: sweepMeta });
  }

  const baseStep = stepOutputs[0] as SpiceDataRow[];
  const plotType = stepOutputs[0].__plotType || 'transient';
  const isComplex = Boolean(stepOutputs[0].__isComplex);
  const variables = stepOutputs[0].__variables;

  const sampleKeys = Object.keys(baseStep[0] || {}).filter((k) => !k.startsWith('__'));
  const xKey = plotType === 'ac' ? 'frequency' : plotType === 'dc' ? sampleKeys[0] || 'v_sweep' : 'time';
  const traceKeys = sampleKeys.filter((k) => k !== xKey);

  const mergedRows: SpiceDataRow[] = baseStep.map((row) => {
    const outRow: SpiceDataRow = { [xKey]: row[xKey] };
    for (const trace of traceKeys) {
      if (row[trace] !== undefined) {
        outRow[trace] = row[trace];
      }
    }

    const targetX = row[xKey];
    stepOutputs.forEach((stepData, stepIdx) => {
      const stepRows = stepData as SpiceDataRow[];
      for (const trace of traceKeys) {
        const val =
          stepIdx === 0
            ? row[trace]
            : targetX !== undefined
            ? interpolateTraceAtX(stepRows, xKey, trace, targetX)
            : undefined;
        if (val !== undefined && Number.isFinite(val)) {
          outRow[getSweepTraceKey(trace, stepIdx)] = val;
        }
      }
    });

    return outRow;
  });

  return Object.assign(mergedRows, {
    __plotType: plotType,
    __isComplex: isComplex,
    __variables: variables,
    __sweepMeta: sweepMeta,
  });
}
