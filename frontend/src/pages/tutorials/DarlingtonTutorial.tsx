import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DarlingtonTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Darlington Pair Transistor Circuit Tutorial | NodeSim</title>
        <meta name="description" content="Learn the Darlington pair transistor: combined β = β1×β2, high current gain, motor driver applications, VBE(total) ≈ 1.4V, TIP120 example with interactive simulation." />
        <meta name="keywords" content="Darlington pair, Darlington transistor, TIP120, high current gain, motor driver, power transistor, beta multiplication" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/darlington-pair" />
        <meta property="og:title" content="Darlington Pair Transistor Tutorial | NodeSim" />
        <meta property="og:description" content="Design a Darlington pair for high-current motor and relay driving applications." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Darlington Pair Transistor Circuit Tutorial",
          "description": "Learn the Darlington pair configuration for high current gain, motor driving, and relay control applications.",
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
          <span className="text-gray-200">Darlington Pair</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">Darlington Pair Transistor</h1>
        <p className="text-gray-400 text-lg mb-8">
          The Darlington pair connects two bipolar transistors in series to achieve extremely high current gain.
          A microcontroller GPIO pin can directly drive motors, solenoids, and relays that draw hundreds of milliamps.
        </p>

        {/* What is a Darlington */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">What is a Darlington Pair?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A Darlington pair consists of two NPN (or PNP) transistors where the emitter of the first transistor
            (Q1) is directly connected to the base of the second transistor (Q2). The collectors of both transistors
            are tied together. The result behaves as a single super-transistor with:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-800 text-center">
              <div className="text-cyan-300 font-mono text-xl mb-1">β_total = β₁ × β₂</div>
              <div className="text-gray-400 text-sm">Combined current gain</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-800 text-center">
              <div className="text-cyan-300 font-mono text-xl mb-1">V_BE ≈ 1.4 V</div>
              <div className="text-gray-400 text-sm">Two junctions in series</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-800 text-center">
              <div className="text-cyan-300 font-mono text-xl mb-1">V_CE(sat) ≈ 1 V</div>
              <div className="text-gray-400 text-sm">Higher than single BJT</div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">How It Works</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            When a small base current I_B flows into Q1, Q1 amplifies it by β₁ at its emitter. This emitter
            current then becomes the base current for Q2, which amplifies it again by β₂. The final collector
            current is:
          </p>
          <div className="bg-gray-800 rounded-lg p-6 border border-cyan-800 font-mono text-center mb-4">
            <div className="text-cyan-300 text-xl">I_C = β₁ × β₂ × I_B = β_total × I_B</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Example</h3>
            <p className="text-gray-300 text-sm">
              With β₁ = 100 and β₂ = 100:<br />
              β_total = 100 × 100 = <span className="text-cyan-400">10,000</span><br /><br />
              A 1 µA base current controls 10 mA collector current!<br />
              A 50 µA GPIO signal can drive a 500 mA motor.
            </p>
          </div>
        </section>

        {/* Discrete vs integrated */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Discrete vs. Integrated Darlington</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">Discrete (Two BJTs)</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Flexible choice of transistors</li>
                <li>• Higher power handling (separate heat sinks)</li>
                <li>• Can add external components (bypass R)</li>
                <li>• More board space needed</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">Integrated (TIP120, TIP122, 2N6027)</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Single TO-220 package (3 pins)</li>
                <li>• TIP120: NPN, 60V, 5A, β ≥ 1000</li>
                <li>• Built-in internal emitter resistors</li>
                <li>• Easier to use, standard pinout</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Motor driver circuit */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Motor Driver Circuit (TIP120)</h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <h3 className="text-base font-semibold text-gray-200 mb-3">Component List</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <ul className="space-y-1">
                  <li><span className="text-cyan-400">Q1</span> — TIP120 NPN Darlington (TO-220)</li>
                  <li><span className="text-cyan-400">R_B</span> — Base resistor: (V_in − 1.4) / I_B_desired</li>
                  <li><span className="text-cyan-400">D1</span> — 1N4007 flyback diode across motor</li>
                </ul>
              </div>
              <div>
                <ul className="space-y-1">
                  <li><span className="text-cyan-400">M1</span> — DC motor (5–12V)</li>
                  <li><span className="text-cyan-400">V_cc</span> — Motor supply voltage</li>
                  <li><span className="text-cyan-400">V_in</span> — Control signal (3.3V or 5V GPIO)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Base Resistor Calculation</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              For TIP120, minimum base current to saturate with 500 mA motor:<br />
              I_B_min = I_C / β_forced = 500 mA / 1000 (conservative) = <span className="text-cyan-400">0.5 mA</span><br /><br />
              R_B = (V_in − V_BE) / I_B = (5V − 1.4V) / 0.5 mA = <span className="text-cyan-400">7.2 kΩ → use 6.8 kΩ</span><br /><br />
              <span className="text-yellow-400">⚠ Always add flyback diode D1 across the motor to suppress inductive spikes!</span>
            </p>
          </div>
        </section>

        {/* Tradeoffs */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Tradeoffs vs. Single BJT</h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-semibold text-green-400 mb-1">Advantages</div>
                <ul className="space-y-1">
                  <li>✓ Extremely high current gain (β &gt; 1000)</li>
                  <li>✓ Drive high-current loads from µA signals</li>
                  <li>✓ Integrated packages simplify design</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-red-400 mb-1">Disadvantages</div>
                <ul className="space-y-1">
                  <li>✗ Higher V_CE(sat) ≈ 1V (more heat in saturated use)</li>
                  <li>✗ Slower switching speed than single BJT</li>
                  <li>✗ Higher V_BE ≈ 1.4V threshold</li>
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
              { title: 'Motor Driver', desc: 'Drive DC motors directly from microcontroller PWM output via TIP120/122.' },
              { title: 'Relay Driver', desc: 'Switch relay coils (100–300 mA) from logic-level signals.' },
              { title: 'High-Power LED', desc: 'Drive high-power LEDs or LED arrays beyond GPIO current limits.' },
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
          <h2 className="text-2xl font-bold text-white mb-3">Simulate a Darlington Motor Driver</h2>
          <p className="text-gray-300 mb-6">
            Build a TIP120 motor driver circuit in NodeSim and verify the collector current and saturation.
          </p>
          <Link
            to="/simulator"
            className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Open Simulator →
          </Link>
        </section>

        {/* Related */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Related Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link to="/tutorials/transistor-amplifier" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">BJT Transistor</div>
              <div className="text-sm text-gray-400">Single BJT amplifier and switch</div>
            </Link>
            <Link to="/tutorials/mosfet-switch" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">MOSFET Switch</div>
              <div className="text-sm text-gray-400">Alternative for high-efficiency switching</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default DarlingtonTutorial;
