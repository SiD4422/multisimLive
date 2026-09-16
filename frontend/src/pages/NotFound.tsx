import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — NodeSim</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <section className="page_404">
        <div className="container" style={{ width: '100%' }}>
          <div className="row">
            <div className="col-sm-12">
              <div className="col-sm-10 col-sm-offset-1 text-center" style={{ margin: '0 auto', maxWidth: '800px' }}>
                <div className="four_zero_four_bg">
                  <h1 className="text-center">404</h1>
                </div>

                <div className="contant_box_404">
                  <h3 className="h2">Looks like you're lost</h3>
                  <p>The page you are looking for is not available!</p>
                  
                  <div>
                    <Link to="/simulator" className="link_404">Open Simulator</Link>
                    <Link to="/" className="link_404" style={{ background: '#e2e8f0', color: '#0f172a' }}>Go to Home</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
