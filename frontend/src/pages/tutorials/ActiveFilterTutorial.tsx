import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ActiveFilterTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Active Filter Circuit Tutorial — Sallen-Key Low-Pass | NodeSim</title>
        <meta name="description" content="Design a 2nd-order Sallen-Key active low-pass filter with Butterworth response. Learn cutoff frequency formula, Q factor, and maximally flat passband with browser simulation." />
        <meta name="keywords" content="active filter, Sallen-Key filter, low pass filter, Butterworth filter, op-amp filter, cutoff frequency, Q factor" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/active-filter" />
        <meta property="og:title" content="Active Filter Circuit Tutorial — Sallen-Key Low-Pass | NodeSim" />
        <meta property="og:description" content="Design a 2nd-order Sallen-Key Butterworth active filter and simulate it online." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Active Filter Circuit Tutorial — Sallen-Key Low-Pass",
          "description": "Design a 2nd-order Sallen-Key active low-pass filter with Butterworth response and simulate it in the browser.",
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
          <span className="text-gray-200">Active Filter (Sallen-Key)</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">Active Low-Pass Filter — Sallen-Key Design</h1>
        <p className="text-gray-400 text-lg mb-8">
          Active filters combine resistors, capacitors, and an op-amp to achieve precise frequency selectivity
          without bulky inductors. The Sallen-Key topology is the industry standard for 2nd-order filter stages.
        </p>

        {/* Why active filters */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Why Use Active Filters?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-red-400 mb-2">❌ Passive RC Filter (1st order)</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>Only −20 dB/decade rolloff</li>
                <li>Loading affects cutoff frequency</li>
                <li>No gain possible</li>
                <li>Poor selectivity</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-green-400 mb-2">✅ Active Sallen-Key (2nd order)</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>−40 dB/decade rolloff</li>
                <li>Low output impedance, no loading</li>
                <li>Adjustable Q factor</li>
                <li>Maximally flat Butterworth response available</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sallen-Key Topology */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Sallen-Key Low-Pass Topology</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The Sallen-Key 2nd-order low-pass filter uses four passive components (R1, R2, C1, C2) and a
            unity-gain op-amp (voltage follower). The input signal passes through two RC sections in cascade,
            with feedback from the output through C2 to the junction of R1 and R2.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Component List</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li><span className="text-cyan-400">R1, R2</span> — Series resistors in signal path</li>
              <li><span className="text-cyan-400">C1</span> — Shunt capacitor (between R2 junction and GND)</li>
              <li><span className="text-cyan-400">C2</span> — Feedback capacitor (from output to R1-R2 junction)</li>
              <li><span className="text-cyan-400">U1</span> — Op-amp in unity gain (voltage follower) configuration</li>
            </ul>
          </div>
        </section>

        {/* Cutoff Frequency */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Cutoff Frequency Formula</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The −3 dB cutoff frequency for the Sallen-Key low-pass filter is:
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl">f_c = 1 / (2π × √(R1 × R2 × C1 × C2))</div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Where R1, R2 are in Ohms and C1, C2 are in Farads.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Design Example — 1 kHz Butterworth</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Choose R1 = R2 = 10 kΩ, C1 = C2 = 15.9 nF:<br />
              f_c = 1 / (2π × √(10k × 10k × 15.9n × 15.9n))<br />
              f_c = 1 / (2π × 10k × 15.9n) = <span className="text-cyan-400">≈ 1.0 kHz ✓</span>
            </p>
          </div>
        </section>

        {/* Q Factor */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Q Factor & Filter Response</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The Q factor determines the shape of the frequency response near the cutoff:
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl">Q = √(R1 × R2 × C1 × C2) / (C2 × (R1 + R2))</div>
          </div>
          <p className="text-gray-300 leading-relaxed mb-3">
            For the equal-component Sallen-Key (R1=R2=R, C1=C2=C):
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-center mb-4">
            <div className="text-cyan-300 text-lg">Q = 0.5 (equal components, unity gain)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Response vs Q</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-yellow-400 mb-1">Q = 0.5 (Critically damped)</div>
                <div>Overdamped; rolls off before f_c</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-green-400 mb-1">Q = 0.707 (Butterworth)</div>
                <div>Maximally flat passband; ideal for most uses</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-red-400 mb-1">Q &gt; 0.707 (Peaking)</div>
                <div>Passband peaking near f_c; Chebyshev behavior</div>
              </div>
            </div>
          </div>
        </section>

        {/* Butterworth tuning */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Achieving Q = 0.707 (Butterworth)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            To achieve the Butterworth (maximally flat) response with equal capacitors (C1 = C2 = C):
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-center mb-4">
            <div className="text-cyan-300 text-lg">R2 = 2 × R1</div>
          </div>
          <p className="text-gray-300 text-sm">
            Or, with equal resistors (R1 = R2 = R), set C1 = 2 × C2. Both approaches yield Q ≈ 0.707.
          </p>
        </section>

        {/* Applications */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Anti-Aliasing Filter', desc: 'Placed before ADC to remove frequencies above Nyquist and prevent aliasing.' },
              { title: 'Audio Crossover', desc: 'Route low frequencies to woofer; high-pass counterpart routes highs to tweeter.' },
              { title: 'Noise Reduction', desc: 'Remove high-frequency noise from sensor outputs in data acquisition systems.' },
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
          <h2 className="text-2xl font-bold text-white mb-3">Simulate a Sallen-Key Filter</h2>
          <p className="text-gray-300 mb-6">
            Build the Sallen-Key filter in NodeSim and run AC analysis to see the Bode plot in real time.
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
            <Link to="/tutorials/op-amp" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">Op-Amp Amplifier</div>
              <div className="text-sm text-gray-400">Op-amp fundamentals and configurations</div>
            </Link>
            <Link to="/tutorials/rc-circuit" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">RC Circuit</div>
              <div className="text-sm text-gray-400">Passive RC filter foundation</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default ActiveFilterTutorial;
