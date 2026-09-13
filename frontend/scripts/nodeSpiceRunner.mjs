/**
 * nodeSpiceRunner.mjs
 * A Node.js-compatible SPICE simulation runner that directly uses
 * the ngspice-wasm module without a browser Web Worker.
 * Used by test_all_components.ts for CI/headless environments.
 */

import createNgspiceModule from '@o.z/ngspice-wasm';

/**
 * Run a SPICE netlist string and return parsed simulation output data.
 * @param {string} netlist - Full SPICE netlist text including .control block
 * @returns {Promise<Array<Record<string, number>>>} Array of data point objects
 */
export async function runSpiceSimulationNode(netlist) {
  let outputData = {};
  let captureMode = false;
  let headers = [];

  const ng = await createNgspiceModule({
    printErr: () => {},
    print: (line) => {
      line = line.trim();
      if (line.startsWith('Index')) {
        headers = line.split(/\s+/).map(h => h.toLowerCase());
        headers.forEach(h => { if (!outputData[h]) outputData[h] = []; });
        captureMode = true;
        return;
      }
      if (line.startsWith('------')) return;
      if (captureMode && line.length > 0) {
        const parts = line.split(/\s+/);
        if (parts.length === headers.length && !isNaN(parseFloat(parts[0]))) {
          for (let i = 0; i < headers.length; i++) {
            outputData[headers[i]].push(parseFloat(parts[i]));
          }
        }
      }
    }
  });

  // ngspice WASM requires /proc/meminfo to exist
  try { ng.FS.mkdir('/proc'); } catch (e) {}
  ng.FS.writeFile('/proc/meminfo', 'MemTotal: 16384000 kB\nMemFree: 8192000 kB\n');

  // Ensure netlist has a .control block for batch output
  let fullNetlist = netlist;
  if (!fullNetlist.includes('.control')) {
    fullNetlist = fullNetlist.replace(/\.end\s*$/m, `.control\nrun\nprint all\n.endc\n.end`);
  }
  if (!fullNetlist.includes('.end')) {
    fullNetlist += '\n.control\nrun\nprint all\n.endc\n.end';
  }

  ng.FS.writeFile('/sim.cir', fullNetlist);
  const args = ['ngspice', '-b', '/sim.cir'];
  const ptrs = args.map(a => {
    const p = ng.__emscripten_stack_alloc(a.length + 1);
    ng.stringToUTF8(a, p, a.length + 1);
    return p;
  });
  const argv = ng.__emscripten_stack_alloc(args.length * 4);
  ptrs.forEach((p, i) => ng.HEAP32[(argv >> 2) + i] = p);

  try { ng._main(args.length, argv); } catch (e) {}

  // Convert columnar data to array of row objects
  const timeArr = outputData['time'] || outputData[headers[1]] || [];
  if (timeArr.length === 0) {
    // Return raw columnar data if no time vector
    return outputData;
  }
  return timeArr.map((_, i) => {
    const row = {};
    headers.forEach(h => { row[h] = (outputData[h] || [])[i] ?? 0; });
    return row;
  });
}
