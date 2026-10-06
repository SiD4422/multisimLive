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

import type { AIContext, DiagnosisResult, ChatMessage } from './aiTypes';
import { serializeContext } from './aiContext';

export const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const EXPLAIN_MODEL   = GEMINI_MODEL; // streaming explain / chat
const DIAGNOSE_MODEL  = GEMINI_MODEL; // structured JSON diagnosis

// Mode 1: Proxy (no API key needed) — default for new users
const PROXY_BASE = '/api/gemini';
// Mode 2: Direct BYOK — used when user has set their own key  
const DIRECT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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
    throw new Error((err as { error?: { message?: string } })?.error?.message || err?.error || `Gemini API error ${res?.status}`);
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
    throw new Error((err as { error?: { message?: string } })?.error?.message || err?.error || `API error ${res.status}`);
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
    throw new Error((err as { error?: { message?: string } })?.error?.message || err?.error || `API error ${res.status}`);
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