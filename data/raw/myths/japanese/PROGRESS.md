# Japanese tradition — progress ledger

Target: 175+ records. **STATUS (2026-11-14): curated to 186 records / 175 target, 9 deep.**

User decision (2026-11-14): keep only the ~180–200 most important stories per
SKILL.md priorities (topics 1 Creation & 7 Cosmology, cross-tradition motif
clusters, flagship episodes). Corpus trimmed from 296 → 186.

Sources downloaded to `data/raw/myths/japanese/`:
- kojiki-clean.txt — Kojiki, Chamberlain trans. 1882 (Wikisource); main text = djvu pages 101–428
- nihongi-aston-vol1.txt / vol2.txt — Nihongi, Aston trans. 1896 (Internet Archive nihongi1asto / nihongi2asto)
- davis-myths-legends-japan.txt — Davis 1912, Gutenberg #45723
- ozaki-japanese-fairy-tales.txt — Ozaki 1908, Gutenberg #35853 (not cut; duplicates Davis's tale corpus)
- kwaidan-hearn.txt — Hearn 1904, Gutenberg #1210 (Hoichi/Yuki-Onna/Jikininki cut via Davis)
- mitford-tales-old-japan.txt — Mitford 1871, Gutenberg #13015 (deferred: historical legends, low myth relevance)
- Izumo Fudoki: NO public-domain full English translation located. Known gap; not padded.

## Final composition (186)

| Batch | Source | Records | Kept content |
|---|---|---|---|
| batch-130-japanese-kojiki-gods-a.json | Kojiki djvu 101–155 | 6 | full (creation gods, Kagutsuchi deep, Susanoo) |
| batch-131-japanese-kojiki-gods-b.json | Kojiki djvu 155–210 | 12 | full (Okuninushi cycle deep, kuni-yuzuri, Ninigi, Konohanasakuya, Hoori) |
| batch-132-japanese-kojiki-jimmu.json | Kojiki djvu 210–300 | 17 | full (Toyotama birth, Jimmu deep, Sujin era) |
| batch-133-japanese-kojiki-later.json | Kojiki djvu 290–428 | 41 | full (Yamato-takeru cycle deep, Jingū, Ōjin–Keitai) |
| batch-134-japanese-nihongi-gods-a.json | Nihongi Books I–II | 18 | full (variant cosmogonies deep, age-of-gods variants) |
| batch-135-japanese-nihongi-gods-b.json | Nihongi Books III–X | 32 | curated: Jimmu variants, Ōtataneko oracle, Mimoro snake-husband, Sahōhiko plot, sumo & haniwa etiologies, Ise shrine, Yamato-takeru variants, Jingū conquest, Chinese learning |
| batch-138-japanese-davis-a.json | Davis ch. I–XVIII + Urashima deep | 31 | curated: iconic folktales (Momotarō, Raikō, Yorimasa, Hagoromo, Tanabata, Yuki-onna, Kiyohime, fox cycle, Jizō, Benten, Seven Lucky Gods, festival origins) |
| batch-139-japanese-davis-b.json | Davis ch. XIX–XXXI | 21 | curated: Kōbō Daishi, Nichiren, Hoichi, Jikininki, Tokoyo, Kappa, Issunboshi, Kintarō, tanuki/kettle, fox-bride deep |
| batch-140-japanese-taketori-deep.json | Taketori Monogatari | 1 | Kaguya-hime flagship deep |
| (baseline, older batches) | Kojiki/Davis | 5 | izanagi-izanami, japanese-izanagi-izanami-yomi deep, amaterasu-cave, orochi-eight-forks, fuji-legend |

## Deep records (9)

japanese-izanagi-izanami-yomi, japanese-kagutsuchi-slaying,
japanese-okuninushi-ne-no-kuni, japanese-jimmu-eastward-expedition,
japanese-yamato-takeru-kuwagata, japanese-nihongi-creation-variants,
japanese-urashima-taro (reconstructed 2026-11-14 after loss during curation),
japanese-fox-bride-garden, japanese-taketori-kaguya.

## Curation log (2026-11-14)

- Dropped ~110 records: all Nihongi minor reign anecdotes (62→32 in batch-135)
  and the Davis folktale bulk (75→31, 56→21), keeping only iconic tales and
  records needed as variant anchors for deep records.
- Dropped redundant retellings of Kojiki episodes from Davis (Yamato-takeru
  quartet, Ninigi descent, Hoori, Ame-waka) and duplicate Urashima/Kaguya bases
  (their deep records carry the episodes).
- cross_refs pointing at dropped ids repaired (fox-gratitude → death-stone-fox,
  kaguya-bamboo-cutter → urashima-taro, Davis Yamato-takeru → Kojiki ids).
- All QA checks pass; corpus 2124 texts total.
