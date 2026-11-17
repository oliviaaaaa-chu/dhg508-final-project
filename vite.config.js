import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

let envCache = {}

// Dev-only proxy: the browser calls /api/chat, this middleware forwards to
// DeepSeek with the key kept server-side (.env.local). The key never reaches
// the client bundle. In production, deploy this behind a serverless function.
function deepseekProxy() {
  return {
    name: 'deepseek-proxy',
    config(_config, { mode }) {
      envCache = loadEnv(mode, process.cwd(), '')
    },
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        readBody(req)
          .then((body) => {
            const key = envCache.DEEPSEEK_API_KEY
            if (!key) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ error: 'no-key' }))
            }
            return fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
              },
              body: JSON.stringify({
                model: body.model || 'deepseek-chat',
                messages: body.messages,
                temperature: body.temperature ?? 0.8,
                top_p: body.top_p ?? 0.95,
                max_tokens: 700,
                stream: false,
                ...(body.presence_penalty != null ? { presence_penalty: body.presence_penalty } : {}),
                ...(body.frequency_penalty != null ? { frequency_penalty: body.frequency_penalty } : {}),
              }),
            })
              .then(async (r) => {
                if (!r.ok) {
                  res.statusCode = 502
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ error: 'upstream', detail: (await r.text()).slice(0, 300) }))
                }
                const data = await r.json()
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ text: data.choices?.[0]?.message?.content || '' }))
              })
          })
          .catch((e) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'proxy-fail', detail: String(e).slice(0, 300) }))
          })
      })
    },
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deepseekProxy()],
  build: { target: 'es2022' },
  optimizeDeps: { esbuildOptions: { target: 'es2022' } },
})
