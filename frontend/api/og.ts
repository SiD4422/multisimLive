import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const componentCount = url.searchParams.get('c') || '0';
    const name = url.searchParams.get('name') || 'Shared Circuit';
    const icons = ['\u26a1', '\u301c', '\u223f', '\u2295', '\u25b7'];
    const tags = ['ngspice WASM', 'No Install', 'AI Tutor', '100% Free'];

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0d1117',
            padding: '48px',
            fontFamily: 'sans-serif',
          },
          children: [
            // Header
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { width: 52, height: 52, backgroundColor: '#10b981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
                      children: { type: 'span', props: { style: { color: 'white', fontSize: '30px', fontWeight: 'bold' }, children: 'N' } },
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column' },
                      children: [
                        { type: 'span', props: { style: { color: '#10b981', fontSize: '26px', fontWeight: 'bold' }, children: 'NodeSim' } },
                        { type: 'span', props: { style: { color: '#64748b', fontSize: '14px' }, children: 'Free Browser-Based SPICE Simulator' } },
                      ],
                    },
                  },
                ],
              },
            },
            // Main card
            {
              type: 'div',
              props: {
                style: { flex: 1, border: '1px solid #1e293b', borderRadius: '16px', backgroundColor: '#0f172a', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
                children: [
                  // Icon row
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: '14px', marginBottom: '28px' },
                      children: icons.map((icon, i) => ({
                        type: 'div',
                        key: String(i),
                        props: {
                          style: { width: 54, height: 54, backgroundColor: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', border: '1px solid #334155' },
                          children: icon,
                        },
                      })),
                    },
                  },
                  // Circuit name
                  { type: 'div', props: { style: { color: '#f1f5f9', fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }, children: name } },
                  // Subtitle
                  {
                    type: 'div',
                    props: {
                      style: { color: '#64748b', fontSize: '18px', marginBottom: '28px' },
                      children: (componentCount !== '0' ? `${componentCount} components` : 'Circuit Simulator') + ' \u00b7 Open in NodeSim \u2192',
                    },
                  },
                  // Feature tags
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: '12px' },
                      children: tags.map((tag) => ({
                        type: 'div',
                        key: tag,
                        props: {
                          style: { backgroundColor: '#10b98115', border: '1px solid #10b98140', color: '#10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
                          children: tag,
                        },
                      })),
                    },
                  },
                ],
              },
            },
            // Footer
            { type: 'div', props: { style: { marginTop: '20px', color: '#334155', fontSize: '14px' }, children: 'nodesimapp.com' } },
          ],
        },
      } as any,
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    return new Response('Failed: ' + e.message, { status: 500 });
  }
}
