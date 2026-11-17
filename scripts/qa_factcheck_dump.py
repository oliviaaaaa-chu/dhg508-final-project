import json, random
d = json.load(open('src/data/texts.json', encoding='utf-8-sig'))
idx = {t['id']: t for t in d}
by = {}
for t in d:
    by.setdefault(t['tradition'], []).append(t['id'])
random.seed(7)
trads = ['greek', 'norse', 'hebrew', 'japanese', 'inuit', 'san', 'taoist', 'maya',
         'egyptian', 'inca', 'polynesian', 'chinese', 'hindu', 'islamic', 'korean',
         'woodland', 'babylonian', 'sumerian', 'persian', 'philippine']
out = []
for trad in trads:
    pid = random.choice(by[trad])
    t = idx[pid]
    s = t.get('source', {})
    out.append('=' * 80)
    out.append(f"{trad} :: {pid} | period: {t.get('period')}")
    out.append(f"SRC: {s.get('work')} | {s.get('archive')} | {s.get('url')}")
    out.append('SUMMARY: ' + (t.get('summary') or {}).get('en', ''))
    for p in (t.get('passages') or [])[:2]:
        out.append(f"--p{p.get('id')}: " + p.get('text', '')[:350])
        out.append('   note: ' + str(p.get('note', ''))[:200])
txt = '\n'.join(out)
open('data/qa_factcheck_sample.txt', 'w', encoding='utf-8').write(txt)
print('wrote', len(txt), 'chars')
for trad in trads:
    print(' ', trad, random.choice(by[trad]))
