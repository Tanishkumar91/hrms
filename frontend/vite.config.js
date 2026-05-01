import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL
    ? env.VITE_API_URL.replace('/api', '')  // strip /api → get base origin
    : 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // In dev: all /api calls are forwarded to the backend
        // Change VITE_API_URL in .env to switch targets
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
