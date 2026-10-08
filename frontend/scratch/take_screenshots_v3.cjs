const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\spart\\.gemini\\antigravity\\brain\\2ebe8f3f-83e7-4dda-bf45-431fbb4365ff\\screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const circuitJson = fs.readFileSync('src/examples/hybrid_switched_inductor.json', 'utf8');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument((json) => {
    localStorage.setItem('nodesim_tour_seen', 'true');
    localStorage.setItem('nodesim-schematic-v1', json);
  }, circuitJson);

  await page.setViewport({ width: 1280, height: 800 });

  // 1. Homepage
  console.log('Capturing Homepage...');
  await page.goto('https://nodesimapp.com/', { waitUntil: 'networkidle2' });
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '01_homepage.png') });

  // 10. Circuit Library
  console.log('Capturing Circuit Library...');
  await page.goto('https://nodesimapp.com/circuits', { waitUntil: 'networkidle2' });
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '10_circuit_library.png'), fullPage: true });

  // Load Simulator
  console.log('Loading Simulator...');
  await page.goto('https://nodesimapp.com/simulator', { waitUntil: 'networkidle2' });
  await delay(2000); // Wait for canvas to render the loaded circuit

  // 5. Completed Circuit
  console.log('Capturing Completed Circuit...');
  await page.screenshot({ path: path.join(outDir, '05_completed_circuit.png') });

  // 4. Properties Panel
  console.log('Capturing Properties Panel...');
  await page.mouse.click(640, 400); // Click center to select something
  await delay(500);
  await page.screenshot({ path: path.join(outDir, '04_properties_panel.png') });

  // 6. Simulation Running
  console.log('Capturing Simulation...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => (b.textContent && b.textContent.includes('Run')) || (b.title && b.title.includes('Run')));
      if (btn) btn.click();
  });
  await delay(4000); // wait for SPICE
  await page.screenshot({ path: path.join(outDir, '06_simulation_running.png') });

  // 7. Grapher
  console.log('Capturing Grapher...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('GRAPHER') || b.textContent.includes('Grapher')));
      if (btn) btn.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '07_grapher.png') });

  // Empty Simulator for 2 and 3
  console.log('Capturing Empty Editor...');
  await page.evaluate(() => {
    localStorage.removeItem('nodesim-schematic-v1');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await delay(1500);
  await page.screenshot({ path: path.join(outDir, '02_circuit_editor.png') });
  await page.screenshot({ path: path.join(outDir, '03_component_library.png') });

  // 9. AI Assistant
  console.log('Capturing AI Assistant...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('AI Tutor') || b.textContent.includes('Ask Gemini') || b.textContent.includes('AI')));
      if (btn) btn.click();
  });
  await delay(1500);
  await page.screenshot({ path: path.join(outDir, '09_ai_assistant.png') });
  await page.mouse.click(10, 10);
  await delay(500);

  // 11. Share Screen
  console.log('Capturing Share...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Share'));
      if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '11_share_screen.png') });
  await page.keyboard.press('Escape');
  await delay(500);

  // 12. Lab Report
  console.log('Capturing Login...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Lab Report'));
      if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '12_login_pricing.png') });

  // 13. Mobile
  console.log('Capturing Mobile...');
  const mobilePage = await browser.newPage();
  await mobilePage.evaluateOnNewDocument(() => {
    localStorage.setItem('nodesim_tour_seen', 'true');
  });
  await mobilePage.setViewport({ width: 375, height: 812, isMobile: true });
  await mobilePage.goto('https://nodesimapp.com/simulator', { waitUntil: 'networkidle2' });
  await delay(2000);
  await mobilePage.screenshot({ path: path.join(outDir, '13_mobile_version.png') });

  await browser.close();
  console.log('Done!');
})();
