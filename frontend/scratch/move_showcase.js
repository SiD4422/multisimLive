const fs = require('fs');

function updateLandingPage() {
  let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

  // 1. Remove Showcase from main nav row
  content = content.replace(
    /<Link to="\/showcase">Showcase<\/Link>\s*<Link to="\/resources">Resources<\/Link>/,
    `<Link to="/resources">Resources</Link>`
  );

  // 2. Add Showcase into the Learn dropdown
  const inspirationBlock = `
                <div style={{ padding:'6px 16px 4px', fontSize:'10px', fontWeight:700, color:'#4ade80', textTransform:'uppercase', letterSpacing:'0.08em' }}>Inspiration</div>
                <Link to="/showcase" style={{ display:'block', padding:'7px 16px', color:'#c8d8ce', fontSize:'13px', textDecoration:'none' }} className="dropdown-item">Video Showcase</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>`;
  content = content.replace(
    /(<div className="lp-learn-menu" [^>]+>)/,
    `$1${inspirationBlock}`
  );

  // 3. Update mobile menu (replace Showcase with Video Showcase)
  content = content.replace(
    /<Link to="\/showcase">Showcase<\/Link>/g,
    `<Link to="/showcase">Video Showcase</Link>`
  );

  fs.writeFileSync('src/pages/LandingPage.tsx', content);
}

function updateLayout() {
  let content = fs.readFileSync('src/pages/Layout.tsx', 'utf8');

  // 1. Remove Showcase from main nav row
  content = content.replace(
    /<Link to="\/showcase"[^>]+>Showcase<\/Link>\s*<Link to="\/resources"/,
    `<Link to="/resources"`
  );

  // 2. Add Showcase into the Learn dropdown
  const inspirationBlock = `
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Inspiration
                </div>
                <Link to="/showcase" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Video Showcase</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>`;
  content = content.replace(
    /(<div className="learn-dropdown-menu" [^>]+>)/,
    `$1${inspirationBlock}`
  );

  // 3. Remove Showcase from mobile nav (since we want to add it under the 'Tutorials' section or just change it to Video Showcase)
  // Let's change it to Video Showcase in mobile menu to keep it simple and visible
  content = content.replace(
    /<Link to="\/showcase"[^>]+>Showcase<\/Link>\s*(<Link to="\/resources")/g,
    `$1`
  );
  
  // Actually, we need to add Video Showcase into the mobile menu's nested section
  const mobileInspirationBlock = `
                <div style={{ padding: '6px 16px 4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Inspiration
                </div>
                <Link to="/showcase" style={{ display: 'block', padding: '7px 16px', color: '#c8d8ce', fontSize: '13px', textDecoration: 'none' }} className="dropdown-item">Video Showcase</Link>
                <div style={{ margin: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}/>`;
  content = content.replace(
    /(<div style=\{\{ borderTop: '1px solid rgba\(255,255,255,0\.1\)', margin: '6px 0', paddingTop: '6px' \}\}>)/,
    `$1${mobileInspirationBlock}`
  );

  fs.writeFileSync('src/pages/Layout.tsx', content);
}

updateLandingPage();
updateLayout();

console.log('Moved Showcase into Learn dropdown!');
