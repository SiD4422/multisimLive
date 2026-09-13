const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Capture all console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:5173');
  console.log("Page loaded. Waiting for UI...");
  await new Promise(r => setTimeout(r, 2000));
  
  // Open Example Library
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div'));
    const exBtn = btns.find(b => b.textContent && b.textContent.includes('Example Library'));
    if (exBtn) exBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click RC Low-Pass Filter
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3'));
    const rcFilter = cards.find(h => h.textContent.includes('RC Low-Pass Filter'));
    if (rcFilter) {
      // Click the parent card
      rcFilter.parentElement.parentElement.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click Run
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const runSpan = spans.find(s => s.textContent && s.textContent.trim() === 'Run');
    if (runSpan) {
      runSpan.parentElement.click();
    }
  });
  
  console.log("Clicked Run. Waiting 3 seconds for simulation...");
  await new Promise(r => setTimeout(r, 3000));
  
  // Switch to Grapher tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('div'));
    const grapherTab = tabs.find(t => t.textContent === 'GRAPHER');
    if (grapherTab) grapherTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'C:/Users/spart/.gemini/antigravity/brain/7dcfb340-a3d5-4760-ac0b-ac05b2e31325/final_qa_screenshot.png' });
  console.log("Screenshot saved!");
  
  await browser.close();
})();
