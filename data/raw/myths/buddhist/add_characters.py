import json
p='src/data/characters.json'
d=json.load(open(p,encoding='utf-8'))
ids={c['id'] for c in d}
new=[
("ananda","buddhist","attendant","Ananda","阿難","Buddha's beloved attendant","侍佛比丘","Remembered every discourse for the rest of us; still had to awaken on his own.","替我們記下每一部經；仍須自行覺悟。","First in hearing, last in striving.","多聞第一，精進稍遲。"),
("sariputra","buddhist","sage","Sariputta","舍利弗","Foremost in wisdom","智慧第一","The Buddha's chief disciple, sharpest of the sharp, asked for the parables.","佛陀上首弟子，智慧第一，常啟問譬喻。","'Vast is the ocean; deeper still the Doctrine.'","『海深，法更深。』"),
("rahula","buddhist","youth","Rahula","羅睺羅","Buddha's son and novice","佛子沙彌","Named 'fetter'; became the first novice and outgrew his name.","名為『繫縛』，後成首位沙彌，超越其名。","A fetter only while it holds you.","縛人者，惟其執耳。"),
("mahapajapati","buddhist","kin","Mahapajapati Gotami","摩訶波闍波提","Buddha's foster-mother, first bhikkhuni","比丘尼初祖","Raised the Buddha, then raised the order of nuns until he could not refuse.","育佛成長，復育比丘尼僧團，使佛不能拒。","Half the sangha began with her refusal to sit down.","尼僧之半，始於她不肯坐下。"),
("suddhodana","buddhist","ruler","Suddhodana","淨飯王","King of the Sakyas","釋迦國王","A king who tried to fence fate out of a prophecy, and lost.","欲以宮牆拒預言之王，終不敵命。","You cannot cage an awakening.","覺者非籠中所囚。"),
("maya-devi","buddhist","mother","Queen Maya","摩耶夫人","Mother of the Buddha","佛母","Dreamed the white elephant, died seven days after the birth, teaches from Tushita heaven.","夢白象入胎，產後七日歿，於兜率天說法。","Every Buddha is born from a dream of an elephant.","佛之降生，皆自夢象始。"),
("sujata","buddhist","giver","Sujata the milkmaid","牧牛女善生","Offered the milk-rice","獻乳糜者","Her bowl of milk-rice ended six years of starving; she gave it for a tree-spirit and got a Buddha.","獻乳糜止六年苦行；本願樹神得福，乃得佛陀。","One meal between despair and the dharma.","一糜之間，絕望與法界。"),
("cunda-smith","buddhist","giver","Cunda the smith","鐵匠純陀","Buddha's last host","佛最後供養者","His meal was the Buddha's last; he spent a night in guilt and was consoled by verse.","其供養為佛最後之食；終夜自責，以偈得慰。","The last meal feeds the dharma, not the blame.","最後之食養法，不養咎。"),
("brahma-sahampati","buddhist","deity","Sahampati Brahma","梵天沙罕帕蒂","Brahma who begged the teaching","勸轉法輪梵王","Fearing the awakened one would keep silent, the god begged him to teach the world.","憂佛默然，梵王勸請說法。","Even a Buddha needs one listener.","佛亦需一請者。"),
("sakka","buddhist","deity","Sakka","帝釋天","King of the devas","忉利天王","Heaven's king who guards the dharma, tests saints, and loses arguments gracefully.","護法試聖，敗而能喜之天王。","Devas bow to patience too.","諸天亦敬忍辱。"),
("vidhura","buddhist","sage","Vidhura the Pandit","毗都羅智臣","Wisest of ministers","智臣第一","Rode a demon's back to the ends of the sky and talked his way back with the dharma.","乘夜叉背飛窮天，以法語得返。","Truth is the leash of demons.","法語為縛魔之繩。"),
("temiya","buddhist","royal-child","Temiya the Mute Prince","啞王子睇美雅","Feigned idiocy to avoid kingship","佯啞避位","Watched a fish-gutting at one and swore off thrones; played a mute for sixteen years.","一歲見刳魚而誓棄王位，佯啞十六年。","Silence was his throne.","緘默即其王座。"),
("vessantara","buddhist","giver","Vessantara","須大拏太子","The perfect giver","布施第一","Gave away the rain-elephant, his children, his wife — and was repaid with a kingdom.","施象施子施妻，終得國土之報。","Giving is the only wealth he kept.","施即其唯一之財。"),
("anathapindika","buddhist","giver","Anathapindika","給孤獨長者","Founder of Jetavana","祇園施主","Covered a park in gold coins to buy it for the sangha.","以金布地買園施僧。","Faith measured in gold leaf, taught for free.","信以金計，法卻無價。"),
("visakha-dak","buddhist","giver","Visakha of Savatthi","毘舍佉","Foremost woman donor","女施主第一","Her hairs fell as gold dust and her blouse became the sun; she endowed the Eastern monastery.","衣成日光照，施建東園精舍。","A grand-daughter who scolds and still conquers.","雖訓孫而心自伏。"),
("mara-army","buddhist","tempter","Mara's armies","魔軍","Tempters at the Bodhi tree","菩提樹下誘惑者","Daughters of desire, armies of fear — they broke on the Buddha like waves on a rock.","欲女畏軍，觸佛而碎如浪觸石。","All their weapons turned to flowers.","諸兵化作天花。"),
("maitreya-b","buddhist","future-buddha","Maitreya","彌勒菩薩","The future Buddha","未來佛","Waiting in Tushita heaven until the wheel of the next age turns.","於兜率待未來之劫。","The next awakening is scheduled.","下一成正覺，已列入劫曆。"),
("asoka","buddhist","ruler","Asoka","阿育王","The dharma emperor","法王阿育","Won an empire in blood, then won himself in remorse; built the stupas.","以血得天下，以悔得己心，建塔弘法。","His edicts still argue from stone.","石刻誥文，至今說法。"),
("mahinda","buddhist","missionary","Mahinda","摩哂陀長老","Buddha's dharma to Lanka","攜法赴錫蘭者","Asoka's son who brought the canon to Sri Lanka and converted a king by explaining a mango.","阿育王之子，以一芒果之辨化一國之君。","The canon crossed the water in his memory.","法藏渡海，存於其憶。"),
("dutthagamani","buddhist","warrior-king","Dutthagamani","杜多伽摩尼王","Unifier of Lanka, burdened conscience","統一錫蘭之王","Freed the island with war, then measured his merit against eight million dead; arahants wrote him a pardon.","以戰安島，自計殺業；阿羅漢為其書赦。","One spoon of alms outweighs the arrows.","一匙之施，重於萬矢。"),
("vijaya-lanka","buddhist","founder","Prince Vijaya","維闍耶","Founder of the Sinhala line","僧訶羅王朝始祖","Exiled from India, landed with a tiger's howl, married the demon-queen Kuveni and founded Lanka.","被逐出印度，吼虎而登岸，娶夜叉女，開創蘭卡。","His line began with exile and a fox's kiss.","王統始於流放與吻。"),
("kuveni","buddhist","yakkhi","Kuveni","鳩逸尼","Demon-queen turned wife","夜叉之后","Ruled the yakkhas of Lanka until Vijaya needed the land more than her love.","本主夜叉諸后，因維闍耶之圖而見棄。","The first lady of Lanka was left in a cave.","蘭卡元后，終棄於窟。"),
("vimalakirti-b","buddhist","lay-sage","Vimalakirti","維摩詰居士","The eloquent sick householder","辯才病者","A sick merchant who out-argued all the disciples and healed the assembly with silence.","一病商辯屈眾僧，以默然療大眾。","The highest teaching was no teaching.","至教無言。"),
("sadapd","buddhist","ascetic","Sadaparibhuta","常不輕菩薩","Never-disparaging Bodhisattva","常不輕菩薩","Was stoned for bowing to everyone as a future Buddha, and was reborn with a clear mind.","頂禮眾人為未來佛，遭石而得淨心。","His courtesy was his austerity.","禮敬即其苦行。"),
("nanda-b","buddhist","youth","Nanda the handsome","難陀","Half-hearted novice","美貌比丘","Dragged to the sangha by his brother, kept by a monkey-parable and celestial nymphs; ended an arahant.","為兄強引入僧，以猴喻天女而留，終證阿羅漢。","Even desire can be used as a ladder.","欲亦可為梯。"),
]
cnt=0
for cid,tr,arch,en,zh,role_en,role_zh,bl_en,bl_zh,q_en,q_zh in new:
    if cid in ids:
        print('SKIP dup',cid); continue
    d.append({"id":cid,"tradition":tr,"archetype":arch,
      "name":{"en":en,"zh":zh},"role":{"en":role_en,"zh":role_zh},
      "blurb":{"en":bl_en,"zh":bl_zh},"quip":{"en":q_en,"zh":q_zh}})
    cnt+=1
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('added',cnt,'total',len(d))
