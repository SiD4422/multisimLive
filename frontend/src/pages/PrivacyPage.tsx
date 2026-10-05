import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.7 }}>
      <Helmet>
        <title>Privacy Policy | NodeSim</title>
        <meta name="description" content="NodeSim privacy policy — how we handle your data." />
      </Helmet>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Privacy Policy</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Effective: October 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>1. What We Collect</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Anonymous analytics:</strong> Vercel Analytics records page views, browser type, and general region. No personally identifiable information is collected.</li>
          <li><strong>Community Circuits:</strong> If you publish a circuit to the Community Gallery, the circuit data and any author name you enter are stored in Firebase. This is optional and user-initiated.</li>
          <li><strong>Local Storage:</strong> Your circuits are saved in your browser's localStorage. This data does not leave your device unless you explicitly publish or use AI features.</li>
          <li><strong>AI Lab Report:</strong> When generating a lab report, your circuit component types and experiment title are sent to Google Gemini. This data is not stored by NodeSim beyond the request.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>2. What We Don't Collect</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>We do not require account creation or login.</li>
          <li>We do not collect names, emails, or contact info unless voluntarily provided.</li>
          <li>We do not sell data to third parties.</li>
          <li>We do not use your data for advertising.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>3. Third-Party Services</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Vercel</strong> — Hosting and analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>Vercel Privacy Policy</a></li>
          <li><strong>Google Firebase/Firestore</strong> — Community circuit storage. <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>Firebase Privacy</a></li>
          <li><strong>Google Gemini API</strong> — AI Lab Report generation. <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>Google AI Terms</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>4. Contact</h2>
        <p>Questions? Email us at <a href="mailto:nodesimapp@gmail.com" style={{ color: '#16a34a' }}>nodesimapp@gmail.com</a></p>
      </section>
    </div>
  );
}
