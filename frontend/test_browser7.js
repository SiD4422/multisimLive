import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    let hasError = false;
    page.on('console', msg => {
      if (msg.type() === 'error') {
         console.log('BROWSER ERROR:', msg.text());
         hasError = true;
      } else {
         console.log('BROWSER LOG:', msg.text());
      }
    });
    page.on('pageerror', error => {
      console.log('BROWSER EXCEPTION:', error.message);
      hasError = true;
    });
    
    console.log('Navigating to simulator...');
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });
    
    console.log('Opening library...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title && b.title.includes('Circuits'));
      if (libBtn) libBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Clicking first circuit...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      if (h3s.length > 0) h3s[0].parentElement.parentElement.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    if (!hasError) {
       console.log('No errors thrown in browser.');
    }
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
