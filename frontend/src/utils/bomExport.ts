import type { SchematicComponent } from '../store/useSchematicStore';

/**
 * Professional Bill of Materials (BOM) Generator for NodeSim EDA
 * Generates an industry-standard CSV with component grouping, designators,
 * quantities, and direct procurement links to LCSC / DigiKey.
 */
export function generateBOM(components: SchematicComponent[]): string {
  // Filter out non-physical components
  const nonPhysicalTypes = new Set(['Ground', 'Junction', 'Connector', 'Probe']);
  const physical = components.filter(c => !nonPhysicalTypes.has(c.type));

  // Group by component type and value
  const groups: Record<string, { type: string; value: string; ids: string[] }> = {};

  physical.forEach(c => {
    const val = (c.value || '').trim() || 'Standard';
    const key = `${c.type}___${val}`;
    if (!groups[key]) {
      groups[key] = { type: c.type, value: val, ids: [] };
    }
    groups[key].ids.push(c.id);
  });

  const rows: string[][] = [
    ['Item', 'Designator', 'Quantity', 'Component Type', 'Value / Part Number', 'Procurement Link (LCSC Sourcing)']
  ];

  let itemNum = 1;
  const sortedKeys = Object.keys(groups).sort();

  sortedKeys.forEach(k => {
    const g = groups[k];
    const designatorStr = g.ids.sort().join(' ');
    const sourcingQuery = `https://www.lcsc.com/search?q=${encodeURIComponent(`${g.type} ${g.value}`.trim())}`;
    rows.push([
      itemNum.toString(),
      `"${designatorStr}"`,
      g.ids.length.toString(),
      `"${g.type}"`,
      `"${g.value}"`,
      `"${sourcingQuery}"`
    ]);
    itemNum++;
  });

  return rows.map(r => r.join(',')).join('\n');
}

/**
 * Trigger immediate client-side browser download of the BOM CSV
 */
export function downloadBOMCsv(components: SchematicComponent[], circuitName: string = 'circuit') {
  const csvContent = generateBOM(components);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = circuitName.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'nodesim_circuit';
  link.setAttribute('download', `${safeName}_BOM.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
