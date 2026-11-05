import { describe, it, expect } from 'vitest';
import {
  isValidElectricalSignalKey,
  extractValidatedReadings,
  formatEngineeringValue,
} from '../report/measurementValidation';
import {
  analyzeCircuitTopology,
  getRecommendedTransientSettings,
  evaluateTransientCoverage,
  parseTimeString,
  validateTimestepConvergence,
} from '../report/adaptiveTransient';
import {
  detectWaveformEdgesWithHysteresis,
  evaluateComponentStress,
  evaluateCircuitVerification,
} from '../report/verificationEngine';
import type { SchematicComponent } from '../../store/useSchematicStore';

describe('NodeSim Verification Engine: Unit & Regression Tests', () => {
  // =========================================================================
  // 1. Metadata Leakage & Signal Validation Tests (Problem B)
  // =========================================================================
  describe('Signal Validation & Parser Metadata Filtering', () => {
    it('strictly rejects __parsedVars, __plotType, and other internal metadata keys', () => {
      expect(isValidElectricalSignalKey('__parsedVars')).toBe(false);
      expect(isValidElectricalSignalKey('__plotType')).toBe(false);
      expect(isValidElectricalSignalKey('__isComplex')).toBe(false);
      expect(isValidElectricalSignalKey('__variables')).toBe(false);
      expect(isValidElectricalSignalKey('time')).toBe(false);
      expect(isValidElectricalSignalKey('frequency')).toBe(false);
      expect(isValidElectricalSignalKey('v_sweep')).toBe(false);
      expect(isValidElectricalSignalKey('12345')).toBe(false); // numeric parser artifact
    });

    it('accepts valid SPICE voltage and current vector names', () => {
      expect(isValidElectricalSignalKey('v(1)')).toBe(true);
      expect(isValidElectricalSignalKey('v(out)')).toBe(true);
      expect(isValidElectricalSignalKey('i(v1)')).toBe(true);
      expect(isValidElectricalSignalKey('v(node_3,gnd)')).toBe(true);
    });

    it('filters out __parsedVars and calculates clean measurements from simulation rows', () => {
      const mockRows = [
        { time: 0.0, 'v(1)': 5.0, 'v(3)': 0.05, __parsedVars: 21 },
        { time: 0.005, 'v(1)': 5.0, 'v(3)': 0.051, __parsedVars: 21 },
        { time: 0.010, 'v(1)': 5.0, 'v(3)': 0.052, __parsedVars: 21 },
      ];

      const readings = extractValidatedReadings(mockRows);
      const signalNames = readings.map(r => r.signalName);

      expect(signalNames).not.toContain('__parsedVars');
      expect(signalNames).toContain('v(1)');
      expect(signalNames).toContain('v(3)');

      const v1 = readings.find(r => r.signalName === 'v(1)')!;
      expect(v1.min).toBeCloseTo(5.0, 3);
      expect(v1.max).toBeCloseTo(5.0, 3);
      expect(v1.peakToPeak).toBeCloseTo(0.0, 3);
      expect(v1.behavior).toBe('STABLE_DC');
      expect(v1.formattedAvg).toBe('5.000 V');
    });

    it('accurately computes True RMS and Trapezoidal DC Mean for AC waveforms', () => {
      // 1 full cycle sine wave: v(t) = 10 * sin(2*pi*f*t), f=100Hz, T=10ms
      const f = 100;
      const points = 1000;
      const mockSineRows: Record<string, number>[] = [];
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * (1 / f);
        mockSineRows.push({
          time: t,
          'v(ac)': 10 * Math.sin(2 * Math.PI * f * t),
        });
      }

      const readings = extractValidatedReadings(mockSineRows);
      const acSig = readings.find(r => r.signalName === 'v(ac)')!;

      expect(acSig.min).toBeCloseTo(-10.0, 1);
      expect(acSig.max).toBeCloseTo(10.0, 1);
      expect(acSig.peakToPeak).toBeCloseTo(20.0, 1);
      // DC mean of pure sine is ~0 V
      expect(Math.abs(acSig.average)).toBeLessThan(0.01);
      // True RMS of sine with amplitude 10V is 10 / sqrt(2) ≈ 7.071 V
      expect(acSig.rms).toBeCloseTo(10 / Math.SQRT2, 1);
    });
  });

  // =========================================================================
  // 2. 555 Astable Theoretical Calculations & Adaptive Coverage (Problem A)
  // =========================================================================
  describe('Theoretical Timing Analysis & Adaptive Transient Coverage', () => {
    const mock555Components: SchematicComponent[] = [
      { id: 'U1', type: 'LM555', position: { x: 200, y: 200 } },
      { id: 'R1', type: 'Resistor', value: '10k', position: { x: 100, y: 100 } },
      { id: 'R2', type: 'Resistor', value: '100k', position: { x: 100, y: 150 } },
      { id: 'C1', type: 'Capacitor', value: '10u', position: { x: 100, y: 250 } },
      { id: 'V1', type: 'DC Voltage', value: '5', position: { x: 50, y: 100 } },
    ];

    it('accurately calculates theoretical values for 555 Astable (R1=10k, R2=100k, C1=10uF)', () => {
      const topology = analyzeCircuitTopology(mock555Components);

      expect(topology.type).toBe('555_ASTABLE');
      // t_high = ln(2) * (10k + 100k) * 10uF ≈ 0.76246 s
      expect(topology.tHighTheoretical!).toBeCloseTo(0.762, 2);
      // t_low = ln(2) * 100k * 10uF ≈ 0.69315 s
      expect(topology.tLowTheoretical!).toBeCloseTo(0.693, 2);
      // T = t_high + t_low ≈ 1.4556 s
      expect(topology.periodTheoretical!).toBeCloseTo(1.455, 2);
      // f = 1 / T ≈ 0.687 Hz
      expect(topology.freqTheoretical!).toBeCloseTo(0.687, 2);
      // Duty cycle = (110 / 210) * 100% ≈ 52.38%
      expect(topology.dutyCycleTheoretical!).toBeCloseTo(52.38, 1);
    });

    it('identifies 10ms simulation as SEVERELY_UNDER_COVERED for 1.455s period circuit', () => {
      const topology = analyzeCircuitTopology(mock555Components);
      const eval10ms = evaluateTransientCoverage(topology, '10ms', '0.01ms');

      expect(eval10ms.isAdequate).toBe(false);
      expect(eval10ms.status).toBe('SEVERELY_UNDER_COVERED');
      // 10ms is ~0.68% of 1.455s
      expect(eval10ms.cyclesCapturedEstimate).toBeLessThan(0.05);
      // Recommended stop time must be ≥ 3.5 cycles (≥ 5 seconds)
      expect(eval10ms.recommendation.recommendedStopTime).toBeGreaterThanOrEqual(5.0);
    });

    it('identifies 6s simulation as OPTIMAL for 1.455s period circuit', () => {
      const topology = analyzeCircuitTopology(mock555Components);
      const eval6s = evaluateTransientCoverage(topology, '6s', '10ms');

      expect(eval6s.isAdequate).toBe(true);
      expect(eval6s.status).toBe('OPTIMAL');
      expect(eval6s.cyclesCapturedEstimate).toBeGreaterThanOrEqual(3.5);
    });

    it('validates timestep convergence against edge sampling ratio (Requirement 1)', () => {
      const period = 1.0;
      // High-resolution sampling: dt = 1ms (0.1% of period)
      const timeFine = Array.from({ length: 1000 }, (_, i) => i * 0.001);
      const signalFine = timeFine.map(t => (t % 1.0 < 0.5 ? 4.8 : 0.2));
      const resFine = validateTimestepConvergence(timeFine, signalFine, period);
      expect(resFine.isSufficient).toBe(true);

      // Coarse sampling: dt = 50ms (5% of period)
      const timeCoarse = Array.from({ length: 20 }, (_, i) => i * 0.05);
      const signalCoarse = timeCoarse.map(t => (t % 1.0 < 0.5 ? 4.8 : 0.2));
      const resCoarse = validateTimestepConvergence(timeCoarse, signalCoarse, period);
      expect(resCoarse.isSufficient).toBe(false);
    });
  });

  // =========================================================================
  // 3. Robust Edge Detection with Hysteresis (Requirement 3)
  // =========================================================================
  describe('Edge Detection with Dual-Threshold Hysteresis', () => {
    it('detects rising and falling edges accurately with linear interpolation', () => {
      const timeVec: number[] = [];
      const valVec: number[] = [];
      const totalTime = 4.0; // 4 seconds, 4 full cycles of 1Hz square wave
      const steps = 4000;

      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * totalTime;
        timeVec.push(t);
        // 1 Hz square wave, 50% duty cycle, switching between 0.1V and 4.9V
        const phase = t % 1.0;
        valVec.push(phase < 0.5 ? 4.9 : 0.1);
      }

      const edges = detectWaveformEdgesWithHysteresis(timeVec, valVec, 1.0, 3.5);
      expect(edges.hasSufficientCycles).toBe(true);
      expect(edges.cycleCount).toBeGreaterThanOrEqual(2);
      expect(edges.measuredPeriod).toBeCloseTo(1.0, 2);
      expect(edges.measuredFrequency).toBeCloseTo(1.0, 2);
      expect(edges.measuredDutyCycle).toBeCloseTo(50.0, 1);
    });

    it('rejects low-amplitude noise and static signals from registering edges', () => {
      const timeVec = Array.from({ length: 100 }, (_, i) => i * 0.01);
      // Small static signal with tiny 20mV ripple
      const valVec = timeVec.map(() => 0.05 + Math.random() * 0.02);

      const edges = detectWaveformEdgesWithHysteresis(timeVec, valVec);
      expect(edges.hasSufficientCycles).toBe(false);
      expect(edges.cycleCount).toBe(0);
      expect(edges.risingEdges.length).toBe(0);
    });
  });

  // =========================================================================
  // 4. Verification State Machine & Automatic PASS Prevention (Problem C)
  // =========================================================================
  describe('Verification State Machine & Functional Acceptance Criteria', () => {
    const mock555Components: SchematicComponent[] = [
      { id: 'U1', type: 'LM555', position: { x: 200, y: 200 } },
      { id: 'R1', type: 'Resistor', value: '10k', position: { x: 100, y: 100 } },
      { id: 'R2', type: 'Resistor', value: '100k', position: { x: 100, y: 150 } },
      { id: 'C1', type: 'Capacitor', value: '10u', position: { x: 100, y: 250 } },
      { id: 'V1', type: 'DC Voltage', value: '5', position: { x: 50, y: 100 } },
    ];

    it('returns NOT_SIMULATED state when circuit has not been simulated', () => {
      const evalResult = evaluateCircuitVerification(
        mock555Components,
        null,
        { hasSimulated: false, isSimulating: false, simError: null },
        '10ms',
        '0.01ms'
      );

      expect(evalResult.overallState).toBe('NOT_SIMULATED');
      expect(evalResult.qualifiedSignOffAvailable).toBe(false);
      expect(evalResult.verdictSummary).toContain('THEORETICAL ANALYSIS ONLY');
    });

    it('NEVER marks a static oscillator output as PASS; marks INSUFFICIENT_DATA when duration is too short', () => {
      // 10ms run where 555 output remained static at 0.05V
      const mockStaticBuffer = [
        { time: 0.000, 'v(1)': 5.0, 'v(out)': 0.05 },
        { time: 0.005, 'v(1)': 5.0, 'v(out)': 0.05 },
        { time: 0.010, 'v(1)': 5.0, 'v(out)': 0.05 },
      ];

      const evalResult = evaluateCircuitVerification(
        mock555Components,
        mockStaticBuffer,
        { hasSimulated: true, isSimulating: false, simError: null },
        '10ms',
        '0.01ms'
      );

      // Must NOT be VERIFICATION_PASSED
      expect(evalResult.overallState).not.toBe('VERIFICATION_PASSED');
      expect(evalResult.qualifiedSignOffAvailable).toBe(false);

      const swingTest = evalResult.functionalVerification.testCases.find(tc => tc.testId === 'TC-TIM-01');
      expect(swingTest).toBeDefined();
      expect(swingTest!.verdict).toBe('INSUFFICIENT_DATA');
    });

    it('issues qualified VERIFICATION_PASSED when full periodic switching evidence is present', () => {
      // Multi-cycle oscillating buffer (5 seconds duration, ~3.4 cycles of ~1.455s period)
      const mockOscillatingBuffer: Record<string, number>[] = [];
      const period = 1.455;
      const points = 5000;
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * 5.0;
        const phase = t % period;
        // 555 Astable: high for ~0.762s, low for ~0.693s
        const vOut = phase < 0.762 ? 4.2 : 0.2;
        mockOscillatingBuffer.push({
          time: t,
          'v(1)': 5.0,
          'v(out)': vOut,
        });
      }

      const evalResult = evaluateCircuitVerification(
        mock555Components,
        mockOscillatingBuffer,
        { hasSimulated: true, isSimulating: false, simError: null },
        '5s',
        '1ms'
      );

      expect(evalResult.overallState).toBe('VERIFICATION_PASSED');
      expect(evalResult.qualifiedSignOffAvailable).toBe(true);

      const freqTest = evalResult.functionalVerification.testCases.find(tc => tc.testId === 'TC-TIM-02');
      expect(freqTest?.verdict).toBe('PASS');
    });
  });

  // =========================================================================
  // 5. Component Stress & Missing Rating Handling (Requirement 4)
  // =========================================================================
  describe('Component Stress & Rating Integrity', () => {
    it('marks component stress as NOT_EVALUATED and NOT PROVIDED when ratings are missing', () => {
      const components: SchematicComponent[] = [
        { id: 'R1', type: 'Resistor', value: '10k', position: { x: 0, y: 0 } },
        { id: 'C1', type: 'Capacitor', value: '10u', position: { x: 0, y: 50 } },
      ];

      const stressItems = evaluateComponentStress(components, []);
      for (const item of stressItems) {
        expect(item.status).toBe('NOT_EVALUATED');
        expect(item.ratedLimit).toBe('NOT PROVIDED');
      }
    });

    it('evaluates stress when explicit ratings are provided without inventing specs', () => {
      const components: SchematicComponent[] = [
        { id: 'R1', type: 'Resistor', value: '10k', position: { x: 0, y: 0 }, powerRating: '0.25W' } as any,
        { id: 'C1', type: 'Capacitor', value: '10u', position: { x: 0, y: 50 }, voltageRating: '25V' } as any,
      ];

      const stressItems = evaluateComponentStress(components, []);
      const r1 = stressItems.find(s => s.designator === 'R1')!;
      expect(r1.ratedLimit).toBe('0.25 W');
      expect(r1.status).toBe('SAFE');

      const c1 = stressItems.find(s => s.designator === 'C1')!;
      expect(c1.ratedLimit).toBe('25 V');
      expect(c1.status).toBe('SAFE');
    });
  });
});
