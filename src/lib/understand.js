// Natural-language query understanding for Search & Compare.
//
// Visitors do not type keywords, they type requests — "can you show me any
// greek stories about a trickster who steals fire, but nobody gets
// punished". Before anything is searched, the request is parsed
// deterministically (offline, instant, no model):
//
//   1. conversational scaffolding is stripped ("show me", "stories about",
//      我想找……的故事) so the *content* is what gets embedded, not the
//      politeness around it;
//   2. negation is honoured — "flood stories without a boat" excludes
//      boat-carrying texts instead of matching the word "boat" harder;
//   3. mentioned traditions are detected ("greek", "sumerian", 北歐);
//   4. the input is split into story beats (clauses) so a long pasted
//      narrative is compared event by event instead of being truncated;
//   5. motifs are recognized from the wording — both exact keyword hits
//      and "implied" concepts (two or more motif keyword stems present).
//
// Meaning-level motif detection ("a god shaped people from mud and
// breathed life into them" → clay-humans, no exact keyword) is added by the
// semantic engine in search.js once the MiniLM model is loaded. This module
// stays model-free so the UI can show an instant reading of the input and
// the unit tests stay deterministic.

import motifsRaw from '../data/motifs.json'
import { TRADITIONS } from './colors.js'

const motifs = motifsRaw

// ---------------------------------------------------------------------------
// 1. Conversational scaffolding (stripped before anything is searched)
// ---------------------------------------------------------------------------

// Phrases anchored at the very start of the request, longest first.
const LEADING_FILLER = [
  'could you please', 'would you please', 'can you please', 'could you kindly',
  'i was wondering if you have', 'wondering if you have', 'i was wondering if',
  'i am looking for', "i'm looking for", 'i was looking for', 'i am searching for',
  "i'm searching for", 'i am trying to find', "i'm trying to find",
  'i would like to see', 'i would like to find', "i'd like to find", "i'd like to see",
  'i would like', "i'd like", 'i want to find', 'i want to see', 'i want', 'i need',
  'i am after', "i'm after", 'i look for', 'i was wondering',
  'please can you', 'please could you', 'please show me', 'please find me', 'please',
  'can you show me', 'could you show me', 'can you find me', 'could you find me',
  'can you', 'could you', 'would you', 'will you', 'hello', 'hey', 'hi',
  'show me', 'find me', 'help me find', 'help me', 'give me', 'bring me',
  'tell me about', 'tell me', 'do you have', 'are there', 'is there',
  'looking for', 'search for', 'look up', 'look for', 'try to find', 'seek',
  'show', 'find', 'look', 'search', 'list', 'any', 'some',
]
// Sort longest-first so "i am looking for" is stripped before "i am".
const LEADING = [...LEADING_FILLER].sort((a, b) => b.length - a.length)

// Framing phrases removed anywhere in the request (word boundaries, EN).
const CONNECTOR_FILLER = [
  'stories about', 'stories where', 'stories in which', 'stories that tell',
  'stories telling', 'stories of',
  'story about', 'story where', 'story in which', 'story that tells', 'story of',
  'myths about', 'myths where', 'myths in which', 'myths that tell', 'myths of',
  'myth about', 'myth where', 'myth telling', 'myth of',
  'tales about', 'tales where', 'tales of', 'tale about', 'tale where', 'tale of',
  'legends about', 'legends of', 'legend about', 'legend of',
  'texts about', 'text about', 'passages about', 'passage about', 'records about',
  'records of', 'examples of', 'example of', 'anything about', 'something about',
  'stories similar to', 'texts similar to', 'similar to',
  'the myth of', 'the story of', 'the legend of', 'the tale of',
  'in mythology', 'in myths', 'in folklore', 'in the tradition', 'in tradition',
]
const CONNECTORS = CONNECTOR_FILLER.map(
  (f) => new RegExp(`\\b${f.split(/\s+/).map(escapeRe).join('\\s+')}\\b`, 'gi')
)

// Chinese scaffolding (no word boundaries needed for CJK).
const ZH_FILLER = [
  '請幫我找', '請幫忙找', '幫我找一下', '幫我找', '幫我查', '幫找', '幫幫忙',
  '請找出', '請查找', '請搜尋', '請搜索', '請介紹', '請告訴我',
  '我想找找看', '我想找', '我要找', '我想看', '我想了解', '想找找', '想找', '要找',
  '找一下', '找出', '查找', '搜尋一下', '搜尋', '搜索', '檢索',
  '有沒有關於', '有沒有', '是否存在', '哪裡有', '哪些',
  '的故事', '的神話', '的傳說', '關於', '有關', '介紹一下', '介紹', '告訴我',
  '跟我說說', '說說', '神話故事', '神話中', '神話裡', '傳說中', '故事裡', '故事中',
  '一些', '任何',
]

// Question scaffolding: "(why|how|what|…) (do|does|is|…) the real question".
// Only stripped when a following auxiliary confirms this is a question, so
// content like "how the raven stole the light" keeps its "how".
const QUESTION_RE = /^(why|how|what|which|who|where|when)\s+(do|does|did|is|are|was|were|can|could|should|would|will|has|have|had)\b\s*/i
const ZH_QUESTION = /^(為什麼|為何|何以|如何才能|如何|怎麼|什麼是|何謂|哪些|誰是|哪個)/

// ---------------------------------------------------------------------------
// 2. Negation — "without a boat", "not a flood", 沒有洪水
// ---------------------------------------------------------------------------

// Longest alternations first: JS regex alternation is ordered.
const NEG_OPEN =
  /\b(without|excluding|excepting|except|rather than|instead of|free of|avoiding|avoided|avoids|avoid|nobody|never|neither|nor|not|no)\b/gi

// "not"/"no" forms that are idioms, not exclusions ("not only … but also").
const NEG_IDIOMS = [
  'not only', 'not just', 'not every', 'not exactly', 'not really', 'not simply',
  'no matter', 'no longer', 'no one', 'no body of', 'none of',
]

// A negated span ends at these words (they are kept, not consumed).
const NEG_BOUNDARY = new Set([
  'and', 'or', 'but', 'yet', 'so', 'then', 'also', 'because', 'while', 'with',
  'who', 'which', 'that', 'where', 'when', 'instead', 'rather', 'else', 'after',
  'before', 'until', 'since', 'although', 'though', 'however', 'there', 'their',
  'his', 'her', 'its', 'he', 'she', 'they', 'it', 'please', 'than',
])

// Words that must never become "excluded" terms themselves (containers and
// glue words that would otherwise flood the exclusion list).
const NEG_TERM_STOP = new Set([
  'stor', 'story', 'myth', 'tale', 'legend', 'text', 'passage', 'record',
  'example', 'one', 'any', 'all', 'get', 'got', 'have', 'has', 'had', 'be',
  'been', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'make', 'makes',
  'made', 'happen', 'happens', 'occur', 'occurs', 'involve', 'involves',
  'thing', 'things', 'stuff', 'kind', 'sort', 'please', 'me', 'us', 'them',
])

const ZH_NEG_OPEN = ['沒有', '不含', '而非', '並非', '不要', '排除', '別要', '沒']
const ZH_NEG_STOP_CHARS = '而|但|和|與|或|及|然後|的話|、|，|。|！|？|；|：'

// ---------------------------------------------------------------------------
// 3. Traditions mentioned in the request
// ---------------------------------------------------------------------------

const TRAD_ALIASES = {
  greek: ['greek', 'greece', 'grecian', 'hellenic', 'athenian', 'spartan', '希臘', '希腊', '古希臘'],
  norse: ['norse', 'scandinavian', 'icelandic', 'viking', 'norwegian', 'eddic', '北歐', '北欧', '維京', '维京'],
  hindu: ['hindu', 'hinduism', 'indian', 'india', 'vedic', 'sanskrit', '印度'],
  chinese: ['chinese', 'china', '中國', '中国', '漢族', '汉族'],
  maori: ['maori', 'māori', '毛利'],
  yoruba: ['yoruba', 'orisha', '約魯巴', '尤鲁巴'],
  japanese: ['japanese', 'japan', 'shinto', '日本', '神道'],
  maya: ['maya', 'mayan', "k'iche", 'popol vuh', '馬雅', '玛雅'],
  egyptian: ['egyptian', 'egypt', 'pharaonic', '埃及'],
  hebrew: ['hebrew', 'jewish', 'judaism', 'israelite', 'torah', 'old testament', '猶太', '希伯來', '舊約'],
  christian: ['christian', 'christianity', 'biblical', 'bible', 'new testament', 'gospel', '基督', '聖經', '圣经', '新約'],
  mesopotamian: ['mesopotamian', 'mesopotamia', 'babylonian', 'babylon', 'sumerian', 'sumer', 'akkadian', 'assyrian', 'gilgamesh', '美索不達米亞', '巴比倫', '蘇美爾'],
  slavic: ['slavic', 'slav', 'russian', 'ukrainian', 'polish', '斯拉夫', '俄羅斯'],
  celtic: ['celtic', 'irish', 'scottish', 'welsh', 'ulster', '凱爾特', '愛爾蘭'],
  buddhist: ['buddhist', 'buddhism', 'buddha', 'pali', '佛教', '佛陀', '菩薩'],
  korean: ['korean', 'korea', '韓國', '韩国', '朝鮮', '朝鲜'],
  akan: ['akan', 'ashanti', 'ghana', '阿肯'],
  hawaiian: ['hawaiian', 'hawaii', '夏威夷'],
  inuit: ['inuit', 'eskimo', '因紐特', '因纽特'],
  islamic: ['islamic', 'islam', 'muslim', 'quran', "qur'an", 'koran', '伊斯蘭', '穆斯林', '古蘭經', '古兰经'],
  afroatlantic: ['afro-atlantic', 'african diaspora', 'vodou', 'voodoo', 'hoodoo', 'haitian'],
  taoist: ['taoist', 'taoism', 'daoist', 'daoism', '道教', '道家'],
  polynesian: ['polynesian', 'polynesia', 'tahiti', 'samoan', '玻里尼西亞'],
  melanesian: ['melanesian', 'melanesia', 'papuan', '美拉尼西亞'],
  indonesian: ['indonesian', 'indonesia', 'javanese', 'balinese', '印尼', '爪哇'],
  philippine: ['philippine', 'filipino', 'philippines', '菲律賓'],
  inca: ['inca', 'andean', 'peru', '印加'],
  amazonian: ['amazonian', 'amazon', '亞馬遜', '亚马逊'],
  baltic: ['baltic', 'lithuanian', 'latvian', 'prussian', '波羅的海'],
  san: ['san people', 'bushman', 'khoisan', 'kalahari', '桑人'],
  woodland: ['iroquois', 'ojibwe', 'algonquin', 'anishinaabe', 'northeast woodlands', '林地'],
  persian: ['persian', 'persia', 'iranian', 'iran', 'zoroastrian', 'avesta', '波斯', '祆教'],
  tibetan: ['tibetan', 'tibet', '西藏', '藏族'],
  plateau: ['columbia plateau', 'nez perce', 'okanagan', 'colville'],
}
// Only traditions that actually exist in the served corpus can be detected.
const TRAD_MATCHERS = Object.entries(TRAD_ALIASES)
  .filter(([key]) => TRADITIONS[key])
  .map(([key, aliases]) => {
    const en = aliases.filter((a) => !/[\u4e00-\u9fff]/.test(a))
    const zh = aliases.filter((a) => /[\u4e00-\u9fff]/.test(a))
    const re = en.length ? new RegExp(`\\b(?:${en.map(escapeRe).join('|')})\\b`, 'i') : null
    return { key, zh, re }
  })

// ---------------------------------------------------------------------------
// 4. Story beats — clause splitting for long pasted narratives
// ---------------------------------------------------------------------------

const MAX_BEATS = 16

export function splitClauses(text) {
  const clean = text.trim()
  if (!clean) return []
  let parts = clean
    .split(/[.!?;。！？；…]+/u)
    .map((s) => s.trim())
    .filter(Boolean)
  // A single unpunctuated run of prose is split on commas so a long paste
  // without sentence punctuation is still compared beat by beat.
  parts = parts.flatMap((s) =>
    s.length > 220 ? s.split(/[,，;；:、]+/u).map((x) => x.trim()).filter(Boolean) : [s]
  )
  // Anything still enormous (one giant comma-less sentence) is chunked on
  // word boundaries so the end of the story is not silently dropped.
  parts = parts.flatMap((s) => {
    if (s.length <= 600) return [s]
    const out = []
    let buf = ''
    for (const w of s.split(/\s+/)) {
      if ((buf + ' ' + w).length > 300 && buf) {
        out.push(buf)
        buf = w
      } else buf = buf ? buf + ' ' + w : w
    }
    if (buf) out.push(buf)
    return out
  })
  return parts.slice(0, MAX_BEATS)
}

// ---------------------------------------------------------------------------
// Tokenizer — mirrors tokenize()/stem() in search.js. Kept local (not
// imported) so understand.js has no dependency cycle with search.js; the
// engine tests pin both sides to the same behaviour.
// ---------------------------------------------------------------------------

const MINI_STOP = new Set(
  ('the a an and of to in on at for from with by as is are was were be been ' +
    'being it its his her their they them he she we you i that this these ' +
    'those not no nor but or if then than so such into over under out up ' +
    'down about against between through during before after above below all ' +
    'any both each few more most other some only own same too very can will ' +
    'just should now when where which who whom why how once here there upon ' +
    'while also thus yet').split(' ')
)

function stem(w) {
  if (w.length <= 4) return w
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y'
  if (/(?:ing|ed)$/.test(w)) return w.replace(/(?:ing|ed)$/, '')
  if (/(?:[sxz]|ch|sh)es$/.test(w)) return w.slice(0, -2)
  if (/s$/.test(w)) return w.slice(0, -1)
  return w
}

function normTokens(str) {
  const out = []
  const words = str.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  for (const w of words) {
    if (/[\u4e00-\u9fff]/.test(w)) {
      out.push(w)
      for (let i = 0; i < w.length - 1; i++) out.push(w.slice(i, i + 2))
    } else {
      if (MINI_STOP.has(w)) continue
      out.push(stem(w))
    }
  }
  return out
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\']/g, '\\$&')
}

// ---------------------------------------------------------------------------
// 5. Motif recognition from wording
// ---------------------------------------------------------------------------

// Exact keyword hits in the (cleaned) content — same substring logic the
// old detectMotifs() used, but scoped to the core and with evidence.
export function literalMotifs(textLower) {
  const out = []
  if (!textLower) return out
  for (const m of motifs) {
    for (const k of m.keywords) {
      if (textLower.includes(k.toLowerCase())) {
        out.push({ id: m.id, matched: k })
        break
      }
    }
  }
  return out
}

// Implied concepts: no single keyword appears verbatim, but two or more
// keyword stems do — "the day was snared and the light grew short" reads
// as sun-capture even though no keyword phrase is present.
export function impliedMotifs(coreTokens, alreadyLiteral) {
  const seen = new Set(alreadyLiteral.map((x) => x.id))
  const tokenSet = new Set(coreTokens)
  const out = []
  for (const m of motifs) {
    if (seen.has(m.id)) continue
    let hits = 0
    const evidence = []
    for (const k of m.keywords) {
      if (/[\u4e00-\u9fff]/.test(k)) continue // CJK keywords are literal-only
      const parts = k.toLowerCase().split(/\s+/).filter((p) => p.length > 2 && !MINI_STOP.has(p))
      if (!parts.length) continue
      if (parts.every((p) => tokenSet.has(stem(p)))) {
        // a full multi-word phrase ("land of the dead") is strong evidence
        // on its own, even when no single keyword appears verbatim
        hits += parts.length > 1 ? 2 : 1
        evidence.push(k)
      }
    }
    if (hits >= 2) out.push({ id: m.id, matched: evidence.slice(0, 3) })
  }
  return out
}

// ---------------------------------------------------------------------------
// The understanding pass
// ---------------------------------------------------------------------------

function stripLeadingFiller(work, removed) {
  let changed = true
  while (changed) {
    changed = false
    const low = work.toLowerCase()
    for (const f of LEADING) {
      if (low.startsWith(f)) {
        const after = work.slice(f.length)
        // must end at a word boundary (space, punctuation or end of string)
        if (after.length === 0 || /[\s.,;:!?'"“”…]/.test(after[0])) {
          work = after.replace(/^[\s.,;:!?'"“”…]+/, '')
          removed.push(f)
          changed = true
          break
        }
      }
    }
  }
  return work
}

function stripConnectorFiller(work, removed) {
  for (const re of CONNECTORS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(work))) {
      removed.push(m[0].toLowerCase())
      work = work.slice(0, m.index) + ' ' + work.slice(m.index + m[0].length)
      re.lastIndex = m.index + 1
    }
  }
  for (const f of ZH_FILLER) {
    if (work.includes(f)) {
      removed.push(f)
      work = work.split(f).join(' ')
    }
  }
  return work.replace(/\s+/g, ' ').trim()
}

function extractNegation(work) {
  const removedRanges = []
  const motifsNeg = new Map()
  const terms = []
  const termStems = new Set()

  const recordSpan = (spanText) => {
    if (!spanText.trim()) return
    const hits = literalMotifs(spanText.toLowerCase())
    for (const h of hits) if (!motifsNeg.has(h.id)) motifsNeg.set(h.id, h)
    for (const tk of normTokens(spanText)) {
      if (tk.length <= 2 || MINI_STOP.has(tk) || NEG_TERM_STOP.has(tk)) continue
      const display = spanText.match(new RegExp(`\\b${escapeRe(tk)}\\w*`, 'i'))?.[0] || tk
      if (!terms.includes(display)) terms.push(display)
      termStems.add(tk)
    }
  }

  // ---- English negation ----
  const re = new RegExp(NEG_OPEN.source, 'gi')
  let m
  while ((m = re.exec(work))) {
    const neg = m[0].toLowerCase()
    const pos = m.index
    const after = work.slice(pos + m[0].length)
    const afterTrim = after.replace(/^\s+/, '')
    const idiom = NEG_IDIOMS.find(
      (id) => id.startsWith(neg) && afterTrim.toLowerCase().startsWith(id.slice(neg.length).trim())
    )
    if (idiom) {
      // idiom, not an exclusion — skip past it
      const rem = idiom.slice(neg.length).trim()
      re.lastIndex = pos + m[0].length + (after.length - afterTrim.length) + rem.length
      continue
    }
    const words = after.split(/\s+/).filter(Boolean).slice(0, 6)
    let span = ''
    for (const w of words) {
      const bare = w.replace(/[.,;:!?'"“”…]+$/u, '')
      const low = bare.toLowerCase()
      if (NEG_BOUNDARY.has(low)) break
      span += (span ? ' ' : '') + w
      if (w !== bare) break // trailing punctuation closes the span
    }
    if (span.trim()) {
      const start = pos + m[0].length + (after.startsWith(' ') ? 1 : 0)
      const end = start + span.length
      removedRanges.push([pos, end])
      recordSpan(span)
    }
  }

  // ---- Chinese negation ----
  for (const neg of ZH_NEG_OPEN) {
    let idx = work.indexOf(neg)
    while (idx !== -1) {
      const after = work.slice(idx + neg.length)
      const stopRe = new RegExp(`(${ZH_NEG_STOP_CHARS})`)
      const cut = after.slice(0, 10).match(stopRe)
      const span = cut ? after.slice(0, cut.index) : after.slice(0, 4)
      if (span.trim()) {
        removedRanges.push([idx, idx + neg.length + span.length])
        recordSpan(span)
      }
      idx = work.indexOf(neg, idx + neg.length + span.length)
    }
  }

  // Remove spans from the content (right-to-left so offsets stay valid).
  removedRanges.sort((a, b) => b[0] - a[0])
  for (const [s, e] of removedRanges) work = work.slice(0, s) + ' ' + work.slice(e)
  return {
    work: work.replace(/\s+/g, ' ').trim(),
    motifs: [...motifsNeg.values()],
    terms,
    termStems: [...termStems],
  }
}

function detectTraditions(rawLower) {
  const out = []
  for (const { key, zh, re } of TRAD_MATCHERS) {
    const zhHit = zh.find((a) => rawLower.includes(a.toLowerCase()))
    const enHit = re ? re.exec(rawLower)?.[0] : null
    if (zhHit || enHit) out.push({ id: key, matched: enHit || zhHit })
  }
  return out
}

const EMPTY = {
  raw: '',
  core: '',
  removedFiller: [],
  question: false,
  traditions: [],
  negated: { motifs: [], terms: [], termStems: [] },
  motifs: { literal: [], implied: [], meaning: [] },
  beats: 0,
}

/**
 * Parse a visitor's natural-language request into structured intent.
 * Pure and synchronous — safe to call on every keystroke.
 */
export function understand(input) {
  const raw = typeof input === 'string' ? input.trim() : ''
  if (!raw) return { ...EMPTY, motifs: { literal: [], implied: [], meaning: [] }, negated: { motifs: [], terms: [], termStems: [] } }

  let work = raw
  const removedFiller = []

  work = stripLeadingFiller(work, removedFiller)

  // Question scaffolding (only with a following auxiliary — see above).
  let question = false
  const qm = QUESTION_RE.exec(work)
  if (qm) {
    work = work.slice(qm[0].length)
    removedFiller.push(qm[0].trim().toLowerCase())
    question = true
  }
  const zqm = ZH_QUESTION.exec(work)
  if (zqm) {
    work = work.slice(zqm[0].length)
    removedFiller.push(zqm[0])
    question = true
  }

  work = stripConnectorFiller(work, removedFiller)

  // Negation: spans are removed from the content before it is searched.
  const neg = extractNegation(work)
  work = neg.work

  const core = work.replace(/\s+/g, ' ').trim() || raw
  const coreLower = core.toLowerCase()
  const literal = literalMotifs(coreLower)
  const implied = impliedMotifs(normTokens(core), literal)
  const traditions = detectTraditions(raw.toLowerCase())
  const clauses = splitClauses(core)

  return {
    raw,
    core,
    clauses,
    removedFiller: [...new Set(removedFiller)],
    question,
    traditions,
    negated: { motifs: neg.motifs, terms: neg.terms, termStems: neg.termStems },
    motifs: { literal, implied, meaning: [] },
    beats: clauses.length,
  }
}

export { motifs }
