/**
 * adaptiveTransient.ts
 * 
 * Intelligent transient simulation coverage and timestep validator.
 * 
 * Objectives:
 * 1. Analyzes circuit topology (555 Timer, RC Filter, AC/Oscillator networks).
 * 2. Computes theoretical timing invariants (t_high, t_low, period T, f_theo, tau).
 * 3. Recommends transient duration capturing at least 3 to 4 complete cycles.
 * 4. Recommends fine initial timesteps (validated against waveform edge accuracy).
 * 5. Evaluates whether existing simulation run had sufficient time coverage.
 */

import type { SchematicComponent } from '../../store/useSchematicStore';
import { parseSpiceToFloat } from '../netlister/parseSpiceToFloat';

export interface TopologyTimingInvariants {
  type: '555_ASTABLE' | '555_MONOSTABLE' | 'RC_NETWORK' | 'AC_SOURCE' | 'GENERIC_DC';
  description: string;
  tHighTheoretical?: number;
  tLowTheoretical?: number;
  periodTheoretical?: number;
  freqTheoretical?: number;
  dutyCycleTheoretical?: number;
  tauTheoretical?: number;
  primaryComponents: {
    ra?: string;
    raValue?: number;
    rb?: string;
    rbValue?: number;
    c?: string;
    cValue?: number;
    r?: string;
    rValue?: number;
  };
}

export interface TransientRecommendation {
  recommendedStopTime: number;
  recommendedStep: number;
  formattedStopTime: string;
  formattedStep: string;
  minimumCyclesExpected: number;
  reason: string;
}

export interface TransientCoverageEvaluation {
  isAdequate: boolean;
  actualDuration: number;
  recommendedDuration: number;
  cyclesCapturedEstimate: number;
  status: 'OPTIMAL' | 'UNDER_COVERED' | 'SEVERELY_UNDER_COVERED' | 'CONFIGURABLE';
  advisoryMessage: string;
  recommendation: TransientRecommendation;
}

export interface TimestepValidationResult {
  isSufficient: boolean;
  maxSampleIntervalNearEdges: number;
  edgeSamplingRatio: number; // sample dt / period
  recommendation: string;
}

/**
 * Parses a SPICE time string (e.g. '10ms', '5s', '100us', '1m', '0.01ms') into seconds.
 */
export function parseTimeString(timeStr: string): number {
  if (!timeStr) return 0.01; // default 10ms
  const cleaned = timeStr.trim().toLowerCase();
  const match = cleaned.match(/^([\+\-]?\d*(?:\.\d+)?(?:[eE][\+\-]?\d+)?)\s*([a-zµ]+)?$/);
  if (!match) return 0.01;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return 0.01;
  const unit = match[2] || 's';

  if (unit === 's') return num;
  if (unit === 'ms') return num * 1e-3;
  if (unit === 'us' || unit === 'µs' || unit === 'u') return num * 1e-6;
  if (unit === 'ns' || unit === 'n') return num * 1e-9;
  if (unit === 'ps' || unit === 'p') return num * 1e-12;
  if (unit === 'm') return num * 1e-3;
  return num;
}

/**
 * Formats seconds into standard engineering notation for SPICE directives (.tran).
 */
export function formatTimeValue(seconds: number): string {
  if (seconds >= 1) {
    return `${seconds.toFixed(seconds >= 10 ? 1 : 2)}s`;
  }
  if (seconds >= 1e-3) {
    return `${(seconds * 1e3).toFixed(seconds >= 0.01 ? 1 : 3)}ms`;
  }
  if (seconds >= 1e-6) {
    return `${(seconds * 1e6).toFixed(seconds >= 1e-5 ? 1 : 3)}us`;
  }
  return `${(seconds * 1e9).toFixed(1)}ns`;
}

/**
 * Inspects components to detect known periodic and dynamic timing topologies.
 */
export function analyzeCircuitTopology(components: SchematicComponent[]): TopologyTimingInvariants {
  // 1. Detect 555 Timer (Astable / Monostable)
  const timerComp = components.find(c => {
    const t = (c.type || '').toUpperCase();
    return t.includes('555') || t.includes('LM555') || t.includes('NE555');
  });

  if (timerComp) {
    // Find resistors and capacitors in circuit
    const resistors = components.filter(c => c.type === 'Resistor' || c.type === 'resistor');
    const capacitors = components.filter(c => c.type === 'Capacitor' || c.type === 'capacitor');

    if (resistors.length >= 2 && capacitors.length >= 1) {
      // Sort resistors by designator or ID: typically R1 (RA) and R2 (RB)
      const rAComp = resistors.find(r => r.id === 'R1' || r.id === 'RA') || resistors[0];
      const rBComp = resistors.find(r => r.id === 'R2' || r.id === 'RB') || resistors[1];
      const cComp = capacitors.find(c => c.id === 'C1' || c.id === 'C') || capacitors[0];

      const rAVal = parseSpiceToFloat(rAComp.value || '10k');
      const rBVal = parseSpiceToFloat(rBComp.value || '100k');
      const cVal = parseSpiceToFloat(cComp.value || '10u');

      if (rAVal > 0 && rBVal > 0 && cVal > 0) {
        // Standard LM555 Astable Multivibrator Equations:
        // t_high = ln(2) * (RA + RB) * C
        // t_low  = ln(2) * RB * C
        // T      = ln(2) * (RA + 2*RB) * C
        // f      = 1 / T
        const ln2 = Math.LN2; // 0.693147...
        const tHigh = ln2 * (rAVal + rBVal) * cVal;
        const tLow = ln2 * rBVal * cVal;
        const period = tHigh + tLow;
        const freq = 1 / period;
        const dutyCycle = (tHigh / period) * 100;

        return {
          type: '555_ASTABLE',
          description: `LM555 Astable Multivibrator (${rAComp.id}=${rAComp.value || '10k'}, ${rBComp.id}=${rBComp.value || '100k'}, ${cComp.id}=${cComp.value || '10u'})`,
          tHighTheoretical: tHigh,
          tLowTheoretical: tLow,
          periodTheoretical: period,
          freqTheoretical: freq,
          dutyCycleTheoretical: dutyCycle,
          primaryComponents: {
            ra: rAComp.id,
            raValue: rAVal,
            rb: rBComp.id,
            rbValue: rBVal,
            c: cComp.id,
            cValue: cVal,
          },
        };
      }
    }
  }

  // 2. Detect AC Source / Sine Generator
  const acSource = components.find(c => {
    const t = (c.type || '').toLowerCase();
    return t.includes('ac voltage') || t.includes('sine') || t.includes('function generator');
  });

  if (acSource) {
    const freqMatch = (acSource.value || '').match(/(\d+(?:\.\d+)?)\s*(k|m|meg|hz|khz|mhz)?/i);
    let freq = 1000; // default 1 kHz
    if (freqMatch) {
      freq = parseSpiceToFloat(freqMatch[1] + (freqMatch[2] || ''));
      if (freq <= 0) freq = 1000;
    }
    const period = 1 / freq;

    return {
      type: 'AC_SOURCE',
      description: `AC Dynamic Source (${acSource.id || 'V_AC'} @ ${freq.toFixed(1)} Hz)`,
      periodTheoretical: period,
      freqTheoretical: freq,
      primaryComponents: {},
    };
  }

  // 3. Detect Passive RC Network
  const resistors = components.filter(c => c.type === 'Resistor');
  const capacitors = components.filter(c => c.type === 'Capacitor');
  if (resistors.length >= 1 && capacitors.length >= 1) {
    const rComp = resistors[0];
    const cComp = capacitors[0];
    const rVal = parseSpiceToFloat(rComp.value || '1k');
    const cVal = parseSpiceToFloat(cComp.value || '1u');

    if (rVal > 0 && cVal > 0) {
      const tau = rVal * cVal;
      const fCutoff = 1 / (2 * Math.PI * tau);

      return {
        type: 'RC_NETWORK',
        description: `RC Network (${rComp.id}=${rComp.value}, ${cComp.id}=${cComp.value}, tau=${formatTimeValue(tau)})`,
        tauTheoretical: tau,
        freqTheoretical: fCutoff,
        periodTheoretical: tau * 5, // 5 time constants for 99.3% transient settling
        primaryComponents: {
          r: rComp.id,
          rValue: rVal,
          c: cComp.id,
          cValue: cVal,
        },
      };
    }
  }

  // 4. Generic / Static DC Network
  return {
    type: 'GENERIC_DC',
    description: 'Generic DC / Mixed-Signal Network',
    primaryComponents: {},
  };
}

/**
 * Calculates recommended transient settings based on circuit timing invariants.
 * Strictly adheres to requirement 1: starts with high-resolution timestep to capture fast transitions.
 */
export function getRecommendedTransientSettings(topology: TopologyTimingInvariants): TransientRecommendation {
  switch (topology.type) {
    case '555_ASTABLE': {
      const period = topology.periodTheoretical || 1.0;
      const tMin = Math.min(topology.tHighTheoretical || period / 2, topology.tLowTheoretical || period / 2);
      
      // Recommend at least 3.5 complete cycles to capture startup latency + 3 steady periodic waveforms
      const stopTime = Math.max(0.01, period * 3.5);

      // Fine initial timestep resolution:
      // Requirement 1: Step must be sufficiently fine to resolve sharp threshold comparator transitions
      // (1/250th of fastest phase or at least 1/500th of total period)
      const step = Math.min(tMin / 250, period / 500);

      return {
        recommendedStopTime: stopTime,
        recommendedStep: step,
        formattedStopTime: formatTimeValue(stopTime),
        formattedStep: formatTimeValue(step),
        minimumCyclesExpected: 3,
        reason: `LM555 astable oscillation period is ~${period.toFixed(3)}s (f ~${(1/period).toFixed(3)}Hz). Simulating for ${formatTimeValue(stopTime)} captures ≥3 complete switching cycles.`,
      };
    }

    case 'AC_SOURCE': {
      const period = topology.periodTheoretical || 1e-3;
      const stopTime = period * 4.0; // 4 cycles
      const step = period / 250;     // 250 points per sinusoidal cycle
      return {
        recommendedStopTime: stopTime,
        recommendedStep: step,
        formattedStopTime: formatTimeValue(stopTime),
        formattedStep: formatTimeValue(step),
        minimumCyclesExpected: 4,
        reason: `AC Source frequency is ~${(1/period).toFixed(1)}Hz. Simulating for ${formatTimeValue(stopTime)} captures 4 full sine periods.`,
      };
    }

    case 'RC_NETWORK': {
      const tau = topology.tauTheoretical || 1e-3;
      const stopTime = tau * 6.0; // 6 time constants (99.75% settling)
      const step = tau / 150;     // 150 samples per time constant
      return {
        recommendedStopTime: stopTime,
        recommendedStep: step,
        formattedStopTime: formatTimeValue(stopTime),
        formattedStep: formatTimeValue(step),
        minimumCyclesExpected: 1,
        reason: `RC network time constant is tau = ${formatTimeValue(tau)}. Simulating for ${formatTimeValue(stopTime)} ensures complete transient settling (>99%).`,
      };
    }

    default: {
      return {
        recommendedStopTime: 0.01, // 10ms
        recommendedStep: 1e-5,     // 10us
        formattedStopTime: '10ms',
        formattedStep: '0.01ms',
        minimumCyclesExpected: 1,
        reason: 'Standard 10ms transient window for generic mixed-signal circuits.',
      };
    }
  }
}

/**
 * Evaluates whether the currently configured simulation transient window
 * is adequate to characterize the circuit under test.
 */
export function evaluateTransientCoverage(
  topology: TopologyTimingInvariants,
  currentEndTimeStr: string,
  currentStepStr: string
): TransientCoverageEvaluation {
  const actualDuration = parseTimeString(currentEndTimeStr);
  const recommendation = getRecommendedTransientSettings(topology);
  const recommendedDuration = recommendation.recommendedStopTime;

  if (topology.type === 'GENERIC_DC') {
    return {
      isAdequate: true,
      actualDuration,
      recommendedDuration,
      cyclesCapturedEstimate: 1,
      status: 'OPTIMAL',
      advisoryMessage: 'Static DC and generic transient coverage are adequate.',
      recommendation,
    };
  }

  const period = topology.periodTheoretical || actualDuration;
  const cyclesCapturedEstimate = actualDuration / period;

  if (cyclesCapturedEstimate >= 2.8) {
    return {
      isAdequate: true,
      actualDuration,
      recommendedDuration,
      cyclesCapturedEstimate,
      status: 'OPTIMAL',
      advisoryMessage: `Adequate transient coverage: ~${cyclesCapturedEstimate.toFixed(1)} full cycles captured (≥3 cycles required).`,
      recommendation,
    };
  }

  if (cyclesCapturedEstimate < 0.5) {
    return {
      isAdequate: false,
      actualDuration,
      recommendedDuration,
      cyclesCapturedEstimate,
      status: 'SEVERELY_UNDER_COVERED',
      advisoryMessage: `Severely insufficient transient duration (${currentEndTimeStr}). Circuit expected period is ${period.toFixed(3)}s. Currently simulated only ${(cyclesCapturedEstimate * 100).toFixed(1)}% of a single cycle.`,
      recommendation,
    };
  }

  return {
    isAdequate: false,
    actualDuration,
    recommendedDuration,
    cyclesCapturedEstimate,
    status: 'UNDER_COVERED',
    advisoryMessage: `Partial transient coverage: ~${cyclesCapturedEstimate.toFixed(1)} cycles captured. Recommend simulating ≥${recommendation.formattedStopTime} to verify periodic steady-state stability.`,
    recommendation,
  };
}

/**
 * Validates timestep convergence and edge sampling resolution (Requirement 1).
 * Detects whether the time discretization near edge crossings is fine enough
 * to prevent numerical edge jitter and artificial duty-cycle distortion.
 */
export function validateTimestepConvergence(
  timeVec: number[],
  signalVec: number[],
  period: number,
  vLow = 1.0,
  vHigh = 3.5
): TimestepValidationResult {
  if (!timeVec || timeVec.length < 2 || period <= 0) {
    return {
      isSufficient: false,
      maxSampleIntervalNearEdges: 0,
      edgeSamplingRatio: 1,
      recommendation: 'Insufficient samples to evaluate timestep convergence.',
    };
  }

  let maxEdgeDt = 0;
  for (let i = 0; i < signalVec.length - 1; i++) {
    const v1 = signalVec[i];
    const v2 = signalVec[i + 1];
    const dt = timeVec[i + 1] - timeVec[i];

    // Check if sample is in the transition region between vLow and vHigh
    if ((v1 >= vLow && v1 <= vHigh) || (v2 >= vLow && v2 <= vHigh)) {
      if (dt > maxEdgeDt) maxEdgeDt = dt;
    }
    // Or if the step leaps completely across the transition thresholds in a single step
    else if ((v1 <= vLow && v2 >= vHigh) || (v1 >= vHigh && v2 <= vLow)) {
      if (dt > maxEdgeDt) maxEdgeDt = dt;
    }
  }

  // If no edges were traversed, use the maximum timestep in the vector
  if (maxEdgeDt === 0) {
    for (let i = 0; i < timeVec.length - 1; i++) {
      const dt = timeVec[i + 1] - timeVec[i];
      if (dt > maxEdgeDt) maxEdgeDt = dt;
    }
  }

  const edgeSamplingRatio = maxEdgeDt > 0 ? maxEdgeDt / period : 0;
  // If the sample spacing in the transition region is > 1.5% of the total period,
  // interpolation error and frequency estimation error can exceed ±3%.
  const isSufficient = edgeSamplingRatio < 0.015;

  return {
    isSufficient,
    maxSampleIntervalNearEdges: maxEdgeDt,
    edgeSamplingRatio,
    recommendation: isSufficient
      ? `Timestep discretization is fine: maximum transition dt is ${(edgeSamplingRatio * 100).toFixed(2)}% of period.`
      : `Timestep is relatively coarse: transition dt is ${(edgeSamplingRatio * 100).toFixed(2)}% of period. Recommend reducing max step size for high edge precision.`,
  };
}
