## Summary
Explain what this PR changes and why. Link any related issue (`Fixes #<issue>`).

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New component / SPICE model
- [ ] Simulation engine / netlister improvement
- [ ] UI / schematic editor / waveform grapher improvement
- [ ] Documentation / SEO / tests

## Verification Checklist
- [ ] `cd frontend && npm run typecheck` passes (`0` errors)
- [ ] `cd frontend && npm run lint -- --max-warnings 0` passes (`0` errors, `0` warnings)
- [ ] `cd frontend && npm run build:seo` completes without errors
- [ ] `cd frontend && npx vitest run` passes all unit/regression tests
- [ ] Tested interactively in the browser (`npm run dev`): placed components, wired, simulated, verified waveforms

## For Simulation / Netlister Changes
Include the SPICE netlist snippet and expected vs. observed measurement (e.g. simulated node voltage, gain/phase, or transient period):

```spice
* Paste relevant netlist or ngspice verification output here
```
