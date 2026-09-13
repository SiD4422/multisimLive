import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <>
      <style>{`
        :root{
          --ink:#0f172a;
          --muted:#5b6b7b;
          --muted-soft:#8a9aa8;
          --line:#e3ece6;
          --green-100:#dcfce7;
          --green-500:#22c55e;
          --green-600:#16a34a;
          --green-700:#15803d;
          --green-800:#166534;
          --dark-1:#081712;
          --dark-2:#0e2b1d;
          --dark-line:rgba(255,255,255,.09);
        }
        .lp *{box-sizing:border-box;}
        .lp{
          font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
          color:var(--ink);
          background:
            radial-gradient(1100px 560px at 88% -8%, rgba(34,197,94,.12), transparent 60%),
            linear-gradient(180deg,#ffffff,#f5fdf8 60%,#eff9f3);
          overflow-x:hidden;
          -webkit-font-smoothing:antialiased;
          min-height:100vh;
        }
        .lp a{color:inherit;text-decoration:none;}
        .lp button{font-family:inherit;cursor:pointer;background:none;border:0;}
        .lp-header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(12px);}
        .lp-header-inner{display:flex;align-items:center;justify-content:space-between;padding:5px 24px;max-width:100%;margin:0 auto;position:relative;}
        .lp-logo img{height:110px;object-fit:contain;}
        .lp-nav-links{display:flex;align-items:center;gap:34px;}
        .lp-nav-links a{font-size:15px;font-weight:500;color:#334155;transition:color .15s;}
        .lp-nav-links a:hover{color:var(--green-700);}
        .lp-nav-toggle{display:none;padding:8px;}
        .lp-header-actions{display:flex;align-items:center;gap:14px;}
        .lp-btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;font-weight:700;white-space:nowrap;border:1.5px solid transparent;transition:transform .15s,box-shadow .15s,background .15s,border-color .15s;}
        .lp-btn:active{transform:translateY(1px);}
        .lp-btn-cta{background:var(--green-600);color:#fff;padding:11px 20px;font-size:14.5px;box-shadow:0 8px 20px -6px rgba(22,163,74,.55);}
        .lp-btn-cta:hover{background:var(--green-700);}
        @media(max-width:420px){.lp-cta-text{display:none;}}
        .lp-hero{max-width:1360px;margin:0 auto;padding:64px 56px 170px;display:grid;grid-template-columns:1fr 1.08fr;gap:64px;align-items:center;}
        .lp-badge{display:inline-flex;align-items:center;gap:7px;background:var(--green-100);color:var(--green-800);padding:7px 16px;border-radius:999px;font-size:12.5px;font-weight:700;letter-spacing:.02em;margin-bottom:26px;}
        .lp-badge svg{width:13px;height:13px;flex-shrink:0;}
        .lp-title{font-size:clamp(2.6rem,2rem + 2.6vw,4.35rem);font-weight:800;line-height:1.04;letter-spacing:-.025em;margin:0 0 22px;}
        .lp-title .l1{color:var(--ink);display:block;}
        .lp-title .l2{color:var(--green-600);display:block;}
        .lp-lede{font-size:18px;line-height:1.65;color:var(--muted);max-width:490px;margin:0 0 34px;}
        .lp-hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:52px;}
        .lp-btn-primary{background:var(--green-600);color:#fff;padding:15px 26px;font-size:15.5px;box-shadow:0 10px 24px -8px rgba(22,163,74,.55);}
        .lp-btn-primary:hover{background:var(--green-700);}
        .lp-btn-secondary{background:#fff;color:var(--ink);padding:15px 26px;font-size:15.5px;border-color:var(--line);}
        .lp-btn-secondary:hover{border-color:#c8d6cd;background:#fafefc;}
        .lp-stats{display:grid;grid-template-columns:repeat(4,auto);gap:34px;}
        .lp-stat{display:flex;flex-direction:column;gap:7px;}
        .lp-stat svg{width:24px;height:24px;color:var(--green-600);}
        .lp-stat .t{font-size:15.5px;font-weight:700;color:var(--ink);}
        .lp-stat .s{font-size:12.5px;color:var(--muted-soft);line-height:1.35;}
        .lp-visual-wrap{position:relative;}
        .lp-eyebrow-row{display:flex;justify-content:flex-end;gap:10px;font-size:12px;font-weight:700;letter-spacing:.13em;color:rgba(21,74,50,.34);margin:0 14px -16px 0;}
        .lp-eyebrow-row .sep{opacity:.5;}
        .lp-glow{position:absolute;top:-60px;right:-40px;width:420px;height:420px;background:radial-gradient(circle,rgba(34,197,94,.32),transparent 70%);filter:blur(50px);z-index:0;pointer-events:none;}
        .lp-mockup{position:relative;z-index:1;background:linear-gradient(165deg,var(--dark-2),var(--dark-1));border-radius:20px;border:1px solid rgba(34,197,94,.22);box-shadow:0 40px 70px -25px rgba(3,20,12,.55),0 0 0 1px rgba(255,255,255,.03) inset;overflow:hidden;}
        .lp-m-titlebar{display:flex;gap:6px;padding:13px 16px 0;}
        .lp-m-dot{width:10px;height:10px;border-radius:50%;}
        .lp-m-dot.r{background:#ff6157;}.lp-m-dot.y{background:#ffbd2e;}.lp-m-dot.g{background:#2ecd6f;}
        .lp-m-header{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 9px;}
        .lp-m-logo{display:flex;align-items:center;gap:6px;font-weight:800;font-size:14px;color:#fff;}
        .lp-m-logo svg{width:15px;height:15px;}
        .lp-m-nav{display:flex;gap:15px;font-size:10px;font-weight:700;letter-spacing:.07em;color:rgba(255,255,255,.4);}
        .lp-m-toolbar{display:flex;align-items:center;gap:16px;padding:9px 18px;border-top:1px solid var(--dark-line);border-bottom:1px solid var(--dark-line);}
        .lp-m-interactive{display:flex;align-items:center;gap:6px;font-size:11.5px;color:rgba(255,255,255,.5);}
        .lp-m-interactive svg{width:13px;height:13px;}
        .lp-m-run{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.09);padding:5px 12px;border-radius:7px;font-size:11.5px;font-weight:700;color:#fff;}
        .lp-m-run svg{width:9px;height:9px;}
        .lp-m-tabs{display:flex;gap:3px;margin-left:auto;background:rgba(255,255,255,.05);padding:3px;border-radius:8px;}
        .lp-m-tab{padding:6px 13px;border-radius:6px;font-size:10.5px;font-weight:700;letter-spacing:.02em;color:rgba(255,255,255,.4);}
        .lp-m-tab.active{background:#fff;color:#0d2417;}
        .lp-m-body{display:grid;grid-template-columns:1.05fr 1fr;min-height:230px;}
        .lp-m-schema{padding:16px;display:flex;align-items:center;justify-content:center;}
        .lp-m-schema svg{width:100%;height:auto;display:block;max-width:250px;}
        .lp-m-chart{padding:18px 16px;border-left:1px solid var(--dark-line);}
        .lp-m-chart-title{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.55);margin-bottom:6px;}
        .lp-m-chart svg{width:100%;height:auto;display:block;}
        .lp-chip{position:absolute;display:flex;align-items:center;gap:10px;background:rgba(9,28,19,.88);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 15px;box-shadow:0 16px 30px -12px rgba(2,15,9,.5);color:#fff;font-weight:700;font-size:13px;line-height:1.25;z-index:2;}
        .lp-chip svg{width:19px;height:19px;color:var(--green-500);flex-shrink:0;}
        .lp-chip-1{top:-26px;right:-18px;transform:rotate(-6deg);}
        .lp-chip-2{left:-48px;bottom:96px;transform:rotate(4deg);}
        .lp-chip-3{right:26px;bottom:-22px;transform:rotate(-3deg);}
        .lp-chip-arrow{width:15px!important;height:15px!important;color:rgba(255,255,255,.6)!important;margin-left:2px;}
        .lp-note{position:absolute;left:2%;bottom:-54px;font-family:'Caveat',cursive;font-weight:700;font-size:1.9rem;line-height:1;color:var(--green-700);transform:rotate(-4deg);z-index:2;}
        .lp-note svg{display:block;margin-top:-4px;width:150px;}
        @media (max-width:1024px){
          .lp-hero{grid-template-columns:1fr;padding-bottom:230px;}
          .lp-visual-wrap{max-width:640px;margin:0 auto;}
        }
        @media (max-width:900px){
          .lp-nav-links{position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 24px 20px;display:none;box-shadow:0 14px 24px -12px rgba(0,0,0,.15);}
          .lp-nav-links.open{display:flex;}
          .lp-nav-toggle{display:flex;align-items:center;justify-content:center;}
        }
        @media (max-width:760px){
          .lp-stats{grid-template-columns:1fr 1fr;row-gap:22px;column-gap:28px;}
        }
        @media (max-width:640px){
          .lp-header-inner,.lp-hero{padding-left:22px;padding-right:22px;}
          .lp-chip,.lp-note,.lp-eyebrow-row{display:none;}
          .lp-glow{width:280px;height:280px;top:-20px;right:-20px;}
        }
      `}</style>

      <div className="lp">
        <header className="lp-header">
          <div className="lp-header-inner">
            <div className="lp-logo">
              <img src="/logo_main.png" alt="NodeSim" />
            </div>
            <nav className="lp-nav-links" id="lp-nav" aria-label="Primary">
              <Link to="/features">Features</Link>
              <Link to="/circuits">Circuits</Link>
              <a href="#how-to-use">How to Use</a>
              <a href="#resources">Resources</a>
            </nav>
            <div className="lp-header-actions">
              <Link className="lp-btn lp-btn-cta" to="/simulator">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 20,12 5,21"/></svg>
                <span className="lp-cta-text">Launch Simulator</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <button className="lp-nav-toggle" aria-label="Toggle menu" onClick={(e) => {
                const nav = document.getElementById('lp-nav');
                const open = nav?.classList.toggle('open');
                (e.currentTarget as HTMLButtonElement).setAttribute('aria-expanded', String(open));
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="lp-hero">
            <div>
              <span className="lp-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13,2 4,14 11,14 9,22 20,9 12,9"/></svg>
                FREE&nbsp;•&nbsp;OPEN SOURCE&nbsp;•&nbsp;NO ACCOUNT NEEDED
              </span>
              <h1 className="lp-title">
                <span className="l1">The Modern</span>
                <span className="l2">Circuit Simulator.</span>
              </h1>
              <p className="lp-lede">Design, simulate, and analyze electronic circuits entirely in your browser. Powered by ngspice WASM — the same engine used by professional EDA tools.</p>
              <div className="lp-hero-actions">
                <Link className="lp-btn lp-btn-primary" to="/simulator">
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 20,12 5,21"/></svg>
                  Launch Simulator Free
                </Link>
                <Link className="lp-btn lp-btn-secondary" to="/features">Explore Features</Link>
              </div>
              <div className="lp-stats">
                <div className="lp-stat">
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13,2 4,14 11,14 9,22 20,9 12,9"/></svg>
                  <span className="t">100% Free</span><span className="s">No paywalls</span>
                </div>
                <div className="lp-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="8" r="3.4"/><path d="M3.5 20c0-3.6 2.7-6.2 5.5-6.2s5.5 2.6 5.5 6.2"/><circle cx="18" cy="16" r="4.3" fill="currentColor" stroke="none"/><path d="M16.3 16l1.1 1.1 2.1-2.3" stroke="#fff" strokeWidth="1.6"/>
                  </svg>
                  <span className="t">No Account</span><span className="s">Start instantly</span>
                </div>
                <div className="lp-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>
                  </svg>
                  <span className="t">Browser Based</span><span className="s">Works offline</span>
                </div>
                <div className="lp-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="7" width="10" height="10" rx="1.2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>
                  </svg>
                  <span className="t">Powered by ngspice</span><span className="s">Real engineering. Real results.</span>
                </div>
              </div>
            </div>

            <div>
              <div className="lp-visual-wrap">
                <div className="lp-glow" aria-hidden="true"></div>
                <div className="lp-eyebrow-row" aria-hidden="true">
                  <span>DESIGN</span><span className="sep">|</span><span>SIMULATE</span><span className="sep">|</span><span>ANALYZE</span><span className="sep">|</span><span>LEARN</span>
                </div>
                <div className="lp-mockup">
                  <div className="lp-m-titlebar">
                    <span className="lp-m-dot r"></span><span className="lp-m-dot y"></span><span className="lp-m-dot g"></span>
                  </div>
                  <div className="lp-m-header">
                    <div className="lp-m-logo">
                      <svg viewBox="0 0 30 30" fill="none"><path d="M4 22 L11 10 L16 18 L26 4" stroke="#22c55e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26" cy="4" r="3" fill="#22c55e"/></svg>
                      NodeSim
                    </div>
                    <div className="lp-m-nav"><span>HOME</span><span>FEATURES</span><span>CIRCUITS</span><span>PROCEDURE</span></div>
                  </div>
                  <div className="lp-m-toolbar">
                    <span className="lp-m-interactive">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                      Interactive
                    </span>
                    <span className="lp-m-run">
                      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 20,12 5,21"/></svg>
                      Run
                    </span>
                    <div className="lp-m-tabs">
                      <span className="lp-m-tab active">SCHEMATIC</span>
                      <span className="lp-m-tab">GRAPHER</span>
                      <span className="lp-m-tab">SPLIT</span>
                    </div>
                  </div>
                  <div className="lp-m-body">
                    <div className="lp-m-schema">
                      <svg viewBox="0 0 270 210">
                        <path d="M50,40 L110,40 L120,32 L130,48 L140,32 L150,48 L160,32 L170,40 L210,40" fill="none" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="50" y1="40" x2="50" y2="94" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <circle cx="50" cy="110" r="16" fill="none" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="50" y1="103" x2="50" y2="109" stroke="#e6f3ea" strokeWidth="1.4"/>
                        <line x1="47" y1="106" x2="53" y2="106" stroke="#e6f3ea" strokeWidth="1.4"/>
                        <line x1="50" y1="126" x2="50" y2="160" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="50" y1="160" x2="210" y2="160" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="130" y1="160" x2="130" y2="172" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="123" y1="172" x2="137" y2="172" stroke="#e6f3ea" strokeWidth="1.5"/>
                        <line x1="126" y1="177" x2="134" y2="177" stroke="#e6f3ea" strokeWidth="1.5"/>
                        <line x1="128.5" y1="182" x2="131.5" y2="182" stroke="#e6f3ea" strokeWidth="1.5"/>
                        <line x1="210" y1="40" x2="210" y2="70" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <line x1="195" y1="70" x2="225" y2="70" stroke="#e6f3ea" strokeWidth="1.8"/>
                        <line x1="195" y1="78" x2="225" y2="78" stroke="#e6f3ea" strokeWidth="1.8"/>
                        <line x1="210" y1="78" x2="210" y2="160" stroke="#e6f3ea" strokeWidth="1.6"/>
                        <circle cx="210" cy="40" r="3.4" fill="#22c55e"/>
                        <circle cx="50" cy="160" r="2.4" fill="#9fe3b8"/>
                        <circle cx="210" cy="160" r="2.4" fill="#9fe3b8"/>
                        <text x="16" y="106" fill="#f1f8f4" fontSize="11" fontWeight="600">V1</text>
                        <text x="16" y="121" fill="#8fb3a0" fontSize="10">5V</text>
                        <text x="140" y="14" fill="#f1f8f4" fontSize="11" fontWeight="600" textAnchor="middle">R1</text>
                        <text x="140" y="26" fill="#8fb3a0" fontSize="10" textAnchor="middle">1kΩ</text>
                        <text x="232" y="70" fill="#f1f8f4" fontSize="11" fontWeight="600">C1</text>
                        <text x="232" y="84" fill="#8fb3a0" fontSize="10">10μF</text>
                      </svg>
                    </div>
                    <div className="lp-m-chart">
                      <div className="lp-m-chart-title">V(out)</div>
                      <svg viewBox="0 0 300 160">
                        <line x1="28" y1="29" x2="292" y2="29" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
                        <line x1="28" y1="74" x2="292" y2="74" stroke="rgba(255,255,255,.14)" strokeWidth="1"/>
                        <line x1="28" y1="119" x2="292" y2="119" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
                        <text x="4" y="33" fill="rgba(255,255,255,.45)" fontSize="9">5V</text>
                        <text x="4" y="78" fill="rgba(255,255,255,.45)" fontSize="9">0V</text>
                        <text x="0" y="123" fill="rgba(255,255,255,.45)" fontSize="9">-5V</text>
                        <text x="28" y="150" fill="rgba(255,255,255,.4)" fontSize="9" textAnchor="middle">0ms</text>
                        <text x="116" y="150" fill="rgba(255,255,255,.4)" fontSize="9" textAnchor="middle">10ms</text>
                        <text x="204" y="150" fill="rgba(255,255,255,.4)" fontSize="9" textAnchor="middle">20ms</text>
                        <text x="292" y="150" fill="rgba(255,255,255,.4)" fontSize="9" textAnchor="middle">30ms</text>
                        <path d="M28,74 C39,74 39,29 50,29 C61,29 61,74 72,74 C83,74 83,119 94,119 C105,119 105,74 116,74 C127,74 127,29 138,29 C149,29 149,74 160,74 C171,74 171,119 182,119 C193,119 193,74 204,74 C215,74 215,29 226,29 C237,29 237,74 248,74 C259,74 259,119 270,119 C281,119 281,74 292,74" fill="none" stroke="#22c55e" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lp-chip lp-chip-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7" y="7" width="10" height="10" rx="1.2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>
                  Simulate<br/>Instantly
                </div>
                <div className="lp-chip lp-chip-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20v-3"/></svg>
                  Visualize<br/>Understand<br/>Learn
                  <svg className="lp-chip-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
                <div className="lp-chip lp-chip-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3.5 3.5 0 0 0 7 17a3.5 3.5 0 0 0 5-1 3.5 3.5 0 0 0 5 1 3.5 3.5 0 0 0 3-4.2A3 3 0 0 0 19 7a3 3 0 0 0-3-3 3.5 3.5 0 0 0-4 1 3.5 3.5 0 0 0-4-1Z"/>
                    <path d="M12 4v13"/><path d="M9 8c1 .5 1 1.5 0 2M15 8c-1 .5-1 1.5 0 2"/>
                  </svg>
                  AI Explains<br/>Your Circuit
                  <svg className="lp-chip-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>

                <div className="lp-note" aria-hidden="true">
                  Ideas to Insights
                  <svg viewBox="0 0 150 14"><path d="M2 8c20-9 40-9 60 0s60 9 86-2" fill="none" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
