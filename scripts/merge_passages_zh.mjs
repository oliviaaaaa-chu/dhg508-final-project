// Merges cached Chinese translations (data/generated/passages-zh.json) into
// src/data/texts.json as a separate `zh` field on each passage. The English
// original text is never modified. Run after translate_passages.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const CACHE = `${root}/data/generated/passages-zh.json`
if (!existsSync(CACHE)) {
  console.error('no translation cache found — run translate_passages.mjs first')
  process.exit(1)
}

const cache = JSON.parse(readFileSync(CACHE, 'utf8'))
const texts = JSON.parse(readFileSync(`${root}/src/data/texts.json`, 'utf8'))

let merged = 0
let missing = 0
for (const t of texts) {
  for (const p of t.passages || []) {
    const key = `${t.id}:${p.id}`
    const zh = cache[key]
    if (zh && zh.trim()) {
      p.zh = zh
      merged++
    } else if (!p.zh) {
      missing++
    }
  }
}

writeFileSync(`${root}/src/data/texts.json`, JSON.stringify(texts, null, 2))
console.log(`merged: ${merged}, still missing: ${missing} (of cache entries: ${Object.keys(cache).length})`)
