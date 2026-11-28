import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockShareDb = {
  docs: new Map<string, Record<string, unknown>>(),
  failCount: 0,
};

vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
  onAuthStateChanged: vi.fn(() => () => {}),
  GoogleAuthProvider: class {
    setCustomParameters = vi.fn();
  },
  GithubAuthProvider: class {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({ __mockDb: true }),
  doc: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/'), id: segments[segments.length - 1] }),
  serverTimestamp: () => '__SERVER_TIME__',
  setDoc: async (ref: { path: string; id: string }, data: Record<string, unknown>) => {
    if (mockShareDb.failCount > 0) {
      mockShareDb.failCount--;
      throw new Error('PERMISSION_DENIED: collision retry check');
    }
    mockShareDb.docs.set(ref.path, data);
  },
  getDoc: async (ref: { path: string; id: string }) => {
    const data = mockShareDb.docs.get(ref.path);
    return {
      id: ref.id,
      exists: () => Boolean(data),
      data: () => data,
    };
  },
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn(),
}));

import shareHandler, { escapeHtml, parseFirestoreShareDocument, renderShareHtml } from '../../../api/share';
import { createShortShareLink, getSharedCircuitById } from '../../lib/firebase';
import {
  generateShortShareId,
  isValidShortShareId,
  SHORT_SHARE_ID_LENGTH,
  summarizeSharedComponents,
} from '../shortShareId';

const FRONTEND_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = resolve(__dirname, '../..');

describe('Phase 5.3: Shareable Short URLs (/c/<shortId>) + SSR & OpenGraph Tags', () => {
  beforeEach(() => {
    mockShareDb.docs.clear();
    mockShareDb.failCount = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('generates valid 8-char alphanumeric IDs without modulo bias and summarizes circuit components', () => {
    const ids = Array.from({ length: 25 }, () => generateShortShareId());
    for (const id of ids) {
      expect(id).toHaveLength(SHORT_SHARE_ID_LENGTH);
      expect(isValidShortShareId(id)).toBe(true);
    }
    expect(new Set(ids).size).toBe(25);
    expect(isValidShortShareId('xK9f2mLp')).toBe(true);
    expect(isValidShortShareId('tooShort')).toBe(true);
    expect(isValidShortShareId('bad-id!')).toBe(false);
    expect(isValidShortShareId('1234567')).toBe(false);

    const summary = summarizeSharedComponents([
      { type: 'ACSource' },
      { type: 'Resistor' },
      { type: 'Capacitor' },
      { type: 'Resistor' },
      { type: 'Ground' },
    ]);
    expect(summary).toContain('5 components');
    expect(summary).toContain('ACSource, Resistor, Capacitor, Ground');
    expect(summary.length).toBeLessThanOrEqual(180);
  });

  it('stores immutable short links in Firestore sharedCircuits/{shortId} (with collision retry) and resolves by ID', async () => {
    mockShareDb.failCount = 1; // Simulate 1 transient/collision failure on attempt 1
    const created = await createShortShareLink({
      name: '  Sallen-Key LPF  ',
      componentCount: 6,
      componentSummary: '6 components (OpAmp, Resistor, Capacitor)',
      circuitData: 'N4Igxg9gJgpiBcIBCA7AhgewHYg',
      authorUid: null,
    });

    expect(created.shortId).toMatch(/^[A-Za-z0-9]{8}$/);
    expect(created.shortPath).toBe(`/c/${created.shortId}`);

    const loaded = await getSharedCircuitById(created.shortId);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('Sallen-Key LPF');
    expect(loaded!.componentCount).toBe(6);
    expect(loaded!.circuitData).toBe('N4Igxg9gJgpiBcIBCA7AhgewHYg');
    expect(loaded!.authorUid).toBeNull();

    expect(await getSharedCircuitById('invalid!')).toBeNull();
    expect(await getSharedCircuitById('ZZZZZZZZ')).toBeNull();
  });

  it('resolves /c/<shortId> server-side via Edge handler with XSS-safe OpenGraph tags and Simulator redirect', async () => {
    const parsed = parseFirestoreShareDocument('xK9f2mLp', {
      fields: {
        id: { stringValue: 'xK9f2mLp' },
        name: { stringValue: 'Buck <script>alert(1)</script> Regulator' },
        componentCount: { integerValue: '7' },
        componentSummary: { stringValue: '7 components (MOSFET, Inductor, Diode)' },
        circuitData: { stringValue: 'N4IgZg9hAEA0I' },
      },
    });
    expect(parsed).toEqual({
      id: 'xK9f2mLp',
      name: 'Buck <script>alert(1)</script> Regulator',
      componentCount: 7,
      componentSummary: '7 components (MOSFET, Inductor, Diode)',
      circuitData: 'N4IgZg9hAEA0I',
    });

    expect(escapeHtml('<>"\'&')).toBe('&lt;&gt;&quot;&#39;&amp;');
    const previewHtml = renderShareHtml(parsed!);
    expect(previewHtml).toContain('<title>Buck &lt;script&gt;alert(1)&lt;/script&gt; Regulator | NodeSim Shared Circuit</title>');
    expect(previewHtml).toContain('<meta property="og:title" content="Buck &lt;script&gt;alert(1)&lt;/script&gt; Regulator — Interactive SPICE Circuit" />');
    expect(previewHtml).toContain('<meta property="og:description" content="7 components (MOSFET, Inductor, Diode)" />');
    expect(previewHtml).toContain('<meta property="og:image" content="https://www.nodesimapp.com/og-image.png" />');
    expect(previewHtml).toContain("window.location.replace('/simulator#circuit=' + payload)");

    // Full Edge handler test: valid ID, 404 not found, and 400 malformed ID
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/documents/sharedCircuits/xK9f2mLp')) {
          return new Response(
            JSON.stringify({
              fields: {
                name: { stringValue: 'RC Low Pass' },
                componentCount: { integerValue: '4' },
                componentSummary: { stringValue: '4 components (ACSource, Resistor, Capacitor, Ground)' },
                circuitData: { stringValue: 'N4IgTestPayload' },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response(JSON.stringify({ error: { code: 404 } }), { status: 404 });
      }),
    );

    const okRes = await shareHandler(new Request('https://www.nodesimapp.com/api/share?id=xK9f2mLp'));
    expect(okRes.status).toBe(200);
    expect(okRes.headers.get('Content-Type')).toContain('text/html');
    const okHtml = await okRes.text();
    expect(okHtml).toContain('RC Low Pass');
    expect(okHtml).toContain('https://www.nodesimapp.com/c/xK9f2mLp');
    expect(okHtml).toContain('N4IgTestPayload');

    const missRes = await shareHandler(new Request('https://www.nodesimapp.com/api/share?id=Missing1'));
    expect(missRes.status).toBe(404);

    const badRes = await shareHandler(new Request('https://www.nodesimapp.com/api/share?id=bad'));
    expect(badRes.status).toBe(400);
  });

  it('wires vercel.json rewrite, firestore.rules, App.tsx /c/:shortId route, useCircuitBoot, and ShareModal', () => {
    const vercel = readFileSync(resolve(FRONTEND_ROOT, 'vercel.json'), 'utf8');
    const rules = readFileSync(resolve(FRONTEND_ROOT, 'firestore.rules'), 'utf8');
    const appSrc = readFileSync(resolve(SRC_ROOT, 'App.tsx'), 'utf8');
    const bootSrc = readFileSync(resolve(SRC_ROOT, 'hooks/useCircuitBoot.ts'), 'utf8');
    const shareModalSrc = readFileSync(resolve(SRC_ROOT, 'components/ShareModal.tsx'), 'utf8');

    expect(vercel).toContain('"source": "/c/:id"');
    expect(vercel).toContain('"destination": "/api/share?id=:id"');
    expect(rules).toContain('match /sharedCircuits/{shortId}');
    expect(rules).toContain('allow update: if false;');
    expect(rules).toContain('allow delete: if false;');
    expect(appSrc).toContain('/c/:shortId');
    expect(bootSrc).toContain('getSharedCircuitById');
    expect(shareModalSrc).toContain('createShortShareLink');
    expect(shareModalSrc).toContain('Short Link Ready');
  });
});
