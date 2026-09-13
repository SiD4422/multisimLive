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
    
    console.log('Clicking on Circuits tab');
    await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll('a')).find(el => el.innerText.includes('Circuits'));
      if (a) a.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'step1_circuits_page.png' });
    
    console.log('Clicking the RC Low-Pass Filter card...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const card = h3s.find(h => h.innerText.includes('RC Low-Pass Filter'));
      if (card) {
         card.parentElement.parentElement.click();
      } else {
         console.log('Card not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'step2_after_click.png' });
    
    console.log('Clicking the Library Modal button to test the other way...');
    // We are now on simulator
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title && b.title.includes('Circuits'));
      if (libBtn) libBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'step3_modal_open.png' });
    
    console.log('Clicking Transformer Step-Down...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const card = h3s.find(h => h.innerText.includes('Transformer Step-Down'));
      if (card) {
         card.parentElement.parentElement.click();
      } else {
         console.log('Transformer card not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'step4_after_modal_click.png' });
    
    console.log('Done!');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
