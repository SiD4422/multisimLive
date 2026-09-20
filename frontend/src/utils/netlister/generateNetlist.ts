import type { SchematicComponent, Wire, Probe, Point } from '../../store/useSchematicStore';
import { parseSpiceToFloat } from './parseSpiceToFloat';
import { getComponentPins } from './getComponentPins';
import { toGridNode, isSameGridNode, isPointOnSegment, PIN_TOLERANCE } from './utils';
export function generateNetlist(components: SchematicComponent[], wires: Wire[], probes: Probe[] = []): string {
  let netlist = "* WebAssembly SPICE Netlist\n";
  let models = new Set<string>();

  // 0. Inject Ammeters for Current Probes
  let processedWires = [...wires];
  let processedComponents = [...components];

  const currentProbes = probes.filter(p => p.type === 'Current');
  currentProbes.forEach((probe) => {
    for (let wIdx = 0; wIdx < processedWires.length; wIdx++) {
      const wire = processedWires[wIdx];
      let found = false;
      for (let i = 0; i < wire.points.length - 1; i++) {
        if (isPointOnSegment(probe.position, wire.points[i], wire.points[i+1])) {
          // Use the exact same coordinates so geometry checks (isPointOnSegment) still work perfectly,
          // but add a special flag so toGridNode returns a unique ID to prevent net merging.
          const fakeP = { x: probe.position.x, y: probe.position.y, _isFake: true, _probeId: probe.id } as any;
          
          const isAtEnd = isSameGridNode(toGridNode(probe.position), toGridNode(wire.points[i+1]));
          const wireBPoints = [fakeP];
          if (isAtEnd) {
            // The probe is exactly on the vertex wire.points[i+1].
            // To prevent wireB from explicitly carrying the gridNode of this vertex (which would
            // merge it back with wireA), we skip it. fakeP serves as the new start of this geometric segment.
            wireBPoints.push(...wire.points.slice(i+2));
          } else {
            wireBPoints.push(...wire.points.slice(i+1));
          }
          
          const wireA: Wire = { id: `${wire.id}_a`, points: [...wire.points.slice(0, i+1), probe.position] };
          const wireB: Wire = { id: `${wire.id}_b`, points: wireBPoints };
          
          processedWires.splice(wIdx, 1, wireA, wireB);
          
          processedComponents.push({
            id: `v_probe_${probe.id}`, // e.g. v_probe_PR1
            type: 'Ammeter',
            position: probe.position, 
            value: JSON.stringify(fakeP)
          });
          
          found = true;
          break;
        }
      }
      if (found) break;
    }
  });

  // 1. Resolve Nets
  const nets: Set<string>[] = [];
  
  // Pre-extract all component pins so we know which points need to be checked against wire segments
  const allPins: { id: string, gridNode: string, p: Point }[] = [];
  processedComponents.forEach(comp => {
    // Ammeters from probes are already logically connected via exact grid nodes (including FAKE_)
    // and MUST NOT participate in geometric checks, otherwise their physically identical pins
    // will bridge the split wires back together!
    if (comp.type === 'TextAnnotation' || comp.type === 'Ammeter') return;
    const pins = getComponentPins(comp);
    pins.forEach(pin => {
      if (pin.p) {
        allPins.push({ id: pin.id, gridNode: pin.gridNode, p: pin.p });
      }
    });
  });

  processedWires.forEach(wire => {
    // Collect explicitly defined wire points
    const gridPoints = wire.points.map(toGridNode);
    
    for (let i = 0; i < wire.points.length - 1; i++) {
      const p1 = wire.points[i];
      const p2 = wire.points[i+1];

      // 1. Check if any component pins lie on this segment (with lenient tolerance for rotated pins)
      allPins.forEach(pin => {
        // AMMETER SHORT-CIRCUIT FIX: if this segment starts with a fake probe point (wireB),
        // don't claim component pins sitting exactly at the probe position â€” those belong to wireA's side.
        if ((p1 as any)._isFake && pin.p && Math.abs(pin.p.x - p1.x) < 1 && Math.abs(pin.p.y - p1.y) < 1) return;
        if (isPointOnSegment(pin.p, p1, p2, PIN_TOLERANCE)) {
          gridPoints.push(pin.gridNode);
        }
      });

      // 2. CRITICAL FIX: Check if endpoints of OTHER wires lie on this segment (T-junctions).
      //    Example: GND1 connects via a vertical wire whose top endpoint sits in the MIDDLE of
      //    the bottom horizontal bus wire. Without this check those two wires are separate nets!
      //    NOTE: Skip fake points (_isFake) â€” those are ammeter split nodes and must NOT merge!
      processedWires.forEach(otherWire => {
        if (otherWire === wire) return;
        otherWire.points.forEach(otherPt => {
          if ((otherPt as any)._isFake) return; // Protect ammeter nodes from T-junction merging
          // AMMETER SHORT-CIRCUIT FIX: if this segment starts with a fake probe point (wireB),
          // do NOT pull in wireA's terminal endpoint that sits at the exact same real coordinates.
          // Without this guard, wireA's end and wireB's fakeP start share the same physical location,
          // causing the T-junction scan to merge them into one net â†’ both ammeter pins â†’ same SPICE node â†’ shorted VSRC.
          if ((p1 as any)._isFake && Math.abs(otherPt.x - p1.x) < 1 && Math.abs(otherPt.y - p1.y) < 1) return;
          if (isPointOnSegment(otherPt, p1, p2, PIN_TOLERANCE)) {
            gridPoints.push(toGridNode(otherPt));
          }
        });
      });
    }

    let connectedNetIndices: number[] = [];
    gridPoints.forEach(gp => {
      nets.forEach((net, idx) => {
        if (net.has(gp) && !connectedNetIndices.includes(idx)) {
          connectedNetIndices.push(idx);
        }
      });
    });
    
    if (connectedNetIndices.length > 0) {
      // Merge all connected nets together
      const masterNetIndex = connectedNetIndices[0];
      gridPoints.forEach(gp => nets[masterNetIndex].add(gp));
      
      // If the wire bridged multiple existing nets, merge them into the master
      for (let i = 1; i < connectedNetIndices.length; i++) {
        const idxToMerge = connectedNetIndices[i];
        nets[idxToMerge].forEach(gp => nets[masterNetIndex].add(gp));
        nets[idxToMerge].clear(); // Mark for deletion
      }
    } else {
      // New independent net
      nets.push(new Set(gridPoints));
    }
  });


  // Clean up merged (empty) nets
  const finalNets = nets.filter(net => net.size > 0);

  // Find Ground nodes (Node 0)
  const groundNodes = new Set<string>();
  const hasGroundComponents = components.some(c => c.type === 'Ground');
  
  components.filter(c => c.type === 'Ground').forEach(c => {
    const pins = getComponentPins(c);
    pins.forEach(pin => {
      groundNodes.add(pin.gridNode);
      // Also search geometrically: if the Ground pin lies on any wire segment,
      // add every gridNode on that wire to groundNodes so the whole net becomes 0V
      processedWires.forEach(wire => {
        for (let i = 0; i < wire.points.length - 1; i++) {
          if (isPointOnSegment(pin.p!, wire.points[i], wire.points[i+1])) {
            wire.points.forEach(wp => groundNodes.add(toGridNode(wp)));
          }
        }
        // Also check exact vertex matches
        wire.points.forEach(wp => {
          if (toGridNode(wp) === pin.gridNode) {
            wire.points.forEach(wp2 => groundNodes.add(toGridNode(wp2)));
          }
        });
      });
    });
  });

  // Expand groundNodes transitively: any net that contains a groundNode is entirely ground
  finalNets.forEach(net => {
    let hasGround = false;
    net.forEach(gn => { if (groundNodes.has(gn)) hasGround = true; });
    if (hasGround) net.forEach(gn => groundNodes.add(gn));
  });

  // Assign stable node IDs: ground net -> "0", then numbered 1,2,3... for the rest.
  // We number by iteration order of finalNets, but put ground first (index 0 skipped).
  let nodeCounter = 1;
  const netIdMap = new Map<number, string>(); // finalNets index -> SPICE node id
  let groundNetIndex = -1;
  finalNets.forEach((net, idx) => {
    let isGround = false;
    net.forEach(gn => { if (groundNodes.has(gn)) isGround = true; });
    if (isGround) {
      netIdMap.set(idx, "0");
      groundNetIndex = idx;
    }
  });
  // Auto-ground the first net if no ground exists
  if (!hasGroundComponents && groundNetIndex === -1 && finalNets.length > 0) {
    netIdMap.set(0, "0");
    groundNetIndex = 0;
  }
  finalNets.forEach((_, idx) => {
    if (!netIdMap.has(idx)) {
      netIdMap.set(idx, `${nodeCounter++}`);
    }
  });

  const getNodeId = (gridNode: string): string => {
    if (groundNodes.has(gridNode)) return "0";
    
    const netIndex = finalNets.findIndex(net => net.has(gridNode));
    if (netIndex !== -1) {
      return netIdMap.get(netIndex) ?? `NC_${gridNode.replace(',', '_')}`;
    }
    
    return `NC_${gridNode.replace(',', '_')}`;  
  };

  // 2. Generate SPICE statements
  processedComponents.forEach(comp => {
    if (comp.type === 'TextAnnotation') return;
    
    const pins = getComponentPins(comp);
    if (pins.length === 0 && comp.type !== 'Ground') {
      netlist += `* Warning: Missing pin data for ${comp.id}\n`;
      return;
    }

    if (comp.type === 'Ammeter') {
      const n1 = getNodeId(pins[0].gridNode);
      const n2 = getNodeId(pins[1].gridNode);
      netlist += `${comp.id} ${n1} ${n2} DC 0\n`;
      // Prevent singular matrix if the ammeter splits a wire at a dead end or junction
      netlist += `R_leak1_${comp.id} ${n1} 0 1G\n`;
      netlist += `R_leak2_${comp.id} ${n2} 0 1G\n`;
      return;
    }
    
    if (comp.type === 'Ground') return;

    const nodes = pins.map(p => getNodeId(p.gridNode));

    // BUG-FIX: Resistor and Load (Potentiometer & Fuse are handled below with correct SPICE prefixes)
    if (comp.type === 'Resistor' || comp.type === 'Load') {
      const val = (comp.value || '1k').replace('Î©', '');
      netlist += `R_${comp.id} ${nodes[0]} ${nodes[1]} ${val}\n`;
    }
    // BUG-FIX #2: Potentiometer â€” SPICE 'p' prefix means coupled-inductor, not pot.
    // Model as two series resistors with wiper at 50% by default.
    else if (comp.type === 'Potentiometer') {
      const total = parseSpiceToFloat(comp.value || '10k') || 10000;
      const wiper = total / 2; // 50% wiper position
      netlist += `R_${comp.id}_A ${nodes[0]} ${nodes[1]}_wiper ${wiper}\n`;
      netlist += `R_${comp.id}_B ${nodes[1]}_wiper ${nodes[1]} ${wiper}\n`;
      // Wiper node is the midpoint â€” wire to nodes[1] if the user only connects 2 pins
    }
    // BUG-FIX #3: Fuse â€” SPICE 'f' prefix means CCCS. Model fuse as a tiny resistor (1mÎ©).
    else if (comp.type === 'Fuse') {
      netlist += `R_${comp.id} ${nodes[0]} ${nodes[1]} 0.001\n`; // 1mÎ© â€” fuse resistance
    }
    else if (comp.type === 'Capacitor') {
      const val = (comp.value || "1uF").replace('F', '');
      netlist += `C_${comp.id} ${nodes[0]} ${nodes[1]} ${val}\n`;
    }
    else if (comp.type === 'Inductor') {
      const val = (comp.value || "1mH").replace('H', '');
      netlist += `L_${comp.id} ${nodes[0]} ${nodes[1]} ${val}\n`;
    }
      else if (comp.type === 'Diode') {
        const rawVal = (comp.value || "1N4148").toUpperCase();
        
        const diodeModels: Record<string, string> = {
          '1N4148': '.model 1N4148 D (IS=2.52n RS=0.568 N=1.752 CJO=4p M=0.4 tt=20n IKF=54.5m BV=100 IBV=100u)',
          '1N4001': '.model 1N4001 D (IS=14.11n RS=0.0336 N=1.98 CJO=51.17p M=0.2762 VJ=0.3905 tt=4.761u BV=50 IBV=10u)',
          '1N4004': '.model 1N4004 D (IS=14.11n RS=0.0336 N=1.98 CJO=51.17p M=0.2762 VJ=0.3905 tt=4.761u BV=400 IBV=10u)',
          '1N4007': '.model 1N4007 D (IS=14.11n RS=0.0336 N=1.98 CJO=51.17p M=0.2762 VJ=0.3905 tt=4.761u BV=1000 IBV=10u)'
        };
        
        const modelKey = Object.keys(diodeModels).find(k => rawVal.includes(k)) || '1N4148';
        const usedModelName = modelKey;
        const modelDef = diodeModels[modelKey] || diodeModels['1N4148'];

        netlist += `D_${comp.id} ${nodes[0]} ${nodes[1]} ${usedModelName}\n`;
        models.add(modelDef);
      }
    else if (comp.type === 'TransistorNPN') {
        const cNode = nodes[1] || '0';
        const bNode = nodes[0] || '0';
        const eNode = nodes[2] || '0';
        const rawVal = (comp.value || '2N3904').toUpperCase();
        
        const npnModels: Record<string, string> = {
          '2N3904': '.model 2N3904 NPN (IS=1E-14 VAF=100 BF=300 IKF=0.4 XTB=1.5 BR=4 CJC=4E-12 CJE=8E-12 TR=250E-9 TF=350E-12 ITF=1 VTF=2 XTF=3)',
          'BC547':  '.model BC547 NPN (IS=1.8E-14 VAF=80 BF=400 IKF=0.1 XTB=1.5 BR=4 CJC=4E-12 CJE=8E-12 TR=250E-9 TF=350E-12)',
          'BC548':  '.model BC548 NPN (IS=1.8E-14 VAF=80 BF=400 IKF=0.1 XTB=1.5 BR=4 CJC=4E-12 CJE=8E-12 TR=250E-9 TF=350E-12)',
          'BC549':  '.model BC549 NPN (IS=1.8E-14 VAF=80 BF=500 IKF=0.1 XTB=1.5 BR=4 CJC=4E-12 CJE=8E-12 TR=250E-9 TF=350E-12)',
          '2N2222': '.model 2N2222 NPN (IS=1E-14 VAF=74 BF=400 IKF=0.3 XTB=1.5 BR=6 CJC=8E-12 CJE=25E-12 TR=10E-9 TF=0.5E-9)'
        };
        
        const modelKey = Object.keys(npnModels).find(k => rawVal.includes(k)) || '2N3904';
        const usedModelName = modelKey;
        const modelDef = npnModels[modelKey] || npnModels['2N3904'];
        
        netlist += `Q_${comp.id} ${cNode} ${bNode} ${eNode} ${usedModelName}\n`;
        models.add(modelDef);
      }
    else if (comp.type === 'SwitchSPST') {
      const isClosed = comp.value !== 'Open';
      const rVal = isClosed ? '1m' : '1G';
      netlist += `R_${comp.id} ${nodes[0]} ${nodes[1]} ${rVal}\n`;
    }
    else if (comp.type === 'Timer555') {
      // Built-in 555 macromodel â€” no external .lib needed
      // Pin order from getComponentPins: VCC, GND, RST, DIS, THR, TRI, CON, OUT
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const vcc = pinMap['VCC'] || nodes[0] || '5';
      const gnd = pinMap['GND'] || nodes[1] || '0';
      const rst = pinMap['RST'] || nodes[2] || vcc;  // default RST tied to VCC = enabled
      const dis = pinMap['DIS'] || nodes[3] || '0';
      const thr = pinMap['THR'] || nodes[4] || '0';
      const tri = pinMap['TRI'] || nodes[5] || '0';
      const con = pinMap['CON'] || nodes[6] || '0';
      const out = pinMap['OUT'] || nodes[7] || '0';
      netlist += `X_${comp.id} ${vcc} ${gnd} ${rst} ${dis} ${thr} ${tri} ${con} ${out} LM555\n`;
      models.add(
`.subckt LM555 VCC GND RST DIS THR TRI CON OUT
* 555 Timer Macromodel with SR Latch
R_d1 VCC CON 5k
R_d2 CON ref_lo 5k
R_d3 ref_lo GND 5k
* SR Latch state storage (capacitor holds latch value)
C_latch latch GND 100p
R_leak latch GND 1G
* SET: TRI < 1/3 VCC charges latch positive via diode
B_set set_drv GND V = V(TRI) < V(ref_lo) ? 5 : -5
R_set set_drv set_mid 1k
D_set set_mid latch DMOD555
* RESET: THR > 2/3 VCC discharges latch via diode
B_rst rst_drv GND V = V(THR) > V(CON) ? 5 : -5
R_rst rst_drv rst_mid 1k
D_rst latch rst_mid DMOD555
* RST pin override (active LOW, threshold 0.7V)
B_rst_pin rst_pin_drv GND V = V(RST) < 0.7 ? 5 : -5
R_rst_pin rst_pin_drv rst_pin_mid 1k
D_rst_pin latch rst_pin_mid DMOD555
* Output buffer
B_out OUT GND V = V(latch) > 0.5 ? V(VCC) : 0
R_load OUT GND 1Meg
* Discharge open-collector (ON when output LOW)
B_dis_gate dis_gate GND V = V(latch) > 0.5 ? 0 : 5
S_dis DIS GND dis_gate GND SMOD555
.model SMOD555 SW(VT=2.5 VH=0.1 RON=10 ROFF=10Meg)
.model DMOD555 D(IS=1e-14)
.ends LM555`);
    }
    else if (comp.type === 'Opamp' || comp.type === 'Comparator' || comp.type === 'Opamps') {
      const inPlus = nodes[0] || '0';
      const inMinus = nodes[1] || '0';
      const out = nodes[2] || '0';
      netlist += `X_${comp.id} ${inMinus} ${inPlus} ${out} IDEAL_OPAMP\n`;
      models.add(`.subckt IDEAL_OPAMP IN- IN+ OUT\nB1 OUT 0 V=15*tanh((V(IN+)-V(IN-))*100000)\n.ends`);
    }
    else if (comp.type === 'Opamp5') {
      const inPlus = nodes[0] || '0';
      const inMinus = nodes[1] || '0';
      const out = nodes[2] || '0';
      const vcc = nodes[3] || '0';
      const vee = nodes[4] || '0';
      netlist += `X_${comp.id} ${inMinus} ${inPlus} ${vcc} ${vee} ${out} LM741\n`;
      models.add(`.subckt LM741 IN- IN+ VCC VEE OUT\nB1 OUT 0 V=(V(VCC)-V(VEE))/2*tanh((V(IN+)-V(IN-))*100000)+(V(VCC)+V(VEE))/2\n.ends`);
    }
    else if (comp.type === 'OpampLM358') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const inP = pinMap['IN+'] || '0'; const inM = pinMap['IN-'] || '0';
      const vcc = pinMap['VCC'] || '0'; const vee = pinMap['VEE'] || '0';
      const out = pinMap['OUT'] || '0';
      netlist += `X_${comp.id} ${inM} ${inP} ${vcc} ${vee} ${out} LM358_MDL\n`;
      models.add(`.subckt LM358_MDL IN- IN+ VCC VEE OUT\nRin IN+ IN- 1Meg\nB1 OUT 0 V=(V(VCC)-V(VEE)-1.5)*tanh((V(IN+)-V(IN-))*200000)+(V(VCC)+V(VEE))/2\nRout OUT 0 100Meg\n.ends LM358_MDL`);
    }
    else if (comp.type === 'OpampTL071') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const inP = pinMap['IN+'] || '0'; const inM = pinMap['IN-'] || '0';
      const vcc = pinMap['VCC'] || '0'; const vee = pinMap['VEE'] || '0';
      const out = pinMap['OUT'] || '0';
      netlist += `X_${comp.id} ${inM} ${inP} ${vcc} ${vee} ${out} TL071_MDL\n`;
      models.add(`.subckt TL071_MDL IN- IN+ VCC VEE OUT\nRin IN+ IN- 1T\nB1 OUT 0 V=(V(VCC)-V(VEE)-2.5)*tanh((V(IN+)-V(IN-))*500000)+(V(VCC)+V(VEE))/2\nRout OUT 0 100Meg\n.ends TL071_MDL`);
    }
    else if (comp.type === 'SchmittTrigger') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const inP = pinMap['IN+'] || '0'; const inM = pinMap['IN-'] || '0';
      const vcc = pinMap['VCC'] || '0'; const vee = pinMap['VEE'] || '0';
      const out = pinMap['OUT'] || '0';
      const threshStr = comp.value || '3.3/1.7';
      const parts = threshStr.split('/');
      const vthH = parseFloat(parts[0]) || 3.3;
      const vthL = parseFloat(parts[1]) || 1.7;
      netlist += `X_${comp.id} ${inP} ${inM} ${vcc} ${vee} ${out} SCHMITT_${comp.id}\n`;
      models.add(`.subckt SCHMITT_${comp.id} IN+ IN- VCC VEE OUT\nC_state state 0 1p\nR_leak state 0 1G\nB_set set_d 0 V=V(IN+)>${vthH} ? 5 : -5\nR_set set_d set_m 1k\nD_set set_m state DSCHMITT\nB_rst rst_d 0 V=V(IN+)<${vthL} ? -5 : 5\nR_rst rst_d rst_m 1k\nD_rst state rst_m DSCHMITT\nB_out OUT 0 V=V(state)>0.5 ? V(VCC) : V(VEE)\n.model DSCHMITT D(IS=1e-14)\n.ends SCHMITT_${comp.id}`);
    }
    else if (comp.type === 'VCSwitch') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const ctrlP = pinMap['CTRL+'] || '0'; const ctrlM = pinMap['CTRL-'] || '0';
      const sw1 = pinMap['SW1'] || '0'; const sw2 = pinMap['SW2'] || '0';
      const vth = parseFloat(comp.value || '2.5') || 2.5;
      netlist += `S_${comp.id} ${sw1} ${sw2} ${ctrlP} ${ctrlM} VCSW_MDL\n`;
      models.add(`.model VCSW_MDL SW(VT=${vth} VH=0.1 RON=1m ROFF=1G)`);
    }
    else if (comp.type === 'VCCS') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const inP = pinMap['IN+'] || '0'; const inM = pinMap['IN-'] || '0';
      const outP = pinMap['OUT+'] || '0'; const outM = pinMap['OUT-'] || '0';
      const gm = parseFloat(comp.value || '0.001') || 0.001;
      netlist += `G_${comp.id} ${outP} ${outM} ${inP} ${inM} ${gm}\n`;
    }
    else if (comp.type === 'InstAmp') {
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const inP = pinMap['IN+'] || '0'; const inM = pinMap['IN-'] || '0';
      const ref = pinMap['REF'] || '0'; const out = pinMap['OUT'] || '0';
      const gain = parseFloat(comp.value || '100') || 100;
      netlist += `X_${comp.id} ${inP} ${inM} ${ref} ${out} INSTAMP_${comp.id}\n`;
      models.add(`.subckt INSTAMP_${comp.id} IN+ IN- REF OUT\nRin_diff IN+ IN- 10Meg\nB1 OUT 0 V=(V(IN+)-V(IN-))*${gain}+V(REF)\n.ends INSTAMP_${comp.id}`);
    }
    else if (comp.type === 'DCSource') {
      const val = (comp.value || "5V").replace('V', '');
      netlist += `V_${comp.id} ${nodes[0]} ${nodes[1]} DC ${val}\n`;
    }
    else if (comp.type === 'DCCurrent') {
      const val = (comp.value || "1A").replace('A', '');
      netlist += `I_${comp.id} ${nodes[0]} ${nodes[1]} DC ${val}\n`;
    }
    else if (comp.type === 'ACSource') {
      const parts = (comp.value || "1Vpk 1kHz").split(' ');
      const amp = (parts[0] || "1").replace('Vpk', '').replace('V', '');
      const freq = (parts[1] || "1k").replace('Hz', '');
      netlist += `V_${comp.id} ${nodes[0]} ${nodes[1]} SINE(0 ${amp} ${freq})\n`;
    }
    else if (comp.type === 'ACCurrent') {
      const parts = (comp.value || "1Apk 1kHz").split(' ');
      const amp = (parts[0] || "1").replace('Apk', '').replace('A', '');
      const freq = (parts[1] || "1k").replace('Hz', '');
      // I1 n1 n2 AC 1 SIN(...)
      netlist += `I_${comp.id} ${nodes[0]} ${nodes[1]} AC ${amp} SINE(0 ${amp} ${freq})\n`;
    }
    else if (comp.type === 'ClockVoltage') {
      const val = (comp.value || "5V").replace('V', '');
      netlist += `V_${comp.id} ${nodes[0]} ${nodes[1]} PULSE(0 ${val} 0 1n 1n 0.5m 1m)\n`;
    }
    else if (comp.type === 'ClockCurrent') {
      const val = parseSpiceToFloat(comp.value || '1A') || 1;
      netlist += `I_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PULSE(0 ${val} 0 1n 1n 0.5m 1m)\n`;
    }
    else if (comp.type === 'PulseCurrent') {
      const rawVal = comp.value || '0 1 0 1n 1n 0.5m 1m';
      const pulseParams = rawVal.includes(' ')
        ? rawVal
        : `0 ${rawVal.replace('A', '')} 0 1n 1n 0.5m 1m`;
      netlist += `I_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PULSE(${pulseParams})\n`;
    }
    else if (comp.type === 'PulseVoltage') {
      // BUG-FIX #1: PULSE needs all 7 params: PULSE(V1 V2 TD TR TF PW PER)
      // If the user stored just "5V" or "5", convert it to a valid set of defaults.
      const rawVal = comp.value || '0 5 0 1n 1n 0.5m 1m';
      // Check if it looks like a full PULSE param string (has spaces) or just an amplitude
      const pulseParams = rawVal.includes(' ')
        ? rawVal
        : `0 ${rawVal.replace('V', '')} 0 1n 1n 0.5m 1m`;
      netlist += `V_${comp.id} ${nodes[0]} ${nodes[1]} PULSE(${pulseParams})\n`;
    }
    else if (comp.type === 'Transformer1P1S' || comp.type === 'Transformer' ||
             comp.type === 'Transformer1P2S' || comp.type === 'Transformer2P1S' ||
             comp.type === 'Transformer2P2S' || comp.type === 'Transformer1P1S_CT') {
      // Get named pins from getComponentPins (P1+, P1-, S1+, S1-, etc.)
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const p1p = pinMap['P1+'] || nodes[0] || '0';
      const p1m = pinMap['P1-'] || nodes[1] || '0';
      const s1p = pinMap['S1+'] || nodes[2] || '0';
      const s1m = pinMap['S1-'] || nodes[3] || '0';
      const ct  = pinMap['CT'];
      const p2p = pinMap['P2+'];
      const p2m = pinMap['P2-'];
      const s2p = pinMap['S2+'];
      const s2m = pinMap['S2-'];

      // Parse turns ratio from value (e.g. "10" means 10:1, "1" means 1:1)
      const ratio = parseSpiceToFloat(comp.value || '1') || 1;
      // L1=1H, L2=1H/ratioÂ² gives correct turns ratio with tight coupling
      const L1 = 0.1;  // 100mH primary
      const L2 = L1 / (ratio * ratio);

      // DC bias resistors and small series resistors prevent singular matrix errors
      // Use internal nodes to add 1m ohm series resistance to the ideal inductors
      const p1m_int = `p1m_int_${comp.id}`;
      const s1m_int = `s1m_int_${comp.id}`;

      netlist += `L1p_${comp.id} ${p1p} ${p1m_int} ${L1}\n`;
      netlist += `Rser_p1_${comp.id} ${p1m_int} ${p1m} 1m\n`;
      netlist += `Rpar_p1_${comp.id} ${p1p} ${p1m} 1Meg\n`;

      netlist += `L1s_${comp.id} ${s1p} ${s1m_int} ${L2}\n`;
      netlist += `Rser_s1_${comp.id} ${s1m_int} ${s1m} 1m\n`;
      netlist += `Rpar_s1_${comp.id} ${s1p} ${s1m} 1Meg\n`;
      
      netlist += `K1_${comp.id} L1p_${comp.id} L1s_${comp.id} 0.999\n`;

      if (p2p && p2m) {
        netlist += `L2p_${comp.id} ${p2p} ${p2m} ${L1}\n`;
        netlist += `Rpar_p2_${comp.id} ${p2p} ${p2m} 1Meg\n`;
        netlist += `K2_${comp.id} L2p_${comp.id} L1s_${comp.id} 0.999\n`;
      }
      if (s2p && s2m) {
        netlist += `L2s_${comp.id} ${s2p} ${s2m} ${L2}\n`;
        netlist += `Rpar_s2_${comp.id} ${s2p} ${s2m} 1Meg\n`;
        netlist += `K3_${comp.id} L1p_${comp.id} L2s_${comp.id} 0.999\n`;
      }
      if (ct) {
        // Center tap: model as midpoint (CT to S1- = half the secondary winding)
        const Lhalf = L2 / 4;
        netlist += `Lct1_${comp.id} ${s1p} ${ct} ${Lhalf}\n`;
        netlist += `Rpar_ct1_${comp.id} ${s1p} ${ct} 1Meg\n`;
        netlist += `Lct2_${comp.id} ${ct} ${s1m} ${Lhalf}\n`;
        netlist += `Rpar_ct2_${comp.id} ${ct} ${s1m} 1Meg\n`;
        netlist += `Kct_${comp.id} L1p_${comp.id} Lct1_${comp.id} 0.999\n`;
        netlist += `Kct2_${comp.id} L1p_${comp.id} Lct2_${comp.id} 0.999\n`;
      }
    }
    // --- NEW DIODES ---
    else if (comp.type === 'DiodeZener') {
      // BUG-FIX #5: Use a Zener BV lookup table based on common part numbers.
      // Fallback to 5.1V if unknown.
      const partMap: Record<string, number> = {
        '1N4728A': 3.3, '1N4729A': 3.6, '1N4730A': 3.9,
        '1N4731A': 4.3, '1N4732A': 4.7, '1N4733A': 5.1,
        '1N4734A': 5.6, '1N4735A': 6.2, '1N4736A': 6.8,
        '1N4737A': 7.5, '1N4738A': 8.2, '1N4739A': 9.1,
        '1N4740A': 10,  '1N4741A': 11,  '1N4742A': 12,
        '1N4743A': 13,  '1N4744A': 15,  '1N4745A': 16,
        '1N4746A': 18,  '1N4747A': 20,  '1N4748A': 22,
        '1N4749A': 24,  '1N4750A': 27,  '1N4751A': 30,
        'BZX55C3V3': 3.3, 'BZX55C5V1': 5.1, 'BZX55C9V1': 9.1,
      };
      const partVal = (comp.value || '').toUpperCase();
      const bv = (partMap[partVal] ?? parseSpiceToFloat(partVal)) || 5.1;
      const modelName = `DZENER_${bv.toString().replace('.', 'p')}`;
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} ${modelName}\n`;
      models.add(`.model ${modelName} D (BV=${bv} IBV=5m RS=10)`);
    }
    else if (comp.type === 'DiodeSchottky') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DSCHOTTKY
`;
      models.add('.model DSCHOTTKY D (IS=10n N=1.5 RS=1 EG=0.69)');
    }
    else if (comp.type === 'LED') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DLED
`;
      models.add('.model DLED D (IS=1p N=2 RS=5 BV=5 IBV=10u EG=2.1)');
    }
    else if (comp.type === 'BridgeRectifier') {
      // 4 pins ordered by pin ID: 1=Left AC (~), 2=Right AC (~), 3=Top (+DC), 4=Bottom (-DC)
      const ac1 = nodes[0] || '0';
      const ac2 = nodes[1] || '0';
      const pos = nodes[2] || '0';
      const neg = nodes[3] || '0';
      // Standard bridge rectifier: D1,D2 pass positive half; D3,D4 pass negative half
      netlist += `D1_${comp.id} ${ac1} ${pos} D_1N4007\n`;
      netlist += `D2_${comp.id} ${neg} ${ac1} D_1N4007\n`;
      netlist += `D3_${comp.id} ${ac2} ${pos} D_1N4007\n`;
      netlist += `D4_${comp.id} ${neg} ${ac2} D_1N4007\n`;
      // Small bleed resistor prevents singular matrix if output is floating
      netlist += `Rbleed_${comp.id} ${pos} ${neg} 10Meg\n`;
      models.add('.model D_1N4007 D (IS=76.9p RS=0.064 N=1.45 BV=1000 IBV=5u CJO=26.5p TT=4.32u)');
    }
    // --- NEW TRANSISTORS ---
    else if (comp.type === 'TransistorPNP') {
      // SPICE format: Q name Collector Base Emitter model
      // Pin order from getComponentPins: nodes[0]=Base, nodes[1]=Collector, nodes[2]=Emitter
      netlist += `Q_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} QPNP\n`;
      models.add('.model QPNP PNP (BF=100 BR=1 IS=10f VAF=50)');
    }
    else if (comp.type === 'MosfetN') {
      netlist += `M_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} ${nodes[2] || '0'} NMOSMOD
`;
      models.add('.model NMOSMOD NMOS (LEVEL=1 VTO=2 KP=20m)');
    }
    else if (comp.type === 'MosfetP') {
      netlist += `M_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} ${nodes[2] || '0'} PMOSMOD
`;
      models.add('.model PMOSMOD PMOS (LEVEL=1 VTO=-2 KP=20m)');
    }
    else if (comp.type === 'JFET') {
      netlist += `J_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} NJFETMOD\n`;
      models.add('.model NJFETMOD NJF (VTO=-2 BETA=1m)');
    }
    else if (comp.type === 'IGBT') {
      // Basic IGBT approximation (BJT + MOSFET) or just subcircuit
      netlist += `X_${comp.id} ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} IGBTMOD\n`;
      models.add(`.subckt IGBTMOD C G E\nM1 C G E E NMOSMOD\n.ends`);
      models.add(`.model NMOSMOD NMOS (LEVEL=1 VTO=2 KP=20m)`);
    }
    else if (comp.type === 'ThyristorSCR') {
      const gNode = nodes[0] || '0';
      const aNode = nodes[1] || '0';
      const kNode = nodes[2] || '0';
      netlist += `X_${comp.id} ${aNode} ${gNode} ${kNode} SCR_MODEL\n`;
      models.add(`.SUBCKT SCR_MODEL A G K\nQ1 G N_internal A PNPMOD\nQ2 N_internal G K NPNMOD\n.MODEL PNPMOD PNP (BF=50)\n.MODEL NPNMOD NPN (BF=50)\n.ENDS`);
    }
    else if (comp.type === 'Optocoupler') {
      const aNode = nodes[0] || '0';
      const kNode = nodes[1] || '0';
      const eNode = nodes[2] || '0';
      const cNode = nodes[3] || '0';
      netlist += `X_${comp.id} ${aNode} ${kNode} ${cNode} ${eNode} OPTO_MODEL\n`;
      models.add(`.SUBCKT OPTO_MODEL A K C E\nV_measure A N1 0\nD1 N1 K DLED\n.MODEL DLED D (IS=1p N=2 RS=5 BV=5)\nF1 0 B V_measure 0.5\nQ1 C B E NPNMOD\n.MODEL NPNMOD NPN(BF=100)\nR_dummy B E 100k\n.ENDS`);
    }
    else if (comp.type === 'VoltageRegulator7805' || comp.type === 'VoltageRegulator7812' || comp.type === 'VoltageRegulatorLM317') {
      const val = comp.type;
      const inNode = nodes[0] || '0';
      const gndNode = nodes[1] || '0'; // Or ADJ
      const outNode = nodes[2] || '0';
      
      if (val === 'VoltageRegulator7805') {
        netlist += `X_${comp.id} ${inNode} ${outNode} ${gndNode} LM7805_MODEL\n`;
        models.add(`.SUBCKT LM7805_MODEL IN OUT GND\nE_reg OUT GND VALUE={IF(V(IN,GND)>7, 5, V(IN,GND)-2)}\nR_out OUT 0 10Meg\n.ENDS`);
      } else if (val === 'VoltageRegulator7812') {
        netlist += `X_${comp.id} ${inNode} ${outNode} ${gndNode} LM7812_MODEL\n`;
        models.add(`.SUBCKT LM7812_MODEL IN OUT GND\nE_reg OUT GND VALUE={IF(V(IN,GND)>14, 12, V(IN,GND)-2)}\nR_out OUT 0 10Meg\n.ENDS`);
      } else {
        netlist += `X_${comp.id} ${inNode} ${outNode} ${gndNode} LM317_MODEL\n`;
        models.add(`.SUBCKT LM317_MODEL IN OUT ADJ\nE_reg OUT ADJ VALUE={IF(V(IN,ADJ)>3, 1.25, V(IN,ADJ)*0.4)}\nR_out OUT 0 10Meg\n.ENDS`);
      }
    }
    else if (comp.type === 'IC74LS00') {
      const pinsList = [];
      for(let i=0; i<14; i++) pinsList.push(nodes[i] || '0');
      netlist += `X_${comp.id} ${pinsList.join(' ')} IC74LS00_DIP14\n`;
      models.add(`.SUBCKT IC74LS00_DIP14 1 2 3 4 5 6 7 8 9 10 11 12 13 14\n` +
                 `B_G1 3 0 V = (V(14,7)>4 && !(V(1,7)>2.5 && V(2,7)>2.5)) ? 5 : 0\n` +
                 `B_G2 6 0 V = (V(14,7)>4 && !(V(4,7)>2.5 && V(5,7)>2.5)) ? 5 : 0\n` +
                 `B_G3 8 0 V = (V(14,7)>4 && !(V(9,7)>2.5 && V(10,7)>2.5)) ? 5 : 0\n` +
                 `B_G4 11 0 V = (V(14,7)>4 && !(V(12,7)>2.5 && V(13,7)>2.5)) ? 5 : 0\n` +
                 `R_vcc 14 0 10Meg\nR_gnd 7 0 10Meg\n.ENDS`);
    }
    // --- NEW SWITCHES ---
    else if (comp.type === 'SPDTSwitch' || comp.type === 'Relay') {
      // 3 pins: Com, NO, NC. Hard to simulate mechanical without control, default to 1 ohm to NO, 1G to NC
      netlist += `R_NO_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1\n`;
      netlist += `R_NC_${comp.id} ${nodes[0] || '0'} ${nodes[2] || '0'} 1G\n`;
    }
    else if (comp.type === 'PushButton') {
      netlist += `R_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1G
`; // Open by default
    }
    // --- NEW PASSIVES ---
    else if (comp.type === 'CoupledInductors') {
      // DC bias resistors across each winding prevent singular matrix errors
      netlist += `L1_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 10m\n`;
      netlist += `Rpar_l1_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1Meg\n`;
      netlist += `L2_${comp.id} ${nodes[2] || '0'} ${nodes[3] || '0'} 10m\n`;
      netlist += `Rpar_l2_${comp.id} ${nodes[2] || '0'} ${nodes[3] || '0'} 1Meg\n`;
      netlist += `K_${comp.id} L1_${comp.id} L2_${comp.id} 0.99\n`;
    }
    else if (comp.type === 'LossyTransmissionLine' || comp.type === 'LosslessTransmissionLine') {
      netlist += `T_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} ${nodes[2] || '0'} ${nodes[3] || '0'} Z0=50 TD=1n\n`;
    }
    else if (comp.type === 'Lamp') {
      netlist += `R_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 100\n`;
    }
    else if (comp.type === 'SevenSegment') {
      // 8 pins: nodes[0..6] = segments A-G inputs, nodes[7] = common cathode (K)
      const kNode = nodes[7] || '0';
      const segNames = ['a','b','c','d','e','f','g'];
      segNames.forEach((seg, i) => {
        const aNode = nodes[i] || '0';
        // Each segment: series 330Î© resistor + LED diode to common cathode
        netlist += `R_${comp.id}_${seg} ${aNode} seg_${comp.id}_${seg} 330\n`;
        netlist += `D_${comp.id}_${seg} seg_${comp.id}_${seg} ${kNode} DLED\n`;
      });
      models.add('.model DLED D(IS=1e-20 N=1.6 RS=5 BV=5)');
    }
    else if (comp.type === 'CrystalOscillator') {
      const n1 = nodes[0] || '0';
      const n2 = nodes[1] || '0';
      netlist += `L_${comp.id} ${n1} mid1_${comp.id} 1m\n`;
      netlist += `C_${comp.id} mid1_${comp.id} mid2_${comp.id} 10p\n`;
      netlist += `R_${comp.id} mid2_${comp.id} ${n2} 100\n`;
    }
    else if (comp.type === 'Photodiode') {
      netlist += `D_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} DPHOTO\n`;
      models.add('.model DPHOTO D(IS=1e-10 N=1.8 RS=10)');
    }
    else if (comp.type === 'Phototransistor') {
      netlist += `Q_${comp.id} ${nodes[0] || '0'} ${nodes[0] || '0'} ${nodes[1] || '0'} 2N3904\n`;
      models.add('.model 2N3904 NPN (IS=1E-14 VAF=100 BF=300)');
    }
    else if (comp.type === 'DIP14') {
      netlist += `* DIP14 stub for ${comp.id}\n`;
    }
    else if (comp.type === 'TRIAC') {
      const mt1 = nodes[0] || '0';
      const mt2 = nodes[1] || '0';
      const gate = nodes[2] || '0';
      netlist += `S_${comp.id} ${mt1} ${mt2} ${gate} ${mt1} SMOD_TRIAC\n`;
      models.add('.model SMOD_TRIAC SW(VT=0.7 VH=0.5 RON=0.1 ROFF=1MEG)');
    }
    else if (comp.type === 'DIAC') {
      netlist += `D_${comp.id}a ${nodes[0] || '0'} ${nodes[1] || '0'} 1N4148\n`;
      netlist += `D_${comp.id}b ${nodes[1] || '0'} ${nodes[0] || '0'} 1N4148\n`;
    }
    else if (comp.type === 'Darlington') {
      netlist += `Q_${comp.id}a ${nodes[1] || '0'} ${nodes[0] || '0'} emid_${comp.id} 2N3904\n`;
      netlist += `Q_${comp.id}b ${nodes[1] || '0'} emid_${comp.id} ${nodes[2] || '0'} 2N3904\n`;
      models.add('.model 2N3904 NPN (IS=1E-14 VAF=100 BF=300)');
    }
    else if (comp.type === 'CurrentMirror') {
      netlist += `Q_${comp.id}a ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[0] || '0'} 2N3904\n`;
      netlist += `Q_${comp.id}b ${nodes[1] || '0'} ${nodes[0] || '0'} ${nodes[2] || '0'} 2N3904\n`;
      // Bias resistor: from VCC (nodes[1]) to the shared base/collector (nodes[0])
      netlist += `R_${comp.id}_bias ${nodes[1] || '0'} ${nodes[0] || '0'} 10k\n`;
      models.add('.model 2N3904 NPN (IS=1E-14 VAF=100 BF=300)');
    }
    else if (comp.type === 'Resistors') {
      // 4 pin pack, 2 resistors
      netlist += `R1_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} 1k
`;
      netlist += `R2_${comp.id} ${nodes[2] || '0'} ${nodes[3] || '0'} 1k
`;
    }
    else if (comp.type === 'Connector') {
      netlist += `R_${comp.id} ${nodes[0] || '0'} 0 1G
`; // dummy termination
    }
    // --- NEW SOURCES ---
    else if (comp.type === 'ThreePhaseDelta' || comp.type === 'ThreePhaseWye') {
      // Pins: A, B, C (phase terminals) + N (neutral/star point)
      const pinMap: Record<string, string> = {};
      pins.forEach(p => { pinMap[p.id] = getNodeId(p.gridNode); });
      const pA  = pinMap['A'] || nodes[0] || '1';
      const pB  = pinMap['B'] || nodes[1] || '2';
      const pC  = pinMap['C'] || nodes[2] || '3';
      const pN  = pinMap['N'] || nodes[3] || '0';  // Neutral / reference
      const amp  = parseSpiceToFloat(comp.value || '230') || 230; // RMS â†’ use peak
      const freq  = 50; // 50 Hz default
      const peak  = amp * Math.sqrt(2);
      if (comp.type === 'ThreePhaseWye') {
        // Star (Wye): 3 voltage sources, each from neutral to phase
        netlist += `V_${comp.id}_A ${pA} ${pN} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 0)\n`;
        netlist += `V_${comp.id}_B ${pB} ${pN} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 -120)\n`;
        netlist += `V_${comp.id}_C ${pC} ${pN} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 -240)\n`;
      } else {
        // Delta: Use internal star-point to avoid voltage source loop (KVL violation in SPICE)
        // Star-equivalent gives identical line-to-line voltages without circular dependency
        const intNode = `${comp.id}_star`;
        netlist += `V_${comp.id}_A ${pA} ${intNode} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 0)\n`;
        netlist += `V_${comp.id}_B ${pB} ${intNode} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 -120)\n`;
        netlist += `V_${comp.id}_C ${pC} ${intNode} SINE(0 ${peak.toFixed(2)} ${freq} 0 0 -240)\n`;
        netlist += `R_${comp.id}_N ${pN} ${intNode} 0.001\n`;
      }
    }
    else if (comp.type === 'AMVoltage') {
      netlist += `V_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} AM(1 1 1k 10k)\n`; // offset, amp, fc, fm
    }
    else if (comp.type === 'FMVoltage' || comp.type === 'ChirpVoltage') {
      netlist += `V_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} SFFM(0 1 10k 5 1k)\n`; // offset, amp, fc, mdi, fs
    }
    else if (comp.type === 'StepVoltage') {
      netlist += `V_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PWL(0 0 1m 5)\n`;
    }
    else if (comp.type === 'ThermalNoise') {
      // Use TRRANDOM instead of TRNOISE because TRNOISE can cause a hard crash in ngspice-wasm
      netlist += `V_${comp.id} ${nodes[0]} ${nodes[1]} TRRANDOM(1 1m 0 1)\n`;
    }
    else if (comp.type === 'ArbitraryVoltageSource') {
      netlist += `B_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} V=5*sin(time)\n`;
    }
    // BUG-FIX #6: Missing source types â€” TriangularVoltage, and all current-source variants
    else if (comp.type === 'TriangularVoltage') {
      const parts = (comp.value || '5V 1kHz').split(' ');
      const amp = parseSpiceToFloat(parts[0] || '5') || 5;
      const freq = parseSpiceToFloat(parts[1] || '1k') || 1000;
      const halfPeriod = 1 / freq / 2;
      netlist += `V_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PULSE(0 ${amp} 0 ${halfPeriod} ${halfPeriod} 0 ${halfPeriod * 2})\n`;
    }
    else if (comp.type === 'TriangularCurrent') {
      const parts = (comp.value || '1A 1kHz').split(' ');
      const amp = parseSpiceToFloat(parts[0] || '1') || 1;
      const freq = parseSpiceToFloat(parts[1] || '1k') || 1000;
      const halfPeriod = 1 / freq / 2;
      netlist += `I_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PULSE(0 ${amp} 0 ${halfPeriod} ${halfPeriod} 0 ${halfPeriod * 2})\n`;
    }
    else if (comp.type === 'StepCurrent') {
      const val = parseSpiceToFloat(comp.value || '1A') || 1;
      netlist += `I_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} PWL(0 0 1m ${val})\n`;
    }
    else if (comp.type === 'FMCurrent' || comp.type === 'ChirpCurrent') {
      const parts = (comp.value || '1Apk 1kHz').split(' ');
      const amp = parseSpiceToFloat(parts[0] || '1') || 1;
      const freq = (parts[1] || '1k').replace('Hz','');
      netlist += `I_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} SFFM(0 ${amp} ${freq} 5 1k)\n`;
    }
    else if (comp.type === 'ArbitraryCurrentSource') {
      netlist += `B_${comp.id} ${nodes[0] || '0'} ${nodes[1] || '0'} I=sin(2*3.14159*1k*time)\n`;
    }

    // â”€â”€ Digital Logic Gates (modeled as analog behavioral voltage sources) â”€â”€
    // VDD rail = 5V, switching threshold = 2.5V, output swings 0-5V
    else if (comp.type === 'GateAND') {
      const a = nodes[0] || '0', b = nodes[1] || '0', y = nodes[2] || '0';
      netlist += `B_${comp.id} ${y} 0 V = (V(${a}) > 2.5 && V(${b}) > 2.5) ? 5 : 0\n`;
    }
    else if (comp.type === 'GateOR') {
      const a = nodes[0] || '0', b = nodes[1] || '0', y = nodes[2] || '0';
      netlist += `B_${comp.id} ${y} 0 V = (V(${a}) > 2.5 || V(${b}) > 2.5) ? 5 : 0\n`;
    }
    else if (comp.type === 'GateNAND') {
      const a = nodes[0] || '0', b = nodes[1] || '0', y = nodes[2] || '0';
      netlist += `B_${comp.id} ${y} 0 V = (V(${a}) > 2.5 && V(${b}) > 2.5) ? 0 : 5\n`;
    }
    else if (comp.type === 'GateNOR') {
      const a = nodes[0] || '0', b = nodes[1] || '0', y = nodes[2] || '0';
      netlist += `B_${comp.id} ${y} 0 V = (V(${a}) > 2.5 || V(${b}) > 2.5) ? 0 : 5\n`;
    }
    else if (comp.type === 'GateXOR') {
      const a = nodes[0] || '0', b = nodes[1] || '0', y = nodes[2] || '0';
      // XOR: (A>thresh) != (B>thresh)
      netlist += `B_${comp.id} ${y} 0 V = ((V(${a})>2.5)!=(V(${b})>2.5)) ? 5 : 0\n`;
    }
    else if (comp.type === 'GateNOT') {
      const a = nodes[0] || '0', y = nodes[1] || '0';
      netlist += `B_${comp.id} ${y} 0 V = (V(${a}) > 2.5) ? 0 : 5\n`;
    }
    else if (comp.type === 'IC74HC04') {
      // Hex inverter (NOT gate) behavioral model
      netlist += `B_${comp.id} ${nodes[1]} 0 V = (V(${nodes[0]}) > 2.5) ? 0 : 5\n`;
      netlist += `R_bias_${comp.id} ${nodes[1]} 0 1G\n`;
    }
    else if (comp.type === 'IC74HC00') {
      // 2-input NAND behavioral model
      netlist += `B_${comp.id} ${nodes[2]} 0 V = ((V(${nodes[0]}) > 2.5) && (V(${nodes[1]}) > 2.5)) ? 0 : 5\n`;
      netlist += `R_bias_${comp.id} ${nodes[2]} 0 1G\n`;
    }
    else if (comp.type === 'IC74HC86') {
      // 2-input XOR behavioral model
      netlist += `B_${comp.id} ${nodes[2]} 0 V = ((V(${nodes[0]}) > 2.5) ^ (V(${nodes[1]}) > 2.5)) ? 5 : 0\n`;
      netlist += `R_bias_${comp.id} ${nodes[2]} 0 1G\n`;
    }
    else if (comp.type === 'IC74HC138') {
      // 3-to-8 decoder (simplified 3-to-4): A=nodes[0], B=nodes[1], C=nodes[2], Y0..Y3=nodes[3..6]
      const a = `V(${nodes[0]})`;
      const b = `V(${nodes[1]})`;
      const c = `V(${nodes[2]})`;
      const th = '2.5';
      netlist += `B_${comp.id}_y0 ${nodes[3]} 0 V = ((${a} < ${th}) && (${b} < ${th}) && (${c} < ${th})) ? 5 : 0\n`;
      netlist += `B_${comp.id}_y1 ${nodes[4]} 0 V = ((${a} > ${th}) && (${b} < ${th}) && (${c} < ${th})) ? 5 : 0\n`;
      netlist += `B_${comp.id}_y2 ${nodes[5]} 0 V = ((${a} < ${th}) && (${b} > ${th}) && (${c} < ${th})) ? 5 : 0\n`;
      netlist += `B_${comp.id}_y3 ${nodes[6]} 0 V = ((${a} > ${th}) && (${b} > ${th}) && (${c} < ${th})) ? 5 : 0\n`;
      [nodes[3], nodes[4], nodes[5], nodes[6]].forEach((n, i) => {
        netlist += `R_bias_${comp.id}_${i} ${n} 0 1G\n`;
      });
    }
    else if (comp.type === 'DigitalSwitch') {
      const out = nodes[0] || '0';
      const v = comp.value === '1' ? '5' : '0';
      netlist += `V_${comp.id} ${out} 0 ${v}\n`;
    }
    else if (comp.type === 'DFlipFlop') {
      const d = nodes[0] || '0', clk = nodes[1] || '0', q = nodes[2] || '0', qbar = nodes[3] || '0';
      // Behavioral D flip-flop approximation using RC delay + comparator (continuous-time SPICE)
      // Note: True edge-triggered behavior requires XSPICE A-devices not available in WASM ngspice.
      // This model approximates: Q follows D with a small RC delay, gated by CLK level.
      const rc = `Rdff_${comp.id}`;
      const cd = `Cdff_${comp.id}`;
      const qint = `qint_${comp.id}`;
      models.add(`.subckt DFF D CLK Q QBAR\nRin D ${qint} 1k\nCdel ${qint} 0 1n\nBQ Q 0 V=limit(V(${qint})*10,0,5)\nBQB QBAR 0 V=5-limit(V(${qint})*10,0,5)\n.ends`);
      netlist += `X_${comp.id} ${d} ${clk} ${q} ${qbar} DFF\n`;
    }
    else if (comp.type === 'JKFlipFlop') {
      const j = nodes[0] || '0', clk = nodes[1] || '0', k = nodes[2] || '0', q = nodes[3] || '0', qbar = nodes[4] || '0';
      // Behavioral JK flip-flop approximation (continuous-time; not true edge-triggered)
      const qjk = `qjk_${comp.id}`;
      models.add(`.subckt JKFF J CLK K Q QBAR\nRj J ${qjk} 1k\nCj ${qjk} 0 1n\nBQ Q 0 V=limit(V(${qjk})*10,0,5)\nBQB QBAR 0 V=5-limit(V(${qjk})*10,0,5)\n.ends`);
      netlist += `X_${comp.id} ${j} ${clk} ${k} ${q} ${qbar} JKFF\n`;
    }
  });

  if (models.size > 0) {
    netlist += "\n* Models\n";
    models.forEach(model => netlist += `${model}\n`);
  }

  // Convergence options â€” critical for transformer + diode circuits
  netlist += "\n.options GMIN=1e-10 RELTOL=1e-3 ABSTOL=1e-9 VNTOL=1e-4 ITL1=500 ITL2=500 ITL4=200\n";

  // Default transient analysis for testing
  netlist += "\n.tran 100us 1s\n";
  netlist += ".end\n";
  return netlist;
}
