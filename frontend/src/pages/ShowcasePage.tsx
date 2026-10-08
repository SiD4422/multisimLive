import React, { useEffect, useState } from 'react';
import './StaticPages.css';

export function ShowcasePage() {
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
      <div dangerouslySetInnerHTML={{ __html: `<main>
<main id="main"><section class="hero gridbg" style="padding-bottom:40px"><svg class="traces" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 120H260V220H520V90H820V190H1200"/><path d="M0 420H180V340H430V470H700V380H1000V300H1200"/><path d="M300 700V560H620V620H900V520H1200"/></svg><div class="wrap" style="position:relative"><span class="pill up"><i></i>SHOWCASE</span><h1 class="up" style="--d:.08s">See NodeSim <em>in Action.</em></h1>
<p class="lead up" style="--d:.16s">Explore how NodeSim brings circuit design, simulation, analysis, and engineering workflows into the browser.</p>
<div class="feat up" id="full-showcase" style="--d:.28s;margin-top:48px"><button class="vid" data-src="videos/product-showcase.html" data-preview="__PV_SHOWCASE__" aria-label="Play the Full Product Showcase" onclick="playVideo(this)"><img src="assets/poster-showcase.jpg" width="1280" height="720" alt="Frame from the Full Product Showcase"><span class="play"></span><span class="meta"><span>Featured · Full Product Showcase</span><span>~4 min</span></span></button></div></div></section>
<section style="padding-top:72px"><div class="wrap"><div class="row feat" style="margin:0"><div class="rv"><p class="eyebrow">Featured</p><h2>Full Product Showcase</h2><p class="sub">A walkthrough of the real product — simulator, completed run, Grapher, AI Circuit Debugger, Circuit Library and Publish to Gallery — built from real NodeSim screenshots.</p><div class="cta" style="margin-top:28px"><button class="btn" data-src="videos/product-showcase.html" data-preview="__PV_SHOWCASE__" data-mode="dialog" aria-label="Play the Full Product Showcase" onclick="playVideo(this)">Play the showcase <span class="ar">→</span></button></div></div><ol class="rv" style="--d:.1s"><li>Design — the simulator workspace and a first circuit</li><li>Simulate — Run, ngspice (WASM), probe readings</li><li>Analyze — the Grapher, cursors, zoom, export</li><li>Intelligence — the AI Circuit Debugger</li><li>From simple to advanced — the SS-HSIC-ECGC converter</li><li>Circuit Library and Publish to Gallery</li></ol></div>
<div style="text-align:center" class="rv"><div class="seg" role="group" aria-label="Filter videos"><button aria-pressed="true" data-k="all">All films</button><button aria-pressed="false" data-k="eng">Engineering</button><button aria-pressed="false" data-k="tut">Tutorials</button></div></div>
<div class="vgrid"><article class="vc spot rv" id="launch" data-k="all product"><button class="vid" data-src="videos/launch-film.html" data-preview="__PV_LAUNCH__" aria-label="Play: Launch Film — NodeSim Launch Film" onclick="playVideo(this)"><img src="assets/poster-launch.jpg" width="1280" height="720" alt="Frame from NodeSim Launch Film" loading="lazy"><span class="play"></span><span class="meta"><span>Launch Film</span><span>~30 s</span></span></button><div class="bd"><span class="no">LAUNCH FILM</span><h3>NodeSim Launch Film</h3><p>A 30-second launch film: from circuit design to simulation and waveform analysis.</p><div class="chips"><span>Design</span><span>Simulate</span><span>Analyze</span></div><p class="note">Illustrative visuals and values — not real simulation data.</p></div></article><article class="vc spot rv" id="engineering" data-k="eng"><button class="vid" data-src="videos/ss-hsic-ecgc.html" data-preview="__PV_ENG__" aria-label="Play: Engineering Simulation — The SS-HSIC-ECGC Converter" onclick="playVideo(this)"><img src="assets/poster-engineering.jpg" width="1280" height="720" alt="Frame from The SS-HSIC-ECGC Converter" loading="lazy"><span class="play"></span><span class="meta"><span>Engineering Simulation</span><span>~6 min</span></span></button><div class="bd"><span class="no">ENGINEERING SIMULATION</span><h3>The SS-HSIC-ECGC Converter</h3><p>Builds the converter stage by stage, runs it, and compares the real Grapher output with theory — including where they differ.</p><div class="chips"><span>Advanced circuit</span><span>Transient</span><span>Theory vs simulation</span></div><p class="note">Workspace recreated from screenshots; Grapher frames are real captures.</p></div></article><article class="vc spot rv" id="tutorials" data-k="tut"><button class="vid" data-src="videos/full-wave-rectifier.html" data-preview="__PV_TUT__" aria-label="Play: Circuit Tutorial — Build a Full-Wave Rectifier" onclick="playVideo(this)"><img src="assets/poster-tutorial.jpg" width="1280" height="720" alt="Frame from Build a Full-Wave Rectifier" loading="lazy"><span class="play"></span><span class="meta"><span>Circuit Tutorial</span><span>~1.5 min</span></span></button><div class="bd"><span class="no">CIRCUIT TUTORIAL</span><h3>Build a Full-Wave Rectifier</h3><p>Place a source, a four-diode bridge, a filter capacitor and a load, then run the simulation and read the output.</p><div class="chips"><span>Rectifier</span><span>Beginner-friendly</span></div><p class="note">Workspace recreated from a screenshot; values taken from it.</p></div></article></div></div></section>
<section class="final gridbg"><div class="wrap rv" style="position:relative"><p class="eyebrow">Your turn</p><h2>Build it <em>yourself.</em></h2><p class="sub" style="margin-inline:auto">Open the simulator and try a circuit from the library. Free, open source, no account needed.</p><div class="cta"><a class="btn" href="https://www.nodesimapp.com/simulator">Open Simulator <span class="ar">→</span></a><a class="btn ghost" href="about.html">About NodeSim <span class="ar">→</span></a></div></div></section></main>
</main>` }} />
      
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
