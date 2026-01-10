import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    
    // Copy web.config and .htaccess to dist folder after build
    {
      name: 'copy-config-files',
      closeBundle() {
        try {
          // Copy web.config for IIS
          copyFileSync(
            join(__dirname, 'public', 'web.config'),
            join(__dirname, 'dist', 'web.config')
          )
          console.log('✓ web.config copied to dist')
        } catch (err) {
          console.warn('Could not copy web.config:', err.message)
        }
        try {
          // Copy .htaccess for Apache
          copyFileSync(
            join(__dirname, '.htaccess'),
            join(__dirname, 'dist', '.htaccess')
          )
          console.log('✓ .htaccess copied to dist')
        } catch (err) {
          console.warn('Could not copy .htaccess:', err.message)
        }
      },
    },
  ],
  server: {
    port: 3005,
    strictPort: true // fails if port already in use
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    copyPublicDir: true,
  },
  base: '/',
  publicDir: 'public',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
