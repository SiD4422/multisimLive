import React, { Suspense, lazy, type ComponentType } from 'react';
import { Route } from 'react-router-dom';
import Layout from '../pages/Layout';
import LandingPage from '../pages/LandingPage';
import FeaturesPage from '../pages/FeaturesPage';
import { AboutPage } from '../pages/AboutPage';
import { EducatorsPage, WorksheetPage } from '../pages/EducatorsPage';
import { ShowcasePage } from '../pages/ShowcasePage';
import ProcedurePage from '../pages/ProcedurePage';
import ResourcesPage from '../pages/ResourcesPage';
import CircuitTemplatePage from '../pages/CircuitTemplatePage';

const LOADING = <div style={{ padding: '2rem' }}>Loading...</div>;
const LOADING_DARK = <div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>;

type LazyModule = { default: ComponentType };
type LazyLoader = () => Promise<LazyModule>;

/**
 * Resolves a route element either from an eager SSR module map (no Suspense fallback
 * emitted into static HTML) or via React.lazy (preserving client code splitting).
 */
function makeElement(
  modulePath: string,
  loader: LazyLoader,
  fallback: React.ReactNode,
  eagerModules?: Record<string, LazyModule>,
): React.ReactNode {
  const eager = eagerModules?.[modulePath]?.default;
  if (eager) {
    const Comp = eager;
    return <Comp />;
  }
  const LazyComp = lazy(loader);
  return <Suspense fallback={fallback}><LazyComp /></Suspense>;
}

/**
 * Shared marketing, tutorial, comparison, tool, and circuit routes used by both client App.tsx
 * and SSR entry-server.tsx. Keeping Simulator outside this tree ensures SSR never pulls in Konva or ngspice-wasm.
 */
export function renderMarketingRoutes(eagerModules?: Record<string, LazyModule>) {
  const el = (pathKey: string, loader: LazyLoader, fallback: React.ReactNode = LOADING) =>
    makeElement(pathKey, loader, fallback, eagerModules);

  return (
    <>
      {/* Standalone Landing Page with its own header */}
      <Route path="/" element={<LandingPage />} />

      {/* Marketing Pages with shared Navbar & Footer */}
      <Route element={<Layout />}>
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/educators" element={<EducatorsPage />} />
        <Route path="/educators/worksheets" element={<WorksheetPage />} />
        <Route path="/educators/worksheets/:slug" element={<WorksheetPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/circuits" element={el('../pages/CircuitsPage.tsx', () => import('../pages/CircuitsPage'))} />
        <Route path="/circuits/:id" element={<CircuitTemplatePage />} />
        <Route path="/procedure" element={<ProcedurePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/privacy" element={el('../pages/PrivacyPage.tsx', () => import('../pages/PrivacyPage'))} />
        <Route path="/terms" element={el('../pages/TermsPage.tsx', () => import('../pages/TermsPage'))} />

        {/* SEO Pages */}
        <Route path="/tutorials" element={el('../pages/TutorialsIndex.tsx', () => import('../pages/TutorialsIndex'), LOADING_DARK)} />
        <Route path="/compare" element={el('../pages/CompareIndex.tsx', () => import('../pages/CompareIndex'), LOADING_DARK)} />
        <Route path="/tutorials/rc-circuit" element={el('../pages/tutorials/RcCircuitTutorial.tsx', () => import('../pages/tutorials/RcCircuitTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/555-timer" element={el('../pages/tutorials/Timer555Tutorial.tsx', () => import('../pages/tutorials/Timer555Tutorial'), LOADING_DARK)} />
        <Route path="/tutorials/transistor-amplifier" element={el('../pages/tutorials/TransistorTutorial.tsx', () => import('../pages/tutorials/TransistorTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/op-amp" element={el('../pages/tutorials/OpAmpTutorial.tsx', () => import('../pages/tutorials/OpAmpTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/diode-rectifier" element={el('../pages/tutorials/DiodeRectifierTutorial.tsx', () => import('../pages/tutorials/DiodeRectifierTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/rlc-circuit" element={el('../pages/tutorials/RlcCircuitTutorial.tsx', () => import('../pages/tutorials/RlcCircuitTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/mosfet-switch" element={el('../pages/tutorials/MosfetTutorial.tsx', () => import('../pages/tutorials/MosfetTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/power-supply" element={el('../pages/tutorials/PowerSupplyTutorial.tsx', () => import('../pages/tutorials/PowerSupplyTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/differential-amplifier" element={el('../pages/tutorials/DifferentialAmplifierTutorial.tsx', () => import('../pages/tutorials/DifferentialAmplifierTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/voltage-follower" element={el('../pages/tutorials/VoltageFollowerTutorial.tsx', () => import('../pages/tutorials/VoltageFollowerTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/colpitts-oscillator" element={el('../pages/tutorials/ColpittsOscillatorTutorial.tsx', () => import('../pages/tutorials/ColpittsOscillatorTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/wheatstone-bridge" element={el('../pages/tutorials/WheatstonesBridgeTutorial.tsx', () => import('../pages/tutorials/WheatstonesBridgeTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/active-filter" element={el('../pages/tutorials/ActiveFilterTutorial.tsx', () => import('../pages/tutorials/ActiveFilterTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/pwm-circuit" element={el('../pages/tutorials/PWMCircuitTutorial.tsx', () => import('../pages/tutorials/PWMCircuitTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/logic-gates" element={el('../pages/tutorials/LogicGateTutorial.tsx', () => import('../pages/tutorials/LogicGateTutorial'), LOADING_DARK)} />
        <Route path="/tutorials/darlington-pair" element={el('../pages/tutorials/DarlingtonTutorial.tsx', () => import('../pages/tutorials/DarlingtonTutorial'), LOADING_DARK)} />
        <Route path="/components" element={el('../pages/ComponentsPage.tsx', () => import('../pages/ComponentsPage'))} />

        <Route path="/compare/ltspice" element={el('../pages/compare/VsLtspice.tsx', () => import('../pages/compare/VsLtspice'), LOADING_DARK)} />
        <Route path="/compare/multisim" element={el('../pages/compare/VsMultisim.tsx', () => import('../pages/compare/VsMultisim'), LOADING_DARK)} />
        <Route path="/compare/falstad" element={el('../pages/compare/VsFalstad.tsx', () => import('../pages/compare/VsFalstad'), LOADING_DARK)} />
        <Route path="/compare/circuitlab" element={el('../pages/compare/VsCircuitlab.tsx', () => import('../pages/compare/VsCircuitlab'), LOADING_DARK)} />
        <Route path="/compare/tinkercad" element={el('../pages/compare/VsTinkercad.tsx', () => import('../pages/compare/VsTinkercad'), LOADING_DARK)} />
        <Route path="/compare/wokwi" element={el('../pages/compare/VsWokwi.tsx', () => import('../pages/compare/VsWokwi'), LOADING_DARK)} />

        {/* Programmatic SEO — individual circuit simulator pages */}
        <Route path="/circuits/rc-low-pass-filter" element={el('../pages/circuits/RcLowPassFilter.tsx', () => import('../pages/circuits/RcLowPassFilter'))} />
        <Route path="/circuits/inverting-op-amp" element={el('../pages/circuits/InvertingOpAmp.tsx', () => import('../pages/circuits/InvertingOpAmp'))} />
        <Route path="/circuits/555-timer-astable" element={el('../pages/circuits/Timer555Astable.tsx', () => import('../pages/circuits/Timer555Astable'))} />
        <Route path="/circuits/rlc-resonance" element={el('../pages/circuits/RlcResonance.tsx', () => import('../pages/circuits/RlcResonance'))} />
        <Route path="/circuits/half-wave-rectifier" element={el('../pages/circuits/DiodeHalfWaveRectifier.tsx', () => import('../pages/circuits/DiodeHalfWaveRectifier'))} />
        <Route path="/circuits/full-wave-rectifier" element={el('../pages/circuits/FullWaveRectifier.tsx', () => import('../pages/circuits/FullWaveRectifier'))} />
        <Route path="/circuits/common-emitter-amplifier" element={el('../pages/circuits/CommonEmitterAmplifier.tsx', () => import('../pages/circuits/CommonEmitterAmplifier'))} />
        <Route path="/circuits/buck-converter" element={el('../pages/circuits/BuckConverter.tsx', () => import('../pages/circuits/BuckConverter'))} />
        <Route path="/circuits/voltage-divider" element={el('../pages/circuits/VoltageDividerCircuit.tsx', () => import('../pages/circuits/VoltageDividerCircuit'))} />
        <Route path="/circuits/zener-diode" element={el('../pages/circuits/ZenerDiodeCircuit.tsx', () => import('../pages/circuits/ZenerDiodeCircuit'))} />
        <Route path="/circuits/mosfet-switch" element={el('../pages/circuits/MosfetSwitchCircuit.tsx', () => import('../pages/circuits/MosfetSwitchCircuit'))} />

        <Route path="/tools" element={el('../pages/tools/ToolsIndex.tsx', () => import('../pages/tools/ToolsIndex'))} />
        <Route path="/tools/ohms-law" element={el('../pages/tools/OhmsLawCalculator.tsx', () => import('../pages/tools/OhmsLawCalculator'))} />
        <Route path="/tools/voltage-divider" element={el('../pages/tools/VoltageDividerCalculator.tsx', () => import('../pages/tools/VoltageDividerCalculator'))} />
        <Route path="/tools/rc-calculator" element={el('../pages/tools/RcCalculator.tsx', () => import('../pages/tools/RcCalculator'))} />
        <Route path="/tools/555-timer" element={el('../pages/tools/Timer555Calculator.tsx', () => import('../pages/tools/Timer555Calculator'))} />
        <Route path="/tools/resistor-color-code" element={el('../pages/tools/ResistorColorCodeCalculator.tsx', () => import('../pages/tools/ResistorColorCodeCalculator'))} />
      </Route>
    </>
  );
}
