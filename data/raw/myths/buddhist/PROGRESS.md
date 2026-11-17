# Buddhist tradition — progress ledger (target 175+ records)

**Status: COMPLETE — 191 buddhist records in src/data/texts.json (as of 2026-11-15).**
Target 175-200 met. 7 deep records. Build + QA green.

Started 2026-11-15 from 4 records (mahakapi-jataka, kisa-gotami,
lotus-burning-house, buddhist-awakening-parinibbana). Sources downloaded to
data/raw/myths/buddhist/ (see RECORD_SPEC.md for the file table).

## Source sections & cut stories (all DONE)

| # | Batch | Source section | Stories | Notes |
|---|---|---|---|---|
| 1 | batch-254-buddhist-jataka-vol1.json | Jataka vol 1 (Chalmers trans., Jatakas 1-150) | 27 | vol 1 = Chalmers, NOT Rouse (title pages verified) |
| 2 | batch-255-buddhist-jataka-vol2.json | Jataka vol 2 (Rouse, Jatakas 151-300) | 26 | |
| 3 | batch-256-buddhist-jataka-vol3.json | Jataka vol 3 (Francis & Neil, 406-475) | 20 | |
| 4 | batch-257-buddhist-jataka-vol4.json | Jataka vol 4 (Chalmers, 476-537) | 10 | 9 renamed-duplicate records removed (see below) |
| 5 | batch-258-buddhist-jataka-vol5.json | Jataka vol 5 (Chalmers, 497-537) | 7 | 9 records (506/509/514/519/527/530/531/536 + dup 537) restored to batch-268 |
| 6 | batch-259-buddhist-jataka-vol6.json | Jataka vol 6 (Cowell, 538-547) | 8 | Vessantara (547) is a DEEP record; 542, 546 skipped (very long) |
| 7 | batch-260-buddhist-dhammapada-b1.json | Buddhist Legends Books 1-2 (Dhp 1-30) | 12 | |
| 8 | batch-261-buddhist-dhammapada-b2.json | Books 3-10 (Dhp 33-142) | 15 | |
| 9 | batch-262-buddhist-dhammapada-b3.json | Books 13-26 (Dhp 173-414) | 13 | Books 11-12 gap in the IA scan |
| 10 | batch-263-buddhist-digha-cosmology.json | Digha Nikaya suttas | 8 | Agganna (DEEP) + Cakkavatti (DEEP); DN 16 skipped (existing record) |
| 11 | batch-264-buddhist-nidanakatha.json | Nidanakatha (Rhys Davids 1880) | 7 | Sumedha prophecy is DEEP; awakening/parinibbana not recut (existing record) |
| 12 | batch-265-buddhist-lotus-parables.json | Lotus Sutra (Kern 1884) | 8 | burning house skipped (existing record); Kern chapter numbering differs from Kumarajiva |
| 13 | batch-266-buddhist-biography-episodes.json | Buddhacarita (Cowell 1894) + Romantic Legend (Beal 1875) | 8 | Cowell item on IA is the Sanskrit edition; English translation taken from SBE 49 (IA buddhistmahy01asvauoft) |
| 14 | batch-267-buddhist-mahavamsa.json | Mahavamsa (Geiger 1912) | 10 | Vijaya landing (DEEP) + Dutthagamani (DEEP) |
| 15 | batch-268-buddhist-jataka-vol5-restored.json | restored Jatakas 506/509/514/519/527/530/531/536 | 8 | passage lengths fixed to 40-200 words |

## Deduplication note

Two parallel agents cut overlapping Jataka numbers 506/509/514/519/527/530/531/536/537
(vols 4-5 numbering). Reconciliation: kept the passage-fixed versions
(plain slugs, restored in batch-268) for 506/509/514/519/527/530/531/536, and
kept batch-257's `buddhist-jataka-537-mahasutasoma`. The renamed duplicates
(-vow, -emptying-benares, -six-tusks, -sambula-leper, -ummadanti-beauty,
-samkicca-hells, -kusa-jataka, -kunala-birds) and `537-maha-sutasoma` were
removed from batch files and from texts.json.

## Session state / deferred

- 191 records total; 7 deep (incl. priority topics: Agganna = creation,
  Cakkavatti = eschatology, Sumedha = bodhisattva career charter).
- Not used (sources thin or absent in public domain): Jatakamala (Speyer
  English translation not on Internet Archive; Sanskrit editions only),
  Vimalakirti Sutra (no public-domain full English translation),
  Milarepa/Padmasambhava hagiographies (covered by `tibetan` tradition records),
  Jataka 542 Khandahala and 546 Maha-Ummagga (very long; cut next session if
  depth wanted).
- Characters added to characters.json (buddhist tradition): ananda, sariputra,
  rahula, mahapajapati, suddhodana, maya-devi, sujata, cunda-smith,
  brahma-sahampati, sakka, vidhura, temiya, vessantara, anathapindika,
  visakha-dak, mara-army, maitreya-b, asoka, mahinda, dutthagamani,
  vijaya-lanka, kuveni, vimalakirti-b, sadapd, nanda-b.
- New motif added: karma-retribution (code E731).
