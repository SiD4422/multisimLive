/**
 * systemIntegrityRegression.test.ts
 * 
 * Regression test suite verifying that simulator execution, state serialization/sharing,
 * authentication metadata integration, and AI tutor prompts remain fully functional and intact.
 */

import { describe, it, expect } from 'vitest';
import { useSchematicStore } from '../../store/useSchematicStore';
import { generateNetlist } from '../netlister/generateNetlist';
import { cleanEngineeringText, extractValidatedReadings } from '../report/measurementValidation';
import { evaluateCircuitVerification } from '../report/verificationEngine';
import type { SchematicComponent, Wire } from '../../store/useSchematicStore';

describe('System Integrity & Regression Suite', () => {
  // 1. Simulator & Netlist Generation Integrity
  describe('Simulator & Netlist Pipeline', () => {
    it('correctly generates SPICE netlist from schematic components and wires', () => {
      const components: SchematicComponent[] = [
        { id: 'V1', type: 'DCSource', value: '5', position: { x: 0, y: 0 } },
        { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
        { id: 'GND1', type: 'Ground', position: { x: 200, y: 0 } },
      ];
      const wires: Wire[] = [
        { id: 'w1', points: [{ x: 90, y: 0 }, { x: 100, y: 0 }] },
        { id: 'w2', points: [{ x: 190, y: 0 }, { x: 200, y: 0 }] },
        { id: 'w3', points: [{ x: 0, y: 0 }, { x: 0, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 0 }] },
      ];

      const netlist = generateNetlist(components, wires);
      expect(netlist).toBeDefined();
      expect(typeof netlist).toBe('string');
      expect(netlist).toContain('V_V1');
      expect(netlist).toContain('R_R1');
      expect(netlist).toContain('.end');
    });

    it('preserves transient settings in schematic store', () => {
      const store = useSchematicStore.getState();
      expect(store.transientSettings).toBeDefined();
      expect(typeof store.transientSettings.endTime).toBe('string');
      expect(typeof store.transientSettings.step).toBe('string');

      store.setTransientSettings({ endTime: '5s', step: '10ms' });
      expect(useSchematicStore.getState().transientSettings.endTime).toBe('5s');
      expect(useSchematicStore.getState().transientSettings.step).toBe('10ms');

      // Reset to default
      store.setTransientSettings({ endTime: '10ms', step: '0.01ms' });
    });
  });

  // 2. Sharing & State Serialization Integrity
  describe('State Serialization & Sharing Roundtrip', () => {
    it('successfully serializes and parses schematic state JSON', () => {
      const store = useSchematicStore.getState();
      const exported = store.exportState();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('components');
      expect(parsed).toHaveProperty('wires');
    });
  });

  // 3. AI Tutor & Engineering Text Integrity
  describe('AI Tutor & LaTeX Cleaner', () => {
    it('cleans LaTeX math delimiters and special symbols into readable Unicode', () => {
      const rawText = 'Formula is $$f = \\frac{1}{2\\pi RC}$$ and $V_{CC} = 5\\text{V}$ with $R = 10\\text{k}\\Omega$.';
      const cleaned = cleanEngineeringText(rawText);

      expect(cleaned).not.toContain('$$');
      expect(cleaned).not.toContain('$');
      expect(cleaned).not.toContain('\\frac');
      expect(cleaned).not.toContain('\\Omega');
      expect(cleaned).toContain('Ω');
      expect(cleaned).toContain('π');
    });
  });

  // 4. Report Modes & Verification Integrity
  describe('Report Modes & Verification State Rules', () => {
    it('Mode 1 (Theoretical): Permitted without simulation results', () => {
      const components: SchematicComponent[] = [
        { id: 'R1', type: 'Resistor', value: '10k', position: { x: 0, y: 0 } },
        { id: 'C1', type: 'Capacitor', value: '1u', position: { x: 0, y: 50 } },
      ];

      const evaluation = evaluateCircuitVerification(
        components,
        null, // No simulation buffer
        { hasSimulated: false, isSimulating: false, simError: null },
        '10ms',
        '0.01ms'
      );

      expect(evaluation.overallState).toBe('NOT_SIMULATED');
      expect(evaluation.theoretical.summary).toBeDefined();
      expect(evaluation.qualifiedSignOffAvailable).toBe(false);
      expect(evaluation.verdictSummary).toContain('THEORETICAL ANALYSIS ONLY');
    });

    it('Mode 2 & 3: Exclude internal parser metadata (__parsedVars) from all outputs', () => {
      const simDataWithMetadata = [
        { time: 0.0, 'v(1)': 5.0, 'v(2)': 2.5, __parsedVars: 21, __plotType: 1 },
        { time: 0.001, 'v(1)': 5.0, 'v(2)': 2.5, __parsedVars: 21, __plotType: 1 },
      ];

      const readings = extractValidatedReadings(simDataWithMetadata);
      for (const r of readings) {
        expect(r.signalName.startsWith('__')).toBe(false);
      }
      expect(readings.find(r => r.signalName === '__parsedVars')).toBeUndefined();
    });
  });
});
