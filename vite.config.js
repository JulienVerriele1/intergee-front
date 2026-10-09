import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Same origin for the browser: no CORS needed, and the backend keeps its routes without /api
  const apiProxy = {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  }

  return {
    // basicSsl serves dev and preview over HTTPS with a self-signed certificate
    plugins: [vue(), tailwindcss(), basicSsl()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, proxy: apiProxy },
    preview: { port: 4173, proxy: apiProxy },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.spec.js'],
    },
  }
})
