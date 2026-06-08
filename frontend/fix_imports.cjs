const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/AnalysisSettings.tsx',
  'src/components/ComponentInspectorPanel.tsx',
  'src/components/Grapher.tsx',
  'src/components/SchematicEditor.tsx',
  'src/components/SimulationControls.tsx',
  'src/components/symbols/InteractiveSlider.tsx',
  'src/components/symbols/KiCadSymbol.tsx',
  'src/components/symbols/TextAnnotation.tsx',
  'src/components/symbols/VoltageProbe.tsx',
  'src/pages/Layout.tsx',
  'src/pages/Simulator.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("from 'react'")) {
       content = "import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';\n" + content;
       fs.writeFileSync(filePath, content);
       console.log(`Fixed ${file}`);
    }
  }
});
