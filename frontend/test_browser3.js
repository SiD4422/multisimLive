import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log('Navigating to circuits page...');
    await page.goto('http://localhost:5173/circuits', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking the first circuit card...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      if (h3s.length > 0) {
         console.log('Clicking circuit:', h3s[0].innerText);
         h3s[0].parentElement.parentElement.click();
      } else {
         console.log('No circuits found on page');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log('Done.');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
