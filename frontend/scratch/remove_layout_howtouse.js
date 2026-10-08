const fs = require('fs');
let content = fs.readFileSync('src/pages/Layout.tsx', 'utf8');
content = content.replace(/<Link to="\/procedure"[^>]*>How to Use<\/Link>\s*/g, '');
fs.writeFileSync('src/pages/Layout.tsx', content);
