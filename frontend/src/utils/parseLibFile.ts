/**
 * SPICE .lib file parser
 * Extracts .model and .subckt definitions from a SPICE library file.
 * Returns a map of model name → full definition string ready to inject into a netlist.
 */
export const OPAMP_PIN_MAPS: Record<string, {
  nodesimPins: string[];
  subcktPorts: string[];
}> = {
  'LM358':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','VEE','OUT'] },
  'LM741':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','GND','OUT'] },
  'TL071':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','VEE','OUT'] },
  'TL081':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','VEE','OUT'] },
  'LM324':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','GND','OUT'] },
  'UA741':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','VEE','OUT'] },
  'LM311':  { nodesimPins: ['IN+','IN-','VCC','VEE','OUT'], subcktPorts: ['IN+','IN-','VCC','GND','OUT'] },
};

export interface ParsedLibrary {
  models: Record<string, string>;
  portOrders: Record<string, string[]>;
  warnings: string[];
}

export function parseLibFile(text: string): ParsedLibrary {
  const models: Record<string, string> = {};
  const portOrders: Record<string, string[]> = {};
  const warnings: string[] = [];

  // Normalize line continuations: SPICE uses '+' at start of line to continue previous
  const normalized = text
    .split('\n')
    .reduce<string[]>((acc, line) => {
      if (line.trimStart().startsWith('+')) {
        if (acc.length > 0) acc[acc.length - 1] += ' ' + line.trimStart().slice(1).trim();
      } else {
        acc.push(line);
      }
      return acc;
    }, [])
    .join('\n');

  // Match .model definitions (single logical line after normalization)
  // Format: .model NAME TYPE (params...)
  const modelRegex = /^\.model\s+(\S+)\s+\S+[^\n]*/gim;
  for (const match of normalized.matchAll(modelRegex)) {
    const name = match[1].toUpperCase();
    models[name] = match[0].trim();
  }

  // Match .subckt...ends blocks (multi-line)
  // Format: .subckt NAME port1 port2...\n...\n.ends [NAME]
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('.subckt')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[1].toUpperCase();
        const ports = parts.slice(2);
        if (ports.length > 0) {
          portOrders[name] = ports;
        }
        const blockLines: string[] = [line];
        i++;
        while (i < lines.length) {
          blockLines.push(lines[i]);
          if (lines[i].trim().toLowerCase().startsWith('.ends')) break;
          i++;
        }
        models[name] = blockLines.join('\n');
      }
    }
    i++;
  }

  if (Object.keys(models).length === 0) {
    warnings.push('No .model or .subckt definitions found in the pasted text.');
  }

  return { models, portOrders, warnings };
}
