# Tibetan corpus — progress ledger

Target: ~175+ records. STATUS (2026-11-14): **179 records — TARGET MET**
(13 deep records + 166 base records). Corpus total: 3,767 texts.
Batch numbers used this run: 191-207 (skipping 191/192 numbering — O'Connor
batches became 199/200).

## Final batch inventory

| batch file | source | records |
|---|---|---|
| batch-193-tibetan-ralston-a.json | Schiefner/Ralston 1882 (Kusa, Adarsamukha, Clever Thief, Naga Janmachitra, Sudhana-Manohara DEEP) | 5 |
| batch-194-tibetan-ralston-b.json | Ralston ch. VI-X (Jivaka cycle x6, Visakha cycle x4, Mahaushadha cycle x4) | 14 |
| batch-195-tibetan-ralston-c.json | Ralston ch. VIII (snake-pouch, realm-restored, peacock test, wooing Visakha) | 4 |
| batch-196-tibetan-ralston-d.json | Ralston ch. XXVIII-L (jackal/monkey/bird/artist fables) | 18 |
| batch-197-tibetan-ralston-e.json | Ralston ch. IX-X (Mahakasyapa & Bhadra, Utpalavarna cycle) | 26 |
| batch-198-tibetan-ralston-f.json | Ralston ch. XI-XXI (Krisa Gautami, Susroni, Actor, Dumb Cripple, Rshyasringa, Visvantara, Two Brothers, Five Lovers...) | 19 |
| batch-199-tibetan-oconnor-a.json | O'Connor 1906 Stories I-XI | 11 |
| batch-200-tibetan-oconnor-b.json | O'Connor 1906 Stories XII-XXII | 11 |
| batch-201-tibetan-rockhill-buddha-a.json | Rockhill 1884, Dulva: World-Renovation DEEP, Sun-family, Kapilavastu founding, Birth DEEP, Asita, feats, goose, Four Encounters, ploughing, marriages, flight, Bimbisara, penance, milk-soup, Mara's defeat, Rahula, merchants, Mara-dies, Mutchilinda | 18 |
| batch-202-tibetan-rockhill-history.json | Rockhill 1884 ch. VII-VIII: Bon Shenrab, Nyatri Tsenpo, celestial kings, Lhathothori casket, Thonmi alphabet, Songtsen-Wencheng DEEP, Samye, Kamalashila debate, Ralpachen, Lang Darma; Li-yul annals: lake-prediction DEEP, Kusthana DEEP, ganta king, silkworms, exodus, Elapatra bridge DEEP, Kaushambi massacre | 18 |
| batch-203-tibetan-bardo.json | Bardo Thodol (Evans-Wentz/Kazi Dawa-Samdup 1927): Primary Clear Light DEEP, secondary light, six bardos, Vairochana d1, Vajra-Sattva d2, Ratnasambhava d3, Wrathful Herukas DEEP, Shinje judgment, Sidpa Bardo, Plato's Er parallel | 10 |
| batch-204-tibetan-waddell.json | Waddell 1895: Padma demon-taming DEEP, Vairocana exile, black-hat assassin, Pehar in the box, Nechung oracle, Gesar suitors | 6 |
| batch-205-tibetan-schlagintweit.json | Schlagintweit 1863: Lhamo legend DEEP, Tsangpa oath, Chakdor-Rahu DEEP, Dragsheds, Dudpos, Om mani prayer | 6 |
| batch-206-tibetan-landlamas.json | Rockhill Land of the Lamas 1891: mani walls, hairy savages, story-tellers, evening prayer | 4 |
| batch-207-tibetan-wheel.json | Waddell: Wheel of Life, Twelve Nidanas, Jataka-wheel | 3 |

## Pre-existing records (4)

mandhatar-crown-born, magician-pupil, wishing-trees-uttarakuru,
tibetan-monkey-rock-ogress (DEEP).

## Characters added (31, src/data/characters.json)

buddha, kusa, manohara, sudhana, druma, phalaka, adarsamukha, dandin,
bimbisara, vaidehi, amrapali, abhaya, jivaka, atreya, ajatasatru, devadatta,
visakha, prasenajit, janaka, mahaushadha, mahakarna, mahakasyapa,
utpalavarna, krisa-gautami, visvantara, madri, yashodhara, songtsen-gampo,
gesar, mahasammata, maudgalyayana. (Reused existing: padmasambhava, yama,
indra, brahma, mara.)

## Sections read log (2026-11-14)

- ralston-tibetan-tales-1882.txt: FULL (lines 3771-19008; ch. I Mandhatar
  skipped - existing record)
- oconnor-folk-tales.txt: FULL (lines 437-7584; love-song verses not cut)
- rockhill-life-buddha-1884.txt: ch. I-II (full), ch. IV excerpt
  (Devadatta/Ajatasatru), ch. VII-VIII FULL; ch. III, V, VI and ch. IV
  remainder NOT read (ministry miracles, church history, schools)
- waddell-buddhism-tibet-1895.txt: ch. II-III (rise of Lamaism, sorcery,
  pantheon excerpts), metaphysics/Wheel of Life; pantheon catalogue and
  monkhood/ritual chapters NOT read
- schlagintweit-1863.txt: ch. X only; ch. I-IX, XI-XVII NOT read
- evans-wentz-bardo-1927.txt: text of Book I (days 1-12 + wrathful intro),
  Intro excerpts (judgment, Plato's Er, rebirth symbolism); Sidpa Bardo
  details and Appendices NOT read
- rockhill-land-lamas-1891.txt: excerpts only (travel narrative; tales at
  lines 5720-5770, 11640-11920)

## Deferred / remaining material for a future run

- Rockhill ch. III-IV ministry miracles (Khoten vihara history already cut)
- Waddell pantheon catalogue (Mahakala, Yama, Kubera, dragsheds detail),
  monkhood and ritual chapters
- Schlagintweit ch. I-IX, XI-XVII (metempsychosis doctrine tables, Buddhas
  of Confession translation, astrology)
- Evans-Wentz Sidpa Bardo day-by-day, Appendices (Tibetan grammar of the
  text), Bar-do as ritual object
- Gesar epic episodes (Francke's Lower Ladakhi version, IA; dli.pahar.1671)
  — epic proper untouched beyond the Waddell notice
