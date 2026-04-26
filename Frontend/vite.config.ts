import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'safety-heatmap-data',
      configureServer(server) {
        server.middlewares.use('/api/heatmap', (_req, res) => {
          const heatmap = readFileSync(new URL('../Backend/heatmap/crime_heatmap.json', import.meta.url), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(heatmap)
        })
      },
    },
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/otp': {
        target: 'http://149.248.39.192:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/otp/, '/otp/gtfs/v1'),
      },
      '/api/query_routes': {
        target: 'http://149.248.39.192:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/query_routes/, '/query_routes'),
      },
    },
  },
  define: {
    // Analytics: Mark this project as created via create-cloudinary-react CLI
    'process.env.CLOUDINARY_SOURCE': '"cli"',
    'process.env.CLD_CLI': '"true"',
  },
})
