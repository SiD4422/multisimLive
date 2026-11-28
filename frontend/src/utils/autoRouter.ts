import type { SchematicComponent } from '../store/useSchematicStore';
import { getComponentPins } from './netlister/getComponentPins';
import { PIN_TOLERANCE } from './netlister/utils';

interface Point { x: number; y: number; }

export interface AutoRouteOptions {
  /** External pin locations (from other nets) that wires must stay clear of to avoid accidental shorts. */
  avoidPoints?: Point[];
}

const ROUTING_GRID = 20; // Coarse grid for routing performance
const CLEARANCE = 14;    // Padding around components
const HIGH_COST = 1000;  // Penalty for crossing a component
const PIN_COLLISION_COST = 50000; // Near-prohibitive penalty for passing through another net's pin

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function getBoundingBox(c: SchematicComponent): { x1: number; y1: number; x2: number; y2: number } {
  const pins = getComponentPins(c).filter((p): p is typeof p & { p: Point } => Boolean(p.p));
  if (pins.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const pin of pins) {
      if (pin.p.x < minX) minX = pin.p.x;
      if (pin.p.y < minY) minY = pin.p.y;
      if (pin.p.x > maxX) maxX = pin.p.x;
      if (pin.p.y > maxY) maxY = pin.p.y;
    }
    return {
      x1: minX - CLEARANCE,
      y1: minY - CLEARANCE,
      x2: maxX + CLEARANCE,
      y2: maxY + CLEARANCE,
    };
  }

  let width = 60, height = 40;
  if (c.type === 'Timer555' || c.type === 'Opamp' || c.type === 'Opamp5') { width = 100; height = 80; }
  else if (c.type === '74LS00' || c.type.includes('DIP')) { width = 140; height = 80; }
  else if (c.type === '7SegmentDisplay') { width = 80; height = 100; }
  else if (c.type === 'VoltageRegulator7805' || c.type === 'VoltageRegulator317') { width = 100; height = 60; }
  else if (c.type === 'Ground' || c.type === 'NetLabel') { width = 20; height = 20; }

  if (c.rotation === 90 || c.rotation === 270) {
    const temp = width;
    width = height;
    height = temp;
  }

  return {
    x1: c.position.x - width / 2 - CLEARANCE,
    y1: c.position.y - height / 2 - CLEARANCE,
    x2: c.position.x + width / 2 + CLEARANCE,
    y2: c.position.y + height / 2 + CLEARANCE,
  };
}

function getCost(
  x: number,
  y: number,
  start: Point,
  end: Point,
  bboxes: ReturnType<typeof getBoundingBox>[],
  avoidPoints: Point[],
): number {
  const isEndpoint =
    (Math.abs(x - start.x) <= ROUTING_GRID && Math.abs(y - start.y) <= ROUTING_GRID) ||
    (Math.abs(x - end.x) <= ROUTING_GRID && Math.abs(y - end.y) <= ROUTING_GRID);

  if (!isEndpoint) {
    for (const ap of avoidPoints) {
      if (Math.hypot(x - ap.x, y - ap.y) <= PIN_TOLERANCE + ROUTING_GRID * 0.6) {
        return PIN_COLLISION_COST;
      }
    }
    for (const box of bboxes) {
      if (x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2) {
        return HIGH_COST;
      }
    }
  }
  return 10;
}

function manhattan(p1: Point, p2: Point): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function snapToGrid(val: number): number {
  return Math.round(val / ROUTING_GRID) * ROUTING_GRID;
}

export function findOrthogonalPath(
  start: Point,
  end: Point,
  components: SchematicComponent[],
  options?: AutoRouteOptions,
): Point[] {
  const startG = { x: snapToGrid(start.x), y: snapToGrid(start.y) };
  const endG = { x: snapToGrid(end.x), y: snapToGrid(end.y) };

  const bboxes = components.map(getBoundingBox);
  const avoidPoints = options?.avoidPoints ?? [];

  // Search bounds (prevent infinite search)
  const minX = Math.min(startG.x, endG.x) - 420;
  const maxX = Math.max(startG.x, endG.x) + 420;
  const minY = Math.min(startG.y, endG.y) - 420;
  const maxY = Math.max(startG.y, endG.y) + 420;

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
    parent: null,
  };

  openList.set(startKey, startNode);
  gScore.set(startKey, 0);

  const maxIterations = 2500;
  let iterations = 0;

  while (openList.size > 0 && iterations < maxIterations) {
    iterations++;

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
      const path: Point[] = [];
      let curr: Node | null = current;
      while (curr) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      path.reverse();

      const optimizedPath = [path[0]];
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const mid = path[i];
        const next = path[i + 1];
        if (!((prev.x === mid.x && mid.x === next.x) || (prev.y === mid.y && mid.y === next.y))) {
          optimizedPath.push(mid);
        }
      }
      optimizedPath.push(path[path.length - 1]);

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
      { x: current.x, y: current.y - ROUTING_GRID },
    ];

    for (const n of neighbors) {
      if (n.x < minX || n.x > maxX || n.y < minY || n.y > maxY) continue;
      const nKey = `${n.x},${n.y}`;
      if (closedSet.has(nKey)) continue;

      const stepCost = getCost(n.x, n.y, startG, endG, bboxes, avoidPoints);
      const tentativeG = current.g + stepCost;

      const existingG = gScore.get(nKey);
      if (existingG === undefined || tentativeG < existingG) {
        gScore.set(nKey, tentativeG);
        const h = manhattan(n, endG);

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
            h,
            f: tentativeG + h,
            parent: current,
          });
        }
      }
    }
  }

  return [start, { x: start.x, y: end.y }, end];
}
