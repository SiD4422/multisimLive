/**
 * Safely evaluates user math expressions over probe voltages (e.g. "V(PRB1) - V(PRB2)").
 */
export function evaluateMathExpression(
  expr: string,
  row: Record<string, number>,
  probeMap: Record<string, string>
): number | null {
  try {
    let resolved = expr;

    // Replace V(probeName) with actual node voltage values
    resolved = resolved.replace(/V\((\w+)\)/gi, (_match, probeName) => {
      if (probeName === '0') return '0';
      const pnLower = probeName.toLowerCase();
      let mapped = probeMap[probeName];
      if (!mapped) {
        for (const [k, v] of Object.entries(probeMap)) {
          if (k.toLowerCase() === pnLower) {
            mapped = v;
            break;
          }
        }
      }
      if (!mapped) mapped = probeName;
      if (mapped === '0') return '0';

      const candidates = [
        mapped,
        mapped.toLowerCase(),
        `v(${mapped})`,
        `v(${mapped.toLowerCase()})`,
        `V(${mapped})`,
        probeName,
        probeName.toLowerCase(),
        `v(${probeName})`,
        `v(${probeName.toLowerCase()})`,
        `V(${probeName})`,
      ];

      for (const k of candidates) {
        const val = row[k];
        if (typeof val === 'number' && !isNaN(val)) {
          return String(val);
        }
      }

      // Case-insensitive fallback search in row keys
      const mappedLower = mapped.toLowerCase();
      const vMappedLower = `v(${mappedLower})`;
      for (const key of Object.keys(row)) {
        const kl = key.toLowerCase();
        if (kl === mappedLower || kl === vMappedLower || kl === probeName.toLowerCase() || kl === `v(${probeName.toLowerCase()})`) {
          const val = row[key];
          if (typeof val === 'number' && !isNaN(val)) return String(val);
        }
      }

      return 'NaN';
    });

    // Safe evaluate: only allow numbers, whitespace, and basic math operators
    if (!/^[\d\s.+\-*/()eE]+$/.test(resolved)) return null;

    const val = Function(`"use strict"; return (${resolved})`)() as number;
    return typeof val === 'number' && Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}
