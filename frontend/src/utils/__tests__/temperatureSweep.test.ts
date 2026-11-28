import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import createNgspiceFactory from '@o.z/ngspice-wasm';
import { describe, expect, it } from 'vitest';
import { useSchematicStore, type Probe, type SchematicComponent, type Wire } from '../../store/useSchematicStore';
import {
  DEFAULT_TEMPERATURE_SWEEP_CONFIG,
  expandTemperatureSweep,
  getSweepTraceKey,
  MAX_PARAMETRIC_SWEEP_STEPS,
  mergeParametricSweepOutputs,
  prepareTemperatureSweepNetlist,
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

describe('Phase 4.5: Temperature Sweep (.step temp)', () => {
  it('expands Celsius temperature ranges including -40..125 step 5 and rejects invalid or oversized sweeps', () => {
    const fine = expandTemperatureSweep({ enabled: true, start: '-40', stop: '125', step: '5' });
    expect(fine.error).toBeUndefined();
    expect(fine.steps).toHaveLength(34);
    expect(fine.steps[0]).toEqual({ stepIndex: 0, value: -40, label: '-40°C' });
    expect(fine.steps[33]).toEqual({ stepIndex: 33, value: 125, label: '125°C' });

    const wide = expandTemperatureSweep({ ...DEFAULT_TEMPERATURE_SWEEP_CONFIG, enabled: true });
    expect(wide.error).toBeUndefined();
    expect(wide.steps.map((s) => s.value)).toEqual([-40, 15, 70, 125]);
    expect(wide.steps.map((s) => s.label)).toEqual(['-40°C', '15°C', '70°C', '125°C']);

    const subZero = expandTemperatureSweep({ enabled: true, start: '-273.15', stop: '25', step: '50' });
    expect(subZero.error).toContain('absolute zero');

    const badStep = expandTemperatureSweep({ enabled: true, start: '0', stop: '100', step: '0' });
    expect(badStep.error).toContain('greater than 0');

    const reversed = expandTemperatureSweep({ enabled: true, start: '100', stop: '0', step: '10' });
    expect(reversed.error).toContain('greater than or equal to Start');

    const oversized = expandTemperatureSweep({ enabled: true, start: '-40', stop: '125', step: '1' });
    expect(oversized.error).toContain(`${MAX_PARAMETRIC_SWEEP_STEPS}`);

    const prepared = prepareTemperatureSweepNetlist('* Test Circuit\nR_R1 in 0 1k\n.tran 10u 1m\n.end', {
      enabled: true,
      start: '-40',
      stop: '125',
      step: '5',
    });
    expect(prepared.netlist).toContain('* .step temp -40 125 5');
    expect(prepared.sweepMeta.kind).toBe('temp');
    expect(prepared.sweepMeta.componentId).toBe('TEMP');
    expect(prepared.sweepMeta.parameter).toBe('temp');
    expect(prepared.sweepMeta.steps).toHaveLength(34);
  });

  it('executes a real ngspice-46 temperature sweep via option temp on a 1N4148 diode clipper', async () => {
    const baseNet = [
      '* Diode Temperature Sweep Test',
      'V_V1 in 0 AC 5 SINE(0 5 1k)',
      'R_R1 in out 1k',
      'D_D1 out 0 1N4148',
      '.model 1N4148 D (IS=2.52n RS=0.568 N=1.752 CJO=4p M=0.4 TT=20n BV=100 IBV=100u)',
      '.tran 20u 1m',
      '.end',
    ].join('\n');

    const prepared = prepareTemperatureSweepNetlist(baseNet, {
      enabled: true,
      start: '-40',
      stop: '125',
      step: '55',
    });

    const control = [
      '.control',
      'set filetype=ascii',
      ...prepared.sweepMeta.steps.map(
        (s) => `option temp=${s.value}\nrun\nwrite /step_${s.stepIndex}.raw`,
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
    expect(merged.__sweepMeta?.kind).toBe('temp');
    expect(merged.__sweepMeta?.steps.map((s) => s.label)).toEqual(['-40°C', '15°C', '70°C', '125°C']);

    const peakForStep = (stepIdx: number) =>
      Math.max(...merged.map((row) => row[getSweepTraceKey('v(out)', stepIdx)] ?? -Infinity));

    const vCold = peakForStep(0);   // -40°C
    const vCool = peakForStep(1);   // 15°C
    const vWarm = peakForStep(2);   // 70°C
    const vHot = peakForStep(3);    // 125°C

    // Silicon PN junction Vf drops ~1.8 mV/°C as temperature rises
    expect(vCold).toBeGreaterThan(0.72);
    expect(vHot).toBeLessThan(0.52);
    expect(vCold).toBeGreaterThan(vCool);
    expect(vCool).toBeGreaterThan(vWarm);
    expect(vWarm).toBeGreaterThan(vHot);
    expect(vCold - vHot).toBeGreaterThan(0.2);
  });

  it('enforces store mutual exclusion, blocks unsupported op/noise modes, and wires UI/worker', async () => {
    const v1: SchematicComponent = { id: 'V1', type: 'ACSource', value: '1Vpk 1kHz', position: { x: 0, y: 0 } };
    const r1: SchematicComponent = { id: 'R1', type: 'Resistor', value: '1k', position: { x: 100, y: 0 } };
    const c1: SchematicComponent = { id: 'C1', type: 'Capacitor', value: '10n', position: { x: 200, y: 100 } };
    const gnd: SchematicComponent = { id: 'GND1', type: 'Ground', value: '0', position: { x: 0, y: 200 } };
    const wires: Wire[] = [
      { id: 'w1', points: [{ x: 100, y: 0 }, { x: 200, y: 0 }] },
      { id: 'w2', points: [{ x: 0, y: 200 }, { x: 200, y: 200 }] },
    ];
    const probes: Probe[] = [{ id: 'PRB1', type: 'Voltage', position: { x: 200, y: 0 } }];

    useSchematicStore.setState({
      components: [v1, r1, c1, gnd],
      wires,
      probes,
      simulationError: null,
      analysisMode: 'transient',
      parametricSweep: { enabled: true, componentId: 'R1', parameter: 'value', start: '1k', stop: '5k', step: '1k' },
      temperatureSweep: { ...DEFAULT_TEMPERATURE_SWEEP_CONFIG },
    });

    // Enabling temperature sweep automatically turns off parametric sweep
    useSchematicStore.getState().setTemperatureSweep({ enabled: true, start: '-40', stop: '125', step: '5' });
    let st = useSchematicStore.getState();
    expect(st.temperatureSweep.enabled).toBe(true);
    expect(st.parametricSweep.enabled).toBe(false);

    // Enabling parametric sweep automatically turns off temperature sweep
    useSchematicStore.getState().setParametricSweep({ enabled: true });
    st = useSchematicStore.getState();
    expect(st.parametricSweep.enabled).toBe(true);
    expect(st.temperatureSweep.enabled).toBe(false);

    // openParametricSweepForComponent also disables temperature sweep
    useSchematicStore.getState().setTemperatureSweep({ enabled: true });
    useSchematicStore.getState().openParametricSweepForComponent('R1');
    st = useSchematicStore.getState();
    expect(st.parametricSweep.enabled).toBe(true);
    expect(st.temperatureSweep.enabled).toBe(false);

    // Running .op or .noise with temperature sweep enabled surfaces a clear validation error before spawning worker
    useSchematicStore.getState().setTemperatureSweep({ enabled: true });
    useSchematicStore.setState({ analysisMode: 'op', simulationError: null });
    await useSchematicStore.getState().runSimulation(true);
    expect(useSchematicStore.getState().simulationError).toContain('Temperature Sweep (.step temp)');

    useSchematicStore.setState({ analysisMode: 'noise', simulationError: null });
    await useSchematicStore.getState().runSimulation(true);
    expect(useSchematicStore.getState().simulationError).toContain('Temperature Sweep (.step temp)');

    const workerSrc = readFileSync(resolve(__dirname, '../spiceWorker.ts'), 'utf8');
    const analysisSrc = readFileSync(resolve(__dirname, '../../components/AnalysisSettings.tsx'), 'utf8');
    const grapherSrc = readFileSync(resolve(__dirname, '../../components/Grapher.tsx'), 'utf8');

    expect(workerSrc).toContain("sweep.kind === 'temp'");
    expect(workerSrc).toContain('option temp=');
    expect(analysisSrc).toContain('Temperature Sweep (.step temp)');
    expect(analysisSrc).toContain('Run Temperature Sweep');
    expect(grapherSrc).toContain("sweepMeta.kind === 'temp'");
    expect(grapherSrc).toContain('.step temp');
  });
});
