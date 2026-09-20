// AiExplainerPanel.tsx  — AI Circuit Debugger (rebuilt)
// Mode 1: Auto-diagnose (structured JSON from Gemini 2.0-flash)
// Mode 2: Chat (multi-turn, circuit-aware, Gemini 1.5-flash streaming)
// Mode 3: Explain (original explain flow, now via geminiClient)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Key, Loader2, AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Search, MessageCircle, Zap, Send, Trash2 } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import { buildAIContext } from '../lib/aiContext';
import { diagnose, streamExplain, streamChat } from '../lib/geminiClient';
import { saveApiKey, loadApiKey, clearApiKey } from '../lib/secureKeyStorage';
import { track } from '@vercel/analytics';
import type { DiagnosisResult, ChatMessage, DiagnosticIssue } from '../lib/aiTypes';

// ─── Mini markdown renderer (unchanged from before) ────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} style={{ margin: '14px 0 4px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={i} style={{ margin: '16px 0 6px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      nodes.push(<h1 key={i} style={{ margin: '16px 0 8px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(<li key={i} style={{ marginLeft: 16, marginBottom: 2, color: '#374151', lineHeight: 1.6 }}>{renderInline(line.slice(2))}</li>);
    } else if (line.trim() === '') {
      nodes.push(<br key={i} />);
    } else {
      nodes.push(<p key={i} style={{ margin: '2px 0', lineHeight: 1.6, color: '#374151' }}>{renderInline(line)}</p>);
    }
    i++;
  }
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: 11, color: '#7c3aed' }}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// ─── Severity styling ────────────────────────────────────────────────────────

const SEV_STYLE = {
  critical: { bg: '#fff1f2', border: '#fecdd3', icon: '🔴', text: '#be123c' },
  warning:  { bg: '#fffbeb', border: '#fde68a', icon: '🟠', text: '#92400e' },
  info:     { bg: '#f0f9ff', border: '#bae6fd', icon: '🔵', text: '#0369a1' },
};

// ─── Issue card ──────────────────────────────────────────────────────────────

function IssueCard({ issue, onHighlight, onShowWaveform }: {
  issue: DiagnosticIssue;
  onHighlight: (ids: string[]) => void;
  onShowWaveform: (node: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEV_STYLE[issue.severity];
  return (
    <div style={{ background: sev.bg, border: '1px solid ' + sev.border, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div
        style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 14 }}>{sev.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: sev.text }}>{issue.title}</div>
            {issue.components.length > 0 && (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                {issue.components.join(', ')}
              </div>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
      </div>
      {expanded && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid ' + sev.border }}>
          <p style={{ fontSize: 12, color: '#374151', margin: '8px 0', lineHeight: 1.5 }}>{issue.description}</p>
          {issue.evidence.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px', marginBottom: 8 }}>
              {issue.evidence.map((e, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569', lineHeight: 1.8 }}>
                  {e.node} {e.metric} = <strong>{typeof e.value === 'number' ? e.value.toExponential(3) : e.value}</strong>
                  {e.expected ? <span style={{ color: '#9ca3af' }}> (expected {e.expected})</span> : null}
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: 11, color: sev.text, background: 'white', padding: '6px 8px', borderRadius: 6, margin: '0 0 8px', border: '1px solid ' + sev.border, lineHeight: 1.5 }}>
            💡 {issue.suggestion}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {issue.components.length > 0 && (
              <button
                onClick={() => onHighlight(issue.components)}
                style={{ fontSize: 11, padding: '4px 10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}
              >
                Highlight on canvas
              </button>
            )}
            {issue.nodes.length > 0 && (
              <button
                onClick={() => onShowWaveform(issue.nodes[0])}
                style={{ fontSize: 11, padding: '4px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}
              >
                Show waveform
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Mode = 'diagnose' | 'chat' | 'explain';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFocusNode?: (node: string) => void;
}

export default function AiExplainerPanel({ isOpen, onClose, onFocusNode }: Props) {
  const store = useSchematicStore();
  const {
    components, wires, probes, analysisMode,
    simulationData, opData, simulationError, selectedComponentId,
    setHighlightedComponentIds, setAiDiagnosis, aiDiagnosis,
  } = store;

  const [apiKey, setApiKeyState] = useState(() => loadApiKey() || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [mode, setMode] = useState<Mode>('diagnose');

  const [isRateLimited, setIsRateLimited] = useState(false);

  // Diagnose state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnoseError, setDiagnoseError] = useState('');

  // Explain state
  const [explainText, setExplainText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState('');
  const [copied, setCopied] = useState(false);
  const explainAbortRef = useRef<AbortController | null>(null);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const saveKey = (key: string) => { setApiKeyState(key); saveApiKey(key); setShowKeyInput(false); setIsRateLimited(false); };

  const { customModels, customModelPorts } = store;

  const buildContext = useCallback((question?: string) =>
    buildAIContext({
      components, wires, probes, analysisMode,
      simulationData: simulationData as Record<string, number>[] | null,
      opData, simulationError, selectedComponentId,
      activeQuestion: question,
      customModels,
      customModelPorts,
    }),
    [components, wires, probes, analysisMode, simulationData, opData, simulationError, selectedComponentId, customModels, customModelPorts]
  );

  // ── Handle Diagnose ────────────────────────────────────────────────────────
  const handleDiagnose = async () => {
    if (components.length === 0) { setDiagnoseError('Place some components first.'); return; }
    setIsDiagnosing(true); setDiagnoseError(''); setAiDiagnosis(null);
    track('AI_Diagnose_Run', { componentCount: components.length, mode: analysisMode });
    try {
      const ctx = buildContext();
      const result = await diagnose(ctx, apiKey);
      setAiDiagnosis(result);
      track('AI_Diagnose_Success', { issueCount: result.issues.length });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Diagnosis failed.';
      if (msg.includes('Rate limit exceeded')) {
        setIsRateLimited(true);
        setDiagnoseError('Daily free limit reached. Add your own Gemini API key for unlimited access.');
      } else {
        setDiagnoseError(msg);
      }
      track('AI_Diagnose_Error', { error: msg.substring(0, 80) });
    } finally {
      setIsDiagnosing(false);
    }
  };

  // ── Handle Explain ─────────────────────────────────────────────────────────
  const handleExplain = async () => {
    if (components.length === 0) { setExplainError('Place some components first.'); return; }
    explainAbortRef.current?.abort();
    explainAbortRef.current = new AbortController();
    setIsExplaining(true); setExplainText(''); setExplainError('');
    track('AI_Explain_Run', { mode: analysisMode });
    try {
      const ctx = buildContext();
      await streamExplain(ctx, apiKey, chunk => setExplainText(t => t + chunk), explainAbortRef.current.signal);
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        const msg = (e as Error).message || 'Explain failed.';
        if (msg.includes('Rate limit exceeded')) {
          setIsRateLimited(true);
          setExplainError('Daily free limit reached. Add your own Gemini API key for unlimited access.');
        } else {
          setExplainError(msg);
        }
      }
    } finally {
      setIsExplaining(false);
    }
  };

  // ── Handle Chat ────────────────────────────────────────────────────────────
  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || isChatting) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: Date.now() };
    const assistantId = (Date.now() + 1).toString();
    setChatHistory(h => [...h, userMsg, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }]);
    setChatInput('');
    setIsChatting(true);
    chatAbortRef.current?.abort();
    chatAbortRef.current = new AbortController();
    track('AI_Chat_Message', { mode: analysisMode });
    try {
      const ctx = buildContext(msg);
      let accumulated = '';
      await streamChat(ctx, chatHistory, msg, apiKey, chunk => {
        accumulated += chunk;
        setChatHistory(h => h.map(m => m.id === assistantId ? { ...m, content: accumulated } : m));
      }, chatAbortRef.current.signal);
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        const errMsg = (e as Error).message || 'Chat failed.';
        if (errMsg.includes('Rate limit exceeded')) {
          setIsRateLimited(true);
          setChatHistory(h => h.map(m => m.id === assistantId ? { ...m, content: '⚠️ Daily free limit reached. Add your own Gemini API key for unlimited access.' } : m));
        } else {
          setChatHistory(h => h.map(m => m.id === assistantId ? { ...m, content: '⚠️ ' + errMsg } : m));
        }
      }
    } finally {
      setIsChatting(false);
    }
  };

  // ── Highlight / waveform actions ────────────────────────────────────────────
  const handleHighlight = (ids: string[]) => {
    setHighlightedComponentIds(ids);
    setTimeout(() => setHighlightedComponentIds([]), 4000); // auto-clear after 4s
  };
  const handleShowWaveform = (node: string) => { onFocusNode?.(node); };

  if (!isOpen) return null;

  const hasSimData = (simulationData && simulationData.length > 0) || (opData && opData.length > 0);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: Math.min(400, window.innerWidth - 16),
      background: '#fff', borderLeft: '1px solid #e2e8f0',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column', zIndex: 200,
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
      maxWidth: '100vw', boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
            <Sparkles size={18} /> AI Circuit Debugger
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
            <X size={18} />
          </button>
        </div>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {([['diagnose', '🔍 Diagnose'], ['chat', '💬 Chat'], ['explain', '📖 Explain']] as [Mode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '5px 0', fontSize: 11, fontWeight: mode === m ? 700 : 400,
              background: mode === m ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: mode === m ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
              borderRadius: 6, color: '#fff', cursor: 'pointer', transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div style={{ padding: '6px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: 11, color: '#92400e' }}>
        🔒 Netlist sent to Google Gemini. API key stays local — never reaches NodeSim servers.
      </div>

      {/* API Key Row */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
        {showKeyInput ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="password" placeholder="Paste your Gemini API key..." defaultValue={apiKey}
              id="gemini-api-key-input" autoFocus
              onKeyDown={e => { if (e.key === 'Enter') saveKey((e.target as HTMLInputElement).value); }}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }}
            />
            <button onClick={() => saveKey((document.getElementById('gemini-api-key-input') as HTMLInputElement)?.value || '')}
              style={{ padding: '6px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Save
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {apiKey ? (
              <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Key size={12} /> Using your own API key (unlimited)
              </span>
            ) : isRateLimited ? (
              <span style={{ fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} /> Daily free limit reached
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> 10 free AI diagnoses/day — no setup needed
              </span>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {apiKey && <button onClick={() => { clearApiKey(); setApiKeyState(''); setIsRateLimited(false); }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>}
              <button onClick={() => setShowKeyInput(true)} style={{ fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                {apiKey ? 'Change' : 'Set key'}
              </button>
            </div>
          </div>
        )}
        {!apiKey && <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>aistudio.google.com</a></p>}
      </div>

      {/* ── DIAGNOSE MODE ─────────────────────────────────────────────────── */}
      {mode === 'diagnose' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={handleDiagnose} disabled={isDiagnosing}
              style={{
                width: '100%', padding: '11px 16px',
                background: isDiagnosing ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                color: isDiagnosing ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: 8, cursor: isDiagnosing ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {isDiagnosing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
              {isDiagnosing ? 'Analyzing circuit…' : '🔍 Diagnose Circuit'}
            </button>
            {!hasSimData && !isDiagnosing && (
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0', textAlign: 'center' }}>
                Tip: Run simulation first for richer diagnosis
              </p>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {diagnoseError && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8 }}>
                <AlertTriangle size={14} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: '#c2410c' }}>{diagnoseError}</span>
              </div>
            )}

            {!aiDiagnosis && !isDiagnosing && !diagnoseError && (
              <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 40 }}>
                <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
                <p style={{ fontSize: 13, margin: 0 }}>Click "Diagnose Circuit"</p>
                <p style={{ fontSize: 11, marginTop: 8, opacity: 0.7, lineHeight: 1.5 }}>
                  NodeSim will automatically find issues<br />and highlight affected components.
                </p>
              </div>
            )}

            {aiDiagnosis && (
              <>
                {/* Summary */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.5 }}>
                    <strong>Summary:</strong> {aiDiagnosis.diagnosis}
                  </p>
                </div>

                {/* Issues */}
                {aiDiagnosis.issues.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#16a34a', padding: '20px 0' }}>
                    <span style={{ fontSize: 28 }}>✅</span>
                    <p style={{ margin: '8px 0 0', fontWeight: 700 }}>No issues detected</p>
                    <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{aiDiagnosis.answer}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
                      {aiDiagnosis.issues.length} issue{aiDiagnosis.issues.length > 1 ? 's' : ''} found
                    </div>
                    {aiDiagnosis.issues.map((issue: import('../lib/aiTypes').DiagnosticIssue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onHighlight={handleHighlight}
                        onShowWaveform={handleShowWaveform}
                      />
                    ))}
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{renderMarkdown(aiDiagnosis.answer)}</p>
                    </div>
                  </>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                  <button onClick={handleDiagnose}
                    style={{ flex: 1, padding: '7px', fontSize: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#374151' }}>
                    Re-diagnose
                  </button>
                  <button onClick={() => setAiDiagnosis(null)}
                    style={{ padding: '7px 10px', fontSize: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#374151' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CHAT MODE ─────────────────────────────────────────────────────── */}
      {mode === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Message list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 40 }}>
                <MessageCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
                <p style={{ fontSize: 13, margin: 0 }}>Ask anything about your circuit</p>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Why is my output clipping?', 'What is the gain of this amplifier?', 'How do I add a bypass capacitor?'].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }}
                      style={{ fontSize: 11, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', color: '#475569', textAlign: 'left' }}>
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map(msg => (
              <div key={msg.id} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '88%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? '#7c3aed' : '#f1f5f9',
                  color: msg.role === 'user' ? '#fff' : '#374151',
                  fontSize: 12, lineHeight: 1.6,
                }}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.content || '…') : msg.content}
                </div>
              </div>
            ))}
            {isChatting && chatHistory[chatHistory.length - 1]?.role === 'assistant' && chatHistory[chatHistory.length - 1]?.content === '' && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, background: '#7c3aed', borderRadius: '50%', animation: 'bounce 1.2s ease-in-out ' + (i * 0.2) + 's infinite' }} />)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          {chatHistory.length > 0 && (
            <div style={{ padding: '4px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setChatHistory([])} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Trash2 size={12} /> Clear chat
              </button>
            </div>
          )}
          <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
              placeholder="Ask about your circuit… (Enter to send)"
              rows={2}
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <button onClick={handleSendChat} disabled={isChatting || !chatInput.trim()}
              style={{ padding: '0 14px', background: isChatting || !chatInput.trim() ? '#e2e8f0' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: isChatting || !chatInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── EXPLAIN MODE ──────────────────────────────────────────────────── */}
      {mode === 'explain' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={handleExplain} disabled={isExplaining}
              style={{
                width: '100%', padding: '11px 16px',
                background: isExplaining ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                color: isExplaining ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: 8, cursor: isExplaining ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {isExplaining ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
              {isExplaining ? 'Explaining circuit…' : '📖 Explain this circuit'}
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {explainError && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8 }}>
                <AlertTriangle size={14} color="#f97316" />
                <span style={{ fontSize: 12, color: '#c2410c' }}>{explainError}</span>
              </div>
            )}
            {!explainText && !isExplaining && (
              <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 40 }}>
                <Sparkles size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
                <p style={{ fontSize: 13, margin: 0 }}>Draw a circuit and click "Explain"</p>
              </div>
            )}
            {explainText && <div style={{ fontSize: 12.5 }}>{renderMarkdown(explainText)}{isExplaining && <span style={{ display: 'inline-block', width: 8, height: 14, background: '#7c3aed', borderRadius: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom', marginLeft: 2 }} />}</div>}
          </div>
          {explainText && !isExplaining && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => { navigator.clipboard.writeText(explainText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {copied ? <><Check size={14} color="#16a34a" /> Copied!</> : <><Copy size={14} /> Copy explanation</>}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}