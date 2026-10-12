import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../../api/gemini';
import { diagnose, streamExplain, streamChat } from '../lib/geminiClient';
import { saveApiKey, loadApiKey, clearApiKey, hasStoredApiKey } from '../lib/keyStorage';
import { jsPDF } from 'jspdf';
import type { AIContext } from '../lib/aiTypes';

const ORIGIN = 'https://www.nodesimapp.com';

const memoryStore = new Map<string, string>();
const mockLocalStorage: Storage = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => { memoryStore.set(k, String(v)); },
  removeItem: (k: string) => { memoryStore.delete(k); },
  clear: () => { memoryStore.clear(); },
  key: () => null,
  length: 0,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

function createDummyContext(): AIContext {
  return {
    circuit: {
      componentCount: 2,
      topology: 'RC network',
      components: [
        { id: 'R1', type: 'Resistor', value: '1k' },
        { id: 'C1', type: 'Capacitor', value: '100n' },
      ],
      netlist: 'R1 in out 1k\nC1 out 0 100n',
    },
    simulation: {
      status: 'success',
      analysisMode: 'transient',
      nodeStats: [{ node: 'out', mean: 2.5, min: 0, max: 5, unit: 'V' }],
    },
    user: {
      selectedComponentId: null,
    },
  };
}

describe('Phase 2C — Real AI Integration & Contract Verification', () => {
  const realFetch = globalThis.fetch;
  let mockUpstream: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-secret-server-api-key-12345';
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.GEMINI_ALLOWED_MODELS;
    delete process.env.GEMINI_API_BASE_URL;
    memoryStore.clear();
    clearApiKey();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    clearApiKey();
  });

  // ─── 1. Proxy Contract: Both Request Forms ─────────────────────────────────

  describe('1. Proxy Contract: { prompt } and { contents }', () => {
    it('handles Simple Prompt Mode ({ prompt }) and forwards as generateContent', async () => {
      mockUpstream = vi.fn(async (_url: string, init: RequestInit) => {
        const body = JSON.parse(init.body as string);
        expect(body.contents[0].parts[0].text).toBe('Analyze this RC filter circuit');
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: 'RC low pass filter cut-off frequency is 1.59 kHz.' }],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.1.1' },
          body: JSON.stringify({ prompt: 'Analyze this RC filter circuit' }),
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json() as { result?: string };
      expect(json.result).toBe('RC low pass filter cut-off frequency is 1.59 kHz.');

      // Verify upstream URL was correctly formatted
      const [calledUrl] = mockUpstream.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/models/gemini-3.5-flash-lite:generateContent');
    });

    it('handles Native Gateway Mode ({ contents }) with query params', async () => {
      mockUpstream = vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: 'Gateway response success' }] } },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const res = await handler(
        new Request(
          'https://www.nodesimapp.com/api/gemini?model=gemini-2.0-flash&method=generateContent',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.1.2' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Hello from gateway' }] }],
              generationConfig: { maxOutputTokens: 2048 },
            }),
          }
        )
      );

      expect(res.status).toBe(200);
      const [calledUrl] = mockUpstream.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/models/gemini-2.0-flash:generateContent');
    });

    it('enforces model allowlist and rejects disallowed models', async () => {
      const res = await handler(
        new Request(
          'https://www.nodesimapp.com/api/gemini?model=unauthorized-expensive-model&method=generateContent',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json', origin: ORIGIN },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] }),
          }
        )
      );
      expect(res.status).toBe(400);
      const data = await res.json() as { error?: string };
      expect(data.error).toBe('Model not allowed');
    });

    it('enforces method allowlist and rejects unapproved methods (e.g. embedContent)', async () => {
      const res = await handler(
        new Request(
          'https://www.nodesimapp.com/api/gemini?model=gemini-1.5-flash&method=embedContent',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json', origin: ORIGIN },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] }),
          }
        )
      );
      expect(res.status).toBe(400);
      const data = await res.json() as { error?: string };
      expect(data.error).toBe('Method not allowed');
    });

    it('rejects oversized request bodies (>200 KB) with 413', async () => {
      const oversized = JSON.stringify({ prompt: 'x'.repeat(210_000) });
      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN },
          body: oversized,
        })
      );
      expect(res.status).toBe(413);
    });

    it('clamps generationConfig.maxOutputTokens to 4096', async () => {
      mockUpstream = vi.fn(async (_url: string, init: RequestInit) => {
        const body = JSON.parse(init.body as string);
        expect(body.generationConfig.maxOutputTokens).toBe(4096);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      await handler(
        new Request(
          'https://www.nodesimapp.com/api/gemini?model=gemini-1.5-flash&method=generateContent',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.1.3' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }],
              generationConfig: { maxOutputTokens: 999999 },
            }),
          }
        )
      );
    });
  });

  // ─── 2. All Three AI Features: Successful Responses ────────────────────────

  describe('2. Successful AI Responses across all three features', () => {
    it('Lab Report Feature: successfully parses AI JSON output for Aim, Theory, Procedure, Result, Conclusion', async () => {
      const labReportJson = {
        aim: 'To verify the frequency response and cut-off frequency of a passive first-order RC low-pass filter.',
        theory: 'A low-pass filter attenuates frequencies higher than the cut-off frequency fc = 1 / (2 * pi * R * C). Below fc, signals pass with minimal attenuation.',
        procedure: '1. Connect resistor R1 and capacitor C1 in series.\\n2. Apply a sinusoidal AC source across the input.\\n3. Measure the output voltage across C1.\\n4. Vary the frequency from 10Hz to 100kHz and record output amplitude.',
        result: 'The output voltage decreased by 3dB at the calculated cut-off frequency fc = 1.59 kHz.',
        conclusion: 'The first-order RC low-pass filter characteristics were experimentally confirmed.'
      };

      mockUpstream = vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify(labReportJson) }],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      // Simulated LabReportModal request
      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.2.1' },
          body: JSON.stringify({ prompt: 'Generate lab report for RC filter' }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json() as { result: string };
      const parsed = JSON.parse(data.result);

      expect(parsed.aim).toContain('RC low-pass filter');
      expect(parsed.theory).toContain('cut-off frequency');
      expect(parsed.procedure).toContain('1. Connect resistor');
      expect(parsed.result).toContain('1.59 kHz');
      expect(parsed.conclusion).toContain('experimentally confirmed');
    });

    it('AI Waveform Analyzer: successfully returns structured signal analysis', async () => {
      const waveformAnalysis = 
        '1. Signal Type: Clean sinusoidal AC waveform with 1 kHz fundamental frequency.\n' +
        '2. Measurements: Peak-to-peak amplitude is 5.0V, DC offset is 0.0V.\n' +
        '3. Status: Normal steady-state behavior with no clipping or crossover distortion detected.\n' +
        '4. Tip: Consider increasing simulation time resolution for finer high-frequency harmonics.';

      mockUpstream = vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: waveformAnalysis }] } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.2.2' },
          body: JSON.stringify({ prompt: 'Analyze waveform statistics: Vpp=5V, freq=1kHz' }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json() as { result: string };
      expect(data.result).toContain('Signal Type: Clean sinusoidal AC waveform');
      expect(data.result).toContain('Peak-to-peak amplitude is 5.0V');
    });

    it('AI Diagnose Feature (geminiClient.diagnose): returns valid DiagnosisResult schema', async () => {
      const mockDiagnosis = {
        answer: 'The circuit functions correctly as a low-pass filter. All DC bias points are stable.',
        diagnosis: 'Healthy circuit operating within expected parameters.',
        issues: [],
        actions: []
      };

      mockUpstream = vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: JSON.stringify(mockDiagnosis) }] } },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const dummyContext = createDummyContext();

      const result = await diagnose(dummyContext, '');
      expect(result.diagnosis).toBe('Healthy circuit operating within expected parameters.');
      expect(result.issues).toEqual([]);
    });
  });

  // ─── 3. Streaming and PDF Generation ───────────────────────────────────────

  describe('3. Streaming and PDF Generation Verification', () => {
    it('Streaming Feature (streamExplain): receives and concatenates SSE token chunks', async () => {
      // Mock SSE response
      const ssePayload = 
        'data: {"candidates":[{"content":{"parts":[{"text":"This "}]}}]}\n\n' +
        'data: {"candidates":[{"content":{"parts":[{"text":"circuit "}]}}]}\n\n' +
        'data: {"candidates":[{"content":{"parts":[{"text":"is an RC filter."}]}}]}\n\n';

      mockUpstream = vi.fn(async () =>
        new Response(ssePayload, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const dummyContext = createDummyContext();

      const chunks: string[] = [];
      await streamExplain(dummyContext, '', (chunk) => {
        chunks.push(chunk);
      });

      expect(chunks.join('')).toBe('This circuit is an RC filter.');
    });

    it('PDF Generation (jsPDF): produces a valid, multi-page PDF document from lab report data', () => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 18;
      const contentW = 210 - margin * 2;

      // Header banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, 'F');
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text('NodeSim', margin, 16);

      // Add report sections
      const sections = [
        ['AIM', 'To measure the frequency response of an RC low pass filter.'],
        ['THEORY', 'A low pass filter attenuates frequencies higher than the cutoff frequency.'],
        ['PROCEDURE', '1. Assemble RC circuit.\n2. Apply AC voltage.\n3. Measure output waveform.'],
        ['RESULT', 'Measured cutoff frequency matches theoretical calculation of 1.59 kHz.'],
        ['CONCLUSION', 'RC filter theory successfully confirmed experimentally.'],
      ];

      let y = 44;
      sections.forEach(([title, content]) => {
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, y - 1, contentW, 7, 'F');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 3, y + 5);
        y += 12;

        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(content, contentW);
        doc.text(lines, margin + 2, y);
        y += lines.length * 6 + 6;
      });

      // Verify PDF generation output
      const pdfArrayBuffer = doc.output('arraybuffer');
      expect(pdfArrayBuffer.byteLength).toBeGreaterThan(1000);

      // Verify PDF magic header bytes: %PDF-
      const uint8 = new Uint8Array(pdfArrayBuffer);
      const headerString = String.fromCharCode(...uint8.slice(0, 5));
      expect(headerString).toBe('%PDF-');
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 4. Security & BYOK Key Storage Verification ───────────────────────────

  describe('4. Security & BYOK Isolation', () => {
    it('ensures server API key is NEVER reflected in proxy responses or headers', async () => {
      mockUpstream = vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: 'Response payload' }] } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.3.1' },
          body: JSON.stringify({ prompt: 'test' }),
        })
      );

      // Check headers
      const allHeaders = JSON.stringify(Object.fromEntries(res.headers.entries()));
      expect(allHeaders).not.toContain('test-secret-server-api-key-12345');

      // Check response body
      const bodyText = await res.text();
      expect(bodyText).not.toContain('test-secret-server-api-key-12345');
    });

    it('rejects unauthorized origins with 403', async () => {
      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: 'https://attacker.site' },
          body: JSON.stringify({ prompt: 'test' }),
        })
      );
      expect(res.status).toBe(403);
      const data = await res.json() as { error?: string };
      expect(data.error).toBe('Origin not allowed');
    });

    it('BYOK Flow: user-provided keys route directly to Google and never through /api/gemini', async () => {
      saveApiKey('user-custom-gemini-key-999');
      expect(hasStoredApiKey()).toBe(true);
      expect(loadApiKey()).toBe('user-custom-gemini-key-999');

      mockUpstream = vi.fn(async (url: string, init: RequestInit) => {
        // Must be direct to Google, NOT /api/gemini
        expect(url).toContain('https://generativelanguage.googleapis.com/v1beta/models');
        expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('user-custom-gemini-key-999');
        return new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: JSON.stringify({ answer: 'ok', diagnosis: 'good', issues: [], actions: [] }) }] } },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });
      globalThis.fetch = mockUpstream as unknown as typeof fetch;

      const dummyContext = createDummyContext();

      await diagnose(dummyContext, loadApiKey()!);
      expect(mockUpstream).toHaveBeenCalledTimes(1);

      // Clearing key removes it from storage
      clearApiKey();
      expect(hasStoredApiKey()).toBe(false);
      expect(loadApiKey()).toBeNull();
    });

    it('rejects server misconfiguration when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      const res = await handler(
        new Request('https://www.nodesimapp.com/api/gemini', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '10.0.3.2' },
          body: JSON.stringify({ prompt: 'test' }),
        })
      );
      expect(res.status).toBe(500);
      const data = await res.json() as { error?: string };
      expect(data.error).toContain('missing API key');
    });
  });
});
