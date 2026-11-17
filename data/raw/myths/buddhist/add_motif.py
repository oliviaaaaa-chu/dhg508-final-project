import json
p='src/data/motifs.json'
d=json.load(open(p,encoding='utf-8'))
ids={m['id'] for m in d}
if 'karma-retribution' not in ids:
    d.append({
      "id":"karma-retribution","code":"E731","name":{"en":"Karma and rebirth","zh":"業報輪迴"},
      "description":{"en":"Deeds in one existence ripen as reward, rebirth, or retribution in a later existence; the moral engine of South Asian traditions.","zh":"一身所作，來世成熟為果報或轉生；南亞傳統之道德引擎。"},
      "keywords":["karma","rebirth","retribution","deeds ripen","past existence","業","業報","輪迴","轉生","果報"]})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('motifs now:',len(d))
