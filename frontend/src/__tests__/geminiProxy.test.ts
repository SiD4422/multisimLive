import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../../api/gemini';

// Lives under src/ on purpose: files inside api/ are deployed as Vercel functions.

const ORIGIN = 'https://www.nodesimapp.com';
const BODY = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] });

function call(opts: {
  method?: string;
  query?: string;
  origin?: string | null;
  body?: string;
  ip?: string;
} = {}) {
  const { method = 'POST', query = 'model=gemini-3.5-flash-lite&method=generateContent', origin = ORIGIN, body = BODY, ip } = opts;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (origin) headers.origin = origin;
  headers['x-real-ip'] = ip ?? `10.0.0.${Math.floor(Math.random() * 250) + 1}`;
  return handler(new Request(`https://www.nodesimapp.com/api/gemini?${query}`, {
    method,
    headers,
    body: method === 'POST' ? body : undefined,
  }));
}

describe('api/gemini proxy', () => {
  const realFetch = globalThis.fetch;
  let upstream: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.KV_REST_API_URL;
    upstream = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    globalThis.fetch = upstream as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('forwards a valid request with the server key', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    const [url, init] = upstream.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/models/gemini-3.5-flash-lite:generateContent');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');
  });

  it('rejects other origins', async () => {
    const res = await call({ origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('rejects models that are not allowlisted', async () => {
    const res = await call({ query: 'model=gemini-ultra-expensive&method=generateContent' });
    expect(res.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('rejects methods other than generate/stream', async () => {
    const res = await call({ query: 'model=gemini-3.5-flash-lite&method=embedContent' });
    expect(res.status).toBe(400);
  });

  it('rejects path-injection in model', async () => {
    const res = await call({ query: 'model=gemini-3.5-flash-lite/../../x&method=generateContent' });
    expect(res.status).toBe(400);
  });

  it('only accepts POST', async () => {
    const res = await call({ method: 'GET' });
    expect(res.status).toBe(405);
  });

  it('rejects non-JSON and empty bodies', async () => {
    expect((await call({ body: 'nope' })).status).toBe(400);
    expect((await call({ body: JSON.stringify({ contents: [] }) })).status).toBe(400);
  });

  it('rejects oversized bodies', async () => {
    const big = JSON.stringify({ contents: [{ parts: [{ text: 'x'.repeat(250_000) }] }] });
    expect((await call({ body: big })).status).toBe(413);
  });

  it('strips unsupported fields and clamps output tokens', async () => {
    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
      tools: [{ googleSearch: {} }],
      cachedContent: 'cachedContents/abc',
      generationConfig: { maxOutputTokens: 999999, temperature: 0.2 },
    });
    await call({ body });
    const sent = JSON.parse((upstream.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.tools).toBeUndefined();
    expect(sent.cachedContent).toBeUndefined();
    expect(sent.generationConfig.maxOutputTokens).toBe(4096);
    expect(sent.generationConfig.temperature).toBe(0.2);
  });

  it('rate limits per IP and does not charge invalid requests', async () => {
    process.env.RATE_LIMIT_MAX = '2';
    const ip = '192.0.2.77';
    await call({ ip, body: 'invalid json' }); // must not count
    expect((await call({ ip })).status).toBe(200);
    expect((await call({ ip })).status).toBe(200);
    const third = await call({ ip });
    expect(third.status).toBe(429);
    expect(third.headers.get('retry-after')).toBeTruthy();
  });

  it('requires matching stream flag and method', async () => {
    const res = await call({ query: 'model=gemini-3.5-flash-lite&method=streamGenerateContent' });
    expect(res.status).toBe(400);
    const ok = await call({ query: 'model=gemini-3.5-flash-lite&method=streamGenerateContent&stream=true' });
    expect(ok.status).toBe(200);
    expect((upstream.mock.calls.at(-1) as [string])[0]).toContain('alt=sse');
  });
});
