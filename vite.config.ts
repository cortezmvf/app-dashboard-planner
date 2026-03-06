import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: () => '/v1beta/openai/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.GEMINI_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
