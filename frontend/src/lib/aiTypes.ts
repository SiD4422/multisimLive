// aiTypes.ts
// Shared type contract between Gemini and the NodeSim UI.
// The AI always returns DiagnosisResult JSON; NodeSim interprets it.

export type Severity = 'info' | 'warning' | 'critical';

export interface DiagnosticEvidence {
  node: string;
  metric: string;
  value: number;
  expected?: string;
}

export interface DiagnosticIssue {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  components: string[];
  nodes: string[];
  evidence: DiagnosticEvidence[];
  suggestion: string;
}

export type AIAction =
  | { type: 'highlight'; targets: string[] }
  | { type: 'show_waveform'; node: string }
  | { type: 'open_component'; id: string };

export interface DiagnosisResult {
  answer: string;
  diagnosis: string;
  issues: DiagnosticIssue[];
  actions: AIAction[];
}

export interface NodeStat {
  node: string;
  min: number;
  max: number;
  mean: number;
  unit: string;
}

export interface AICircuitContext {
  netlist: string;
  componentCount: number;
  topology: string;
  components: { id: string; type: string; value: string }[];
}

export interface AISimContext {
  status: 'none' | 'success' | 'error';
  analysisMode: string;
  errorMessage?: string;
  nodeStats: NodeStat[];
}

export interface AIUserContext {
  selectedComponentId: string | null;
  activeQuestion?: string;
}

export interface AIContext {
  circuit: AICircuitContext;
  simulation: AISimContext;
  user: AIUserContext;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  diagnosis?: DiagnosisResult;
  timestamp: number;
}
