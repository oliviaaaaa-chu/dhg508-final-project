# Extend single-passage <40-word records with sentences from the record's own
# summary.en (already-vetted content), until the passage reaches >=40 words.
import json, os, glob, shutil, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_W = 40

def wc(s):
    return len(s.split())

def sents(text):
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]

batches = sorted(glob.glob(os.path.join(ROOT, 'data/raw/batch-*.json')))
fixed, files, manual = [], set(), []

for b in batches:
    try:
        d = json.load(open(b, encoding='utf-8-sig'))
    except Exception as e:
        print('PARSE FAIL', os.path.basename(b), e)
        continue
    touched = False
    for t in d.get('texts', []):
        ps = t.get('passages') or []
        if len(ps) != 1:
            continue
        p = ps[0]
        if wc(p['text']) >= MIN_W:
            continue
        summ = (t.get('summary') or {}).get('en') or ''
        add, have = [], p['text']
        for s in sents(summ):
            if s not in have and s not in add:
                add.append(s)
            if wc(have) + sum(wc(a) for a in add) >= MIN_W:
                break
        if not add:
            manual.append((t['id'], wc(p['text'])))
            continue
        have = have.rstrip() + ' ' + ' '.join(add)
        p['text'] = have
        if wc(have) < MIN_W:
            manual.append((t['id'], wc(have)))
            continue
        fixed.append((t['id'], wc(have)))
        touched = True
    if touched:
        shutil.copy2(b, os.path.join(ROOT, 'data', 'qa_backup', os.path.basename(b)))
        with open(b, 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write('\n')
        files.add(os.path.basename(b))

print(f'fixed {len(fixed)} short single-passage records in {len(files)} files')
for rid, w in fixed:
    print(f'  {w:>4}  {rid}')
print(f'\nSTILL SHORT (no usable summary sentences): {len(manual)}')
for rid, w in manual:
    print(f'  {w:>4}  {rid}')
