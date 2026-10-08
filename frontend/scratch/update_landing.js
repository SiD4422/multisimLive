const fs = require('fs');
let f = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

f = f.replace(
  /<Link to="\/features">Features<\/Link>/g,
  `<Link to="/features">Features</Link>\n              <Link to="/about">About</Link>`
);

fs.writeFileSync('src/pages/LandingPage.tsx', f);
console.log('LandingPage updated');
