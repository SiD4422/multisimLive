import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const VsWokwi: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Wokwi a SPICE simulator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Wokwi is a microcontroller / Arduino / ESP32 simulator that runs firmware code. It does not use a SPICE engine and cannot accurately simulate analog circuits like op-amps, transistors, or filters.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can NodeSim simulate Arduino code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. NodeSim is a pure analog SPICE simulator powered by ngspice WASM. It is designed for accurate analog and mixed-signal circuit simulation, not microcontroller firmware execution.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which is better: NodeSim or Wokwi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'They solve different problems. Use Wokwi when you need to simulate Arduino/ESP32 firmware. Use NodeSim when you need accurate SPICE simulation of analog circuits — op-amps, filters, transistor amplifiers, power supplies.',
        },
      },
    ],
  };

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0', lineHeight: '1.7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SEO
        title="NodeSim vs Wokwi — SPICE Analog Simulator vs Arduino/ESP32 Emulator"
        description="Compare NodeSim vs Wokwi. Wokwi simulates Arduino and ESP32 firmware. NodeSim runs real ngspice SPICE for accurate analog circuit simulation. Different tools for different jobs."
        url="https://www.nodesimapp.com/compare/wokwi"
      />
      <Helmet>
        <meta name="keywords" content="NodeSim vs Wokwi, Wokwi alternative, Wokwi SPICE, ESP32 circuit simulator, Arduino circuit simulator, browser SPICE simulation, analog circuit simulator" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#10b981' }}>NodeSim vs Wokwi</h1>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2rem' }}>Last updated October 2026</p>

      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Wokwi is one of the best online Arduino and ESP32 simulators — and NodeSim is not trying to compete with it on that front. 
        These are <strong>fundamentally different tools</strong> for different problems. 
        Wokwi runs your <em>firmware code</em>. NodeSim runs real <em>SPICE circuit simulation</em> using ngspice compiled to WebAssembly.
      </p>

      <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '2rem' }}>
        <strong style={{ color: '#60a5fa' }}>🔑 Key difference:</strong>
        <span style={{ color: '#93c5fd' }}> Wokwi emulates a microcontroller's CPU and runs C/C++ sketch code. NodeSim numerically solves circuit differential equations using SPICE algorithms. They are not interchangeable.</span>
      </div>

      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Feature Comparison</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', textAlign: 'left', color: '#ffffff' }}>
            <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Feature</th>
            <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>NodeSim</th>
            <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Wokwi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Core Purpose</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>Analog / mixed-signal SPICE simulation</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>Arduino / ESP32 / RP2040 firmware emulation</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Simulation Engine</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>ngspice WASM (industry-standard SPICE)</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>AVR / Xtensa / ARM CPU emulator</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>SPICE Analysis (Transient / AC / DC)</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Full SPICE solver</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not supported</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Arduino / ESP32 Code Execution</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not supported</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Full firmware execution</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Op-Amp / BJT / MOSFET Models</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Accurate SPICE device models</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>⚠️ Basic behavioral only</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Bode Plot / AC Frequency Sweep</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Full AC analysis</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not supported</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Price</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>100% Free, no account</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Free tier + paid plans for advanced features</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Login Required</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>No — open instantly</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Yes — account required to save</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>60 FPS Current Flow Visualization</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Animated current particles (SPICE-accurate values)</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not available</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Lab Report / PDF Export</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ 1-click IEEE / DVR PDF report</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not available</td>
          </tr>
          <tr>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>KiCad Netlist Export</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Supported</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>❌ Not supported</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>Iframe Embedding</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Free embed</td>
            <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>✅ Paid embed</td>
          </tr>
        </tbody>
      </table>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Use Both — They Complement Each Other</h2>
        <p>
          A common workflow for embedded systems engineers: <strong>design and verify the analog front-end in NodeSim</strong> (sensor conditioning, power supply, signal amplification), 
          then <strong>simulate the microcontroller firmware in Wokwi</strong> to test the software side. 
          The two tools cover the full hardware + firmware stack together.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>When NodeSim is the Right Choice</h2>
        <p>
          Choose NodeSim when you need to answer questions like:
        </p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>What is the gain and phase margin of my op-amp feedback loop?</li>
          <li>Does my transistor BJT amplifier saturate at the expected input swing?</li>
          <li>What is the -3dB frequency of my RC low-pass filter?</li>
          <li>How much ripple does my rectifier circuit produce under load?</li>
          <li>Is my 555 timer astable multivibrator oscillating at the right frequency?</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>These are SPICE questions — and Wokwi cannot answer them.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>FAQ</h2>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Q: Is Wokwi a SPICE simulator?</strong>
          <p style={{ marginTop: '0.3rem' }}>No. Wokwi emulates microcontroller CPUs (AVR, Xtensa, ARM). It does not solve SPICE equations and cannot accurately simulate analog circuits.</p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Q: Can NodeSim simulate Arduino code?</strong>
          <p style={{ marginTop: '0.3rem' }}>No. NodeSim is a pure analog SPICE simulator. For Arduino/ESP32 firmware, use Wokwi.</p>
        </div>
        <div>
          <strong>Q: Which is better for engineering students?</strong>
          <p style={{ marginTop: '0.3rem' }}>If your lab is about analog electronics (op-amps, filters, power supplies, BJTs), use NodeSim. If your lab involves microcontrollers and embedded programming, use Wokwi. Most ECE/EEE programs need both.</p>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link
          to="/simulator"
          style={{
            display: 'inline-block',
            backgroundColor: '#10b981',
            color: '#0f172a',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '1.1rem',
          }}
        >
          Try NodeSim Free — Real SPICE in Your Browser →
        </Link>
      </div>

      {/* Cross-links for SEO and navigation */}
      <div className="tutorial-crosslinks">
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>More comparisons:</span>
        <Link to="/compare/circuitlab">NodeSim vs CircuitLab</Link>
        <Link to="/compare/tinkercad">NodeSim vs Tinkercad</Link>
        <Link to="/compare/ltspice">NodeSim vs LTspice</Link>
        <Link to="/compare/multisim">NodeSim vs Multisim</Link>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center', marginLeft: 8, marginRight: 4 }}>Tutorials:</span>
        <Link to="/tutorials/op-amp">Op-Amp</Link>
        <Link to="/tutorials/rc-circuit">RC Circuit</Link>
        <Link to="/tutorials/transistor-amplifier">Transistor Amplifier</Link>
      </div>
    </div>
  );
};

export default VsWokwi;
