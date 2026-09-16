import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — NodeSim</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '24px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', color: '#0FA968', textTransform: 'uppercase', margin: 0 }}>
          404
        </p>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '12px 0 0' }}>
          This page doesn't exist
        </h1>

        <p style={{ marginTop: '16px', opacity: 0.65, lineHeight: 1.6 }}>
          The link may be broken or the page may have moved. Your saved circuit is
          untouched — open the simulator to pick up where you left off.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/simulator"
            style={{
              background: '#0FA968',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '15px',
            }}
          >
            Open Simulator
          </Link>
          <Link
            to="/"
            style={{
              border: '1px solid rgba(0,0,0,0.2)',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '15px',
              color: 'inherit',
            }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
