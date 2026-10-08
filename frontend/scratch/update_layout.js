const fs = require('fs');
let f = fs.readFileSync('src/pages/Layout.tsx', 'utf8');

f = f.replace(
  /<Link to="\/features" className=\{pathname === '\/features' \? 'active' : ''\}>Features<\/Link>/g,
  `<Link to="/features" className={pathname === '/features' ? 'active' : ''}>Features</Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>`
);

f = f.replace(
  /<li><Link to="\/features">Features<\/Link><\/li>/g,
  `<li><Link to="/features">Features</Link></li>
              <li><Link to="/about">About</Link></li>`
);

fs.writeFileSync('src/pages/Layout.tsx', f);
console.log('Layout updated');
