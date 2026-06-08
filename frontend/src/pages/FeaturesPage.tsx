import { Zap, Layers, Share2, Activity, Download, Globe, FileCode, CheckCircle2 } from 'lucide-react';
import simulatorGraphImg from '../assets/user_graph.png';
import simulatorCanvasImg from '../assets/user_canvas.png';

export default function FeaturesPage() {
  return (
    <div className="features-page" style={{ paddingTop: '2rem', paddingBottom: '6rem', backgroundColor: '#f9fafb' }}>
      
      {/* HEADER */}
      <section className="section-header" style={{ marginBottom: '3rem', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#111827', marginBottom: '1rem', fontWeight: 700 }}>
          Advanced Features & Capabilities
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          MultiSym live is a premium, free online circuit simulator. Discover how our web-based SPICE engine outpaces the competition in speed, usability, and design.
        </p>
      </section>

      {/* COMPETITIVE ADVANTAGE */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 2rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '3rem', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.05)' }}>
          <h2 style={{ color: '#15803d', fontSize: '2rem', marginBottom: '1.5rem' }}>How We Stand Out</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#111827', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 color="#16a34a" size={20} /> Zero Installation
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.6 }}>Unlike traditional desktop software that requires massive downloads and licenses, MultiSym live runs 100% in your browser. Perfect for Chromebooks, Mac, and Windows.</p>
            </div>
            <div>
              <h3 style={{ color: '#111827', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 color="#16a34a" size={20} /> Modern Intuitive UI
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.6 }}>Say goodbye to clunky, outdated interfaces from the 90s. We offer a sleek, dark/light mode adaptable schematic capture tool designed for the modern engineer.</p>
            </div>
            <div>
              <h3 style={{ color: '#111827', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 color="#16a34a" size={20} /> Uncompromised Accuracy
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.6 }}>Our electronic circuit analysis relies on industry-standard SPICE mathematical models, ensuring your lab results match your online simulation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SHOWCASE IMAGES */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
          
          <div className="image-showcase" style={{ 
              borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              border: '1px solid #e5e7eb'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(22, 163, 74, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ padding: '1rem', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem' }}>Modern Schematic Editor</h3>
            </div>
            <img src={simulatorGraphImg} alt="Simulator Canvas Mockup" style={{ width: '100%', display: 'block', objectFit: 'cover', height: '300px' }} />
          </div>

          <div className="image-showcase" style={{ 
              borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              border: '1px solid #e5e7eb'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ padding: '1rem', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem' }}>Real-Time Oscilloscope</h3>
            </div>
            <img src={simulatorCanvasImg} alt="Simulator Graph Mockup" style={{ width: '100%', display: 'block', objectFit: 'cover', height: '300px' }} />
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="features-grid" style={{ padding: '0 2rem' }}>
        
        {/* Feature 1 */}
        <div className="feature-card">
          <div className="feature-icon"><Zap size={24} /></div>
          <h3>WebAssembly SPICE Engine</h3>
          <p>Experience real-time electronic circuit simulation. Our engine compiles industry-standard NGSPICE into WebAssembly, delivering lightning-fast Transient, AC, and DC analysis directly in your browser without any server latency.</p>
        </div>

        {/* Feature 2 */}
        <div className="feature-card">
          <div className="feature-icon"><Layers size={24} /></div>
          <h3>Massive Component Library</h3>
          <p>Design complex schematics with over 60+ fully functional components. Our library includes passive elements, NPN/PNP transistors, MOSFETs, Op-Amps (like the LM741), 555 Timers, logic gates, and custom transformers.</p>
        </div>

        {/* Feature 3 */}
        <div className="feature-card">
          <div className="feature-icon"><Activity size={24} /></div>
          <h3>Interactive Grapher & Oscilloscope</h3>
          <p>Visualize voltage and current with our built-in split-screen graphing tool. Drop interactive probes onto wires to instantly plot waveforms, zoom into microsecond details, and analyze frequency responses.</p>
        </div>

        {/* Feature 4 */}
        <div className="feature-card">
          <div className="feature-icon"><Download size={24} /></div>
          <h3>Export Graphs & Netlists</h3>
          <p>Need data for a university lab report? Export your waveform data directly to CSV format. You can also view and export the raw SPICE Netlist to integrate with external desktop tools seamlessly.</p>
        </div>

        {/* Feature 5 */}
        <div className="feature-card">
          <div className="feature-icon"><Share2 size={24} /></div>
          <h3>Cloud Save & Share Links</h3>
          <p>Collaboration made easy. Click "Share" to generate a unique URL containing your fully compressed schematic. Send it to peers, students, or professors so they can instantly view and simulate your design.</p>
        </div>

        {/* Feature 6 */}
        <div className="feature-card">
          <div className="feature-icon"><FileCode size={24} /></div>
          <h3>Local JSON Backups</h3>
          <p>Maintain total ownership of your work. Save your circuit designs as lightweight JSON files directly to your local hard drive, and load them back into the simulator anytime, even offline.</p>
        </div>

      </section>

      {/* SEO KEYWORDS (Hidden from UI but present in DOM for crawlers if needed, though best integrated into text. Integrated heavily above.) */}
    </div>
  );
}
