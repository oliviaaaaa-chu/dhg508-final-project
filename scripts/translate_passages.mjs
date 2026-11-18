// Translates every corpus passage into Traditional Chinese using DeepSeek,
// one resumable batch at a time. Results accumulate in
// data/generated/passages-zh.json (keyed "textId:passageId"); re-running
// skips everything already cached. The English originals in texts.json are
// never modified by this script — merging is a separate step.
//
//   node scripts/translate_passages.mjs [--concurrency 3] [--batch 8]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

// read the key from .env.local without ever printing it
const env = readFileSync(`${root}/.env.local`, 'utf8')
const key = env
  .split(/\r?\n/)
  .find((l) => l.startsWith('DEEPSEEK_API_KEY='))
  ?.slice('DEEPSEEK_API_KEY='.length)
  .trim()
if (!key) {
  console.error('DEEPSEEK_API_KEY not found in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
const argOf = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? Number(args[i + 1]) || def : def
}
const CONCURRENCY = argOf('--concurrency', 3)
const BATCH = argOf('--batch', 8)

const CACHE_PATH = `${root}/data/generated/passages-zh.json`
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {}
let dirty = 0

function saveCache() {
  writeFileSync(CACHE_PATH, JSON.stringify(cache))
  dirty = 0
}

const texts = JSON.parse(readFileSync(`${root}/src/data/texts.json`, 'utf8'))
const jobs = []
for (const t of texts) {
  for (const p of t.passages || []) {
    const id = `${t.id}:${p.id}`
    if (!p.text || cache[id]) continue
    jobs.push({ id, text: p.text })
  }
}

const remaining = jobs.length
console.log(`passages to translate: ${remaining} (cached: ${Object.keys(cache).length})`)
if (!remaining) process.exit(0)

const SYSTEM =
  'You are a careful literary translator. Translate the given English passages into Traditional Chinese (繁體中文). ' +
  'Rules: translate faithfully and completely; use a plain, formal register suitable for public display in a mythology reference site; ' +
  'keep proper nouns consistent within one passage; do not add commentary, notes, or explanations; translate the full text, never abbreviate. ' +
  'Respond ONLY with JSON of shape {"translations":[{"id":"<same id>","text":"<traditional chinese translation>"}]} with every input id present.'

async function translateBatch(batch, attempt = 1) {
  const body = {
    model: 'deepseek-chat',
    temperature: 0.3,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: JSON.stringify({
          passages: batch.map((j) => ({ id: j.id, text: j.text })),
        }),
      },
    ],
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 180000)
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`api ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    if (!Array.isArray(parsed.translations)) throw new Error('bad shape')
    const out = {}
    for (const tr of parsed.translations) {
      if (!tr?.id || typeof tr.text !== 'string' || !tr.text.trim()) continue
      out[tr.id] = tr.text.trim()
    }
    for (const j of batch) if (!out[j.id]) throw new Error(`missing translation for ${j.id}`)
    return out
  } catch (e) {
    if (attempt >= 3) throw e
    const wait = 4000 * attempt
    console.warn(`batch retry ${attempt} after ${wait}ms (${String(e.message).slice(0, 120)})`)
    await new Promise((r) => setTimeout(r, wait))
    return translateBatch(batch, attempt + 1)
  } finally {
    clearTimeout(timer)
  }
}

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

const batches = chunk(jobs, BATCH)
let done = 0
let failures = 0
const started = Date.now()
let next = 0

async function worker() {
  while (true) {
    const i = next++
    if (i >= batches.length) return
    const batch = batches[i]
    try {
      const out = await translateBatch(batch)
      for (const [id, text] of Object.entries(out)) cache[id] = text
      done += batch.length
      dirty++
      // save after every batch — the job runs for hours and must survive
      // interruptions (Ctrl+C, terminal close, machine sleep)
      saveCache()
      const rate = done / ((Date.now() - started) / 1000)
      const etaMin = Math.round(((remaining - done) / rate) / 60)
      console.log(`[batch ${i + 1}/${batches.length}] ${done}/${remaining} done · ~${rate.toFixed(1)}/s · ETA ~${etaMin} min`)
    } catch (e) {
      failures++
      console.error(`[batch ${i + 1}] FAILED permanently: ${String(e.message).slice(0, 150)}`)
    }
  }
}

process.on('exit', () => {
  if (dirty) saveCache()
})
setInterval(() => dirty && saveCache(), 30000).unref()

await Promise.all(Array.from({ length: CONCURRENCY }, worker))
saveCache()
console.log(`finished: ${done} translated, ${failures} failed batches, cache at ${CACHE_PATH}`)
