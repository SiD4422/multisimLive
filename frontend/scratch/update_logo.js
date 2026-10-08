const fs = require('fs');

function updateLogo(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /<img src="\/logo_main\.png" alt="NodeSim Logo" style=\{\{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px' \}\} \/>/g,
    `<img src="/logo_main.png" alt="NodeSim Logo" style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px', mixBlendMode: 'multiply' }} />`
  );
  // Just in case it has different spacing:
  content = content.replace(
    /style=\{\{\s*height:\s*'75px',\s*objectFit:\s*'contain',\s*margin:\s*'-14px 0',\s*marginLeft:\s*'-15px'\s*\}\}/g,
    `style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px', mixBlendMode: 'multiply' }}`
  );
  fs.writeFileSync(filePath, content);
}

updateLogo('src/pages/LandingPage.tsx');
updateLogo('src/pages/Layout.tsx');

console.log('Logos updated with mixBlendMode!');
