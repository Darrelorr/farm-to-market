import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['eulah-testable-needingly.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'https://farm-to-market-server.onrender.com',
        changeOrigin: true
      }
    }
  }
})