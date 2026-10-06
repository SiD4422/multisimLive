import React, { useState } from 'react';
import { X, FileText, Loader2, Download, Sparkles, LogIn } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
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
    studentName: '',
    rollNo: '',
    subject: 'Electronics Lab',
    date: new Date().toLocaleDateString('en-IN'),
  });
  const [reportContent, setReportContent] = useState<{
    aim: string;
    theory: string;
    procedure: string;
    result: string;
    conclusion: string;
  } | null>(null);

  if (!isOpen) return null;

  const componentTypes = [...new Set(components.map(c => c.type))].join(', ');

  const handleGenerate = async () => {
    if (!formData.title.trim()) return;
    if (!user) return;
    
    setStep('generating');
    setErrorMsg('');
    try {
      const usage = await checkAndIncrementUsage(user.uid);
      if (!usage.allowed) {
        setStep('paywall');
        return;
      }

      const prompt = `You are a professional electronics lab report writer for undergraduate engineering students.

Generate a complete, formal lab report for the following circuit simulation experiment.
Circuit components used: ${componentTypes || 'basic electronic components'}
Experiment Title: ${formData.title}
Subject: ${formData.subject}

Respond with ONLY a valid JSON object (no markdown, no code blocks) with exactly these keys:
{
  "aim": "One sentence describing the objective of the experiment.",
  "theory": "3-4 sentences explaining the circuit theory, how it works, key formulas if any.",
  "procedure": "Step by step numbered procedure (as a single string with steps separated by \\n). Include simulation steps specific to browser-based SPICE simulation.",
  "result": "2-3 sentences describing the expected simulation result and waveform observations.",
  "conclusion": "2-3 sentences concluding what was verified and what was learned."
}

Keep language formal but easy to understand for a 2nd or 3rd year engineering student.`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gemini API error');
      
      // Parse JSON from result
      let parsed;
      try {
        // Strip possible markdown code fences
        const cleaned = (data.result as string).replace(/```json\n?|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error('Could not parse AI response. Please try again.');
      }
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
      // Dynamic import to avoid SSR issues
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      const addText = (text: string, x: number, yPos: number, opts: { fontSize?: number; fontStyle?: 'normal' | 'bold' | 'italic'; color?: [number,number,number]; maxWidth?: number; lineHeight?: number }) => {
        const { fontSize = 11, fontStyle = 'normal', color = [30, 30, 30], maxWidth = contentW, lineHeight = 7 } = opts;
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
        if (currentY > pageH - 40) { doc.addPage(); currentY = margin; }
        // Section label
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, currentY - 1, contentW, 7, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(label, margin + 3, currentY + 5);
        currentY += 10;
        // Content
        if (content.includes('\\n') || content.includes('\n')) {
          const steps = content.split(/\\n|\n/).filter(s => s.trim());
          steps.forEach(step => {
            if (currentY > pageH - 20) { doc.addPage(); currentY = margin; }
            currentY = addText(step.trim(), margin + 4, currentY, { fontSize: 10, maxWidth: contentW - 8, lineHeight: 6 });
            currentY += 2;
          });
        } else {
          currentY = addText(content, margin + 4, currentY, { fontSize: 10, maxWidth: contentW - 8, lineHeight: 6 });
        }
        return currentY + 6;
      };

      // ── HEADER ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 36, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text('NodeSim', margin, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('nodesimapp.com', margin, 23);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('LABORATORY EXPERIMENT REPORT', pageW - margin, 16, { align: 'right' });
      y = 44;

      // ── EXPERIMENT INFO TABLE ──
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin, y, contentW, 36, 3, 3, 'FD');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formData.title, margin + 4, y + 9);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const infoLine = `Student: ${formData.studentName}  |  Roll No: ${formData.rollNo}  |  Subject: ${formData.subject}  |  Date: ${formData.date}`;
      doc.text(infoLine, margin + 4, y + 18);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Components used: ${componentTypes || 'Electronic Components'}`, margin + 4, y + 27);
      y += 42;

      if (!reportContent) return;

      // ── SECTIONS ──
      y = addSection('AIM', reportContent.aim, y);
      y = addSection('THEORY', reportContent.theory, y);
      y = addSection('PROCEDURE', reportContent.procedure, y);

      // ── SCHEMATIC IMAGE ──
      if (schematicDataUrl) {
        if (y > pageH - 80) { doc.addPage(); y = margin; }
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, y - 1, contentW, 7, 'F');
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
        doc.text('CIRCUIT SCHEMATIC', margin + 3, y + 5);
        y += 10;
        const imgH = 70;
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(schematicDataUrl, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      // ── GRAPH IMAGE ──
      if (graphDataUrl) {
        if (y > pageH - 80) { doc.addPage(); y = margin; }
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, y - 1, contentW, 7, 'F');
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
        doc.text('SIMULATION WAVEFORM / OUTPUT GRAPH', margin + 3, y + 5);
        y += 10;
        const imgH = 60;
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(graphDataUrl, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      y = addSection('RESULT', reportContent.result, y);
      y = addSection('CONCLUSION', reportContent.conclusion, y);

      // ── FOOTER ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(156, 163, 175);
        doc.text('Generated instantly by NodeSim (nodesimapp.com) — Free Browser-Based SPICE Simulator', margin, pageH - 7);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' });
      }

      doc.save(`Lab_Report_${formData.title.replace(/\s+/g, '_')}.pdf`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('PDF download failed: ' + msg);
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
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#16a34a20', borderRadius: 8, padding: 8 }}><FileText size={18} style={{ color: '#16a34a' }} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>AI Lab Record Generator</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Powered by Gemini · Exports as PDF</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={40} style={{ color: '#16a34a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          </div>
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Generate AI Lab Reports</div>
            <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
              Sign in to automatically generate comprehensive PDF lab records for your circuits. You get 3 free reports per month.
            </div>
            <button
              onClick={signInWithGoogle}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              <LogIn size={18} /> Sign in with Google
            </button>
          </div>
        ) : (
          <>
            {step === 'paywall' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>⚡ Free monthly limit reached (3/3 used)</span>
                </div>
                <div style={{ fontSize: 26, marginBottom: 10 }}>☕</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>You've used your 3 free reports</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>NodeSim is built by a solo student. If it helped you, consider supporting it to keep AI features running!</div>
                <a href="upi://pay?pa=spartensid12@oksbi&pn=NodeSim&cu=INR"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: 9, fontWeight: 700, fontSize: 14, marginBottom: 10 }}
                >☕ Support via UPI (any amount)</a>
                <div style={{ fontSize: 11, color: '#475569' }}>Your 3 free reports reset on the 1st of next month.</div>
              </div>
            )}

            {step === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Experiment Title *</label>
                  <input style={inputStyle} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. RC Low Pass Filter Frequency Response" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Student Name</label>
                    <input style={inputStyle} value={formData.studentName} onChange={e => setFormData(p => ({ ...p, studentName: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Roll No.</label>
                    <input style={inputStyle} value={formData.rollNo} onChange={e => setFormData(p => ({ ...p, rollNo: e.target.value }))} placeholder="RA2211" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Subject</label>
                    <input style={inputStyle} value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder="Electronics Lab" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Date</label>
                    <input style={inputStyle} value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 8, padding: 10, fontSize: 11, color: '#64748b', lineHeight: 1.7 }}>
                  <strong style={{ color: '#94a3b8' }}>ℹ️ What happens next:</strong> Gemini AI will write the Aim, Theory, Procedure, Result, and Conclusion sections based on your circuit. Your schematic and simulation graph will be embedded in the PDF automatically.
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!formData.title.trim()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: formData.title.trim() ? '#16a34a' : '#334155', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: formData.title.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <Sparkles size={16} /> Generate Lab Report with AI
                </button>
              </div>
            )}

            {step === 'generating' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Loader2 size={40} style={{ color: '#16a34a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Gemini is writing your lab report...</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Generating Aim, Theory, Procedure, Result & Conclusion</div>
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
                {([['Aim', reportContent.aim], ['Theory', reportContent.theory], ['Procedure', reportContent.procedure], ['Result', reportContent.result], ['Conclusion', reportContent.conclusion]] as [string, string][]).map(([label, content]) => (
                  <div key={label} style={{ background: '#0f172a', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16a34a', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{content}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep('form')} style={{ flex: 1, background: '#334155', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Regenerate</button>
                  <button onClick={handleDownloadPDF} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    <Download size={16} /> Download PDF
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
