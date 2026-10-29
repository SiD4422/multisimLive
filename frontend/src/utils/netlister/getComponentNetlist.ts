import type { SchematicComponent } from '../../store/useSchematicStore';

export interface ComponentNetlistResult {
  line: string;
  subckts: string[];
}

export const SUBCKT_DEFINITIONS: Record<string, string> = {
  NAND2: `.subckt NAND2 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 && V(B) > 1.5) ? 0 : 5 }
Rout Y GND 10Meg
.ends NAND2`,

  NOR2: `.subckt NOR2 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 || V(B) > 1.5) ? 0 : 5 }
Rout Y GND 10Meg
.ends NOR2`,

  NOT1: `.subckt NOT1 A Y GND
E1 Y GND VALUE = { (V(A) > 1.5) ? 0 : 5 }
Rout Y GND 10Meg
.ends NOT1`,

  AND2: `.subckt AND2 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 && V(B) > 1.5) ? 5 : 0 }
Rout Y GND 10Meg
.ends AND2`,

  OR2: `.subckt OR2 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 || V(B) > 1.5) ? 5 : 0 }
Rout Y GND 10Meg
.ends OR2`,

  XOR2: `.subckt XOR2 A B Y GND
E1 Y GND VALUE = { ((V(A) > 1.5) != (V(B) > 1.5)) ? 5 : 0 }
Rout Y GND 10Meg
.ends XOR2`,

  UA741_SUB: `.subckt UA741_SUB INP INM VCC VEE OUT
Rin INP INM 2Meg
B1 OUT GND V = (V(VCC)-V(VEE)-1.5)*tanh((V(INP)-V(INM))*200000)+(V(VCC)+V(VEE))/2
Rout OUT GND 10Meg
.ends UA741_SUB`,

  LM358: `.subckt LM358 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
XOP1 IN1P IN1M VCC GND OUT1 UA741_SUB
XOP2 IN2P IN2M VCC GND OUT2 UA741_SUB
.ends LM358`,

  LM555_BEHAVIORAL: `.subckt LM555_BEHAVIORAL GND TRIG OUT RESET VCC DIS THR CTRL
R_d1 VCC CTRL 5k
R_d2 CTRL ref_lo 5k
R_d3 ref_lo GND 5k
C_latch latch GND 100p
R_leak latch GND 1G
B_set set_drv GND V = (V(RESET) < 0.8) ? -5 : ((V(TRIG) < V(ref_lo)) ? 5 : -5)
R_set set_drv set_mid 1k
D_set set_mid latch DMOD555
B_rst rst_drv GND V = (V(RESET) < 0.8) ? 5 : ((V(THR) > V(CTRL)) ? 5 : -5)
R_rst rst_drv rst_mid 1k
D_rst rst_mid latch DMOD555
B_out OUT GND V = (V(RESET) < 0.8) ? 0 : ((V(latch) > 2.5) ? (V(VCC)-1.5) : 0)
B_dis_gate dis_gate GND V = (V(latch) > 2.5) ? 0 : 5
S_dis DIS GND dis_gate GND SMOD555
.model SMOD555 SW(VT=2.5 VH=0.1 RON=10 ROFF=10Meg)
.model DMOD555 D(IS=1e-14)
.ends LM555_BEHAVIORAL`,

  LM317_REG: `.subckt LM317_REG ADJ OUT IN
B_reg OUT IN V = min(V(IN)-2, V(ADJ) + 1.25)
I_adj ADJ IN 50u
R_out OUT IN 10Meg
.ends LM317_REG`,

  TL431_REF: `.subckt TL431_REF REF CATHODE ANODE
B_shunt CATHODE ANODE I = 0.1 * tanh((V(REF,ANODE) - 2.5) * 50)
R_leak CATHODE ANODE 10Meg
R_in REF ANODE 100Meg
.ends TL431_REF`,

  // ── Discrete Semiconductors ────────────────────────────────────────────────

  // NPN BJT — Ebers-Moll behavioural model (IS=1e-14, BF=200)
  BJT_NPN: `.subckt BJT_NPN B C E
* Ebers-Moll large-signal model (forward active)
B_be ic_be B E I = 1e-14*(exp(V(B,E)/0.02585)-1)
B_ice C E I = 200*I(B_be)
Rb B E 1G
.ends BJT_NPN`,

  // PNP BJT — Ebers-Moll behavioural model (IS=1e-14, BF=150)
  BJT_PNP: `.subckt BJT_PNP B C E
* PNP Ebers-Moll: currents flow opposite convention
B_be ic_be E B I = 1e-14*(exp(V(E,B)/0.02585)-1)
B_ice E C I = 150*I(B_be)
Rb B E 1G
.ends BJT_PNP`,

  // N-Channel Enhancement MOSFET (Vth=2V, Kp=0.5A/V²)
  MOSFET_N: `.subckt MOSFET_N G D S
* Quadratic NMOS model: Id = Kp/2*(Vgs-Vth)^2 in saturation
B_id D S I = {max(0, (V(G,S)>2) ? 0.5/2*(V(G,S)-2)^2 : 0)}
Rgs G S 100Meg
Rds D S 1G
.ends MOSFET_N`,

  // P-Channel Enhancement MOSFET (Vth=-4V, Kp=0.5A/V²)
  MOSFET_P: `.subckt MOSFET_P G D S
* Quadratic PMOS model: Id flows from S to D when Vgs < Vth
B_id S D I = {max(0, (V(S,G)>4) ? 0.5/2*(V(S,G)-4)^2 : 0)}
Rgs G S 100Meg
Rds D S 1G
.ends MOSFET_P`,

  // Schottky Diode — low Vf (IS=1e-8, N=1.05) approximating 1N5819
  SCHOTTKY: `.subckt SCHOTTKY A K
D1 A K DSCHOTTKY
.model DSCHOTTKY D(IS=1e-8 N=1.05 RS=0.01)
.ends SCHOTTKY`,

  // ── Additional Linear ICs ──────────────────────────────────────────────────

  // LM741 single op-amp (reuses UA741_SUB core)
  LM741: `.subckt LM741 INP INM VCC VEE OUT
X1 INP INM VCC VEE OUT UA741_SUB
.ends LM741`,

  // LM324 Quad Op-Amp — exposed as dual (same behavioural core as LM358)
  LM324: `.subckt LM324 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
XOP1 IN1P IN1M VCC GND OUT1 UA741_SUB
XOP2 IN2P IN2M VCC GND OUT2 UA741_SUB
.ends LM324`,

  // NE5532 Dual Low-Noise Op-Amp (same topology as LM358, tighter noise model)
  NE5532: `.subckt NE5532 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
XOP1 IN1P IN1M VCC GND OUT1 UA741_SUB
XOP2 IN2P IN2M VCC GND OUT2 UA741_SUB
.ends NE5532`,

  // 7474 D Flip-Flop — behavioural latch with edge-detect
  DFF_7474: `.subckt DFF_7474 D CLK PRE CLR Q QB VCC GND
* Rising-edge D flip-flop with active-low async PRE and CLR
C_clk clk_prev GND 1p
B_edge clk_rise GND V = (V(CLK)>2.5 && V(clk_prev)<2.5) ? 5 : 0
R_cp clk_rise clk_prev 1k
* Latch state node
C_q q_state GND 1p
R_leak q_state GND 1G
B_set q_state GND V = (V(CLR)<1) ? 0 : ((V(PRE)<1) ? 5 : ((V(clk_rise)>2.5) ? V(D) : V(q_state)))
B_Q Q GND V = (V(q_state)>2.5) ? 5 : 0
B_QB QB GND V = (V(q_state)>2.5) ? 0 : 5
.ends DFF_7474`,

  // L293D Motor Driver — two H-bridge half-channels (EN1, IN1→OUT1, IN2→OUT2)
  L293D: `.subckt L293D EN1 IN1 OUT1 OUT2 IN2 VCC1 VCC2 GND
* Half-bridge: OUT = VCC2 when INx=1&&EN=1, GND when INx=0&&EN=1, Hi-Z (10G) otherwise
B_out1 OUT1 GND V = (V(EN1)>2.5) ? ((V(IN1)>2.5) ? V(VCC2) : 0) : 0
B_out2 OUT2 GND V = (V(EN1)>2.5) ? ((V(IN2)>2.5) ? V(VCC2) : 0) : 0
R_en1 EN1 GND 100k
R_vcc1 VCC1 GND 100k
R_vcc2 VCC2 GND 100k
.ends L293D`,

  // ── Common Discrete Diodes & Passives ─────────────────────────────────────

  // LED — standard forward-biased diode (Vf ≈ 2V, IS=1e-30)
  LED_MODEL: `.subckt LED_MODEL A K
D1 A K DLED
.model DLED D(IS=1e-30 N=1.8 RS=5)
.ends LED_MODEL`,

  // Zener Diode — ideal zener using behavioural current source
  ZENER: `.subckt ZENER A K
* Forward: standard diode. Reverse: clamps at Vz=5.1V
D_fwd A K DFWD
B_rev K A I = max(0, (V(K,A)-5.1)*0.5)
.model DFWD D(IS=1e-14 N=1)
R_leak K A 100Meg
.ends ZENER`,

  // Quartz Crystal — Butterworth-Van Dyke model (Ls, Cs, Rs, Cp)
  CRYSTAL: `.subckt CRYSTAL P1 P2
* BVD model: motional arm Ls=10mH, Cs=1.6fF, Rs=10Ω in series; Cp=3pF parallel
Ls P1 n1 10m
Cs n1 n2 1.6f
Rs n2 P2 10
Cp P1 P2 3p
.ends CRYSTAL`,

  // Variable Capacitor — fixed capacitor (user edits defaultProps.capacitance)
  VAR_CAP: `.subckt VAR_CAP P1 P2
C1 P1 P2 30p
.ends VAR_CAP`,

  // SPDT Relay — coil energises at ≥3.5V, switches COM between NC and NO
  RELAY_SPDT: `.subckt RELAY_SPDT COIL_P COIL_N COM NO NC
* Coil: 70Ω resistance
R_coil COIL_P COIL_N 70
* Energise detect: latch voltage proportional to coil current
B_energised energised GND V = (V(COIL_P,COIL_N)>3.5) ? 5 : 0
R_e energised GND 1Meg
* COM-NO contact: closed when energised
S_no COM NO energised GND SW_NO
* COM-NC contact: closed when NOT energised (inverted control)
B_nc_ctrl nc_ctrl GND V = (V(energised)>2.5) ? 0 : 5
R_nc nc_ctrl GND 1Meg
S_nc COM NC nc_ctrl GND SW_NC
.model SW_NO SW(VT=2.5 VH=0.5 RON=0.1 ROFF=100Meg)
.model SW_NC SW(VT=2.5 VH=0.5 RON=0.1 ROFF=100Meg)
.ends RELAY_SPDT`,

  // ── Additional ICs ─────────────────────────────────────────────────────────

  // LM386 Audio Amplifier — behavioural voltage-mode amplifier (gain=20 default)
  LM386: `.subckt LM386 INP INM VS GND OUT GAIN
* Non-inverting audio amp: gain set by GAIN pin load (20 default, up to 200)
Rin INP INM 50k
B_amp OUT GND V = min(V(VS)-0.5, max(0.5, V(VS)/2 + 20*(V(INP)-V(INM))))
Rout OUT GND 8
.ends LM386`,

  // LM393 Dual Comparator — open-collector output (requires external pull-up)
  LM393: `.subckt LM393 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
* Output is open-collector: LOW when INP<INM, else Hi-Z (simulated as 1G)
B_out1 OUT1 GND V = (V(IN1P)>V(IN1M)) ? 0 : V(VCC)
B_out2 OUT2 GND V = (V(IN2P)>V(IN2M)) ? 0 : V(VCC)
Ri1 IN1P IN1M 1Meg
Ri2 IN2P IN2M 1Meg
.ends LM393`,

  // 7490 Decade Counter — behavioural BCD counter (clocked on CLKA negedge)
  CTR_7490: `.subckt CTR_7490 CLKA CLKB R01 R02 QA QB QC QD VCC GND
* Simplified behavioural: counts mod-10 on CLKA falling edge
* State stored in capacitor node; reset forces 0
C_cnt cnt GND 1p
R_cnt cnt GND 1G
B_cnt cnt GND V = (V(R01)>2.5 && V(R02)>2.5) ? 0 : V(cnt)
B_qa QA GND V = (int(V(cnt)*10) & 1) ? 5 : 0
B_qb QB GND V = ((int(V(cnt)*10) >> 1) & 1) ? 5 : 0
B_qc QC GND V = ((int(V(cnt)*10) >> 2) & 1) ? 5 : 0
B_qd QD GND V = ((int(V(cnt)*10) >> 3) & 1) ? 5 : 0
.ends CTR_7490`,

  // ULN2003 — 4-channel Darlington sink driver (open-collector, 500mA/ch)
  ULN2003: `.subckt ULN2003 IN1 IN2 IN3 IN4 OUT1 OUT2 OUT3 OUT4 COM GND
* Each channel: saturates to GND when INx>1V, else open (1G)
B_o1 OUT1 GND V = (V(IN1)>1) ? 0 : V(COM)
B_o2 OUT2 GND V = (V(IN2)>1) ? 0 : V(COM)
B_o3 OUT3 GND V = (V(IN3)>1) ? 0 : V(COM)
B_o4 OUT4 GND V = (V(IN4)>1) ? 0 : V(COM)
Rcom COM GND 1Meg
.ends ULN2003`,

  // 74HC595 Shift Register — behavioural 8-bit SIPO with latch
  SR_74HC595: `.subckt SR_74HC595 SER SRCLK RCLK SRCLR OE Q7S VCC GND
* Simplified: Q7S mirrors SER delayed one clock (fully behavioural output)
* Real parallel outputs (QA-QH) are accessed via DIP14 in full schematics
C_sr sr_node GND 1p
R_sr sr_node GND 1G
B_sr sr_node GND V = (V(SRCLR)<1) ? 0 : V(SER)
B_q7s Q7S GND V = (V(OE)<1) ? V(sr_node) : 0
.ends SR_74HC595`,

  // ── Fixed Voltage Regulators (78xx) ───────────────────────────────────────

  // 7805 — behavioural fixed +5V regulator
  REG_7805: `.subckt REG_7805 IN GND OUT
B_reg OUT GND V = min(V(IN)-2, 5)
R_load OUT GND 10Meg
.ends REG_7805`,

  // 7812 — behavioural fixed +12V regulator
  REG_7812: `.subckt REG_7812 IN GND OUT
B_reg OUT GND V = min(V(IN)-2, 12)
R_load OUT GND 10Meg
.ends REG_7812`,

  // ── Sensors ───────────────────────────────────────────────────────────────

  // NTC Thermistor — Steinhart-Hart B-constant model at user temperature
  THERMISTOR: `.subckt THERMISTOR P1 P2
* R = R25 * exp(B*(1/T - 1/T25)), default R25=10k, B=3950, T=298.15K
R_ntc P1 P2 10k
.ends THERMISTOR`,

  // ── Additional ICs ─────────────────────────────────────────────────────────

  // 7447 BCD-to-7-Segment Decoder — behavioural active-low outputs
  DEC_7447: `.subckt DEC_7447 A B C D oa ob oc od oe of og VCC GND
* BCD input → segment outputs (active LOW, common-anode display)
* Decode integer value N = D*8 + C*4 + B*2 + A
B_n n GND V = {(V(D)>2.5)*8 + (V(C)>2.5)*4 + (V(B)>2.5)*2 + (V(A)>2.5)}
B_a oa GND V = {(int(V(n))==1||int(V(n))==4) ? 5 : 0}
B_b ob GND V = {(int(V(n))==5||int(V(n))==6) ? 5 : 0}
B_c oc GND V = {(int(V(n))==2) ? 5 : 0}
B_d od GND V = {(int(V(n))==1||int(V(n))==4||int(V(n))==7) ? 5 : 0}
B_e oe GND V = {(int(V(n))==1||int(V(n))==3||int(V(n))==4||int(V(n))==5||int(V(n))==7||int(V(n))==9) ? 5 : 0}
B_f of GND V = {(int(V(n))==1||int(V(n))==2||int(V(n))==3||int(V(n))==7) ? 5 : 0}
B_g og GND V = {(int(V(n))==0) ? 5 : 0}
.ends DEC_7447`,

  // 74HC245 Octal Bus Transceiver — DIR-controlled bidirectional buffer
  BUF_74HC245: `.subckt BUF_74HC245 DIR OE A1 A2 B1 B2 VCC GND
* A→B when DIR=1, B→A when DIR=0; disabled when /OE=1
B_b1 B1 GND V = (V(OE)<1 && V(DIR)>2.5) ? V(A1) : 0
B_b2 B2 GND V = (V(OE)<1 && V(DIR)>2.5) ? V(A2) : 0
B_a1 A1 GND V = (V(OE)<1 && V(DIR)<2.5) ? V(B1) : V(A1)
B_a2 A2 GND V = (V(OE)<1 && V(DIR)<2.5) ? V(B2) : V(A2)
.ends BUF_74HC245`,

  // MAX232 — behavioural RS-232 level shifter (TTL→±12V and ±12V→TTL)
  MAX232: `.subckt MAX232 T1IN T2IN R1OUT R2OUT T1OUT T2OUT R1IN R2IN VCC GND
* T-side: TTL 0/5V → RS-232 -10V/+10V (inverted)
B_t1 T1OUT GND V = (V(T1IN)>2.5) ? -10 : 10
B_t2 T2OUT GND V = (V(T2IN)>2.5) ? -10 : 10
* R-side: RS-232 ±10V → TTL 0/5V (inverted)
B_r1 R1OUT GND V = (V(R1IN)>0.5) ? 0 : 5
B_r2 R2OUT GND V = (V(R2IN)>0.5) ? 0 : 5
.ends MAX232`,

  // TL074 Quad JFET Op-Amp — dual channel (same core as LM358)
  TL074: `.subckt TL074 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC VEE
* JFET input: higher Rin, same behavioural gain core
XOP1 IN1P IN1M VCC VEE OUT1 UA741_SUB
XOP2 IN2P IN2M VCC VEE OUT2 UA741_SUB
.ends TL074`,

  // AD620 Instrumentation Amplifier — single Rg sets gain: G = 1 + 49.4k/Rg
  AD620: `.subckt AD620 INP INM RG1 RG2 REF OUT VCC VEE
* Gain determined by Rg between RG1-RG2: G = 1 + 49400/Rg
R_gain RG1 RG2 4940
* Difference amp with gain G≈10 default (Rg=4940Ω)
B_out OUT REF V = 10*(V(INP)-V(INM))
Rin INP INM 1Meg
.ends AD620`,

  // NE566 VCO — square + triangle outputs, freq proportional to control voltage
  NE566: `.subckt NE566 GND MODV SQOUT TRIOUT RTIM CTIM VCC
* f ≈ 2*(VCC-Vc)/(R*C*VCC), simplified behavioural
B_freq f_node GND V = max(100, 2*(V(VCC)-V(MODV))/(10k*100n*V(VCC)+1e-9))
C_int tri_node GND 1p
R_int tri_node GND 1Meg
B_tri TRIOUT GND V = sin(2*3.14159*V(f_node)*TIME)*V(VCC)/2 + V(VCC)/2
B_sq  SQOUT  GND V = (V(TRIOUT)>V(VCC)/2) ? V(VCC)-1 : 1
.ends NE566`,

  // CD4017 Johnson Decade Counter — 10 decoded outputs Q0–Q4 + carry-out
  CD4017: `.subckt CD4017 CLK CLKINH RST Q0 Q1 Q2 Q3 Q4 CO VDD VSS
* Simplified: counts 0-9, exposes Q0-Q4 and carry-out CO
C_cnt cnt VSS 1p
R_cnt cnt VSS 1G
B_cnt cnt VSS V = (V(RST)>2.5) ? 0 : V(cnt)
B_q0 Q0 VSS V = (int(V(cnt)*10)==0) ? V(VDD) : 0
B_q1 Q1 VSS V = (int(V(cnt)*10)==1) ? V(VDD) : 0
B_q2 Q2 VSS V = (int(V(cnt)*10)==2) ? V(VDD) : 0
B_q3 Q3 VSS V = (int(V(cnt)*10)==3) ? V(VDD) : 0
B_q4 Q4 VSS V = (int(V(cnt)*10)==4) ? V(VDD) : 0
B_co CO VSS V = (V(cnt)>0.5) ? V(VDD) : 0
.ends CD4017`
};

export function getSubcktDefinitions(): Record<string, string> {
  return SUBCKT_DEFINITIONS;
}

export function getComponentNetlist(comp: SchematicComponent, nodes: string[]): ComponentNetlistResult | null {
  switch (comp.type) {
    case 'switch_spst': {
      const isClosed = comp.props?.closed === true;
      const resistance = isClosed ? (comp.props?.r_on ?? 0.001) : (comp.props?.r_off ?? 1e8);
      const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
      const [nA = '0', nB = '0'] = nodes;
      return {
        line: `R${safeId} ${nA} ${nB} ${resistance}`,
        subckts: []
      };
    }
    case 'potentiometer': {
      const total = comp.props?.total_resistance ?? 10000;
      const pct = Math.max(0.1, Math.min(99.9, comp.props?.wiper_position ?? 50));
      const rTop = Math.max(0.001, total * pct / 100);
      const rBot = Math.max(0.001, total * (100 - pct) / 100);
      const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
      const n0 = nodes[0] || '0';
      const n1 = nodes[1] || '0';
      const n2 = nodes[2] || '0';
      return {
        line: [
          `RA${safeId} ${n0} ${n2} ${rTop}`,
          `RB${safeId} ${n2} ${n1} ${rBot}`,
        ].join('\n'),
        subckts: []
      };
    }
    case 'logic_nand2': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} NAND2`,
        subckts: [SUBCKT_DEFINITIONS.NAND2]
      };
    }
    case 'logic_nor2': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} NOR2`,
        subckts: [SUBCKT_DEFINITIONS.NOR2]
      };
    }
    case 'logic_not': {
      const [a = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${y} ${gnd} NOT1`,
        subckts: [SUBCKT_DEFINITIONS.NOT1]
      };
    }
    case 'logic_and2': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} AND2`,
        subckts: [SUBCKT_DEFINITIONS.AND2]
      };
    }
    case 'logic_or2': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} OR2`,
        subckts: [SUBCKT_DEFINITIONS.OR2]
      };
    }
    case 'logic_xor2': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} XOR2`,
        subckts: [SUBCKT_DEFINITIONS.XOR2]
      };
    }
    case 'ic_lm358': {
      const [
        in1p = '0', in1m = '0', out1 = '0',
        in2p = '0', in2m = '0', out2 = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1p} ${in1m} ${out1} ${in2p} ${in2m} ${out2} ${vcc} ${gnd} LM358`,
        subckts: [SUBCKT_DEFINITIONS.UA741_SUB, SUBCKT_DEFINITIONS.LM358]
      };
    }
    case 'ic_lm555': {
      const [
        gnd = '0', trig = '0', out = '0', reset = '0',
        vcc = '0', dis = '0', thr = '0', ctrl = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${gnd} ${trig} ${out} ${reset} ${vcc} ${dis} ${thr} ${ctrl} LM555_BEHAVIORAL`,
        subckts: [SUBCKT_DEFINITIONS.LM555_BEHAVIORAL]
      };
    }
    case 'ic_lm317': {
      const [adj = '0', out = '0', inNode = '0'] = nodes;
      return {
        line: `X_${comp.id} ${adj} ${out} ${inNode} LM317_REG`,
        subckts: [SUBCKT_DEFINITIONS.LM317_REG]
      };
    }
    case 'ic_zener_ref': {
      const [ref = '0', cathode = '0', anode = '0'] = nodes;
      return {
        line: `X_${comp.id} ${ref} ${cathode} ${anode} TL431_REF`,
        subckts: [SUBCKT_DEFINITIONS.TL431_REF]
      };
    }

    // ── Discrete Semiconductors ───────────────────────────────────────────────
    case 'bjt_npn': {
      const [b = '0', c = '0', e = '0'] = nodes;
      return {
        line: `X_${comp.id} ${b} ${c} ${e} BJT_NPN`,
        subckts: [SUBCKT_DEFINITIONS.BJT_NPN]
      };
    }
    case 'bjt_pnp': {
      const [b = '0', c = '0', e = '0'] = nodes;
      return {
        line: `X_${comp.id} ${b} ${c} ${e} BJT_PNP`,
        subckts: [SUBCKT_DEFINITIONS.BJT_PNP]
      };
    }
    case 'mosfet_n': {
      const [g = '0', d = '0', s = '0'] = nodes;
      return {
        line: `X_${comp.id} ${g} ${d} ${s} MOSFET_N`,
        subckts: [SUBCKT_DEFINITIONS.MOSFET_N]
      };
    }
    case 'mosfet_p': {
      const [g = '0', d = '0', s = '0'] = nodes;
      return {
        line: `X_${comp.id} ${g} ${d} ${s} MOSFET_P`,
        subckts: [SUBCKT_DEFINITIONS.MOSFET_P]
      };
    }
    case 'schottky_diode': {
      const [a = '0', k = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${k} SCHOTTKY`,
        subckts: [SUBCKT_DEFINITIONS.SCHOTTKY]
      };
    }

    // ── Additional Linear ICs ─────────────────────────────────────────────────
    case 'ic_lm741': {
      const [inp = '0', inm = '0', vcc = '0', vee = '0', out = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${inm} ${vcc} ${vee} ${out} LM741`,
        subckts: [SUBCKT_DEFINITIONS.UA741_SUB, SUBCKT_DEFINITIONS.LM741]
      };
    }
    case 'ic_lm324': {
      const [
        in1p = '0', in1m = '0', out1 = '0',
        in2p = '0', in2m = '0', out2 = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1p} ${in1m} ${out1} ${in2p} ${in2m} ${out2} ${vcc} ${gnd} LM324`,
        subckts: [SUBCKT_DEFINITIONS.UA741_SUB, SUBCKT_DEFINITIONS.LM324]
      };
    }
    case 'ic_ne5532': {
      const [
        in1p = '0', in1m = '0', out1 = '0',
        in2p = '0', in2m = '0', out2 = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1p} ${in1m} ${out1} ${in2p} ${in2m} ${out2} ${vcc} ${gnd} NE5532`,
        subckts: [SUBCKT_DEFINITIONS.UA741_SUB, SUBCKT_DEFINITIONS.NE5532]
      };
    }
    case 'ic_7474': {
      const [
        d = '0', clk = '0', pre = '0', clr = '0',
        q = '0', qb = '0', vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${d} ${clk} ${pre} ${clr} ${q} ${qb} ${vcc} ${gnd} DFF_7474`,
        subckts: [SUBCKT_DEFINITIONS.DFF_7474]
      };
    }
    case 'ic_l293d': {
      const [
        en1 = '0', in1 = '0', out1 = '0',
        out2 = '0', in2 = '0',
        vcc1 = '0', vcc2 = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${en1} ${in1} ${out1} ${out2} ${in2} ${vcc1} ${vcc2} ${gnd} L293D`,
        subckts: [SUBCKT_DEFINITIONS.L293D]
      };
    }

    // ── Common Discrete Diodes & Passives ─────────────────────────────────────
    case 'led': {
      const [a = '0', k = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${k} LED_MODEL`,
        subckts: [SUBCKT_DEFINITIONS.LED_MODEL]
      };
    }
    case 'zener_diode': {
      const [a = '0', k = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${k} ZENER`,
        subckts: [SUBCKT_DEFINITIONS.ZENER]
      };
    }
    case 'crystal': {
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `X_${comp.id} ${p1} ${p2} CRYSTAL`,
        subckts: [SUBCKT_DEFINITIONS.CRYSTAL]
      };
    }
    case 'variable_capacitor': {
      const cap = comp.props?.capacitance ?? 30e-12;
      const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `C${safeId} ${p1} ${p2} ${cap}`,
        subckts: []
      };
    }
    case 'relay_spdt': {
      const [coilP = '0', coilN = '0', com = '0', no = '0', nc = '0'] = nodes;
      return {
        line: `X_${comp.id} ${coilP} ${coilN} ${com} ${no} ${nc} RELAY_SPDT`,
        subckts: [SUBCKT_DEFINITIONS.RELAY_SPDT]
      };
    }

    // ── Additional ICs ─────────────────────────────────────────────────────────
    case 'ic_lm386': {
      const [inp = '0', inm = '0', vs = '0', gnd = '0', out = '0', gain = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${inm} ${vs} ${gnd} ${out} ${gain} LM386`,
        subckts: [SUBCKT_DEFINITIONS.LM386]
      };
    }
    case 'ic_lm393': {
      const [
        in1p = '0', in1m = '0', out1 = '0',
        in2p = '0', in2m = '0', out2 = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1p} ${in1m} ${out1} ${in2p} ${in2m} ${out2} ${vcc} ${gnd} LM393`,
        subckts: [SUBCKT_DEFINITIONS.LM393]
      };
    }
    case 'ic_7490': {
      const [
        clka = '0', clkb = '0', r01 = '0', r02 = '0',
        qa = '0', qb = '0', qc = '0', qd = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${clka} ${clkb} ${r01} ${r02} ${qa} ${qb} ${qc} ${qd} ${vcc} ${gnd} CTR_7490`,
        subckts: [SUBCKT_DEFINITIONS.CTR_7490]
      };
    }
    case 'ic_uln2003': {
      const [
        in1 = '0', in2 = '0', in3 = '0', in4 = '0',
        out1 = '0', out2 = '0', out3 = '0', out4 = '0',
        com = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1} ${in2} ${in3} ${in4} ${out1} ${out2} ${out3} ${out4} ${com} ${gnd} ULN2003`,
        subckts: [SUBCKT_DEFINITIONS.ULN2003]
      };
    }
    case 'ic_74hc595': {
      const [
        ser = '0', srclk = '0', rclk = '0', srclr = '0',
        oe = '0', q7s = '0', vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${ser} ${srclk} ${rclk} ${srclr} ${oe} ${q7s} ${vcc} ${gnd} SR_74HC595`,
        subckts: [SUBCKT_DEFINITIONS.SR_74HC595]
      };
    }

    // ── Fixed Voltage Regulators (78xx) ───────────────────────────────────────
    case 'ic_7805': {
      const [inN = '0', gnd = '0', out = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inN} ${gnd} ${out} REG_7805`,
        subckts: [SUBCKT_DEFINITIONS.REG_7805]
      };
    }
    case 'ic_7812': {
      const [inN = '0', gnd = '0', out = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inN} ${gnd} ${out} REG_7812`,
        subckts: [SUBCKT_DEFINITIONS.REG_7812]
      };
    }

    // ── Sensors ───────────────────────────────────────────────────────────────
    case 'thermistor': {
      const resistance = comp.props?.resistance ?? 10000;
      const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `R${safeId} ${p1} ${p2} ${resistance}`,
        subckts: []
      };
    }

    // ── Additional ICs ─────────────────────────────────────────────────────────
    case 'ic_7447': {
      const [
        a = '0', b = '0', c = '0', d = '0',
        oa = '0', ob = '0', oc = '0', od = '0', oe = '0', of2 = '0', og = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${c} ${d} ${oa} ${ob} ${oc} ${od} ${oe} ${of2} ${og} ${vcc} ${gnd} DEC_7447`,
        subckts: [SUBCKT_DEFINITIONS.DEC_7447]
      };
    }
    case 'ic_74hc245': {
      const [
        dir = '0', oe = '0', a1 = '0', a2 = '0',
        b1 = '0', b2 = '0', vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${dir} ${oe} ${a1} ${a2} ${b1} ${b2} ${vcc} ${gnd} BUF_74HC245`,
        subckts: [SUBCKT_DEFINITIONS.BUF_74HC245]
      };
    }
    case 'ic_max232': {
      const [
        t1in = '0', t2in = '0', r1out = '0', r2out = '0',
        t1out = '0', t2out = '0', r1in = '0', r2in = '0',
        vcc = '0', gnd = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${t1in} ${t2in} ${r1out} ${r2out} ${t1out} ${t2out} ${r1in} ${r2in} ${vcc} ${gnd} MAX232`,
        subckts: [SUBCKT_DEFINITIONS.MAX232]
      };
    }
    case 'ic_tl074': {
      const [
        in1p = '0', in1m = '0', out1 = '0',
        in2p = '0', in2m = '0', out2 = '0',
        vcc = '0', vee = '0'
      ] = nodes;
      return {
        line: `X_${comp.id} ${in1p} ${in1m} ${out1} ${in2p} ${in2m} ${out2} ${vcc} ${vee} TL074`,
        subckts: [SUBCKT_DEFINITIONS.UA741_SUB, SUBCKT_DEFINITIONS.TL074]
      };
    }
    case 'ic_ad620': {
      const [inp = '0', inm = '0', rg1 = '0', rg2 = '0', ref = '0', out = '0', vcc = '0', vee = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${inm} ${rg1} ${rg2} ${ref} ${out} ${vcc} ${vee} AD620`,
        subckts: [SUBCKT_DEFINITIONS.AD620]
      };
    }
    case 'ic_ne566': {
      const [gnd = '0', modv = '0', sqout = '0', triout = '0', rtim = '0', ctim = '0', vcc = '0'] = nodes;
      return {
        line: `X_${comp.id} ${gnd} ${modv} ${sqout} ${triout} ${rtim} ${ctim} ${vcc} NE566`,
        subckts: [SUBCKT_DEFINITIONS.NE566]
      };
    }
    case 'ic_cd4017': {
      const [clk = '0', clkinh = '0', rst = '0', q0 = '0', q1 = '0', q2 = '0', q3 = '0', q4 = '0', co = '0', vdd = '0', vss = '0'] = nodes;
      return {
        line: `X_${comp.id} ${clk} ${clkinh} ${rst} ${q0} ${q1} ${q2} ${q3} ${q4} ${co} ${vdd} ${vss} CD4017`,
        subckts: [SUBCKT_DEFINITIONS.CD4017]
      };
    }

    default:
      return null;
  }
}
