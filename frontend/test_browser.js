import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating to simulator...');
  await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });
  
  console.log('Clicking library button...');
  // It's an icon button, we might need to find it by title or Lucide icon
  const libraryBtn = await page.$('button[title="Example Circuits"]');
  if (libraryBtn) {
    await libraryBtn.click();
  } else {
    console.log('Could not find library button, trying another selector...');
    const buttons = await page.$$('button');
    // Fallback: click button containing BookOpen icon or similar. In Simulator.tsx, it's <BookOpen />
    // Let's just click the 12th button or whatever
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const libBtn = btns.find(b => b.innerHTML.includes('BookOpen') || b.title === 'Example Circuits');
      if (libBtn) libBtn.click();
    });
  }
  
  console.log('Waiting for modal...');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking the circuit...');
  const cards = await page.$$('h3');
  let clicked = false;
  for (const card of cards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('Transformer')) {
      await page.evaluate(el => el.parentElement.parentElement.click(), card);
      clicked = true;
      break;
    }
  }
  
  if (!clicked) {
    console.log('Failed to click circuit, trying generic click...');
    await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      if (h3s.length > 0) h3s[0].parentElement.parentElement.click();
    });
  }
  
  console.log('Waiting for load...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Done.');
  await browser.close();
})();
