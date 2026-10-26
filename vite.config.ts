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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
            if (id.includes('@tanstack')) return 'query-vendor'
            if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor'
            if (id.includes('axios')) return 'http-vendor'
            return 'vendor'
          },
        },
      },
    },
  }
})
