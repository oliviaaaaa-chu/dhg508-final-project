# Yoruba progress ledger

Target: 175+ yoruba records (start: 7 — 6 base + 1 deep; existing ids:
obatala-creation, shango-thunder, ifa-divination-odu, obatala-alamorere,
shango-cloud-palace, odudua-ife-cradle, yoruba-ife-creation).

All sources downloaded to data/raw/myths/yoruba/. Burton 1865 dropped
(proverbs only, no tales).

## Sections checklist

| Source (file) | Section | Status | Cut ids |
|---|---|---|---|
| ogumefu-1929-yoruba-legends.txt | tales I-XL (40 tales) | DONE | batch-131 (I-XIV), batch-132 (XV-XXVIII), batch-133 (XXIX-XL) |
| ellis-1894-yoruba.txt | ch. II Chief Gods | DONE (19 records) | batch-134 |
| ellis-1894-yoruba.txt | ch. III Minor Gods | DONE (in batch-134) | batch-134 |
| ellis-1894-yoruba.txt | ch. VI Egungun/Oro/Abiku | DONE (7 records) | batch-135 |
| ellis-1894-yoruba.txt | ch. XIV Folk-lore tales | DONE (10 records) | batch-136 |
| dennett-1906-black-mans-mind.txt | ch. XIX-XXIII + Johnson appendix | DONE (15 records) | batch-137 |
| dennett-1910-nigerian-studies.txt | ch. VI-VII, XV-XVI (odus, igba, Obatala, Oko/Oke) | DONE (9 records) | batch-143 |
| frobenius-1913-voice-vol1.txt | ch. X Foundations of religious life | DONE (in batch-139) | batch-139 |
| frobenius-1913-voice-vol1.txt | ch. XI Kingly Thunder-God | DONE (9 records) | batch-138 |
| frobenius-1913-voice-vol1.txt | ch. XII Idea of the World | DONE (in batch-139) | batch-139 |
| frobenius-1913-voice-vol1.txt | ch. XIII Holy City (Ife) | DONE (5 records) | batch-140 |
| frobenius-1913-voice-vol1.txt | ch. XIV Archaeological finds | DONE (4 records) | batch-144 |
| johnson-1921-history.txt | Part I ch. I-IV (origins, religion, government) | DONE (12+4 records) | batch-141, batch-144 |
| johnson-1921-history.txt | Part II-III (Moremi, Sango, Aole curse) | DONE (16 records) | batch-142 |

## Session notes

- Yoruba count: 175 records (target met). 168 new base records in
  batches 131-144; 7 pre-existing.
- Next batch number: 145.
- Deferred (frontier for a later session): deep (shape-B) narratives for
  yoruba priority topics — currently only yoruba-ife-creation is deep.
  Suggested deepening list: yoruba-aole-curse-three-arrows,
  yoruba-moremi-esinmirin-vow, yoruba-shango-fire-pile-resurrection,
  yoruba-igba-broken-ife, yoruba-edju-two-friends-cap,
  yoruba-illu-olokun-birthplace.
- QA note: py scripts/04_qa_narratives.py reports duplicate-id ERRORS in
  JAPANESE batches (batch-130/131/132/135/138 from another session) —
  unrelated to yoruba; all yoruba ids are unique and 01_build passes.
- burton-1865 dropped (proverbs only).
- Sacred-texts.com blocks scripted fetch (403) — use archive.org copies only.
- Category convention for yoruba batches: `myth-religion` (matches existing
  yoruba records; pipeline accepts).
- Tradition slug: `yoruba`. All records must be new ids (check src/data/texts.json).
