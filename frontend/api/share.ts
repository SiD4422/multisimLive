export const config = { runtime: 'edge' };

/**
 * NodeSim SSR handler for shareable short links (`/c/<shortId>`).
 *
 * Resolves `sharedCircuits/<shortId>` from Firestore on the Edge so social media,
 * messaging apps, and search bots receive rich OpenGraph & Twitter preview metadata,
 * while browser visitors are handed directly into the interactive Simulator.
 */

const FIREBASE_PROJECT_ID = 'nodesim-2c84b';
const BASE_URL = 'https://www.nodesimapp.com';
const SHORT_ID_RE = /^[A-Za-z0-9]{8}$/;
const FIRESTORE_TIMEOUT_MS = 4500;

interface FirestoreStringField {
  stringValue?: string;
}
interface FirestoreIntegerField {
  integerValue?: string | number;
}
interface FirestoreDocumentResponse {
  fields?: {
    id?: FirestoreStringField;
    name?: FirestoreStringField;
    componentCount?: FirestoreIntegerField;
    componentSummary?: FirestoreStringField;
    circuitData?: FirestoreStringField;
  };
}

export interface ResolvedShareData {
  id: string;
  name: string;
  componentCount: number;
  componentSummary: string;
  circuitData: string;
}

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function parseFirestoreShareDocument(
  shortId: string,
  doc: FirestoreDocumentResponse | null | undefined,
): ResolvedShareData | null {
  const f = doc?.fields;
  if (!f?.circuitData?.stringValue) return null;
  const countRaw = f.componentCount?.integerValue;
  const parsedCount =
    typeof countRaw === 'number'
      ? countRaw
      : typeof countRaw === 'string'
      ? parseInt(countRaw, 10)
      : 0;

  return {
    id: shortId,
    name: f.name?.stringValue?.trim() || 'Shared Circuit',
    componentCount: Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 1,
    componentSummary: f.componentSummary?.stringValue?.trim() || '',
    circuitData: f.circuitData.stringValue,
  };
}

export function renderShareHtml(share: ResolvedShareData, origin = BASE_URL): string {
  const safeName = escapeHtml(share.name);
  const rawDesc =
    share.componentSummary ||
    `${share.componentCount} component${share.componentCount === 1 ? '' : 's'} — Simulate this circuit live in NodeSim online SPICE editor.`;
  const safeDesc = escapeHtml(rawDesc);
  const canonicalUrl = `${BASE_URL}/c/${share.id}`;
  const ogImageUrl = `${BASE_URL}/og-image.png`;
  const targetPath = `/simulator#circuit=${share.circuitData}`;
  const safeTargetHref = escapeHtml(targetPath);
  const serializedPayload = JSON.stringify(share.circuitData).replace(/</g, '\\u003c');
  const serializedFallbackPath = JSON.stringify(`/simulator?c=${share.id}`).replace(/</g, '\\u003c');
  const safeOriginHref = escapeHtml(`${origin}/c/${share.id}`);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} | NodeSim Shared Circuit</title>
    <meta name="title" content="${safeName} | NodeSim Shared Circuit" />
    <meta name="description" content="${safeDesc}" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:site_name" content="NodeSim" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${safeName} — Interactive SPICE Circuit" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeName} schematic preview in NodeSim SPICE simulator" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeName} — NodeSim SPICE Circuit" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <link rel="icon" type="image/png" href="/favicon.png?v=6" />
    <style>
      body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f1f5f9;font-family:Inter,system-ui,-apple-system,sans-serif;padding:20px;box-sizing:border-box}
      .card{max-width:480px;width:100%;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;box-shadow:0 24px 64px rgba(0,0,0,.55)}
      .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(22,163,74,.18);border:1px solid rgba(74,222,128,.4);color:#4ade80;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:12px}
      h1{margin:0 0 8px;font-size:22px;line-height:1.25;color:#f8fafc}
      p{margin:0 0 20px;font-size:14px;line-height:1.55;color:#94a3b8}
      a.btn{display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px}
      .url{margin-top:16px;font-size:11px;font-family:monospace;color:#64748b;word-break:break-all}
    </style>
  </head>
  <body>
    <main class="card">
      <span class="badge">NodeSim Shared Circuit</span>
      <h1>${safeName}</h1>
      <p>${safeDesc}</p>
      <a class="btn" href="${safeTargetHref}">Open &amp; Simulate Circuit →</a>
      <div class="url">${safeOriginHref}</div>
    </main>
    <script>
      (function () {
        try {
          var payload = ${serializedPayload};
          if (payload) {
            window.location.replace('/simulator#circuit=' + payload);
            return;
          }
        } catch (e) {}
        window.location.replace(${serializedFallbackPath});
      })();
    </script>
  </body>
</html>`;
}

function renderNotFoundHtml(message: string): string {
  const safeMsg = escapeHtml(message);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Shared Circuit Not Found | NodeSim</title>
    <style>
      body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f1f5f9;font-family:Inter,system-ui,-apple-system,sans-serif;padding:20px}
      .card{max-width:440px;width:100%;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;text-align:center}
      a{display:inline-block;margin-top:16px;background:#16a34a;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:9px}
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Circuit Link Unavailable</h1>
      <p>${safeMsg}</p>
      <a href="/simulator">Launch NodeSim Simulator →</a>
    </main>
  </body>
</html>`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const reqUrl = new URL(req.url);
  const matchFromPath = reqUrl.pathname.match(/^\/c\/([A-Za-z0-9]+)\/?$/);
  const shortId = (reqUrl.searchParams.get('id') || matchFromPath?.[1] || '').trim();

  if (!SHORT_ID_RE.test(shortId)) {
    return new Response(renderNotFoundHtml('Invalid or malformed circuit link ID.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);

  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/sharedCircuits/${shortId}`;
    const res = await fetch(endpoint, { signal: controller.signal });
    if (res.status === 404) {
      return new Response(renderNotFoundHtml('This shared circuit could not be found.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
      });
    }
    if (!res.ok) {
      return new Response(renderNotFoundHtml('Unable to load shared circuit right now.'), {
        status: 502,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    const json = (await res.json()) as FirestoreDocumentResponse;
    const share = parseFirestoreShareDocument(shortId, json);
    if (!share) {
      return new Response(renderNotFoundHtml('Shared circuit payload was empty.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    const html = renderShareHtml(share, reqUrl.origin || BASE_URL);
    return new Response(req.method === 'HEAD' ? null : html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Short links are immutable in Firestore -> safe edge cache with fast revalidation
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response(renderNotFoundHtml('Timed out resolving shared circuit link.'), {
      status: 504,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } finally {
    clearTimeout(timer);
  }
}
