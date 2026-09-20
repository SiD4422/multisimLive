const fs = require('fs');
let content = fs.readFileSync('src/pages/Simulator.tsx', 'utf8');

content = content.replace(/onClick=\{\(\) => \{ setIsSidebarOpen\(!isSidebarOpen\); if \(isSidebarOpen\)\s*\}\}/g, 'onClick={() => setIsSidebarOpen(!isSidebarOpen)}');

content = content.replace(/onClickCapture=\{\(\) => \{\s*if \(activeCategory\) \{\s*setSearchQuery\(''\);\s*\}\s*\}\}/g, '');

// There is a dangling onClickCapture on canvas-wrapper since I removed the contents:
// onClickCapture={() => {
//   if (activeCategory) {
//     setSearchQuery('');
//   }
// }}
// Let's just remove the onClickCapture completely.
content = content.replace(/onClickCapture=\{\(\) => \{\s*if \(activeCategory\) \{\s*setSearchQuery\(''\);\s*\}\s*\}\}/g, '');
// Wait, the regex might not match due to spaces. I will just do it simply:
content = content.replace(/onClickCapture=\{\(\) => \{\s*if \(activeCategory\) \{\s*setSearchQuery\(''\);\s*\}\s*\}\}/, '');

content = content.replace(/onClick=\{\(\) => \{ setActiveView\('grapher'\);\s*\}\}/g, "onClick={() => setActiveView('grapher')}");
content = content.replace(/onClick=\{\(\) => \{ setActiveView\('split'\);\s*\}\}/g, "onClick={() => setActiveView('split')}");

fs.writeFileSync('src/pages/Simulator.tsx', content);
