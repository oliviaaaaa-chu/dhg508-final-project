# Celtic Corpus — Progress Ledger (DHG508 Motif Atlas)

Target: **175+ celtic records**. Session started 2026-11-13 with 38 records.

## Status — TARGET MET ✅

- Records before this session: 38
- **Current: 176 celtic records** (target 175+ reached; QA passed, build corpus merged into src/data/texts.json, vite build succeeds)
- Batches added this session: batch-78 through batch-101 (24 batch files, 138 new records)

## Sources (local, public domain)

- `gregory-gods-fighting-men.txt` — Lady Augusta Gregory, Gods and Fighting Men (1904), Gutenberg #14465
- `faraday-tain-1904.txt` — L. Winifred Faraday, The Cattle-Raid of Cualnge (1904)
- `leahy-heroic-romances-vol1.txt` / `vol2.txt` — A. H. Leahy, Heroic Romances of Ireland (1905-06), Gutenberg #5678/#5679
- `hull-cuchulain-hound-ulster.txt` — Eleanor Hull, Cuchulain the Hound of Ulster (1910), Gutenberg #52963
- `mabinogion-guest.txt` — The Mabinogion, trans. Lady Charlotte Guest
- `rolleston-celtic-race.txt` — T. W. Rolleston, Myths and Legends of the Celtic Race (1911)
- `stephens-irish-fairy-tales.txt` — James Stephens, Irish Fairy Tales (1920)

## Batch log (this session)

| Batch | Content | Records |
|---|---|---|
| batch-78-celtic-gregory-sidhe-a | Gregory Bk III-IV: Lia Fail, Tailltin, Bodb Dearg, Angus/Dagda Brugh, Corrgenn, Angus Og, Morrigu/Mechi, Aine | 7 |
| batch-79-celtic-gregory-sidhe-b | Aoibhell, Manannan many shapes, Tuag, O'Donnell's kern, thread-hunt, Cliodna's Wave, Tadg islands, Laeghaire | 9 |
| batch-80-celtic-gregory-fenian-a | Fianna trials, Bran & Sceolan birth, Sadbh/Oisin, Caoilte's Rabble, Finn's Advice | 5 |
| batch-81-celtic-gregory-white-strand-a | World-king invasion, Credhe poem, Conn Crither, Glas redemption, Tuatha aid | 5 |
| batch-82-celtic-gregory-white-strand-b | Ulster prince, Lochlann deaths, Labran eagle, Finn vs King of World, Credhe's lament | 5 |
| batch-83-celtic-gregory-huntings-a | Arthur hound-theft, Ceiscoran hags, Donn son of Midhir, Luibra abduction, Tara feast | 5 |
| batch-84-celtic-gregory-huntings-b | Cuanna allegory, banners/swords, Balor hazel shield, Lomna's head, Ilbrec bird-war, Caoilte healing | 6 |
| batch-85-celtic-gregory-huntings-c | Cruachan wolves, Ceann Slieve wedding battle, Scathach 3-string harp, Daireann mead, Red Woman | 5 |
| batch-86-celtic-gregory-oisins-children | Phantoms of elder house, Pigs of Angus, grey hair/Lake of Sorrow, Beara salmon shirt, Etain-Osgar | 5 |
| batch-87-celtic-gregory-diarmuid-a | Diarmuid birth/doom-boar, love-spot, ugly woman house, cup of Plain of Wonder, Gilla Decair | 5 |
| batch-88-celtic-gregory-diarmuid-b | Rock climb/enchanter well, Sorcha vs Greece, Quicken Trees, Grania riddles | 4 |
| batch-89-celtic-gregory-pursuit | Green Champions feats, three kings in bonds, Dubhros rowan, Searbhan killed | 4 |
| batch-90-celtic-gregory-pursuit-b | Fomor chess stake, Grania's sleep-songs, nurse's leaf, peace at Rath Grania | 4 |
| batch-91-celtic-gregory-wearing-away | Tailc, Meargach, Ailne lament, Ailne's revenge/Conan's cup | 4 |
| batch-92-celtic-gregory-end-fian | Almhuin quarrel, Goll's death, Gabhra/Osgar, Bran's death, Niamh's call, sleeping Fianna | 6 |
| batch-93-celtic-gregory-oisin-patrick | Bran Og & the giant bird, Oisin-Patrick arguments, Oisin's laments | 3 |
| batch-94-celtic-faraday-tain-a | Fedelm prophecy, ogam withe, sons of Nechta Scene, Fraech drowned, Morrigan rivalry + healing, Lug's healing sleep | 7 |
| batch-95-celtic-leahy-lesser-tain | Fraech fairy raiment, Eocho Bec Sid-horses, seven Maine/Regamon, Flidais cow, Regamna red woman | 5 |
| batch-96-celtic-mabinogion-a | Owain fountain + black knight + lioness, Peredur boyhood + witch's ring + salver-head | 6 |
| batch-97-celtic-mabinogion-b | Geraint sparrow-hawk + Enid road, Kilhwch at Arthur's gate + Olwen's flowers, Twrch Trwyth hunt, Mabon freed, Rhonabwy's dream, Math/Goewin punishment, Gronw's spear | 10 |
| batch-98-celtic-hull-ulster | Ness's regency trick, Shadow-land training, four-pronged pole, Nacrantal holly-spits, fairy swan-maidens, Deirdre walled garden, hound at bay | 7 |
| batch-99-celtic-faraday-tain-end | Rochad's woman-fight, Findabair truce terms, two bulls at Tarbga | 3 |
| batch-100-celtic-maeldun-voyage | Maeldun birth/rule, slaves island wind, cat & necklace, grudge mill, silvern column, women island clew | 6 |
| batch-101-celtic-rolleston-stephens | Eagle renewal, flaming rampart, glass bridge lady, Tuan's invasions history, Fionn's first exploits | 5 |

## Deferred (optional follow-ups)

- Fer Diad combat from Faraday (Leahy's Combat at the Ford from vol. 1 is the natural next cut — one record)
- Further Mabinogion cuts within already-told branches (e.g. Branwen's seven year feast, Manawydan shield episodes) — lower value, existing records cover them
- Additional immram islands (prophecy island, shouting birds) — 2-3 more possible from Rolleston ch. VII
- Hull ch. XXVII (Conla fight, Hull recension variant) — overlaps existing celtic-connla-waves

## Notes

- Convention: base records (shape A), 2-3 passages each with `note: "Condensed paraphrase of <source> <locus>; not verbatim."`, motifs 1-5 from src/data/motifs.json, symbolic-pin documentation in sensitivity.note.
- ids follow `celtic-<slug>`; Gregory-based periods recorded as "medieval Irish tradition; Lady Augusta Gregory retelling (1904)".
- Watch for duplicate ids against existing 38 (list in batch files above or grep src/data/texts.json).
