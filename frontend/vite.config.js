import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Forward all /api requests to the Express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})