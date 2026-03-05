import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Gestiondinventairedm/', // Subpath for GitHub Pages
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
    sourcemap: false, // Cambiar a true para debugging en producción si es necesario
    // Usar esbuild (incluido por defecto en Vite) en lugar de terser (no instalado)
    minify: 'esbuild',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          'form-vendor': ['react-hook-form'],
          'i18n-vendor': ['i18next', 'react-i18next'],
        },
        // Nombres de archivo optimizados para caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Aumentar límite de advertencia de tamaño de chunks a 1MB
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales
    cssCodeSplit: true,
    reportCompressedSize: false, // Más rápido en CI/CD
    emptyOutDir: true,
  },
  // Optimizaciones de servidor de desarrollo
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  // Vista previa de producción
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
})