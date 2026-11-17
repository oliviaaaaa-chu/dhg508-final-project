# Polynesian corpus — progress ledger

Target: 175+ records for tradition `polynesian`. Existing before this session: 13.

Sources in `data/raw/myths/polynesian/`:
- grey-polynesian-mythology.txt — Grey, Polynesian Mythology (1855), IA polynesianmythol00greyuoft
- white-ancienthistoryof01whit.txt / white-ancienthistoryof03whit.txt — White, Ancient History of the Maori vols 1, 3 (1887)
- mythssongsfromso00gill.txt — W. W. Gill, Myths and Songs from the South Pacific (1876)
- turner-samoa.txt — Turner, Samoa A Hundred Years Ago (Gutenberg #14224)
- oldsamoaorflots00staigoog.txt — Stair, Old Samoa (1897)
- tonganmythstales0000giff.txt — Gifford, Tongan Myths and Tales (1924)
- gut-westervelt-32601.txt — Westervelt, Legends of Ma-ui (1910)
- gut-westervelt-39195.txt — Westervelt, Legends of Gods and Ghosts (1915)
- gut-westervelt-66547.txt — Westervelt, Legends of Old Honolulu (1915)
- gut-westervelt-66516.txt — Westervelt, Hawaiian Legends of Volcanoes (1916)
- gut-westervelt-66357.txt — Westervelt, Hawaiian Historical Legends (1917)
- fornander-vol4.txt — Fornander Collection of Hawaiian Antiquities vol 4 (BPBM Memoirs)
- kumulipo-liliuokalani.txt — Kumulipo (Liliuokalani 1897 / Beckwith 1951 reference)

Batch numbering: max existing NN = 149 → start at 150.

## Sections read / cut

### Grey, Polynesian Mythology (1855) — DONE (all 23 narrative chapters + appendix skimmed)
- ch.1 Children of Heaven and Earth → batch-150 (5 recs)
- ch.2 Maui (sun/death pre-exist) → batch-151 (5 recs)
- ch.3-5 Tawhaki/Rupe/Kae → batch-152 (9 recs)
- ch.6-7 Tuwhakararo/Rata/Whakatau → batch-153 (7 recs)
- ch.8-11 Hawaiki quarrels/discovery/voyage → batch-154 (8 recs)
- ch.13 Hatupatu → batch-155 (3 recs)
- ch.14 Turi → batch-156 (3 recs)
- ch.15 Manaia, ch.16 Hine-moa → batch-157 (3 recs)
- ch.18-23 sorcerers/fairies/loves/elopement → batch-158 (6 recs)
- not cut: ch.12 Curse of Manaia (skimmed headers only — defer), ch.17 Maru-tuahu/Kahureremoa (defer)

### Westervelt Hawai'i books — DONE (Gods & Ghosts, Old Honolulu, Volcanoes, Ma-ui, Historical Legends)
- Gods and Ghosts (#39195) chs. I-IX, XI-XIV, XVI, XVIII → batch-159 (17)
- Old Honolulu (#66547) chs. II-X, XII, XVIII → batch-160 (11)
- Volcanoes (#66516) chs. I, III-V, VII-IX, XI-XIII, XV, XVII, XVIII, XX → batch-161 (12) + batch-162 Keoua/Kapiolani (2)
- Ma-ui (#32601) chs. 3, 7, 8, 9, 11, 12, 13 → batch-162 (5) + batch-174 (3)
- Historical Legends (#66357) chs. 3, 4, 7 → batch-168 (3)

### Gill, Myths and Songs from the South Pacific (1876) — DONE (Mangaia)
- ch. 1 Vari's children, ch. 4 Maui fire-secret, ch. 8 Hades/Avaiki, ch. 9 Veetini → batch-163 (7)

### Turner, Samoa A Hundred Years Ago (#14224) — DONE (selected tales)
- ch. 3-5 religion/gods, ch. 18-20 calendar/fire-stories/island-names → batch-164 (10) + batch-171 (5) + batch-175 (4)

### Gifford, Tongan Myths and Tales (1924) — DONE (selected cycles)
- Maui cycle, Tui Tonga, kava origin, Hikuleo, misc tales → batch-165 (8)

### Kumulipo (Liliuokalani 1897) — DONE
- chants 1-2, 9-10 → batch-166 (3)

### White, Ancient History of the Maori vols. 1 & 3 — DONE (selected)
- Tane cycle, Horo-uta/Kupe → batch-167 (6)

### Stair, Old Samoa (1897) ch. 9 — DONE
- Tuli creation, first death, Fafa leaping stone → batch-169 (3)

### Fornander Collection vol. 4 (BPBM Memoirs IV) — DONE (selected legends)
- Kana/Niheu, Hanaaumoe, Eleio, Kaululaau, Aiai, Pupualenalena, Kaulanapokii, Laukiamanuikahiki, island-birth mele, Umi, Lono, Kualii, Moikeha, Kepakailiula → batch-170 (5) + batch-172 (4) + batch-173 (8)

## Batch files written

batch-150 … batch-175-polynesian-* (165 new records) + 14 polynesian characters added to characters.json

## Counts

- Session start: 13 records (src/data/texts.json)
- After batch-175: 178 records for tradition `polynesian` — TARGET 175+ MET
- Validation: scripts/01_build_corpus.py PASSED (3050 texts merged, all 178 polynesian ids valid, category `myth`); scripts/04_qa_narratives.py PASSED; npm run build OK

## Deferred (for a later session)

- Grey ch. 12 Curse of Manaia; ch. 17 Maru-tuahu / Kahureremoa
- Fornander full cycles: Nihooleki, Wahanui, Hoamakeikikula, Kapuaokaoheloai, Kalanimanuia, Kawaunuiaola, Pupuhuluena, Kaipalaoa, Kumu-honua chant detail
- Westervelt Volcanoes ch. VI Pele's Tree, ch. X Pele genealogy, ch. XIV-XVI Hiilaka journey chapters, ch. XIX fish-ponds
- Turner ch. 6-17 ethnographic chapters (childhood, food, houses, canoes, government) — largely ritual-origin material, lower priority
- White vol. 3 South Island narratives (Nga-ti-mamoe, Kai-huanga raids)
