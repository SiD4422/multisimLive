# NodeSim — Free Online SPICE Circuit Simulator & Multisim Alternative

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live](https://img.shields.io/badge/Live-nodesimapp.com-blue)](https://www.nodesimapp.com)
[![Tests](https://github.com/SiD4422/multisimLive/actions/workflows/test.yml/badge.svg)](https://github.com/SiD4422/multisimLive/actions)

**NodeSim** is a free online SPICE circuit simulator and modern browser-based alternative to NI Multisim Live. Powered by **ngspice compiled to WebAssembly**, it runs full analog and mixed-signal simulations 100% client-side with zero installation and no account required.

🔗 **Live site:** [nodesimapp.com](https://www.nodesimapp.com)  
🔗 **Simulator:** [nodesimapp.com/simulator](https://www.nodesimapp.com/simulator)  
🔗 **Compare vs Multisim:** [nodesimapp.com/compare/multisim](https://www.nodesimapp.com/compare/multisim)  
🔗 **Circuit Library & Tools:** [nodesimapp.com/circuits](https://www.nodesimapp.com/circuits) · [nodesimapp.com/tools](https://www.nodesimapp.com/tools)

---

## Features

- **Real SPICE engine (ngspice WASM)** — Transient analysis, AC frequency sweeps (Bode plots), DC sweeps, and DC operating points executed locally in your browser
- **250+ SPICE & behavioral models** — Analog, power, digital logic gate, and IC components (RLC passives, diodes, BJTs, MOSFETs, precision op-amps, 555 timers, 74HC/CD4000 logic gates, optocouplers, and regulators), with non-modeled MCU/display/sensor pinouts explicitly quarantined as pinout stubs
- **Interactive waveform grapher** — Multi-channel oscilloscope plots with cursors, FFT spectrum view, animated current-flow visualization, and CSV export
- **AI circuit debugger** — Diagnose wiring issues, verify equations, and inspect netlist behavior with Gemini AI (`AiExplainerPanel`)
- **Academic & PCB exports** — Export IEEE-formatted PDF lab reports (`LabReportModal`), KiCad netlists (`.net` via `exportKiCad`), SPICE netlists (`.cir`), and PNG schematics
- **Zero-install learning tools** — 24+ ready-to-run starter schematics, 16 circuit tutorials, printable lab worksheets, and interactive engineering calculators
- **Instant sharing** — Generate LZString-compressed shareable circuit links and embeddable iframes (`/simulator?embed=true`)

---

## Architecture

```
Browser
│
├── React 19 + Konva (Canvas)
│     ├── SchematicEditor.tsx   — drag-and-drop canvas, wire routing
│     ├── MultisimSymbol.tsx    — renders component shapes on Konva canvas
│     └── Grapher.tsx           — waveform viewer, cursors, FFT, CSV export
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
└── AI Debugger & Exports
      ├── aiContext.ts          — extracts circuit topology + simulation stats
      ├── geminiClient.ts       — calls Gemini API (direct BYOK or hosted proxy)
      ├── AiExplainerPanel.tsx  — 3-mode UI: Diagnose / Chat / Explain
      ├── LabReportModal.tsx    — IEEE-style PDF lab report export
      └── exportKiCad.ts        — KiCad netlist export
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
npm run build:seo  # full build + 58-route React SSR static prerendering
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
│   │   │   ├── LandingPage.tsx
│   │   │   ├── circuits/       # Circuit templates & landing pages
│   │   │   ├── tools/          # Interactive electronics calculators
│   │   │   ├── tutorials/      # Step-by-step circuit tutorials
│   │   │   └── compare/        # Simulator comparison pages
│   │   ├── routes/
│   │   │   └── marketingRoutes.tsx
│   │   ├── entry-server.tsx    # React 19 SSR prerender entry
│   │   ├── store/
│   │   │   └── useSchematicStore.ts
│   │   └── utils/
│   │       ├── netlister/      # SPICE netlist generation (modular)
│   │       ├── spiceEngine.ts
│   │       └── spiceWorker.ts
│   ├── scripts/
│   │   └── prerender.mjs       # Build-time SSR HTML generator
│   ├── .env.example
│   └── vercel.json
└── LICENSE
```

---

## License

MIT — see [LICENSE](LICENSE).

### Note on the AI Proxy

The file `frontend/api/gemini.ts` implements a Vercel Edge Function that proxies requests to the Google Gemini API. It is open source under MIT, but requires a valid `GEMINI_API_KEY` environment variable to function. Forks and self-hosted deployments must supply their own API key — NodeSim's hosted instance at [nodesimapp.com](https://www.nodesimapp.com) uses a private key that is NOT included in this repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgements

- [ngspice](https://ngspice.sourceforge.io/) — SPICE simulation engine
- [@o.z/ngspice-wasm](https://www.npmjs.com/package/@o.z/ngspice-wasm) — ngspice compiled to WebAssembly
- [Konva](https://konvajs.org/) — Canvas rendering
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Google Gemini](https://ai.google.dev/) — AI circuit diagnosis
