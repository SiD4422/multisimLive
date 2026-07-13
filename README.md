<div align="center">

<h1>⚡ MultiSimLab</h1>

<p><strong>A professional, browser-based SPICE circuit simulator — built for engineers, students, and makers.</strong></p>

<p>
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-orange?style=flat-square" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite" />
  <img alt="ngspice" src="https://img.shields.io/badge/ngspice-WASM-10a05a?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

<p>
  <a href="https://multisimlab.netlify.app"><strong>🚀 Live Demo</strong></a> ·
  <a href="#features"><strong>✨ Features</strong></a> ·
  <a href="#architecture"><strong>🏗 Architecture</strong></a> ·
  <a href="#getting-started"><strong>📦 Get Started</strong></a> ·
  <a href="#roadmap"><strong>🗺 Roadmap</strong></a>
</p>

</div>

---

## What is MultiSimLab?

MultiSimLab is a **full-featured, browser-native circuit simulation platform**. It runs a real SPICE engine — [ngspice](http://ngspice.sourceforge.net/) — compiled to **WebAssembly**, so you can design, wire, and simulate analog/digital circuits with zero installation.

No Java. No desktop apps. No accounts required. Just open the browser and build.

---

## ✨ Features

### 🔬 Real SPICE Simulation
- **ngspice WASM engine** — same solver used by professional EDA tools
- **Transient**, **DC Operating Point**, and **AC Sweep** analysis modes
- Automatic netlist generation from your schematic
- Real-time voltage & current probing

### 🧰 Rich Component Library
- **50+ components** — resistors, capacitors, inductors, op-amps, transistors (NPN/PNP/MOSFET), diodes, logic gates, 555 timers, voltage regulators, and more
- Searchable component palette with live search
- Expandable component details with model IDs and descriptions

### 🎨 Professional Schematic Editor
- Smooth pan & zoom on an infinite canvas
- Wire routing with bend points
- Multi-select, copy/paste, undo/redo (full history stack)
- Rotation, mirroring, and component labelling
- Schematic export to PNG

### 📊 Integrated Grapher
- Plot voltage, current, and power vs. time
- Color-coded, multi-trace graphs
- Split-view mode: schematic + graph side-by-side

### 🔗 Circuit Sharing & Persistence
- Share circuits via compressed URL link
- Save/Load circuits to local JSON files
- Built-in example circuit library (RC Filter, 555 Timer, Op-Amp, etc.)

---

## 🏗 Architecture

```
multisimfree/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── icons/           # All SVG schematic symbols
│   │   │   ├── symbols/         # KiCad & Multisim symbol renderers
│   │   │   ├── SchematicEditor  # Core canvas / drag-drop engine
│   │   │   ├── Grapher          # Simulation result plots
│   │   │   ├── SimulationControls
│   │   │   └── ComponentInspectorPanel
│   │   ├── pages/
│   │   │   └── Simulator.tsx    # Main application shell
│   │   ├── store/
│   │   │   └── useSchematicStore.ts   # Zustand global state
│   │   ├── utils/
│   │   │   ├── netlister.ts     # Schematic → SPICE netlist
│   │   │   ├── spiceEngine.ts   # ngspice WASM runner
│   │   │   ├── spiceWorker.ts   # Web Worker for simulation
│   │   │   └── autoRouter.ts    # Wire auto-routing
│   │   └── index.css            # Design system (CSS variables + 8px grid)
│   └── public/
│       └── _redirects           # Netlify SPA routing
└── ngspice/                     # ngspice WASM binaries (submodule)
```

### Simulation Flow

```
User draws circuit
       ↓
SchematicEditor (Konva canvas)
       ↓
netlister.ts — generates SPICE netlist
       ↓
spiceWorker.ts (Web Worker) — off-main-thread
       ↓
ngspice WASM engine
       ↓
Parsed results → Zustand store
       ↓
Grapher → recharts
```

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/SiD4422/multisimLive.git
cd multisimLive/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
# Output: frontend/dist/
```

---

## 🗺 Roadmap

### ✅ Done
- [x] ngspice WASM integration
- [x] Transient, DC, AC analysis
- [x] 50+ component library
- [x] Undo/Redo history
- [x] Circuit sharing via URL
- [x] Example library
- [x] Component search with expandable details
- [x] Design system (CSS tokens, 8px grid, Inter font)

### 🚧 In Progress (v2.0)
- [ ] AI Circuit Debugger — "Why doesn't my circuit work?"
- [ ] Interactive Learning Mode — click any component for explanation
- [ ] Minimap + alignment guides for schematic editor
- [ ] Smart error messages with highlighted nodes
- [ ] Performance benchmarks dashboard

### 📋 Planned
- [ ] Version history / simulation compare
- [ ] Live simulation overlay (voltage colour animation)
- [ ] Unit test suite for netlister + simulation
- [ ] CI/CD pipeline
- [ ] Contributing guide

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add: my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2025 MultiSimLab Contributors
