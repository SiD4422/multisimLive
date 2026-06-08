import { useNavigate } from 'react-router-dom';
import { Cpu, Activity, Zap } from 'lucide-react';

export default function CircuitsPage() {
  const navigate = useNavigate();
  
  return (
    <section className="circuits" style={{ paddingTop: '4rem' }}>
      <div className="section-header">
        <h2>Explore Sample Circuits</h2>
        <p>Click a template to load it directly into the simulator. (Mockups)</p>
      </div>
      <div className="circuits-grid">
        <div className="circuit-card" onClick={() => navigate('/simulator')}>
          <div className="circuit-img">
            <Cpu size={48} />
          </div>
          <div className="circuit-info">
            <h3>555 Astable Multivibrator</h3>
            <p>A classic oscillating circuit generating a square wave.</p>
          </div>
        </div>
        <div className="circuit-card" onClick={() => navigate('/simulator')}>
          <div className="circuit-img">
            <Activity size={48} />
          </div>
          <div className="circuit-info">
            <h3>Inverting Amplifier</h3>
            <p>Standard Op-Amp configuration with gain control.</p>
          </div>
        </div>
        <div className="circuit-card" onClick={() => navigate('/simulator')}>
          <div className="circuit-img">
            <Zap size={48} />
          </div>
          <div className="circuit-info">
            <h3>Full-Wave Rectifier</h3>
            <p>Convert AC to DC using a 4-diode bridge configuration.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
