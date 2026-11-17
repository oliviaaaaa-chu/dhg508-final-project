# Egyptian Tradition — Progress Ledger

Target: 175+ stories per tradition. Existing records before this session: 5
(`ra-apophis`, `destruction-of-mankind`, `isis-secret-name`, `book-of-dead-heart`,
`egyptian-osiris-cycle` deep).

## Sources downloaded (data/raw/myths/egyptian/)

| File | Work | Translator/Year | Archive URL (verified 2026-11-13) |
|---|---|---|---|
| pg9411.txt | Legends of the Gods: The Egyptian Texts | E. A. W. Budge, 1912 | https://www.gutenberg.org/cache/epub/9411/pg9411.txt |
| pg7145.txt | The Book of the Dead | E. A. W. Budge, 1920 | https://www.gutenberg.org/cache/epub/7145/pg7145.txt |
| pg7386.txt | Egyptian Tales, First Series (IVth–XIIth Dynasty) | W. M. F. Petrie, 1895 | https://www.gutenberg.org/cache/epub/7386/pg7386.txt |
| pg7413.txt | Egyptian Tales, Second Series (XVIIIth–XIXth Dynasty) | W. M. F. Petrie, 1895 | https://www.gutenberg.org/cache/epub/7413/pg7413.txt |
| 15932-0.txt | The Literature of the Ancient Egyptians | E. A. W. Budge, 1910 | https://www.gutenberg.org/files/15932/15932-0.txt |

Sacred Texts (Mercer's Pyramid Texts, Mackenzie's Egyptian Myth and Legend) returns
HTTP 403 to fetchers — use Budge's Literature (15932) Pyramid-Texts chapter instead.
Lichtheim / Faulkner / Allen / Gardiner modern translations are COPYRIGHTED — cite as
canonical_translation / secondary_sources only; paraphrase with mandatory notes.

## SESSION 2026-11-13 — DONE (31 new records, 5 -> 36 total; deep 1 -> 8)

Validation: `04_qa_narratives.py` PASSED (2 pre-existing celtic warnings only);
`01_build_corpus.py` merged cleanly, src/data/texts.json now 1053 texts,
36 egyptian. 19 new characters added to src/data/characters.json (osiris,
horus, geb, nut, shu, atum, tefnut, ptah, khnemu, nephthys, bata, anpu-brother,
khensu, setna, neferkaptah, aten, amun, sekhmet, hapy). Also verified
Wikisource Budge (1923) Great Hymn to Aten as an additional source.

### batch-102-egyptian-creation.json (deep) — DONE
- [x] egyptian-nebertcher-creation (BM Papyrus 10188; creation-chaos; humans-from-tears)
- [x] egyptian-celestial-cow (Heavenly Cow, tomb of Seti I; reconstructed, Lichtheim paraphrase)

### batch-103-egyptian-pyramid-texts.json (base) — DONE
- [x] egyptian-opening-the-mouth / funerary-offering-liturgy / unas-hunts-gods /
      king-in-heaven / sky-goddess-hymn (all Budge Literature ch. II verbatim)

### batch-104-egyptian-hymns-aten.json — DONE
- [x] egyptian-hymn-amen-ra / hymn-amen / hymn-sun-god / hymn-shu (base)
- [x] egyptian-great-hymn-aten (deep; Wikisource Budge 1923 verbatim)

### batch-105-egyptian-god-legends.json (base) — DONE
- [x] egyptian-winged-disk-edfu / origin-of-horus / hymn-osiris /
      horus-death-resurrection / khnemu-famine / bekhten-princess /
      isis-nephthys-lament (Budge 9411 + 15932 ch. V verbatim)

### batch-106-egyptian-tales-1.json — DONE
- [x] egyptian-wax-crocodile / zazamankh-lake / djedi-resurrection /
      rut-tetet-triplets / eloquent-peasant (base)
- [x] egyptian-shipwrecked-sailor (deep) / egyptian-sinuhe-exile (deep)
      (Petrie 7386 verbatim)

### batch-107-egyptian-tales-2.json — DONE
- [x] egyptian-joppa-trick / doomed-prince (base)
- [x] egyptian-two-brothers (deep) / egyptian-setna-magic-book (deep)
      (Petrie 7413 verbatim)

NOTE: renamed during session: 'egyptian-zazamankh-lake' (Baufra's tale) was
cut as its own record, not merged into djedi; 'hymn-osiris' uses the long
9411 hymn (the 15932 limestone 'Child of the Earth Serpent' hymn was later cut in batch-115).

## SESSION 3 (continuation, 2026-11-13) — DONE — TARGET MET: 177/175

Validation: `04_qa_narratives.py` PASSED; `01_build_corpus.py` merged,
src/data/texts.json = 1419 texts, EGYPTIAN = 177 (deep 11, base 166).
npm run build clean. Sources added this session:
- osirisegyptianre00budg_djvu.txt + osirisandtheeg02budguoft_djvu.txt
  (Budge, Osiris and the Egyptian Resurrection vols. I-II, 1911 — IA djvu text)
- Mackenzie full text (Global Grey), Herodotus Book III windows (pg2707)

### batch-116-egyptian-osiris-mysteries.json (6; 2 deep) — DONE
osiris-passion-play (deep, stele of I-kher-nefert), denderah-mysteries (deep,
Khoiak corn-mummy liturgy), abydos-pilgrimage, peqer-tomb,
isis-many-names, circumcision-rite
### batch-117-egyptian-herodotus-3.json (5) — DONE
nitetis-deceit, psammenitos-cup, amasis-body-swap, cambyses-apis,
lost-army-ammon
### batch-118-egyptian-herodotus-2b.json (4) — DONE
ram-of-ammon, herakles-sacrifice-denial, asychis-brick-pyramid,
twelve-kings-labyrinth
### batch-119-egyptian-pt-expansions.json (9) — DONE
ladder-of-the-god, osiris-the-word, osiris-nepra-grain,
eye-of-horus-recovered, set-brother-of-osiris, souls-embrace-tattu,
weighing-of-words, horus-title-deed, isis-conceives-star
### batch-120-egyptian-cults-souls.json (6) — DONE
king-sacrifices-prisoner, king-dances-before-god, osiris-moon-god,
osiris-bull-apis, ka-double, spirit-souls-four-million
### batch-121-egyptian-royal-autobiographies.json (2) — DONE
pygmy-of-the-dances (Pepi II letter), una-royal-trial
### batch-122-egyptian-ethnography.json (6) — DONE
trial-of-osiris-full (7145 ch. V), crocodile-trochilus,
sacred-animals-burial, embalming-three-ways, anysis-ash-island,
piromis-genealogy
### batch-123-egyptian-empire-legends.json (4) — DONE
hatshepsut-female-horus, rameses-kadesh, bes-dwarf-god,
astarte-lady-of-horses (Mackenzie)
### batch-124-egyptian-chapters-extras.json (7) — DONE
transformations-chapters, souls-of-pe-nekhen, herfhaf-ferryman,
argo-of-osiris, temple-purity, mendes-goat-pan, pigs-of-dough
### batch-125-egyptian-final-expansions.json (6) — DONE
bronze-men-prophecy, moeris-lake, language-experiment,
hyksos-shepherd-kings, thoth-author-bd, preserved-body-myth
### batch-126-egyptian-judgment-hall.json (7; 1 deep) — DONE
hall-of-two-truths, origins-of-resurrection-belief (deep, 11277 ch. V),
euhemerus-doubt, riddle-of-the-hall, ani-before-osiris,
banishing-apophis-rites, single-stone-house
### batch-127-egyptian-serpents-wonders.json (6) — DONE
spitting-serpent-kheti, snake-worship, osiris-moisture-principle,
bd-amulets-list, ani-sail-tatu-prayer, pyramid-machines
### batch-128-egyptian-final-wave.json (6) — DONE
pert-em-hru-discovery, boat-of-millions, nephthys-barren-shore,
gods-egyptian-seniority, colchis-kin, osiris-usurps-powers

## SESSION 4 (2026-11-13) — 191/175; UI shows stale count if browser cache not cleared

Validation: QA PASSED; build_corpus merged (1433 texts); dist bundle verified
to contain the newest ids. NOTE: if the site shows fewer records than
texts.json contains, the browser is serving a cached bundle — hard-refresh
(Ctrl+Shift+R) or re-deploy dist/.

### batch-129-egyptian-thebes-cults.json (7; 1 deep) — DONE
great-mother-apat, amon-lunar-theology, deified-royals,
osiris-ancestor-god (deep), shabti-figures, monolith-omen, amasis-law-solon
### batch-130-egyptian-godman-doctrine.json (7; 1 deep) — DONE
osiris-god-man (deep, two-natures doctrine), byblos-papyrus-marshes
(Budge's philology), macrobius-eye-sceptre, spirit-burial-rubric,
heart-ab-weighing, bubastis-temple-grove, pine-of-isis-ritual

## OPTIONAL FURTHER VEINS (beyond target; not required)
- [ ] Budge OER vol. I ch. IX (ancestor-spirit), ch. XI (African belief) — Sudanethnographic, low myth value
- [ ] Coffin Texts deep paraphrase records (Book of Two Ways; Re-Osiris unity) —
      canonical trans. Faulkner 1973-78 copyrighted; passages would be pure paraphrase
- [ ] Setna II (Se-Osiris & the Sealed Letter) — demotic edition lending-only on IA
- [ ] 7145 ch. IX chapter-listing records (BD gates/halls)
- [ ] Herodotus II.117-120, II.157-176 remainders (Amasis' prodigies, temple gifts)
- [ ] Diodorus I.11-27 (Osiris retelling) — no clean PD English



Validation: `04_qa_narratives.py` PASSED; `01_build_corpus.py` merged,
src/data/texts.json = 1208 texts, egyptian = 103 (deep 8, base 95).
Additional sources downloaded & verified at collection time:
Validation: `04_qa_narratives.py` PASSED; `01_build_corpus.py` merged,
src/data/texts.json = 1208 texts, egyptian = 103 (deep 8, base 95).
Additional sources downloaded & verified at collection time:
## SESSION 2 (continuation, 2026-11-13) — DONE (67 more records, 36 -> 103 total)
- pg2707.txt — Herodotus, Histories vol. 1 (Macaulay, 1890), Book II read in targeted windows
- pg11277.txt — Budge, Egyptian Ideas of the Future Life (1899)
- mackenzie-full.txt — Mackenzie, Egyptian Myth and Legend (1913) via Global Grey (public domain)
- (Egyptian Magic djvu.txt on archive.org returned 404; Book of the Dead full Ani translation not on PG)

### batch-108-egyptian-plutarch.json — DONE (14 base records)
epagomenal-days, osiris-civilizer, chest-conspiracy, panic-chemmis,
isis-byblos-pillar, maneros-skeleton, dismemberment-papyrus,
horus-horse-dialogue, abydos-tomb-claims, saisis-veil-inscription,
vine-blood-enemies, ochus-apis, nile-allegory, technatis-curses
(all Budge's Plutarch translation, 9411 secs. VI-XXXIX, verbatim)

### batch-109-egyptian-herodotus-1.json — DONE (12 base records)
papremis-ares-mother, bubastis-festival-voyage, dodona-doves-thebes,
melampus-phallos-origin, phoenix-myrrh-burial, ibis-winged-serpents,
sesostris-empire, pheros-spear-blindness, proteus-helen,
rhampsinitos-thief, rhampsinitos-hades-dice, soul-three-thousand-years
(Macaulay Herodotus II verbatim)

### batch-110-egyptian-herodotus-2.json — DONE (10 base records)
cheops-tyrant-pyramid, cheops-daughter-stones, mycerinus-golden-cow,
mycerinus-oracle-lamps, sabacos-dream-departure, sethos-mice-miracle,
sun-shifted-four-times, chemmis-floating-island, rhodopis-slander

### batch-111-egyptian-graeco-roman-books.json — DONE (5 records)
book-breathings, book-traversing-eternity, festival-songs-isis,
splendid-spirit-osiris, wenamun-byblos (Budge Literature chs. V & X)

### batch-112-egyptian-bd-chapters.json — DONE (11 records)
bd-hymn-rising-sun, bd-litany-osiris, bd-hunefer-confession,
bd-four-apes-prayer, bd-heart-scarab, bd-imperishable-body,
bd-tet-amulet, bd-crocodile-spells, kingdom-of-osiris (7145),
bd-divine-youth-hymn (7145)

### batch-113-egyptian-future-life.json — DONE (4 records)
hymn-hapy-nile, god-almighty-epithets, nebertcher-evolutions (Nesi-Amsu
long version), neter-god-of-kings (Budge 1899)

### batch-114-egyptian-mackenzie.json — DONE (7 records)
memphite-ptah-heart-tongue, herakleopolis-creation, hershef-creator,
nut-shu-arch, sebek-crocodile-god, neith-veiled-goddess,
lay-of-the-harper (Mackenzie 1913 retellings, verbatim-marked)

### batch-115-egyptian-misc.json — DONE (6 records)
judgment-of-osiris (7145 chs. VI-VII), sacred-beetle, handless-judges,
ass-of-set, red-bulls-seal (Plutarch XXX-XXXI), hymn-osiris-earth
(15932 limestone hymn)

## [SUPERSEDED] Remaining veins from session 2 — all now cut (see SESSION 3)


## Original session-1 cut plan (superseded; all items above marked DONE)
- [ ] Plutarch secs. XXII-XXVIII (euhemerist explanation) & XL-LI: 2-3 allegory records
- [ ] Herodotus II remainder: 12-kings bronze-cup oracle + labyrinth (secs. 147-149),
      Memphis/Ptah court of Apis (sec. 153), Buto single-stone house (sec. 155)
- [ ] Budge, Osiris and the Egyptian Resurrection (1911, 2 vols): Book of Gates /
      Amduat hour-by-hour retellings, Khoiak Osiris mysteries, festival calendar
      (Opet, Beautiful Meeting, Sed festival) — fetch djvu.txt from archive.org
      (search item IDs; Egyptian Magic djvu 404'd, try alternatives)
- [ ] Coffin Texts selections (CT 1130, Book of Two Ways, Re-Osiris unity):
      deep paraphrase records citing de Buck + Faulkner 1973-78
- [ ] Setna II (Se-Osiris & the Sealed Letter): demotic text via IA lending copy of
      Hess / Griffith editions; paraphrase-record
- [ ] Herodotus III. Egypt anecdotes (Apries/Hophra, Amasis, Cambyses & Apis)
- [ ] Diodorus Siculus I.11-27 (Osiris retelling) — no clean PD English online;
      paraphrase-record citing Oldfather (copyrighted) if attempted
- [ ] Papyri of Ani full translation (Budge 1895): not on PG; IA lending only
- [ ] Mackenzie chs. XI (folk tales), XIX-XXIII (Island of Enchantment,
      Doomed Prince retellings) — skimmed but uncut (mostly redundant with
      Petrie/Budge cuts; cut only the distinctive passages)

## [SUPERSEDED] Deferred list from session 1 — all cut (see sessions 2-3)
- Coffin Texts selections (CT 1130, Book of Two Ways, Re–Osiris unity) — no public-domain
  full translation online; do as deep paraphrase records citing de Buck + Faulkner (1973–78).
- More Book of the Dead spells (7145 vol: check coverage; amuletic chapters).
- Amduat / Book of Gates hour-by-hour records (source: Budge Osiris & the Egyptian
  Resurrection, 1911 — locate PD copy; sacred-texts 403s).
- Festival & calendar stories (Opet, Sed festival, Khoiak Osiris mysteries, Beautiful
  Meeting of Horus and Hathor at Edfu/Dendera) — topic 10.
- Late-period: Sa-Osiris and the sealed letter, king Neferkare and Sasenet, Bentresh stela.
- Plutarch De Iside et Osiride full retelling records (Glyn trans. on Lacus Curtius — verify).
