import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/analytics'],
          'openai-vendor': ['openai'],
          'ui-components': ['lucide-react'],
          'utils': ['./src/lib/currency.ts', './src/lib/store.ts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
