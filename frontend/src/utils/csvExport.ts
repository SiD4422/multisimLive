/**
 * Formats a raw SPICE trace or axis key into a human-readable display name.
 */
export function formatTraceName(t: string): string {
  const s = t.trim();
  const sl = s.toLowerCase();

  // v(n001), v(n002) — auto-numbered nodes
  const autoNode = sl.match(/^v\(n(\d+)\)$/);
  if (autoNode) return `Node ${parseInt(autoNode[1], 10)} Voltage`;

  // v(1), v(2) — plain numbered nodes
  const numNode = sl.match(/^v\((\d+)\)$/);
  if (numNode) return `Node ${numNode[1]} Voltage`;

  // i(v_xxx) — current through a voltage source
  const srcCurrent = sl.match(/^i\(v_([^)]+)\)$/);
  if (srcCurrent) return `I through ${srcCurrent[1].toUpperCase()}`;

  // i(r_xxx), i(c_xxx) etc — current through any component
  const compCurrent = sl.match(/^i\(([a-z])_([^)]+)\)$/);
  if (compCurrent) return `I through ${compCurrent[1].toUpperCase()}${compCurrent[2].toUpperCase()}`;

  // v(out), v(in), v(vcc), v(gnd) — named nodes
  const namedNode = sl.match(/^v\(([^)]+)\)$/);
  if (namedNode) return `${namedNode[1].toUpperCase()} Voltage`;

  // AC sweep suffixes
  if (sl.endsWith('_db')) return formatTraceName(s.slice(0, -3)) + ' (dB)';
  if (sl.endsWith('_phase')) return formatTraceName(s.slice(0, -6)) + ' Phase (°)';

  // Axis keys
  if (sl === 'frequency' || sl === 'freq') return 'Frequency (Hz)';
  if (sl === 'time') return 'Time (s)';
  if (sl === 'v_sweep') return 'Sweep Voltage (V)';

  return s; // fallback
}

function escapeCSV(val: unknown): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects (e.g., simulationBuffer or formattedData) into a CSV string.
 * @param data Array of objects containing simulation data
 * @returns A comma-separated values string
 */
export function generateCSV(data: any[] | null): string {
  if (!data || data.length === 0) return '';

  // Extract all unique keys across all objects to form the header
  const keys = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      // Ignore internal metadata keys like __plotType
      if (!key.startsWith('__')) {
        keys.add(key);
      }
    });
  });

  const allKeys = Array.from(keys);
  if (allKeys.length === 0) return '';

  // Ensure the first column is the X axis (time, frequency, or v_sweep)
  let xAxisKey: string | undefined = undefined;
  if (allKeys.includes('time')) {
    xAxisKey = 'time';
  } else if (allKeys.includes('frequency')) {
    xAxisKey = 'frequency';
  } else if (allKeys.includes('freq')) {
    xAxisKey = 'freq';
  } else if (allKeys.includes('v_sweep')) {
    xAxisKey = 'v_sweep';
  } else {
    xAxisKey = allKeys[0];
  }

  const orderedKeys = [
    xAxisKey,
    ...allKeys.filter(k => k !== xAxisKey)
  ];

  // Create human-readable header row with proper quoting
  const headers = orderedKeys.map(k => escapeCSV(formatTraceName(k)));
  const csvRows = [headers.join(',')];

  // Map each data row with proper escaping
  data.forEach(row => {
    const values = orderedKeys.map(header => escapeCSV(row[header]));
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}
