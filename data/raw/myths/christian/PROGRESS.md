# Christian tradition — collection progress ledger

Target: 175+ stories. **Status: 202/175+ MET (202 unique records as of 2026-11-15).**
All records live in `data/raw/batch-235..250-*.json` and are merged into `src/data/texts.json`.

Record shapes used: bulk base records (shape A) throughout; zero deep records so far —
deep flagship records (creation, Eden, flood, resurrection, Revelation, harrowing of hell)
remain the next-session deepening pass.

## Sections read and cut (batch → source → stories)

| Batch | Source (all verified URLs) | Records |
|---|---|---|
| 235 | KJV Genesis 1–11 (Gutenberg #1) — primeval cycle | 10 (creation, Eden garden, fall, Cain/Abel, Cain-line crafts, Enoch taken, Nephilim, Noah flood, Noah's vineyard curse, Nimrod/Babel) |
| 236 | KJV Genesis 12–50 — patriarchs | 24 (call of Abram … Joseph's bones) |
| 237 | KJV Exodus 1–34 | 20 (ark of bulrushes … Moses' shining face) |
| 238 | Numbers 13–24, Deut 34, Joshua 2–24 | 16 (evil report … Joshua's farewell at Shechem) |
| 239 | Judges 6–16, Ruth, 1–2 Samuel, 1–2 Kings | 16 (Gideon's fleece … Naaman) |
| 240 | 1 Kings 19, Daniel 2/3/5/6, Esther 3–8, Job, Jonah, Isaiah 6, Ezekiel 1/37, Jeremiah 18 | 11 (still small voice … potter and clay) |
| 241 | Matthew 1–4, Luke 1–2, John 1 — nativity & early ministry | 11 (Annunciation … Word made flesh) |
| 242 | Mark 4–5, John 2/5/9/11, Matthew 14/17, Luke 5/19 | 12 (Cana … great draught) |
| 243 | Mark 4, Luke 10/12/15/16, Matthew 25 | 10 (sower … sheep and goats) |
| 244 | Matthew 26–28, Luke 23–24, John 20 | 10 (Last Supper … Mary at the tomb) |
| 245 | Acts 1–28 (KJV #44) | 11 (Ascension … Eutychus) |
| 246 | Wake, Forbidden Gospels (Gutenberg #6516): Birth of Mary, Protevangelion, First Infancy, Nicodemus, Abgarus, Thecla, Hermas | 13 |
| 247 | Gospel of Thomas (Coptic, paraphrased; earlychristianwritings.com) | 6 |
| 248 | Dante, Divine Comedy (Cary trans., Gutenberg #8800): Inferno I/III/IV/V/XIII/XXVI/XXXIII/XXXIV, Purgatorio XXX, Paradiso XXXIII | 10 |
| 249 | Milton, Paradise Lost (Gutenberg #26) & Paradise Regained (#58) | 5 |
| 250 | Golden Legend (Caxton, Fordham Sourcebook): George, Nicholas, Ursula, Cecilia, Francis; Malory, Morte d'Arthur book XVII (Grail: Joseph's shield, Grail mass, Galahad at Sarras) | 6 |

## Existing (pre-run) records kept as-is
nativity-luke, pentecost-acts, revelation-new-jerusalem, divine-comedy-inferno,
paradise-lost-fall, prodigal-son, christian-passion-resurrection.

## Cross-tradition cluster coverage (Section 3 of SKILL.md)
- Flood: christian-noah-flood (cross-refs deferred to deep pass)
- Death & Resurrection: christian-empty-tomb, christian-lazarus-raised, christian-eden-fall, harrowing of hell (Nicodemus ×2)
- Origin of Death: christian-eden-fall, christian-cain-abel, christian-milton-eve-eats
- Prophet/seer vision of heavens: christian-isaiah-call-temple, christian-ezekiel-wheel-vision, christian-dante-love-that-moves-sun, revelation-new-jerusalem
- Humans molded from clay: christian-creation-six-days, christian-eden-garden, christian-blind-siloam, christian-jeremiah-potter
- Descent to the underworld: christian-dante-* series, harrowing of hell, christian-parable-rich-man-lazarus, christian-jonah-fish-nineveh

## Characters added (characters.json, +19 → 721 total)
jesus, mary, josephc, johnbaptist, satan, pilate, herod-antipas, stephen, paul, thecla,
lazarus, zacchaeus, josepharim, galahad, dante, virgil, lucifer, nimrod, enoch.

## Intentionally deferred (sources exhausted at record level, not padded)
- Gospel of Thomas: 6 of ~114 logia groups (more logia can be batched cheaply later).
- Golden Legend: only 5 of ~180 lives cut (Christopher, Sebastian, Katherine, Margaret of Antioch, Martin of Tours, Barlaam and Josaphat are good next targets).
- Grail: 3 of the Quest's chapters (Sir Bors's trials, Percivale's temptation by the demon lady, Lancelot's withheld vision are next).
- Dante: 10 of 100 cantos (Purgatorio's seven terraces, Paradiso's spheres).
- Deuterocanon (Tobit, Judith, 1–2 Maccabees, Sirach) not yet cut — good bulk source for a further run to ~220.
- Deep records (shape B): 0 for christian — next session should add 10–15 deep flagships
  (creation, Eden, flood, Exodus, Resurrection, Revelation, harrowing of hell, Divine Comedy).

## Cross-repair note (other sessions' files)
Repaired three malformed records in buddhist batches (batch-259, batch-264) that made
`04_qa_narratives.py` exit 1 project-wide (narrative as string instead of object; missing
variants fields; missing provenance). Content untouched otherwise.
