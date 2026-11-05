import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileCheck2,
  Loader2,
  Download,
  Sparkles,
  LogIn,
  ShieldCheck,
  Table as TableIcon,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  HelpCircle,
  Cpu,
  BookOpen,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';
import type { SchematicComponent } from '../store/useSchematicStore';
import { generateNetlist } from '../utils/netlister/generateNetlist';
import { useAuth } from '../hooks/useAuth';
import { checkAndIncrementUsage } from '../utils/dbUsage';
import { useActiveExperimentStore } from '../data/universityLabPacks';

import {
  extractValidatedReadings,
  toDynamicReadingItems,
  formatEngineeringValue,
  type ValidatedSignalMeasurement,
  type DynamicReadingItem,
} from '../utils/report/measurementValidation';

import {
  analyzeCircuitTopology,
  evaluateTransientCoverage,
  type TopologyTimingInvariants,
  type TransientCoverageEvaluation,
} from '../utils/report/adaptiveTransient';

import {
  evaluateCircuitVerification,
  evaluateComponentStress,
  type FourPillarEvaluation,
  type VerificationTestCase,
  type ComponentStressItem,
} from '../utils/report/verificationEngine';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schematicDataUrl?: string; // PNG screenshot of the schematic
  graphDataUrl?: string;     // PNG screenshot of the grapher
}

type Step = 'form' | 'generating' | 'preview' | 'error' | 'paywall';
export type ReportDocMode = 'DVR' | 'SIMULATION' | 'THEORETICAL';

export interface BomItem {
  item: number;
  designators: string;
  quantity: number;
  type: string;
  value: string;
  stressRating: string;
}

export interface FormulaExplanation {
  name: string;
  formula: string;
  simpleExplanation: string;
  variables: { symbol: string; meaning: string }[];
}

/**
 * Eliminates raw unrendered LaTeX math notation ($...$, \_, \times, \frac, etc.)
 * and converts them into crisp, publication-grade Unicode engineering notation.
 */
export function cleanEngineeringText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^\$\n]+)\$/g, '$1')
    .replace(/\\_/g, '_')
    .replace(/\\times/g, '·')
    .replace(/\\cdot/g, '·')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\mu/g, 'µ')
    .replace(/\\pi/g, 'π')
    .replace(/\\approx/g, '≈')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/\$/g, '')
    .trim();
}

/**
 * Extracts structured Bill of Materials grouping physical components.
 * Explicitly marks unspecified ratings as 'NOT PROVIDED' (Requirement 4).
 */
function extractBOM(components: SchematicComponent[]): BomItem[] {
  const nonPhysical = new Set(['Ground', 'Junction', 'Connector', 'Probe', 'TextAnnotation']);
  const physical = components.filter(c => !nonPhysical.has(c.type));
  const groups: Record<string, { type: string; value: string; ids: string[]; explicitRating?: string }> = {};

  for (const c of physical) {
    const val = (c.value || '').trim() || 'Standard';
    const explicitRating = (c as any).powerRating || (c as any).voltageRating || (c as any).currentRating;
    const key = `${c.type}___${val}___${explicitRating || 'none'}`;
    if (!groups[key]) {
      groups[key] = { type: c.type, value: val, ids: [], explicitRating };
    }
    groups[key].ids.push(c.id);
  }

  const sortedKeys = Object.keys(groups).sort();
  return sortedKeys.map((k, idx) => {
    const g = groups[k];
    const stress = g.explicitRating ? `Rated: ${g.explicitRating}` : 'NOT PROVIDED (Unspecified)';

    return {
      item: idx + 1,
      designators: g.ids.sort().join(', '),
      quantity: g.ids.length,
      type: g.type,
      value: g.value,
      stressRating: stress,
    };
  });
}

/**
 * Analyzes schematic components and derives plain-English governing formulas.
 */
function getDetailedCircuitFormulas(components: SchematicComponent[]): FormulaExplanation[] {
  const formulas: FormulaExplanation[] = [];
  const types = new Set(components.map(c => (c.type || '').toLowerCase()));

  // 1. 555 Timer Astable Multivibrator
  if (Array.from(types).some(t => t.includes('555'))) {
    formulas.push({
      name: '555 Astable Oscillation Period & Frequency',
      formula: 'T = 0.693 · (R_A + 2·R_B) · C   =>   f = 1 / T',
      simpleExplanation:
        'The total cycle time equals the time spent charging plus discharging the capacitor through resistors RA and RB. The output switching rate (frequency) is simply how many cycles complete every second.',
      variables: [
        { symbol: 'T', meaning: 'Total oscillation period in seconds (s)' },
        { symbol: 'f', meaning: 'Oscillator output frequency in Hertz (Hz)' },
        { symbol: 'R_A', meaning: 'Timing resistor connected between VCC and Discharge pin' },
        { symbol: 'R_B', meaning: 'Timing resistor connected between Discharge and Threshold pins' },
        { symbol: 'C', meaning: 'Timing capacitor storing charge to Ground' },
      ],
    });

    formulas.push({
      name: '555 Output High Time (Charging Phase)',
      formula: 't_high = 0.693 · (R_A + R_B) · C',
      simpleExplanation:
        'The amount of time the output pin stays HIGH while the capacitor charges from 1/3 VCC up to 2/3 VCC through both resistors.',
      variables: [
        { symbol: 't_high', meaning: 'High state duration in seconds' },
        { symbol: '0.693', meaning: 'Natural logarithm of 2 (ln 2), derived from RC exponential charging curves' },
      ],
    });

    formulas.push({
      name: '555 Output Low Time (Discharging Phase)',
      formula: 't_low = 0.693 · R_B · C',
      simpleExplanation:
        'The amount of time the output stays LOW while the capacitor drains charge down from 2/3 VCC to 1/3 VCC strictly through resistor RB.',
      variables: [
        { symbol: 't_low', meaning: 'Low state duration in seconds' },
        { symbol: 'Duty Cycle', meaning: 'Ratio of High time to total Period: [t_high / (t_high + t_low)] · 100%' },
      ],
    });
  }

  // 2. RC Filter or Reactive Networks
  if (types.has('resistor') && types.has('capacitor')) {
    formulas.push({
      name: 'RC Time Constant & Cutoff Frequency',
      formula: 'tau = R · C   and   f_c = 1 / (2·π·R·C)',
      simpleExplanation:
        'The time constant (tau) measures how fast the capacitor responds to a voltage change (reaching 63.2% of final value in 1 tau, and 99.3% in 5 tau). The cutoff frequency (f_c) marks where signals are attenuated by 3 dB.',
      variables: [
        { symbol: 'tau', meaning: 'Time constant in seconds' },
        { symbol: 'f_c', meaning: 'Cutoff frequency in Hertz (Hz)' },
        { symbol: 'R', meaning: 'Series resistance in Ohms (Ω)' },
        { symbol: 'C', meaning: 'Capacitance in Farads (F)' },
      ],
    });
  }

  // 3. Ohm's Law & Dissipated Power
  formulas.push({
    name: "Ohm's Law & Active Power Dissipation",
    formula: 'V = I · R   and   P = V · I = I² · R = V² / R',
    simpleExplanation:
      'Voltage equals current times resistance. Electrical power turned into heat equals the voltage across the component multiplied by the current flowing through it.',
    variables: [
      { symbol: 'V', meaning: 'Electric potential difference across terminals in Volts (V)' },
      { symbol: 'I', meaning: 'Current flowing through component in Amperes (A)' },
      { symbol: 'R', meaning: 'Resistance in Ohms (Ω)' },
      { symbol: 'P', meaning: 'Power dissipation in Watts (W)' },
    ],
  });

  return formulas;
}

/**
 * Renders a crisp IEEE-style white-background waveform chart from simulationBuffer.
 */
function generateWaveformCanvasSnapshot(
  simulationBuffer: Record<string, number>[] | null
): string | undefined {
  if (!simulationBuffer || simulationBuffer.length === 0) return undefined;
  const rows = simulationBuffer;
  if (rows.length < 2) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padLeft = 65;
  const padRight = 30;
  const padTop = 45;
  const padBottom = 45;
  const plotW = canvas.width - padLeft - padRight;
  const plotH = canvas.height - padTop - padBottom;

  // Extract non-internal signal keys
  const firstRow = rows[0];
  const keys = Object.keys(firstRow).filter(
    k => !k.startsWith('__') && k !== 'time' && k !== 'frequency' && k !== 'v_sweep'
  );
  if (keys.length === 0) return undefined;

  const hasTime = 'time' in firstRow;
  const tMin = hasTime ? rows[0].time : 0;
  const tMax = hasTime ? rows[rows.length - 1].time : rows.length - 1;
  const tRange = tMax - tMin || 1;

  let vMin = Infinity;
  let vMax = -Infinity;
  keys.forEach(k => {
    rows.forEach(r => {
      const val = r[k];
      if (typeof val === 'number' && isFinite(val)) {
        if (val < vMin) vMin = val;
        if (val > vMax) vMax = val;
      }
    });
  });

  if (!isFinite(vMin) || !isFinite(vMax)) return undefined;
  const vSpan = vMax - vMin || 1;
  const plotVMin = vMin - vSpan * 0.08;
  const plotVMax = vMax + vSpan * 0.08;
  const vRange = plotVMax - plotVMin;

  // Grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  // Horizontal Ticks
  ctx.fillStyle = '#64748b';
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
  const TRACE_COLORS = ['#0284c7', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0d9488'];

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

    ctx.fillStyle = '#0f172a';
    ctx.fillText(key, legX + 14, 22);
    legX += ctx.measureText(key).width + 28;
  });

  ctx.strokeStyle = '#cbd5e1';
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
  const {
    components,
    simulationBuffer,
    analysisMode,
    wires,
    transientSettings,
    setTransientSettings,
    runSimulation,
    isSimulating,
    simulationError,
  } = useSchematicStore();

  const { user, loading, signInWithGoogle } = useAuth();
  const { activeExperiment } = useActiveExperimentStore();

  const hasSimulated = Boolean(simulationBuffer && simulationBuffer.length > 0);

  // Three Document Modes
  const [docMode, setDocMode] = useState<ReportDocMode>('DVR');
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');

  // Actual ngspice runtime version (Requirement 5)
  const engineVersion = (simulationBuffer as any)?.__engineVersion || 'ngspice (WebAssembly build)';

  // Metadata form
  const [formData, setFormData] = useState({
    title: '',
    engineerName: '',
    organization: 'Hardware Systems R&D Workspace',
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

  // Auto-fill defaults based on user or experiment
  useEffect(() => {
    if (isOpen) {
      const defaultName = user?.displayName || user?.email?.split('@')[0] || 'NodeSim Hardware Engineer';
      if (activeExperiment) {
        setFormData(prev => ({
          ...prev,
          title: `Experiment ${activeExperiment.experimentNo}: ${activeExperiment.title}`,
          organization: activeExperiment.university || 'Department of Electrical & Electronic Engineering',
          engineerName: prev.engineerName || defaultName,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          title: prev.title || 'Mixed-Signal Hardware Design Verification',
          organization: prev.organization || 'Hardware Systems R&D Workspace',
          engineerName: prev.engineerName || defaultName,
        }));
      }
    }
  }, [isOpen, activeExperiment, user]);

  // Topology Analysis and Adaptive Transient Coverage
  const topology = useMemo(() => analyzeCircuitTopology(components), [components]);
  const coverage = useMemo(
    () => evaluateTransientCoverage(topology, transientSettings.endTime, transientSettings.step),
    [topology, transientSettings]
  );

  // Strict measurement extraction (no __parsedVars)
  const validatedMeasurements = useMemo(
    () => extractValidatedReadings(simulationBuffer),
    [simulationBuffer]
  );
  const dynamicReadings = useMemo(
    () => toDynamicReadingItems(validatedMeasurements),
    [validatedMeasurements]
  );

  // Formal 4-Pillar Verification Evaluation
  const verificationEvaluation: FourPillarEvaluation = useMemo(() => {
    return evaluateCircuitVerification(
      components,
      simulationBuffer,
      {
        hasSimulated,
        isSimulating,
        simError: simulationError,
        engineVersion,
      },
      transientSettings.endTime,
      transientSettings.step
    );
  }, [components, simulationBuffer, hasSimulated, isSimulating, simulationError, engineVersion, transientSettings]);

  if (!isOpen) return null;

  const bomEntries = extractBOM(components);
  const effectiveGraphSnapshot = graphDataUrl || generateWaveformCanvasSnapshot(simulationBuffer);
  const formulaCards = getDetailedCircuitFormulas(components);

  // Execute Adaptive Simulation re-run directly from advisory banner
  const handleRunAdaptiveSimulation = async () => {
    setTransientSettings({
      endTime: coverage.recommendation.formattedStopTime,
      step: coverage.recommendation.formattedStep,
    });
    try {
      await runSimulation();
    } catch (e) {
      console.error('Failed to run adaptive simulation:', e);
    }
  };

  const handleGenerate = async () => {
    // Mode requirement check: Theoretical report does not require simulation!
    if (docMode !== 'THEORETICAL' && !hasSimulated) {
      setErrorMsg('SPICE simulation must be executed before generating Simulation or Verification reports.');
      return;
    }
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
      const bomSummary = bomEntries
        .map(b => `${b.designators} (${b.type}, ${b.value}, Qty: ${b.quantity})`)
        .join(', ');
      const simSummary = dynamicReadings
        .map(m => `${m.signal}: Min=${m.min}, Max=${m.max}, Vpp=${m.vpp}, DC=${m.avg}, RMS=${m.rms}`)
        .join('\n');

      const prompt = `You are a Senior Electronic Engineering Specialist authoring an authoritative technical report for NodeSim EDA.
Document Type: ${docMode === 'THEORETICAL' ? 'Theoretical Engineering Report' : (docMode === 'SIMULATION' ? 'SPICE Simulation Report' : 'Design Verification Report (DVR)')}
Organization: ${formData.organization}
Document Title: ${formData.title}
Revision: ${formData.docRevision}
Analysis Mode: ${analysisMode || 'transient'}
SPICE Engine: ${engineVersion}
Simulation Executed: ${hasSimulated ? 'YES' : 'NO (Theoretical Only)'}
Verification Verdict: ${verificationEvaluation.overallState} (${verificationEvaluation.verdictSummary})

Circuit Netlist Topology:
${netlist}

BOM Components:
${bomSummary}

Measured SPICE Dynamic Data:
${hasSimulated ? simSummary : 'NO SIMULATION PERFORMED - THEORETICAL CALCULATIONS ONLY'}

CRITICAL ENGINEERING INTEGRITY RULES:
1. NEVER claim a simulation was run or verified if Simulation Executed is NO.
2. In Theoretical mode, state clearly that calculations are analytical models based on circuit physics.
3. In DVR mode, adhere strictly to the verification state: ${verificationEvaluation.overallState}. If periodic oscillation was suppressed or simulation duration was insufficient, state that plainly without false claims.
4. Express formulas in clean Unicode notation without LaTeX dollar delimiters.
5. Structure your response into these 5 exact sections:
   SECTION I. EXECUTIVE SUMMARY & CIRCUIT ARCHITECTURE
   SECTION II. OPERATING PRINCIPLES & GOVERNING FORMULAS
   SECTION III. SPICE SOLVER METHODOLOGY & NUMERICAL CONVERGENCE
   SECTION IV. DYNAMIC WAVEFORM ANALYSIS & MEASUREMENT DISCUSSION
   SECTION V. ENGINEERING SIGN-OFF & DISPOSITION`;

      let rawText = '';
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (response.ok) {
          const data = await response.json();
          rawText = (data.result as string) || '';
        }
      } catch (err) {
        console.warn('Gemini proxy unavailable, using high-grade deterministic fallback:', err);
      }

      const text = cleanEngineeringText(rawText);

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

        const executiveSummary =
          extract('EXECUTIVE SUMMARY', ['OPERATING PRINCIPLES', 'THEORY', 'SPICE SOLVER']) || formData.title;
        const operatingPrinciples =
          extract('OPERATING PRINCIPLES', ['SPICE SOLVER', 'SIMULATION METHODOLOGY']) || text;
        const simulationMethodology =
          extract('SPICE SOLVER', ['DYNAMIC WAVEFORM', 'MEASUREMENTS']) ||
          extract('SIMULATION METHODOLOGY', ['DYNAMIC WAVEFORM', 'MEASUREMENTS']);
        const dynamicPerformance =
          extract('DYNAMIC WAVEFORM', ['ENGINEERING SIGN-OFF', 'DISPOSITION', 'SIGN-OFF']) ||
          extract('MEASUREMENTS', ['ENGINEERING SIGN-OFF', 'DISPOSITION', 'SIGN-OFF']);
        const signOff =
          extract('ENGINEERING SIGN-OFF', []) ||
          extract('SIGN-OFF', []);

        setReportContent({
          executiveSummary: executiveSummary || `This technical report evaluates the performance of "${formData.title}".`,
          operatingPrinciples: operatingPrinciples || text,
          simulationMethodology:
            simulationMethodology ||
            `1. Schematic capture executed via NodeSim WebAssembly SPICE (${engineVersion}).\n2. Modified Nodal Analysis (MNA) with Sparse 1.3 LU matrix factorization.\n3. Dynamic time-step integration with adaptive local truncation error (LTE) control.`,
          dynamicPerformance: dynamicPerformance || (hasSimulated ? simSummary : 'No simulation performed; analytical baseline derived.'),
          signOff: signOff || verificationEvaluation.verdictSummary,
        });
      } else {
        // High-grade deterministic fallback strictly tied to 4 pillars
        const compCount = components.length;
        const compTypes = Array.from(new Set(components.map(c => c.type))).join(', ');
        
        let execSummary = '';
        if (docMode === 'THEORETICAL') {
          execSummary = `This Theoretical Engineering Report documents the mathematical modeling and circuit physics governing "${formData.title}". The circuit integrates ${compCount} discrete components (${compTypes}).\n\nNOTICE: This document is an analytical derivation. No SPICE numerical simulation results were utilized.`;
        } else if (docMode === 'SIMULATION') {
          execSummary = `This SPICE Simulation Report documents the experimental nodal voltages and transient vectors captured from "${formData.title}" using ${engineVersion}.\n\nSimulation executed in ${analysisMode.toUpperCase()} domain with ${compCount} active components (${compTypes}).`;
        } else {
          execSummary = `This Design Verification Report (DVR) provides formal engineering verification for "${formData.title}" under ${engineVersion}.\n\nPrimary Verification Status: ${verificationEvaluation.overallState} (${verificationEvaluation.verdictSummary}). Circuit integrates ${compCount} discrete components (${compTypes}).`;
        }

        setReportContent({
          executiveSummary: execSummary,
          operatingPrinciples: `THEORETICAL MODEL & CIRCUIT INVARIANTS:\n${topology.description}\n\nGoverning differential and algebraic constraints are solved via Kirchhoff's Current and Voltage Laws. Active semiconductor and timing subcircuits transition between continuous and discrete operating states according to specified device thresholds.`,
          simulationMethodology: hasSimulated
            ? `1. Netlist Topology Extraction: ${netlist.split('\n').filter(l => l.trim() && !l.startsWith('*')).length} active branches parsed.\n2. Numerical SPICE Engine: ${engineVersion}.\n3. Matrix Formulation: Sparse LU decomposition with partial pivoting.\n4. Convergence Tolerances: RELTOL=1e-3, VNTOL=1µV, ABSTOL=1pA.`
            : 'Theoretical analytical derivation. Numerical matrix solver was not executed.',
          dynamicPerformance: hasSimulated
            ? `MEASURED TRANSIENT PERFORMANCE SUMMARY:\n${simSummary || 'All signals converged within standard operating limits.'}`
            : 'Theoretical study; dynamic simulation waveforms are not applicable.',
          signOff: verificationEvaluation.verdictSummary,
        });
      }

      setStep('preview');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate report.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  /**
   * Generates publication-ready PDF in clean white IEEE technical report style.
   */
  const handleDownloadPDF = async () => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = 210;
      const pageH = 297;
      const margin = 16;
      const contentW = pageW - margin * 2;
      let y = margin;

      const docId = `NS-${docMode}-${Date.now().toString(36).toUpperCase()}`;

      const ensureSpace = (neededH: number): boolean => {
        if (y + neededH > pageH - 22) {
          doc.addPage();
          y = margin + 4;
          return true;
        }
        return false;
      };

      const addIeeeSectionHeader = (secNum: string, title: string) => {
        ensureSpace(18);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 153); // IEEE Blue
        doc.text(secNum + ' ', margin, y);
        const numW = doc.getTextWidth(secNum + ' ');
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin + numW, y);
        y += 2.5;
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.45);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
      };

      const addBodyText = (text: string, fontSize = 8.5, lineHeight = 4.6) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        const paragraphs = text.split('\n');
        for (const p of paragraphs) {
          const cleanP = p.trim();
          if (!cleanP) {
            y += 2;
            continue;
          }
          const lines = doc.splitTextToSize(cleanP, contentW);
          for (const line of lines) {
            ensureSpace(lineHeight + 2);
            doc.text(line, margin, y);
            y += lineHeight;
          }
          y += 1.5;
        }
      };

      const drawIeeeTable = (
        tableTitle: string,
        headers: string[],
        colWidths: number[],
        rows: string[][],
        verdictColIdx = -1
      ) => {
        if (rows.length === 0) return;
        ensureSpace(24);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(tableTitle, pageW / 2, y, { align: 'center' });
        y += 4;

        const headerH = 6.2;
        const rowH = 5.6;

        const renderHeader = () => {
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.4);
          doc.line(margin, y, margin + contentW, y);

          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentW, headerH, 'F');

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);

          let curX = margin;
          headers.forEach((h, i) => {
            doc.text(h, curX + 2, y + 4.2);
            curX += colWidths[i];
          });

          y += headerH;
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.3);
          doc.line(margin, y, margin + contentW, y);
        };

        renderHeader();

        rows.forEach((row, rIdx) => {
          if (ensureSpace(rowH + 2)) {
            renderHeader();
          }

          if (rIdx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentW, rowH, 'F');
          }

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);

          let curX = margin;
          row.forEach((cell, cIdx) => {
            if (cIdx === verdictColIdx) {
              const upper = cell.toUpperCase();
              if (upper === 'PASS') {
                doc.setTextColor(21, 128, 61);
                doc.setFont('helvetica', 'bold');
              } else if (upper === 'FAIL') {
                doc.setTextColor(220, 38, 38);
                doc.setFont('helvetica', 'bold');
              } else if (upper === 'INSUFFICIENT_DATA') {
                doc.setTextColor(2, 132, 199);
                doc.setFont('helvetica', 'bold');
              } else {
                doc.setTextColor(100, 116, 139);
              }
            } else if (cIdx === 0) {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(0, 102, 153);
            } else {
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(51, 65, 85);
            }

            const truncated = doc.splitTextToSize(cell, colWidths[cIdx] - 4)[0] || '';
            doc.text(truncated, curX + 2, y + 3.8);
            curX += colWidths[cIdx];
          });

          y += rowH;
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.line(margin, y, margin + contentW, y);
        });

        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + contentW, y);
        y += 6;
      };

      // Header Banner
      doc.setFillColor(0, 102, 153);
      doc.rect(margin, y, 22, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(docMode, margin + 2, y + 4.2);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('ENGINEERING TECHNICAL REPORT', margin + 26, y + 4.2);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`DOC-ID: ${docId}   |   ${formData.docRevision}`, pageW - margin, y + 4.2, { align: 'right' });

      y += 9;

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(formData.title || 'Electronic Circuit Report', contentW);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 6.5 + 2;

      // Subtitle
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      const subtitle = docMode === 'THEORETICAL'
        ? 'Theoretical Analytical Derivation, Governing Physical Invariants & Component Equations'
        : (docMode === 'SIMULATION'
            ? 'Experimental SPICE Simulation Waveforms, Numerical Nodal Vector Characterization'
            : 'Formal Hardware Design Verification (DVR), Acceptance Criteria Evaluation & Parametric Compliance');
      doc.text(subtitle, margin, y);
      y += 6;

      // Metadata Control Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentW, 14, 'FD');

      const colW = contentW / 4;
      const mItems = [
        { label: 'LEAD ENGINEER', val: formData.engineerName || 'Hardware Verification Engineer' },
        { label: 'ORGANIZATION', val: formData.organization },
        { label: 'SPICE ENGINE', val: engineVersion },
        { label: 'DATE & STATUS', val: `${formData.date} • ${verificationEvaluation.overallState}` },
      ];

      mItems.forEach((m, i) => {
        const xPos = margin + i * colW + 3;
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, xPos, y + 4.5);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(m.val, colW - 5)[0] || '', xPos, y + 9.5);
      });
      y += 18;

      // Theoretical Notice or Verification State Banner
      if (docMode === 'THEORETICAL') {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(148, 163, 184);
        doc.rect(margin, y, contentW, 10, 'FD');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('NOTICE: THEORETICAL ANALYSIS — NO SPICE SIMULATION RESULTS WERE USED.', margin + 4, y + 6);
        y += 14;
      } else {
        const isPass = verificationEvaluation.overallState === 'VERIFICATION_PASSED';
        const isInsufficient = verificationEvaluation.overallState === 'INSUFFICIENT_DATA';
        doc.setFillColor(isPass ? 240 : (isInsufficient ? 240 : 254), isPass ? 253 : (isInsufficient ? 249 : 242), isPass ? 244 : (isInsufficient ? 255 : 242));
        doc.setDrawColor(isPass ? 134 : (isInsufficient ? 125 : 252), isPass ? 239 : (isInsufficient ? 211 : 165), isPass ? 172 : (isInsufficient ? 252 : 165));
        doc.rect(margin, y, contentW, 11, 'FD');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isPass ? 21 : (isInsufficient ? 2 : 220), isPass ? 128 : (isInsufficient ? 132 : 38), isPass ? 61 : (isInsufficient ? 199 : 38));
        doc.text(`VERIFICATION STATE: ${verificationEvaluation.overallState}`, margin + 4, y + 5);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(verificationEvaluation.verdictSummary, margin + 4, y + 8.5);
        y += 15;
      }

      // SECTION I: EXECUTIVE SUMMARY
      addIeeeSectionHeader('SECTION I.', 'EXECUTIVE SUMMARY & CIRCUIT ARCHITECTURE');
      addBodyText(reportContent?.executiveSummary || '');
      y += 2;

      // SECTION II: OPERATING PRINCIPLES
      addIeeeSectionHeader('SECTION II.', 'OPERATING PRINCIPLES & GOVERNING FORMULAS');
      addBodyText(reportContent?.operatingPrinciples || '');
      y += 3;

      // Formula Cards in PDF
      if (formulaCards.length > 0) {
        formulaCards.forEach(f => {
          ensureSpace(24);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, y, contentW, 18, 'FD');

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 102, 153);
          doc.text(f.name, margin + 4, y + 4.5);

          doc.setFontSize(7.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(f.formula, margin + 4, y + 9);

          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(`In simple words: ${f.simpleExplanation}`, contentW - 8)[0] || '', margin + 4, y + 14);
          y += 21;
        });
      }

      // TABLE I: DYNAMIC READINGS (if simulated)
      if (hasSimulated && dynamicReadings.length > 0) {
        const t1Headers = ['SIGNAL VECTOR', 'MINIMUM', 'MAXIMUM', 'PEAK-TO-PEAK', 'DC MEAN', 'TRUE RMS'];
        const t1Widths = [38, 28, 28, 28, 28, 28];
        const t1Rows = dynamicReadings.map(r => [r.signal, r.min, r.max, r.vpp, r.avg, r.rms]);
        drawIeeeTable('TABLE I: TIME-DOMAIN ELECTRICAL MEASUREMENTS (NGSPICE SOLVER)', t1Headers, t1Widths, t1Rows);
      }

      // TABLE II: VERIFICATION MATRIX (in DVR mode)
      if (docMode === 'DVR' && verificationEvaluation.functionalVerification.testCases.length > 0) {
        const t2Headers = ['TEST ID', 'ENGINEERING OBJECTIVE', 'EXPECTED SPEC', 'MEASURED SIMULATION', 'VERDICT'];
        const t2Widths = [26, 48, 44, 42, 18];
        const t2Rows = verificationEvaluation.functionalVerification.testCases.map(tc => [
          tc.testId,
          tc.objective,
          tc.expected,
          tc.measuredValue,
          tc.verdict,
        ]);
        drawIeeeTable('TABLE II: FUNCTIONAL ACCEPTANCE & VERIFICATION MATRIX', t2Headers, t2Widths, t2Rows, 4);
      }

      // Visual Previews (Schematic & Grapher)
      if (schematicDataUrl || effectiveGraphSnapshot) {
        ensureSpace(68);
        const figW = contentW / 2 - 3;
        const figH = 48;

        if (schematicDataUrl) {
          doc.setFillColor(30, 41, 59);
          doc.rect(margin, y, figW, 5.5, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('FIGURE 1. CAPTURED SPICE TOPOLOGY', margin + 3, y + 4);

          doc.setDrawColor(203, 213, 225);
          doc.rect(margin, y + 5.5, figW, figH - 5.5);
          try {
            doc.addImage(schematicDataUrl, 'PNG', margin + 0.5, y + 6, figW - 1, figH - 6.5);
          } catch {}
        }

        if (effectiveGraphSnapshot && hasSimulated) {
          const fx2 = margin + figW + 6;
          doc.setFillColor(30, 41, 59);
          doc.rect(fx2, y, figW, 5.5, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('FIGURE 2. TRANSIENT WAVEFORM TRACES', fx2 + 3, y + 4);

          doc.setDrawColor(203, 213, 225);
          doc.rect(fx2, y + 5.5, figW, figH - 5.5);
          try {
            doc.addImage(effectiveGraphSnapshot, 'PNG', fx2 + 0.5, y + 6, figW - 1, figH - 6.5);
          } catch {}
        }
        y += figH + 6;
      }

      // TABLE III: BILL OF MATERIALS & STRESS AUDIT
      const t3Headers = ['ITEM', 'DESIGNATORS', 'QTY', 'COMPONENT TYPE', 'NOMINAL VALUE', 'RATED LIMIT / STRESS'];
      const t3Widths = [12, 34, 12, 40, 36, 44];
      const t3Rows = bomEntries.map(b => [
        String(b.item),
        b.designators,
        String(b.quantity),
        b.type,
        b.value,
        b.stressRating,
      ]);
      drawIeeeTable('TABLE III: BILL OF MATERIALS & ELECTRICAL OPERATING LIMITS', t3Headers, t3Widths, t3Rows);

      // SECTION III: SOLVER METHODOLOGY
      addIeeeSectionHeader('SECTION III.', 'SPICE SOLVER METHODOLOGY & NUMERICAL CONVERGENCE');
      addBodyText(reportContent?.simulationMethodology || '');
      y += 2;

      // SECTION IV: DYNAMIC PERFORMANCE
      addIeeeSectionHeader('SECTION IV.', 'DYNAMIC WAVEFORM ANALYSIS & MEASUREMENT DISCUSSION');
      addBodyText(reportContent?.dynamicPerformance || '');
      y += 2;

      // SECTION V: SIGN-OFF & DISPOSITION
      addIeeeSectionHeader('SECTION V.', 'ENGINEERING SIGN-OFF & HARDWARE DISPOSITION');
      addBodyText(reportContent?.signOff || '');
      y += 4;

      // Signature & Traceability Cards
      ensureSpace(28);
      const sigW = contentW / 2 - 4;
      const sigCardH = 22;

      // Lead Engineer Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, sigW, sigCardH, 1.5, 1.5, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('LEAD HARDWARE ENGINEER', margin + 4, y + 5);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formData.engineerName || 'Lead Verification Engineer', margin + 4, y + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(21, 128, 61);
      doc.text(`Recorded: ${formData.organization}`, margin + 4, y + 15);
      doc.setTextColor(148, 163, 184);
      doc.text(`Date: ${formData.date}`, margin + 4, y + 19);

      // System Trace Card
      const qax = margin + sigW + 8;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(qax, y, sigW, sigCardH, 1.5, 1.5, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('VERIFICATION ENGINE TRACE', qax + 4, y + 5);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(engineVersion, qax + 4, y + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(21, 128, 61);
      doc.text(`Audit Status: ${verificationEvaluation.overallState}`, qax + 4, y + 15);
      doc.setTextColor(148, 163, 184);
      doc.text(`Doc-ID: ${docId}`, qax + 4, y + 19);

      // Footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(margin, pageH - 10, pageW - margin, pageH - 10);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
          'Generated by NodeSim EDA (nodesimapp.com) • IEEE Technical Report Layout Profile',
          margin,
          pageH - 6
        );
        doc.text(
          `Page ${i} of ${totalPages} • ${formData.docRevision}`,
          pageW - margin,
          pageH - 6,
          { align: 'right' }
        );
      }

      const safeTitle = (formData.title || 'circuit').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${docMode}_${safeTitle}_${formData.docRevision}.pdf`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('PDF generation failed: ' + msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#0f172a',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 12,
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
          maxWidth: step === 'preview' ? 1040 : 640,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0f172a',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#006699',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <FileCheck2 size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                NodeSim Engineering Report Verification System
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Simulation-Aware Engineering Documentation · Clean IEEE Style
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#ffffff' }}>
          {step === 'form' && (
            <div>
              {/* Document Mode Selector */}
              <label style={labelStyle}>Select Engineering Document Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  {
                    id: 'DVR' as ReportDocMode,
                    title: 'Design Verification Report',
                    tag: 'DVR (Mode 3)',
                    desc: '4-Pillar verification matrix, test cases, theoretical vs. simulated comparison & sign-off.',
                    requiresSim: true,
                  },
                  {
                    id: 'SIMULATION' as ReportDocMode,
                    title: 'SPICE Simulation Report',
                    tag: 'Simulation (Mode 2)',
                    desc: 'Waveform traces, netlist, dynamic readings table, and solver convergence status.',
                    requiresSim: true,
                  },
                  {
                    id: 'THEORETICAL' as ReportDocMode,
                    title: 'Theoretical Report',
                    tag: 'Theory (Mode 1)',
                    desc: 'Analytical derivations, formulas & physical invariants. No simulation required.',
                    requiresSim: false,
                  },
                ].map(m => {
                  const active = docMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDocMode(m.id)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: active ? '#f0f9ff' : '#f8fafc',
                        border: active ? '2px solid #006699' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: active ? '#006699' : '#64748b', textTransform: 'uppercase' }}>
                          {m.tag}
                        </span>
                        {active && <CheckCircle2 size={14} color="#006699" />}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Simulation Status Notice */}
              {docMode !== 'THEORETICAL' && !hasSimulated && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertCircle size={20} color="#dc2626" />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#991b1b' }}>
                        SPICE Simulation Has Not Been Run
                      </div>
                      <div style={{ fontSize: 11.5, color: '#b91c1c' }}>
                        Simulation or DVR reports require executed simulation data. Run simulation first or switch to Theoretical mode.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await runSimulation();
                      } catch (e) {
                        console.error('Simulation error:', e);
                      }
                    }}
                    disabled={isSimulating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Run Simulation Now
                  </button>
                </div>
              )}

              {/* Adaptive Transient Advisory Box */}
              {hasSimulated && !coverage.isAdequate && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#92400e', fontSize: 12.5 }}>
                    <AlertTriangle size={18} color="#d97706" />
                    Adaptive Transient Coverage Advisory
                  </div>
                  <div style={{ fontSize: 12, color: '#78350f', margin: '4px 0 10px', lineHeight: 1.5 }}>
                    {coverage.advisoryMessage}
                  </div>
                  <button
                    onClick={handleRunAdaptiveSimulation}
                    disabled={isSimulating}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '7px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isSimulating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Apply & Run Adaptive Simulation ({coverage.recommendation.formattedStopTime} @ {coverage.recommendation.formattedStep})
                  </button>
                </div>
              )}

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Document Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. LM555 Astable Multivibrator Characterization"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Lead Engineer Name</label>
                    <input
                      type="text"
                      value={formData.engineerName}
                      onChange={e => setFormData({ ...formData, engineerName: e.target.value })}
                      placeholder="Engineer / Student Name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Organization / Institution</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. University / R&D Team"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Document Revision</label>
                    <input
                      type="text"
                      value={formData.docRevision}
                      onChange={e => setFormData({ ...formData, docRevision: e.target.value })}
                      placeholder="REV 1.0"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>SPICE Solver Runtime Engine</label>
                    <div
                      style={{
                        ...inputStyle,
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                      }}
                    >
                      {engineVersion}
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div style={{ marginTop: 14, color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: 8,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={docMode !== 'THEORETICAL' && !hasSimulated}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: docMode !== 'THEORETICAL' && !hasSimulated ? '#94a3b8' : '#006699',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: docMode !== 'THEORETICAL' && !hasSimulated ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Sparkles size={16} />
                  Generate {docMode} Report
                </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2 size={36} color="#006699" className="animate-spin" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 6 }}>
                Synthesizing Engineering Verification Document...
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Executing 4-Pillar verification audit, compiling dynamic measurements, and formatting IEEE layout.
              </div>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 14px' }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: '#991b1b', marginBottom: 6 }}>
                Report Generation Failed
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
                {errorMsg}
              </div>
              <button
                onClick={() => setStep('form')}
                style={{
                  background: '#006699',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Configuration
              </button>
            </div>
          )}

          {step === 'preview' && reportContent && (
            <div>
              {/* Document Paper Container */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: 24,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                  color: '#0f172a',
                }}
              >
                {/* Header Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #0f172a',
                    paddingBottom: 10,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        background: '#006699',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 11,
                        padding: '4px 10px',
                        borderRadius: 4,
                      }}
                    >
                      {docMode}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                        NODESIM EDA ENGINEERING DOCUMENTATION
                      </div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>
                        IEEE Technical Report Style Layout • Clean White Paper
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                    <div>REV: <strong style={{ color: '#006699' }}>{formData.docRevision}</strong></div>
                    <div>DATE: <strong>{formData.date}</strong></div>
                  </div>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {formData.title}
                </h1>
                <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 16 }}>
                  {docMode === 'THEORETICAL'
                    ? 'Theoretical Analytical Derivation, Circuit Invariants & Component Equations'
                    : (docMode === 'SIMULATION'
                        ? 'Experimental SPICE Simulation Vectors & Waveform Characterization'
                        : 'Formal Design Verification Report (DVR) & Multi-Pillar Acceptance Audit')}
                </div>

                {/* Metadata Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>LEAD ENGINEER</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {formData.engineerName || 'Lead Verification Engineer'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>ORGANIZATION</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {formData.organization}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>SPICE ENGINE</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#006699', marginTop: 2 }}>
                      {engineVersion}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>VERIFICATION STATE</div>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color:
                          verificationEvaluation.overallState === 'VERIFICATION_PASSED'
                            ? '#16a34a'
                            : (verificationEvaluation.overallState === 'INSUFFICIENT_DATA' ? '#0284c7' : '#dc2626'),
                        marginTop: 2,
                      }}
                    >
                      {verificationEvaluation.overallState}
                    </div>
                  </div>
                </div>

                {/* Theoretical Notice or Verification State Banner */}
                {docMode === 'THEORETICAL' ? (
                  <div
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 18,
                    }}
                  >
                    THEORETICAL ANALYSIS — NO SPICE SIMULATION RESULTS WERE USED. Verification verdicts are withheld.
                  </div>
                ) : (
                  <div
                    style={{
                      background:
                        verificationEvaluation.overallState === 'VERIFICATION_PASSED'
                          ? '#f0fdf4'
                          : (verificationEvaluation.overallState === 'INSUFFICIENT_DATA' ? '#f0f9ff' : '#fef2f2'),
                      border:
                        verificationEvaluation.overallState === 'VERIFICATION_PASSED'
                          ? '1px solid #bbf7d0'
                          : (verificationEvaluation.overallState === 'INSUFFICIENT_DATA' ? '1px solid #bae6fd' : '1px solid #fecaca'),
                      borderLeft:
                        verificationEvaluation.overallState === 'VERIFICATION_PASSED'
                          ? '5px solid #16a34a'
                          : (verificationEvaluation.overallState === 'INSUFFICIENT_DATA' ? '5px solid #0284c7' : '5px solid #dc2626'),
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color:
                          verificationEvaluation.overallState === 'VERIFICATION_PASSED'
                            ? '#15803d'
                            : (verificationEvaluation.overallState === 'INSUFFICIENT_DATA' ? '#0369a1' : '#991b1b'),
                        marginBottom: 2,
                      }}
                    >
                      VERDICT: {verificationEvaluation.overallState}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#334155' }}>
                      {verificationEvaluation.verdictSummary}
                    </div>
                  </div>
                )}

                {/* Section I: Executive Summary */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#006699',
                      borderBottom: '1.5px solid #0f172a',
                      paddingBottom: 4,
                      marginBottom: 8,
                    }}
                  >
                    SECTION I. EXECUTIVE SUMMARY & CIRCUIT ARCHITECTURE
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {reportContent.executiveSummary}
                  </div>
                </div>

                {/* Section II: Operating Principles & Formulas */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#006699',
                      borderBottom: '1.5px solid #0f172a',
                      paddingBottom: 4,
                      marginBottom: 8,
                    }}
                  >
                    SECTION II. OPERATING PRINCIPLES & GOVERNING FORMULAS
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 12 }}>
                    {reportContent.operatingPrinciples}
                  </div>

                  {/* Formula Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {formulaCards.map((f, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderLeft: '4px solid #006699',
                          borderRadius: 6,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#006699', marginBottom: 2 }}>
                          {f.name}
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: '#0f172a',
                            background: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            margin: '4px 0',
                          }}
                        >
                          {f.formula}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5, marginTop: 4 }}>
                          <strong>In simple words:</strong> {f.simpleExplanation}
                        </div>
                        {f.variables.length > 0 && (
                          <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #cbd5e1', fontSize: 10.5, color: '#64748b' }}>
                            {f.variables.map((v, vIdx) => (
                              <div key={vIdx} style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                <code style={{ fontWeight: 700, color: '#006699' }}>{v.symbol}:</code>
                                <span>{v.meaning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table I: Dynamic Readings (if simulated) */}
                {hasSimulated && dynamicReadings.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 6 }}>
                      TABLE I: TIME-DOMAIN ELECTRICAL MEASUREMENTS (NGSPICE SOLVER)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>SIGNAL</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>MIN</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>MAX</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>PEAK-TO-PEAK</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>DC MEAN</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>TRUE RMS</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>BEHAVIOR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dynamicReadings.map((r, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 700, color: '#006699' }}>{r.signal}</td>
                              <td style={{ padding: '6px 8px' }}>{r.min}</td>
                              <td style={{ padding: '6px 8px' }}>{r.max}</td>
                              <td style={{ padding: '6px 8px', fontWeight: 700, color: '#16a34a' }}>{r.vpp}</td>
                              <td style={{ padding: '6px 8px' }}>{r.avg}</td>
                              <td style={{ padding: '6px 8px' }}>{r.rms}</td>
                              <td style={{ padding: '6px 8px', fontSize: 10.5, color: '#64748b' }}>{r.behavior}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Table II: Verification Acceptance Matrix (in DVR mode) */}
                {docMode === 'DVR' && verificationEvaluation.functionalVerification.testCases.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 6 }}>
                      TABLE II: FUNCTIONAL ACCEPTANCE & VERIFICATION MATRIX
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>TEST ID</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>OBJECTIVE</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>EXPECTED SPEC</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>MEASURED SIMULATION</th>
                            <th style={{ padding: '6px 8px', fontWeight: 800 }}>VERDICT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verificationEvaluation.functionalVerification.testCases.map((tc, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 700, color: '#006699' }}>{tc.testId}</td>
                              <td style={{ padding: '6px 8px', color: '#0f172a' }}>{tc.objective}</td>
                              <td style={{ padding: '6px 8px', color: '#64748b' }}>{tc.expected}</td>
                              <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>{tc.measuredValue}</td>
                              <td style={{ padding: '6px 8px' }}>
                                <span
                                  style={{
                                    background:
                                      tc.verdict === 'PASS'
                                        ? '#dcfce7'
                                        : (tc.verdict === 'FAIL' ? '#fee2e2' : '#e0f2fe'),
                                    color:
                                      tc.verdict === 'PASS'
                                        ? '#15803d'
                                        : (tc.verdict === 'FAIL' ? '#b91c1c' : '#0369a1'),
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 800,
                                  }}
                                >
                                  {tc.verdict}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Visual Previews (Schematic & Grapher) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', fontSize: 10, fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                      FIGURE 1. CAPTURED SPICE SCHEMATIC TOPOLOGY
                    </div>
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 6 }}>
                      {schematicDataUrl ? (
                        <img src={schematicDataUrl} alt="Schematic" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Schematic Preview</div>
                      )}
                    </div>
                  </div>

                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', fontSize: 10, fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                      FIGURE 2. TRANSIENT WAVEFORM VERIFICATION
                    </div>
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 6 }}>
                      {effectiveGraphSnapshot && hasSimulated ? (
                        <img src={effectiveGraphSnapshot} alt="Waveforms" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          {hasSimulated ? 'Waveform Canvas' : 'Simulation Waveforms (Not Available)'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table III: Bill of Materials & Stress Limits */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 6 }}>
                    TABLE III: BILL OF MATERIALS & ELECTRICAL OPERATING LIMITS
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>ITEM</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>DESIGNATORS</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>QTY</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>TYPE</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>VALUE</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>RATED LIMIT / STRESS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bomEntries.map((b, idx) => (
                          <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px', color: '#64748b' }}>{b.item}</td>
                            <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 700, color: '#006699' }}>{b.designators}</td>
                            <td style={{ padding: '6px 8px' }}>{b.quantity}</td>
                            <td style={{ padding: '6px 8px' }}>{b.type}</td>
                            <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{b.value}</td>
                            <td style={{ padding: '6px 8px', fontSize: 10.5, color: '#475569' }}>{b.stressRating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section III: Solver Methodology */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#006699', borderBottom: '1.5px solid #0f172a', paddingBottom: 4, marginBottom: 8 }}>
                    SECTION III. SPICE SOLVER METHODOLOGY & NUMERICAL CONVERGENCE
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {reportContent.simulationMethodology}
                  </div>
                </div>

                {/* Section IV: Dynamic Waveform Discussion */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#006699', borderBottom: '1.5px solid #0f172a', paddingBottom: 4, marginBottom: 8 }}>
                    SECTION IV. DYNAMIC WAVEFORM ANALYSIS & MEASUREMENT DISCUSSION
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {reportContent.dynamicPerformance}
                  </div>
                </div>

                {/* Section V: Engineering Sign-off & Disposition */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#006699', borderBottom: '1.5px solid #0f172a', paddingBottom: 4, marginBottom: 8 }}>
                    SECTION V. ENGINEERING SIGN-OFF & HARDWARE DISPOSITION
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 14 }}>
                    {reportContent.signOff}
                  </div>

                  {/* Dual Signature Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>LEAD HARDWARE ENGINEER</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                        {formData.engineerName || 'Lead Verification Engineer'}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 700 }}>
                        {formData.organization}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Timestamp: {formData.date}</div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>VERIFICATION ENGINE TRACE</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                        {engineVersion}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#006699', fontWeight: 700 }}>
                        Audit Status: {verificationEvaluation.overallState}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>NodeSim Verification Framework v1.0</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => setStep('form')}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    borderRadius: 8,
                    padding: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  ← Edit Settings
                </button>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: '#006699',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  <Download size={16} /> Download {docMode} Report (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
