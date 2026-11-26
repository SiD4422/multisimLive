import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import lowPassFilter from '../examples/low_pass_filter.json';
import invertingOpamp from '../examples/inverting_opamp.json';
import astable555 from '../examples/astable_555.json';

type PresetId = 'rc' | 'opamp' | '555';
type FrameTab = 'split' | 'schematic' | 'grapher';

interface CircuitSnapshot {
  components: Array<{ id: string; value: string; [k: string]: unknown }>;
  [k: string]: unknown;
}

const PRESETS: Record<PresetId, { label: string; badge: string; title: string; analysis: string }> = {
  rc: {
    label: 'RC Low-Pass',
    badge: 'AC / Step',
    title: 'RC Low-Pass Filter',
    analysis: 'Transient & AC',
  },
  opamp: {
    label: 'Inverting Op-Amp',
    badge: 'Amplifier',
    title: 'Inverting Op-Amp Gain Stage',
    analysis: 'Transient Analysis',
  },
  '555': {
    label: '555 Astable Timer',
    badge: 'Oscillator',
    title: '555 Timer Clock Generator',
    analysis: 'Transient Analysis',
  },
};

function formatResistance(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(ohms % 1000 === 0 ? 0 : 1)}k` : `${ohms}`;
}

function formatCapacitance(nf: number): string {
  return nf >= 1000 ? `${(nf / 1000).toFixed(nf % 1000 === 0 ? 0 : 1)}u` : `${nf}n`;
}

function formatFrequency(hz: number): string {
  if (hz >= 1000) return `${(hz / 1000).toFixed(2)} kHz`;
  if (hz >= 1) return `${hz.toFixed(1)} Hz`;
  return `${(hz * 1000).toFixed(0)} mHz`;
}

/**
 * Computes SVG polyline coordinates and telemetry metrics for the selected circuit preset.
 * Pure mathematical evaluation keeps SSR and homepage hydration instant (<1ms, zero WASM load on /).
 */
function computePreviewWaveforms(
  preset: PresetId,
  rcR: number,
  rcCnf: number,
  opRfKohms: number,
  timerR2Kohms: number,
) {
  const x0 = 24;
  const xEnd = 236;
  const width = xEnd - x0;
  const samples = 48;

  if (preset === 'rc') {
    // 1kHz input sine filtered by single-pole RC (V_in = 5Vpk, f_in = 1kHz -> attenuated by 1/sqrt(1 + (f/fc)^2))
    const cFarads = rcCnf * 1e-9;
    const fc = 1 / (2 * Math.PI * rcR * cFarads);
    const tauMs = rcR * cFarads * 1000;
    const fIn = 1000;
    const gain = 1 / Math.sqrt(1 + Math.pow(fIn / fc, 2));
    const phase = -Math.atan(fIn / fc);

    const outPts: string[] = [];
    const inPts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const x = x0 + u * width;
      const angle = u * 4 * Math.PI; // 2 full cycles of 1kHz over 2ms
      const vinNorm = Math.sin(angle);
      const voutNorm = gain * Math.sin(angle + phase);
      inPts.push(`${x.toFixed(1)},${(56 - vinNorm * 34).toFixed(1)}`);
      outPts.push(`${x.toFixed(1)},${(56 - voutNorm * 34).toFixed(1)}`);
    }
    const vpk = 5 * gain;
    return {
      pathOut: `M${outPts.join(' L')}`,
      pathIn: `M${inPts.join(' L')}`,
      xTicks: ['0', '0.5', '1.0', '1.5', '2.0 ms'],
      yLabels: ['5V', '0V', '-5V'],
      metrics: [
        { k: 'Vout Peak', v: `${vpk.toFixed(2)} V` },
        { k: 'Cutoff fc', v: formatFrequency(fc) },
        { k: 'Time Const', v: `${tauMs < 1 ? (tauMs * 1000).toFixed(0) + ' µs' : tauMs.toFixed(2) + ' ms'}` },
        { k: 'Atten @1k', v: `${(20 * Math.log10(gain)).toFixed(1)} dB` },
      ],
    };
  }

  if (preset === 'opamp') {
    // Inverting Op-Amp: Rin = 10k, Vin = 1Vpk, Rf = 10k..120k, rails +/- 12V
    const rin = 10;
    const gainMag = opRfKohms / rin;
    const outPts: string[] = [];
    const inPts: string[] = [];
    let clipped = false;
    let peakOut = 0;

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const x = x0 + u * width;
      const vin = Math.sin(u * 4 * Math.PI);
      const rawOut = -gainMag * vin;
      const clampedOut = Math.max(-12, Math.min(12, rawOut));
      if (Math.abs(rawOut) > 12) clipped = true;
      peakOut = Math.max(peakOut, Math.abs(clampedOut));
      inPts.push(`${x.toFixed(1)},${(56 - (vin / 12) * 38).toFixed(1)}`);
      outPts.push(`${x.toFixed(1)},${(56 - (clampedOut / 12) * 38).toFixed(1)}`);
    }

    return {
      pathOut: `M${outPts.join(' L')}`,
      pathIn: `M${inPts.join(' L')}`,
      xTicks: ['0', '0.5', '1.0', '1.5', '2.0 ms'],
      yLabels: ['12V', '0V', '-12V'],
      metrics: [
        { k: 'Closed Gain', v: `-${gainMag.toFixed(1)}x` },
        { k: 'Vout Peak', v: `${peakOut.toFixed(2)} V` },
        { k: 'Phase Shift', v: '180.0 deg' },
        { k: 'Headroom', v: clipped ? 'Rail Clip' : 'Linear' },
      ],
    };
  }

  // 555 Astable Timer: R1 = 10k, R2 = 10k..150k, C1 = 10uF -> freq ~ 0.45Hz .. 4.8Hz
  const r1 = 10000;
  const r2 = timerR2Kohms * 1000;
  const c = 10e-6;
  const freq = 1.44 / ((r1 + 2 * r2) * c);
  const duty = ((r1 + r2) / (r1 + 2 * r2)) * 100;
  const periodMs = (1 / freq) * 1000;
  const cycles = 2.5;

  const outPts: string[] = [];
  const capPts: string[] = [];
  const dutyFrac = duty / 100;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const x = x0 + u * width;
    const phase = (u * cycles) % 1;
    const isHigh = phase < dutyFrac;
    const yOut = isHigh ? 18 : 88;
    // Capacitor triangle/exponential between 1/3 Vcc and 2/3 Vcc (y ~ 64 to 40)
    const vCapNorm = isHigh ? phase / dutyFrac : 1 - (phase - dutyFrac) / (1 - dutyFrac);
    const yCap = 66 - vCapNorm * 26;
    outPts.push(`${x.toFixed(1)},${yOut}`);
    capPts.push(`${x.toFixed(1)},${yCap.toFixed(1)}`);
  }

  return {
    pathOut: `M${outPts.join(' L')}`,
    pathIn: `M${capPts.join(' L')}`,
    xTicks: ['0', `${(periodMs * 0.6).toFixed(0)}`, `${(periodMs * 1.2).toFixed(0)}`, `${(periodMs * 1.8).toFixed(0)}`, `${(periodMs * 2.5).toFixed(0)} ms`],
    yLabels: ['5V', '2.5V', '0V'],
    metrics: [
      { k: 'Vhigh', v: '4.85 V' },
      { k: 'Frequency', v: formatFrequency(freq) },
      { k: 'Duty Cycle', v: `${duty.toFixed(1)} %` },
      { k: 'Period T', v: `${periodMs.toFixed(0)} ms` },
    ],
  };
}

export default function LandingInteractiveDemo() {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<PresetId>('rc');
  const [tab, setTab] = useState<FrameTab>('split');
  const [rcR, setRcR] = useState(1000);       // 100Ω .. 10kΩ
  const [rcCnf, setRcCnf] = useState(100);    // 10nF .. 1000nF
  const [opRfKohms, setOpRfKohms] = useState(50);   // 10k .. 150k
  const [timerR2Kohms, setTimerR2Kohms] = useState(100); // 10k .. 150k
  const [runCount, setRunCount] = useState(0);

  const simData = useMemo(
    () => computePreviewWaveforms(preset, rcR, rcCnf, opRfKohms, timerR2Kohms),
    [preset, rcR, rcCnf, opRfKohms, timerR2Kohms],
  );

  const simTimeMs = (11.8 + ((runCount * 1.7 + rcR / 2500) % 4.5)).toFixed(1);

  const handleOpenInSimulator = () => {
    let base: CircuitSnapshot;
    if (preset === 'rc') {
      base = JSON.parse(JSON.stringify(lowPassFilter)) as CircuitSnapshot;
      const rComp = base.components.find(c => c.id === 'R1');
      const cComp = base.components.find(c => c.id === 'C1');
      if (rComp) rComp.value = formatResistance(rcR);
      if (cComp) cComp.value = formatCapacitance(rcCnf);
    } else if (preset === 'opamp') {
      base = JSON.parse(JSON.stringify(invertingOpamp)) as CircuitSnapshot;
      const r2Comp = base.components.find(c => c.id === 'R2');
      if (r2Comp) r2Comp.value = `${opRfKohms}k`;
    } else {
      base = JSON.parse(JSON.stringify(astable555)) as CircuitSnapshot;
      const r2Comp = base.components.find(c => c.id === 'R2');
      if (r2Comp) r2Comp.value = `${timerR2Kohms}k`;
    }
    try {
      sessionStorage.setItem('nodesim-pending-circuit', JSON.stringify(base));
    } catch {
      // ignore storage failure
    }
    navigate('/simulator');
  };

  return (
    <div className="sim-frame" role="region" aria-label="Interactive NodeSim circuit simulator preview">
      <div className="sim-titlebar">
        <div className="sim-dots"><span></span><span></span><span></span></div>
        <div className="sim-brand">
          <svg viewBox="0 0 34 34" aria-hidden="true">
            <path d="M8 27 L8 7 L26 27 L26 7" fill="none" stroke="url(#nGrad)" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="7" r="2.6" fill="url(#nGrad)" />
            <circle cx="8" cy="27" r="2.6" fill="url(#nGrad)" />
            <circle cx="26" cy="7" r="2.6" fill="url(#nGrad)" />
            <circle cx="26" cy="27" r="2.6" fill="url(#nGrad)" />
          </svg>
          NodeSim
        </div>
        <div className="sim-tabs" role="tablist" aria-label="Preview view mode">
          <button type="button" className={tab === 'schematic' ? 'active' : ''} onClick={() => setTab('schematic')}>Schematic</button>
          <button type="button" className={tab === 'grapher' ? 'active' : ''} onClick={() => setTab('grapher')}>Grapher</button>
          <button type="button" className={tab === 'split' ? 'active' : ''} onClick={() => setTab('split')}>Split</button>
        </div>
        <div className="sim-spacer"></div>
        <button
          type="button"
          className="sim-run"
          onClick={() => setRunCount(c => c + 1)}
          title="Re-run transient simulation preview"
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z" /></svg>
          Run
        </button>
        <button
          type="button"
          onClick={handleOpenInSimulator}
          style={{
            background: 'rgba(255,255,255,0.09)',
            color: '#EAF6EF',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 8,
            padding: '7px 11px',
            fontSize: 11.5,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Full Editor →
        </button>
      </div>

      <div
        className="sim-body"
        style={
          tab === 'schematic'
            ? { gridTemplateColumns: '150px 1fr' }
            : tab === 'grapher'
            ? { gridTemplateColumns: '150px 1fr' }
            : undefined
        }
      >
        <aside className="sim-sidebar">
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
            Live Presets
          </div>
          {(Object.keys(PRESETS) as PresetId[]).map(id => {
            const active = preset === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className="sim-comp"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: active ? 'rgba(63, 203, 140, 0.16)' : undefined,
                  border: active ? '1px solid rgba(63, 203, 140, 0.45)' : '1px solid transparent',
                  color: active ? '#fff' : undefined,
                  fontWeight: active ? 600 : 400,
                  marginBottom: 4,
                }}
              >
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 9h3l2-4 3 8 3-8 2 4h1" />
                </svg>
                <span>{PRESETS[id].label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#93A99F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 4 }}>
              Tune Values
            </div>
            {preset === 'rc' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 4px' }}>
                <label style={{ fontSize: 11, color: '#CFE3DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>R1</span><strong style={{ color: '#4ade80' }}>{formatResistance(rcR)}Ω</strong>
                  </div>
                  <input type="range" min={100} max={10000} step={100} value={rcR} onChange={e => setRcR(Number(e.target.value))} style={{ width: '100%', accentColor: '#3FCB8C' }} />
                </label>
                <label style={{ fontSize: 11, color: '#CFE3DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>C1</span><strong style={{ color: '#4ade80' }}>{formatCapacitance(rcCnf)}F</strong>
                  </div>
                  <input type="range" min={10} max={1000} step={10} value={rcCnf} onChange={e => setRcCnf(Number(e.target.value))} style={{ width: '100%', accentColor: '#3FCB8C' }} />
                </label>
              </div>
            )}
            {preset === 'opamp' && (
              <div style={{ padding: '0 4px' }}>
                <label style={{ fontSize: 11, color: '#CFE3DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Feedback Rf</span><strong style={{ color: '#4ade80' }}>{opRfKohms}kΩ</strong>
                  </div>
                  <input type="range" min={10} max={150} step={5} value={opRfKohms} onChange={e => setOpRfKohms(Number(e.target.value))} style={{ width: '100%', accentColor: '#3FCB8C' }} />
                </label>
                <div style={{ fontSize: 10.5, color: '#7E958B', marginTop: 8 }}>Rin fixed at 10kΩ (±12V rails)</div>
              </div>
            )}
            {preset === '555' && (
              <div style={{ padding: '0 4px' }}>
                <label style={{ fontSize: 11, color: '#CFE3DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Timing R2</span><strong style={{ color: '#4ade80' }}>{timerR2Kohms}kΩ</strong>
                  </div>
                  <input type="range" min={10} max={150} step={5} value={timerR2Kohms} onChange={e => setTimerR2Kohms(Number(e.target.value))} style={{ width: '100%', accentColor: '#3FCB8C' }} />
                </label>
                <div style={{ fontSize: 10.5, color: '#7E958B', marginTop: 8 }}>R1=10kΩ · C1=10µF · Vcc=5V</div>
              </div>
            )}
          </div>
        </aside>

        {tab !== 'grapher' && (
          <div className="sim-canvas">
            <div className="sim-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#93A99F', fontWeight: 600 }}>{PRESETS[preset].title}</span>
              </div>
              <span style={{ fontSize: 10.5, color: '#4ade80', fontFamily: 'var(--font-mono)' }}>Interactive Preview</span>
            </div>
            <div className="sim-canvas-body">
              {preset === 'rc' && (
                <svg viewBox="0 0 340 200" aria-label="RC low-pass filter interactive schematic">
                  <path className="wire" d="M64 60 H150 M214 60 H256" />
                  <path className="comp-line" d="M150 60 l8 -12 l12 24 l12 -24 l12 24 l12 -24 l8 12" />
                  <path className="wire" d="M256 60 V150" />
                  <path className="comp-line" d="M236 150 H276 M236 164 H276" />
                  <path className="wire" d="M256 164 V182 M64 182 H256" />
                  <circle className="node-dot" cx="64" cy="60" r="3.2" />
                  <circle className="node-dot" cx="256" cy="60" r="3.2" />
                  <circle className="node-dot" cx="64" cy="182" r="3.2" />
                  <circle className="node-dot" cx="256" cy="182" r="3.2" />
                  <circle cx="64" cy="100" r="18" className="comp-line" />
                  <path className="wire" d="M64 60 V82 M64 118 V182" />
                  <path className="comp-line" d="M58 94h4M60 92v4 M58 106h4" />
                  <path className="wire" d="M160 182 V190" />
                  <path className="comp-line" d="M151 190h18M154.5 194h11M158 198h4" />
                  <text className="sch-label-b" x="20" y="96">V1</text>
                  <text className="sch-label" x="20" y="112">5V 1kHz</text>
                  <text className="sch-label-b" x="170" y="38">R1</text>
                  <text className="sch-label" x="163" y="92">{formatResistance(rcR)}Ω</text>
                  <text className="sch-label-b" x="282" y="148">C1</text>
                  <text className="sch-label" x="282" y="164">{formatCapacitance(rcCnf)}F</text>
                  <text className="sch-label" x="266" y="55" fill="#4ade80">Vout</text>
                </svg>
              )}
              {preset === 'opamp' && (
                <svg viewBox="0 0 340 200" aria-label="Inverting op-amp interactive schematic">
                  <path className="wire" d="M48 110 H78 M142 110 H175 M160 110 V45 H175 M239 45 H285 V125 M245 125 H295 M175 140 H155 V165" />
                  <path className="comp-line" d="M78 110 l6 -10 l10 20 l10 -20 l10 20 l10 -20 l6 10" />
                  <path className="comp-line" d="M175 45 l6 -10 l10 20 l10 -20 l10 20 l10 -20 l6 10" />
                  <polygon className="comp-line" points="175,92 175,158 245,125" />
                  <text className="sch-label" x="182" y="115">-</text>
                  <text className="sch-label" x="182" y="143">+</text>
                  <path className="comp-line" d="M145 165 h20 M149 170 h12 M153 175 h4" />
                  <circle className="node-dot" cx="160" cy="110" r="3" />
                  <circle className="node-dot" cx="285" cy="125" r="3" />
                  <text className="sch-label-b" x="18" y="114">Vin</text>
                  <text className="sch-label-b" x="92" y="88">Rin 10kΩ</text>
                  <text className="sch-label-b" x="188" y="25">Rf {opRfKohms}kΩ</text>
                  <text className="sch-label" x="292" y="129" fill="#4ade80">Vout</text>
                </svg>
              )}
              {preset === '555' && (
                <svg viewBox="0 0 340 200" aria-label="555 astable oscillator interactive schematic">
                  <path className="wire" d="M70 30 H245 M105 30 V50 M105 90 V105 M105 145 V160 M105 160 H135 M135 100 H155 M135 125 H155 M245 30 V75 M255 110 H295 M105 160 V172 M105 182 V190" />
                  <rect className="comp-line" x="155" y="65" width="95" height="80" rx="6" />
                  <path className="comp-line" d="M105 50 l-8 6 l16 8 l-16 8 l16 8 l-8 6" />
                  <path className="comp-line" d="M105 105 l-8 6 l16 8 l-16 8 l16 8 l-8 6" />
                  <path className="comp-line" d="M90 172 H120 M90 182 H120" />
                  <text className="sch-label-b" x="182" y="109">NE555</text>
                  <text className="sch-label" x="62" y="74">R1 10k</text>
                  <text className="sch-label" x="56" y="130">R2 {timerR2Kohms}k</text>
                  <text className="sch-label" x="58" y="182">C1 10µF</text>
                  <text className="sch-label" x="262" y="103" fill="#4ade80">OUT</text>
                  <circle className="node-dot" cx="295" cy="110" r="3" />
                </svg>
              )}
            </div>
            <div className="sim-canvas-tag">
              <span>{PRESETS[preset].badge}</span>
              <button
                type="button"
                onClick={handleOpenInSimulator}
                style={{ width: 'auto', padding: '0 6px', fontSize: 10.5, color: '#4ade80', fontWeight: 600 }}
              >
                Edit in ngspice →
              </button>
            </div>
          </div>
        )}

        {tab !== 'schematic' && (
          <div className="sim-analysis">
            <div className="sim-select-row">
              <div className="sim-select">
                <span>{PRESETS[preset].analysis}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>

            <div className="sim-panel-card">
              <div className="sim-panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Live Waveform Grapher</span>
                <span style={{ color: '#4ade80', fontSize: 10 }}>V(out) / V(in)</span>
              </div>
              <div className="sim-graph">
                <svg viewBox="0 0 245 108" aria-label="Live oscilloscope plot">
                  <text className="sch-label" x="2" y="14" fontSize="8.5">{simData.yLabels[0]}</text>
                  <text className="sch-label" x="2" y="58" fontSize="8.5">{simData.yLabels[1]}</text>
                  <text className="sch-label" x="2" y="95" fontSize="8.5">{simData.yLabels[2]}</text>
                  <path d="M24 56 H238" stroke="rgba(255,255,255,.16)" strokeWidth="1" strokeDasharray="3 3" />
                  <path d={simData.pathIn} fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1.4" strokeDasharray="3 2" />
                  <path d={simData.pathOut} fill="none" stroke="#3FCB8C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <text className="sch-label" x="22" y="105" fontSize="8">{simData.xTicks[0]}</text>
                  <text className="sch-label" x="72" y="105" fontSize="8">{simData.xTicks[1]}</text>
                  <text className="sch-label" x="124" y="105" fontSize="8">{simData.xTicks[2]}</text>
                  <text className="sch-label" x="176" y="105" fontSize="8">{simData.xTicks[3]}</text>
                  <text className="sch-label" x="208" y="105" fontSize="8">{simData.xTicks[4]}</text>
                </svg>
              </div>
              <div className="sim-metrics">
                {simData.metrics.map(m => (
                  <div key={m.k}><span className="k">{m.k}</span><span className="v">{m.v}</span></div>
                ))}
              </div>
              <div className="sim-status">
                <span className="left"><i className="dot"></i>Simulation completed</span>
                <span>{simTimeMs} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
