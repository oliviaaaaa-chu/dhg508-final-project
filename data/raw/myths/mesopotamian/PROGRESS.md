# Mesopotamian expansion — progress ledger

Tradition slugs: sumerian + babylonian + mesopotamian (combined "Mesopotamian" target 175-200).
Baseline 2026-11-14: 12 records (sumerian 4, babylonian 5, mesopotamian 3).

## FINAL STATUS (2026-11-14)
- New records: 165 across 17 batches (all base records, shape A; flagship deep records retained from earlier sessions)
- Combined Mesopotamian corpus: **177 records** (sumerian 101, babylonian 65, mesopotamian 11) — target 175-200 MET
- Validated: `py scripts/04_qa_narratives.py` PASSED (0 errors; 3 pre-existing warnings in other traditions)
- Built: `py scripts/01_build_corpus.py` -> src/data/texts.json, 3800 texts total
- Characters added: 46 new Mesopotamian characters (characters.json 493 -> 539)
- No new motifs required (existing 34 motifs sufficed)

## Sources verified (collection time 2026-11-14)
- ETCSL (Oxford): https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.N.N.N&charenc=j
  - Composition numbers verified: c.1.1.1-.4, c.1.2.1-.2, c.1.3.1-.5, c.1.4.1, c.1.4.1.1, c.1.4.1.3, c.1.4.3, c.1.4.4, c.1.5.1, c.1.6.1-.3, c.1.7.1/.3/.4/.6/.8, c.1.8.1.1-.5, c.1.8.1.5.1, c.1.8.2.1-.4, c.2.1.1-.2, c.2.2.2-.6, c.2.3.2.x, c.2.4.1.x, c.2.4.2.x, c.2.4.5.1, c.2.5.3.1, c.2.8.2.1, c.4.05.1, c.4.07.2, c.4.14.1/.3, c.4.16.1, c.4.24.1, c.4.28.1, c.4.80.1/.2/.4, c.5.2.4/.5, c.5.3.1-.7, c.5.5.1-.4, c.5.6.1/.3/.5, c.5.7.2/.3, c.5.9.1/.2, c.6.1*
  - Category wildcards (c.4.08*, c.4.15*, c.4.22*, c.4.32*, c.2.3.2*, c.2.4.1*, c.2.4.2*, c.1.4*, c.1.5*) used where exact composite numbers were "not found" on the server
- Muss-Arnolt/Wilson 1901 (Enuma Elish, Ishtar descent, Tammuz restored, seven evil spirits, hymn to Ishtar, penitential psalm, Gilgamesh epic): https://www.gutenberg.org/ebooks/10887
- Langdon 1917 (OB Gilgamesh tablet 2): https://www.gutenberg.org/ebooks/18897
- Jastrow & Clay 1920 (OB Gilgamesh tablets 2-3): https://www.gutenberg.org/ebooks/11000
- Budge 1921 (Babylonian Legends of the Creation): https://www.gutenberg.org/ebooks/9914
- Budge 1920 (Babylonian Story of the Deluge): https://www.gutenberg.org/ebooks/7096
- George Smith 1876 (Chaldean Account of Genesis: Etana, descent of Ishtar, Cuthean tablet, Berossus, Sargon birth, Siduri): https://www.gutenberg.org/ebooks/60559
- Jastrow 1898 (Etana, Nergal & Allatu, Tammuz, Zagmuk/Akitu, Maqlu/Shurpu, Labartu, Shamash hymns): https://www.gutenberg.org/ebooks/20758
- Mackenzie 1915 (Zu legend, Cuthean retelling): https://www.gutenberg.org/ebooks/16653
- Spence 1916 (Zu, Erra/Dibarra, Berossus Xisuthros): https://www.gutenberg.org/ebooks/45137
- King 1910 (History of Sumer and Akkad): https://www.gutenberg.org/ebooks/49345
- Rogers 1912 (Cuneiform Parallels: Adapa, Ishtar descent, Nergal, Sargon birth, Ludlul "Babylonian Job", prayer to every god, seven evil demons, Berossos deluge, Nabonidus): https://archive.org/details/cuneiformparall00rogegoog
- Johns 1904 (Hammurabi code prologue): https://www.gutenberg.org/ebooks/28674
- sacred-texts.com returns 403 to automated fetches — avoided; all citations above verified live at collection time.

## Batches written (NN unique; max was 190)
- batch-191-sumerian-enki-enlil.json — 10 records (Enki world order, Enki-Ninmah, Enki journey, Enlil-Ninlil x2, Enlil-Sud, Enlil hymn, Martu, Pabilsag, Ningishzida)
- batch-192-sumerian-inanna.json — 9 records (me theft, Ebih x2, Shukaletuda x2, Gudam, An, huluppu, Nin-me-sara)
- batch-193-sumerian-dumuzi.json — 8 records (Enkimdu, dream, capture, Geshtinanna, sisters, Bilulu, wedding, waking)
- batch-194-sumerian-ninurta-nanna.json — 10 records (Asag, cosmic mountain, return, turtle, Nanna journey, herds, song of hoe, Nungal, Utu, Nergal hymn)
- batch-195-sumerian-heroes.json — 14 records (Gilgamesh x7: Aga/Bull/Huwawa A x2/B variant/netherworld/death; Lugalbanda x4; Enmerkar x3)
- batch-196-sumerian-creation-debates.json — 13 records (flood, Grain-Sheep, Winter-Summer, Bird-Fish, Copper-Silver, Palm-Tamarisk, Hoe-Plough, grain origin, home of fish, heron-turtle, man and god, early rulers, Ludingira)
- batch-197-sumerian-laments-kings.json — 13 records (laments x5, king list, Lagash rulers, Ur-Namma death, Shulgi x2, Iddin-Dagan A, Gudea x2, Hammurabi hymn)
- batch-198-sumerian-misc.json — 10 records (Kes hymn, temple hymns, Ekur hymn, Shuruppak, farmer, ox-drivers, elegies x2, axe Nergal, dog Nintinuga)
- batch-199-babylonian-enuma.json — 10 records (creation epic cut into 10 episodes)
- batch-200-babylonian-atrahasis.json — 6 records (Igigu revolt, plague, famine, flood, fertility, Berossus flood)
- batch-201-babylonian-gilgamesh.json — 14 records (SB epic cut tablets I-XII)
- batch-202-babylonian-etana-adapa-nergal.json — 8 records (Etana x2, Adapa, Ishtar descent, Tammuz restored, Nergal x2, Shamash)
- batch-203-babylonian-anzu-erra-demons.json — 9 records (Anzu x2, Erra x3, seven demons, Lamashtu, Maqlu, Shurpu)
- batch-204-babylonian-wisdom.json — 8 records (Ludlul x3, prayer to every god, Ishtar hymn, penitential psalm, Ereshkigal liturgy, Tammuz hymns)
- batch-205-babylonian-legends-kings.json — 10 records (Sargon x2, Naram-Sin x3, Nabonidus, Hammurabi stele, Uruk wall, Akitu x2)
- batch-206-mesopotamian-misc.json — 4 records (antediluvian kings, Berossus Oannes, sacred marriage, Tammuz mourning)
- batch-207-sumerian-hymns.json — 10 records (Nanshe x2, Nisaba, Ninlil, fox proverbs, Ibbi-Suen, Ninisina, Asarluhi, Hendursaga)

## Sections intentionally deferred
- Poor Man of Nippur, Babylonian Theodicy, Dialogue of Pessimism, King of Battle (Purushanda), Tukulti-Ninurta epic: no public-domain translation coverage verified in the seven available sources; deferred rather than fabricating citations.
- Sumerian Gilgamesh/Huwawa tablet-by-tablet micro-cuts beyond the 3 provided: possible future deepening.
- Sumerian temple hymns: cycle covered as 3 records (corpus + Kes + Ekur); per-temple cuts possible in a future pass.
