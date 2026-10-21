
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawTarget = env.VITE_API_URL || process.env.VITE_API_URL
  const apiTarget = (rawTarget ? rawTarget.trim() : 'http://localhost:3000').replace(/\/$/, '')

  return {
    css: {
      devSourcemap: true
    },
    server: {
      port: 5057,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: 5057
    },
    optimizeDeps: {
      include: [
        'i18next',
        'i18next-browser-languagedetector',
        'react-i18next'
      ]
    },
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      devtoolsJson()
    ]
  }
})
