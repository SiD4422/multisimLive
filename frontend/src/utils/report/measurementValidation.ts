/**
 * measurementValidation.ts
 * 
 * Strict validation and numerical characterization of SPICE simulation vectors.
 * - Rejects parser metadata (e.g. __parsedVars, __plotType) and non-electrical keys.
 * - Accurately computes Min, Max, Peak-to-Peak, Trapezoidal DC Mean, and True RMS.
 * - Formats engineering units (V, mV, µV, A, mA, µA) with proper scientific bounds.
 * - Classifies signal behavior based on dynamic activity.
 */

export interface ValidatedSignalMeasurement {
  signalName: string;
  signalType: 'voltage' | 'current';
  unit: string;
  min: number;
  max: number;
  peakToPeak: number;
  average: number;
  rms: number;
  formattedMin: string;
  formattedMax: string;
  formattedVpp: string;
  formattedAvg: string;
  formattedRms: string;
  behavior: 'STATIC_ZERO' | 'STABLE_DC' | 'SMALL_SIGNAL_AC' | 'LARGE_SIGNAL_SWITCHING';
  behaviorDescription: string;
  isValid: boolean;
  sampleCount: number;
}

export interface DynamicReadingItem {
  signal: string;
  min: string;
  max: string;
  vpp: string;
  avg: string;
  rms: string;
  behavior: string;
}

/**
 * Determines whether a key represents a genuine electrical SPICE signal
 * and not internal parser metadata, timebase, or sweep coordinates.
 */
export function isValidElectricalSignalKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();

  // Exclude internal metadata prefixes (like __parsedVars, __plotType, etc.)
  if (trimmed.startsWith('__')) return false;

  // Exclude domain coordinates
  const lower = trimmed.toLowerCase();
  if (
    lower === 'time' ||
    lower === 'frequency' ||
    lower === 'v_sweep' ||
    lower === 'i_sweep' ||
    lower === 'sweep' ||
    lower === 'index'
  ) {
    return false;
  }

  // Pure integer / numeric strings are parser artifacts, not valid SPICE node names
  if (/^\d+$/.test(trimmed)) return false;

  // Must match standard SPICE vector patterns:
  // v(...), i(...), node names (e.g. OUT, IN, net_1, 1, etc.)
  return true;
}

/**
 * Formats a numeric value into clean engineering units.
 */
export function formatEngineeringValue(val: number, baseUnit: 'V' | 'A' | 'Hz' | 's' | 'W' | 'F' | 'H' | 'Ω'): string {
  if (!isFinite(val)) return `N/A ${baseUnit}`;
  const abs = Math.abs(val);

  if (abs === 0) return `0.000 ${baseUnit}`;
  if (abs >= 1e6) return `${(val / 1e6).toFixed(3)} M${baseUnit}`;
  if (abs >= 1e3) return `${(val / 1e3).toFixed(3)} k${baseUnit}`;
  if (abs >= 1) return `${val.toFixed(3)} ${baseUnit}`;
  if (abs >= 1e-3) return `${(val * 1e3).toFixed(3)} m${baseUnit}`;
  if (abs >= 1e-6) return `${(val * 1e6).toFixed(3)} µ${baseUnit}`;
  if (abs >= 1e-9) return `${(val * 1e9).toFixed(3)} n${baseUnit}`;
  if (abs >= 1e-12) return `${(val * 1e12).toFixed(3)} p${baseUnit}`;

  return `${val.toExponential(3)} ${baseUnit}`;
}

/**
 * Extracts, validates, and computes time-domain electrical readings from simulation rows.
 * Uses trapezoidal numerical integration when a monotonic 'time' vector is present,
 * ensuring high fidelity for non-uniform SPICE integration steps.
 */
export function extractValidatedReadings(
  simulationBuffer: Record<string, number>[] | null | undefined
): ValidatedSignalMeasurement[] {
  if (!simulationBuffer || !Array.isArray(simulationBuffer) || simulationBuffer.length === 0) {
    return [];
  }

  const firstRow = simulationBuffer[0];
  if (!firstRow) return [];

  // Filter keys strictly: NO metadata (__*), NO timebase
  const signalKeys = Object.keys(firstRow).filter(isValidElectricalSignalKey);
  const timeAvailable = 'time' in firstRow && simulationBuffer.length > 1;
  const timeVec = timeAvailable ? simulationBuffer.map(r => r.time) : null;
  const totalDuration = (timeVec && timeVec.length > 1) ? (timeVec[timeVec.length - 1] - timeVec[0]) : 0;

  return signalKeys.map(key => {
    const rawValues = simulationBuffer.map(r => r[key]);
    const validPairs: { t: number; v: number }[] = [];

    for (let i = 0; i < simulationBuffer.length; i++) {
      const v = rawValues[i];
      if (typeof v === 'number' && isFinite(v)) {
        const t = timeVec ? timeVec[i] : i;
        validPairs.push({ t, v });
      }
    }

    const isCurrent = key.toLowerCase().startsWith('i(') || key.toLowerCase().startsWith('i_');
    const baseUnit: 'V' | 'A' = isCurrent ? 'A' : 'V';

    if (validPairs.length === 0) {
      return {
        signalName: key,
        signalType: isCurrent ? 'current' : 'voltage',
        unit: baseUnit,
        min: 0,
        max: 0,
        peakToPeak: 0,
        average: 0,
        rms: 0,
        formattedMin: `0.000 ${baseUnit}`,
        formattedMax: `0.000 ${baseUnit}`,
        formattedVpp: `0.000 ${baseUnit}`,
        formattedAvg: `0.000 ${baseUnit}`,
        formattedRms: `0.000 ${baseUnit}`,
        behavior: 'STATIC_ZERO',
        behaviorDescription: 'No finite samples recorded',
        isValid: false,
        sampleCount: 0,
      };
    }

    // Min and Max
    let min = validPairs[0].v;
    let max = validPairs[0].v;
    for (let i = 1; i < validPairs.length; i++) {
      const v = validPairs[i].v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const peakToPeak = max - min;

    // Time-weighted integration (Trapezoidal Rule) for Mean and RMS
    let average = 0;
    let rms = 0;

    if (timeVec && totalDuration > 0 && validPairs.length === simulationBuffer.length) {
      let integralMean = 0;
      let integralSq = 0;
      for (let i = 0; i < validPairs.length - 1; i++) {
        const dt = validPairs[i + 1].t - validPairs[i].t;
        const v1 = validPairs[i].v;
        const v2 = validPairs[i + 1].v;
        integralMean += ((v1 + v2) / 2) * dt;
        integralSq += ((v1 * v1 + v2 * v2) / 2) * dt;
      }
      average = integralMean / totalDuration;
      rms = Math.sqrt(Math.max(0, integralSq / totalDuration));
    } else {
      // Discrete fallback if timebase is missing or irregular
      const n = validPairs.length;
      const sum = validPairs.reduce((acc, p) => acc + p.v, 0);
      const sumSq = validPairs.reduce((acc, p) => acc + p.v * p.v, 0);
      average = sum / n;
      rms = Math.sqrt(Math.max(0, sumSq / n));
    }

    // Behavior Classification
    let behavior: ValidatedSignalMeasurement['behavior'] = 'STABLE_DC';
    let behaviorDescription = 'Stable DC Quiescent Bias';

    const absMax = Math.max(Math.abs(min), Math.abs(max));
    if (absMax < 1e-6) {
      behavior = 'STATIC_ZERO';
      behaviorDescription = 'Static Zero (Ground / Inactive Node)';
    } else if (isCurrent) {
      if (peakToPeak > 0.005) {
        behavior = 'LARGE_SIGNAL_SWITCHING';
        behaviorDescription = 'Dynamic AC Branch Current';
      } else if (peakToPeak > 0.0005) {
        behavior = 'SMALL_SIGNAL_AC';
        behaviorDescription = 'Small-Signal AC Ripple Current';
      } else {
        behavior = 'STABLE_DC';
        behaviorDescription = 'Quiescent DC Current';
      }
    } else {
      // Voltage
      if (peakToPeak > 0.2) {
        behavior = 'LARGE_SIGNAL_SWITCHING';
        behaviorDescription = 'Dynamic Switching / Oscillating Pulse';
      } else if (peakToPeak > 0.02) {
        behavior = 'SMALL_SIGNAL_AC';
        behaviorDescription = 'Small-Signal AC / Ripple';
      } else {
        behavior = 'STABLE_DC';
        behaviorDescription = 'Regulated DC Voltage Bias';
      }
    }

    return {
      signalName: key,
      signalType: isCurrent ? 'current' : 'voltage',
      unit: baseUnit,
      min,
      max,
      peakToPeak,
      average,
      rms,
      formattedMin: formatEngineeringValue(min, baseUnit),
      formattedMax: formatEngineeringValue(max, baseUnit),
      formattedVpp: formatEngineeringValue(peakToPeak, baseUnit),
      formattedAvg: formatEngineeringValue(average, baseUnit),
      formattedRms: formatEngineeringValue(rms, baseUnit),
      behavior,
      behaviorDescription,
      isValid: true,
      sampleCount: validPairs.length,
    };
  });
}

/**
 * Adapter converting ValidatedSignalMeasurement array to DynamicReadingItem
 * for backward compatibility with existing report UI and PDF tables.
 */
export function toDynamicReadingItems(measurements: ValidatedSignalMeasurement[]): DynamicReadingItem[] {
  return measurements
    .filter(m => m.isValid)
    .map(m => ({
      signal: m.signalName,
      min: m.formattedMin,
      max: m.formattedMax,
      vpp: m.formattedVpp,
      avg: m.formattedAvg,
      rms: m.formattedRms,
      behavior: m.behaviorDescription,
    }));
}
