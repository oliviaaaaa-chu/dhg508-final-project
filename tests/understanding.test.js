import { beforeAll, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { understand, splitClauses } from '../src/lib/understand.js'
import { texts, hydrateCorpusFromRaw } from '../src/lib/search.js'

const root = fileURLToPath(new URL('..', import.meta.url))

beforeAll(() => {
  // understand() itself is model-free, but search.js must still hydrate so
  // the tradition-detection assertions run against the served corpus.
  const raw = JSON.parse(readFileSync(join(root, 'src/data/texts.json'), 'utf8'))
  hydrateCorpusFromRaw(raw)
}, 120000)

describe('query understanding — conversational scaffolding', () => {
  it('strips leading filler and framing from natural-language requests', () => {
    const u = understand('Can you show me any stories about a trickster who steals fire?')
    expect(u.core.toLowerCase()).toBe('a trickster who steals fire?')
    expect(u.removedFiller).toContain('can you show me')
    expect(u.removedFiller).toContain('any')
    expect(u.removedFiller).toContain('stories about')
  })

  it('strips Chinese scaffolding (我想找關於…的故事)', () => {
    const u = understand('我想找關於大洪水的故事')
    expect(u.core).toContain('大洪水')
    expect(u.core).not.toContain('的故事')
    expect(u.core).not.toContain('我想找')
  })

  it('does not damage content that merely looks like a request', () => {
    // "how the raven stole the light" is a story description, not a question
    const c = understand('how the raven stole the light')
    expect(c.question).toBe(false)
    expect(c.core.toLowerCase()).toBe('how the raven stole the light')
    // "finds" is narrative content, not a command
    const f = understand('a hero finds a magic sword under the sea')
    expect(f.core.toLowerCase()).toContain('finds a magic sword')
  })

  it('recognizes question scaffolding only with a following auxiliary', () => {
    const q = understand('Why does the world end in fire?')
    expect(q.question).toBe(true)
    expect(q.core.toLowerCase()).toBe('the world end in fire?')
  })

  it('handles empty input safely', () => {
    const u = understand('')
    expect(u.core).toBe('')
    expect(u.motifs.literal).toEqual([])
    expect(u.beats).toBe(0)
    expect(u.negated.motifs).toEqual([])
  })
})

describe('query understanding — negation', () => {
  it('excludes negated wording instead of matching it harder', () => {
    const u = understand('flood stories without a boat')
    expect(u.negated.terms).toContain('boat')
    expect(u.core.toLowerCase()).not.toContain('boat')
    expect(u.motifs.literal.map((m) => m.id)).toContain('flood')
  })

  it('excludes negated motifs', () => {
    const u = understand('creation stories, not a flood')
    expect(u.negated.motifs.map((m) => m.id)).toContain('flood')
    expect(u.motifs.literal.map((m) => m.id)).toContain('creation-chaos')
    expect(u.core.toLowerCase()).not.toContain('flood')
  })

  it('honours Chinese negation (沒有 / 不要)', () => {
    const u = understand('不要有大洪水的創世故事')
    expect(u.negated.motifs.map((m) => m.id)).toContain('flood')
    expect(u.core).toContain('創世')
    expect(u.core).not.toContain('洪水')
  })

  it('treats idioms like "not only" as content, not exclusion', () => {
    const u = understand('a trickster who not only steals fire but also fools the guards')
    expect(u.negated.motifs).toEqual([])
    expect(u.core.toLowerCase()).toContain('steals fire')
  })

  it('does not misread names like Noah as the negator "no"', () => {
    const u = understand('Noah builds an ark before the great rain')
    expect(u.negated.terms).toEqual([])
    expect(u.negated.motifs).toEqual([])
  })
})

describe('query understanding — traditions', () => {
  it('detects mentioned traditions in English', () => {
    expect(understand('a Greek hero who steals fire').traditions.map((t) => t.id)).toContain('greek')
    expect(understand('Sumerian flood tablet').traditions.map((t) => t.id)).toContain('mesopotamian')
  })

  it('detects mentioned traditions in Traditional Chinese', () => {
    expect(understand('北歐神話中太陽被困').traditions.map((t) => t.id)).toContain('norse')
    expect(understand('希臘諸神的故事').traditions.map((t) => t.id)).toContain('greek')
  })

  it('never reports a tradition outside the served corpus', () => {
    for (const t of understand('persian avesta gilgamesh norse').traditions) {
      expect(texts.some((x) => x.tradition === t.id)).toBe(true)
    }
  })
})

describe('query understanding — story beats', () => {
  it('splits a pasted narrative into sentence beats', () => {
    const u = understand('A great flood drowns the world. One man builds a boat. He survives and founds a new people.')
    expect(u.beats).toBe(3)
  })

  it('splits Chinese narratives on 。', () => {
    const u = understand('大洪水毀滅世界。僅一人造舟。他倖存了下來。')
    expect(u.beats).toBe(3)
  })

  it('splits very long unpunctuated prose instead of truncating it', () => {
    const long = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ')
    const parts = splitClauses(long)
    expect(parts.length).toBeGreaterThan(1)
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(301)
  })

  it('caps the number of beats for the embedding pass', () => {
    const many = Array.from({ length: 30 }, (_, i) => `Beat number ${i}.`).join(' ')
    expect(splitClauses(many).length).toBeLessThanOrEqual(16)
  })
})

describe('query understanding — motif recognition from wording', () => {
  it('recognizes exact motif keywords in the cleaned content', () => {
    const u = understand('show me stories about a son who kills his own father')
    expect(u.motifs.literal.map((m) => m.id)).toContain('patricide')
  })

  it('infers motifs from wording when no exact keyword appears', () => {
    // "land of the dead" is present in stems ("land", "dead") but not
    // verbatim as the keyword phrase — the implied tier must catch it.
    const u = understand('a living man travels into the land where the dead dwell, seeking his lost wife')
    expect(u.motifs.implied.map((m) => m.id)).toContain('descent-underworld')
  })

  it('never recognizes a negated concept as wanted', () => {
    const u = understand('flood myths without a serpent')
    const ids = u.motifs.literal.map((m) => m.id).concat(u.motifs.implied.map((m) => m.id))
    expect(ids).not.toContain('world-serpent')
    expect(u.negated.terms).toContain('serpent')
  })
})
