# Buddhist tradition — record spec for batch cutters (DHG508 Motif Atlas)

You are cutting **buddhist** story records into batch files
`data/raw/batch-NN-<tradition>-<slug>.json`, shape:

```json
{ "texts": [ { ...record... } ] }
```

## Field requirements (validated by scripts/01_build_corpus.py — errors stop the build)

- `id` — unique slug, `^[a-z0-9]+(-[a-z0-9]+)*$`, convention `buddhist-<slug>`.
  CHECK existing ids first (grep src/data/texts.json). Never reuse.
- `title` — `{en, zh}`; zh in **Traditional Chinese only** (忌簡體字).
- `tradition` — always `"buddhist"`.
- `category` — always `"religious"` (canonical scripture of a living religion).
- `region` — `{en, zh}`; a concrete/symbolic place + "(symbolic pin)" note when
  the story has no real geography. zh Traditional Chinese.
- `lat`, `lon` — coordinates of that pin. India sites: e.g. Ganges valley 25.3/83,
  Benares 25.32/83.0, Rajagaha 25.03/85.13, Savatthi 27.5/82.05, Kosambi 25.4/81.35,
  Vesali 25.93/85.13, Nalanda 25.13/85.48, Kusinara 26.74/83.89, Bodh Gaya 24.7/84.99,
  Lumbini 27.47/83.28, Sri Lanka (Anuradhapura 8.35/80.39, Sigiriya 7.96/80.76),
  otherworldly/heavens → neutral inland pin (e.g. 25.0/82.0) and SAY SO in region/summary.
- `period` — precise composition/recording date, e.g. `Composed c. 4th-3rd c. BCE, Pali canon written 1st c. BCE (Rouse translation 1895)`.
- `source` — `{archive, work, url}`; archive + translator + year; URL = the Internet Archive item page you actually used (e.g. `https://archive.org/details/complete-cowell-jataka-six-volumes-in-one`). NEVER leave url empty.
- `license` — e.g. `Public domain (Rouse translation 1895)`.
- `summary` — `{en, zh}`, 1-3 sentences each. zh Traditional Chinese.
- `motifs` — 1-5 ids ONLY from this list:
  flood, creation-chaos, dismembered-giant, clay-humans, fire-theft, descent-underworld,
  sibling-creators, trickster, sun-capture, quest-immortality, resurrection, world-serpent,
  wisdom-sacrifice, world-renewal, storm-thunder, transformation, miraculous-birth, theophany,
  prophetic-vision, ascension, oracle-divination, parable-teaching, spirit-possession,
  sacred-kingship, culture-hero, divine-marriage, sacred-place, taboo-transgression, boon-curse,
  otherworld-voyage, cauldron-rebirth, champion-portion, ritual-origin, foundational-legend,
  constellation-origin, star-husband, origin-of-death, cannibal-giant, witch, karma-retribution.
  `karma-retribution` (code E731) is the workhorse for rebirth stories — use where deeds ripen across existences.
- `sensitivity` — `{restricted: false, note: "..."}`. Standard note:
  "Canonical scripture of a living tradition (Buddhism); Jataka/moral material is freely taught and retold; no ritual secrecy involved." (Adjust per source.)
- `passages` — 1-4 passages; EACH 40-200 words; together they tell the whole
  episode start → end. **Modern English prose, no verse numbers, no archaisms.**
  Every passage that is not verbatim gets a note:
  `"Paraphrase of <work>, <locus> (<translator year>); not verbatim."`
- `persons` — array of character ids ONLY from this list (they exist in characters.json):
  buddha, mara, avalokitesvara, ksitigarbha, mahasammata, maudgalyayana,
  ananda, sariputra, rahula, mahapajapati, suddhodana, maya-devi, sujata, cunda-smith,
  brahma-sahampati, sakka, vidhura, temiya, vessantara, anathapindika, visakha-dak,
  mara-army, maitreya-b, asoka, mahinda, dutthagamani, vijaya-lanka, kuveni,
  vimalakirti-b, sadapd, nanda-b, padmasambhava, kusa, manohara, sudhana, druma,
  phalaka, adarsamukha, dandin, bimbisara, vaidehi, amrapali, abhaya, jivaka, atreya,
  ajatasatru, devadatta, visakha, prasenajit, janaka, mahaushadha, mahakarna,
  mahakasyapa, utpalavarna, krisa-gautami, visvantara, madri, yashodhara.
  If nobody fits, omit the persons field entirely.

## Story cutting rules

- ONE record = ONE self-contained episode. Do not merge episodes.
- Write passages so a reader gets the full story: setup → crisis → outcome.
- Paraphrase modern-English from the public-domain translation you read. Honest
  condensation, never verbatim-paste more than a short quoted clause.
- Depth: only the records flagged DEEP in your task get a `narrative` object
  (400-2500 words) plus `functions`, `variants` (≥1, with `cross_ref` pointing to
  a real record id or "none"), `language`, `canonical_translation`,
  `primary_sources` (≥1 `{work, citation, language}`), `secondary_sources` (≥1
  `{work, citation}`), `source_urls` (≥1 `{url, description, accessed: "YYYY-MM-DD"}` — use today 2026-11-15),
  `sensitivity_flag` (`living_tradition_low` or `none`), `sensitivity_guidance` when flag ≠ none,
  `provenance` `{record_status: "complete", compiled: "2026-11-15", compiled_by: "DHG508 fieldwork compilation", review_status: "draft - pending human review"}`.
  Base records (all others) carry ONLY the fields in the main list above.
- Cross-tradition clusters: if the story clearly parallels flood / resurrection /
  quest-immortality / descent-underworld / miracle-vision of heavens / world-renewal,
  add those cluster motifs and mention the parallel in the sensitivity note or summary.

## Local source files (data/raw/myths/buddhist/)

| File | Work | Translator | Volume coverage |
|---|---|---|---|
| jataka-cowell-complete.txt | The Jataka (547 birth-stories) | Rouse (vols 1-2), Francis & Neil (3), Chalmers (4-5), Cowell (6) | all 6 volumes, 1895-1907 |
| buddhistlegends00buddgoog.txt | Dhammapada Commentary, Books 1-2 | Burlingame 1921 (HOS 28) | Dhammapada verses 1-59 stories |
| buddhistlegends01buddgoog.txt | Dhammapada Commentary, Books 3-11 | Burlingame 1921 (HOS 29) | verses 33-405 stories |
| buddhistlegends02buddgoog.txt | Dhammapada Commentary, Books 14-26 | Burlingame 1921 (HOS 30) | verses 360-423 stories |
| dialoguesofbuddh00davi.txt / dialoguesofbuddh01davi.txt / dialoguesofbuddh03davi.txt | Dialogues of the Buddha (Digha Nikaya) | T. W. & C. A. F. Rhys Davids 1899-1921 | vols 1-3 |
| buddhistbirthst00davigoog.txt | Buddhist Birth Stories (Jatakatthavannana intro = Nidanakatha) | Rhys Davids 1880 | Buddha biography commentarial |
| buddhakaritaasv00cowegoog.txt | Buddhacarita (Life of Buddha) | E. B. Cowell 1894 | cantos 1-17 |
| romanticlegendof00ahbi.txt | The Romantic Legend of Sakya Buddha (Lalitavistara via Chinese) | Samuel Beal 1875 | Buddha biography |
| wg921.txt | Saddharma-Pundarika (Lotus Sutra) | H. Kern 1884 (SBE 21) | 27 chapters |
| mahavamsaorgreat0000wilh.txt | Mahavamsa (Great Chronicle of Ceylon) | Wilhelm Geiger 1912 | chs 1-37 |

Reading method: files are large; use Grep to locate episodes and Read with
offset/limit in ≤7000-word slices. OCR is imperfect — read around noise.

## Batch numbering (assigned — do not deviate)

Existing max is 253. Yours are assigned in the task prompt. Filename pattern:
`batch-NN-buddhist-<slug>.json`, e.g. `batch-254-buddhist-jataka-vol1.json`.
