# Persian corpus � progress ledger

Target: 175+ records for tradition `persian`. Current: 152 (2026-11-14, session 3).
Existing pre-session ids (do NOT duplicate): vendidad-sixteen-lands, yima-vara-winter,
bundahishn-creation, zohak-serpents, zal-simurgh, rustem-sohrab, arda-viraf-vision,
chinvat-bridge, zoroastrian-bundahishn-creation, persian-rustam-seven-trials.

Sources saved under data/raw/myths/persian/ (all public domain):

| file | source |
|---|---|
| shahnama-warner-v1..v9.txt | The Shahnama of Firdausi, trans. A. G. & E. Warner (1905-1925), IA shahnama0Nfirduoft. NOTE: v1 = introduction + epic books Gaiumart..Garshasp; v2-v7 = translation (v2 ends with Part V of Kai Kaus + Giv's quest for Kai Khusrau); v8-9 = appendix/commentary/index. |
| shahnameh-atkinson-1886.txt | The Shah Nameh, trans. James Atkinson (1886) � source of the pre-existing base records. |
| avesta-vendidad-darmesteter-sbe4.txt | Zend-Avesta Part I (Vendidad), Darmesteter, SBE 4 (1880) |
| avesta-yashts-darmesteter-sbe23.txt | Zend-Avesta Part II (Sirozas, Yashts, Nyayeshs), Darmesteter, SBE 23 (1883) |
| avesta-yasna-mills-sbe31.txt | Zend-Avesta Part III (Yasna etc.), trans. L. H. Mills, SBE 31 (1887) |
| pahlavi1-bundahishn-west-sbe5.txt | Pahlavi Texts Part I (Bundahishn etc.), trans. E. W. West, SBE 5 (1880) |
| pahlavi2-dadestan-menog-west-sbe18.txt | Pahlavi Texts Part II (Dadestan-i Denig, Menog-i Khirad, Epistles), West, SBE 18 (1882) |
| pahlavi3-dina-mainog-west-sbe24.txt | Pahlavi Texts Part III (Dina-i Mainog-i Khirad etc.), West, SBE 24 (1885) |
| arda-viraf-haug-1872.txt | The Book of Arda Viraf, trans. M. Haug & D. Jamaspji (1872) |
| masnavi-whinfield-1898.txt | Masnavi i Manavi (Rumi), trans. E. H. Whinfield (1898) |
| sikandarnama-clarke-1881.txt | The Sikandar Nama e Bara (Nizami), trans. H. Wilberforce Clarke (1881) |
| laili-majnun-atkinson-1836.txt | Laili and Majnun (Nizami), trans. J. Atkinson (1836) |
| karaka-parsis-1884-v1/v2.txt | History of the Parsis, D. F. Karaka (1884) � Qissa-i Sanjan |
| herodotus-macaulay-pg2707.txt | Herodotus Book 1, trans. G. C. Macaulay (1890), Project Gutenberg |
| add_characters.py | one-off script that appended 27 persian characters to src/data/characters.json (done 2026-11-14) |

## Cut so far (82 new records, ids `persian-*`)

### G. Shahnameh (Warner) � DONE in part
- batch-157-persian-pishdadian-kings-a.json (10): Kaiumars/Siyamak, Hushang arts, Hushang fire-Sada, Tahmuras, Jamshid golden age, Jamshid fall, Zahhak-Iblis compact, Zahhak brain tribute/Kurds, Zahhak dream
- batch-158-persian-faridun.json (8): Faridun birth/Birmaya, origin, Kava & flag, crag/Tigris, binding Zahhak, Mihrgan, Sarv spell, dragon trial of sons
- batch-159-persian-iraj-minuchihr.json (5): world division, Salm/Tur conspiracy, Iraj slain, Faridun grief, Minuchihr birth
- batch-160-persian-minuchihr.json (3): Tur slain, Salm slain, Faridun death
- batch-161-persian-zal-rudaba.json (6): Zal at Mihrab, river damsels, tresses tryst, Sindukht discovers, Mihrab rage, stars promise elephant son
- batch-162-persian-rustam-birth.json (5): Sam & Kashaf dragon, Zal riddles, stars of Rustam, Rustam birth, White Elephant
- batch-163-persian-naudar.json (4): Mount Sipand salt, Naudar misrule, Afrasiyab takes Naudar, Kubad-Barman duel
- batch-164-persian-ighriras.json (1): Ighriras clemency & death
- batch-165-persian-garshasp-rakhsh.json (3): Pashang disowns Afrasiyab, Rakhsh caught, Kai Kubad fetched from Alburz
- batch-166-persian-haftkhan-a.json (5): Kaus tempted by div minstrel, White Div blindness, Course 1 lion, Course 2 ram/spring, Course 3 dragon, Course 4 witch
- batch-167-persian-haftkhan-b.json (5): Course 5 Ulad, Course 6 Arzhang, Course 7 White Div+cure, Rustam envoy, Mazandaran boulder
- batch-168-persian-kaus-flights.json (3): Hamavaran captive, Rustam three kings, eagle-throne flight
- batch-169-persian-sohrab-a.json (2): Tahmina night, Sohrab birth
- batch-170-persian-sohrab-b.json (2): Sohrab sets out, Gurdafrid/White Castle
- batch-171-persian-sohrab-c.json (3): Sohrab overthrows Rustam, elixir refused, Rustam's lament
- batch-172-persian-siyawush-a.json (3): Sudaba temptation, fire ordeal, spares Sudaba
- batch-173-persian-siyawush-b.json (3): polo prowess, dream & parting, slain by Gurwi
- batch-174-persian-kai-khusrau.json (2): Piran saves Farangis, shepherd-king before Afrasiyab
- batch-175-persian-avenging.json (3): Rustam reigns over Turan, Zawara oath & harrying, Gudarz dream

### Avesta / Pahlavi � DONE in part
- batch-176-persian-bundahishn.json (3): ox lament, Gayomart, Mashya & Mashyoi (deep-priority creation topics)
- batch-177-persian-yashts.json (2): Tishtrya vs Apaosha, Verethraghna ten forms

## REMAINING (resume here)
1. Shahnameh vol. II remainder: Giv's quest & bringing Kai Khusrau to Iran; Kai Khusrau's accession & vengeance (Farud cycle is v3); Siyawush revenge details (Rustam slew Sudaba, Pilsam). ~6-8 records.
2. Shahnameh vol. III: Kai Khusrau homage; Farud & Tus on the mountain; snowstorm; Bizhan & Manija (3); battle of twelve rukhs. ~10-12 records.
3. Shahnameh vol. IV: Twelve Rukhs (2-3); Piran's death; Kai Khusrau's ascension into the mountain (ESSENTIAL - sacred-kingship); Lohrasp. ~8 records.
4. Shahnameh vol. V: Zarduhst comes to Gushtasp (2-3 deep records � prophet-vision cluster); war of religion (Zarir slain, Bidirafsh); Asfandiyar freed; Asfandiyar's Seven Courses; Asfandiyar vs Rustam & death; Bahman. ~12-15 records.
5. Shahnameh vol. VI: Darab & Alexander birth; Dara vs Sikandar (3); Dara slain by ministers; Dara's last wishes; Sikandar wonders (phonix? hermit? Brahmans); Sikandar's death. ~10-12 records.
6. Shahnameh vol. VII: Bahram Gur cycle (Lambak, Baraham the Jew, lions/wine, shoemaker, Azada the huntress, seven palaces/music, death in the bog) ~8-10; later Sasanians (Khosru Parviz & Shirin?, Hormizd martyrdom?, Mahuy Suri usurpation & Chosroes II death, Yazdigird, last Sasanians & the fall). ~10 records.
7. Vendidad (SBE 4) extras: Fargards III-XXI (earth renewal, contracts, Zarathushtra's miracle birth & Ahriman's temptation XIX, dog XIII-XIV, Keresaspa XV, corpse rites XVIII, medicine XX). ~10-12 records.
8. Yasna (SBE 31): Hom Yasht (Vivanhvan/Zarathushtra/Vistasp, Keresaspa); Ox's Song (Y 29 - pairs with bundahishn ox lament, cross_ref); Yasna 19 Ahunavar revelation (pairs with bundahishn I 21); confession of faith. ~6 records.
9. Bundahishn (SBE 5): Frashegird/renovation of the universe (ESSENTIAL eschatology, deep record; read chs. XXX, XXXIV end); Tishtrya/Zamestan conflicts ch. VII-XII; rivers/mountains/regions; Keresaspa & the awakening of Zahhak (end-times, pairs with binding-zahhak). ~6 records.
10. Menog-i Khirad + Dina-i Mainog-i Khirad (SBE 18/24): soul's three nights; Chinvat bridge judgment details; heaven & hell mansions; 61 Questions of Ohrmazd (creation Q&A). ~6 records.
11. Arda Viraf extras (Haug 1872): heaven mansions; hell punishments; return & the faith restored. ~3 records.
12. Sikandarnama (Clarke 1881): Nizami's Alexander cycle ~8 records.
13. Laili & Majnun (Atkinson 1836): 3-4 records.
14. Masnavi (Whinfield 1898): Creation of Adam; Joseph cycle; Solomon & hoopoe; death stories. ~6-8 records.
15. Herodotus Book 1 (Macaulay): Cyrus exposed infancy; Astyages' dream; Harpagus banquet; Cyrus' death; Persians' customs (sacrifices, Magi); Darius' horse trick. ~6 records.
16. Qissa-i Sanjan (Karaka v1): flight to India; sacred fire Iranshah; the palms/pigeons parley. ~3 records.

## Session log
- 2026-11-14 (session 1): sources downloaded (24 files); 82 new base records written across batches 157-177 (all `myth`, Warner/Darmesteter/West paraphrase, Traditional Chinese zh, symbolic pins documented); 27 persian characters added to characters.json; 04_qa_narratives.py PASSED; 01_build_corpus.py merged -> persian count 85 / target 175; total corpus 3041. NOTE: v1-v2 of Warner heavily cut; vols III-VII and Avesta/Pahlavi extras, Menog, Sikandarnama, Laili-Majnun, Masnavi, Herodotus, Sanjan all pending (see list above).

## Session 2 additions (2026-11-14, +55 records, batches 178-190)

- batch-178 (6): Kai Khusrau homage; Div Akwan sea-trick; Div Akwan slain; Bizhan-Manija tryst; Bizhan in the pit; Giv & Gurgin's lie
- batch-179 (4): Farud views the host; Farud slain & Jarira; snowstorm on the Kasa Rud; Piran's night-attack
- batch-180 (1): Rustam hurls the boulder, frees Bizhan, night-attack on Afrasiyab's palace
- batch-181 (4): Human slain by Bizhan; Gudarz shoots Piran's steed; Piran's charnel & Gurwi executed; Kai Khusrau's mountain ascension
- batch-182 (4): Zarduhst appears (prophet cluster); Zarir slain by Bidirafsh; Bidirafsh slain; Asfandiyar's dragon stage
- batch-183 (4): Simurgh stage; Simurgh heals Rustam; tamarisk arrow; Asfandiyar's last wishes
- batch-184 (6): Dara slain by ministers; Dara's last wishes; Israfil & the Gloom stones; Gog-Magog barrier; Speaking Tree; Sikandar's coffin & lament
- batch-185 (8): Bahram Gur accession & tax remission; Lambak & Baraham; gipsies from Hind; Bahram Gur's death; chess & Buzurjmihr; Khusrau Parwiz & Shirin; Barbad the minstrel; Khusrau sent to Taisafun
- batch-186 (3): Vendidad XIX temptation; soul's three nights & the many-sided bridge (Dadestan XX-XXI); Bundahishn XXX resurrection
- batch-187 (4): Masnavi - Song of the Reed; four angels & the handful of earth; Moses & the Shepherd; Elephant in the Dark
- batch-188 (4): Herodotus - Astyages' dream; Dareios' horse; Tomyris; Magi & Persian customs
- batch-189 (5): Qissa-i Sanjan; Laili-Majnun schoolroom; Majnun's cave & father's grave; Farvardin Fravashis; Nizami's Sikandar birth
- batch-190 (2): Dara vs Sikandar (Warner); Nizami Canto XXX on Dara's murder

Validation: 04_qa_narratives.py PASSED; 01_build_corpus.py merged -> persian 140, corpus 3116. 27 persian characters added in session 1; additional persons referenced but not yet in characters.json (e.g. asfandiyar, arjasp, zarir, bizhan, manizha, gurgin, kai-khusrau added; still to add: khusrau-parwiz, shirin, shirwi, barbad, bahram-gur, yazdagird, luhrasp, gushtasp, bishutan, bahman, nastur, bidirafsh, farud, jarira, tukhar, dara, sikandar, fariburz, gustaham, human? (added), farud etc.)

## REMAINING to 175+ (resume here)
1. Warner vol. III remainder: Kamus of Kashan cycle (Tus arrayed, sorcery against the host, Rustam vs Ashkabus, Kamus slain); Rustam vs Khan of Chin; Puladwand wrestling. ~10 records.
2. Warner vol. IV remainder: Fariburz vs Kulbad & other paired rukhs not yet cut; the Great War of Kai Khusrau vs Afrasiyab (crossing the Jihun; final duel; Afrasiyab's end; Garsiwaz's death). ~8 records.
3. Warner vol. V: Asfandiyar's wolf/lion/witch/snow/river stages (3 more); Brazen Hold assault; Rustam & Shaghad (the accursed arrow-tree betrayal, 2-3 records). ~7 records.
4. Warner vol. VI: Ardashir Papakan cycle (Papak's dream; the worm of Haftwad; Ardawan slain) ~5; Nushirwan's justice ~2.
5. Warner vol. VII: Bahram Gur's hunts (Azada-type episodes, the seven palaces are not in Warner - cut onager-shooting feats); Khan of Chin war; Shangul & the wolf. ~6 records.
6. Vendidad: Fargards III, V, VII (Zarathushtra's miracle birth), VIII, IX, XIII-XIV (dog), XV (Keresaspa), XVI (disease), XVIII (funerals), XX (medicine). ~10 records.
7. Yasna (Mills SBE 31): Hom Yasht; Ox's Song (Y 29); Ahunavar revelation (Y 19); confession of faith. ~4 records.
8. Bundahishn: Tishtrya/Zamestan conflicts; rivers & mountains; Keresaspa & Zahhak's awakening (pairs with binding-zahhak). ~4 records.
9. Menog-i Khirad + Arda Viraf extras: heaven mansions; hell torments; 61 questions. ~5 records.
10. Herodotus: Harpagus banquet (Astyages feeds him his son); Cyrus' youth (judges the herdsman); kings' oaths & Magi dream of Astyages' fall. ~3 records.
11. Sikandarnama (Clarke): Sikandar & the Brahmans; the Water of Life per Nizami; Sikandar's death per Nizami. ~3 records.
12. Laili-Majnun: the lovers' death & reunion at the grave. ~2 records.
13. Rumi Masnavi: Joseph cycle; Solomon & the hoopoe; the merchant & the parrot. ~4 records.

## Session 3 additions (2026-11-14, +12 records, batches 191-192)

- batch-191 (8): Asfandiyar's wolves, lions, witch, snow, river-and-Gurgsar stages; Brazen Hold merchant stratagem & Arjasp slain; Rustam & Shaghad (pitfalls; last arrow pins Shaghad to the tree)
- batch-192 (4): Hom Yasht three pressers (Yima, Thraetaona, Keresaspa); wicked soul meets her sin-maiden at dawn (Dadestan XXV); Vendidad XIII dog/hedge-hog; Herodotus Harpagos banquet

Validation: QA PASSED; build merged -> persian 152, corpus 3821. Persons referenced but not yet in characters.json (to add when continuing): asfandiyar, arjasp, gurgsar, bishutan, shaghad, zawara, zarir, nastur, bidirafsh, bizhan, manizha, gurgin, khusrau-parwiz, shirin, shirwi, barbad, bahram-gur, yazdagird, dara, sikandar, farud, jarira, tukhar, kaveh (kawa added), kai-kubad, luhrasp, gushtasp.

## Session 4 additions (2026-11-14, +12 records, batches 193-194)

- batch-193 (8): Rustam on foot slays Ashkabus; Kamus lassoed & slain; Kafur the man-eater & Bidad; Puladwand uprooted; Khusrau crosses the Jihun; Gang-bihisht fortress-paradise; the secret souterrain; Hum's lasso - Afrasiyab & Garsiwaz slain
- batch-194 (4): Vendidad III five joys/five griefs of the earth; he who sows corn sows holiness; the corpse carried alone & thirty paces; Bundahishn XXXIV twelve thousand years & zodiac of kings

Validation: QA PASSED; build merged -> persian 164, corpus 3833.
