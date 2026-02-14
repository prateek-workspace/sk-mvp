import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer (run build to see stats)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    // Enable minification
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Split UI libraries (adjust based on what you use)
          // 'ui-vendor': ['@headlessui/react', 'framer-motion'],
          
          // Split other heavy dependencies
          // 'utils': ['date-fns', 'lodash-es'],
        },
        
        // Better file naming for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit if needed
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging (disable if not needed)
    sourcemap: false,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  
  server: {
    // Enable HMR
    hmr: true,
    
    // Speed up dev server
    watch: {
      usePolling: false,
    },
  },
})