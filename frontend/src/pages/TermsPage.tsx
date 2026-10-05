import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.7 }}>
      <Helmet>
        <title>Terms of Service | NodeSim</title>
        <meta name="description" content="NodeSim terms of service." />
      </Helmet>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Terms of Service</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Effective: October 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>1. Acceptance</h2>
        <p>By using NodeSim (nodesimapp.com), you agree to these terms. If you do not agree, do not use the service.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>2. Description of Service</h2>
        <p>NodeSim is a free browser-based circuit simulation platform for educational and personal use. The core simulator is free. AI-powered features may have monthly usage limits on the free plan.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>3. Acceptable Use</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Do not use NodeSim for illegal purposes.</li>
          <li>Do not abuse or scrape AI API endpoints.</li>
          <li>Do not publish harmful or offensive content to the Community Gallery.</li>
          <li>Do not attempt to automate requests to circumvent rate limits.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>4. AI-Generated Content</h2>
        <p>The AI Lab Report Generator uses Google Gemini to produce educational content. NodeSim does not guarantee accuracy of AI output. Users are responsible for verifying content before academic submission. NodeSim is not liable for academic consequences resulting from AI-generated reports.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>5. Intellectual Property</h2>
        <p>Circuits you create are your own. By publishing to the Community Gallery, you grant NodeSim a non-exclusive license to display your circuit to other users. NodeSim source code is on GitHub under the MIT License.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>6. Disclaimer</h2>
        <p>NodeSim is provided "as is" without warranties. Simulation results are for educational use only and should not be used for safety-critical engineering without independent verification.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>7. Contact</h2>
        <p><a href="mailto:nodesimapp@gmail.com" style={{ color: '#16a34a' }}>nodesimapp@gmail.com</a></p>
      </section>
    </div>
  );
}
