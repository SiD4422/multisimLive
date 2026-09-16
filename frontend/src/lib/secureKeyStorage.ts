const KEY_STORAGE_KEY = 'nodesim-byok-gemini';

function obfuscate(raw: string): string {
  return btoa(unescape(encodeURIComponent(raw))).split('').reverse().join('');
}

function deobfuscate(stored: string): string | null {
  try {
    const b64 = stored.split('').reverse().join('');
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return null;
  }
}

export function saveApiKey(rawKey: string): void {
  try {
    localStorage.setItem(KEY_STORAGE_KEY, obfuscate(rawKey.trim()));
  } catch { /* private mode / quota */ }
}

export function loadApiKey(): string | null {
  try {
    const stored = localStorage.getItem(KEY_STORAGE_KEY);
    return stored ? deobfuscate(stored) : null;
  } catch { return null; }
}

export function clearApiKey(): void {
  try { localStorage.removeItem(KEY_STORAGE_KEY); } catch { /* ignore */ }
}

export function hasStoredApiKey(): boolean {
  try { return localStorage.getItem(KEY_STORAGE_KEY) !== null; } catch { return false; }
}
