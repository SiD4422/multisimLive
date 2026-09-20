// aiContext.ts
import { generateNetlist } from '../utils/netlister';
import type { AIContext, AISimContext, NodeStat } from './aiTypes';
import type { SchematicComponent, Wire, Probe } from '../store/useSchematicStore';

const TOPOLOGY_RULES: { pattern: (types: string[]) => boolean; label: string }[] = [
  { pattern: t => t.includes('TransistorNPN') || t.includes('TransistorPNP'), label: 'transistor amplifier' },
  { pattern: t => t.includes('OpAmp'), label: 'op-amp circuit' },
  { pattern: t => t.includes('Diode') && t.includes('Capacitor'), label: 'rectifier / power supply' },
  { pattern: t => t.includes('Inductor') && t.includes('Capacitor'), label: 'LC filter / resonant circuit' },
  { pattern: t => t.includes('Capacitor') && !t.includes('Inductor'), label: 'RC filter / timing circuit' },
  { pattern: t => t.includes('Inductor') && !t.includes('Capacitor'), label: 'RL circuit' },
  { pattern: t => t.some((x: string) => x.includes('MOSFET')), label: 'MOSFET circuit' },
  { pattern: t => t.includes('DCSource') || t.includes('ACSource'), label: 'basic circuit' },
];

function detectTopology(components: SchematicComponent[]): string {
  const types = components.map(c => c.type);
  for (const rule of TOPOLOGY_RULES) {
    if (rule.pattern(types)) return rule.label;
  }
  return 'general circuit';
}

export function extractWaveformStats(simulationData: Record<string, number>[] | null): NodeStat[] {
  if (!simulationData || simulationData.length === 0) return [];
  const firstRow = simulationData[0];
  const nodeKeys = Object.keys(firstRow).filter(k => k !== 'time');
  return nodeKeys.map(node => {
    const values = simulationData.map(row => (row[node] as number) ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const unit = node.toLowerCase().startsWith('i(') ? 'A' : 'V';
    return { node, min, max, mean, unit };
  });
}

export interface BuildContextArgs {
  components: SchematicComponent[];
  wires: Wire[];
  probes: Probe[];
  analysisMode: string;
  simulationData: Record<string, number>[] | null;
  opData: { node: string; value: number; unit: string }[] | null;
  simulationError: string | null;
  selectedComponentId: string | null;
  activeQuestion?: string;
  customModels?: Record<string, string>;
}

export function buildAIContext(args: BuildContextArgs): AIContext {
  const { components, wires, probes, analysisMode, simulationData, opData, simulationError, selectedComponentId, activeQuestion, customModels = {} } = args;
  const netlist = components.length > 0 ? generateNetlist(components, wires, probes, customModels) : '';
  let simCtx: AISimContext;
  if (simulationError) {
    simCtx = { status: 'error', analysisMode, errorMessage: simulationError, nodeStats: [] };
  } else if (opData && opData.length > 0) {
    const nodeStats: NodeStat[] = opData.map(d => ({ node: d.node, min: d.value, max: d.value, mean: d.value, unit: d.unit }));
    simCtx = { status: 'success', analysisMode, nodeStats };
  } else if (simulationData && simulationData.length > 0) {
    simCtx = { status: 'success', analysisMode, nodeStats: extractWaveformStats(simulationData as Record<string, number>[]) };
  } else {
    simCtx = { status: 'none', analysisMode, nodeStats: [] };
  }
  return {
    circuit: {
      netlist,
      componentCount: components.length,
      topology: detectTopology(components),
      components: components.map(c => ({ id: c.id, type: c.type, value: c.value || '' })),
    },
    simulation: simCtx,
    user: { selectedComponentId, activeQuestion },
  };
}

export function serializeContext(ctx: AIContext): string {
  const compList = ctx.circuit.components.map(c => c.type + '[' + c.id + ']=' + c.value).join(', ');
  const lines: string[] = [
    '# Circuit Context',
    'Topology: ' + ctx.circuit.topology,
    'Components (' + ctx.circuit.componentCount + '): ' + compList,
    '',
    '## Netlist',
    '```spice',
    ctx.circuit.netlist || '(empty)',
    '```',
    '',
    '## Simulation',
    'Status: ' + ctx.simulation.status + '  Mode: ' + ctx.simulation.analysisMode,
  ];
  if (ctx.simulation.errorMessage) lines.push('Error: ' + ctx.simulation.errorMessage);
  if (ctx.simulation.nodeStats.length > 0) {
    lines.push('', '### Node Statistics (min / max / mean)');
    for (const s of ctx.simulation.nodeStats) {
      lines.push('  ' + s.node + ': ' + s.min.toExponential(3) + ' / ' + s.max.toExponential(3) + ' / ' + s.mean.toExponential(3) + ' ' + s.unit);
    }
  }
  if (ctx.user.selectedComponentId) lines.push('', 'User selected: ' + ctx.user.selectedComponentId);
  return lines.join('\n');
}