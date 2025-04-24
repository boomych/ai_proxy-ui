import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'https://ai-proxy-service-dvu7.onrender.com:8000',
      '/participants': 'https://ai-proxy-service-dvu7.onrender.com:8000',
      '/messages': 'https://ai-proxy-service-dvu7.onrender.com:8000'
    }
  }
})

