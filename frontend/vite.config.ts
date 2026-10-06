import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Returns the npm package name for a module path inside node_modules, e.g. "react-konva". */
function packageName(id: string): string | null {
  const m = id.match(/node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)[\\/]/)
  return m ? m[1].replace('\\', '/') : null
}

const REACT_CORE = new Set(['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'])
const KONVA = new Set(['konva', 'react-konva', 'its-fine', 'react-reconciler'])

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
