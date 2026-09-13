# Component Test Report

| Component | SPICE Generated | Engine Result | Error Message | SPICE Snippet |
|---|---|---|---|---|
| DCSource | Yes | Fail | Worker is not defined | `V_TEST1 1 2 DC 5` |
| DCCurrent | Yes | Fail | Worker is not defined | `I_TEST1 1 2 DC 1` |
| ACSource | Yes | Fail | Worker is not defined | `V_TEST1 1 2 SINE(0 1 1k)` |
| ACCurrent | Yes | Fail | Worker is not defined | `I_TEST1 1 2 AC 1 SINE(0 1 1k)` |
| ClockVoltage | Yes | Fail | Worker is not defined | `V_TEST1 1 2 PULSE(0 5 0 1n 1n 0.5m 1m)` |
| PulseVoltage | Yes | Fail | Worker is not defined | `V_TEST1 1 2 PULSE(0 5 0 1n 1n 1m 2m)` |
| StepVoltage | Yes | Fail | Worker is not defined | `V_TEST1 1 2 PWL(0 0 1m 5)` |
| AMVoltage | Yes | Fail | Worker is not defined | `V_TEST1 1 2 AM(1 1 1k 10k)` |
| FMVoltage | Yes | Fail | Worker is not defined | `V_TEST1 1 2 SFFM(0 1 10k 5 1k)` |
| ThermalNoise | Yes | Fail | Worker is not defined | `V_TEST1 1 2 TRRANDOM(1 1m 0 1)` |
| Resistor | Yes | Fail | Worker is not defined | `R_TEST1 1 2 1k` |
| Load | Yes | Fail | Worker is not defined | `R_TEST1 1 2 1k` |
| Capacitor | Yes | Fail | Worker is not defined | `C_TEST1 1 2 1u` |
| Inductor | Yes | Fail | Worker is not defined | `L_TEST1 1 2 1m` |
| Transformer1P1S | Yes | Fail | Worker is not defined | `L1p_TEST1 1 p1m_int_TEST1 0.1` |
| Transformer1P1S_CT | Yes | Fail | Worker is not defined | `L1p_TEST1 1 p1m_int_TEST1 0.1` |
| Transformer1P2S | Yes | Fail | Worker is not defined | `L1p_TEST1 1 p1m_int_TEST1 0.1` |
| Transformer2P1S | Yes | Fail | Worker is not defined | `L1p_TEST1 0 p1m_int_TEST1 0.1` |
| Transformer2P2S | Yes | Fail | Worker is not defined | `L1p_TEST1 0 p1m_int_TEST1 0.1` |
| Diode | Yes | Fail | Worker is not defined | `D_TEST1 1 2 1N4148` |
| DiodeZener | Yes | Fail | Worker is not defined | `D_TEST1 1 2 DZENER_5p1` |
| DiodeSchottky | Yes | Fail | Worker is not defined | `D_TEST1 1 2 DSCHOTTKY` |
| LED | Yes | Fail | Worker is not defined | `D_TEST1 1 2 DLED` |
| BridgeRectifier | Yes | Fail | Worker is not defined | `D1_TEST1 1 2 D_1N4007` |
| TransistorNPN | Yes | Fail | Worker is not defined | `Q_TEST1 2 1 2 2N3904` |
| TransistorPNP | Yes | Fail | Worker is not defined | `Q_TEST1 2 1 2 QPNP` |
| MosfetN | Yes | Fail | Worker is not defined | `M_TEST1 2 1 2 2 NMOSMOD` |
| MosfetP | Yes | Fail | Worker is not defined | `M_TEST1 2 1 2 2 PMOSMOD` |
| JFET | Yes | Fail | Worker is not defined | `J_TEST1 2 1 2 NJFETMOD` |
| IGBT | Yes | Fail | Worker is not defined | `X_TEST1 2 1 2 IGBTMOD` |
| SwitchSPST | Yes | Fail | Worker is not defined | `R_TEST1 1 2 1m` |
| PushButton | Yes | Fail | Worker is not defined | `R_TEST1 1 2 1G` |
| DigitalSwitch | Yes | Fail | Worker is not defined | `V_TEST1 1 0 0` |
| GateAND | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = (V(1) > 2.5 && V(1) > 2.5) ? 5 : 0` |
| GateOR | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = (V(1) > 2.5 \|\| V(1) > 2.5) ? 5 : 0` |
| GateNOT | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = (V(1) > 2.5) ? 0 : 5` |
| GateNAND | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = (V(1) > 2.5 && V(1) > 2.5) ? 0 : 5` |
| GateNOR | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = (V(1) > 2.5 \|\| V(1) > 2.5) ? 0 : 5` |
| GateXOR | Yes | Fail | Worker is not defined | `B_TEST1 2 0 V = ((V(1)>2.5)!=(V(1)>2.5)) ? 5 : 0` |
| DFlipFlop | Yes | Fail | Worker is not defined | `X_TEST1 1 1 2 2 DFF` |
| JKFlipFlop | Yes | Fail | Worker is not defined | `X_TEST1 1 1 1 2 3 JKFF` |
| Lamp | Yes | Fail | Worker is not defined | `R_TEST1 1 2 100` |
| SevenSegment | Yes | Fail | Worker is not defined | `D_TEST1 1 2 DLED` |