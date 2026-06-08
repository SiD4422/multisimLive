import React from 'react';

export default function ProcedurePage() {
  return (
    <section className="procedure bg-gray-50 text-gray-900" style={{ paddingTop: '4rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-12 border-b pb-6">
          <h1 className="text-4xl font-extrabold text-green-800 mb-2">How to Use MultiSimlab</h1>
          <p className="text-lg text-gray-600">A step-by-step guide to building and simulating your first circuit.</p>
        </div>

        <div className="space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-shrink-0 bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">1</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Select Components</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Start by opening the left sidebar. You will find various categories such as <strong>Sources</strong>, <strong>Passives</strong>, <strong>Semiconductors</strong>, and <strong>Analysis</strong>. 
                Click on a category to open its flyout menu, then click on a component (like an AC Voltage Source or a Resistor) to select it for placement.
              </p>
              <img src="/docs/step1_sidebar.png" alt="Sidebar and component selection" className="w-full rounded-lg shadow-md border border-gray-200 mt-4" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-shrink-0 bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">2</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Place and Wire (Don't forget Ground!)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Click anywhere on the canvas to place your selected components. To draw wires, simply click and drag from one component pin to another.
                <br /><br />
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold text-sm">CRITICAL:</span> You <strong>must</strong> place a Ground component in every circuit. The SPICE engine requires a 0V reference node to calculate voltages. Without a ground, the simulation will fail with a "Singular Matrix" error.
              </p>
              <img src="/docs/step2_canvas.png" alt="Components placed and wired with a ground node" className="w-full rounded-lg shadow-md border border-gray-200 mt-4" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-shrink-0 bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">3</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Configure Component Values</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Need to change the resistance from 1kΩ to 10kΩ, or adjust your AC Source frequency? 
                <strong>Double-click</strong> any component on the canvas. This will open the Inspector Panel on the right side of the screen, where you can modify all SPICE parameters for that specific component.
              </p>
              <img src="/docs/step3_properties.png" alt="Component Inspector Panel" className="w-full rounded-lg shadow-md border border-gray-200 mt-4" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-shrink-0 bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">4</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Add Probes & Simulate</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Before running the simulation, you must tell the engine <em>what</em> to measure. Go to the <strong>Analysis</strong> category in the sidebar and place a <strong>Voltage Probe</strong> on a wire in your closed circuit.
                <br /><br />
                Once your circuit is fully closed (all wires connected in a loop with a ground), hit the green <strong>Run</strong> button in the top toolbar to start the simulation.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-shrink-0 bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">5</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Analyze the Graph (Scope & Cursors)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Switch to the <strong>Grapher</strong> or <strong>Split</strong> tab to view your simulated waveforms. The graph will plot the data collected by your probes.
                <br /><br />
                <strong>Oscilloscope Mode:</strong> In the top right corner of the Grapher, click the <strong>Scope Mode</strong> toggle. This transforms the graph into a premium dark theme with neon-colored traces, simulating a real-world digital oscilloscope!
                <br /><br />
                <strong>Using Cursors:</strong> Simply move your mouse over the graph to see live values. To take a precise measurement, <strong>Click</strong> anywhere on the graph to drop a pinned cursor. You can use these cursors to measure exact peak voltages, time delays, and frequencies.
              </p>
              <img src="/docs/step4_grapher.png" alt="Simulation Grapher in dark mode" className="w-full rounded-lg shadow-md border border-gray-200 mt-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
