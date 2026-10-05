import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import CircuitsPage from './pages/CircuitsPage';
import ProcedurePage from './pages/ProcedurePage';
import ResourcesPage from './pages/ResourcesPage';
import FeedbackWidget from './components/FeedbackWidget';

import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';

import CircuitTemplatePage from './pages/CircuitTemplatePage';

// Lazy load the Simulator to prevent bundling 7MB WASM & Canvas on marketing pages
const Simulator = lazy(() => import('./pages/Simulator'));

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

// Programmatic SEO — circuit pages
const RcLowPassFilter = lazy(() => import('./pages/circuits/RcLowPassFilter'));
const InvertingOpAmp = lazy(() => import('./pages/circuits/InvertingOpAmp'));
const Timer555Astable = lazy(() => import('./pages/circuits/Timer555Astable'));
const RlcResonance = lazy(() => import('./pages/circuits/RlcResonance'));
const DiodeHalfWaveRectifier = lazy(() => import('./pages/circuits/DiodeHalfWaveRectifier'));
const FullWaveRectifier = lazy(() => import('./pages/circuits/FullWaveRectifier'));
const CommonEmitterAmplifier = lazy(() => import('./pages/circuits/CommonEmitterAmplifier'));
const BuckConverter = lazy(() => import('./pages/circuits/BuckConverter'));

import NotFound from './pages/NotFound';

const OhmsLawCalculator = lazy(() => import('./pages/tools/OhmsLawCalculator'));
const VoltageDividerCalculator = lazy(() => import('./pages/tools/VoltageDividerCalculator'));
const RcCalculator = lazy(() => import('./pages/tools/RcCalculator'));
const Timer555Calculator = lazy(() => import('./pages/tools/Timer555Calculator'));
const ResistorColorCodeCalculator = lazy(() => import('./pages/tools/ResistorColorCodeCalculator'));
const ToolsIndex = lazy(() => import('./pages/tools/ToolsIndex'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
      <FeedbackWidget />
      <Analytics />
      <Routes>
        {/* Standalone Landing Page with its own header */}
        <Route path="/" element={<LandingPage />} />

        {/* Marketing Pages with shared Navbar & Footer */}
        <Route element={<Layout />}>
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/circuits" element={<CircuitsPage />} />
          <Route path="/circuits/:id" element={<CircuitTemplatePage />} />
          <Route path="/procedure" element={<ProcedurePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/privacy" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><PrivacyPage /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><TermsPage /></Suspense>} />

          {/* SEO Pages */}
          <Route path="/tutorials" element={<Suspense fallback={<div style={{padding:'2rem',color:'#fff'}}>Loading...</div>}><TutorialsIndex /></Suspense>} />
            <Route path="/compare" element={<Suspense fallback={<div style={{padding:'2rem',color:'#fff'}}>Loading...</div>}><CompareIndex /></Suspense>} />
            <Route path="/tutorials/rc-circuit" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><RcCircuitTutorial /></Suspense>} />
          <Route path="/tutorials/555-timer" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#1e293b' }}>Loading...</div>}><Timer555Tutorial /></Suspense>} />
          <Route path="/tutorials/transistor-amplifier" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><TransistorTutorial /></Suspense>} />
          <Route path="/tutorials/op-amp" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><OpAmpTutorial /></Suspense>} />
          <Route path="/tutorials/diode-rectifier" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><DiodeRectifierTutorial /></Suspense>} />
          <Route path="/tutorials/rlc-circuit" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><RlcCircuitTutorial /></Suspense>} />
          
          <Route path="/compare/ltspice" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><VsLtspice /></Suspense>} />
          <Route path="/compare/multisim" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><VsMultisim /></Suspense>} />
          <Route path="/compare/falstad" element={<Suspense fallback={<div style={{ padding: '2rem', color: '#10b981' }}>Loading...</div>}><VsFalstad /></Suspense>} />

          {/* Programmatic SEO — individual circuit simulator pages */}
          <Route path="/circuits/rc-low-pass-filter" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><RcLowPassFilter /></Suspense>} />
          <Route path="/circuits/inverting-op-amp" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><InvertingOpAmp /></Suspense>} />
          <Route path="/circuits/555-timer-astable" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><Timer555Astable /></Suspense>} />
          <Route path="/circuits/rlc-resonance" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><RlcResonance /></Suspense>} />
          <Route path="/circuits/half-wave-rectifier" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><DiodeHalfWaveRectifier /></Suspense>} />
          <Route path="/circuits/full-wave-rectifier" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><FullWaveRectifier /></Suspense>} />
          <Route path="/circuits/common-emitter-amplifier" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><CommonEmitterAmplifier /></Suspense>} />
          <Route path="/circuits/buck-converter" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><BuckConverter /></Suspense>} />
          
          <Route path="/tools" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><ToolsIndex /></Suspense>} />
          <Route path="/tools/ohms-law" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><OhmsLawCalculator /></Suspense>} />
          <Route path="/tools/voltage-divider" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><VoltageDividerCalculator /></Suspense>} />
          <Route path="/tools/rc-calculator" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><RcCalculator /></Suspense>} />
          <Route path="/tools/555-timer" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><Timer555Calculator /></Suspense>} />
          <Route path="/tools/resistor-color-code" element={<Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}><ResistorColorCodeCalculator /></Suspense>} />
        </Route>
        
        {/* Isolated Fullscreen Simulator */}
        <Route 
          path="/simulator" 
          element={
            <Suspense fallback={
              <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#10b981', fontFamily: 'monospace' }}>
                <h2>Loading SPICE Engine & Editor...</h2>
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
  );
}

export default App;
