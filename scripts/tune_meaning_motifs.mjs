// Threshold tuner for the meaning-level motif detection in search.js.
//
// Loads the same model the browser uses (Xenova/all-MiniLM-L6-v2, q8) from
// the local .model-cache, embeds all 270 motif descriptions exactly the way
// ensureMotifVectors() does (same input construction, same batching), and
// then scores paraphrased queries that deliberately avoid every literal
// motif keyword.
//
// What the run on 2026-11-25 showed: true paraphrases score 0.32–0.43
// against the right motif (or its nearest sibling — descent-rescue,
// succession-struggle, rainmaking), while mundane sentences top out
// ~0.34. Absolute thresholds separate poorly; the rule adopted in
// search.js is therefore K-best above a floor:
//   MEANING_MOTIF_FLOOR = 0.35, MEANING_MOTIF_TOPK = 5
// which detects a sensible motif for every paraphrase and none for the
// mundane distractors.
//
// Usage: node scripts/tune_meaning_motifs.mjs   (offline, uses .model-cache)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const motifs = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'motifs.json'), 'utf8'))

const { pipeline, env } = await import('@huggingface/transformers')
env.cacheDir = path.join(ROOT, '.model-cache')
console.log('loading model (Xenova/all-MiniLM-L6-v2, q8) from .model-cache…')
const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' })

// --- identical input construction to ensureMotifVectors() in search.js ---
const motifInputs = motifs.map(
  (m) =>
    `${m.name.en}. ${m.description.en}. ${m.keywords
      .filter((k) => !/[\u4e00-\u9fff]/.test(k))
      .join(', ')}.`
)
const DIM = 384
const rows = new Float32Array(motifs.length * DIM)
const BATCH = 48
for (let i = 0; i < motifInputs.length; i += BATCH) {
  const batch = motifInputs.slice(i, i + BATCH)
  const out = await pipe(batch, { pooling: 'mean', normalize: true })
  if (i === 0) console.log(`batch pipeline output dims: [${out.dims}] (expect [${batch.length}, ${DIM}])`)
  for (let b = 0; b < batch.length; b++) {
    for (let d = 0; d < DIM; d++) rows[(i + b) * DIM + d] = out.data[b * DIM + d]
  }
}
console.log(`embedded ${motifs.length} motif descriptions`)

// --- paraphrases that avoid every literal keyword of their motif ---
const CASES = [
  {
    expect: 'clay-humans',
    q: 'the divine potter shaped humankind out of riverbank loam and gave them the breath of life',
  },
  {
    expect: 'fire-theft',
    q: 'a benefactor took the burning coals of the immortals for humankind and was chained to a rock as the price',
  },
  {
    expect: 'descent-underworld',
    q: 'a widower walked down into the kingdom of shades to bring back his dead bride',
  },
  {
    expect: 'patricide',
    q: 'the young man slew the old king who was secretly his own begetter, exactly as the oracle foretold',
  },
  {
    expect: 'flood',
    q: 'rain fell for weeks until every field and village lay beneath open water, and only one family was left alive',
  },
  {
    expect: 'sun-capture',
    q: 'the sky stayed black because a great bird kept the shining disc hidden in its nest until heroes set it free',
  },
  {
    expect: 'trickster',
    q: 'an opportunist lied and cheated his way past the guards, laughing as the trap closed on someone else',
  },
  // distractors: everyday sentences that should stay below threshold
  { expect: null, q: 'a farmer plants maize in the spring and harvests beans in autumn' },
  { expect: null, q: 'the king commissioned a temple inscription listing the tribute goods of the province' },
]

const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n))
let summary = []
for (const { q, expect } of CASES) {
  const out = await pipe(q.slice(0, 512), { pooling: 'mean', normalize: true })
  const scored = []
  for (let m = 0; m < motifs.length; m++) {
    let d = 0
    for (let k = 0; k < DIM; k++) d += rows[m * DIM + k] * out.data[k]
    scored.push({ id: motifs[m].id, s: d })
  }
  scored.sort((a, b) => b.s - a.s)
  const top = scored.slice(0, 5)
  const expRank = expect ? scored.findIndex((x) => x.id === expect) + 1 : -1
  const expScore = expect ? scored.find((x) => x.id === expect).s : NaN
  console.log(`\n“${pad(q, 70)}”`)
  console.log(`  top-5: ${top.map((x) => `${x.id} ${x.s.toFixed(3)}`).join('  |  ')}`)
  if (expect) console.log(`  expected ${expect}: rank #${expRank}, score ${expScore.toFixed(3)}`)
  summary.push({ q, expect, top, expScore })
}

console.log('\n--- threshold summary ---')
for (const { q, expect, top, expScore } of summary) {
  const fifth = top[4].s
  const label = expect ? `expected ${expect} @ ${expScore.toFixed(3)}` : 'distractor'
  console.log(`${pad(label, 40)} best=${top[0].s.toFixed(3)} fifth=${fifth.toFixed(3)}  ${pad(q.slice(0, 40), 40)}`)
}
