import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log('Navigating...');
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });
    
    console.log('Waiting 2 seconds for app to initialize...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Evaluating library button click in browser context...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title.includes('Example Circuits') || b.innerHTML.includes('BookOpen'));
      if (libBtn) libBtn.click();
      else console.log('Could not find library button in DOM');
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Evaluating circuit click...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      if (h3s.length > 0) {
         console.log('Clicking circuit:', h3s[0].innerText);
         h3s[0].parentElement.parentElement.click();
      } else {
         console.log('No circuits found in modal');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Done.');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
