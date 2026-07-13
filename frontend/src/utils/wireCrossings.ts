/**
 * wireCrossings.ts
 * Detects crossing points between wire polylines on the schematic canvas.
 */

export interface WirePoint { x: number; y: number; }
export interface WireForCross  { id: string; points: WirePoint[]; }
export interface Crossing { x: number; y: number; angle: number; }

function segmentIntersect(
  p1: WirePoint, p2: WirePoint,
  p3: WirePoint, p4: WirePoint
): { x: number; y: number; angle: number } | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-9) return null;

  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / cross;
  const s = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / cross;

  const EPS = 0.05;
  if (t <= EPS || t >= 1 - EPS) return null;
  if (s <= EPS || s >= 1 - EPS) return null;

  return {
    x: p1.x + t * d1x,
    y: p1.y + t * d1y,
    angle: Math.atan2(d1y, d1x) * (180 / Math.PI),
  };
}

function wireSegments(wire: WireForCross): Array<{ a: WirePoint; b: WirePoint }> {
  const segs: Array<{ a: WirePoint; b: WirePoint }> = [];
  for (let i = 0; i < wire.points.length - 1; i++) {
    segs.push({ a: wire.points[i], b: wire.points[i + 1] });
  }
  return segs;
}

const SNAP = 10;
function snapKey(x: number, y: number) {
  return `${Math.round(x / SNAP) * SNAP},${Math.round(y / SNAP) * SNAP}`;
}

export function computeWireCrossings(
  wires: WireForCross[],
  junctions: WirePoint[]
): Crossing[] {
  const junctionSet = new Set(junctions.map(j => snapKey(j.x, j.y)));
  const crossings: Crossing[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < wires.length; i++) {
    const segsA = wireSegments(wires[i]);
    for (let j = i + 1; j < wires.length; j++) {
      const segsB = wireSegments(wires[j]);
      for (const segA of segsA) {
        for (const segB of segsB) {
          const hit = segmentIntersect(segA.a, segA.b, segB.a, segB.b);
          if (!hit) continue;
          const key = snapKey(hit.x, hit.y);
          if (junctionSet.has(key)) continue;
          if (seen.has(key)) continue;
          seen.add(key);
          crossings.push({ x: hit.x, y: hit.y, angle: hit.angle });
        }
      }
    }
  }
  return crossings;
}
