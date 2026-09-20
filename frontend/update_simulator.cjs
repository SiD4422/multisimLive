const fs = require('fs');
const path = require('path');

const file = path.join('src', 'pages', 'Simulator.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(/import\s*\{\s*IconProbeVoltage[\s\S]*?\} from '\.\.\/components\/icons\/MultisimIcons';/, '');
content = content.replace(/import \{ Logo \} from '\.\.\/components\/icons\/Logo';/, "import { ComponentPalette } from '../components/ComponentPalette';\nimport { SimulatorHeader } from '../components/SimulatorHeader';");

// 2. Remove ALL_COMPONENTS, generateDesc, renderIcon, search logic
content = content.replace(/\s*\/\/ Flat list of ALL components for search[\s\S]*?const searchResults = [\s\S]*?\];/g, '');

// 3. Replace Header
const headerRegex = /<header className="header-top relative" style=\{\{ zIndex: 10 \}\}>[\s\S]*?<\/header>/;
const newHeader = `<SimulatorHeader
        circuitName={circuitName}
        isEditingName={isEditingName}
        onEditName={() => setIsEditingName(true)}
        onNameChange={setCircuitName}
        onNameBlur={() => setIsEditingName(false)}
        isEmbed={isEmbed}
        onShare={handleShare}
        onSave={handleSave}
        onLoadClick={handleLoadClick}
        onExportNetlist={handleExportNetlist}
        onCopyNetlist={handleCopyNetlist}
        onImportCir={handleImportCirClick}
        onToggleFullscreen={toggleFullScreen}
        isSimulating={isSimulating}
        lastSimMs={lastSimMs}
        setIsLibraryOpen={setIsLibraryOpen}
        setIsEmbedModalOpen={setIsEmbedModalOpen}
        setIsShortcutModalOpen={setIsShortcutModalOpen}
      />`;
content = content.replace(headerRegex, newHeader);

// 4. Replace Sidebar
// The sidebar starts with <div className="sidebar">
// We can find the exact block by counting div tags, or just matching up to the Canvas Area comment.
const sidebarStart = content.indexOf('<div className="sidebar">');
const canvasAreaStart = content.indexOf('{/* Canvas Area */}');

if (sidebarStart !== -1 && canvasAreaStart !== -1) {
  const sidebarSection = content.substring(sidebarStart, canvasAreaStart);
  // We need to replace the sidebar div.
  // The outer condition is:
  // {isSidebarOpen && (activeView === 'schematic' || activeView === 'split') && (
  //   <div className="sidebar"> ... </div>
  // )}
  // Let's replace the <div className="sidebar">...</div> with <ComponentPalette />
  const newSidebar = `<ComponentPalette 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
              onSelect={handleSelectComponent} 
              isEmbed={isEmbed} 
            />\n          `;
  
  // Actually, we replace everything between <div className="sidebar"> and the end of that block.
  // We know the block ends right before {/* Canvas Area */} (well, a few spaces/newlines before)
  // Let's be precise.
  
  // Find the matching closing div for sidebar.
  let openDivs = 0;
  let i = sidebarStart;
  while (i < content.length) {
    if (content.substr(i, 4) === '<div') openDivs++;
    else if (content.substr(i, 5) === '</div') {
      openDivs--;
      if (openDivs === 0) {
        i += 6; // include closing tag
        break;
      }
    }
    i++;
  }
  
  content = content.substring(0, sidebarStart) + newSidebar + content.substring(i);
}

// Remove unused state variables that were extracted
// searchQuery, expandedItems, activeCategory, arrowTop
content = content.replace(/\s*const \[searchQuery, setSearchQuery\] = useState\(''\);/, '');
content = content.replace(/\s*const \[expandedItems, setExpandedItems\] = useState<Record<string, boolean>>\(\{\}\);/, '');
// activeCategory and arrowTop are still used in Simulator? No, they were only for the palette!
// Wait, is activeCategory used in Simulator.tsx?
// In Simulator.tsx, line 81: `const [activeCategory, setActiveCategory] = useState<string | null>(null);`
// In line 86: `const [arrowTop, setArrowTop] = useState<number>(20);`
content = content.replace(/\s*const \[activeCategory, setActiveCategory\] = useState<string \| null>\(null\);/, '');
content = content.replace(/\s*const \[arrowTop, setArrowTop\] = useState<number>\(20\);/, '');

// Remove setActiveCategory(null) calls
content = content.replace(/setActiveCategory\(null\);/g, '');

fs.writeFileSync('src/pages/Simulator.tsx', content);
console.log("Updated Simulator.tsx");
