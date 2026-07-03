import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Syncthing's GUI defaults to HTTPS with a self-signed cert; `secure: false`
      // lets the dev proxy trust it server-side so the browser never sees it directly.
      '/rest': { target: 'https://127.0.0.1:8384', changeOrigin: true, secure: false },
      '/meta.js': { target: 'https://127.0.0.1:8384', changeOrigin: true, secure: false },
    },
  },
})
