import fs from 'fs';
import path from 'path';

// Let's just read the JSON files and check for any remaining problematic characters
const examplesDir = './src/examples';
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
let problems = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
  const data = JSON.parse(content);
  
  for (const comp of data.components) {
    if (comp.type === 'Resistor') {
      const val = comp.value || '1k';
      // simulate the fix
      let cleanVal = val.replace(/[OIcOhm]/gi, '').trim();
      if (cleanVal === '0' || cleanVal === '0.0') cleanVal = '1m';
      
      if (cleanVal === '') {
         console.log('Problem in ' + file + ': Resistor ' + comp.id + ' has empty value after cleaning (original: ' + val + ')');
         problems++;
      }
    }
  }
}
console.log('Checked ' + files.length + ' circuits. Found ' + problems + ' resistor value problems.');
