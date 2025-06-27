import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Umgebungsvariablen laden
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        './runtimeConfig': './runtimeConfig.browser',
      },
    },
    define: {
      global: 'window',
    },
    // Umgebungsvariablen für Development-Modus anzeigen
    ...(command === 'serve' && {
      server: {
        host: true,
        port: 5173,
      }
    })
  }
})
