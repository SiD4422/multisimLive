/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const componentCount = url.searchParams.get('c') || '0';
    const name = url.searchParams.get('name') || 'Shared Circuit';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0d1117',
            padding: '48px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              width: 52, height: 52,
              backgroundColor: '#10b981',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '30px', fontWeight: 'bold' }}>N</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#10b981', fontSize: '26px', fontWeight: 'bold' }}>NodeSim</span>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Free Browser-Based SPICE Simulator</span>
            </div>
          </div>

          {/* Main card */}
          <div style={{
            flex: 1,
            border: '1px solid #1e293b',
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {/* Icon row */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '28px' }}>
              {['\u26a1', '\u301c', '\u223f', '\u2295', '\u25b7'].map((icon, i) => (
                <div key={i} style={{
                  width: 54, height: 54,
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  border: '1px solid #334155',
                }}>{icon}</div>
              ))}
            </div>

            <div style={{ color: '#f1f5f9', fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>{name}</div>
            <div style={{ color: '#64748b', fontSize: '18px', marginBottom: '28px' }}>
              {componentCount !== '0' ? `${componentCount} components` : 'Circuit Simulator'} · Open in NodeSim →
            </div>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {['ngspice WASM', 'No Install', 'AI Tutor', '100% Free'].map((tag) => (
                <div key={tag} style={{
                  backgroundColor: '#10b98115',
                  border: '1px solid #10b98140',
                  color: '#10b981',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>{tag}</div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '20px', color: '#334155', fontSize: '14px' }}>nodesimapp.com</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
