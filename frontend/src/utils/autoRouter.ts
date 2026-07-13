import type { SchematicComponent } from '../store/useSchematicStore';

interface Point { x: number; y: number; }

const ROUTING_GRID = 20; // Coarse grid for routing performance
const CLEARANCE = 10;    // Padding around components
const HIGH_COST = 1000;  // Penalty for crossing a component
const INF_COST = 1000000;

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function getBoundingBox(c: SchematicComponent): { x1: number, y1: number, x2: number, y2: number } {
  // Approximate sizes based on type. Ideally we'd use exact sizes, but this is a generic approximation.
  let width = 60, height = 40;
  if (c.type === 'Timer555' || c.type === 'Opamp' || c.type === 'Opamp5') { width = 100; height = 80; }
  else if (c.type === '74LS00' || c.type.includes('DIP')) { width = 140; height = 80; }
  else if (c.type === '7SegmentDisplay') { width = 80; height = 100; }
  else if (c.type === 'VoltageRegulator7805' || c.type === 'VoltageRegulator317') { width = 100; height = 60; }
  else if (c.type === 'Ground') { width = 30; height = 30; }

  if (c.rotation === 90 || c.rotation === 270) {
    const temp = width;
    width = height;
    height = temp;
  }

  return {
    x1: c.position.x - width / 2 - CLEARANCE,
    y1: c.position.y - height / 2 - CLEARANCE,
    x2: c.position.x + width / 2 + CLEARANCE,
    y2: c.position.y + height / 2 + CLEARANCE
  };
}

function getCost(x: number, y: number, bboxes: ReturnType<typeof getBoundingBox>[]): number {
  for (const box of bboxes) {
    if (x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2) {
      return HIGH_COST; // High cost instead of absolute block to guarantee a path
    }
  }
  return 10; // Base traversal cost
}

function manhattan(p1: Point, p2: Point): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function snapToGrid(val: number): number {
  return Math.round(val / ROUTING_GRID) * ROUTING_GRID;
}

export function findOrthogonalPath(start: Point, end: Point, components: SchematicComponent[]): Point[] {
  const startG = { x: snapToGrid(start.x), y: snapToGrid(start.y) };
  const endG = { x: snapToGrid(end.x), y: snapToGrid(end.y) };

  const bboxes = components.map(getBoundingBox);

  // Search bounds (prevent infinite search)
  const minX = Math.min(startG.x, endG.x) - 400;
  const maxX = Math.max(startG.x, endG.x) + 400;
  const minY = Math.min(startG.y, endG.y) - 400;
  const maxY = Math.max(startG.y, endG.y) + 400;

  const openList = new Map<string, Node>();
  const closedSet = new Set<string>();
  const gScore = new Map<string, number>();

  const startKey = `${startG.x},${startG.y}`;
  const startNode: Node = {
    x: startG.x,
    y: startG.y,
    g: 0,
    h: manhattan(startG, endG),
    f: manhattan(startG, endG),
    parent: null
  };

  openList.set(startKey, startNode);
  gScore.set(startKey, 0);

  const maxIterations = 2000;
  let iterations = 0;

  while (openList.size > 0 && iterations < maxIterations) {
    iterations++;

    // Get node with lowest f score
    let current: Node | null = null;
    let currentKey = '';
    for (const [key, node] of openList.entries()) {
      if (!current || node.f < current.f) {
        current = node;
        currentKey = key;
      }
    }
    
    if (!current) break;
    openList.delete(currentKey);

    if (current.x === endG.x && current.y === endG.y) {
      // Reconstruct path
      const path: Point[] = [];
      let curr: Node | null = current;
      while (curr) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      path.reverse();

      // Optimize: Remove collinear points
      const optimizedPath = [path[0]];
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];
        if (!((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y))) {
          optimizedPath.push(curr);
        }
      }
      optimizedPath.push(path[path.length - 1]);

      // Connect actual endpoints (which might be off the 20px grid)
      if (optimizedPath[0].x !== start.x || optimizedPath[0].y !== start.y) {
        optimizedPath.unshift({ x: start.x, y: start.y });
      }
      if (optimizedPath[optimizedPath.length - 1].x !== end.x || optimizedPath[optimizedPath.length - 1].y !== end.y) {
        optimizedPath.push({ x: end.x, y: end.y });
      }

      return optimizedPath;
    }

    closedSet.add(currentKey);

    const neighbors = [
      { x: current.x + ROUTING_GRID, y: current.y },
      { x: current.x - ROUTING_GRID, y: current.y },
      { x: current.x, y: current.y + ROUTING_GRID },
      { x: current.x, y: current.y - ROUTING_GRID }
    ];

    for (const n of neighbors) {
      if (n.x < minX || n.x > maxX || n.y < minY || n.y > maxY) continue;
      const nKey = `${n.x},${n.y}`;
      if (closedSet.has(nKey)) continue;

      const stepCost = getCost(n.x, n.y, bboxes);
      const tentativeG = current.g + stepCost;

      const existingG = gScore.get(nKey);
      if (existingG === undefined || tentativeG < existingG) {
        gScore.set(nKey, tentativeG);
        const h = manhattan(n, endG);
        
        // Find if it's already in openList to update or add
        const existingNode = openList.get(nKey);
        if (existingNode) {
          existingNode.g = tentativeG;
          existingNode.f = tentativeG + h;
          existingNode.parent = current;
        } else {
          openList.set(nKey, {
            x: n.x,
            y: n.y,
            g: tentativeG,
            h: h,
            f: tentativeG + h,
            parent: current
          });
        }
      }
    }
  }

  // Fallback if no path found or max iterations reached
  return [start, { x: start.x, y: end.y }, end];
}
