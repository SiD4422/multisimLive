import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Key, ChevronRight, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister';

const LS_KEY = 'multisimlab_gemini_key';

const SYSTEM_PROMPT = `You are an expert electronics tutor helping engineering students understand circuit behavior.
When given a SPICE netlist, you analyze it and respond in a clear, educational, and engaging way.
Use markdown formatting. Keep explanations practical and student-friendly.`;

function buildPrompt(netlist: string, analysisMode: string, hasResults: boolean, simSnapshot: string): string {
  return `Analyze this circuit SPICE netlist and provide:

1. **What this circuit does** — explain in plain language, as if teaching a first-year EE student
2. **Key components and their roles** — what each major part contributes
3. **How it works** — the operating principle (DC bias, signal flow, feedback, etc.)
${hasResults
  ? `4. **Simulation results interpretation** — the circuit was already simulated (${analysisMode.toUpperCase()}). Here are the last-timestep node voltages:
${simSnapshot}
Interpret what these values tell us about the circuit’s operating point.
5. **Potential issues or improvements** — common mistakes or optimization tips`
  : `4. **What to expect** — what waveform or result a ${analysisMode} simulation should show
5. **Potential issues** — common pitfalls to watch for`}

SPICE Netlist:
\`\`\`spice
${netlist}
\`\`\`

Analysis type: ${analysisMode.toUpperCase()}

Be concise but thorough. Use bullet points where helpful. If you spot any SPICE errors in the netlist, point them out.`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AiExplainerPanel({ isOpen, onClose }: Props) {
  const { components, wires, probes, analysisMode, acSettings, dcSettings, transientSettings, simulationBuffer } = useSchematicStore();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const saveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(LS_KEY, key);
    setShowKeyInput(false);
  };

  const handleExplain = async () => {
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      return;
    }
    if (components.length === 0) {
      setError('Place some components on the schematic first!');
      return;
    }

    setError('');
    setResponse('');
    setIsLoading(true);

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const netlist = generateNetlist(components as any, wires as any, probes as any);

      // Build a snapshot of last-timestep node voltages for context
      let simSnapshot = 'No simulation run yet.';
      const hasResults = !!(simulationBuffer && simulationBuffer.length > 0);
      if (hasResults && simulationBuffer) {
        const lastRow = simulationBuffer[simulationBuffer.length - 1];
        const voltageLines = Object.entries(lastRow)
          .filter(([k]) => k.startsWith('v(') || k.startsWith('V('))
          .map(([k, v]) => `  ${k} = ${(v as number).toPrecision(5)} V`)
          .join('\n');
        const timeStr = lastRow.time !== undefined ? `t = ${(lastRow.time as number).toExponential(3)} s\n` : '';
        simSnapshot = timeStr + (voltageLines || '  (no voltage data)');
      }

      const prompt = buildPrompt(netlist, analysisMode, hasResults, simSnapshot);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey.trim()}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (text) setResponse(prev => prev + text);
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Failed to connect to Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown renderer (bold, italic, code, bullet lists, headers)
  function renderMarkdown(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} style={{ margin: '12px 0 4px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} style={{ margin: '14px 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} style={{ margin: '16px 0 6px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{line.slice(2)}</h1>;
      if (line.startsWith('```')) return <div key={i} style={{ height: 2 }} />;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 6, margin: '2px 0', paddingLeft: 8 }}>
            <span style={{ color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
      }
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return <p key={i} style={{ margin: '8px 0 2px', fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{line.slice(2, -2)}</p>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ margin: '2px 0', lineHeight: 1.6 }}>{renderInline(line)}</p>;
    });
  }

  function renderInline(text: string): React.ReactNode {
    // Bold: **text**, code: `text`, italic: *text*
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: 11, color: '#7c3aed' }}>{part.slice(1, -1)}</code>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
      background: '#fff', borderLeft: '1px solid #e2e8f0',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column', zIndex: 200,
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
            <Sparkles size={18} />
            AI Circuit Explainer
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.8, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 11, opacity: 0.85, margin: 0 }}>Powered by Gemini 1.5 Flash · Your API key stays local</p>
      </div>

      {/* Security + Privacy disclosure */}
      <div style={{ padding: '8px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
        ⚠️ Your <strong>circuit netlist is sent to Google Gemini</strong> for analysis. API key is stored in browser localStorage — visible in DevTools. <strong>Don’t use on shared computers.</strong>
      </div>

      {/* API Key Section */}
      <div style={{ padding: '10px 16px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
        {showKeyInput ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="password"
              placeholder="Paste your Gemini API key..."
              defaultValue={apiKey}
              onKeyDown={(e) => { if (e.key === 'Enter') saveKey((e.target as HTMLInputElement).value); }}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }}
              autoFocus
              id="gemini-api-key-input"
            />
            <button
              onClick={() => saveKey((document.getElementById('gemini-api-key-input') as HTMLInputElement)?.value || '')}
              style={{ padding: '6px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >Save</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: apiKey ? '#16a34a' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Key size={12} />
              {apiKey ? 'API key saved ✓' : 'No API key set'}
            </span>
            <button
              onClick={() => setShowKeyInput(true)}
              style={{ fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {apiKey ? 'Change key' : 'Set key'}
            </button>
          </div>
        )}
        {!apiKey && (
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
            Get a free key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>
              aistudio.google.com
            </a>
          </p>
        )}
      </div>

      {/* Explain button */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          onClick={handleExplain}
          disabled={isLoading}
          style={{
            width: '100%', padding: '10px 16px',
            background: isLoading ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
            color: isLoading ? '#9ca3af' : '#fff',
            border: 'none', borderRadius: 8, cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s',
          }}
        >
          {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
          {isLoading ? 'Analyzing circuit...' : '✨ Explain this circuit'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '8px 16px', padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={14} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#c2410c' }}>{error}</span>
        </div>
      )}

      {/* Response Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', color: '#374151', lineHeight: 1.6 }}>
        {!response && !isLoading && !error && (
          <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 40 }}>
            <Sparkles size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 13, margin: 0 }}>Draw a circuit and click<br />"Explain this circuit"</p>
            <p style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>
              Gemini will analyze your schematic and explain<br />how it works in plain language.
            </p>
          </div>
        )}
        {response && (
          <div style={{ fontSize: 12.5 }}>
            {renderMarkdown(response)}
            {isLoading && <span style={{ display: 'inline-block', width: 8, height: 14, background: '#7c3aed', borderRadius: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom', marginLeft: 2 }} />}
          </div>
        )}
      </div>

      {/* Copy button */}
      {response && !isLoading && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={handleCopy}
            style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {copied ? <><Check size={14} color="#16a34a" /> Copied!</> : <><Copy size={14} /> Copy explanation</>}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
