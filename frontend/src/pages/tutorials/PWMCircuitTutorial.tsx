import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PWMCircuitTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>PWM Circuit with 555 Timer Tutorial | NodeSim</title>
        <meta name="description" content="Learn PWM generation using a 555 timer in astable mode. Calculate duty cycle D = RA/(RA+RB) and frequency f = 1.44/((RA+2RB)×C) with interactive simulation." />
        <meta name="keywords" content="PWM, pulse width modulation, 555 timer, duty cycle, astable multivibrator, motor control, LED dimming" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/pwm-circuit" />
        <meta property="og:title" content="PWM Circuit with 555 Timer Tutorial | NodeSim" />
        <meta property="og:description" content="Design a 555 timer PWM circuit and control duty cycle with a potentiometer." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "PWM Circuit with 555 Timer",
          "description": "Learn PWM generation using a 555 timer — calculate duty cycle and frequency, control with a pot.",
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
          <span className="text-gray-200">PWM with 555 Timer</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">PWM Circuit with 555 Timer</h1>
        <p className="text-gray-400 text-lg mb-8">
          Pulse Width Modulation (PWM) lets you control power to loads like LEDs and motors by rapidly
          switching a signal on and off. The ubiquitous 555 timer IC in astable mode is the classic approach.
        </p>

        {/* What is PWM */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">What is PWM?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            PWM is a technique where the width (duration) of each ON pulse is varied while the period stays
            constant. The average power delivered to the load is proportional to the duty cycle — the ratio
            of on-time to total period.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-center text-gray-300">
              <div className="bg-gray-700 rounded p-3">
                <div className="text-2xl font-mono text-cyan-400 mb-1">25%</div>
                <div>Dim LED / slow motor</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="text-2xl font-mono text-cyan-400 mb-1">50%</div>
                <div>Half power</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="text-2xl font-mono text-cyan-400 mb-1">75%</div>
                <div>Bright LED / fast motor</div>
              </div>
            </div>
          </div>
        </section>

        {/* 555 Timer PWM */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">555 Timer in Astable Mode</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            In astable configuration, the 555 timer continuously charges and discharges a capacitor C through
            resistors RA and RB. The output goes HIGH while C charges from 1/3 Vcc to 2/3 Vcc (through RA+RB),
            and LOW while C discharges from 2/3 Vcc to 1/3 Vcc (through RB only).
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <h3 className="text-base font-semibold text-gray-200 mb-2">Pin Connections for Astable Mode</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li><span className="text-cyan-400">Pin 1 (GND)</span> → Ground</li>
              <li><span className="text-cyan-400">Pin 2 (TRIG)</span> → connected to Pin 6 (THRESH)</li>
              <li><span className="text-cyan-400">Pin 4 (RST)</span> → Vcc (keep HIGH to enable)</li>
              <li><span className="text-cyan-400">Pin 5 (CTRL)</span> → 10 nF bypass capacitor to GND</li>
              <li><span className="text-cyan-400">Pin 6 (THRESH)</span> → junction of RB and C</li>
              <li><span className="text-cyan-400">Pin 7 (DIS)</span> → junction of RA and RB</li>
              <li><span className="text-cyan-400">Pin 8 (Vcc)</span> → Supply (5–15V)</li>
            </ul>
          </div>
        </section>

        {/* Formulas */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Frequency & Duty Cycle Formulas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-5 border border-cyan-800">
              <h3 className="text-base font-semibold text-gray-200 mb-3">Frequency</h3>
              <div className="font-mono text-cyan-300 text-lg text-center">
                f = 1.44 / ((RA + 2×RB) × C)
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-5 border border-cyan-800">
              <h3 className="text-base font-semibold text-gray-200 mb-3">Duty Cycle</h3>
              <div className="font-mono text-cyan-300 text-lg text-center">
                D = (RA + RB) / (RA + 2×RB)
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm text-gray-400">
            <p><strong className="text-gray-200">Note:</strong> Standard 555 astable always has D &gt; 50% because the charge path includes both RA and RB while discharge only uses RB. To achieve 50% duty cycle, add a diode in parallel with RB so charging only goes through RA.</p>
          </div>
        </section>

        {/* Design Example */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Design Example — 1 kHz, ~67% Duty Cycle</h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Components:</strong> RA = 10 kΩ, RB = 10 kΩ, C = 47 nF<br /><br />
              <strong className="text-white">Frequency:</strong><br />
              f = 1.44 / ((10k + 2×10k) × 47n) = 1.44 / (30k × 47n) = <span className="text-cyan-400">≈ 1.02 kHz</span><br /><br />
              <strong className="text-white">Duty Cycle:</strong><br />
              D = (10k + 10k) / (10k + 2×10k) = 20k / 30k = <span className="text-cyan-400">66.7%</span><br /><br />
              <strong className="text-white">Pot-controlled:</strong> Replace RA with a 100 kΩ potentiometer + 1 kΩ
              series (minimum) to vary duty cycle from ~50% to ~91% while keeping f roughly constant.
            </p>
          </div>
        </section>

        {/* Applications */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'LED Dimming', desc: 'Control LED brightness smoothly without color shift by varying duty cycle at >100 Hz.' },
              { title: 'DC Motor Speed', desc: 'Drive motor speed proportionally to duty cycle. Add a flyback diode for inductive loads.' },
              { title: 'Servo Control', desc: '50 Hz signal, 1–2 ms pulse width controls servo angle (0°–180°).' },
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
          <h2 className="text-2xl font-bold text-white mb-3">Simulate a 555 Timer PWM Circuit</h2>
          <p className="text-gray-300 mb-6">
            Build a 555 astable PWM generator in NodeSim and watch the duty cycle change in real time.
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
            <Link to="/tutorials/555-timer" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">555 Timer Basics</div>
              <div className="text-sm text-gray-400">Monostable and astable configurations</div>
            </Link>
            <Link to="/tutorials/transistor-amplifier" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">Transistor Switch</div>
              <div className="text-sm text-gray-400">Drive high-current loads from PWM signal</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default PWMCircuitTutorial;
