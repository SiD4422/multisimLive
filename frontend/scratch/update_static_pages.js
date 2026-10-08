const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector');

const NEW_DIR = 'C:/Users/spart/Downloads/nodesim-site (1)/nodesim-site';

async function processCss() {
  const cssPath = path.join(NEW_DIR, 'assets', 'site.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  const result = await postcss([
    prefixer({
      prefix: '.msl-static-page',
      transform(prefix, selector, prefixedSelector) {
        if (selector === ':root') {
          return ':root';
        }
        if (selector === 'body' || selector === 'html') {
          return prefix;
        }
        return prefixedSelector;
      }
    })
  ]).process(css, { from: cssPath });

  fs.writeFileSync('src/pages/StaticPages.css', result.css);
  console.log('CSS scoped properly using PostCSS');
}

function processHtml(filePath, pageName) {
  const html = fs.readFileSync(filePath, 'utf8');
  
  const headerEnd = html.indexOf('</header>');
  const footerStart = html.indexOf('<footer');
  
  if (headerEnd === -1 || footerStart === -1) {
      console.error('Could not find header/footer in ' + filePath);
      return;
  }
  
  const bodyContent = html.substring(headerEnd + 9, footerStart).trim();
  
  const componentCode = `import React, { useEffect, useState } from 'react';
import './StaticPages.css';

export function ${pageName}() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.msl-static-page .rv').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sc = document.getElementById('par');
    if (sc && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      let t = 0;
      const onScroll = () => {
        if (t) return;
        t = requestAnimationFrame(() => {
          t = 0;
          sc.style.transform = 'translateY(' + Math.min(40, window.scrollY * 0.06) + 'px)';
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);
  
  useEffect(() => {
    const handleVideoClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.vid');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const src = target.getAttribute('data-src');
        if (src) setVideoSrc('/' + src);
      }
    };
    document.addEventListener('click', handleVideoClick);
    return () => document.removeEventListener('click', handleVideoClick);
  }, []);

  return (
    <div className="msl-static-page">
      <div dangerouslySetInnerHTML={{ __html: \`<main>\n${bodyContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\$/g, '\\$')}\n</main>\` }} />
      
      {videoSrc && (
        <dialog open aria-label="Video player" style={{
            position: 'fixed', inset: 0, zIndex: 9999, margin: 'auto',
            background: 'rgba(0,0,0,0.9)', width: '100vw', height: '100vh',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none'
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '1200px', aspectRatio: '16/9' }}>
            <button 
              onClick={() => setVideoSrc(null)}
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
            >
              Close ✕
            </button>
            <iframe 
              src={videoSrc} 
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              allow="autoplay" 
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
`;

  const outPath = `src/pages/${pageName}.tsx`;
  fs.writeFileSync(outPath, componentCode);
  console.log(`Updated ${outPath}`);
}

async function run() {
  await processCss();
  processHtml(path.join(NEW_DIR, 'about.html'), 'AboutPage');
  processHtml(path.join(NEW_DIR, 'showcase.html'), 'ShowcasePage');
}

run();
