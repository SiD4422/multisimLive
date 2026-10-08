const fs = require('fs');

function updateLogoToTransparent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /<img src="\/logo_main\.png" alt="NodeSim Logo" style=\{\{\s*height:\s*'75px',\s*objectFit:\s*'contain',\s*margin:\s*'-14px 0',\s*marginLeft:\s*'-15px',\s*mixBlendMode:\s*'multiply'\s*\}\}\s*\/>/g,
    `<img src="/logo_main_transparent.png" alt="NodeSim Logo" style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px' }} />`
  );
  fs.writeFileSync(filePath, content);
}

updateLogoToTransparent('src/pages/LandingPage.tsx');
updateLogoToTransparent('src/pages/Layout.tsx');

console.log('Logos updated to transparent version without mixBlendMode!');
