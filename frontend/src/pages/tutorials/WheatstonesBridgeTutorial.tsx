import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const WheatstonesBridgeTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Wheatstone Bridge Circuit Tutorial | NodeSim</title>
        <meta name="description" content="Understand the Wheatstone bridge: balance condition R1/R2 = R3/R4, null detector, strain gauge sensors, and bridge imbalance voltage calculation with live simulation." />
        <meta name="keywords" content="Wheatstone bridge, balanced bridge, null detector, strain gauge, resistance measurement, sensor circuit" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/wheatstone-bridge" />
        <meta property="og:title" content="Wheatstone Bridge Circuit Tutorial | NodeSim" />
        <meta property="og:description" content="Learn Wheatstone bridge balance conditions and sensor measurement with interactive simulation." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Wheatstone Bridge Circuit Tutorial",
          "description": "Learn the Wheatstone bridge balance condition and use it for precision resistance measurement and sensor interfacing.",
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
          <span className="text-gray-200">Wheatstone Bridge</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">Wheatstone Bridge Circuit</h1>
        <p className="text-gray-400 text-lg mb-8">
          The Wheatstone bridge is a precision electrical circuit used to measure unknown resistances and
          form the basis for many sensor interfaces including strain gauges, thermistors, and pressure sensors.
        </p>

        {/* What is section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">What is a Wheatstone Bridge?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A Wheatstone bridge consists of four resistors arranged in a diamond (H-bridge) configuration
            with a voltage source across one diagonal and a galvanometer (null detector) across the other.
            When the bridge is balanced, no current flows through the galvanometer, allowing very precise
            resistance measurement.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Circuit Topology</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Four resistors R1, R2, R3, R4 form two voltage dividers:<br />
              • Left arm: R1 (top) and R3 (bottom)<br />
              • Right arm: R2 (top) and R4 (bottom)<br />
              • Supply V connects top-to-bottom of both arms<br />
              • Galvanometer G connects the two midpoints
            </p>
          </div>
        </section>

        {/* Balance Condition */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Balance Condition</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The bridge is balanced when the ratio of resistances in each arm is equal. At balance, the
            voltage across the galvanometer is zero:
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl mb-2">R1 / R2 = R3 / R4</div>
            <div className="text-gray-400 text-sm">or equivalently: R1 × R4 = R2 × R3</div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            If three resistors are known and one is unknown (Rx), rearranging gives:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-center mt-3">
            <div className="text-cyan-300 text-lg">Rx = R2 × R3 / R1</div>
          </div>
        </section>

        {/* Bridge Imbalance */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Imbalanced Bridge & Output Voltage</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            When the bridge is not balanced (e.g., a sensor changes one resistor's value), an output voltage
            V_out appears across the galvanometer terminals:
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl">
              V_out = Vs × [ R4/(R3+R4) − R2/(R1+R2) ]
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed mb-3">
            For a small change ΔR in one arm (e.g., a strain gauge under load), and all other arms equal to R:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-center">
            <div className="text-cyan-300 text-lg">V_out ≈ Vs × (ΔR / 4R)</div>
          </div>
        </section>

        {/* Strain Gauge Application */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Strain Gauge Application</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            In industrial weighing and force measurement, one or more arms of the bridge are replaced with
            strain gauges. When the gauge experiences mechanical stress, its resistance changes by ΔR = GF × ε × R,
            where GF is the gauge factor (typically 2.0) and ε is the mechanical strain.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Bridge Configurations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">Quarter Bridge</div>
                <div>1 active gauge, 3 fixed resistors. Simplest; most sensitive to temperature drift.</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">Half Bridge</div>
                <div>2 active gauges in adjacent arms. Doubles sensitivity, cancels some temperature error.</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">Full Bridge</div>
                <div>4 active gauges. Maximum sensitivity (4×), best temperature compensation.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Design Example */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Design Example</h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Goal:</strong> Measure an unknown resistor Rx ≈ 2.5 kΩ<br /><br />
              <strong className="text-white">Setup:</strong> R1 = 1 kΩ, R2 = 1 kΩ, R3 = variable (0–5 kΩ pot)<br /><br />
              <strong className="text-white">Balance point:</strong> Adjust R3 until galvanometer reads zero.<br />
              At balance: Rx = R2 × R3 / R1 = 1k × 2.5k / 1k = <span className="text-cyan-400">2.5 kΩ</span><br /><br />
              <strong className="text-white">Supply:</strong> Vs = 5V. Accuracy limited by galvanometer sensitivity
              and resistor tolerances. Use 0.1% tolerance resistors for precision work.
            </p>
          </div>
        </section>

        {/* Applications */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Load Cells', desc: 'Full-bridge strain gauge configuration in industrial weighing scales and force sensors.' },
              { title: 'Temperature Sensing', desc: 'Thermistors or RTDs replace one bridge arm for precision temperature measurement.' },
              { title: 'Pressure Sensors', desc: 'Piezoresistive elements on a silicon diaphragm form a bridge inside MEMS pressure sensors.' },
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
          <h2 className="text-2xl font-bold text-white mb-3">Simulate the Wheatstone Bridge</h2>
          <p className="text-gray-300 mb-6">
            Build a bridge circuit in NodeSim, vary one resistor, and observe the output voltage change.
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
              <div className="text-sm text-gray-400">Amplify the bridge output signal</div>
            </Link>
            <Link to="/tutorials/voltage-follower" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">Voltage Follower</div>
              <div className="text-sm text-gray-400">Buffer bridge output with high impedance</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default WheatstonesBridgeTutorial;
