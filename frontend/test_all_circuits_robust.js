import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for canvas to load
    await new Promise(r => setTimeout(r, 2000));
    
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
      
      // Click library button by evaluating text
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const libBtn = btns.find(b => b.innerText && b.innerText.includes('Inbuilt Library')); // Wait, what is the button text?
        if (libBtn) libBtn.click();
        else {
           // fallback to title
           const b2 = btns.find(b => b.title && b.title.includes('Circuits'));
           if (b2) b2.click();
        }
      });
      await new Promise(r => setTimeout(r, 1000));
      
      // Find the card by searching all elements for the text
      const clicked = await page.evaluate((n) => {
        // find the h3 containing the text
        const headers = Array.from(document.querySelectorAll('h3, h2, h4, div'));
        const header = headers.find(h => h.innerText && h.innerText.trim() === n);
        if (header) {
           // find closest clickable container
           let curr = header;
           while(curr && curr !== document.body) {
              if (curr.style.cursor === 'pointer' || curr.tagName === 'BUTTON' || curr.onclick) {
                  curr.click();
                  return true;
              }
              curr = curr.parentElement;
           }
           // if no pointer found, just click the header itself
           header.click();
           return true;
        }
        return false;
      }, name);
      
      if (!clicked) {
        console.log('  -> COULD NOT FIND IN UI');
        continue;
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
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
        console.log('  -> FAILED (' + errorMsg.substring(0, 50) + ')');
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
