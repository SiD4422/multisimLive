import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const LogicGateTutorial: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Logic Gates Tutorial — NAND, NOR & Universal Gates | NodeSim</title>
        <meta name="description" content="Master logic gates: NAND truth table, De Morgan's theorem NAND(A,B) = NOT(A AND B), CMOS implementation, fan-out limits, and universal gate concept with simulation." />
        <meta name="keywords" content="logic gates, NAND gate, NOR gate, De Morgan theorem, universal gate, CMOS logic, digital circuit simulation" />
        <link rel="canonical" href="https://nodesimfree.netlify.app/tutorials/logic-gates" />
        <meta property="og:title" content="Logic Gates Tutorial — NAND, NOR & Universal Gates | NodeSim" />
        <meta property="og:description" content="Learn NAND gate truth tables, De Morgan's theorem, and how to build any logic function from NAND gates." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Logic Gates Tutorial — NAND, NOR & Universal Gates",
          "description": "Master NAND gate truth table, De Morgan's theorem, CMOS implementation, and the universal gate concept.",
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
          <span className="text-gray-200">Logic Gates</span>
        </nav>

        <h1 className="text-4xl font-bold text-white mb-4">Logic Gates — NAND, NOR & Universal Gates</h1>
        <p className="text-gray-400 text-lg mb-8">
          Logic gates are the fundamental building blocks of all digital circuits. NAND and NOR gates are
          "universal" — any Boolean function can be implemented using only one type, making them critical
          for VLSI and FPGA design.
        </p>

        {/* Basic gates */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Basic Logic Gates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { name: 'AND', expr: 'Y = A · B', desc: 'Output HIGH only when ALL inputs are HIGH' },
              { name: 'OR', expr: 'Y = A + B', desc: 'Output HIGH when ANY input is HIGH' },
              { name: 'NOT', expr: 'Y = Ā', desc: 'Inverts the input signal' },
              { name: 'XOR', expr: 'Y = A ⊕ B', desc: 'Output HIGH when inputs DIFFER' },
            ].map(g => (
              <div key={g.name} className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div className="text-cyan-400 text-lg font-bold mb-1">{g.name}</div>
                <div className="font-mono text-gray-200 text-sm mb-2">{g.expr}</div>
                <div className="text-gray-400 text-xs">{g.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* NAND truth table */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">NAND Gate Truth Table</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The NAND gate (NOT-AND) produces a LOW output only when ALL inputs are HIGH. It is the complement of the AND gate:
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4 overflow-x-auto">
            <table className="w-full text-center text-sm font-mono">
              <thead>
                <tr className="text-cyan-400 border-b border-gray-700">
                  <th className="py-2 px-4">A</th>
                  <th className="py-2 px-4">B</th>
                  <th className="py-2 px-4">A AND B</th>
                  <th className="py-2 px-4">NAND (Y)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[['0','0','0','1'],['0','1','0','1'],['1','0','0','1'],['1','1','1','0']].map((row, i) => (
                  <tr key={i} className="border-b border-gray-700/50">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-2 px-4 ${j === 3 ? (cell === '0' ? 'text-red-400' : 'text-green-400') : ''}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-800 font-mono text-center">
            <div className="text-cyan-300 text-lg">NAND(A, B) = NOT(A AND B) = Ā + B̄</div>
          </div>
        </section>

        {/* De Morgan */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">De Morgan's Theorem</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            De Morgan's laws are fundamental identities that relate AND and OR operations through negation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-5 border border-cyan-800">
              <h3 className="text-base font-semibold text-gray-200 mb-2">First Law (NAND)</h3>
              <div className="font-mono text-cyan-300 text-lg text-center">NOT(A AND B) = Ā OR B̄</div>
              <div className="text-gray-400 text-xs text-center mt-2">NAND = Bubble-OR</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-5 border border-cyan-800">
              <h3 className="text-base font-semibold text-gray-200 mb-2">Second Law (NOR)</h3>
              <div className="font-mono text-cyan-300 text-lg text-center">NOT(A OR B) = Ā AND B̄</div>
              <div className="text-gray-400 text-xs text-center mt-2">NOR = Bubble-AND</div>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            De Morgan's theorem lets you convert between AND/OR forms and implement any gate using NAND or NOR primitives.
          </p>
        </section>

        {/* Universal gate */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Universal Gate: NAND Only Implementation</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Any logic function can be built using only NAND gates. This makes NAND the universal building block
            and reduces manufacturing complexity:
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">NOT from NAND</div>
                <div className="font-mono text-cyan-400">NAND(A, A) = Ā</div>
                <div className="text-gray-400 text-xs mt-1">Tie both inputs together</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">AND from NAND</div>
                <div className="font-mono text-cyan-400">NOT(NAND(A,B))</div>
                <div className="text-gray-400 text-xs mt-1">NAND + NOT = AND</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="font-semibold text-white mb-1">OR from NAND</div>
                <div className="font-mono text-cyan-400">NAND(Ā, B̄)</div>
                <div className="text-gray-400 text-xs mt-1">De Morgan's: invert both inputs</div>
              </div>
            </div>
          </div>
        </section>

        {/* CMOS Implementation */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">CMOS Implementation</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            In CMOS technology, a 2-input NAND gate uses 4 transistors — 2 PMOS in parallel (pull-up network)
            and 2 NMOS in series (pull-down network):
          </p>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-semibold text-gray-100 mb-1">Pull-Up Network (PMOS × 2, parallel)</div>
                <ul className="space-y-1">
                  <li>Output HIGH when A=0 OR B=0</li>
                  <li>PMOS conducts when gate is LOW</li>
                  <li>Implements: Y = Ā + B̄</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-gray-100 mb-1">Pull-Down Network (NMOS × 2, series)</div>
                <ul className="space-y-1">
                  <li>Output LOW only when A=1 AND B=1</li>
                  <li>NMOS conducts when gate is HIGH</li>
                  <li>Implements: Y = NOT(A AND B)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm text-gray-400">
            <strong className="text-gray-200">Fan-Out:</strong> CMOS gates can typically drive 10–50 identical gate inputs
            (fan-out = 10 is a conservative design limit). Exceeding fan-out increases propagation delay as the driving
            gate must charge the input capacitances of all driven gates.
          </div>
        </section>

        {/* Applications */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Combinational Logic', desc: 'Adders, multiplexers, comparators, decoders — all built from gate networks.' },
              { title: 'Memory Elements', desc: 'Two cross-coupled NAND gates form a SR latch — the basis for all flip-flops.' },
              { title: 'Oscillators', desc: 'An odd number of inverters (made from NAND) in a ring forms a ring oscillator.' },
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
          <h2 className="text-2xl font-bold text-white mb-3">Simulate Logic Gate Circuits</h2>
          <p className="text-gray-300 mb-6">
            Build NAND/NOR gate networks in NodeSim and verify truth tables with live logic level simulation.
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
              <div className="font-semibold text-cyan-400">Transistor as Switch</div>
              <div className="text-sm text-gray-400">The BJT that makes digital logic possible</div>
            </Link>
            <Link to="/tutorials/mosfet-switch" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors">
              <div className="font-semibold text-cyan-400">MOSFET Switch</div>
              <div className="text-sm text-gray-400">CMOS gate transistors up close</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default LogicGateTutorial;
