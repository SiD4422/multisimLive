---
name: Bug Report
about: Report a simulation inaccuracy, netlister issue, UI defect, or crash in NodeSim
title: "[Bug]: "
labels: bug
assignees: ""
---

## Summary
A clear, concise description of what went wrong and what you expected instead.

## Steps to Reproduce
1. Open the simulator (or include a shareable `#circuit=...` URL / exported `.json` snippet)
2. Place / connect components: ...
3. Select analysis mode (`Transient` / `AC Sweep` / `DC Sweep` / `DC Operating Point`) and click **Run**
4. Observe the issue: ...

## Expected vs. Actual Behavior
- **Expected:** (e.g. "RC low-pass filter -3 dB cutoff at ~1.59 kHz")
- **Actual:** (e.g. "ngspice reported singular matrix / plotted flat 0 V")

## Netlist / Error Output (if applicable)
If applicable, copy the generated SPICE netlist (`Export → SPICE (.cir)`) or browser console error:

```spice
* Paste SPICE netlist or console output here
```

## Environment
- OS: [e.g. Windows 11, macOS, Ubuntu]
- Browser: [e.g. Chrome 131, Firefox, Edge]
- Device: [Desktop / Mobile / Tablet]
