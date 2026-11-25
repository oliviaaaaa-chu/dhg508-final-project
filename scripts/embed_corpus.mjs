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
const loader = await import(pathToFileURL(path.join(ROOT, 'scripts', '.corpus-loader.mjs')).href)

let corpusRaw = []
const manifestPath = path.join(ROOT, 'public', 'corpus-index.json')
if (fs.existsSync(manifestPath)) {
  const { parts } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  for (let i = 0; i < parts; i++) {
    const part = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', `corpus-${i}.json`), 'utf8'))
    corpusRaw = corpusRaw.concat(Array.isArray(part) ? part : part.texts || [])
  }
  console.log(`hydrating from corpus parts: ${corpusRaw.length} raw texts`)
} else {
  corpusRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'texts.json'), 'utf8'))
  console.log(`hydrating from src/data/texts.json: ${corpusRaw.length} raw texts`)
}
loader.hydrateCorpusFromRaw(corpusRaw)
const texts = loader.texts
console.log(`texts to embed: ${texts.length}`)
const fp = loader.fingerprint()

const { pipeline, env } = await import('@huggingface/transformers')
env.cacheDir = path.join(ROOT, '.model-cache')
console.log('loading model (Xenova/all-MiniLM-L6-v2)...')
const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })

const DIM = 384
const rows = new Float32Array(texts.length * DIM)
let done = 0

// The run takes ~15 minutes and has been interrupted before — checkpoint
// every 250 texts so an interrupted run resumes instead of restarting.
const CKPT = path.join(ROOT, '.embed-checkpoint.json')
if (fs.existsSync(CKPT)) {
  try {
    const c = JSON.parse(fs.readFileSync(CKPT, 'utf8'))
    if (c.fp === fp && Number.isInteger(c.count) && c.count > 0 && c.count <= texts.length) {
      const bin = Buffer.from(c.vecs, 'base64')
      const saved = new Float32Array(bin.buffer, bin.byteOffset, Math.floor(bin.byteLength / 4))
      rows.set(saved.subarray(0, Math.min(saved.length, rows.length)))
      done = c.count
      console.log(`resuming from checkpoint: ${done}/${texts.length}`)
    }
  } catch {
    /* corrupted checkpoint — start fresh */
  }
}

function saveCheckpoint() {
  try {
    fs.writeFileSync(
      CKPT,
      JSON.stringify({
        fp,
        count: done,
        vecs: Buffer.from(rows.buffer, rows.byteOffset, done * DIM * 4).toString('base64'),
      })
    )
  } catch {
    /* disk issue — run without checkpointing */
  }
}

for (let ti = done; ti < texts.length; ti++) {
  const tx = texts[ti]
  const inputs = tx.passages.map((p) => (p.text.length > 1200 ? p.text.slice(0, 1200) : p.text))
  if (tx.title?.en) inputs.unshift(`${tx.title.en}. ${tx.summary?.en || ''}`)
  // One forward pass for the whole text (title+summary and all passages
  // batched together) — identical mean-pooling math to the original
  // per-input loop, many times faster.
  const out = await pipe(inputs, { pooling: 'mean', normalize: true })
  const acc = new Float32Array(DIM)
  const count = inputs.length
  for (let b = 0; b < count; b++) {
    for (let d = 0; d < DIM; d++) acc[d] += out.data[b * DIM + d]
  }
  let norm = 0
  for (let d = 0; d < DIM; d++) {
    acc[d] /= count || 1
    norm += acc[d] * acc[d]
  }
  norm = Math.sqrt(norm) || 1
  const row = ti * DIM
  for (let d = 0; d < DIM; d++) rows[row + d] = acc[d] / norm
  done += 1
  if (done % 250 === 0) {
    saveCheckpoint()
    console.log(`embedded ${done}/${texts.length}`)
  }
}

const buf = Buffer.from(rows.buffer, rows.byteOffset, rows.byteLength)
const out = { fp, dim: DIM, ids: texts.map((t) => t.id), vecs: buf.toString('base64') }
const outPath = path.join(ROOT, 'public', 'semantic-embeddings.json')
fs.writeFileSync(outPath, JSON.stringify(out))
try {
  fs.rmSync(path.join(ROOT, '.embed-checkpoint.json'))
} catch {
  /* checkpoint already gone */
}
console.log(`wrote semantic-embeddings.json (${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB)`)
