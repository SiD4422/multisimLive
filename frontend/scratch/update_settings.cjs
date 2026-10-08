const fs = require('fs');
const file = 'src/examples/hybrid_switched_inductor.json';
const oldData = JSON.parse(fs.readFileSync(file, 'utf8'));

oldData.transientSettings = {
    endTime: "10ms",
    step: "1us"
};

// Also let's update some component values to reach steady state faster but stay stable
oldData.components.forEach(c => {
    if (c.type === 'Inductor') c.value = '1m'; // 1mH for CCM
    if (c.type === 'Capacitor') {
        if (c.label === 'Cout') c.value = '4.7u';
        else c.value = '1u';
    }
});

fs.writeFileSync(file, JSON.stringify(oldData, null, 2));
console.log('Settings updated');
