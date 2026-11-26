import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './pages/Layout';
import FeedbackWidget from './components/FeedbackWidget';

import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';

import NotFound from './pages/NotFound';
import { renderMarketingRoutes } from './routes/marketingRoutes';

// Lazy load heavy simulator component to optimize initial marketing landing page load
// and keep SSR prerender isolated from Konva / ngspice-wasm
const Simulator = lazy(() => import('./pages/Simulator'));

/** Renders the feedback widget only outside the simulator to avoid overlapping the status bar. */
function ConditionalFeedback() {
  const { pathname } = useLocation();
  if (pathname === '/simulator') return null;
  return <FeedbackWidget />;
}

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <ConditionalFeedback />
          <Analytics />
          <Routes>
            {renderMarketingRoutes()}

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
