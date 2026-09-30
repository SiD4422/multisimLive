import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';


const COMPARISONS = [
  { path: '/compare/ltspice', title: 'NodeSim vs LTspice', desc: 'Browser-based vs desktop. No install, cross-platform, free — vs the industry standard for SPICE simulation.', badge: 'Most Searched' },
  { path: '/compare/multisim', title: 'NodeSim vs Multisim', desc: 'Multisim Live shut down in September 2026. NodeSim is the free, open-source web replacement.', badge: '🔥 Trending' },
  { path: '/compare/falstad', title: 'NodeSim vs Falstad', desc: 'SPICE-accurate ngspice simulation vs Falstad visual simulation. Which is right for you?', badge: '' },
];

export default function CompareIndex() {
  return (
    <>
      <Helmet>
        <title>NodeSim vs Other Circuit Simulators | Honest Comparison</title>
        <meta name="description" content="How does NodeSim compare to LTspice, Multisim, and Falstad? Honest, detailed feature-by-feature comparisons of the best free circuit simulators available in 2026." />
        <meta name="keywords" content="NodeSim vs LTspice, Multisim alternative free, Falstad alternative, best online circuit simulator, free SPICE simulator comparison" />
      </Helmet>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>NodeSim vs Other Simulators</h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 600 }}>
            Honest, detailed comparisons. We tell you when other tools are better suited — and when NodeSim is the right choice for your workflow.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
          {COMPARISONS.map(c => (
            <Link
              key={c.path}
              to={c.path}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '22px 24px', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{c.title}</span>
                  {c.badge && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.badge}</span>}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '28px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#15803d', marginBottom: 8 }}>Try NodeSim for yourself</div>
          <Link to="/simulator" style={{ background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>Open Free Simulator →</Link>
        </div>
      </div>
    </>
  );
}
