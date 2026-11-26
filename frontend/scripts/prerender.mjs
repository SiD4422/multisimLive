/**
 * prerender.mjs — True React SSR Static Prerendering for NodeSim
 *
 * Uses the Vite SSR bundle (dist-ssr/entry-server.js) + React 19 renderToString
 * to generate full, unique, visible HTML bodies and per-page <head> metadata
 * for every marketing, tutorial, comparison, tool, worksheet, and circuit route.
 *
 * NO browser / Puppeteer dependency. Works identically on Windows, Linux, and Vercel.
 *
 * For /simulator: writes a lightweight loading shell with canonical metadata
 * without importing Konva or ngspice-wasm during SSR.
 *
 * Usage:
 *   npm run build:seo   (tsc + vite build + vite build --ssr + this script)
 */

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR  = path.resolve(__dirname, '..');
const DIST_DIR  = path.resolve(ROOT_DIR, 'dist');
const SSR_DIR   = path.resolve(ROOT_DIR, 'dist-ssr');
const SSR_ENTRY = path.join(SSR_DIR, 'entry-server.js');
const BASE_URL  = 'https://www.nodesimapp.com';

const SSR_ROUTES = [
  '/',
  '/features',
  '/tutorials',
  '/compare',
  '/components',
  '/tools',
  '/circuits',
  '/about',
  '/educators',
  '/educators/worksheets',
  '/educators/worksheets/rc-circuit-analysis',
  '/educators/worksheets/op-amp-configurations',
  '/educators/worksheets/bjt-amplifier',
  '/educators/worksheets/rectifier-and-filter',
  '/procedure',
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
  '/tutorials/mosfet-switch',
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

/**
 * Strips default SEO meta/title/canonical tags from index.html template so per-page
 * SSR Helmet tags are the sole authoritative metadata tags in <head>.
 */
function stripTemplateSeoTags(templateHtml) {
  return templateHtml
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s[^>]*name=["'](?:title|description|author|robots|keywords)["'][^>]*\/?>/gi, '')
    .replace(/<meta\s[^>]*property=["'](?:og|article):[^"']*["'][^>]*\/?>/gi, '')
    .replace(/<meta\s[^>]*name=["']twitter:[^"']*["'][^>]*\/?>/gi, '')
    .replace(/<link\s[^>]*rel=["']canonical["'][^>]*\/?>/gi, '');
}

/**
 * Ensures canonical URL matches the current route if a page omitted explicit url prop.
 */
function ensureCanonical(headTags, route) {
  const expectedCanonical = route === '/' ? `${BASE_URL}/` : `${BASE_URL}${route}`;
  if (/rel=["']canonical["']/i.test(headTags)) {
    return headTags;
  }
  return `${headTags}\n    <link rel="canonical" href="${expectedCanonical}" />`;
}

/**
 * Injects clean per-page <head> tags and SSR body HTML into the shell template.
 */
function assemblePageHtml(cleanTemplate, headTags, bodyHtml) {
  const withHead = cleanTemplate.replace('</head>', `    ${headTags}\n  </head>`);
  return withHead.replace('<!--ssr-outlet-->', bodyHtml);
}

/**
 * Writes a dedicated lightweight loading shell for /simulator so it never pulls in Konva/WASM
 * during build and avoids flashing homepage content on SPA fallback.
 */
function writeSimulatorShell(cleanTemplate) {
  const simHead = [
    '<title>NodeSim Simulator | Free Online SPICE Circuit Simulator</title>',
    '<meta name="title" content="NodeSim Simulator | Free Online SPICE Circuit Simulator" />',
    '<meta name="description" content="Launch the interactive NodeSim SPICE schematic editor and real-time waveform grapher directly in your browser. 311+ components, zero install." />',
    '<meta name="robots" content="index, follow" />',
    '<link rel="canonical" href="https://www.nodesimapp.com/simulator" />',
  ].join('\n    ');

  const simBody = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background-color:#0f172a;color:#10b981;font-family:monospace"><h2>Loading SPICE Engine &amp; Editor...</h2></div>';
  const html = assemblePageHtml(cleanTemplate, simHead, simBody);
  const dir = path.join(DIST_DIR, 'simulator');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ not found. Run `vite build` first.');
    process.exit(1);
  }
  if (!fs.existsSync(SSR_ENTRY)) {
    console.error('❌ dist-ssr/entry-server.js not found. Run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first.');
    process.exit(1);
  }

  const templatePath = path.join(DIST_DIR, 'index.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');
  if (!rawTemplate.includes('<!--ssr-outlet-->')) {
    console.error('❌ dist/index.html is missing <!--ssr-outlet--> marker. Run a fresh `vite build` first.');
    process.exit(1);
  }

  const cleanTemplate = stripTemplateSeoTags(rawTemplate);
  const { render } = await import(pathToFileURL(SSR_ENTRY).href);

  console.log(`📋 React SSR prerendering ${SSR_ROUTES.length} static routes + /simulator shell...`);

  const failures = [];
  let successes = 0;

  for (const route of SSR_ROUTES) {
    try {
      const { html, headTags } = await render(route);
      if (!html || html.length < 200) {
        throw new Error(`Rendered HTML unexpectedly short (${html?.length || 0} bytes)`);
      }
      if (html.includes('Page Not Found') || html.includes('404')) {
        // Guard against typo routes silently hitting <NotFound />
        if (html.includes('Page Not Found')) {
          throw new Error('Route matched 404 NotFound page');
        }
      }

      const finalHead = ensureCanonical(headTags, route);
      const finalHtml = assemblePageHtml(cleanTemplate, finalHead, html);

      const outputDir = route === '/'
        ? DIST_DIR
        : path.join(DIST_DIR, ...route.split('/').filter(Boolean));

      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'index.html'), finalHtml, 'utf8');
      console.log(`  ✓ ${route} (${(finalHtml.length / 1024).toFixed(1)} kB)`);
      successes++;
    } catch (err) {
      console.error(`  ✗ ${route} → ${err.message}`);
      failures.push({ route, error: err.message });
    }
  }

  writeSimulatorShell(cleanTemplate);
  console.log(`  ✓ /simulator (lightweight shell)`);
  successes++;

  // Remove temporary SSR build artifacts so dist/ remains the sole deploy output
  fs.rmSync(SSR_DIR, { recursive: true, force: true });

  console.log(`\n✅ SSR Prerender complete: ${successes}/${SSR_ROUTES.length + 1} routes`);
  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} route(s) failed SSR prerendering.`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal SSR prerender error:', err);
  process.exit(1);
});
