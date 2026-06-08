import { runSpiceSimulation } from './src/utils/spiceEngine';

async function test() {
  const netlist = `* Test
V1 1 2 DC 5
R1 3 4 1k
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
