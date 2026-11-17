---
name: myth-collection
description: Standards and workflow for collecting myths and religious stories into the Motif Atlas corpus (DHG508 final project). Use when the user asks to collect, cut, extract, batch, deepen, QA, or extend myth/religious-story records for any tradition, or asks about corpus standards, motif tagging, story cutting, or sources.
---

# Myth & Religious Story Collection — Motif Atlas (DHG508)

Project: comparative-mythology explorer. Stories are stored as records in
`data/raw/batch-*.json`, validated by the Python pipeline, and merged into
`src/data/texts.json` (the website reads that file). Embeddings/similarity are
computed over the standardized text fields (summary + narrative + passages).

## 1. Read this first — the three data shapes

Every record lives in a batch file `data/raw/batch-NN-<slug>.json`:

```json
{ "texts": [ { ...record... } ] }
```

There are three record types. **Match the existing convention exactly.**

### A. Base record (story record — the standard used for Greek & Norse story batches)

Template: `data/template/corpus.template.json`. Example of the finished form:
`data/raw/batch-29-greek-stories.json`, `batch-35-norse-creation-a.json`.

A "story" = ONE self-contained narrative episode cut from a primary source.
Required fields:

| Field | Standard |
|---|---|
| `id` | unique slug, lowercase + hyphens, pattern `^[a-z0-9]+(-[a-z0-9]+)*$`. Convention: `<tradition>-<story-slug>` (e.g. `greek-iliad-death-hector`, `norse-ginnungagap-void`) |
| `title` | `{ "en": "...", "zh": "..." }` — zh is Traditional Chinese, never simplified |
| `tradition` | slug registered in `src/lib/colors.js` (greek, norse, hindu, chinese, maori, yoruba, japanese, maya, egyptian, hebrew, islamic, hindu, buddhist, taoist, zoroastrian, sumerian, babylonian, aztec, slavic, celtic, korean, hawaiian, polynesian, melanesian, indonesian, philippine, inca, amazonian, baltic, ugaritic, hittite, vietnamese, thai, san, woodland, persian, tibetan, christian, afroatlantic, inuit, mesopotamian, plateau…). New traditions must also be added to `src/lib/colors.js` |
| `category` | `myth` (sacred narrative: gods/creation/heroes/folktales/legends), `religious` (canonical scripture), or `myth-religion` (living religious/folkloric traditions where the myth/religion line does not apply, e.g. Vodou, Santería, San narrative cycles). Interpretive division — note reasoning in sensitivity note if ambiguous |
| `region` | `{en, zh}` — approximate or symbolic place; append "(symbolic pin)" and say how/why you chose the pin |
| `lat`, `lon` | coordinates of that pin (verify ranges; symbolic/otherworldly places → neutral inland spot, documented) |
| `period` | date of composition/recording, precise: e.g. `Composed c. 8th century BCE (Butler translation 1898)`, not just "ancient" |
| `source` | `{archive, work, url}` — exact work + translator + year; **verify the URL works at collection time** |
| `license` | e.g. `Public domain (translation 1898)` |
| `summary` | `{en, zh}` — 1–3 sentences each; zh in Traditional Chinese |
| `motifs` | 1–5 ids from `src/data/motifs.json` (unknown ids are QA warnings; add new motifs to motifs.json with a Thompson/ATU-style `code` where one exists) |
| `sensitivity` | `{restricted, note}` — mandatory. `restricted: true` fails ingestion; keep such material out entirely |
| `passages` | **the cut story itself**: 1–4 passages, each 40–200 words, in narrative order, covering beginning → middle → end of the episode. Each passage: `{id: "1", text, note}`. If the text is a condensed paraphrase (normal for story records), `note` is MANDATORY: `"Paraphrase of <work>, <locus> (<translator year>); not verbatim."` |
| `persons` | array of character ids from `src/data/characters.json` appearing in the story (story batches only). Add missing characters to characters.json (`{id, tradition, archetype, name{en,zh}, role{en,zh}, blurb{en,zh}, quip{en,zh}}`) |

### B. Deep record (fieldwork extension)

Template: `data/template/narrative.template.json`. Validated by
`scripts/04_qa_narratives.py`. A record is "deep" iff it carries a `narrative`
object. Everything in A **plus**:

| Field | Standard |
|---|---|
| `narrative.en` | complete modern-English narrative, **400–2500 words** (target ~600–1200): beginning, middle, end; principal characters; key events; outcome; cultural/ritual function. <50 words = STUB error; 50–399 = below-target warning |
| `functions` | cultural/ritual functions, 2–4 bullet strings |
| `variants` | ≥1 named variant (e.g. other recensions, parallel tellings), each `{name, text_tradition, summary, cross_ref}` — cross_ref = related record id or "none" |
| `language` | original language of the primary source |
| `canonical_translation` | translation relied on, translator + year |
| `primary_sources` | ≥1 `{work, citation, language}` — citation carries edition/translator/year + book/canto/lines/folio/verse + MS siglum where known |
| `secondary_sources` | ≥1 `{work, citation}` — peer-reviewed monograph/article, author year publisher/journal |
| `source_urls` | ≥1 `{url, description, accessed}` — accessed MUST be `YYYY-MM-DD` |
| `sensitivity_flag` | one of `none`, `living_tradition_low`, `living_tradition_high`, `indigenous_oral_consent`, `colonial_era_collection_caution` |
| `sensitivity_guidance` | REQUIRED when flag ≠ none |
| `provenance` | `{record_status: complete\|reconstructed\|stub, compiled: YYYY-MM-DD, compiled_by, review_status}`. `reconstructed` requires `reconstructed_segments: [{segment, restored_in}]` |

Existing deep records: 152 of 417 records (as of 2026-11-12). Norse and Greek
are fully built out (116 + 113 records); every other tradition is 3–11 records
and is the expansion frontier.

### C. Coverage & duplicates
- QA fails on duplicate ids across all batches — check `src/data/texts.json`
  before inventing a new id.
- Re-running a batch file updates its texts in place (same id = update).

## 2. Topic taxonomy (tag every story to ONE primary topic)

When cutting stories from a source, classify each into one of these topics and
group batches accordingly:

1. **Creation & Origin Myths** — cosmogonies, first humans, origin of fire,
   origin of marriage/institutions. ← PRIORITY
2. **Deity & Immortal Narratives** — births of gods, divine contests,
   genealogies, divine marriages.
3. **Heroic & Quest Tales** — hero's journey, trials, transformations, return,
   supernatural helpers, descents to the underworld.
4. **Founding & Ethnogenesis Legends** — migration origins, founding of cities/
   capitals, ancestor myths, dynasty founders.
5. **Ritual Origin & Etiological Myths** — why a ritual/taboo/social rule exists.
6. **Miracle & Hagiographic Accounts** — miracle cures, visions, saints' lives,
   martyrdoms, posthumous miracles, relic stories.
7. **Cosmology & Eschatology** — cosmic order, fate, prophecy, heavens/hells,
   apocalypse, end times. ← PRIORITY
8. **Trickster & Ambiguous Figures** — Coyote/Loki-type episodes, culture-heroes
   who disrupt norms.
9. **Sacred Landscape & Place Myths** — mountains, rivers, springs, shrines.
10. **Festival & Calendar Stories** — stories attached to seasonal festivals.
11. **Taboo, Curse & Transgression Stories** — violated sacred law, curses,
    punishment, boundary enforcement.

**Strongly prioritize 1 (Creation) and 7 (Cosmology/Eschatology)**, then any
story participating in the cross-tradition motif clusters below.

## 3. Cross-tradition motif clusters (target these hard)

These parallels exist across many traditions; make sure each tradition's
version gets a record so the Compare/Network views can match them:

| Cluster | motif ids | Traditions to cover |
|---|---|---|
| **Flood / deluge** | `flood`, `world-renewal` | Mesopotamia (Utanapishtim), Greek (Deucalion), Hebrew (Noah), Qur'an (Nuh), Chinese (Gun-Yu), Hindu (Manu), Maya, Norse (Bergelmir), Americas, Oceania |
| **Death & Resurrection** | `resurrection`, `quest-immortality` | Tammuz/Dumuzi (Sumer/Babylon), Osiris (Egypt), Adonis (Greek), Balder (Norse), Jesus (Christian), Kuan Yin / related Buddhist figures |
| **Origin of Death** | `taboo-transgression`, `transformation` | African (San, Yoruba), Aboriginal Australian, Polynesian (Maui), Norse (Hel's law), Hebrew (Eden), Hindu (Yama), messenger-fails-the-message type (snail/lizard) |
| **Twins / Duality** | `sibling-creators`, `culture-hero` | Romulus & Remus (Roman), Maya Hero Twins (Popol Vuh), Ashvins (Hindu), Yoruba Ibeji, dual first-ancestors |
| **Sacred Marriage / Hieros Gamos** | `divine-marriage` | Mesopotamian sacred-marriage rite, Hindu fertility myths, Greek (Zeus–Hera), Egyptian (Isis–Osiris) |
| **Cataclysm / End of World** | `world-renewal`, `flood` | Ragnarok (Norse), yugas → pralaya (Hindu), Revelation (Christian), Mayan calendar-ends |
| **Theft of fire / civilizing gift** | `fire-theft`, `culture-hero` | Prometheus (Greek), Maui (Polynesia), Coyote (N. America), humans in Chinese/Norse/Amazonian |
| **Descent to the underworld** | `descent-underworld` | Inanna/Ishtar (Mesopotamia), Orpheus/Heracles (Greek), Kumu-Honua/Polynesian, Xibalba twins (Maya), Izanagi (Japanese), Odysseus Nekyia |
| **Primordial being dismembered** | `dismembered-giant`, `creation-chaos` | Ymir (Norse), Pangu (Chinese), Tiamat (Babylonian), Purusha (Hindu) |
| **Humans molded from clay** | `clay-humans` | Enki/Ninhursag (Sumer), Prometheus (Greek), Nüwa (Chinese), Popol Vuh (Maya), Qur'an (Adam), Yoruba (Obatala) |
| **Sky's fall / sun captured** | `sun-capture`, `world-serpent` | Maui snaring the sun, Archalus-type solar myths, Phaethon (Greek) |
| **Prophet/seer vision of heavens** | `prophetic-vision`, `ascension`, `theophany` | Ezekiel, Revelation, Muhammad's Night Journey, Arda Viraf (Zoroastrian), Er myth (Plato), Buddhist heavens |

When a story fits a cluster, ALSO add the cluster motifs to `motifs` and set
`variants[].cross_ref` to the parallel records in other traditions where they
exist (grep `src/data/texts.json` for ids).

## 4. Session workflow

0. **Portfolio context (read before choosing what to do).** The full program
   is ~41 traditions × 175+ stories ≈ 7,200+ records. Check the live counts
   first:
   ```powershell
   python -c "import json; d=json.load(open('src/data/texts.json',encoding='utf-8')); c={}
   for t in d: c[t['tradition']]=c.get(t['tradition'],0)+1
   [print(f'{k}: {v}') for k,v in sorted(c.items(), key=lambda x:-x[1])]"
   ```
   As of 2026-11-13: norse 192, greek 188, hindu 177, celtic 176 (target
   met); philippine 112, chinese 105, egyptian 103 (in progress); the other
   ~34 traditions sit at 3–11 records. **Strategy: breadth before depth.**
   Give every still-stub tradition a first pass covering the priority topics
   (1 & 7) and the cross-tradition clusters (section 3) BEFORE exhausting
   any one tradition. Do not start another Greek/Norse/Hindu/Celtic run
   while 30+ traditions have no records.
1. **Pick a tradition + source set — automatically.** Unless the user names
   one, pick the tradition with the FEWEST records (tie-break: one involved
   in cross-tradition clusters with no records yet, e.g. flood, origin-of-
   death, twins). Target tradition list lives in
   `scripts/04_qa_narratives.py` (TARGET_TRADITIONS); run
   `py scripts/04_qa_narratives.py` to see the `[pending]` list. State your
   choice and why in one line, then proceed — do not ask.
2. **Obtain public-domain primary sources.** Preferred archives: Project
   Gutenberg, Internet Sacred Texts Archive, Perseus Digital Library,
   Wikisource, HathiTrust, Internet Archive, MIT Classics Archive. Save
   downloaded sources under `data/raw/myths/<tradition>/` (see existing
   `data/raw/myths/greek/`). Record archive + translator + URL **at collection
   time**; retrofitting URLs later is painful.
3. **Read in ≤6000–7000-word chunks PER READ, with many reads per prompt**
   (user rule). The word cap applies to each reading turn/tool call, NOT to
   the whole session: one prompt session contains many agentic turns, so keep
   reading successive chunks — sections, books, tablets, chapters — until the
   tradition's sources are exhausted or the volume target is met. Cut stories
   precisely; do NOT skip or merge unrelated episodes. Keep a running
   checklist of sections read so no story is missed.
4. **One record per story episode.** For long cycles, cut per episode (e.g.
   each labors of Heracles, each Loki episode), not per cycle.
5. **Record-shape strategy (critical for volume).** The 175+ target is
   reachable within ONE prompt session — but only if bulk cutting uses the
   cheap record shape. Reading is not the bottleneck (many reads per session);
   OUTPUT and context are. Use the right record shape for the right job:
   - **Bulk stories → base records (shape A)**, NOT deep records. A base
     record costs ~600 words of output; a deep record costs 1,500–3,000
     (400–2500-word narrative + variants + citations). That is why one deep
     batch yields only 4–9 records while a Greek story batch (batch-29–34)
     yields 25–34. Only the passages need the full story — the deep
     `narrative` object is NOT required for every record. 175 base records
     ≈ 110–140k words of output — spread over many turns this fits one
     session, but only if the session stays disciplined: no long essays in
     chat, write straight into batch files.
   - **Reserve deep records (shape B)** for the priority topics (1 & 7), the
     cross-tradition motif clusters (section 3), and a handful of flagship
     stories per tradition — roughly 10–20 deep records per tradition is
     enough; the remaining ~160 stories are base records.
   - Every base record still needs accurate motifs, persons, sources, and
     full-coverage passages — cheap does not mean sloppy.
6. **Volume target:** aim for **175+ stories per tradition** (Greek and Norse
   already exceed this). If a tradition's surviving sources are genuinely
   thin (fragmentary corpora, small oral collections), collect everything
   that exists instead — exhaust the available material, then say so in the
   session report rather than padding with weak cuts.
7. **Keep going until the target is met or sources are exhausted.** The
   reading cap is per read, not per session — do not stop after the first few
   chunks. The practical session limits are output volume and context
   pressure; if the session ends before 175+, the ledger (step 8) makes the
   next prompt resume seamlessly. Save completed records to batch files
   IMMEDIATELY (one file per source section, e.g.
   `batch-61-norse-edda-poems.json`) so nothing is lost if the run ends.
8. **Progress ledger for continuation.** Maintain a per-tradition checklist
   (e.g. `data/raw/myths/<tradition>/PROGRESS.md`) listing each source
   section and its cut stories (or mark "pending"). At session start, read
   the ledger and resume from the first uncut section instead of restarting
   low. The session report must state: records so far / 175 target,
   sections read, sections remaining.
9. **Tag motifs** (1–5 per record from `src/data/motifs.json`), add missing
   motifs to motifs.json, link `persons` to characters.json, and set
   `cross_ref` for cross-tradition parallels.
10. **Save batch** as `data/raw/batch-NN-<tradition>-<slug>.json`. NN must be
    UNIQUE across `data/raw/` — list existing files first and take max(NN)+1
    (115 is current max; duplicate numbers like the three `batch-100-*`
    files are from parallel sessions and make the queue hard to audit).
    Include the tradition slug in the filename so parallel runs don't
    collide.
11. **Validate:**
   ```bash
   py scripts/04_qa_narratives.py      # deep-record QA + coverage report
   py scripts/01_build_corpus.py       # validates + merges into src/data/texts.json
   ```
   Fix all errors; resolve below-target warnings. Then `npm run dev` and spot
   check the new texts in the Search/Map/Network views.
12. **Report**: new record count, traditions updated, stories intentionally
    deferred, any new motifs/characters/traditions added, and the progress
    ledger update (records so far / 175 target, sections remaining).

## 5. Writing the standardized story text (for embeddings)

- Passage `text` fields and `narrative.en` are the embedding corpus: rewrite
  in **modern English**, clean prose, no verse line numbers, no translator
  archaisms. Keep proper nouns consistent with the rest of the corpus.
- Passage lengths 40–200 words each; 1–4 passages per record; together they
  must tell the whole episode (start → end). `narrative.en` 400–2500 words.
- Paraphrase honestly: never paste modern copyrighted translations verbatim;
  use public-domain translations as the basis and mark every paraphrase with a
  `note` (`"Paraphrase of X, locus (translator year); not verbatim."`).
- zh fields (title, summary, region) in **Traditional Chinese**.

## 6. Known conventions & gotchas

- Encoding: batch files are UTF-8 (read with `utf-8-sig`). Existing zh text in
  older batches is mojibake in some files — do not propagate; write proper
  Traditional Chinese.
- `01_build_corpus.py` enforces: required fields, id regex, unique ids,
  `restricted` exclusion, category in {myth, religious, myth-religion},
  coordinate ranges.
- `04_qa_narratives.py` exits 1 on any error; warnings alone exit 0.
- Motif tags are an interpretive act (Thompson index is Euro-American) — note
  contentious tag choices in the record's sensitivity note when relevant.
- Category "folk" exists in the schema enum but the pipeline rejects it — use
  `myth`, `religious`, or `myth-religion` (for living religious/folkloric
  traditions where a strict myth/religion split misleads, e.g. Vodou,
  Santería, San narrative cycles).
- After adding a new tradition: register in `src/lib/colors.js` TRADITIONS
  (color) — otherwise the UI breaks on that tradition.

## 7. Where things are

```
data/raw/batch-NN-*.json       ← your new batches go here
data/raw/myths/<tradition>/    ← downloaded primary sources
data/template/*.json           ← record templates (copy, don't edit)
schema/narrative-record.schema.json  ← full field spec
scripts/01_build_corpus.py     ← validate + merge
scripts/04_qa_narratives.py    ← deep-record QA + coverage
src/data/texts.json            ← merged corpus (417 records, generated)
src/data/motifs.json           ← motif dictionary (33 motifs)
src/data/characters.json       ← 131 characters in 41 traditions
src/lib/colors.js              ← tradition registry
```
