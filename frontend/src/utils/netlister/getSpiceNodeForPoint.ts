import type { SchematicComponent, Wire, Point } from '../../store/useSchematicStore';
import { getComponentPins } from './getComponentPins';
import { toGridNode, isPointOnSegment, PIN_TOLERANCE } from './utils';
export function getSpiceNodeForPoint(p: Point, components: SchematicComponent[], wires: Wire[]): string {
  // This function MUST mirror the exact same net-building logic as generateNetlist so that
  // VoltageProbe node IDs match what was written into the SPICE netlist.
  
  // Build component pins (excluding ammeters & text, same as generateNetlist)
  const allPins: { gridNode: string; p: Point }[] = [];
  components.forEach(comp => {
    if (comp.type === 'TextAnnotation' || comp.type === 'Ammeter' || comp.type === 'Ground') return;
    getComponentPins(comp).forEach(pin => { if (pin.p) allPins.push({ gridNode: pin.gridNode, p: pin.p }); });
  });

  const gridNode = toGridNode(p);
  const nets: Set<string>[] = [];

  wires.forEach(wire => {
    const gridPoints = wire.points.map(toGridNode);
    for (let i = 0; i < wire.points.length - 1; i++) {
      const p1 = wire.points[i];
      const p2 = wire.points[i+1];
      // Component pins on segment (lenient tolerance)
      allPins.forEach(pin => {
        if (isPointOnSegment(pin.p, p1, p2, PIN_TOLERANCE)) gridPoints.push(pin.gridNode);
      });
      // T-junction: other wire endpoints on segment (skip fake ammeter nodes!)
      wires.forEach(otherWire => {
        if (otherWire === wire) return;
        otherWire.points.forEach(otherPt => {
          if ((otherPt as any)._isFake) return;
          if (isPointOnSegment(otherPt, p1, p2, PIN_TOLERANCE)) gridPoints.push(toGridNode(otherPt));
        });
      });
      // Also check if the probe point itself lies on this segment (use strict tolerance)
      if (isPointOnSegment(p, p1, p2)) gridPoints.push(gridNode);
    }

    let connectedNetIndices: number[] = [];
    gridPoints.forEach(gp => {
      nets.forEach((net, idx) => {
        if (net.has(gp) && !connectedNetIndices.includes(idx)) connectedNetIndices.push(idx);
      });
    });
    if (connectedNetIndices.length > 0) {
      const masterNetIndex = connectedNetIndices[0];
      gridPoints.forEach(gp => nets[masterNetIndex].add(gp));
      for (let i = 1; i < connectedNetIndices.length; i++) {
        nets[connectedNetIndices[i]].forEach(gp => nets[masterNetIndex].add(gp));
        nets[connectedNetIndices[i]].clear();
      }
    } else {
      nets.push(new Set(gridPoints));
    }
  });


  const finalNets = nets.filter(net => net.size > 0);
  const groundNodes = new Set<string>();
  const hasGroundComponents = components.some(c => c.type === 'Ground');
  components.filter(c => c.type === 'Ground').forEach(c => {
    getComponentPins(c).forEach(pin => {
      groundNodes.add(pin.gridNode);
      // Geometrically expand: if the Ground pin lies on any wire, mark that whole wire as ground
      wires.forEach(wire => {
        for (let i = 0; i < wire.points.length - 1; i++) {
          if (pin.p && isPointOnSegment(pin.p, wire.points[i], wire.points[i+1])) {
            wire.points.forEach(wp => groundNodes.add(toGridNode(wp)));
          }
        }
        wire.points.forEach(wp => {
          if (toGridNode(wp) === pin.gridNode) {
            wire.points.forEach(wp2 => groundNodes.add(toGridNode(wp2)));
          }
        });
      });
    });
  });
  // Transitively expand: any net that contains a groundNode is entirely ground
  finalNets.forEach(net => {
    let hasGround = false;
    net.forEach(gn => { if (groundNodes.has(gn)) hasGround = true; });
    if (hasGround) net.forEach(gn => groundNodes.add(gn));
  });

  // Build same stable netIdMap as generateNetlist
  let nodeCounter = 1;
  const netIdMap = new Map<number, string>();
  let groundNetIndex = -1;
  finalNets.forEach((net, idx) => {
    let isGround = false;
    net.forEach(gn => { if (groundNodes.has(gn)) isGround = true; });
    if (isGround) { netIdMap.set(idx, "0"); groundNetIndex = idx; }
  });
  if (!hasGroundComponents && groundNetIndex === -1 && finalNets.length > 0) {
    netIdMap.set(0, "0");
    groundNetIndex = 0;
  }
  finalNets.forEach((_, idx) => {
    if (!netIdMap.has(idx)) netIdMap.set(idx, `${nodeCounter++}`);
  });

  if (groundNodes.has(gridNode)) return "0";
  const netIndex = finalNets.findIndex(net => net.has(gridNode));
  if (netIndex !== -1) return netIdMap.get(netIndex) ?? `NC_${gridNode.replace(',', '_')}`;
  return `NC_${gridNode.replace(',', '_')}`;
}
