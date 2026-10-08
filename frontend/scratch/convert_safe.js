const fs = require('fs');

let html = fs.readFileSync('scratch/main.html', 'utf8');

// Replace relative assets to absolute /assets/
html = html.replace(/src="assets\//g, 'src="/assets/');

let tsx = `import React, { useEffect, useRef, useState } from 'react';
import './AboutPage.css';

export function AboutPage() {
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
    // Intercept clicks on the video buttons
    const handleVideoClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.vid');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        setVideoSrc('/videos/product-showcase.html');
      }
    };
    document.addEventListener('click', handleVideoClick);
    return () => document.removeEventListener('click', handleVideoClick);
  }, []);

  return (
    <div className="about-page">
      <div dangerouslySetInnerHTML={{ __html: \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />

      {videoSrc && (
        <dialog 
          open 
          className="about-video-dialog" 
          style={{ width: 'min(1100px, 94vw)', border: '1px solid var(--line)', borderRadius: 14, background: '#000', padding: 0, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, display: 'block' }}
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

fs.writeFileSync('src/pages/AboutPage.tsx', tsx);
console.log('AboutPage.tsx safely generated!');
