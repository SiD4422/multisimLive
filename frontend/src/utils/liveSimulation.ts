import { parseSpiceToFloat } from './netlister';

export const LIVE_RESIM_DEBOUNCE_MS = 300;

export interface LiveSimStoreSnapshot {
  isLiveMode: boolean;
  components: { length: number };
  simulationBuffer: unknown[] | null;
  opData: unknown[] | null;
  runSimulation: (isSilent?: boolean) => Promise<void> | void;
}

type StoreGetter = () => LiveSimStoreSnapshot;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let boundGetState: StoreGetter | null = null;

export function bindLiveSimulationStore(getter: StoreGetter): void {
  boundGetState = getter;
}

export function canAutoResimulate(state: LiveSimStoreSnapshot): boolean {
  if (!state.isLiveMode) return false;
  if (!state.components || state.components.length === 0) return false;
  const hasTransientOrSweep = Boolean(state.simulationBuffer && state.simulationBuffer.length > 0);
  const hasOp = Boolean(state.opData && state.opData.length > 0);
  return hasTransientOrSweep || hasOp;
}

export function scheduleLiveResimulation(
  delayMs: number = LIVE_RESIM_DEBOUNCE_MS,
  getter: StoreGetter | null = boundGetState,
): boolean {
  if (!getter) return false;
  const state = getter();
  if (!canAutoResimulate(state)) {
    return false;
  }

  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const latest = getter();
    if (canAutoResimulate(latest)) {
      void latest.runSimulation(true);
    }
  }, delayMs);

  return true;
}

export function cancelLiveResimulation(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function isLiveResimPending(): boolean {
  return debounceTimer !== null;
}

function roundToTwoSigFigs(value: number): number {
  if (value <= 0 || !Number.isFinite(value)) return value;
  const exp = Math.floor(Math.log10(value));
  const factor = Math.pow(10, 1 - exp);
  return Math.round(value * factor) / factor;
}

function formatCleanScalar(num: number): string {
  const rounded = Number(num.toPrecision(3));
  return String(rounded);
}

export interface LogValueSliderSpec {
  minDisplay: number;
  maxDisplay: number;
  unitPrefix: string;
  unitSuffix: string;
  currentScalar: number;
  sliderPos: number; // 0..100
  formatValueAtPos: (pos: number) => { scalarStr: string; fullValue: string; displayLabel: string };
}

const DEFAULT_SUFFIX: Record<string, string> = {
  Resistor: '\u03a9',
  Load: '\u03a9',
  Potentiometer: '\u03a9',
  Capacitor: 'F',
  Inductor: 'H',
};

const UNIT_DISPLAY_PREFIX: Record<string, string> = {
  '': '',
  k: 'k',
  M: 'M',
  m: 'm',
  u: '\u00b5',
  n: 'n',
  p: 'p',
};

/**
 * Builds a smooth 0..100 logarithmic slider across `[0.1, 1000]` in the component's active unit prefix
 * for passive R / C / L components (or `[1, 1000]` if base-ohm / wide values demand it).
 */
export function getPassiveSliderSpec(
  compType: string,
  scalarStr: string,
  unitPrefix: string,
): LogValueSliderSpec | null {
  const suffix = DEFAULT_SUFFIX[compType];
  if (!suffix) return null;

  const parsed = parseFloat(scalarStr);
  const currentScalar = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const minDisplay = currentScalar < 0.1 ? currentScalar : 0.1;
  const maxDisplay = currentScalar > 1000 ? currentScalar * 2 : 1000;

  const minLog = Math.log10(minDisplay);
  const maxLog = Math.log10(maxDisplay);
  const spanLog = maxLog - minLog || 1;
  const rawPos = ((Math.log10(currentScalar) - minLog) / spanLog) * 100;
  const sliderPos = Math.round(Math.max(0, Math.min(100, rawPos)));

  const displayUnit = `${UNIT_DISPLAY_PREFIX[unitPrefix] ?? unitPrefix}${suffix}`;

  return {
    minDisplay,
    maxDisplay,
    unitPrefix,
    unitSuffix: suffix,
    currentScalar,
    sliderPos,
    formatValueAtPos: (pos: number) => {
      const clamped = Math.max(0, Math.min(100, pos));
      const val = roundToTwoSigFigs(Math.pow(10, minLog + (clamped / 100) * spanLog));
      const cleanStr = formatCleanScalar(val);
      return {
        scalarStr: cleanStr,
        fullValue: `${cleanStr}${unitPrefix}${suffix}`,
        displayLabel: `${cleanStr} ${displayUnit}`,
      };
    },
  };
}

export interface LinearSliderSpec {
  min: number;
  max: number;
  step: number;
  current: number;
  unitLabel: string;
}

export function getVoltageOrCurrentSliderSpec(
  compType: string,
  rawValue: string,
): LinearSliderSpec | null {
  if (compType !== 'DCSource' && compType !== 'ClockVoltage' && compType !== 'DiodeZener') {
    return null;
  }
  const numeric = parseSpiceToFloat(rawValue || (compType === 'DiodeZener' ? '5.1' : '5'));
  const current = Number.isFinite(numeric) ? Math.max(0, numeric) : 5;
  const min = compType === 'DiodeZener' ? 1.8 : 0;
  const max = Math.max(24, Math.ceil(current * 2));
  return {
    min,
    max,
    step: 0.1,
    current: Math.max(min, current),
    unitLabel: 'V',
  };
}

export function getAcFrequencyLogSlider(freqRaw: string): {
  minHz: number;
  maxHz: number;
  currentHz: number;
  sliderPos: number;
  hzFromPos: (pos: number) => { hz: number; spiceStr: string; label: string };
} {
  const parsed = parseSpiceToFloat(freqRaw || '1k');
  const currentHz = Number.isFinite(parsed) && parsed > 0 ? parsed : 1000;
  const minHz = currentHz < 10 ? currentHz : 10;
  const maxHz = currentHz > 100_000 ? currentHz * 2 : 100_000;
  const minLog = Math.log10(minHz);
  const spanLog = Math.log10(maxHz) - minLog || 1;
  const sliderPos = Math.round(Math.max(0, Math.min(100, ((Math.log10(currentHz) - minLog) / spanLog) * 100)));

  return {
    minHz,
    maxHz,
    currentHz,
    sliderPos,
    hzFromPos: (pos: number) => {
      const clamped = Math.max(0, Math.min(100, pos));
      const hz = roundToTwoSigFigs(Math.pow(10, minLog + (clamped / 100) * spanLog));
      if (hz >= 1000) {
        const k = formatCleanScalar(hz / 1000);
        return { hz, spiceStr: `${k}k`, label: `${k} kHz` };
      }
      const rawStr = formatCleanScalar(hz);
      return { hz, spiceStr: rawStr, label: `${rawStr} Hz` };
    },
  };
}
