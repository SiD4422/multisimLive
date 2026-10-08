const fs = require('fs');
let html = fs.readFileSync('C:/Users/spart/Downloads/nodesim-site/nodesim-site/about.html', 'utf8');

let mainMatch = html.match(/<main>([\s\S]*?)<\/main>/);
if (mainMatch) {
    fs.writeFileSync('scratch/main.html', mainMatch[0]);
    console.log('Saved main.html');
}
