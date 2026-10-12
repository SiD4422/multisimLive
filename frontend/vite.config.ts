import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import geminiHandler from './api/gemini'

function geminiDevPlugin(): Plugin {
  return {
    name: 'gemini-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/gemini')) {
          return next();
        }

        try {
          const origin = req.headers.origin || `http://${req.headers.host || 'localhost:5173'}`;
          const url = new URL(req.url, origin);

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

          const webHeaders = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) {
              if (Array.isArray(v)) {
                v.forEach(val => webHeaders.append(k, val));
              } else {
                webHeaders.set(k, v);
              }
            }
          }

          const webReq = new Request(url.toString(), {
            method: req.method,
            headers: webHeaders,
            body: req.method !== 'GET' && req.method !== 'HEAD' && body && body.length > 0 ? body : undefined,
          });

          const webRes = await geminiHandler(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          if (webRes.body) {
            const reader = webRes.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
          }
          res.end();
        } catch (err) {
          console.error('[gemini-dev-proxy] Error executing handler:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error in dev proxy' }));
          }
        }
      });
    },
  };
}

/** Returns the npm package name for a module path inside node_modules, e.g. "react-konva". */
function packageName(id: string): string | null {
  const m = id.match(/node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)[\\/]/)
  return m ? m[1].replace('\\', '/') : null
}

const REACT_CORE = new Set(['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'])
const KONVA = new Set(['konva', 'react-konva', 'its-fine', 'react-reconciler'])

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiDevPlugin()],
  build: {
    rollupOptions: {
      output: {
        // Match on the exact package name. The old `id.includes('react')` check also caught
        // lucide-react and react-konva, so the dedicated lucide/konva chunks were never emitted.
        manualChunks(id) {
          const pkg = packageName(id)
          if (!pkg) return undefined
          if (KONVA.has(pkg)) return 'vendor-konva'
          if (pkg === 'lucide-react') return 'vendor-lucide'
          if (pkg === 'uplot') return 'vendor-uplot'
          if (REACT_CORE.has(pkg)) return 'vendor-react'
          return 'vendor-misc'
        },
      },
    },
  },
})
