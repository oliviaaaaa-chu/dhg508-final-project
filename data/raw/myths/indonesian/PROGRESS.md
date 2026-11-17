# Indonesian Expansion Ledger (target 175+, from 4 records as of 2026-11-15)

Anchor PD sources (downloaded in this folder):
- pg2530/pg2539 Wallace, Malay Archipelago (1869) — Ke/Goram/Ceram/Alfur legends
- pg3307 Hose & McDougall, Pagan Tribes of Borneo (1912) — Dayak/Kenyah/Kayan myth
- malaymagic-skeat-1900.txt — Skeat, Malay Magic (1900) — Malay cosmogony/spirits/rites
- malay-annals-leyden-1821.txt — Leyden trans. of the Malay Annals (1821); cleaner text at Wikisource "Malay Annals"
- raffles-history-java-vol1/vol2-1817.txt — Raffles, History of Java (1817), ch. IX–X (religion, wayang, legendary history, kris)
- marsden-history-sumatra-1784.txt — Marsden, History of Sumatra (1784)

## Batches (NN unique; max NN before run = 216)
| batch | scope | status |
|---|---|---|
| 217 | Malay Annals pt 1 (Leyden/Wikisource) | DONE (14) |
| 218 | Malay Annals pt 2 + Badang/Pasai | DONE (14) |
| 219 | Skeat Malay Magic (Malay cosmogony/rites) | DONE (11, 2 deep) |
| 220 | Raffles: Javanese cosmogony, wayang pantheon, kris | DONE (9) |
| 221 | Old Javanese Ramayana kakawin episodes | DONE (13) |
| 222 | Wayang Mahabharata / Pandawa episodes | DONE (13) |
| 223 | Court kakawin + Javanese folk | DONE (16, 2 deep) |
| 224 | Sundanese | DONE (6, 2 deep) |
| 225 | Minangkabau | DONE (5, 2 deep) |
| 226 | Batak | DONE (8, 2 deep) |
| 227 | Dayak/Borneo (Hose) | DONE (10, 1 deep) |
| 228 | Wallace east (Lombok krises deep, Aru) | DONE (8, 1 deep) |
| 229 | Sulawesi (Sawerigading deep, Toar & Lumimuut deep, Toraja creation deep, Bugis flood) | DONE (8, 2 deep) |
| 230 | Bali & Nusa Tenggara (Barong/Rangda deep, Balinese Ramayana, Dewi Sri, Timor crocodile deep, Sasak, Sumba) | DONE (10, 2 deep) |
| 231 | Cluster fills (Batara Kala deep, Ratu Kidul, Gunung Ledang, dema Maro deep, smiths, Raffles Sundanese block) | DONE (10, 2 deep) |
| 232 | Annals pt 3 + Raffles kris/Kelud + Skeat rice-soul | DONE (10) |
| 233 | Final wave (dalang, Hose deified ancestors/river dragon/batu tuloi/Bali Flaki, Annals birth & testament) | DONE (7) |
| 234 | Annals pt 4 (Avidichu chests, three golden gifts, Malacca founding/conversion, Skeat semangat, Hose supreme-being) | DONE (7) |

FINAL STATE (2026-11-15): indonesian = 179 records in src/data/texts.json (target 175+ MET).
21 deep records (incl. pre-existing indonesian-hainuwele). 18 new characters added to characters.json (sinta…calon-arang).
QA: PASSED (0 Indonesian warnings; 3 pre-existing warnings in other traditions).
Sections read: Malay Annals ch. 1-9 (Wikisource), Skeat ch. I-II + rice-soul, Raffles vol. II ch. X + Bali appendix, Hose & McDougall mythology chapters, Wallace vol. I-II (Lombok, Aru, Macassar, Matabello), Marsden Batta chapter, Scidmore (Borobudur/Mendoet/Tidar/Papandayan), UNESCO La Galigo register.
Remaining growth headroom (next session): Annals ch. 10-30 (Tuah cycle, Portuguese fall), Balinese lontar literature, Nias/Mentawai/Enggano, Sasak babad, Hikayat Hang Tuah episodes, more kaba (Anggun/Cindua variants), La Galigo deep episodes, Sangirese/Ternate lore.

Running total of new records: 127 (target 171+ → 175 total).

Existing 4 records: wayang-ramayana-java, malay-annals-sang-sapurba, dewi-sri-rice, indonesian-hainuwele.
Characters in characters.json (indonesian): bataraguru, semar, rangda — extend in run.
