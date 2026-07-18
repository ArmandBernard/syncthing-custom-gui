import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
// Syncthing's GUI defaults to HTTPS with a self-signed cert; `secure: false`
// lets the proxy trust it server-side so the browser never sees it directly.
const proxy = {
  '/rest': { target: 'https://127.0.0.1:8384', changeOrigin: true, secure: false },
  '/meta.js': { target: 'https://127.0.0.1:8384', changeOrigin: true, secure: false },
  '/qr': { target: 'https://127.0.0.1:8384', changeOrigin: true, secure: false },
}

// Keep in sync with the "paths" entries in tsconfig.app.json.
const alias = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [
    preact(),
    tailwindcss(),
    ...(mode === 'analyze' ? [analyzer({ analyzerPort: 8877 })] : []),
  ],
  resolve: {
    alias: {
      '@components': alias('./src/components'),
      '@hooks': alias('./src/hooks'),
      '@lib': alias('./src/lib'),
      '@context': alias('./src/context'),
      '@styles': alias('./src/styles'),
    },
  },
  server: { proxy },
  preview: { proxy },
}))
