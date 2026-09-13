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
    
    // Run Simulation
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const runBtn = btns.find(b => b.innerText && b.innerText.includes('Run Simulation'));
      if (runBtn) runBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if there are any lines in the chart or if there's data in the state
    const hasData = await page.evaluate(() => {
       const lines = document.querySelectorAll('.recharts-line');
       return lines.length > 0;
    });
    
    if (hasData) {
       console.log('Graph is successfully displaying data lines!');
    } else {
       console.log('Graph is EMPTY! No data lines found.');
    }
    
    await browser.close();
  } catch(e) { console.log(e); }
})();
