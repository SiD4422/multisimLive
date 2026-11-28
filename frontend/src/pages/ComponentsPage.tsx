import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { isPinoutStubComponent, PINOUT_STUB_CATEGORY, standardICLibrary } from '../data/components';
import type { ComponentDefinition } from '../data/components';

// Static basic components list (from ComponentPalette)
const BASIC_COMPONENTS = [
  { name: 'Resistor', category: 'Passive', description: 'Fixed-value resistor. Limits current flow according to Ohm\'s Law V=IR.' },
  { name: 'Capacitor', category: 'Passive', description: 'Stores electrical charge. Used in filters, timing circuits, and power supply decoupling.' },
  { name: 'Inductor', category: 'Passive', description: 'Stores energy in a magnetic field. Used in filters, oscillators, and power converters.' },
  { name: 'Load', category: 'Passive', description: 'Generic resistive load. Represents any linear resistive element.' },
  { name: 'Diode', category: 'Semiconductors', description: 'One-way valve for current. Used in rectifiers, clamps, and protection circuits.' },
  { name: 'Zener Diode', category: 'Semiconductors', description: 'Regulates voltage at its breakdown point. Used in voltage references and clamps.' },
  { name: 'LED', category: 'Semiconductors', description: 'Light-emitting diode. Emits light proportional to forward current.' },
  { name: 'NPN BJT', category: 'Transistors', description: 'NPN bipolar junction transistor. Used as switch and amplifier.' },
  { name: 'PNP BJT', category: 'Transistors', description: 'PNP bipolar junction transistor. Complementary to NPN for push-pull stages.' },
  { name: 'N-MOSFET', category: 'Transistors', description: 'N-channel MOSFET. High-efficiency power switch and logic driver.' },
  { name: 'P-MOSFET', category: 'Transistors', description: 'P-channel MOSFET. High-side switch in power management circuits.' },
  { name: 'Op-Amp', category: 'Amplifiers', description: 'Operational amplifier (ideal). Used in inverting/non-inverting amplifiers, comparators, and filters.' },
  { name: 'Voltage Source', category: 'Sources', description: 'Ideal DC or AC voltage source. Sets node voltage independent of current.' },
  { name: 'Current Source', category: 'Sources', description: 'Ideal DC or AC current source. Supplies fixed current independent of load voltage.' },
  { name: 'Signal Generator', category: 'Sources', description: 'Generates sine, square, triangle, or PWM waveforms for transient analysis.' },
  { name: 'Ground', category: 'Sources', description: 'Reference node at 0V. All voltages measured relative to ground.' },
  { name: 'VCC Rail', category: 'Sources', description: 'Power supply rail. Shorthand for connecting to a named supply voltage.' },
  { name: 'Transformer', category: 'Magnetics', description: 'Coupled inductors for voltage step-up/step-down and isolation.' },
  { name: 'Switch', category: 'Sources', description: 'Ideal SPST switch. Open or closed for DC/transient analysis.' },
  { name: 'Potentiometer', category: 'Passive', description: 'Variable resistor with wiper. Used for gain control and position sensing.' },
  { name: 'Thermistor', category: 'Sensors', description: 'Temperature-sensitive resistor (NTC/PTC). Used in temperature sensing and inrush limiting.' },
  { name: 'LDR', category: 'Sensors', description: 'Light-dependent resistor. Resistance decreases with increasing illumination.' },
  { name: 'Crystal', category: 'Passive', description: 'Piezoelectric resonator for high-precision frequency reference in oscillators.' },
  { name: 'Fuse', category: 'Protection', description: 'Overcurrent protection device. Opens when current exceeds rated value.' },
];

type ViewMode = 'grid' | 'list';

interface ComponentEntry {
  id?: string;
  name: string;
  category: string;
  description: string;
  isIC: boolean;
  isPinoutStub?: boolean;
  pinCount?: number;
}

const CATEGORY_ORDER = [
  'Passive', 'Semiconductors', 'Transistors', 'Amplifiers', 'Sources',
  'Magnetics', 'Sensors', 'Protection',
  'Logic Gates', 'Integrated Circuits', 'Sources & Switches', 'Passive Components',
  PINOUT_STUB_CATEGORY,
];

function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

const ComponentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');

  const allComponents: ComponentEntry[] = [
    ...BASIC_COMPONENTS.map(c => ({ ...c, isIC: false, isPinoutStub: false })),
    ...standardICLibrary.map((ic: ComponentDefinition) => ({
      id: ic.id,
      name: ic.name,
      category: ic.category,
      description: ic.description,
      isIC: true,
      isPinoutStub: isPinoutStubComponent(ic.id),
      pinCount: ic.pins.length,
    })),
  ];
  const simulatedComponentsCount = allComponents.filter(c => !c.isPinoutStub).length;
  const pinoutStubsCount = allComponents.filter(c => c.isPinoutStub).length;

  const filtered = search.trim()
    ? allComponents.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : allComponents;

  const grouped = groupByCategory(filtered);

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <>
      <SEO
        title={`Circuit Components Library | ${simulatedComponentsCount}+ SPICE & Behavioral Models — NodeSim`}
        description="Browse SPICE and behavioral circuit models in NodeSim: resistors, capacitors, inductors, op-amps, MOSFETs, BJTs, logic gates, 555 timers, regulators, and optocouplers — plus quarantined schematic pinout stubs."
        url="https://www.nodesimapp.com/components"
        canonical="https://www.nodesimapp.com/components"
      />

      <main className="max-w-7xl mx-auto px-4 py-12 text-gray-100">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-cyan-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-200">Components</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            {simulatedComponentsCount}+ Simulated SPICE Components
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Analog, power, digital gate, and IC SPICE simulation for ECE/EEE students — running locally in your
            browser via ngspice WASM. Schematic pinout stubs without firmware/protocol SPICE models are listed separately below.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Simulated Models', value: simulatedComponentsCount.toString() },
            { label: 'Simulated ICs / Gates', value: (standardICLibrary.length - pinoutStubsCount).toString() },
            { label: 'Pinout Stubs (Quarantined)', value: pinoutStubsCount.toString() },
            { label: 'Categories', value: Object.keys(groupByCategory(allComponents)).length.toString() },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & view toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="search"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            aria-label="Search components"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'grid' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Results count when searching */}
        {search && (
          <p className="text-gray-400 text-sm mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* Component groups */}
        {sortedCategories.map(category => (
          <section key={category} className="mb-10">
            <h2 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${category === PINOUT_STUB_CATEGORY ? 'text-amber-400' : 'text-cyan-400'}`}>
              {category === PINOUT_STUB_CATEGORY ? `⚠️ ${category}` : category}
              <span className="text-sm text-gray-500 font-normal">({grouped[category].length})</span>
            </h2>
            {category === PINOUT_STUB_CATEGORY && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                Pinout layout &amp; basic terminal impedances only. Microcontroller firmware, OLED/TFT/LCD displays, wireless packets, and digital sensor protocols cannot be executed in SPICE.
              </div>
            )}

            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {grouped[category].map(comp => (
                  <div
                    key={comp.name}
                    className={`bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border transition-colors ${comp.isPinoutStub ? 'border-amber-700/60 hover:border-amber-500' : 'border-gray-700 hover:border-cyan-700'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-white">{comp.name}</div>
                      {comp.isPinoutStub && (
                        <span className="shrink-0 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                          Pinout Stub
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed line-clamp-3">{comp.description}</div>
                    {'pinCount' in comp && comp.pinCount && (
                      <div className="mt-2 text-xs text-gray-500">{comp.pinCount} pins</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {grouped[category].map((comp, i) => (
                  <div
                    key={comp.name}
                    className={`flex items-start gap-4 px-4 py-3 ${i < grouped[category].length - 1 ? 'border-b border-gray-700/50' : ''}`}
                  >
                    <div className="min-w-[180px] font-semibold text-white text-sm flex items-center gap-2">
                      <span>{comp.name}</span>
                      {comp.isPinoutStub && (
                        <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                          Pinout
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 leading-relaxed flex-1">{comp.description}</div>
                    {'pinCount' in comp && comp.pinCount && (
                      <div className="text-xs text-gray-500 whitespace-nowrap">{comp.pinCount} pins</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No components found for "{search}"</p>
            <p className="text-sm mt-2">Try a different search term or <button onClick={() => setSearch('')} className="text-cyan-400 hover:underline">clear the filter</button></p>
          </div>
        )}

        {/* CTA */}
        <section className="mt-12 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-8 border border-cyan-700/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Simulate?</h2>
          <p className="text-gray-300 mb-6">
            All {simulatedComponentsCount}+ simulated SPICE &amp; behavioral models (plus {pinoutStubsCount} schematic pinout blocks) are available free in the NodeSim browser simulator.
            No account, no install — just open and start building.
          </p>
          <Link
            to="/simulator"
            className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Open Simulator Free →
          </Link>
        </section>
      </main>
    </>
  );
};

export default ComponentsPage;
