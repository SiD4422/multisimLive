const fs = require('fs');

function removeHowToUse(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<Link to="\/procedure">How to Use<\/Link>\s*/g, '');
  fs.writeFileSync(filePath, content);
}

removeHowToUse('src/pages/LandingPage.tsx');
removeHowToUse('src/pages/Layout.tsx');

console.log('Removed How to Use tab!');
