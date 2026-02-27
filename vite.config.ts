import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Usa rutas relativas para GitHub Pages
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimización para producción
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Usar esbuild (incluido por defecto en Vite) en lugar de terser (no instalado)
    minify: 'esbuild',
    copyPublicDir: true,
    // Aumentar límite de advertencia de tamaño de chunks a 1MB
    chunkSizeWarningLimit: 1000,
  },
})