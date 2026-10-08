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
c('DCSource', 100, 100, 90, '20', 'Vin'); // Pin1: 100,100. Pin2: 100,190
w(100, 190, 100, 370);
c('Ground', 100, 370);
w(100, 100, 200, 100); // Vin+ to N1

// SI Cell
// N1 = 200, 100
c('Inductor', 200, 100, 0, '100u', 'L1'); // 200,100 -> 290,100 (N2)
c('Diode', 200, 100, 90, '', 'D1');       // 200,100 -> 200,190 (N_SI)
c('Inductor', 200, 190, 0, '100u', 'L2'); // 200,190 -> 290,190 (N3)
c('Diode', 290, 100, 90, '', 'D2');       // 290,100 -> 290,190
// Cross diode D3: Anode at 200,190; Cathode at 290,100
c('Diode', 200, 145, 0, '', 'D3');        // 200,145 -> 290,145
w(200, 190, 200, 145);
w(290, 145, 290, 100);

// Switch (Q1)
c('MosfetN', 233, 235, 0, '', 'Q1');      // Gate: 233,235. Drain: 290,190. Source: 290,280.
w(290, 280, 290, 370);
c('Ground', 290, 370);

// PWM
c('PulseVoltage', 143, 235, 90, '0 5 1n 1n 10u 20u', 'PWM'); // Pin1: 143,235. Pin2: 143,325
w(143, 235, 233, 235);
w(143, 325, 143, 370);
c('Ground', 143, 370);

// Voltage-Lift Cell (D4, C1, D5)
c('Diode', 290, 190, 0, '', 'D4');        // 290,190 -> 380,190 (N4)
c('Capacitor', 380, 190, 90, '47u', 'C1'); // 380,190 -> 380,280

// RETURN WIRE FOR C1 (goes underneath the entire circuit to avoid shorts)
w(380, 280, 380, 450);
w(380, 450, 50, 450);
w(50, 450, 50, 100);
w(50, 100, 100, 100);

c('Diode', 380, 190, 0, '', 'D5');        // 380,190 -> 470,190 (N6)

// Fix: Add microscopic wires at component-to-component junctions to satisfy NodeSim's DRC!
w(380, 190, 380, 191); // Junction N4 (D4, C1, D5)
w(470, 190, 470, 191); // Junction N6 (D5, L3, C2, D7)
w(470, 100, 470, 101); // Junction N8 (C2, D6)

// Enhanced Cubic Gain Stage (L3, C2, D6)
c('Inductor', 470, 190, 90, '100u', 'L3'); // 470,190 -> 470,280
w(470, 280, 470, 370);
c('Ground', 470, 370);

c('Capacitor', 470, 190, 270, '47u', 'C2'); // rot 270 -> Pin1=470,190; Pin2=470,100 (N8)
c('Diode', 470, 100, 180, '', 'D6');        // rot 180 -> Pin1(Anode)=470,100; Pin2(Cathode)=380,100
w(380, 100, 330, 100);
w(330, 100, 330, 190);
w(330, 190, 290, 190);                      // Connect back to Switch Node (N3)

// Output Stage (D7, Cout, Rload, Voltmeter)
c('Diode', 470, 190, 0, '', 'D7');          // 470,190 -> 560,190 (VOUT)
c('Capacitor', 560, 190, 90, '220u', 'Cout'); // 560,190 -> 560,280
w(560, 280, 560, 370);
c('Ground', 560, 370);

w(560, 190, 650, 190);
c('Resistor', 650, 190, 90, '1k', 'Rload');  // 650,190 -> 650,280
w(650, 280, 650, 370);
c('Ground', 650, 370);

// Voltmeter (Custom pins)
c('Voltmeter', 720, 235, 0, '', 'VOUT');    // Pin+ = 720,215. Pin- = 720,255.
w(650, 190, 720, 190);
w(720, 190, 720, 215);
w(650, 370, 720, 370);
w(720, 370, 720, 255);

const data = { version: 1, components, wires };
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Regenerated beautiful circuit layout');
