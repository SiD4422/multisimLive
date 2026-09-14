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

import CircuitTemplatePage from './pages/CircuitTemplatePage';

// Lazy load the Simulator to prevent bundling 7MB WASM & Canvas on marketing pages
const Simulator = lazy(() => import('./pages/Simulator'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
      <FeedbackWidget />
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
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
