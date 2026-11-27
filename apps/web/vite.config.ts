import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { translate } from 'google-translate-api-x'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/** No dev: tradução no Node (mesma lib do Chrome), sem CORS no navegador. */
function mountIntegralTranslateMiddleware(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares: any,
): void {
  middlewares.use('/api/integral-translate', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end('Method not allowed')
          return
        }
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
        const rawBody = Buffer.concat(chunks).toString()
        const params = new URLSearchParams(rawBody)
        const q = params.get('q')?.trim() ?? ''
        const sl = params.get('sl')?.trim() || 'auto'

        const sendJson = (status: number, payload: object) => {
          res.writeHead(status, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify(payload))
        }

        if (!q) {
          sendJson(400, { error: 'texto vazio' })
          return
        }

        try {
          const from = sl === 'pt' ? 'auto' : sl
          const out = await translate(q, {
            to: 'pt',
            from,
            forceBatch: q.length > 900,
            fallbackBatch: true,
          })
          sendJson(200, { sentences: [{ trans: out.text }] })
        } catch {
          sendJson(502, { error: 'traducao-falhou' })
        }
      })
}

function integralTranslateDevProxy(): Plugin {
  return {
    name: 'integral-translate-dev-proxy',
    configureServer(server) {
      mountIntegralTranslateMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      mountIntegralTranslateMiddleware(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    integralTranslateDevProxy(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tcc-sistema/integral-import': path.resolve(
        __dirname,
        '../../packages/integral-import/src/index.ts',
      ),
      '@tcc-sistema/obra-export': path.resolve(__dirname, '../../packages/obra-export/src/index.ts'),
    },
    // Monorepo (web + mobile): evita duas cópias do React no dev server.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query', '@tanstack/react-router'],
  },
  server: {
    port: 5173,
  },
})
