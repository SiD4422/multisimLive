import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import CircuitsPage from './pages/CircuitsPage';
import ProcedurePage from './pages/ProcedurePage';
import Simulator from './pages/Simulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing / Landing Pages with Navbar & Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/circuits" element={<CircuitsPage />} />
          <Route path="/procedure" element={<ProcedurePage />} />
        </Route>
        
        {/* Isolated Fullscreen Simulator */}
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
