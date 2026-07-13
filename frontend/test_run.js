
const fs = require('fs');
const netlist = \* test
V_V1 1 0 SINE(0 120 1k)
L1p_T1 1 0 0.1
Rpar_p1_T1 1 0 1Meg
L1s_T1 2 3 0.1
Rpar_s1_T1 2 3 1Meg
K1_T1 L1p_T1 L1s_T1 0.999
D1_D1 2 4 D_1N4007
D2_D1 0 2 D_1N4007
D3_D1 3 4 D_1N4007
D4_D1 0 3 D_1N4007
Rbleed_D1 4 0 10Meg
R_R1 4 0 10m
.model D_1N4007 D (IS=76.9p RS=0.064 N=1.45 BV=1000 IBV=5u CJO=26.5p TT=4.32u)
.options GMIN=1e-10 RELTOL=1e-3 ABSTOL=1e-9 VNTOL=1e-4 ITL1=500 ITL2=500 ITL4=200
.tran 100us 10ms
.end\;
fs.writeFileSync('test.cir', netlist);
console.log('Netlist written to test.cir');
