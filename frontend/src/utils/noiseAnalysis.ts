import type { Probe, SchematicComponent, Wire } from '../store/useSchematicStore';
import { getSpiceNodeForPoint } from './netlister';
import type { NoiseSummary } from './spiceTypes';

export interface NoiseSettings {
  outputNode: string;
  inputSource: string;
  fStart: string;
  fStop: string;
  points: string;
  variation: 'dec' | 'oct' | 'lin';
}

export const DEFAULT_NOISE_SETTINGS: NoiseSettings = {
  outputNode: '',
  inputSource: 'V1',
  fStart: '1',
  fStop: '1Meg',
  points: '10',
  variation: 'dec',
};

const SOURCE_COMPONENT_TYPES = new Set<string>([
  'DCSource',
  'ACSource',
  'PulseVoltage',
  'ClockVoltage',
  'StepVoltage',
  'TriangularVoltage',
  'AMVoltage',
  'FMVoltage',
  'ChirpVoltage',
  'DCCurrent',
  'ACCurrent',
  'PulseCurrent',
  'ClockCurrent',
  'StepCurrent',
  'TriangularCurrent',
  'FMCurrent',
  'ChirpCurrent',
]);

export function listNoiseCandidateSources(components: SchematicComponent[]): SchematicComponent[] {
  return components.filter((c) => SOURCE_COMPONENT_TYPES.has(c.type));
}

function resolveSpiceSourceName(sourceComp: SchematicComponent | undefined, fallbackId: string): string {
  const id = (sourceComp?.id || fallbackId || '').trim();
  if (!id) return '';
  if (/^[VI]_/i.test(id)) return id;
  if (sourceComp?.type.includes('Current') || /^I\d+/i.test(id)) {
    return `I_${id}`;
  }
  return `V_${id}`;
}

function normalizeNodeName(raw: string): string {
  const trimmed = raw.trim();
  const wrapped = trimmed.match(/^v\(\s*([^),\s]+)(?:\s*,\s*0)?\s*\)$/i);
  if (wrapped) return wrapped[1];
  return trimmed;
}

export interface BuiltNoiseDirective {
  directive: string;
  outputNode: string;
  inputSource: string;
}

/**
 * Resolves output probe node + SPICE source name and builds a valid ngspice `.noise` command.
 * Supports automatic output node detection from the first Voltage Probe on the canvas.
 */
export function buildNoiseDirective(
  netlist: string,
  components: SchematicComponent[],
  wires: Wire[],
  probes: Probe[],
  settings: NoiseSettings,
): BuiltNoiseDirective {
  // 1. Resolve output node (explicit field -> first Voltage Probe -> clear error)
  let outputNode = normalizeNodeName(settings.outputNode);
  if (!outputNode) {
    const voltageProbe = probes.find((p) => p.type === 'Voltage');
    if (voltageProbe) {
      outputNode = getSpiceNodeForPoint(voltageProbe.position, components, wires);
    }
  }
  if (!outputNode || outputNode === '0' || /^NC_/i.test(outputNode)) {
    throw new Error(
      'Noise analysis requires a connected Voltage Probe on a non-ground output wire (or an explicit Output Node in Simulation Settings).',
    );
  }

  // 2. Resolve input source (selected ID -> first source on canvas -> validate present in netlist)
  const candidates = listNoiseCandidateSources(components);
  const requestedId = settings.inputSource.trim();
  const matchedComp =
    candidates.find((c) => c.id.toLowerCase() === requestedId.toLowerCase()) ??
    candidates[0];
  const spiceSourceName = resolveSpiceSourceName(matchedComp, requestedId);
  if (!spiceSourceName) {
    throw new Error('Noise analysis requires an input voltage or current source in the circuit.');
  }

  const hasSourceInNetlist = netlist
    .split(/\r?\n/)
    .some((line) => {
      const firstToken = line.trim().split(/\s+/)[0] || '';
      return firstToken.toLowerCase() === spiceSourceName.toLowerCase();
    });

  if (!hasSourceInNetlist) {
    throw new Error(
      `Noise input source "${matchedComp?.id || requestedId}" was not found in the circuit netlist. Select an active source in Simulation Settings.`,
    );
  }

  const variation = settings.variation === 'oct' || settings.variation === 'lin' ? settings.variation : 'dec';
  const points = settings.points.trim() || '10';
  const fStart = settings.fStart.trim() || '1';
  const fStop = settings.fStop.trim() || '1Meg';

  return {
    directive: `.noise V(${outputNode}) ${spiceSourceName} ${variation} ${points} ${fStart} ${fStop}`,
    outputNode,
    inputSource: matchedComp?.id || spiceSourceName,
  };
}

/**
 * Parses ngspice `noise2` Integrated Noise `.raw` output (`v(onoise_total)`, `v(inoise_total)`).
 */
export function parseIntegratedNoiseRaw(
  rawStr: string,
  meta: { outputNode: string; inputSource: string },
): NoiseSummary | undefined {
  if (!rawStr) return undefined;
  const lines = rawStr.split(/\r?\n/).map((l) => l.trim());
  const variables: string[] = [];
  const values: number[] = [];
  let mode: 'header' | 'vars' | 'values' = 'header';

  for (const line of lines) {
    if (!line) continue;
    if (line === 'Variables:') {
      mode = 'vars';
      continue;
    }
    if (line === 'Values:') {
      mode = 'values';
      continue;
    }
    if (mode === 'vars') {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        variables.push(parts[1].toLowerCase());
      }
    } else if (mode === 'values') {
      const parts = line.split(/\s+/);
      const token = /^\d+$/.test(parts[0]) && parts.length >= 2 ? parts[1] : parts[0];
      const num = parseFloat(token);
      if (Number.isFinite(num)) {
        values.push(num);
      }
    }
  }

  const outIdx = variables.findIndex((v) => v.includes('onoise_total'));
  const inIdx = variables.findIndex((v) => v.includes('inoise_total'));
  const onoiseTotal = outIdx >= 0 ? values[outIdx] : values[0];
  const inoiseTotal = inIdx >= 0 ? values[inIdx] : values[1];

  if (typeof onoiseTotal !== 'number' || !Number.isFinite(onoiseTotal)) {
    return undefined;
  }

  return {
    onoiseTotal,
    inoiseTotal: typeof inoiseTotal === 'number' && Number.isFinite(inoiseTotal) ? inoiseTotal : 0,
    outputNode: meta.outputNode,
    inputSource: meta.inputSource,
  };
}

/**
 * Formats noise spectral density in SI units (`pV/√Hz`, `nV/√Hz`, `µV/√Hz`, `mV/√Hz`, `V/√Hz`).
 */
export function formatNoiseDensity(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0 V/√Hz';
  const abs = Math.abs(value);
  if (abs >= 1) return `${value.toPrecision(3)} V/√Hz`;
  if (abs >= 1e-3) return `${(value * 1e3).toPrecision(3)} mV/√Hz`;
  if (abs >= 1e-6) return `${(value * 1e6).toPrecision(3)} µV/√Hz`;
  if (abs >= 1e-9) return `${(value * 1e9).toPrecision(3)} nV/√Hz`;
  if (abs >= 1e-12) return `${(value * 1e12).toPrecision(3)} pV/√Hz`;
  return `${value.toExponential(2)} V/√Hz`;
}

export function formatRmsNoiseVoltage(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0 Vrms';
  const abs = Math.abs(value);
  if (abs >= 1) return `${value.toPrecision(3)} Vrms`;
  if (abs >= 1e-3) return `${(value * 1e3).toPrecision(3)} mVrms`;
  if (abs >= 1e-6) return `${(value * 1e6).toPrecision(3)} µVrms`;
  if (abs >= 1e-9) return `${(value * 1e9).toPrecision(3)} nVrms`;
  if (abs >= 1e-12) return `${(value * 1e12).toPrecision(3)} pVrms`;
  return `${value.toExponential(2)} Vrms`;
}
