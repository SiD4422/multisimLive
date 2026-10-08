const fs = require('fs');
let f = fs.readFileSync('src/pages/Layout.tsx', 'utf8');

f = f.replace(
  /<Link to="\/circuits" className=\{pathname === '\/circuits' \? 'active' : ''\}>Circuits<\/Link>/g,
  `<Link to="/circuits" className={pathname === '/circuits' ? 'active' : ''}>Circuits</Link>
            <Link to="/showcase" className={pathname === '/showcase' ? 'active' : ''}>Showcase</Link>`
);

f = f.replace(
  /<li><Link to="\/circuits">Circuits<\/Link><\/li>/g,
  `<li><Link to="/circuits">Circuits</Link></li>
              <li><Link to="/showcase">Showcase</Link></li>`
);

fs.writeFileSync('src/pages/Layout.tsx', f);
console.log('Layout updated');
