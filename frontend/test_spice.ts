import { runSpiceSimulation } from './src/utils/spiceEngine';
import fs from 'fs';

async function test() {
  const netlist = `* Test
V1 1 0 DC 5
R1 2 0 1k
.tran 10us 1ms
.end`;

  try {
    const result = await runSpiceSimulation(netlist);
    console.log("Success:", result.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
