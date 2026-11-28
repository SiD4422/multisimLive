import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import createNgspiceFactory from '@o.z/ngspice-wasm';
import { describe, expect, it } from 'vitest';
import { useSchematicStore, type SchematicComponent, type Wire } from '../../store/useSchematicStore';
import { generateNetlist } from '../netlister';
import {
  expandParametricSweep,
  getDefaultSweepConfigForComponent,
  getSweepTraceKey,
  isSweepableComponent,
  MAX_PARAMETRIC_SWEEP_STEPS,
  mergeParametricSweepOutputs,
  prepareParametricSweepNetlist,
} from '../parametricSweep';
import type { NgspiceModule, SpiceDataRow, SpiceParsedOutput } from '../spiceTypes';

function runNgspiceCommand(mod: NgspiceModule, netlist: string): void {
  mod.FS.writeFile('/circuit.cir', netlist);
  try {
    mod.FS.mkdir('/proc');
  } catch {
    // already exists
  }
  mod.FS.writeFile('/proc/meminfo', 'MemTotal: 16384000 kB\nMemFree: 8192000 kB\n');
  const args = ['ngspice', '-b', '/circuit.cir'];
  const sp = mod.stackSave ? mod.stackSave() : 0;
  try {
    const ptrs = args.map((arg) => {
      const p = mod.__emscripten_stack_alloc(arg.length + 1);
      mod.stringToUTF8(arg, p, arg.length + 1);
      return p;
    });
    const argv = mod.__emscripten_stack_alloc(args.length * 4);
    for (let i = 0; i < args.length; i++) {
      mod.HEAP32[(argv >> 2) + i] = ptrs[i];
    }
    try {
      mod._main(args.length, argv);
    } catch (err: unknown) {
      const exit = err as { name?: string; status?: number } | null;
      if (!exit || exit.name !== 'ExitStatus' || exit.status !== 0) {
        throw err;
      }
    }
  } finally {
    mod.stackRestore?.(sp);
  }
}

function parseAsciiRawSimple(rawStr: string): SpiceParsedOutput {
  const lines = rawStr.split('\n').map((l) => l.trim());
  const variables: string[] = [];
  const data: SpiceDataRow[] = [];
  let mode = 'header';
  let varIdx = 1;

  for (const line of lines) {
    if (!line) continue;
    if (line === 'Variables:') { mode = 'vars'; continue; }
    if (line === 'Values:') { mode = 'values'; continue; }
    if (mode === 'vars') {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) variables.push(parts[1]);
    } else if (mode === 'values') {
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && /^\d+$/.test(parts[0]) && !parts[0].includes('.')) {
        data.push({ [variables[0] || 'time']: parseFloat(parts[1]) });
        varIdx = 1;
      } else if (data.length > 0 && variables[varIdx]) {
        data[data.length - 1][variables[varIdx]] = parseFloat(parts[0]);
        varIdx++;
      }
    }
  }
  return Object.assign(data, { __plotType: 'transient' as const });
}

describe('Phase 4.3: .step Parametric Sweep', () => {
  it('expands SI sweep ranges cleanly and rejects invalid or oversized sweeps', () => {
    const res = expandParametricSweep(
      { enabled: true, componentId: 'R1', parameter: 'value', start: '1k', stop: '5k', step: '1k' },
      'Resistor',
    );
    expect(res.error).toBeUndefined();
    expect(res.steps.map((s) => s.value)).toEqual([1000, 2000, 3000, 4000, 5000]);
    expect(res.steps.map((s) => s.label)).toEqual(['1kΩ', '2kΩ', '3kΩ', '4kΩ', '5kΩ']);

    const tooMany = expandParametricSweep(
      { enabled: true, componentId: 'R1', parameter: 'value', start: '1k', stop: '100k', step: '1k' },
      'Resistor',
    );
    expect(tooMany.error).toContain(`${MAX_PARAMETRIC_SWEEP_STEPS}`);

    const badStep = expandParametricSweep(
      { enabled: true, componentId: 'R1', parameter: 'value', start: '1k', stop: '5k', step: '0' },
      'Resistor',
    );
    expect(badStep.error).toBeTruthy();

    const reversed = expandParametricSweep(
      { enabled: true, componentId: 'R1', parameter: 'value', start: '10k', stop: '1k', step: '1k' },
      'Resistor',
    );
    expect(reversed.error).toBeTruthy();
  });

  it('parameterizes resistors, capacitors, sources, and 3-pin potentiometers with .param SWEEP_VAL', () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'DCSource', value: '5', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
      { id: 'C1', type: 'Capacitor', value: '1u', position: { x: 200, y: 0 } },
      { id: 'POT1', type: 'potentiometer', value: '10k', position: { x: 300, y: 0 }, props: { wiper_position: 50, total_resistance: 10000 } },
      { id: 'GND1', type: 'Ground', position: { x: 0, y: 100 } },
    ];

    const netlist = [
      '* WebAssembly SPICE Netlist',
      'V_V1 1 0 DC 5',
      'R_R1 1 2 1k',
      'C_C1 2 0 1u',
      'RAPOT1 2 3 5000',
      'RBPOT1 3 0 5000',
      '.tran 10u 5m',
      '.end',
    ].join('\n');

    const rSweep = prepareParametricSweepNetlist(netlist, components, {
      enabled: true,
      componentId: 'R1',
      parameter: 'value',
      start: '1k',
      stop: '3k',
      step: '1k',
    });
    expect(rSweep.netlist).toContain('.param SWEEP_VAL=1000');
    expect(rSweep.netlist).toContain('R_R1 1 2 {SWEEP_VAL}');

    const potSweep = prepareParametricSweepNetlist(netlist, components, {
      enabled: true,
      componentId: 'POT1',
      parameter: 'wiper_position',
      start: '20',
      stop: '80',
      step: '30',
    });
    expect(potSweep.netlist).toContain('{max(0.001, 10000 * SWEEP_VAL / 100)}');
    expect(potSweep.netlist).toContain('{max(0.001, 10000 * (100 - SWEEP_VAL) / 100)}');
    expect(potSweep.sweepMeta.steps.map((s) => s.label)).toEqual(['20%', '50%', '80%']);

    expect(isSweepableComponent({ type: 'Ground' })).toBe(false);
    expect(() =>
      prepareParametricSweepNetlist(netlist, components, {
        enabled: true,
        componentId: 'GND1',
        parameter: 'value',
        start: '1',
        stop: '5',
        step: '1',
      }),
    ).toThrow(/does not support parametric sweeping/i);
  });

  it('runs real 3-step @o.z/ngspice-wasm sweep on RC circuit and verifies monotonic time-constant curves', async () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'PulseVoltage', value: '0 5 0 1u 1u 10m 20m', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } },
      { id: 'C1', type: 'Capacitor', value: '1u', position: { x: 200, y: 0 } },
      { id: 'GND1', type: 'Ground', position: { x: 0, y: 200 } },
    ];
    const baseNet = [
      '* RC Sweep E2E',
      'V_V1 in 0 PULSE(0 5 0 1u 1u 10m 20m)',
      'R_R1 in out 1k',
      'C_C1 out 0 1u',
      '.tran 100u 5m',
      '.end',
    ].join('\n');

    const prepared = prepareParametricSweepNetlist(baseNet, components, {
      enabled: true,
      componentId: 'R1',
      parameter: 'value',
      start: '1k',
      stop: '9k',
      step: '4k',
    });

    const control = [
      '.control',
      'set filetype=ascii',
      ...prepared.sweepMeta.steps.map(
        (s) => `alterparam SWEEP_VAL=${s.value}\nreset\nrun\nwrite /step_${s.stepIndex}.raw`,
      ),
      '.endc',
    ].join('\n');
    const fullDeck = prepared.netlist.replace(/\.end\s*$/im, `${control}\n.end\n`);

    const mod = (await createNgspiceFactory({ print: () => {}, printErr: () => {}, noExitRuntime: false })) as unknown as NgspiceModule;
    runNgspiceCommand(mod, fullDeck);

    const parsedSteps = prepared.sweepMeta.steps.map((s) =>
      parseAsciiRawSimple(mod.FS.readFile(`/step_${s.stepIndex}.raw`, { encoding: 'utf8' })),
    );
    const merged = mergeParametricSweepOutputs(parsedSteps, prepared.sweepMeta);
    expect(merged.length).toBeGreaterThan(20);
    expect(merged.__sweepMeta?.steps.map((s) => s.label)).toEqual(['1kΩ', '5kΩ', '9kΩ']);

    const lastRow = merged[merged.length - 1];
    const vStep0 = lastRow[getSweepTraceKey('v(out)', 0)];
    const vStep1 = lastRow[getSweepTraceKey('v(out)', 1)];
    const vStep2 = lastRow[getSweepTraceKey('v(out)', 2)];

    // At t = 5ms (C=1uF, Vs=5V): 1k (tau=1ms -> ~4.966V) > 5k (tau=5ms -> ~3.160V) > 9k (tau=9ms -> ~2.131V)
    expect(vStep0).toBeGreaterThan(4.8);
    expect(vStep1).toBeGreaterThan(2.9);
    expect(vStep1).toBeLessThan(3.4);
    expect(vStep2).toBeGreaterThan(1.9);
    expect(vStep2).toBeLessThan(2.4);
    expect(vStep0).toBeGreaterThan(vStep1!);
    expect(vStep1!).toBeGreaterThan(vStep2!);
  });

  it('wires store openParametricSweepForComponent, canvas context menu, AnalysisSettings, and Grapher multi-trace view', () => {
    const r1: SchematicComponent = { id: 'R1', type: 'Resistor', value: '2k', position: { x: 100, y: 100 } };
    const wires: Wire[] = [];
    expect(generateNetlist([r1], wires)).toContain('R_R1');

    const defaults = getDefaultSweepConfigForComponent(r1);
    expect(defaults.componentId).toBe('R1');
    expect(defaults.start).toBe('1k');
    expect(defaults.stop).toBe('5k');
    expect(defaults.step).toBe('1k');

    useSchematicStore.setState({ components: [r1], isConfigOpen: false, configActiveTab: 'properties' });
    useSchematicStore.getState().openParametricSweepForComponent('R1');
    const st = useSchematicStore.getState();
    expect(st.isConfigOpen).toBe(true);
    expect(st.configActiveTab).toBe('simulation');
    expect(st.parametricSweep.enabled).toBe(true);
    expect(st.parametricSweep.componentId).toBe('R1');

    const editorSrc = readFileSync(resolve(__dirname, '../../components/SchematicEditor.tsx'), 'utf8');
    const analysisSrc = readFileSync(resolve(__dirname, '../../components/AnalysisSettings.tsx'), 'utf8');
    const grapherSrc = readFileSync(resolve(__dirname, '../../components/Grapher.tsx'), 'utf8');

    expect(editorSrc).toContain('onContextMenu');
    expect(editorSrc).toContain('openParametricSweepForComponent');
    expect(analysisSrc).toContain('Parametric Sweep (.step)');
    expect(analysisSrc).toContain('Run Parametric Sweep');
    expect(grapherSrc).toContain('expandRenderTraces');
    expect(grapherSrc).toContain('sweepMeta');
  });
});
