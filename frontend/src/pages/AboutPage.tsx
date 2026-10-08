import React, { useEffect, useState } from 'react';
import './StaticPages.css';

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
<main id="main">
<section class="hero" style="padding-bottom:0"><svg class="traces" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 120H260V220H520V90H820V190H1200"/><path d="M0 420H180V340H430V470H700V380H1000V300H1200"/><path d="M300 700V560H620V620H900V520H1200"/></svg><div class="wrap" style="position:relative">
<span class="pill up"><i></i>FREE · OPEN SOURCE · NO ACCOUNT NEEDED</span>
<h1 class="up" style="--d:.08s">Making Circuit Simulation <em>Accessible</em> to Everyone.</h1>
<p class="lead up" style="--d:.16s">NodeSim is a modern, browser-based circuit simulation platform built for students, engineers, educators, researchers, and electronics enthusiasts. We combine the power of ngspice with the flexibility of the web to bring professional-grade simulation directly to your browser.</p>
<div class="cta up" style="--d:.24s"><a class="btn" href="https://www.nodesimapp.com/simulator">Try NodeSim <span class="ar">→</span></a><a class="btn ghost" href="showcase.html#full-showcase">Watch Product Demo <span class="ar">→</span></a></div>
<ul class="facts up" style="--d:.32s"><li>ngspice compiled to WebAssembly</li><li>Transient · AC sweep · DC</li><li>MIT License</li></ul>
<div class="stage up" style="--d:.4s">
<div class="frame">
<div class="bar"><i></i><i></i><i></i><span>nodesimapp.com/simulator</span></div>
<video src="videos/hero-demo.mp4" autoplay loop muted playsinline style="width: 100%; height: auto; display: block; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;"></video>
</div>
</div>
<p class="cap" style="margin:0;padding-bottom:40px">Real NodeSim interface — complete browser-based SPICE simulation in action.</p>
</div></section>
<section id="story"><div class="wrap split"><div class="rv"><p class="eyebrow">Our Story</p><h2>Built by Engineers, for Engineers.</h2><p class="sub">Traditional circuit simulators are powerful, but they often come with installation, complex setup, desktop environments, or licensing. NodeSim explores a simpler approach.</p></div>
<ol class="stepper rv" style="--d:.1s"><li><b>01</b><h3>Open the browser</h3><p>No installation. No account needed.</p></li><li><b>02</b><h3>Build the circuit</h3><p>Drag components from the library onto the schematic canvas.</p></li><li><b>03</b><h3>Run the simulation</h3><p>ngspice, compiled to WebAssembly, solves it in the page.</p></li><li><b>04</b><h3>Analyze the result</h3><p>Transient, AC and DC analysis, with cursors, FFT and PNG/CSV export in the Grapher.</p></li></ol></div></section>
<section class="alt" id="tour"><div class="wrap"><div class="rv"><p class="eyebrow">The product</p><h2>Real circuits. Real results. In a tab.</h2><p class="sub">Everything below is the live NodeSim interface — not a mock-up.</p></div>
<div class="bento"><article class="tile spot t1 rv"><div class="im"><img src="assets/converter.jpg" alt="NodeSim schematic of the SS-HSIC-ECGC converter with node voltage overlays" width="1200" height="800"></div><div class="tx"><h3>Schematic and simulation</h3><p>Draw circuits on a schematic canvas and run them. Node voltages are overlaid on the wires (SS-HSIC-ECGC converter, t = 7.739 ms).</p></div></article><article class="tile spot t2 rv"><div class="im"><img src="assets/tile-grapher.jpg" alt="NodeSim Grapher with transient traces and a readout" width="1200" height="800" loading="lazy"></div><div class="tx"><h3>Grapher</h3><p>Transient analysis with cursor readouts, FFT, scope and digital views, and PNG and CSV export.</p></div></article><article class="tile spot t3 rv"><div class="im"><img src="assets/tile-ai.jpg" alt="NodeSim AI Circuit Debugger panel" width="1200" height="800" loading="lazy"></div><div class="tx"><h3>AI Circuit Debugger</h3><p>Diagnose, Chat and Explain. The netlist goes to Google Gemini; the API key stays local.</p></div></article><article class="tile spot t4 rv"><div class="im"><img src="assets/tile-library.jpg" alt="NodeSim Circuit Library with search, filters and circuit cards" width="1200" height="800" loading="lazy"></div><div class="tx"><h3>Circuit Library</h3><p>Simulation-ready circuits — filters, rectifiers, amplifiers, switching, sources — that open in the simulator.</p></div></article><article class="tile spot t5 rv"><div class="im"><img src="assets/tile-publish.jpg" alt="NodeSim Publish to Gallery dialog" width="1200" height="800" loading="lazy"></div><div class="tx"><h3>Publish to Gallery</h3><p>Share a circuit publicly with the NodeSim community.</p></div></article></div></div></section>
<section id="mission"><div class="wrap"><div class="cards">
<article class="card spot rv"><span class="n">01</span><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="4"/><path d="M16 1v5M16 26v5M1 16h5M26 16h5"/></svg><h3>Our Mission</h3><p>Make professional-grade circuit simulation simple, accessible, and free for everyone.</p></article>
<article class="card spot rv" style="--d:.08s"><span class="n">02</span><svg viewBox="0 0 32 32"><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z"/><circle cx="16" cy="16" r="4"/></svg><h3>Our Vision</h3><p>A world where anyone can explore, learn, and innovate in electronics without unnecessary barriers.</p></article>
<article class="card spot rv" style="--d:.16s"><span class="n">03</span><svg viewBox="0 0 32 32"><path d="M16 3l11 5v8c0 7-5 11-11 13C10 27 5 23 5 16V8z"/><path d="M11 16l4 4 7-8"/></svg><h3>Our Values</h3><ul><li>Open &amp; Accessible</li><li>Engineer-Focused</li><li>Continuous Innovation</li><li>Community Driven</li></ul></article></div></div></section>
<section class="alt" style="padding:96px 0"><div class="wrap"><div class="strip rv"><div><b><em>100%</em></b><span>Free &amp; Open Source</span></div><div><b>In the browser</b><span>No installation needed</span></div><div><b>ngspice</b><span>Real SPICE simulation</span></div><div><b>For everyone</b><span>Students · Engineers · Educators</span></div></div></div></section>
<section id="technology"><div class="wrap"><div class="rv"><p class="eyebrow">Technology behind NodeSim</p><h2>Modern Web Technologies. <em>Real Power.</em></h2></div>
<div class="arch rv"><span class="lbl">YOUR BROWSER TAB</span><div class="flow"><div class="node"><b>Schematic</b><span>components · wires</span></div><div class="link"></div><div class="node"><b>Netlist</b><span>circuit description</span></div><div class="link"></div><div class="node hot"><b>ngspice</b><span>WebAssembly</span></div><div class="link"></div><div class="node"><b>Grapher</b><span>waveforms · readouts</span></div></div>
<div class="evid"><img src="assets/chip-status.jpg" width="640" height="64" alt="Status bar reading ngspice (WASM)" loading="lazy"><p class="cap" style="margin:0">From the live simulator: the status bar reports the engine as “ngspice (WASM)”.</p></div></div>
<div class="cards"><article class="card spot rv"><span class="n">01</span><h3>ngspice</h3><p>Industry-standard SPICE simulation, compiled to WebAssembly for the web.</p></article><article class="card spot rv" style="--d:.08s"><span class="n">02</span><h3>WebAssembly</h3><p>High-performance simulation running directly in the browser.</p></article><article class="card spot rv" style="--d:.16s"><span class="n">03</span><h3>Modern Web Stack</h3><p>Built with React, TypeScript, and modern web technologies.</p></article></div></div></section>
<section class="alt" id="demo"><div class="wrap"><div class="center rv"><p class="eyebrow">See NodeSim in action</p><h2>From Circuit to <em>Simulation.</em></h2><p class="sub">See how NodeSim takes a circuit from design to simulation and waveform analysis.</p></div>
<div class="rv" style="margin-top:56px"><button class="vid" data-mode="dialog" data-src="videos/product-showcase.html" data-preview="__PV_SHOWCASE__" aria-label="Play the NodeSim product showcase" onclick="playVideo(this)"><img src="assets/poster-showcase.jpg" width="1280" height="720" alt="Frame from the NodeSim product showcase video" loading="lazy"><span class="play"></span><span class="meta"><span>Product showcase</span><span>Real NodeSim captures</span></span></button></div>
<div class="chaps rv"><span>Schematic</span><span>Simulation</span><span>Grapher</span><span>AI Debugger</span><span>Circuit Library</span><span>Publish</span></div>
<div class="center rv" style="margin-top:44px"><a class="btn" href="showcase.html#full-showcase">Watch the Full Product Showcase <span class="ar">→</span></a></div></div></section>
<section class="final gridbg"><div class="wrap rv" style="position:relative"><p class="eyebrow">Open &amp; improving</p><h2>Be Part of the <em>Journey.</em></h2><p class="sub" style="margin-inline:auto">NodeSim is an open project, and we are constantly improving. Explore, give feedback, contribute, or just spread the word.</p>
<div class="cta"><a class="btn" href="https://www.nodesimapp.com/simulator">Open Simulator <span class="ar">→</span></a><a class="btn ghost" href="#github" data-todo="Add the real GitHub repository URL">View on GitHub <span class="ar">→</span></a></div></div></section>
</main>
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
