const fs = require('fs');

function shrinkLogo(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /style=\{\{\s*height:\s*'44px',\s*objectFit:\s*'contain'\s*\}\}/g,
    `style={{ height: '34px', objectFit: 'contain' }}`
  );
  fs.writeFileSync(filePath, content);
}

shrinkLogo('src/pages/LandingPage.tsx');
shrinkLogo('src/pages/Layout.tsx');

console.log('Logo size reduced!');
