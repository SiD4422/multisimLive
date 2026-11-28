import type { SimulationRow } from './spiceTypes';

export const GHOST_TRACE_PREFIX = '__prev__';

export function getGhostDataKey(traceKey: string): string {
  return `${GHOST_TRACE_PREFIX}${traceKey}`;
}

/**
 * Binary-searches sorted monotonic rows and linearly interpolates `traceKey` at `targetX`.
 * Returns `undefined` when `targetX` is outside the previous run's domain or data is missing.
 */
export function interpolateTraceAtX(
  sortedRows: ReadonlyArray<Record<string, number | undefined>>,
  xKey: string,
  traceKey: string,
  targetX: number,
): number | undefined {
  if (!sortedRows || sortedRows.length === 0 || !Number.isFinite(targetX)) {
    return undefined;
  }

  const minX = sortedRows[0]?.[xKey];
  const maxX = sortedRows[sortedRows.length - 1]?.[xKey];
  if (typeof minX !== 'number' || !Number.isFinite(minX) || typeof maxX !== 'number' || !Number.isFinite(maxX)) {
    return undefined;
  }

  const ascending = maxX >= minX;
  const loBound = ascending ? minX : maxX;
  const hiBound = ascending ? maxX : minX;
  if (targetX < loBound || targetX > hiBound) {
    return undefined;
  }

  if (sortedRows.length === 1) {
    const singleVal = sortedRows[0][traceKey];
    return typeof singleVal === 'number' && Number.isFinite(singleVal) ? singleVal : undefined;
  }

  let lo = 0;
  let hi = sortedRows.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    const midX = sortedRows[mid]?.[xKey];
    if (typeof midX !== 'number' || !Number.isFinite(midX)) break;
    if ((ascending && midX <= targetX) || (!ascending && midX >= targetX)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const r0 = sortedRows[lo];
  const r1 = sortedRows[hi];
  const x0 = r0?.[xKey];
  const x1 = r1?.[xKey];
  const y0 = r0?.[traceKey];
  const y1 = r1?.[traceKey];

  if (
    typeof x0 !== 'number' || !Number.isFinite(x0) ||
    typeof x1 !== 'number' || !Number.isFinite(x1) ||
    typeof y0 !== 'number' || !Number.isFinite(y0) ||
    typeof y1 !== 'number' || !Number.isFinite(y1)
  ) {
    if (typeof y0 === 'number' && Number.isFinite(y0)) return y0;
    if (typeof y1 === 'number' && Number.isFinite(y1)) return y1;
    return undefined;
  }

  const span = x1 - x0;
  if (Math.abs(span) <= Number.EPSILON) {
    return y0;
  }
  const t = Math.max(0, Math.min(1, (targetX - x0) / span));
  return y0 + (y1 - y0) * t;
}

export interface MergeGhostTracesResult {
  rows: SimulationRow[];
  ghostTraces: string[];
}

/**
 * Overlays interpolated values from `previousRows` onto `currentRows` under `__prev__<trace>`.
 * Keeps `currentRows` untouched when `previousRows` is empty or contains no matching traces.
 */
export function mergeGhostTraces(
  currentRows: SimulationRow[],
  previousRows: SimulationRow[] | null,
  xKey: string,
  traces: string[],
): MergeGhostTracesResult {
  if (!currentRows.length || !previousRows || previousRows.length === 0 || traces.length === 0) {
    return { rows: currentRows, ghostTraces: [] };
  }

  const matchedTraces = traces.filter((trace) =>
    previousRows.some((row) => Number.isFinite(row[trace])),
  );
  if (matchedTraces.length === 0) {
    return { rows: currentRows, ghostTraces: [] };
  }

  const rows = currentRows.map((row) => {
    const targetX = row[xKey];
    if (!Number.isFinite(targetX)) return row;
    let augmented: SimulationRow | null = null;
    for (const trace of matchedTraces) {
      const prevVal = interpolateTraceAtX(previousRows, xKey, trace, targetX);
      if (prevVal !== undefined) {
        if (!augmented) augmented = { ...row };
        augmented[getGhostDataKey(trace)] = prevVal;
      }
    }
    return augmented ?? row;
  });

  return { rows, ghostTraces: matchedTraces };
}
