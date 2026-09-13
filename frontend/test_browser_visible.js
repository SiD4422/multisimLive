import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    
    console.log('Navigating to http://localhost:5173/simulator');
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('Clicking the Library Modal button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title && b.title.includes('Circuits'));
      if (libBtn) libBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('Clicking Transformer Step-Down...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const card = h3s.find(h => h.innerText.includes('Step-Down Transformer'));
      if (card) {
         card.parentElement.parentElement.click();
      } else {
         console.log('Transformer card not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 4000));
    
    console.log('Done!');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
