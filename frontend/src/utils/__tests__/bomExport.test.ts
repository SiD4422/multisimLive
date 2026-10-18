import { describe, it, expect } from 'vitest';
import { generateBOM } from '../bomExport';
import type { SchematicComponent } from '../../store/useSchematicStore';

describe('BOM Generator', () => {
  it('groups identical components and counts quantities correctly', () => {
    const components: SchematicComponent[] = [
      { id: 'R1', type: 'Resistor', value: '10k', position: { x: 0, y: 0 } },
      { id: 'R2', type: 'Resistor', value: '10k', position: { x: 10, y: 10 } },
      { id: 'C1', type: 'Capacitor', value: '100nF', position: { x: 20, y: 20 } },
      { id: 'Q1', type: 'TransistorNPN', value: '2N3904', position: { x: 30, y: 30 } },
      { id: 'GND1', type: 'Ground', value: '0', position: { x: 40, y: 40 } },
    ];

    const csv = generateBOM(components);
    const lines = csv.split('\n');

    expect(lines[0]).toContain('Item,Designator,Quantity,Component Type,Value / Part Number');
    // Ground should be excluded
    expect(csv).not.toContain('GND1');
    // Resistors should be aggregated
    expect(csv).toContain('"R1 R2",2,"Resistor","10k"');
    // Capacitor
    expect(csv).toContain('"C1",1,"Capacitor","100nF"');
    // Transistor
    expect(csv).toContain('"Q1",1,"TransistorNPN","2N3904"');
  });
});
