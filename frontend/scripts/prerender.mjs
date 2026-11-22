/**
 * prerender.mjs — Post-build static SEO injection for NodeSim
 *
 * NO browser / Puppeteer dependency. Works on Vercel, local, and any CI.
 *
 * Strategy:
 *   For each SEO route, read dist/index.html, strip all existing react-helmet
 *   meta tags (which are homepage defaults baked in by Vite), then inject the
 *   correct per-page <title>, <meta description>, <link canonical>, and
 *   <meta og:*> tags directly into the <head>. Write the result to
 *   dist/<route>/index.html so Vercel serves it as a static file before the
 *   SPA rewrite fires.
 *
 * Usage:
 *   node scripts/prerender.mjs        (after `vite build`)
 *   npm run build:seo                 (tsc + vite build + this script)
 *
 * EXCLUDED: /simulator — Konva canvas + WASM cannot be static-rendered.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR  = path.resolve(__dirname, '..');
const DIST_DIR  = path.resolve(ROOT_DIR, 'dist');
const BASE_URL  = 'https://www.nodesimapp.com';

// ---------------------------------------------------------------------------
// SEO data for every prerendered route
// ---------------------------------------------------------------------------
const ROUTES = [
  {
    route: '/',
    title: 'NodeSim | Free Online Circuit Simulator & Multisim Alternative',
    description: 'The modern, free alternative to NI Multisim. Design, build, and run real SPICE circuit simulations entirely in your browser with 311+ components, waveform grapher, and AI Tutor. Zero install, no account required.',
    ogType: 'website',
  },
  {
    route: '/features',
    title: 'NodeSim Features | SPICE Simulation, Waveform Grapher & AI Tutor',
    description: 'Explore NodeSim features: real SPICE engine via WebAssembly, 311+ components, interactive waveform grapher, AI circuit tutor, PDF lab report export, and cloud save — all free in your browser.',
    ogType: 'website',
  },
  {
    route: '/tutorials',
    title: 'Circuit Simulation Tutorials | NodeSim',
    description: 'Step-by-step electronics tutorials: RC circuits, op-amp amplifiers, 555 timer, BJT transistors, MOSFET, RLC resonance, and more. Simulate each circuit free in your browser.',
    ogType: 'website',
  },
  {
    route: '/compare',
    title: 'NodeSim vs Other Circuit Simulators | Full Comparison',
    description: 'Compare NodeSim against NI Multisim, Falstad, LTspice, CircuitLab, Tinkercad, and Wokwi. See which free browser circuit simulator best fits students, hobbyists, and engineers.',
    ogType: 'website',
  },
  {
    route: '/components',
    title: 'All 311+ Circuit Components | NodeSim SPICE Library',
    description: 'Browse all 311+ SPICE components in NodeSim: resistors, capacitors, inductors, op-amps, MOSFETs, BJTs, diodes, 555 timers, logic gates, voltage sources, and more.',
    ogType: 'website',
  },
  {
    route: '/tools',
    title: 'Free Electronics Calculators | Ohm\'s Law, RC, 555 Timer | NodeSim',
    description: 'Free online electronics calculators: Ohm\'s Law, voltage divider, RC time constant, 555 timer frequency, and resistor color code. No sign-up required.',
    ogType: 'website',
  },
  {
    route: '/circuits',
    title: 'Example SPICE Circuit Library | NodeSim',
    description: 'Open and simulate ready-made SPICE circuits: RC filters, op-amp amplifiers, buck converters, rectifiers, 555 timers, and more. Click to open in the NodeSim workspace.',
    ogType: 'website',
  },
  {
    route: '/about',
    title: 'About NodeSim | Free Browser SPICE Simulator',
    description: 'Learn about NodeSim — the free, open-web SPICE circuit simulator built to replace heavy desktop EDA tools. Our mission: zero-friction circuit simulation for every engineer and student.',
    ogType: 'website',
  },
  {
    route: '/educators',
    title: 'NodeSim for Educators | Free Circuit Simulator for Classrooms',
    description: 'NodeSim for educators: assign SPICE simulations with zero lab setup. Students simulate circuits in-browser, export waveform PDFs, and generate auto-graded lab reports — no install required.',
    ogType: 'website',
  },
  {
    route: '/showcase',
    title: 'Community Circuit Showcase | NodeSim',
    description: 'Explore circuits shared by the NodeSim engineering community. Find inspiration, learn from real SPICE simulations, and share your own circuit designs.',
    ogType: 'website',
  },
  {
    route: '/resources',
    title: 'Electronics Resources & SPICE References | NodeSim',
    description: 'Free electronics resources: SPICE syntax guides, component datasheets, circuit design references, and tutorial links curated for students and engineers.',
    ogType: 'website',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | NodeSim',
    description: 'NodeSim privacy policy. We collect minimal analytics data and never sell user data. No account or personal information required to use the simulator.',
    ogType: 'website',
  },
  {
    route: '/terms',
    title: 'Terms of Service | NodeSim',
    description: 'NodeSim terms of service. Free to use for personal, academic, and educational purposes.',
    ogType: 'website',
  },
  // Compare pages
  {
    route: '/compare/multisim',
    title: 'Free NI Multisim Alternative Online | NodeSim SPICE Simulator',
    description: 'NodeSim is the best free NI Multisim alternative. Run real SPICE circuit simulations in your browser — 311+ components, waveform grapher, AI tutor. No login or install needed. Multisim Live replacement.',
    ogType: 'website',
  },
  {
    route: '/compare/ltspice',
    title: 'Free LTspice Alternative Online | NodeSim Browser SPICE Simulator',
    description: 'Looking for a browser-based LTspice alternative? NodeSim runs real SPICE simulations online without downloads. Compare LTspice vs NodeSim features.',
    ogType: 'website',
  },
  {
    route: '/compare/falstad',
    title: 'NodeSim vs Falstad Circuit Simulator | Which Is Better?',
    description: 'Compare NodeSim and Falstad circuit simulators. NodeSim runs real ngspice SPICE netlists with 311+ components vs Falstad\'s educational Java applet.',
    ogType: 'website',
  },
  {
    route: '/compare/circuitlab',
    title: 'Free CircuitLab Alternative | NodeSim Online SPICE Simulator',
    description: 'NodeSim is a free browser-based alternative to CircuitLab. Get real SPICE simulation with no subscription, no account, and 311+ components.',
    ogType: 'website',
  },
  {
    route: '/compare/tinkercad',
    title: 'NodeSim vs Tinkercad Circuits | SPICE vs Visual Simulator',
    description: 'Compare NodeSim and Tinkercad Circuits. NodeSim offers real SPICE engine simulation for analog and mixed-signal circuits while Tinkercad targets Arduino beginners.',
    ogType: 'website',
  },
  {
    route: '/compare/wokwi',
    title: 'NodeSim vs Wokwi | Analog SPICE vs Microcontroller Simulator',
    description: 'NodeSim vs Wokwi: compare the best free browser circuit simulators. NodeSim excels at analog SPICE simulation; Wokwi focuses on Arduino/ESP32 microcontroller emulation.',
    ogType: 'website',
  },
  // Tutorial pages
  {
    route: '/tutorials/rc-circuit',
    title: 'RC Circuit Tutorial — Time Constant & Frequency Response | NodeSim',
    description: 'Learn RC circuits: calculate time constant τ = RC, analyze low-pass and high-pass filters, and simulate transient and AC frequency response in your browser.',
    ogType: 'article',
  },
  {
    route: '/tutorials/transistor-amplifier',
    title: 'BJT Transistor Amplifier Tutorial — Common Emitter | NodeSim',
    description: 'Design a common-emitter BJT amplifier. Learn DC biasing, voltage gain, input/output impedance, and simulate the full transient response with SPICE.',
    ogType: 'article',
  },
  {
    route: '/tutorials/op-amp',
    title: 'Op-Amp Tutorial — Inverting & Non-Inverting Amplifier | NodeSim',
    description: 'Master op-amp circuits: inverting amplifier, non-inverting amplifier, unity gain buffer, and summing amplifier. Calculate gain and simulate in-browser.',
    ogType: 'article',
  },
  {
    route: '/tutorials/diode-rectifier',
    title: 'Diode Rectifier Tutorial — Half Wave & Full Wave | NodeSim',
    description: 'Simulate half-wave and full-wave diode rectifier circuits. Learn ripple voltage, PIV, and filter capacitor design with live SPICE waveforms.',
    ogType: 'article',
  },
  {
    route: '/tutorials/rlc-circuit',
    title: 'RLC Circuit Tutorial — Resonance & Q Factor | NodeSim',
    description: 'Analyze series and parallel RLC circuits. Calculate resonant frequency, Q factor, and bandwidth. Simulate AC frequency sweep in browser SPICE.',
    ogType: 'article',
  },
  {
    route: '/tutorials/555-timer',
    title: '555 Timer Tutorial — Astable & Monostable Modes | NodeSim',
    description: 'Build astable and monostable 555 timer circuits. Calculate frequency, duty cycle, and pulse width. Simulate the 555 timer output waveform in-browser.',
    ogType: 'article',
  },
  {
    route: '/tutorials/mosfet',
    title: 'MOSFET Tutorial — Switch & Amplifier Circuits | NodeSim',
    description: 'Learn MOSFET operation: N-channel and P-channel enhancement MOSFETs as digital switches and linear amplifiers. Simulate gate threshold and drain characteristics.',
    ogType: 'article',
  },
  {
    route: '/tutorials/power-supply',
    title: 'Linear Power Supply Tutorial — Regulator Circuit | NodeSim',
    description: 'Design a linear regulated DC power supply. Learn transformer, rectifier, filter capacitor, and voltage regulator stages. Simulate full power supply in SPICE.',
    ogType: 'article',
  },
  {
    route: '/tutorials/differential-amplifier',
    title: 'Differential Amplifier Tutorial — CMRR & Gain | NodeSim',
    description: 'Understand the BJT differential amplifier: differential gain, common-mode rejection ratio (CMRR), and tail current source. Simulate with real SPICE models.',
    ogType: 'article',
  },
  {
    route: '/tutorials/voltage-follower',
    title: 'Voltage Follower (Unity Gain Buffer) Tutorial | NodeSim',
    description: 'Build an op-amp voltage follower / unity gain buffer. Learn input impedance buffering, signal isolation, and simulate the follower\'s frequency response.',
    ogType: 'article',
  },
  {
    route: '/tutorials/colpitts-oscillator',
    title: 'Colpitts Oscillator Tutorial — LC Tank Circuit | NodeSim',
    description: 'Design a Colpitts oscillator using BJT and LC tank circuit. Calculate oscillation frequency and simulate the RF output waveform with ngspice.',
    ogType: 'article',
  },
  {
    route: '/tutorials/wheatstone-bridge',
    title: 'Wheatstone Bridge Tutorial — Sensor Interface Circuit | NodeSim',
    description: 'Analyze the Wheatstone bridge for precision resistance measurement and sensor interfacing. Calculate bridge balance and simulate with SPICE.',
    ogType: 'article',
  },
  {
    route: '/tutorials/active-filter',
    title: 'Active Filter Circuit Tutorial — Sallen-Key Low-Pass | NodeSim',
    description: 'Design a 2nd-order Sallen-Key active low-pass filter with Butterworth response. Learn cutoff frequency formula, Q factor, and maximally flat passband with browser simulation.',
    ogType: 'article',
  },
  {
    route: '/tutorials/pwm-circuit',
    title: 'PWM Circuit Tutorial — 555 Timer Pulse Width Modulation | NodeSim',
    description: 'Build a PWM generator using the 555 timer. Control duty cycle from 0–100%, calculate frequency, and simulate motor drive and LED dimming applications.',
    ogType: 'article',
  },
  {
    route: '/tutorials/logic-gates',
    title: 'Logic Gate Circuit Tutorial — AND, OR, NOT, NAND, NOR | NodeSim',
    description: 'Simulate digital logic gates (AND, OR, NOT, NAND, NOR, XOR) in SPICE. Learn gate-level circuit design and verify truth tables with real simulation waveforms.',
    ogType: 'article',
  },
  {
    route: '/tutorials/darlington-pair',
    title: 'Darlington Pair Tutorial — High-Gain BJT Configuration | NodeSim',
    description: 'Build a Darlington transistor pair for high current gain. Calculate composite hFE, simulate switching and linear amplifier applications with SPICE.',
    ogType: 'article',
  },
  // Tool pages
  {
    route: '/tools/ohms-law',
    title: "Ohm's Law Calculator — Voltage, Current, Resistance | NodeSim",
    description: "Free Ohm's Law calculator: solve for voltage (V = IR), current (I = V/R), or resistance (R = V/I). With power calculation (P = IV).",
    ogType: 'website',
  },
  {
    route: '/tools/voltage-divider',
    title: 'Voltage Divider Calculator — Resistor Network | NodeSim',
    description: 'Free voltage divider calculator. Enter Vin and resistor values to calculate Vout. Includes output impedance and loaded divider analysis.',
    ogType: 'website',
  },
  {
    route: '/tools/rc-calculator',
    title: 'RC Circuit Calculator — Time Constant & Cutoff Frequency | NodeSim',
    description: 'Free RC circuit calculator. Calculate time constant τ = RC, 3dB cutoff frequency fc = 1/(2πRC), and charge/discharge voltage at any time.',
    ogType: 'website',
  },
  {
    route: '/tools/555-timer',
    title: '555 Timer Calculator — Frequency & Duty Cycle | NodeSim',
    description: 'Free 555 timer calculator for astable and monostable modes. Calculate output frequency, duty cycle, high/low time, and capacitor charge time.',
    ogType: 'website',
  },
  {
    route: '/tools/resistor-color-code',
    title: 'Resistor Color Code Calculator — 4 & 5 Band | NodeSim',
    description: 'Free resistor color code calculator for 4-band and 5-band resistors. Identify resistance value, tolerance, and temperature coefficient from color bands.',
    ogType: 'website',
  },
  // Circuit library pages
  {
    route: '/circuits/rc-low-pass-filter',
    title: 'RC Low-Pass Filter Circuit — Simulate Free | NodeSim',
    description: 'Open and simulate an RC low-pass filter circuit. Adjust R and C values, run AC frequency sweep, and view the -3dB cutoff point in the waveform grapher.',
    ogType: 'website',
  },
  {
    route: '/circuits/inverting-op-amp',
    title: 'Inverting Op-Amp Amplifier Circuit — Simulate Free | NodeSim',
    description: 'Open an inverting op-amp circuit with configurable gain. Simulate gain = -Rf/Rin, input/output phase, and saturation limits with LM741 SPICE model.',
    ogType: 'website',
  },
  {
    route: '/circuits/555-timer-astable',
    title: '555 Timer Astable Circuit — Simulate Free | NodeSim',
    description: 'Simulate a 555 timer in astable (free-running) mode. Calculate output frequency and duty cycle from R1, R2, and C values.',
    ogType: 'website',
  },
  {
    route: '/circuits/rlc-resonance',
    title: 'RLC Resonance Circuit — Simulate Free | NodeSim',
    description: 'Simulate an RLC resonance circuit. Observe resonant frequency peak, Q factor bandwidth, and phase angle in the interactive grapher.',
    ogType: 'website',
  },
  {
    route: '/circuits/half-wave-rectifier',
    title: 'Half-Wave Rectifier Circuit — Simulate Free | NodeSim',
    description: 'Simulate a half-wave diode rectifier with filter capacitor. Observe ripple voltage, peak inverse voltage, and output DC level.',
    ogType: 'website',
  },
  {
    route: '/circuits/full-wave-rectifier',
    title: 'Full-Wave Bridge Rectifier Circuit — Simulate Free | NodeSim',
    description: 'Simulate a full-wave bridge rectifier with smoothing capacitor. Compare ripple frequency with half-wave and calculate output DC voltage.',
    ogType: 'website',
  },
  {
    route: '/circuits/common-emitter-amplifier',
    title: 'Common Emitter Amplifier Circuit — Simulate Free | NodeSim',
    description: 'Simulate a BJT common-emitter amplifier with voltage divider bias. Observe voltage gain, phase inversion, and frequency response in SPICE.',
    ogType: 'website',
  },
  {
    route: '/circuits/buck-converter',
    title: 'Buck Converter Step-Down DC-DC Circuit Simulator | NodeSim',
    description: 'Simulate a PWM buck converter online. Calculate output voltage with Vout = D × Vin, select inductor and capacitor values, analyse ripple — free browser SPICE simulator.',
    ogType: 'website',
  },
  {
    route: '/circuits/voltage-divider',
    title: 'Voltage Divider Resistor Circuit — Simulate Free | NodeSim',
    description: 'Simulate a resistor voltage divider. Verify Vout = Vin × R2/(R1+R2) with real current and voltage measurements from interactive probes.',
    ogType: 'website',
  },
  {
    route: '/circuits/zener-diode',
    title: 'Zener Diode Voltage Regulator Circuit — Simulate Free | NodeSim',
    description: 'Simulate a Zener diode voltage regulator. Observe clamping action, Zener knee current, and load regulation characteristics with SPICE.',
    ogType: 'website',
  },
  {
    route: '/circuits/mosfet-switch',
    title: 'MOSFET Switch Circuit — Simulate Free | NodeSim',
    description: 'Simulate an N-channel MOSFET digital switch. Observe gate threshold voltage, on-state resistance, switching waveform, and load current.',
    ogType: 'website',
  },
];

// ---------------------------------------------------------------------------
// HTML injection helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build the per-page <head> SEO block to inject.
 * We replace ALL react-helmet-generated tags (title, meta description,
 * og:*, twitter:*, canonical) so only one clean set remains.
 */
function buildSeoBlock(route, title, description, ogType) {
  const canonical = `${BASE_URL}${route}`;
  const esc = escapeHtml;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:type" content="${esc(ogType)}" />`,
    `<meta property="og:image" content="https://www.nodesimapp.com/og-image.png" />`,
    `<meta property="og:site_name" content="NodeSim" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="https://www.nodesimapp.com/og-image.png" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
  ].join('\n    ');
}

/**
 * Take raw dist/index.html and inject per-page SEO tags.
 * Strips ALL existing <title>, <meta name="description">, <meta property="og:*">,
 * <meta name="twitter:*">, and <link rel="canonical"> tags first.
 * Then injects the clean per-page block just before </head>.
 */
function injectSeo(html, route, title, description, ogType) {
  // Strip all existing helmet-rendered tags
  let result = html
    .replace(/<title[^>]*>.*?<\/title>/gis, '')
    .replace(/<meta\s[^>]*name="description"[^>]*\/?>/gis, '')
    .replace(/<meta\s[^>]*name="title"[^>]*\/?>/gis, '')
    .replace(/<meta\s[^>]*name="twitter:[^"]*"[^>]*\/?>/gis, '')
    .replace(/<meta\s[^>]*property="og:[^"]*"[^>]*\/?>/gis, '')
    .replace(/<meta\s[^>]*property="article:[^"]*"[^>]*\/?>/gis, '')
    .replace(/<link\s[^>]*rel="canonical"[^>]*\/?>/gis, '');

  const seoBlock = buildSeoBlock(route, title, description, ogType);
  result = result.replace('</head>', `  ${seoBlock}\n</head>`);
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ not found. Run `vite build` first.');
    process.exit(1);
  }

  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  console.log(`📋 Injecting SEO tags into ${ROUTES.length} routes (no browser required)...`);

  let successes = 0;
  const failures = [];

  for (const { route, title, description, ogType } of ROUTES) {
    try {
      const html = injectSeo(template, route, title, description, ogType);

      const outputDir = route === '/'
        ? DIST_DIR
        : path.join(DIST_DIR, ...route.split('/').filter(Boolean));

      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');

      console.log(`  ✓ ${route}`);
      successes++;
    } catch (err) {
      console.error(`  ✗ ${route} → ${err.message}`);
      failures.push({ route, error: err.message });
    }
  }

  console.log(`\n✅ Prerender complete: ${successes}/${ROUTES.length} routes`);
  if (failures.length) {
    console.error(`\n⚠️  ${failures.length} failed:`);
    failures.forEach(f => console.error(`   ${f.route}: ${f.error}`));
    process.exit(1);
  }

  process.exit(0);
}

main();
