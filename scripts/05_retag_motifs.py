# -*- coding: utf-8 -*-
"""
05_retag_motifs.py — data-driven motif subdivision for the Motif Atlas corpus.

Reads every record in data/raw/batch-*.json (the source of truth), matches
regex rules against title+summary, and adds finer-grained motif tags
(respecting the 1-5 tags-per-record cap; when a record is at cap, a matching
child rule replaces its required parent tag).

Modes:
  py scripts/05_retag_motifs.py            # dry run: attachment counts + samples
  py scripts/05_retag_motifs.py apply      # write batch files + merge motifs.json

Every rule-matched motif is by construction attached to >= 1 record; after
apply, any motif with 0 attachments is dropped from the dictionary, so the
final motifs.json contains only motifs related to actual stories/texts.
"""
import json
import re
import sys
import io
from pathlib import Path

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
POOL = Path(r"C:/Users/olivie/AppData/Local/Temp/opencode/motifs-unused-pool.json")
MOTIFS_PATH = ROOT / "src" / "data" / "motifs.json"

# ---------------------------------------------------------------- helpers
ANIMALS = (
    r"(?:lion|tigress?|wolf|fox|jackal|monkey|ape|turtle|tortoise|hare|rabbit|crow|raven"
    r"|snake|serpent|cat|mouse|rat|frog|toad|deer|ant|bee|camel|elephant|ass|donkey|dog"
    r"|bear|eagle|hawk|fish|whale|crocodile|leopard|hyena|spider|cow|bull|horse|bird"
    r"|swan|seal|otter|boar|stag|goat|sheep|sow|pig|fly|insect|lizard|gecko|worm|crab"
    r"|ibis|heron|owl|dove|cuckoo|nightingale|cicada|butterfly|moth|ox|buffalo|elk"
    r"|moose|caribou|reindeer|wolf|coyote|raccoon|beaver)"
)

# ------------------------------------------------------- authored definitions
# (not present in the unused-pool file; these are subdivisions/derivations)
AUTHORED = [
  {"id": "dying-god", "code": "E522.1",
   "name": {"en": "Dying-and-rising god", "zh": "死而復生之神"},
   "description": {"en": "A deity dies and is revived — the seasonal or cosmic guarantee of renewal.",
                   "zh": "神祇死去而復生——季節或宇宙更新之保證。"},
   "keywords": ["dying god", "the god died", "was slain and rose", "Osiris", "Tammuz", "Baldr",
                "死而復生之神", "神之死"]},
  {"id": "coyote-trickster", "code": "G300.1",
   "name": {"en": "Coyote trickster", "zh": "郊狼詭計者"},
   "description": {"en": "Coyote as the cunning, boundary-breaking figure of North American lore.",
                   "zh": "郊狼作為北美傳說中狡黠越界的角色。"},
   "keywords": ["coyote", "coyote trickster", "old man coyote", "itcoode", "郊狼", "詭計者"]},
  {"id": "rabbit-hare-trickster", "code": "G300.2",
   "name": {"en": "Rabbit / hare trickster", "zh": "兔詭計者"},
   "description": {"en": "Rabbit or hare as the small clever cheat who wins by wit and nerve.",
                   "zh": "兔子或野兔以機智與膽量取勝的狡黠角色。"},
   "keywords": ["rabbit", "hare", "br'er rabbit", "rabbit trickster", "兔", "野兔", "詭計者"]},
  {"id": "spider-trickster", "code": "G300.3",
   "name": {"en": "Spider trickster", "zh": "蜘蛛詭計者"},
   "description": {"en": "Anansi and the spider as weaver of schemes and keeper of stories.",
                   "zh": "蜘蛛（南西）織網設局、執掌故事的角色。"},
   "keywords": ["spider", "anansi", "anance", "nancy", "蜘蛛", "南西"]},
  {"id": "tortoise-trickster", "code": "G300.4",
   "name": {"en": "Tortoise / turtle trickster", "zh": "龜詭計者"},
   "description": {"en": "Tortoise or turtle as the slow, cunning figure who wins by patience and guile.",
                   "zh": "龜以耐心與狡計取勝的角色。"},
   "keywords": ["tortoise", "turtle", "ijapa", "yurugan", "龜", "詭計者"]},
  {"id": "monkey-trickster", "code": "G300.5",
   "name": {"en": "Monkey / ape trickster", "zh": "猴詭計者"},
   "description": {"en": "Monkey or ape as the restless clever mimic and cheat.",
                   "zh": "猴或猿好動狡黠、善於模仿取勝的角色。"},
   "keywords": ["monkey", "ape", "macaque", "猴", "猿"]},
  {"id": "jackal-fox-trickster", "code": "G300.6",
   "name": {"en": "Jackal / fox trickster", "zh": "豺狐詭計者"},
   "description": {"en": "Jackal or fox as the smooth-talking deceiver of fable and folk-tale.",
                   "zh": "豺或狐以巧言誑語取勝的角色。"},
   "keywords": ["jackal", "fox", "reynard", "keket", "豺", "狐", "狐狸"]},
  {"id": "raven-trickster", "code": "G300.7",
   "name": {"en": "Raven / crow trickster", "zh": "鴉詭計者"},
   "description": {"en": "Raven or crow as the dark-winged schemer who steals, mocks, and reshapes the world.",
                   "zh": "鴉以偷竊、譏弄與改易世界聞名。"},
   "keywords": ["raven", "crow", "raven trickster", "渡鴉", "烏鴉"]},
  {"id": "deceiver-deceived", "code": "K981",
   "name": {"en": "The deceiver deceived", "zh": "騙者受騙"},
   "description": {"en": "The trickster is outtricked, caught in the snare he set, or paid back in kind.",
                   "zh": "詭計者反遭算計、自陷其阱或以彼之道還施彼身。"},
   "keywords": ["outwitted", "out-tricked", "paid him back", "caught in his own trap",
                "deceiver deceived", "騙者受騙", "反遭其計"]},
  {"id": "animal-transformation", "code": "D110",
   "name": {"en": "Human-animal transformation", "zh": "人獸互化"},
   "description": {"en": "A person becomes an animal, or an animal becomes human, by curse, magic, or choice.",
                   "zh": "人化為獸或獸化為人，因詛咒、魔法或自願。"},
   "keywords": ["became a bear", "turned into a wolf", "changed into a bird", "shape-shift",
                "人獸互化", "化獸", "化人"]},
  {"id": "petrification", "code": "D115",
   "name": {"en": "Turned to stone or tree", "zh": "化石成木"},
   "description": {"en": "A being is fixed forever as stone, salt, coral, pillar, or tree.",
                   "zh": "生命永遠定形為石、鹽、珊瑚、柱或樹。"},
   "keywords": ["turned to stone", "changed into a tree", "pillar of salt", "petrified",
                "化石", "成鹽柱", "化樹"]},
  {"id": "sky-translation", "code": "A752.1",
   "name": {"en": "Translated to the sky", "zh": "昇天化星"},
   "description": {"en": "A person, animal, or object is set in the sky as sun, moon, star, or constellation.",
                   "zh": "人、獸或物被安置於天空，化為日、月、星辰。"},
   "keywords": ["became the moon", "set among the stars", "placed in the sky",
                "昇天化星", "化為星辰"]},
  {"id": "death-messenger", "code": "A1335.2",
   "name": {"en": "Death by the delayed message", "zh": "遲誤之訊"},
   "description": {"en": "Two messages race — the one promising renewal arrives late, and mortality is fixed forever.",
                   "zh": "兩訊競速——許諾更新者遲到，必死之命從此定讞。"},
   "keywords": ["message came late", "chameleon", "hare ran ahead", "snake arrived first",
                "messenger failed", "遲誤之訊", "變色龍", "信使"]},
  {"id": "sacred-stone", "code": "A960.1",
   "name": {"en": "Sacred stone or rock", "zh": "神石"},
   "description": {"en": "A stone or rock is holy — worshipped, oath-bound, or the mark of a deity's act.",
                   "zh": "石或磐成聖——受祀、立誓，或為神蹟之印。"},
   "keywords": ["sacred stone", "holy rock", "standing stone", "stone of the god",
                "神石", "聖石", "立石"]},
  {"id": "sacred-tree", "code": "A960.2",
   "name": {"en": "Sacred tree or grove", "zh": "神樹"},
   "description": {"en": "A tree, grove, or forest is the seat or body of the divine.",
                   "zh": "樹、林或叢林為神靈之居或其身。"},
   "keywords": ["sacred tree", "holy grove", "sacred forest", "神樹", "聖林", "神木"]},
  {"id": "sacred-mountain", "code": "A960.3",
   "name": {"en": "Sacred mountain", "zh": "神山"},
   "description": {"en": "A mountain is divine — a god's home, throne, or buried body.",
                   "zh": "山為神居、神座或神軀之葬所。"},
   "keywords": ["sacred mountain", "holy mount", "mountain of the god", "神山", "聖山"]},
  {"id": "sacred-waters", "code": "A960.4",
   "name": {"en": "Sacred waters", "zh": "聖水"},
   "description": {"en": "A river, spring, lake, or well is holy — healing, oracular, or divine.",
                   "zh": "河、泉、湖或井為聖——療癒、神諭或屬神。"},
   "keywords": ["sacred river", "holy spring", "sacred lake", "healing well", "聖水", "聖泉", "聖河"]},
  {"id": "city-founding", "code": "A960.5",
   "name": {"en": "Founding of a city or dynasty", "zh": "建城立國"},
   "description": {"en": "A story tells how a city, town, capital, or dynasty was founded or named.",
                   "zh": "講述城邑、都城或王朝建立或得名之由來。"},
   "keywords": ["founded the city", "founding of", "named the town", "dynasty founded",
                "建城", "立國", "開國"]},
  {"id": "animal-fable", "code": "B500",
   "name": {"en": "Animal fable", "zh": "獸寓"},
   "description": {"en": "Animals act out a moral lesson — the fable's point is the teaching.",
                   "zh": "動物演出道德之課——寓言所指即是教訓。"},
   "keywords": ["fable", "the lion and the", "the ant and the", "moral of the",
                "獸寓", "寓言", "動物故事"]},
  {"id": "fire-origin", "code": "A1414.1",
   "name": {"en": "Origin of fire", "zh": "火之起源"},
   "description": {"en": "How fire first came to humankind — found, given, carried, or rescued.",
                   "zh": "火如何最初降於人間——被尋得、被賜、被攜或被救。"},
   "keywords": ["origin of fire", "first fire", "brought fire", "how fire came",
                "火之起源", "取火", "傳火"]},
  {"id": "sacrifice-origin", "code": "C50.1",
   "name": {"en": "Origin of sacrifice", "zh": "獻祭之始"},
   "description": {"en": "A myth explains how sacrifice or offering to the divine began.",
                   "zh": "神話解釋獻祭或供奉之起源。"},
   "keywords": ["origin of sacrifice", "first sacrifice", "instituted the offering",
                "獻祭之始", "祭祀起源", "初祭"]},
  {"id": "birth-plant", "code": "A1273.1",
   "name": {"en": "Born from tree or plant", "zh": "樹木生人"},
   "description": {"en": "A person is born from, or cut out of, a tree, bamboo, melon, or gourd.",
                   "zh": "人自樹、竹、瓜或葫蘆生出或剖出。"},
   "keywords": ["born of the bamboo", "from the melon", "cut open the gourd",
                "樹木生人", "竹生", "瓜生"]},
  {"id": "birth-stone-egg", "code": "T542.1",
   "name": {"en": "Born from egg or stone", "zh": "卵石生人"},
   "description": {"en": "A hero or being hatches from an egg or is born of stone or rock.",
                   "zh": "英雄或生靈自卵孵出，或自石生。"},
   "keywords": ["born from an egg", "hatched", "born of stone", "石生", "卵生"]},
  {"id": "virgin-birth", "code": "T547.1",
   "name": {"en": "Virgin / fatherless birth", "zh": "處女生子"},
   "description": {"en": "A child is conceived without a father — by spirit, dream, fruit, or light.",
                   "zh": "子因神靈、夢、果或光而孕，無父而生。"},
   "keywords": ["virgin", "without a father", "conceived by the spirit", "no husband",
                "處女生子", "感孕"]},
  {"id": "god-descends", "code": "A202.1",
   "name": {"en": "God descends to earth", "zh": "神臨人間"},
   "description": {"en": "A deity comes down to the human world — to walk, judge, dwell, or help.",
                   "zh": "神祇下臨人世——行走、審斷、居留或扶助。"},
   "keywords": ["came down to earth", "descended to", "walked among", "came to dwell",
                "神臨人間", "降世"]},
  {"id": "theoxenia", "code": "Q221.1",
   "name": {"en": "God received as guest", "zh": "神客之禮"},
   "description": {"en": "The divine arrives in disguise as a guest; hospitality is tested and repaid.",
                   "zh": "神以客身隱至；款待受試而得報。"},
   "keywords": ["entertained angels unaware", "entertained the gods", "hospitality rewarded",
                "神客之禮", "待客", "款待"]},
  {"id": "island-otherworld", "code": "F112.1",
   "name": {"en": "Blessed island otherworld", "zh": "海島福地"},
   "description": {"en": "The otherworld lies on an island or across the sea — isles of the blest, land of youth.",
                   "zh": "彼岸位於海島或海外——福島、不老之鄉。"},
   "keywords": ["island of the blessed", "land of youth", "isles of the blest",
                "海島福地", "福島", "不老鄉"]},
  {"id": "undersea-realm", "code": "F113.1",
   "name": {"en": "Kingdom beneath the sea", "zh": "海底龍宮"},
   "description": {"en": "A palace or kingdom lies under the sea — dragon king, sea god, sunken realm.",
                   "zh": "宮殿或王國位於海底——龍王、海神、沉沒之國。"},
   "keywords": ["dragon palace", "sea king", "under the sea", "sunken kingdom",
                "海底龍宮", "龍宮", "海國"]},
  {"id": "sun-devoured", "code": "A631.1",
   "name": {"en": "Sun or moon devoured", "zh": "日月被吞"},
   "description": {"en": "A monster or being swallows the sun or moon — the eclipse explained and undone.",
                   "zh": "怪物吞食日月——蝕之由來與解救。"},
   "keywords": ["eclipse", "rahu", "swallowed the sun", "swallowed the moon",
                "日月被吞", "日蝕", "月蝕"]},
  {"id": "orphan-hero", "code": "L100.1",
   "name": {"en": "Orphan hero", "zh": "孤兒英雄"},
   "description": {"en": "The orphaned or abandoned child rises to greatness against the odds.",
                   "zh": "失怙或被棄之子，逆境崛起而成大器。"},
   "keywords": ["orphan", "orphaned", "孤兒", "失怙"]},
  {"id": "kind-unkind-girl", "code": "ATU 480",
   "name": {"en": "Kind and unkind girl", "zh": "善惡少女"},
   "description": {"en": "Two sisters meet the same test; the kind one is showered with gifts, the unkind with toads.",
                   "zh": "二姊妹同歷一試；善者受賜金花，惡者受賜蛤蟆。"},
   "keywords": ["kind and unkind", "diamonds and toads", "flowers fell from her lips",
                "善惡少女", "善姑惡姑"]},
  {"id": "elopement", "code": "T95.2",
   "name": {"en": "Elopement", "zh": "私奔"},
   "description": {"en": "Lovers flee together against family or kingdom, pursued across the land.",
                   "zh": "有情人違逆家國私奔，被追逃於途。"},
   "keywords": ["eloped", "elopement", "fled with", "ran away with", "私奔", "私逃"]},
  {"id": "descent-rescue", "code": "A736.1",
   "name": {"en": "Descent to fetch back the dead", "zh": "下冥索人"},
   "description": {"en": "A living person descends to the underworld to bring back a beloved dead one.",
                   "zh": "生者下冥府，欲帶回所愛之亡者。"},
   "keywords": ["descended to bring back", "fetch from the dead", "rescue from the underworld",
                "下冥索人", "贖亡"]},
  {"id": "cheating-death", "code": "G305.1",
   "name": {"en": "Cheating death", "zh": "智脫死神"},
   "description": {"en": "Death is outwitted, bargained with, or escaped — for a while.",
                   "zh": "死神被智取、被周旋或被逃脫——僅一時。"},
   "keywords": ["cheated death", "escaped death", "outwitted death", "death could not",
                "智脫死神", "脫死"]},
  {"id": "opposed-twins", "code": "T590.2",
   "name": {"en": "Twins of opposing natures", "zh": "對極雙生"},
   "description": {"en": "Twin brothers embody opposed principles — good and evil, order and chaos, day and night.",
                   "zh": "雙生子化身相反原則——善惡、秩序與混沌、晝與夜。"},
   "keywords": ["opposed twins", "good and evil twin", "twin brothers of", "對極雙生", "善惡雙生"]},
  {"id": "immortality-lost", "code": "A1335.3",
   "name": {"en": "Immortality lost by theft or trick", "zh": "不死之失"},
   "description": {"en": "Humankind had — or nearly gained — immortality, and loses it through theft, trick, or refusal.",
                   "zh": "人本有（或幾近獲得）不死，卻因竊奪、欺騙或拒絕而失之。"},
   "keywords": ["lost immortality", "lost the chance", "snake stole the plant", "food of life",
                "immortality lost", "不死之失", "失去不死"]},
  {"id": "cattle-theft", "code": "K152",
   "name": {"en": "Theft of cattle", "zh": "盜牛"},
   "description": {"en": "Cattle or herds are stolen or raided, driving war, feud, or divine conflict.",
                   "zh": "牛群被盜或遭劫，引發戰爭、世仇或神界衝突。"},
   "keywords": ["cattle raid", "stole the cattle", "kine", "herd", "盜牛", "劫牛", "牛群"]},
  {"id": "monster-spouse", "code": "T410.1",
   "name": {"en": "Monster bride or husband", "zh": "怪物配偶"},
   "description": {"en": "A person is married to — or given as bride to — a monstrous, serpentine, or beastly being.",
                   "zh": "人與怪物、蛇形或獸形者結為配偶。"},
   "keywords": ["monster bride", "serpent husband", "married the beast", "frog prince",
                "怪物配偶", "蛇夫", "獸婚"]},
  {"id": "origin-livestock", "code": "A2533.1",
   "name": {"en": "Origin of domestic animals", "zh": "六畜起源"},
   "description": {"en": "A myth explains how sheep, cattle, goats, or herds came to humankind.",
                   "zh": "神話解釋羊、牛、畜群如何來到人間。"},
   "keywords": ["origin of sheep", "first cattle", "herd given", "grain and sheep",
                "六畜起源", "畜群之始"]},
  {"id": "flood-survivor-founder", "code": "A1010.1",
   "name": {"en": "Flood survivor as founder", "zh": "洪後立國"},
   "description": {"en": "The flood's remnant survivor becomes ancestor or founder of the renewed people.",
                   "zh": "洪水倖存者成為新生人族的祖先或奠基者。"},
   "keywords": ["flood survivor", "after the flood", "repeopled", "remnant",
                "洪後立國", "洪水後", "倖存者"]},
  {"id": "labyrinth", "code": "H1291.1",
   "name": {"en": "Labyrinth / confining maze", "zh": "迷宮"},
   "description": {"en": "A complex structure — built maze or death-house — contains a monster or secret.",
                   "zh": "複雜結構——人造迷宮或死亡之屋——藏有怪物或祕密。"},
   "keywords": ["labyrinth", "maze", "xibalba", "house of darkness", "迷宮", "迷樓"]},
  {"id": "threefold", "code": "Z71.1",
   "name": {"en": "Threefold pattern", "zh": "三數模式"},
   "description": {"en": "Tests, gifts, brothers, or attempts come in threes; the third is decisive.",
                   "zh": "考驗、贈禮、兄弟或嘗試以三為數；第三次定乾坤。"},
   "keywords": ["three times", "three nights", "three brothers", "third time", "三數模式", "三重"]},
  {"id": "generational-curse", "code": "M411.1",
   "name": {"en": "Curse on descendants", "zh": "世代詛咒"},
   "description": {"en": "A curse or guilt visits misfortune down the generations of a house or line.",
                   "zh": "詛咒或罪愆延及家族世世代代。"},
   "keywords": ["generational curse", "curse on the house", "his descendants", "inherited curse",
                "世代詛咒", "家詛"]},
  {"id": "exile", "code": "Q431",
   "name": {"en": "Exile / banishment", "zh": "放逐"},
   "description": {"en": "A hero or people is driven from home and must survive abroad.",
                   "zh": "英雄或族群被逐出家園，必須客居異邦。"},
   "keywords": ["exile", "banished", "driven out", "cast out of his homeland", "放逐", "流亡", "被逐"]},
  {"id": "trickster-founder", "code": "A530.1",
   "name": {"en": "Trickster as culture founder", "zh": "詭計開族"},
   "description": {"en": "The trickster's misdeeds unpredictably found or shape the world and its institutions.",
                   "zh": "詭計者的惡作劇不可測地奠基或塑造世界與制度。"},
   "keywords": ["trickster made", "coyote made", "raven made", "founded by the trickster",
                "詭計開族", "以詐成世"]},
  {"id": "shapeshifting", "code": "D110.1",
   "name": {"en": "Shapeshifting at will", "zh": "隨意化形"},
   "description": {"en": "A being changes shape repeatedly and deliberately — many forms, one person.",
                   "zh": "一者屢屢且刻意變換形體——多形而一人。"},
   "keywords": ["took the form of", "changed shape", "many shapes", "at will", "隨意化形", "化身百變"]},
  {"id": "magic-theft", "code": "K500.1",
   "name": {"en": "Theft of a magic object", "zh": "盜法器"},
   "description": {"en": "A magical artifact is stolen — necklace, apples, hammer, pearl — and events follow.",
                   "zh": "法器被盜——項鍊、金蘋果、神錘、寶珠——事端隨起。"},
   "keywords": ["stole the golden", "stolen jewels", "stole the apples", "theft of the",
                "盜法器", "失寶"]},
  {"id": "magic-gifts", "code": "D810",
   "name": {"en": "Three magic gifts", "zh": "三件法禮"},
   "description": {"en": "Three powerful objects or boons are given to a hero, each with its use.",
                   "zh": "英雄獲賜三件寶物或恩諾，各有其用。"},
   "keywords": ["three gifts", "three boons", "three magic", "given three",
                "三件法禮", "三寶"]},
  {"id": "hero-death-return", "code": "F377.1",
   "name": {"en": "Ruin on the return", "zh": "歸程化劫"},
   "description": {"en": "On returning from the otherworld, the visitor ages, crumbles, or dies at a touch of home soil.",
                   "zh": "自彼岸歸返者，一觸故土即衰老、碎散或死亡。"},
   "keywords": ["crumbled to dust", "aged in a moment", "touched the ground", "centuries passed",
                "歸程化劫", "觸土而亡"]},
  {"id": "flood-punishment", "code": "A1010.2",
   "name": {"en": "Flood as punishment", "zh": "洪水為罰"},
   "description": {"en": "The deluge is sent expressly to punish human wickedness or broken duty.",
                   "zh": "洪水明為懲罰人類之惡或瀆職而降。"},
   "keywords": ["flood as punishment", "wickedness", "punished mankind", "sins of the world",
                "洪水為罰", "天譴洪水"]},
  {"id": "celestial-persons", "code": "A731.1",
   "name": {"en": "Celestial bodies as persons", "zh": "天體人格化"},
   "description": {"en": "Sun, moon, and stars are people — siblings, spouses, children — with kin lives.",
                   "zh": "日月星辰即人——為兄弟、配偶、子女，有親族生活。"},
   "keywords": ["sun and moon", "sun sister", "moon brother", "the stars were",
                "天體人格化", "日月為人"]},
  {"id": "night-day-personified", "code": "A729.1",
   "name": {"en": "Night and day personified", "zh": "晝夜人格化"},
   "description": {"en": "Night and Day themselves are beings — ridden, born, married, or slain.",
                   "zh": "晝與夜自身為神——被騎乘、誕生、婚配或誅殺。"},
   "keywords": ["night and day", "Nott", "Dagr", "Night rode", "晝夜人格化", "夜神"]},
  {"id": "king-sacrifice", "code": "A930.1",
   "name": {"en": "King's ritual death and renewal", "zh": "王祭更新"},
   "description": {"en": "The king is sacrificed, wounded, or ritually renewed for the land's fertility or order.",
                   "zh": "君王受祭、受傷或受儀式更新，以保土地豐饒有序。"},
   "keywords": ["king sacrificed", "king must die", "royal sacrifice", "renewed the kingship",
                "王祭更新", "殺王"]},
  {"id": "human-sacrifice", "code": "V164",
   "name": {"en": "Human sacrifice", "zh": "人祭"},
   "description": {"en": "A human is offered to secure cosmic or social balance.",
                   "zh": "以人為犧，求宇宙或社會之平衡。"},
   "keywords": ["human sacrifice", "sacrificed the maiden", "heart sacrifice", "offered a human",
                "人祭", "活人祭"]},
  {"id": "blood-sacred", "code": "V164.2",
   "name": {"en": "Blood as sacred substance", "zh": "血為聖物"},
   "description": {"en": "Blood is poured, sprinkled, or withheld as the life-substance binding earth and heaven.",
                   "zh": "血被澆、被灑或被留，作為繫連天地之生命質。"},
   "keywords": ["blood poured", "sprinkled with blood", "blood of the", "blood for the harvest",
                "血為聖物", "灑血"]},
  {"id": "tree-of-life", "code": "A755.2",
   "name": {"en": "Tree of life or knowledge", "zh": "生命之樹"},
   "description": {"en": "A sacred tree grants life, insight, or awakening — or its fruit is forbidden.",
                   "zh": "神樹賜生命、智慧或覺醒——或其果被禁。"},
   "keywords": ["tree of life", "tree of knowledge", "bodhi tree", "forbidden tree",
                "生命之樹", "菩提樹", "知識樹"]},
  {"id": "double", "code": "D651.1",
   "name": {"en": "Doppelgänger / double", "zh": "重影替身"},
   "description": {"en": "An exact double or likeness appears — replacement, rivalry, or error of identity.",
                   "zh": "全然相同之複影現身——替代、相爭或認錯身份。"},
   "keywords": ["double", "exact likeness", "mirror image", "in his likeness",
                "重影替身", "化身相似"]},
  {"id": "sacred-birth", "code": "T578.1",
   "name": {"en": "Birth at a sacred locale", "zh": "聖地誕生"},
   "description": {"en": "A hero is born on, under, or within a holy place — mountain, temple, tree.",
                   "zh": "英雄誕於聖地——山巔、殿堂或樹下。"},
   "keywords": ["born on the mountain", "born in the temple", "born under the tree",
                "聖地誕生", "生於山"]},
  {"id": "animal-raised", "code": "B535.1",
   "name": {"en": "Foundling raised by animals", "zh": "獸養棄兒"},
   "description": {"en": "The abandoned child survives and is suckled or raised by beasts.",
                   "zh": "棄兒為獸所哺、所養而活。"},
   "keywords": ["raised by a wolf", "suckled by", "nursed by the bear", "reared by",
                "獸養棄兒", "狼奶"]},
  {"id": "bargain-supernatural", "code": "M241.1",
   "name": {"en": "Bargain with death or deity", "zh": "與神交易"},
   "description": {"en": "A negotiated pact with death, the devil, or a god sets the terms of fate.",
                   "zh": "與死神、魔鬼或神明訂約，命運隨其條款而轉。"},
   "keywords": ["bargain with", "wager with", "pact with the", "seven-year", "與神交易", "訂約"]},
  {"id": "initiation", "code": "H1585",
   "name": {"en": "Initiation rites", "zh": "成年之試"},
   "description": {"en": "The story mirrors social initiation — entry trials, seclusion, ordeal of passage.",
                   "zh": "故事映照社會入會之儀——入門試煉、獨居、通過之難。"},
   "keywords": ["initiation", "initiated into", "rite of passage", "entry trials",
                "成年之試", "入會", "成禮"]},
  {"id": "water-crossing", "code": "D761.1",
   "name": {"en": "River crossing as transformation", "zh": "渡水之變"},
   "description": {"en": "Crossing the river or sea marks a change of state — birth, death, or new life.",
                   "zh": "渡河越海即狀態之變——生、死或新生。"},
   "keywords": ["crossed the river", "crossing the water", "forded", "渡水之變", "過河"]},
  {"id": "mirror", "code": "D1321.1",
   "name": {"en": "Mirror / reflection", "zh": "鏡影"},
   "description": {"en": "A mirror or still water reveals truth, beauty, death, or the self.",
                   "zh": "鏡或止水照見真相、美、死亡或自我。"},
   "keywords": ["mirror", "reflection", "saw himself in", "looked into the water",
                "鏡影", "照影"]},
  {"id": "false-hero", "code": "K1911",
   "name": {"en": "False hero / impostor", "zh": "假英雄"},
   "description": {"en": "Someone takes credit for another's deed or pretends to be the savior.",
                   "zh": "有人冒他人之功，或自詡為救主。"},
   "keywords": ["false hero", "impostor", "took the credit", "claimed the deed",
                "假英雄", "冒功"]},
  {"id": "reunion", "code": "T95.3",
   "name": {"en": "Lost and found spouse", "zh": "破鏡重圓"},
   "description": {"en": "Separated spouses or lovers search, suffer, and are reunited after trials.",
                   "zh": "離散之配偶或戀人尋覓、受苦，終於重聚。"},
   "keywords": ["reunited", "found his wife", "found her husband", "searched for years",
                "破鏡重圓", "重聚"]},
  {"id": "migration-origin", "code": "A965",
   "name": {"en": "Wandering founder / migration", "zh": "遷徙建族"},
   "description": {"en": "A people's origin is told as a wandering ancestor's journey to a new land.",
                   "zh": "一族之由來，述為流浪祖先遷至新土之旅。"},
   "keywords": ["migration", "wandered and founded", "came across the sea", "origins of the people",
                "遷徙建族", "遷移"]},
  {"id": "seasons-origin", "code": "A1084",
   "name": {"en": "Origin of seasons", "zh": "四季之始"},
   "description": {"en": "A myth explains why winter comes, why spring returns, the rhythm of the year.",
                   "zh": "神話解釋冬之來、春之歸、一年之節律。"},
   "keywords": ["origin of the seasons", "winter came", "spring returned", "seasons",
                "四季之始", "季節"]},
  {"id": "cosmic-cow", "code": "A1611",
   "name": {"en": "Cosmic cow / primordial herd", "zh": "宇宙母牛"},
   "description": {"en": "A life-giving cosmic cow or herd suckles or creates the world.",
                   "zh": "哺育或創造世界的宇宙母牛或原初牛群。"},
   "keywords": ["cosmic cow", "celestial cow", "primordial cow", "Audhumla", "Kamadhenu",
                "宇宙母牛", "神牛"]},
  {"id": "sacred-meal", "code": "V153.1",
   "name": {"en": "Sacred meal", "zh": "聖餐"},
   "description": {"en": "A meal creates, transforms, or binds its participants — communion, soma, the feast rite.",
                   "zh": "一餐造化、轉化或繫連與餐者——聖餐、蘇摩、祭宴。"},
   "keywords": ["sacred meal", "last supper", "communion", "soma", "haoma",
                "聖餐", "祭宴"]},
  {"id": "devouring-mother", "code": "G412.1",
   "name": {"en": "Devouring mother / consuming parent", "zh": "吞子之母"},
   "description": {"en": "A parent swallows or consumes offspring — fearing prophecy or in hunger.",
                   "zh": "父母吞食子女——因懼預言或出於饑餓。"},
   "keywords": ["swallowed his children", "devoured her offspring", "ate his children",
                "吞子之母", "食子"]},
  {"id": "healing-myth", "code": "U120.1",
   "name": {"en": "Healing of the land", "zh": "療土神話"},
   "description": {"en": "A hero, rite, or sacrifice heals the wounded land, kingdom, or people.",
                   "zh": "英雄、儀式或犧牲療癒受創之地、國或民。"},
   "keywords": ["healed the land", "land was healed", "cure the kingdom", "restored the land",
                "療土神話", "地癒"]},
  {"id": "solar-journey", "code": "A731.3",
   "name": {"en": "Sun chariot / solar journey", "zh": "日御之程"},
   "description": {"en": "The sun travels daily by chariot, boat, or bearer across (or under) the world.",
                   "zh": "太陽每日乘車、船或由役者載行於世界（或其下）。"},
   "keywords": ["sun chariot", "solar boat", "barque of the sun", "carried the sun",
                "日御之程", "日車"]},
  {"id": "origin-tools", "code": "A1441",
   "name": {"en": "Origin of tools and crafts", "zh": "工藝起源"},
   "description": {"en": "A myth invents tools, writing, weaving, metallurgy, or pottery for humankind.",
                   "zh": "神話为人類發明工具、文字、織造、冶金或陶器。"},
   "keywords": ["origin of tools", "taught crafts", "first smith", "invented writing",
                "工藝起源", "器物之始"]},
  {"id": "naming-world", "code": "A940.1",
   "name": {"en": "Naming the world", "zh": "命名成序"},
   "description": {"en": "The act of naming beings, places, or things brings order to creation.",
                   "zh": "命名之舉為創世帶來秩序。"},
   "keywords": ["named all", "gave names", "naming the", "called their names",
                "命名成序", "命名"]},
  {"id": "divine-rivalry", "code": "A480.1",
   "name": {"en": "Jealous god / divine rivalry", "zh": "神妒相爭"},
   "description": {"en": "Gods contend for supremacy, worship, or a favored people.",
                   "zh": "諸神相爭——為至尊、為祭祀、為所寵之民。"},
   "keywords": ["jealous god", "rival gods", "contended for worship", "no other gods",
                "神妒相爭", "妒神"]},
  {"id": "transformation-punishment", "code": "D110.2",
   "name": {"en": "Transformation as punishment", "zh": "化獸為罰"},
   "description": {"en": "A crime or offense is answered by changing the offender into beast, tree, or stone.",
                   "zh": "罪行以化形為罰——變為獸、樹或石。"},
   "keywords": ["as punishment", "punished by turning", "changed into a beast for",
                "化獸為罰", "受罰化形"]},
  {"id": "poison-heal", "code": "D1601.1",
   "name": {"en": "Sacred poison / healing toxin", "zh": "毒藥同源"},
   "description": {"en": "A substance both kills and cures — venom, herb, or poison swallowed for the world.",
                   "zh": "一物兼能殺與醫——毒液、靈草，或為世而吞之毒。"},
   "keywords": ["poison and cure", "venom", "halahala", "poison that heals",
                "毒藥同源", "毒與藥"]},
  {"id": "sacred-direction", "code": "Z811",
   "name": {"en": "Journey to the west / sacred direction", "zh": "西行聖途"},
   "description": {"en": "The sacred quest runs along a fixed direction — west for scripture, east for empire.",
                   "zh": "神聖旅程循定方向——西行求法，東征建國。"},
   "keywords": ["journey to the west", "westward", "eastward expedition", "marched east",
                "西行聖途", "西行"]},
  {"id": "vanishing-people", "code": "A1610",
   "name": {"en": "Vanishing people", "zh": "消逝之民"},
   "description": {"en": "An entire people, tribe, or race disappears — lost, few left, or gone underground.",
                   "zh": "整族、整部落或整種之人消失——失蹤、僅存或遁入地底。"},
   "keywords": ["vanished people", "why there are few", "the tribe disappeared", "lost people",
                "消逝之民", "失族"]},
  {"id": "sea-birth", "code": "A1232.1",
   "name": {"en": "Sea birth / oceanic origins", "zh": "海中生人"},
   "description": {"en": "A being is born of, or rises from, the sea, foam, or waves.",
                   "zh": "生靈自海、泡沫或波濤中生或昇起。"},
   "keywords": ["born of the sea", "rose from the sea", "foam", "waves",
                "海中生人", "海生"]},
  {"id": "divine-smith", "code": "A541.1",
   "name": {"en": "Divine craftsman / smith-god", "zh": "神匠"},
   "description": {"en": "A god creates by craft — forging weapons, shaping humans on a wheel, building halls.",
                   "zh": "神以工藝造物——鍛兵器、摶人於輪、築造殿宇。"},
   "keywords": ["smith god", "divine craftsman", "forged", "Ptah", "Hephaestus", "Kothar",
                "神匠", "鍛神"]},
  {"id": "great-hunt", "code": "A1533.1",
   "name": {"en": "The great hunt", "zh": "大獵"},
   "description": {"en": "An enormous mythic hunt — boar, stag, or beast — explains order, loss, or the seasons.",
                   "zh": "宏大神話之獵——野豬、牡鹿或巨獸——解釋秩序、失落或季節。"},
   "keywords": ["great hunt", "boar hunt", "wild hunt", "hunted the great",
                "大獵", "狩獵"]},
  {"id": "tree-taboo", "code": "C751.2",
   "name": {"en": "Taboo against cutting the sacred tree", "zh": "神樹之禁"},
   "description": {"en": "The sacred tree or grove must not be cut or harmed — and the axe is answered.",
                   "zh": "神樹或聖林不可砍伐傷害——斧斤必遭回應。"},
   "keywords": ["cut down the sacred", "must not cut", "harming the tree", "神樹之禁", "禁伐"]},
  {"id": "abandoned-sacred", "code": "A970.1",
   "name": {"en": "Empty city / abandoned sacred place", "zh": "空城廢聖"},
   "description": {"en": "A once-holy city, temple, or shrine stands abandoned, haunted, or awaiting return.",
                   "zh": "曾聖之城、殿或祠今已廢棄、鬧鬼或候其歸返。"},
   "keywords": ["abandoned city", "empty temple", "deserted shrine", "ruins",
                "空城廢聖", "廢墟"]},
  {"id": "wounded-king", "code": "A930.2",
   "name": {"en": "Wounded king / sick-king syndrome", "zh": "傷王之疾"},
   "description": {"en": "The king's wound or sickness mirrors the land's barrenness; healing king and land are one act.",
                   "zh": "王之傷疾映照土地之荒蕪；癒王即癒土。"},
   "keywords": ["wounded king", "sick king", "maimed king", "the land withered",
                "傷王之疾", "病王"]},
  {"id": "demigod", "code": "A511.1",
   "name": {"en": "Demigod", "zh": "半神"},
   "description": {"en": "A child of god and mortal bridges the two realms — mighty, doomed, or both.",
                   "zh": "神與凡人之子跨越兩界——力大、命定，或兼而有之。"},
   "keywords": ["demigod", "half-god", "son of the god", "daughter of the goddess",
                "半神", "神人之子"]},
  {"id": "animal-ancestors", "code": "A1240.1",
   "name": {"en": "Animal origin of humans", "zh": "獸祖"},
   "description": {"en": "Humans descend from animals — monkey, bear, serpent, or totem ancestor.",
                   "zh": "人類源出於獸——猴、熊、蛇或圖騰之祖。"},
   "keywords": ["descended from the monkey", "animal ancestors", "from the ape", "totem ancestor",
                "獸祖", "猴祖"]},
  {"id": "clever-woman", "code": "K1211",
   "name": {"en": "The cunning wife / clever woman", "zh": "慧婦"},
   "description": {"en": "A woman outwits husband, king, or gods with wit, counsel, or disguise.",
                   "zh": "女子以智、諫或偽裝勝夫、勝王、勝神。"},
   "keywords": ["cunning wife", "clever woman", "wise woman", "outwitted the",
                "慧婦", "智婦"]},
  {"id": "secret-book", "code": "D1553.2",
   "name": {"en": "The lost book / hidden knowledge", "zh": "祕籍"},
   "description": {"en": "A book or scroll of power is hidden, stolen, or read at a price.",
                   "zh": "威力之書被藏、被盜，或閱之付價。"},
   "keywords": ["book of magic", "stolen scroll", "hidden knowledge", "secret book",
                "祕籍", "法書"]},
  {"id": "binding-monster", "code": "G465.1",
   "name": {"en": "Binding of a monster", "zh": "縛怪"},
   "description": {"en": "The monster, wolf, or titan is bound — to rock, abyss, or underworld — until the end.",
                   "zh": "怪物、狼或提坦被縛——於磐石、深淵或冥府——直至終末。"},
   "keywords": ["bound the wolf", "bound in the abyss", "chains", "tied to the rock",
                "縛怪", "束縛"]},
  {"id": "degeneration-races", "code": "A1161.1",
   "name": {"en": "Degeneration of the races", "zh": "種族退化"},
   "description": {"en": "Earlier, superior races or creations fail and are replaced by the present, lesser mortals.",
                   "zh": "先前更優之族或造物敗壞，由今日較劣之凡人取代。"},
   "keywords": ["silver age", "wood people", "previous creation", "degeneration",
                "種族退化", "退化"]},
  {"id": "solar-house", "code": "F162.1",
   "name": {"en": "House of the sun", "zh": "日宮"},
   "description": {"en": "The dwelling of the sun or chief deity — a palace visited, entered, or raided.",
                   "zh": "太陽或主神之居——可供拜訪、進入或劫掠之宮殿。"},
   "keywords": ["house of the sun", "palace of the sun", "sun's palace", "solar hall",
                "日宮", "日殿"]},
  {"id": "sky-repair", "code": "A720.1",
   "name": {"en": "The broken sky, repaired", "zh": "補天"},
   "description": {"en": "The sky is broken — pillars fall, heaven tears — and is mended or propped again.",
                   "zh": "天穹破損——柱折、天裂——而後被修補或重新撐起。"},
   "keywords": ["repaired the sky", "mended the sky", "broken sky", "pillars fell",
                "補天", "天裂"]},

]

# ------------------------------------------------------------------- rules
R = []


def rule(mid, requires=None, title=None, text=None):
    R.append({"id": mid, "req": requires, "title": title, "text": text})


# --- trickster species (require trickster) ---
rule("coyote-trickster", ["trickster"], title=r"\bcoyote\b")
rule("rabbit-hare-trickster", ["trickster"], title=r"\b(rabbit|hare)\b")
rule("spider-trickster", ["trickster"], title=r"\bspider\b|anans")
rule("tortoise-trickster", ["trickster"], title=r"\b(tortoise|turtle)\b")
rule("monkey-trickster", ["trickster"], title=r"\b(monkey|ape)\b")
rule("jackal-fox-trickster", ["trickster"], title=r"\b(jackal|fox|reynard)\b")
rule("raven-trickster", ["trickster"], title=r"\b(raven|crow)\b")
rule("deceiver-deceived", ["trickster"],
     text=r"outwit|paid (him|her|them) back|was (himself )?tricked|tricked (him|her|them) back"
          r"|turned the tables|trickery (failed|was exposed)|trickster was (caught|tricked)")

# --- transformation subdivisions (require transformation) ---
rule("animal-transformation", ["transformation"],
     text=r"(became|turned|changed|transformed)\w*.{0,30}?(into )?(a|an|the) " + ANIMALS)
rule("petrification", ["transformation"],
     text=r"(into|to) (a|the) (stone|rock|pillar|statue|coral|salt)|turned (to|into) (stone|rock|salt|trees?)"
          r"|were (changed|turned) into (stone|trees|salt)|became (stone|a tree)")
rule("sky-translation", ["transformation"],
     text=r"(became|turned into|changed into|translated to|taken up as) (the )?(sun|moon|stars|constellation)"
          r"|placed (him|her|them|it) (in|among) (the )?stars|set (him|her|them|it) in (the )?sky")

# --- taboo subdivisions (require taboo-transgression) ---
rule("forbidden-look", ["taboo-transgression"],
     text=r"(must not|do not|never) (look|gaze|see)|looked (back|behind|upon (the|her|his|it))|gazed upon (the|her)")
rule("forbidden-name", ["taboo-transgression"],
     text=r"(must not|do not|never) (say|speak|utter|mention|tell) (the |his |her |their |my )?name"
          r"|name.{0,30}(must not|should not|not) be (said|spoken|known)|true name.{0,30}(secret|power)"),
rule("forbidden-food", ["taboo-transgression"],
     text=r"(must not|do not|never) (eat|taste|touch)|forbidden (fruit|food)|ate of (the|his)|not to be eaten")
rule("forbidden-chamber", ["taboo-transgression"],
     text=r"(must not|do not|never) (open|enter)|opened (the )?(door|room|chamber|chest|box|book)"
          r"|forbidden (room|chamber|door|box)")
rule("hunting-taboo", ["taboo-transgression"],
     text=r"(never|must not|may not|not allowed|forbidden) (to )?(hunt|kill|shoot) (the|a|his|her|their)"
          r"|sacred (deer|bear|buffalo|hawk|eagle|swan|elk|horse)|taboo (to hunt|against hunting|on hunting)"),
rule("broken-oath", ["taboo-transgression"],
     text=r"broke (his|her|their|the) (oath|vow|promise|pledge)|(oath|vow|promise|pledge) (was|had been) broken"
          r"|violated (his|her|the) (oath|vow)|failed (his|her) vow|did not keep (his|her|the) (vow|promise|oath)")
rule("pride-punished", ["taboo-transgression"],
     text=r"\b(proud|pride|boasted|boastful|arrogant|presumptuous|haughty|vainglorious)\b")

# --- sacred-kingship subdivisions ---
rule("deified-mortal", ["sacred-kingship"],
     text=r"deified|made (a )?god|canoniz|apotheos|worship\w* (after|as) (a )?(god|saint)")
rule("god-exile", ["sacred-kingship"],
     text=r"banish\w* (from|to)|cast (out|down) (of|from) (heaven|paradise|olympus|the (sky|heavens))"
          r"|expelled from (heaven|the (sky|heavens|pantheon))|fallen (angel|from (heaven|grace))")
rule("succession-struggle", ["sacred-kingship"],
     text=r"usurp|claimed the (throne|crown)|struggl\w* for the (throne|crown)|fought for the (throne|crown|kingdom)"
          r"|contest\w* (for|the) (throne|crown|succession)|heir (to the throne|disputed)")
rule("just-ruler", ["sacred-kingship"],
     text=r"(righteous|just) (king|ruler)|judged (wisely|rightly|justly)|wisdom of solomon"
          r"|ruled (justly|with justice|wisely)")

# --- sacred-place subdivisions ---
rule("sacred-stone", ["sacred-place"], title=r"\b(stone|rock)\b")
rule("sacred-tree", ["sacred-place"], title=r"\b(tree|grove|forest)\b")
rule("sacred-mountain", ["sacred-place"], title=r"\b(mountain|mount |hill)\b")
rule("sacred-waters", ["sacred-place"], title=r"\b(river|spring|lake|well|pool|waterfall|cenote)\b")

# --- parable-teaching subdivisions ---
rule("animal-fable", ["parable-teaching"],
     title=r"\bthe " + ANIMALS + r"\b.{0,25}?and (the )?" + ANIMALS + r"\b")
rule("illusion-world", ["parable-teaching"],
     text=r"butterfly (dream|dreamed)|life (is|was) (a )?(dream|illusion)"
          r"|dream.{0,30}(waking|reality|illusion)|whether (he|she|I) (is|was|am) (a )?(man|butterfly)"),
rule("wu-wei", ["parable-teaching"],
     text=r"wu-?wei|non-?action|action without (striving|effort)|by non-action|uselessness")

# --- culture-hero / origin subdivisions ---
rule("origin-agriculture", None,
     text=r"origin of (rice|corn|maize|grain|agriculture)|spirit of the (corn|rice|maize)"
          r"|taught (them|men|people).{0,30}(till|farm|plant|sow|cultivate)|first (rice|corn|maize|grain|seeds?)"
          r"|gift of (rice|corn|maize|yams|grain)"),
rule("origin-of-evil", ["culture-hero"],
     text=r"origin of (evil|sorrow|misfortune|toil)|first sin|sorrow (came|entered)|opened the (jar|box) (and )?(out|all)|Pandora")
rule("golden-age", ["culture-hero"],
     text=r"golden age|age of gold|in Eden|paradise (was|of)|land of (content|plenty)")
rule("world-ages", None,
     text=r"(four|five) (ages|suns)|ages of (mankind|the world)|\byuga|\bkalpa\b|iron age|silver age|bronze age|heroic age"),
rule("first-ancestors", ["culture-hero"],
     text=r"first (man and woman|ancestors?|couple|parents)|Adam and Eve|primordial couple")
rule("fire-origin", None,
     text=r"origin of fire|first fire|fire (was )?(first )?(given|found|obtained|brought)|how fire came"
          r"|brought fire (to|down)|fire (originally|once) belonged")
rule("origin-water", None,
     text=r"origin of (the )?(river|spring|waters)|struck (the )?(rock|stone)|smote (the )?rock"
          r"|water (gushed|flowed|leaped) (from|out of)|made (a )?spring")
rule("origin-medicine", None,
     text=r"origin of medicine|first (medicine|remedy|physician)|taught.{0,30}(healing|medicine|to heal)"
          r"|master of (forest )?herbs|hundred herbs|healing (was )?taught"),
rule("origin-language", None,
     text=r"confusion of tongues|babel|languages (of|were)|speech was (confused|divided)")

# --- ritual / devotion (no require) ---
rule("sacrifice-origin", None,
     text=r"origin of sacrific|first sacrific|sacrifice (began|was instituted|was established)"
          r"|instituted (the|a) sacrific|first offering")
rule("prayer", None, text=r"pray(ed|er|ers)|called (on|upon) (the|his|her) (god|gods|lord)"
                          r"|lifted (his|her) (voice|hands) (to|in)")
rule("chant-mantra", None,
     text=r"chanted|mantra|recit(ed|ation) (of )?(the )?(sutra|quran|psalm|veda)|nembutsu|dhikr")
rule("doom-foretold", None,
     text=r"prophecy|foretold|prophesied|it was fated|oracle (said|foretold)|cannot escape fate")
rule("dream-vision", None, title=r"\bdream\b")

# --- resurrection subdivisions (require resurrection) ---
rule("ghost-return", ["resurrection"],
     text=r"\bghost\b|returned (from the dead|to (life|his|her))|came back (from the dead|to life)"
          r"|appeared (to|again) (after|his|her)|haunt")
rule("reincarnation", ["resurrection"],
     text=r"reborn as|reincarnat|transmigrat|former (life|existence)|previous (life|existence)|past (life|existence)")
rule("judgment-of-souls", None,
     text=r"heart.{0,25}weigh|weigh\w*.{0,35}heart|psychostasia|negative confession"
          r"|scales.{0,35}(heart|soul|deeds)|book of (deeds|life)")
rule("elixir-life", None,
     text=r"elixir|herb of (immortality|long life|life)|water of life|peaches? of (immortality|long life)|amrita")

# --- miraculous-birth subdivisions (require miraculous-birth) ---
rule("birth-plant", ["miraculous-birth"],
     text=r"born (of|from) (the |a )?(bamboo|tree|melon|gourd|pumpkin|calabash|plant|reed)"
          r"|cut (open )?(the|a) (bamboo|melon|gourd|calabash)")
rule("birth-stone-egg", ["miraculous-birth"],
     text=r"hatch\w* (from|an egg)|(egg|stone|rock) (cracked|split|hatched)|born (from|of) (an egg|the stone|a rock|stone)")
rule("virgin-birth", ["miraculous-birth"],
     text=r"virgin|without (a )?(father|man)|conceived (by|of) (the )?(spirit|god|holy)|no husband|not (by|of) man")
rule("twin-heroes", ["miraculous-birth"], text=r"\btwins?\b")

# --- theophany subdivisions (require theophany) ---
rule("god-disguise", ["theophany"],
     text=r"in disguise|disguised (as|himself|herself)|as (a )?(stranger|beggar|travell?er|old man|shepherd)|unknown (to them|guest)")
rule("god-descends", ["theophany"],
     text=r"(came|descend\w*) (down )?(to|upon|from heaven to) (the )?(earth|world|mountain|men|people)"
          r"|walked (on|upon|among) (the )?earth|came to (earth|dwell among)")
rule("theoxenia", ["theophany"],
     text=r"hospitality|entertain\w* (angels|the (gods|god)|a god)|guest (was|proved to be) (a )?(god|gods)"
          r"|god\w* (in disguise|as (a )?(guest|stranger))"),

# --- divine-marriage subdivision ---
rule("elopement", ["divine-marriage"],
     text=r"elop\w*|fled with (his|her|the)|ran away with|stole (the|his) (bride|wife)")

# --- descent-underworld subdivision ---
rule("descent-rescue", ["descent-underworld"],
     text=r"descend\w*.{0,80}?(bring|fetch|rescue|recover|win) (back )?(his|her|the|them)"
          r"|(bring|fetch|rescue|recover) (back )?.{0,60}?descend\w*")

# --- foundational-legend subdivision ---
rule("city-founding", ["foundational-legend"],
     text=r"founded (the|a) (city|town|capital|settlement|dynasty)|founding of (the|a) (city|town|capital|dynasty)"
          r"|named (the|a) (city|town|island|place)|gave (the|a) (place|city|town) (its|the) name")

# --- otherworld-voyage subdivisions ---
rule("island-otherworld", ["otherworld-voyage"],
     text=r"island (of|beyond|in the)|blessed (isle|islands)|land of (the blessed|youth|women|promise)"
          r"|islands of (the )?(blest|blessed|gods)")
rule("undersea-realm", ["otherworld-voyage"],
     text=r"dragon (palace|king)|sea (palace|king|god)|under (the )?sea|bottom of the (sea|ocean)"
          r"|underwater (palace|kingdom)")

# --- world-renewal subdivisions (require world-renewal) ---
rule("world-fire", ["world-renewal"],
     text=r"world (burned|in flames|was burned|fire)|burned (the|up) (the )?world|conflagration"
          r"|consum\w* (by|in) fire")
rule("last-battle", ["world-renewal"],
     text=r"ragnarok|armageddon|last (battle|war)|final (battle|war)|great (battle|war) (at the end|of the end)")
rule("day-of-judgment", ["world-renewal"],
     text=r"day of (judgment|judgement)|last judgment|resurrection of the dead"
          r"|dead (shall|will) (rise|be raised)|qiyamah|judgment day")
rule("end-portents", ["world-renewal"],
     text=r"signs (of|before|preceding) (the )?(end|last)|sun (shall|will) (be )?darkened"
          r"|stars (shall|will) (fall|drop)|moon (turned|shall turn) (to|into) blood|trumpets")
rule("cosmic-dissolution", ["world-renewal"],
     text=r"pralaya|dissolv\w* (the|of the) (world|universe)|end of the (age|kalpa|yuga)"
          r"|universe (dissolves|collapses)|back (to|into) (nothing|the (void|source))")

# --- storm-thunder subdivision ---
rule("sun-devoured", ["storm-thunder"],
     text=r"eclipse|\brahu\b|swallow\w* (the )?(sun|moon)|devour\w* (the )?(sun|moon)")

# --- war subdivision ---
rule("heaven-earth-sky-war", ["war"],
     text=r"sky (people|country|dwellers|folk)|chain of arrows|war (against|with|on) the sky")

# --- cosmogony / cosmos (no require) ---
rule("sky-earth-separation", None,
     text=r"separat\w* (the )?(sky|heaven|earth)|pushed (up|apart) (the )?(sky|heaven)"
          r"|lift\w* (up )?the sky|raised (up )?the (sky|heavens?)|sky and earth (were|had been) (joined|united|one)")
rule("world-parents", None,
     text=r"Rangi (and|,) Papa|Izanagi and Izanami (stood|joined|united|were)|Geb and Nut"
          r"|heaven and earth (were (joined|united|coupled|close|embraced)|lay (close|together)|clung)")
rule("world-tree", None,
     text=r"Yggdrasil|world (tree|ash)|tree of (life|the world|the universe)|ceiba|cosmic tree")
rule("cosmic-mountain", None,
     text=r"Mount (Meru|Olympus)|\bMeru\b|\bKunlun\b|center of the (world|earth|universe)|axis of the world")
rule("earth-diver", None,
     text=r"dive?d? (down )?(for|to (get|find)|and brought)|brought up (a )?(little )?(earth|mud|soil|sand)"
          r"|muskrat|water beetle|mud (from (the|under) (bottom|water))")
rule("emergence-from-earth", None,
     text=r"emerged (from|through)|climbed up (through|into)|came (out|up) (of|from) (the )?(earth|cave|ground)"
          r"|lower (world|worlds|levels)|\bsipapu\b")
rule("creation-word", None,
     text=r"god said,|let there be|spoke (the world|it into)|word was (with|made)")
rule("creation-light", None,
     text=r"let there be light|first (light|dawn)|light was (made|created|divided|separated)")
rule("primeval-waters", None,
     text=r"primeval|primordial (waters|ocean|sea)|face of the deep|formless|without form")
rule("chaos-monster", None,
     text=r"Tiamat|Leviathan|Rahab|\bYam\b|chaos (dragon|monster|serpent)|primordial (dragon|serpent|monster)")
rule("creation-contest", None,
     text=r"rival (creator|makers?)|evil (brother|twin)|good and (evil|bad) (creator|spirit|brother|twin)"
          r"|spoiled (the|his|her) (creation|work|world)|two (creators|makers) (quarreled|competed|contested)"),
rule("pantheon-war", None,
     text=r"titanomachy|gigantomachy|war (of|between) the gods|gods.{0,30}(against|and) (the )?(giants|titans|demons|asuras|devas)"
          r"|aesir and vanir|war in heaven")
rule("divine-council", None,
     text=r"council (of the gods|of the kings|of the priests|in heaven)|divine (council|assembly)"
          r"|gods (assembled|conferred|held)|heavenly (court|assembly)")
rule("divine-retribution", None,
     text=r"(wrath|punishment|vengeance) (of|fell upon|came upon|overtook)|heaven (struck|punished|destroyed|sent)"
          r"|god (punished|struck|destroyed|sent (fire|flood))")
rule("plague-sent", None,
     text=r"plague|pestilence|ten plagues|locusts (came|covered)|famine (was sent|struck|came)")
rule("offended-deity", None,
     text=r"walked away in anger|went away in anger|(god|goddess|deity).{0,50}vanish\w*"
          r"|angered|offend(ed|ing) (the|his|her|their)|enraged|neglect\w* (the|his|her|their) (sacrifice|offering|rites)"
          r"|forgot (the|his|her|their) (sacrifice|offering)|failed to (sacrifice|offer|honor)")
rule("celestial-bureaucracy", None,
     text=r"jade emperor|heavenly (court|officials|bureaucracy)|celestial (court|bureaucracy)"
          r"|ledger of the dead|book of (life and death|the dead)")
rule("division-of-realms", None,
     text=r"divided (the|all) (world|universe|kingdom|realms?|waters) (among|between)"
          r"|shared the (world|kingdom|realms?) among|drew lots for the (world|kingdom|universe)")
rule("incarnation-avatar", None,
     text=r"avatar|incarnat|made flesh|descended in (the )?(form|shape)|took (human|bodily) form")

# --- animals (no require) ---
rule("helpful-animal", None,
     text=r"grateful|thanked (him|her|them)|repaid (him|her)|helped (him|her|them) (escape|cross|carry|find|in return)"
          r"|carried (him|her|them) (across|to safety|on (its|his|her) back)")
rule("talking-animal", None,
     text=r"(spoke|talked|said) (in (a )?(human|plain) (voice|speech|tongue)|with a human voice)|began to speak"
          r"|the (horse|dog|bird|snake|serpent|fox|crow|raven|turtle|tortoise|monkey|frog|fish|ox|ass|donkey|camel|cat|mouse|wolf|goose) (said|spoke|answered|told)")
rule("animal-language", None,
     text=r"understand (the|their) (speech|language)|language of (the )?(birds|animals)"
          r"|knew (the )?speech of|spoke (the|their) (tongue|language) of (the )?(birds|beasts)")
rule("bird-messenger", None,
     text=r"(sent|the) (dove|raven|crow|pigeon|eagle|hawk|bird) (out|to|brought|carried|returned with)"
          r"|(dove|raven|crow|pigeon) (came back|returned) (with|bearing)")
rule("fish-swallow", None,
     text=r"swallow\w* (him|her|them|jonah|by)|belly of (the )?(fish|whale)|in the (fish|whale|belly)")
rule("serpent-guardian", None,
     text=r"(serpent|snake|dragon) (that )?(guard|kept|watched|protect)\w*.{0,40}(treasure|gold|spring|garden|tree|apple|place)"
          r"|guardian (serpent|snake)")

# --- ordeals (no require) ---
rule("fire-ordeal", None,
     text=r"ordeal (by|of) fire|walked (through|into) (the )?fire|through (the )?fire unharmed"
          r"|fire did not (burn|harm)|passed (through )?(the )?flames|held (the )?hot iron"),
rule("water-ordeal", None,
     text=r"ordeal (by|of) water|thrown into the (river|sea|water) (to|and)|crossed (the )?boiling"
          r"|boiling (water|oil)|dive\w* into the (sea|river|water) (to|and)"),
rule("combat-ordeal", None,
     text=r"single combat|trial by (combat|battle)|decided by combat|duel (to the death|between)")
rule("loyalty-test", None,
     text=r"offer\w* (up )?(his|her|their) (son|daughter|only)|sacrifice (his|her|your) (son|only)"
          r"|binding of isaac|tested (him|her|abraham)|prove (his|her) (faith|loyalty|obedience)")
rule("recognition-token", None,
     text=r"knew (him|her) by|token of recognition|by the (scar|ring|token|half)|half (of the|ring)"
          r"|recogniz\w* (him|her) (by|at)")

# --- wisdom / tests (no require) ---
rule("wise-advice", None,
     text=r"(took|ignored|followed|refused) (his|her|the) (advice|counsel)|(wise|old) (man|woman|sage) (advised|counsel\w*)"
          r"|gave (him|her) (advice|counsel)|\bcounsel\b")
rule("riddle-contest", None,
     text=r"\briddles?\b|sphinx.{0,40}(riddle|question)|guessed (the|it)|could not guess")
rule("impossible-task", None,
     text=r"impossible (task|tasks)|sorted (the|out) (grains?|seeds)|count\w* (the )?(waves|grains|stars)"
          r"|separated (the )?grains|overnight (task|sowing)")
rule("task-series", None,
     text=r"\blabors? of|twelve labors|seven (trials|tasks|tests)|series of (tasks|trials|tests)|first (labor|trial|task)")
rule("youngest-son", None,
     text=r"youngest (son|daughter|child|brother|of)|third son|simpleton")
rule("orphan-hero", None, text=r"\borphan(s)?\b")

# --- society / kin (no require) ---
rule("rescue-captive", None,
     text=r"rescu(e|ed|ing) (him|her|them|the (captive|prisoner))|freed (him|her|them|the (captive|prisoner))"
          r"|set (him|her|them) free (from|after)|released (him|her|them) (from|after)")
rule("abduction", None,
     text=r"abduct|carried (her|him) off|stolen (bride|wife|away)|seized (the|his) (wife|bride|woman)"
          r"|took (the|his) (wife|woman) (by force|away)")
rule("stolen-blessing", None,
     text=r"stole (the|his|her) (blessing|birthright)|deceived (his|her) (father|mother|dying)"
          r"|stolen blessing|blessing (was )?stolen")
rule("false-accusation", None,
     text=r"false(ly)? accus|slander|accused (him|her|of)|Potiphar|calumni")
rule("betrayal", None,
     text=r"betray|sold (him|her) (for|to)|thirty pieces|kiss of betrayal")
rule("kin-slaying", None,
     text=r"(kill|murder|slay|slew|slain|behead|behead\w*)\w* (his|her|their|my) (father|mother|parents|family|brother|sister|son|daughter|children|child|uncle|aunt|kin|kinsmen|kinfolk|relatives)"
          r"|slays? (his|her) (father|mother|brother|son|daughter|sister)"
          r"|(father|mother|parents|family).{0,30}(was|were) (killed|slain|murdered)|(killed|slain|murdered) by (his|her|their) (son|brother|father|mother|daughter|kin|family|nephew)"
          r"|parricide|fratricide|matricide|killing of (his|her|the) (father|mother|family|kin)"
          r"|slew (his|her|their) (father|mother|parents|family|brother)")
rule("adultery", None,
     text=r"adulter|took (another|his) (man)?'?s? ?wife|lay with (his|her|another)|Bathsheba")
rule("jealousy", None, text=r"\bjealous\w*\b|\benv(y|ied|ious)\b")
rule("stepmother", None, text=r"stepmother|co-wife|step-?daughter")
rule("abandoned-child", None,
     text=r"abandon\w* (him|her|the (child|baby))|exposed (him|her|the (child|baby))|foundling"
          r"|basket (in|on) (the )?(river|nile|water)|set (him|her) adrift"
          r"|cast (him|her) (into|upon) the (river|sea|water)")
rule("child-sacrifice", None,
     text=r"sacrific\w* (his|her|their|the) (son|daughter|child|children)|offer\w* (up )?(his|her) (son|daughter)"
          r"|burn\w* (his|their) (children|son|daughter)|sacrifice (of )?(the )?firstborn")
rule("love-trial", None,
     text=r"love (tested|tried|between|forbidden|of)|lovers were (parted|separated|transformed)"
          r"|died (for|of) love|forbidden love|parted (the|her|his) lovers")
rule("teacher-disciple", None, text=r"\bdisciples?\b")
rule("filial-piety", None,
     text=r"filial|served (his|her) (mother|father|parents)|duty to (his|her|their) (mother|father|parents)"
          r"|fed (his|her) (mother|father|parents)")

# --- magic / marvel (no require) ---
rule("storm-still", None,
     text=r"still\w* (the|a) (storm|sea|wind)|calm\w* (the|a) (sea|storm|wind|waves)"
          r"|(wind|storm) ceased|peace, be still|still\w* the waves")
rule("rainmaking", None,
     text=r"rain (master|bringer|maker|bringing)|prayed for rain|made rain|rain (ritual|dance|prayer|feast|spell)"
          r"|brought (the )?rain|rain (came|fell) (at|in answer|when)|cause (the )?rain"),
rule("water-from-rock", None,
     text=r"struck (the )?(rock|stone)|smote (the )?(rock|stone)"
          r"|water.{0,30}(gushed|burst|sprang|came) (from|out of|forth)|spring (burst|gushed|came)"),
rule("talisman", None,
     text=r"talisman|amulet|charm (was|against|of protection)|protective charm|wore (a )?charm")
rule("magic-weapon", None,
     text=r"(magic|divine|celestial|god-given|wondrous) (sword|spear|hammer|bow|club|blade|axe|shield)"
          r"|(sword|spear|hammer|club|blade) (of |that )?(the )?(god|gods|heaven|no other could)")
rule("magic-flight", None,
     text=r"(threw|cast|flung) (it )?behind (him|her|them)|over (his|her) shoulder|magic flight"
          r"|pursu\w*.{0,60}(threw|flung|cast)"),
rule("enchanted-sleep", None,
     text=r"sleep[- ](song|spell|charm)|sleeping (beauty|charm)|enchanted (sleep|slumber)"
          r"|awaken\w* (her|him|the sleeper)|wakes? (her|him|the sleeper)|put (her|him|them) to sleep"
          r"|sleep of (death|the dead)"),
rule("magic-food", None,
     text=r"ambrosia|food of the gods|ate and (forgot|became)|apples of (youth|idunn)"
          r"|ate (of|the) (forbidden|magic|enchanted)")
rule("magic-music", None,
     text=r"music (charmed|made|stilled|drew)|played (the )?(flute|lyre|harp|pipe) (and|so that|until)"
          r"|song (that )?(charmed|stilled|moved)|drum (called|summoned)")
rule("magic-word", None,
     text=r"open sesame|magic word|incantation|said the spell|spell (was broken|failed|worked)")
rule("true-name", None,
     text=r"true name|real name|knew (his|her) (real |true )?name|name (of power|had power)")
rule("invisibility", None,
     text=r"invisib|cap of darkness|cloak of (invisibility|darkness)|could not be seen")
rule("flight-sky", None,
     text=r"(flew|flying|flies) (through|over|to|across|up to)|rode the wind|soared (into|up)")
rule("magic-horse", None,
     text=r"magic (horse|steed)|flying horse|wonder (horse|steed)|horse (flew|spoke|of the (sun|gods))")
rule("swan-maiden", None,
     text=r"(swan|seal|crane|snake|tigress|doe) (maiden|wife|woman|skin)|skin of (the )?(swan|seal|crane)"
          r"|robe of feathers|feather (robe|cloak|dress)|hid(es|ing) (the|her|his) (skin|robe)")

# --- shamanic / dead (no require) ---
rule("vision-quest", None,
     text=r"vision quest|(sent|went) (to )?dream (by|for|to seek)|sent to (dream|seek a vision|fast)"
          r"|seeking (a )?(vision|dream)|fast\w* (alone|on (the|a) (mountain|hill)|for (a )?vision)"
          r"|cry\w* for (a )?vision")
rule("shaman-journey", None,
     text=r"\bshaman|spirit flight|his soul (flew|left|traveled)|soul (flew|journeyed) (to|up|down)")
rule("trance-healing", None,
     text=r"\btrance\b|healing dance|dance of (the )?(shamans|spirits|healing)|trance dance")
rule("spirit-helper", None,
     text=r"guardian spirit|spirit helper|power animal|helper (spirit|in the shape)|spirit (guide|companion)")
rule("ancestor-veneration", None,
     text=r"ancestor (worship|offering|spirit|tablet|rites?|cult|venerat)|offerings to the (ancestors|dead)"
          r"|honou?red the (ancestors|dead)")
rule("hungry-ghost", None,
     text=r"hungry ghost|ghosts? (demand|crave|need) (food|offerings)|offerings (to|for) the (dead|ghosts|hungry)")
rule("ferryman-dead", None, text=r"ferryman|ferry (him|her|them|the (dead|soul))|ferried")
rule("restless-dead", None,
     text=r"unburied|could not rest|must be (buried|given burial)|proper burial|refused burial")

# --- religion / scripture (no require) ---
rule("covenant", None, text=r"covenant")
rule("law-giving", None,
     text=r"commandments|tablets of (stone|the law)|gave the law|law was given|the law (of moses|was handed)")
rule("exodus-deliverance", None,
     text=r"out of (Egypt|bondage|slavery)|let my people go|deliver\w* (his|their|the) (people|them)"
          r"|freed (his|the) (people|them) (from|out of)")
rule("wilderness-wandering", None,
     text=r"wilderness|wandered (forty|in the (desert|wilderness))|desert (forty|years)|forty years")
rule("miracle-cure", None,
     text=r"healed|cured|made (him|her|them) whole|blind man|leprosy|paralys|raised the dead"
          r"|restored (him|her) to (life|health)")
rule("exorcism", None,
     text=r"cast out (the|a) (demon|devil|spirit)|unclean spirit|possessed (by|with)|demons? (came out|left|fled)")
rule("fasting", None, text=r"fast(ed|ing)|ate no (bread|food)|neither ate nor drank")
rule("pilgrimage", None, text=r"pilgrimag|\bhajj\b|went up to (Jerusalem|Mecca)|holy city")
rule("martyrdom", None,
     text=r"martyr|put to death (for|rather)|executed for (his|her|the)|died (for|defending) (the )?faith"
          r"|shed (his|her) blood (for|rather)")
rule("relics", None,
     text=r"relics?|bones of the (saint|prophet|apostle)|his cloak (was|remained)|touched his (bones|body|garment)")
rule("conversion", None,
     text=r"convert\w*|baptiz|turned (to|from) (the (faith|gods)|Christianity|Islam)|accepted (the )?(faith|gospel)")
rule("meditation", None,
     text=r"meditat|sat cross-legged|samadhi|absorbed in (the|his|her) (meditation|self)"
          r"|sat in (the )?(meditation|forest) (for|until)")
rule("asceticism", None,
     text=r"ascetic|austerit|\btapas\b|practiced (penance|austerities)|stood (on )?one (leg|foot)")
rule("idol-contest", None, text=r"\bidols?\b|gods of (wood|stone|gold)|Bel and|\bBaal\b")
rule("temptation", None,
     text=r"tempt(ed|ation)|satan (said|tempted|came)|the devil (said|offered|came|tempt)")
rule("revelation", None,
     text=r"revelation|revealed (the|to)|(sura|sutra|quran|gospel) (was )?(given|sent down|revealed)"
          r"|word of (God|the Lord) came")
rule("holy-man", None,
     text=r"holy man|dervish|\bsaint\b.{0,20}\b(met|came|lived|said)|holy (beggar|wanderer|man of God)")
rule("bodhisattva", None,
     text=r"bodhisattva|kuan ?yin|guanyin|avalokites|vowed to save|mercy of")
rule("merit-transfer", None,
     text=r"merit (was )?(transfer|dedicat)|dedicat\w* (the )?merit|on behalf of (the dead|his (mother|father))")


# --- round 3: user-provided list additions ---
rule("cosmic-egg", None, text=r"(cosmic|primordial|golden|world) egg|hiranyagarbha|hatch\w* (the|a|from) (egg|world)")
rule("world-parents", None,
     text=r"sky (father|god) and earth (mother|goddess)|sky father|earth mother|heaven and earth.{0,40}(parents|couple|married|union)")
rule("world-tree", None,
     text=r"world pillar|pillar of (the )?(sky|heaven)|axis mundi|world pole")
rule("pantheon-war", None,
     text=r"war of the (giants|titans)|battle (of|with) the (giants|titans)")
rule("opposed-twins", None,
     text=r"good (mind|spirit|brother|twin)|bad (mind|spirit|brother|twin)|evil (brother|twin|spirit)"
          r"|twin\w*.{0,50}evil")
rule("immortality-lost", None,
     text=r"plant of (youth|life)|food of (life|death)|food and water of (life|death)"
          r"|snake.{0,60}(stole|snatched|carried off|took|ate)"
          r"|immortality.{0,60}(lost|failed|slipped|stolen|missed)|gave up.{0,30}immortal")
rule("cattle-theft", None,
     text=r"cattle[- ]raid|raid\w* (the|his|her|their) (cattle|herd|kine)|stole (the|his|her|their) (cattle|herd|kine|oxen)"
          r"|kine of (the|his)|herd of (the )?(sun|geryon)|theft of (the )?(cattle|herd|kine|oxen)"
          r"|carried off (the|the )?(cattle|herd|kine)")
rule("dragon-slaying", None,
     text=r"(slew|slays|slain|killed|kill|destroy\w*|spear\w*) (the|a) (dragon|serpent|python|great serpent)"
          r"|(dragon|serpent).{0,30}(was slain|slain by|was killed)|vritra|fafnir|illuyanka|apophis|cadmus.{0,50}serpent"
          r"|python.{0,30}(slain|killed)")
rule("monster-spouse", None,
     text=r"(monster|serpent|dragon|beast|frog|toad|tiger) (husband|bride|wife|groom)"
          r"|married (a|the) (monster|serpent|dragon|beast|frog|toad)|bride (of|was) (a )?(monster|serpent|dragon)")
rule("origin-livestock", None,
     text=r"origin of (sheep|cattle|livestock|herds?)|first (shepherd|sheep|cattle|herd|goat)"
          r"|lahar|ashnan|domesticat\w* (the|a|first)|taught.{0,40}(shepherd|herd|to herd)")
rule("origin-plants", None,
     text=r"origin of (plants?|trees|flowers?)|first (tree|plant|flower|fruit|coconut)"
          r"|trees?.{0,30}(came|was created|were created|grew).{0,30}(from|out of).{0,30}(body|flesh|corpse|buried|blood)"
          r"|grew.{0,40}(from|out of) (her|his|the) (body|flesh|corpse|grave|buried)")
rule("dying-god", ["resurrection"],
     text=r"osiris|tammuz|dumuzi|baldr|adonis|attis|the (god|goddess) (died|was slain|rose|returned)")
rule("flood-survivor-founder", ["flood"],
     text=r"surviv\w* (of|from) (the )?flood|after the flood|repeopl|re-?popul|remnant.{0,40}(peopled|founded|began)")
rule("labyrinth", None,
     text=r"labyrinth|\bmaze\b|xibalba|house of (darkness|bats|blades|cold|jaguars)")
rule("threefold", None,
     text=r"\bthree (times|nights|days|tests|tasks|questions|brothers|daughters|sons|gifts|wishes|attempts)\b"
          r"|third (time|night|attempt|day)")
rule("generational-curse", None,
     text=r"curse.{0,50}(generations?|descendants|house of|line of|dynasty|family|children)"
          r"|inherited (the )?curse|curse on (the|his|her|their) (house|line|descendants|children)")
rule("exile", None,
     text=r"exil\w*|banish\w*|driven (out|from) (his|her|their) (home|land|kingdom|country)"
          r"|fled (his|her|their) (homeland|country)|wander\w* (abroad|in exile|from (his|her) home)")
rule("trickster-founder", None,
     text=r"(coyote|raven|spider|maui|trickster).{0,50}(made|created|shaped|formed|founded|put|gave)"
          r"|(made|created|formed|shaped) (the )?(world|people|rivers|mountains|animals).{0,50}(coyote|raven|trickster)")
rule("shapeshifting", ["transformation"],
     text=r"took (the|its) (form|shape) of|changed (his|her|their) shape|many (shapes|forms)|shape-?shift")
rule("magic-theft", None,
     text=r"stole.{0,50}(magic|enchanted|golden|precious|jewel|gem|girdle|apples?|hammer|ring|pearl|idol|treasure)"
          r"|(apples?|girdle|jewel|hammer|ring|pearl|pendant|treasure).{0,30}(was|were) stolen"
          r"|theft of (the )?(golden|magic|jewels)")
rule("magic-gifts", None,
     text=r"three (gifts|boons|wishes|objects|treasures|magic)"
          r"|gifts? (from|of) (the )?(under-?world|gods?|fairy|magician|spirit)")
rule("hero-death-return", None,
     text=r"crumbl\w* (to|into) (dust|ashes)|aged.{0,30}(in a moment|instantly|suddenly)"
          r"|touched (the )?(earth|ground) (and|he|she)|centuries.{0,40}(passed|instant|moment)"
          r"|returned.{0,60}(an )?(old|aged) (man|woman)")
rule("flood-punishment", ["flood"],
     text=r"punish\w*|wicked(ness)?|sins? of|deprav\w*|corrupt\w*|transgress\w*")
rule("celestial-persons", None,
     text=r"sun and moon (were|are) (brothers|sisters|siblings|children|born)|brother (sun|moon)|sister (sun|moon)"
          r"|sun.{0,15}(was|as) (a )?(man|woman|child|god|deity)|moon.{0,15}(was|as) (a )?(man|woman|child|god)"
          r"|the (sun|moon) (his|her) (wife|husband|children|mother|father|sister|brother)")
rule("night-day-personified", None,
     text=r"\bN(y|o)tt\b|\bDagr\b|night and day (were|as)|Night (was|is|rode|rode out) (a |the |out )?"
          r"|Day (was|is) (a |the )?(god|father|being)|children of (night|day)")
rule("king-sacrifice", None,
     text=r"king.{0,60}(must die|sacrific\w*|died (for|that|so)|renew\w*)|sacrific\w* (the|a|his) king"
          r"|king's (death|sacrifice)|royal (sacrifice|renewal)")
rule("human-sacrifice", None,
     text=r"human sacrific\w*|sacrific\w* (a|the) (girl|maiden|virgin|man|princess|boy|people)"
          r"|sacrifice of (a )?(maiden|virgin|princess|humans?|children)|heart.{0,20}sacrifice|offered (up )?(human|a human)")
rule("blood-sacred", None,
     text=r"blood (was|is) (poured|sprinkled|offered|the life)|poured (out )?(the |his |her |their )?blood"
          r"|sprinkl\w*.{0,35}blood|blood.{0,35}(sacred|life|harvest|altar)|blood of (the )?(sacrifice|offering|king)")
rule("tree-of-life", None,
     text=r"tree of (life|knowledge|wisdom|truth)|forbidden tree|bodhi[- ]?tree|sacred sycamore|immortality tree")
rule("double", None,
     text=r"doppelg|exact (image|likeness|copy|double)|mirror image|in (his|her|its) (own )?likeness"
          r"|second self|double of (him|her)|looked (exactly|just) like (him|her)")
rule("sacred-birth", None,
     text=r"born (on|at|in|under|beside) (a|the) (mountain|temple|shrine|altar|sacred|tree|holy)"
          r"|mountain of flowers and fruit")
rule("animal-raised", None,
     text=r"raised by (a |the )?(she-?wolf|wolf|bear|deer|tiger|lioness|doe|eagle|serpent|snake|dog|jackals?|monkeys?|goat)"
          r"|suckled by (a |the )?(wolf|bear|deer|doe|lioness|goat)|nursed by (a |the )?(wolf|bear|deer|doe|animals?)"
          r"|reared by (a |the )?(wolf|bear|deer|lioness|shepherd)")
rule("bargain-supernatural", None,
     text=r"bargain\w* (with|for)|(wager|wagered|bet|stake) (with|on|for).{0,40}(death|devil|god|soul|life)"
          r"|pact (with|for) (death|the devil|god)|bargain\w*.{0,40}(death|devil|god|soul)")
rule("initiation", None,
     text=r"initiat\w*|rite of passage|entry (trials?|tests?)|coming[- ]of[- ]age|admitted (to|into) (the|a)")
rule("water-crossing", None,
     text=r"cross(ed|ing)? (the|a) (river|water|sea|ford) (to|and|,)|forded (the|a)|crossing of (the|a) (river|water|sea)")
rule("mirror", None,
     text=r"\bmirror\b|reflection|saw (himself|herself|itself) (in|on|as)|looked (into|at) (the|a|his|her) (water|pool|mirror)")
rule("false-hero", None,
     text=r"false (hero|claimant)|impostor|took (the )?credit|claimed (the|his|her) (deed|victory|kill|prize)"
          r"|pretend\w* (to be|that he (had|did|was))|passed (himself|herself) off as")
rule("reunion", None,
     text=r"reunit\w*|found (her|his|their) (husband|wife|bride|lover|mother|son|daughter) (again|after|at last)"
          r"|searched.{0,60}(wife|husband|bride|lover|son|daughter) (again|for years|and found)")
rule("migration-origin", None,
     text=r"migrat\w*|wander\w*.{0,60}(founded|settled|arrived|landed)|landed (at|on|in).{0,50}(founded|settled|named)"
          r"|came across (the )?sea.{0,50}(settled|founded|landed)|left (their|his|her) (old |first )?(home|land|island)")
rule("seasons-origin", None,
     text=r"origin of (the )?seasons|why (there are|we have) (the )?seasons|began the seasons"
          r"|winter.{0,60}(because|for|so that|till)|spring.{0,60}(return|came back|restored)")
rule("ascent-sky", None,
     text=r"chain of arrows|ladder (to|of|into) (the )?(sky|heaven)|stairway to (heaven|the sky)"
          r"|climb\w* (up )?(to|into) (the )?(sky|heaven)|up the (tree|pine|beanstalk) (to|into)")
rule("cosmic-cow", None,
     text=r"audhumla|kamadhenu|celestial cow|primordial (cow|bull|herd)|cosmic (cow|bull|cattle)|cow of (the )?(beginning|primordial)")
rule("sacred-meal", None,
     text=r"last supper|eucharist|communion|sacred (meal|food|drink|beverage)|haoma|soma.{0,40}(drink|juice|pressed)|\bsitua\b")
rule("devouring-mother", None,
     text=r"swallow\w* (his|her|their|the) (children|child|sons|stone|offspring|young)"
          r"|devour\w* (his|her|their) (children|offspring|young)|ate (his|her) (own )?(children|child)")
rule("healing-myth", None,
     text=r"heal(ed|ing)? (the|a) (land|world|kingdom|people|sick)|land (was|is) healed|healed.{0,35}land"
          r"|cure (of|for) (the )?(land|kingdom)")
rule("solar-journey", None,
     text=r"sun (chariot|boat|barque|ship|rides|journey\w*|cross\w*)|solar (barque|boat|chariot)"
          r"|carries? the sun|sun (was|is) (carried|drawn|rowed|borne)|phaethon|boat of millions")
rule("origin-tools", None,
     text=r"(taught|gave) (men|them|people|the people).{0,50}(craft|forge|smelt|weave|letters|writing|pottery|plow|iron)"
          r"|origin of (crafts?|tools|writing|letters)|first (smith|weaver|potter|plow|forge)|invent\w*.{0,40}(craft|writing|letters|pottery)")
rule("naming-world", None,
     text=r"named (every|each|all) (living|thing|animal)|gave (them|it|all) (their )?names"
          r"|naming (the|of) (world|creation|things|animals)|call(ed)? (their|the|all) names")
rule("divine-rivalry", None,
     text=r"jealous (god|gods)|gods? (were|was) (jealous|envious)|rival (gods|deities)"
          r"|contend\w* (for|over) (worship|supremacy|the (crown|throne))|worship\w*.{0,40}(other gods|rival)")
rule("transformation-punishment", ["transformation"],
     text=r"punish\w*.{0,60}(turn\w*|chang\w*|transform\w*)|turn\w*.{0,40}(him|her|them) (into|to) (a|an).{0,40}(for|punish)"
          r"|as (a )?punishment.{0,60}(chang\w*|turn\w*|transform\w*)")
rule("poison-heal", None,
     text=r"halahala|poison.{0,40}(cure|remedy|medicine|heal)|venom.{0,40}(cure|remedy|medicine)"
          r"|poison and (cure|remedy|medicine)|drank the poison")
rule("sacred-direction", None,
     text=r"(journey|quest|expedition|march\w*) (to|of|toward) (the )?(west|east)|westward|eastward")
rule("vanishing-people", None,
     text=r"(people|tribe|village|nation|race).{0,60}(vanish\w*|disappear\w*|were no more|were lost|died out)"
          r"|vanish\w* (people|tribe|race)|why.{0,25}(few|no more|scattered)")
rule("sea-birth", None,
     text=r"born (from|of|out of) (the )?(sea|ocean|foam|waves)|foam.{0,40}(born|arose|came)"
          r"|rose (from|out of) (the )?(sea|ocean|waves)|sea (gave birth|brought forth)")
rule("divine-smith", None,
     text=r"hephaest|vulcan|ptah|kothar|divine (smith|craftsman)|smith (god|deity|of the gods)"
          r"|forged.{0,50}(gods|god-|hammer|spear|armor|weapons)|craftsman.{0,30}(god|of the gods)")
rule("great-hunt", None,
     text=r"great hunt|calydonian|twrch trwyth|wild hunt|hunt\w* (the )?(great |giant |monster |boar |stag )?(boar|stag|hart)"
          r"|boar[- ]hunt")
rule("abandoned-sacred", None,
     text=r"abandon\w* (the|a|his|her|their)? ?(city|temple|shrine|sanctuary|capital)"
          r"|empty (city|temple|shrine)|deserted (city|temple|shrine)|ruins? of (the|a) (temple|city|shrine)")
rule("wounded-king", None,
     text=r"wounded king|sick king|maimed king|lame king|king.{0,50}(wounded|maimed|sick|lame|withered)"
          r"|land.{0,60}(barren|withered|famine).{0,50}(king|wound|heal)")
rule("demigod", None,
     text=r"demigod|half-?(god|divine|blood)|son of (the|a) (god|goddess)|daughter of (the|a) (god|goddess)"
          r"|god.{0,40}mortal.{0,40}(child|son|daughter|union|love)")
rule("animal-ancestors", None,
     text=r"became (monkeys?|apes|bears|wolves|serpents)|elder brothers become"
          r"|monkey.{0,60}(ancestor|descend|children|offspring|people)"
          r"|from (the )?(monkey|ape).{0,40}(descend|come|sprang)|totem (ancestor|origin)")
rule("clever-woman", None,
     text=r"cunning (wife|woman|queen)|clever (wife|woman|girl|maiden|princess)|wise (woman|queen) (who|that)"
          r"|outwit\w* (the|his|her) (husband|men|king|guards)|woman of (cunning|wisdom)")
rule("secret-book", None,
     text=r"book of (magic|spells|thoth|the dead)|magic (book|scroll)|stolen (book|scroll)"
          r"|hidden (book|scroll|knowledge)|secret (book|scroll|knowledge)|forbidden (book|scroll|knowledge)")
rule("binding-monster", None,
     text=r"bind\w* (the|a|him|her|them) (wolf|monster|giant|serpent|dragon|titan|demon|god|enemy)"
          r"|bound (in|to|with) (the )?(abyss|underworld|pit|rock|chains)|gleipnir"
          r"|chain(ed)? (him|her|them|the) (to|in|beneath|over)|tied (him|her|them|the) (to|up)")
rule("degeneration-races", None,
     text=r"(silver|bronze|iron|wood) (race|age|people)|previous (creation|race|people|men) (was|were) (destroyed|failed|made)"
          r"|earlier (race|creation|men)|degenerat\w*|inferior (race|people) (replaced|succeeded)")
rule("solar-house", None,
     text=r"house (of|the) (the )?sun|palace (of )?the sun|sun's (palace|house|hall|dwelling)"
          r"|solar (palace|house|hall)|dwelling (of )?the sun")
rule("sky-repair", None,
     text=r"repair(ed|ing)? (the )?sky|mend(ed|ing)? (the )?sky|sky (was )?(torn|broken|cracked|fell|was damaged)"
          r"|broken sky|pillars of (the )?(sky|heaven) (broke|fell)|broken pillars")
rule("contest-bride", None,
     text=r"suitors? (of|for|contend\w*|assembled)|won (her|the) (hand|bride)|contest for the (bride|hand)"
          r"|raced (for|to win) (her|the (bride|hand))|wooing (contest|trial)|contest of the suitors")
rule("bow-contest", None,
     text=r"string (the|his|her) bow|bend (the|his) bow|bow of (odysseus|ulysses)|none could (string|draw|bend) the bow"
          r"|bow contest|contest of the bow")
rule("soul-journey", None,
     text=r"soul (left|flew|departed|traveled|journeyed) (his|her|the|to)|(spirit|soul) (left|flew|went out of) (his|her|the) body")

# --------------------------------------------------------------------- run
def batch_files():
    return sorted(RAW.glob("batch-*.json"))


def load_batches():
    data = []
    for p in batch_files():
        raw = json.loads(p.read_text(encoding="utf-8-sig"))
        data.append((p, raw))
    return data


def rec_text(rec):
    t = rec.get("title") or {}
    s = rec.get("summary") or {}
    return " ".join(filter(None, [t.get("en", ""), t.get("zh", ""), s.get("en", ""), s.get("zh", "")]))


def candidates(rec):
    text = rec_text(rec).lower()
    title = ((rec.get("title") or {}).get("en", "") + " " + (rec.get("title") or {}).get("zh", "")).lower()
    cur = list(rec.get("motifs") or [])
    out = []
    for r in R:
        mid = r["id"]
        if mid in cur:
            continue
        if r["req"] and not all(x in cur for x in r["req"]):
            continue
        if r["title"]:
            if not re.search(r["title"], title, re.IGNORECASE):
                continue
        if r["text"]:
            if not re.search(r["text"], text, re.IGNORECASE):
                continue
        out.append(mid)
    return out


def retag(rec):
    cur = list(rec.get("motifs") or [])
    note = []
    for mid in candidates(rec):
        if mid in cur:
            continue
        req = next((r["req"] for r in R if r["id"] == mid), None)
        if len(cur) < 5:
            cur.append(mid)
            note.append("+" + mid)
        elif req:
            parent = next((x for x in req if x in cur), None)
            if parent:
                cur[cur.index(parent)] = mid
                note.append(f"{parent}>{mid}")
    rec["motifs"] = cur
    return note


def main(apply=False):
    existing = json.loads(MOTIFS_PATH.read_text(encoding="utf-8-sig"))
    existing_ids = {m["id"] for m in existing}
    pool = json.loads(POOL.read_text(encoding="utf-8-sig"))
    pool_by_id = {m["id"]: m for m in pool}
    authored_by_id = {m["id"]: m for m in AUTHORED}

    # sanity: every rule id resolvable
    for r in R:
        if r["id"] not in pool_by_id and r["id"] not in authored_by_id and r["id"] not in existing_ids:
            raise SystemExit(f"rule id has no definition: {r['id']}")
    # sanity: no duplicate codes across existing + new candidates
    codes = {m["code"] for m in existing}
    for m in list(pool_by_id.values()) + AUTHORED:
        if m["id"] in existing_ids:
            continue
        if m["code"] in codes:
            raise SystemExit(f"duplicate code {m['code']} ({m['id']})")
        codes.add(m["code"])

    batches = load_batches()
    counts = {r["id"]: 0 for r in R}
    samples = {}
    changed_records = 0
    orphan_existing = set(existing_ids)

    for p, raw in batches:
        dirty = False
        for rec in raw.get("texts", []):
            before = list(rec.get("motifs") or [])
            orphan_existing.difference_update(before)
            notes = retag(rec)
            for mid in rec["motifs"]:
                if mid in counts:
                    counts[mid] += 1
                if mid not in samples:
                    samples[mid] = []
                if len(samples[mid]) < 3:
                    samples[mid].append(rec["title"].get("en", "?")[:70])
            if notes:
                changed_records += 1
                dirty = True
        if apply and dirty:
            p.write_text(json.dumps(raw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if orphan_existing:
        print("WARNING: existing motifs losing ALL attachments (will be kept anyway):", sorted(orphan_existing))

    print(f"\nrecords changed: {changed_records}")
    print("\n=== attachment counts per new motif ===")
    zero = []
    for r in R:
        n = counts[r["id"]]
        flag = "  <-- ZERO (will be dropped)" if n == 0 else ("  <-- broad" if n > 500 else "")
        print(f"{r['id']:24s} {n:5d}{flag}")
        if n == 0:
            zero.append(r["id"])
        if 0 < n <= 3:
            print(f"    samples: {samples.get(r['id'], [])}")

    if not apply:
        print("\n(dry run — no files written)")
        return

    # merge dictionary: existing 49 first, then new motifs in rule order (attached only)
    merged = list(existing)
    for r in R:
        mid = r["id"]
        if counts[mid] <= 0 or mid in existing_ids:
            continue
        entry = authored_by_id.get(mid) or pool_by_id[mid]
        merged.append(entry)
    MOTIFS_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nwrote {MOTIFS_PATH.name}: {len(merged)} motifs "
          f"({len(existing)} existing + {len(merged) - len(existing)} new)")


if __name__ == "__main__":
    main(apply=len(sys.argv) > 1 and sys.argv[1] == "apply")
