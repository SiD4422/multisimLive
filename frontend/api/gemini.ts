export const config = { runtime: 'edge' };

/**
 * NodeSim hosted Gemini proxy (Vercel Edge Function).
 *
 * Supports two calling conventions:
 *  1. Simple prompt mode: { prompt: string } -> { result: string }
 *     Used by LabReportModal and Grapher (AI Waveform Debugger).
 *  2. Native Gemini gateway mode: ?model=...&method=...[&stream=true] with { contents: [...] }
 *     Used by geminiClient (AI Explainer, Diagnose, Chat) and tested by geminiProxy.test.ts.
 *
 * Security controls:
 *  - Origin validation (same-site & localhost only)
 *  - Request size limits (max 200KB)
 *  - Model & method allowlisting
 *  - Token output clamping (max 4096)
 *  - Upstream payload sanitization (removes tools, grounding, cachedContent)
 *  - In-memory rate limiting per IP (only charged after request validation passes)
 */

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];
const ALLOWED_METHODS = new Set(['generateContent', 'streamGenerateContent']);
const ALLOWED_BODY_KEYS = new Set([
  'contents',
  'system_instruction',
  'systemInstruction',
  'generationConfig',
  'safetySettings',
]);

const MAX_BODY_BYTES = 200 * 1024; // 200 KB
const MAX_OUTPUT_TOKENS = 4096;
const UPSTREAM_TIMEOUT_MS = 60_000;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const BASE_ORIGINS = ['https://www.nodesimapp.com', 'https://nodesimapp.com'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function allowedModels(): Set<string> {
  const custom = env('GEMINI_ALLOWED_MODELS');
  return new Set(custom ? custom.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_MODELS);
}

function allowedOrigins(): Set<string> {
  const set = new Set(BASE_ORIGINS);
  const extra = env('ALLOWED_ORIGINS');
  if (extra) extra.split(',').map((s) => s.trim()).filter(Boolean).forEach((o) => set.add(o));
  const vercelUrl = env('VERCEL_URL');
  if (vercelUrl) set.add(`https://${vercelUrl}`);
  return set;
}

function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins().has(origin)) return true;
  // Local development
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { Vary: 'Origin' };
  if (origin && isOriginAllowed(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// ─── In-memory Rate Limiting ─────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkAndChargeRateLimit(ip: string): { ok: boolean; remaining: number; resetAt: number } {
  const max = Math.max(1, parseInt(env('RATE_LIMIT_MAX') || '10', 10) || 10);
  const now = Date.now();

  // Prune expired entries if map grows large
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  return {
    ok: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  };
}

// ─── Payload Sanitization (for Gateway mode) ─────────────────────────────────

function sanitizeGatewayBody(input: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const k of Object.keys(input)) {
    if (ALLOWED_BODY_KEYS.has(k)) {
      clean[k] = input[k];
    }
  }

  const gc = (clean.generationConfig ?? {}) as Record<string, unknown>;
  const requested = typeof gc.maxOutputTokens === 'number' ? gc.maxOutputTokens : 2048;
  clean.generationConfig = {
    ...gc,
    maxOutputTokens: Math.min(Math.max(1, Math.floor(requested)), MAX_OUTPUT_TOKENS),
  };

  return clean;
}

// ─── Request Handler ─────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    if (origin && !isOriginAllowed(origin)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405, { ...cors, Allow: 'POST, OPTIONS' });
  }

  // Reject unauthorized origins
  if (origin && !isOriginAllowed(origin)) {
    return json({ error: 'Origin not allowed' }, 403);
  }

  // Request size guard
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    return json({ error: 'Request too large' }, 413, cors);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'Request too large' }, 413, cors);
  }

  // Parse and validate JSON structure
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: 'Body must be valid JSON' }, 400, cors);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return json({ error: 'Body must be a JSON object' }, 400, cors);
  }

  const input = parsed as Record<string, unknown>;
  const url = new URL(req.url);

  // Determine mode: Simple prompt vs. Native Gemini gateway
  const isSimplePromptMode = typeof input.prompt === 'string';

  let targetModel: string;
  let targetMethod: string;
  let isStream = false;
  let upstreamBodyJson: string;

  if (isSimplePromptMode) {
    // Mode 1: Simple prompt caller (LabReportModal, Grapher)
    if (!(input.prompt as string).trim()) {
      return json({ error: 'Prompt must not be empty' }, 400, cors);
    }

    targetModel = url.searchParams.get('model') || 'gemini-3.5-flash-lite';
    if (!allowedModels().has(targetModel)) {
      return json({ error: 'Model not allowed' }, 400, cors);
    }
    targetMethod = 'generateContent';
    isStream = false;

    upstreamBodyJson = JSON.stringify({
      contents: [{ parts: [{ text: input.prompt as string }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });
  } else {
    // Mode 2: Native Gemini gateway caller (geminiClient, test suite)
    const modelParam = url.searchParams.get('model') ?? '';
    const methodParam = url.searchParams.get('method') ?? '';
    isStream = url.searchParams.get('stream') === 'true';

    if (!modelParam || !methodParam) {
      return json({ error: 'Missing model or method query parameters' }, 400, cors);
    }
    if (!allowedModels().has(modelParam)) {
      return json({ error: 'Model not allowed' }, 400, cors);
    }
    if (!ALLOWED_METHODS.has(methodParam)) {
      return json({ error: 'Method not allowed' }, 400, cors);
    }
    if (isStream !== (methodParam === 'streamGenerateContent')) {
      return json({ error: 'stream flag does not match method' }, 400, cors);
    }
    if (!Array.isArray(input.contents) || input.contents.length === 0) {
      return json({ error: 'Body must include non-empty "contents"' }, 400, cors);
    }

    targetModel = modelParam;
    targetMethod = methodParam;

    const sanitized = sanitizeGatewayBody(input);
    upstreamBodyJson = JSON.stringify(sanitized);
  }

  // Server API key check
  const apiKey = env('GEMINI_API_KEY');
  if (!apiKey) {
    return json({ error: 'Server misconfiguration: missing API key' }, 500, cors);
  }

  // Charge rate limit only after all request validations have succeeded
  const limit = checkAndChargeRateLimit(clientIp(req));
  if (!limit.ok) {
    return json(
      { error: 'Rate limit exceeded. Try again in 24 hours.', remaining: 0, resetAt: limit.resetAt },
      429,
      {
        ...cors,
        'Retry-After': String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
      }
    );
  }

  // Build target upstream URL
  const baseUrl = env('GEMINI_API_BASE_URL') || 'https://generativelanguage.googleapis.com/v1beta/models';
  const targetUrl =
    `${baseUrl}/` +
    `${encodeURIComponent(targetModel)}:${encodeURIComponent(targetMethod)}${isStream ? '?alt=sse' : ''}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: upstreamBodyJson,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const responseHeaders: Record<string, string> = {
      ...cors,
      'Cache-Control': 'no-store',
      'X-RateLimit-Remaining': String(limit.remaining),
    };

    if (isSimplePromptMode) {
      // Return { result: string } for Simple Mode
      const data = await upstream.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      if (!upstream.ok) {
        return json(
          { error: data?.error?.message || 'Gemini API error' },
          upstream.status,
          responseHeaders
        );
      }

      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return json({ result }, 200, responseHeaders);
    }

    // Pass through streaming or full JSON for Gateway Mode
    if (isStream) {
      responseHeaders['Content-Type'] = upstream.headers.get('Content-Type') || 'text/event-stream';
      return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    }

    responseHeaders['Content-Type'] = 'application/json';
    return new Response(await upstream.text(), { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return json({ error: 'Proxy error contacting Gemini' }, 502, cors);
  }
}
