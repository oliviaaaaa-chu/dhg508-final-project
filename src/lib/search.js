import motifsRaw from '../data/motifs.json'
import { POLICY } from '../data/traditionPolicy.js'
import { understand } from './understand.js'

export const motifs = motifsRaw
export const motifById = new Map(motifs.map((m) => [m.id, m]))

// The corpus is fetched lazily (public/corpus.json) instead of being bundled
// into the JavaScript: the 5,494-text corpus inline added ~23 MB to the main
// bundle, which made the site effectively unopenable on phones. Everything
// below is built by hydrateCorpusFromRaw(); views render a loading state
// until ensureCorpus() resolves.
export let texts = []
export let textById = new Map()
export let textIds = []
export let docs = []

const STOP = new Set(
  ('the a an and of to in on at for from with by as is are was were be been being it its his her their ' +
   'they them he she we you i that this these those not no nor but or if then than so such into over ' +
   'under out up down about against between through during before after above below all any both each ' +
   'few more most other some only own same too very can will just should now when where which who whom ' +
   'why how once here there upon while also thus yet said says made come came went go').split(' ')
)

function stem(w) {
  if (w.length <= 4) return w
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y'
  if (/(?:ing|ed)$/.test(w)) return w.replace(/(?:ing|ed)$/, '')
  // "boxes"/"matches"/"classes" lose "es"; everything else ending in s
  // loses just the "s", so "apples" → "apple" and both queries stem the same.
  if (/(?:[sxz]|ch|sh)es$/.test(w)) return w.slice(0, -2)
  if (/s$/.test(w)) return w.slice(0, -1)
  return w
}

export function tokenize(str) {
  const out = []
  const words = str.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  for (const w of words) {
    if (/[\u4e00-\u9fff]/.test(w)) {
      out.push(w)
      for (let i = 0; i < w.length - 1; i++) out.push(w.slice(i, i + 2))
    } else {
      if (STOP.has(w)) continue
      // Index only the stem: keeping the raw word as a separate term split
      // "apple"/"apples" into two vocabulary entries with different IDF, so
      // singular and plural queries ranked different texts.
      out.push(stem(w))
    }
  }
  return out
}

const SYN = {
  flood: ['deluge', 'inundation', 'rising waters', 'drowning'],
  deluge: ['flood'],
  fire: ['flame', 'torch', 'hearth'],
  flame: ['fire', 'torch'],
  sun: ['solar', 'daylight', 'light'],
  solar: ['sun', 'daylight'],
  underworld: ['netherworld', 'land of the dead', 'hell'],
  hell: ['underworld', 'land of the dead'],
  death: ['dying', 'mortality', 'dead'],
  serpent: ['snake', 'dragon'],
  snake: ['serpent', 'dragon'],
  dragon: ['serpent', 'snake'],
  thunder: ['lightning', 'storm'],
  lightning: ['thunder', 'storm'],
  storm: ['thunder', 'lightning'],
  creation: ['origin', 'cosmogony', 'beginning', 'making of the world'],
  origin: ['creation', 'beginning'],
  trickster: ['cunning', 'deceit', 'mischief'],
  cunning: ['trickster', 'clever'],
  immortal: ['eternal', 'undying', 'immortality'],
  immortality: ['immortal', 'eternal', 'undying'],
  wisdom: ['knowledge', 'insight'],
  knowledge: ['wisdom', 'insight'],
  rebirth: ['resurrection', 'renewal', 'rise again'],
  resurrection: ['rebirth', 'rise again'],
  giant: ['titan', 'colossus'],
  titan: ['giant', 'primordial'],
  humans: ['mankind', 'people', 'humankind'],
  mankind: ['humans', 'people'],
  sky: ['heaven', 'firmament'],
  heaven: ['sky'],
  earth: ['land', 'ground'],
  boat: ['ship', 'chest', 'vessel'],
  apple: ['fruit', 'orchard'],
  fruit: ['apple', 'harvest'],
}

// Theological name equivalents are historical facts, not fuzzy semantics —
// Zeus/Jupiter, Hercules/Heracles… A visitor using either naming convention
// must find the same stories, so these expand in every search mode.
const NAMES = {
  hercules: ['heracles', 'herakles'],
  heracles: ['herakles', 'hercules'],
  herakles: ['heracles', 'hercules'],
  zeus: ['jupiter', 'jove'],
  jupiter: ['zeus', 'jove'],
  jove: ['zeus', 'jupiter'],
  hera: ['juno'],
  juno: ['hera'],
  poseidon: ['neptune'],
  neptune: ['poseidon'],
  hades: ['pluto', 'dis'],
  pluto: ['hades'],
  athena: ['minerva', 'pallas'],
  minerva: ['athena'],
  ares: ['mars'],
  mars: ['ares'],
  aphrodite: ['venus'],
  venus: ['aphrodite'],
  hephaestus: ['vulcan', 'hephaistos'],
  vulcan: ['hephaestus'],
  hermes: ['mercury'],
  mercury: ['hermes'],
  artemis: ['diana'],
  diana: ['artemis'],
  demeter: ['ceres'],
  ceres: ['demeter'],
  dionysus: ['bacchus', 'dionysos'],
  bacchus: ['dionysus'],
  persephone: ['proserpina', 'kore'],
  proserpina: ['persephone'],
  eros: ['cupid', 'amor'],
  cupid: ['eros'],
  cronos: ['kronos', 'saturn'],
  kronos: ['cronos', 'saturn'],
  saturn: ['cronos', 'kronos'],
  odysseus: ['ulysses'],
  ulysses: ['odysseus'],
  pan: ['faunus'],
  faunus: ['pan'],
  odin: ['woden', 'wotan'],
  wotan: ['odin'],
  thor: ['thorr', 'donar'],
}

function add(map, tokens, weight) {
  for (const tk of tokens) map.set(tk, (map.get(tk) || 0) + weight)
}

// Module-level index state, (re)built by hydrateCorpusFromRaw().
let idfDefault = Math.log(2)
let idfOf = () => 0
let vecsByText = new Map()
let textDf = new Map()
let textVecs = new Map()
let tokIdx = new Map()

function toVec(counts) {
  const vec = new Map()
  let n2 = 0
  for (const [tk, w] of counts) {
    const v = w * idfOf(tk)
    if (v > 1e-9) {
      vec.set(tk, v)
      n2 += v * v
    }
  }
  const n = Math.sqrt(n2) || 1
  for (const [tk, v] of vec) vec.set(tk, v / n)
  return vec
}

function cos(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  let d = 0
  for (const [tk, v] of small) {
    const vb = large.get(tk)
    if (vb) d += v * vb
  }
  return d
}

let corpusLoaded = false

// Builds the whole TF-IDF index from the raw corpus JSON. Kept as a function
// (not module-level code) so the app can fetch the corpus lazily and show a
// loading state while it runs.
export function hydrateCorpusFromRaw(rawTexts) {
  texts = rawTexts
    .filter(
      (t) =>
        !POLICY.excluded.includes(t.tradition) &&
        Array.isArray(t.passages) &&
        t.passages.length > 0 &&
        t.passages.every((p) => p && typeof p.text === 'string' && p.text.trim()) &&
        Array.isArray(t.motifs) &&
        t.title &&
        t.title.en &&
        t.region &&
        typeof t.lat === 'number' &&
        typeof t.lon === 'number' &&
        typeof t.period === 'string' &&
        t.source
    )
    .map((t) => {
      let tx = POLICY.merges[t.tradition] ? { ...t, tradition: POLICY.merges[t.tradition] } : t
      if (tx.category === 'religious' && !POLICY.pureReligion.includes(tx.tradition)) {
        tx = { ...tx, category: 'myth' }
      }
      const cat = POLICY.recategorizeByTradition?.[tx.tradition]
      if (cat) tx = { ...tx, category: cat }
      return tx
    })
  textById = new Map(texts.map((t) => [t.id, t]))
  textIds = texts.map((t) => t.id)

  const docEntries = []
  for (const text of texts) {
    const titleTokens = tokenize(`${text.title.en} ${text.title.zh}`)
    const summaryTokens = tokenize(`${text.summary.en} ${text.summary.zh}`)
    let motifTokens = []
    for (const m of text.motifs) {
      const motif = motifById.get(m)
      if (motif) motifTokens = motifTokens.concat(tokenize(motif.keywords.join(' ')))
    }
    for (const p of text.passages) {
      const passageTokens = tokenize(p.text)
      const counts = new Map()
      add(counts, passageTokens, 1)
      add(counts, titleTokens, 1.4)
      add(counts, summaryTokens, 0.6)
      add(counts, motifTokens, 1.2)
      // Chinese translations (when present) join the index at a lower weight
      // so visitors can search the stories in Chinese; the English originals
      // remain the primary signal.
      const zhTokens = typeof p.zh === 'string' && p.zh.trim() ? tokenize(p.zh) : []
      if (zhTokens.length) add(counts, zhTokens, 0.8)
      // stem/word → the original word form in this passage, so the UI can
      // show "apples" instead of the stem "appl" in matched-terms lists
      const displayByStem = new Map()
      for (const w of p.text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/)) {
        if (!w || STOP.has(w)) continue
        if (!displayByStem.has(w)) displayByStem.set(w, w)
        if (w.length > 4 && !displayByStem.has(stem(w))) displayByStem.set(stem(w), w)
      }
      for (const w of zhTokens) if (!displayByStem.has(w)) displayByStem.set(w, w)
      docEntries.push({ textId: text.id, pid: p.id, counts, passageTokens: new Set([...passageTokens, ...zhTokens]), displayByStem, raw: p.text })
    }
  }

  const N = docEntries.length
  const df = new Map()
  for (const d of docEntries) for (const tk of d.counts.keys()) df.set(tk, (df.get(tk) || 0) + 1)
  idfDefault = Math.log(1 + N)
  idfOf = (tk) => (df.has(tk) ? Math.log(1 + N / (df.get(tk) + 1)) : idfDefault)

  docs = docEntries.map((d) => ({
    textId: d.textId,
    pid: d.pid,
    vec: toVec(d.counts),
    passageTokens: d.passageTokens,
    displayByStem: d.displayByStem,
    raw: d.raw,
  }))

  vecsByText = new Map()
  for (const d of docs) {
    if (!vecsByText.has(d.textId)) vecsByText.set(d.textId, [])
    vecsByText.get(d.textId).push(d.vec)
  }

  textDf = new Map()
  for (const [tid, vecs] of vecsByText) {
    const seen = new Set()
    for (const v of vecs) for (const tk of v.keys()) seen.add(tk)
    for (const tk of seen) textDf.set(tk, (textDf.get(tk) || 0) + 1)
  }

  textVecs = new Map()
  {
    const dfFloor = 5
    const dfCap = Math.max(3, Math.round(textIds.length * 0.25))
    for (const [tid, vecs] of vecsByText) {
      const merged = new Map()
      for (const v of vecs) for (const [tk, w] of v) merged.set(tk, (merged.get(tk) || 0) + w)
      let n2 = 0
      for (const [tk, w] of merged) {
        const df = textDf.get(tk) || 0
        if (df < dfFloor || df > dfCap) merged.delete(tk)
        else n2 += w * w
      }
      const n = Math.sqrt(n2) || 1
      for (const [tk, w] of merged) merged.set(tk, w / n)
      textVecs.set(tid, merged)
    }
  }

  tokIdx = new Map()
  {
    let k = 0
    const dfCap = Math.max(3, Math.round(textIds.length * 0.25))
    for (const [tk, c] of textDf) if (c >= 5 && c <= dfCap) tokIdx.set(tk, k++)
  }

  corpusLoaded = true
  return fingerprint()
}

// Fetches the corpus JSON from public/ (copied there at build time) and
// builds the index. Views wait on this before rendering.
let corpusPromise = null
export function corpusIsLoaded() {
  return corpusLoaded
}
async function fetchCorpusJson() {
  const base = import.meta.env?.BASE_URL ?? '/'
  // The corpus ships as numbered parts (corpus-0.json …) with a manifest,
  // because the full file now exceeds Cloudflare Pages' 25 MiB per-file cap.
  const idx = await fetch(`${base}corpus-index.json`, { cache: 'force-cache' })
  if (idx.ok) {
    const { parts } = await idx.json()
    const responses = await Promise.all(
      Array.from({ length: parts }, (_, i) => fetch(`${base}corpus-${i}.json`, { cache: 'force-cache' }))
    )
    const bad = responses.find((r) => !r.ok)
    if (bad) throw new Error(`corpus part fetch failed: ${bad.status}`)
    const lists = await Promise.all(responses.map((r) => r.json()))
    return lists.flat()
  }
  // fallback: single-file corpus (older builds)
  const res = await fetch(`${base}corpus.json`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`corpus fetch failed: ${res.status}`)
  return res.json()
}
export async function ensureCorpus() {
  if (corpusLoaded) return fingerprint()
  if (!corpusPromise) {
    corpusPromise = (async () => {
      hydrateCorpusFromRaw(await fetchCorpusJson())
      return fingerprint()
    })().catch((e) => {
      corpusPromise = null
      throw e
    })
  }
  return corpusPromise
}

function buildSorted(vec) {
  const pairs = []
  for (const [tk, w] of vec) {
    const i = tokIdx.get(tk)
    if (i !== undefined) pairs.push([i, w])
  }
  pairs.sort((a, b) => a[0] - b[0])
  const idx = new Float64Array(pairs.length)
  const w = new Float64Array(pairs.length)
  for (let k = 0; k < pairs.length; k++) {
    idx[k] = pairs[k][0]
    w[k] = pairs[k][1]
  }
  return { idx, w }
}

function dotSorted(A, B) {
  let i = 0
  let j = 0
  let d = 0
  const na = A.idx.length
  const nb = B.idx.length
  const ai = A.idx
  const bi = B.idx
  const aw = A.w
  const bw = B.w
  while (i < na && j < nb) {
    const a = ai[i]
    const b = bi[j]
    if (a === b) {
      d += aw[i] * bw[j]
      i++
      j++
    } else if (a < b) i++
    else j++
  }
  return d
}

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)
const simMatrix = new Map()
let embCache = null
let emb3Cache = null

// v4: the matrix and the embedding-map projection are built from the
// per-story MiniLM embeddings (semantic-cache.json), not TF-IDF. The
// corpus fingerprint does not change when only the cache format does, so
// the key must be bumped to evict returning visitors' stale local copies.
const CACHE_KEY = 'dhg508-matrix-cache-v4'

function applyCacheData(c) {
  for (let k = 0; k < c.sim.length; k += 3) {
    simMatrix.set(pairKey(textIds[c.sim[k]], textIds[c.sim[k + 1]]), c.sim[k + 2] / 1000)
  }
  embCache = c.emb2 || null
  emb3Cache = c.emb3 || null
}

export function fingerprint() {
  return `${texts.length}|${docs.length}|${textIds[0]}|${textIds[textIds.length - 1]}`
}

let semanticState = null
export async function hydrateSemantic(data) {
  if (!data || !data.vecs || data.fp !== fingerprint() || semanticState) return !!semanticState
  // Load the ORT wasm binary from jsDelivr instead of bundling it: the
  // bundled copy is 25.6 MiB, over Cloudflare Pages' 25 MiB per-file limit.
  // The loader .mjs stays local, so the wasm must match the pinned ORT version.
  const { pipeline, env } = await import('@huggingface/transformers')
  env.backends.onnx.wasm.wasmPaths =
    'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/'
  const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })
  const bin = Uint8Array.from(atob(data.vecs), (c) => c.charCodeAt(0))
  const rows = new Float32Array(bin.buffer, bin.byteOffset, bin.byteLength / 4)
  semanticState = {
    pipe,
    ids: data.ids,
    dim: data.dim,
    rows,
    index: new Map(data.ids.map((id, i) => [id, i])),
  }
  return true
}

export async function ensureSemantic() {
  if (semanticState) return semanticState
  let data = null
  try {
    const base = import.meta.env?.BASE_URL ?? '/'
    const res = await fetch(`${base}semantic-embeddings.json`, { cache: 'force-cache' })
    if (res.ok) data = await res.json()
  } catch {
    return null
  }
  // The model download (CDN) and the ORT wasm can fail offline; that must
  // degrade to keyword matching, never surface as an unhandled rejection.
  let ok = false
  try {
    ok = await hydrateSemantic(data)
  } catch {
    return null
  }
  return ok ? semanticState : null
}

// --- Meaning-level motif detection ---------------------------------------
// Once the model is loaded, the 270 motif descriptions are embedded once
// per session (batched, cached in localStorage) so a visitor's words can be
// matched to motifs by MEANING: "a god shaped people from mud and breathed
// life into them" reaches clay-humans with no exact keyword hit.
const MOTIFVEC_KEY = 'dhg508-motifvec-v1'
let motifVecs = null

// Tuned against the local model cache with scripts/tune_meaning_motifs.mjs:
// paraphrases of a motif score 0.32–0.43 against the right motif (or its
// nearest sibling, e.g. descent-rescue for an underworld-journey query),
// while mundane sentences top out ~0.34. Absolute cosine separates poorly,
// so detection = the top-K motifs above a floor.
export const MEANING_MOTIF_FLOOR = 0.35
export const MEANING_MOTIF_TOPK = 5

function f32ToB64(rows) {
  const bytes = new Uint8Array(rows.buffer, rows.byteOffset, rows.byteLength)
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  return btoa(bin)
}

async function ensureMotifVectors(st) {
  if (motifVecs) return motifVecs
  try {
    const raw = localStorage.getItem(MOTIFVEC_KEY)
    if (raw) {
      const c = JSON.parse(raw)
      if (c.fp === fingerprint() && c.dim === st.dim && typeof c.vecs === 'string') {
        const bin = Uint8Array.from(atob(c.vecs), (ch) => ch.charCodeAt(0))
        motifVecs = { dim: c.dim, rows: new Float32Array(bin.buffer, bin.byteOffset, bin.byteLength / 4) }
        return motifVecs
      }
    }
  } catch {
    /* corrupted cache — rebuild below */
  }
  const inputs = motifs.map(
    (m) =>
      `${m.name.en}. ${m.description.en}. ${m.keywords
        .filter((k) => !/[\u4e00-\u9fff]/.test(k))
        .join(', ')}.`
  )
  const rows = new Float32Array(motifs.length * st.dim)
  const BATCH = 48
  for (let i = 0; i < inputs.length; i += BATCH) {
    const batch = inputs.slice(i, i + BATCH)
    const out = await st.pipe(batch, { pooling: 'mean', normalize: true })
    for (let b = 0; b < batch.length; b++) {
      const off = (i + b) * st.dim
      for (let d = 0; d < st.dim; d++) rows[off + d] = out.data[b * st.dim + d]
    }
  }
  motifVecs = { dim: st.dim, rows }
  try {
    localStorage.setItem(MOTIFVEC_KEY, JSON.stringify({ fp: fingerprint(), dim: st.dim, vecs: f32ToB64(rows) }))
  } catch {
    /* storage quota exceeded — keep in memory only */
  }
  return motifVecs
}

// Cosine of each clause embedding against every motif description; a motif
// counts when ANY clause (story beat) matches it by meaning. The K-best
// rule above the floor (see the tuning script) is what separates true
// motifs from background similarity.
async function detectMotifsByMeaning(st, emb, nClauses) {
  try {
    const mv = await ensureMotifVectors(st)
    const D = st.dim
    const hits = []
    for (let m = 0; m < motifs.length; m++) {
      let best = 0
      const mo = m * D
      for (let c = 0; c < nClauses; c++) {
        let d = 0
        const co = c * D
        for (let k = 0; k < D; k++) d += emb.data[co + k] * mv.rows[mo + k]
        if (d > best) best = d
      }
      if (best >= MEANING_MOTIF_FLOOR) hits.push({ id: motifs[m].id, score: best })
    }
    hits.sort((a, b) => b.score - a.score)
    return hits.slice(0, MEANING_MOTIF_TOPK)
  } catch {
    return [] // motif vectors unavailable — literal/implied tiers still apply
  }
}

// Understand-first semantic search. The request is parsed (understand.js)
// before anything is searched: scaffolding never reaches the embedding,
// negation excludes instead of matching, mentioned traditions boost, and
// a long pasted story is compared beat by beat instead of truncated.
export async function semanticSearch(query, pre) {
  const trimmed = query.trim()
  if (!trimmed) return { understanding: understand(''), results: [] }
  const st = await ensureSemantic()
  if (!st) return null
  const u0 = pre ?? understand(trimmed)

  // Embed the story beats (long Compare input) or the cleaned core — never
  // the raw request with its "show me stories about…" scaffolding.
  const targets = u0.clauses.length ? u0.clauses : [u0.core || u0.raw]
  const emb = await st.pipe(
    targets.map((s) => s.slice(0, 512)),
    { pooling: 'mean', normalize: true }
  )
  const C = targets.length
  const D = st.dim

  // Meaning-level motifs reuse the clause embeddings (no extra inference
  // on the query side).
  const meaning = await detectMotifsByMeaning(st, emb, C)

  // Merge the three recognition tiers into one boost table.
  const boosts = new Map()
  const howBy = new Map()
  for (const h of u0.motifs.literal) {
    howBy.set(h.id, 'keyword')
    boosts.set(h.id, 0.25)
  }
  for (const h of u0.motifs.implied) {
    if (howBy.has(h.id)) continue
    howBy.set(h.id, 'implied')
    boosts.set(h.id, 0.18)
  }
  for (const h of meaning) {
    if (howBy.has(h.id)) continue
    howBy.set(h.id, 'meaning')
    boosts.set(h.id, Math.min(0.22, 0.1 + (h.score - MEANING_MOTIF_FLOOR) * 0.5))
  }

  const negMotifSet = new Set(u0.negated.motifs.map((x) => x.id))
  const tradSet = new Set(u0.traditions.map((x) => x.id))

  const scored = []
  for (let i = 0; i < st.ids.length; i++) {
    const off = i * D
    let max = 0
    let sum = 0
    for (let c = 0; c < C; c++) {
      let d = 0
      const co = c * D
      for (let k = 0; k < D; k++) d += emb.data[co + k] * st.rows[off + k]
      if (d > max) max = d
      sum += d
    }
    // One vivid event in a long story must not be averaged away: max over
    // beats carries most of the weight, the mean keeps the overall theme.
    const abs = C > 1 ? 0.75 * max + 0.25 * (sum / C) : sum / C
    if (abs >= 0.28) scored.push({ id: st.ids[i], abs })
  }

  // Exclusions: texts carrying a negated motif are dropped; texts whose
  // vocabulary prominently contains a negated word are pushed down.
  // Mentioned traditions get a gentle boost, not a hard filter — cross-
  // tradition parallels are the point of the atlas.
  const kept = []
  for (const item of scored) {
    const text = textById.get(item.id)
    if (!text) continue
    if (negMotifSet.size && text.motifs.some((m) => negMotifSet.has(m))) continue
    let abs = item.abs
    let motifBoost = 0
    for (const [mid, w] of boosts) if (text.motifs.includes(mid)) motifBoost += w
    abs += Math.min(motifBoost, 0.5)
    if (tradSet.has(text.tradition)) abs += 0.1
    if (u0.negated.termStems.length) {
      const tv = textVecs.get(item.id)
      if (tv) for (const tk of u0.negated.termStems) {
        if (tv.has(tk)) {
          abs *= 0.45
          break
        }
      }
    }
    item.abs = abs
    kept.push(item)
  }
  kept.sort((a, b) => b.abs - a.abs)

  // Lexical explanations (matched terms, best passages) come from the
  // CLEANED core, so scaffolding and negated spans never appear as
  // "matches".
  const lex = search(u0.core || u0.raw, 'keyword')
  const lexBy = new Map(lex.map((r) => [r.text.id, r]))

  const results = kept.slice(0, 20).map(({ id, abs }) => {
    const text = textById.get(id)
    const l = lexBy.get(id)
    const strength = abs >= 0.45 ? 'strong' : abs >= 0.35 ? 'related' : 'possible'
    const shared = [...boosts.keys()]
      .filter((mid) => text.motifs.includes(mid))
      .map((mid) => ({ id: mid, how: howBy.get(mid) }))
    return {
      text,
      abs,
      pct: Math.min(100, Math.round((abs / 0.7) * 100)),
      strength,
      shared,
      matched: l ? l.matched : [],
      best: l ? l.best : text.passages.slice(0, 1).map((p) => ({ pid: p.id, raw: p.text, passageTokens: new Set() })),
    }
  })

  const understanding = {
    ...u0,
    motifs: { literal: u0.motifs.literal, implied: u0.motifs.implied, meaning },
  }
  return { understanding, results }
}

function hydrateFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return false
    const c = JSON.parse(raw)
    if (c.fp !== fingerprint() || !Array.isArray(c.sim) || !c.emb3) return false
    applyCacheData(c)
    return true
  } catch {
    return false
  }
}

async function tryFetchCache() {
  try {
    const res = await fetch('/semantic-cache.json', { cache: 'no-store' })
    if (!res.ok) return false
    const c = await res.json()
    if (c.fp !== fingerprint() || !Array.isArray(c.sim) || !c.emb3) return false
    applyCacheData(c)
    return true
  } catch {
    return false
  }
}

function saveCache(idIndex) {
  try {
    if (simMatrix.size > 100000) return
    const flat = []
    for (const [k, s] of simMatrix) {
      if (s < 0.08) continue
      const [a, b] = k.split('|')
      flat.push(idIndex.get(a), idIndex.get(b), Math.round(s * 1000))
    }
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fp: fingerprint(), sim: flat, emb2: embCache, emb3: emb3Cache })
    )
  } catch {
    /* storage quota exceeded — run without cache */
  }
}

function powerIterTyped(G, n, iters = 60) {
  let u = Float64Array.from({ length: n }, () => Math.random() - 0.5)
  const y = new Float64Array(n)
  for (let it = 0; it < iters; it++) {
    y.fill(0)
    for (let i = 0; i < n; i++) {
      let s = 0
      const row = i * n
      for (let j = 0; j < n; j++) s += G[row + j] * u[j]
      y[i] = s
    }
    let norm = 0
    for (let i = 0; i < n; i++) norm += y[i] * y[i]
    norm = Math.sqrt(norm) || 1
    let delta = 0
    for (let i = 0; i < n; i++) {
      const v = y[i] / norm
      delta += Math.abs(v - u[i])
      u[i] = v
    }
    if (delta < 1e-10) break
  }
  let lambda = 0
  for (let i = 0; i < n; i++) {
    let s = 0
    const row = i * n
    for (let j = 0; j < n; j++) s += G[row + j] * u[j]
    lambda += u[i] * s
  }
  return { u: Array.from(u), lambda }
}

function deflateTyped(G, n, { u, lambda }) {
  const G2 = G.slice()
  for (let i = 0; i < n; i++) {
    const ui = u[i]
    if (!ui) continue
    const row = i * n
    for (let j = 0; j < n; j++) G2[row + j] -= lambda * ui * u[j]
  }
  return G2
}

function computeAll() {
  const n = textIds.length
  const sortedText = textIds.map((id) => buildSorted(textVecs.get(id)))
  const sortedPass = new Map()
  for (const [tid, list] of vecsByText) sortedPass.set(tid, list.map((v) => buildSorted(v)))
  const G = new Float64Array(n * n)
  const rawSims = []
  for (let i = 0; i < n; i++) {
    G[i * n + i] = 1
    const vi = sortedText[i]
    if (!vi) continue
    for (let j = i + 1; j < n; j++) {
      const vj = sortedText[j]
      if (!vj) continue
      const d = dotSorted(vi, vj)
      G[i * n + j] = d
      G[j * n + i] = d
      if (d > 0.25) {
        let maxPass = 0
        for (const va of sortedPass.get(textIds[i]) || []) {
          for (const vb of sortedPass.get(textIds[j]) || []) {
            const c = dotSorted(va, vb)
            if (c > maxPass) maxPass = c
          }
        }
        rawSims.push(i, j, 0.5 * (d + maxPass))
      } else if (d >= 0.12) {
        rawSims.push(i, j, 0.5 * d)
      }
    }
  }

  let maxRaw = 0
  for (let k = 2; k < rawSims.length; k += 3) if (rawSims[k] > maxRaw) maxRaw = rawSims[k]
  if (maxRaw > 0) {
    for (let k = 0; k < rawSims.length; k += 3) {
      const s = rawSims[k + 2] / maxRaw
      if (s >= 0.08) simMatrix.set(pairKey(textIds[rawSims[k]], textIds[rawSims[k + 1]]), s)
    }
  }

  const p1 = powerIterTyped(G, n)
  const p2 = powerIterTyped(deflateTyped(G, n, p1), n)
  const p3 = powerIterTyped(deflateTyped(deflateTyped(G, n, p1), n, p2), n)

  const SPANS = [400, 260, 380]
  const AXES = ['x', 'y', 'z']

  const mk = (dims) => {
    const k = dims.length
    const cols = []
    for (let d = 0; d < k; d++) {
      const lam = Math.max(dims[d].lambda, 0)
      const s = Math.sqrt(lam)
      const c = new Float64Array(n)
      let m = 0
      for (let i = 0; i < n; i++) {
        c[i] = dims[d].u[i] * s
        m += c[i]
      }
      m /= n
      let meanSq = 0
      for (let i = 0; i < n; i++) {
        c[i] -= m
        meanSq += c[i] * c[i]
      }
      const rms = Math.sqrt(meanSq / n) || 1
      const abs = Array.from(c, Math.abs)
      abs.sort((a, b) => a - b)
      const p975 = abs[Math.min(n - 1, Math.floor(0.975 * n))] || 1
      const spread = Math.max(p975, rms) || 1
      cols.push({ c, lam, spread, scale: SPANS[d] / spread })
    }
    const order = cols.map((_, i) => i).sort((a, b) => cols[b].spread - cols[a].spread)
    const points = textIds.map((id, i) => {
      const q = { id }
      for (let d = 0; d < k; d++) {
        const col = cols[order[d]]
        const lim = SPANS[d] * 1.5
        let v = col.c[i] * col.scale
        q[AXES[d]] = v > lim ? lim : v < -lim ? -lim : v
      }
      return q
    })
    return {
      points,
      var1: cols[order[0]].lam / n,
      var2: k >= 2 ? cols[order[1]].lam / n : 0,
      var3: k >= 3 ? cols[order[2]].lam / n : 0,
    }
  }

  embCache = mk([p1, p2])
  emb3Cache = mk([p1, p2, p3])
}

let matrixReady = false
function normalizeSim() {
  let maxSim = 0
  for (const s of simMatrix.values()) if (s > maxSim) maxSim = s
  if (maxSim > 0) for (const [k, s] of simMatrix) simMatrix.set(k, s / maxSim)
  matrixReady = true
}

// The similarity matrix powers Network, Embedding and the "closest
// parallels" panel. It hydrates lazily (localStorage → semantic-cache.json →
// computed on the fly) so the app can render long before any of this is
// ready; views call ensureMatrix() and re-render when it resolves.
export function matrixIsReady() {
  return matrixReady
}
export async function ensureMatrix() {
  if (matrixReady) return true
  if (!globalThis.__SKIP_MATRIX__) {
    if (hydrateFromCache()) {
      normalizeSim()
      return true
    }
    if (await tryFetchCache()) {
      normalizeSim()
      return true
    }
    computeAll()
    saveCache(new Map(textIds.map((id, i) => [id, i])))
  }
  normalizeSim()
  return matrixReady
}

export function detectMotifs(q) {
  const s = q.toLowerCase()
  const found = []
  for (const m of motifs) {
    for (const k of m.keywords) {
      if (s.includes(k.toLowerCase())) {
        found.push(m.id)
        break
      }
    }
  }
  return found
}

export function buildQueryVector(query, mode = 'keyword') {
  const q = query.toLowerCase()
  const counts = new Map()
  add(counts, tokenize(query), 1)
  // Theological name equivalents (Zeus/Jupiter, Hercules/Heracles…) are
  // historical facts, not fuzzy semantics — expand them in every mode so a
  // visitor using either naming convention finds the same stories.
  for (const [word, syns] of Object.entries(NAMES)) {
    if (q.includes(word)) for (const s of syns) add(counts, tokenize(s), 0.5)
  }
  if (mode === 'semantic') {
    for (const [word, syns] of Object.entries(SYN)) {
      if (q.includes(word)) for (const s of syns) add(counts, tokenize(s), 0.35)
    }
    for (const m of motifs) {
      for (const k of m.keywords) {
        if (q.includes(k.toLowerCase())) {
          add(counts, tokenize(m.keywords.join(' ')), 0.5)
          break
        }
      }
    }
  }
  return toVec(counts)
}

export function search(query, mode = 'keyword') {
  const trimmed = query.trim()
  if (!trimmed) return []
  // Both engines consume the same understanding pass: the query vector,
  // matched terms and motif boosts are built from the CLEANED content, and
  // explicit negation/tradition mentions are honoured even in keyword mode.
  const u = understand(trimmed)
  const core = u.core || trimmed
  const qv = buildQueryVector(core, mode)
  const qTokens = [...tokenize(core)]
  const qMotifs = [...new Set([...u.motifs.literal.map((m) => m.id), ...u.motifs.implied.map((m) => m.id)])]
  const phrase = core.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  const negMotifSet = new Set(u.negated.motifs.map((x) => x.id))
  const tradSet = new Set(u.traditions.map((x) => x.id))

  const perText = new Map()
  for (const d of docs) {
    let s = cos(qv, d.vec)
    if (s <= 0.02) continue
    if (phrase.length > 3 && d.raw && d.raw.toLowerCase().includes(phrase)) s *= 1.35
    if (!perText.has(d.textId)) perText.set(d.textId, { max: 0, best: [] })
    const g = perText.get(d.textId)
    if (s > g.max) g.max = s
    g.best.push(d)
  }

  let maxAbs = 0
  for (const g of perText.values()) if (g.max > maxAbs) maxAbs = g.max
  if (!maxAbs) return []

  const results = []
  for (const [tid, g] of perText) {
    if (g.max < 0.09) continue
    const text = textById.get(tid)
    if (negMotifSet.size && text.motifs.some((m) => negMotifSet.has(m))) continue
    const best = g.best.sort((x, y) => cos(qv, y.vec) - cos(qv, x.vec)).slice(0, 2)
    const bestTokenSet = new Set(best.flatMap((d) => [...d.passageTokens]))
    const matched = qTokens.filter((t) => bestTokenSet.has(t)).slice(0, 8)
    const shared = qMotifs.filter((m) => text.motifs.includes(m))
    const contentStems = [...new Set(qTokens.filter((t) => t.length > 2))]
    const covered = contentStems.filter((st) => bestTokenSet.has(st))
    let abs = g.max
    if (contentStems.length >= 2 && covered.length / contentStems.length < 0.75) abs *= 0.65
    if (shared.length) abs += 0.22
    // texts whose vocabulary prominently contains an excluded word are
    // pushed down; mentioned traditions get a gentle boost
    if (u.negated.termStems.length) {
      const tv = textVecs.get(tid)
      if (tv) {
        for (const tk of u.negated.termStems) {
          if (tv.has(tk)) {
            abs *= 0.45
            break
          }
        }
      }
    }
    if (tradSet.has(text.tradition)) abs += 0.06
    if (abs < 0.09) continue
    const strength = abs >= 0.3 ? 'strong' : abs >= 0.18 ? 'related' : 'possible'
    // map matched stems back to the words actually used in the passage, so
    // the UI shows "apples" rather than the internal stem "appl"
    const disp = best[0]?.displayByStem
    const matchedWords = disp ? matched.map((st) => disp.get(st) ?? st) : matched
    results.push({
      text,
      abs,
      pct: Math.min(100, Math.round((abs / 0.5) * 100)),
      strength,
      shared,
      matched: [...new Set(matchedWords)],
      best,
    })
  }
  results.sort((a, b) => b.abs - a.abs)
  return results
}

export function related(textId, k = 3) {
  const out = []
  for (const b of textIds) {
    if (b === textId) continue
    const s = simMatrix.get(pairKey(textId, b)) || 0
    out.push({ id: b, s })
  }
  return out
    .sort((x, y) => y.s - x.s)
    .slice(0, k)
    .map((x) => ({ text: textById.get(x.id), sim: x.s }))
}

export function graph(threshold = 0.5) {
  const links = []
  const deg = new Map()
  for (const [k, s] of simMatrix) {
    if (s >= threshold) {
      const [a, b] = k.split('|')
      links.push({ source: a, target: b, weight: s })
      deg.set(a, (deg.get(a) || 0) + 1)
      deg.set(b, (deg.get(b) || 0) + 1)
    }
  }
  // Only simulate nodes that actually have edges — previously every one of
  // the ~5,400 texts was laid out (including thousands of invisible
  // degree-0 dots), which froze the Network view.
  const nodes = texts
    .filter((t) => (deg.get(t.id) || 0) > 0)
    .map((t) => ({ id: t.id, deg: deg.get(t.id) }))
  return { nodes, links }
}

export function similarity(a, b) {
  return simMatrix.get(pairKey(a, b)) || 0
}

function powerIter(G, n, iters = 80) {
  let u = new Array(n).fill(0).map(() => Math.random() - 0.5)
  for (let it = 0; it < iters; it++) {
    const y = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      let s = 0
      const gi = G[i]
      for (let j = 0; j < n; j++) s += gi[j] * u[j]
      y[i] = s
    }
    const norm = Math.sqrt(y.reduce((a, v) => a + v * v, 0)) || 1
    u = y.map((v) => v / norm)
  }
  const Gu = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let j = 0; j < n; j++) s += G[i][j] * u[j]
    Gu[i] = s
  }
  const lambda = u.reduce((a, v, i) => a + v * Gu[i], 0)
  return { u, lambda }
}

export function relaxPoints(points, dims, { iters = 80, minDist = 20, anchor = 0.02, step = 0.35 } = {}) {
  const n = points.length
  if (!n) return points
  const is3D = dims === 3
  const ax = new Float64Array(n)
  const ay = new Float64Array(n)
  const az = is3D ? new Float64Array(n) : null
  for (let i = 0; i < n; i++) {
    ax[i] = points[i].x
    ay[i] = points[i].y
    if (az) az[i] = points[i].z
  }
  const snapX = new Float64Array(n)
  const snapY = new Float64Array(n)
  const snapZ = is3D ? new Float64Array(n) : null
  const fx = new Float64Array(n)
  const fy = new Float64Array(n)
  const fz = is3D ? new Float64Array(n) : null
  const inv = 1 / minDist
  const OFF = 2048
  const offs = is3D
    ? [
        [1, 0, 0], [-1, 1, 0], [0, 1, 0], [1, 1, 0],
        [-1, -1, 1], [0, -1, 1], [1, -1, 1], [-1, 0, 1],
        [0, 0, 1], [1, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1],
      ]
    : [[1, 0, 0], [-1, 1, 0], [0, 1, 0], [1, 1, 0]]

  const push = (i, j) => {
    const ddx = snapX[j] - snapX[i]
    const ddy = snapY[j] - snapY[i]
    const ddz = snapZ ? snapZ[j] - snapZ[i] : 0
    const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)
    if (d >= minDist) return
    let ux = ddx
    let uy = ddy
    let uz = ddz
    if (d < 0.5) {
      const g = i * 2.399963
      ux = Math.cos(g)
      uy = Math.sin(g)
      uz = is3D ? Math.sin(i * 1.7) : 0
    } else {
      ux /= d
      uy /= d
      uz /= d
    }
    const m = (minDist - d) * 0.5
    fx[i] -= ux * m
    fy[i] -= uy * m
    if (fz) fz[i] -= uz * m
    fx[j] += ux * m
    fy[j] += uy * m
    if (fz) fz[j] += uz * m
  }

  let itersRun = 0
  for (let it = 0; it < iters; it++) {
    itersRun = it + 1
    for (let i = 0; i < n; i++) {
      snapX[i] = points[i].x
      snapY[i] = points[i].y
      if (snapZ) snapZ[i] = points[i].z
    }
    const grid = new Map()
    for (let i = 0; i < n; i++) {
      const key = is3D
        ? (((Math.floor(snapX[i] * inv) + OFF) * 4096 + Math.floor(snapY[i] * inv) + OFF) * 4096 + Math.floor(snapZ[i] * inv) + OFF)
        : (Math.floor(snapX[i] * inv) + OFF) * 4096 + Math.floor(snapY[i] * inv) + OFF
      const cell = grid.get(key)
      if (cell) cell.push(i)
      else grid.set(key, [i])
    }
    fx.fill(0)
    fy.fill(0)
    if (fz) fz.fill(0)
    let moved = 0
    for (const [key, cell] of grid) {
      let cx, cy, cz
      if (is3D) {
        cz = (key % 4096) - OFF
        cy = (Math.floor(key / 4096) % 4096) - OFF
        cx = Math.floor(key / 16777216) - OFF
      } else {
        cy = (key % 4096) - OFF
        cx = Math.floor(key / 4096) - OFF
      }
      for (let a = 0; a < cell.length; a++) {
        for (let b = a + 1; b < cell.length; b++) push(cell[a], cell[b])
      }
      for (const [dx, dy, dz] of offs) {
        const nkey = is3D
          ? ((cx + dx + OFF) * 4096 + cy + dy + OFF) * 4096 + cz + dz + OFF
          : (cx + dx + OFF) * 4096 + cy + dy + OFF
        const other = grid.get(nkey)
        if (!other) continue
        for (const i of cell) for (const j of other) push(i, j)
      }
    }
    for (let i = 0; i < n; i++) {
      const p = points[i]
      const dx = fx[i] * step + (ax[i] - p.x) * anchor
      const dy = fy[i] * step + (ay[i] - p.y) * anchor
      const dz = fz ? fz[i] * step + (az[i] - p.z) * anchor : 0
      p.x += dx
      p.y += dy
      if (fz) p.z += dz
      moved += Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
    }
    if (moved / n < 0.05) break
  }
  if (globalThis.__RELAX_DEBUG__) console.error(`relax: ended at iter ${itersRun}/${iters}`)
  return points
}

export function embedding2D() {
  if (!embCache) {
    computeAll()
    saveCache(new Map(textIds.map((id, i) => [id, i])))
  }
  if (!embCache.relaxed) {
    relaxPoints(embCache.points, 2)
    embCache.relaxed = true
  }
  return embCache
}

export function embedding3D() {
  if (!emb3Cache) {
    computeAll()
    saveCache(new Map(textIds.map((id, i) => [id, i])))
  }
  if (!emb3Cache.relaxed) {
    relaxPoints(emb3Cache.points, 3)
    emb3Cache.relaxed = true
  }
  return emb3Cache
}
