import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('public/docs');
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const checkServer = () => new Promise((resolve) => {
  const req = http.get('http://localhost:5173', (res) => {
    resolve(res.statusCode === 200 || res.statusCode === 404);
  });
  req.on('error', () => resolve(false));
});

const waitForServer = async () => {
  console.log('Checking if dev server is running...');
  if (await checkServer()) return null;

  console.log('Starting dev server...');
  const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { stdio: 'inherit' });
  
  while (!(await checkServer())) {
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Dev server is up!');
  return child;
};

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

(async () => {
  const serverProc = await waitForServer();

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: true, 
    defaultViewport: { width: 1280, height: 800 } 
  });
  const page = await browser.newPage();
  
  // Forward browser console to terminal for debugging
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  // Disable animations for stable screenshots
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.innerHTML = '* { transition: none !important; animation: none !important; }';
    document.head.appendChild(style);
  });

  await page.goto('http://localhost:5173/simulator', { waitUntil: 'networkidle0' });

  console.log('Taking step 1: Sidebar...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.sidebar-category'));
    const sources = items[3]; // Sources category
    if (sources) sources.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DOCS_DIR, 'step1_sidebar.png') });

  console.log('Taking step 2: Canvas...');
  await page.evaluate((json) => {
    window.useSchematicStore.getState().importState(JSON.stringify(json));
  }, circuitJson);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DOCS_DIR, 'step2_canvas.png') });

  console.log('Taking step 3: Properties...');
  await page.evaluate(() => {
    // Select V1
    window.useSchematicStore.getState().setSelectedComponent('V1');
    // Open settings
    window.useSchematicStore.getState().setIsConfigOpen(true);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(DOCS_DIR, 'step3_properties.png') });

  console.log('Taking step 4: Grapher...');
  await page.evaluate(async () => {
    // Switch tab to Split view first so we can see it
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const splitTab = tabs.find(t => t.textContent.includes('Split'));
    if (splitTab) splitTab.click();
    
    // Run simulation
    await window.useSchematicStore.getState().runSimulation();
    
    // After simulation is done, we can force the graph to be fully drawn
    const state = window.useSchematicStore.getState();
    state.setIsPlaying(false);
    state.setPlaybackTime(5); // Show full 5ms graph
    
    // Turn on Scope mode and Cursors mode via DOM
    const labels = Array.from(document.querySelectorAll('label'));
    const scopeLabel = labels.find(l => l.textContent.toUpperCase().includes('SCOPE'));
    const cursorsLabel = labels.find(l => l.textContent.toUpperCase().includes('CURSORS'));
    if (scopeLabel && !scopeLabel.querySelector('input').checked) scopeLabel.click();
    if (cursorsLabel && !cursorsLabel.querySelector('input').checked) cursorsLabel.click();
  });
  
  // WAIT FOR REACT AND RECHARTS TO FULLY RENDER
  await new Promise(r => setTimeout(r, 1500));
  
  await page.evaluate(() => {
    // Log what the Grapher parent div contains to find out why it's white
    const grapherRoot = document.getElementById('grapher-wrapper');
    if (grapherRoot && grapherRoot.children[0] && grapherRoot.children[0].children[1]) {
      console.log("GRAPHER_WRAPPER_BOUNDS:", JSON.stringify(grapherRoot.getBoundingClientRect()));
      console.log("PLOT_AREA_DUMP:", grapherRoot.children[0].children[1].innerHTML.substring(0, 1500));
    } else {
      console.log("PLOT_AREA_DUMP: NOT FOUND");
    }
    
    // Log the simulation data keys to see what traces exist!
    const simData = window.useSchematicStore.getState().simulationData;
    if (simData && simData.length > 0) {
      console.log("SIM_DATA_KEYS:", JSON.stringify(Object.keys(simData[0])));
      
      const probeMap = {};
      window.useSchematicStore.getState().probes.forEach((probe, i) => {
         const name = probe.id || `Probe ${i + 1}`;
         const nodeId = window.getSpiceNodeForPoint ? window.getSpiceNodeForPoint(probe.position, window.useSchematicStore.getState().components, window.useSchematicStore.getState().wires) : 'unknown';
         console.log("PROBE NODE ID:", name, "=>", nodeId);
      });
    } else {
      console.log("SIM_DATA_KEYS: EMPTY");
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(DOCS_DIR, 'step4_grapher.png') });

  console.log('Screenshots generated successfully!');
  await browser.close();
  
  if (serverProc) {
    serverProc.kill();
  }
  process.exit(0);
})();
