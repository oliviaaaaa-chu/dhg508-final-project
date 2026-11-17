# Scan whole corpus for out-of-range passages; map record id -> batch file
import json, os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def wc(s):
    return len(s.split())

batches = sorted(glob.glob(os.path.join(ROOT, 'data/raw/batch-*.json')))
id2file = {}
for b in batches:
    try:
        d = json.load(open(b, encoding='utf-8-sig'))
    except Exception as e:
        print('PARSE FAIL', b, e)
        continue
    for t in d.get('texts', []):
        id2file[t['id']] = os.path.basename(b)

texts = json.load(open(os.path.join(ROOT, 'src/data/texts.json'), encoding='utf-8-sig'))
long_n, short_n, fiveplus, unmapped = [], [], [], []
for t in texts:
    ps = t.get('passages') or []
    if len(ps) > 4:
        fiveplus.append((t['id'], len(ps)))
    for i, p in enumerate(ps, 1):
        w = wc(p.get('text', ''))
        if w > 200:
            long_n.append((t['id'], i, w))
        elif w < 40:
            short_n.append((t['id'], i, w))
        if t['id'] not in id2file:
            unmapped.append(t['id'])

print(f'long >200: {len(long_n)}')
print(f'short <40: {len(short_n)}')
print(f'records with >4 passages: {len(fiveplus)}')
print(f'record ids not found in any batch file: {len(set(unmapped))}')
for x in sorted(set(unmapped))[:20]:
    print('  unmapped:', x)
print()
print('--- long passages ---')
for r in long_n: print(f'{r[2]:>5}  {r[0]}  p{r[1]}')
print('--- short passages ---')
for r in short_n: print(f'{r[2]:>5}  {r[0]}  p{r[1]}')
print('--- >4 passage records ---')
for r in fiveplus: print(f'{r[1]:>5}  {r[0]}')
json.dump({'long': long_n, 'short': short_n, 'fiveplus': fiveplus},
          open(os.path.join(ROOT, 'data/qa_passage_scan.json'), 'w'), indent=1)
