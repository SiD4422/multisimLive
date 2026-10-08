const fs = require('fs');
let f = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

f = f.replace(
  /<Link to="\/circuits">Circuits<\/Link>/g,
  `<Link to="/circuits">Circuits</Link>\n              <Link to="/showcase">Showcase</Link>`
);

fs.writeFileSync('src/pages/LandingPage.tsx', f);
console.log('LandingPage updated');
