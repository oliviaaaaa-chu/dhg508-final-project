# Korean Myth Collection — Progress Ledger

STATUS 2026-11-14: **COMPLETE — korean = 176 records (target 175 met).**
5 deep records + 171 base records across 12 batch files (batch-131 … batch-142).
Deep: korean-dangun-wanggeom (pre-existing), korean-ichadon-martyrdom-deep,
korean-simchung-sacrifice-deep, korean-chunyang-true-wife-deep,
korean-talgeui-kumiho-deep. One intentionally excluded restricted record
(korean-taebak-descent-deep — living Dangun veneration, Daejonggyo).
Validation: 01_build_corpus OK (2223 texts total); 04_qa_narratives PASSED
(2 warnings, both celtic, pre-existing).
New batches start at NN=131 (max existing is 130). Existing korean ids:
`dangun`, `jumong-founder`, `suro-gaya-founding`, `korean-wonder-tale`,
`korean-dangun-wanggeom` (deep), `korean-sun-moon`.

## Sources downloaded (data/raw/myths/korean/)
| File | Source | Words | Status |
|---|---|---|---|
| 52127-hulbert-history-korea-v1.txt | Hulbert, History of Korea vol.1 (1905), Gutenberg #52127 | 172k | pending |
| 52749-hulbert-history-korea-v2.txt | Hulbert, History of Korea vol.2 (1905), Gutenberg #52749 | ? | pending |
| 67141-griffis-corea-hermit-nation.txt | Griffis, Corea: The Hermit Nation (1882/rev.), Gutenberg #67141 | ? | pending |
| 51002-gale-korean-folk-tales.txt | Gale (trans.), Korean Folk Tales: Im Bang, 53 tales (1913), Gutenberg #51002 | 50k | pending |
| 55539-allen-korean-tales.txt | Allen, Korean Tales (1889): Chun Yang, Sim Chung, Hong Kil Tong, Hungbu, Rabbit legends, Wine Jug, Ching Yuh | 47k | pending |
| 67180-griffis-korean-fairy-tales.txt | Griffis, Korean Fairy Tales (1913?), 27 tales | 50k | pending |
| 47957-starr-korean-buddhism.txt | Starr, Korean Buddhism (1918) | ? | pending |
| 78208-winning-buddhas-smile.txt | Winning Buddha's Smile: A Korean Legend (1928) | 29k | pending |
| 56623-miln-quaint-korea.txt | Miln, Quaint Korea (1895) — folklore chapters | ? | pending |
| 58243-korea-review-1905.txt | The Korea Review, May 1905 | ? | pending |

NOT usable: 70498-gale-evergreen-tree.txt = Percy MacKaye American pageant (false hit).

## Batch plan (cut → write immediately)
- batch-131-korean-hulbert-v1-founding.json — Dangun cycle, Wanggeom, Gija, Wiman, Buyeo/Jumong cycle, Silla founders, Baekje, Gaya, Tamna/Jeju  [target ~30]
- batch-132-korean-griffis-fairy-tales.json — 27 tales  [~27]
- batch-133/134/135-korean-im-bang-a/b/c.json — 53 tales  [~54]
- batch-136/137/138-korean-allen-*.json — Rabbit legends, Wine Jug, Ching Yuh, Hungbu, Chun Yang, Sim Chung, Hong Kil Tong  [~30]
- batch-139-korean-shamanic-landscape.json — Samsin, Sansin, Chilseong, kut origins, Halla/Cheonjiyeon/Mani-san etc.  [~15]
- batch-140-korean-miracles-buddhism.json — Ichadon, Maheon, Wonhyo, Chajang, dragon-tomb etc.  [~12]
- batch-141-korean-miln-review.json — Miln + Korea Review + Starr extras  [~10]
- batch-142-korean-deep-flagships.json — 5–8 deep records (flagships + cluster stories)

## Checklist
- [ ] Hulbert v1 read + cut
- [ ] Griffis Fairy Tales read + cut
- [ ] Im Bang 53 tales read + cut
- [ ] Allen tales read + cut
- [ ] Shamanic/landscape cut
- [ ] Miracles cut
- [ ] Miln/Korea Review/Starr cut
- [ ] characters.json additions
- [ ] Validate 04_qa + 01_build
- [ ] Report

Running count: 6 existing + N new.
