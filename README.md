# NodeSim — Free Browser-Based SPICE Circuit Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live](https://img.shields.io/badge/Live-nodesimapp.com-blue)](https://www.nodesimapp.com)
[![Tests](https://github.com/SiD4422/multisimLive/actions/workflows/test.yml/badge.svg)](https://github.com/SiD4422/multisimLive/actions)

**NodeSim** is a zero-install, browser-based SPICE circuit simulator with an AI circuit debugger. It runs entirely in-browser using ngspice compiled to WebAssembly — no downloads, no accounts, no limits.

> **Built as a free alternative for students who lost access to NI Multisim Live.**

🔗 **Live site:** [nodesimapp.com](https://www.nodesimapp.com)  
🔗 **Simulator:** [nodesimapp.com/simulator](https://www.nodesimapp.com/simulator)

---

## What it does

- **SPICE simulation** — Transient, AC sweep, DC sweep, and operating point analysis via ngspice-WASM running client-side
- **Schematic editor** — Drag-and-drop canvas with 60+ component types (resistors, capacitors, transistors, op-amps, logic gates, and more)
- **AI circuit debugger** — Diagnose issues, explain circuits, and chat with an AI that understands your actual schematic topology (powered by Gemini)
- **Waveform viewer** — Oscilloscope-style plot with cursors, FFT, and measurements
- **Circuit sharing** — Shareable URLs via LZString-compressed circuit state
- **Export** — SPICE netlist (`.cir`), PNG snapshot

---

## Architecture

```
Browser
│
├── React 19 + Konva (Canvas)
│     ├── SchematicEditor.tsx   — drag-and-drop canvas, wire routing
│     ├── MultisimSymbol.tsx    — renders 60+ component types as Konva shapes
│     └── Grapher.tsx           — waveform viewer (recharts)
│
├── Zustand Store (useSchematicStore.ts)
│     ├── Components, wires, probes state
│     ├── runSimulation() — orchestrates the SPICE pipeline
│     └── Auto-saved to localStorage via Zustand persist
│
├── SPICE Pipeline
│     ├── netlister/generateNetlist.ts  — converts schematic graph → SPICE netlist string
│     ├── spiceEngine.ts                — spawns ngspice-WASM Web Worker
│     └── spiceWorker.ts                — runs inside Worker, calls ngspice WASM
│
└── AI Debugger
      ├── aiContext.ts          — extracts circuit topology + simulation stats
      ├── geminiClient.ts       — calls Gemini API (direct BYOK or hosted proxy)
      └── AiExplainerPanel.tsx  — 3-mode UI: Diagnose / Chat / Explain
```

---

## Local Development

### Prerequisites
- Node.js 20+
- npm 9+

### Setup

```bash
git clone https://github.com/SiD4422/multisimLive.git
cd multisimLive/multisimfree/frontend

npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables (optional — for AI features)

Copy `.env.example` to `.env.local` and fill in your Gemini API key:

```bash
cp .env.example .env.local
```

Without this, the AI features will call the hosted proxy at `nodesimapp.com/api/gemini`.

### Running Tests

```bash
npm test           # run once
npm run test:watch # watch mode
```

### Build

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

---

## How to Add a New Component

Adding a component (e.g., a new IC or sensor) requires changes in 3 places:

### 1. Define its pins — `src/utils/netlister/getComponentPins.ts`

```typescript
else if (comp.type === 'MyNewComponent') {
  return [
    { id: '1', gridNode: toGridNode({ x: comp.position.x - 40, y: comp.position.y }), p: { ... } },
    { id: '2', gridNode: toGridNode({ x: comp.position.x + 40, y: comp.position.y }), p: { ... } },
  ];
}
```

### 2. Generate its SPICE netlist — `src/utils/netlister/generateNetlist.ts`

```typescript
else if (comp.type === 'MyNewComponent') {
  netlist += `R_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} ${comp.value || '1k'}\n`;
}
```

### 3. Render its symbol — `src/components/symbols/MultisimSymbol.tsx`

Add visual representation using Konva shapes, then add it to the palette in `Simulator.tsx`.

---

## Project Structure

```
multisimfree/
├── frontend/
│   ├── api/
│   │   └── gemini.ts           # Vercel Edge Function — AI proxy (needs GEMINI_API_KEY)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiExplainerPanel.tsx
│   │   │   ├── Grapher.tsx
│   │   │   └── SchematicEditor.tsx
│   │   ├── lib/                # AI client, type definitions
│   │   ├── pages/
│   │   │   ├── Simulator.tsx
│   │   │   ├── tutorials/      # SEO tutorial pages
│   │   │   └── compare/        # Comparison pages
│   │   ├── store/
│   │   │   └── useSchematicStore.ts
│   │   └── utils/
│   │       ├── netlister/      # SPICE netlist generation (modular)
│   │       ├── spiceEngine.ts
│   │       └── spiceWorker.ts
│   ├── .env.example
│   └── vercel.json
└── LICENSE
```

---

## License

MIT — see [LICENSE](LICENSE). The AI proxy requires a private `GEMINI_API_KEY` not included in this repo.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgements

- [ngspice](https://ngspice.sourceforge.io/) — SPICE simulation engine
- [@o.z/ngspice-wasm](https://www.npmjs.com/package/@o.z/ngspice-wasm) — ngspice compiled to WebAssembly
- [Konva](https://konvajs.org/) — Canvas rendering
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Google Gemini](https://ai.google.dev/) — AI circuit diagnosis
