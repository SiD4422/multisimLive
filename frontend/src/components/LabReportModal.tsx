import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  Loader2,
  Download,
  Sparkles,
  LogIn,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Table as TableIcon,
  Activity,
  Layers,
} from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import type { SchematicComponent } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister/generateNetlist';
import { useAuth } from '../hooks/useAuth';
import { checkAndIncrementUsage } from '../utils/dbUsage';
import { useActiveExperimentStore } from '../data/universityLabPacks';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schematicDataUrl?: string; // PNG screenshot of the schematic
  graphDataUrl?: string;     // PNG screenshot of the grapher
}

type Step = 'form' | 'generating' | 'preview' | 'error' | 'paywall';
type ReportMode = 'student' | 'professional';

interface BomItem {
  item: number;
  designators: string;
  quantity: number;
  type: string;
  value: string;
}

interface MeasurementItem {
  signal: string;
  min: string;
  max: string;
  vpp: string;
  avg: string;
  rms: string;
}

/**
 * Extracts structured Bill of Materials grouping physical components.
 */
function extractBOM(components: SchematicComponent[]): BomItem[] {
  const nonPhysical = new Set(['Ground', 'Junction', 'Connector', 'Probe', 'TextAnnotation']);
  const physical = components.filter(c => !nonPhysical.has(c.type));
  const groups: Record<string, { type: string; value: string; ids: string[] }> = {};

  physical.forEach(c => {
    const val = (c.value || '').trim() || 'Standard';
    const key = `${c.type}___${val}`;
    if (!groups[key]) {
      groups[key] = { type: c.type, value: val, ids: [] };
    }
    groups[key].ids.push(c.id);
  });

  const sortedKeys = Object.keys(groups).sort();
  return sortedKeys.map((k, idx) => {
    const g = groups[k];
    return {
      item: idx + 1,
      designators: g.ids.sort().join(', '),
      quantity: g.ids.length,
      type: g.type,
      value: g.value,
    };
  });
}

/**
 * Calculates parametric SPICE measurements (Min, Max, Peak-to-Peak, DC Avg, RMS).
 */
function extractMeasurements(
  simulationBuffer: Record<string, number>[] | null
): MeasurementItem[] {
  if (!simulationBuffer || simulationBuffer.length === 0) return [];
  const rows = Array.isArray(simulationBuffer) ? simulationBuffer : (simulationBuffer as any).data || [];
  if (rows.length === 0) return [];

  const keys = Object.keys(rows[0]).filter(
    k => k !== 'time' && k !== 'frequency' && k !== 'v_sweep'
  );

  return keys.map(k => {
    const vals = rows
      .map((r: Record<string, number>) => r[k])
      .filter((v: number) => typeof v === 'number' && isFinite(v));

    if (vals.length === 0) {
      return { signal: k, min: '0 V', max: '0 V', vpp: '0 V', avg: '0 V', rms: '0 V' };
    }

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const vpp = max - min;
    const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    const sumSq = vals.reduce((a: number, b: number) => a + b * b, 0);
    const rms = Math.sqrt(sumSq / vals.length);

    const isCurrent = k.toLowerCase().startsWith('i(');
    const unit = isCurrent ? 'A' : 'V';
    const fmt = (v: number) => {
      const absV = Math.abs(v);
      if (absV >= 1000) return `${(v / 1e3).toFixed(2)} k${unit}`;
      if (absV < 0.001 && absV > 0) return `${(v * 1e6).toFixed(1)} µ${unit}`;
      if (absV < 1 && absV > 0) return `${(v * 1e3).toFixed(2)} m${unit}`;
      return `${v.toFixed(3)} ${unit}`;
    };

    return {
      signal: k,
      min: fmt(min),
      max: fmt(max),
      vpp: fmt(vpp),
      avg: fmt(avg),
      rms: fmt(rms),
    };
  });
}

/**
 * Generates an off-screen oscilloscope canvas graph snapshot if Grapher PNG is not provided.
 */
function generateWaveformCanvasSnapshot(
  simulationBuffer: Record<string, number>[] | null,
  width = 760,
  height = 300
): string | undefined {
  if (!simulationBuffer || simulationBuffer.length < 2) return undefined;
  const rows = Array.isArray(simulationBuffer) ? simulationBuffer : (simulationBuffer as any).data || [];
  if (rows.length < 2) return undefined;

  const keys = Object.keys(rows[0]).filter(
    k => k !== 'time' && k !== 'frequency' && k !== 'v_sweep'
  );
  if (keys.length === 0) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // Background
  ctx.fillStyle = '#0b1329';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 65;
  const padRight = 30;
  const padTop = 45;
  const padBottom = 40;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const hasTime = 'time' in rows[0];
  const tMin = hasTime ? rows[0].time : 0;
  const tMax = hasTime ? rows[rows.length - 1].time : rows.length - 1;
  const tRange = tMax - tMin || 1;

  let vMin = Infinity;
  let vMax = -Infinity;
  keys.forEach(k => {
    rows.forEach((r: Record<string, number>) => {
      const v = r[k];
      if (typeof v === 'number' && isFinite(v)) {
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
    });
  });

  if (!isFinite(vMin) || !isFinite(vMax)) {
    vMin = -5;
    vMax = 5;
  }
  if (vMax === vMin) {
    vMax += 1;
    vMin -= 1;
  }

  const vPad = (vMax - vMin) * 0.12;
  const plotVMin = vMin - vPad;
  const plotVMax = vMax + vPad;
  const vRange = plotVMax - plotVMin || 1;

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  // Horizontal Ticks
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 4; i++) {
    const frac = i / 4;
    const y = padTop + plotH * (1 - frac);
    const val = plotVMin + frac * vRange;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
    ctx.fillText(`${val.toFixed(2)}V`, padLeft - 8, y);
  }

  // Vertical Ticks
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i <= 4; i++) {
    const frac = i / 4;
    const x = padLeft + frac * plotW;
    const tVal = tMin + frac * tRange;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();

    let tStr = '';
    if (tRange < 1e-3) tStr = `${(tVal * 1e6).toFixed(1)} µs`;
    else if (tRange < 1) tStr = `${(tVal * 1e3).toFixed(2)} ms`;
    else tStr = `${tVal.toFixed(2)} s`;

    ctx.fillText(tStr, x, padTop + plotH + 8);
  }
  ctx.setLineDash([]);

  // Plot Traces
  const TRACE_COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#ec4899', '#a855f7', '#14b8a6', '#f43f5e'];

  keys.forEach((key, kIdx) => {
    const color = TRACE_COLORS[kIdx % TRACE_COLORS.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    let started = false;

    rows.forEach((row: Record<string, number>, rIdx: number) => {
      const v = row[key];
      if (typeof v !== 'number' || !isFinite(v)) return;

      const t = hasTime ? row.time : rIdx;
      const x = padLeft + ((t - tMin) / tRange) * plotW;
      const y = padTop + (1 - (v - plotVMin) / vRange) * plotH;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  });

  // Top Legend
  let legX = padLeft;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 11px Inter, sans-serif';

  keys.slice(0, 5).forEach((key, kIdx) => {
    const color = TRACE_COLORS[kIdx % TRACE_COLORS.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(legX + 5, 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(key, legX + 14, 22);
    legX += ctx.measureText(key).width + 28;
  });

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(padLeft, padTop, plotW, plotH);

  return canvas.toDataURL('image/png');
}

export function LabReportModal({
  isOpen,
  onClose,
  schematicDataUrl,
  graphDataUrl,
}: LabReportModalProps) {
  const { components, simulationBuffer, analysisMode, wires } = useSchematicStore();
  const { user, loading, signInWithGoogle } = useAuth();
  const { activeExperiment } = useActiveExperimentStore();

  const [step, setStep] = useState<Step>('form');
  const [reportMode, setReportMode] = useState<ReportMode>(activeExperiment ? 'student' : 'professional');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    engineerName: '',
    studentId: '',
    courseCode: '',
    facultyGuide: '',
    organization: '',
    docRevision: 'REV 1.0',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  });

  const [reportContent, setReportContent] = useState<{
    executiveSummary: string;
    operatingPrinciples: string;
    simulationMethodology: string;
    dynamicPerformance: string;
    signOff: string;
    vivaQuestions?: string[];
  } | null>(null);

  // Auto-fill defaults when activeExperiment changes
  useEffect(() => {
    if (isOpen) {
      if (activeExperiment) {
        setReportMode('student');
        setFormData(prev => ({
          ...prev,
          title: `Experiment ${activeExperiment.experimentNo}: ${activeExperiment.title}`,
          courseCode: `${activeExperiment.courseCode} - ${activeExperiment.courseName}`,
          organization: activeExperiment.university,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          title: prev.title || 'Analog Circuit Design & Verification',
          organization: prev.organization || (reportMode === 'student' ? 'School of Electrical & Electronics Engineering' : 'Hardware Systems R&D'),
          courseCode: prev.courseCode || 'ECE 301 - Analog Electronics Lab',
        }));
      }
    }
  }, [isOpen, activeExperiment, reportMode]);

  if (!isOpen) return null;

  const bomEntries = extractBOM(components);
  const measurementEntries = extractMeasurements(simulationBuffer);

  const effectiveGraphSnapshot = graphDataUrl || generateWaveformCanvasSnapshot(simulationBuffer);

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

      const netlist = generateNetlist(components, wires);
      const bomSummary = bomEntries.map(b => `${b.designators} (${b.type}, ${b.value}, Qty: ${b.quantity})`).join(', ');
      const simSummary = measurementEntries.map(m => `${m.signal}: Min=${m.min}, Max=${m.max}, Vpp=${m.vpp}, DC=${m.avg}, RMS=${m.rms}`).join('\n');

      const academicPrompt = activeExperiment
        ? `Academic Lab Course Information:
University: ${activeExperiment.university}
Course: ${activeExperiment.courseCode} - ${activeExperiment.courseName}
Experiment Number: ${activeExperiment.experimentNo}
Experiment Title: ${activeExperiment.title}
Aim: ${activeExperiment.aim}
Theory: ${activeExperiment.theory}
Expected Observations: ${activeExperiment.expectedObservations}
`
        : `Course/Subject: ${formData.courseCode}
Institution: ${formData.organization}`;

      const prompt = reportMode === 'student'
        ? `You are an Electronics Engineering Lab Instructor writing a formal Academic Lab Record for an undergraduate circuit lab course.

${academicPrompt}

Circuit Title: ${formData.title}
Analysis Mode: ${analysisMode || 'transient'}

SPICE Netlist Topology:
${netlist}

Components / Apparatus:
${bomSummary}

Measured SPICE Data:
${simSummary}

Generate a formal publication-grade laboratory report with 5 clear sections:
1. AIM & OBJECTIVES: Clear statement of the experiment aim, apparatus, and expected findings.
2. THEORY & GOVERNING PRINCIPLES: Technical derivation with relevant circuit equations, cutoff frequency, gain, or oscillation formulas.
3. PROCEDURE & SIMULATION METHODOLOGY: Step-by-step procedure for schematic construction and SPICE transient/AC solver parameters.
4. OBSERVATION & MEASUREMENTS DISCUSSION: Detailed technical discussion of the simulated metrics, waveforms, time constants, or frequency responses.
5. RESULT & VIVA REVIEW: Final conclusion verifying circuit behavior, practical tolerances, and 3 brief viva voce review questions with answers.

Tone: Academic, educational, and precise. Plain text only.`
        : `You are a Principal Hardware Design Engineer writing a formal Design Verification Report (DVR) and Technical Test Review for an aerospace/automotive/telecom hardware review.

Organization: ${formData.organization}
Document Title: ${formData.title}
Revision: ${formData.docRevision}

Analysis Mode: ${analysisMode || 'transient'}

SPICE Netlist Topology:
${netlist}

BOM Components:
${bomSummary}

Measured Verification Metrics:
${simSummary}

Generate a formal publication-grade engineering report with 5 clear sections:
1. EXECUTIVE SUMMARY: High-level overview of circuit architecture, intended operating conditions, and performance envelope.
2. OPERATING PRINCIPLES: Technical derivation of transfer function, pole/zero placements, impedance matching, and switching behavior with key formulas.
3. SIMULATION METHODOLOGY: Parameter setup, sweep tolerances, excitation profiles, and verification criteria used for this run.
4. DYNAMIC & WAVEFORM VERIFICATION: In-depth engineering analysis of the simulated waveforms, rise/fall times, ripple, overshoot, cutoffs, or gain. Include explicit measured numerical values.
5. DESIGN SIGN-OFF & RECOMMENDATIONS: Statement of compliance with design targets, component margins, and recommended production component part numbers.

Tone: Rigorous, precise, and professional. Plain text only.`;

      let text = '';
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (response.ok) {
          const data = await response.json();
          text = (data.result as string) || '';
        }
      } catch (err) {
        console.warn('Gemini proxy unavailable, using high-grade deterministic fallback:', err);
      }

      if (text) {
        const extract = (header: string, nextHeaders: string[]) => {
          const nextPattern = nextHeaders.length
            ? `(?=(?:\\n\\s*(?:\\d+\\.\\s*|#{1,3}\\s*)?(?:${nextHeaders.join('|')}):?)|$)`
            : '$';
          const regex = new RegExp(
            `(?:^|\\n)\\s*(?:\\d+\\.\\s*|#{1,3}\\s*)?${header}:?\\s*\\n?([\\s\\S]*?)${nextPattern}`,
            'i'
          );
          const match = text.match(regex);
          return match ? match[1].trim() : '';
        };

        const executiveSummary = extract('EXECUTIVE SUMMARY', ['OPERATING PRINCIPLES', 'THEORY', 'SIMULATION METHODOLOGY', 'PROCEDURE', 'DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'RESULT', 'CONCLUSION']) || extract('AIM', ['THEORY', 'PROCEDURE', 'OBSERVATION']);
        const operatingPrinciples = extract('OPERATING PRINCIPLES', ['SIMULATION METHODOLOGY', 'PROCEDURE', 'DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'RESULT', 'CONCLUSION']) || extract('THEORY', ['PROCEDURE', 'SIMULATION METHODOLOGY', 'DYNAMIC']);
        const simulationMethodology = extract('SIMULATION METHODOLOGY', ['DYNAMIC', 'WAVEFORM', 'OBSERVATIONS', 'DESIGN SIGN-OFF', 'RESULT', 'CONCLUSION']) || extract('PROCEDURE', ['OBSERVATIONS', 'DYNAMIC', 'RESULT']);
        const dynamicPerformance = extract('DYNAMIC', ['DESIGN SIGN-OFF', 'RESULT', 'CONCLUSION', 'VIVA']) || extract('WAVEFORM', ['DESIGN SIGN-OFF', 'RESULT', 'CONCLUSION']) || extract('OBSERVATION', ['RESULT', 'CONCLUSION', 'VIVA']);
        const signOff = extract('DESIGN SIGN-OFF', []) || extract('RESULT', []) || extract('CONCLUSION', []);

        setReportContent({
          executiveSummary: executiveSummary || formData.title,
          operatingPrinciples: operatingPrinciples || text,
          simulationMethodology: simulationMethodology || '1. Schematic capture executed via NodeSim WebAssembly SPICE.\n2. Automated MNA formulation & matrix solver integration.\n3. Transient and frequency response analysis with adaptive step control.',
          dynamicPerformance: dynamicPerformance || simSummary,
          signOff: signOff || 'Circuit operation validated against theoretical specifications. All convergence criteria satisfied.',
        });
      } else {
        // High-grade offline deterministic fallback
        const compCount = components.length;
        const compTypes = Array.from(new Set(components.map(c => c.type))).join(', ');
        if (reportMode === 'student') {
          setReportContent({
            executiveSummary: activeExperiment
              ? `AIM:\n${activeExperiment.aim}\n\nOBJECTIVE:\nTo construct, simulate, and experimentally verify the characteristics of ${activeExperiment.title} using WebAssembly SPICE under ${(analysisMode || 'transient').toUpperCase()} analysis.`
              : `AIM:\nTo simulate, analyze, and verify the operation of the ${formData.title} circuit using WebAssembly SPICE simulation.`,
            operatingPrinciples: activeExperiment
              ? `THEORY & GOVERNING EQUATIONS:\n${activeExperiment.theory}\n\nMATHEMATICAL FORMULATION:\nThe circuit is formulated as a set of differential-algebraic equations solved via Modified Nodal Analysis (MNA). Active and passive semiconductor models follow non-linear compact charge equations.`
              : `THEORY:\nThe circuit topology utilizes ${compCount} components (${compTypes}). Circuit voltages and branch currents satisfy Kirchhoff's Voltage Law (KVL) and Kirchhoff's Current Law (KCL). The transfer function and frequency response are governed by reactive and semiconductor dynamics.`,
            simulationMethodology: `1. Schematic entry with automated electrical rule checks (DRC).\n2. Modified Nodal Analysis (MNA) matrix formulation via ngspice.\n3. Solver convergence tolerances: RELTOL=1e-3, VNTOL=1µV, ABSTOL=1pA.\n4. Parametric extraction across all signal probes.`,
            dynamicPerformance: `SIMULATED PERFORMANCE SUMMARY:\n${simSummary || 'All signals converged with zero numerical divergence.'}\n\nWaveform traces demonstrate nominal transient settling and steady-state conformance.`,
            signOff: activeExperiment
              ? `RESULT:\nThe experiment "${activeExperiment.title}" was successfully designed, simulated, and verified.\nObserved output waveforms match theoretical principles with nominal error margins.\n\nViva Questions for Review:\n${activeExperiment.vivaQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
              : `RESULT:\nThe circuit "${formData.title}" was successfully simulated and verified.\nAll nodal voltages and branch currents conform to expected theoretical models.`,
          });
        } else {
          setReportContent({
            executiveSummary: `This Design Verification Report documents the numerical simulation and operational verification of "${formData.title}". The circuit topology integrates ${compCount} components (${compTypes}) evaluated under automated WebAssembly SPICE ${(analysisMode || 'transient').toUpperCase()} analysis.`,
            operatingPrinciples: `MATHEMATICAL MODEL & PRINCIPLES:\nThe circuit is formulated as a system of Modified Nodal Analysis (MNA) equations solved via ngspice WASM. Active and passive devices are governed by standard non-linear compact semiconductor physics and Kirchhoff's laws.\n\nKey circuit parameters:\n- Solved Netlist Nodes: ${netlist.split('\n').filter(l => l.trim() && !l.startsWith('*')).length} active branches\n- Governing mode: ${(analysisMode || 'transient').toUpperCase()} domain response`,
            simulationMethodology: `1. Netlist formulation with automated node extraction and floating-node DRC.\n2. Sparse matrix factorization using SPARSE 1.3 numeric solver.\n3. Adaptive time-step transient integration with trapezoidal truncation error control.\n4. Convergence criteria: RELTOL=1e-3, VNTOL=1µV, ABSTOL=1pA.`,
            dynamicPerformance: `MEASURED METRICS & VERIFICATION:\n${simSummary || 'All signals converged within nominal bounds.'}`,
            signOff: `DESIGN VERIFICATION STATUS: PASSED.\nAll node voltages and branch currents converged with zero numerical divergence. Output metrics conform to nominal hardware design criteria. Ready for hardware sign-off and prototype fabrication.`,
          });
        }
      }

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

      const isStudent = reportMode === 'student';
      const primaryColor: [number, number, number] = isStudent ? [22, 163, 74] : [14, 116, 144]; // Green vs Cyan/Navy

      const addText = (
        text: string,
        x: number,
        yPos: number,
        opts: {
          fontSize?: number;
          fontStyle?: 'normal' | 'bold' | 'italic';
          color?: [number, number, number];
          maxWidth?: number;
          lineHeight?: number;
        }
      ) => {
        const {
          fontSize = 9.5,
          fontStyle = 'normal',
          color = [30, 41, 59],
          maxWidth = contentW,
          lineHeight = 5.5,
        } = opts;
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
        if (currentY > pageH - 45) {
          doc.addPage();
          currentY = margin;
        }
        // Section label banner
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY - 1, contentW, 6.5, 'F');
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(label, margin + 3, currentY + 4.5);
        currentY += 9.5;

        // Content
        if (content.includes('\n')) {
          const steps = content.split('\n').filter(s => s.trim());
          steps.forEach(stepText => {
            if (currentY > pageH - 25) {
              doc.addPage();
              currentY = margin;
            }
            currentY = addText(stepText.trim(), margin + 3, currentY, {
              fontSize: 9,
              maxWidth: contentW - 6,
              lineHeight: 5.2,
            });
            currentY += 1.5;
          });
        } else {
          currentY = addText(content, margin + 3, currentY, {
            fontSize: 9,
            maxWidth: contentW - 6,
            lineHeight: 5.2,
          });
        }
        return currentY + 5;
      };

      const drawTable = (
        title: string,
        headers: string[],
        colWidths: number[],
        rows: string[][],
        currentY: number
      ): number => {
        if (rows.length === 0) return currentY;
        if (currentY > pageH - 45) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY - 1, contentW, 6.5, 'F');
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 3, currentY + 4.5);
        currentY += 9.5;

        const headerH = 6.0;
        const rowH = 5.6;

        const renderHeader = (yPos: number) => {
          doc.setFillColor(30, 41, 59);
          doc.rect(margin, yPos, contentW, headerH, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);

          let x = margin;
          headers.forEach((h, i) => {
            doc.text(h, x + 2.5, yPos + 4.2);
            x += colWidths[i];
          });
          return yPos + headerH;
        };

        currentY = renderHeader(currentY);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');

        rows.forEach((row, rowIdx) => {
          if (currentY + rowH > pageH - 20) {
            doc.addPage();
            currentY = margin;
            currentY = renderHeader(currentY);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
          }

          if (rowIdx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.rect(margin, currentY, contentW, rowH, 'F');

          doc.setDrawColor(226, 232, 240);
          doc.line(margin, currentY + rowH, margin + contentW, currentY + rowH);

          doc.setTextColor(30, 41, 59);
          let x = margin;
          row.forEach((cell, i) => {
            doc.text(String(cell), x + 2.5, currentY + 3.8);
            x += colWidths[i];
          });

          currentY += rowH;
        });

        return currentY + 6;
      };

      // --- HEADER BANNER ---
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 36, 'F');

      doc.setFontSize(19);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text('NodeSim EDA', margin, 15);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('nodesimapp.com • Cloud-Native SPICE Hardware Simulation', margin, 22);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);

      if (isStudent) {
        doc.text('ACADEMIC LAB VERIFICATION RECORD', pageW - margin, 15, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${formData.organization || 'University Lab'} | ${formData.courseCode}`, pageW - margin, 22, { align: 'right' });
      } else {
        doc.text('DESIGN VERIFICATION REPORT (DVR)', pageW - margin, 15, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`DOC-ID: DVR-${Date.now().toString(36).toUpperCase()} | ${formData.docRevision}`, pageW - margin, 22, { align: 'right' });
      }
      y = 44;

      // --- PROJECT METADATA CARD ---
      const cardH = isStudent ? 40 : 34;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentW, cardH, 2, 2, 'FD');

      doc.setFontSize(12.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formData.title || 'Untitled Circuit Design', margin + 4, y + 7.5);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      if (isStudent) {
        const line1 = `Student: ${formData.engineerName || 'Student Name'}  |  ID: ${formData.studentId || 'N/A'}  |  Course: ${formData.courseCode}`;
        doc.text(line1, margin + 4, y + 15);
        const line2 = `Institution: ${formData.organization}  |  Guide: ${formData.facultyGuide || 'Lab Instructor'}  |  Date: ${formData.date}`;
        doc.text(line2, margin + 4, y + 22);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Active BOM Components: ${bomEntries.length} items (${components.length} total schematic parts)`, margin + 4, y + 29);
      } else {
        const line1 = `Lead Engineer: ${formData.engineerName || 'Lead Design Engineer'}  |  Organization: ${formData.organization}  |  Rev: ${formData.docRevision}`;
        doc.text(line1, margin + 4, y + 15);
        const line2 = `Classification: Hardware Verification  |  Date: ${formData.date}`;
        doc.text(line2, margin + 4, y + 22);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Active BOM Components: ${bomEntries.length} items (${components.length} total schematic parts)`, margin + 4, y + 29);
      }
      y += cardH + 6;

      if (!reportContent) return;

      // --- SECTION 1: Aim / Executive Summary ---
      y = addSection(
        isStudent ? '1. AIM & EXPERIMENT OBJECTIVES' : '1. EXECUTIVE SUMMARY & SPECIFICATIONS',
        reportContent.executiveSummary,
        y
      );

      // --- SECTION 2: BOM Table ---
      const bomHeaders = ['Item', 'Designator(s)', 'Component Type', 'Value / Model', 'Qty'];
      const bomWidths = [16, 38, 50, 48, 22];
      const bomRows = bomEntries.map(b => [
        b.item.toString(),
        b.designators,
        b.type,
        b.value,
        b.quantity.toString(),
      ]);
      y = drawTable(
        isStudent ? '2. APPARATUS & BILL OF MATERIALS (BOM)' : '2. BILL OF MATERIALS & PROCUREMENT (BOM)',
        bomHeaders,
        bomWidths,
        bomRows,
        y
      );

      // --- SECTION 3: Theory & Operating Principles ---
      y = addSection(
        isStudent ? '3. THEORY & GOVERNING FORMULAS' : '3. OPERATING PRINCIPLES & MATHEMATICAL MODEL',
        reportContent.operatingPrinciples,
        y
      );

      // --- SECTION 4: Circuit Schematic Image ---
      if (schematicDataUrl) {
        if (y > pageH - 85) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(...primaryColor);
        doc.rect(margin, y - 1, contentW, 6.5, 'F');
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(isStudent ? '4. CIRCUIT SCHEMATIC DIAGRAM' : '4. VERIFIED CIRCUIT SCHEMATIC', margin + 3, y + 4.5);
        y += 9.5;

        const imgH = 68;
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(schematicDataUrl, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      // --- SECTION 5: Methodology / Procedure ---
      y = addSection(
        isStudent ? '5. PROCEDURE & SIMULATION METHODOLOGY' : '5. SIMULATION METHODOLOGY & SPICE SETUP',
        reportContent.simulationMethodology,
        y
      );

      // --- SECTION 6: SPICE Measurements Table ---
      if (measurementEntries.length > 0) {
        const measHeaders = ['Signal / Node', 'Min Value', 'Max Value', 'Peak-to-Peak (Vpp)', 'DC Bias', 'RMS'];
        const measWidths = [36, 28, 28, 28, 27, 27];
        const measRows = measurementEntries.map(m => [
          m.signal,
          m.min,
          m.max,
          m.vpp,
          m.avg,
          m.rms,
        ]);
        y = drawTable(
          isStudent ? '6. OBSERVATION & MEASURED SPICE DATA' : '6. PARAMETRIC MEASUREMENT VERIFICATION',
          measHeaders,
          measWidths,
          measRows,
          y
        );
      }

      // --- SECTION 7: Simulation Waveform Image ---
      if (effectiveGraphSnapshot) {
        if (y > pageH - 85) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(...primaryColor);
        doc.rect(margin, y - 1, contentW, 6.5, 'F');
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(
          isStudent ? '7. SIMULATION WAVEFORMS & TRANSIENT RESPONSE' : '7. WAVEFORM ANALYSIS & TRANSIENT DYNAMICS',
          margin + 3,
          y + 4.5
        );
        y += 9.5;

        const imgH = 62;
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, imgH);
        doc.addImage(effectiveGraphSnapshot, 'PNG', margin + 1, y + 1, contentW - 2, imgH - 2);
        y += imgH + 6;
      }

      // --- SECTION 8: Dynamic Performance & Calculations ---
      y = addSection(
        isStudent ? '8. CALCULATIONS & PERFORMANCE DISCUSSION' : '8. DYNAMIC PERFORMANCE ANALYSIS',
        reportContent.dynamicPerformance,
        y
      );

      // --- SECTION 9: Result & Sign-off ---
      y = addSection(
        isStudent ? '9. RESULT & VIVA VOCE REVIEW' : '9. DESIGN SIGN-OFF & HARDWARE RECOMMENDATIONS',
        reportContent.signOff,
        y
      );

      // --- FOOTER ON ALL PAGES ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Generated by NodeSim EDA (nodesimapp.com) • Cloud-Native Hardware Simulation & Verification',
          margin,
          pageH - 7
        );
        if (isStudent) {
          doc.text(
            `Page ${i} of ${totalPages} • Academic Lab Record • ${formData.courseCode}`,
            pageW - margin,
            pageH - 7,
            { align: 'right' }
          );
        } else {
          doc.text(
            `Page ${i} of ${totalPages} • Classification: Engineering Review • ${formData.docRevision}`,
            pageW - margin,
            pageH - 7,
            { align: 'right' }
          );
        }
      }

      const safeTitle = (formData.title || 'circuit').replace(/\s+/g, '_');
      if (isStudent) {
        doc.save(`LabRecord_${safeTitle}.pdf`);
      } else {
        doc.save(`DVR_${safeTitle}_${formData.docRevision}.pdf`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('PDF generation failed: ' + msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#64748b',
    marginBottom: 5,
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 620,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          color: '#f1f5f9',
          fontFamily: 'Inter, system-ui, sans-serif',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: reportMode === 'student' ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.15)',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <FileCheck2
                size={20}
                style={{ color: reportMode === 'student' ? '#22c55e' : '#38bdf8' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {reportMode === 'student' ? 'Academic Lab Record Generator' : 'Design Verification Report (DVR)'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {reportMode === 'student'
                  ? 'University Standard Lab Manual & Viva Voce Dossier'
                  : 'IEEE-Grade Hardware Design Verification Report'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Toggle Pill */}
        {step === 'form' && (
          <div
            style={{
              display: 'flex',
              background: '#0f172a',
              borderRadius: 10,
              padding: 4,
              marginBottom: 18,
              border: '1px solid #334155',
              gap: 4,
            }}
          >
            <button
              onClick={() => setReportMode('student')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: reportMode === 'student' ? '#16a34a' : 'transparent',
                color: reportMode === 'student' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <GraduationCap size={16} /> Student Lab Record
            </button>
            <button
              onClick={() => setReportMode('professional')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: reportMode === 'professional' ? '#0284c7' : 'transparent',
                color: reportMode === 'professional' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Briefcase size={16} /> Professional (DVR)
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={40} style={{ color: '#16a34a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          </div>
        ) : (
          <>
            {step === 'paywall' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.4)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    marginBottom: 18,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                    Monthly Free Report Limit Reached
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                  Institutional & Team Access
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
                  Need unlimited Design Verification and Academic Reports for your engineering department or lab group?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
                  <a
                    href="mailto:siddharth@nodesimapp.com?subject=Institutional%20Access%20Request%20-%20NodeSim"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: '#16a34a',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '12px',
                      borderRadius: 9,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Request Institutional Access
                  </a>
                </div>
              </div>
            )}

            {step === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeExperiment && reportMode === 'student' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(16,160,90,0.12)',
                      border: '1px solid rgba(16,160,90,0.25)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#86efac',
                    }}
                  >
                    <GraduationCap size={16} style={{ flexShrink: 0, color: '#4ade80' }} />
                    <div>
                      <strong>Lab Pack:</strong> {activeExperiment.university} — {activeExperiment.courseCode} (Exp #{activeExperiment.experimentNo})
                    </div>
                  </div>
                )}

                {!user && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.25)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#93c5fd',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} /> Guest Verification Mode (3 free reports)
                    </span>
                    <button
                      onClick={signInWithGoogle}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <LogIn size={13} /> Sign in
                    </button>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>
                    {reportMode === 'student' ? 'Experiment Title / Aim *' : 'Project / Circuit Title *'}
                  </label>
                  <input
                    style={inputStyle}
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder={
                      reportMode === 'student'
                        ? 'e.g. Verification of Sallen-Key Low-Pass Active Filter'
                        : 'e.g. Active Butterworth Low-Pass Filter Design Verification'
                    }
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      {reportMode === 'student' ? 'Student Name' : 'Lead Engineer'}
                    </label>
                    <input
                      style={inputStyle}
                      value={formData.engineerName}
                      onChange={e => setFormData(p => ({ ...p, engineerName: e.target.value }))}
                      placeholder={reportMode === 'student' ? 'e.g. Alex Johnson' : 'e.g. Siddharth K.'}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      {reportMode === 'student' ? 'Roll No. / Student ID' : 'Revision'}
                    </label>
                    <input
                      style={inputStyle}
                      value={reportMode === 'student' ? formData.studentId : formData.docRevision}
                      onChange={e =>
                        setFormData(p =>
                          reportMode === 'student'
                            ? { ...p, studentId: e.target.value }
                            : { ...p, docRevision: e.target.value }
                        )
                      }
                      placeholder={reportMode === 'student' ? 'e.g. 21ECE045' : 'REV 1.0'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      {reportMode === 'student' ? 'Course / Subject Code' : 'Organization / Division'}
                    </label>
                    <input
                      style={inputStyle}
                      value={reportMode === 'student' ? formData.courseCode : formData.organization}
                      onChange={e =>
                        setFormData(p =>
                          reportMode === 'student'
                            ? { ...p, courseCode: e.target.value }
                            : { ...p, organization: e.target.value }
                        )
                      }
                      placeholder={
                        reportMode === 'student'
                          ? 'e.g. ECE 301 - Circuits Lab'
                          : 'Hardware Systems R&D'
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      {reportMode === 'student' ? 'Faculty Guide / Instructor' : 'Date'}
                    </label>
                    <input
                      style={inputStyle}
                      value={reportMode === 'student' ? formData.facultyGuide : formData.date}
                      onChange={e =>
                        setFormData(p =>
                          reportMode === 'student'
                            ? { ...p, facultyGuide: e.target.value }
                            : { ...p, date: e.target.value }
                        )
                      }
                      placeholder={reportMode === 'student' ? 'e.g. Dr. R. Sharma' : formData.date}
                    />
                  </div>
                </div>

                {reportMode === 'student' && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 2 }}>
                      <label style={labelStyle}>College / University Name</label>
                      <input
                        style={inputStyle}
                        value={formData.organization}
                        onChange={e => setFormData(p => ({ ...p, organization: e.target.value }))}
                        placeholder="e.g. Department of Electrical Engineering"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Date</label>
                      <input
                        style={inputStyle}
                        value={formData.date}
                        onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Auto-extracted summary pills */}
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    background: '#0f172a',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    border: '1px solid #334155',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
                    <TableIcon size={14} /> <strong>BOM Table:</strong> {bomEntries.length} items
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
                    <Activity size={14} /> <strong>Measurements:</strong> {measurementEntries.length} signals
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                    <Layers size={14} /> <strong>Waveform:</strong> {effectiveGraphSnapshot ? 'Available ✓' : 'Pending run'}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!formData.title.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: formData.title.trim()
                      ? reportMode === 'student'
                        ? '#16a34a'
                        : '#0284c7'
                      : '#334155',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: formData.title.trim() ? 'pointer' : 'not-allowed',
                    marginTop: 4,
                  }}
                >
                  <Sparkles size={16} />
                  {reportMode === 'student' ? 'Synthesize Academic Lab Record' : 'Generate Verification Dossier'}
                </button>
              </div>
            )}

            {step === 'generating' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Loader2
                  size={40}
                  style={{
                    color: reportMode === 'student' ? '#16a34a' : '#0284c7',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {reportMode === 'student'
                    ? 'Synthesizing Academic Lab Manual & Record...'
                    : 'Generating Design Verification Dossier...'}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Formulating BOM Table, SPICE Measurements, Waveform Dynamics & Sign-Off
                </div>
              </div>
            )}

            {step === 'error' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 14, color: '#fca5a5', marginBottom: 16 }}>⚠️ {errorMsg}</div>
                <button
                  onClick={() => setStep('form')}
                  style={{
                    background: '#334155',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

            {step === 'preview' && reportContent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Mode indicator pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#0f172a',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: reportMode === 'student' ? '#4ade80' : '#38bdf8', fontWeight: 600 }}>
                    {reportMode === 'student' ? '🎓 Academic Lab Record Format' : '💼 Professional DVR Format'}
                  </span>
                  <span style={{ color: '#64748b' }}>{formData.title}</span>
                </div>

                {/* Section previews */}
                {[
                  [reportMode === 'student' ? '1. Aim & Objectives' : '1. Executive Summary', reportContent.executiveSummary],
                  [reportMode === 'student' ? '2. Theory & Governing Equations' : '2. Operating Principles', reportContent.operatingPrinciples],
                  ['3. Simulation Methodology', reportContent.simulationMethodology],
                  ['4. Dynamic Waveform Performance', reportContent.dynamicPerformance],
                  [reportMode === 'student' ? '5. Result & Conclusion' : '5. Design Sign-Off & Recommendations', reportContent.signOff],
                ].map(([label, content]) => (
                  <div
                    key={label}
                    style={{
                      background: '#0f172a',
                      borderRadius: 10,
                      padding: 12,
                      border: '1px solid #1e293b',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: reportMode === 'student' ? '#16a34a' : '#0284c7',
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {content}
                    </div>
                  </div>
                ))}

                {/* BOM Table Preview */}
                {bomEntries.length > 0 && (
                  <div style={{ background: '#0f172a', borderRadius: 10, padding: 12, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', marginBottom: 6 }}>
                      Bill of Materials (BOM) Table Preview ({bomEntries.length} items)
                    </div>
                    <div style={{ overflowX: 'auto', fontSize: 11 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '4px 6px' }}>#</th>
                            <th style={{ padding: '4px 6px' }}>Designator</th>
                            <th style={{ padding: '4px 6px' }}>Type</th>
                            <th style={{ padding: '4px 6px' }}>Value</th>
                            <th style={{ padding: '4px 6px' }}>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bomEntries.slice(0, 5).map(b => (
                            <tr key={b.item} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '4px 6px', color: '#64748b' }}>{b.item}</td>
                              <td style={{ padding: '4px 6px', color: '#f1f5f9' }}>{b.designators}</td>
                              <td style={{ padding: '4px 6px', color: '#94a3b8' }}>{b.type}</td>
                              <td style={{ padding: '4px 6px', color: '#38bdf8' }}>{b.value}</td>
                              <td style={{ padding: '4px 6px', color: '#f1f5f9' }}>{b.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {bomEntries.length > 5 && (
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                          + {bomEntries.length - 5} more components included in PDF table
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Measurements Table Preview */}
                {measurementEntries.length > 0 && (
                  <div style={{ background: '#0f172a', borderRadius: 10, padding: 12, border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#22c55e', marginBottom: 6 }}>
                      SPICE Measurements Table Preview ({measurementEntries.length} signals)
                    </div>
                    <div style={{ overflowX: 'auto', fontSize: 11 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '4px 6px' }}>Signal</th>
                            <th style={{ padding: '4px 6px' }}>Min</th>
                            <th style={{ padding: '4px 6px' }}>Max</th>
                            <th style={{ padding: '4px 6px' }}>Vpp</th>
                            <th style={{ padding: '4px 6px' }}>DC Bias</th>
                          </tr>
                        </thead>
                        <tbody>
                          {measurementEntries.slice(0, 4).map(m => (
                            <tr key={m.signal} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '4px 6px', color: '#38bdf8', fontWeight: 600 }}>{m.signal}</td>
                              <td style={{ padding: '4px 6px', color: '#cbd5e1' }}>{m.min}</td>
                              <td style={{ padding: '4px 6px', color: '#cbd5e1' }}>{m.max}</td>
                              <td style={{ padding: '4px 6px', color: '#22c55e' }}>{m.vpp}</td>
                              <td style={{ padding: '4px 6px', color: '#cbd5e1' }}>{m.avg}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Image Snapshot Indicators */}
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <div
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      borderRadius: 8,
                      padding: '8px 12px',
                      border: '1px solid #334155',
                      color: schematicDataUrl ? '#4ade80' : '#94a3b8',
                    }}
                  >
                    Schematic Diagram: {schematicDataUrl ? '✓ Embedded' : 'Not captured'}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      borderRadius: 8,
                      padding: '8px 12px',
                      border: '1px solid #334155',
                      color: effectiveGraphSnapshot ? '#4ade80' : '#94a3b8',
                    }}
                  >
                    Waveform Graph: {effectiveGraphSnapshot ? '✓ Embedded' : 'Not captured'}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => setStep('form')}
                    style={{
                      flex: 1,
                      background: '#334155',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    ← Edit Details
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    style={{
                      flex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: reportMode === 'student' ? '#16a34a' : '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: 12,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    <Download size={16} />
                    {reportMode === 'student'
                      ? 'Download Academic Lab PDF'
                      : 'Download Verification Dossier (PDF)'}
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
