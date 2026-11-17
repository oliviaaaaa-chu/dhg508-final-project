# Plateau Progress Ledger

Target: 175+ records. Start: 1 record (`coyote-rolling-rock`, already in corpus).
Current: 187 records in corpus (this session: 176 new across batches 221-231; parallel sessions added ~10 more).
TARGET MET (175-200 band).

## Sources downloaded (data/raw/myths/plateau/)
- judson-pnw-1910.txt — Katharine Berry Judson, Myths and Legends of the Pacific Northwest (1910), 25k words. Archive: https://archive.org/download/mythslegendsofpa00juds/mythslegendsofpa00juds_djvu.txt
- boas-teit-salishan-sahaptin-1917.txt — Franz Boas & James A. Teit (eds.), Folk-Tales of Salishan and Sahaptin Tribes, JAF Memoir 30 supplement (1917), 104k words. Archive: https://archive.org/download/folktalesofsalis00boas/folktalesofsalis00boas_djvu.txt — READ IN FULL (Thompson I.1-40, Okanagon II, Gould III, Sanpoil IV, Pend d'Oreille V, Coeur d'Alene VI, Sahaptin VIII, Nez Perce IX)
- boas-thompson-river-1898.txt — Teit/Boas, Traditions of the Thompson River Indians (1898), 71k words. Archive: https://archive.org/download/traditionsofthom00teit/traditionsofthom00teit_djvu.txt — NOT YET CUT (fuller variants of tales already cut from 1917 vol; candidate for future deep records)
- boas-kutenai-tales-1918.txt — Franz Boas, Kutenai Tales, BAE Bulletin 59 (1918). Archive: https://archive.org/download/kutenaitales00boas/kutenaitales00boas_djvu.txt — partially read (Nos. 26-37 cut); Nos. 45-77 (Boas collection: war on the sky, Yauk'ikam cycle, Coyote cycle) still available
- boas-chinook-texts-1894.txt — Franz Boas, Chinook Texts (1894). NOT USED: Chinookan is lower-river/coastal, not Columbia Plateau.

## Batches written (NN = batch number)
- batch-221-plateau-judson-a.json — 24 records (Judson 1910, Plateau tales)
- batch-222-plateau-boas-teit-thompson-coyote.json — 24 records (1917, Thompson Coyote Tales 1-28 + Sesulian/Sekulia)
- batch-223-plateau-thompson-okanagon-a.json — 20 records (1917, Thompson misc tales + Okanagon Coyote 1-3c,5-7)
- batch-223-plateau-thompson-okanagon-b.json — 12 records (1917, Okanagon 8,10 + epilogue + Creation/Origin/Sky War/Dirty-Boy/Bear-Woman/Eagle-Beaver/Mouse/Skwotilkwolana)
- batch-224-plateau-sanpoil-pend-oreille.json — 21 records (Gould Okanagon 1-3 + Sanpoil 1-17 + Pend d'Oreille 1)
- batch-225-plateau-pend-oreille-cda.json — 13 records (Pend d'Oreille 2-6 + Coeur d'Alene 1-13)
- batch-226-plateau-cda-extras.json — 10 records (Coeur d'Alene 14-21 incl. star myths, water-mysteries, rolling head)
- batch-227-plateau-sahaptin-a.json — 7 records (Sahaptin 1-3, Farrand)
- batch-228-plateau-sahaptin-b.json — 9 records (Sahaptin 4-9)
- batch-229-plateau-sahaptin-c.json — 10 records (Sahaptin 10-16)
- batch-230-plateau-nez-perce.json — 17 records (Nez Perce 1-22, Spinden)
- batch-231-plateau-kutenai.json — 9 records (Kutenai Nos. 26-37, Chamberlain/Boas)

## Validation status
- 01_build_corpus.py: PASSED (plateau 187 records in texts.json)
- 04_qa_narratives.py: PASSED (3 below-target warnings, none in plateau)

## Intentionally deferred (too short, fragmentary, crude, or duplicate content)
- Judson: Shasta/Pit River/Athabascan/coastal tales (out of Columbia Plateau scope); 'Coyote and the Dragon' & 'Coyote in the Buffalo Country' (already covered by coyote-rolling-rock)
- 1917 vol: Thompson (4) Deer note, (13) Berry-Pickers, (22) Coyote-Berries etymology, Woman-captured-by-Grizzly & Snake-Lover (cross-refs only), Striped-Face & Simon Fraser (historical), Okanagon (3b) Similkameen salmon variant, (9) Coyote-and-Old-One fragment-ref, Sahaptin Coyote-and-Log-Worm (cross-ref), Nez Perce (11) Buffalo Country (dup of Flathead cut), (20) notes, (23-25) speeches, crude episodes: Coyote-and-Fox-wives (3), Mallard-Ducks (10)
- Lower Fraser section (coastal Stalo): Transformer Story, Dog-Children, Fish-Man, Sturgeon, Deluge, sxo'exo'e Mask, etc.
- Kutenai: No. 18 Mosquito (narrator refused to tell it to adults), Nos. 38-44 dance/game descriptions, Nos. 45-77 (Boas's longer texts: war on the sky, Yauk'ikam cycle) — good future deep-record material

## Deep-record candidates (future session, from boas-thompson-river-1898.txt)
Mythological Age, Coyote and the Flood, Skunk/Ice People, or any of the cross-tradition clusters (flood: plateau-coyote-flood-thompson; fire-theft: plateau-coyote-steals-fire-thompson; dismemberment ethnogony: plateau-sahaptin-monster-tribes; sun-capture: plateau-cda-sun-frog-eye / plateau-kutenai-sun-chicken-hawk; origin-of-death: plateau-origin-of-death-thompson / plateau-cda-origin-death-twins / plateau-sahaptin-origin-death-fire)

