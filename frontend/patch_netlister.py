import re

with open('src/utils/netlister.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_logic = """
    // --- NEW DIODES ---
    else if (comp.type === 'DiodeZener') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DZENER\n`;
      models.add('.model DZENER D (BV=5.1 IBV=5m RS=10)');
    }
    else if (comp.type === 'DiodeSchottky') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DSCHOTTKY\n`;
      models.add('.model DSCHOTTKY D (IS=10n N=1.5 RS=1 EG=0.69)');
    }
    else if (comp.type === 'LED') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DLED\n`;
      models.add('.model DLED D (IS=1p N=2 RS=5 BV=5 IBV=10u EG=2.1)');
    }
    else if (comp.type === 'BridgeRectifier') {
      // 4 pins: ~ ~, +, -
      const ac1 = nodes[0] || '0';
      const ac2 = nodes[1] || '0';
      const pos = nodes[2] || '0';
      const neg = nodes[3] || '0';
      netlist += `D1_${comp.id} ${ac1} ${pos} 1N4148\n`;
      netlist += `D2_${comp.id} ${ac2} ${pos} 1N4148\n`;
      netlist += `D3_${comp.id} ${neg} ${ac1} 1N4148\n`;
      netlist += `D4_${comp.id} ${neg} ${ac2} 1N4148\n`;
      models.add('.model 1N4148 D (IS=4.35p RS=0.64 N=1.9)');
    }
    // --- NEW TRANSISTORS ---
    else if (comp.type === 'TransistorPNP') {
      netlist += `Q_${comp.id} ${nodes[2] || '0'} ${nodes[0] || '0'} ${nodes[1] || '0'} QPNP\n`;
      models.add('.model QPNP PNP (BF=100 BR=1 IS=10f VAF=50)');
    }
    else if (comp.type === 'MosfetN') {
      netlist += `M_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} ${nodes[2] || '0'} NMOSMOD\n`;
      models.add('.model NMOSMOD NMOS (LEVEL=1 VTO=2 KP=20m)');
    }
    else if (comp.type === 'MosfetP') {
      netlist += `M_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} ${nodes[2] || '0'} PMOSMOD\n`;
      models.add('.model PMOSMOD PMOS (LEVEL=1 VTO=-2 KP=20m)');
    }
    else if (comp.type === 'JFET') {
      netlist += `J_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} NJFETMOD\n`;
      models.add('.model NJFETMOD NJF (VTO=-2 BETA=1m)');
    }
    else if (comp.type === 'IGBT') {
      // Basic IGBT approximation (BJT + MOSFET) or just subcircuit
      netlist += `X_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} IGBTMOD\n`;
      models.add(`.subckt IGBTMOD C G E\\nM1 C G E E NMOSMOD\\n.ends`);
    }
    // --- NEW SWITCHES ---
    else if (comp.type === 'SPDTSwitch' || comp.type === 'Relay') {
      // 3 pins: Com, NO, NC. Hard to simulate mechanical without control, default to 1 ohm to NO, 1G to NC
      netlist += `R_NO_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1\n`;
      netlist += `R_NC_${comp.id} ${nodes[0] || '0'} ${nodes[2] || '0'} 1G\n`;
    }
    else if (comp.type === 'PushButton') {
      netlist += `R_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1G\n`; // Open by default
    }
    // --- NEW PASSIVES ---
    else if (comp.type === 'CoupledInductors') {
      netlist += `L1_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 10m\n`;
      netlist += `L2_${comp.id} ${nodes[2] || '0'} ${nodes[3] || '0'} 10m\n`;
      netlist += `K_${comp.id} L1_${comp.id} L2_${comp.id} 0.99\n`;
    }
    else if (comp.type === 'LossyTransmissionLine' || comp.type === 'LosslessTransmissionLine') {
      netlist += `T_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} ${nodes[2] || '0'} ${nodes[3] || '0'} Z0=50 TD=1n\n`;
    }
    else if (comp.type === 'Resistors') {
      // 4 pin pack, 2 resistors
      netlist += `R1_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1k\n`;
      netlist += `R2_${comp.id} ${nodes[2] || '0'} ${nodes[3] || '0'} 1k\n`;
    }
    else if (comp.type === 'Connector') {
      netlist += `R_${comp.id} ${nodes[0] || '0'} 0 1G\n`; // dummy termination
    }
    // --- NEW SOURCES ---
    else if (comp.type === 'AMVoltage') {
      netlist += `${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} AM(1 1 1k 10k)\n`; // offset, amp, fc, fm
    }
    else if (comp.type === 'FMVoltage' || comp.type === 'ChirpVoltage') {
      netlist += `${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} SFFM(0 1 10k 5 1k)\n`; // offset, amp, fc, mdi, fs
    }
    else if (comp.type === 'StepVoltage') {
      netlist += `${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PWL(0 0 1m 5)\n`;
    }
    else if (comp.type === 'ThermalNoise') {
      netlist += `${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} TRN(1m 1n)\n`; 
    }
    else if (comp.type === 'ArbitraryVoltageSource') {
      netlist += `B_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} V=5*sin(time)\n`;
    }
"""

# We need to insert this before `  });` and after the Transformer block.
# Let's find:
target = r"""    else if (comp.type === 'Transformer') {
      // Transformer_1P_1S has 4 pins. Usually 1,2 primary, 3,4 secondary.
      // Inductances determine turns ratio (sqrt(L1/L2))
      // By default let's do 100mH and 1mH = 10:1 ratio.
      netlist += `L1_${comp.id} ${nodes[0]} ${nodes[1]} 100m\n`;
      netlist += `L2_${comp.id} ${nodes[2]} ${nodes[3]} 1m\n`;
      netlist += `K_${comp.id} L1_${comp.id} L2_${comp.id} 0.999\n`;
    }"""

if target in content:
    new_content = content.replace(target, target + new_logic)
    with open('src/utils/netlister.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched netlister.ts successfully!")
else:
    print("Could not find the target string to replace in netlister.ts")
