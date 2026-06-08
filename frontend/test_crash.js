import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('pageerror', (err) => {
    console.error('PAGE ERROR:', err.toString());
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  console.log('Navigating to simulator...');
  await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });

  console.log('Clicking AC Voltage Source...');
  // The palette flyout isn't open by default, we need to click the Sources category first!
  // Wait, the palette category is "Sources".
  // Let's find the button with text "Sources"
  await page.evaluate(() => {
    // The palette items are icons. We can just click the 2nd one which is sources.
    // Let's find the one containing IconACVoltage (it's the 3rd palette item)
    const items = Array.from(document.querySelectorAll('.sidebar-category'));
    const sourcesCategory = items[3];
    if (sourcesCategory) sourcesCategory.click();
  });

  await new Promise(r => setTimeout(r, 500));

  // Now find AC Voltage
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.flyout-item'));
    const ac = items.find(i => i.textContent.includes('AC Voltage'));
    if (ac) ac.click();
  });

  console.log('Clicking canvas to place it...');
  await page.mouse.click(500, 500);
  await new Promise(r => setTimeout(r, 500));
  
  console.log('Clicking the gear icon to open settings...');
  await page.evaluate(() => {
    // Find the SVG inside the toolbar (right side)
    const svgs = Array.from(document.querySelectorAll('svg'));
    // The settings gear is usually the last one in the toolbar, or we can just click all lucide-settings icons
    const gear = svgs.find(s => s.classList.contains('lucide-settings'));
    if (gear) gear.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test_crash_screenshot2.png' });
  await page.screenshot({ path: 'test_crash_screenshot2.png' });
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Done.');
  await browser.close();
})();
