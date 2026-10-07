import React, { useEffect, useRef, useState } from 'react';
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
      <div dangerouslySetInnerHTML={{ __html: `<main>
<section class="hero" style="padding-bottom:40px"><svg class="traces" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 120H260V220H520V90H820V190H1200"/><path d="M0 420H180V340H430V470H700V380H1000V300H1200"/><path d="M300 700V560H620V620H900V520H1200"/></svg><div class="wrap" style="position:relative">
<p class="eyebrow">About NodeSim</p>
<h1>Making Circuit Simulation <em>Accessible</em> to Everyone.</h1>
<p class="lead">NodeSim is a modern, browser-based circuit simulation platform built for students, engineers, educators, researchers, and electronics enthusiasts. We combine the power of ngspice with the flexibility of the web to bring professional-grade simulation directly to your browser.</p>
<div class="cta"><a class="btn" href="https://www.nodesimapp.com/simulator">Try NodeSim →</a><a class="btn ghost" href="showcase.html#full-showcase">Watch Product Demo →</a></div>
<div class="stage rv"><div class="frame"><div class="bar"><i></i><i></i><i></i><span>nodesimapp.com/simulator</span></div><img src="/assets/sim-opamp.jpg" width="1500" height="808" alt="NodeSim simulator showing an op-amp circuit with voltage probes after a completed run"></div>
<div class="frame second" id="par"><div class="bar"><i></i><i></i><i></i><span>Grapher · Transient</span></div><img src="/assets/grapher.jpg" width="1500" height="780" alt="NodeSim Grapher showing transient analysis traces and a cursor readout" loading="lazy"></div>
<p class="cap">Real NodeSim interface: schematic with probes (left, op-amp circuit) and the Grapher with cursor readout (right, converter circuit).</p></div>
</div></section>
<section id="story"><div class="wrap"><div class="rv"><p class="eyebrow">Our Story</p><h2>Built by Engineers, for Engineers.</h2>
<p class="sub">Traditional circuit simulators are powerful, but they often come with installation, complex setup, desktop environments, or licensing. NodeSim explores a simpler approach.</p></div>
<div class="steps"><div class="step rv"><b>01</b><h3>Open the browser</h3><p>No installation. No account needed.</p></div><div class="step rv"><b>02</b><h3>Build the circuit</h3><p>Drag components from the library onto the schematic canvas.</p></div><div class="step rv"><b>03</b><h3>Run the simulation</h3><p>ngspice, compiled to WebAssembly, solves it in the page.</p></div><div class="step rv"><b>04</b><h3>Analyze the result</h3><p>Transient, AC and DC analysis, with cursors, FFT and PNG/CSV export in the Grapher.</p></div></div>
</div></section>
<section class="alt"><div class="wrap two"><div class="rv"><p class="eyebrow">A real run</p><h2>Serious circuits, in a tab.</h2><p class="sub">NodeSim isn't limited to textbook examples. This is the SS-HSIC-ECGC converter from the Circuit Library, simulated in the browser with node voltages overlaid on the schematic.</p></div>
<div class="rv"><div class="frame"><img src="/assets/converter.jpg" width="1500" height="793" alt="NodeSim schematic of the SS-HSIC-ECGC converter with node voltage overlays" loading="lazy"></div><p class="cap">Captured at t = 7.739 ms of a 10 ms transient run.</p></div></div></section>
<section><div class="wrap"><div class="cards"><article class="card rv"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="3"/></svg><h3>Our Mission</h3><p>Make professional-grade circuit simulation simple, accessible, and free for everyone.</p></article>
<article class="card rv"><svg viewBox="0 0 32 32"><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z"/><circle cx="16" cy="16" r="4"/></svg><h3>Our Vision</h3><p>A world where anyone can explore, learn, and innovate in electronics without unnecessary barriers.</p></article>
<article class="card rv"><svg viewBox="0 0 32 32"><path d="M16 3l11 5v8c0 7-5 11-11 13C10 27 5 23 5 16V8z"/></svg><h3>Our Values</h3><ul><li>Open &amp; Accessible</li><li>Engineer-Focused</li><li>Continuous Innovation</li><li>Community Driven</li></ul></article></div></div></section>
<section class="alt" style="padding:72px 0"><div class="wrap"><div class="strip rv"><div><b>100%</b><span>Free &amp; Open Source</span></div><div><b>In the browser</b><span>No installation needed</span></div><div><b>ngspice</b><span>Real SPICE simulation</span></div><div><b>For everyone</b><span>Students · Engineers · Educators</span></div></div>
<svg class="wave" viewBox="0 0 1200 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 23C40 0 80 0 120 23S200 46 240 23 320 0 360 23s80 23 120 0 80-23 120 0 80 23 120 0 80-23 120 0 80 23 120 0 80-23 120 0"/></svg></div></section>
<section id="technology"><div class="wrap"><div class="rv"><p class="eyebrow">Technology behind NodeSim</p><h2>Modern Web Technologies. Real Power.</h2></div>
<div class="cards"><article class="card rv"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="5"/><path d="M16 2v5M16 25v5M2 16h5M25 16h5"/></svg><h3>ngspice</h3><p>Industry-standard SPICE simulation, compiled to WebAssembly for the web.</p></article><article class="card rv"><svg viewBox="0 0 32 32"><path d="M2 16c4-12 8-12 12 0s8 12 12 0 2-6 4-6"/><path d="M2 28h28" /></svg><h3>WebAssembly</h3><p>High-performance simulation running directly in the browser.</p></article><article class="card rv"><svg viewBox="0 0 32 32"><path d="M4 16h6l3-8 6 16 3-8h6"/></svg><h3>Modern Web Stack</h3><p>Built with React, TypeScript, and modern web technologies.</p></article></div>
<div class="evidence rv"><img src="/assets/status-strip.jpg" width="700" height="53" alt="NodeSim status bar reading Ready, ngspice (WASM), Components 6, Wires 4" loading="lazy"><p class="cap" style="margin:0">From the live simulator: the status bar reports the engine as “ngspice (WASM)”.</p></div></div></section>
<section class="alt" id="demo"><div class="wrap"><div class="center rv"><p class="eyebrow">See NodeSim in action</p><h2>From Circuit to Simulation.</h2><p class="sub">See how NodeSim takes a circuit from design to simulation and waveform analysis.</p></div>
<div class="rv" style="margin-top:48px"><button class="vid" data-mode="dialog" data-src="videos/product-showcase.html" data-preview="__PV_SHOWCASE__" aria-label="Play the NodeSim product showcase" onclick="playVideo(this)"><img src="/assets/poster-showcase.jpg" width="1280" height="720" alt="Frame from the NodeSim product showcase video" loading="lazy"><span class="play"></span><span class="meta">Product showcase</span></button></div>
<div class="center rv" style="margin-top:36px"><a class="btn" href="showcase.html#full-showcase">Watch the Full Product Showcase →</a></div></div></section>
<section class="final"><div class="wrap rv"><p class="eyebrow">Open &amp; improving</p><h2>Be Part of the Journey.</h2><p class="sub" style="margin-inline:auto">NodeSim is an open project, and we are constantly improving. Explore, give feedback, contribute, or just spread the word.</p>
<div class="cta"><a class="btn" href="https://www.nodesimapp.com/simulator">Open Simulator →</a><a class="btn ghost" href="#github" data-todo="Add the real GitHub repository URL">View on GitHub →</a></div></div></section>
</main>` }} />

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
