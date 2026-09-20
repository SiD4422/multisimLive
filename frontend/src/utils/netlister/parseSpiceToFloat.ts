export function parseSpiceToFloat(valStr: string): number {
    if (!valStr) return 0;
    let clean = valStr.trim()
      .replace(/(?:Ohm|ohm|Ω|Vpk|Apk|Hz|V|A|F|H)$/i, '')
      .trim();
  const match = clean.match(/^([\+\-]?\d*(?:\.\d+)?(?:[eE][\+\-]?\d+)?)([a-zA-Z]+)?$/);
  if (!match) return parseFloat(clean) || 0;
  
  const numPart = parseFloat(match[1]);
  if (isNaN(numPart)) return 0;
  
  const suffix = match[2];
  if (!suffix) return numPart;
  
  if (suffix === 'M') return numPart * 1e6;
  
  const lowerSuffix = suffix.toLowerCase();
  switch (lowerSuffix) {
    case 't': return numPart * 1e12;
    case 'g': return numPart * 1e9;
    case 'meg': return numPart * 1e6;
    case 'k': return numPart * 1e3;
    case 'm': return numPart * 1e-3;
    case 'u': 
    case 'µ': return numPart * 1e-6;
    case 'n': return numPart * 1e-9;
    case 'p': return numPart * 1e-12;
    case 'f': return numPart * 1e-15;
    default: return numPart;
  }
}
