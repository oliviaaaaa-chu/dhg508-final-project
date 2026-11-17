# Melanesian — Progress Ledger

Target: 175+ records. **STATUS: MET — 180 records in src/data/texts.json (176 new cut this session + 4 pre-existing).** Corpus build (01_build_corpus.py) and deep-record QA (04_qa_narratives.py) both pass.

## Sources downloaded (data/raw/myths/melanesian/)

| File | Source | Status |
|---|---|---|
| dixon-oceanic-mythology.txt | Roland B. Dixon, Oceanic Mythology (1916), Part II Melanesia chs I–III, lines 5243–7125 | PENDING |
| codrington-melanesians.txt | R. H. Codrington, The Melanesians (1891), ch. X Mythology (line ~7295), plus tales in other chs | PENDING |
| brown-melanesians-polynesians.txt | George Brown, Melanesians and Polynesians (1910), chs on Solomon Islands & New Britain tales | PENDING |
| ker-papuan-fairy-tales.txt | Annie Ker, Papuan Fairy Tales (1910) | PENDING |
| fison-fiji.txt | Lorimer Fison, Tales from Old Fiji (1904) | PENDING |
| thomson-fijians.txt | Basil Thomson, The Fijians (1908), mythology chs | PENDING |
| haddon-headhunters.txt | A. C. Haddon, Head-Hunters Black, White and Brown (1901), Torres Straits myths | PENDING |
| seligmann-melanesians-bng.txt | C. G. Seligmann, The Melanesians of British New Guinea (1910), Koita/Motu tales | PENDING |
| williamson-mafulu.txt | R. W. Williamson, The Mafulu (1912), myths | PENDING |
| (landtman kiwai not openly downloadable on archive.org — skip or use sacred-texts) | — | SKIPPED for now |

## Cut stories

| Batch | Source section | Stories | Status |
|---|---|---|---|
| batch-143-melanesian-dixon-origins-a.json | Dixon ch I, origins of world & mankind | 22 | DONE |
| batch-144-melanesian-dixon-origins-b.json | Dixon ch I, things/death/flood | 19 | DONE |
| batch-145-melanesian-dixon-heroes.json | Dixon ch II, culture heroes | 9 | DONE |
| batch-146-melanesian-dixon-misc.json | Dixon ch III, misc tales | 13 | DONE |
| batch-147-melanesian-codrington-spirits.json | Codrington ch X (Spirits: Kahausibware, Qat cycle, Qasavara, Tagaro) | 21 | DONE |
| batch-148-melanesian-codrington-origins.json | Codrington ch XIX animal stories + tales of origins | 10 | DONE |
| batch-149-melanesian-codrington-wonder-a.json | Codrington ch XIX wonder tales I (Mota/Vanua Lava) | 9 | DONE |
| batch-150-melanesian-codrington-wonder-b.json | Codrington ch XIX wonder tales II (Maewo/Aoba) | 9 | DONE |
| batch-162-melanesian-ker-brown.json | Ker tales 1–5 + Brown ch XIV New Britain mythology | 12 | DONE |
| batch-163-melanesian-ker-tales.json | Ker: Flying Fish, Talking Bananas, Kakukaku, Wakeke, Wise Wagtail, Men of Gavi | 9 | DONE |
| batch-164-melanesian-ker-tales-b.json | Ker: Manubada, Twins, Crane, Toroa, Fairies, Cockerel, Land of Dead, Dakodako, Almonds, Cassowary, Coconut | 11 | DONE |
| batch-165-melanesian-ker-tales-c.json | Ker: Kapikoa, Mouse & Butterfly, Tauribolena, Brush Turkeys, Enchanted Pillow, Unlucky Man, Snake Child, Ant & Pheasant, Boar Slayer, Open Throat, Borevui, Mud People, Wamirans Few, Waidudu, Gelaruru, Three Sisters | 16 | DONE |
| batch-166-melanesian-fison-fiji.json | Fison: Dengei flood, Sun-Child (×2), Maui trilogy | 5 | DONE |
| batch-167-melanesian-thomson-haddon.json | Thomson Ndengei myth (×3) + Haddon Torres Straits star myths & Kwoiam saga | 7 | DONE |
| batch-168-melanesian-codrington-panoi.json | Codrington ch XV descents to Panoi + Maewo journey of the dead | 4 | DONE |

## Session log

- 2026-11-14: session start. 4 existing records (qat-creation, qat-marawa-canoe, tagaro-sea, melanesian-qat-banks-islands). Sources downloaded. Target 175–200.
- 2026-11-14: session end. **180 records** (target exceeded). All 9 source files read and cut; Dixon read in full, Codrington ch X & XIX & XV read in full (ch XI–XIV/XVI–XVIII not tale-dense), Brown ch XIV, Ker complete (all 39 tales), Fison key tales (canoes, Sun-Child, Beginning-of-Death; not: Livuka, Tongans, Samoa-pigs, Sacred Cat, Longa-poa, Matandua, Mosquitos), Thomson Ndengei myth, Haddon star myths + Kwoiam saga. Landtman Kiwai folk-tales not openly downloadable on archive.org (lending-only scan) — SKIPPED. Seligmann Koita/Motu tales and Williamson Mafulu downloaded but uncut — RESERVED for a continuation session if the tradition needs deepening. Deferred duplicates (cross-ref'd): Ker 'King of the Snakes' = Dixon Raudalo; Ker 'Jungle Boy' = Dixon Garawada; Codrington 'Taso' = Dixon qatu-twins; Codrington 'Winged Wife' = Dixon tagaro-sky-maiden; Codrington 'Rat and Rail' = Dixon banks-rat-rail; Codrington 'Hen and Chickens' = Dixon lepers-yam-kites; Codrington 'Tagaro's Departure' = ch X Maewo-departure record.
- New characters added to characters.json: tagaro, marawa, qong, mate, to-kabinana, to-karvuvu, ndengei (7; qat already existed). 458 total.
- Cluster coverage: flood (Qat's deluge, Baining tiny sea, Raudalo, Abaia, Tabuikor, Dengei, vungayali, Fison/Thomson), origin-of-death (Ambrym, old skin, Mate/Panoi, Baining, ingratitude-tree, Marawa's buried figures, death-canoes), descent-underworld (Kamakajaku, Samuku, loloa, Panoi descents, Maewo journey), sun capture (Dudugera, sun/moon origins), fire theft (Motu dog, Goga, serpent-belly, Emakong, Kapikoa, Rokomautu, Tavogivogi-adjacent), twins/duality (To-Kabinana/To-Karvuvu cycle, Qat & twelve Tangaro, Tagaro/Suqe, twins of Qatu, Kototabe & Kelokelo, Turukawa twins), swan-maiden/sky-wife (Tagaro-sky-maiden, Ghost-wife, Man-who-left-Heaven, Sun-child), world-serpent (Kahausibware, Ndengei, Raudalo, Abaia, Arebo, Betawerai, Takaro-mud-ten).
- Note: three duplicate batch NNs (143–150) overlap with parallel sessions; filenames carry the melanesian slug so no file collisions, but the audit caveat from SKILL.md step 10 applies.
