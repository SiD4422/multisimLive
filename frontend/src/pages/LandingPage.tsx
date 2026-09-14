import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <>
      <style>{`
  :root{
    --paper:#FBFEFC;
    --surface:#FFFFFF;
    --header-bg:rgba(251,254,252,.82);
    --ink:#0B1220;
    --ink-soft:#3D504B;
    --muted:#5C6D68;
    --mint:#EEF9F3;
    --mint-deep:#D9EDE1;
    --line:#E2EAE5;
    --green:#0FA968;
    --green-dark:#08794B;
    --green-light:#3FCB8C;
    --forest-950:#071A14;
    --forest-900:#0C2A1F;
    --forest-800:#123726;
    --panel-dark:#0A1712;
    --panel-dark-2:#0F2119;
    --radius-xs:8px;
    --radius-sm:10px;
    --radius-md:16px;
    --radius-lg:22px;
    --shadow-sm:0 1px 2px rgba(7,26,20,.06);
    --shadow-md:0 10px 30px rgba(7,26,20,.10);
    --shadow-lg:0 36px 90px rgba(7,26,20,.22);
    --font-display:'Space Grotesk',ui-sans-serif,sans-serif;
    --font-body:'Inter',ui-sans-serif,sans-serif;
    --font-mono:'IBM Plex Mono',ui-monospace,monospace;
    --font-hand:'Caveat',cursive;
    --container:1320px;
  }
  html[data-theme="dark"]{
    --paper:#0A1310;
    --surface:#101B16;
    --header-bg:rgba(10,19,16,.78);
    --ink:#EEF6F2;
    --ink-soft:#B7C7C1;
    --muted:#88998F;
    --mint:#12241C;
    --mint-deep:#1C3327;
    --line:#1E2F28;
    --shadow-sm:0 1px 2px rgba(0,0,0,.5);
    --shadow-md:0 10px 30px rgba(0,0,0,.45);
    --shadow-lg:0 36px 90px rgba(0,0,0,.6);
  }

  *,*::before,*::after{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{
    margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body);
    -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
    overflow-x:hidden;line-height:1.5;transition:background .25s ease,color .25s ease;
  }
  img,svg{display:block;max-width:100%;}
  a{color:inherit;text-decoration:none;}
  button{font:inherit;cursor:pointer;background:none;border:none;color:inherit;}
  ul{list-style:none;margin:0;padding:0;}
  h1,h2,h3,p,blockquote,figure{margin:0;}
  .msl-container{max-width:var(--container);margin:0 auto;padding:0 20px;}
  @media(min-width:640px){.msl-container{padding:0 32px;}}
  :focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:4px;}
  @media(prefers-reduced-motion:reduce){*{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;}}

  .skip-link{position:absolute;left:-9999px;top:0;background:var(--ink);color:#fff;padding:10px 16px;border-radius:0 0 8px 0;z-index:200;font-size:14px;}
  .skip-link:focus{left:0;}

  /* ---------- Buttons & shared bits ---------- */
  .msl-btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14.5px;padding:11px 18px;border-radius:var(--radius-sm);white-space:nowrap;transition:transform .15s ease,filter .15s ease,background .15s ease,border-color .15s ease;}
  .msl-btn svg{width:16px;height:16px;}
  .btn-ghost{color:var(--ink);border:1px solid var(--line);background:var(--surface);}
  .btn-ghost:hover{border-color:var(--mint-deep);background:var(--mint);}
  .msl-btn-primary{color:#fff;background:linear-gradient(180deg,var(--green) 0%,var(--green-dark) 100%);box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.2);}
  .msl-btn-primary:hover{filter:brightness(1.06);transform:translateY(-1px);}
  .msl-btn-text{color:var(--ink);font-weight:600;padding:11px 4px;border-bottom:2px solid transparent;}
  .msl-btn-text:hover{border-color:var(--mint-deep);}
  .msl-btn-lg{padding:15px 24px;font-size:15.5px;border-radius:12px;}
  .icon-btn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:var(--radius-sm);border:1px solid var(--line);background:var(--surface);color:var(--ink-soft);flex:none;transition:color .15s ease,border-color .15s ease;}
  .icon-btn:hover{color:var(--ink);border-color:var(--mint-deep);}
  .theme-toggle .icon-sun{display:none;}
  html[data-theme="dark"] .theme-toggle .icon-moon{display:none;}
  html[data-theme="dark"] .theme-toggle .icon-sun{display:block;}

  /* ---------- Header ---------- */
  .msl-site-header{position:sticky;top:0;z-index:80;background:var(--header-bg);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--line);}
  .msl-nav-row{display:flex;align-items:center;gap:28px;height:76px;}
  .msl-brand{display:flex;align-items:center;gap:11px;flex:none;}
  .brand-mark{width:32px;height:32px;flex:none;}
  .brand-text{display:flex;flex-direction:column;line-height:1.05;}
  .brand-name{font-family:var(--font-display);font-weight:700;font-size:19px;letter-spacing:-.01em;}
  .brand-name .n1{color:var(--ink);}
  .brand-name .n2{color:var(--green-dark);}
  .brand-tag{font-size:9px;letter-spacing:.15em;color:var(--muted);font-weight:600;margin-top:2px;}

  .msl-nav-links{display:flex;align-items:center;gap:26px;flex:1;}
  .msl-nav-links a{font-size:14.5px;font-weight:500;color:var(--ink-soft);padding:8px 1px;position:relative;transition:color .15s ease;}
  .msl-nav-links a:hover{color:var(--ink);}
  .msl-nav-links a.active{color:var(--ink);}
  .msl-nav-links a.active::after{content:"";position:absolute;left:0;right:0;bottom:1px;height:2px;background:var(--green);border-radius:2px;}

  .nav-actions{display:flex;align-items:center;gap:12px;flex:none;}
  .search-box{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-sm);padding:9px 11px;width:230px;color:var(--muted);}
  .search-box svg{width:16px;height:16px;flex:none;}
  .search-box input{border:0;outline:0;background:transparent;font-size:13.5px;color:var(--ink);width:100%;font-family:var(--font-body);}
  .search-box input::placeholder{color:var(--muted);}
  .search-box kbd{font-family:var(--font-mono);font-size:10.5px;color:var(--muted);background:var(--mint);border:1px solid var(--line);padding:2px 6px;border-radius:5px;flex:none;}
  .hamburger{display:none;width:38px;height:38px;border-radius:var(--radius-sm);border:1px solid var(--line);align-items:center;justify-content:center;flex:none;}
  .hamburger svg{width:19px;height:19px;}
  .hamburger .icon-close{display:none;}
  .hamburger.open .icon-menu{display:none;}
  .hamburger.open .icon-close{display:block;}

  .mobile-panel{display:none;border-top:1px solid var(--line);padding:18px 20px 24px;background:var(--surface);}
  .mobile-panel.open{display:block;}
  .mobile-panel .mp-links{display:flex;flex-direction:column;gap:4px;margin-bottom:16px;}
  .mobile-panel .mp-links a{padding:11px 4px;font-size:15px;font-weight:500;color:var(--ink-soft);border-bottom:1px solid var(--line);}
  .mobile-panel .mp-links a.active{color:var(--green-dark);}
  .mobile-panel .search-box{width:100%;margin-bottom:14px;}
  .mobile-panel .mp-actions{display:flex;gap:10px;}
  .mobile-panel .mp-actions .msl-btn{flex:1;justify-content:center;}

  @media(max-width:1180px){
    .nav-actions .search-box{width:180px;}
  }
  @media(max-width:940px){
    .msl-nav-links,.nav-actions .search-box,.nav-actions .btn-ghost,.nav-actions .msl-btn-primary{display:none;}
    .hamburger{display:flex;}
  }

  /* ---------- Hero ---------- */
  .msl-hero{position:relative;padding:56px 0 88px;overflow:hidden;
    background:
      radial-gradient(1100px 620px at 12% -12%, rgba(15,169,104,.09), transparent 60%),
      radial-gradient(820px 520px at 104% 6%, rgba(15,169,104,.07), transparent 55%),
      var(--paper);
  }
  .msl-hero::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image:linear-gradient(var(--line) 1px, transparent 1px),linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size:54px 54px;opacity:.55;
    -webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,.5), transparent 78%);
    mask-image:linear-gradient(to bottom, rgba(0,0,0,.5), transparent 78%);
  }
  .msl-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(340px,440px) minmax(0,1fr);gap:56px;align-items:center;}
  @media(max-width:1180px){.msl-hero-grid{grid-template-columns:1fr;gap:64px;}}

  .msl-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:var(--mint);border:1px solid var(--mint-deep);color:var(--green-dark);font-size:12px;font-weight:700;letter-spacing:.02em;}
  .msl-badge svg{width:13px;height:13px;}

  .msl-hero h1{font-family:var(--font-display);font-weight:700;letter-spacing:-.02em;font-size:clamp(2.35rem,3.6vw + 1.2rem,3.55rem);line-height:1.08;margin:22px 0 20px;color:var(--ink);}
  .msl-hero h1 .accent{color:var(--green-dark);}
  .msl-hero .lede{font-size:17px;line-height:1.7;color:var(--ink-soft);max-width:46ch;margin:0 0 32px;}
  .msl-hero-ctas{display:flex;align-items:center;gap:18px;margin-bottom:44px;flex-wrap:wrap;}

  .benefits{display:grid;grid-template-columns:repeat(2,1fr);gap:26px 28px;max-width:460px;}
  .msl-benefit{display:flex;gap:12px;align-items:flex-start;}
  .msl-benefit .chip{width:38px;height:38px;flex:none;border-radius:var(--radius-xs);background:var(--mint);display:flex;align-items:center;justify-content:center;color:var(--green-dark);}
  .msl-benefit .chip svg{width:19px;height:19px;}
  .msl-benefit h4{font-size:14.5px;font-weight:700;color:var(--ink);margin:0 0 2px;}
  .msl-benefit p{font-size:12.5px;color:var(--muted);line-height:1.45;}

  /* ---------- Simulator hero mock ---------- */
  .sim-stage{position:relative;}
  .sim-glow{position:absolute;top:-10%;right:-8%;width:92%;height:110%;background:radial-gradient(circle at 60% 40%,rgba(15,169,104,.32),transparent 62%);filter:blur(46px);z-index:0;}
  .float-pill{position:absolute;display:flex;align-items:center;gap:8px;background:var(--panel-dark);color:#EAF6EF;padding:9px 14px;border-radius:12px;font-size:12px;font-weight:600;box-shadow:var(--shadow-md);border:1px solid rgba(255,255,255,.08);z-index:3;}
  .float-pill svg{width:15px;height:15px;color:var(--green-light);flex:none;}
  .pill-top{top:-22px;right:8%;}
  .hand-note{position:absolute;display:flex;gap:8px;font-family:var(--font-hand);font-weight:600;color:var(--green-dark);font-size:22px;line-height:1.15;z-index:3;}
  .hand-note svg{color:var(--green-dark);flex:none;}
  .note-top{top:-92px;right:26%;text-align:right;flex-direction:row-reverse;}
  .note-bottom{bottom:-58px;left:2%;align-items:flex-start;}
  @media(max-width:560px){.float-pill,.hand-note{display:none;}}

  .sim-frame{
    position:relative;z-index:1;background:linear-gradient(160deg,var(--panel-dark-2),var(--panel-dark));
    border-radius:var(--radius-lg);border:1px solid rgba(255,255,255,.07);box-shadow:var(--shadow-lg);
    padding:14px;transform:rotate(1.4deg);animation:sim-settle .8s cubic-bezier(.2,.7,.2,1) both;
  }
  @keyframes sim-settle{from{opacity:0;transform:rotate(3.5deg) translateY(26px) scale(.97);}to{opacity:1;transform:rotate(1.4deg) translateY(0) scale(1);}}

  .sim-titlebar{display:flex;align-items:center;gap:14px;padding:5px 8px 14px;}
  .sim-dots{display:flex;gap:6px;flex:none;}
  .sim-dots span{width:10px;height:10px;border-radius:50%;display:block;}
  .sim-dots span:nth-child(1){background:#FF5F57;}
  .sim-dots span:nth-child(2){background:#FEBC2E;}
  .sim-dots span:nth-child(3){background:#28C840;}
  .sim-brand{display:flex;align-items:center;gap:7px;color:#EAF6EF;font-family:var(--font-display);font-weight:700;font-size:14px;flex:none;}
  .sim-brand svg{width:20px;height:20px;}
  .sim-tabs{display:flex;gap:3px;background:rgba(255,255,255,.05);padding:3px;border-radius:9px;margin-left:6px;}
  .sim-tabs button{padding:6px 13px;font-size:12px;font-weight:600;border-radius:7px;color:#93A99F;}
  .sim-tabs button.active{background:rgba(255,255,255,.14);color:#fff;}
  .sim-spacer{flex:1;}
  .sim-run{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg,var(--green-light),var(--green));color:#062217;font-weight:700;font-size:12.5px;padding:8px 15px;border-radius:8px;flex:none;}
  .sim-run svg{width:12px;height:12px;}
  .sim-avatar{width:26px;height:26px;border-radius:50%;background:#EAF6EF;color:#0B2419;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);flex:none;}

  .sim-body{display:grid;grid-template-columns:160px 1fr 240px;gap:10px;min-width:0;}
  @media(max-width:1320px){.sim-body{grid-template-columns:148px 1fr 220px;}}
  @media(max-width:760px){.sim-body{grid-template-columns:1fr 210px;}.sim-sidebar{display:none;}}
  @media(max-width:560px){.sim-body{grid-template-columns:1fr;}.sim-analysis{order:2;}.sim-canvas{order:1;min-height:250px;}}

  .sim-sidebar{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px;min-width:0;}
  .sim-search{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border-radius:7px;padding:7px 8px;margin-bottom:10px;}
  .sim-search svg{width:13px;height:13px;color:#7E958B;flex:none;}
  .sim-search input{background:transparent;border:0;outline:0;color:#CFE3DA;font-size:11px;width:100%;font-family:var(--font-body);}
  .sim-comp{display:flex;align-items:center;gap:9px;padding:7px 6px;border-radius:7px;font-size:11.5px;color:#C4D8CE;transition:background .12s ease,color .12s ease;}
  .sim-comp:hover{background:rgba(255,255,255,.06);color:#fff;}
  .sim-comp svg{width:15px;height:15px;color:var(--green-light);flex:none;}

  .sim-canvas{position:relative;min-width:0;border:1px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden;
    background-color:rgba(255,255,255,.02);
    background-image:linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
    background-size:22px 22px;min-height:340px;display:flex;flex-direction:column;
  }
  .sim-toolbar{display:flex;gap:12px;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.06);flex:none;}
  .sim-toolbar svg{width:14px;height:14px;color:#7E958B;}
  .sim-canvas-body{flex:1;display:flex;align-items:center;justify-content:center;padding:10px;min-height:0;}
  .sim-canvas-body svg{width:100%;height:auto;max-width:400px;}
  .sim-canvas-tag{position:absolute;left:12px;bottom:10px;display:flex;align-items:center;gap:8px;font-size:11px;color:#93A99F;background:rgba(255,255,255,.05);padding:5px 9px;border-radius:7px;}
  .sim-canvas-tag button{width:16px;height:16px;border-radius:4px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;}
  .sim-canvas-tag svg{width:10px;height:10px;}
  .wire{fill:none;stroke:var(--green-light);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
  .node-dot{fill:var(--green-light);}
  .comp-line{fill:none;stroke:#EAF6EF;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
  .sch-label{font-family:var(--font-mono);font-size:11px;fill:#CFE3DA;}
  .sch-label-b{font-family:var(--font-mono);font-size:11px;font-weight:600;fill:#EAF6EF;}

  .sim-analysis{display:flex;flex-direction:column;gap:10px;min-width:0;}
  .sim-select-row{display:flex;gap:7px;}
  .sim-select{flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 10px;font-size:11px;color:#CFE3DA;min-width:0;}
  .sim-select svg{width:11px;height:11px;flex:none;color:#7E958B;}
  .sim-mini-icon{width:30px;height:30px;flex:none;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:#7E958B;}
  .sim-mini-icon svg{width:13px;height:13px;}
  .sim-panel-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;}
  .sim-panel-title{font-size:11.5px;font-weight:700;color:#EAF6EF;margin-bottom:9px;}
  .sim-row2{display:flex;gap:7px;margin-bottom:10px;}
  .sim-mini-select{flex:1;font-size:10px;color:#B9CFC4;background:rgba(255,255,255,.05);border-radius:7px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;gap:4px;min-width:0;}
  .sim-mini-select svg{width:9px;height:9px;flex:none;}
  .sim-graph{background:rgba(0,0,0,.2);border-radius:8px;padding:8px 4px 2px;}
  .sim-graph svg{width:100%;height:auto;}
  .sim-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px 12px;margin-top:10px;}
  .sim-metrics .k{display:block;font-size:9px;color:#7E958B;font-family:var(--font-body);margin-bottom:2px;}
  .sim-metrics .v{font-size:13px;color:#EAF6EF;font-weight:600;font-family:var(--font-mono);}
  .sim-status{display:flex;align-items:center;justify-content:space-between;margin-top:11px;font-size:10.5px;color:#93A99F;}
  .sim-status .dot{width:7px;height:7px;border-radius:50%;background:var(--green-light);box-shadow:0 0 0 3px rgba(63,203,140,.25);display:inline-block;margin-right:6px;flex:none;}
  .sim-status .left{display:flex;align-items:center;}

  /* ---------- Trust ---------- */
  .trust{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--surface);}
  .msl-trust-inner{display:flex;justify-content:space-between;align-items:center;gap:44px;padding:38px 0;flex-wrap:wrap;}
  @media(max-width:860px){.msl-trust-inner{flex-direction:column;align-items:flex-start;}}
  .msl-trust-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:var(--muted);text-transform:uppercase;margin:0 0 18px;}
  .msl-trust-logos{display:flex;gap:32px;flex-wrap:wrap;}
  .msl-trust-logos li{display:flex;align-items:center;gap:9px;font-size:14.5px;font-weight:600;color:var(--ink-soft);}
  .msl-trust-logos svg{width:19px;height:19px;color:var(--muted);flex:none;}
  .testimonial{max-width:360px;position:relative;padding-left:22px;border-left:2px solid var(--mint-deep);flex:none;}
  .testimonial p{font-size:15.5px;color:var(--ink);font-weight:500;line-height:1.5;margin:0 0 8px;}
  .testimonial cite{font-size:13px;color:var(--muted);font-style:normal;}

  /* ---------- Dark feature section ---------- */
  .features-dark{position:relative;overflow:hidden;background:linear-gradient(180deg,var(--forest-950),var(--forest-900));padding:96px 0;color:#EAF6EF;}
  .features-dark::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
    background-size:62px 62px;
    -webkit-mask-image:radial-gradient(ellipse 70% 70% at 30% 20%, black, transparent 72%);
    mask-image:radial-gradient(ellipse 70% 70% at 30% 20%, black, transparent 72%);
  }
  .msl-features-inner{position:relative;z-index:1;}
  .msl-features-head{max-width:600px;margin-bottom:60px;}
  .features-dark h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.01em;font-size:clamp(1.9rem,2.6vw + 1rem,2.5rem);color:#fff;}
  .msl-feature-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.12);}
  @media(max-width:860px){.msl-feature-grid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:560px){.msl-feature-grid{grid-template-columns:1fr;}}
  .feature-item{padding:28px 26px 32px 0;border-right:1px solid rgba(255,255,255,.12);}
  .msl-feature-grid > .feature-item:nth-child(4){border-right:0;}
  @media(max-width:860px){
    .feature-item{border-right:1px solid rgba(255,255,255,.12);padding-right:20px;}
    .msl-feature-grid > .feature-item:nth-child(2n){border-right:0;}
    .msl-feature-grid > .feature-item:nth-child(n+3){border-top:1px solid rgba(255,255,255,.12);padding-top:28px;}
  }
  @media(max-width:560px){
    .feature-item{border-right:0 !important;padding:26px 0;border-bottom:1px solid rgba(255,255,255,.12);}
    .msl-feature-grid > .feature-item:nth-child(n+3){border-top:0;padding-top:26px;}
    .feature-item:last-child{border-bottom:0;}
  }
  .feature-item .ico{width:32px;height:32px;color:var(--green-light);margin-bottom:20px;}
  .feature-item h3{font-size:16px;font-weight:700;color:#fff;margin:0 0 6px;}
  .feature-item p{font-size:13.5px;color:#93A99F;line-height:1.5;}

  /* ---------- Footer ---------- */
  .msl-site-footer{background:var(--forest-950);border-top:1px solid rgba(255,255,255,.08);padding:36px 0;color:#7E958B;font-size:13px;}
  .msl-footer-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px;}
  @media(max-width:640px){.msl-footer-row{flex-direction:column;align-items:flex-start;}}
  .msl-footer-brand{display:flex;align-items:center;gap:8px;color:#EAF6EF;font-family:var(--font-display);font-weight:700;font-size:14.5px;}
  .msl-footer-brand svg{width:20px;height:20px;}
  .msl-footer-links{display:flex;gap:22px;flex-wrap:wrap;}
  .msl-footer-links a{color:#93A99F;transition:color .15s ease;}
  .msl-footer-links a:hover{color:#fff;}

`}</style>

      {/* SVG gradient definition */}
      <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
        <defs>
          <linearGradient id="nGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3FCB8C"/>
            <stop offset="1" stopColor="#08794B"/>
          </linearGradient>
        </defs>
      </svg>

      <a className="skip-link" href="#main">Skip to content</a>

      {/* ─── NAVBAR: ORIGINAL DESIGN WITH OLD LOGO ─── */}
      <header className="msl-site-header">
        <div className="msl-container msl-nav-row">
          <Link className="msl-brand" to="/" aria-label="NodeSim home" style={{ textDecoration: 'none' }}>
            <img src="/logo_main.png" alt="NodeSim Logo" style={{ height: '75px', objectFit: 'contain', margin: '-14px 0', marginLeft: '-15px' }} />
          </Link>

          <nav className="msl-nav-links" aria-label="Primary" style={{ justifyContent: 'center' }}>
            <Link to="/" className="active">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/circuits">Circuits</Link>
            <Link to="/procedure">How to Use</Link>
            <Link to="/resources">Resources</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/simulator" className="msl-btn msl-btn-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z"/></svg>
              Launch Simulator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>

            <button className="hamburger" id="hamburgerBtn" aria-label="Menu" aria-expanded="false" aria-controls="mobilePanel"
              onClick={(e) => {
                const panel = document.getElementById('mobilePanel');
                const btn = e.currentTarget as HTMLButtonElement;
                const open = panel?.classList.toggle('open');
                btn.classList.toggle('open', !!open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
              }}
            >
              <svg className="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
              <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
        </div>

        <div className="mobile-panel" id="mobilePanel">
          <div className="mp-links">
            <Link to="/" className="active">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/circuits">Circuits</Link>
            <Link to="/procedure">How to Use</Link>
            <Link to="/resources">Resources</Link>
          </div>
          <div className="mp-actions">
            <Link className="msl-btn msl-btn-primary" to="/simulator">Launch Simulator</Link>
          </div>
        </div>
      </header>

      {/* ─── PASTE ALL BODY CONTENT FROM HTML FILE HERE ─── */}
      <main id="main">
        <section className="msl-hero" id="top">
          <div className="msl-container msl-hero-grid">

            <div className="msl-hero-copy">
              <span className="msl-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
                FREE&nbsp;•&nbsp;OPEN SOURCE&nbsp;•&nbsp;NO ACCOUNT NEEDED
              </span>

              <h1>Design. Simulate.<br />Understand. <span className="accent">Faster.</span></h1>

              <p className="lede">A modern, browser-based circuit simulator powered by ngspice. Build circuits, run simulations, and visualize results — all in one seamless workspace.</p>

              <div className="msl-hero-ctas">
                <Link className="msl-btn msl-btn-primary msl-btn-lg" to="/simulator">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z"/></svg>
                  Launch Simulator
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
                <Link className="msl-btn msl-btn-text" to="/features">Explore Features</Link>
              </div>

              <div className="benefits">
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg></span>
                  <div><h4>100% Free</h4><p>No paywalls</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg></span>
                  <div><h4>No Account</h4><p>Start instantly</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8M12 3.6c2.5 2.6 2.5 15.4 0 17M12 3.6c-2.5 2.6-2.5 15.4 0 17"/></svg></span>
                  <div><h4>Browser Based</h4><p>Works offline</p></div>
                </div>
                <div className="msl-benefit">
                  <span className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="7" width="10" height="10" rx="1.6"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg></span>
                  <div><h4>Powered by ngspice</h4><p>Real engineering. Real results.</p></div>
                </div>
              </div>
            </div>

            <div className="sim-stage">
              <div className="sim-glow" aria-hidden="true"></div>

              <div className="float-pill pill-top">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="7" width="10" height="10" rx="1.6"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>
                Powered by ngspice WASM
              </div>
              <p className="hand-note note-top">
                <svg width="46" height="34" viewBox="0 0 46 34" fill="none"><path d="M40 4C30 2 14 8 6 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M2 20 5 28 12 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Same Engine.<br />More Possibilities.
              </p>

              <div className="sim-frame" role="img" aria-label="NodeSim simulator interface showing a schematic editor and simulation results">
                <div className="sim-titlebar">
                  <div className="sim-dots"><span></span><span></span><span></span></div>
                  <div className="sim-brand">
                    <svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 27 L8 7 L26 27 L26 7" fill="none" stroke="url(#nGrad)" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="7" r="2.6" fill="url(#nGrad)"/><circle cx="8" cy="27" r="2.6" fill="url(#nGrad)"/><circle cx="26" cy="7" r="2.6" fill="url(#nGrad)"/><circle cx="26" cy="27" r="2.6" fill="url(#nGrad)"/></svg>
                    NodeSim
                  </div>
                  <div className="sim-tabs">
                    <button className="active">Schematic</button>
                    <button>Grapher</button>
                    <button>Split</button>
                  </div>
                  <div className="sim-spacer"></div>
                  <button className="sim-run">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z"/></svg>
                    Run
                  </button>
                  <span className="sim-avatar">SK</span>
                </div>

                <div className="sim-body">
                  <aside className="sim-sidebar">
                    <div className="sim-search">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                      <input readOnly value="Search components…" />
                    </div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 9h2l1.4-3 2.4 6 2.4-6 2.4 6 2.4-6L14 9h2"/></svg>Resistor</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 9h5M11 9h5M7 4v10M11 4v10"/></svg>Capacitor</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 12c1.4-5 2.9-5 4.3 0s2.9 5 4.3 0 2.9-5 4.3 0 1-1 1-1"/></svg>Inductor</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="6"/><path d="M7.6 6.2h1.6M8.4 5.4v1.6M6.8 11.6h2"/></svg>Voltage Source</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="6"/><path d="M9 5.5v7M9 5.5 7 8M9 5.5l2 2.5"/></svg>Current Source</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 2v5M5 9h8M6.4 11.6h5.2M8 14h2"/></svg>Ground</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2.5 9h4M13 9h2.5M6.5 4.5v9L12 9 6.5 4.5Z"/><path d="M12 4.5v9"/></svg>Diode</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="6.4"/><path d="M6 5v8M6 7.3l4-2.1M6 10.7l4 2.1M10 5.3v7.4"/></svg>Transistor</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4v10l10-5L4 4Z"/><path d="M14 9h1.6"/></svg>Op-Amp</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4v10h3a5 5 0 0 0 0-10H3Z"/><path d="M11.5 9h3.6M13.5 7l1.6 2-1.6 2"/></svg>Logic Gates</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="4" cy="12.5" r="1.2"/><circle cx="14" cy="12.5" r="1.2"/><path d="M5 11.7 12.5 7M14 12.5h1.5M2.5 12.5H4"/></svg>Switch</div>
                    <div className="sim-comp"><svg viewBox="0 0 18 18" fill="currentColor"><circle cx="4" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/><circle cx="14" cy="9" r="1.3"/></svg>More…</div>
                  </aside>

                  <div className="sim-canvas">
                    <div className="sim-toolbar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 3l6 15 2-6 6-2Z"/></svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z"/></svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5h14M12 5v14"/></svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12a8 8 0 1 1 3 6.3"/><path d="M4 18v-5h5"/></svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10" cy="10" r="6.2"/><path d="M19.5 19.5l-5-5"/></svg>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                    </div>
                    <div className="sim-canvas-body">
                      <svg viewBox="0 0 340 200" aria-hidden="true">
                        <path className="wire" d="M64 60 H150 M214 60 H256"/>
                        <path className="comp-line" d="M150 60 l8 -12 l12 24 l12 -24 l12 24 l12 -24 l8 12"/>
                        <path className="wire" d="M256 60 V150"/>
                        <path className="comp-line" d="M236 150 H276 M236 164 H276"/>
                        <path className="wire" d="M256 164 V182 M64 182 H256"/>
                        <circle className="node-dot" cx="64" cy="60" r="3.2"/>
                        <circle className="node-dot" cx="256" cy="60" r="3.2"/>
                        <circle className="node-dot" cx="64" cy="182" r="3.2"/>
                        <circle className="node-dot" cx="256" cy="182" r="3.2"/>
                        <circle cx="64" cy="100" r="18" className="comp-line"/>
                        <path className="wire" d="M64 60 V82 M64 118 V182"/>
                        <path className="comp-line" d="M58 94h4M60 92v4 M58 106h4"/>
                        <path className="wire" d="M160 182 V190"/>
                        <path className="comp-line" d="M151 190h18M154.5 194h11M158 198h4"/>
                        <text className="sch-label-b" x="20" y="96">V1</text>
                        <text className="sch-label" x="20" y="112">5V</text>
                        <text className="sch-label-b" x="170" y="38">R1</text>
                        <text className="sch-label" x="163" y="92">1kΩ</text>
                        <text className="sch-label-b" x="282" y="150">C1</text>
                        <text className="sch-label" x="282" y="166">10µF</text>
                      </svg>
                    </div>
                    <div className="sim-canvas-tag">
                      Untitled Circuit
                      <button aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg></button>
                    </div>
                  </div>

                  <div className="sim-analysis">
                    <div className="sim-select-row">
                      <div className="sim-select"><span>DC Analysis</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></div>
                      <span className="sim-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/></svg></span>
                      <span className="sim-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg></span>
                    </div>

                    <div className="sim-panel-card">
                      <div className="sim-panel-title">Transient Analysis</div>
                      <div className="sim-row2">
                        <span className="sim-mini-select">V(out)<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                        <span className="sim-mini-select">Time (ms)<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                      </div>
                      <div className="sim-graph">
                        <svg viewBox="0 0 240 106" aria-hidden="true">
                          <text className="sch-label" x="2" y="14" fontSize="9">5V</text>
                          <text className="sch-label" x="2" y="56" fontSize="9">0V</text>
                          <text className="sch-label" x="2" y="98" fontSize="9">-5V</text>
                          <path d="M24 56 H236" stroke="rgba(255,255,255,.16)" strokeWidth="1" strokeDasharray="3 3"/>
                          <path className="wire" d="M24 56 C32,22 40,22 48,56 C56,90 64,90 72,56 C80,22 88,22 96,56 C104,90 112,90 120,56 C128,22 136,22 144,56 C152,90 160,90 168,56 C176,22 184,22 192,56 C200,90 208,90 216,56 C224,22 232,22 236,40"/>
                          <text className="sch-label" x="22" y="104" fontSize="9">0</text>
                          <text className="sch-label" x="63" y="104" fontSize="9">10</text>
                          <text className="sch-label" x="105" y="104" fontSize="9">20</text>
                          <text className="sch-label" x="147" y="104" fontSize="9">30</text>
                          <text className="sch-label" x="189" y="104" fontSize="9">40</text>
                          <text className="sch-label" x="223" y="104" fontSize="9">50</text>
                        </svg>
                      </div>
                      <div className="sim-metrics">
                        <div><span className="k">Vmax</span><span className="v">4.98 V</span></div>
                        <div><span className="k">Vmin</span><span className="v">-4.97 V</span></div>
                        <div><span className="k">Vpp</span><span className="v">9.95 V</span></div>
                        <div><span className="k">Freq</span><span className="v">1.00 kHz</span></div>
                      </div>
                      <div className="sim-status">
                        <span className="left"><i className="dot"></i>Simulation completed</span>
                        <span>12.4 ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="hand-note note-bottom">
                Ideas to<br />Insights
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none"><path d="M4 26C14 30 28 22 36 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M39 12 36 4 29 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </p>
            </div>

          </div>
        </section>

        <section className="trust">
          <div className="msl-container msl-trust-inner">
            <div>
              <p className="msl-trust-label">Trusted by learners, educators &amp; engineers</p>
              <ul className="msl-trust-logos">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 12v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3V12"/></svg>Students</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 5.5v15"/></svg>Educators</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>Hobbyists</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 3h6M10 3v6.5L4.7 18a2 2 0 0 0 1.7 3h11.2a2 2 0 0 0 1.7-3L14 9.5V3"/></svg>Researchers</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="11" rx="1.6"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>Professionals</li>
              </ul>
            </div>
            <blockquote className="testimonial">
              <p>"Finally, a circuit simulator that just works in the browser."</p>
              <cite>— Engineering Student</cite>
            </blockquote>
          </div>
        </section>

        <section className="features-dark" id="features">
          <div className="msl-container msl-features-inner">
            <div className="msl-features-head">
              <h2>Everything you need for circuit simulation.</h2>
            </div>
            <div className="msl-feature-grid">
              <div className="feature-item">
                <svg className="ico" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 24 19 11a2.8 2.8 0 0 1 4 4L10 28H6v-4Z"/><circle cx="24" cy="6" r="2" fill="currentColor" stroke="none"/></svg>
                <h3>Intuitive Editor</h3>
                <p>Draw circuits with ease using a clean drag-and-drop schematic canvas.</p>
              </div>
              <div className="feature-item">
                <svg className="ico" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h5l3-11 5 20 3-11h10"/><circle cx="12" cy="9" r="2" fill="currentColor" stroke="none"/><circle cx="17" cy="29" r="2" fill="currentColor" stroke="none"/></svg>
                <h3>Real Simulations</h3>
                <p>Run accurate SPICE simulations powered by the ngspice engine.</p>
              </div>
              <div className="feature-item">
                <svg className="ico" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 27V19M15 27V13M22 27V17M30 27V7"/><path d="M6 19 15 13 22 17 30 7" strokeDasharray="1 4.2"/><circle cx="6" cy="19" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="2" fill="currentColor" stroke="none"/><circle cx="22" cy="17" r="2" fill="currentColor" stroke="none"/><circle cx="30" cy="7" r="2" fill="currentColor" stroke="none"/></svg>
                <h3>Powerful Analysis</h3>
                <p>DC, AC, Transient and more — visualize results the instant they finish.</p>
              </div>
              <div className="feature-item">
                <svg className="ico" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 25 17 8 26 25 8 25Z"/><circle cx="8" cy="25" r="2.6" fill="currentColor" stroke="none"/><circle cx="26" cy="25" r="2.6" fill="currentColor" stroke="none"/><circle cx="17" cy="8" r="2.6" fill="currentColor" stroke="none"/></svg>
                <h3>Learn &amp; Share</h3>
                <p>Explore example circuits and share your designs with anyone, instantly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="msl-site-footer">
        <div className="msl-container msl-footer-row">
          <div className="msl-footer-brand">
            <svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 27 L8 7 L26 27 L26 7" fill="none" stroke="url(#nGrad)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="7" r="2.5" fill="url(#nGrad)"/><circle cx="8" cy="27" r="2.5" fill="url(#nGrad)"/><circle cx="26" cy="7" r="2.5" fill="url(#nGrad)"/><circle cx="26" cy="27" r="2.5" fill="url(#nGrad)"/></svg>
            NodeSim
          </div>
          <ul className="msl-footer-links">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/circuits">Circuits</Link></li>
            <li><a href="#">Learn</a></li>
            <li><a href="#">Resources</a></li>
            <li><a href="#">GitHub</a></li>
          </ul>
          <p>© {new Date().getFullYear()} NodeSim. Open source under the MIT License.</p>
        </div>
      </footer>
    </>
  );
}
