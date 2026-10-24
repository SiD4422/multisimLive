import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './pages/Layout';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { EducatorsPage, WorksheetPage } from './pages/EducatorsPage';
import { ShowcasePage } from './pages/ShowcasePage';
import ProcedurePage from './pages/ProcedurePage';
import ResourcesPage from './pages/ResourcesPage';
import FeedbackWidget from './components/FeedbackWidget';

import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';

import CircuitTemplatePage from './pages/CircuitTemplatePage';

// Lazy load heavy components to optimize initial marketing landing page load
const Simulator = lazy(() => import('./pages/Simulator'));
const CircuitsPage = lazy(() => import('./pages/CircuitsPage'));

const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

const TutorialsIndex = lazy(() => import('./pages/TutorialsIndex'));
const CompareIndex = lazy(() => import('./pages/CompareIndex'));

const RcCircuitTutorial = lazy(() => import('./pages/tutorials/RcCircuitTutorial'));
const TransistorTutorial = lazy(() => import('./pages/tutorials/TransistorTutorial'));
const OpAmpTutorial = lazy(() => import('./pages/tutorials/OpAmpTutorial'));
const DiodeRectifierTutorial = lazy(() => import('./pages/tutorials/DiodeRectifierTutorial'));
const RlcCircuitTutorial = lazy(() => import('./pages/tutorials/RlcCircuitTutorial'));
const Timer555Tutorial = lazy(() => import('./pages/tutorials/Timer555Tutorial'));

const VsLtspice = lazy(() => import('./pages/compare/VsLtspice'));
const VsMultisim = lazy(() => import('./pages/compare/VsMultisim'));
const VsFalstad = lazy(() => import('./pages/compare/VsFalstad'));
const VsCircuitlab = lazy(() => import('./pages/compare/VsCircuitlab'));
const VsTinkercad = lazy(() => import('./pages/compare/VsTinkercad'));
const VsWokwi = lazy(() => import('./pages/compare/VsWokwi'));

// Programmatic SEO — circuit pages
const RcLowPassFilter = lazy(() => import('./pages/circuits/RcLowPassFilter'));
const InvertingOpAmp = lazy(() => import('./pages/circuits/InvertingOpAmp'));
const Timer555Astable = lazy(() => import('./pages/circuits/Timer555Astable'));
const RlcResonance = lazy(() => import('./pages/circuits/RlcResonance'));
const DiodeHalfWaveRectifier = lazy(() => import('./pages/circuits/DiodeHalfWaveRectifier'));
const FullWaveRectifier = lazy(() => import('./pages/circuits/FullWaveRectifier'));
const CommonEmitterAmplifier = lazy(() => import('./pages/circuits/CommonEmitterAmplifier'));
const BuckConverter = lazy(() => import('./pages/circuits/BuckConverter'));
const VoltageDividerCircuit = lazy(() => import('./pages/circuits/VoltageDividerCircuit'));
const ZenerDiodeCircuit = lazy(() => import('./pages/circuits/ZenerDiodeCircuit'));
const MosfetSwitchCircuit = lazy(() => import('./pages/circuits/MosfetSwitchCircuit'));

import NotFound from './pages/NotFound';

const OhmsLawCalculator = lazy(() => import('./pages/tools/OhmsLawCalculator'));
const VoltageDividerCalculator = lazy(() => import('./pages/tools/VoltageDividerCalculator'));
const RcCalculator = lazy(() => import('./pages/tools/RcCalculator'));
const Timer555Calculator = lazy(() => import('./pages/tools/Timer555Calculator'));
const ResistorColorCodeCalculator = lazy(() => import('./pages/tools/ResistorColorCodeCalculator'));
const ToolsIndex = lazy(() => import('./pages/tools/ToolsIndex'));

/** Renders the feedback widget only outside the simulator to avoid overlapping the status bar. */
function ConditionalFeedback() {
  const { pathname } = useLocation();
  if (pathname === '/simulator') return null;
  return <FeedbackWidget />;
}

const LOADING = <div style={{padding:'2rem'}}>Loading...</div>;
const LOADING_DARK = <div style={{padding:'2rem',color:'#10b981'}}>Loading...</div>;

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <ConditionalFeedback />
          <Analytics />
          <Routes>
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
              <Route path="/circuits" element={<Suspense fallback={LOADING}><CircuitsPage /></Suspense>} />
              <Route path="/circuits/:id" element={<CircuitTemplatePage />} />
              <Route path="/procedure" element={<ProcedurePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/privacy" element={<Suspense fallback={LOADING}><PrivacyPage /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={LOADING}><TermsPage /></Suspense>} />

              {/* SEO Pages */}
              <Route path="/tutorials" element={<Suspense fallback={LOADING_DARK}><TutorialsIndex /></Suspense>} />
              <Route path="/compare" element={<Suspense fallback={LOADING_DARK}><CompareIndex /></Suspense>} />
              <Route path="/tutorials/rc-circuit" element={<Suspense fallback={LOADING_DARK}><RcCircuitTutorial /></Suspense>} />
              <Route path="/tutorials/555-timer" element={<Suspense fallback={LOADING_DARK}><Timer555Tutorial /></Suspense>} />
              <Route path="/tutorials/transistor-amplifier" element={<Suspense fallback={LOADING_DARK}><TransistorTutorial /></Suspense>} />
              <Route path="/tutorials/op-amp" element={<Suspense fallback={LOADING_DARK}><OpAmpTutorial /></Suspense>} />
              <Route path="/tutorials/diode-rectifier" element={<Suspense fallback={LOADING_DARK}><DiodeRectifierTutorial /></Suspense>} />
              <Route path="/tutorials/rlc-circuit" element={<Suspense fallback={LOADING_DARK}><RlcCircuitTutorial /></Suspense>} />

              <Route path="/compare/ltspice" element={<Suspense fallback={LOADING_DARK}><VsLtspice /></Suspense>} />
              <Route path="/compare/multisim" element={<Suspense fallback={LOADING_DARK}><VsMultisim /></Suspense>} />
              <Route path="/compare/falstad" element={<Suspense fallback={LOADING_DARK}><VsFalstad /></Suspense>} />
              <Route path="/compare/circuitlab" element={<Suspense fallback={LOADING_DARK}><VsCircuitlab /></Suspense>} />
              <Route path="/compare/tinkercad" element={<Suspense fallback={LOADING_DARK}><VsTinkercad /></Suspense>} />
              <Route path="/compare/wokwi" element={<Suspense fallback={LOADING_DARK}><VsWokwi /></Suspense>} />

              {/* Programmatic SEO — individual circuit simulator pages */}
              <Route path="/circuits/rc-low-pass-filter" element={<Suspense fallback={LOADING}><RcLowPassFilter /></Suspense>} />
              <Route path="/circuits/inverting-op-amp" element={<Suspense fallback={LOADING}><InvertingOpAmp /></Suspense>} />
              <Route path="/circuits/555-timer-astable" element={<Suspense fallback={LOADING}><Timer555Astable /></Suspense>} />
              <Route path="/circuits/rlc-resonance" element={<Suspense fallback={LOADING}><RlcResonance /></Suspense>} />
              <Route path="/circuits/half-wave-rectifier" element={<Suspense fallback={LOADING}><DiodeHalfWaveRectifier /></Suspense>} />
              <Route path="/circuits/full-wave-rectifier" element={<Suspense fallback={LOADING}><FullWaveRectifier /></Suspense>} />
              <Route path="/circuits/common-emitter-amplifier" element={<Suspense fallback={LOADING}><CommonEmitterAmplifier /></Suspense>} />
              <Route path="/circuits/buck-converter" element={<Suspense fallback={LOADING}><BuckConverter /></Suspense>} />
              <Route path="/circuits/voltage-divider" element={<Suspense fallback={LOADING}><VoltageDividerCircuit /></Suspense>} />
              <Route path="/circuits/zener-diode" element={<Suspense fallback={LOADING}><ZenerDiodeCircuit /></Suspense>} />
              <Route path="/circuits/mosfet-switch" element={<Suspense fallback={LOADING}><MosfetSwitchCircuit /></Suspense>} />

              <Route path="/tools" element={<Suspense fallback={LOADING}><ToolsIndex /></Suspense>} />
              <Route path="/tools/ohms-law" element={<Suspense fallback={LOADING}><OhmsLawCalculator /></Suspense>} />
              <Route path="/tools/voltage-divider" element={<Suspense fallback={LOADING}><VoltageDividerCalculator /></Suspense>} />
              <Route path="/tools/rc-calculator" element={<Suspense fallback={LOADING}><RcCalculator /></Suspense>} />
              <Route path="/tools/555-timer" element={<Suspense fallback={LOADING}><Timer555Calculator /></Suspense>} />
              <Route path="/tools/resistor-color-code" element={<Suspense fallback={LOADING}><ResistorColorCodeCalculator /></Suspense>} />
            </Route>

            {/* Isolated Fullscreen Simulator */}
            <Route
              path="/simulator"
              element={
                <Suspense fallback={
                  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#10b981', fontFamily: 'monospace' }}>
                    <h2>Loading SPICE Engine &amp; Editor...</h2>
                  </div>
                }>
                  <Simulator />
                </Suspense>
              }
            />

            {/* 404 — catch-all must be last */}
            <Route element={<Layout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
