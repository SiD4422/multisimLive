import re

with open(r'C:\Users\spart\Downloads\nodesim-landing.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
styles = style_match.group(1) if style_match else ""

# Extract body
body_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
body = body_match.group(1) if body_match else ""

# Replace class -> className
body = body.replace('class="', 'className="')

# Replace inline styles
body = body.replace('style="position:absolute"', 'style={{ position: "absolute" }}')

# Replace SVG attributes
body = body.replace('stroke-width', 'strokeWidth')
body = body.replace('stroke-linecap', 'strokeLinecap')
body = body.replace('stroke-linejoin', 'strokeLinejoin')
body = body.replace('stroke-dasharray', 'strokeDasharray')
body = body.replace('fill-rule', 'fillRule')
body = body.replace('clip-rule', 'clipRule')

# Self-closing tags
body = body.replace('<br>', '<br />')
body = re.sub(r'(<input[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<circle[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<path[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<rect[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<stop[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<img[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<meta[^>]*)(?<!/)>', r'\1 />', body)
body = re.sub(r'(<link[^>]*)(?<!/)>', r'\1 />', body)

# Link replacement
body = re.sub(r'<a className="btn btn-primary" href="#">(.*?)</a>', r'<Link className="btn btn-primary" to="/simulator">\1</Link>', body, flags=re.DOTALL)
body = re.sub(r'<a className="btn btn-primary btn-lg" href="#">(.*?)</a>', r'<Link className="btn btn-primary btn-lg" to="/simulator">\1</Link>', body, flags=re.DOTALL)
body = body.replace('<a className="btn btn-primary" href="#">Launch Simulator</a>', '<Link className="btn btn-primary" to="/simulator">Launch Simulator</Link>')
body = body.replace('<a className="btn btn-primary btn-lg" href="#">Launch Simulator</a>', '<Link className="btn btn-primary btn-lg" to="/simulator">Launch Simulator</Link>')


# State
body = body.replace('id="hamburgerBtn"', 'id="hamburgerBtn" onClick={toggleMobileMenu}')
body = body.replace('<button className="icon-btn theme-toggle"', '<button className="icon-btn theme-toggle" onClick={toggleTheme}')
body = body.replace('<div className="mobile-panel" id="mobilePanel">', '<div className={`mobile-panel ${mobileOpen ? "open" : ""}`} id="mobilePanel">')
body = body.replace('className="hamburger"', 'className={`hamburger ${mobileOpen ? "open" : ""}`}')

# Tabs
body = re.sub(r'<button className="active">Schematic</button>', r'<button className={activeTab === "Schematic" ? "active" : ""} onClick={() => setActiveTab("Schematic")}>Schematic</button>', body)
body = re.sub(r'<button>Grapher</button>', r'<button className={activeTab === "Grapher" ? "active" : ""} onClick={() => setActiveTab("Grapher")}>Grapher</button>', body)
body = re.sub(r'<button>Split</button>', r'<button className={activeTab === "Split" ? "active" : ""} onClick={() => setActiveTab("Split")}>Split</button>', body)

body = body.replace('<span id="year"></span>', '<span>{year}</span>')

# Fix inline tags that are still open
# Find <input readonly ... > and replace with readonly
body = body.replace('readonly', 'readOnly')

react_code = f"""import React, {{ useState }} from 'react';
import {{ Link }} from 'react-router-dom';

export default function LandingPage() {{
  const [theme, setTheme] = useState('light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Schematic');

  const toggleTheme = () => {{
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }};

  const toggleMobileMenu = () => {{
    setMobileOpen(!mobileOpen);
  }};

  const year = new Date().getFullYear();

  return (
    <div data-theme={{theme}}>
      <style>{{`{styles}`}}</style>
      {body}
    </div>
  );
}}
"""

with open(r'c:\Users\spart\Desktop\test MultiSimlab\multisimfree\frontend\src\pages\LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(react_code)
