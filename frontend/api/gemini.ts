export const config = { runtime: 'edge' };

// In-memory rate limiting map (resets on cold start since @vercel/kv is not available)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  let rateLimitData = rateLimitMap.get(ip);
  
  if (!rateLimitData || now > rateLimitData.resetAt) {
    rateLimitData = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (rateLimitData.count >= RATE_LIMIT_MAX) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        remaining: 0,
        resetAt: rateLimitData.resetAt,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  
  rateLimitData.count++;
  rateLimitMap.set(ip, rateLimitData);

  const url = new URL(req.url);
  const model = url.searchParams.get('model');
  const method = url.searchParams.get('method');
  const isStream = url.searchParams.get('stream') === 'true';

  if (!model || !method) {
    return new Response(JSON.stringify({ error: 'Missing model or method query parameters' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration: missing API key' }), { status: 500 });
  }

  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}${isStream ? '?alt=sse' : ''}`;
  
  try {
    const body = await req.text();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body,
    });

    // Pass through streaming responses if requested
    if (isStream) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Gemini proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 500 });
  }
}
