// geminiClient.ts
// Clean Gemini API client. Replaces the inline fetch logic in AiExplainerPanel.
// Uses gemini-2.0-flash for structured diagnosis (better reasoning).
// Uses gemini-1.5-flash for streaming explain/chat (speed).

import type { AIContext, DiagnosisResult, ChatMessage } from './aiTypes';
import { serializeContext } from './aiContext';

const EXPLAIN_MODEL = 'gemini-1.5-flash';
const DIAGNOSE_MODEL = 'gemini-2.0-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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

function geminiUrl(model: string, method: string, stream = false) {
  return `${BASE}/${model}:${method}${stream ? '?alt=sse' : ''}`;
}

function geminiHeaders(apiKey: string): Record<string, string> {
  // Key sent as header (NOT query string) — query strings appear in server logs and browser history
  return { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() };
}

// ─── diagnose() — structured JSON call ───────────────────────────────────────

export async function diagnose(context: AIContext, apiKey: string): Promise<DiagnosisResult> {
  const contextStr = serializeContext(context);
  const prompt = `${contextStr}\n\n---\nANALYSIS TASK: Auto-diagnose this circuit for issues.\n${DIAGNOSE_SCHEMA}`;

  const res = await fetch(geminiUrl(DIAGNOSE_MODEL, 'generateContent'), {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `Gemini API error ${res.status}`);
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

  const res = await fetch(geminiUrl(EXPLAIN_MODEL, 'streamGenerateContent', true), {
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
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `API error ${res.status}`);
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

  const res = await fetch(geminiUrl(EXPLAIN_MODEL, 'streamGenerateContent', true), {
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
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `API error ${res.status}`);
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