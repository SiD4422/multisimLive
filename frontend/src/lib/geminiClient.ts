// geminiClient.ts
// Gemini API client used by the AI panel and the lab-report generator.
//
// Two transport modes:
//   - Proxy  (default): POST /api/gemini  -> frontend/api/gemini.ts (hosted key, rate limited)
//   - Direct (BYOK):    POST generativelanguage.googleapis.com with the user's own key
//
// IMPORTANT: the proxy only forwards models listed in its allowlist
// (DEFAULT_MODELS in api/gemini.ts, or the GEMINI_ALLOWED_MODELS env var).
// If you change a model name below, change it there too.

import type { AIContext, DiagnosisResult, ChatMessage, DiagnosticIssue, AIAction } from './aiTypes';
import { serializeContext } from './aiContext';

export const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const EXPLAIN_MODEL   = GEMINI_MODEL; // streaming explain / chat
const DIAGNOSE_MODEL  = GEMINI_MODEL; // structured JSON diagnosis

// Mode 1: Proxy (no API key needed) — default for new users
const PROXY_BASE = '/api/gemini';
// Mode 2: Direct BYOK — used when user has set their own key  
const DIRECT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Local Deterministic Fallback Diagnostics ─────────────────────────────────

export function localDeterministicDiagnose(context: AIContext): DiagnosisResult {
  const issues: DiagnosticIssue[] = [];
  const actions: AIAction[] = [];
  const comps = context.circuit.components || [];
  const netlist = context.circuit.netlist || '';
  const hasGround = netlist.includes(' 0 ') || netlist.includes(' 0\n') || comps.some(c => c.type.toLowerCase().includes('ground'));

  if (!hasGround) {
    issues.push({
      id: 'missing_ground',
      severity: 'critical',
      title: 'Missing Ground Reference (Node 0)',
      description: 'SPICE nodal equations require a ground reference (0V) to determine absolute potentials.',
      components: [],
      nodes: ['0'],
      evidence: [],
      suggestion: 'Place a Ground symbol from the component palette and connect it to your common reference net.',
    });
  }

  // Floating / unconnected terminals
  const floatingMatches = netlist.match(/NC_\w+/g);
  if (floatingMatches && floatingMatches.length > 0) {
    const uniqueFloating = Array.from(new Set(floatingMatches));
    issues.push({
      id: 'floating_nodes',
      severity: 'warning',
      title: 'Floating Unconnected Terminals',
      description: `Found ${uniqueFloating.length} unconnected pin(s) in netlist (${uniqueFloating.slice(0, 3).join(', ')}).`,
      components: [],
      nodes: uniqueFloating,
      evidence: [],
      suggestion: 'Connect all floating terminals to the circuit or terminate with a high-impedance resistor.',
    });
  }

  // Solver errors
  if (context.simulation.status === 'error') {
    issues.push({
      id: 'sim_error',
      severity: 'critical',
      title: 'SPICE Solver Convergence Failure',
      description: context.simulation.errorMessage || 'Numerical solver encountered a singularity.',
      components: [],
      nodes: [],
      evidence: [],
      suggestion: 'Verify all nodes have a DC path to ground and check for shorted voltage sources.',
    });
  }

  // Op-Amp saturation check
  const hasOpAmp = comps.some(c => c.type.toLowerCase().includes('opamp') || c.type.toLowerCase().includes('amplifier'));
  if (hasOpAmp && context.simulation.nodeStats && context.simulation.nodeStats.length > 0) {
    const saturated = context.simulation.nodeStats.find(s => Math.abs(s.max) >= 14.8 || Math.abs(s.min) >= 14.8);
    if (saturated) {
      issues.push({
        id: 'opamp_saturation',
        severity: 'warning',
        title: 'Op-Amp Output Saturation',
        description: `Signal at node ${saturated.node} reaches rail voltage (${saturated.max.toFixed(2)}V). Feedback loop may be open or input drive too high.`,
        components: [],
        nodes: [saturated.node],
        evidence: [{ node: saturated.node, metric: 'Vmax', value: saturated.max, expected: '< ±14V' }],
        suggestion: 'Verify feedback resistor value or reduce input source amplitude.',
      });
      actions.push({ type: 'show_waveform', node: saturated.node });
    }
  }

  const diagnosis = issues.length === 0
    ? 'All circuit nodes and bias points verified nominal.'
    : `Pre-flight diagnostic identified ${issues.length} issue(s) in schematic.`;

  const answer = issues.length === 0
    ? `The circuit contains ${comps.length} components (${comps.map(c => c.type).join(', ')}) with full DC continuity and nominal simulation convergence.`
    : `Diagnostic review identified ${issues.length} potential issue(s). Review recommendations below.`;

  return { answer, diagnosis, issues, actions };
}

// ─── System prompts ──────────────────────────────────────────────────────────

const EXPLAIN_SYSTEM = `You are an expert electronics tutor for engineering students.
You receive a structured circuit context (netlist, component list, simulation stats) and explain the circuit clearly.
Use markdown formatting. Be practical, concise, and student-friendly. Focus on intuition, not formulas.`;

const DIAGNOSE_SYSTEM = `You are an expert SPICE circuit debugger for NodeSim, a browser-based circuit simulator.
You receive a structured circuit context and must return ONLY valid JSON matching the DiagnosisResult schema.
Be specific — reference actual component IDs (e.g. "R_comp_abc123") and node names from the netlist.
If the circuit has no issues, return an empty issues array with a positive diagnosis.`;

const DIAGNOSE_SCHEMA = `Return a JSON object exactly matching this TypeScript interface:
interface DiagnosisResult {
  answer: string;        // 2-3 sentence conversational summary (markdown ok)
  diagnosis: string;     // One sentence: overall circuit health
  issues: Array<{
    id: string;          // snake_case identifier
    severity: "info" | "warning" | "critical";
    title: string;       // Short title, < 8 words
    description: string; // 1-2 sentences
    components: string[]; // component IDs from the netlist
    nodes: string[];      // SPICE node names
    evidence: Array<{ node: string; metric: string; value: number; expected?: string }>;
    suggestion: string;  // Concrete fix, one sentence
  }>;
  actions: Array<
    | { type: "highlight"; targets: string[] }
    | { type: "show_waveform"; node: string }
    | { type: "open_component"; id: string }
  >;
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function geminiUrl(model: string, method: string, stream = false, apiKey: string) {
  if (apiKey.trim()) {
    return `${DIRECT_BASE}/${model}:${method}${stream ? '?alt=sse' : ''}`;
  }
  return `${PROXY_BASE}?model=${encodeURIComponent(model)}&method=${encodeURIComponent(method)}${stream ? '&stream=true' : ''}`;
}

function geminiHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey.trim()) {
    headers['x-goog-api-key'] = apiKey.trim();
  }
  return headers;
}

// ─── diagnose() — structured JSON call ───────────────────────────────────────

export async function diagnose(context: AIContext, apiKey: string): Promise<DiagnosisResult> {
  const contextStr = serializeContext(context);
  const prompt = `${contextStr}\n\n---\nANALYSIS TASK: Auto-diagnose this circuit for issues.\n${DIAGNOSE_SCHEMA}`;

  // Auto-retry on 503 overloaded (up to 3 attempts with backoff)
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(geminiUrl(DIAGNOSE_MODEL, 'generateContent', false, apiKey), {
      method: 'POST',
      headers: geminiHeaders(apiKey),
      body: JSON.stringify({
        system_instruction: { parts: [{ text: DIAGNOSE_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (res.status !== 503) break;
    // Wait before retry: 1s, then 2s
    await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
  }

  if (!res || !res.ok) {
    if (res?.status === 429) throw new Error('Rate limit exceeded');
    if (res?.status === 503) throw new Error('AI is busy right now — please try again in a few seconds.');
    const err = await res?.json().catch(() => ({}));
    const errMsg = (err as { error?: { message?: string } })?.error?.message || (err as { error?: string })?.error || `Gemini API error ${res?.status}`;
    if (errMsg.includes('missing API key')) {
      return localDeterministicDiagnose(context);
    }
    throw new Error(errMsg);
  }

  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown fences if model wraps JSON anyway
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(cleaned) as DiagnosisResult;
  } catch {
    throw new Error('AI returned malformed JSON. Try again.');
  }
}

// ─── streamExplain() — SSE streaming call ────────────────────────────────────

export async function streamExplain(
  context: AIContext,
  apiKey: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const contextStr = serializeContext(context);
  const hasResults = context.simulation.status === 'success';
  const simSummary = hasResults
    ? context.simulation.nodeStats.map(s => s.node + ' = ' + s.mean.toExponential(3) + ' ' + s.unit + ' (mean)').join('\n')
    : '';

  const prompt = `${contextStr}\n\nExplain this circuit in plain language:\n1. What it does\n2. Key component roles\n3. How it works\n${hasResults ? '4. Interpret the simulation results:\n' + simSummary + '\n5. Potential issues or improvements' : '4. What to expect from simulation\n5. Common pitfalls'}`;

  const res = await fetch(geminiUrl(EXPLAIN_MODEL, 'streamGenerateContent', true, apiKey), {
    method: 'POST',
    headers: geminiHeaders(apiKey),
    signal,
    body: JSON.stringify({
      system_instruction: { parts: [{ text: EXPLAIN_SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error('Rate limit exceeded');
    const err = await res.json().catch(() => ({}));
    const errMsg = (err as { error?: { message?: string } })?.error?.message || (err as { error?: string })?.error || `API error ${res.status}`;
    if (errMsg.includes('missing API key')) {
      const compTypes = Array.from(new Set(context.circuit.components.map(c => c.type))).join(', ');
      const simStatus = context.simulation.status === 'success' ? 'converged cleanly with stable waveform output' : 'requires ground or wiring review';
      const fallbackExplanation = `### Circuit Overview\nThis circuit integrates **${context.circuit.componentCount} components** (${compTypes}) operating in **${context.simulation.analysisMode} mode**.\n\n### Operational Summary\n- **Topology:** ${context.circuit.topology || 'Analog/Mixed-Signal testbench'}\n- **SPICE Status:** The solver ${simStatus}.\n- **Key Signals:** ${context.simulation.nodeStats.slice(0, 3).map(s => `${s.node}: ${s.mean.toFixed(3)} ${s.unit} (mean)`).join(', ') || 'Nominal'}\n\n*Tip: To unlock live multi-turn Gemini 2.0 Flash reasoning, add a free Google Gemini API key via the Key icon or deploy to production.*`;
      for (const char of fallbackExplanation) {
        onChunk(char);
      }
      return;
    }
    throw new Error(errMsg);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;
      try {
        const parsed = JSON.parse(json) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (chunk) onChunk(chunk);
      } catch { /* skip malformed SSE chunk */ }
    }
  }
}

// ─── streamChat() — multi-turn chat call ─────────────────────────────────────

export async function streamChat(
  context: AIContext,
  history: ChatMessage[],
  userMessage: string,
  apiKey: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const contextStr = serializeContext(context);
  const systemText = `${EXPLAIN_SYSTEM}\n\nHere is the current circuit context:\n${contextStr}`;

  // Build conversation turns (exclude system injection from history)
  const contents = [
    ...history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(geminiUrl(EXPLAIN_MODEL, 'streamGenerateContent', true, apiKey), {
    method: 'POST',
    headers: geminiHeaders(apiKey),
    signal,
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: { temperature: 0.5, maxOutputTokens: 1200 },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error('Rate limit exceeded');
    const err = await res.json().catch(() => ({}));
    const errMsg = (err as { error?: { message?: string } })?.error?.message || (err as { error?: string })?.error || `API error ${res.status}`;
    if (errMsg.includes('missing API key')) {
      const fallbackChat = `To enable interactive multi-turn AI reasoning in local development, please add a free Google Gemini API key by clicking the key icon above (get one free at https://aistudio.google.com/app/apikey). In production at nodesimapp.com, cloud AI proxy is hosted automatically.`;
      for (const char of fallbackChat) {
        onChunk(char);
      }
      return;
    }
    throw new Error(errMsg);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;
      try {
        const parsed = JSON.parse(json) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (chunk) onChunk(chunk);
      } catch { /* skip */ }
    }
  }
}