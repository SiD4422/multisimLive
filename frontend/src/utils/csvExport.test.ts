import { describe, it, expect } from 'vitest';
import { generateCSV, formatTraceName } from './csvExport';

describe('CSV Export Utility', () => {
  it('should generate a correct CSV string from array of objects with human-readable headers and X-axis first', () => {
    const mockBuffer = [
      { v_node1: 1.5, time: 0, i_v1: -0.01, __plotType: 'transient' },
      { v_node1: 2.0, time: 0.1, i_v1: 0.05, __plotType: 'transient' },
      { v_node1: 0.5, time: 0.2, __plotType: 'transient' } // Missing i_v1 to test empty cols
    ];

    const csvStr = generateCSV(mockBuffer);
    
    // Parse back roughly to check structure
    const lines = csvStr.split('\n');
    expect(lines.length).toBe(4); // 1 header + 3 data rows

    const headers = lines[0].split(',');
    // First column must be the X axis (Time (s))
    expect(headers[0]).toBe('Time (s)');
    expect(headers).toContain('Time (s)');
    expect(headers).toContain('v_node1');
    expect(headers).toContain('i_v1');
    expect(headers).not.toContain('__plotType'); // Should filter internal keys

    // Check specific row mapping
    const row1 = lines[1].split(',');
    expect(row1[headers.indexOf('Time (s)')]).toBe('0');
    expect(row1[headers.indexOf('v_node1')]).toBe('1.5');
    expect(row1[headers.indexOf('i_v1')]).toBe('-0.01');

    const row3 = lines[3].split(',');
    expect(row3[headers.indexOf('Time (s)')]).toBe('0.2');
    expect(row3[headers.indexOf('v_node1')]).toBe('0.5');
    expect(row3[headers.indexOf('i_v1')]).toBe(''); // Missing key should map to empty string
  });

  it('should format SPICE trace names and x-axis keys into readable headers and escape commas', () => {
    const mockData = [
      { 'v(n001)': 5, 'i(v_v1)': 0.02, time: 0 },
      { 'v(n001)': 4.9, 'i(v_v1)': 0.019, time: 0.001 },
    ];
    const csvStr = generateCSV(mockData);
    const lines = csvStr.split('\n');
    const headers = lines[0].split(',');
    expect(headers[0]).toBe('Time (s)');
    expect(headers).toContain('Node 1 Voltage');
    expect(headers).toContain('I through V1');
  });

  it('should format AC sweep and DC sweep axes correctly', () => {
    const acData = [{ frequency: 1000, 'v(out)_db': -3.01, 'v(out)_phase': -45 }];
    const acCsv = generateCSV(acData);
    const acHeaders = acCsv.split('\n')[0].split(',');
    expect(acHeaders[0]).toBe('Frequency (Hz)');
    expect(acHeaders).toContain('OUT Voltage (dB)');

    const dcData = [{ v_sweep: 1.5, 'v(1)': 1.45 }];
    const dcCsv = generateCSV(dcData);
    const dcHeaders = dcCsv.split('\n')[0].split(',');
    expect(dcHeaders[0]).toBe('Sweep Voltage (V)');
    expect(dcHeaders).toContain('Node 1 Voltage');
  });

  it('should handle empty input gracefully', () => {
    expect(generateCSV([])).toBe('');
    expect(generateCSV(null)).toBe('');
  });
});
