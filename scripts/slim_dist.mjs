// Cloudflare Pages rejects any file over 25 MiB. Oversized assets (currently
// the ORT wasm, which the app now loads from jsDelivr at runtime) are removed
// from dist/ before deployment so `wrangler pages deploy` can succeed.
import { readdirSync, statSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../dist', import.meta.url))
const LIMIT = 24 * 1024 * 1024

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (statSync(p).size > LIMIT) {
      const mb = (statSync(p).size / 1e6).toFixed(1)
      rmSync(p)
      console.log(`slim_dist: removed ${p.replace(/.*dist/, 'dist')} (${mb} MB)`)
    }
  }
}

walk(DIST)
