import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Click library button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title && b.title.includes('Circuits'));
      if (libBtn) libBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Click 'RC Low-Pass Filter'
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const card = h3s.find(h => h.innerText === 'RC Low-Pass Filter');
      if (card) {
        let p = card.parentElement;
        while(p && !p.onclick && p.tagName !== 'BUTTON' && p.style.cursor !== 'pointer') {
            p = p.parentElement;
            if (p === document.body) break;
        }
        if (p) p.click();
      }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    page.on('console', msg => {
      const txt = msg.text();
      if (txt.includes('Simulation Result:')) {
        console.log('SIMULATION RESULT FOUND!');
      }
      if (msg.type() === 'error') {
        console.log('ERROR: ' + txt);
      }
    });
    
    // Override console.log in page to stringify Simulation Result
    await page.evaluate(() => {
       const origLog = console.log;
       console.log = function(...args) {
          if (typeof args[0] === 'string' && args[0].includes('Simulation Result:')) {
             origLog('Simulation Result Data: ' + JSON.stringify(args[1].slice(0, 2)));
          }
          origLog.apply(console, args);
       }
    });
    
    // Run Simulation
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const runBtn = btns.find(b => b.innerText && b.innerText.includes('Run Simulation'));
      if (runBtn) runBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Print the global store traces and keys
    const data = await page.evaluate(() => {
       // Since it's Zustand, we can try to grab the first row of simulationBuffer
       const store = window.__ZUSTAND_DEVTOOLS__ ? 'dev' : 'no'; // can't easily access zustand state unless exposed
       return store;
    });
    
    await browser.close();
  } catch(e) { console.log(e); }
})();
