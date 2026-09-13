import type { Wire, SchematicComponent } from '../store/useSchematicStore';
import type { Point } from '../store/useSchematicStore';
import { getSpiceNodeForPoint } from './netlister';

// ─────────────────────────────────────────────────────────────────────────────
// MEMO 1: Schema-level mapping  (recompute only when wires/components change)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a stable map of wireId → SPICE node string (e.g. "1", "2", "0").
 * This is the expensive part — full net resolution via getSpiceNodeForPoint.
 * Memoize on [wires, components] only.
 */
export function buildWireNodeMap(
  wires: Wire[],
  components: SchematicComponent[]
): Map<string, string> {
  const wireNodeMap = new Map<string, string>();
  for (const wire of wires) {
    if (wire.points.length === 0) continue;
    // Use midpoint for robust resolution (avoids T-junction ambiguity at endpoints)
    const midIdx = Math.floor(wire.points.length / 2);
    const spiceNode = getSpiceNodeForPoint(wire.points[midIdx], components, wires);
    wireNodeMap.set(wire.id, spiceNode);
  }
  return wireNodeMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMO 2: Frame-level voltage lookup  (recompute on playbackTime / simulationBuffer)
// ─────────────────────────────────────────────────────────────────────────────

export interface WireVoltageResult {
  wireColorMap: Map<string, string>;     // wireId → CSS color
  wireVoltageMap: Map<string, number>;   // wireId → voltage value
  maxV: number;                          // global max |V| for normalization
}

/**
 * Given the pre-built wireNodeMap, looks up voltages from the simulation buffer
 * at the current playback time and returns color + voltage maps.
 * Cheap — no geometry. Memoize on [wireNodeMap, simulationBuffer, playbackTime].
 */
export function buildWireVoltageResult(
  wireNodeMap: Map<string, string>,
  simulationBuffer: Record<string, number>[] | null,
  playbackTime: number
): WireVoltageResult {
  const wireColorMap = new Map<string, string>();
  const wireVoltageMap = new Map<string, number>();

  if (!simulationBuffer || simulationBuffer.length === 0) {
    return { wireColorMap, wireVoltageMap, maxV: 0 };
  }

  // Find the data row matching current playback time
  let row: Record<string, number>;
  if (playbackTime === Infinity) {
    row = simulationBuffer[simulationBuffer.length - 1];
  } else {
    row = simulationBuffer[0];
    for (let i = simulationBuffer.length - 1; i >= 0; i--) {
      if ((simulationBuffer[i].time ?? 0) <= playbackTime) {
        row = simulationBuffer[i];
        break;
      }
    }
  }

  if (!row) return { wireColorMap, wireVoltageMap, maxV: 0 };

  // Dynamic normalization: max |V| across all nodes in THIS timestep
  let maxV = 0;
  for (const key of Object.keys(row)) {
    if (key.startsWith('v(') || key.startsWith('V(')) {
      const v = Math.abs(row[key] ?? 0);
      if (v > maxV) maxV = v;
    }
  }
  if (maxV === 0) maxV = 1; // only guard against all-zero (no simulation / pure ground)

  for (const [wireId, spiceNode] of wireNodeMap.entries()) {
    let voltage = 0;
    if (spiceNode !== '0') {
      const key1 = `v(${spiceNode})`;
      const key2 = `V(${spiceNode})`;
      voltage = row[key1] ?? row[key2] ?? 0;
    }
    wireVoltageMap.set(wireId, voltage);
    wireColorMap.set(wireId, voltageToColor(voltage, maxV));
  }

  return { wireColorMap, wireVoltageMap, maxV };
}

// ─────────────────────────────────────────────────────────────────────────────
// Color mapping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps a voltage to a vivid HSL color.
 *  GND (≈0V)  → vivid green  #16a34a
 *  Positive V → green → yellow → orange → red (hue 120→0)
 *  Negative V → green → teal → indigo → blue (hue 120→240)
 */
export function voltageToColor(voltage: number, maxV: number): string {
  const norm = maxV > 0 ? Math.max(-1, Math.min(1, voltage / maxV)) : 0;

  if (Math.abs(norm) < 0.03) return '#16a34a'; // Ground green

  if (norm > 0) {
    const hue = Math.round(120 - norm * 120); // 120→0
    const lit = Math.round(45 - norm * 8);
    return `hsl(${hue}, 90%, ${lit}%)`;
  } else {
    const t = -norm;
    const hue = Math.round(120 + t * 120); // 120→240
    const lit = Math.round(45 - t * 8);
    return `hsl(${hue}, 85%, ${lit}%)`;
  }
}

/**
 * Maps |voltage| normalized to [0,1] to a stroke width in [2, 3.5].
 * Uses dynamic maxV from the current timestep for correct normalization.
 */
export function voltageToStrokeWidth(voltage: number, maxV: number): number {
  if (maxV === 0) return 2;
  const norm = Math.min(1, Math.abs(voltage) / maxV);
  return 2 + norm * 1.5; // 2px baseline → 3.5px at max voltage
}

// ─────────────────────────────────────────────────────────────────────────────
// Polyline parametric interpolation  (for animated current dots)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the {x, y} position at parametric position t ∈ [0, 1] along a
 * multi-segment polyline. Handles segment joints correctly — no teleporting.
 */
export function getPointAlongPolyline(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  // Pre-compute cumulative arc length for each segment
  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return points[0];

  // Clamp t
  const tClamped = Math.max(0, Math.min(1, t));
  const target = tClamped * totalLength;

  // Walk segments until we find where target distance falls
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    const segLen = segLengths[i];
    if (accumulated + segLen >= target || i === segLengths.length - 1) {
      // Target is within this segment
      const segT = segLen > 0 ? (target - accumulated) / segLen : 0;
      const p0 = points[i];
      const p1 = points[i + 1];
      return {
        x: p0.x + segT * (p1.x - p0.x),
        y: p0.y + segT * (p1.y - p0.y),
      };
    }
    accumulated += segLen;
  }

  return points[points.length - 1];
}
