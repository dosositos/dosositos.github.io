import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// `base` depende de dónde viva el repo en GitHub Pages:
//   - repo llamado  dosositos.github.io  ->  base '/'          (URL: dosositos.github.io)
//   - repo llamado  dosositos            ->  base '/dosositos/' (URL: usuario.github.io/dosositos)
// Se controla con la variable de entorno BASE_URL_PAGES en el workflow.
const base = process.env.BASE_URL_PAGES ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Las fotos ya vienen optimizadas desde scripts/optimizar-fotos.mjs
    assetsInlineLimit: 2048,
  },
})
