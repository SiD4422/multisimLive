import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = {
  currentUser: null as { uid: string } | null,
  addDocCalls: [] as Array<{ path: string; data: Record<string, unknown> }>,
  setDocCalls: [] as Array<{ path: string; data: Record<string, unknown>; opts: unknown }>,
  updateDocCalls: [] as Array<{ path: string; data: Record<string, unknown> }>,
  deleteDocCalls: [] as string[],
};

class MockGoogleAuthProvider {
  setCustomParameters = vi.fn();
}

class MockGithubAuthProvider {}

vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    get currentUser() {
      return mockState.currentUser;
    },
  }),
  GoogleAuthProvider: MockGoogleAuthProvider,
  GithubAuthProvider: MockGithubAuthProvider,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({ __mockDb: true }),
  collection: (_db: unknown, name: string) => ({ path: name }),
  doc: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  serverTimestamp: () => '__SERVER_TIME__',
  increment: (n: number) => ({ __increment: n }),
  addDoc: async (col: { path: string }, data: Record<string, unknown>) => {
    mockState.addDocCalls.push({ path: col.path, data });
    return { id: 'circuit-new-1' };
  },
  setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts: unknown) => {
    mockState.setDocCalls.push({ path: ref.path, data, opts });
  },
  updateDoc: async (ref: { path: string }, data: Record<string, unknown>) => {
    mockState.updateDocCalls.push({ path: ref.path, data });
  },
  deleteDoc: async (ref: { path: string }) => {
    mockState.deleteDocCalls.push(ref.path);
  },
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

import { formatFirebaseAuthError } from '../../hooks/useAuth';
import {
  buildNewCircuitDocument,
  deleteCommunityCircuit,
  getFirebaseAuth,
  incrementViews,
  publishCircuit,
  updateCommunityCircuit,
} from '../../lib/firebase';

const FRONTEND_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = resolve(__dirname, '../..');

describe('Phase 5.1: Firebase Authentication & Firestore Security Rules', () => {
  beforeEach(() => {
    mockState.currentUser = null;
    mockState.addDocCalls = [];
    mockState.setDocCalls = [];
    mockState.updateDocCalls = [];
    mockState.deleteDocCalls = [];
  });

  it('builds validated circuit payloads requiring non-empty authorUid and initial zero views', () => {
    expect(() =>
      buildNewCircuitDocument(
        {
          name: 'RC Filter',
          description: 'Simple LPF',
          category: 'analog',
          authorName: 'Alice',
          componentCount: 3,
          circuitData: 'compressed-data',
        },
        '   ',
      ),
    ).toThrow(/AUTH_REQUIRED/);

    const doc = buildNewCircuitDocument(
      {
        name: `  ${'A'.repeat(120)}  `,
        description: `  ${'B'.repeat(520)}  `,
        category: '  analog  ',
        authorName: '',
        componentCount: 5,
        circuitData: 'eJwL',
      },
      'uid-alice-1',
    );

    expect(doc.authorUid).toBe('uid-alice-1');
    expect(doc.views).toBe(0);
    expect(doc.name).toHaveLength(100);
    expect(doc.description).toHaveLength(500);
    expect(doc.authorName).toBe('Anonymous');
    expect(doc.category).toBe('analog');
  });

  it('translates Firebase Auth errors cleanly while suppressing benign popup dismissal', () => {
    expect(formatFirebaseAuthError({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(formatFirebaseAuthError({ code: 'auth/cancelled-popup-request' })).toBeNull();
    expect(formatFirebaseAuthError({ code: 'auth/popup-blocked' })).toMatch(/popup was blocked/i);
    expect(formatFirebaseAuthError({ code: 'auth/account-exists-with-different-credential' })).toMatch(/different sign-in provider/i);
    expect(formatFirebaseAuthError({ code: 'auth/operation-not-allowed' })).toMatch(/not yet enabled/i);
    expect(formatFirebaseAuthError({ code: 'auth/unauthorized-domain' })).toMatch(/not authorized/i);
    expect(formatFirebaseAuthError({ code: 'auth/network-request-failed' })).toMatch(/Network error/i);
  });

  it('enforces authenticated authorUid across publish/update/delete and isolates view increments', async () => {
    const authProviders = await getFirebaseAuth();
    expect(authProviders.googleProvider).toBeInstanceOf(MockGoogleAuthProvider);
    expect(authProviders.githubProvider).toBeInstanceOf(MockGithubAuthProvider);

    // Unauthenticated publish and update must fail before writing to Firestore
    await expect(
      publishCircuit({
        name: 'Bandgap Reference',
        description: 'Test',
        category: 'analog',
        authorName: 'Anon',
        componentCount: 4,
        circuitData: 'abc',
      }),
    ).rejects.toThrow(/AUTH_REQUIRED/);
    await expect(
      updateCommunityCircuit('circuit-new-1', { name: 'Edited' }),
    ).rejects.toThrow(/AUTH_REQUIRED/);
    expect(mockState.addDocCalls).toHaveLength(0);
    expect(mockState.updateDocCalls).toHaveLength(0);

    // Authenticated publish sets authoritative authorUid
    mockState.currentUser = { uid: 'uid-owner-42' };
    const createdId = await publishCircuit({
      name: 'Bandgap Reference',
      description: 'Precision voltage ref',
      category: 'analog',
      authorName: 'Sid',
      componentCount: 4,
      circuitData: 'compressed-data',
    });
    expect(createdId).toBe('circuit-new-1');
    expect(mockState.addDocCalls).toHaveLength(1);
    expect(mockState.addDocCalls[0].path).toBe('circuits');
    expect(mockState.addDocCalls[0].data.authorUid).toBe('uid-owner-42');
    expect(mockState.addDocCalls[0].data.views).toBe(0);

    // Authenticated owner update writes serverTimestamp without touching views
    await updateCommunityCircuit('circuit-new-1', { name: '  Bandgap Rev B  ' });
    expect(mockState.updateDocCalls).toHaveLength(1);
    expect(mockState.updateDocCalls[0].path).toBe('circuits/circuit-new-1');
    expect(mockState.updateDocCalls[0].data).toEqual({
      name: 'Bandgap Rev B',
      updatedAt: '__SERVER_TIME__',
    });

    // Anonymous view counter uses dedicated subcollection circuits/<id>/meta/views
    await incrementViews('circuit-new-1');
    expect(mockState.setDocCalls).toHaveLength(1);
    expect(mockState.setDocCalls[0].path).toBe('circuits/circuit-new-1/meta/views');
    expect(mockState.setDocCalls[0].opts).toEqual({ merge: true });

    // Owner delete fails when unauthenticated, succeeds when signed in
    mockState.currentUser = null;
    await expect(deleteCommunityCircuit('circuit-new-1')).rejects.toThrow(/AUTH_REQUIRED/);

    mockState.currentUser = { uid: 'uid-owner-42' };
    await deleteCommunityCircuit('circuit-new-1');
    expect(mockState.deleteDocCalls).toEqual(['circuits/circuit-new-1/meta/views', 'circuits/circuit-new-1']);
  });

  it('locks down firestore.rules for authenticated ownership, immutable view/authorUid, isolated view counter, and user quota anti-escalation', () => {
    const rules = readFileSync(resolve(FRONTEND_ROOT, 'firestore.rules'), 'utf8');

    expect(rules).toContain("rules_version = '2';");
    expect(rules).toContain('match /circuits/{circuitId}');
    expect(rules).toContain('allow read: if true;');
    expect(rules).toContain('isSignedIn()');
    expect(rules).toContain('request.resource.data.authorUid == request.auth.uid');
    expect(rules).toContain('resource.data.authorUid == request.auth.uid');
    expect(rules).toContain('next.authorUid == prev.authorUid');
    expect(rules).toContain('next.views == prev.views');
    expect(rules).toContain('allow delete: if isSignedIn()');

    // View counter subcollection isolated from parent circuit document
    expect(rules).toContain('match /meta/{docId}');
    expect(rules).toContain("docId == 'views'");
    expect(rules).toContain('request.resource.data.count == resource.data.count + 1');

    // User profile/usage collection prevents self-upgrading isPro
    expect(rules).toContain('match /users/{userId}');
    expect(rules).toContain('request.auth.uid == userId');
    expect(rules).toContain('request.resource.data.isPro == false');
  });

  it('wires AccountMenu, AuthModal (Google + GitHub), PublishModal sign-in gate, and owner delete in CircuitsPage', () => {
    const landingSrc = readFileSync(resolve(SRC_ROOT, 'pages/LandingPage.tsx'), 'utf8');
    const layoutSrc = readFileSync(resolve(SRC_ROOT, 'pages/Layout.tsx'), 'utf8');
    const simulatorSrc = readFileSync(resolve(SRC_ROOT, 'pages/Simulator.tsx'), 'utf8');
    const authModalSrc = readFileSync(resolve(SRC_ROOT, 'components/AuthModal.tsx'), 'utf8');
    const publishModalSrc = readFileSync(resolve(SRC_ROOT, 'components/PublishModal.tsx'), 'utf8');
    const circuitsSrc = readFileSync(resolve(SRC_ROOT, 'pages/CircuitsPage.tsx'), 'utf8');

    expect(landingSrc).toContain('<AccountMenu');
    expect(layoutSrc).toContain('<AccountMenu');
    expect(simulatorSrc).toContain('<AccountMenu');
    expect(authModalSrc).toContain('Continue with Google');
    expect(authModalSrc).toContain('Continue with GitHub');
    expect(publishModalSrc).toContain('Sign in required to publish');
    expect(publishModalSrc).toContain('<AuthProviderButtons');
    expect(circuitsSrc).toContain('circuit.authorUid === user.uid');
    expect(circuitsSrc).toContain('deleteCommunityCircuit');
  });
});
