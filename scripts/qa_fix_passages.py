# Fix out-of-range passages in batch files:
#  - short (<40 words): merge into adjacent passage if combined <= 200
#  - long (>200 words): split at sentence boundary near midpoint (cap 4 passages)
# Then renumber ids 1..N. Writes changes back to batch files in place.
import json, os, glob, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_DIR = os.path.join(ROOT, 'data', 'qa_backup')
os.makedirs(BACKUP_DIR, exist_ok=True)

MAX_W, MIN_W, CAP = 200, 40, 4

def wc(s):
    return len(s.split())

SENT_RE = re.compile(r'(?<=[.!?])\s+')
CLAUSE_RE = re.compile(r'(?<=[;:,])\s+')

def units_of(text):
    """Break text into sentence units; any unit >MAX_W is further split at
    clause boundaries, then at word midpoint as last resort."""
    units = [p for p in SENT_RE.split(text) if p]
    out = []
    for u in units:
        while wc(u) > MAX_W:
            parts = [p for p in CLAUSE_RE.split(u, 1) if p] if CLAUSE_RE.search(u) else None
            if parts and len(parts) == 2 and wc(parts[0]) >= MIN_W:
                out.append(parts[0].strip())
                u = parts[1].strip()
            else:
                words = u.split()
                mid = len(words) // 2
                out.append(' '.join(words[:mid]))
                u = ' '.join(words[mid:])
        out.append(u)
    return out

def pack(units):
    """Greedily group units into passages of 40-200 words, in order."""
    groups, cur, cw = [], [], 0
    for u in units:
        uw = wc(u)
        if cur and cw + uw > MAX_W and cw >= MIN_W:
            groups.append(cur)
            cur, cw = [u], uw
        else:
            cur.append(u)
            cw += uw
    if cur:
        if groups and cw < MIN_W and wc(' '.join(groups[-1])) + cw <= MAX_W:
            groups[-1] = groups[-1] + cur
        else:
            groups.append(cur)
    return [' '.join(g).strip() for g in groups]

def split_text(text):
    """Return list of replacement passages (each 40-200 words) for one long
    passage, or None if it cannot be improved."""
    r = pack(units_of(text))
    if len(r) >= 2 and all(MIN_W <= wc(x) <= MAX_W for x in r):
        return r
    return None

def merge_short(ps):
    """Merge <40-word passages into neighbors where combined <= 200."""
    changed = True
    while changed:
        changed = False
        for i, p in enumerate(ps):
            if wc(p['text']) >= MIN_W:
                continue
            done = False
            if i + 1 < len(ps):
                nxt = ps[i + 1]
                if wc(p['text']) + wc(nxt['text']) <= MAX_W:
                    note = p.get('note') or nxt.get('note') or ''
                    if nxt.get('note') and p.get('note') and nxt['note'] != p['note']:
                        note = (p['note'] + ' / ' + nxt['note'])
                    merged = dict(p)
                    merged['text'] = (p['text'].rstrip() + ' ' + nxt['text'].lstrip()).strip()
                    merged['note'] = note
                    ps[i:i + 2] = [merged]
                    done = changed = True
            if not done and i > 0:
                prv = ps[i - 1]
                if wc(p['text']) + wc(prv['text']) <= MAX_W:
                    note = prv.get('note') or p.get('note') or ''
                    if nxt_note := p.get('note'):
                        if prv.get('note') and prv['note'] != p['note']:
                            note = (prv['note'] + ' / ' + p['note'])
                    merged = dict(prv)
                    merged['text'] = (prv['text'].rstrip() + ' ' + p['text'].lstrip()).strip()
                    merged['note'] = note
                    ps[i - 1:i + 1] = [merged]
                    done = changed = True
            if done:
                break
    return ps

def split_long(ps):
    """Split >200-word passages into 40-200-word passages; cap total at 4."""
    guard = 0
    while max(wc(p['text']) for p in ps) > MAX_W and len(ps) < CAP and guard < 10:
        guard += 1
        idx = max(range(len(ps)), key=lambda i: wc(ps[i]['text']))
        parts = split_text(ps[idx]['text'])
        if parts is None or len(ps) + len(parts) - 1 > CAP:
            break
        note = ps[idx].get('note') or ''
        extra = {k: v for k, v in ps[idx].items() if k not in ('id', 'text', 'note')}
        new_ps = []
        for j, txt in enumerate(parts, 1):
            p = {'id': ps[idx].get('id', '1') if j == 1 else 'x', 'text': txt, 'note': note}
            p.update(extra)
            new_ps.append(p)
        ps[idx:idx + 1] = new_ps
    return ps

batches = sorted(glob.glob(os.path.join(ROOT, 'data/raw/batch-*.json')))
report = {'split': 0, 'merged': 0, 'files': set(), 'leftover': []}

for b in batches:
    try:
        d = json.load(open(b, encoding='utf-8-sig'))
    except Exception as e:
        print('PARSE FAIL', os.path.basename(b), e)
        continue
    touched = False
    for t in d.get('texts', []):
        ps = t.get('passages')
        if not ps:
            continue
        orig = json.dumps(ps, ensure_ascii=False)
        n0 = len(ps)
        ps = merge_short(ps)
        report['merged'] += n0 - len(ps)
        n0 = len(ps)
        ps = split_long(ps)
        report['split'] += len(ps) - n0
        # renumber
        for k, p in enumerate(ps, 1):
            p['id'] = str(k)
        t['passages'] = ps
        bad = [wc(p['text']) for p in ps if not (MIN_W <= wc(p['text']) <= MAX_W)]
        if bad:
            report['leftover'].append((t['id'], len(ps), bad))
        if json.dumps(ps, ensure_ascii=False) != orig:
            touched = True
    if touched:
        shutil.copy2(b, os.path.join(BACKUP_DIR, os.path.basename(b)))
        with open(b, 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write('\n')
        report['files'].add(os.path.basename(b))

print(f"merges done: {report['merged']}, splits done: {report['split']}")
print(f"files changed: {len(report['files'])}")
for f in sorted(report['files']):
    print('  ', f)
print(f"\nLEFTOVER out-of-range passages: {len(report['leftover'])}")
for rid, n, bad in report['leftover']:
    print(f'  {rid} ({n} passages, bad word counts: {bad})')
