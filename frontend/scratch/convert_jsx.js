const fs = require('fs');

let html = fs.readFileSync('scratch/main.html', 'utf8');

// Convert HTML to JSX
html = html.replace(/class=/g, 'className=');
html = html.replace(/<img(.*?)>/g, (match) => {
    if (!match.endsWith('/>')) return match.replace('>', ' />');
    return match;
});
html = html.replace(/<path(.*?)>/g, (match) => {
    if (!match.endsWith('/>')) return match.replace('>', ' />');
    return match;
});
html = html.replace(/<circle(.*?)>/g, (match) => {
    if (!match.endsWith('/>')) return match.replace('>', ' />');
    return match;
});
html = html.replace(/<input(.*?)>/g, (match) => {
    if (!match.endsWith('/>')) return match.replace('>', ' />');
    return match;
});
html = html.replace(/style="([^"]*)"/g, (match, p1) => {
    // Convert style="padding-bottom:40px" to style={{ paddingBottom: '40px' }}
    let styles = p1.split(';').filter(Boolean).map(s => {
        let [key, val] = s.split(':');
        if (!key || !val) return '';
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${key}: '${val.trim()}'`;
    }).join(', ');
    return `style={{ ${styles} }}`;
});

// Fix character encodings: 'A' to '·', '+' to '→', '?' to '"'
html = html.replace(/A/g, '·');
html = html.replace(/\+/g, '→');
html = html.replace(/\?/g, '"');
html = html.replace(/-/g, '-');
html = html.replace(/o/g, '×');


let tsx = `import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

export function AboutPage() {
  const parRef = useRef<HTMLDivElement>(null);
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

    document.querySelectorAll('.about-page .rv').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sc = parRef.current;
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

  return (
    <div className="about-page">
      ${html}

      {videoSrc && (
        <dialog 
          open 
          className="about-video-dialog" 
          onClick={() => setVideoSrc(null)}
          style={{ width: 'min(1100px, 94vw)', border: '1px solid var(--line)', borderRadius: 14, background: '#000', padding: 0, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}
        >
          <button 
            onClick={() => setVideoSrc(null)}
            style={{ position: 'absolute', right: 10, top: 10, zIndex: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
          >
            Close ×
          </button>
          <iframe src={videoSrc} title="NodeSim video" allow="autoplay" style={{ width: '100%', aspectRatio: '16/9', border: 0, display: 'block' }}></iframe>
        </dialog>
      )}
      {videoSrc && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999 }} onClick={() => setVideoSrc(null)} />}
    </div>
  );
}
`;

// Fix remaining issues in html string
tsx = tsx.replace(/onclick="[^"]*"/g, (match) => {
    if(match.includes('playVideo')) {
        return `onClick={(e) => { e.preventDefault(); setVideoSrc('/videos/product-showcase.html'); }}`;
    }
    return '';
});

// Need to update image URLs to /assets/...
tsx = tsx.replace(/src="assets\//g, 'src="/assets/');

// Replace links to html with React Router links if appropriate, or just keep a href
tsx = tsx.replace(/href="showcase.html/g, 'href="/showcase');

fs.writeFileSync('src/pages/AboutPage.tsx', tsx);
console.log('AboutPage.tsx generated!');
