const fs = require('fs');
const file = 'src/examples/hybrid_switched_inductor.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

if (data.wires && data.wires.length > 0 && data.wires[0].start) {
    data.wires = data.wires.map(w => {
        if (w.start && w.end) {
            return { id: w.id, points: [w.start, w.end] };
        }
        return w;
    });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed wires successfully!');
} else {
    console.log('Wires already fixed or empty.');
}
