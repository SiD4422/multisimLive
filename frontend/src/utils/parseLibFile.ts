/**
 * SPICE .lib file parser
 * Extracts .model and .subckt definitions from a SPICE library file.
 * Returns a map of model name → full definition string ready to inject into a netlist.
 */
export interface ParsedLibrary {
  models: Record<string, string>;  // name → full .model or .subckt...ends text
  warnings: string[];              // non-fatal parse issues
}

export function parseLibFile(text: string): ParsedLibrary {
  const models: Record<string, string> = {};
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
      const nameMatch = line.match(/\.subckt\s+(\S+)/i);
      if (nameMatch) {
        const name = nameMatch[1].toUpperCase();
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

  return { models, warnings };
}
