import { defineConfig, loadEnv, type PluginOption, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// Vite 8's `PluginOption` union is deep enough that TypeScript runs out of
// stack while comparing it, so the plugin list is built once and asserted
// here rather than in the config object.
const plugins = [react(), tailwindcss()] as unknown as PluginOption[]

export default defineConfig(({ mode }): UserConfig => {
  const backendUrl = loadEnv(mode, process.cwd(), 'VITE_BACKEND_URL').VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    plugins,
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
