/**
 * Converts an array of objects (e.g., simulationBuffer) into a CSV string.
 * @param data Array of objects containing simulation data
 * @returns A comma-separated values string
 */
export function generateCSV(data: any[]): string {
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

  const headers = Array.from(keys);
  
  // Create header row
  const csvRows = [headers.join(',')];

  // Map each data row
  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header];
      return val !== undefined && val !== null ? val.toString() : '';
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}
