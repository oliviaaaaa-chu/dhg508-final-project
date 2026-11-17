# Taoist Tradition — Progress Ledger

**Status 2026-11-15: 205 taoist records in src/data/texts.json (204 base + 1 deep). Target (175–200) EXCEEDED. QA passed (0 errors, 0 warnings on taoist).**

## Existing records (4, pre-session)
- taotejing-before-heaven (TTC 25+42, base) — batch-04
- zhuangzi-leviathan-butterfly (base) — batch-04
- taishang-tractate-retribution (base) — batch-04
- taoist-laojun-hagiography (deep) — batch-19

## This session's batches (NN range 280–312; 280–305 renumbered from 254–279 to avoid collision with parallel islamic/hebrew/buddhist sessions)
| Batch | Source | Records |
|---|---|---|
| 280 | Zhuangzi ch. 1 (Giles 1889) | 4 |
| 281 | Zhuangzi ch. 2 | 6 |
| 282 | Zhuangzi ch. 3–4 | 6 |
| 283 | Zhuangzi ch. 5 | 4 |
| 284 | Zhuangzi ch. 6 | 7 |
| 285 | Zhuangzi ch. 7 | 3 |
| 286 | Zhuangzi ch. 9–10 | 4 |
| 287 | Zhuangzi ch. 11 | 3 |
| 288 | Zhuangzi ch. 12 | 5 |
| 289 | Zhuangzi ch. 13 | 4 |
| 290 | Zhuangzi ch. 14 | 5 |
| 291 | Zhuangzi ch. 15–16 | 2 |
| 292 | Zhuangzi ch. 17 | 7 |
| 293 | Zhuangzi ch. 18 | 5 |
| 294 | Zhuangzi ch. 19 | 9 |
| 295 | Zhuangzi ch. 20 | 8 |
| 296 | Zhuangzi ch. 21 | 8 |
| 297 | Zhuangzi ch. 22 | 8 |
| 298 | Zhuangzi ch. 23 | 2 |
| 299 | Zhuangzi ch. 24 | 11 |
| 300 | Zhuangzi ch. 25–26 | 7 |
| 301 | Zhuangzi ch. 28 | 13 |
| 302 | Zhuangzi ch. 29 (Robber Chê) | 3 |
| 303 | Zhuangzi ch. 30–31 | 2 |
| 304 | Zhuangzi ch. 32 | 7 |
| 305 | Zhuangzi ch. 33 | 2 |
| 306 | Tao Te Ching (Legge) chs 1,4,5,6,11,14,16,20,21,39,40,50,52,78 | 14 |
| 307 | Liezi Book I (Giles 1912) | 7 |
| 308 | Liezi Book II | 9 |
| 309 | Liezi Book III | 6 |
| 310 | Liezi Book IV | 4 |
| 311 | Liezi Book V | 5 |
| 312 | Liezi Books VI–VII | 12 |
| **Total new** | | **201** |

Characters added to src/data/characters.json (9, tradition=taoist):
confucius, liezi, huizi, yao, hsuyu, chienwu, lienshu, robberchi, kuangchengzi.
(Existing taoist characters used: laozi, zhuangzi, zhongkui; chinese-shared: huangdi, xiwangmu.)

## Sources in data/raw/myths/taoist/ (all verified at collection time)
- zhuangzi_giles_1889.txt — Gutenberg #59709 (all 33 chapters read & cut)
- taoteching_legge.txt — Gutenberg #216 (key cosmological chapters cut)
- liezi_giles_1912.txt — IA taoistteachings00liehuoft, trans. Lionel Giles (all 7 books read & cut)
- yangchu_forke_1912.txt — IA yangchusgardenof00yangrich (NOT yet cut — 19 short sections)
- werner_myths_legends_china.txt — Gutenberg #15250 (NOT yet cut; ch. VI used by chinese tradition)
- chinese_fairy_book_wilhelm.txt — Gutenberg #29939 (NOT yet cut; Daoist tales incl. Eight Immortals I & II, King of Huai Nan)
- liaozhai_giles_1880.txt — Gutenberg #43629 (NOT yet cut; Taoist tales: Taoist Priest of Lao-shan, Alchemist, Wonder-Worker, Theft of the Peach, Thunder God...)
- Giles, A Chinese Biographical Dictionary (1898) — NOT downloaded (IA); hagiographic entries for Chang Ling, Ko Hung, Hsü Hsün, K'ou Ch'ien-chih, Ma Ku, T'ao Hung-ching, Chang San-feng, Wei Po-yang...

## Avoid-list (already cut under other traditions — do NOT duplicate)
- chinese: Kun-Peng flight; Yugong; five isles & giant turtles (Liezi Tang Wen); Liezi Mu Wang Pian
  (Yanshi automaton); ten suns & Yi; Chang'e; Gonggong & Nüwa repair (Huainanzi version); Pangu;
  Pengzu / Chisongzi / Ning Fengzi (Soushen); Huangdi tripod dragon-ascension; Laozi plum-tree birth;
  Xiwangmu's visit to Han Wudi; millet pillow dream; Eight Immortals sea-crossing; Cowherd & Weaver;
  white snake; Meng Jiangnü; Liang-Zhu; Han Feizi Suiren fire; Werner ch. VI; Yanshi automaton.
- taoist (pre-session): TTC 25+42; butterfly; Hundun; Thai-Shang tractate; Laojun hagiography.
- NOTE: Nü Kua stone-repair / Kung Kung pillar was cut under taoist (batch-311, Liezi version)
  with cross-reference intent to chinese-huainanzi records — different text tradition, acceptable.

## Deferred / next-session ideas
- Yang Chu (Forke): vanity of fame, death the equaliser, the voluptuaries, four chimeras (~6–8 records).
- Werner (non-ch. VI): Eight Immortals individual legends, Lao-tze legend variants, Chung K'uei,
  Kitchen God, City God, Yueh-lao (Old Man under the Moon), Door gods (~12–15 records, folk religion).
- Chinese Fairy Book: The Eight Immortals (I) & (II), The King of Huai Nan (Liu An ascension),
  The Dragon after his winter sleep (~8 records).
- Liaozhai (Giles): ~12–15 Daoist tales.
- Deep records to build (shape B, priorities 1 & 7 + clusters):
  taoist-liezi-chaos-cosmogony (deepen; creation-chaos); taoist-huaxu-dream (otherworld-voyage);
  taoist-river-spirit-north-sea; taoist-nukua-kungkung (cross_ref chinese); taoist-kingmu-sky-palace
  (otherworld-voyage, cross_ref chinese King Mu); taoist-knowledge-travels-north; taoist-divine-man
  invulnerability (quest-immortality cluster); taoist-death-drum-basin + skull (origin-of-death);
  taoist-transmission-tao (ascension); Wei Huacun / Ge Hong / Zhang Daoling / Li Hong flagships
  (need Daozang-based secondary citations: Kohn 2000/2005, Bokenkamp 1997, Campany 2002).
- Motifs used that are NOT in motifs.json were removed and replaced with prophetic-vision /
  quest-immortality ("dream-vision", "faith-trial"); consider adding dedicated dream & ordeal motifs
  with Thompson codes if the motif dictionary grows.
