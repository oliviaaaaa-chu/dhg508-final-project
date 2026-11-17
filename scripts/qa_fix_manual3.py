# Manual one-off fixes for 3 records:
#  - maya-folklore-shooting-stars: extend 36w passage with accurate Brinton content
#  - egyptian-sesostris-empire p1: trim verbatim Herodotus with ellipsis (203 -> ~182)
#  - celtic-finn-sorcha-greek-slaughter p2: trim two trailing clauses (214 -> ~192)
import json, glob, os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EDITS = {
    'maya-folklore-shooting-stars': [
        ('old', None),  # append mode handled below
    ],
}

targets = {'maya-folklore-shooting-stars', 'egyptian-sesostris-empire',
           'celtic-finn-sorcha-greek-slaughter'}
seen = {}

for b in sorted(glob.glob(os.path.join(ROOT, 'data/raw/batch-*.json'))):
    d = json.load(open(b, encoding='utf-8-sig'))
    hit = False
    for t in d.get('texts', []):
        if t['id'] not in targets:
            continue
        seen[t['id']] = b
        ps = t['passages']
        if t['id'] == 'maya-folklore-shooting-stars':
            add = (' For this reason the Indians look on falling stars with awe,'
                   ' as tokens that the balams are still keeping watch over the'
                   ' land by night.')
            ps[0]['text'] = ps[0]['text'].rstrip() + add
            hit = True
        elif t['id'] == 'egyptian-sesostris-empire':
            old = ('which told by inscriptions his own name and the name of his '
                   'country, and how he had subdued them by his power')
            if old in ps[0]['text']:
                ps[0]['text'] = ps[0]['text'].replace(old, '...')
                ps[0]['note'] = ('Verbatim excerpt of Macaulay, Herodotus (1890), '
                                 'Book II.102, condensed with ellipsis; not verbatim throughout.')
                hit = True
        elif t['id'] == 'celtic-finn-sorcha-greek-slaughter':
            old2 = 'till there were hardly enough of them left to tell the story. '
            old3 = ', the way no more of them would be put an end to'
            t2 = ps[1]['text']
            if old2 in t2:
                t2 = t2.replace(old2, '')
            if old3 in t2:
                t2 = t2.replace(old3, '')
            ps[1]['text'] = t2
            hit = True
    if hit:
        shutil.copy2(b, os.path.join(ROOT, 'data', 'qa_backup', os.path.basename(b)))
        with open(b, 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print('updated', os.path.basename(b))

for rid in targets:
    if rid not in seen:
        print('NOT FOUND:', rid)
