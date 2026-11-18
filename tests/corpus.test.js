import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { POLICY } from '../src/data/traditionPolicy.js'
import { TRADITIONS } from '../src/lib/colors.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const texts = JSON.parse(readFileSync(join(root, 'src/data/texts.json'), 'utf8'))
const motifs = JSON.parse(readFileSync(join(root, 'src/data/motifs.json'), 'utf8'))
const charactersRaw = JSON.parse(readFileSync(join(root, 'src/data/characters.json'), 'utf8'))
const motifIds = new Set(motifs.map((m) => m.id))
const roster = Array.isArray(charactersRaw) ? charactersRaw : charactersRaw.characters

// Historical guardrails: the pipeline must keep enforcing the boundaries
// described in docs/plan.md even as the corpus grows.
describe('corpus integrity (raw JSON on disk)', () => {
  it('stays within the frozen scope', () => {
    expect(texts.length).toBe(5494)
  })

  it('has unique ids in slug form', () => {
    const ids = texts.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('every text carries the required research fields', () => {
    for (const t of texts) {
      expect(t.title?.en ?? t.title, t.id).toBeTruthy()
      expect(t.tradition, t.id).toBeTruthy()
      expect(['myth', 'religious', 'myth-religion'], t.id).toContain(t.category)
      expect(t.region, t.id).toBeTruthy()
      expect(typeof t.period, t.id).toBe('string')
      expect(t.source, t.id).toBeTruthy()
    }
  })

  it('every text has a source URL with archive + work', () => {
    for (const t of texts) {
      expect(t.source?.url, `${t.id} source url`).toMatch(/^https?:\/\//)
      expect(t.source?.archive ?? t.source?.work, `${t.id} archive/work`).toBeTruthy()
    }
  })

  it('every text has usable map coordinates in range', () => {
    for (const t of texts) {
      expect(t.lat, `${t.id} lat`).toBeGreaterThanOrEqual(-90)
      expect(t.lat, `${t.id} lat`).toBeLessThanOrEqual(90)
      expect(t.lon, `${t.id} lon`).toBeGreaterThanOrEqual(-180)
      expect(t.lon, `${t.id} lon`).toBeLessThanOrEqual(180)
    }
  })

  it('every motif tag exists in motifs.json', () => {
    for (const t of texts) {
      expect(Array.isArray(t.motifs), `${t.id} motifs`).toBe(true)
      expect(t.motifs.length, `${t.id} at least one motif`).toBeGreaterThan(0)
      for (const m of t.motifs) expect(motifIds.has(m), `${t.id}: unknown motif ${m}`).toBe(true)
    }
  })

  it('every text carries at least one verbatim passage', () => {
    for (const t of texts) {
      expect(Array.isArray(t.passages), `${t.id} passages`).toBe(true)
      expect(t.passages.length, `${t.id} at least one passage`).toBeGreaterThan(0)
      for (const p of t.passages) {
        expect(typeof p.text === 'string' && p.text.trim().length > 20, `${t.id} passage body`).toBe(true)
      }
    }
  })

  it('passages carry Traditional Chinese translations (90%+ coverage until top-up)', () => {
    let withZh = 0
    let total = 0
    for (const t of texts) {
      for (const p of t.passages || []) {
        total++
        if (typeof p.zh === 'string' && p.zh.trim().length > 20) withZh++
      }
    }
    expect(total).toBeGreaterThan(10000)
    expect(withZh / total, `${withZh}/${total} passages translated`).toBeGreaterThan(0.85)
  })

  it('translated passages are in Chinese, not English', () => {
    let checked = 0
    for (const t of texts) {
      for (const p of t.passages || []) {
        if (typeof p.zh !== 'string' || p.zh.trim().length < 20) continue
        checked++
        const cjk = (p.zh.match(/[\u4e00-\u9fff]/g) || []).length
        expect(cjk / p.zh.length, `${t.id}:${p.id} translation must be mostly CJK`).toBeGreaterThan(0.3)
        if (checked > 200) return
      }
    }
    expect(checked).toBeGreaterThan(100)
  })

  it('excluded and merged traditions are a deliberate curatorial list, and every displayed tradition has a color', () => {
    const used = new Set(texts.map((t) => t.tradition))
    for (const tr of used) {
      if (POLICY.merges[tr]) {
        expect(POLICY.excluded.includes(tr), `${tr} cannot be both merged and excluded`).toBe(false)
        expect(TRADITIONS[POLICY.merges[tr]], `merged target of ${tr} has a color`).toBeTruthy()
      } else if (POLICY.excluded.includes(tr)) {
        continue
      } else {
        expect(TRADITIONS[tr], `${tr} has a color`).toBeTruthy()
      }
    }
    for (const tr of POLICY.excluded) {
      expect(TRADITIONS[tr], `excluded ${tr} must not have a color`).toBeUndefined()
    }
  })

  it('character roster references only real traditions', () => {
    expect(roster.length).toBeGreaterThanOrEqual(100)
    const trads = new Set(texts.map((t) => t.tradition))
    for (const c of roster) {
      expect(c.name, c.id).toBeTruthy()
      expect(c.tradition, c.id).toBeTruthy()
    }
  })
})
