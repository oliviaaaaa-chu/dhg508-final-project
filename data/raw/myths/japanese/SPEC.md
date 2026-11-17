# Japanese Myth Expansion — SPEC for cutting agents (2026-11-13)

Goal: extend `japanese` tradition from 5 → 175+ records. You are one of
several agents, each cutting records from ONE source and writing ONE batch
file. Read `.opencode/skill/myth-collection/SKILL.md` first for the general
standard; this file is the Japanese-specific override.

## Sources on disk (base dir `data/raw/myths/japanese/`)

| File | Work | License / URL |
|---|---|---|
| `kojiki-clean.txt` | Kojiki, trans. Basil Hall Chamberlain (1882), Wikisource. Main translation text runs from the page marker `Page:Kojiki by Chamberlain.djvu/101` to `/428`; the earlier pages are Chamberlain's Introduction (use only as context, do not cut records from the Introduction). OCR/transcription noise + interleaved translator footnotes: paraphrase the NARRATIVE only, never footnote commentary. | Public domain; https://en.wikisource.org/wiki/Kojiki_(Chamberlain,_1882) |
| `nihongi-aston-vol1.txt`, `nihongi-aston-vol2.txt` | Nihongi (Chronicles of Japan), trans. W. G. Aston (1896), Internet Archive scans (`nihongi1asto`, `nihongi2asto`). OCR is noisy — clean it as you paraphrase. Vol 1 = Books I–XV; vol 2 = Books XVI–XXXI. | Public domain; https://archive.org/details/nihongi1asto and https://archive.org/details/nihongi2asto |
| `davis-myths-legends-japan.txt` | F. Hadland Davis, "Myths & Legends of Japan" (1912), Project Gutenberg #45723. | Public domain; https://www.gutenberg.org/ebooks/45723 |
| `ozaki-japanese-fairy-tales.txt` | Yei Theodora Ozaki, "Japanese Fairy Tales" (1908), Project Gutenberg #35853. | Public domain; https://www.gutenberg.org/ebooks/35853 |
| `kwaidan-hearn.txt` | Lafcadio Hearn, "Kwaidan: Stories and Studies of Strange Things" (1904), Project Gutenberg #1210. | Public domain; https://www.gutenberg.org/ebooks/1210 |
| `mitford-tales-old-japan.txt` | A. B. Mitford (Lord Redesdale), "Tales of Old Japan" (1871), Project Gutenberg #13015. | Public domain; https://www.gutenberg.org/ebooks/13015 |

## Record shape — BASE records (shape A) unless told otherwise

`{ "texts": [ {...record...}, ... ] }` written to your assigned
`data/raw/batch-NN-....json` (UTF-8). Required fields (see SKILL.md §A):
id, title{en,zh}, tradition=`japanese`, category=`myth`, region{en,zh},
lat, lon, period, source{archive,work,url}, license, summary{en,zh},
motifs (1–5 ids, see below), sensitivity{restricted:false, note}, passages
(1–4 × 40–200 words, narrative order, covering the whole episode),
persons (ids from `src/data/characters.json`, see below).

- id: `japanese-<story-slug>`, lowercase-hyphen, unique.
- category: `myth` for everything (Kojiki/Nihongi sections are `myth`; if a
  record feels scripture-like, still use `myth` and explain in the note).
- period: be precise, e.g. `Kojiki compiled 712 CE (trans. Chamberlain 1882)`,
  `Nihongi compiled 720 CE (trans. Aston 1896)`, `Recorded 1871 (trans. Mitford 1871)`,
  `Recorded 1904 (Hearn)`.
- zh: proper TRADITIONAL Chinese (天照大神, 須佐之男命, 出雲, 八岐大蛇, 火之迦具土神...).
  Never simplified characters. Names: use standard Japanese-motif Chinese renderings
  (伊耶那岐/伊耶那美 or 伊邪那岐命, 草薙劍, 八尺瓊勾玉, 瓊瓊杵尊, 木花咲耶姫, 櫛名田比賣,
  大己貴神/大國主神, 少名毘古那神, 神武天皇, 倭建命/日本武尊, 神功皇后, 浦島太郎, 竹取物語/輝夜姬,
  賣油娘子, 天人少女...). If unsure of a zh name, use the katakana/kanji of the story
  element with a descriptive title, but keep characters traditional.
- passages: modern English clean prose (embedding corpus), 40–200 words each,
  1–4 passages covering start → middle → end. If condensed, the note of EACH
  passage that is condensed must be exactly in the form
  `"Paraphrase of <work>, <locus> (<translator year>); not verbatim."`
  e.g. `Paraphrase of Kojiki, Section 9 (trans. Chamberlain 1882); not verbatim.`
  You MAY quote Chamberlain/Aston/Gutenberg texts verbatim for a passage if the
  page text is already clean prose and ≤200 words — then no paraphrase note is
  needed but keep the source's wording and add note `"Verbatim excerpt from <work>, <locus> (<translator year>); public domain."`
  In practice most passages will be labelled paraphrases — that is fine.
- sensitivity note (every record): mention Japanese court/Shinto myth and that
  passages are paraphrases of public-domain translations; e.g.
  `"Ancient Japanese court myth (Kojiki/Nihongi); passages are condensed paraphrases of public-domain translations, presented for comparative mythology."`

## Motifs — use ONLY these ids (do NOT edit src/data/motifs.json)

flood, creation-chaos, dismembered-giant, clay-humans, fire-theft,
descent-underworld, sibling-creators, trickster, sun-capture,
quest-immortality, resurrection, world-serpent, wisdom-sacrifice,
world-renewal, storm-thunder, transformation, miraculous-birth, theophany,
prophetic-vision, ascension, oracle-divination, parable-teaching,
spirit-possession, sacred-kingship, culture-hero, divine-marriage,
sacred-place, taboo-transgression, boon-curse, otherworld-voyage,
cauldron-rebirth, champion-portion

Tag the best 1–5 fits. When a story matches a cross-tradition cluster, prefer
the cluster motif too (flood / dismembered-giant / descent-underworld /
resurrection / sibling-creators / divine-marriage / sun-capture /
culture-hero / transformation / taboo-transgression / sacred-kingship /
otherworld-voyage).

## Persons — existing ids in src/data/characters.json (japanese)

amaterasu, izanagi, susanoo, tsukuyomi, izanami

DO NOT edit characters.json yourself. In your final report include a
`new_characters` array for every recurring named character you used:
`{"id":"japanese-<slug>","tradition":"japanese","archetype":"<one word>","name":{"en":"...","zh":"..."},"role":{"en":"...","zh":"..."},"blurb":{"en":"...","zh":"..."},"quip":{"en":"...","zh":"..."}}`
(e.g. okuninushi, kagutsuchi, okuninushi… jimmu, yamato-takeru, jingu,
okikurumi, kushinada, takemikazuchi, ninigi, konohanasakuya, urashima-taro,
kaguya-hime, etc.). Use existing ids where one exists; otherwise still use
your new id in `persons` (the build tolerates it) and report it.

## Coordinates (symbolic pins — document in the `region` field when symbolic)

- Plain of High Heaven / celestial scenes: Takachiho plateau, Miyazaki: lat 32.73, lon 131.30 (symbolic pin, region note says so)
- Izumo: lat 35.36, lon 132.76
- Awaji / Onogoro creation: lat 34.30, lon 134.80 (symbolic pin)
- Yomi / Ne-no-kuni (otherworld): use lat 35.10, lon 134.00 inland neutral spot, region says "(symbolic pin)"
- Himuka / Tsukushi (Kyushu): lat 32.20, lon 131.30
- Yamato / Nara court: lat 34.68, lon 135.83
- Ise: lat 34.46, lon 136.72
- Kii / Kumano: lat 33.70, lon 135.90
- Kyoto (for Heian tales): lat 35.01, lon 135.77
- Edo/Tokyo (Tokugawa tales): lat 35.68, lon 139.75
- Lake Biwa / Omi: lat 35.30, lon 136.00
- Tsukuba / Hitachi: lat 36.20, lon 140.10
- Sea of Japan / Enoshima / Chikubu etc.: pick nearest real place and say "(symbolic pin)" if the story is otherworldly.

## Episodes ALREADY COVERED — do not re-cut these (ids exist)

- `izanagi-izanami` + `japanese-izanagi-izanami-yomi` (deep): stirring of Onogoro, island birth, marriage pillar circuit, Izanami's death bearing fire, full Yomi descent & pursuit, misogi/purification. → Do NOT cut the island-creation or Yomi-descent episode again. You MAY cut smaller sub-episodes that these two records do not fully cover ONLY if genuinely distinct (e.g. Kojiki's separate list of island-name generations, the Nihongi's OTHER variant creation accounts in Book I "One writing says…" — for Nihongi these variant cosmogonies are a fair distinct cut).
- `amaterasu-cave`: Amaterasu's seclusion & cave episode (Kojiki). → Nihongi's variant of the cave episode may still be cut from Aston with a variant title id (e.g. `japanese-nihongi-amaterasu-cave`) — different source tradition.
- `orochi-eight-forks`: Susanoo & the eight-headed serpent (Kojiki).
- `fuji-legend`: Mount Fuji, Konohan (Davis ch. IX).

## Batch numbering

`data/raw/batch-NN-<tradition>-<slug>.json` — NN is ASSIGNED to you in your
prompt. Never renumber. Never touch other agents' batches.

## Volume

Cut EVERY self-contained story episode you find in your assigned range
(one record per episode; skip none). If your assigned range yields fewer
records than your target, keep reading; report the shortfall honestly.

## Do NOT

- Do not run the pipeline (`01_build_corpus.py` / `04_qa_narratives.py`) — the
  coordinator validates centrally.
- Do not edit motifs.json, characters.json, colors.js, or any other batch.
- Do not add comments or extra top-level fields beyond the schema.
- Do not invent URLs — use exactly the URLs in the Sources table.
