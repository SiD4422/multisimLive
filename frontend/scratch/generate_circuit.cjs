const fs = require('fs');

function uid() { return Math.random().toString(36).substring(2, 9); }

const components = [];
const wires = [];

function c(type, x, y, rot=0, val='', lbl='') {
    const id = uid();
    components.push({ id, type, position: {x,y}, rotation: rot, value: val, label: lbl });
    return id;
}
function w(x1, y1, x2, y2) {
    wires.push({ id: uid(), start: {x:x1, y:y1}, end: {x:x2, y:y2} });
}

// Vin (N1 = 200, 300)
c('DCVoltage', 100, 300, 90, '20', 'Vin'); // Pin1: 100,300. Pin2: 100,390
w(100, 390, 100, 500); c('Ground', 100, 500);
w(100, 300, 200, 300); // Vin+ to N1

// SI Cell
// N1 = (200, 300).
c('Inductor', 200, 300, 0, '100u', 'L1'); // 200,300 to 290,300 (N2)
c('Diode', 200, 300, 90, '', 'D1'); // 200,300 to 200,390 (N_SI)

c('Inductor', 200, 390, 0, '100u', 'L2'); // 200,390 to 290,390 (N3/SW)
c('Diode', 290, 300, 90, '', 'D2'); // 290,300 to 290,390

c('Diode', 200, 345, 0, '', 'D3'); // 200,345 to 290,345
w(200, 390, 200, 345); // N_SI to D3 anode
w(290, 345, 290, 300); // D3 cathode to N2

// Q1
c('MosfetN', 233, 435, 0, '', 'Q1'); // Gate=(233,435), Drain=(290,390), Source=(290,480)
w(290, 480, 290, 500); c('Ground', 290, 500);

c('PulseVoltage', 143, 435, 90, '0 5 1n 1n 10u 20u', 'PWM'); // pos=(143,435), Pin2=(143,525)
w(143, 435, 233, 435); 
w(143, 525, 143, 550); c('Ground', 143, 550);

// Voltage-Lift
c('Diode', 290, 390, 0, '', 'D4'); // N3(290,390) to N4(380,390)
c('Capacitor', 380, 390, 90, '47u', 'C1'); // N4(380,390) to N5(380,480)
w(380, 480, 200, 480); w(200, 480, 200, 300); // N5 to N1

// Cascade
c('Diode', 380, 390, 0, '', 'D5'); // N4(380,390) to N6(470,390)
c('Inductor', 470, 390, 90, '100u', 'L3'); // N6(470,390) to (470,480)
w(470, 480, 470, 500); c('Ground', 470, 500);

// C2 & D6
// C2 connects from N6(470,390) to N8(560,390)
c('Capacitor', 470, 300, 0, '47u', 'C2'); // (470,300) to (560,300)
w(470, 390, 470, 300); // N6 to C2 pos
// D6 connects from N8 to N3(290,390).
// Anode at N8(560,300), Cathode at N3.
c('Diode', 560, 300, 180, '', 'D6'); // Anode(560,300), Cathode(470,300)
w(470, 300, 290, 300); // Wait, (470,300) is connected to N6 via that wire! This shorts C2!
// Let's fix C2 and D6 wiring.
// D6 Anode is N8. Cathode is N3.
// C2 from N6 to N8.
// N6 is (470, 390).
// N3 is (290, 390).
// Let's place N8 at (560, 390).
// C2 from N6 to N8:
c('Capacitor', 470, 390, 0, '47u', 'C2'); // (470,390) to (560,390)[N8]
// D6 from N8(560,390) to N3(290,390) - needs to go AROUND the bottom or top.
w(560, 390, 560, 250); 
w(560, 250, 470, 250);
c('Diode', 470, 250, 180, '', 'D6'); // Anode(470,250), Cathode(380,250)
w(380, 250, 290, 250);
w(290, 250, 290, 390); // to N3

// Output Stage
c('Diode', 560, 390, 0, '', 'D7'); // Wait, D7 anode is N6! N6 is (470,390).
// In my code above, C2 is at (470,390) going right. D7 needs to go right too.
// Let's move D7 up or down.
w(470, 390, 470, 450);
c('Diode', 470, 450, 0, '', 'D7'); // N6 to (560,450)[VOUT]
c('Capacitor', 560, 450, 90, '220u', 'Cout'); // (560,450) to (560,540)
w(560, 540, 560, 560); c('Ground', 560, 560);

c('Resistor', 650, 450, 90, '10k', 'Rload'); // (650,450) to (650,540)
w(560, 450, 650, 450); // VOUT node
w(650, 540, 650, 560); c('Ground', 650, 560);

c('Voltmeter', 740, 450, 90, '', 'VOUT');
w(650, 450, 740, 450); w(650, 540, 740, 540);

const data = { version: 1, components, wires };
fs.writeFileSync('src/data/hybrid_switched_inductor.json', JSON.stringify(data, null, 2));
