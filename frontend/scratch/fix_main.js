const fs = require('fs');
['src/pages/AboutPage.tsx', 'src/pages/ShowcasePage.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace('<main>\\n<main id="main">', '<main id="main">');
  c = c.replace('</main>\\n</main>', '</main>');
  fs.writeFileSync(file, c);
});
console.log('Fixed double main tags');
