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

  // â”€â”€ Discrete Semiconductors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // NPN BJT â€” Ebers-Moll behavioural model (IS=1e-14, BF=200)
  BJT_NPN: `.subckt BJT_NPN B C E
* Ebers-Moll large-signal model (forward active)
B_be ic_be B E I = 1e-14*(exp(V(B,E)/0.02585)-1)
B_ice C E I = 200*I(B_be)
Rb B E 1G
.ends BJT_NPN`,

  // PNP BJT â€” Ebers-Moll behavioural model (IS=1e-14, BF=150)
  BJT_PNP: `.subckt BJT_PNP B C E
* PNP Ebers-Moll: currents flow opposite convention
B_be ic_be E B I = 1e-14*(exp(V(E,B)/0.02585)-1)
B_ice E C I = 150*I(B_be)
Rb B E 1G
.ends BJT_PNP`,

  // N-Channel Enhancement MOSFET (Vth=2V, Kp=0.5A/VÂ²)
  MOSFET_N: `.subckt MOSFET_N G D S
* Quadratic NMOS model: Id = Kp/2*(Vgs-Vth)^2 in saturation
B_id D S I = {max(0, (V(G,S)>2) ? 0.5/2*(V(G,S)-2)^2 : 0)}
Rgs G S 100Meg
Rds D S 1G
.ends MOSFET_N`,

  // P-Channel Enhancement MOSFET (Vth=-4V, Kp=0.5A/VÂ²)
  MOSFET_P: `.subckt MOSFET_P G D S
* Quadratic PMOS model: Id flows from S to D when Vgs < Vth
B_id S D I = {max(0, (V(S,G)>4) ? 0.5/2*(V(S,G)-4)^2 : 0)}
Rgs G S 100Meg
Rds D S 1G
.ends MOSFET_P`,

  // Schottky Diode â€” low Vf (IS=1e-8, N=1.05) approximating 1N5819
  SCHOTTKY: `.subckt SCHOTTKY A K
D1 A K DSCHOTTKY
.model DSCHOTTKY D(IS=1e-8 N=1.05 RS=0.01)
.ends SCHOTTKY`,

  // â”€â”€ Additional Linear ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // LM741 single op-amp (reuses UA741_SUB core)
  LM741: `.subckt LM741 INP INM VCC VEE OUT
X1 INP INM VCC VEE OUT UA741_SUB
.ends LM741`,

  // LM324 Quad Op-Amp â€” exposed as dual (same behavioural core as LM358)
  LM324: `.subckt LM324 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
XOP1 IN1P IN1M VCC GND OUT1 UA741_SUB
XOP2 IN2P IN2M VCC GND OUT2 UA741_SUB
.ends LM324`,

  // NE5532 Dual Low-Noise Op-Amp (same topology as LM358, tighter noise model)
  NE5532: `.subckt NE5532 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
XOP1 IN1P IN1M VCC GND OUT1 UA741_SUB
XOP2 IN2P IN2M VCC GND OUT2 UA741_SUB
.ends NE5532`,

  // 7474 D Flip-Flop â€” behavioural latch with edge-detect
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

  // L293D Motor Driver â€” two H-bridge half-channels (EN1, IN1â†’OUT1, IN2â†’OUT2)
  L293D: `.subckt L293D EN1 IN1 OUT1 OUT2 IN2 VCC1 VCC2 GND
* Half-bridge: OUT = VCC2 when INx=1&&EN=1, GND when INx=0&&EN=1, Hi-Z (10G) otherwise
B_out1 OUT1 GND V = (V(EN1)>2.5) ? ((V(IN1)>2.5) ? V(VCC2) : 0) : 0
B_out2 OUT2 GND V = (V(EN1)>2.5) ? ((V(IN2)>2.5) ? V(VCC2) : 0) : 0
R_en1 EN1 GND 100k
R_vcc1 VCC1 GND 100k
R_vcc2 VCC2 GND 100k
.ends L293D`,

  // â”€â”€ Common Discrete Diodes & Passives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // LED â€” standard forward-biased diode (Vf â‰ˆ 2V, IS=1e-30)
  LED_MODEL: `.subckt LED_MODEL A K
D1 A K DLED
.model DLED D(IS=1e-30 N=1.8 RS=5)
.ends LED_MODEL`,

  // Zener Diode â€” ideal zener using behavioural current source
  ZENER: `.subckt ZENER A K
* Forward: standard diode. Reverse: clamps at Vz=5.1V
D_fwd A K DFWD
B_rev K A I = max(0, (V(K,A)-5.1)*0.5)
.model DFWD D(IS=1e-14 N=1)
R_leak K A 100Meg
.ends ZENER`,

  // Quartz Crystal â€” Butterworth-Van Dyke model (Ls, Cs, Rs, Cp)
  CRYSTAL: `.subckt CRYSTAL P1 P2
* BVD model: motional arm Ls=10mH, Cs=1.6fF, Rs=10Î© in series; Cp=3pF parallel
Ls P1 n1 10m
Cs n1 n2 1.6f
Rs n2 P2 10
Cp P1 P2 3p
.ends CRYSTAL`,

  // Variable Capacitor â€” fixed capacitor (user edits defaultProps.capacitance)
  VAR_CAP: `.subckt VAR_CAP P1 P2
C1 P1 P2 30p
.ends VAR_CAP`,

  // SPDT Relay â€” coil energises at â‰¥3.5V, switches COM between NC and NO
  RELAY_SPDT: `.subckt RELAY_SPDT COIL_P COIL_N COM NO NC
* Coil: 70Î© resistance
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

  // â”€â”€ Additional ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // LM386 Audio Amplifier â€” behavioural voltage-mode amplifier (gain=20 default)
  LM386: `.subckt LM386 INP INM VS GND OUT GAIN
* Non-inverting audio amp: gain set by GAIN pin load (20 default, up to 200)
Rin INP INM 50k
B_amp OUT GND V = min(V(VS)-0.5, max(0.5, V(VS)/2 + 20*(V(INP)-V(INM))))
Rout OUT GND 8
.ends LM386`,

  // LM393 Dual Comparator â€” open-collector output (requires external pull-up)
  LM393: `.subckt LM393 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC GND
* Output is open-collector: LOW when INP<INM, else Hi-Z (simulated as 1G)
B_out1 OUT1 GND V = (V(IN1P)>V(IN1M)) ? 0 : V(VCC)
B_out2 OUT2 GND V = (V(IN2P)>V(IN2M)) ? 0 : V(VCC)
Ri1 IN1P IN1M 1Meg
Ri2 IN2P IN2M 1Meg
.ends LM393`,

  // 7490 Decade Counter â€” behavioural BCD counter (clocked on CLKA negedge)
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

  // ULN2003 â€” 4-channel Darlington sink driver (open-collector, 500mA/ch)
  ULN2003: `.subckt ULN2003 IN1 IN2 IN3 IN4 OUT1 OUT2 OUT3 OUT4 COM GND
* Each channel: saturates to GND when INx>1V, else open (1G)
B_o1 OUT1 GND V = (V(IN1)>1) ? 0 : V(COM)
B_o2 OUT2 GND V = (V(IN2)>1) ? 0 : V(COM)
B_o3 OUT3 GND V = (V(IN3)>1) ? 0 : V(COM)
B_o4 OUT4 GND V = (V(IN4)>1) ? 0 : V(COM)
Rcom COM GND 1Meg
.ends ULN2003`,

  // 74HC595 Shift Register â€” behavioural 8-bit SIPO with latch
  SR_74HC595: `.subckt SR_74HC595 SER SRCLK RCLK SRCLR OE Q7S VCC GND
* Simplified: Q7S mirrors SER delayed one clock (fully behavioural output)
* Real parallel outputs (QA-QH) are accessed via DIP14 in full schematics
C_sr sr_node GND 1p
R_sr sr_node GND 1G
B_sr sr_node GND V = (V(SRCLR)<1) ? 0 : V(SER)
B_q7s Q7S GND V = (V(OE)<1) ? V(sr_node) : 0
.ends SR_74HC595`,

  // â”€â”€ Fixed Voltage Regulators (78xx) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // 7805 â€” behavioural fixed +5V regulator
  REG_7805: `.subckt REG_7805 IN GND OUT
B_reg OUT GND V = min(V(IN)-2, 5)
R_load OUT GND 10Meg
.ends REG_7805`,

  // 7812 â€” behavioural fixed +12V regulator
  REG_7812: `.subckt REG_7812 IN GND OUT
B_reg OUT GND V = min(V(IN)-2, 12)
R_load OUT GND 10Meg
.ends REG_7812`,

  // â”€â”€ Sensors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // NTC Thermistor â€” Steinhart-Hart B-constant model at user temperature
  THERMISTOR: `.subckt THERMISTOR P1 P2
* R = R25 * exp(B*(1/T - 1/T25)), default R25=10k, B=3950, T=298.15K
R_ntc P1 P2 10k
.ends THERMISTOR`,

  // â”€â”€ Additional ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // 7447 BCD-to-7-Segment Decoder â€” behavioural active-low outputs
  DEC_7447: `.subckt DEC_7447 A B C D oa ob oc od oe of og VCC GND
* BCD input â†’ segment outputs (active LOW, common-anode display)
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

  // 74HC245 Octal Bus Transceiver â€” DIR-controlled bidirectional buffer
  BUF_74HC245: `.subckt BUF_74HC245 DIR OE A1 A2 B1 B2 VCC GND
* Aâ†’B when DIR=1, Bâ†’A when DIR=0; disabled when /OE=1
B_b1 B1 GND V = (V(OE)<1 && V(DIR)>2.5) ? V(A1) : 0
B_b2 B2 GND V = (V(OE)<1 && V(DIR)>2.5) ? V(A2) : 0
B_a1 A1 GND V = (V(OE)<1 && V(DIR)<2.5) ? V(B1) : V(A1)
B_a2 A2 GND V = (V(OE)<1 && V(DIR)<2.5) ? V(B2) : V(A2)
.ends BUF_74HC245`,

  // MAX232 â€” behavioural RS-232 level shifter (TTLâ†’Â±12V and Â±12Vâ†’TTL)
  MAX232: `.subckt MAX232 T1IN T2IN R1OUT R2OUT T1OUT T2OUT R1IN R2IN VCC GND
* T-side: TTL 0/5V â†’ RS-232 -10V/+10V (inverted)
B_t1 T1OUT GND V = (V(T1IN)>2.5) ? -10 : 10
B_t2 T2OUT GND V = (V(T2IN)>2.5) ? -10 : 10
* R-side: RS-232 Â±10V â†’ TTL 0/5V (inverted)
B_r1 R1OUT GND V = (V(R1IN)>0.5) ? 0 : 5
B_r2 R2OUT GND V = (V(R2IN)>0.5) ? 0 : 5
.ends MAX232`,

  // TL074 Quad JFET Op-Amp â€” dual channel (same core as LM358)
  TL074: `.subckt TL074 IN1P IN1M OUT1 IN2P IN2M OUT2 VCC VEE
* JFET input: higher Rin, same behavioural gain core
XOP1 IN1P IN1M VCC VEE OUT1 UA741_SUB
XOP2 IN2P IN2M VCC VEE OUT2 UA741_SUB
.ends TL074`,

  // AD620 Instrumentation Amplifier â€” single Rg sets gain: G = 1 + 49.4k/Rg
  AD620: `.subckt AD620 INP INM RG1 RG2 REF OUT VCC VEE
* Gain determined by Rg between RG1-RG2: G = 1 + 49400/Rg
R_gain RG1 RG2 4940
* Difference amp with gain Gâ‰ˆ10 default (Rg=4940Î©)
B_out OUT REF V = 10*(V(INP)-V(INM))
Rin INP INM 1Meg
.ends AD620`,

  // NE566 VCO â€” square + triangle outputs, freq proportional to control voltage
  NE566: `.subckt NE566 GND MODV SQOUT TRIOUT RTIM CTIM VCC
* f â‰ˆ 2*(VCC-Vc)/(R*C*VCC), simplified behavioural
B_freq f_node GND V = max(100, 2*(V(VCC)-V(MODV))/(10k*100n*V(VCC)+1e-9))
C_int tri_node GND 1p
R_int tri_node GND 1Meg
B_tri TRIOUT GND V = sin(2*3.14159*V(f_node)*TIME)*V(VCC)/2 + V(VCC)/2
B_sq  SQOUT  GND V = (V(TRIOUT)>V(VCC)/2) ? V(VCC)-1 : 1
.ends NE566`,

  // CD4017 Johnson Decade Counter â€” 10 decoded outputs Q0â€“Q4 + carry-out
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
.ends CD4017`,

  // â”€â”€ Isolation, Protection & Power â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // 4N35 Optocoupler â€” LED + phototransistor behavioural
  OC_4N35: `.subckt OC_4N35 A K C E
* LED input: diode forward-biased above 1.2V
D_led A K DLED4N35
.model DLED4N35 D(IS=1e-15 N=1.8)
* Phototransistor: collector current proportional to LED current (CTRâ‰ˆ100%)
B_led i_led GND V = max(0, (V(A)-V(K)-1.2)/100)
B_xtr C E I = V(i_led) * 1.0
R_ce C E 100Meg
.ends OC_4N35`,

  // MOV Varistor â€” clamps above threshold (behavioural)
  VARISTOR: `.subckt VARISTOR P1 P2
* Conducts heavily above V_clamp â‰ˆ 390V; essentially open below
B_clamp P1 P2 I = max(0, (abs(V(P1,P2))-390)*0.1)
R_bleed P1 P2 10Meg
.ends VARISTOR`,

  // LM2596 Buck Converter â€” behavioural step-down
  LM2596: `.subckt LM2596 VIN VOUT FB ON_OFF GND
* Output regulated by FB; default Vout = 5V (FB sets ratio via external divider)
* Simplified: Vout = VIN * min(1, (Vtarget/VIN)) with efficiency â‰ˆ 85%
B_out VOUT GND V = min(V(VIN)*0.85, 5.0)
R_fb FB GND 1Meg
R_load VOUT GND 10Meg
.ends LM2596`,

  // IR2110 Gate Driver â€” behavioural high/low side driver
  IR2110: `.subckt IR2110 HIN LIN SD VDD HO VS VB LO VCC COM
* High-side output HO = VB when HIN=1, SD=0; else off
B_ho HO VS V = (V(SD)<1 && V(HIN)>2.5) ? (V(VB)-V(VS)) : 0
* Low-side output LO = VCC when LIN=1, SD=0; else off
B_lo LO COM V = (V(SD)<1 && V(LIN)>2.5) ? V(VCC) : 0
R_vdd VDD COM 100k
.ends IR2110`,

  // ACS712 Current Sensor â€” Hall effect, Vout = 2.5 + 0.185*I
  ACS712: `.subckt ACS712 IP1 IP2 VOUT VCC GND
* Current path: sense resistor, output proportional to current
R_path IP1 IP2 0.005
B_out VOUT GND V = V(VCC)/2 + 0.185*(V(IP1)-V(IP2))/0.005
R_out VOUT GND 10Meg
.ends ACS712`,

  // LM567 Tone Decoder â€” output LOW when input freq â‰ˆ centre freq (simplified)
  LM567: `.subckt LM567 OUT VCC INP GND TC1 TC2 TIMR
* Centre frequency set by external R/C on TIMR,TC1
* Simplified: output goes LOW when input signal > 100mV threshold
B_out OUT GND V = (abs(V(INP))>0.1) ? 0 : V(VCC)
R_in INP GND 20k
R_load OUT GND 1Meg
.ends LM567`,

  // CD4051 8-Ch Mux â€” channel selected by 3-bit ABC address
  CD4051: `.subckt CD4051 A B C INH Z Y0 Y1 Y2 Y3 VDD VSS
* Select channel N = C*4+B*2+A; connect Z to YN
B_n ch_n VSS V = {(V(C)>2.5)*4+(V(B)>2.5)*2+(V(A)>2.5)}
B_y0 Z VSS V = (V(INH)<1 && int(V(ch_n))==0) ? V(Y0) : V(Z)
B_y1 Z VSS V = (V(INH)<1 && int(V(ch_n))==1) ? V(Y1) : V(Z)
B_y2 Z VSS V = (V(INH)<1 && int(V(ch_n))==2) ? V(Y2) : V(Z)
B_y3 Z VSS V = (V(INH)<1 && int(V(ch_n))==3) ? V(Y3) : V(Z)
.ends CD4051`,

  // 74HC32 Quad OR Gate â€” same topology as OR2 but packaged as IC
  HC32: `.subckt HC32 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 || V(B) > 1.5) ? 5 : 0 }
Rout Y GND 10Meg
.ends HC32`,

  // TCA9548A I2C Mux â€” pass-through switch (simplified behavioural)
  TCA9548: `.subckt TCA9548 SDA SCL RST SD0 SC0 SD1 SC1 VCC GND
* I2C bus switch: SD0/SC0 channel 0, SD1/SC1 channel 1 (simplified 2-ch)
R_sda SDA GND 4.7k
R_scl SCL GND 4.7k
B_sd0 SD0 GND V = V(SDA)
B_sc0 SC0 GND V = V(SCL)
B_sd1 SD1 GND V = V(SDA)
B_sc1 SC1 GND V = V(SCL)
.ends TCA9548`,

  // ATmega328P â€” simplified behavioural passthrough (power + UART only)
  ATMEGA328: `.subckt ATMEGA328 VCC GND RESET RXD TXD MOSI MISO SCK SDA SCL
* Minimal model: power rails only; UART/SPI/I2C pins are high-impedance stubs
R_vcc VCC GND 10k
R_rx RXD GND 100Meg
R_tx TXD GND 100Meg
R_sda SDA GND 100Meg
R_scl SCL GND 100Meg
.ends ATMEGA328`,

  TRIAC: `.subckt TRIAC MT1 MT2 G
* Simplified TRIAC: back-to-back SCR model with behavioural gate control
* Forward path (MT2+ â†’ MT1): conducts when gate triggered and MT2 > MT1
B_fwd MT2_int MT1 I = { (V(G,MT1) > 0.7 && V(MT2,MT1) > 0) ? V(MT2,MT1)/0.02 : 0 }
R_fwd MT2 MT2_int 0.02
* Reverse path (MT1+ â†’ MT2): conducts when gate triggered and MT1 > MT2
B_rev MT1_int MT2 I = { (V(G,MT1) > 0.7 && V(MT1,MT2) > 0) ? V(MT1,MT2)/0.02 : 0 }
R_rev MT1 MT1_int 0.02
R_gate G MT1 10k
.ends TRIAC`,

  DIAC: `.subckt DIAC A1 A2
* DIAC: two zener diodes back-to-back (breakover ~32V each direction)
D_fwd A1_i A2 DIAC_Z
D_rev A2_i A1 DIAC_Z
.model DIAC_Z D(Is=1e-14 BV=32 IBV=10m Rs=10)
Rfwd A1 A1_i 1
Rrev A2 A2_i 1
.ends DIAC`,

  IGBT_N: `.subckt IGBT_N G C E
* N-Channel IGBT: MOSFET-style gate, BJT-style output, body diode included
M_ch G_int E E E IGBT_MOS L=2u W=10m
E_gate G_int E VALUE = { LIMIT(V(G,E), 0, 15) }
Q_bjt C E_int E IGBT_BJT
R_ce E_int C 0.05
D_body E C IGBT_BODY
.model IGBT_MOS PMOS (Level=1 Vto=-5.5 Kp=20 Lambda=0.01)
.model IGBT_BJT NPN (Is=1e-14 Bf=100 Cje=1n Cjc=0.5n)
.model IGBT_BODY D (Is=1e-14 BV=600 Rs=0.01)
.ends IGBT_N`,

  PHOTO_RESISTOR: `.subckt PHOTO_RESISTOR P1 P2
* LDR: fixed 10k representative mid-light resistance
* In real SPICE, lux-dependent resistance requires external parameter
R_ldr P1 P2 10k
.ends PHOTO_RESISTOR`,

  LM311: `.subckt LM311 INP INN OUT VCC VEE GND
* LM311 Voltage Comparator â€” open-collector output
* Op-amp core drives BJT open-collector output stage
Bcomp comp_int GND VALUE = { (V(INP) > V(INN)) ? 1 : 0 }
Rcomp comp_int GND 10Meg
Q_oc OUT col_b GND NPN311
Vcoll col_b comp_int DC 0
.model NPN311 NPN (Is=1e-14 Bf=200 Vaf=100)
Rin_p INP GND 1Meg
Rin_n INN GND 1Meg
Rvcc VCC GND 100Meg
Rvee VEE GND 100Meg
.ends LM311`,

  L298N: `.subckt L298N IN1 IN2 ENA IN3 IN4 ENB OUT1 OUT2 OUT3 OUT4 VCC VSS GND
* L298N Dual H-Bridge â€” behavioural model
* Bridge A: controlled by IN1, IN2 when ENA high
Bout1 OUT1 GND VALUE = { (V(ENA) > 2.5 && V(IN1) > 2.5) ? V(VCC,GND)*0.95 : (V(ENA) > 2.5 && V(IN2) > 2.5) ? 0 : 0 }
Bout2 OUT2 GND VALUE = { (V(ENA) > 2.5 && V(IN2) > 2.5) ? V(VCC,GND)*0.95 : (V(ENA) > 2.5 && V(IN1) > 2.5) ? 0 : 0 }
* Bridge B: controlled by IN3, IN4 when ENB high
Bout3 OUT3 GND VALUE = { (V(ENB) > 2.5 && V(IN3) > 2.5) ? V(VSS,GND)*0.95 : (V(ENB) > 2.5 && V(IN4) > 2.5) ? 0 : 0 }
Bout4 OUT4 GND VALUE = { (V(ENB) > 2.5 && V(IN4) > 2.5) ? V(VSS,GND)*0.95 : (V(ENB) > 2.5 && V(IN3) > 2.5) ? 0 : 0 }
Rvcc VCC GND 100Meg
Rvss VSS GND 100Meg
.ends L298N`,

  HC08: `.subckt HC08 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 && V(B) > 1.5) ? 5 : 0 }
Rout Y GND 10Meg
.ends HC08`,

  HC00: `.subckt HC00 A B Y GND
E1 Y GND VALUE = { (V(A) > 1.5 && V(B) > 1.5) ? 0 : 5 }
Rout Y GND 10Meg
.ends HC00`,

  DS18B20: `.subckt DS18B20 GND DQ VDD
* DS18B20 1-Wire Temp Sensor â€” outputs ~0.5V per Â°C on DQ (25Â°C default â†’ 12.5V clip)
* Representative: 10mV/Â°C at 25Â°C baseline, pulled to ~250mV
Btemp DQ GND VALUE = { 0.25 }
Rpull VDD DQ 4.7k
Rvdd VDD GND 100Meg
.ends DS18B20`,

  SG3525: `.subckt SG3525 INV NINV SYNC OSC SD SS OUTA OUTB VCC GND VREF
* SG3525 PWM Controller â€” simplified behavioural model
* Internal 5.1V reference
Eref VREF GND VALUE = { 5.1 }
Rref VREF GND 100
* Error amp: NINV is typically tied to VREF/2 setpoint
Berr err_n GND VALUE = { LIMIT(V(NINV) - V(INV), -5, 5) }
Rerr err_n GND 10k
* Oscillator â€” fixed 50kHz with SYNC input
Bosc osc_n GND VALUE = { (V(SYNC) > 1) ? 0 : ( sin(2*3.14159*50000*time) > 0 ? 1 : 0 ) }
* Output A / B â€” push-pull, 180Â° phase
Bouta OUTA GND VALUE = { (V(SD) > 1 || V(SS) < 0.5) ? 0 : (V(osc_n) > 0.5 && V(err_n,GND) > 0) ? V(VCC,GND)*0.9 : 0 }
Boutb OUTB GND VALUE = { (V(SD) > 1 || V(SS) < 0.5) ? 0 : (V(osc_n) < 0.5 && V(err_n,GND) > 0) ? V(VCC,GND)*0.9 : 0 }
Rvcc VCC GND 100Meg
.ends SG3525`,

  TUNNEL_DIODE: `.subckt TUNNEL_DIODE A K
* Tunnel diode: NDR modelled with piecewise behavioural current
* Peak ~1mA at 0.1V, valley ~0.1mA at 0.4V, then rises again
B_td A K I = { (V(A,K) < 0.1) ? V(A,K)/100 :
+              (V(A,K) < 0.4) ? 0.001*(1 - (V(A,K)-0.1)/0.3*0.9) :
+              0.0001 + V(A,K)/500 }
R_leak A K 10Meg
.ends TUNNEL_DIODE`,

  HC04: `.subckt HC04 A Y GND
E1 Y GND VALUE = { (V(A) > 1.5) ? 0 : 5 }
Rout Y GND 10Meg
.ends HC04`,

  HC138: `.subckt HC138 A B C G1 G2A G2B Y0 Y1 Y2 Y3 Y4 Y5 Y6 Y7 VCC GND
* 3-to-8 decoder: active-low outputs, enabled when G1=1, G2A=0, G2B=0
* sel = binary value of C,B,A (0-7)
E_en en_n GND VALUE = { (V(G1)>1.5 && V(G2A)<1.5 && V(G2B)<1.5) ? 1 : 0 }
B0 Y0 GND VALUE = { (V(en_n)>0.5 && V(C)<1.5 && V(B)<1.5 && V(A)<1.5) ? 0 : 5 }
B1 Y1 GND VALUE = { (V(en_n)>0.5 && V(C)<1.5 && V(B)<1.5 && V(A)>1.5) ? 0 : 5 }
B2 Y2 GND VALUE = { (V(en_n)>0.5 && V(C)<1.5 && V(B)>1.5 && V(A)<1.5) ? 0 : 5 }
B3 Y3 GND VALUE = { (V(en_n)>0.5 && V(C)<1.5 && V(B)>1.5 && V(A)>1.5) ? 0 : 5 }
B4 Y4 GND VALUE = { (V(en_n)>0.5 && V(C)>1.5 && V(B)<1.5 && V(A)<1.5) ? 0 : 5 }
B5 Y5 GND VALUE = { (V(en_n)>0.5 && V(C)>1.5 && V(B)<1.5 && V(A)>1.5) ? 0 : 5 }
B6 Y6 GND VALUE = { (V(en_n)>0.5 && V(C)>1.5 && V(B)>1.5 && V(A)<1.5) ? 0 : 5 }
B7 Y7 GND VALUE = { (V(en_n)>0.5 && V(C)>1.5 && V(B)>1.5 && V(A)>1.5) ? 0 : 5 }
Rvcc VCC GND 100Meg
.ends HC138`,

  HC148: `.subckt HC148 I0 I1 I2 I3 I4 I5 I6 I7 EI A0 A1 A2 GS EO VCC GND
* 8-to-3 priority encoder (active-low I/O)
* Highest priority = I7 (if active-low and EI active-low)
E_en en_n GND VALUE = { (V(EI)<1.5) ? 1 : 0 }
Ba0 A0 GND VALUE = { (V(en_n)<0.5) ? 5 : (V(I7)<1.5||V(I5)<1.5||V(I3)<1.5||V(I1)<1.5) ? 0 : 5 }
Ba1 A1 GND VALUE = { (V(en_n)<0.5) ? 5 : (V(I7)<1.5||V(I6)<1.5||V(I3)<1.5||V(I2)<1.5) ? 0 : 5 }
Ba2 A2 GND VALUE = { (V(en_n)<0.5) ? 5 : (V(I7)<1.5||V(I6)<1.5||V(I5)<1.5||V(I4)<1.5) ? 0 : 5 }
Bgs GS GND VALUE = { (V(en_n)<0.5) ? 5 : (V(I0)<1.5||V(I1)<1.5||V(I2)<1.5||V(I3)<1.5||V(I4)<1.5||V(I5)<1.5||V(I6)<1.5||V(I7)<1.5) ? 0 : 5 }
Beo EO GND VALUE = { (V(en_n)<0.5 || V(I0)<1.5||V(I1)<1.5||V(I2)<1.5||V(I3)<1.5||V(I4)<1.5||V(I5)<1.5||V(I6)<1.5||V(I7)<1.5) ? 5 : 0 }
Rvcc VCC GND 100Meg
.ends HC148`,

  NE5534: `.subckt NE5534 INP INN OUTP VCC VEE COMP
* NE5534 low-noise op-amp -- flat model
Ediff diff_n 0 VALUE = { V(INP) - V(INN) }
Egain OUTP 0 VALUE = { LIMIT(100000*V(diff_n), V(VEE)+0.015, V(VCC)-0.015) }
Rin INP INN 1Meg
Rvcc VCC 0 100Meg
Rvee VEE 0 100Meg
Rcomp COMP OUTP 10k
.ends NE5534`,

  LM337: `.subckt LM337 IN OUT ADJ
* LM337 adjustable negative regulator
* Vout = -1.25 * (1 + R2/R1) â€” R2/R1 set by user externally
* Model: holds OUT at IN - 1.5V (dropout); real Vout depends on ADJ divider
Ereg OUT ADJ VALUE = { LIMIT(V(IN,ADJ) - 1.5, V(IN) - 40, -1.2) }
Radj ADJ IN 10Meg
Rin IN ADJ 0.1
.ends LM337`,

  MAX7219: `.subckt MAX7219 DIN CLK CS DOUT VCC GND
* MAX7219 SPI LED driver â€” pass-through model
* DOUT mirrors DIN after one SPI cycle (simplified)
Bdout DOUT GND VALUE = { V(DIN) }
Rvcc VCC GND 100Meg
Rcs CS GND 10Meg
.ends MAX7219`,

  CD4060: `.subckt CD4060 OSC1 OSC2 RST Q4 Q5 Q6 Q7 Q8 Q9 Q10 Q14 VDD VSS
* CD4060 oscillator + 14-stage counter
* Oscillator drives internal chain; outputs are /2^n of osc freq
* Simplified: outputs toggle based on time (100kHz osc)
Bosc osc_int VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000*time)>0 ? V(VDD,VSS)*0.9 : 0) }
* Each Q output is successive divide-by-2 of the oscillator
Bq4  Q4  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/16*time)>0  ? V(VDD,VSS)*0.9 : 0) }
Bq5  Q5  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/32*time)>0  ? V(VDD,VSS)*0.9 : 0) }
Bq6  Q6  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/64*time)>0  ? V(VDD,VSS)*0.9 : 0) }
Bq7  Q7  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/128*time)>0 ? V(VDD,VSS)*0.9 : 0) }
Bq8  Q8  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/256*time)>0 ? V(VDD,VSS)*0.9 : 0) }
Bq9  Q9  VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/512*time)>0 ? V(VDD,VSS)*0.9 : 0) }
Bq10 Q10 VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/1024*time)>0? V(VDD,VSS)*0.9 : 0) }
Bq14 Q14 VSS VALUE = { (V(RST,VSS)>1) ? 0 : (sin(2*3.14159*100000/16384*time)>0?V(VDD,VSS)*0.9 : 0) }
Rvdd VDD VSS 100Meg
.ends CD4060`,

  MCP3208: `.subckt MCP3208 CH0 CH1 CH2 CH3 CH4 CH5 CH6 CH7 CS DIN DOUT CLK VREF VDD AGND DGND
* MCP3208 SPI ADC â€” simplified: DOUT mirrors selected channel voltage as digital-ish
* Real SPI encoding requires firmware; model returns analog proportional value
Bdout DOUT DGND VALUE = { V(CS,DGND)>1.5 ? 0 : V(CH0,AGND)/V(VREF,AGND)*3.3 }
Rvdd VDD AGND 100Meg
Rcs  CS  DGND 10Meg
.ends MCP3208`,
  NPN_DARL: `.subckt NPN_DARL B C E
* NPN Darlington pair (TIP122) -- two BJTs in series, hFE>1000
Q1 C B1 E NPN_D
Q2 B1 B E NPN_D
R_be B E 10k
.model NPN_D NPN (Is=1e-14 Bf=100 Vaf=100 Cje=100p Cjc=20p)
.ends NPN_DARL`,

  PNP_DARL: `.subckt PNP_DARL B C E
* PNP Darlington pair (TIP127) -- complementary to TIP122
Q1 C B1 E PNP_D
Q2 B1 B E PNP_D
R_be B E 10k
.model PNP_D PNP (Is=1e-14 Bf=100 Vaf=100 Cje=100p Cjc=20p)
.ends PNP_DARL`,

  LM35: `.subckt LM35 VCC OUTP GND
* LM35: 10mV/degC, baseline 25degC -> 250mV output
Bout OUTP GND VALUE = { 0.25 }
Rvcc VCC GND 100Meg
.ends LM35`,

  HALL_A3144: `.subckt HALL_A3144 VCC GND OUTP
* A3144 Hall sensor: open-collector, active LOW when B-field present
* Default: output pulled high through external resistor (modelled here)
Rpull VCC OUTP 10k
Bout OUTP GND VALUE = { 0 }
Rvcc VCC GND 100Meg
.ends HALL_A3144`,

  HC573: `.subckt HC573 D0 D1 D2 D3 D4 D5 D6 D7 LE OE Q0 Q1 Q2 Q3 Q4 Q5 Q6 Q7 VCC GND
* 74HC573 Octal Transparent Latch -- when LE high outputs follow inputs; when LOW latched
* OE active low enables outputs
E0 Q0 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D0) : (V(OE)<1.5) ? V(Q0) : 0 }
E1 Q1 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D1) : (V(OE)<1.5) ? V(Q1) : 0 }
E2 Q2 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D2) : (V(OE)<1.5) ? V(Q2) : 0 }
E3 Q3 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D3) : (V(OE)<1.5) ? V(Q3) : 0 }
E4 Q4 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D4) : (V(OE)<1.5) ? V(Q4) : 0 }
E5 Q5 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D5) : (V(OE)<1.5) ? V(Q5) : 0 }
E6 Q6 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D6) : (V(OE)<1.5) ? V(Q6) : 0 }
E7 Q7 GND VALUE = { (V(OE)<1.5 && V(LE)>1.5) ? V(D7) : (V(OE)<1.5) ? V(Q7) : 0 }
Rvcc VCC GND 100Meg
.ends HC573`,

  HC165: `.subckt HC165 PL CLK CE SER A B C D E F G H QH QHN VCC GND
* 74HC165 PISO shift register -- simplified: loads D7=H on PL low, shifts on CLK
* Behavioural: QH outputs parallel input H when loaded (simplified single-stage)
Bqh  QH  GND VALUE = { (V(PL)<1.5) ? V(H) : (V(CE)<1.5 && V(CLK)>1.5) ? V(SER) : V(H) }
Bqhn QHN GND VALUE = { 5 - V(QH,GND) }
Rvcc VCC GND 100Meg
.ends HC165`,

  PCF8574: `.subckt PCF8574 SDA SCL A0 A1 A2 INT P0 P1 P2 P3 P4 P5 P6 P7 VCC GND
* PCF8574 I2C GPIO expander -- passthrough model (pins float high via weak pull-ups)
Rp0 P0 VCC 100k
Rp1 P1 VCC 100k
Rp2 P2 VCC 100k
Rp3 P3 VCC 100k
Rp4 P4 VCC 100k
Rp5 P5 VCC 100k
Rp6 P6 VCC 100k
Rp7 P7 VCC 100k
Rsda SDA GND 10Meg
Rscl SCL GND 10Meg
Rvcc VCC GND 100Meg
.ends PCF8574`,

  ESP8266: `.subckt ESP8266 TX RX RST EN GPIO0 GPIO2 ADC VCC GND
* ESP8266 WiFi SoC -- passthrough UART model
Btx TX GND VALUE = { 3.3 }
Rrx RX GND 10Meg
Rvcc VCC GND 100Meg
Radc ADC GND 10Meg
.ends ESP8266`,

  HC86: `.subckt HC86 A B Y GND
E1 Y GND VALUE = { ((V(A)>1.5) != (V(B)>1.5)) ? 5 : 0 }
Rout Y GND 10Meg
.ends HC86`,

  UC3842: `.subckt UC3842 COMP FB ISNS RT GND OUTP VCC VREF
* UC3842 current-mode PWM controller
Eref VREF GND VALUE = { 5.0 }
Rref VREF GND 100
Berr err_n GND VALUE = { LIMIT(V(VREF)*0.5 - V(FB), -5, 5) }
Rerr err_n GND 10k
Bosc osc_n GND VALUE = { (sin(2*3.14159*50000*time)>0 ? 1 : 0) }
Bout OUTP GND VALUE = { (V(VCC,GND)<10) ? 0 : (V(ISNS)>1) ? 0 : (V(osc_n)>0.5 && V(err_n,GND)>0) ? V(VCC,GND)*0.9 : 0 }
Rvcc VCC GND 100Meg
.ends UC3842`,

  SCR: `.subckt SCR A K G
* SCR (Thyristor): conducts A->K when gate triggered, latches until current drops
* Simplified: two BJT latch model
Q_pnp A g_int K SCR_PNP
Q_npn g_int G K SCR_NPN
R_gate G K 10k
.model SCR_PNP PNP (Is=1e-14 Bf=50)
.model SCR_NPN NPN (Is=1e-14 Bf=50)
.ends SCR`,

  JFET_N: `.subckt JFET_N G D S
* N-Channel JFET depletion model
* Vp=-2V, Idss=5mA
Bids D S I = { MAX(0, 5m*(1 - V(G,S)/(-2))^2 * (V(D,S) > 0 ? 1 : 0)) }
Rgs G S 1000Meg
.ends JFET_N`,

  JFET_P: `.subckt JFET_P G D S
* P-Channel JFET depletion model
* Vp=+2V, Idss=5mA
Bids S D I = { MAX(0, 5m*(1 - V(G,S)/2)^2 * (V(S,D) > 0 ? 1 : 0)) }
Rgs G S 1000Meg
.ends JFET_P`,

  HC244: `.subckt HC244 A1 A2 A3 A4 A5 A6 A7 A8 OE1 Y1 Y2 Y3 Y4 Y5 Y6 Y7 Y8 VCC GND
* 74HC244 Octal Buffer -- non-inverting, 3-state
E1 Y1 GND VALUE = { (V(OE1)<1.5) ? V(A1) : 0 }
E2 Y2 GND VALUE = { (V(OE1)<1.5) ? V(A2) : 0 }
E3 Y3 GND VALUE = { (V(OE1)<1.5) ? V(A3) : 0 }
E4 Y4 GND VALUE = { (V(OE1)<1.5) ? V(A4) : 0 }
E5 Y5 GND VALUE = { (V(OE1)<1.5) ? V(A5) : 0 }
E6 Y6 GND VALUE = { (V(OE1)<1.5) ? V(A6) : 0 }
E7 Y7 GND VALUE = { (V(OE1)<1.5) ? V(A7) : 0 }
E8 Y8 GND VALUE = { (V(OE1)<1.5) ? V(A8) : 0 }
Rvcc VCC GND 100Meg
.ends HC244`,

  HC374: `.subckt HC374 D1 D2 D3 D4 D5 D6 D7 D8 CLK OE Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 VCC GND
* 74HC374 Octal D Flip-Flop edge-triggered -- simplified level model
E1 Q1 GND VALUE = { (V(OE)<1.5) ? V(D1) : 0 }
E2 Q2 GND VALUE = { (V(OE)<1.5) ? V(D2) : 0 }
E3 Q3 GND VALUE = { (V(OE)<1.5) ? V(D3) : 0 }
E4 Q4 GND VALUE = { (V(OE)<1.5) ? V(D4) : 0 }
E5 Q5 GND VALUE = { (V(OE)<1.5) ? V(D5) : 0 }
E6 Q6 GND VALUE = { (V(OE)<1.5) ? V(D6) : 0 }
E7 Q7 GND VALUE = { (V(OE)<1.5) ? V(D7) : 0 }
E8 Q8 GND VALUE = { (V(OE)<1.5) ? V(D8) : 0 }
Rvcc VCC GND 100Meg
.ends HC374`,

  HC151: `.subckt HC151 D0 D1 D2 D3 D4 D5 D6 D7 S0 S1 S2 EN Y W VCC GND
* 74HC151 8-to-1 MUX
* sel = 4*S2 + 2*S1 + S0
Bsel sel_n GND VALUE = { (V(S2)>1.5 ? 4 : 0) + (V(S1)>1.5 ? 2 : 0) + (V(S0)>1.5 ? 1 : 0) }
By Y GND VALUE = { (V(EN)>1.5) ? 0 :
+ (V(sel_n)<0.5) ? V(D0) :
+ (V(sel_n)<1.5) ? V(D1) :
+ (V(sel_n)<2.5) ? V(D2) :
+ (V(sel_n)<3.5) ? V(D3) :
+ (V(sel_n)<4.5) ? V(D4) :
+ (V(sel_n)<5.5) ? V(D5) :
+ (V(sel_n)<6.5) ? V(D6) : V(D7) }
Bw W GND VALUE = { 5 - V(Y,GND) }
Rvcc VCC GND 100Meg
.ends HC151`,

  HC283: `.subckt HC283 A1 A2 A3 A4 B1 B2 B3 B4 C0 S1 S2 S3 S4 C4 VCC GND
* 74HC283 4-bit binary adder
Bsum sum_n GND VALUE = {
+ (V(A1)>1.5 ? 1 : 0) + (V(A2)>1.5 ? 2 : 0) + (V(A3)>1.5 ? 4 : 0) + (V(A4)>1.5 ? 8 : 0) +
+ (V(B1)>1.5 ? 1 : 0) + (V(B2)>1.5 ? 2 : 0) + (V(B3)>1.5 ? 4 : 0) + (V(B4)>1.5 ? 8 : 0) +
+ (V(C0)>1.5 ? 1 : 0) }
BS1 S1 GND VALUE = { (int(V(sum_n)+0.5) & 1) ? 5 : 0 }
BS2 S2 GND VALUE = { (int(V(sum_n)+0.5) & 2) ? 5 : 0 }
BS3 S3 GND VALUE = { (int(V(sum_n)+0.5) & 4) ? 5 : 0 }
BS4 S4 GND VALUE = { (int(V(sum_n)+0.5) & 8) ? 5 : 0 }
BC4 C4 GND VALUE = { (V(sum_n) >= 16) ? 5 : 0 }
Rvcc VCC GND 100Meg
.ends HC283`,

  MCP4725: `.subckt MCP4725 SDA SCL A0 VOUT VCC GND
* MCP4725 I2C 12-bit DAC -- simplified: VOUT = VCC * 0.5 (mid-scale default)
Bvout VOUT GND VALUE = { V(VCC,GND) * 0.5 }
Rsda SDA GND 10Meg
Rscl SCL GND 10Meg
Rvcc VCC GND 100Meg
.ends MCP4725`,

  INA219: `.subckt INA219 IN_P IN_N SDA SCL A0 A1 VCC GND
* INA219 current/power monitor -- shunt voltage across IN_P/IN_N
* Simplified: no I2C model; shunt resistor 0.1 ohm represented
Rshunt IN_P IN_N 0.1
Rsda SDA GND 10Meg
Rscl SCL GND 10Meg
Rvcc VCC GND 100Meg
.ends INA219`,

  NRF24L01: `.subckt NRF24L01 CE CSN SCK MOSI MISO IRQ VCC GND
* nRF24L01 RF transceiver -- SPI passthrough model
Bmiso MISO GND VALUE = { V(MOSI) }
Rce   CE   GND 10Meg
Rcsn  CSN  GND 10Meg
Rvcc  VCC  GND 100Meg
.ends NRF24L01`,
  TL431_SUB: `.subckt TL431_SUB A K R
* TL431 behavioural shunt reference: conducts when V(R,K) >= 2.5V
B1 K A VALUE = { IF(V(R,K)>=2.495, 1000*(V(R,K)-2.495), 0) }
.ends TL431_SUB`,

  MAX485_SUB: `.subckt MAX485_SUB RO RE DE DI GND A B VCC
* MAX485 stub: pass differential signal A-B to RO when RE=0; drive A-B from DI when DE=1
B1 RO GND VALUE = { IF(V(RE,GND)<0.8, V(A,B), 0) }
B2 A GND VALUE = { IF(V(DE,GND)>2.0, V(DI,GND), 0) }
B3 B GND VALUE = { IF(V(DE,GND)>2.0, 1-V(DI,GND), 0) }
.ends MAX485_SUB`,

  SI7021_SUB: `.subckt SI7021_SUB GND VDD SDA SCL
* SI7021 stub passthrough (digital I2C sensor model)
R1 VDD GND 100k
.ends SI7021_SUB`,

  BMP280_SUB: `.subckt BMP280_SUB GND VDD SDA SCL CSB
* BMP280 stub passthrough (digital I2C/SPI pressure sensor)
R1 VDD GND 100k
.ends BMP280_SUB`,

  PCA9685_SUB: `.subckt PCA9685_SUB VCC GND SDA SCL OE VDD PWM0 PWM1 PWM2 PWM3
* PCA9685 stub: 16-ch PWM driver passthrough
R1 VCC GND 10k
.ends PCA9685_SUB`,

  WS2812B_SUB: `.subckt WS2812B_SUB VDD GND DIN DOUT
* WS2812B stub: intelligent RGB LED NZR protocol
R1 VDD GND 50
.ends WS2812B_SUB`,

  UJT_SUB: `.subckt UJT_SUB E B1 B2
* 2N2646 UJT behavioural model
* Intrinsic standoff ratio eta = 0.65; Vp = eta*Vbb + 0.7
* RBB (interbase resistance) ~ 5k-10k
R_BB1 B1 B2 6800
* Emitter junction: fires when V(E,B1) > eta*V(B2,B1)+0.7
B1 E B1 VALUE = { IF(V(E,B1) > 0.65*V(B2,B1)+0.7, (V(E,B1)-0.65*V(B2,B1)-0.7)*50, 0) }
.ends UJT_SUB`,

  VARACTOR_SUB: `.subckt VARACTOR_SUB A K
* BB910 varactor: voltage-variable capacitor, C = C0/(1+V(K,A)/Vj)^M
* C0~8.5pF, Vj=0.5V, M=0.5 at V_R=1V
* Approximate with voltage-dependent capacitor using B source current
* i = C*dv/dt → use small-signal model: fixed diode + parameter note
D1 A K DVARACT
.model DVARACT D(Is=1e-15 N=1 Cjo=8.5p Vj=0.5 M=0.5 Rs=0.5)
.ends VARACTOR_SUB`,

  TLC555_SUB: `.subckt TLC555_SUB GND TRIG OUT RESET VCC DISCH THR CTRL
* TLC555 CMOS 555 timer behavioural model (same topology as NE555)
* Internal comparators
B_COMP1 N001 GND VALUE = { IF(V(THR,GND) > 0.667*V(VCC,GND), 5, 0) }
B_COMP2 N002 GND VALUE = { IF(V(TRIG,GND) < 0.333*V(VCC,GND), 5, 0) }
* SR Latch
B_SR OUTN GND VALUE = { IF(V(N001,GND)>2.5, 0, IF(V(N002,GND)>2.5, 5, V(OUTN,GND))) }
B_OUT OUT GND VALUE = { IF(V(RESET,GND)<0.7, 0, IF(V(OUTN,GND)>2.5, 0, V(VCC,GND))) }
* Discharge transistor
B_DISC DISCH GND VALUE = { IF(V(RESET,GND)<0.7, 0, IF(V(OUTN,GND)>2.5, 0.01, 1e6)) }
.ends TLC555_SUB`,

  HC590_SUB: `.subckt HC590_SUB QA QB QC QD QE QF QG QH RCO CCLK RCLK OE MR VCC GND
* 74HC590 stub: 8-bit counter with output register
R1 VCC GND 10k
* Outputs stub low
B1 QA GND VALUE={0}
B2 QB GND VALUE={0}
B3 QC GND VALUE={0}
B4 QD GND VALUE={0}
B5 QE GND VALUE={0}
B6 QF GND VALUE={0}
B7 QG GND VALUE={0}
B8 QH GND VALUE={0}
B9 RCO GND VALUE={0}
.ends HC590_SUB`,

  ADS1115_SUB: `.subckt ADS1115_SUB VDD GND SCL SDA ADDR ALRT AIN0 AIN1
* ADS1115 16-bit ADC stub with I2C interface
R1 VDD GND 100k
* Differential input model (simplified)
B1 SDA GND VALUE={0}
.ends ADS1115_SUB`,

  MPU6050_SUB: `.subckt MPU6050_SUB VCC GND SCL SDA AD0 INT
* MPU-6050 6-axis IMU stub
R1 VCC GND 100k
B1 INT GND VALUE={0}
.ends MPU6050_SUB`,

  HC05_SUB: `.subckt HC05_SUB VCC GND TXD RXD EN STATE
* HC-05 Bluetooth module stub
R1 VCC GND 1k
B1 TXD GND VALUE={V(RXD,GND)}
B2 STATE GND VALUE={IF(V(EN,GND)>1.8, V(VCC,GND), 0)}
.ends HC05_SUB`,

  HC21_SUB: `.subckt HC21_SUB A1 B1 C1 D1 Y1 VCC GND
* 74HC21 dual 4-input AND gate (one gate modelled)
B1 Y1 GND VALUE={IF(V(A1,GND)>2.0 & V(B1,GND)>2.0 & V(C1,GND)>2.0 & V(D1,GND)>2.0, V(VCC,GND), 0)}
.ends HC21_SUB`,

  LM2575_SUB: `.subckt LM2575_SUB VIN VOUT GND FB ONB
* LM2575-5 simple switcher buck converter (behavioural 5V fixed)
B1 VOUT GND VALUE={IF(V(ONB,GND)<0.8 & V(VIN,GND)>6.0, 5.0, 0)}
R1 VOUT GND 100k
.ends LM2575_SUB`,

  TPS61023_SUB: `.subckt TPS61023_SUB VIN VOUT GND EN FB
* TPS61023 boost converter stub (fixed 5V out)
B1 VOUT GND VALUE={IF(V(EN,GND)>0.8 & V(VIN,GND)>0.5, 5.0, 0)}
R1 VOUT GND 100k
.ends TPS61023_SUB`,

  PUT_SUB: `.subckt PUT_SUB A K G
* 2N6027 PUT behavioural model
* Fires when V(A,G) exceeds ~0.7V forward drop (emitter fires)
B1 A K VALUE={IF(V(A,G) > 0.7, (V(A,G)-0.7)*100, 0)}
R1 G K 100k
.ends PUT_SUB`,

  HC30_SUB: `.subckt HC30_SUB A B C D E F G H Y VCC GND
* 74HC30 8-input NAND gate
B1 Y GND VALUE={IF(V(A,GND)>2 & V(B,GND)>2 & V(C,GND)>2 & V(D,GND)>2 & V(E,GND)>2 & V(F,GND)>2 & V(G,GND)>2 & V(H,GND)>2, 0, V(VCC,GND))}
.ends HC30_SUB`,

  CD4040_SUB: `.subckt CD4040_SUB CLK RST VDD VSS Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8
* CD4040 12-stage ripple counter stub
R1 VDD VSS 100k
B1 Q1 VSS VALUE={0}
B2 Q2 VSS VALUE={0}
B3 Q3 VSS VALUE={0}
B4 Q4 VSS VALUE={0}
B5 Q5 VSS VALUE={0}
B6 Q6 VSS VALUE={0}
B7 Q7 VSS VALUE={0}
B8 Q8 VSS VALUE={0}
.ends CD4040_SUB`,

  OPA2134_SUB: `.subckt OPA2134_SUB IN1N IN1P OUT1 IN2P IN2N OUT2 VCC VEE
* OPA2134 dual audio op-amp: two independent op-amp cores (high-fidelity)
* Channel 1
E1 OUT1 GND VALUE={LIMIT(100000*(V(IN1P,GND)-V(IN1N,GND)), V(VEE,GND)+0.1, V(VCC,GND)-0.1)}
* Channel 2
E2 OUT2 GND VALUE={LIMIT(100000*(V(IN2P,GND)-V(IN2N,GND)), V(VEE,GND)+0.1, V(VCC,GND)-0.1)}
.ends OPA2134_SUB`,

  CD4066_SUB: `.subckt CD4066_SUB IN1 OUT1 CTL1 IN2 OUT2 CTL2 VDD VSS
* CD4066 quad bilateral switch (channels 1 & 2 modeled)
* Conductance is high (R_on=80) when CTL > 2.5V, else 10Meg
B1 IN1 OUT1 VALUE = { (V(IN1,OUT1) / IF(V(CTL1,VSS) > 2.5, 80, 1e7)) }
B2 IN2 OUT2 VALUE = { (V(IN2,OUT2) / IF(V(CTL2,VSS) > 2.5, 80, 1e7)) }
R_LEAK VDD VSS 10Meg
.ends CD4066_SUB`,

  HC14_SUB: `.subckt HC14_SUB A Y VCC GND
* 74HC14 hex Schmitt trigger inverter: VT+ = 0.6*VCC, VT- = 0.4*VCC
B_SCHMITT Y_INT GND VALUE = { IF(V(A,GND) > 0.6*V(VCC,GND), 0, IF(V(A,GND) < 0.4*V(VCC,GND), V(VCC,GND), V(Y_INT,GND))) }
B_OUT Y GND VALUE = { V(Y_INT,GND) }
R_OUT Y GND 1k
.ends HC14_SUB`,

  HC153_SUB: `.subckt HC153_SUB I0 I1 I2 I3 S0 S1 E Y VCC GND
* 74HC153 4-to-1 multiplexer: S1,S0 binary select, active-low enable E
B_OUT Y GND VALUE = { IF(V(E,GND) > 1.5, 0, IF(V(S1,GND)<1.5 & V(S0,GND)<1.5, V(I0,GND), IF(V(S1,GND)<1.5 & V(S0,GND)>1.5, V(I1,GND), IF(V(S1,GND)>1.5 & V(S0,GND)<1.5, V(I2,GND), V(I3,GND))))) }
R_PWR VCC GND 100k
.ends HC153_SUB`,

  DS1307_SUB: `.subckt DS1307_SUB X1 X2 VBAT GND SDA SCL SQW VCC
* DS1307 I2C RTC stub with 1Hz square wave output model
R_PWR VCC GND 100k
R_BAT VBAT GND 1Meg
B_SQW SQW GND VALUE = { IF(V(VCC,GND)>4.0, 2.5 + 2.5*SGN(SIN(6.28318*1*TIME)), 0) }
.ends DS1307_SUB`,

  MCP3008_SUB: `.subckt MCP3008_SUB CH0 CH1 CH2 CH3 CH4 CH5 VDD VREF CLK DOUT DIN CS GND
* MCP3008 10-bit SPI ADC behavioral stub
R_IN CH0 GND 10Meg
R_PWR VDD GND 100k
B_DOUT DOUT GND VALUE = { IF(V(CS,GND)<0.8, V(DIN,GND), 0) }
.ends MCP3008_SUB`,

  HC164_SUB: `.subckt HC164_SUB DSA DSB CP CLR Q0 Q1 Q2 Q3 Q4 Q5 Q6 Q7 VCC GND
* 74HC164 8-bit shift register stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE = { IF(V(CLR,GND)<0.8, 0, V(DSA,GND)*V(DSB,GND)/V(VCC,GND)) }
B1 Q1 GND VALUE = { 0 }
B2 Q2 GND VALUE = { 0 }
B3 Q3 GND VALUE = { 0 }
B4 Q4 GND VALUE = { 0 }
B5 Q5 GND VALUE = { 0 }
B6 Q6 GND VALUE = { 0 }
B7 Q7 GND VALUE = { 0 }
.ends HC164_SUB`,

  LM3914_SUB: `.subckt LM3914_SUB SIG RLO RHI MODE L1 L2 L3 L4 L5 L6 L7 L8 L9 L10 VCC GND
* LM3914 10-step comparator ladder (step = (RHI-RLO)/10)
B1 L1 GND VALUE = { IF(V(SIG,RLO) > 0.1*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B2 L2 GND VALUE = { IF(V(SIG,RLO) > 0.2*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B3 L3 GND VALUE = { IF(V(SIG,RLO) > 0.3*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B4 L4 GND VALUE = { IF(V(SIG,RLO) > 0.4*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B5 L5 GND VALUE = { IF(V(SIG,RLO) > 0.5*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B6 L6 GND VALUE = { IF(V(SIG,RLO) > 0.6*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B7 L7 GND VALUE = { IF(V(SIG,RLO) > 0.7*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B8 L8 GND VALUE = { IF(V(SIG,RLO) > 0.8*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B9 L9 GND VALUE = { IF(V(SIG,RLO) > 0.9*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
B10 L10 GND VALUE = { IF(V(SIG,RLO) > 1.0*(V(RHI,RLO)+0.01), 0.2, V(VCC,GND)) }
.ends LM3914_SUB`,

  TDA2030_SUB: `.subckt TDA2030_SUB INP INN OUT VSP VSN
* TDA2030 class-AB audio amplifier
R_IN INP INN 5Meg
E_AMP OUT_INT GND VALUE = { LIMIT(80000*(V(INP,GND)-V(INN,GND)), V(VSN,GND)+1.5, V(VSP,GND)-1.5) }
R_OUT OUT_INT OUT 0.2
.ends TDA2030_SUB`,

  DAC0808_SUB: `.subckt DAC0808_SUB A1 A2 A3 A4 A5 A6 A7 A8 IOUT VREFP VREFN VCC VEE GND
* DAC0808 8-bit multiplying DAC behavioral model
B_DAC IOUT GND VALUE = { ((V(VREFP,VREFN)/2000) * ( (V(A1,GND)>2?128:0) + (V(A2,GND)>2?64:0) + (V(A3,GND)>2?32:0) + (V(A4,GND)>2?16:0) + (V(A5,GND)>2?8:0) + (V(A6,GND)>2?4:0) + (V(A7,GND)>2?2:0) + (V(A8,GND)>2?1:0) ) / 256) * 1000 }
R_PWR VCC GND 100k
R_NEG VEE GND 100k
.ends DAC0808_SUB`,

  PHOTOTRANS_SUB: `.subckt PHOTOTRANS_SUB C E B
* NPN phototransistor model
Q1 C B E QPHOTO
I_PHOTO C B 50u
.model QPHOTO NPN(Is=1e-14 Bf=200 Vaf=80 Cjc=5p Cje=10p)
.ends PHOTOTRANS_SUB`,

  NE556_SUB: `.subckt NE556_SUB DIS1 THR1 CV1 RST1 TRG1 OUT1 OUT2 TRG2 RST2 CV2 THR2 DIS2 VCC GND
* Dual 555 timer subcircuit
* Timer 1
B_C11 N11 GND VALUE = { IF(V(THR1,GND) > 0.667*V(VCC,GND), 5, 0) }
B_C12 N12 GND VALUE = { IF(V(TRG1,GND) < 0.333*V(VCC,GND), 5, 0) }
B_SR1 Q1N GND VALUE = { IF(V(N11,GND)>2.5, 0, IF(V(N12,GND)>2.5, 5, V(Q1N,GND))) }
B_O1 OUT1 GND VALUE = { IF(V(RST1,GND)<0.7, 0, IF(V(Q1N,GND)>2.5, 0, V(VCC,GND))) }
B_D1 DIS1 GND VALUE = { IF(V(RST1,GND)<0.7, 0, IF(V(Q1N,GND)>2.5, 0.01, 1e6)) }
* Timer 2
B_C21 N21 GND VALUE = { IF(V(THR2,GND) > 0.667*V(VCC,GND), 5, 0) }
B_C22 N22 GND VALUE = { IF(V(TRG2,GND) < 0.333*V(VCC,GND), 5, 0) }
B_SR2 Q2N GND VALUE = { IF(V(N21,GND)>2.5, 0, IF(V(N22,GND)>2.5, 5, V(Q2N,GND))) }
B_O2 OUT2 GND VALUE = { IF(V(RST2,GND)<0.7, 0, IF(V(Q2N,GND)>2.5, 0, V(VCC,GND))) }
B_D2 DIS2 GND VALUE = { IF(V(RST2,GND)<0.7, 0, IF(V(Q2N,GND)>2.5, 0.01, 1e6)) }
.ends NE556_SUB`,

  LM339_SUB: `.subckt LM339_SUB IN1P IN1N OUT1 IN2P IN2N OUT2 VCC GND
* LM339 quad comparator with open-collector outputs (channels 1 & 2 modeled)
* When IN- > IN+, sink current through low resistance
B1 OUT1 GND VALUE = { IF(V(IN1P,IN1N) < 0, V(OUT1,GND)/15, 0) }
B2 OUT2 GND VALUE = { IF(V(IN2P,IN2N) < 0, V(OUT2,GND)/15, 0) }
R_PWR VCC GND 100k
.ends LM339_SUB`,

  HC85_SUB: `.subckt HC85_SUB A0 A1 A2 A3 B0 B1 B2 B3 AGT AEQ ALT VCC GND
* 74HC85 4-bit magnitude comparator
* Word A = A0 + 2*A1 + 4*A2 + 8*A3
* Word B = B0 + 2*B1 + 4*B2 + 8*B3
B_AGT AGT GND VALUE = { IF( ( (V(A0,GND)>2?1:0) + (V(A1,GND)>2?2:0) + (V(A2,GND)>2?4:0) + (V(A3,GND)>2?8:0) ) > ( (V(B0,GND)>2?1:0) + (V(B1,GND)>2?2:0) + (V(B2,GND)>2?4:0) + (V(B3,GND)>2?8:0) ), V(VCC,GND), 0) }
B_AEQ AEQ GND VALUE = { IF( ( (V(A0,GND)>2?1:0) + (V(A1,GND)>2?2:0) + (V(A2,GND)>2?4:0) + (V(A3,GND)>2?8:0) ) == ( (V(B0,GND)>2?1:0) + (V(B1,GND)>2?2:0) + (V(B2,GND)>2?4:0) + (V(B3,GND)>2?8:0) ), V(VCC,GND), 0) }
B_ALT ALT GND VALUE = { IF( ( (V(A0,GND)>2?1:0) + (V(A1,GND)>2?2:0) + (V(A2,GND)>2?4:0) + (V(A3,GND)>2?8:0) ) < ( (V(B0,GND)>2?1:0) + (V(B1,GND)>2?2:0) + (V(B2,GND)>2?4:0) + (V(B3,GND)>2?8:0) ), V(VCC,GND), 0) }
R_PWR VCC GND 100k
.ends HC85_SUB`,

  HC193_SUB: `.subckt HC193_SUB CPU CPD MR PL P0 P1 P2 P3 Q0 Q1 Q2 Q3 TCU TCD VCC GND
* 74HC193 4-bit synchronous up/down counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE = { IF(V(MR,GND)>2, 0, IF(V(PL,GND)<0.8, V(P0,GND), 0)) }
B1 Q1 GND VALUE = { IF(V(MR,GND)>2, 0, IF(V(PL,GND)<0.8, V(P1,GND), 0)) }
B2 Q2 GND VALUE = { IF(V(MR,GND)>2, 0, IF(V(PL,GND)<0.8, V(P2,GND), 0)) }
B3 Q3 GND VALUE = { IF(V(MR,GND)>2, 0, IF(V(PL,GND)<0.8, V(P3,GND), 0)) }
B_TCU TCU GND VALUE = { V(VCC,GND) }
B_TCD TCD GND VALUE = { V(VCC,GND) }
.ends HC193_SUB`,

  MAX6675_SUB: `.subckt MAX6675_SUB GND T_NEG T_POS VCC SCK CS SO
* MAX6675 thermocouple ADC stub with SPI serial output
R_TC T_POS T_NEG 100
R_PWR VCC GND 100k
B_SO SO GND VALUE = { IF(V(CS,GND)<0.8, V(T_POS,T_NEG)*100, 0) }
.ends MAX6675_SUB`,

  HX711_SUB: `.subckt HX711_SUB AVDD INAP INAN INBP INBN AGND VCC DOUT SCK DGND
* HX711 24-bit load cell ADC stub
R_INA INAP INAN 10Meg
R_PWR VCC DGND 100k
B_DOUT DOUT DGND VALUE = { IF(V(SCK,DGND)<0.8, V(INAP,INAN)*1000, 0) }
.ends HX711_SUB`,

  TDA7294_SUB: `.subckt TDA7294_SUB INP INN MUTE OUT VSP VSN GND
* TDA7294 100W audio power amplifier
R_IN INP INN 10Meg
E_AMP OUT_INT GND VALUE = { IF(V(MUTE,GND)>1.5, LIMIT(100000*(V(INP,GND)-V(INN,GND)), V(VSN,GND)+2, V(VSP,GND)-2), 0) }
R_OUT OUT_INT OUT 0.1
.ends TDA7294_SUB`,

  CD4013_SUB: `.subckt CD4013_SUB D1 CLK1 SET1 RST1 Q1 Q1_BAR VDD VSS
* CD4013 dual D-type flip-flop (channel 1 modeled)
B_Q1 Q1 VSS VALUE = { IF(V(SET1,VSS)>2.5, V(VDD,VSS), IF(V(RST1,VSS)>2.5, 0, V(D1,VSS))) }
B_Q1B Q1_BAR VSS VALUE = { IF(V(SET1,VSS)>2.5, 0, IF(V(RST1,VSS)>2.5, V(VDD,VSS), V(VDD,VSS)-V(D1,VSS))) }
R_PWR VDD VSS 100k
.ends CD4013_SUB`,

  HC125_SUB: `.subckt HC125_SUB A OE Y VCC GND
* 74HC125 quad 3-state buffer (1 gate modeled)
B_OUT Y GND VALUE = { IF(V(OE,GND)<0.8, V(A,GND), 0) }
R_OUT Y GND 1k
R_PWR VCC GND 100k
.ends HC125_SUB`,

  BPW34_SUB: `.subckt BPW34_SUB A K
* BPW34 silicon PIN photodiode model
D1 A K DBPW34
I_PH K A 25u
.model DBPW34 D(Is=1e-13 Rs=10 Cjo=70p Bv=60 Ibv=10u)
.ends BPW34_SUB`,

  TL082_SUB: `.subckt TL082_SUB IN1N IN1P OUT1 IN2P IN2N OUT2 VCC VEE
* TL082 dual JFET op-amp
E1 OUT1 GND VALUE={LIMIT(100000*(V(IN1P,GND)-V(IN1N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
E2 OUT2 GND VALUE={LIMIT(100000*(V(IN2P,GND)-V(IN2N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
.ends TL082_SUB`,

  TL084_SUB: `.subckt TL084_SUB OUT1 IN1N IN1P VCC IN2P IN2N OUT2 OUT3 IN3N IN3P VEE IN4P IN4N OUT4
* TL084 quad JFET op-amp
E1 OUT1 GND VALUE={LIMIT(100000*(V(IN1P,GND)-V(IN1N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
E2 OUT2 GND VALUE={LIMIT(100000*(V(IN2P,GND)-V(IN2N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
E3 OUT3 GND VALUE={LIMIT(100000*(V(IN3P,GND)-V(IN3N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
E4 OUT4 GND VALUE={LIMIT(100000*(V(IN4P,GND)-V(IN4N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
.ends TL084_SUB`,

  LM833_SUB: `.subckt LM833_SUB IN1N IN1P OUT1 IN2P IN2N OUT2 VCC VEE
* LM833 dual audio op-amp
E1 OUT1 GND VALUE={LIMIT(120000*(V(IN1P,GND)-V(IN1N,GND)), V(VEE,GND)+1.0, V(VCC,GND)-1.0)}
E2 OUT2 GND VALUE={LIMIT(120000*(V(IN2P,GND)-V(IN2N,GND)), V(VEE,GND)+1.0, V(VCC,GND)-1.0)}
.ends LM833_SUB`,

  OP07_SUB: `.subckt OP07_SUB INN INP OUT VCC VEE
* OP07 ultralow offset op-amp
E1 OUT GND VALUE={LIMIT(300000*(V(INP,GND)-V(INN,GND)), V(VEE,GND)+1.0, V(VCC,GND)-1.0)}
.ends OP07_SUB`,

  CA3140_SUB: `.subckt CA3140_SUB INN INP OUT VCC VEE
* CA3140 BiMOS op-amp
E1 OUT GND VALUE={LIMIT(100000*(V(INP,GND)-V(INN,GND)), V(VEE,GND)+0.2, V(VCC,GND)-1.2)}
.ends CA3140_SUB`,

  LF353_SUB: `.subckt LF353_SUB IN1N IN1P OUT1 IN2P IN2N OUT2 VCC VEE
* LF353 dual JFET op-amp
E1 OUT1 GND VALUE={LIMIT(100000*(V(IN1P,GND)-V(IN1N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
E2 OUT2 GND VALUE={LIMIT(100000*(V(IN2P,GND)-V(IN2N,GND)), V(VEE,GND)+1.5, V(VCC,GND)-1.5)}
.ends LF353_SUB`,

  INA128_SUB: `.subckt INA128_SUB RG1 VINM VINP RG2 VEE REF VOUT VCC
* INA128 precision instrumentation amp: G = 1 + 50k/R_G (default G=10 if RG open)
E1 VOUT GND VALUE={LIMIT(10*(V(VINP,GND)-V(VINM,GND)) + V(REF,GND), V(VEE,GND)+1.4, V(VCC,GND)-1.4)}
R_IN VINP VINM 100Meg
.ends INA128_SUB`,

  AD623_SUB: `.subckt AD623_SUB RG1 VINM VINP RG2 VEE REF VOUT VCC
* AD623 rail-to-rail in-amp
E1 VOUT GND VALUE={LIMIT(10*(V(VINP,GND)-V(VINM,GND)) + V(REF,GND), V(VEE,GND)+0.1, V(VCC,GND)-0.1)}
R_IN VINP VINM 100Meg
.ends AD623_SUB`,

  LM385_SUB: `.subckt LM385_SUB A K
* LM385 2.5V precision voltage reference diode
D1 A K DLM385
B1 K A VALUE={IF(V(K,A)>=2.5, (V(K,A)-2.5)*100, 0)}
.model DLM385 D(Is=1e-14 Bv=2.5 Ibv=1m)
.ends LM385_SUB`,

  REF02_SUB: `.subckt REF02_SUB VIN GND VOUT TRIM
* REF02 precision +5V voltage reference
B1 VOUT GND VALUE={IF(V(VIN,GND)>=7.0, 5.0, V(VIN,GND)-2.0)}
R_IN VIN GND 1Meg
.ends REF02_SUB`,

  REG78L05_SUB: `.subckt REG78L05_SUB VIN VOUT GND
* 78L05 5V 100mA regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)>=7.0, 5.0, MAX(0, V(VIN,GND)-2.0))}
R_L VOUT GND 100k
.ends REG78L05_SUB`,

  REG7809_SUB: `.subckt REG7809_SUB VIN VOUT GND
* 7809 9V 1A regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)>=11.5, 9.0, MAX(0, V(VIN,GND)-2.5))}
R_L VOUT GND 100k
.ends REG7809_SUB`,

  REG7815_SUB: `.subckt REG7815_SUB VIN VOUT GND
* 7815 15V 1A regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)>=17.5, 15.0, MAX(0, V(VIN,GND)-2.5))}
R_L VOUT GND 100k
.ends REG7815_SUB`,

  REG7824_SUB: `.subckt REG7824_SUB VIN VOUT GND
* 7824 24V 1A regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)>=27.0, 24.0, MAX(0, V(VIN,GND)-3.0))}
R_L VOUT GND 100k
.ends REG7824_SUB`,

  REG7905_SUB: `.subckt REG7905_SUB GND VIN VOUT
* 7905 -5V 1A negative regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)<=-7.0, -5.0, MIN(0, V(VIN,GND)+2.0))}
R_L VOUT GND 100k
.ends REG7905_SUB`,

  REG7912_SUB: `.subckt REG7912_SUB GND VIN VOUT
* 7912 -12V 1A negative regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)<=-14.5, -12.0, MIN(0, V(VIN,GND)+2.5))}
R_L VOUT GND 100k
.ends REG7912_SUB`,

  REG7915_SUB: `.subckt REG7915_SUB GND VIN VOUT
* 7915 -15V 1A negative regulator
B1 VOUT GND VALUE={IF(V(VIN,GND)<=-17.5, -15.0, MIN(0, V(VIN,GND)+2.5))}
R_L VOUT GND 100k
.ends REG7915_SUB`,

  AMS1117_ADJ_SUB: `.subckt AMS1117_ADJ_SUB ADJ VIN VOUT
* AMS1117 adjustable LDO: VOUT = V(ADJ) + 1.25V
B1 VOUT ADJ VALUE={IF(V(VIN,ADJ)>=2.5, 1.25, MAX(0, V(VIN,ADJ)-1.25))}
R_L VOUT ADJ 100k
.ends AMS1117_ADJ_SUB`,

  LP2950_SUB: `.subckt LP2950_SUB VIN VOUT GND
* LP2950 5V 100mA micropower LDO (dropout 0.38V)
B1 VOUT GND VALUE={IF(V(VIN,GND)>=5.38, 5.0, MAX(0, V(VIN,GND)-0.38))}
R_L VOUT GND 100k
.ends LP2950_SUB`,

  ICL8038_SUB: `.subckt ICL8038_SUB VCC RA RB CAP FM VEE SINE TRI SQR
* ICL8038 waveform generator behavioural model (1kHz nominal)
B_SQR SQR GND VALUE={IF(SIN(6.28318*1000*TIME)>0, V(VCC,GND), V(VEE,GND))}
B_SIN SINE GND VALUE={2.0*SIN(6.28318*1000*TIME)}
B_TRI TRI GND VALUE={2.0*ASIN(SIN(6.28318*1000*TIME))/(1.570796)}
R_PWR VCC VEE 100k
.ends ICL8038_SUB`,

  XR2206_SUB: `.subckt XR2206_SUB VCC TC1 TC2 TR1 GND OUT SYNC BYP
* XR2206 function generator model (1kHz sine + square)
B_OUT OUT GND VALUE={2.0*SIN(6.28318*1000*TIME) + 2.5}
B_SYNC SYNC GND VALUE={IF(SIN(6.28318*1000*TIME)>0, V(VCC,GND), 0)}
R_PWR VCC GND 100k
.ends XR2206_SUB`,

  CD4046_SUB: `.subckt CD4046_SUB SIG COMP VCO INH VSS VDD PC1 PC2 VCO_O DEM
* CD4046 PLL model
R_PWR VDD VSS 100k
B_VCO VCO_O VSS VALUE={IF(SIN(6.28318*(10000*V(VCO,VSS)+100)*TIME)>0, V(VDD,VSS), 0)}
B_PC1 PC1 VSS VALUE={IF( (V(SIG,VSS)>2.5 & V(COMP,VSS)<2.5) | (V(SIG,VSS)<2.5 & V(COMP,VSS)>2.5), V(VDD,VSS), 0)}
.ends CD4046_SUB`,

  CD4047_SUB: `.subckt CD4047_SUB C R RC AST VSS VDD Q QBAR OSC RST
* CD4047 multivibrator model (astable 1kHz default)
R_PWR VDD VSS 100k
B_Q Q VSS VALUE={IF(SIN(6.28318*1000*TIME)>0, V(VDD,VSS), 0)}
B_QB QBAR VSS VALUE={IF(SIN(6.28318*1000*TIME)>0, 0, V(VDD,VSS))}
B_OSC OSC VSS VALUE={IF(SIN(6.28318*2000*TIME)>0, V(VDD,VSS), 0)}
.ends CD4047_SUB`,

  CD4069_SUB: `.subckt CD4069_SUB A Y VDD VSS
* CD4069 CMOS hex inverter
B_OUT Y VSS VALUE={IF(V(A,VSS)>0.5*V(VDD,VSS), 0, V(VDD,VSS))}
R_PWR VDD VSS 100k
.ends CD4069_SUB`,

  HC02_SUB: `.subckt HC02_SUB A B Y VCC GND
* 74HC02 2-input NOR gate
B_OUT Y GND VALUE={IF(V(A,GND)<1.5 & V(B,GND)<1.5, V(VCC,GND), 0)}
.ends HC02_SUB`,

  HC10_SUB: `.subckt HC10_SUB A B C Y VCC GND
* 74HC10 3-input NAND gate
B_OUT Y GND VALUE={IF(V(A,GND)>2.0 & V(B,GND)>2.0 & V(C,GND)>2.0, 0, V(VCC,GND))}
.ends HC10_SUB`,

  HC11_SUB: `.subckt HC11_SUB A B C Y VCC GND
* 74HC11 3-input AND gate
B_OUT Y GND VALUE={IF(V(A,GND)>2.0 & V(B,GND)>2.0 & V(C,GND)>2.0, V(VCC,GND), 0)}
.ends HC11_SUB`,

  HC20_SUB: `.subckt HC20_SUB A B C D Y VCC GND
* 74HC20 4-input NAND gate
B_OUT Y GND VALUE={IF(V(A,GND)>2.0 & V(B,GND)>2.0 & V(C,GND)>2.0 & V(D,GND)>2.0, 0, V(VCC,GND))}
.ends HC20_SUB`,

  HC27_SUB: `.subckt HC27_SUB A B C Y VCC GND
* 74HC27 3-input NOR gate
B_OUT Y GND VALUE={IF(V(A,GND)<1.5 & V(B,GND)<1.5 & V(C,GND)<1.5, V(VCC,GND), 0)}
.ends HC27_SUB`,

  HC132_SUB: `.subckt HC132_SUB A B Y VCC GND
* 74HC132 2-input Schmitt trigger NAND gate
B_OUT Y GND VALUE={IF(V(A,GND)>3.0 & V(B,GND)>3.0, 0, IF(V(A,GND)<2.0 | V(B,GND)<2.0, V(VCC,GND), V(Y,GND)))}
.ends HC132_SUB`,

  HC139_SUB: `.subckt HC139_SUB E A0 A1 Y0 Y1 Y2 Y3 VCC GND
* 74HC139 2-to-4 decoder (active-low outputs and enable)
B0 Y0 GND VALUE={IF(V(E,GND)<1.5 & V(A0,GND)<1.5 & V(A1,GND)<1.5, 0, V(VCC,GND))}
B1 Y1 GND VALUE={IF(V(E,GND)<1.5 & V(A0,GND)>1.5 & V(A1,GND)<1.5, 0, V(VCC,GND))}
B2 Y2 GND VALUE={IF(V(E,GND)<1.5 & V(A0,GND)<1.5 & V(A1,GND)>1.5, 0, V(VCC,GND))}
B3 Y3 GND VALUE={IF(V(E,GND)<1.5 & V(A0,GND)>1.5 & V(A1,GND)>1.5, 0, V(VCC,GND))}
R_PWR VCC GND 100k
.ends HC139_SUB`,

  HC154_SUB: `.subckt HC154_SUB A0 A1 A2 A3 E1 E2 Y0 Y1 Y2 Y3 Y4 Y5 Y6 Y7 VCC GND
* 74HC154 4-to-16 decoder stub
R_PWR VCC GND 100k
B0 Y0 GND VALUE={IF(V(E1,GND)<1.5 & V(E2,GND)<1.5 & V(A0,GND)<1.5 & V(A1,GND)<1.5 & V(A2,GND)<1.5 & V(A3,GND)<1.5, 0, V(VCC,GND))}
B1 Y1 GND VALUE={V(VCC,GND)}
B2 Y2 GND VALUE={V(VCC,GND)}
B3 Y3 GND VALUE={V(VCC,GND)}
B4 Y4 GND VALUE={V(VCC,GND)}
B5 Y5 GND VALUE={V(VCC,GND)}
B6 Y6 GND VALUE={V(VCC,GND)}
B7 Y7 GND VALUE={V(VCC,GND)}
.ends HC154_SUB`,

  HC42_SUB: `.subckt HC42_SUB A B C D Y0 Y1 Y2 Y3 Y4 Y5 Y6 Y7 Y8 Y9 VCC GND
* 74HC42 BCD to decimal decoder
R_PWR VCC GND 100k
B0 Y0 GND VALUE={IF(V(A,GND)<1.5 & V(B,GND)<1.5 & V(C,GND)<1.5 & V(D,GND)<1.5, 0, V(VCC,GND))}
B1 Y1 GND VALUE={V(VCC,GND)}
B2 Y2 GND VALUE={V(VCC,GND)}
B3 Y3 GND VALUE={V(VCC,GND)}
B4 Y4 GND VALUE={V(VCC,GND)}
B5 Y5 GND VALUE={V(VCC,GND)}
B6 Y6 GND VALUE={V(VCC,GND)}
B7 Y7 GND VALUE={V(VCC,GND)}
B8 Y8 GND VALUE={V(VCC,GND)}
B9 Y9 GND VALUE={V(VCC,GND)}
.ends HC42_SUB`,

  HC238_SUB: `.subckt HC238_SUB A0 A1 A2 E1 E2 Y0 Y1 Y2 Y3 Y4 Y5 Y6 Y7 VCC GND
* 74HC238 3-to-8 decoder (active high outputs)
R_PWR VCC GND 100k
B0 Y0 GND VALUE={IF(V(E1,GND)>2.0 & V(E2,GND)<1.5 & V(A0,GND)<1.5 & V(A1,GND)<1.5 & V(A2,GND)<1.5, V(VCC,GND), 0)}
B1 Y1 GND VALUE={0}
B2 Y2 GND VALUE={0}
B3 Y3 GND VALUE={0}
B4 Y4 GND VALUE={0}
B5 Y5 GND VALUE={0}
B6 Y6 GND VALUE={0}
B7 Y7 GND VALUE={0}
.ends HC238_SUB`,

  HC73_SUB: `.subckt HC73_SUB CLK CLR J K Q QBAR VCC GND
* 74HC73 JK flip-flop
R_PWR VCC GND 100k
B_Q Q GND VALUE={IF(V(CLR,GND)<0.8, 0, V(J,GND))}
B_QB QBAR GND VALUE={IF(V(CLR,GND)<0.8, V(VCC,GND), V(VCC,GND)-V(J,GND))}
.ends HC73_SUB`,

  HC76_SUB: `.subckt HC76_SUB CLK PRE CLR J K Q QBAR VCC GND
* 74HC76 JK flip-flop with preset and clear
R_PWR VCC GND 100k
B_Q Q GND VALUE={IF(V(PRE,GND)<0.8, V(VCC,GND), IF(V(CLR,GND)<0.8, 0, V(J,GND)))}
B_QB QBAR GND VALUE={IF(V(CLR,GND)<0.8, V(VCC,GND), IF(V(PRE,GND)<0.8, 0, V(VCC,GND)-V(J,GND)))}
.ends HC76_SUB`,

  HC174_SUB: `.subckt HC174_SUB MR CP D0 D1 D2 D3 D4 D5 Q0 Q1 Q2 Q3 Q4 Q5 VCC GND
* 74HC174 hex D-FF stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D0,GND))}
B1 Q1 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D1,GND))}
B2 Q2 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D2,GND))}
B3 Q3 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D3,GND))}
B4 Q4 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D4,GND))}
B5 Q5 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D5,GND))}
.ends HC174_SUB`,

  HC175_SUB: `.subckt HC175_SUB MR CP D0 D1 D2 D3 Q0 Q0B Q1 Q1B VCC GND
* 74HC175 quad D-FF stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D0,GND))}
B0B Q0B GND VALUE={IF(V(MR,GND)<0.8, V(VCC,GND), V(VCC,GND)-V(D0,GND))}
B1 Q1 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D1,GND))}
B1B Q1B GND VALUE={IF(V(MR,GND)<0.8, V(VCC,GND), V(VCC,GND)-V(D1,GND))}
.ends HC175_SUB`,

  HC273_SUB: `.subckt HC273_SUB MR CP D0 D1 D2 D3 D4 D5 D6 D7 Q0 Q1 Q2 Q3 Q4 Q5 VCC GND
* 74HC273 octal D-FF stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D0,GND))}
B1 Q1 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D1,GND))}
B2 Q2 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D2,GND))}
B3 Q3 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D3,GND))}
B4 Q4 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D4,GND))}
B5 Q5 GND VALUE={IF(V(MR,GND)<0.8, 0, V(D5,GND))}
.ends HC273_SUB`,

  HC373_SUB: `.subckt HC373_SUB OE LE D0 D1 D2 D3 D4 D5 Q0 Q1 Q2 Q3 Q4 VCC GND
* 74HC373 octal transparent latch stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(OE,GND)<0.8, V(D0,GND), 0)}
B1 Q1 GND VALUE={IF(V(OE,GND)<0.8, V(D1,GND), 0)}
B2 Q2 GND VALUE={IF(V(OE,GND)<0.8, V(D2,GND), 0)}
B3 Q3 GND VALUE={IF(V(OE,GND)<0.8, V(D3,GND), 0)}
B4 Q4 GND VALUE={IF(V(OE,GND)<0.8, V(D4,GND), 0)}
.ends HC373_SUB`,

  HC574_SUB: `.subckt HC574_SUB OE CP D0 D1 D2 D3 D4 D5 Q0 Q1 Q2 Q3 Q4 VCC GND
* 74HC574 octal D-FF stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(OE,GND)<0.8, V(D0,GND), 0)}
B1 Q1 GND VALUE={IF(V(OE,GND)<0.8, V(D1,GND), 0)}
B2 Q2 GND VALUE={IF(V(OE,GND)<0.8, V(D2,GND), 0)}
B3 Q3 GND VALUE={IF(V(OE,GND)<0.8, V(D3,GND), 0)}
B4 Q4 GND VALUE={IF(V(OE,GND)<0.8, V(D4,GND), 0)}
.ends HC574_SUB`,

  HC93_SUB: `.subckt HC93_SUB CP0 CP1 MR1 MR2 Q0 Q1 Q2 Q3 VCC GND
* 74HC93 4-bit binary counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR1,GND)>2.0 & V(MR2,GND)>2.0, 0, 0)}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
.ends HC93_SUB`,

  HC160_SUB: `.subckt HC160_SUB CP MR PE CEP CET D0 Q0 Q1 Q2 Q3 TC VCC GND
* 74HC160 sync BCD counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, 0)}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
B_TC TC GND VALUE={0}
.ends HC160_SUB`,

  HC161_SUB: `.subckt HC161_SUB CP MR PE CEP CET D0 Q0 Q1 Q2 Q3 TC VCC GND
* 74HC161 sync binary counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, 0)}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
B_TC TC GND VALUE={0}
.ends HC161_SUB`,

  HC163_SUB: `.subckt HC163_SUB CP SR PE CEP CET D0 Q0 Q1 Q2 Q3 TC VCC GND
* 74HC163 sync binary counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={0}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
B_TC TC GND VALUE={0}
.ends HC163_SUB`,

  HC166_SUB: `.subckt HC166_SUB CP CE PE MR DS D0 Q7 VCC GND
* 74HC166 8-bit PISO shift register stub
R_PWR VCC GND 100k
B_Q7 Q7 GND VALUE={IF(V(MR,GND)<0.8, 0, V(DS,GND))}
.ends HC166_SUB`,

  HC191_SUB: `.subckt HC191_SUB CP UD CE PL D0 Q0 Q1 Q2 Q3 TC VCC GND
* 74HC191 sync up/down counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(PL,GND)<0.8, V(D0,GND), 0)}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
B_TC TC GND VALUE={0}
.ends HC191_SUB`,

  HC192_SUB: `.subckt HC192_SUB CPU CPD MR PL D0 Q0 Q1 Q2 Q3 TCU TCD VCC GND
* 74HC192 sync BCD up/down counter stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)>2.0, 0, IF(V(PL,GND)<0.8, V(D0,GND), 0))}
B1 Q1 GND VALUE={0}
B2 Q2 GND VALUE={0}
B3 Q3 GND VALUE={0}
B_TCU TCU GND VALUE={V(VCC,GND)}
B_TCD TCD GND VALUE={V(VCC,GND)}
.ends HC192_SUB`,

  HC299_SUB: `.subckt HC299_SUB CP MR S0 S1 OE1 OE2 Q0 Q7 VCC GND
* 74HC299 universal shift register stub
R_PWR VCC GND 100k
B0 Q0 GND VALUE={IF(V(MR,GND)<0.8, 0, 0)}
B7 Q7 GND VALUE={0}
.ends HC299_SUB`,

  HC181_SUB: `.subckt HC181_SUB A0 A1 A2 A3 B0 B1 B2 B3 M F0 F1 F2 F3 AEQB VCC GND
* 74HC181 4-bit ALU model (logic AND/OR mode demo)
R_PWR VCC GND 100k
B0 F0 GND VALUE={IF(V(M,GND)>2.0, V(A0,GND)*V(B0,GND)/V(VCC,GND), V(A0,GND))}
B1 F1 GND VALUE={IF(V(M,GND)>2.0, V(A1,GND)*V(B1,GND)/V(VCC,GND), V(A1,GND))}
B2 F2 GND VALUE={IF(V(M,GND)>2.0, V(A2,GND)*V(B2,GND)/V(VCC,GND), V(A2,GND))}
B3 F3 GND VALUE={IF(V(M,GND)>2.0, V(A3,GND)*V(B3,GND)/V(VCC,GND), V(A3,GND))}
B_AEQB AEQB GND VALUE={V(VCC,GND)}
.ends HC181_SUB`,

  HC280_SUB: `.subckt HC280_SUB I0 I1 I2 I3 I4 I5 I6 I7 PEVEN PODD VCC GND
* 74HC280 9-bit parity generator model
R_PWR VCC GND 100k
B_EVEN PEVEN GND VALUE={V(VCC,GND)}
B_ODD  PODD  GND VALUE={0}
.ends HC280_SUB`,

  HC688_SUB: `.subckt HC688_SUB G P0 P1 Q0 Q1 PEQ VCC GND
* 74HC688 8-bit identity comparator
R_PWR VCC GND 100k
B_PEQ PEQ GND VALUE={IF(V(G,GND)<0.8 & V(P0,GND)==V(Q0,GND) & V(P1,GND)==V(Q1,GND), 0, V(VCC,GND))}
.ends HC688_SUB`,

  HC126_SUB: `.subckt HC126_SUB A OE Y VCC GND
* 74HC126 quad 3-state buffer (active-high OE)
B_OUT Y GND VALUE={IF(V(OE,GND)>2.0, V(A,GND), 0)}
R_PWR VCC GND 100k
.ends HC126_SUB`,

  HC541_SUB: `.subckt HC541_SUB OE1 OE2 A0 A1 A2 A3 Y0 Y1 Y2 Y3 VCC GND
* 74HC541 octal buffer stub
R_PWR VCC GND 100k
B0 Y0 GND VALUE={IF(V(OE1,GND)<0.8 & V(OE2,GND)<0.8, V(A0,GND), 0)}
B1 Y1 GND VALUE={IF(V(OE1,GND)<0.8 & V(OE2,GND)<0.8, V(A1,GND), 0)}
B2 Y2 GND VALUE={IF(V(OE1,GND)<0.8 & V(OE2,GND)<0.8, V(A2,GND), 0)}
B3 Y3 GND VALUE={IF(V(OE1,GND)<0.8 & V(OE2,GND)<0.8, V(A3,GND), 0)}
.ends HC541_SUB`,

  CD4001_SUB: `.subckt CD4001_SUB A B Y VDD VSS
* CD4001 CMOS quad 2-input NOR gate
B_OUT Y VSS VALUE={IF(V(A,VSS)<0.3*V(VDD,VSS) & V(B,VSS)<0.3*V(VDD,VSS), V(VDD,VSS), 0)}
R_PWR VDD VSS 100k
.ends CD4001_SUB`,

  CD4011_SUB: `.subckt CD4011_SUB A B Y VDD VSS
* CD4011 CMOS quad 2-input NAND gate
B_OUT Y VSS VALUE={IF(V(A,VSS)>0.7*V(VDD,VSS) & V(B,VSS)>0.7*V(VDD,VSS), 0, V(VDD,VSS))}
R_PWR VDD VSS 100k
.ends CD4011_SUB`,

  CD4012_SUB: `.subckt CD4012_SUB A B C D Y VDD VSS
* CD4012 CMOS dual 4-input NAND gate
B_OUT Y VSS VALUE={IF(V(A,VSS)>0.7*V(VDD,VSS) & V(B,VSS)>0.7*V(VDD,VSS) & V(C,VSS)>0.7*V(VDD,VSS) & V(D,VSS)>0.7*V(VDD,VSS), 0, V(VDD,VSS))}
R_PWR VDD VSS 100k
.ends CD4012_SUB`,

  CD4023_SUB: `.subckt CD4023_SUB A B C Y VDD VSS
* CD4023 CMOS triple 3-input NAND gate
B_OUT Y VSS VALUE={IF(V(A,VSS)>0.7*V(VDD,VSS) & V(B,VSS)>0.7*V(VDD,VSS) & V(C,VSS)>0.7*V(VDD,VSS), 0, V(VDD,VSS))}
R_PWR VDD VSS 100k
.ends CD4023_SUB`,

  CD4027_SUB: `.subckt CD4027_SUB J CLK K SET RST Q QBAR VDD VSS
* CD4027 CMOS dual JK flip-flop
R_PWR VDD VSS 100k
B_Q Q VSS VALUE={IF(V(SET,VSS)>0.7*V(VDD,VSS), V(VDD,VSS), IF(V(RST,VSS)>0.7*V(VDD,VSS), 0, V(J,VSS)))}
B_QB QBAR VSS VALUE={IF(V(RST,VSS)>0.7*V(VDD,VSS), V(VDD,VSS), IF(V(SET,VSS)>0.7*V(VDD,VSS), 0, V(VDD,VSS)-V(J,VSS)))}
.ends CD4027_SUB`,

  CD4028_SUB: `.subckt CD4028_SUB A B C D Y0 Y1 Y2 Y3 Y4 Y5 Y6 Y7 Y8 Y9 VDD VSS
* CD4028 CMOS BCD-to-decimal decoder
R_PWR VDD VSS 100k
B0 Y0 VSS VALUE={IF(V(A,VSS)<1.5 & V(B,VSS)<1.5 & V(C,VSS)<1.5 & V(D,VSS)<1.5, V(VDD,VSS), 0)}
B1 Y1 VSS VALUE={0}
B2 Y2 VSS VALUE={0}
B3 Y3 VSS VALUE={0}
B4 Y4 VSS VALUE={0}
B5 Y5 VSS VALUE={0}
B6 Y6 VSS VALUE={0}
B7 Y7 VSS VALUE={0}
B8 Y8 VSS VALUE={0}
B9 Y9 VSS VALUE={0}
.ends CD4028_SUB`,

  ADC0804_SUB: `* ADC0804 8-Bit SAR ADC Model
.subckt ADC0804_SUB cs rd wr clk vinp vinm vref db7 db6 db5 db4 db3 db2 db1 db0 vcc gnd
R_in vinp vinm 10Meg
E_diff diff 0 vinp vinm 1.0
B_d7 db7 gnd V = (V(diff) >= 2.5) ? 5 : 0
B_d6 db6 gnd V = (mod(V(diff), 2.5) >= 1.25) ? 5 : 0
B_d5 db5 gnd V = (mod(V(diff), 1.25) >= 0.625) ? 5 : 0
B_d4 db4 gnd V = (mod(V(diff), 0.625) >= 0.312) ? 5 : 0
B_d3 db3 gnd V = (mod(V(diff), 0.312) >= 0.156) ? 5 : 0
B_d2 db2 gnd V = (mod(V(diff), 0.156) >= 0.078) ? 5 : 0
B_d1 db1 gnd V = (mod(V(diff), 0.078) >= 0.039) ? 5 : 0
B_d0 db0 gnd V = (mod(V(diff), 0.039) >= 0.019) ? 5 : 0
R_cs cs gnd 1Meg
R_rd rd gnd 1Meg
R_wr wr gnd 1Meg
R_clk clk gnd 1Meg
R_ref vref gnd 100k
R_pwr vcc gnd 10Meg
.ends ADC0804_SUB`,

  ADC0808_SUB: `* ADC0808 8-Channel 8-Bit ADC Model
.subckt ADC0808_SUB in0 in1 in2 in3 ale start oe eoc db7 db6 db5 db4 db3 db2 db1 db0 vcc gnd
R_in0 in0 gnd 10Meg
R_in1 in1 gnd 10Meg
R_in2 in2 gnd 10Meg
R_in3 in3 gnd 10Meg
B_eoc eoc gnd V = 5.0
B_d7 db7 gnd V = (V(in0) >= 2.5) ? 5 : 0
B_d6 db6 gnd V = (mod(V(in0), 2.5) >= 1.25) ? 5 : 0
B_d5 db5 gnd V = (mod(V(in0), 1.25) >= 0.625) ? 5 : 0
B_d4 db4 gnd V = (mod(V(in0), 0.625) >= 0.312) ? 5 : 0
B_d3 db3 gnd V = (mod(V(in0), 0.312) >= 0.156) ? 5 : 0
B_d2 db2 gnd V = (mod(V(in0), 0.156) >= 0.078) ? 5 : 0
B_d1 db1 gnd V = (mod(V(in0), 0.078) >= 0.039) ? 5 : 0
B_d0 db0 gnd V = (mod(V(in0), 0.039) >= 0.019) ? 5 : 0
R_ale ale gnd 1Meg
R_start start gnd 1Meg
R_oe oe gnd 1Meg
R_pwr vcc gnd 10Meg
.ends ADC0808_SUB`,

  ADS1015_SUB: `* ADS1015 12-Bit I2C ADC Model
.subckt ADS1015_SUB a0 a1 a2 a3 addr sda scl alrt vdd gnd
R_a0 a0 gnd 10Meg
R_a1 a1 gnd 10Meg
R_a2 a2 gnd 10Meg
R_a3 a3 gnd 10Meg
R_addr addr gnd 1Meg
R_sda sda gnd 100k
R_scl scl gnd 100k
B_alrt alrt gnd V = 5.0
R_pwr vdd gnd 10Meg
.ends ADS1015_SUB`,

  MCP3204_SUB: `* MCP3204 4-Channel 12-Bit SPI ADC Model
.subckt MCP3204_SUB ch0 ch1 ch2 ch3 vref cs din dout clk vdd vss
R_ch0 ch0 vss 10Meg
R_ch1 ch1 vss 10Meg
R_ch2 ch2 vss 10Meg
R_ch3 ch3 vss 10Meg
R_ref vref vss 100k
R_cs cs vss 1Meg
R_din din vss 1Meg
R_clk clk vss 1Meg
B_dout dout vss V = (V(cs) < 1.0) ? ((V(ch0) > 1.0) ? 5.0 : 0.0) : 0.0
R_pwr vdd vss 10Meg
.ends MCP3204_SUB`,

  MAX127_SUB: `* MAX127 12-Bit I2C ADC Model
.subckt MAX127_SUB ch0 ch1 ch2 ch3 vref sda scl vdd gnd
R_ch0 ch0 gnd 10Meg
R_ch1 ch1 gnd 10Meg
R_ch2 ch2 gnd 10Meg
R_ch3 ch3 gnd 10Meg
R_ref vref gnd 100k
R_sda sda gnd 100k
R_scl scl gnd 100k
R_pwr vdd gnd 10Meg
.ends MAX127_SUB`,

  LTC1864_SUB: `* LTC1864 16-Bit SPI ADC Model
.subckt LTC1864_SUB vinp vinm vref conv sck sdo vcc gnd
R_in vinp vinm 10Meg
R_ref vref gnd 100k
R_conv conv gnd 1Meg
R_sck sck gnd 1Meg
B_sdo sdo gnd V = (V(vinp) > V(vinm)) ? 5.0 : 0.0
R_pwr vcc gnd 10Meg
.ends LTC1864_SUB`,

  MCP4822_SUB: `* MCP4822 Dual 12-Bit SPI DAC Model
.subckt MCP4822_SUB cs sck sdi ldac vouta voutb vdd vss
R_cs cs vss 1Meg
R_sck sck vss 1Meg
R_sdi sdi vss 1Meg
R_ldac ldac vss 1Meg
B_outa vouta vss V = 2.048
B_outb voutb vss V = 2.048
R_pwr vdd vss 10Meg
.ends MCP4822_SUB`,

  MCP4921_SUB: `* MCP4921 12-Bit SPI DAC Model
.subckt MCP4921_SUB cs sck sdi ldac vref vout vdd vss
R_cs cs vss 1Meg
R_sck sck vss 1Meg
R_sdi sdi vss 1Meg
R_ldac ldac vss 1Meg
R_ref vref vss 100k
B_out vout vss V = 0.5 * V(vref)
R_pwr vdd vss 10Meg
.ends MCP4921_SUB`,

  DAC0800_SUB: `* DAC0800 8-Bit DAC Model
.subckt DAC0800_SUB d7 d6 d5 d4 d3 d2 d1 d0 iout ioutb vrefp vrefm vcc vee
R_d7 d7 0 1Meg
R_d6 d6 0 1Meg
R_d5 d5 0 1Meg
R_d4 d4 0 1Meg
R_d3 d3 0 1Meg
R_d2 d2 0 1Meg
R_d1 d1 0 1Meg
R_d0 d0 0 1Meg
R_ref vrefp vrefm 10k
B_iout iout 0 I = 0.002 * (V(d7)/5.0 * 0.5 + V(d6)/5.0 * 0.25 + 0.1)
B_ioutb ioutb 0 I = 0.002 * (1.0 - (V(d7)/5.0 * 0.5 + V(d6)/5.0 * 0.25 + 0.1))
R_pwr vcc vee 10Meg
.ends DAC0800_SUB`,

  PCF8591_SUB: `* PCF8591 ADC/DAC I2C Model
.subckt PCF8591_SUB ain0 ain1 ain2 ain3 aout sda scl osc vdd vss
R_ain0 ain0 vss 10Meg
R_ain1 ain1 vss 10Meg
R_ain2 ain2 vss 10Meg
R_ain3 ain3 vss 10Meg
B_aout aout vss V = 2.5
R_sda sda vss 100k
R_scl scl vss 100k
R_osc osc vss 1Meg
R_pwr vdd vss 10Meg
.ends PCF8591_SUB`,

  MAX1487_SUB: `* MAX1487 Half-Duplex RS-485 Model
.subckt MAX1487_SUB ro re de di a b vcc gnd
R_re re gnd 1Meg
R_de de gnd 1Meg
R_di di gnd 1Meg
B_diff a b V = (V(de) > 2.0) ? ((V(di) > 2.0) ? 3.3 : -3.3) : 0.0
B_ro ro gnd V = (V(re) < 0.8) ? ((V(a) > V(b)) ? 5.0 : 0.0) : 0.0
R_pwr vcc gnd 10Meg
.ends MAX1487_SUB`,

  SN75176_SUB: `* SN75176 RS-485 Transceiver Model
.subckt SN75176_SUB r re de d a b vcc gnd
R_re re gnd 1Meg
R_de de gnd 1Meg
R_d d gnd 1Meg
B_diff a b V = (V(de) > 2.0) ? ((V(d) > 2.0) ? 3.3 : -3.3) : 0.0
B_r r gnd V = (V(re) < 0.8) ? ((V(a) > V(b)) ? 5.0 : 0.0) : 0.0
R_pwr vcc gnd 10Meg
.ends SN75176_SUB`,

  MAX3232_SUB: `* MAX3232 Dual RS-232 Transceiver Model
.subckt MAX3232_SUB t1in r1out t2in r2out c1p c1m t1out r1in t2out r2in c2p c2m vp vm vcc gnd
R_t1in t1in gnd 1Meg
R_t2in t2in gnd 1Meg
B_t1out t1out gnd V = (V(t1in) > 2.0) ? -6.0 : 6.0
B_t2out t2out gnd V = (V(t2in) > 2.0) ? -6.0 : 6.0
B_r1out r1out gnd V = (V(r1in) < 0.0) ? 5.0 : 0.0
B_r2out r2out gnd V = (V(r2in) < 0.0) ? 5.0 : 0.0
R_c1 c1p c1m 1Meg
R_c2 c2p c2m 1Meg
B_vp vp gnd V = 6.0
B_vm vm gnd V = -6.0
R_pwr vcc gnd 10Meg
.ends MAX3232_SUB`,

  MCP2515_SUB: `* MCP2515 CAN Controller SPI Model
.subckt MCP2515_SUB cs si sck osc1 osc2 so int txcan rxcan vdd vss
R_cs cs vss 1Meg
R_si si vss 1Meg
R_sck sck vss 1Meg
R_osc osc1 osc2 1Meg
B_so so vss V = (V(cs) < 1.0) ? ((V(si) > 2.0) ? 5.0 : 0.0) : 0.0
B_int int vss V = 5.0
B_txcan txcan vss V = (V(si) > 2.0) ? 5.0 : 0.0
R_rxcan rxcan vss 1Meg
R_pwr vdd vss 10Meg
.ends MCP2515_SUB`,

  TJA1050_SUB: `* TJA1050 High-Speed CAN Transceiver Model
.subckt TJA1050_SUB txd rxd s canh canl vref vcc gnd
R_txd txd gnd 1Meg
R_s s gnd 1Meg
B_canh canh gnd V = (V(txd) < 0.8) ? 3.5 : 2.5
B_canl canl gnd V = (V(txd) < 0.8) ? 1.5 : 2.5
B_rxd rxd gnd V = (V(canh) - V(canl) > 0.9) ? 0.0 : 5.0
B_vref vref gnd V = 2.5
R_pwr vcc gnd 10Meg
.ends TJA1050_SUB`,

  CH340G_SUB: `* CH340G USB to Serial Bridge Model
.subckt CH340G_SUB udp udm xi xo txd rxd dtr rts cts vcc gnd
R_udp udp gnd 1Meg
R_udm udm gnd 1Meg
R_xi xi xo 1Meg
B_txd txd gnd V = 5.0
R_rxd rxd gnd 1Meg
B_dtr dtr gnd V = 5.0
B_rts rts gnd V = 5.0
R_cts cts gnd 1Meg
R_pwr vcc gnd 10Meg
.ends CH340G_SUB`,

  FT232RL_SUB: `* FT232RL USB to Serial UART Model
.subckt FT232RL_SUB usbdm usbdp cbus0 cbus1 txd rxd rts cts dtr dsr vcc gnd
R_dm usbdm gnd 1Meg
R_dp usbdp gnd 1Meg
B_cb0 cbus0 gnd V = 0.0
B_cb1 cbus1 gnd V = 0.0
B_txd txd gnd V = 5.0
R_rxd rxd gnd 1Meg
B_rts rts gnd V = 5.0
R_cts cts gnd 1Meg
B_dtr dtr gnd V = 5.0
R_dsr dsr gnd 1Meg
R_pwr vcc gnd 10Meg
.ends FT232RL_SUB`,

  CP2102_SUB: `* CP2102 USB to UART Bridge Model
.subckt CP2102_SUB dp dm susp txd rxd rts cts dtr vdd gnd
R_dp dp gnd 1Meg
R_dm dm gnd 1Meg
B_susp susp gnd V = 0.0
B_txd txd gnd V = 3.3
R_rxd rxd gnd 1Meg
B_rts rts gnd V = 3.3
R_cts cts gnd 1Meg
B_dtr dtr gnd V = 3.3
R_pwr vdd gnd 10Meg
.ends CP2102_SUB`,

  TXB0108_SUB: `* TXB0108 8-Bit Level Translator Model
.subckt TXB0108_SUB oe a1 a2 a3 a4 a5 a6 a7 a8 b1 b2 b3 b4 b5 b6 b7 b8 vcca vccb gnd
R_oe oe gnd 1Meg
B_b1 b1 gnd V = (V(oe) > 1.0) ? (V(a1)/3.3 * 5.0) : 0.0
B_b2 b2 gnd V = (V(oe) > 1.0) ? (V(a2)/3.3 * 5.0) : 0.0
B_b3 b3 gnd V = (V(oe) > 1.0) ? (V(a3)/3.3 * 5.0) : 0.0
B_b4 b4 gnd V = (V(oe) > 1.0) ? (V(a4)/3.3 * 5.0) : 0.0
B_b5 b5 gnd V = (V(oe) > 1.0) ? (V(a5)/3.3 * 5.0) : 0.0
B_b6 b6 gnd V = (V(oe) > 1.0) ? (V(a6)/3.3 * 5.0) : 0.0
B_b7 b7 gnd V = (V(oe) > 1.0) ? (V(a7)/3.3 * 5.0) : 0.0
B_b8 b8 gnd V = (V(oe) > 1.0) ? (V(a8)/3.3 * 5.0) : 0.0
R_pa vcca gnd 10Meg
R_pb vccb gnd 10Meg
.ends TXB0108_SUB`,

  PCA9306_SUB: `* PCA9306 Dual I2C Level Translator Model
.subckt PCA9306_SUB scl1 sda1 vref1 scl2 sda2 vref2 en gnd
R_en en gnd 1Meg
R_scl1 scl1 scl2 10
R_sda1 sda1 sda2 10
R_vr1 vref1 gnd 100k
R_vr2 vref2 gnd 100k
.ends PCA9306_SUB`,

  TM1637_SUB: `* TM1637 LED Display Driver Model
.subckt TM1637_SUB clk dio s1 s2 s3 s4 s5 s6 s7 s8 g1 g2 g3 g4 vcc gnd
R_clk clk gnd 1Meg
R_dio dio gnd 1Meg
B_g1 g1 gnd V = 0.0
B_g2 g2 gnd V = 0.0
B_g3 g3 gnd V = 0.0
B_g4 g4 gnd V = 0.0
B_s1 s1 gnd V = 5.0
B_s2 s2 gnd V = 5.0
B_s3 s3 gnd V = 5.0
B_s4 s4 gnd V = 5.0
B_s5 s5 gnd V = 5.0
B_s6 s6 gnd V = 5.0
B_s7 s7 gnd V = 5.0
B_s8 s8 gnd V = 5.0
R_pwr vcc gnd 10Meg
.ends TM1637_SUB`,

  HT16K33_SUB: `* HT16K33 LED Driver Model
.subckt HT16K33_SUB scl sda a0 a1 a2 r0 r1 r2 r3 c0 c1 c2 c3 vdd vss
R_scl scl vss 100k
R_sda sda vss 100k
R_a0 a0 vss 1Meg
R_a1 a1 vss 1Meg
R_a2 a2 vss 1Meg
B_c0 c0 vss V = 5.0
B_c1 c1 vss V = 5.0
B_c2 c2 vss V = 5.0
B_c3 c3 vss V = 5.0
B_r0 r0 vss V = 0.0
B_r1 r1 vss V = 0.0
B_r2 r2 vss V = 0.0
B_r3 r3 vss V = 0.0
R_pwr vdd vss 10Meg
.ends HT16K33_SUB`,

  PCF8575_SUB: `* PCF8575 16-Bit I2C Expander Model
.subckt PCF8575_SUB sda scl int a0 a1 a2 p0 p1 p2 p3 p4 p5 p6 p7 p10 p11 vdd vss
R_sda sda vss 100k
R_scl scl vss 100k
B_int int vss V = 5.0
R_a0 a0 vss 1Meg
R_a1 a1 vss 1Meg
R_a2 a2 vss 1Meg
B_p0 p0 vss V = 5.0
B_p1 p1 vss V = 5.0
B_p2 p2 vss V = 5.0
B_p3 p3 vss V = 5.0
B_p4 p4 vss V = 5.0
B_p5 p5 vss V = 5.0
B_p6 p6 vss V = 5.0
B_p7 p7 vss V = 5.0
B_p10 p10 vss V = 5.0
B_p11 p11 vss V = 5.0
R_pwr vdd vss 10Meg
.ends PCF8575_SUB`,

  MCP23017_SUB: `* MCP23017 16-Bit I2C Expander Model
.subckt MCP23017_SUB sda scl inta intb reset a0 a1 a2 gpa0 gpa1 gpa2 gpa3 gpb0 gpb1 gpb2 gpb3 vdd vss
R_sda sda vss 100k
R_scl scl vss 100k
B_inta inta vss V = 5.0
B_intb intb vss V = 5.0
R_rst reset vss 1Meg
R_a0 a0 vss 1Meg
R_a1 a1 vss 1Meg
R_a2 a2 vss 1Meg
B_a0 gpa0 vss V = 5.0
B_a1 gpa1 vss V = 5.0
B_a2 gpa2 vss V = 5.0
B_a3 gpa3 vss V = 5.0
B_b0 gpb0 vss V = 5.0
B_b1 gpb1 vss V = 5.0
B_b2 gpb2 vss V = 5.0
B_b3 gpb3 vss V = 5.0
R_pwr vdd vss 10Meg
.ends MCP23017_SUB`,

  MCP23008_SUB: `* MCP23008 8-Bit I2C Expander Model
.subckt MCP23008_SUB scl sda a0 a1 a2 gp0 gp1 gp2 gp3 int vdd vss
R_scl scl vss 100k
R_sda sda vss 100k
R_a0 a0 vss 1Meg
R_a1 a1 vss 1Meg
R_a2 a2 vss 1Meg
B_g0 gp0 vss V = 5.0
B_g1 gp1 vss V = 5.0
B_g2 gp2 vss V = 5.0
B_g3 gp3 vss V = 5.0
B_int int vss V = 5.0
R_pwr vdd vss 10Meg
.ends MCP23008_SUB`,

  LM336_SUB: `* LM336 2.5V Precision Reference Diode Model
.subckt LM336_SUB cathode anode adj
D1 anode cathode D_REF_2V5
.model D_REF_2V5 D(Is=1e-14 Bv=2.49 Ibv=1m Rs=0.5)
R_adj adj cathode 100k
.ends LM336_SUB`,

  AD584_SUB: `* AD584 Precision Multi-Voltage Reference Model
.subckt AD584_SUB vin strobe vout bg gnd
R_in vin gnd 1Meg
R_st strobe gnd 1Meg
B_out vout gnd V = 10.0
B_bg bg gnd V = 1.215
.ends AD584_SUB`,

  REF192_SUB: `* REF192 Precision 2.5V Voltage Reference Model
.subckt REF192_SUB vin sleep vout temp gnd
R_in vin gnd 1Meg
R_sl sleep gnd 1Meg
B_out vout gnd V = 2.5
B_tmp temp gnd V = 0.6
.ends REF192_SUB`,

  MAX6126_SUB: `* MAX6126 Ultra-High Precision 2.048V Reference Model
.subckt MAX6126_SUB in trim out nr gnd
R_in in gnd 1Meg
R_tr trim gnd 1Meg
R_nr nr gnd 1Meg
B_out out gnd V = 2.048
.ends MAX6126_SUB`,

  AD736_SUB: `* AD736 True RMS-to-DC Converter Model
.subckt AD736_SUB vin cav fb vout com vp vn
R_in vin com 1Meg
R_cav cav com 1Meg
R_fb fb vout 1k
B_rms vout com V = sqrt((V(vin,com))*(V(vin,com)))
R_pwr vp vn 10Meg
.ends AD736_SUB`,

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

    // â”€â”€ Discrete Semiconductors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Additional Linear ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Common Discrete Diodes & Passives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Additional ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Fixed Voltage Regulators (78xx) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Sensors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'thermistor': {
      const resistance = comp.props?.resistance ?? 10000;
      const safeId = comp.id.replace(/[^a-zA-Z0-9]/g, '');
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `R${safeId} ${p1} ${p2} ${resistance}`,
        subckts: []
      };
    }

    // â”€â”€ Additional ICs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Isolation, Protection & Power â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'optocoupler_4n35': {
      const [a = '0', k = '0', c = '0', e = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${k} ${c} ${e} OC_4N35`,
        subckts: [SUBCKT_DEFINITIONS.OC_4N35]
      };
    }
    case 'varistor': {
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `X_${comp.id} ${p1} ${p2} VARISTOR`,
        subckts: [SUBCKT_DEFINITIONS.VARISTOR]
      };
    }
    case 'ic_lm2596': {
      const [vin = '0', vout = '0', fb = '0', on_off = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${vin} ${vout} ${fb} ${on_off} ${gnd} LM2596`,
        subckts: [SUBCKT_DEFINITIONS.LM2596]
      };
    }
    case 'ic_ir2110': {
      const [hin = '0', lin = '0', sd = '0', vdd = '0', ho = '0', vs = '0', vb = '0', lo = '0', vcc = '0', com = '0'] = nodes;
      return {
        line: `X_${comp.id} ${hin} ${lin} ${sd} ${vdd} ${ho} ${vs} ${vb} ${lo} ${vcc} ${com} IR2110`,
        subckts: [SUBCKT_DEFINITIONS.IR2110]
      };
    }
    case 'ic_acs712': {
      const [ip1 = '0', ip2 = '0', vout = '0', vcc = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${ip1} ${ip2} ${vout} ${vcc} ${gnd} ACS712`,
        subckts: [SUBCKT_DEFINITIONS.ACS712]
      };
    }
    case 'ic_lm567': {
      const [out = '0', vcc = '0', inp = '0', gnd = '0', tc1 = '0', tc2 = '0', timr = '0'] = nodes;
      return {
        line: `X_${comp.id} ${out} ${vcc} ${inp} ${gnd} ${tc1} ${tc2} ${timr} LM567`,
        subckts: [SUBCKT_DEFINITIONS.LM567]
      };
    }
    case 'ic_cd4051': {
      const [a = '0', b = '0', c = '0', inh = '0', z = '0', y0 = '0', y1 = '0', y2 = '0', y3 = '0', vdd = '0', vss = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${c} ${inh} ${z} ${y0} ${y1} ${y2} ${y3} ${vdd} ${vss} CD4051`,
        subckts: [SUBCKT_DEFINITIONS.CD4051]
      };
    }
    case 'ic_74hc32': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} HC32`,
        subckts: [SUBCKT_DEFINITIONS.HC32]
      };
    }
    case 'ic_tca9548': {
      const [sda = '0', scl = '0', rst = '0', sd0 = '0', sc0 = '0', sd1 = '0', sc1 = '0', vcc = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${sda} ${scl} ${rst} ${sd0} ${sc0} ${sd1} ${sc1} ${vcc} ${gnd} TCA9548`,
        subckts: [SUBCKT_DEFINITIONS.TCA9548]
      };
    }
    case 'ic_atmega328': {
      const [vcc = '0', gnd = '0', reset = '0', rxd = '0', txd = '0', mosi = '0', miso = '0', sck = '0', sda = '0', scl = '0'] = nodes;
      return {
        line: `X_${comp.id} ${vcc} ${gnd} ${reset} ${rxd} ${txd} ${mosi} ${miso} ${sck} ${sda} ${scl} ATMEGA328`,
        subckts: [SUBCKT_DEFINITIONS.ATMEGA328]
      };
    }

    case 'triac': {
      const [mt1 = '0', mt2 = '0', g = '0'] = nodes;
      return {
        line: `X_${comp.id} ${mt1} ${mt2} ${g} TRIAC`,
        subckts: [SUBCKT_DEFINITIONS.TRIAC]
      };
    }
    case 'diac': {
      const [a1 = '0', a2 = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a1} ${a2} DIAC`,
        subckts: [SUBCKT_DEFINITIONS.DIAC]
      };
    }
    case 'igbt_n': {
      const [g = '0', c = '0', e = '0'] = nodes;
      return {
        line: `X_${comp.id} ${g} ${c} ${e} IGBT_N`,
        subckts: [SUBCKT_DEFINITIONS.IGBT_N]
      };
    }
    case 'photo_resistor': {
      const [p1 = '0', p2 = '0'] = nodes;
      return {
        line: `X_${comp.id} ${p1} ${p2} PHOTO_RESISTOR`,
        subckts: [SUBCKT_DEFINITIONS.PHOTO_RESISTOR]
      };
    }
    case 'ic_lm311': {
      const [inp = '0', inn = '0', out = '0', vcc = '0', vee = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${inn} ${out} ${vcc} ${vee} ${gnd} LM311`,
        subckts: [SUBCKT_DEFINITIONS.LM311]
      };
    }
    case 'ic_l298n': {
      const [in1 = '0', in2 = '0', ena = '0', in3 = '0', in4 = '0', enb = '0', out1 = '0', out2 = '0', out3 = '0', out4 = '0', vcc = '0', vss = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${in1} ${in2} ${ena} ${in3} ${in4} ${enb} ${out1} ${out2} ${out3} ${out4} ${vcc} ${vss} ${gnd} L298N`,
        subckts: [SUBCKT_DEFINITIONS.L298N]
      };
    }
    case 'ic_74hc08': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} HC08`,
        subckts: [SUBCKT_DEFINITIONS.HC08]
      };
    }
    case 'ic_74hc00': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${y} ${gnd} HC00`,
        subckts: [SUBCKT_DEFINITIONS.HC00]
      };
    }
    case 'ic_ds18b20': {
      const [gnd = '0', dq = '0', vdd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${gnd} ${dq} ${vdd} DS18B20`,
        subckts: [SUBCKT_DEFINITIONS.DS18B20]
      };
    }
    case 'ic_sg3525': {
      const [inv = '0', ninv = '0', sync = '0', osc = '0', sd = '0', ss = '0', outa = '0', outb = '0', vcc = '0', gnd = '0', vref = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inv} ${ninv} ${sync} ${osc} ${sd} ${ss} ${outa} ${outb} ${vcc} ${gnd} ${vref} SG3525`,
        subckts: [SUBCKT_DEFINITIONS.SG3525]
      };
    }

    case 'tunnel_diode': {
      const [a = '0', k = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${k} TUNNEL_DIODE`,
        subckts: [SUBCKT_DEFINITIONS.TUNNEL_DIODE]
      };
    }
    case 'ic_74hc04': {
      const [a = '0', y = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${y} ${gnd} HC04`,
        subckts: [SUBCKT_DEFINITIONS.HC04]
      };
    }
    case 'ic_74hc138': {
      const [a = '0', b = '0', c = '0', g1 = '0', g2a = '0', g2b = '0', y0 = '0', y1 = '0', y2 = '0', y3 = '0', y4 = '0', y5 = '0', y6 = '0', y7 = '0', vcc = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${a} ${b} ${c} ${g1} ${g2a} ${g2b} ${y0} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${vcc} ${gnd} HC138`,
        subckts: [SUBCKT_DEFINITIONS.HC138]
      };
    }
    case 'ic_74hc148': {
      const [i0 = '0', i1 = '0', i2 = '0', i3 = '0', i4 = '0', i5 = '0', i6 = '0', i7 = '0', ei = '0', a0 = '0', a1 = '0', a2 = '0', gs = '0', eo = '0', vcc = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${i0} ${i1} ${i2} ${i3} ${i4} ${i5} ${i6} ${i7} ${ei} ${a0} ${a1} ${a2} ${gs} ${eo} ${vcc} ${gnd} HC148`,
        subckts: [SUBCKT_DEFINITIONS.HC148]
      };
    }
    case 'ic_ne5534': {
      const [inp = '0', inn = '0', outp = '0', vcc = '0', vee = '0', compPin = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${inn} ${outp} ${vcc} ${vee} ${compPin} NE5534`,
        subckts: [SUBCKT_DEFINITIONS.NE5534]
      };
    }
    case 'ic_lm337': {
      const [inp = '0', out = '0', adj = '0'] = nodes;
      return {
        line: `X_${comp.id} ${inp} ${out} ${adj} LM337`,
        subckts: [SUBCKT_DEFINITIONS.LM337]
      };
    }
    case 'ic_max7219': {
      const [din = '0', clk = '0', cs = '0', dout = '0', vcc = '0', gnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${din} ${clk} ${cs} ${dout} ${vcc} ${gnd} MAX7219`,
        subckts: [SUBCKT_DEFINITIONS.MAX7219]
      };
    }
    case 'ic_cd4060': {
      const [osc1 = '0', osc2 = '0', rst = '0', q4 = '0', q5 = '0', q6 = '0', q7 = '0', q8 = '0', q9 = '0', q10 = '0', q14 = '0', vdd = '0', vss = '0'] = nodes;
      return {
        line: `X_${comp.id} ${osc1} ${osc2} ${rst} ${q4} ${q5} ${q6} ${q7} ${q8} ${q9} ${q10} ${q14} ${vdd} ${vss} CD4060`,
        subckts: [SUBCKT_DEFINITIONS.CD4060]
      };
    }
    case 'ic_mcp3208': {
      const [ch0 = '0', ch1 = '0', ch2 = '0', ch3 = '0', ch4 = '0', ch5 = '0', ch6 = '0', ch7 = '0', cs = '0', din = '0', dout = '0', clk = '0', vref = '0', vdd = '0', agnd = '0', dgnd = '0'] = nodes;
      return {
        line: `X_${comp.id} ${ch0} ${ch1} ${ch2} ${ch3} ${ch4} ${ch5} ${ch6} ${ch7} ${cs} ${din} ${dout} ${clk} ${vref} ${vdd} ${agnd} ${dgnd} MCP3208`,
        subckts: [SUBCKT_DEFINITIONS.MCP3208]
      };
    }

    case 'npn_darlington': {
      const [b = '0', c = '0', e = '0'] = nodes;
      return { line: `X_${comp.id} ${b} ${c} ${e} NPN_DARL`, subckts: [SUBCKT_DEFINITIONS.NPN_DARL] };
    }
    case 'pnp_darlington': {
      const [b = '0', c = '0', e = '0'] = nodes;
      return { line: `X_${comp.id} ${b} ${c} ${e} PNP_DARL`, subckts: [SUBCKT_DEFINITIONS.PNP_DARL] };
    }
    case 'ic_lm35': {
      const [vcc = '0', outp = '0', gnd = '0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${outp} ${gnd} LM35`, subckts: [SUBCKT_DEFINITIONS.LM35] };
    }
    case 'hall_sensor': {
      const [vcc = '0', gnd = '0', outp = '0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${gnd} ${outp} HALL_A3144`, subckts: [SUBCKT_DEFINITIONS.HALL_A3144] };
    }
    case 'ic_74hc573': {
      const [d0='0',d1='0',d2='0',d3='0',d4='0',d5='0',d6='0',d7='0',le='0',oe='0',q0='0',q1='0',q2='0',q3='0',q4='0',q5='0',q6='0',q7='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${d6} ${d7} ${le} ${oe} ${q0} ${q1} ${q2} ${q3} ${q4} ${q5} ${q6} ${q7} ${vcc} ${gnd} HC573`, subckts: [SUBCKT_DEFINITIONS.HC573] };
    }
    case 'ic_74hc165': {
      const [pl='0',clkp='0',ce='0',ser='0',ap='0',bp='0',cp='0',dp='0',ep='0',fp='0',gp='0',hp='0',qh='0',qhn='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${pl} ${clkp} ${ce} ${ser} ${ap} ${bp} ${cp} ${dp} ${ep} ${fp} ${gp} ${hp} ${qh} ${qhn} ${vcc} ${gnd} HC165`, subckts: [SUBCKT_DEFINITIONS.HC165] };
    }
    case 'ic_pcf8574': {
      const [sda='0',scl='0',a0='0',a1='0',a2='0',intn='0',p0='0',p1='0',p2='0',p3='0',p4='0',p5='0',p6='0',p7='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${sda} ${scl} ${a0} ${a1} ${a2} ${intn} ${p0} ${p1} ${p2} ${p3} ${p4} ${p5} ${p6} ${p7} ${vcc} ${gnd} PCF8574`, subckts: [SUBCKT_DEFINITIONS.PCF8574] };
    }
    case 'ic_esp8266': {
      const [tx='0',rx='0',rst='0',en='0',gpio0='0',gpio2='0',adc='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${tx} ${rx} ${rst} ${en} ${gpio0} ${gpio2} ${adc} ${vcc} ${gnd} ESP8266`, subckts: [SUBCKT_DEFINITIONS.ESP8266] };
    }
    case 'ic_74hc86': {
      const [a = '0', b = '0', y = '0', gnd = '0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${y} ${gnd} HC86`, subckts: [SUBCKT_DEFINITIONS.HC86] };
    }
    case 'ic_uc3842': {
      const [comp2='0',fb='0',isns='0',rt='0',gnd='0',outp='0',vcc='0',vref='0'] = nodes;
      return { line: `X_${comp.id} ${comp2} ${fb} ${isns} ${rt} ${gnd} ${outp} ${vcc} ${vref} UC3842`, subckts: [SUBCKT_DEFINITIONS.UC3842] };
    }

    case 'scr': {
      const [a='0',k='0',g='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${k} ${g} SCR`, subckts: [SUBCKT_DEFINITIONS.SCR] };
    }
    case 'jfet_n': {
      const [gp='0',d='0',s='0'] = nodes;
      return { line: `X_${comp.id} ${gp} ${d} ${s} JFET_N`, subckts: [SUBCKT_DEFINITIONS.JFET_N] };
    }
    case 'jfet_p': {
      const [gp='0',d='0',s='0'] = nodes;
      return { line: `X_${comp.id} ${gp} ${d} ${s} JFET_P`, subckts: [SUBCKT_DEFINITIONS.JFET_P] };
    }
    case 'ic_74hc244': {
      const [a1='0',a2='0',a3='0',a4='0',a5='0',a6='0',a7='0',a8='0',oe1='0',y1='0',y2='0',y3='0',y4='0',y5='0',y6='0',y7='0',y8='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a1} ${a2} ${a3} ${a4} ${a5} ${a6} ${a7} ${a8} ${oe1} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${y8} ${vcc} ${gnd} HC244`, subckts: [SUBCKT_DEFINITIONS.HC244] };
    }
    case 'ic_74hc374': {
      const [d1='0',d2='0',d3='0',d4='0',d5='0',d6='0',d7='0',d8='0',clk='0',oe='0',q1='0',q2='0',q3='0',q4='0',q5='0',q6='0',q7='0',q8='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${d1} ${d2} ${d3} ${d4} ${d5} ${d6} ${d7} ${d8} ${clk} ${oe} ${q1} ${q2} ${q3} ${q4} ${q5} ${q6} ${q7} ${q8} ${vcc} ${gnd} HC374`, subckts: [SUBCKT_DEFINITIONS.HC374] };
    }
    case 'ic_74hc151': {
      const [d0='0',d1='0',d2='0',d3='0',d4='0',d5='0',d6='0',d7='0',s0='0',s1='0',s2='0',en='0',y='0',w='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${d6} ${d7} ${s0} ${s1} ${s2} ${en} ${y} ${w} ${vcc} ${gnd} HC151`, subckts: [SUBCKT_DEFINITIONS.HC151] };
    }
    case 'ic_74hc283': {
      const [a1='0',a2='0',a3='0',a4='0',b1='0',b2='0',b3='0',b4='0',c0='0',s1='0',s2='0',s3='0',s4='0',c4='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a1} ${a2} ${a3} ${a4} ${b1} ${b2} ${b3} ${b4} ${c0} ${s1} ${s2} ${s3} ${s4} ${c4} ${vcc} ${gnd} HC283`, subckts: [SUBCKT_DEFINITIONS.HC283] };
    }
    case 'ic_mcp4725': {
      const [sda='0',scl='0',a0='0',vout='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${sda} ${scl} ${a0} ${vout} ${vcc} ${gnd} MCP4725`, subckts: [SUBCKT_DEFINITIONS.MCP4725] };
    }
    case 'ic_ina219': {
      const [inp='0',inn='0',sda='0',scl='0',a0='0',a1='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${inp} ${inn} ${sda} ${scl} ${a0} ${a1} ${vcc} ${gnd} INA219`, subckts: [SUBCKT_DEFINITIONS.INA219] };
    }
    case 'ic_nrf24l01': {
      const [ce='0',csn='0',sck='0',mosi='0',miso='0',irq='0',vcc='0',gnd='0'] = nodes;
      return { line: `X_${comp.id} ${ce} ${csn} ${sck} ${mosi} ${miso} ${irq} ${vcc} ${gnd} NRF24L01`, subckts: [SUBCKT_DEFINITIONS.NRF24L01] };
    }

    case 'ic_tl431': {
      const [a='0', k='0', r='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${k} ${r} TL431_SUB`, subckts: [SUBCKT_DEFINITIONS.TL431_SUB] };
    }
    case 'ic_max485': {
      const [ro='0', re='0', de='0', di='0', gnd='0', a='0', b='0', vcc='0'] = nodes;
      return { line: `X_${comp.id} ${ro} ${re} ${de} ${di} ${gnd} ${a} ${b} ${vcc} MAX485_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX485_SUB] };
    }
    case 'ic_si7021': {
      const [gnd='0', vdd='0', sda='0', scl='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${vdd} ${sda} ${scl} SI7021_SUB`, subckts: [SUBCKT_DEFINITIONS.SI7021_SUB] };
    }
    case 'ic_bmp280': {
      const [gnd='0', vdd='0', sda='0', scl='0', csb='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${vdd} ${sda} ${scl} ${csb} BMP280_SUB`, subckts: [SUBCKT_DEFINITIONS.BMP280_SUB] };
    }
    case 'ic_pca9685': {
      const [vcc='0', gnd='0', sda='0', scl='0', oe='0', vdd='0', p0='0', p1='0', p2='0', p3='0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${gnd} ${sda} ${scl} ${oe} ${vdd} ${p0} ${p1} ${p2} ${p3} PCA9685_SUB`, subckts: [SUBCKT_DEFINITIONS.PCA9685_SUB] };
    }
    case 'ic_ws2812': {
      const [vdd='0', gnd='0', din='0', dout='0'] = nodes;
      return { line: `X_${comp.id} ${vdd} ${gnd} ${din} ${dout} WS2812B_SUB`, subckts: [SUBCKT_DEFINITIONS.WS2812B_SUB] };
    }
    case 'ujt': {
      const [e='0', b1='0', b2='0'] = nodes;
      return { line: `X_${comp.id} ${e} ${b1} ${b2} UJT_SUB`, subckts: [SUBCKT_DEFINITIONS.UJT_SUB] };
    }
    case 'varactor': {
      const [anode='0', cathode='0'] = nodes;
      return { line: `X_${comp.id} ${anode} ${cathode} VARACTOR_SUB`, subckts: [SUBCKT_DEFINITIONS.VARACTOR_SUB] };
    }
    case 'ic_ne555_cmos': {
      const [gnd='0', trig='0', out='0', rst='0', vcc='0', disch='0', thr='0', ctrl='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${trig} ${out} ${rst} ${vcc} ${disch} ${thr} ${ctrl} TLC555_SUB`, subckts: [SUBCKT_DEFINITIONS.TLC555_SUB] };
    }
    case 'ic_74hc590': {
      const [qa='0', qb='0', qc='0', qd='0', qe='0', qf='0', qg='0', qh='0', rco='0', cclk='0', rclk='0', oe='0', mr='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${qa} ${qb} ${qc} ${qd} ${qe} ${qf} ${qg} ${qh} ${rco} ${cclk} ${rclk} ${oe} ${mr} ${vcc} ${gnd} HC590_SUB`, subckts: [SUBCKT_DEFINITIONS.HC590_SUB] };
    }
    case 'ic_ads1115': {
      const [vdd='0', gnd='0', scl='0', sda='0', addr='0', alrt='0', ain0='0', ain1='0'] = nodes;
      return { line: `X_${comp.id} ${vdd} ${gnd} ${scl} ${sda} ${addr} ${alrt} ${ain0} ${ain1} ADS1115_SUB`, subckts: [SUBCKT_DEFINITIONS.ADS1115_SUB] };
    }
    case 'ic_mpu6050': {
      const [vcc='0', gnd='0', scl='0', sda='0', ad0='0', intPin='0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${gnd} ${scl} ${sda} ${ad0} ${intPin} MPU6050_SUB`, subckts: [SUBCKT_DEFINITIONS.MPU6050_SUB] };
    }
    case 'ic_hc05': {
      const [vcc='0', gnd='0', txd='0', rxd='0', en='0', state='0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${gnd} ${txd} ${rxd} ${en} ${state} HC05_SUB`, subckts: [SUBCKT_DEFINITIONS.HC05_SUB] };
    }
    case 'ic_74hc21': {
      const [a1='0', b1='0', c1='0', d1='0', y1='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a1} ${b1} ${c1} ${d1} ${y1} ${vcc} ${gnd} HC21_SUB`, subckts: [SUBCKT_DEFINITIONS.HC21_SUB] };
    }
    case 'ic_lm2575': {
      const [vin='0', vout='0', gnd='0', fb='0', onb='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} ${fb} ${onb} LM2575_SUB`, subckts: [SUBCKT_DEFINITIONS.LM2575_SUB] };
    }
    case 'ic_tps61023': {
      const [vin='0', vout='0', gnd='0', en='0', fb='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} ${en} ${fb} TPS61023_SUB`, subckts: [SUBCKT_DEFINITIONS.TPS61023_SUB] };
    }
    case 'put': {
      const [anode='0', cathode='0', gate='0'] = nodes;
      return { line: `X_${comp.id} ${anode} ${cathode} ${gate} PUT_SUB`, subckts: [SUBCKT_DEFINITIONS.PUT_SUB] };
    }
    case 'ic_74hc30': {
      const [a='0', b='0', c='0', d='0', e='0', f='0', g='0', h='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${d} ${e} ${f} ${g} ${h} ${y} ${vcc} ${gnd} HC30_SUB`, subckts: [SUBCKT_DEFINITIONS.HC30_SUB] };
    }
    case 'ic_cd4040': {
      const [clk='0', rst='0', vdd='0', vss='0', q1='0', q2='0', q3='0', q4='0', q5='0', q6='0', q7='0', q8='0'] = nodes;
      return { line: `X_${comp.id} ${clk} ${rst} ${vdd} ${vss} ${q1} ${q2} ${q3} ${q4} ${q5} ${q6} ${q7} ${q8} CD4040_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4040_SUB] };
    }
    case 'ic_opa2134': {
      const [in1n='0', in1p='0', out1='0', in2p='0', in2n='0', out2='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${in1n} ${in1p} ${out1} ${in2p} ${in2n} ${out2} ${vcc} ${vee} OPA2134_SUB`, subckts: [SUBCKT_DEFINITIONS.OPA2134_SUB] };
    }
    case 'ic_cd4066': {
      const [in1='0', out1='0', ctl1='0', in2='0', out2='0', ctl2='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${in1} ${out1} ${ctl1} ${in2} ${out2} ${ctl2} ${vdd} ${vss} CD4066_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4066_SUB] };
    }
    case 'ic_74hc14': {
      const [a='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${y} ${vcc} ${gnd} HC14_SUB`, subckts: [SUBCKT_DEFINITIONS.HC14_SUB] };
    }
    case 'ic_74hc153': {
      const [i0='0', i1='0', i2='0', i3='0', s0='0', s1='0', e='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${i0} ${i1} ${i2} ${i3} ${s0} ${s1} ${e} ${y} ${vcc} ${gnd} HC153_SUB`, subckts: [SUBCKT_DEFINITIONS.HC153_SUB] };
    }
    case 'ic_ds1307': {
      const [x1='0', x2='0', vbat='0', gnd='0', sda='0', scl='0', sqw='0', vcc='0'] = nodes;
      return { line: `X_${comp.id} ${x1} ${x2} ${vbat} ${gnd} ${sda} ${scl} ${sqw} ${vcc} DS1307_SUB`, subckts: [SUBCKT_DEFINITIONS.DS1307_SUB] };
    }
    case 'ic_mcp3008': {
      const [ch0='0', ch1='0', ch2='0', ch3='0', ch4='0', ch5='0', vdd='0', vref='0', clk='0', dout='0', din='0', cs='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${ch0} ${ch1} ${ch2} ${ch3} ${ch4} ${ch5} ${vdd} ${vref} ${clk} ${dout} ${din} ${cs} ${gnd} MCP3008_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP3008_SUB] };
    }
    case 'ic_74hc164': {
      const [dsa='0', dsb='0', cp='0', clr='0', q0='0', q1='0', q2='0', q3='0', q4='0', q5='0', q6='0', q7='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${dsa} ${dsb} ${cp} ${clr} ${q0} ${q1} ${q2} ${q3} ${q4} ${q5} ${q6} ${q7} ${vcc} ${gnd} HC164_SUB`, subckts: [SUBCKT_DEFINITIONS.HC164_SUB] };
    }
    case 'ic_lm3914': {
      const [sig='0', rlo='0', rhi='0', mode='0', l1='0', l2='0', l3='0', l4='0', l5='0', l6='0', l7='0', l8='0', l9='0', l10='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${sig} ${rlo} ${rhi} ${mode} ${l1} ${l2} ${l3} ${l4} ${l5} ${l6} ${l7} ${l8} ${l9} ${l10} ${vcc} ${gnd} LM3914_SUB`, subckts: [SUBCKT_DEFINITIONS.LM3914_SUB] };
    }
    case 'ic_tda2030': {
      const [inp='0', inn='0', outp='0', vsp='0', vsn='0'] = nodes;
      return { line: `X_${comp.id} ${inp} ${inn} ${outp} ${vsp} ${vsn} TDA2030_SUB`, subckts: [SUBCKT_DEFINITIONS.TDA2030_SUB] };
    }
    case 'ic_dac0808': {
      const [a1='0', a2='0', a3='0', a4='0', a5='0', a6='0', a7='0', a8='0', iout='0', vrefp='0', vrefn='0', vcc='0', vee='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a1} ${a2} ${a3} ${a4} ${a5} ${a6} ${a7} ${a8} ${iout} ${vrefp} ${vrefn} ${vcc} ${vee} ${gnd} DAC0808_SUB`, subckts: [SUBCKT_DEFINITIONS.DAC0808_SUB] };
    }
    case 'phototransistor_npn': {
      const [c='0', e='0', b='0'] = nodes;
      return { line: `X_${comp.id} ${c} ${e} ${b} PHOTOTRANS_SUB`, subckts: [SUBCKT_DEFINITIONS.PHOTOTRANS_SUB] };
    }
    case 'ic_ne556': {
      const [dis1='0', thr1='0', cv1='0', rst1='0', trg1='0', out1='0', out2='0', trg2='0', rst2='0', cv2='0', thr2='0', dis2='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${dis1} ${thr1} ${cv1} ${rst1} ${trg1} ${out1} ${out2} ${trg2} ${rst2} ${cv2} ${thr2} ${dis2} ${vcc} ${gnd} NE556_SUB`, subckts: [SUBCKT_DEFINITIONS.NE556_SUB] };
    }
    case 'ic_lm339': {
      const [in1p='0', in1n='0', out1='0', in2p='0', in2n='0', out2='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${in1p} ${in1n} ${out1} ${in2p} ${in2n} ${out2} ${vcc} ${gnd} LM339_SUB`, subckts: [SUBCKT_DEFINITIONS.LM339_SUB] };
    }
    case 'ic_74hc85': {
      const [a0='0', a1='0', a2='0', a3='0', b0='0', b1='0', b2='0', b3='0', agt='0', aeq='0', alt='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a0} ${a1} ${a2} ${a3} ${b0} ${b1} ${b2} ${b3} ${agt} ${aeq} ${alt} ${vcc} ${gnd} HC85_SUB`, subckts: [SUBCKT_DEFINITIONS.HC85_SUB] };
    }
    case 'ic_74hc193': {
      const [cpu='0', cpd='0', mr='0', pl='0', p0='0', p1='0', p2='0', p3='0', q0='0', q1='0', q2='0', q3='0', tcu='0', tcd='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cpu} ${cpd} ${mr} ${pl} ${p0} ${p1} ${p2} ${p3} ${q0} ${q1} ${q2} ${q3} ${tcu} ${tcd} ${vcc} ${gnd} HC193_SUB`, subckts: [SUBCKT_DEFINITIONS.HC193_SUB] };
    }
    case 'ic_max6675': {
      const [gnd='0', t_neg='0', t_pos='0', vcc='0', sck='0', cs='0', so='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${t_neg} ${t_pos} ${vcc} ${sck} ${cs} ${so} MAX6675_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX6675_SUB] };
    }
    case 'ic_hx711': {
      const [avdd='0', inap='0', inan='0', inbp='0', inbn='0', agnd='0', vcc='0', dout='0', sck='0', dgnd='0'] = nodes;
      return { line: `X_${comp.id} ${avdd} ${inap} ${inan} ${inbp} ${inbn} ${agnd} ${vcc} ${dout} ${sck} ${dgnd} HX711_SUB`, subckts: [SUBCKT_DEFINITIONS.HX711_SUB] };
    }
    case 'ic_tda7294': {
      const [inp='0', inn='0', mute='0', outp='0', vsp='0', vsn='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${inp} ${inn} ${mute} ${outp} ${vsp} ${vsn} ${gnd} TDA7294_SUB`, subckts: [SUBCKT_DEFINITIONS.TDA7294_SUB] };
    }
    case 'ic_cd4013': {
      const [d1='0', clk1='0', set1='0', rst1='0', q1='0', q1_bar='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${d1} ${clk1} ${set1} ${rst1} ${q1} ${q1_bar} ${vdd} ${vss} CD4013_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4013_SUB] };
    }
    case 'ic_74hc125': {
      const [a='0', oe='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${oe} ${y} ${vcc} ${gnd} HC125_SUB`, subckts: [SUBCKT_DEFINITIONS.HC125_SUB] };
    }
    case 'photodiode_bpw34': {
      const [anode='0', cathode='0'] = nodes;
      return { line: `X_${comp.id} ${anode} ${cathode} BPW34_SUB`, subckts: [SUBCKT_DEFINITIONS.BPW34_SUB] };
    }
    case 'ic_tl082': {
      const [in1n='0', in1p='0', out1='0', in2p='0', in2n='0', out2='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${in1n} ${in1p} ${out1} ${in2p} ${in2n} ${out2} ${vcc} ${vee} TL082_SUB`, subckts: [SUBCKT_DEFINITIONS.TL082_SUB] };
    }
    case 'ic_tl084': {
      const [o1='0', i1n='0', i1p='0', vcc='0', i2p='0', i2n='0', o2='0', o3='0', i3n='0', i3p='0', vee='0', i4p='0', i4n='0', o4='0'] = nodes;
      return { line: `X_${comp.id} ${o1} ${i1n} ${i1p} ${vcc} ${i2p} ${i2n} ${o2} ${o3} ${i3n} ${i3p} ${vee} ${i4p} ${i4n} ${o4} TL084_SUB`, subckts: [SUBCKT_DEFINITIONS.TL084_SUB] };
    }
    case 'ic_lm833': {
      const [in1n='0', in1p='0', out1='0', in2p='0', in2n='0', out2='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${in1n} ${in1p} ${out1} ${in2p} ${in2n} ${out2} ${vcc} ${vee} LM833_SUB`, subckts: [SUBCKT_DEFINITIONS.LM833_SUB] };
    }
    case 'ic_op07': {
      const [inn='0', inp='0', outp='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${inn} ${inp} ${outp} ${vcc} ${vee} OP07_SUB`, subckts: [SUBCKT_DEFINITIONS.OP07_SUB] };
    }
    case 'ic_ca3140': {
      const [inn='0', inp='0', outp='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${inn} ${inp} ${outp} ${vcc} ${vee} CA3140_SUB`, subckts: [SUBCKT_DEFINITIONS.CA3140_SUB] };
    }
    case 'ic_lf353': {
      const [in1n='0', in1p='0', out1='0', in2p='0', in2n='0', out2='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${in1n} ${in1p} ${out1} ${in2p} ${in2n} ${out2} ${vcc} ${vee} LF353_SUB`, subckts: [SUBCKT_DEFINITIONS.LF353_SUB] };
    }
    case 'ic_ina128': {
      const [rg1='0', vinm='0', vinp='0', rg2='0', vee='0', ref='0', vout='0', vcc='0'] = nodes;
      return { line: `X_${comp.id} ${rg1} ${vinm} ${vinp} ${rg2} ${vee} ${ref} ${vout} ${vcc} INA128_SUB`, subckts: [SUBCKT_DEFINITIONS.INA128_SUB] };
    }
    case 'ic_ad623': {
      const [rg1='0', vinm='0', vinp='0', rg2='0', vee='0', ref='0', vout='0', vcc='0'] = nodes;
      return { line: `X_${comp.id} ${rg1} ${vinm} ${vinp} ${rg2} ${vee} ${ref} ${vout} ${vcc} AD623_SUB`, subckts: [SUBCKT_DEFINITIONS.AD623_SUB] };
    }
    case 'ic_lm385': {
      const [anode='0', cathode='0'] = nodes;
      return { line: `X_${comp.id} ${anode} ${cathode} LM385_SUB`, subckts: [SUBCKT_DEFINITIONS.LM385_SUB] };
    }
    case 'ic_ref02': {
      const [vin='0', gnd='0', vout='0', trim='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${gnd} ${vout} ${trim} REF02_SUB`, subckts: [SUBCKT_DEFINITIONS.REF02_SUB] };
    }
    case 'ic_78l05': {
      const [vin='0', vout='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} REG78L05_SUB`, subckts: [SUBCKT_DEFINITIONS.REG78L05_SUB] };
    }
    case 'ic_7809': {
      const [vin='0', vout='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} REG7809_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7809_SUB] };
    }
    case 'ic_7815': {
      const [vin='0', vout='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} REG7815_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7815_SUB] };
    }
    case 'ic_7824': {
      const [vin='0', vout='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} REG7824_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7824_SUB] };
    }
    case 'ic_7905': {
      const [gnd='0', vin='0', vout='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${vin} ${vout} REG7905_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7905_SUB] };
    }
    case 'ic_7912': {
      const [gnd='0', vin='0', vout='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${vin} ${vout} REG7912_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7912_SUB] };
    }
    case 'ic_7915': {
      const [gnd='0', vin='0', vout='0'] = nodes;
      return { line: `X_${comp.id} ${gnd} ${vin} ${vout} REG7915_SUB`, subckts: [SUBCKT_DEFINITIONS.REG7915_SUB] };
    }
    case 'ic_ams1117_adj': {
      const [adj='0', vin='0', vout='0'] = nodes;
      return { line: `X_${comp.id} ${adj} ${vin} ${vout} AMS1117_ADJ_SUB`, subckts: [SUBCKT_DEFINITIONS.AMS1117_ADJ_SUB] };
    }
    case 'ic_lp2950': {
      const [vin='0', vout='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${vout} ${gnd} LP2950_SUB`, subckts: [SUBCKT_DEFINITIONS.LP2950_SUB] };
    }
    case 'ic_icl8038': {
      const [vcc='0', ra='0', rb='0', cap='0', fm='0', vee='0', sine='0', tri='0', sqr='0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${ra} ${rb} ${cap} ${fm} ${vee} ${sine} ${tri} ${sqr} ICL8038_SUB`, subckts: [SUBCKT_DEFINITIONS.ICL8038_SUB] };
    }
    case 'ic_xr2206': {
      const [vcc='0', tc1='0', tc2='0', tr1='0', gnd='0', outp='0', sync='0', byp='0'] = nodes;
      return { line: `X_${comp.id} ${vcc} ${tc1} ${tc2} ${tr1} ${gnd} ${outp} ${sync} ${byp} XR2206_SUB`, subckts: [SUBCKT_DEFINITIONS.XR2206_SUB] };
    }
    case 'ic_cd4046': {
      const [sig='0', compPin='0', vco='0', inh='0', vss='0', vdd='0', pc1='0', pc2='0', vco_o='0', dem='0'] = nodes;
      return { line: `X_${comp.id} ${sig} ${compPin} ${vco} ${inh} ${vss} ${vdd} ${pc1} ${pc2} ${vco_o} ${dem} CD4046_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4046_SUB] };
    }
    case 'ic_cd4047': {
      const [c='0', r='0', rc='0', ast='0', vss='0', vdd='0', q='0', qbar='0', osc='0', rst='0'] = nodes;
      return { line: `X_${comp.id} ${c} ${r} ${rc} ${ast} ${vss} ${vdd} ${q} ${qbar} ${osc} ${rst} CD4047_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4047_SUB] };
    }
    case 'ic_cd4069': {
      const [a='0', y='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${y} ${vdd} ${vss} CD4069_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4069_SUB] };
    }
    case 'ic_74hc02': {
      const [a='0', b='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${y} ${vcc} ${gnd} HC02_SUB`, subckts: [SUBCKT_DEFINITIONS.HC02_SUB] };
    }
    case 'ic_74hc10': {
      const [a='0', b='0', c='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${y} ${vcc} ${gnd} HC10_SUB`, subckts: [SUBCKT_DEFINITIONS.HC10_SUB] };
    }
    case 'ic_74hc11': {
      const [a='0', b='0', c='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${y} ${vcc} ${gnd} HC11_SUB`, subckts: [SUBCKT_DEFINITIONS.HC11_SUB] };
    }
    case 'ic_74hc20': {
      const [a='0', b='0', c='0', d='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${d} ${y} ${vcc} ${gnd} HC20_SUB`, subckts: [SUBCKT_DEFINITIONS.HC20_SUB] };
    }
    case 'ic_74hc27': {
      const [a='0', b='0', c='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${y} ${vcc} ${gnd} HC27_SUB`, subckts: [SUBCKT_DEFINITIONS.HC27_SUB] };
    }
    case 'ic_74hc132': {
      const [a='0', b='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${y} ${vcc} ${gnd} HC132_SUB`, subckts: [SUBCKT_DEFINITIONS.HC132_SUB] };
    }
    case 'ic_74hc139': {
      const [e='0', a0='0', a1='0', y0='0', y1='0', y2='0', y3='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${e} ${a0} ${a1} ${y0} ${y1} ${y2} ${y3} ${vcc} ${gnd} HC139_SUB`, subckts: [SUBCKT_DEFINITIONS.HC139_SUB] };
    }
    case 'ic_74hc154': {
      const [a0='0', a1='0', a2='0', a3='0', e1='0', e2='0', y0='0', y1='0', y2='0', y3='0', y4='0', y5='0', y6='0', y7='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a0} ${a1} ${a2} ${a3} ${e1} ${e2} ${y0} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${vcc} ${gnd} HC154_SUB`, subckts: [SUBCKT_DEFINITIONS.HC154_SUB] };
    }
    case 'ic_74hc42': {
      const [a='0', b='0', c='0', d='0', y0='0', y1='0', y2='0', y3='0', y4='0', y5='0', y6='0', y7='0', y8='0', y9='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${d} ${y0} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${y8} ${y9} ${vcc} ${gnd} HC42_SUB`, subckts: [SUBCKT_DEFINITIONS.HC42_SUB] };
    }
    case 'ic_74hc238': {
      const [a0='0', a1='0', a2='0', e1='0', e2='0', y0='0', y1='0', y2='0', y3='0', y4='0', y5='0', y6='0', y7='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a0} ${a1} ${a2} ${e1} ${e2} ${y0} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${vcc} ${gnd} HC238_SUB`, subckts: [SUBCKT_DEFINITIONS.HC238_SUB] };
    }
    case 'ic_74hc73': {
      const [clk='0', clr='0', j='0', k='0', q='0', qbar='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${clk} ${clr} ${j} ${k} ${q} ${qbar} ${vcc} ${gnd} HC73_SUB`, subckts: [SUBCKT_DEFINITIONS.HC73_SUB] };
    }
    case 'ic_74hc76': {
      const [clk='0', pre='0', clr='0', j='0', k='0', q='0', qbar='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${clk} ${pre} ${clr} ${j} ${k} ${q} ${qbar} ${vcc} ${gnd} HC76_SUB`, subckts: [SUBCKT_DEFINITIONS.HC76_SUB] };
    }
    case 'ic_74hc174': {
      const [mr='0', cp='0', d0='0', d1='0', d2='0', d3='0', d4='0', d5='0', q0='0', q1='0', q2='0', q3='0', q4='0', q5='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${mr} ${cp} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${q0} ${q1} ${q2} ${q3} ${q4} ${q5} ${vcc} ${gnd} HC174_SUB`, subckts: [SUBCKT_DEFINITIONS.HC174_SUB] };
    }
    case 'ic_74hc175': {
      const [mr='0', cp='0', d0='0', d1='0', d2='0', d3='0', q0='0', q0b='0', q1='0', q1b='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${mr} ${cp} ${d0} ${d1} ${d2} ${d3} ${q0} ${q0b} ${q1} ${q1b} ${vcc} ${gnd} HC175_SUB`, subckts: [SUBCKT_DEFINITIONS.HC175_SUB] };
    }
    case 'ic_74hc273': {
      const [mr='0', cp='0', d0='0', d1='0', d2='0', d3='0', d4='0', d5='0', d6='0', d7='0', q0='0', q1='0', q2='0', q3='0', q4='0', q5='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${mr} ${cp} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${d6} ${d7} ${q0} ${q1} ${q2} ${q3} ${q4} ${q5} ${vcc} ${gnd} HC273_SUB`, subckts: [SUBCKT_DEFINITIONS.HC273_SUB] };
    }
    case 'ic_74hc373': {
      const [oe='0', le='0', d0='0', d1='0', d2='0', d3='0', d4='0', d5='0', q0='0', q1='0', q2='0', q3='0', q4='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${oe} ${le} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${q0} ${q1} ${q2} ${q3} ${q4} ${vcc} ${gnd} HC373_SUB`, subckts: [SUBCKT_DEFINITIONS.HC373_SUB] };
    }
    case 'ic_74hc574': {
      const [oe='0', cp='0', d0='0', d1='0', d2='0', d3='0', d4='0', d5='0', q0='0', q1='0', q2='0', q3='0', q4='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${oe} ${cp} ${d0} ${d1} ${d2} ${d3} ${d4} ${d5} ${q0} ${q1} ${q2} ${q3} ${q4} ${vcc} ${gnd} HC574_SUB`, subckts: [SUBCKT_DEFINITIONS.HC574_SUB] };
    }
    case 'ic_74hc93': {
      const [cp0='0', cp1='0', mr1='0', mr2='0', q0='0', q1='0', q2='0', q3='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp0} ${cp1} ${mr1} ${mr2} ${q0} ${q1} ${q2} ${q3} ${vcc} ${gnd} HC93_SUB`, subckts: [SUBCKT_DEFINITIONS.HC93_SUB] };
    }
    case 'ic_74hc160': {
      const [cp='0', mr='0', pe='0', cep='0', cet='0', d0='0', q0='0', q1='0', q2='0', q3='0', tc='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${mr} ${pe} ${cep} ${cet} ${d0} ${q0} ${q1} ${q2} ${q3} ${tc} ${vcc} ${gnd} HC160_SUB`, subckts: [SUBCKT_DEFINITIONS.HC160_SUB] };
    }
    case 'ic_74hc161': {
      const [cp='0', mr='0', pe='0', cep='0', cet='0', d0='0', q0='0', q1='0', q2='0', q3='0', tc='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${mr} ${pe} ${cep} ${cet} ${d0} ${q0} ${q1} ${q2} ${q3} ${tc} ${vcc} ${gnd} HC161_SUB`, subckts: [SUBCKT_DEFINITIONS.HC161_SUB] };
    }
    case 'ic_74hc163': {
      const [cp='0', sr='0', pe='0', cep='0', cet='0', d0='0', q0='0', q1='0', q2='0', q3='0', tc='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${sr} ${pe} ${cep} ${cet} ${d0} ${q0} ${q1} ${q2} ${q3} ${tc} ${vcc} ${gnd} HC163_SUB`, subckts: [SUBCKT_DEFINITIONS.HC163_SUB] };
    }
    case 'ic_74hc166': {
      const [cp='0', ce='0', pe='0', mr='0', ds='0', d0='0', q7='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${ce} ${pe} ${mr} ${ds} ${d0} ${q7} ${vcc} ${gnd} HC166_SUB`, subckts: [SUBCKT_DEFINITIONS.HC166_SUB] };
    }
    case 'ic_74hc191': {
      const [cp='0', ud='0', ce='0', pl='0', d0='0', q0='0', q1='0', q2='0', q3='0', tc='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${ud} ${ce} ${pl} ${d0} ${q0} ${q1} ${q2} ${q3} ${tc} ${vcc} ${gnd} HC191_SUB`, subckts: [SUBCKT_DEFINITIONS.HC191_SUB] };
    }
    case 'ic_74hc192': {
      const [cpu='0', cpd='0', mr='0', pl='0', d0='0', q0='0', q1='0', q2='0', q3='0', tcu='0', tcd='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cpu} ${cpd} ${mr} ${pl} ${d0} ${q0} ${q1} ${q2} ${q3} ${tcu} ${tcd} ${vcc} ${gnd} HC192_SUB`, subckts: [SUBCKT_DEFINITIONS.HC192_SUB] };
    }
    case 'ic_74hc299': {
      const [cp='0', mr='0', s0='0', s1='0', oe1='0', oe2='0', q0='0', q7='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cp} ${mr} ${s0} ${s1} ${oe1} ${oe2} ${q0} ${q7} ${vcc} ${gnd} HC299_SUB`, subckts: [SUBCKT_DEFINITIONS.HC299_SUB] };
    }
    case 'ic_74hc181': {
      const [a0='0', a1='0', a2='0', a3='0', b0='0', b1='0', b2='0', b3='0', m='0', f0='0', f1='0', f2='0', f3='0', aeqb='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a0} ${a1} ${a2} ${a3} ${b0} ${b1} ${b2} ${b3} ${m} ${f0} ${f1} ${f2} ${f3} ${aeqb} ${vcc} ${gnd} HC181_SUB`, subckts: [SUBCKT_DEFINITIONS.HC181_SUB] };
    }
    case 'ic_74hc280': {
      const [i0='0', i1='0', i2='0', i3='0', i4='0', i5='0', i6='0', i7='0', peven='0', podd='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${i0} ${i1} ${i2} ${i3} ${i4} ${i5} ${i6} ${i7} ${peven} ${podd} ${vcc} ${gnd} HC280_SUB`, subckts: [SUBCKT_DEFINITIONS.HC280_SUB] };
    }
    case 'ic_74hc688': {
      const [g='0', p0='0', p1='0', q0='0', q1='0', peq='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${g} ${p0} ${p1} ${q0} ${q1} ${peq} ${vcc} ${gnd} HC688_SUB`, subckts: [SUBCKT_DEFINITIONS.HC688_SUB] };
    }
    case 'ic_74hc126': {
      const [a='0', oe='0', y='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${oe} ${y} ${vcc} ${gnd} HC126_SUB`, subckts: [SUBCKT_DEFINITIONS.HC126_SUB] };
    }
    case 'ic_74hc541': {
      const [oe1='0', oe2='0', a0='0', a1='0', a2='0', a3='0', y0='0', y1='0', y2='0', y3='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${oe1} ${oe2} ${a0} ${a1} ${a2} ${a3} ${y0} ${y1} ${y2} ${y3} ${vcc} ${gnd} HC541_SUB`, subckts: [SUBCKT_DEFINITIONS.HC541_SUB] };
    }
    case 'ic_cd4001': {
      const [a='0', b='0', y='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${y} ${vdd} ${vss} CD4001_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4001_SUB] };
    }
    case 'ic_cd4011': {
      const [a='0', b='0', y='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${y} ${vdd} ${vss} CD4011_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4011_SUB] };
    }
    case 'ic_cd4012': {
      const [a='0', b='0', c='0', d='0', y='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${d} ${y} ${vdd} ${vss} CD4012_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4012_SUB] };
    }
    case 'ic_cd4023': {
      const [a='0', b='0', c='0', y='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${y} ${vdd} ${vss} CD4023_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4023_SUB] };
    }
    case 'ic_cd4027': {
      const [j='0', clk='0', k='0', set='0', rst='0', q='0', qbar='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${j} ${clk} ${k} ${set} ${rst} ${q} ${qbar} ${vdd} ${vss} CD4027_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4027_SUB] };
    }
    case 'ic_cd4028': {
      const [a='0', b='0', c='0', d='0', y0='0', y1='0', y2='0', y3='0', y4='0', y5='0', y6='0', y7='0', y8='0', y9='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${a} ${b} ${c} ${d} ${y0} ${y1} ${y2} ${y3} ${y4} ${y5} ${y6} ${y7} ${y8} ${y9} ${vdd} ${vss} CD4028_SUB`, subckts: [SUBCKT_DEFINITIONS.CD4028_SUB] };
    }
    case 'ic_adc0804': {
      const [cs='0', rd='0', wr='0', clk='0', vinp='0', vinm='0', vref='0', db7='0', db6='0', db5='0', db4='0', db3='0', db2='0', db1='0', db0='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${cs} ${rd} ${wr} ${clk} ${vinp} ${vinm} ${vref} ${db7} ${db6} ${db5} ${db4} ${db3} ${db2} ${db1} ${db0} ${vcc} ${gnd} ADC0804_SUB`, subckts: [SUBCKT_DEFINITIONS.ADC0804_SUB] };
    }
    case 'ic_adc0808': {
      const [in0='0', in1='0', in2='0', in3='0', ale='0', start='0', oe='0', eoc='0', db7='0', db6='0', db5='0', db4='0', db3='0', db2='0', db1='0', db0='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${in0} ${in1} ${in2} ${in3} ${ale} ${start} ${oe} ${eoc} ${db7} ${db6} ${db5} ${db4} ${db3} ${db2} ${db1} ${db0} ${vcc} ${gnd} ADC0808_SUB`, subckts: [SUBCKT_DEFINITIONS.ADC0808_SUB] };
    }
    case 'ic_ads1015': {
      const [a0='0', a1='0', a2='0', a3='0', addr='0', sda='0', scl='0', alrt='0', vdd='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${a0} ${a1} ${a2} ${a3} ${addr} ${sda} ${scl} ${alrt} ${vdd} ${gnd} ADS1015_SUB`, subckts: [SUBCKT_DEFINITIONS.ADS1015_SUB] };
    }
    case 'ic_mcp3204': {
      const [ch0='0', ch1='0', ch2='0', ch3='0', vref='0', cs='0', din='0', dout='0', clk='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${ch0} ${ch1} ${ch2} ${ch3} ${vref} ${cs} ${din} ${dout} ${clk} ${vdd} ${vss} MCP3204_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP3204_SUB] };
    }
    case 'ic_max127': {
      const [ch0='0', ch1='0', ch2='0', ch3='0', vref='0', sda='0', scl='0', vdd='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${ch0} ${ch1} ${ch2} ${ch3} ${vref} ${sda} ${scl} ${vdd} ${gnd} MAX127_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX127_SUB] };
    }
    case 'ic_ltc1864': {
      const [vinp='0', vinm='0', vref='0', conv='0', sck='0', sdo='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vinp} ${vinm} ${vref} ${conv} ${sck} ${sdo} ${vcc} ${gnd} LTC1864_SUB`, subckts: [SUBCKT_DEFINITIONS.LTC1864_SUB] };
    }
    case 'ic_mcp4822': {
      const [cs='0', sck='0', sdi='0', ldac='0', vouta='0', voutb='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${cs} ${sck} ${sdi} ${ldac} ${vouta} ${voutb} ${vdd} ${vss} MCP4822_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP4822_SUB] };
    }
    case 'ic_mcp4921': {
      const [cs='0', sck='0', sdi='0', ldac='0', vref='0', vout='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${cs} ${sck} ${sdi} ${ldac} ${vref} ${vout} ${vdd} ${vss} MCP4921_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP4921_SUB] };
    }
    case 'ic_dac0800': {
      const [d7='0', d6='0', d5='0', d4='0', d3='0', d2='0', d1='0', d0='0', iout='0', ioutb='0', vrefp='0', vrefm='0', vcc='0', vee='0'] = nodes;
      return { line: `X_${comp.id} ${d7} ${d6} ${d5} ${d4} ${d3} ${d2} ${d1} ${d0} ${iout} ${ioutb} ${vrefp} ${vrefm} ${vcc} ${vee} DAC0800_SUB`, subckts: [SUBCKT_DEFINITIONS.DAC0800_SUB] };
    }
    case 'ic_pcf8591': {
      const [ain0='0', ain1='0', ain2='0', ain3='0', aout='0', sda='0', scl='0', osc='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${ain0} ${ain1} ${ain2} ${ain3} ${aout} ${sda} ${scl} ${osc} ${vdd} ${vss} PCF8591_SUB`, subckts: [SUBCKT_DEFINITIONS.PCF8591_SUB] };
    }
    case 'ic_max1487': {
      const [ro='0', re='0', de='0', di='0', a='0', b='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${ro} ${re} ${de} ${di} ${a} ${b} ${vcc} ${gnd} MAX1487_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX1487_SUB] };
    }
    case 'ic_sn75176': {
      const [r='0', re='0', de='0', d='0', a='0', b='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${r} ${re} ${de} ${d} ${a} ${b} ${vcc} ${gnd} SN75176_SUB`, subckts: [SUBCKT_DEFINITIONS.SN75176_SUB] };
    }
    case 'ic_max3232': {
      const [t1in='0', r1out='0', t2in='0', r2out='0', c1p='0', c1m='0', t1out='0', r1in='0', t2out='0', r2in='0', c2p='0', c2m='0', vp='0', vm='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${t1in} ${r1out} ${t2in} ${r2out} ${c1p} ${c1m} ${t1out} ${r1in} ${t2out} ${r2in} ${c2p} ${c2m} ${vp} ${vm} ${vcc} ${gnd} MAX3232_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX3232_SUB] };
    }
    case 'ic_mcp2515': {
      const [cs='0', si='0', sck='0', osc1='0', osc2='0', so='0', int='0', txcan='0', rxcan='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${cs} ${si} ${sck} ${osc1} ${osc2} ${so} ${int} ${txcan} ${rxcan} ${vdd} ${vss} MCP2515_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP2515_SUB] };
    }
    case 'ic_tja1050': {
      const [txd='0', rxd='0', s='0', canh='0', canl='0', vref='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${txd} ${rxd} ${s} ${canh} ${canl} ${vref} ${vcc} ${gnd} TJA1050_SUB`, subckts: [SUBCKT_DEFINITIONS.TJA1050_SUB] };
    }
    case 'ic_ch340g': {
      const [udp='0', udm='0', xi='0', xo='0', txd='0', rxd='0', dtr='0', rts='0', cts='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${udp} ${udm} ${xi} ${xo} ${txd} ${rxd} ${dtr} ${rts} ${cts} ${vcc} ${gnd} CH340G_SUB`, subckts: [SUBCKT_DEFINITIONS.CH340G_SUB] };
    }
    case 'ic_ft232rl': {
      const [usbdm='0', usbdp='0', cbus0='0', cbus1='0', txd='0', rxd='0', rts='0', cts='0', dtr='0', dsr='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${usbdm} ${usbdp} ${cbus0} ${cbus1} ${txd} ${rxd} ${rts} ${cts} ${dtr} ${dsr} ${vcc} ${gnd} FT232RL_SUB`, subckts: [SUBCKT_DEFINITIONS.FT232RL_SUB] };
    }
    case 'ic_cp2102': {
      const [dp='0', dm='0', susp='0', txd='0', rxd='0', rts='0', cts='0', dtr='0', vdd='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${dp} ${dm} ${susp} ${txd} ${rxd} ${rts} ${cts} ${dtr} ${vdd} ${gnd} CP2102_SUB`, subckts: [SUBCKT_DEFINITIONS.CP2102_SUB] };
    }
    case 'ic_txb0108': {
      const [oe='0', a1='0', a2='0', a3='0', a4='0', a5='0', a6='0', a7='0', a8='0', b1='0', b2='0', b3='0', b4='0', b5='0', b6='0', b7='0', b8='0', vcca='0', vccb='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${oe} ${a1} ${a2} ${a3} ${a4} ${a5} ${a6} ${a7} ${a8} ${b1} ${b2} ${b3} ${b4} ${b5} ${b6} ${b7} ${b8} ${vcca} ${vccb} ${gnd} TXB0108_SUB`, subckts: [SUBCKT_DEFINITIONS.TXB0108_SUB] };
    }
    case 'ic_pca9306': {
      const [scl1='0', sda1='0', vref1='0', scl2='0', sda2='0', vref2='0', en='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${scl1} ${sda1} ${vref1} ${scl2} ${sda2} ${vref2} ${en} ${gnd} PCA9306_SUB`, subckts: [SUBCKT_DEFINITIONS.PCA9306_SUB] };
    }
    case 'ic_tm1637': {
      const [clk='0', dio='0', s1='0', s2='0', s3='0', s4='0', s5='0', s6='0', s7='0', s8='0', g1='0', g2='0', g3='0', g4='0', vcc='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${clk} ${dio} ${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7} ${s8} ${g1} ${g2} ${g3} ${g4} ${vcc} ${gnd} TM1637_SUB`, subckts: [SUBCKT_DEFINITIONS.TM1637_SUB] };
    }
    case 'ic_ht16k33': {
      const [scl='0', sda='0', a0='0', a1='0', a2='0', r0='0', r1='0', r2='0', r3='0', c0='0', c1='0', c2='0', c3='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${scl} ${sda} ${a0} ${a1} ${a2} ${r0} ${r1} ${r2} ${r3} ${c0} ${c1} ${c2} ${c3} ${vdd} ${vss} HT16K33_SUB`, subckts: [SUBCKT_DEFINITIONS.HT16K33_SUB] };
    }
    case 'ic_pcf8575': {
      const [sda='0', scl='0', int='0', a0='0', a1='0', a2='0', p0='0', p1='0', p2='0', p3='0', p4='0', p5='0', p6='0', p7='0', p10='0', p11='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${sda} ${scl} ${int} ${a0} ${a1} ${a2} ${p0} ${p1} ${p2} ${p3} ${p4} ${p5} ${p6} ${p7} ${p10} ${p11} ${vdd} ${vss} PCF8575_SUB`, subckts: [SUBCKT_DEFINITIONS.PCF8575_SUB] };
    }
    case 'ic_mcp23017': {
      const [sda='0', scl='0', inta='0', intb='0', reset='0', a0='0', a1='0', a2='0', gpa0='0', gpa1='0', gpa2='0', gpa3='0', gpb0='0', gpb1='0', gpb2='0', gpb3='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${sda} ${scl} ${inta} ${intb} ${reset} ${a0} ${a1} ${a2} ${gpa0} ${gpa1} ${gpa2} ${gpa3} ${gpb0} ${gpb1} ${gpb2} ${gpb3} ${vdd} ${vss} MCP23017_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP23017_SUB] };
    }
    case 'ic_mcp23008': {
      const [scl='0', sda='0', a0='0', a1='0', a2='0', gp0='0', gp1='0', gp2='0', gp3='0', int='0', vdd='0', vss='0'] = nodes;
      return { line: `X_${comp.id} ${scl} ${sda} ${a0} ${a1} ${a2} ${gp0} ${gp1} ${gp2} ${gp3} ${int} ${vdd} ${vss} MCP23008_SUB`, subckts: [SUBCKT_DEFINITIONS.MCP23008_SUB] };
    }
    case 'ic_lm336': {
      const [cathode='0', anode='0', adj='0'] = nodes;
      return { line: `X_${comp.id} ${cathode} ${anode} ${adj} LM336_SUB`, subckts: [SUBCKT_DEFINITIONS.LM336_SUB] };
    }
    case 'ic_ad584': {
      const [vin='0', strobe='0', vout='0', bg='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${strobe} ${vout} ${bg} ${gnd} AD584_SUB`, subckts: [SUBCKT_DEFINITIONS.AD584_SUB] };
    }
    case 'ic_ref192': {
      const [vin='0', sleep='0', vout='0', temp='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${sleep} ${vout} ${temp} ${gnd} REF192_SUB`, subckts: [SUBCKT_DEFINITIONS.REF192_SUB] };
    }
    case 'ic_max6126': {
      const [inPin='0', trim='0', out='0', nr='0', gnd='0'] = nodes;
      return { line: `X_${comp.id} ${inPin} ${trim} ${out} ${nr} ${gnd} MAX6126_SUB`, subckts: [SUBCKT_DEFINITIONS.MAX6126_SUB] };
    }
    case 'ic_ad736': {
      const [vin='0', cav='0', fb='0', vout='0', com='0', vp='0', vn='0'] = nodes;
      return { line: `X_${comp.id} ${vin} ${cav} ${fb} ${vout} ${com} ${vp} ${vn} AD736_SUB`, subckts: [SUBCKT_DEFINITIONS.AD736_SUB] };
    }
    default:
      return null;
  }
}
