import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// GitHub Pages base path configuration
// If deploying to GitHub Pages with repo name, set base to '/repo-name/'
// For root domain, use '/'
// Can be overridden via VITE_BASE_PATH environment variable
const getBasePath = () => {
  // Check environment variable first
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }
  // Default to root for GitHub Pages (works for both root domain and /repo-name/)
  // If deploying to a subdirectory, update this or set VITE_BASE_PATH
  return '/'
}

// https://vitejs.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (accessible via IP address)
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Build configuration for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper paths for assets
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})

