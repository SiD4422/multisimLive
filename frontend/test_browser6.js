import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log('Navigating to home...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    console.log('Clicking circuits tab...');
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll('a')).find(el => el.innerText.includes('Circuits'));
      if (a) a.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking the Transformer circuit card...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const card = h3s.find(h => h.innerText.includes('Transformer'));
      if (card) {
         console.log('Clicking circuit:', card.innerText);
         card.parentElement.parentElement.click();
      } else {
         console.log('Transformer circuit not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    const url = page.url();
    console.log('Current URL:', url);
    
    const componentsLength = await page.evaluate(() => {
       const stateStr = window.localStorage.getItem('schematic-storage');
       return stateStr ? stateStr.length : 'No local storage state';
    });
    console.log('State string length:', componentsLength);
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
