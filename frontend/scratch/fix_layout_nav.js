const fs = require('fs');

let content = fs.readFileSync('src/pages/Layout.tsx', 'utf8');

// The block currently looks like:
// <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
// <Link to="/circuits" className={pathname.startsWith('/circuits') ? 'active' : ''}>Circuits</Link>
// {/* ── Learn dropdown ── */}

// We need to insert Showcase and Resources before Learn dropdown if they are missing
// Resources seems to be missing too? No, wait, where is Resources in Layout?
// Let's check where Resources is.

// I'll just re-write the whole block up to Learn dropdown to match LandingPage (but with active states).

content = content.replace(
  /<Link to="\/about" className=\{pathname === '\/about' \? 'active' : ''\}>About<\/Link>\s*<Link to="\/circuits" className=\{pathname\.startsWith\('\/circuits'\) \? 'active' : ''\}>Circuits<\/Link>/g,
  `<Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/circuits" className={pathname.startsWith('/circuits') ? 'active' : ''}>Circuits</Link>
            <Link to="/showcase" className={pathname === '/showcase' ? 'active' : ''}>Showcase</Link>
            <Link to="/resources" className={pathname === '/resources' ? 'active' : ''}>Resources</Link>`
);

fs.writeFileSync('src/pages/Layout.tsx', content);

console.log('Fixed Layout nav links!');
