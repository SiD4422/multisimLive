  // Intercept worker message to log the netlist
  const fs = require('fs');
  const file = fs.readFileSync('c:\\Users\\spart\\Desktop\\test MultiSimlab\\multisimfree\\frontend\\src\\utils\\spiceWorker.ts', 'utf8');
  const modified = file.replace(
    /export async function runSpiceSimulation\([^)]+\)\s*\{/,
    "export async function runSpiceSimulation(netlist: string): Promise<any> {\n  console.error('NETLIST SENT TO SPICE:\\n' + netlist);\n"
  );
  fs.writeFileSync('c:\\Users\\spart\\Desktop\\test MultiSimlab\\multisimfree\\frontend\\src\\utils\\spiceWorker.ts', modified);
