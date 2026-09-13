import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log('Navigating to simulator...');
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking Example Library button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.title.includes('Example Circuits') || b.innerHTML.includes('BookOpen'));
      if (libBtn) libBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Clicking the first circuit card...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      if (h3s.length > 0) {
         console.log('Clicking circuit:', h3s[0].innerText);
         h3s[0].parentElement.parentElement.click();
      }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if components exist in Zustand store
    const componentsLength = await page.evaluate(() => {
       // Since it's Zustand, we can check localStorage if it saves there, or check the DOM for Konva elements
       const layer = document.querySelector('.konvajs-content');
       return layer ? 'Canvas exists' : 'No canvas';
    });
    console.log('DOM check:', componentsLength);
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
