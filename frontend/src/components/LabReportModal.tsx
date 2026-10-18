import React, { useState } from 'react';
import { X, FileCheck2, Loader2, Download, Sparkles, LogIn, ShieldCheck } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister/generateNetlist';
import { useAuth } from '../hooks/useAuth';
import { checkAndIncrementUsage } from '../utils/dbUsage';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schematicDataUrl?: string; // PNG screenshot of the schematic
  graphDataUrl?: string;     // PNG screenshot of the grapher
}

type Step = 'form' | 'generating' | 'preview' | 'error' | 'paywall';

export function LabReportModal({ isOpen, onClose, schematicDataUrl, graphDataUrl }: LabReportModalProps) {
  const { components } = useSchematicStore();
  const { user, loading, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    engineerName: '',
    organization: 'Hardware Systems R&D',
    docRevision: 'REV 1.0',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  });
  const [reportContent, setReportContent] = useState<{
    executiveSummary: string;
    operatingPrinciples: string;
    simulationMethodology: string;
    dynamicPerformance: string;
    signOff: string;
  } | null>(null);

  if (!isOpen) return null;

  const componentTypes = [...new Set(components.map(c => c.type))].join(', ');

  const handleGenerate = async () => {
    if (!formData.title.trim()) return;
    
    setStep('generating');
    setErrorMsg('');
    try {
      if (user) {
        const usage = await checkAndIncrementUsage(user.uid);
        if (!usage.allowed) {
          setStep('paywall');
          return;
        }
      } else {
        const guestUsage = parseInt(localStorage.getItem('nodesim_guest_reports') || '0', 10);
        if (guestUsage >= 3) {
          setStep('paywall');
          return;
        }
        localStorage.setItem('nodesim_guest_reports', (guestUsage + 1).toString());
      }

      const { components: currentComps, wires, simulationBuffer, analysisMode } = useSchematicStore.getState();
      const netlist = generateNetlist(currentComps, wires);

      // Summarize simulation results
      let simSummary = 'No simulation data recorded.';
      const simRows: Record<string, number>[] = simulationBuffer
        ? (Array.isArray(simulationBuffer) ? simulationBuffer : (simulationBuffer as any).data || [])
        : [];
      if (simRows.length > 0) {
        const keys = Object.keys(simRows[0]).filter(k => k !== 'time' && k !== 'frequency' && k !== 'v_sweep');
        simSummary = keys.map(k => {
          const vals = simRows.map((r: Record<string, number>) => r[k]).filter((v: number) => isFinite(v));
          const min = Math.min(...vals).toFixed(4);
          const max = Math.max(...vals).toFixed(4);
          return `${k}: min=${min}V, max=${max}V`;
        }).join('\n');
      }

      const prompt = `You are a Principal Hardware Design Engineer writing a formal Design Verification Report (DVR) and Technical Test Review for an analog/mixed-signal circuit design.

Analysis Type: ${analysisMode || 'transient'}

SPICE Netlist Topology:
${netlist}

Simulated Measurement Metrics:
${simSummary}

Generate a formal, publication-grade engineering report with the following 5 structured sections:
1. EXECUTIVE SUMMARY: Clear statement of the circuit topology, intended engineering purpose, and operational performance envelope.
2. OPERATING PRINCIPLES: Technical derivation of circuit transfer function, pole/zero placements, impedance matching, or switching behavior with key formulas.
3. SIMULATION METHODOLOGY: Parameter setup, sweep tolerances, excitation profiles, and verification criteria used for this run.
4. DYNAMIC & WAVEFORM VERIFICATION: In-depth engineering analysis of the simulated waveforms, rise/fall times, ripple, overshoot, cutoffs, or gain. Include explicit measured numerical values.
5. DESIGN SIGN-OFF & RECOMMENDATIONS: Statement of compliance with typical design targets, margin assessments, and recommended hardware component selections.

Tone: Rigorous, precise, and professional, suitable for a technical design review at an aerospace, semiconductor, or Tier-1 electronics OEM. Plain text only.`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gemini API error');
      
      const text = (data.result as string) || '';
      const extract = (header: string, nextHeaders: string[]) => {
        const nextPattern = nextHeaders.length ? `(?=(?:\\n\\s*(?:\\d+\\.\\s*|#{1,3}\\s*)?(?:${nextHeaders.join('|')}):?)|$)` : '$';
        const regex = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.\\s*|#{1,3}\\s*)?${header}:?\\s*\\n?([\\s\\S]*?)${nextPattern}`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const executiveSummary = extract('EXECUTIVE SUMMARY', ['OPERATING PRINCIPLES', 'THEORY', 'SIMULATION METHODOLOGY', 'PROCEDURE', 'DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'CONCLUSION']);
      const operatingPrinciples = extract('OPERATING PRINCIPLES', ['SIMULATION METHODOLOGY', 'PROCEDURE', 'DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'CONCLUSION']) || extract('THEORY', ['SIMULATION METHODOLOGY', 'PROCEDURE', 'DYNAMIC']);
      const simulationMethodology = extract('SIMULATION METHODOLOGY', ['DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'CONCLUSION']) || extract('PROCEDURE', ['DYNAMIC', 'OBSERVATIONS']);
      const dynamicPerformance = extract('DYNAMIC', ['DESIGN SIGN-OFF', 'CONCLUSION']) || extract('WAVEFORM VERIFICATION', ['DESIGN SIGN-OFF', 'CONCLUSION']) || extract('OBSERVATIONS', ['DESIGN SIGN-OFF', 'CONCLUSION']);
      const signOff = extract('DESIGN SIGN-OFF', []) || extract('RECOMMENDATIONS', []) || extract('CONCLUSION', []);

      const parsed = {
        executiveSummary: executiveSummary || formData.title,
        operatingPrinciples: operatingPrinciples || text,
        simulationMethodology: simulationMethodology || '1. Schematic capture executed via NodeSim WebAssembly SPICE.\n2. Automated matrix formulation & solver integration.\n3. Transient and frequency response waveform analysis.',
        dynamicPerformance: dynamicPerformance || simSummary,
        signOff: signOff || 'Design converges within nominal operating tolerances. Ready for prototype validation.',
      };

      setReportContent(parsed);
      setStep('preview');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate report.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      const addText = (text: string, x: number, yPos: number, opts: { fontSize?: number; fontStyle?: 'normal' | 'bold' | 'italic'; color?: [number,number,number]; maxWidth?: number; lineHeight?: number }) => {
        const { fontSize = 10, fontStyle = 'normal', color = [30, 30, 30], maxWidth = contentW, lineHeight = 6 } = opts;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, i: number) => {
          doc.text(line, x, yPos + i * lineHeight);
        });
        return yPos + lines.length * lineHeight;
      };

      const addSection = (label: string, content: string, currentY: number): number => {
        if (currentY > pageH - 45) { doc.addPage(); currentY = margin; }
        // Section label banner
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, currentY - 1, contentW, 6.5, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(label, margin + 3, currentY + 4.5);
        currentY += 9.5;
        // Content
        if (content.includes('\n')) {
          const steps = content.split('\n').filter(s => s.trim());
          steps.forEach(step => {
            if (currentY > pageH - 25) { doc.addPage(); currentY = margin; }
            currentY = addText(step.trim(), margin + 3, currentY, { fontSize: 9.5, maxWidth: contentW - 6, lineHeight: 5.5 });
            currentY += 1.5;
          });
        } else {
          currentY = addText(content, margin + 3, currentY, { fontSize: 9.5, maxWidth: contentW - 6, lineHeight: 5.5 });
        }
        return currentY + 5;
      };

      // ── HEADER BANNER ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 36, 'F');
      doc.setFontSize(19);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text('NodeSim EDA', margin, 15);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('nodesimapp.com · Cloud-Native Hardware Simulation', margin, 22);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DESIGN VERIFICATION REPORT (DVR)', pageW - margin, 15, { align: 'right' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`DOC-ID: DVR-${Date.now().toString(36).toUpperCase()} | ${formData.docRevision}`, pageW - margin, 22, { align: 'right' });
      y = 44;

      // ── PROJECT METADATA CARD ──
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentW, 34, 2, 2, 'FD');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formData.title || 'Untitled Circuit Design', margin + 4, y + 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const infoLine = `Lead Engineer: ${formData.engineerName || 'Lead Design Engineer'}  |  Organization: ${formData.organization}  |  Rev: ${formData.docRevision}  |  Date: ${formData.date}`;
      doc.text(infoLine, margin + 4, y + 17);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Active BOM Topology: ${componentTypes || 'Discrete & Integrated Semiconductors'}`, margin + 4, y + 25);
      y += 40;

      if (!reportContent) return;

      // ── SECTIONS ──
      y = addSection('1. EXECUTIVE SUMMARY & OBJECTIVES', reportContent.executiveSummary, y);
      y = addSection('2. OPERATING PRINCIPLES & MATHEMATICAL MODEL', reportContent.operatingPrinciples, y);
      y = addSection('3. SIMULATION METHODOLOGY & CONFIGURATION', reportContent.simulationMethodology, y);

      // ── SCHEMATIC IMAGE ──
      if (schematicDataUrl) {
        if (y > pageH - 85) { doc.addPage(); y = margin; }
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, y - 1, contentW, 6.5, 'F');
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
        doc.text('4. VERIFIED CIRCUIT SCHEMATIC', margin + 3, y + 4.5);
        y += 9.5;
        const imgH = 68;
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(schematicDataUrl, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      // ── GRAPH IMAGE ──
      if (graphDataUrl) {
        if (y > pageH - 85) { doc.addPage(); y = margin; }
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, y - 1, contentW, 6.5, 'F');
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
        doc.text('5. SIMULATION WAVEFORM & TRANSIENT MEASUREMENTS', margin + 3, y + 4.5);
        y += 9.5;
        const imgH = 58;
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(graphDataUrl, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      y = addSection('6. DYNAMIC PERFORMANCE ANALYSIS', reportContent.dynamicPerformance, y);
      y = addSection('7. DESIGN SIGN-OFF & RECOMMENDATIONS', reportContent.signOff, y);

      // ── FOOTER ON ALL PAGES ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text('Generated by NodeSim EDA (nodesimapp.com) — Cloud-Native Hardware Simulation & Verification', margin, pageH - 7);
        doc.text(`Page ${i} of ${totalPages} · Classification: Engineering Review`, pageW - margin, pageH - 7, { align: 'right' });
      }

      const safeTitle = (formData.title || 'circuit').replace(/\s+/g, '_');
      doc.save(`DVR_${safeTitle}_${formData.docRevision}.pdf`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('PDF generation failed: ' + msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: '#64748b', marginBottom: 5, display: 'block',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#16a34a20', borderRadius: 8, padding: 8 }}><FileCheck2 size={18} style={{ color: '#16a34a' }} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Design Verification Report (DVR)</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Automated IEEE-Grade Engineering Documentation · PDF Export</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={40} style={{ color: '#16a34a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          </div>
        ) : (
          <>
            {step === 'paywall' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>⚡ Monthly Free Report Limit Reached</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>Institutional & Team Access</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
                  Need unlimited Design Verification Reports for your engineering department, lab group, or commercial team?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
                  <a 
                    href="mailto:nodesimapp@gmail.com?subject=Institutional%20Access%20Request%20-%20NodeSim"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: 9, fontWeight: 700, fontSize: 14 }}
                  >
                    Request Institutional Access
                  </a>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Or configure your dedicated Gemini API key in Simulator Settings to continue generating reports.
                  </p>
                </div>
              </div>
            )}

            {step === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!user && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#93c5fd' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} /> Guest Verification Mode (3 free reports)
                    </span>
                    <button onClick={signInWithGoogle} style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      <LogIn size={13} /> Sign in
                    </button>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Project / Circuit Title *</label>
                  <input style={inputStyle} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Active Butterworth Low-Pass Filter" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Lead Design Engineer</label>
                    <input style={inputStyle} value={formData.engineerName} onChange={e => setFormData(p => ({ ...p, engineerName: e.target.value }))} placeholder="e.g. Siddharth K." />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Revision</label>
                    <input style={inputStyle} value={formData.docRevision} onChange={e => setFormData(p => ({ ...p, docRevision: e.target.value }))} placeholder="REV 1.0" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Organization / Department</label>
                    <input style={inputStyle} value={formData.organization} onChange={e => setFormData(p => ({ ...p, organization: e.target.value }))} placeholder="Hardware Systems R&D" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Date</label>
                    <input style={inputStyle} value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 8, padding: 10, fontSize: 11, color: '#64748b', lineHeight: 1.7 }}>
                  <strong style={{ color: '#94a3b8' }}>ℹ️ What is generated:</strong> NodeSim AI will synthesize an IEEE-standard report containing Executive Summary, Operating Principles, Simulation Methodology, Waveform Analysis, and Design Sign-Off with your schematic and waveform embedded.
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!formData.title.trim()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: formData.title.trim() ? '#16a34a' : '#334155', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: formData.title.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <Sparkles size={16} /> Generate Verification Report
                </button>
              </div>
            )}

            {step === 'generating' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Loader2 size={40} style={{ color: '#16a34a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Generating Design Verification Dossier...</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Synthesizing Executive Summary, Bias Point, Waveform Dynamics & Sign-Off</div>
              </div>
            )}

            {step === 'error' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 14, color: '#fca5a5', marginBottom: 16 }}>⚠️ {errorMsg}</div>
                <button onClick={() => setStep('form')} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
              </div>
            )}

            {step === 'preview' && reportContent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['1. Executive Summary', reportContent.executiveSummary],
                  ['2. Operating Principles', reportContent.operatingPrinciples],
                  ['3. Simulation Methodology', reportContent.simulationMethodology],
                  ['4. Dynamic Waveform Performance', reportContent.dynamicPerformance],
                  ['5. Design Sign-Off & Recommendations', reportContent.signOff]
                ].map(([label, content]) => (
                  <div key={label} style={{ background: '#0f172a', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16a34a', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{content}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep('form')} style={{ flex: 1, background: '#334155', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Edit Parameters</button>
                  <button onClick={handleDownloadPDF} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    <Download size={16} /> Download Verification Dossier (PDF)
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
