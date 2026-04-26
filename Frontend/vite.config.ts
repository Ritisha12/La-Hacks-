import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/otp': {
        target: 'http://149.248.39.192:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/otp/, '/otp/gtfs/v1'),
      },
    },
  },
  define: {
    // Analytics: Mark this project as created via create-cloudinary-react CLI
    'process.env.CLOUDINARY_SOURCE': '"cli"',
    'process.env.CLD_CLI': '"true"',
  },
})
