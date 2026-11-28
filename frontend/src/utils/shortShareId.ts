import type { SchematicComponent } from '../store/useSchematicStore';

const SHORT_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const SHORT_SHARE_ID_LENGTH = 8;
export const SHORT_SHARE_ID_PATTERN = /^[A-Za-z0-9]{8}$/;

/**
 * Generates an unbiased 8-character alphanumeric short ID (`^[A-Za-z0-9]{8}$`).
 */
export function generateShortShareId(
  randomBytesFn: (arr: Uint8Array<ArrayBuffer>) => void = (arr) => {
    globalThis.crypto.getRandomValues(arr);
  },
): string {
  const maxValidByte = Math.floor(256 / SHORT_ID_ALPHABET.length) * SHORT_ID_ALPHABET.length; // 248
  let out = '';
  const buf = new Uint8Array(16);

  while (out.length < SHORT_SHARE_ID_LENGTH) {
    randomBytesFn(buf);
    for (let i = 0; i < buf.length && out.length < SHORT_SHARE_ID_LENGTH; i++) {
      const b = buf[i];
      if (b < maxValidByte) {
        out += SHORT_ID_ALPHABET[b % SHORT_ID_ALPHABET.length];
      }
    }
  }
  return out;
}

export function isValidShortShareId(id: string): boolean {
  return SHORT_SHARE_ID_PATTERN.test(id);
}

/**
 * Builds a concise human-readable circuit summary (`<= 180` chars) for OpenGraph previews.
 */
export function summarizeSharedComponents(
  components: Array<Pick<SchematicComponent, 'type'>>,
): string {
  const count = components.length;
  const uniqueTypes: string[] = [];
  const seen = new Set<string>();
  for (const c of components) {
    const label = (c.type || '').trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    uniqueTypes.push(label);
    if (uniqueTypes.length >= 4) break;
  }

  const base = `${count} component${count === 1 ? '' : 's'}`;
  if (uniqueTypes.length === 0) {
    return `${base} — Interactive NodeSim SPICE schematic`;
  }
  const suffix = seen.size > 4 || components.length > uniqueTypes.length ? `, …` : '';
  return `${base} (${uniqueTypes.join(', ')}${suffix}) — Simulate in NodeSim`.slice(0, 180);
}
