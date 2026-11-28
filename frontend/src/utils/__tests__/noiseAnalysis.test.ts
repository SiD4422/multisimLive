import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import createNgspiceFactory from '@o.z/ngspice-wasm';
import { describe, expect, it } from 'vitest';
import { useSchematicStore, type Probe, type SchematicComponent, type Wire } from '../../store/useSchematicStore';
import { generateNetlist } from '../netlister';
import {
  buildNoiseDirective,
  DEFAULT_NOISE_SETTINGS,
  formatNoiseDensity,
  formatRmsNoiseVoltage,
  parseIntegratedNoiseRaw,
} from '../noiseAnalysis';
import type { NgspiceModule, SpiceDataRow } from '../spiceTypes';

function runNgspiceCommand(mod: NgspiceModule, netlist: string): void {
  mod.FS.writeFile('/circuit.cir', netlist);
  try {
    mod.FS.mkdir('/proc');
  } catch {
    // ignore
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

function parseNoiseSpecRaw(rawStr: string): SpiceDataRow[] {
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
        data.push({ [variables[0] || 'frequency']: parseFloat(parts[1]) });
        varIdx = 1;
      } else if (data.length > 0 && variables[varIdx]) {
        data[data.length - 1][variables[varIdx]] = parseFloat(parts[0]);
        varIdx++;
      }
    }
  }
  return data;
}

describe('Phase 4.4: .noise Spectral & Integrated Noise Analysis', () => {
  it('builds .noise directives with automatic Voltage Probe node resolution and validates inputs', () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'ACSource', value: '1Vpk 1kHz', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '10k', position: { x: 100, y: 0 } },
      { id: 'C1', type: 'Capacitor', value: '10n', position: { x: 200, y: 100 } },
      { id: 'GND1', type: 'Ground', position: { x: 0, y: 200 } },
    ];
    const wires: Wire[] = [
      { id: 'w1', points: [{ x: 100, y: 0 }, { x: 200, y: 0 }] },
      { id: 'w2', points: [{ x: 0, y: 200 }, { x: 200, y: 200 }] },
    ];
    const probes: Probe[] = [
      { id: 'PRB1', type: 'Voltage', position: { x: 200, y: 0 } },
    ];

    const sampleNet = '* RC Noise\nV_V1 1 0 AC 1 SINE(0 1 1k)\nR_R1 1 2 10k\nC_C1 2 0 10n\n.end\n';

    const autoBuilt = buildNoiseDirective(sampleNet, components, wires, [], {
      ...DEFAULT_NOISE_SETTINGS,
      outputNode: 'V(2)',
      inputSource: 'V1',
    });
    expect(autoBuilt.outputNode).toBe('2');
    expect(autoBuilt.directive).toBe('.noise V(2) V_V1 dec 10 1 1Meg');

    // Missing output probe and blank outputNode -> clear actionable error
    expect(() =>
      buildNoiseDirective(sampleNet, components, wires, [], { ...DEFAULT_NOISE_SETTINGS, outputNode: '' }),
    ).toThrow(/Voltage Probe/i);

    // Explicit netlist with Voltage Probe sitting on wire `w1` resolves non-ground SPICE node
    const netFromWires = generateNetlist(components, wires, probes);
    const probeBuilt = buildNoiseDirective(netFromWires, components, wires, probes, {
      ...DEFAULT_NOISE_SETTINGS,
      outputNode: '',
      variation: 'oct',
      points: '20',
      fStart: '10',
      fStop: '100k',
    });
    expect(probeBuilt.outputNode).not.toBe('0');
    expect(probeBuilt.directive).toMatch(/^\.noise V\([^)]+\) V_V1 oct 20 10 100k$/);

    // Invalid input source missing from netlist -> error
    expect(() =>
      buildNoiseDirective('* Empty\nR_R1 1 0 1k\n.end', components, wires, probes, {
        ...DEFAULT_NOISE_SETTINGS,
        outputNode: '1',
        inputSource: 'V99',
      }),
    ).toThrow(/not found/i);
  });

  it('parses Integrated Noise raw output and formats V/√Hz and Vrms units', () => {
    const rawTotal = [
      'Title: * rc thermal noise test',
      'Plotname: Integrated Noise',
      'Flags: real',
      'No. Variables: 2',
      'No. Points: 1',
      'Variables:',
      '\t0\tv(onoise_total)\tvoltage',
      '\t1\tv(inoise_total)\tvoltage',
      'Values:',
      ' 0\t6.3846e-07',
      '\t4.5553e-06',
    ].join('\n');

    const summary = parseIntegratedNoiseRaw(rawTotal, { outputNode: 'out', inputSource: 'V1' });
    expect(summary).toBeDefined();
    expect(summary!.onoiseTotal).toBeCloseTo(6.3846e-7, 11);
    expect(summary!.inoiseTotal).toBeCloseTo(4.5553e-6, 10);
    expect(formatNoiseDensity(1.287e-8)).toBe('12.9 nV/√Hz');
    expect(formatRmsNoiseVoltage(6.3846e-7)).toBe('638 nVrms');
  });

  it('runs real @o.z/ngspice-wasm .noise simulation on RC filter and matches Johnson-Nyquist thermal physics', async () => {
    const components: SchematicComponent[] = [
      { id: 'V1', type: 'ACSource', value: '1Vpk 1kHz', position: { x: 0, y: 0 } },
      { id: 'R1', type: 'Resistor', value: '10k', position: { x: 100, y: 0 } },
      { id: 'C1', type: 'Capacitor', value: '10n', position: { x: 200, y: 0 } },
      { id: 'GND1', type: 'Ground', position: { x: 0, y: 100 } },
    ];
    const netlist = [
      '* RC Thermal Noise Physics Test',
      'V_V1 in 0 DC 0 AC 1',
      'R_R1 in out 10k',
      'C_C1 out 0 10n',
      '.end',
    ].join('\n');

    const built = buildNoiseDirective(netlist, components, [], [], {
      outputNode: 'out',
      inputSource: 'V1',
      variation: 'dec',
      points: '10',
      fStart: '10',
      fStop: '100k',
    });

    const deck = [
      netlist.replace(/\.end\s*$/im, ''),
      built.directive,
      '.control',
      'run',
      'set filetype=ascii',
      'write /output.raw noise1.all',
      'write /noise_total.raw noise2.all',
      '.endc',
      '.end',
    ].join('\n');

    const mod = (await createNgspiceFactory({ print: () => {}, printErr: () => {}, noExitRuntime: false })) as unknown as NgspiceModule;
    runNgspiceCommand(mod, deck);

    const specRows = parseNoiseSpecRaw(mod.FS.readFile('/output.raw', { encoding: 'utf8' }));
    expect(specRows.length).toBe(41);
    const first = specRows[0];
    const last = specRows[specRows.length - 1];

    // At 10 Hz (far below fc = 1.59 kHz): sqrt(4 * kT * 10k) ≈ 12.87 nV/sqrt(Hz)
    expect(first.onoise_spectrum).toBeGreaterThan(1.2e-8);
    expect(first.onoise_spectrum).toBeLessThan(1.35e-8);
    // At 100 kHz: attenuated ~63x by RC lowpass (< 0.5 nV/sqrt(Hz))
    expect(last.onoise_spectrum).toBeLessThan(5e-10);

    const summary = parseIntegratedNoiseRaw(mod.FS.readFile('/noise_total.raw', { encoding: 'utf8' }), built);
    expect(summary).toBeDefined();
    // sqrt(kT / C) = sqrt(4.14e-21 / 1e-8) ≈ 0.643 uVrms
    expect(summary!.onoiseTotal).toBeGreaterThan(5e-7);
    expect(summary!.onoiseTotal).toBeLessThan(7.5e-7);
  });

  it('wires noise mode across store, spiceWorker, AnalysisSettings, and Grapher', () => {
    useSchematicStore.getState().setAnalysisMode('noise');
    useSchematicStore.getState().setNoiseSettings({ points: '25', fStop: '10Meg' });
    const state = useSchematicStore.getState();
    expect(state.analysisMode).toBe('noise');
    expect(state.noiseSettings.points).toBe('25');
    expect(state.noiseSettings.fStop).toBe('10Meg');
    useSchematicStore.getState().setAnalysisMode('transient');

    const workerSrc = readFileSync(resolve(__dirname, '../spiceWorker.ts'), 'utf8');
    const analysisSrc = readFileSync(resolve(__dirname, '../../components/AnalysisSettings.tsx'), 'utf8');
    const grapherSrc = readFileSync(resolve(__dirname, '../../components/Grapher.tsx'), 'utf8');

    expect(workerSrc).toContain('noise1.all');
    expect(workerSrc).toContain('parseIntegratedNoiseRaw');
    expect(analysisSrc).toContain('Noise (.noise)');
    expect(grapherSrc).toContain('NoisePlot');
    expect(grapherSrc).toContain('onoise_spectrum');
  });
});
