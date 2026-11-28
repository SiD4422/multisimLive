import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSchematicStore } from '../../store/useSchematicStore';
import { getGhostDataKey, interpolateTraceAtX, mergeGhostTraces } from '../ghostTraceMerge';
import {
  cancelLiveResimulation,
  getAcFrequencyLogSlider,
  getPassiveSliderSpec,
  getVoltageOrCurrentSliderSpec,
  isLiveResimPending,
  LIVE_RESIM_DEBOUNCE_MS,
  scheduleLiveResimulation,
  type LiveSimStoreSnapshot,
} from '../liveSimulation';
import type { SimulationData, SimulationRow } from '../spiceTypes';

describe('Phase 4.2: Real Interactive Live Simulation, Sliders & Ghost Trace Overlay', () => {
  afterEach(() => {
    cancelLiveResimulation();
    vi.useRealTimers();
  });

  describe('ghostTraceMerge', () => {
    it('linearly interpolates previous trace values across non-aligned X steps without extrapolating out of bounds', () => {
      const prev = [
        { time: 0, 'v(out)': 0 },
        { time: 0.002, 'v(out)': 4 },
        { time: 0.004, 'v(out)': 8 },
      ];

      expect(interpolateTraceAtX(prev, 'time', 'v(out)', 0.001)).toBeCloseTo(2, 6);
      expect(interpolateTraceAtX(prev, 'time', 'v(out)', 0.003)).toBeCloseTo(6, 6);
      expect(interpolateTraceAtX(prev, 'time', 'v(out)', -0.001)).toBeUndefined();
      expect(interpolateTraceAtX(prev, 'time', 'v(out)', 0.005)).toBeUndefined();
    });

    it('merges matched traces under __prev__<trace> without modifying unrelated rows', () => {
      const curr: SimulationRow[] = [
        { time: 0, 'v(out)': 1 },
        { time: 0.001, 'v(out)': 3 },
        { time: 0.002, 'v(out)': 5 },
      ];
      const prev: SimulationRow[] = [
        { time: 0, 'v(out)': 0 },
        { time: 0.002, 'v(out)': 10 },
      ];

      const { rows, ghostTraces } = mergeGhostTraces(curr, prev, 'time', ['v(out)', 'v(missing)']);
      expect(ghostTraces).toEqual(['v(out)']);
      expect(rows).toHaveLength(3);
      expect(rows[0][getGhostDataKey('v(out)')]).toBeCloseTo(0, 6);
      expect(rows[1][getGhostDataKey('v(out)')]).toBeCloseTo(5, 6);
      expect(rows[2][getGhostDataKey('v(out)')]).toBeCloseTo(10, 6);
      // Original rows must not be mutated
      expect(curr[1][getGhostDataKey('v(out)')]).toBeUndefined();
    });
  });

  describe('liveSimulation 300ms debounce & gating', () => {
    it('collapses rapid consecutive changes into a single silent runSimulation after 300ms', () => {
      vi.useFakeTimers();
      const runSimulation = vi.fn();
      const snapshot: LiveSimStoreSnapshot = {
        isLiveMode: true,
        components: [{ id: 'R1' }],
        simulationBuffer: [{ time: 0, 'v(out)': 1 }],
        opData: null,
        runSimulation,
      };

      expect(LIVE_RESIM_DEBOUNCE_MS).toBe(300);
      expect(scheduleLiveResimulation(300, () => snapshot)).toBe(true);
      vi.advanceTimersByTime(150);
      expect(runSimulation).not.toHaveBeenCalled();

      // Drag slider again before 300ms — timer resets
      expect(scheduleLiveResimulation(300, () => snapshot)).toBe(true);
      vi.advanceTimersByTime(200);
      expect(runSimulation).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(runSimulation).toHaveBeenCalledTimes(1);
      expect(runSimulation).toHaveBeenCalledWith(true);
      expect(isLiveResimPending()).toBe(false);
    });

    it('skips auto-resimulation when manual mode is enabled, canvas is empty, or never simulated', () => {
      vi.useFakeTimers();
      const runSimulation = vi.fn();

      expect(
        scheduleLiveResimulation(300, () => ({
          isLiveMode: false,
          components: [{ id: 'R1' }],
          simulationBuffer: [{ time: 0, 'v(out)': 1 }],
          opData: null,
          runSimulation,
        })),
      ).toBe(false);

      expect(
        scheduleLiveResimulation(300, () => ({
          isLiveMode: true,
          components: [{ id: 'R1' }],
          simulationBuffer: null,
          opData: null,
          runSimulation,
        })),
      ).toBe(false);

      // Cancel explicitly halts scheduled run
      expect(
        scheduleLiveResimulation(300, () => ({
          isLiveMode: true,
          components: [{ id: 'R1' }],
          simulationBuffer: [{ time: 0, 'v(out)': 1 }],
          opData: null,
          runSimulation,
        })),
      ).toBe(true);
      cancelLiveResimulation();
      vi.advanceTimersByTime(500);
      expect(runSimulation).not.toHaveBeenCalled();
    });
  });

  describe('component value live sliders', () => {
    it('builds unit-preserving log sliders for passive R/C/L and linear/log sliders for DC/AC sources', () => {
      const rSpec = getPassiveSliderSpec('Resistor', '4.7', 'k');
      expect(rSpec).not.toBeNull();
      const atMin = rSpec!.formatValueAtPos(0);
      const atMax = rSpec!.formatValueAtPos(100);
      expect(atMin.fullValue).toContain('kΩ');
      expect(parseFloat(atMax.scalarStr)).toBeGreaterThanOrEqual(500);

      const dcSpec = getVoltageOrCurrentSliderSpec('DCSource', '5');
      expect(dcSpec).toEqual({ min: 0, max: 24, step: 0.1, current: 5, unitLabel: 'V' });

      const acFreq = getAcFrequencyLogSlider('1k');
      expect(acFreq.currentHz).toBe(1000);
      expect(acFreq.hzFromPos(0).hz).toBeLessThanOrEqual(15);
      expect(acFreq.hzFromPos(100).hz).toBeGreaterThanOrEqual(90_000);
    });
  });

  describe('store integration & UI contracts', () => {
    it('preserves waveform updates on switch_spst prop toggle (shouldClearRef bug eliminated) and wires previousSimulationBuffer', () => {
      useSchematicStore.setState({
        components: [{ id: 'SW1', type: 'switch_spst', value: 'SW1', position: { x: 0, y: 0 }, props: { closed: false } }],
        simulationBuffer: [{ time: 0, 'v(out)': 0 }, { time: 0.001, 'v(out)': 0 }] as unknown as SimulationData,
        previousSimulationBuffer: null,
        isLiveMode: true,
      });

      vi.useFakeTimers();
      useSchematicStore.getState().updateComponentProp('SW1', 'closed', true);
      expect(useSchematicStore.getState().components[0].props?.closed).toBe(true);
      // Debounced resim is pending cleanly after prop edit
      expect(isLiveResimPending()).toBe(true);
      cancelLiveResimulation();

      const storeSrc = readFileSync(resolve(__dirname, '../../store/useSchematicStore.ts'), 'utf8');
      expect(storeSrc).not.toContain('shouldClearRef');
      expect(storeSrc).toContain('previousSimulationBuffer');

      const simSrc = readFileSync(resolve(__dirname, '../../pages/Simulator.tsx'), 'utf8');
      const inspectorSrc = readFileSync(resolve(__dirname, '../../components/ComponentInspectorPanel.tsx'), 'utf8');
      const grapherSrc = readFileSync(resolve(__dirname, '../../components/Grapher.tsx'), 'utf8');

      expect(simSrc).toContain('Live Interactive');
      expect(simSrc).toContain('setLiveMode');
      expect(inspectorSrc).toContain('getPassiveSliderSpec');
      expect(inspectorSrc).toContain('getAcFrequencyLogSlider');
      expect(grapherSrc).toContain('mergeGhostTraces');
      expect(grapherSrc).toContain('Prev Diff');
    });
  });
});
