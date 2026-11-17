import json
p = 'src/data/characters.json'
d = json.load(open(p, encoding='utf-8-sig'))
ids = {c['id'] for c in d}

def C(i, tr, arch, ne, nz, re_, rz, be, bz, qe, qz):
    return {"id": i, "tradition": tr, "archetype": arch,
            "name": {"en": ne, "zh": nz}, "role": {"en": re_, "zh": rz},
            "blurb": {"en": be, "zh": bz}, "quip": {"en": qe, "zh": qz}}

new = [
C("kaiumars","persian","authority","Kaiumars","蓋尤馬爾斯","The first Shah, founder of crown and leopard-skin kingdom","最初的君王，王冠與豹皮王國的奠基者","A mountain king of the first days, awe-struck by sorrow.","山巔初王，痛失愛子而震懾於世。","By the highest of all names, I call upon my God.","我以至高之名呼喚吾神。"),
C("siyamak","persian","tragic-hero","Siyamak","西亞馬克","Son of Kaiumars, slain by Ahriman's Black Div","蓋尤馬爾斯之子，亡於阿赫里曼的黑魔","A bright youth cut down before his father's eyes.","明亮少年，未及長成便隕落。","My father's life is my own.","父親的生命便是我的生命。"),
C("hushang","persian","culture-hero","Hushang","胡尚格","Discoverer of iron, irrigation, and fire","鐵器、溝渠與火種的發現者","A culture-hero who struck fire out of flint.","自燧石中敲出火種的文化英雄。","This lustre is divine; worship it.","此乃神光，當崇之。"),
C("tahmuras","persian","culture-hero","Tahmuras","塔胡穆拉斯","Binder of the Div, tamer of beasts, learner of thirty scripts","縛魔者、馴獸者、三十文字的學得者","Rode Ahriman horsewise around the world.","以咒縛阿赫里曼，騎之環行天下。","Speak! I am the Binder of the Div.","我乃縛魔者！"),
C("jamshid","persian","culture-hero","Jamshid","賈姆希德","The greatest of the culture-heroes, founder of castes and Nowruz","百工四階與諾魯茲節的締造者","Throne borne to heaven by divs; Grace lost to hubris.","魔抬御座凌空，僭神而失天恩。","All hail me as the Maker of the world.","拜我為造世主吧！"),
C("zahhak","persian","villain","Zahhak","扎哈克","The serpent-shouldered Dragon-King of the thousand-year reign","肩生雙蛇的千年龍王","Ahriman's instrument; bound on Damawand till the end of days.","阿赫里曼之器；被縛於達馬萬德山待末日。","Feed them men's brains.","以人腦餵蛇。"),
C("iblis","persian","trickster","Iblis","伊布利斯","The fiend who tempers kings, cooks, and courtiers","誘惑君王、庖廚與朝臣的魔鬼","Every mask fits; every oath is a snare.","千面百態，誓約皆為羅網。","First promise, then my story.","先立誓，再聽言。"),
C("faridun","persian","culture-hero","Faridun","法里東","Smiter of Zahhak, divider of the world, founder of Mihrgan","誅龍縛魔、三分天下、創米赫爾甘節者","Ox-head mace in hand, he wrote justice across three realms.","牛首錘在手，公義布三邦。","His time hath not yet come: bind him.","其死期未至，縛之。"),
C("kawa","persian","culture-hero","Kava the Smith","鐵匠卡瓦","The smith whose apron became the Kawian standard","皮圍裙化為卡維戰旗的鐵匠","Leather on a spear: the banner of Iran.","矛尖懸皮：伊朗之旗。","The ruler here is Ahriman, God's foe!","此地之主乃阿赫里曼，神之敵！"),
C("iraj","persian","martyr","Iraj","伊朗支","The youngest son of Faridun, slain for Iran's crown","法里東幼子，為伊朗王冠而遇弑","Peace in one hand, a dagger in the other's.","一手持和，另一手執匕。","Hurt not e'en the grain-dragging ant.","勿傷負粒之蟻。"),
C("salm","persian","villain","Salm","薩爾姆","Elder brother of Iraj, lord of Rum and the West","伊朗支長兄，羅姆與西方之主","Envy in a crown is a crown of thorns.","王冠中的嫉妒是荊棘之冠。","The West is mine; Iran shall kneel.","西方歸我，伊朗當俯首。"),
C("tur","persian","villain","Tur","圖爾","The slayer of Iraj, ancestor of the Turanians","弑伊朗支者，圖蘭人之祖","A lion's courage, a brother's blood on the blade.","獅子之勇，刀刃卻沾手足之血。","Iran for the youngest? Never.","幼子得伊朗？休想！"),
C("minuchihr","persian","avenger","Minuchihr","米努奇赫爾","Grandson of Iraj, avenger of the house of Faridun","伊朗支之孫，法里東家族的復仇者","I have slain him as he slew Iraj.","以其弑伊朗支之法，我誅之。","Stay, miscreant!","止步，惡徒！"),
C("zal","persian","wise-elder","Zal","扎勒","The white-haired nursling of the Simurgh, counselor of kings","西摩爾格撫育的白髮智者","My trenchant blade shall ne'er behold sheath till the Resurrection.","復活之日以前，此劍不入鞘。","Think of me as girt and gone.","就當我已束帶啟程。"),
C("rudaba","persian","beloved","Rudaba","魯達貝","Daughter of Kabul, who let down her tresses for love","以秀髮垂牆迎愛人的喀布爾公主","I do not love his face and hair but him.","我愛的不是容顏，而是其人。","One hair of his is worth the world to me.","他一根頭髮勝過全世界。"),
C("rustam","persian","champion","Rustam","魯斯塔姆","The mightiest of the world's paladins, on Rakhsh","騎拉赫什的天下第一勇士","I am a host; I trample earth beneath dauntless Rakhsh.","我即一軍；駿蹄踏地。","My name is Cloud, if a cloud hath lion's claws.","吾名『雲』——若雲有獅爪。"),
C("sohrab","persian","tragic-hero","Sohrab","蘇赫拉布","The lion-boy of Turan seeking his father","圖蘭尋父的少年獅","I came like lightning and like wind I go.","來如閃電，去如疾風。","Who is my sire?","我生父是誰？"),
C("tahmina","persian","beloved","Tahmina","塔米娜","Princess of Samangan, mother of Sohrab","薩曼甘公主，蘇赫拉布之母","I have sacrificed my prudence to my passion.","我為情捨智。","Haply God may lay upon my breast a child of thine.","願真主賜我你的孩子。"),
C("sam","persian","champion","Sam","薩姆","The One-blow slayer of the Kashaf dragon, father of Zal","一錘斃龍的薩姆，扎勒之父","One blow suffeth.","一擊足矣。","The body is for death.","血肉之軀，終歸一死。"),
C("afrasiyab","persian","villain","Afrasiyab","阿弗拉西亞卜","The Turanian arch-foe, murderer of Siyawush","圖蘭大敵，弑西亞瓦什者","The time of turmoil is the time for me.","亂世正是我用武之時。","Float a ship in blood upon the plain!","讓鮮血在平原上成河！"),
C("siyawush","persian","martyr","Siyawush","西亞瓦什","The stainless prince who passed through fire and died on burning earth","過火自明而殉於焦土的無瑕王子","By the power of God I shall not feel the heat.","憑神之力，火焰不能傷我。","Name him Kai Khusrau.","為其取名卡伊霍斯勞。"),
C("kai-kavus","persian","authority","Kai Kaus","卡烏斯","The headstrong Shah of Mazandaran and the eagle-throne","馬贊德蘭與鷹輦登天的固執君王","Thrice hast thou been in trouble, yet thy head is unbowed.","三度罹禍，其首仍昂。","Who is Shah but I?","捨我其誰為王？"),
C("sudaba","persian","villain","Sudaba","蘇達貝","The queen whose desire and sorceries broke the house of Kaus","以慾與妖術傾覆卡烏斯家的王后","Love refused turns to poison.","被拒之愛化為毒。","He hath used witchcraft still!","他還在施妖術！"),
C("piran","persian","wise-elder","Piran","皮蘭","The Turanian wise man who sheltered Farangis and raised Kai Khusrau","庇護法蘭吉斯、撫育卡伊霍斯勞的圖蘭智者","High birth and excellence will show themselves.","高貴的天性終會顯露。","Thou dost embrace a shepherd's son.","你擁抱的可是牧人之子。"),
C("kai-khusrau","persian","sacred-king","Kai Khusrau","卡伊霍斯勞","Son of Siyawush, the avenger-king of the Kaianian line","西亞瓦什之子，卡揚王朝的復仇之王","Thy son will have the throne, and rule o'er fowl and fish.","吾子將登王座，君臨飛禽游魚。","Where'er there is a leopard the hearts of warriors are rent.","有豹之處，壯士心驚。"),
C("gudarz","persian","wise-elder","Gudarz","古達爾茲","The centenarian captain who dreamed of Khusrau's coming","夢見霍斯勞降臨的百歲老將","Worth is better than high lineage.","德行重於門第。","We are the quarry, and death hunteth us.","我等皆獵物，死亡在追逐。"),
C("div-white","persian","monster","The White Div","白魔","The mountain-tall captain of Mazandaran's sorcerers","馬贊德蘭魔軍之首，身高如山","I am the hope and terror of my troops.","我是魔軍之望，亦是其懼。","Be not in despair; I am coming.","莫慌，我來了。"),
]
added = [c for c in new if c['id'] not in ids]
d.extend(added)
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"added {len(added)} persian characters; total {len(d)}")
