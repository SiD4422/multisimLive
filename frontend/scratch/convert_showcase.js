const fs = require('fs');
let html = fs.readFileSync('C:/Users/spart/Downloads/nodesim-site/nodesim-site/showcase.html', 'utf8');
let mainMatch = html.match(/<main>([\s\S]*?)<\/main>/);

if (mainMatch) {
    let mainHtml = mainMatch[0];
    mainHtml = mainHtml.replace(/src="assets\//g, 'src="/assets/');

    let tsx = `import React, { useEffect } from 'react';
import './AboutPage.css'; // Reusing the same scoped CSS

export function ShowcasePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.about-page .rv').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVideoClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.vid') as HTMLButtonElement;
      if (btn && btn.dataset.src) {
        e.preventDefault();
        e.stopPropagation();
        
        // Inline replace the button with an iframe (same logic as the original script)
        const iframe = document.createElement('iframe');
        iframe.src = "/" + btn.dataset.src;
        iframe.title = btn.getAttribute('aria-label') || 'Video';
        iframe.allow = 'autoplay';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        
        btn.replaceChildren(iframe);
        btn.classList.add('vp');
        btn.onclick = null;
      }
    };
    document.addEventListener('click', handleVideoClick);
    return () => document.removeEventListener('click', handleVideoClick);
  }, []);

  return (
    <div className="about-page">
      <div dangerouslySetInnerHTML={{ __html: \`${mainHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
    </div>
  );
}
`;
    fs.writeFileSync('src/pages/ShowcasePage.tsx', tsx);
    console.log('ShowcasePage.tsx safely generated!');
}
