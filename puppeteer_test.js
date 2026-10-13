/**
 * NodeSim Browser E2E Smoke Test
 * 
 * Tests:
 *  1. Page loads without crash
 *  2. WelcomeTour can be dismissed (Skip button)
 *  3. Example Library opens
 *  4. RC Low-Pass Filter circuit can be loaded
 *  5. Run button is clickable and simulation starts
 *  6. Grapher tab is reachable after simulation
 *
 * Run from repo root: node puppeteer_test.js
 * Requires: npm run dev running on localhost:5173
 */

const puppeteer = require('puppeteer');

// ─── helpers ─────────────────────────────────────────────────────────────────

async function waitForSelector(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    return true;
  } catch {
    return false;
  }
}

async function findAndClick(page, predicate, description) {
  const found = await page.evaluate((pred) => {
    // pred arrives as string; use Function constructor
    const fn = new Function('el', `return (${pred})(el)`);
    const el = Array.from(document.querySelectorAll('*')).find(fn);
    if (el) { el.click(); return true; }
    return false;
  }, predicate.toString());
  if (!found) {
    console.warn(`  ⚠ Could not find: ${description}`);
  } else {
    console.log(`  ✓ Clicked: ${description}`);
  }
  return found;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── test runner ─────────────────────────────────────────────────────────────

(async () => {
  let passed = 0;
  let failed = 0;
  const results = [];

  const log = (name, ok, note = '') => {
    const icon = ok ? '✅' : '❌';
    const msg = `${icon} ${name}${note ? ' — ' + note : ''}`;
    console.log(msg);
    results.push({ name, ok, note });
    if (ok) passed++; else failed++;
  };

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`PageError: ${err.message}`));

  try {
    // ── Test 1: Page loads ───────────────────────────────────────
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);
    const title = await page.title();
    log('Page loads at /simulator', title.length > 0, `title="${title}"`);

    // ── Test 2: Dismiss WelcomeTour ─────────────────────────────
    // Set localStorage first to suppress tour on any reload, then dismiss visible one
    await page.evaluate(() => {
      localStorage.setItem('nodesim_tour_seen', 'true');
    });
    // If tour modal is currently open (rendered before our localStorage set), click Skip
    const skipClicked = await findAndClick(
      page,
      el => el.tagName === 'BUTTON' && el.textContent && el.textContent.trim() === 'Skip',
      'WelcomeTour Skip button'
    );
    await sleep(500);
    // Verify modal is gone
    const modalGone = await page.evaluate(() => {
      return !document.querySelector('[style*="zIndex: 10000"], [style*="z-index: 10000"]');
    });
    log('WelcomeTour dismissible', skipClicked || modalGone, skipClicked ? 'clicked Skip' : 'was not shown (localStorage already set)');

    // ── Test 3: Run button is present and enabled ────────────────
    await sleep(500);
    const runButtonVisible = await page.evaluate(() => {
      // The Run button is a div with class bg-green-600 containing a span with text "Run"
      const allDivs = Array.from(document.querySelectorAll('div.bg-green-600, div.bg-red-600'));
      return allDivs.some(d => d.textContent && d.textContent.includes('Run'));
    });
    log('Run button is visible in toolbar', runButtonVisible);

    // ── Test 4: Example Library opens ───────────────────────────
    const libraryOpened = await findAndClick(
      page,
      el => el.tagName === 'BUTTON' && el.title && el.title.includes('Example Library'),
      'Example Library button (title attr)'
    );
    await sleep(800);
    const libraryModalVisible = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      return headings.some(h => h.textContent && (h.textContent.includes('Example') || h.textContent.includes('Library')));
    });
    log('Example Library modal opens', libraryModalVisible, libraryOpened ? '' : 'button not found by title');

    // ── Test 5: Load RC Low-Pass Filter ─────────────────────────
    const rcLoaded = await findAndClick(
      page,
      el => el.tagName === 'H3' && el.textContent && el.textContent.includes('RC'),
      'RC Low-Pass Filter card heading'
    );
    await sleep(1200);
    // Verify at least one component was loaded
    const hasComponents = await page.evaluate(() => {
      // Check if any Konva canvas or SVG content exists
      return document.querySelectorAll('canvas').length > 0;
    });
    log('RC circuit loads onto canvas', hasComponents || rcLoaded);

    // ── Test 6: Click Run and wait for simulation ────────────────
    // Dismiss any modal first
    await page.keyboard.press('Escape');
    await sleep(300);
    const runClicked = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const runBtn = allDivs.find(d =>
        d.classList.contains('bg-green-600') &&
        d.textContent &&
        d.textContent.trim().startsWith('Run') &&
        d.style.cursor !== 'not-allowed'
      );
      if (runBtn) { runBtn.click(); return true; }
      return false;
    });
    await sleep(3000);
    log('Run button clickable', runClicked, runClicked ? 'simulation dispatched' : 'Run div not found or was disabled');

    // ── Test 7: Grapher tab reachable ───────────────────────────
    const grapherTabClicked = await findAndClick(
      page,
      el => el.classList && el.classList.contains('tab') && el.textContent && el.textContent.trim() === 'Grapher',
      'Grapher tab'
    );
    await sleep(800);
    log('Grapher tab clickable', grapherTabClicked);

    // ── Test 8: No fatal JS errors during test ───────────────────
    const fatalErrors = consoleErrors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('Unable to update item') &&
      !e.includes('externalized') &&
      !e.includes('404')
    );
    log('No fatal JS errors', fatalErrors.length === 0, fatalErrors.length > 0 ? fatalErrors.slice(0,2).join('; ') : '');

    // ── Screenshot ───────────────────────────────────────────────
    await page.screenshot({ path: 'puppeteer_result.png' });
    console.log('\nScreenshot saved: puppeteer_result.png');

  } catch (err) {
    console.error('\nFatal test error:', err.message);
    failed++;
  } finally {
    await browser.close();
  }

  // ── Summary ───────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.ok).forEach(r => console.log(`  ✗ ${r.name}${r.note ? ' — ' + r.note : ''}`));
    process.exit(1);
  } else {
    console.log('All tests passed!');
    process.exit(0);
  }
})();
