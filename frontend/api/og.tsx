import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const components = url.searchParams.get('c') || '0';
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
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>N</span>
            </div>
            <div>
              <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>NodeSim</div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Free Browser-Based SPICE Simulator</div>
            </div>
          </div>

          {/* Circuit Card */}
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
            {/* Circuit icon grid */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {['⚡', '〜', '∿', '⊕'].map((icon, i) => (
                <div key={i} style={{
                  width: 56, height: 56,
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  border: '1px solid #334155',
                }}>{icon}</div>
              ))}
            </div>

            <div style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>{name}</div>
            <div style={{ color: '#64748b', fontSize: '18px', marginBottom: '24px' }}>{components} components · Open in NodeSim →</div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {['ngspice WASM', 'No Install', '100% Free'].map((tag) => (
                <div key={tag} style={{
                  backgroundColor: '#10b98115',
                  border: '1px solid #10b98140',
                  color: '#10b981',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                >{tag}</div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '24px', color: '#334155', fontSize: '14px' }}>nodesimapp.com</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
