import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ColpittsOscillatorTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Colpitts Oscillator Circuit Tutorial | NodeSim</title>
        <meta name="description" content="Learn how to design a Colpitts LC oscillator. Understand the tank circuit, feedback network, and frequency formula f = 1/(2π√(L·Ceq)) with interactive simulation." />
        <meta name="keywords" content="Colpitts oscillator, LC oscillator, tank circuit, RF oscillator, circuit simulation, frequency formula" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/colpitts-oscillator" />
        <meta property="og:title" content="Colpitts Oscillator Circuit Tutorial | NodeSim" />
        <meta property="og:description" content="Design a Colpitts LC oscillator and simulate it in your browser." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Colpitts Oscillator Circuit Tutorial",
          "description": "Learn to design and simulate a Colpitts LC oscillator with interactive browser-based simulation.",
          "author": { "@type": "Organization", "name": "NodeSim" },
          "publisher": { "@type": "Organization", "name": "NodeSim" },
          "educationalUse": "instruction",
          "learningResourceType": "tutorial"
        })}</script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-100">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-cyan-400">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tutorials" className="hover:text-cyan-400">Tutorials</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-200">Colpitts Oscillator</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">Colpitts Oscillator Circuit</h1>
        <p className="text-gray-400 text-lg mb-8">
          The Colpitts oscillator is a classic LC feedback oscillator widely used in RF signal generators,
          radio transmitters, and clock circuits. It uses a capacitive voltage divider as its feedback network.
        </p>

        {/* What is section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">What is a Colpitts Oscillator?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A Colpitts oscillator is a sinusoidal oscillator that uses an inductor (L) and two series capacitors
            (C1 and C2) in a tank circuit to determine the oscillation frequency. An active element—typically a
            BJT or FET—provides the gain needed to sustain oscillations. The capacitor tap creates the feedback
            voltage that feeds back to the transistor base.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Key Characteristics</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Capacitive voltage divider feedback</li>
              <li>Stable sinusoidal output</li>
              <li>Frequency range: kHz to hundreds of MHz</li>
              <li>Low phase noise for RF applications</li>
              <li>Simple component count</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">How It Works</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The tank circuit consists of inductor L in parallel with C1 and C2 in series. Energy oscillates
            between the magnetic field of L and the electric fields of C1 and C2. The voltage across C2
            (bottom capacitor) is tapped and fed back to the transistor input (base/gate), creating the
            positive feedback necessary for sustained oscillation.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            The transistor amplifier provides the gain to overcome resistive losses in the tank circuit.
            When the loop gain equals unity and the phase shift is 0° (or 360°), the Barkhausen criterion
            is satisfied, and the circuit oscillates continuously.
          </p>
        </section>

        {/* Frequency Formula */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Oscillation Frequency Formula</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The resonant frequency of the Colpitts oscillator is determined by L and the series combination
            of C1 and C2 (C_eq):
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl mb-2">C_eq = (C1 × C2) / (C1 + C2)</div>
            <div className="text-cyan-300 text-xl">f = 1 / (2π × √(L × C_eq))</div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Where: f = oscillation frequency (Hz), L = inductance (H), C1, C2 = capacitances (F)
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Design Example</h3>
            <p className="text-gray-300 text-sm">
              With L = 10 µH, C1 = 100 pF, C2 = 100 pF:<br />
              C_eq = (100 × 100) / (100 + 100) = 50 pF<br />
              f = 1 / (2π × √(10×10⁻⁶ × 50×10⁻¹²)) = <span className="text-cyan-400">≈ 7.12 MHz</span>
            </p>
          </div>
        </section>

        {/* Feedback Ratio */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Feedback Ratio & Gain Requirement</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The feedback ratio β (beta) of the capacitive divider determines how much of the output is fed
            back to the input:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-center mb-4">
            <div className="text-cyan-300 text-lg">β = C1 / C2</div>
            <div className="text-gray-400 text-sm mt-2">Minimum transistor gain required: hFE &gt; C2 / C1</div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            A larger C2/C1 ratio increases feedback but requires higher transistor gain. Typical designs use
            a ratio between 2:1 and 10:1 for C2:C1.
          </p>
        </section>

        {/* Schematic Description */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Circuit Schematic</h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <h3 className="text-base font-semibold text-gray-200 mb-3">BJT Colpitts Oscillator Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p className="font-semibold text-gray-100 mb-1">Tank Circuit:</p>
                <ul className="space-y-1">
                  <li>L — inductor (5–100 µH)</li>
                  <li>C1 — upper capacitor (10–500 pF)</li>
                  <li>C2 — lower capacitor (10–500 pF)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-100 mb-1">Amplifier Stage:</p>
                <ul className="space-y-1">
                  <li>Q1 — NPN BJT (e.g., 2N2222, BC547)</li>
                  <li>R1, R2 — base bias resistors</li>
                  <li>RC — collector resistor</li>
                  <li>CE — emitter bypass capacitor</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'RF Signal Generators', desc: 'Generate stable RF carrier frequencies for transmitters and test equipment.' },
              { title: 'Radio Receivers', desc: 'Local oscillator in superheterodyne receivers for AM/FM tuning.' },
              { title: 'Function Generators', desc: 'Sinusoidal waveform generation in bench instruments.' },
            ].map(app => (
              <div key={app.title} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-1">{app.title}</h3>
                <p className="text-gray-400 text-sm">{app.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-8 border border-cyan-700/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Simulate a Colpitts Oscillator</h2>
          <p className="text-gray-300 mb-6">
            Build and simulate the Colpitts oscillator in NodeSim — sweep frequency and watch the waveform.
          </p>
          <Link
            to="/simulator"
            className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Open Simulator →
          </Link>
        </section>

        {/* Related Tutorials */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Related Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link to="/tutorials/rlc-circuit" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">RLC Circuit</div>
              <div className="text-sm text-gray-400">Resonance and Q factor</div>
            </Link>
            <Link to="/tutorials/555-timer" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">555 Timer Oscillator</div>
              <div className="text-sm text-gray-400">Square wave generation</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default ColpittsOscillatorTutorial;
