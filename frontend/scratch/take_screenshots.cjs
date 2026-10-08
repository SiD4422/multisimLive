const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\spart\\.gemini\\antigravity\\brain\\2ebe8f3f-83e7-4dda-bf45-431fbb4365ff\\screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Homepage
  console.log('Capturing Homepage...');
  await page.goto('https://nodesimapp.com/');
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '01_homepage.png') });

  // 10. Circuit Library
  console.log('Capturing Circuit Library...');
  await page.goto('https://nodesimapp.com/circuits');
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '10_circuit_library.png'), fullPage: true });

  // 5. Completed Circuit (SS-HSIC-ECGC)
  console.log('Capturing Completed Circuit...');
  await page.goto('https://nodesimapp.com/circuits/ss_hsic_ecgc');
  await delay(2000);
  
  // Need to evaluate to click "Open in Simulator" safely
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const btn = btns.find(b => b.textContent.includes('Open in Simulator'));
      if (btn) btn.click();
  });
  await delay(3000);
  await page.screenshot({ path: path.join(outDir, '05_completed_circuit.png') });

  // 2. Circuit Editor & 3. Component Library
  console.log('Capturing Editor & Library...');
  await page.screenshot({ path: path.join(outDir, '02_circuit_editor.png') });
  await page.screenshot({ path: path.join(outDir, '03_component_library.png') });

  // 4. Properties Panel
  console.log('Capturing Properties Panel...');
  await page.mouse.click(640, 400); 
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '04_properties_panel.png') });

  // 6. Simulation Running & 7. Grapher
  console.log('Capturing Simulation...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Run') || b.title.includes('Run'));
      if (btn) btn.click();
  });
  await delay(3000);
  await page.screenshot({ path: path.join(outDir, '06_simulation_running.png') });

  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('GRAPHER') || b.textContent.includes('Grapher'));
      if (btn) btn.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '07_grapher.png') });

  // 9. AI Assistant
  console.log('Capturing AI Assistant...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('AI Tutor') || b.textContent.includes('Ask Gemini'));
      if (btn) btn.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '09_ai_assistant.png') });

  // close AI assistant or modal if needed
  await page.mouse.click(100, 100);
  await delay(500);

  // 11. Share/Embed
  console.log('Capturing Share Screen...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Share') || b.textContent.includes('Publish'));
      if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(outDir, '11_share_screen.png') });

  // close modal
  await page.keyboard.press('Escape');
  await delay(500);

  // 12. Login/Pricing (Lab Report)
  console.log('Capturing Login/Pricing...');
  await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Lab Report'));
      if (btn) btn.click();
  });
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '12_login_pricing.png') });

  // 13. Mobile Version
  console.log('Capturing Mobile Version...');
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto('https://nodesimapp.com/simulator');
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, '13_mobile_version.png') });

  await browser.close();
  console.log('Done capturing screenshots!');
})();
