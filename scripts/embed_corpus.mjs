import esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

console.log('Bundling corpus loader...')
esbuild.buildSync({
  entryPoints: [path.join(ROOT, 'src', 'lib', 'search.js')],
  bundle: true,
  format: 'esm',
  outfile: path.join(ROOT, 'scripts', '.corpus-loader.mjs'),
  loader: { '.json': 'json' },
  platform: 'node',
  target: 'es2022',
  external: ['@huggingface/transformers'],
})

globalThis.__SKIP_MATRIX__ = true
const { texts, fingerprint } = await import(pathToFileURL(path.join(ROOT, 'scripts', '.corpus-loader.mjs')).href)
console.log(`texts to embed: ${texts.length}`)
const fp = fingerprint()

const { pipeline, env } = await import('@huggingface/transformers')
env.cacheDir = path.join(ROOT, '.model-cache')
console.log('loading model (Xenova/all-MiniLM-L6-v2)...')
const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })

const DIM = 384
const rows = new Float32Array(texts.length * DIM)
let done = 0

for (const tx of texts) {
  const inputs = tx.passages.map((p) => (p.text.length > 1200 ? p.text.slice(0, 1200) : p.text))
  if (tx.title?.en) inputs.unshift(`${tx.title.en}. ${tx.summary?.en || ''}`)
  const acc = new Float32Array(DIM)
  let count = 0
  for (const input of inputs) {
    const out = await pipe(input, { pooling: 'mean', normalize: true })
    const data = out.data
    for (let d = 0; d < DIM; d++) acc[d] += data[d]
    count += 1
  }
  let norm = 0
  for (let d = 0; d < DIM; d++) {
    acc[d] /= count || 1
    norm += acc[d] * acc[d]
  }
  norm = Math.sqrt(norm) || 1
  const row = texts.indexOf(tx) * DIM
  for (let d = 0; d < DIM; d++) rows[row + d] = acc[d] / norm
  done += 1
  if (done % 250 === 0) console.log(`embedded ${done}/${texts.length}`)
}

const buf = Buffer.from(rows.buffer, rows.byteOffset, rows.byteLength)
const out = { fp, dim: DIM, ids: texts.map((t) => t.id), vecs: buf.toString('base64') }
const outPath = path.join(ROOT, 'public', 'semantic-embeddings.json')
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(`wrote semantic-embeddings.json (${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB)`)
