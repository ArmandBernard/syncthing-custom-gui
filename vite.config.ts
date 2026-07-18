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
  // Syncthing issues its CSRF-Token cookie while serving GUI pages, which in
  // production is this app's own index.html served directly by Syncthing. In
  // dev, Vite serves index.html itself and never proxies "/" to Syncthing, so
  // nothing sets that cookie — this dedicated path lets ensureCsrfCookie()
  // fetch it explicitly. Rewritten to Syncthing's real /index.html: unlike
  // arbitrary paths (which 403 without setting the cookie, likely an
  // origin/host check on unrecognized routes), known static GUI paths like
  // /index.html and /assets/* set it even when unauthenticated.
  '/__syncthing_csrf_bootstrap': {
    target: 'https://127.0.0.1:8384',
    changeOrigin: true,
    secure: false,
    rewrite: () => '/index.html',
  },
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
