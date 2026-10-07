import React, { useEffect } from 'react';
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
      <div dangerouslySetInnerHTML={{ __html: `<main><section class="hero grid-bg" style="padding-bottom:56px"><svg class="traces" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 120H260V220H520V90H820V190H1200"/><path d="M0 420H180V340H430V470H700V380H1000V300H1200"/><path d="M300 700V560H620V620H900V520H1200"/></svg><div class="wrap" style="position:relative"><p class="eyebrow">Showcase</p><h1>See NodeSim <em>in Action.</em></h1>
<p class="lead">Explore how NodeSim brings circuit design, simulation, analysis, and engineering workflows into the browser.</p><div class="cta"><a class="btn" href="#full-showcase">Watch the Full Showcase →</a><a class="btn ghost" href="https://www.nodesimapp.com/simulator">Open Simulator →</a></div></div></section>
<section style="padding-top:24px"><div class="wrap"><article class="v rv" id="launch"><div class="vt"><span class="no">VIDEO 01 · LAUNCH FILM · ~30 s</span><h2>NodeSim Launch Film</h2><p>A 30-second launch film: from circuit design to simulation and waveform analysis, in the browser.</p><div class="chips"><span>Design</span><span>Simulate</span><span>Analyze</span></div><p class="note">Stylized visuals, not captured from the live simulator. The real interface is in the full showcase below.</p></div><button class="vid" data-src="videos/launch-film.html" data-preview="__PV_LAUNCH__" aria-label="Play: NodeSim Launch Film" onclick="playVideo(this)"><img src="/assets/poster-launch.jpg" width="1280" height="720" alt="Frame from NodeSim Launch Film" loading="lazy"><span class="play"></span><span class="meta">~30 s</span></button></article><article class="v rv" id="full-showcase"><div class="vt"><span class="no">VIDEO 02 · FULL PRODUCT SHOWCASE · ~4 min</span><h2>Full Product Showcase</h2><p>A walkthrough of the real product: the simulator, a completed run, the Grapher, the AI Circuit Debugger, the Circuit Library, and Publish to Gallery.</p><div class="chips"><span>Schematic</span><span>Grapher</span><span>AI Circuit Debugger</span><span>Circuit Library</span><span>Publish</span></div><p class="note">Built from real NodeSim screenshots. Press play for sound; narration uses your browser voice unless recorded clips are loaded.</p></div><button class="vid" data-src="videos/product-showcase.html" data-preview="__PV_SHOWCASE__" aria-label="Play: Full Product Showcase" onclick="playVideo(this)"><img src="/assets/poster-showcase.jpg" width="1280" height="720" alt="Frame from Full Product Showcase" loading="lazy"><span class="play"></span><span class="meta">~4 min</span></button></article><article class="v rv" id="engineering"><div class="vt"><span class="no">VIDEO 03 · ENGINEERING SIMULATION · ~6 min</span><h2>Engineering Simulation: the SS-HSIC-ECGC Converter</h2><p>Builds the Single-Switch Hybrid Switched-Inductor Enhanced Cubic Gain Converter stage by stage, runs it, and compares the real Grapher output with theory, including where they differ.</p><div class="chips"><span>Advanced circuit</span><span>Transient analysis</span><span>Theory vs simulation</span></div><p class="note">Workspace recreated from screenshots; Grapher frames are real captures.</p></div><button class="vid" data-src="videos/ss-hsic-ecgc.html" data-preview="__PV_ENG__" aria-label="Play: Engineering Simulation: the SS-HSIC-ECGC Converter" onclick="playVideo(this)"><img src="/assets/poster-engineering.jpg" width="1280" height="720" alt="Frame from Engineering Simulation: the SS-HSIC-ECGC Converter" loading="lazy"><span class="play"></span><span class="meta">~6 min</span></button></article><article class="v rv" id="tutorials"><div class="vt"><span class="no">VIDEO 04 · CIRCUIT TUTORIALS · ~1.5 min</span><h2>Circuit Tutorial: Build a Full-Wave Rectifier</h2><p>Place a source, a four-diode bridge, a filter capacitor and a load, then run the simulation and read the output.</p><div class="chips"><span>Rectifier</span><span>Beginner-friendly</span></div><p class="note">Workspace recreated from a screenshot; values taken from it.</p></div><button class="vid" data-src="videos/full-wave-rectifier.html" data-preview="__PV_TUT__" aria-label="Play: Circuit Tutorial: Build a Full-Wave Rectifier" onclick="playVideo(this)"><img src="/assets/poster-tutorial.jpg" width="1280" height="720" alt="Frame from Circuit Tutorial: Build a Full-Wave Rectifier" loading="lazy"><span class="play"></span><span class="meta">~1.5 min</span></button></article></div></section>
<section class="final"><div class="wrap rv"><p class="eyebrow">Your turn</p><h2>Build it yourself.</h2><p class="sub" style="margin-inline:auto">Open the simulator and try a circuit from the library.</p><div class="cta"><a class="btn" href="https://www.nodesimapp.com/simulator">Open Simulator →</a><a class="btn ghost" href="about.html">About NodeSim →</a></div></div></section></main>` }} />
    </div>
  );
}
