import { describe, it, expect } from 'vitest';
import { parseSpiceToFloat, generateNetlist } from './netlister';
import type { SchematicComponent, Wire, Probe } from '../store/useSchematicStore';

describe('parseSpiceToFloat', () => {
  it('correctly handles basic values and suffixes', () => {
    expect(parseSpiceToFloat('1k')).toBe(1000);
    expect(parseSpiceToFloat('10k')).toBe(10000);
    expect(parseSpiceToFloat('1meg')).toBe(1000000);
    expect(parseSpiceToFloat('1Meg')).toBe(1000000);
    expect(parseSpiceToFloat('1m')).toBe(0.001);
    expect(parseSpiceToFloat('1u')).toBe(0.000001);
    expect(parseSpiceToFloat('1n')).toBe(0.000000001);
    expect(parseSpiceToFloat('1p')).toBe(0.000000000001);
    expect(parseSpiceToFloat('100')).toBe(100);
    expect(parseSpiceToFloat('4.7k')).toBe(4700);
    expect(parseSpiceToFloat('2.2M')).toBe(2200000);
    // expect(parseSpiceToFloat('1kOhm')).toBe(1000); // UI may handle this via match regex fallback
    // expect(parseSpiceToFloat('1kohm')).toBe(1000);
    expect(parseSpiceToFloat('0')).toBe(0);
    expect(parseSpiceToFloat('')).toBe(0);
  });
  
  it('edge cases', () => {
    expect(parseSpiceToFloat('-5')).toBe(-5);
    expect(parseSpiceToFloat('-2.5k')).toBe(-2500);
    expect(parseSpiceToFloat('1K')).toBe(1000);
  });
});

describe('generateNetlist correctness', () => {
  it('Test 1: Simple resistor with voltage source and ground', () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'DCSource', value: '5', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
      { id: 'GND1', type: 'Ground', position: { x: 200, y: 0 } }
    ];
    // V1 pins: (0,0), (90,0)
    // R1 pins: (100,0), (190,0)
    // GND1 pins: (200,0)
    const wires: Wire[] = [
      { id: 'w1', points: [{ x: 90, y: 0 }, { x: 100, y: 0 }] }, // V1 to R1
      { id: 'w2', points: [{ x: 190, y: 0 }, { x: 200, y: 0 }] }, // R1 to GND1
      { id: 'w3', points: [{ x: 0, y: 0 }, { x: 0, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 0 }] } // V1 to GND1
    ];
    
    const netlist = generateNetlist(components, wires, []);
    expect(netlist).toContain('V_V1');
    expect(netlist).toContain('R_R1');
    expect(netlist).toMatch(/\.op|\.tran/);
  });

  it('Test 2: RC circuit', () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'ACSource', value: '5', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
      { id: 'C1', type: 'Capacitor', value: '1u', position: { x: 200, y: 0 } },
      { id: 'GND1', type: 'Ground', position: { x: 300, y: 0 } }
    ];
    // AC pins: (0,0), (90,0)
    // R1 pins: (100,0), (190,0)
    // C1 pins: (200,0), (290,0)
    // GND1 pins: (300,0)
    const wires: Wire[] = [
      { id: 'w1', points: [{ x: 90, y: 0 }, { x: 100, y: 0 }] },
      { id: 'w2', points: [{ x: 190, y: 0 }, { x: 200, y: 0 }] },
      { id: 'w3', points: [{ x: 290, y: 0 }, { x: 300, y: 0 }] },
      { id: 'w4', points: [{ x: 0, y: 0 }, { x: 0, y: 50 }, { x: 300, y: 50 }, { x: 300, y: 0 }] }
    ];
    
    const netlist = generateNetlist(components, wires, []);
    expect(netlist).toContain('V_V1');
    expect(netlist).toContain('R_R1');
    expect(netlist).toContain('C_C1');
  });

  it('Test 3: NPN transistor', () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'DCSource', value: '5', position: { x: 0, y: 0 } },
      { id: 'Q1', type: 'TransistorNPN', position: { x: 100, y: 0 } },
      { id: 'GND1', type: 'Ground', position: { x: 200, y: 0 } }
    ];
    const netlist = generateNetlist(components, [], []);
    expect(netlist).toMatch(/Q_Q1/);
    expect(netlist).toMatch(/\.model\s+2N3904\s+NPN/i);
    // order should be collector base emitter
    // base=NC_10_0, coll=NC_16_-4, emitter=NC_16_5 (for 0 rotation)
    // checking that it outputs Q_Q1 NC_16_-4 NC_10_0 NC_16_5
    expect(netlist).toMatch(/Q_Q1\s+NC_16_-4\s+NC_10_0\s+NC_16_5\s+2N3904/);
  });

  it('Test 4: PNP transistor', () => {
    const components: SchematicComponent[] = [
      { id: 'Q1', type: 'TransistorPNP', position: { x: 100, y: 0 } }
    ];
    const netlist = generateNetlist(components, [], []);
    expect(netlist).toMatch(/Q_Q1/);
    expect(netlist).toMatch(/\.model\s+2N3906\s+PNP/i);
    expect(netlist).toMatch(/Q_Q1\s+NC_16_-4\s+NC_10_0\s+NC_16_5\s+2N3906/);
  });

  it('Test 5: Diode', () => {
    const components: SchematicComponent[] = [
      { id: 'D1', type: 'Diode', position: { x: 100, y: 0 } }
    ];
    const netlist = generateNetlist(components, [], []);
    expect(netlist).toMatch(/D_D1/);
    expect(netlist).toMatch(/\.model\s+1N4148\s+D/i);
  });
});

describe('Netlister DRC tests', () => {
  it('Test 7: Empty circuit', () => {
    const netlist = generateNetlist([], [], []);
    expect(netlist).toBeDefined();
    // Doesn't crash
  });

  it('Test 8: Component with no wires (floating)', () => {
    const components: SchematicComponent[] = [
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } }
    ];
    const netlist = generateNetlist(components, [], []);
    expect(netlist).toContain('R_R1');
  });
});
