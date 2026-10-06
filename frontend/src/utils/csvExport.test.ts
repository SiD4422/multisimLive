import { describe, it, expect } from 'vitest';
import { generateCSV } from './csvExport';

describe('CSV Export Utility', () => {
  it('should generate a correct CSV string from array of objects', () => {
    const mockBuffer = [
      { time: 0, v_node1: 1.5, i_v1: -0.01, __plotType: 'transient' },
      { time: 0.1, v_node1: 2.0, i_v1: 0.05, __plotType: 'transient' },
      { time: 0.2, v_node1: 0.5, __plotType: 'transient' } // Missing i_v1 to test empty cols
    ];

    const csvStr = generateCSV(mockBuffer);
    
    // Parse back roughly to check structure
    const lines = csvStr.split('\n');
    expect(lines.length).toBe(4); // 1 header + 3 data rows

    const headers = lines[0].split(',');
    expect(headers).toContain('time');
    expect(headers).toContain('v_node1');
    expect(headers).toContain('i_v1');
    expect(headers).not.toContain('__plotType'); // Should filter internal keys

    // Check specific row mapping
    const row1 = lines[1].split(',');
    expect(row1[headers.indexOf('time')]).toBe('0');
    expect(row1[headers.indexOf('v_node1')]).toBe('1.5');
    expect(row1[headers.indexOf('i_v1')]).toBe('-0.01');

    const row3 = lines[3].split(',');
    expect(row3[headers.indexOf('time')]).toBe('0.2');
    expect(row3[headers.indexOf('v_node1')]).toBe('0.5');
    expect(row3[headers.indexOf('i_v1')]).toBe(''); // Missing key should map to empty string
  });

  it('should handle empty input gracefully', () => {
    expect(generateCSV([])).toBe('');
    expect(generateCSV(null)).toBe('');
  });
});
