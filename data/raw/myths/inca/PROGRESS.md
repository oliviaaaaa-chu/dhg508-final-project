# INCA PROGRESS LEDGER

Target: >175 records (tradition `inca`). Status: **176 records — TARGET MET** (2026-11-14).
7 deep records + 169 base records. QA passed (`04_qa_narratives.py` exit 0); corpus merged into
src/data/texts.json (total corpus 3050 texts). 12 new Inca characters added to src/data/characters.json
(412 total): inti, mamquilla, illapa, pachacamac, cuniraya, cavillaca, pariacaca, huallallo, huascar,
atahuallpa, huaynacapac, mamahuaco.

## Sources downloaded (data/raw/myths/inca/)
- [x] sarmiento-1907-history-incas.txt (History of the Incas, trans. C.R. Markham 1907; Gutenberg #20218)
- [x] markham-1873-narratives-rites-laws.txt (Molina Fables & Rites / Salcamayhua Antiquities / Avila Huarochiri / Polo Report; Gutenberg #79927)
- [x] cieza-1864-travels-part1.txt (Travels of Cieza de Leon, trans. Markham; Gutenberg #48770) — NOT yet cut (part 1 provincial origins)
- [x] cieza-1883-second-part-incas.txt (Second Part, Chronicle of Peru — the Incas; Gutenberg #48785)
- [x] garcilaso-1871-royal-commentaries-vol1-djvu.txt (First Part Royal Commentaries, trans. Markham; IA firstpartroyalc01markgoog) — partially cut
- [x] garcilaso-1871-royal-commentaries-vol2-djvu.txt (vol 2; IA firstpartofroyal02vega) — NOT yet cut
- [x] acosta-1880-moral-history-vol2-djvu.txt (Natural & Moral History vol 2 books 5-6, Hakluyt Soc. 1880) — partially cut
- [x] markham-1856-cuzco-djvu.txt (Cuzco: A Journey..., 1856) — NOT yet cut
- [x] markham-1910-incas-of-peru-djvu.txt (The Incas of Peru, 1910) — NOT yet cut
- [x] spence-1913-myths-mexico-peru.txt (Gutenberg #53080) — Peru chapters cut
- [x] spence-1910-mythologies-mexico-peru.txt (Gutenberg #36386) — NOT yet cut

## Line maps
- markham-1873: Molina 573-2678 | Salcamayhua 2679-4518 | Avila/Huarochiri 4519-5380 (ends abruptly) | Polo 5381-6068 | index skip
- sarmiento: chs I-LXIX, narrative lines ~1228-7400
- garcilaso vol1: books/chapters marked "CHAPTER" ~221-...; Chanca war book ~2360-2760; Pachacamac ~7600-7930

## Batches (all done)
| batch | source section | records |
|---|---|---|
| (4 pre-existing: batch-05, batch-23) | Sarmiento creation/Paccari-tampu deep | 4 |
| batch-150 | Molina: deluge, Tiahuanaco, sun-speech, stones, two sons, Canaris, Ancasmarca, sun-not-god, Susurpuquio, diviners, confession | 11 |
| batch-151 | Molina: Mantucalla, Yahuayra, Situa expulsion, sancu oath, Situa prayers, mummies | 6 |
| batch-152 | Molina: Huanacauri vigil, huarachicu, chocanaco, soul/Supay, Moro-urco, mojocati, Mama Huaco maize | 7 |
| batch-153 | Molina: rutuchico/quicuchicu, marriage, Ccapac-cocha, huaca resurrection apostasy, witch cure, excels-is-huaca | 6 |
| batch-154 | Salcamayhua: Purunpacha, Tonapa x2, rainbow/stone, Cuzco founding, golden plate/windows, pacarisca, apachitas, death prayer | 8 |
| batch-155 | Salcamayhua: huaca interrogation, Ruca baptism, Tonapa Vihinquira, Yahuar-huaccac birth, Chanca beautiful youth, Pachacuti name, amaru, mourning, eagle-serpent | 9 |
| batch-156 | Salcamayhua: ship & book, famine/Amaru Tupac, Colla humiliation, Huarmi-auca, gold dust burial, Hualpaya dream | 6 |
| batch-157 | Salcamayhua: coronation wedding, Mama Cuca refusal, Pachacamac oracle, Yahuar-cocha, butterfly box, mummy marriage, Aclla outrage, messenger drums, grease divination, chillca insult, Spaniards as Viracocha | 11 |
| batch-158 | Avila/Huarochiri: Huallallo, Cuniraya in rags, Cavillaca lucma, animal decrees, Urpi-huachac, 5 days dark, llama flood, five eggs, fox diagnosis | 9 |
| batch-159 | Avila/Huarochiri: drinking contests, deer/stone, storm flood, hail flood of Huarochiri, Choque Suso canal | 5 |
| batch-160 | Polo: Hanan/Hurin, Pururaucas title, lands of Sun & Inca, ccapac-llama law, ayllu sowing rule | 5 |
| batch-161 | Sarmiento: Canaris flood, sun-moon ashes, Taguapaca, Cacha fire, Urcos bench, sea-foam departure, Sinchi liberty, Cuzco valley tribes, quipu library | 9 |
| batch-162 | Sarmiento: indi falcon, Ayar Cachi window, Ayar Uchu Huanacauri, gold staves, Ayar Auca stone, Mama Occlo heart, Copalimayta | 7 |
| batch-163 | Sarmiento: Manco stone/Bimbilla, Sun promise to Lloqui, Mayta child-Hercules, indi hamper, Inca Rocca Hanan split | 5 |
| batch-164 | Sarmiento: child sold to Ayamarcas, tears of blood, Chimpu Orma rescue, Pahuac murder, Viracocha night apparition, flight to Xaquixaguana | 6 |
| batch-165 | Sarmiento: Ancoallo standard, Cusi rebuke, Susurpuquio mirror, Chanan-ccuri-coca, warriors sent by Viracocha, spoils treading, Asto-huaraca heads, oracle crowns, sucanca/intihuatana, golden doors | 9 (1 deep-adjacent) |
| batch-166 | Sarmiento: purucaya of seven, Chuqui Ylla serpent, triumph treading, Rocca kills Urco, jar of ulti, Chuchi Ccapac Llasa-huasi | 6 |
| batch-167 | Sarmiento: Tupac presented by Sun, eyebrows blown, Antarqui, jawbone of a horse, flower death-song, Condin Savana, Coaquiri false Pachacuti | 7 |
| batch-168 | Sarmiento: lion city, Huayna Capac named, Pinto drum | 3 |
| batch-169 | Garcilaso: lice tribute, pururaucas skepticism, Yahuar-pampa, drinking with the Sun, blood omen fringe | 5 |
| batch-170 | Garcilaso: Pachacamac invisible, Cuismancu peace, devil in the corners | 3 |
| batch-171 | Cieza II: Amazon women, sun from Titicaca, white man of stature, Cacha fire/waves, worse than Supais, slings of gold, winged Ayar Cachi, zaziy fast | 8 |
| batch-172 | Acosta: unnamed God, thunder sling & mace, shepherd stars, Aclla house | 4 |
| batch-173 | Spence 1913: three eggs, Yarma dismemberment, Intipampa, razed village | 4 |
| batch-174 | DEEP flagships: creation cycle, unu pachacuti flood, Cavillaca cycle, sacred year, pururaucas/Chanca war, mummies & Sun's dinner | 6 deep |
| batch-175 | Cari & Zapana, oracle procedure, dinner of the Sun, roads of the Inca, obsequies of Pachacuti | 5 |

## Coverage notes
- Priority topics 1 (Creation) & 7 (Cosmology/Eschatology): heavily covered (Tiahuanaco cycle deep, flood deep, five ages, soul/Supay afterlife, oracle systems, huaca theology).
- Cross-tradition clusters: flood (Sarmiento/Molina/Avila/Canaris/Ancasmarca + Warrau-adjacent), clay-humans (Tiahuanaco), dismembered-giant (Yarma son-of-sun crops), descent-underworld (Supay hell), sun-moon rivalry (ashes), world-serpent (amaru, moro-urco, Canacuay serpent, jaguar star), resurrection (huaca-resurrection apostasy, Korobona parallel in amazonian), divine-marriage (sister-marriages, guacamayo women, Choque Suso), prophetic-vision (Susurpuquio mirror, butterfly box, ship-and-book), spirit-possession (huaca possession, oracle procedure), culture-hero (Tonapa cycle, Cuniraya, white man of stature), sacred-kingship (coronation, fringe, mascapaycha).
- Sections intentionally deferred: Cieza part 1 (provincial origin legends, ~1.1MB, Gutenberg #48770) — next session; Garcilaso vol 2 (Atahuallpa/Vilcabamba era) and remaining Garcilaso vol 1 books; markham-1856-cuzco and markham-1910-incas-of-peru; spence-1910; Betanzos (Spanish only, 1880 Jimenez de la Espada ed.); Guaman Poma (KB Copenhagen facsimile).
- Note: a pre-existing broken JSON file (batch-166-amazonian-brett-warau.json, unescaped quote; batch-167-melanesian-thomson-haddon.json, trailing comma) was repaired to unblock the build.

## Next session suggestions
- Cut Cieza part 1 provincial origin legends (batch-176+, ~25-30 records possible).
- Garcilaso vol 2 + markham-1910 + cuzco-1856 (~20 records; Vilcabamba, Cabello-type sun-eggs, quipus detail).
- Betanzos Spanish (Suma y Narracion) for the Pachacuti/Tupac Yupanqui palace-cycle variants.
- Huarochiri MS full English via Salomon-Urioste citation only (copyrighted); extend the Chaupiñamca cycle from Markham's partial text.
