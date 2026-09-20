# Contributing to NodeSim

Thanks for wanting to contribute! NodeSim is built for students by a student — every contribution that makes it more accurate, faster, or easier to use is valuable.

---

## Quick Start

```bash
git clone https://github.com/SiD4422/multisimLive.git
cd multisimLive/multisimfree/frontend
npm install
npm run dev
```

---

## Where Things Live

| What you want to change | File |
|---|---|
| Add a new component to the palette | `src/pages/Simulator.tsx` → `COMPONENT_CATEGORIES` |
| Add pin geometry for a new component | `src/utils/netlister/getComponentPins.ts` |
| Add SPICE netlist generation for a component | `src/utils/netlister/generateNetlist.ts` |
| Add/fix the visual schematic symbol | `src/components/symbols/MultisimSymbol.tsx` |
| Fix a simulation bug | `src/utils/netlister/generateNetlist.ts` or `spiceWorker.ts` |
| Fix a waveform display bug | `src/components/Grapher.tsx` |
| Fix a UI layout bug | `src/pages/Simulator.tsx` or the relevant component in `src/components/` |
| Fix a store/state bug | `src/store/useSchematicStore.ts` |
| Fix an AI diagnosis bug | `src/lib/aiContext.ts`, `src/lib/geminiClient.ts`, or `src/components/AiExplainerPanel.tsx` |

---

## Before You Submit a PR

1. **Run the tests:**
   ```bash
   npm test
   ```
   All tests must pass. If you add a new component, add a test that verifies its netlist output is correct SPICE syntax.

2. **Run the build:**
   ```bash
   npm run build
   ```
   No TypeScript errors allowed.

3. **Test manually in the browser:**
   - Place your component on the canvas
   - Wire it up and run a simulation
   - Check the waveform output makes sense

4. **For simulation fixes:** Include the expected vs. actual SPICE output in your PR description.

---

## Adding a New Component (Checklist)

- [ ] Add pin definitions in `src/utils/netlister/getComponentPins.ts`
- [ ] Add SPICE netlist generation in `src/utils/netlister/generateNetlist.ts`
- [ ] Add the visual symbol in `src/components/symbols/MultisimSymbol.tsx`
- [ ] Add to the component palette in `src/pages/Simulator.tsx` under the right category
- [ ] Add a vitest test verifying the generated netlist contains the correct SPICE component lines
- [ ] Test: place on canvas, wire, simulate, check output

---

## SPICE Accuracy Guidelines

- SPICE syntax: `Q name Collector Base Emitter model` for BJTs (not a free-form string)
- Use `\n` not `\r\n` in generated netlist lines
- Always add a `.model` statement for semiconductor devices
- Test against a known-correct SPICE simulator (LTspice, ngspice desktop) when in doubt
- If a component can't be accurately modeled in analog SPICE (e.g., true digital logic), document the approximation clearly in a comment

---

## Code Style

- TypeScript — all new code must be typed (no `any` without a comment explaining why)
- Functional React components only (no class components)
- Zustand for state — don't add local component state for things that affect simulation
- Keep component files under 400 lines — if it's growing beyond that, propose a split

---

## What We Won't Accept

- Changes that break existing simulation correctness (e.g., swapping pin order without verifying against a reference)
- New external dependencies without discussion (the WASM bundle is already large)
- Proprietary component models that can't be redistributed under MIT
- UI changes that make the mobile experience worse

---

## Questions?

Open a GitHub Issue tagged `question`. The fastest way to get a response is to include a shareable circuit URL (use the Share button in the simulator) that demonstrates the issue.
