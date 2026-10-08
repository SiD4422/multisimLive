const fs = require('fs');

// 1. Update LandingPage.css to make header solid white
let css = fs.readFileSync('src/pages/LandingPage.css', 'utf8');
css = css.replace('--header-bg:rgba(251,254,252,.82);', '--header-bg:#ffffff;');
fs.writeFileSync('src/pages/LandingPage.css', css);

// 2. Update logo sizes in LandingPage.tsx and Layout.tsx
function updateLogoSize(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Revert back to standard logo (with white bg) if they preferred it, or keep transparent but shrink it.
  // The user said "reduce the size of logo .. i have shared u how it was before".
  // Looking at the "before" screenshot, they used the regular logo (or whatever was there) but smaller.
  // I'll keep the transparent one for safety, but shrink the size to 42px.
  content = content.replace(
    /<img src="\/logo_main_transparent\.png" alt="NodeSim Logo" style=\{\{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px' \}\} \/>/g,
    `<img src="/logo_main_transparent.png" alt="NodeSim Logo" style={{ height: '44px', objectFit: 'contain' }} />`
  );
  
  // Just in case it wasn't replaced properly due to spaces
  content = content.replace(
    /style=\{\{\s*height:\s*'75px',\s*objectFit:\s*'contain',\s*margin:\s*'-14px 0',\s*marginLeft:\s*'-15px'\s*\}\}/g,
    `style={{ height: '44px', objectFit: 'contain' }}`
  );
  fs.writeFileSync(filePath, content);
}

updateLogoSize('src/pages/LandingPage.tsx');
updateLogoSize('src/pages/Layout.tsx');

console.log('Fixed header color and logo size!');
