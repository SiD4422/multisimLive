const GRID_SIZE = 10;
const toGridNode = (p: any): string => `${Math.round(p.x / GRID_SIZE)},${Math.round(p.y / GRID_SIZE)}`;

function isPointOnSegment(p: any, a: any, b: any): boolean {
  const tolerance = GRID_SIZE / 2;
  const minX = Math.min(a.x, b.x) - tolerance;
  const maxX = Math.max(a.x, b.x) + tolerance;
  const minY = Math.min(a.y, b.y) - tolerance;
  const maxY = Math.max(a.y, b.y) + tolerance;
  
  // Must be within bounding box
  if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) return false;
  
  // Must be collinear (since wires are orthogonal, either x or y should match closely)
  const isHorizontal = Math.abs(a.y - b.y) < 1;
  const isVertical = Math.abs(a.x - b.x) < 1;
  
  if (isHorizontal && Math.abs(p.y - a.y) <= tolerance) return true;
  if (isVertical && Math.abs(p.x - a.x) <= tolerance) return true;
  
  return false;
}

// Test wire from (100, 100) to (200, 100)
// Point at (150, 100)
const wire = { points: [{x: 100, y: 100}, {x: 200, y: 100}] };
const pin = { x: 150, y: 100 };

console.log("On segment:", isPointOnSegment(pin, wire.points[0], wire.points[1]));
