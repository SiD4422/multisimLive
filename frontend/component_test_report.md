# Component Test Report

| Component | SPICE Generated | Engine Result | Error Message | SPICE Snippet |
|---|---|---|---|---|
| DCSource | Yes | Pass | - | `V_TEST1 1 2 DC 5` |
| DCCurrent | Yes | Pass | - | `I_TEST1 1 2 DC 1` |
| ACSource | Yes | Pass | - | `V_TEST1 1 2 SINE(0 1 1k)` |
| ACCurrent | Yes | Pass | - | `I_TEST1 1 2 AC 1 SINE(0 1 1k)` |
| ClockVoltage | Yes | Pass | - | `V_TEST1 1 2 PULSE(0 5 0 1n 1n 0.5m 1m)` |
| PulseVoltage | Yes | Pass | - | `V_TEST1 1 2 PULSE(0 5 0 1n 1n 1m 2m)` |
| StepVoltage | Yes | Pass | - | `V_TEST1 1 2 PWL(0 0 1m 5)` |
| AMVoltage | Yes | Pass | - | `V_TEST1 1 2 AM(1 1 1k 10k)` |
| FMVoltage | Yes | Pass | - | `V_TEST1 1 2 SFFM(0 1 10k 5 1k)` |
| ThermalNoise | Yes | Pass | - | `V_TEST1 1 2 TRRANDOM(1 1m 0 1)` |
| Resistor | Yes | Pass | - | `R_TEST1 1 2 1k` |
| Load | Yes | Pass | - | `R_TEST1 1 2 1k` |
| Capacitor | Yes | Pass | - | `C_TEST1 1 2 1u` |
| Inductor | Yes | Pass | - | `L_TEST1 1 2 1m` |
| Transformer1P1S | Yes | Pass | - | `L1p_TEST1 1 1 0.1` |
| Transformer1P1S_CT | Yes | Pass | - | `L1p_TEST1 1 1 0.1` |
| Transformer1P2S | Yes | Pass | - | `L1p_TEST1 1 1 0.1` |
| Transformer2P1S | Yes | Pass | - | `L1p_TEST1 0 0 0.1` |
| Transformer2P2S | Yes | Pass | - | `L1p_TEST1 0 0 0.1` |
| Diode | Yes | Pass | - | `D_TEST1 1 2 1N4148` |
| DiodeZener | Yes | Pass | - | `D_TEST1 1 2 DZENER_5p1` |
| DiodeSchottky | Yes | Pass | - | `D_TEST1 1 2 DSCHOTTKY` |
| LED | Yes | Pass | - | `D_TEST1 1 2 DLED` |
| BridgeRectifier | Yes | Pass | - | `D1_TEST1 1 0 1N4148` |
| TransistorNPN | Yes | Pass | - | `Q_TEST1 2 1 2 2N3904` |
| TransistorPNP | Yes | Pass | - | `Q_TEST1 2 1 2 QPNP` |
| MosfetN | Yes | Pass | - | `M_TEST1 2 1 2 2 NMOSMOD` |
| MosfetP | Yes | Pass | - | `M_TEST1 2 1 2 2 PMOSMOD` |
| JFET | Yes | Pass | - | `J_TEST1 2 1 2 NJFETMOD` |
| IGBT | Yes | Pass | - | `X_TEST1 2 1 2 IGBTMOD` |
| SwitchSPST | Yes | Pass | - | `R_TEST1 1 2 1m` |
| PushButton | Yes | Pass | - | `R_TEST1 1 2 1G` |