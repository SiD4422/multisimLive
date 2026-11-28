declare module '*scripts/nodeSpiceRunner.mjs' {
  export function runSpiceSimulationNode(netlist: string): Promise<Array<Record<string, number>>>;
}
