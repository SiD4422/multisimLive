/**
 * prerender.mjs — Post-build prerender script for NodeSim
 *
 * Serves dist/ via a built-in Node http server (no vite preview subprocess),
 * then uses Puppeteer to crawl every SEO route and write static HTML snapshots.
 *
 * Usage:
 *   node scripts/prerender.mjs        (after `vite build`)
 *   npm run build:seo                 (tsc + vite build + this script)
 *
 * Routes prerendered: all SEO content pages.
 * EXCLUDED: /simulator — Konva canvas + WASM cannot be safely static-rendered.
 */

import puppeteer from 'puppeteer';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR   = path.resolve(__dirname, '..');
const DIST_DIR   = path.resolve(ROOT_DIR, 'dist');
const PORT       = 4176;
const BASE_URL   = `http://127.0.0.1:${PORT}`;

// Time for react-helmet-async to inject per-page tags after hydration
const HELMET_SETTLE_MS = 2500;

// MIME types for the static server
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.txt':  'text/plain',
  '.webmanifest': 'application/manifest+json',
};

/** Minimal static file server over dist/. SPA fallback: serve dist/index.html */
function createStaticServer() {
  return http.createServer((req, res) => {
    // Strip query string
    const urlPath = req.url.split('?')[0].split('#')[0];

    // Try exact file first
    let filePath = path.join(DIST_DIR, urlPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext  = path.extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: always serve dist/index.html for non-asset routes
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  });
}

/** All SEO routes to prerender */
const ROUTES = [
  '/',
  '/features',
  '/tutorials',
  '/compare',
  '/components',
  '/tools',
  '/circuits',
  '/about',
  '/educators',
  '/showcase',
  '/resources',
  '/privacy',
  '/terms',
  // Compare pages
  '/compare/multisim',
  '/compare/ltspice',
  '/compare/falstad',
  '/compare/circuitlab',
  '/compare/tinkercad',
  '/compare/wokwi',
  // Tutorial pages
  '/tutorials/rc-circuit',
  '/tutorials/transistor-amplifier',
  '/tutorials/op-amp',
  '/tutorials/diode-rectifier',
  '/tutorials/rlc-circuit',
  '/tutorials/555-timer',
  '/tutorials/mosfet',
  '/tutorials/power-supply',
  '/tutorials/differential-amplifier',
  '/tutorials/voltage-follower',
  '/tutorials/colpitts-oscillator',
  '/tutorials/wheatstone-bridge',
  '/tutorials/active-filter',
  '/tutorials/pwm-circuit',
  '/tutorials/logic-gates',
  '/tutorials/darlington-pair',
  // Tool pages
  '/tools/ohms-law',
  '/tools/voltage-divider',
  '/tools/rc-calculator',
  '/tools/555-timer',
  '/tools/resistor-color-code',
  // Programmatic circuit pages
  '/circuits/rc-low-pass-filter',
  '/circuits/inverting-op-amp',
  '/circuits/555-timer-astable',
  '/circuits/rlc-resonance',
  '/circuits/half-wave-rectifier',
  '/circuits/full-wave-rectifier',
  '/circuits/common-emitter-amplifier',
  '/circuits/buck-converter',
  '/circuits/voltage-divider',
  '/circuits/zener-diode',
  '/circuits/mosfet-switch',
];

/** Render one route and write to dist */
async function prerenderRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, HELMET_SETTLE_MS));

    let html = await page.evaluate(
      () => '<!doctype html>\n' + document.documentElement.outerHTML
    );

    // Deduplicate canonical tags: keep only the LAST one (page-specific, set by react-helmet-async)
    // The first canonical is baked into dist/index.html from the homepage prerender; subsequent pages
    // inherit it as the SPA fallback, then Helmet appends the correct per-page canonical.
    const canonicalMatches = [...html.matchAll(/<link\s[^>]*rel="canonical"[^>]*>/gi)];
    if (canonicalMatches.length > 1) {
      // Remove ALL canonical tags, then re-insert the last one just before </head>
      const lastCanonical = canonicalMatches[canonicalMatches.length - 1][0];
      html = html.replace(/<link\s[^>]*rel="canonical"[^>]*>/gi, '');
      html = html.replace('</head>', `${lastCanonical}</head>`);
    }

    const outputDir = route === '/'
      ? DIST_DIR
      : path.join(DIST_DIR, ...route.split('/').filter(Boolean));

    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    return { route, success: true, path: outputPath };
  } catch (err) {
    return { route, success: false, error: err.message };
  }
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ not found. Run `vite build` first.');
    process.exit(1);
  }

  // Start built-in static server
  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`✅ Static server running at ${BASE_URL}`);
  console.log(`📋 Prerendering ${ROUTES.length} routes (concurrency: 4)...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const results = [];
  const CONCURRENCY = 4;

  for (let i = 0; i < ROUTES.length; i += CONCURRENCY) {
    const chunk = ROUTES.slice(i, i + CONCURRENCY);
    const pages = await Promise.all(chunk.map(() => browser.newPage()));
    pages.forEach(p => {
      p.on('console', () => {});
      p.on('pageerror', () => {});
    });

    const chunkResults = await Promise.all(
      chunk.map((route, idx) => prerenderRoute(pages[idx], route))
    );

    results.push(...chunkResults);
    await Promise.all(pages.map(p => p.close()));

    chunkResults.forEach(r => {
      if (r.success) console.log(`  ✓ ${r.route}`);
      else           console.error(`  ✗ ${r.route} → ${r.error}`);
    });
  }

  await browser.close();
  server.close();

  const successes = results.filter(r => r.success).length;
  const failures  = results.filter(r => !r.success);

  console.log(`\n✅ Prerender complete: ${successes}/${ROUTES.length} routes`);
  if (failures.length) {
    console.error(`\n⚠️  ${failures.length} failed routes:`);
    failures.forEach(f => console.error(`   ${f.route}: ${f.error}`));
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
