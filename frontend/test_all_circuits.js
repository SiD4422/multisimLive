import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for canvas to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Get all expected names directly from our knowledge of EXAMPLES array to avoid selector issues
    const circuitNames = [
      'RC Low-Pass Filter', 'RC High-Pass Filter', 'LC Bandpass Filter', 'RL Low-Pass Filter', 'RC Integrator',
      'Bridge Rectifier', 'Half-Wave Rectifier', 'Zener Diode Clipper',
      'Inverting Op-Amp', 'Voltage Comparator',
      '555 Astable Oscillator',
      'NPN Common Emitter', 'Simple NPN Amplifier', 'MOSFET Switch',
      'Step-Down Transformer'
    ];
    
    let failed = [];
    let passed = [];
    
    for (const name of circuitNames) {
      console.log('Testing: ' + name);
      
      // Click library button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const libBtn = btns.find(b => b.title && b.title.includes('Circuits'));
        if (libBtn) libBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      
      // Click the circuit
      const clicked = await page.evaluate((n) => {
        const h3s = Array.from(document.querySelectorAll('h3'));
        const card = h3s.find(h => h.innerText.includes(n));
        if (card) {
          card.parentElement.parentElement.click();
          return true;
        }
        return false;
      }, name);
      
      if (!clicked) {
        console.log('  -> COULD NOT FIND IN UI');
        continue;
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
      // Clear console logs
      let errorMsg = null;
      const logHandler = msg => {
        if (msg.type() === 'error' && msg.text().includes('Simulation failed')) {
          errorMsg = msg.text();
        }
      };
      page.on('console', logHandler);
      
      // Click Run Simulation
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const runBtn = btns.find(b => b.innerText && b.innerText.includes('Run Simulation'));
        if (runBtn) runBtn.click();
      });
      
      await new Promise(r => setTimeout(r, 2000));
      page.off('console', logHandler);
      
      if (errorMsg) {
        console.log('  -> FAILED');
        failed.push(name);
      } else {
        console.log('  -> PASSED');
        passed.push(name);
      }
    }
    
    console.log('\n--- RESULTS ---');
    console.log('Failed: ' + failed.join(', '));
    console.log('Passed: ' + passed.join(', '));
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
