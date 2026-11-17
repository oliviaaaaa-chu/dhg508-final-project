# Islamic tradition — collection progress ledger

Target: 175–200 total (5 pre-existing). Started 2026-11-15.

## Source registry (all public domain, URLs verified 2026-11-15)
- Qur'an: J. M. Rodwell, The Koran (1861), Gutenberg #2800 — https://www.gutenberg.org/ebooks/2800 ; E. H. Palmer (1880), sacred-texts.com/isl/palm/
- Hadith: Sahih al-Bukhari / Sahih Muslim (Arabic originals, 9th c.); paraphrase; sunnah.com URLs
- Sira: Muir, The Life of Mahomet (1877 abridged, IA lifemahometfrom00muirgoog); Ockley, History of the Saracens (Bohn 1857/1890, IA historyofsaracen00ockluoft); Muir, The Caliphate (IA caliphateitsrise00muir)
- Qisas al-Anbiya: al-Kisa'i (Arabic, paraphrased); Isra'iliyat from tafsir tradition
- Historiography: Muir Caliphate; Ockley
- Sufi: Rumi, Masnavi I Ma'navi (Whinfield 1887/1898, Wikisource); Nicholson, The Mystics of Islam (1914, Gutenberg #67388); Saadi, Gulistan (Ross, Gutenberg #13060); Kalila & Dimnah (Keith-Falconer 1885, IA kalilahdimnahorf00bdpkuoft)
- Nights: Burton, Thousand Nights and a Night (1885-88, Gutenberg #3435-3450)

## Sections and batches
| batch | section | records | status |
|---|---|---|---|
| pre-existing | 5 records (quran-first-revelation, quran-yusuf-well, quran-nuh-warns, masnavi-reed-flute, islamic-adam-creation) | 5 | done |
| 248 | Qur'an prophets A (Cain-Able, Hud, Salih, Lut, Shu'ayb, Ibrahim, Kaaba, covenant, Sabbath-fish, Cow) | 11 | pending |
| 249 | Qur'an Yusuf + Moses A | ~10 | pending |
| 250 | Qur'an Moses B + kings (Dawud, Sulayman, Dhul-Qarnayn, Cave, Luqman) | ~10 | pending |
| 251 | Qur'an Jesus/John/prophets misc + parables | ~11 | pending |
| 252 | Hadith A | ~11 | pending |
| 253 | Hadith B | ~11 | pending |
| 254 | Sira A (birth→Aqaba) | ~11 | pending |
| 255 | Sira B (hijra→Uhud) | ~11 | pending |
| 256 | Sira C (trench→death) | ~10 | pending |
| 257 | Qisas al-Anbiya / Isra'iliyat | ~13 | pending |
| 258 | Deep records: creation 7 days, Nuh flood, Mi'raj, Last Judgment | 4 | pending |
| 259 | Historiography: caliphs/conquests | ~10 | pending |
| 260 | Historiography: Karbala/Abbasids/Andalus/misc | ~10 | pending |
| 261 | Sufi: Masnavi tales (Whinfield) | 7 | pending |
| 262 | Sufi saints (Nicholson/Attar) + Saadi Gulistan | ~9 | pending |
| 263 | Kalila & Dimnah (Keith-Falconer) | ~4 | pending |
| 264 | Arabian Nights (Burton) | ~14 | pending |

Running total: 5 + 172 = 177 records — TARGET MET (2026-11-15).

## Session report (2026-11-15)
- Islamic tradition extended from 5 to 177 unique records (target 175-200). All batches batch-248 to batch-265 written and merged; `01_build_corpus.py` wrote 4965 texts; `04_qa_narratives.py` PASSED (0 errors; 3 pre-existing warnings in other traditions).
- New characters added to characters.json (31 islamic figures, incl. muhammad, musa, ibrahim, maryam, isa, the four caliphs, bilal, husayn).
- Sections read/cut: Qur'an (42 story records via Rodwell 1861), Hadith (21 narrative incidents, sunnah.com paraphrases of Arabic originals), Sira (33 episodes via Ibn Ishaq/Ibn Hisham - Muir 1877/Ockley 1890), Qisas al-Anbiya + Isra'iliyat (14, Arabic paraphrase), Historiography (21, Muir Caliphate 1891/Ockley), Sufi (8 Masnavi tales via Whinfield; 6 saints' lives via Nicholson 1914/Tadhkirat; 4 Gulistan via Ross 1823; 5 Kalila wa-Dimnah via Keith-Falconer 1885), Arabian Nights (14, Burton 1885-88), deep records 4 (creation, flood, Mi'raj, Last Judgment - cross-ref clusters: flood, clay-humans, ascension/prophetic-vision, world-renewal/resurrection).
- Deferred/possible next expansions: more Sindbad voyages (4, 6), more Nights cycles (Ghanim, the City of Brass, Junayd merchant tales), Sahih Muslim-only hadith, Tabari qisas volumes 1-4 in detail, Ibn Kathir Qisas, al-Tha'alabi 'Ara'is al-majalis, Mughal/Persian devotional legends, more Masnavi books IV-VI tales.

