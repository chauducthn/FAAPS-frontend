import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig(({ mode }) => {
  const backendUrl = loadEnv(mode, process.cwd(), 'VITE_BACKEND_URL').VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target: backendUrl, changeOrigin: true },
        '/oauth2': { target: backendUrl, changeOrigin: true },
        // Admin notifications arrive over STOMP/WebSocket on the backend's /ws endpoint.
        '/ws': { target: backendUrl, changeOrigin: true, ws: true },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  }
})
