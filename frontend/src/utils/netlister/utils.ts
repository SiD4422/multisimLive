import type { Point } from '../../store/useSchematicStore';

export const GRID_SIZE = 10;

// Grid-based matching robustly handles floating point errors from rotations
export const toGridNode = (p: Point & { _isFake?: boolean, _probeId?: string }): string => {
  if (p._isFake) return `FAKE_${p._probeId}`;
  return `${Math.round(p.x / GRID_SIZE)},${Math.round(p.y / GRID_SIZE)}`;
};
export const isSameGridNode = (n1: string, n2: string) => n1 === n2;

// Tolerance for probe placement (strict — must be very close to wire)
export const PROBE_TOLERANCE = GRID_SIZE / 2;
// Tolerance for component pin detection (lenient — handle 1-grid misalignments from rotation)
export const PIN_TOLERANCE = GRID_SIZE * 1.5;

export function isPointOnSegment(p: Point, a: Point & { _isFake?: boolean }, b: Point & { _isFake?: boolean }, tolerance = PROBE_TOLERANCE): boolean {
  // If the segment starts or ends with a fake point (meaning it's the split half of an Ammeter cut),
  // and the component pin is exactly AT that fake point, do NOT geometrically claim it.
  if (a._isFake && Math.abs(p.x - a.x) < 0.1 && Math.abs(p.y - a.y) < 0.1) return false;
  if (b._isFake && Math.abs(p.x - b.x) < 0.1 && Math.abs(p.y - b.y) < 0.1) return false;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  
  if (l2 === 0) {
    // a == b
    return Math.hypot(p.x - a.x, p.y - a.y) <= tolerance;
  }
  
  // Consider the line extending the segment, parameterized as a + t (b - a).
  // We find projection of point p onto the line.
  // It falls where t = [(p-a) . (b-a)] / |b-a|^2
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  
  // We clamp t from [0,1] to handle points outside the segment.
  t = Math.max(0, Math.min(1, t));
  
  // Projection falls on the segment
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  
  const distance = Math.hypot(p.x - projX, p.y - projY);
  return distance <= tolerance;
}
