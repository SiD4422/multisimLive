import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });

  const circuitJson = {
    components: [
      { id: "V1", type: "ACSource", position: { x: 100, y: 300 }, value: "5Vpk 1kHz" },
      { id: "R1", type: "Resistor", position: { x: 300, y: 300 }, value: "1k" },
      { id: "GND1", type: "Ground", position: { x: 190, y: 450 }, value: "0" }
    ],
    wires: [
      { id: "w1", points: [{ x: 190, y: 300 }, { x: 300, y: 300 }] },
      { id: "w2", points: [{ x: 390, y: 300 }, { x: 390, y: 450 }, { x: 190, y: 450 }] },
      { id: "w3", points: [{ x: 190, y: 450 }, { x: 100, y: 450 }, { x: 100, y: 300 }] }
    ],
    probes: [
      { id: "P1", type: "Voltage", position: { x: 300, y: 300 } }
    ],
    stagePos: { x: 0, y: 0 },
    scale: 1,
    analysisMode: 'transient',
    transientSettings: { endTime: '5ms', step: '0.01ms' }
  };

  await page.evaluate((json) => {
    window.useSchematicStore.getState().importState(JSON.stringify(json));
  }, circuitJson);

  const html = await page.evaluate(async () => {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const splitTab = tabs.find(t => t.textContent.includes('Split'));
    if (splitTab) splitTab.click();
    
    await window.useSchematicStore.getState().runSimulation();
    const state = window.useSchematicStore.getState();
    state.setIsPlaying(false);
    state.setPlaybackTime(5);
    
    const labels = Array.from(document.querySelectorAll('label'));
    const scopeLabel = labels.find(l => l.textContent.toUpperCase().includes('SCOPE'));
    if (scopeLabel && !scopeLabel.querySelector('input').checked) scopeLabel.click();

    return document.body.innerHTML;
  });

  console.log(html);
  await browser.close();
})();
