import { texts, motifById, detectMotifs, search } from './search.js'
import { TRADITIONS } from './colors.js'
import roster from '../data/characters.json'

export const CHARACTERS = Array.isArray(roster) ? roster : roster.characters
export const TRADITION_ORDER = Array.isArray(roster)
  ? Object.keys(TRADITIONS).map((slug) => ({ slug, tier: 1 }))
  : roster.traditions

export function characterById(id) {
  return CHARACTERS.find((c) => c.id === id)
}

export function charactersOf(tradition) {
  return CHARACTERS.filter((c) => c.tradition === tradition)
}

function collectCitations(motifIds) {
  const found = []
  for (const mid of motifIds) {
    for (const tx of texts) {
      if (tx.motifs.includes(mid)) found.push(tx)
    }
  }
  const unique = [...new Map(found.map((c) => [c.id, c])).values()]
  return unique.slice(0, 3)
}

// Retrieval for chat: by default a character draws ONLY from its own tradition.
// Cross-tradition material is allowed when the user asks for comparison or
// names another tradition. Exact motif-keyword matches are trusted
// (high/medium); otherwise fall back to TF-IDF semantic search (medium);
// nothing at all -> low.
const CROSS_RE =
  /compar|parallel|other tradition|other culture|across tradition|different tradition|other myth|other pantheon|worldwide|around the world|similarit|between tradition|contrast|elsewhere|foreign|outside your/i

function userAsksBeyondTradition(userText, character) {
  if (CROSS_RE.test(userText)) return true
  const lower = userText.toLowerCase()
  for (const [slug, tr] of Object.entries(TRADITIONS)) {
    if (slug === character.tradition) continue
    if (tr.en && lower.includes(tr.en.toLowerCase())) return true
    if (tr.zh && userText.includes(tr.zh)) return true
  }
  return false
}

function toHits(textsOrResults, semantic) {
  if (!semantic) {
    return textsOrResults.map((t) => ({ text: t, quote: t.passages[0].text }))
  }
  return textsOrResults.map((r) => ({ text: r.text, quote: r.best?.[0]?.raw || r.text.passages[0].text }))
}

function retrieveFor(userText, character) {
  const cross = userAsksBeyondTradition(userText, character)
  const motifIds = detectMotifs(userText)

  if (!cross) {
    const byMotif = collectCitations(motifIds).filter((t) => t.tradition === character.tradition)
    if (byMotif.length) {
      return { motifIds, cross, mode: 'motif', hits: toHits(byMotif) }
    }
    const rs = search(userText, 'semantic')
      .slice(0, 6)
      .filter((r) => r.text.tradition === character.tradition)
      .slice(0, 3)
    return { motifIds, cross, mode: rs.length ? 'semantic' : 'none', hits: toHits(rs, true) }
  }

  const byMotif = collectCitations(motifIds)
  if (byMotif.length) {
    return { motifIds, cross, mode: 'motif', hits: toHits(byMotif) }
  }
  const rs = search(userText, 'semantic').slice(0, 3)
  return { motifIds, cross, mode: rs.length ? 'semantic' : 'none', hits: toHits(rs, true) }
}

function confidenceFor(retrieval) {
  if (retrieval.mode === 'motif') return confidenceOf(retrieval.hits.length)
  if (retrieval.mode === 'semantic') return 'medium'
  return 'low'
}

function confidenceOf(n) {
  return n >= 2 ? 'high' : n === 1 ? 'medium' : 'low'
}

// Hand-written overrides for the two anchor characters kept from the original build.
const OVERRIDES = {
  odin: {
    scholarly: {
      en: (ctx) =>
        `Hm. ${ctx.motifList}. I paid for such knowledge — an eye, nine nights, my own spear. In this corpus the witnesses are ${ctx.count}: ${ctx.titles}. That is what the sources say, no more. My confidence: ${ctx.conf}.`,
      zh: (ctx) =>
        `哼。${ctx.motifList}。這樣的知識我付出過代價——一隻眼睛、九夜懸掛、自己的長矛。此語料中的見證者有${ctx.count}位：${ctx.titles}。文獻所言盡在於此，別無他話。我的信心：${ctx.conf}。`,
    },
    dramatic: {
      en: (ctx) =>
        `${ctx.motifList}? I know its taste. I traded for wisdom and hung for more, and everything that hangs learns what the wind says. Your ${ctx.titles} — I walked those roads before your peoples had names.`,
      zh: (ctx) =>
        `${ctx.motifList}？我知道它的滋味。我以眼換智、以身懸樹，凡懸掛者皆知風語。你的${ctx.titles}——在你們的族裔尚未得名之前，我已行過那些路。`,
    },
  },
  sunwukong: {
    scholarly: {
      en: (ctx) =>
        `Old Wukong reads the sources too, don't smirk. Your ${ctx.motifList} appears in ${ctx.count} tale(s) here: ${ctx.titles}. That's what the texts say — confidence ${ctx.conf} — and I only report what is written.`,
      zh: (ctx) =>
        `老孫也讀文獻的，別笑。你所說的${ctx.motifList}在此出現於${ctx.count}則故事：${ctx.titles}。文本是這麼說的——信心「${ctx.conf}」——我只照實報告。`,
    },
    dramatic: {
      en: (ctx) =>
        `HAH! ${ctx.motifList}? I was born of stone, robbed the dragon seas, erased my name from the ledger of the dead — and you ask me of ${ctx.motifList}? Your ${ctx.titles} are children's rhymes beside my five hundred years. Ask properly!`,
      zh: (ctx) =>
        `哈哈！${ctx.motifList}？老孫石頭裡蹦出來、鬧過龍宮、勾掉生死簿——你竟問我這個？你的${ctx.titles}在我五百年面前不過童謠。有本事問個像樣的！`,
    },
  },
}

// Archetype voice presets. Each archetype carries several variant templates so
// consecutive replies differ; the character's own quip is placed differently
// per variant (opening, closing, or embedded).
const ARCHETYPES = {
  authority: {
    scholarly: [
      {
        en: (ctx) =>
          `I answer within this corpus. ${ctx.motifList}: ${ctx.count} witness(es) here — ${ctx.titles}. Sovereignty means hearing all of them before speaking. Confidence: ${ctx.conf}.`,
        zh: (ctx) =>
          `我只在本語料範圍內作答。${ctx.motifList}：語料中的見證者有${ctx.count}位——${ctx.titles}。王者之義，在於先聽盡眾聲而後言。信心：${ctx.conf}。`,
      },
      {
        en: (ctx) =>
          `Ask the record, not the court: ${ctx.motifList} stands written in ${ctx.count} tale(s) — ${ctx.titles}. Rulings must rest on the archive, and this ruling rests on ${ctx.conf}.`,
        zh: (ctx) =>
          `去問語料，而非宮廷：${ctx.motifList}見錄於${ctx.count}則故事——${ctx.titles}。裁決須依檔案；此判所依者為「${ctx.conf}」。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” You ask of ${ctx.motifList}. Thrones see far: ${ctx.titles} — ${ctx.count} echo(es) under one crown. I have heard this song before, and I will hear it after you are dust.`,
        zh: (ctx) =>
          `「${ctx.q}」你問${ctx.motifList}。王座所見極遠：${ctx.titles}——同一王冠下的${ctx.count}聲迴響。此曲我早已聽過；待你化塵，我仍會聽見。`,
      },
      {
        en: (ctx) =>
          `${ctx.motifList} rolls past my throne like tribute. ${ctx.count} of these ${ctx.total} tales — ${ctx.titles} — bow in the same direction. “${ctx.q}”`,
        zh: (ctx) =>
          `${ctx.motifList}如貢禮般滾過王座。這${ctx.total}則故事中的${ctx.count}則——${ctx.titles}——朝同一方向低頭。「${ctx.q}」`,
      },
    ],
  },
  creator: {
    scholarly: [
      {
        en: (ctx) =>
          `In this corpus, ${ctx.motifList} appears in ${ctx.count} tale(s): ${ctx.titles}. I made many things; these are ones I recognize on sight. Confidence: ${ctx.conf}.`,
        zh: (ctx) =>
          `在本語料中，${ctx.motifList}見於${ctx.count}則故事：${ctx.titles}。我所造者甚多；這些我一眼便能認出。信心：${ctx.conf}。`,
      },
      {
        en: (ctx) =>
          `I keep records of making: ${ctx.motifList} is entered ${ctx.count} time(s) — ${ctx.titles}. Weigh them together; my confidence in that reading is ${ctx.conf}.`,
        zh: (ctx) =>
          `我存有造物的記錄：${ctx.motifList}入錄${ctx.count}則——${ctx.titles}。合而權衡之；我對此解讀的信心為「${ctx.conf}」。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” ${ctx.motifList} passed through my hands before it had a name. Your ${ctx.titles} — ${ctx.count} seed(s) — I recognize at once. Some things carry their maker's grip-marks.`,
        zh: (ctx) =>
          `「${ctx.q}」${ctx.motifList}在無名之時便已經我之手。你的${ctx.titles}——${ctx.count}顆種子——我一眼便認得。有些事物始終帶著造物者的指痕。`,
      },
      {
        en: (ctx) =>
          `Before ${ctx.motifList} had a name, I had already handled it. Your ${ctx.titles} are ${ctx.count} fragments of one thing I remember whole. “${ctx.q}”`,
        zh: (ctx) =>
          `在${ctx.motifList}有名之前，我已親手觸過它。你的${ctx.titles}是${ctx.count}枚碎片；我記得它完整時的模樣。「${ctx.q}」`,
      },
    ],
  },
  trickster: {
    scholarly: [
      {
        en: (ctx) =>
          `Fine — the sources first. ${ctx.motifList} shows up in ${ctx.count} tale(s) here: ${ctx.titles}. That is what is written — confidence ${ctx.conf} — and even I do not tamper with the ledger.`,
        zh: (ctx) =>
          `好——先看文獻。${ctx.motifList}在此出現於${ctx.count}則故事：${ctx.titles}。文本如此記載——信心「${ctx.conf}」——連我也不會竄改帳目。`,
      },
      {
        en: (ctx) =>
          `Records before swagger: ${ctx.motifList} turns up in ${ctx.count} tale(s) — ${ctx.titles}. Confidence runs ${ctx.conf}; even I cannot argue with the ledger.`,
        zh: (ctx) =>
          `先講文獻，再講威風：${ctx.motifList}出現於${ctx.count}則故事——${ctx.titles}。信心「${ctx.conf}」，連我也賴不掉帳。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” ${ctx.motifList}? I know that game — I invented its three best cheats. Your ${ctx.titles} (${ctx.count}) play it exactly as I taught, though no one ever admits it.`,
        zh: (ctx) =>
          `「${ctx.q}」${ctx.motifList}？我懂那場局——其中三招最好的騙術還是我發明的。你的${ctx.titles}（${ctx.count}則）照我教的玩法在演，只是無人肯認。`,
      },
      {
        en: (ctx) =>
          `Nobody asks about ${ctx.motifList} politely. Your ${ctx.titles} — ${ctx.count} of them — tell it wrong, mostly. Want the version they left out? “${ctx.q}”`,
        zh: (ctx) =>
          `沒人客氣地問過${ctx.motifList}。你的${ctx.titles}——${ctx.count}則——多半都講錯了。想聽被刪掉的那一版嗎？「${ctx.q}」`,
      },
    ],
  },
  hero: {
    scholarly: [
      {
        en: (ctx) =>
          `From the corpus, not the campfire: ${ctx.motifList} in ${ctx.count} tale(s) — ${ctx.titles}. Confidence ${ctx.conf}. I report what the texts say; deeds I leave to the living.`,
        zh: (ctx) =>
          `取自語料，而非營火傳說：${ctx.motifList}見於${ctx.count}則故事——${ctx.titles}。信心「${ctx.conf}」。我只報告文本所言；功業留給生者。`,
      },
      {
        en: (ctx) =>
          `Straight answer: the corpus holds ${ctx.count} tale(s) of ${ctx.motifList} — ${ctx.titles}. Confidence ${ctx.conf}. I trust deeds, but I report texts.`,
        zh: (ctx) =>
          `直說：語料中${ctx.motifList}共${ctx.count}則——${ctx.titles}。信心「${ctx.conf}」。我信功業，但只報文本。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” ${ctx.motifList} is the sort of thing one meets on the road, usually armed. Your ${ctx.titles} — ${ctx.count} — smell of sweat and cliff-edges. I have stood where they stood.`,
        zh: (ctx) =>
          `「${ctx.q}」${ctx.motifList}正是路上會遇到的東西，而且多半帶著兵器。你的${ctx.titles}——${ctx.count}則——聞得出汗水與斷崖的氣味。他們站過的地方，我站過。`,
      },
      {
        en: (ctx) =>
          `${ctx.motifList}? Stand behind me and look. ${ctx.titles} — those ${ctx.count} — walked the road with the wind in their teeth, as I have. “${ctx.q}”`,
        zh: (ctx) =>
          `${ctx.motifList}？站到我身後來看。${ctx.titles}——那${ctx.count}則——迎著風走過那條路，我也走過。「${ctx.q}」`,
      },
    ],
  },
  liminal: {
    scholarly: [
      {
        en: (ctx) =>
          `Within this corpus: ${ctx.motifList} — ${ctx.count} witness(es): ${ctx.titles}. I keep the door; these are the names written on it. Confidence: ${ctx.conf}.`,
        zh: (ctx) =>
          `在本語料範圍內：${ctx.motifList}——見證者${ctx.count}位：${ctx.titles}。我守著這扇門；這些是門上寫下的名字。信心：${ctx.conf}。`,
      },
      {
        en: (ctx) =>
          `The gate is patient. ${ctx.motifList}: ${ctx.count} tale(s) recorded — ${ctx.titles}. I hold the door open; my confidence in this reading is ${ctx.conf}.`,
        zh: (ctx) =>
          `門是耐心的。${ctx.motifList}：錄得${ctx.count}則——${ctx.titles}。我為你留著門；信心為「${ctx.conf}」。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” ${ctx.motifList} crosses my threshold often. I have watched ${ctx.titles} arrive — ${ctx.count} door(s) — and none left the same. In time, you will understand.`,
        zh: (ctx) =>
          `「${ctx.q}」${ctx.motifList}常跨過我的門檻。我目送過${ctx.titles}到來——${ctx.count}扇門——無一原樣離開。時候到了，你自會明白。`,
      },
      {
        en: (ctx) =>
          `You crossed a threshold asking of ${ctx.motifList}. ${ctx.count} door(s) — ${ctx.titles} — and each swung on the same hinge. Few who enter ask twice. “${ctx.q}”`,
        zh: (ctx) =>
          `你跨過門檻來問${ctx.motifList}。${ctx.count}扇門——${ctx.titles}——樞軸皆同。入門者，鮮有問第二次的。「${ctx.q}」`,
      },
    ],
  },
  adversary: {
    scholarly: [
      {
        en: (ctx) =>
          `Your corpus says: ${ctx.motifList}, ${ctx.count} tale(s) — ${ctx.titles}. Read them before you judge me; my side of the story is thinner in the record, as always. Confidence: ${ctx.conf}.`,
        zh: (ctx) =>
          `你的語料記載：${ctx.motifList}，共${ctx.count}則——${ctx.titles}。先讀完再評判我；記錄中我的一方總是單薄，一如既往。信心：${ctx.conf}。`,
      },
      {
        en: (ctx) =>
          `Check the record before the rumor: ${ctx.motifList}, ${ctx.count} tale(s) — ${ctx.titles}. The archive runs ${ctx.conf}; I am not surprised either way.`,
        zh: (ctx) =>
          `先查檔案，再聽謠言：${ctx.motifList}共${ctx.count}則——${ctx.titles}。檔案信心「${ctx.conf}」；我毫不意外。`,
      },
    ],
    dramatic: [
      {
        en: (ctx) =>
          `“${ctx.q}” ${ctx.motifList}? Of course the tale leads with me. ${ctx.titles} — ${ctx.count} scroll(s) — every one accurate, every one slander. Go on; ask them about me.`,
        zh: (ctx) =>
          `「${ctx.q}」${ctx.motifList}？故事當然以我開場。${ctx.titles}——${ctx.count}卷——每一句都精準，每一句都是誹謗。去問吧；問問他們我這個人。`,
      },
      {
        en: (ctx) =>
          `They wrote ${ctx.titles} — ${ctx.count} scroll(s) — and called it history. ${ctx.motifList} is only the latest chapter, and they misspelled my name again. “${ctx.q}”`,
        zh: (ctx) =>
          `他們寫下${ctx.titles}——${ctx.count}卷——還稱之為歷史。${ctx.motifList}不過是最新一章，而他們又拼錯了我的名字。「${ctx.q}」`,
      },
    ],
  },
}

const FALLBACK = [
  {
    en: (ctx) =>
      `“${ctx.q}” The ${ctx.total} tales before me are silent on “${ctx.query}”. Where I cannot cite, I will not assert. Ask of floods, fire-theft, the world-serpent, the road down to the dead.`,
    zh: (ctx) =>
      `「${ctx.q}」我面前的${ctx.total}則故事，對「${ctx.query}」緘默不語。凡無可引證之處，我絕不妄言。且問洪水、盜火、世界蛇、通往亡者之路。`,
  },
  {
    en: (ctx) =>
      `“${ctx.q}” Empty hands. Of ${ctx.total} tales, not one carries “${ctx.query}”. I do not invent sources — ask me of flood, fire-theft, the serpent at the world's root, or the road below.`,
    zh: (ctx) =>
      `「${ctx.q}」兩手空空。${ctx.total}則故事中，無一提及「${ctx.query}」。我不杜撰來源——問問洪水、盜火、世界之根的巨蛇，或地下的路。`,
  },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const CONF_WORD = { high: { en: 'high', zh: '高' }, medium: { en: 'medium', zh: '中' }, low: { en: 'low', zh: '低' } }

// Per-turn structural variation: a random reply shape, a random target length
// and a relationship stage derived from conversation depth. These stop every
// reply from sharing one chassis.
const SHAPES = [
  'Open by asking the user a short question back.',
  'Open mid-scene, as if resuming a story you were already telling.',
  'Open with a fragment of at most three words, then build from it.',
  'Open with one concrete sensory detail — a sound, a temperature, a smell.',
  'Answer directly in the first sentence with no preamble, then complicate it.',
  'Open with an old saying of your people, then unpack it.',
  'Open by correcting something the user seems to assume.',
  'Open with a memory of someone you knew, named.',
]
// Testimony-compatible shapes only — no scene-setting, no questions back.
const SCHOLARLY_SHAPES = [
  'Answer directly in the first sentence with no preamble, then give the evidence.',
  'Begin by naming the tale that bears on the question, then state exactly what it says.',
  'Begin by marking the limit of the sources, then give what little they do say.',
  'Begin by correcting a common misreading the user may hold.',
  'Give the shortest honest summary first, then the two specifics behind it.',
  'Begin with what the sources agree on, then note the one place they diverge.',
]
const LENGTHS = [40, 70, 110, 150]
const SCHOLARLY_LENGTHS = [50, 80, 120]

// One emotional register per reply, chosen from archetype-appropriate decks.
// Prevents tone oscillation (threatening + confessional + interrogative in one
// reply) by letting a reply vary in shape and length, never in mood.
const SCHOLARLY_TONES = ['dry and exact', 'grave', 'somber', 'weary but precise', 'procedural', 'measured']
const TONES = {
  authority: ['regal and deliberate', 'judicial', 'remote and magnanimous', 'stern'],
  creator: ['serene and slow', 'wistful', 'patient as weather', 'fond of what it made'],
  trickster: ['playful', 'sly', 'cheeky', 'conspiratorial'],
  hero: ['brash', 'battle-worn', 'swaggering', 'elegiac'],
  liminal: ['quiet and solemn', 'consoling', 'unsettling but gentle', 'matter-of-fact about endings'],
  adversary: ['proud', 'bitter', 'defensive', 'coldly courteous'],
}

// Registers drift smoothly: a character tends to keep their last mood (or
// switch to a neighbour in the deck) instead of teleporting between extremes.
const lastRegister = new Map()

function pickRegister(mode, archetype, characterId) {
  const deck = mode === 'scholarly' ? SCHOLARLY_TONES : TONES[archetype] || TONES.trickster
  const prev = lastRegister.get(characterId)
  if (prev && deck.includes(prev) && Math.random() < 0.6) return prev
  let r
  do {
    r = deck[Math.floor(Math.random() * deck.length)]
  } while (r === prev && deck.length > 1)
  lastRegister.set(characterId, r)
  return r
}

function turnGuidance(history, register, scholarly) {
  const turns = history.filter((h) => h.role === 'user').length + 1
  const shapeDeck = scholarly ? SCHOLARLY_SHAPES : SHAPES
  const lenDeck = scholarly ? SCHOLARLY_LENGTHS : LENGTHS
  const shape = shapeDeck[Math.floor(Math.random() * shapeDeck.length)]
  const len = lenDeck[Math.floor(Math.random() * lenDeck.length)]
  let stage
  if (turns === 1) {
    stage = 'This is your first exchange with this visitor: you are wary, curious, sizing them up.'
  } else if (turns <= 3) {
    stage = `You have traded ${turns} turns with this visitor; refer back to something they said before.`
  } else {
    stage = 'You know this visitor now — warmer or wearier, your choice; call back to earlier exchanges.'
  }
  return (
    `EMOTIONAL REGISTER — hold ONE tone for this entire reply: ${register}. ` +
    'Stay inside it from first word to last; do not mix menace with consolation, or jokes with sorrow. ' +
    'Ask at most one question in the whole reply, and only if the opening shape calls for one.\n' +
    `THIS REPLY: ${shape} Aim for roughly ${len} words — not your usual length, vary it. ${stage}`
  )
}

export function reply(characterId, mode, userText, L) {
  const character = characterById(characterId) || CHARACTERS[0]
  const overrides = OVERRIDES[character.id]
  const archetype = ARCHETYPES[character.archetype] || ARCHETYPES.trickster

  const retrieval = retrieveFor(userText, character)
  const cited = retrieval.hits
  const motifNames = retrieval.motifIds.map((id) => L(motifById.get(id).name)).filter(Boolean)

  const ctx = {
    motifList: motifNames.length ? motifNames.join('、') : L({ en: 'that pattern', zh: '那個模式' }),
    titles: cited.map((c) => L(c.text.title)).join('、'),
    count: cited.length,
    total: texts.length,
    conf: CONF_WORD[confidenceFor(retrieval)][L({ en: 'en', zh: 'zh' })],
    query: userText.trim().slice(0, 60),
    q: character.quip ? L(character.quip) : '',
  }

  const hasHits = cited.length > 0
  let variants
  if (mode === 'scholarly') {
    variants = hasHits ? (overrides?.scholarly || archetype.scholarly) : FALLBACK
  } else {
    variants = overrides?.dramatic || archetype.dramatic
  }
  const chosen = pick(Array.isArray(variants) ? variants : [variants])
  const text = chosen[L({ en: 'en', zh: 'zh' })](ctx)

  return {
    text,
    confidence: confidenceFor(retrieval),
    citations: (mode === 'scholarly' ? cited : []).map((c) => ({
      textId: c.text.id,
      title: L(c.text.title),
      region: L(c.text.region),
      tradition: c.text.tradition,
      quote: c.quote,
    })),
    source: 'mock',
  }
}

const FICTION_BANNER =
  'You are a fictionalized interpretive character in a comparative-mythology teaching app. ' +
  'Never claim to be the real voice of the tradition, its community, or of history; ' +
  'the app always displays a fictionality banner above your replies.'

export async function replyLive(characterId, mode, userText, L, history = []) {
  const character = characterById(characterId)
  if (!character) return reply(characterId, mode, userText, L)

  const retrieval = retrieveFor(userText, character)
  const cited = retrieval.hits

  const traditionLabel = TRADITIONS[character.tradition]?.en || character.tradition

  const voiceLine = `You are ${L(character.name)} — ${L(character.role)} — from the ${traditionLabel || character.tradition} tradition. Persona: ${L(character.blurb)} You have a signature line you use sometimes (not always): "${L(character.quip)}". Stay in character, and reply in the user's language.`
  const scholarlyVoice = `You are ${L(character.name)}, ${L(character.role)}, of the ${traditionLabel || character.tradition} tradition. In this mode you speak as a careful scholarly witness of your own tales: your personality may colour word choice only, never performance. Do NOT use your signature line, and do not act out your persona's moods. Reply in the user's language.`

  let system
  const scopeLine = retrieval.cross
    ? `\n\nSCOPE: the user explicitly asked about other traditions or comparisons, so you may speak across traditions — but always name which tradition each tale belongs to.`
    : `\n\nSCOPE: cite ONLY tales of your own tradition (${traditionLabel}); every passage above belongs to it. If those tales are silent on the question, say so in character and refuse to reach into other traditions unless the user asks about them.`

  if (mode === 'scholarly') {
    const passageBlock = cited.length
      ? cited
          .map((c, i) => `[${i + 1}] ${L(c.text.title)} (${c.text.tradition}): ${c.quote}`)
          .join('\n\n')
      : 'No corpus passages were retrieved for this question.'
    system =
      FICTION_BANNER +
      ' ' +
      scholarlyVoice +
      '\n\nSCHOLARLY MODE — you are TESTIFYING, not performing:\n\n' +
      'These retrieved corpus passages are your evidence:\n\n' +
      passageBlock +
      scopeLine +
      '\n\nStyle: plain, precise, almost report-like. Short declarative sentences. Name the tale behind every claim, and quote at most one short phrase from a passage, in quotation marks. Mark uncertainty and silence explicitly ("the texts do not say", "this tale is silent on that"). FORBIDDEN: theatrical imagery or scene-setting, apostrophizing the user ("mortal", "little one"), exclamations, rhetorical flourishes, jokes, boasting, superlatives, and emotional performance. The restraint itself is the characterization.' +
      '\n\nIf the passages do not address the question, say plainly that the corpus is silent and refuse to guess. A confidence badge is shown separately by the app, so do NOT write the word "Confidence" in your reply.'
  } else {
    system =
      FICTION_BANNER +
      ' ' +
      voiceLine +
      (retrieval.cross
        ? '\n\nDRAMATIC MODE — you are PERFORMING, not testifying. The user asked about other traditions or comparisons, so you may range across them — but every tale you tell is one you personally witnessed, never something you "read in a source".'
        : "\n\nDRAMATIC MODE — you are PERFORMING, not testifying. Everything you tell is your own living memory: you were there. Ground it in your own tradition's stories unless the user asks about others.") +
      '\n\nStyle: vivid, immediate, unashamed. Speak in images and present tense; address the user directly, as suits you. No hedging, no "the texts say", no quotation of sources, no academic framing. Lead with the ONE emotion named in the per-turn register below and hold it all the way through — accuracy is a distant second. Never mention evidence, passages, or citations; those belong to a different version of you.'
  }
  system +=
    '\n\nVOICE RULES (apply every turn):' +
    '\n1. Never open two replies the same way, and never open by restating the question or the retrieved titles.' +
    '\n2. End each reply in a way consistent with your register — an image, a quiet line, or a settled statement; no abrupt mood turns in the last sentence.' +
    '\n3. Draw on one or two concrete specifics from your own mythology (places, objects, kin, rituals you personally know).' +
    '\n4. Build on what the user said earlier in this conversation — you remember it, and your attitude toward them may shift slowly over turns, never within one reply.' +
    '\n5. Never use your signature line twice in a row.' +
    '\n6. Change the SHAPE and LENGTH of each reply; the per-turn instruction below overrides your habits.' +
    '\n7. CONSISTENCY: never announce a refusal and then answer anyway ("I will not say… and yet"). If you refuse, the refusal lasts the whole reply and you explain why; if you answer, you answer from the first sentence. No performative reluctance.' +
    '\n\n' +
    turnGuidance(history, pickRegister(mode, character.archetype, characterId), mode === 'scholarly')

  const apiMessages = [
    { role: 'system', content: system },
    ...history.slice(-10),
    { role: 'user', content: userText },
  ]

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
        temperature: mode === 'scholarly' ? 0.5 : 1.05,
        presence_penalty: 0.5,
        frequency_penalty: 0.35,
      }),
    })
    if (!r.ok) throw new Error(`api ${r.status}`)
    const data = await r.json()
    return {
      text: data.text,
      confidence: confidenceFor(retrieval),
      citations:
        mode === 'scholarly'
          ? cited.map((c) => ({
              textId: c.text.id,
              title: L(c.text.title),
              region: L(c.text.region),
              tradition: c.text.tradition,
              quote: c.quote,
            }))
          : [],
      source: 'live',
    }
  } catch (e) {
    const mock = reply(characterId, mode, userText, L)
    return { ...mock, source: 'mock' }
  }
}
