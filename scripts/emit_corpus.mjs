// Copies the built corpus JSON into public/ so it is served as a static
// asset and fetched lazily by the app. The corpus with Chinese translations
// exceeds Cloudflare Pages' 25 MiB per-file limit, so it is written as
// numbered parts (corpus-0.json, corpus-1.json, …) plus a small
// corpus-index.json manifest that the app uses to fetch them all.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
mkdirSync(`${root}/public`, { recursive: true })

const texts = JSON.parse(readFileSync(`${root}/src/data/texts.json`, 'utf8'))

const BYTES_PER_PART = 20 * 1024 * 1024
const parts = []
let current = []
let size = 0
for (const t of texts) {
  // size in real UTF-8 bytes — Chinese text costs ~3 bytes per character,
  // so counting chars would produce parts that are still over the limit
  const len = Buffer.byteLength(JSON.stringify(t))
  if (size + len > BYTES_PER_PART && current.length) {
    parts.push(current)
    current = []
    size = 0
  }
  current.push(t)
  size += len
}
if (current.length) parts.push(current)

// clean stale files from earlier runs (single-file corpus, old part counts)
for (const f of readdirSync(`${root}/public`)) {
  if (f === 'corpus.json' || /^corpus-\d+\.json$/.test(f)) {
    unlinkSync(`${root}/public/${f}`)
    console.log(`emit_corpus: removed stale public/${f}`)
  }
}

parts.forEach((list, i) => {
  writeFileSync(`${root}/public/corpus-${i}.json`, JSON.stringify(list))
})
writeFileSync(`${root}/public/corpus-index.json`, JSON.stringify({ parts: parts.length, total: texts.length }))
console.log(`emit_corpus: ${parts.length} part(s), ${texts.length} texts`)
