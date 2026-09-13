import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Listen for any unhandled errors
    page.on('pageerror', err => console.log('Page error: ' + err.toString()));
    page.on('console', msg => console.log('Console: ' + msg.text()));
    
    console.log('Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('Done!');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
