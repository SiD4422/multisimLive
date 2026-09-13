import createNgspiceModule from '@o.z/ngspice-wasm';

async function testXspice() {
  try {
    const ngspice = await createNgspiceModule({
      noExitRuntime: true,
      print: console.log,
      printErr: console.error
    });
    
    // Create a simple A-device netlist (an ADC bridge and a DAC bridge)
    const netlist = `
XSPICE Test
V1 in 0 DC 5
a1 [in] [din] adc
.model adc adc_bridge(in_low=1.0 in_high=4.0)
a2 [din] [out] dac
.model dac dac_bridge(out_low=0 out_high=5)
R1 out 0 1k
.tran 1ms 10ms
.end
`;
    console.log("Running netlist...");
    ngspice.ccall('ngspice_command', 'number', ['string'], [`circbyline ${netlist.split('\n').join('\n')}`]);
    ngspice.ccall('ngspice_command', 'number', ['string'], ['bg_run']);
    console.log("Done.");
  } catch(e) {
    console.error("Error:", e);
  }
}
testXspice();
