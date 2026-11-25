import { beforeAll, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { texts, motifs, search, tokenize, detectMotifs, textById, buildQueryVector, related, graph, similarity, fingerprint, hydrateCorpusFromRaw } from '../src/lib/search.js'
import { POLICY } from '../src/data/traditionPolicy.js'
import { CHARACTERS, characterById, charactersOf, reply } from '../src/lib/mockChat.js'

const root = fileURLToPath(new URL('..', import.meta.url))

beforeAll(() => {
  const raw = JSON.parse(readFileSync(join(root, 'src/data/texts.json'), 'utf8'))
  hydrateCorpusFromRaw(raw)
}, 120000)

describe('search engine', () => {
  it('indexes the corpus after applying the curatorial policy', () => {
    expect(texts.length).toBe(5468)
    expect(texts.length).toBeLessThan(5494)
    expect(fingerprint()).toMatch(/^5468\|/)
  })

  it('never serves a tradition the policy excludes', () => {
    for (const t of texts) {
      expect(POLICY.excluded.includes(t.tradition), `${t.id} (${t.tradition}) must be filtered out`).toBe(false)
      expect(Array.isArray(t.passages) && t.passages.length > 0, `${t.id} needs passages`).toBe(true)
      expect(t.title?.en, `${t.id} needs a title`).toBeTruthy()
      expect(typeof t.lat === 'number' && typeof t.lon === 'number', `${t.id} needs coordinates`).toBe(true)
    }
  })

  it('tokenizes into lowercase stems', () => {
    expect(tokenize('The Raven Steals the Light!')).toEqual(expect.arrayContaining(['raven', 'steal', 'light']))
  })

  it('keyword search ranks known terms first', () => {
    const r = search('trickster', 'keyword')
    expect(r.length).toBeGreaterThan(0)
    const ids = r.slice(0, 10).map((x) => x.text.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('results explain why they matched', () => {
    const r = search('flood myth', 'keyword')
    expect(r.length).toBeGreaterThan(0)
    for (const x of r.slice(0, 3)) {
      expect(x.matched.length + x.shared.length, `${x.text.id} explains itself`).toBeGreaterThan(0)
    }
  })

  it('applies the strength bands consistently', () => {
    for (const x of search('creation of the world', 'keyword')) {
      if (x.abs >= 0.3) expect(x.strength).toBe('strong')
      else if (x.abs >= 0.18) expect(x.strength).toBe('related')
      else expect(x.strength).toBe('possible')
    }
  })

  it('Chinese queries reach the translated stories', () => {
    // 洪水 = flood; the zh translations make Chinese search work end-to-end
    const hits = search('洪水', 'keyword')
    expect(hits.length).toBeGreaterThan(0)
    const greek = search('flood', 'keyword').slice(0, 10).map((r) => r.text.id)
    const chinese = hits.slice(0, 10).map((r) => r.text.id)
    expect(chinese.some((id) => greek.includes(id))).toBe(true)
  })

  it('detects motif keywords in a query', () => {
    const hits = detectMotifs('a great flood drowns the world')
    expect(hits.length).toBeGreaterThan(0)
    for (const h of hits) expect(motifs.some((m) => m.id === h)).toBe(true)
  })

  it('builds a query vector for known vocabulary', () => {
    expect(buildQueryVector('raven light', 'keyword')).toBeDefined()
  })

  it('related() only returns texts that exist', () => {
    for (const n of related(texts[0].id, 5)) expect(textById.has(n.text.id)).toBe(true)
  })

  it('graph() keeps every edge inside the corpus at any threshold', () => {
    for (const th of [0.3, 0.5, 0.8]) {
      const g = graph(th)
      for (const e of g.links) {
        expect(textById.has(e.source)).toBe(true)
        expect(textById.has(e.target)).toBe(true)
      }
    }
  })

  it('similarity() is symmetric', () => {
    const [a, b] = texts.slice(0, 2)
    expect(similarity(a.id, b.id)).toBeCloseTo(similarity(b.id, a.id), 6)
  })

  it('stems plurals so "apples" and "apple" find the same texts', () => {
    // greek-apollodorus-apples-hesperides contains the plural "apples"; a
    // singular "apple" query must still reach it (it did not before the
    // stemmer fix — tester-reported).
    const single = search('apple', 'keyword').slice(0, 10).map((r) => r.text.id)
    const plural = search('apples', 'keyword').slice(0, 10).map((r) => r.text.id)
    expect(single).toContain('greek-apollodorus-apples-hesperides')
    expect(plural).toContain('greek-apollodorus-apples-hesperides')
  })

  it('matched terms display real words, not stems', () => {
    for (const r of search('someone steals apples', 'keyword')) {
      for (const m of r.matched) {
        expect(m.endsWith('appl')).toBe(false)
        expect(m).not.toBe('steal')
      }
    }
  })

  it('Greek and Roman names resolve to the same stories', () => {
    const g = new Set(search('hercules fights the lion', 'keyword').slice(0, 8).map((r) => r.text.id))
    const k = new Set(search('heracles fights the lion', 'keyword').slice(0, 8).map((r) => r.text.id))
    const overlap = [...g].filter((id) => k.has(id))
    expect(overlap.length).toBeGreaterThan(0)
  })

  it('fighting a lion surfaces the Nemean lion story', () => {
    const hits = search('fighting a lion', 'keyword').slice(0, 8).map((r) => r.text)
    const titles = hits.map((t) => (t.title.en + ' ' + t.summary.en).toLowerCase())
    expect(titles.some((x) => /nemean|lion/.test(x))).toBe(true)
  })

  it('searches the content of a conversational request, not the filler', () => {
    const r = search('show me stories about a trickster', 'keyword')
    expect(r.length).toBeGreaterThan(0)
    for (const x of r) expect(x.matched).not.toContain('show')
  })

  it('excludes negated wording instead of matching it harder', () => {
    // "without a boat" must behave as an exclusion, not as an extra keyword
    const r = search('flood stories without a boat', 'keyword')
    expect(r.length).toBeGreaterThan(0)
    for (const x of r) expect(x.matched).not.toContain('boat')
    const withBoat = search('flood stories with a boat', 'keyword')
    expect(withBoat.some((x) => x.matched.includes('boat'))).toBe(true)
  })
})

describe('character chat (offline fallback path)', () => {
  const fakeL = (dict) => dict.en

  it('has a tiered roster of 100+ fictional figures', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(100)
    for (const c of CHARACTERS) expect(c.tradition).toBeTruthy()
  })

  it('excludes the traditions the curatorial policy excludes', () => {
    for (const c of CHARACTERS) {
      expect(POLICY.excluded.includes(c.tradition), `${c.id} (${c.tradition}) must not be offered`).toBe(false)
    }
  })

  it('resolves characters by id and groups them by tradition', () => {
    const c = CHARACTERS[0]
    expect(characterById(c.id)?.id).toBe(c.id)
    expect(charactersOf(c.tradition).length).toBeGreaterThan(0)
  })

  it('mock reply stays fictional with no false live-source claim', () => {
    const c = CHARACTERS[0]
    const out = reply(c.id, 'scholarly', 'How did the world begin?', fakeL)
    expect(out.text.length).toBeGreaterThan(0)
    expect(out.source ?? 'mock').not.toBe('live')
  })
})
