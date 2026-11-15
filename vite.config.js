import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The Bagisto backend (backend/docker-compose.yml). Product photos are served from its /storage.
const BACKEND = process.env.ZUNO_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fabric is only imported by the lazily loaded design page. Bundling it up front stops the dev server
  // from re-bundling mid-session, which left /design blank ("Failed to fetch dynamically imported module").
  optimizeDeps: {
    include: ['fabric'],
  },
  server: {
    proxy: {
      '/api/zuno': BACKEND,
      '/storage': BACKEND,
    },
  },
})
