const fs = require('fs');
const symbolsData = JSON.parse(fs.readFileSync('src/utils/kicad_symbols.json', 'utf8'));
console.log(JSON.stringify(symbolsData['R_US'] || symbolsData['Resistor'], null, 2));
