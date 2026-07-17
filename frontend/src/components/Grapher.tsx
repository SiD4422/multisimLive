import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { getSpiceNodeForPoint } from '../utils/netlister';
import { computeFFT } from '../utils/fftAnalyzer';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Brush, ReferenceLine
} from 'recharts';
import { Activity, Download, Crosshair, Table2, BarChart2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { generateCSV } from '../utils/csvExport';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

const OSC_COLORS = [
  '#00ffff', '#39ff14', '#ff00ff', '#ffff00', '#ff4500', '#00bfff'
];

// 🔧 Helpers 🔧

function formatTraceName(t: string): string {
  if (t.startsWith('v(')) {
    const node = t.match(/v\(([^)]+)\)/i)?.[1] || '';
    if (node && !isNaN(Number(node))) return `Node ${node} Voltage`;
    if (node) return `${node.toUpperCase()} Voltage`;
    return t;
  }
  if (t.startsWith('i(')) {
    const comp = t.match(/i\(([^)]+)\)/i)?.[1] || '';
    if (comp.startsWith('v_')) {
      return `${comp.replace('v_', '').toUpperCase()} Current`;
    }
    if (comp.includes('.x_')) {
      const subComp = comp.match(/x_([a-z0-9]+)/i)?.[1] || '';
      if (subComp) return `${subComp.toUpperCase()} Current`;
    }
    if (comp.startsWith('x_')) {
       return `${comp.replace('x_','').toUpperCase()} Current`;
    }
    return `${comp.toUpperCase()} Current`;
  }
  return t;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHz(val: number): string {
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}MHz`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}kHz`;
  return `${val.toFixed(0)}Hz`;
}

function formatTime(val: number): string {
  return `${(val * 1000).toFixed(2)}ms`;
}

function fmtNum(value: number): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 10000 || abs < 0.001) return value.toExponential(3);
  return Number(value.toFixed(4)).toString();
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
    <p>Running SPICE Simulation...</p>
  </div>
);

const MeasurementsPanel = ({ data, traces, plotType }: { data: any[], traces: string[], plotType: string }) => {
  if (plotType !== 'transient' || !data || data.length < 2 || traces.length === 0) return null;

  const measurements = traces.map(trace => {
    let min = Infinity;
    let max = -Infinity;
    
    // Pass 1: Find min, max and time-weighted mean (User Bug 1)
    let sumVdt = 0;
    let totalT_mean = 0;
    for (let i = 1; i < data.length; i++) {
      const v1 = data[i-1][trace];
      const v2 = data[i][trace];
      const t1 = data[i-1].time;
      const t2 = data[i].time;
      if (v1 === undefined || v2 === undefined || t1 === undefined || t2 === undefined) continue;
      
      const dt = t2 - t1;
      sumVdt += 0.5 * (v1 + v2) * dt;
      totalT_mean += dt;
      
      if (v1 < min) min = v1;
      if (v1 > max) max = v1;
    }
    // Also check last point for min/max
    if (data.length > 0) {
      const vLast = data[data.length - 1][trace];
      if (vLast !== undefined) {
        if (vLast < min) min = vLast;
        if (vLast > max) max = vLast;
      }
    }
    
    const mean = totalT_mean > 0 ? sumVdt / totalT_mean : 0;
    
    // Pass 2: Calculate RMS and find zero crossings based on the correct mean
    let sumSqInt = 0;
    let crossings: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const v1 = data[i-1][trace];
      const v2 = data[i][trace];
      const t1 = data[i-1].time;
      const t2 = data[i].time;
      if (v1 === undefined || v2 === undefined || t1 === undefined || t2 === undefined) continue;
      
      const dt = t2 - t1;
      sumSqInt += 0.5 * (v1 * v1 + v2 * v2) * dt;
      
      // Positive-going crossing of the mean
      if (v1 <= mean && v2 > mean) {
        const fraction = (mean - v1) / (v2 - v1);
        crossings.push(t1 + fraction * dt);
      }
    }
    
    const totalT = data.length > 1 ? data[data.length - 1].time - data[0].time : 0;
    const rms = totalT > 0 ? Math.sqrt(sumSqInt / totalT) : 0;
    const pkpk = max === -Infinity ? 0 : max - min;
    
    let freqStr = 'N/A';
    if (crossings.length >= 2) {
      // User Bug 2: Average over all crossings
      const numPeriods = crossings.length - 1;
      const totalPeriodTime = crossings[crossings.length - 1] - crossings[0];
      if (totalPeriodTime > 0) {
        const avgPeriod = totalPeriodTime / numPeriods;
        freqStr = formatHz(1 / avgPeriod);
      }
    } else {
      freqStr = 'DC';
    }

    return { trace, min, max, pkpk, rms, freqStr };
  });

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur border border-gray-200 rounded shadow-lg overflow-hidden flex flex-col pointer-events-auto z-10 text-xs">
      <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200 font-bold text-gray-700 flex justify-between">
        <span>Measurements</span>
      </div>
      <div className="flex flex-row overflow-x-auto p-2 gap-4">
        {measurements.map((m, idx) => (
          <div key={m.trace} className="flex flex-col min-w-[120px] bg-gray-50 border border-gray-200 rounded p-2">
            <span className="font-bold mb-1 border-b pb-1 truncate" style={{color: COLORS[idx % COLORS.length]}}>{m.trace}</span>
            <div className="flex justify-between"><span>Vpp:</span> <span className="font-mono">{fmtNum(m.pkpk)}V</span></div>
            <div className="flex justify-between"><span>RMS:</span> <span className="font-mono">{fmtNum(m.rms)}V</span></div>
            <div className="flex justify-between"><span>Freq:</span> <span className="font-mono">{m.freqStr}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ErrorView = ({ error }: { error: string }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-8 pl-[80px] overflow-y-auto">
    <div className="flex flex-col items-center text-center max-w-2xl w-full">
      <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="text-xl font-bold text-red-600 mb-4">Simulation Failed</h3>
      <div className="w-full bg-red-100 p-4 rounded text-left overflow-x-auto border border-red-200">
        <pre className="text-sm font-mono text-red-800 whitespace-pre-wrap">{error}</pre>
      </div>
      <p className="mt-6 text-sm text-gray-500 bg-white p-3 rounded shadow-sm border">
        <strong className="text-gray-700">Tip:</strong> Ensure your circuit has a <strong>Ground</strong> reference and no disconnected wires.
      </p>
    </div>
  </div>
);

const EmptyView = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
    <p>No simulation data. Go to Schematic and click <strong>Run</strong>.</p>
  </div>
);

// ── FFT Spectrum Plot ─────────────────────────────────────────────────────────

function FftPlot({ simulationBuffer, traces, isOscilloscope }: {
  simulationBuffer: any[];
  traces: string[];
  isOscilloscope: boolean;
}) {
  const colors = isOscilloscope ? OSC_COLORS : COLORS;
  const bg = isOscilloscope ? '#001100' : '#fff';
  const gridColor = isOscilloscope ? '#003300' : '#e5e7eb';
  const textColor = isOscilloscope ? '#00ff00' : '#6b7280';

  const fftData = useMemo(() => {
    if (!simulationBuffer || simulationBuffer.length < 4) return [];
    // Each trace gets its own FFT, merged into one row array keyed by frequency
    const times = simulationBuffer.map((r: any) => r.time as number);
    const allBins: Record<string, number>[] = [];

    // Use first trace's frequencies as the base x-axis
    const firstTrace = traces[0];
    if (!firstTrace) return [];

    const firstValues = simulationBuffer.map((r: any) => (r[firstTrace] ?? 0) as number);
    const firstBins = computeFFT(times, firstValues);
    if (firstBins.length === 0) return [];

    // Build rows using first trace's frequency grid
    firstBins.forEach(bin => {
      allBins.push({ frequency: bin.frequency, [firstTrace]: bin.db });
    });

    // Add other traces, matching by index
    traces.slice(1).forEach(trace => {
      const vals = simulationBuffer.map((r: any) => (r[trace] ?? 0) as number);
      const bins = computeFFT(times, vals);
      bins.forEach((bin, i) => {
        if (allBins[i]) allBins[i][trace] = bin.db;
      });
    });

    return allBins;
  }, [simulationBuffer, traces]);

  if (fftData.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
        <div style={{ textAlign: 'center', color: textColor, opacity: 0.5 }}>
          <BarChart2 size={40} style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13 }}>Run a transient simulation to see FFT spectrum</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, padding: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: textColor, marginBottom: 4, paddingLeft: 40 }}>
        Frequency Spectrum (dBV)
      </p>
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fftData} margin={{ top: 5, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="frequency"
              type="number"
              scale="log"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatHz}
              tick={{ fill: textColor, fontSize: 11 }}
              label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -15, fill: textColor, fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: textColor, fontSize: 11 }}
              label={{ value: 'dBV', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(v: any) => `Freq: ${formatHz(Number(v))}`}
              formatter={(val: any, name: any) => [fmtNum(val as number) + ' dBV', name]}
              contentStyle={isOscilloscope ? { backgroundColor: '#001100', border: '1px solid #00ff00', color: '#00ff00' } : undefined}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={isOscilloscope ? { color: '#00ff00' } : undefined} />
            {traces.map((t, i) => (
              <Line
                key={t} name={t} type="monotone" dataKey={t}
                stroke={colors[i % colors.length]} dot={false} strokeWidth={isOscilloscope ? 2 : 1.5}
                isAnimationActive={false}
                style={isOscilloscope ? { filter: `drop-shadow(0px 0px 3px ${colors[i % colors.length]})` } : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── ErrorView ─────────────────────────────────────────────────────────────────

function BodePlot({ data, traces, probeMap, isOscilloscope, isCursorMode, cursorA, setCursorA, cursorB, setCursorB }: { 
  data: any[]; traces: string[]; probeMap: Record<string, string>; isOscilloscope: boolean;
  isCursorMode: boolean; cursorA: any; setCursorA: any; cursorB: any; setCursorB: any;
}) {
  const dbTraces = traces.filter(t => t.endsWith('_db'));
  const phaseTraces = traces.filter(t => t.endsWith('_phase'));

  const getDisplayName = (name: string) => {
    const baseName = name.replace(/_db$|_phase$/, '');
    // Try to find the original mapped probe name
    const pk = Object.keys(probeMap).find(k => k.toLowerCase().includes(baseName.toLowerCase()) || baseName.toLowerCase().includes(k.toLowerCase()));
    return pk ? probeMap[pk] : formatTraceName(baseName);
  };

  const commonChartProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    onClick: isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorA(e.activePayload[0].payload); } : undefined,
    onMouseMove: isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorB(e.activePayload[0].payload); } : undefined,
    onMouseLeave: isCursorMode ? () => setCursorB(null) : undefined,
  };

  const colors = isOscilloscope ? OSC_COLORS : COLORS;
  const gridColor = isOscilloscope ? '#003300' : '#e5e7eb';
  const textColor = isOscilloscope ? '#00ff00' : '#6b7280';

  const commonXAxis = (
    <XAxis
      dataKey="frequency"
      type="number"
      scale="log"
      domain={['dataMin', 'dataMax']}
      tickFormatter={formatHz}
      tick={{ fill: textColor }}
      label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, fill: textColor }}
    />
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: isOscilloscope ? '#001100' : '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Magnitude chart - top half */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%' }}>
        <p className={`text-xs font-bold uppercase tracking-wide pl-12 pb-1 ${isOscilloscope ? 'text-green-500' : 'text-gray-500'}`}>Magnitude (dB)</p>
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, bottom: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            {commonXAxis}
            <YAxis label={{ value: 'dB', angle: -90, position: 'insideLeft', fill: textColor }} domain={['auto', 'auto']} tick={{ fill: textColor }} />
            <Tooltip
              labelFormatter={(v: any) => `Freq: ${formatHz(Number(v))}`}
              formatter={(val: any, name: any) => [fmtNum(val as number) + ' dB', name]}
              contentStyle={isOscilloscope ? { backgroundColor: '#001100', border: '1px solid #00ff00', color: '#00ff00' } : undefined}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={isOscilloscope ? { color: '#00ff00' } : undefined} />
            {isCursorMode && cursorA && <ReferenceLine x={cursorA.frequency} stroke="#ff0000" strokeWidth={2} />}
            {isCursorMode && cursorB && <ReferenceLine x={cursorB.frequency} stroke="#ff00ff" strokeWidth={2} strokeDasharray="3 3" />}
            {/* -3dB reference line: at maxDb - 3 */}
            {dbTraces.length > 0 && (() => {
              const allDbVals = data.flatMap(row => dbTraces.map(t => row[t] ?? -Infinity));
              const maxDbVal = Math.max(...allDbVals.filter(v => isFinite(v)));
              if (!isFinite(maxDbVal)) return null;
              return (
                <ReferenceLine
                  y={maxDbVal - 3}
                  stroke="#f59e0b"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{ value: '-3dB', position: 'right', fill: '#f59e0b', fontSize: 11, fontWeight: 700 }}
                />
              );
            })()}
            {dbTraces.map((t, i) => (
              <Line key={t} name={getDisplayName(t)} type="monotone" dataKey={t}
                stroke={colors[i % colors.length]} dot={false} strokeWidth={isOscilloscope ? 3 : 2} isAnimationActive={false} style={isOscilloscope ? { filter: `drop-shadow(0px 0px 4px ${colors[i % colors.length]})` } : undefined} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Phase chart - bottom half */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, bottom: 0 }}>
        <p className={`text-xs font-bold uppercase tracking-wide pl-12 pb-1 ${isOscilloscope ? 'text-green-500' : 'text-gray-500'}`}>Phase (°)</p>
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, bottom: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            {commonXAxis}
            <YAxis label={{ value: 'Phase (°)', angle: -90, position: 'insideLeft', fill: textColor }} domain={[-180, 180]} tick={{ fill: textColor }} />
            <Tooltip
              labelFormatter={(v: any) => `Freq: ${formatHz(Number(v))}`}
              formatter={(val: any, name: any) => [fmtNum(val as number) + '°', name]}
              contentStyle={isOscilloscope ? { backgroundColor: '#001100', border: '1px solid #00ff00', color: '#00ff00' } : undefined}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={isOscilloscope ? { color: '#00ff00' } : undefined} />
            {isCursorMode && cursorA && <ReferenceLine x={cursorA.frequency} stroke="#ff0000" strokeWidth={2} />}
            {isCursorMode && cursorB && <ReferenceLine x={cursorB.frequency} stroke="#ff00ff" strokeWidth={2} strokeDasharray="3 3" />}
            {phaseTraces.map((t, i) => (
              <Line key={t} name={getDisplayName(t) + ' phase'} type="monotone" dataKey={t}
                stroke={colors[i % colors.length]} dot={false} strokeWidth={isOscilloscope ? 3 : 2} strokeDasharray="5 3" isAnimationActive={false} style={isOscilloscope ? { filter: `drop-shadow(0px 0px 4px ${colors[i % colors.length]})` } : undefined} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── DC Sweep Plot ─────────────────────────────────────────────────────────────

function DcSweepPlot({ data, traces, sweepKey, isOscilloscope, isCursorMode, cursorA, setCursorA, cursorB, setCursorB }: { 
  data: any[]; traces: string[]; sweepKey: string; isOscilloscope: boolean;
  isCursorMode: boolean; cursorA: any; setCursorA: any; cursorB: any; setCursorB: any;
}) {
  const [brushRange, setBrushRange] = useState<{ start?: number; end?: number } | null>(null);

  const colors = isOscilloscope ? OSC_COLORS : COLORS;
  const gridColor = isOscilloscope ? '#003300' : '#e5e7eb';
  const textColor = isOscilloscope ? '#00ff00' : '#6b7280';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: isOscilloscope ? '#001100' : '#fff', padding: 8 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: isOscilloscope ? '#00ff00' : '#374151', margin: '0 0 4px 8px' }}>DC Sweep Analysis</h3>
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            onClick={isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorA(e.activePayload[0].payload); } : undefined}
            onMouseMove={isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorB(e.activePayload[0].payload); } : undefined}
            onMouseLeave={isCursorMode ? () => setCursorB(null) : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={sweepKey}
              type="number"
              tickFormatter={(v) => `${v}V`}
              tick={{ fill: textColor }}
              label={{ value: `${sweepKey} (V)`, position: 'insideBottom', offset: -15, fill: textColor }}
            />
            <YAxis label={{ value: 'Voltage / Current', angle: -90, position: 'insideLeft', offset: -5, fill: textColor }} domain={['auto', 'auto']} tick={{ fill: textColor }} />
            <Tooltip
              formatter={(val: any, name: any) => [fmtNum(val as number), name]}
              labelFormatter={(v: any) => `${sweepKey}: ${Number(v).toFixed(3)}V`}
              contentStyle={isOscilloscope ? { backgroundColor: '#001100', border: '1px solid #00ff00', color: '#00ff00' } : undefined}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={isOscilloscope ? { color: '#00ff00' } : undefined} />
            {isCursorMode && cursorA && <ReferenceLine x={cursorA[sweepKey]} stroke="#ff0000" strokeWidth={2} />}
            {isCursorMode && cursorB && <ReferenceLine x={cursorB[sweepKey]} stroke="#ff00ff" strokeWidth={2} strokeDasharray="3 3" />}
            {traces.map((t, i) => (
              <Line key={t} name={t} type="monotone" dataKey={t}
                stroke={colors[i % colors.length]} dot={false} strokeWidth={isOscilloscope ? 3 : 2} isAnimationActive={false} style={isOscilloscope ? { filter: `drop-shadow(0px 0px 4px ${colors[i % colors.length]})` } : undefined} />
            ))}
            <Brush
              dataKey={sweepKey}
              height={30}
              stroke={isOscilloscope ? "#00ff00" : "#10b981"}
              fill={isOscilloscope ? "#002200" : undefined}
              tickFormatter={(v) => `${Number(v).toFixed(1)}V`}
              startIndex={brushRange?.start ?? 0}
              endIndex={brushRange?.end ?? (data.length - 1)}
              onChange={(e: any) => { if (e) setBrushRange({ start: e.startIndex, end: e.endIndex }); }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Transient Plot ────────────────────────────────────────────────────────────

function TransientPlot({ data, traces, probeMap, playbackTime, isOscilloscope, isCursorMode, cursorA, setCursorA, cursorB, setCursorB }: {
  data: any[]; traces: string[]; probeMap: Record<string, string>; playbackTime: number; isOscilloscope: boolean;
  isCursorMode: boolean; cursorA: any; setCursorA: any; cursorB: any; setCursorB: any;
}) {
  const [zoomDomain, setZoomDomain] = useState<[number | 'dataMin', number | 'dataMax']>(['dataMin', 'dataMax']);
  const [brushRange, setBrushRange] = useState<{ start?: number; end?: number } | null>(null);

  React.useEffect(() => {
    if (playbackTime === 0) {
      setZoomDomain(['dataMin', 'dataMax']);
      setBrushRange(null);
    }
  }, [playbackTime]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!data || data.length < 2) return;
    if (e.cancelable) e.preventDefault();
    const dataMin = data[0].time;
    const dataMax = data[data.length - 1].time;
    let currentMin = zoomDomain[0] === 'dataMin' ? dataMin : (zoomDomain[0] as number);
    let currentMax = zoomDomain[1] === 'dataMax' ? dataMax : (zoomDomain[1] as number);
    const range = currentMax - currentMin;
    if (range <= 0) return;
    const zoomDelta = e.deltaY < 0 ? -(range * 0.1) : (range * 0.1);
    let newMin = Math.max(dataMin, currentMin - zoomDelta);
    let newMax = Math.min(dataMax, currentMax + zoomDelta);
    if (newMax - newMin < 0.001) { const c = (currentMin + currentMax) / 2; newMin = c - 0.0005; newMax = c + 0.0005; }
    if (newMin <= dataMin && newMax >= dataMax) setZoomDomain(['dataMin', 'dataMax']);
    else setZoomDomain([newMin, newMax]);
  };

  const colors = isOscilloscope ? OSC_COLORS : COLORS;
  const gridColor = isOscilloscope ? '#003300' : '#e5e7eb';
  const textColor = isOscilloscope ? '#00ff00' : '#6b7280';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: isOscilloscope ? '#001100' : '#fff', padding: 8 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: isOscilloscope ? '#00ff00' : '#374151', margin: '0 0 4px 8px' }}>Transient Analysis</h3>
      {/* Chart area: from below the title to bottom */}
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 0 }} onWheel={handleWheel}>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              onClick={isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorA(e.activePayload[0].payload); } : undefined}
              onMouseMove={isCursorMode ? (e: any) => { if (e && e.activePayload) setCursorB(e.activePayload[0].payload); } : undefined}
              onMouseLeave={isCursorMode ? () => setCursorB(null) : undefined}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="time"
                type="number"
                tickFormatter={formatTime}
                domain={zoomDomain}
                allowDataOverflow
                tick={{ fill: textColor }}
                label={{ value: 'Time (ms)', position: 'insideBottom', offset: -15, fill: textColor }}
              />
              <YAxis label={{ value: 'Voltage / Current', angle: -90, position: 'insideLeft', offset: -5, fill: textColor }} domain={['auto', 'auto']} tick={{ fill: textColor }} />
              <Tooltip
                formatter={(value: any, name: any) => [fmtNum(value as number), name]}
                labelFormatter={(label: any) => `Time: ${(parseFloat(label) * 1000).toFixed(4)}ms`}
                contentStyle={isOscilloscope ? { backgroundColor: '#001100', border: '1px solid #00ff00', color: '#00ff00' } : undefined}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={isOscilloscope ? { color: '#00ff00' } : undefined} />
              {isCursorMode && cursorA && <ReferenceLine x={cursorA.time} stroke="#ff0000" strokeWidth={2} />}
              {isCursorMode && cursorB && <ReferenceLine x={cursorB.time} stroke="#ff00ff" strokeWidth={2} strokeDasharray="3 3" />}
              {traces.map((traceName, idx) => {
                const displayName = probeMap[traceName] || formatTraceName(traceName);
                return (
                  <Line key={traceName} name={displayName} type="monotone" dataKey={traceName}
                    stroke={colors[idx % colors.length]} dot={false} strokeWidth={isOscilloscope ? 3 : 2} isAnimationActive={false} style={isOscilloscope ? { filter: `drop-shadow(0px 0px 4px ${colors[idx % colors.length]})` } : undefined} />
                );
              })}
              <Brush
                dataKey="time"
                height={30}
                stroke={isOscilloscope ? "#00ff00" : "#10b981"}
                fill={isOscilloscope ? "#002200" : undefined}
                tickFormatter={(val) => `${(val * 1000).toFixed(1)}ms`}
                startIndex={brushRange?.start ?? Math.max(0, data.length - 200)}
                endIndex={brushRange?.end ?? (data.length - 1)}
                onChange={(e: any) => { if (e) setBrushRange({ start: e.startIndex, end: e.endIndex }); }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
}

// ── Main Grapher ──────────────────────────────────────────────────────────────

export default function Grapher() {
  const {
    simulationBuffer, playbackTime, isSimulating, simulationError,
    probes, components, wires, analysisMode, isPlaying
  } = useSchematicStore();
  
  const [isOscilloscope, setIsOscilloscope] = useState(false);
  const [isCursorMode, setIsCursorMode] = useState(false);
  const [showFft, setShowFft] = useState(false);
  const [cursorA, setCursorA] = useState<any>(null);
  const [cursorB, setCursorB] = useState<any>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);

  // Measure the container so charts always get real pixel dimensions
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const TOOLBAR_H = 44; // toolbar row height in px

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Build a map: raw data key → probe display name
  const probeMap = useMemo(() => {
    const map: Record<string, string> = {};
    probes.forEach((probe, idx) => {
      const name = probe.id || `${probe.type} Probe ${idx + 1}`;
      if (probe.type === 'Voltage') {
        const nodeId = getSpiceNodeForPoint(probe.position, components, wires);
        map[`v_${nodeId}`] = name;
      } else if (probe.type === 'Current') {
        map[`i_v_probe_${probe.id.toLowerCase()}`] = name;
      }
    });
    return map;
  }, [probes, components, wires]);

  // Format data for Recharts (safe key names)
  const formattedData = useMemo(() => {
    if (!simulationBuffer || simulationBuffer.length === 0) return [];

    const plotType = (simulationBuffer as any).__plotType || 'transient';
    const isAcOrDc = plotType === 'ac' || plotType === 'dc';

    // For AC/DC: always show all data.
    // For Transient: show all data when NOT actively playing (i.e. playback is paused/done).
    // Only filter by time when isPlaying is true (live animation).
    const activeData = (isAcOrDc || !isPlaying)
      ? simulationBuffer
      : simulationBuffer.filter(row => row.time <= playbackTime);

    const visible = activeData.length === 0 && simulationBuffer.length > 0
      ? [simulationBuffer[0]]
      : activeData;

    return visible
      .filter(row => {
        // Guard: log(0) = -Infinity → crashes Recharts log scale on XAxis
        if (plotType === 'ac') return row.frequency > 0;
        return true;
      })
      .map(row => {
        const newRow: any = {};
        Object.keys(row).forEach(k => {
          const safeKey = k.replace(/\(/g, '_').replace(/\)/g, '');
          newRow[safeKey] = row[k];
        });
        return newRow;
      });
  }, [simulationBuffer, playbackTime, isPlaying]);


  // Decide which traces to show
  const { traces, sweepKey } = useMemo(() => {
    if (formattedData.length === 0) return { traces: [], sweepKey: 'time' };

    const allKeys = Object.keys(formattedData[0]);
    console.log('GRAPHER DATA KEYS:', allKeys);
    console.log('GRAPHER DATA [0]:', formattedData[0]);

    const plotType = (simulationBuffer as any)?.__plotType || 'transient';

    if (plotType === 'ac') {
      // Only show _db and _phase keys
      const dbKeys = allKeys.filter(k => k.endsWith('_db'));
      const phaseKeys = allKeys.filter(k => k.endsWith('_phase'));
      // Filter to probed nodes only if probes placed
      if (probes.length > 0) {
        const probedDbKeys = dbKeys.filter(k => {
          const baseName = k.replace('_db', '').toLowerCase();
          return Object.keys(probeMap).some(pk => {
            const pkl = pk.toLowerCase();
            return pkl.includes(baseName) || baseName.includes(pkl);
          });
        });
        if (probedDbKeys.length > 0) {
          const probedPhaseKeys = probedDbKeys.map(k => k.replace('_db', '_phase')).filter(k => phaseKeys.includes(k));
          return { traces: [...probedDbKeys, ...probedPhaseKeys], sweepKey: 'frequency' };
        }
      }
      return { traces: [...dbKeys, ...phaseKeys], sweepKey: 'frequency' };
    }

    if (plotType === 'dc') {
      const xKey = allKeys[0]; // first key is the sweep variable
      const valueKeys = allKeys.filter(k => k !== xKey);
      if (probes.length > 0) {
        const probedKeys = Object.keys(probeMap).filter(k => valueKeys.includes(k));
        if (probedKeys.length > 0) return { traces: probedKeys, sweepKey: xKey };
      }
      return { traces: valueKeys, sweepKey: xKey };
    }

    // Transient
    const timeKey = 'time';
    let valueKeys = allKeys.filter(k => k !== timeKey);

    // Filter out internal SPICE sub-circuit nodes (e.g. x_u1.latch, x_u1.ref_lo)
    // These are implementation details the user never needs to see.
    const userKeys = valueKeys.filter(k => !k.includes('.'));
    if (userKeys.length > 0) valueKeys = userKeys;

    if (probes.length > 0) {
      const probedKeys = Object.keys(probeMap).filter(k => valueKeys.includes(k));
      if (probedKeys.length > 0) return { traces: probedKeys, sweepKey: timeKey };
    }
    return { traces: valueKeys, sweepKey: timeKey };
  }, [formattedData, probes, probeMap, simulationBuffer]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (isSimulating) return <div style={{ position: 'absolute', inset: 0 }}><LoadingSpinner /></div>;
  if (simulationError) return <div style={{ position: 'absolute', inset: 0 }}><ErrorView error={simulationError} /></div>;
  if (!formattedData || formattedData.length === 0) return <div style={{ position: 'absolute', inset: 0 }}><EmptyView /></div>;

  const plotType = (simulationBuffer as any)?.__plotType || analysisMode || 'transient';
  let PlotComponent = null;

  const cursorProps = { isCursorMode, cursorA, setCursorA, cursorB, setCursorB };

  // FFT view overrides the normal plot for transient mode
  if (showFft && plotType === 'transient') {
    PlotComponent = (
      <FftPlot simulationBuffer={simulationBuffer!} traces={traces} isOscilloscope={isOscilloscope} />
    );
  } else if (plotType === 'ac') {
    PlotComponent = <BodePlot data={formattedData} traces={traces} probeMap={probeMap} isOscilloscope={isOscilloscope} {...cursorProps} />;
  } else if (plotType === 'dc') {
    PlotComponent = <DcSweepPlot data={formattedData} traces={traces} sweepKey={sweepKey} isOscilloscope={isOscilloscope} {...cursorProps} />;
  } else {
    PlotComponent = (
      <TransientPlot
        data={formattedData}
        traces={traces}
        probeMap={probeMap}
        playbackTime={playbackTime}
        isOscilloscope={isOscilloscope}
        {...cursorProps}
      />
    );
  }

  const handleExportPNG = async () => {
    if (chartRef.current) {
      try {
        // Apply padding to prevent clipping of shadows in oscilloscope mode
        const originalStyle = chartRef.current.style.cssText;
        if (isOscilloscope) {
          chartRef.current.style.padding = '10px';
          chartRef.current.style.backgroundColor = '#001100';
        }
        
        const dataUrl = await toPng(chartRef.current, { backgroundColor: isOscilloscope ? '#001100' : '#ffffff' });
        
        // Restore
        chartRef.current.style.cssText = originalStyle;

        const link = document.createElement('a');
        link.download = `simulation_plot.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export PNG', err);
      }
    }
  };

  const handleExportCSV = () => {
    if (!simulationBuffer) return;
    const csvContent = generateCSV(simulationBuffer);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Cursor Panel logic
  const renderCursorPanel = () => {
    if (!isCursorMode || (!cursorA && !cursorB)) return null;
    
    // Determine the key we are sweeping
    let xKey = 'time';
    if (plotType === 'ac') xKey = 'frequency';
    else if (plotType === 'dc') xKey = sweepKey;

    const ax = cursorA ? cursorA[xKey] : null;
    const bx = cursorB ? cursorB[xKey] : null;
    const dx = (ax !== null && bx !== null) ? Math.abs(bx - ax) : null;

    const xLabel = xKey === 'time' ? 'Time (s)' : xKey === 'frequency' ? 'Freq (Hz)' : 'Voltage (V)';

    return (
      <div className={`absolute left-4 top-4 z-20 p-3 rounded-lg shadow-xl border text-sm max-w-sm overflow-auto max-h-64 ${isOscilloscope ? 'bg-[#002200] border-green-500 text-green-400' : 'bg-white border-gray-200 text-gray-800'}`}>
        <div className="font-bold mb-2 border-b pb-1 border-opacity-30">Measurement Cursors</div>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pr-2 font-normal italic">Signal</th>
              <th className="pr-2 text-red-500">A</th>
              <th className="pr-2 text-fuchsia-500">B</th>
              <th className="font-bold">Δ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-2 truncate max-w-[80px]">{xLabel}</td>
              <td className="pr-2">{ax !== null ? fmtNum(ax) : '-'}</td>
              <td className="pr-2">{bx !== null ? fmtNum(bx) : '-'}</td>
              <td className="font-bold">{dx !== null ? fmtNum(dx) : '-'}</td>
            </tr>
            {traces.map((t: string) => {
              const ay = cursorA ? cursorA[t] : null;
              const by = cursorB ? cursorB[t] : null;
              const dy = (ay !== null && by !== null) ? Math.abs(by - ay) : null;
              const displayName = probeMap[t] || formatTraceName(t);
              return (
                <tr key={t}>
                  <td className="pr-2 truncate max-w-[80px]" title={displayName}>{displayName}</td>
                  <td className="pr-2">{ay !== null ? fmtNum(ay) : '-'}</td>
                  <td className="pr-2">{by !== null ? fmtNum(by) : '-'}</td>
                  <td className="font-bold">{dy !== null ? fmtNum(dy) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const chartAreaHeight = Math.max(0, containerSize.height - TOOLBAR_H);

  return (
    <div ref={chartRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: '#fff' }}>
      {renderCursorPanel()}

      {/* Fixed-height toolbar at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: TOOLBAR_H, display: 'flex', alignItems: 'center', gap: 16, padding: '0 12px', borderBottom: '1px solid #e5e7eb', background: '#fff', zIndex: 5 }}>
        {/* FFT toggle — only shown for transient */}
        {plotType === 'transient' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }} title="FFT Spectrum Analyzer">
            <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
              <input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} checked={showFft} onChange={() => setShowFft(!showFft)} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, background: showFft ? '#8b5cf6' : '#d1d5db', transition: 'background 0.2s' }} />
              <div style={{ position: 'absolute', top: 2, left: showFft ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, color: showFft ? '#8b5cf6' : '#6b7280' }}>
              <BarChart2 size={13} /> FFT
            </span>
          </label>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }} title="Measurement Cursors">
          <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
            <input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} checked={isCursorMode} onChange={() => { setIsCursorMode(!isCursorMode); setCursorA(null); setCursorB(null); }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, background: isCursorMode ? '#2563eb' : '#d1d5db', transition: 'background 0.2s' }} />
            <div style={{ position: 'absolute', top: 2, left: isCursorMode ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, color: isCursorMode ? '#2563eb' : '#6b7280' }}>
            <Crosshair size={13} /> Cursors
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
            <input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} checked={isOscilloscope} onChange={() => setIsOscilloscope(!isOscilloscope)} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, background: isOscilloscope ? '#16a34a' : '#d1d5db', transition: 'background 0.2s' }} />
            <div style={{ position: 'absolute', top: 2, left: isOscilloscope ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, color: isOscilloscope ? '#16a34a' : '#6b7280' }}>
            <Activity size={13} /> ∿Scope
          </span>
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleExportPNG} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }} title="Download PNG">
            <Download size={15} /> PNG
          </button>
          <button onClick={handleExportCSV} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }} title="Download CSV">
            <Table2 size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Chart area: positioned exactly below toolbar with explicit pixel height */}
      <div style={{ position: 'absolute', top: TOOLBAR_H, left: 0, right: 0, bottom: 0 }}>
        {chartAreaHeight > 0 && PlotComponent}
        <MeasurementsPanel data={formattedData} traces={traces} plotType={plotType} />
      </div>
    </div>
  );
}

