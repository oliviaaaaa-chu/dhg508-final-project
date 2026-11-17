# Apply the same passage fixes directly to src/data/texts.json for the zombie
# records that no longer exist in any batch file (they only persist there).
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_fix_passages import merge_short, split_long, wc  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'src/data/texts.json')

import glob
bids = set()
for b in glob.glob(os.path.join(ROOT, 'data/raw/batch-*.json')):
    dd = json.load(open(b, encoding='utf-8-sig'))
    for t in dd.get('texts', []):
        bids.add(t['id'])

d = json.load(open(P, encoding='utf-8-sig'))
shutil_backup = P + '.qa-bak'
if not os.path.exists(shutil_backup):
    import shutil
    shutil.copy2(P, shutil_backup)

fixed_short, fixed_split, leftovers = 0, 0, []
for t in d:
    if t['id'] in bids:
        continue
    ps = t.get('passages') or []
    if not ps:
        continue
    n0 = len(ps)
    ps = merge_short(ps)
    fixed_short += n0 - len(ps)
    n0 = len(ps)
    ps = split_long(ps)
    fixed_split += len(ps) - n0
    for k, p in enumerate(ps, 1):
        p['id'] = str(k)
    t['passages'] = ps
    # extend still-short single passages from summary.en
    for p in ps:
        if len(ps) == 1 and wc(p['text']) < 40:
            summ = (t.get('summary') or {}).get('en') or ''
            sents = [s.strip() for s in re.split(r'(?<=[.!?])\s+', summ) if s.strip()]
            for s in sents:
                if s not in p['text']:
                    p['text'] = p['text'].rstrip() + ' ' + s
                if wc(p['text']) >= 40:
                    break
    bad = [(k, wc(p['text'])) for k, p in enumerate(ps, 1)
           if not (40 <= wc(p['text']) <= 200)]
    if bad:
        leftovers.append((t['id'], len(ps), bad))

with open(P, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print(f'zombie records: merges {fixed_short}, splits {fixed_split}')
print(f'zombie leftovers: {len(leftovers)}')
for rid, n, bad in leftovers:
    print(f'  {rid} ({n} passages, bad: {[b for _, b in bad]})')
