const fs = require('fs');
const file = 'src/examples/hybrid_switched_inductor.json';

function uid() { return Math.random().toString(36).substring(2, 9); }

const components = [];
const wires = [];

function c(type, x, y, rot=0, val='', lbl='') {
    const id = uid();
    components.push({ id, type, position: {x,y}, rotation: rot, value: val, label: lbl });
    return id;
}
function w(x1, y1, x2, y2) {
    wires.push({ id: uid(), points: [{x:x1, y:y1}, {x:x2, y:y2}] });
}

// Vin & GND
c('DCSource', 100, 280, 90, '20', 'Vin'); // Pin1: 100,280. Pin2: 100,370
w(100, 370, 100, 400); c('Ground', 100, 400);
w(100, 280, 100, 100); // VIN+ rail

// SI Cell
// VIN+ -> L1(1)
c('Inductor', 100, 100, 0, '100u', 'L1'); // (100,100) -> (190,100)
// VIN+ -> D1(A)
c('Diode', 100, 190, 0, '', 'D1');       // (100,190) -> (190,190)

// L1(2) [190,100] -> D3(A)
// D1(K) [190,190] -> D3(K)
c('Diode', 190, 100, 90, '', 'D3');      // (190,100) -> (190,190)

// D1(K) -> L2(1)
c('Inductor', 190, 190, 0, '100u', 'L2'); // (190,190) -> (280,190)

// L1(2) -> D2(A)
w(190, 100, 280, 100);
c('Diode', 280, 100, 90, '', 'D2');      // (280,100) -> (280,190)

// Switch (Q1)
// Q1 Drain = L2(2) & D2(K) = (280, 190)
c('MosfetN', 223, 235, 0, '', 'Q1');      // Gate: (223,235). Drain: (280,190). Source: (280,280).
w(280, 280, 280, 400); c('Ground', 280, 400);

// PWM for Q1
c('PulseVoltage', 133, 235, 90, '0 5 1n 1n 10u 20u', 'PWM'); // (133,235) -> (133,325)
w(133, 235, 223, 235);
w(133, 325, 133, 400); c('Ground', 133, 400);

// Voltage-Lift Cell (D4, C1, D5)
// Q1 Drain -> D4(A)
c('Diode', 280, 190, 0, '', 'D4');        // (280,190) -> (370,190)

// D4(K) [370,190] -> C1+
c('Capacitor', 370, 190, 90, '4.7u', 'C1'); // (370,190) -> (370,280)

// C1- -> VIN+
// Route underneath to avoid shorts
w(370, 280, 370, 450);
w(370, 450, 50, 450);
w(50, 450, 50, 100);
w(50, 100, 100, 100);

// D4(K) -> D5(A)
c('Diode', 370, 190, 0, '', 'D5');        // (370,190) -> (460,190)

// Enhanced Cubic Gain Stage (L3, C2, D6)
// N6 = D5(K) = (460,190)
c('Inductor', 460, 190, 90, '100u', 'L3'); // (460,190) -> (460,280)
w(460, 280, 460, 400); c('Ground', 460, 400);

// N6 -> C2+
c('Capacitor', 460, 190, 270, '4.7u', 'C2'); // (460,190) -> (460,100)

// C2- [460,100] -> D6(A)
// D6(K) -> C1+ [370,190]
c('Diode', 460, 100, 180, '', 'D6');        // (460,100) -> (370,100)
w(370, 100, 370, 190);

// Output Stage (D7, Cout, Rload, Voltmeter)
// N6 -> D7(A)
c('Diode', 460, 190, 0, '', 'D7');          // (460,190) -> (550,190)

// D7(K) -> VOUT+
// Cout
c('Capacitor', 550, 190, 90, '47u', 'Cout'); // (550,190) -> (550,280)
w(550, 280, 550, 400); c('Ground', 550, 400);

w(550, 190, 640, 190);
c('Resistor', 640, 190, 90, '1k', 'Rload');  // (640,190) -> (640,280)
w(640, 280, 640, 400); c('Ground', 640, 400);

// Voltmeter
c('Voltmeter', 730, 235, 0, '', 'VOUT');    // Pin+ = 730,215. Pin- = 730,255.
w(640, 190, 730, 190); w(730, 190, 730, 215);
w(640, 400, 730, 400); w(730, 400, 730, 255);

// FIX: Micro-wires to satisfy DRC at junctions
w(190, 100, 190, 101); // L1, D3, wire
w(190, 190, 190, 191); // D1, L2, D3
w(280, 190, 280, 191); // L2, D2, Q1, D4
w(370, 190, 370, 191); // D4, D5, C1, wire from D6
w(460, 190, 460, 191); // D5, L3, C2, D7
w(460, 100, 460, 101); // C2, D6

const data = { version: 1, components, wires };
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Done');
