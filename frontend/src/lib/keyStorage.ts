// BYOK API key storage — localStorage with base64 encoding (obfuscation only).
//
// (Renamed from secureKeyStorage.ts: the old name over-promised. Nothing here is secure
// storage, see below.)
//
// SECURITY NOTE: This is NOT encrypted storage. The API key is stored in
// localStorage as base64-encoded text. Anyone with access to this browser
// (DevTools, browser extensions, physical access) can retrieve it.
//
// This is the same security model used by all BYOK browser tools.
// NodeSim never transmits your key to any server. It is sent only directly
// to Google's Gemini API from your browser.
//
// If you are on a shared computer, clear your key after use via Settings.

const KEY_STORAGE_KEY = 'nodesim-byok-gemini';
const KEY_EXPIRY_KEY = 'nodesim-byok-gemini-expires';
const KEY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function encode(raw: string): string {
  // Simple base64 — not encryption, just prevents casual shoulder-surfing of localStorage
  return btoa(encodeURIComponent(raw));
}

function decode(stored: string): string | null {
  try {
    return decodeURIComponent(atob(stored));
  } catch {
    try {
      return atob(stored);
    } catch {
      return null;
    }
  }
}

export function saveApiKey(rawKey: string): void {
  try {
    localStorage.setItem(KEY_STORAGE_KEY, encode(rawKey.trim()));
    localStorage.setItem(KEY_EXPIRY_KEY, String(Date.now() + KEY_TTL_MS));
  } catch { /* private mode / quota */ }
}

export function loadApiKey(): string | null {
  try {
    const expiry = localStorage.getItem(KEY_EXPIRY_KEY);
    if (expiry && Date.now() > Number(expiry)) {
      // Key has expired — clear it
      localStorage.removeItem(KEY_STORAGE_KEY);
      localStorage.removeItem(KEY_EXPIRY_KEY);
      return null;
    }
    const stored = localStorage.getItem(KEY_STORAGE_KEY);
    if (!stored) return null;
    // Support legacy obfuscated format (reversed base64) for backwards compat
    const direct = decode(stored);
    if (direct) return direct;
    // Legacy: was stored as btoa(unescape(encodeURIComponent(raw))).split('').reverse()
    try {
      const b64 = stored.split('').reverse().join('');
      return decodeURIComponent(escape(atob(b64)));
    } catch {
      return null;
    }
  } catch { return null; }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(KEY_STORAGE_KEY);
    localStorage.removeItem(KEY_EXPIRY_KEY);
  } catch { /* ignore */ }
}

export function hasStoredApiKey(): boolean {
  try {
    const expiry = localStorage.getItem(KEY_EXPIRY_KEY);
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem(KEY_STORAGE_KEY);
      localStorage.removeItem(KEY_EXPIRY_KEY);
      return false;
    }
    return localStorage.getItem(KEY_STORAGE_KEY) !== null;
  } catch { return false; }
}