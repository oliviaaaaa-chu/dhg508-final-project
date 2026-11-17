# QA sampling audit: draw ~8% per tradition, check structure per skill.md
import json, re, random, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
texts = json.load(open(os.path.join(ROOT, 'src/data/texts.json'), encoding='utf-8-sig'))
motifs = json.load(open(os.path.join(ROOT, 'src/data/motifs.json'), encoding='utf-8-sig'))
characters = json.load(open(os.path.join(ROOT, 'src/data/characters.json'), encoding='utf-8-sig'))
colors = open(os.path.join(ROOT, 'src/lib/colors.js'), encoding='utf-8').read()

# motif ids
if isinstance(motifs, dict):
    motif_ids = set(motifs.keys())
else:
    motif_ids = {m.get('id') for m in motifs}
# character ids
if isinstance(characters, dict):
    char_data = characters.get('characters', characters)
else:
    char_data = characters
if isinstance(char_data, list):
    char_ids = {c.get('id') for c in char_data}
else:
    char_ids = set(char_data.keys())

ID_RE = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')

errors, warnings = [], []

def flag(rec, level, msg):
    (errors if level == 'E' else warnings).append(f"[{rec['tradition']}/{rec['id']}] {msg}")

# sample ~8% per tradition
by_trad = {}
for t in texts:
    by_trad.setdefault(t['tradition'], []).append(t)

random.seed(508)
sample = []
for trad, recs in sorted(by_trad.items()):
    n = max(1, round(0.08 * len(recs)))
    sample.extend(random.sample(recs, n))

print(f"SAMPLE: {len(sample)} of {len(texts)} records "
      f"({len(sample)/len(texts)*100:.1f}%)")

for r in sample:
    # A. base fields
    if not ID_RE.match(r.get('id','')):
        flag(r,'E',f"id regex fail: {r.get('id')}")
    if r.get('tradition') not in colors:
        flag(r,'E',f"tradition not in colors.js: {r.get('tradition')}")
    if r.get('category') not in ('myth','religious'):
        flag(r,'E',f"category invalid: {r.get('category')}")
    title = r.get('title') or {}
    if not title.get('en'): flag(r,'E','title.en missing')
    if not title.get('zh'): flag(r,'E','title.zh missing')
    if title.get('zh') and re.search('[语词说读东无为图书经长]门关', title['zh']) is None:
        pass  # weak heuristic; do simplified-char check separately
    region = r.get('region') or {}
    if not region.get('en') or not region.get('zh'): flag(r,'E','region en/zh missing')
    if not (-90 <= r.get('lat', 999) <= 90): flag(r,'E',f"lat out of range: {r.get('lat')}")
    if not (-180 <= r.get('lon', 999) <= 180): flag(r,'E',f"lon out of range: {r.get('lon')}")
    period = r.get('period','')
    if not period: flag(r,'E','period missing')
    elif re.match(r'^(ancient|old|early|traditional|modern|pre-modern|unknown)[\s.]*$', period, re.I):
        flag(r,'W',f"vague period: '{period}'")
    src = r.get('source') or {}
    for k in ('archive','work','url'):
        if not src.get(k): flag(r,'E',f"source.{k} missing")
    if src.get('url') and not src['url'].lower().startswith(('http://','https://')):
        flag(r,'E',f"source.url not http(s): {src['url']}")
    if not r.get('license'): flag(r,'E','license missing')
    summ = r.get('summary') or {}
    if not summ.get('en') or not summ.get('zh'): flag(r,'E','summary en/zh missing')
    else:
        if not (1 <= len(re.findall(r'[.!?。]', summ['en'])) <= 3):
            flag(r,'W',f"summary.en sentence count {len(re.findall(r'[.!?。]', summ['en']))}")
    ms = r.get('motifs')
    if not isinstance(ms, list) or not (1 <= len(ms) <= 5):
        flag(r,'E',f"motifs count invalid: {ms}")
    else:
        for m in ms:
            if m not in motif_ids: flag(r,'E',f"unknown motif id: {m}")
    sens = r.get('sensitivity') or {}
    if 'restricted' not in sens or 'note' not in sens:
        flag(r,'E','sensitivity.{restricted,note} missing')
    persons = r.get('persons')
    if persons is not None:
        for p in persons:
            if p not in char_ids: flag(r,'E',f"unknown person id: {p}")
    # passages
    ps = r.get('passages') or []
    if not (1 <= len(ps) <= 4): flag(r,'E',f"passages count {len(ps)}")
    else:
        for i, p in enumerate(ps, 1):
            wc = len(p.get('text','').split())
            if not (40 <= wc <= 200): flag(r,'E',f"passage {i} word count {wc}")
            if p.get('id') != str(i): flag(r,'W',f"passage {i} id={p.get('id')!r}")
            if not p.get('note'): flag(r,'W',f"passage {i} missing note (paraphrase marker)")

    # B. deep fields
    if 'narrative' in r:
        n = r['narrative'] or {}
        en = n.get('en','')
        wcn = len(en.split())
        if wcn < 50: flag(r,'E',f"narrative stub {wcn} words")
        elif wcn < 400: flag(r,'W',f"narrative below target {wcn} words")
        elif wcn > 2500: flag(r,'W',f"narrative over limit {wcn} words")
        fns = r.get('functions') or []
        if not (2 <= len(fns) <= 4): flag(r,'E',f"functions count {len(fns)}")
        vs = r.get('variants') or []
        if len(vs) < 1: flag(r,'E','variants missing')
        else:
            for v in vs:
                if not v.get('name'): flag(r,'E','variant missing name')
                if 'cross_ref' not in v: flag(r,'E','variant missing cross_ref')
        if not r.get('language'): flag(r,'E','language missing')
        if not r.get('canonical_translation'): flag(r,'E','canonical_translation missing')
        if not (r.get('primary_sources') or []): flag(r,'E','primary_sources missing')
        if not (r.get('secondary_sources') or []): flag(r,'E','secondary_sources missing')
        sus = r.get('source_urls') or []
        if not sus: flag(r,'E','source_urls missing')
        else:
            for u in sus:
                if not u.get('url'): flag(r,'E','source_urls entry missing url')
                if not DATE_RE.match(str(u.get('accessed',''))): flag(r,'E',f"accessed not YYYY-MM-DD: {u.get('accessed')}")
        sf = r.get('sensitivity_flag','none')
        if sf not in ('none','living_tradition_low','living_tradition_high','indigenous_oral_consent','colonial_era_collection_caution'):
            flag(r,'E',f"sensitivity_flag invalid: {sf}")
        if sf != 'none' and not r.get('sensitivity_guidance'):
            flag(r,'E','sensitivity_guidance required when flag != none')
        prov = r.get('provenance') or {}
        for k in ('record_status','compiled','compiled_by','review_status'):
            if not prov.get(k): flag(r,'E',f"provenance.{k} missing")
        if prov.get('record_status') == 'reconstructed' and not (r.get('reconstructed_segments') or []):
            flag(r,'E','reconstructed without reconstructed_segments')

print()
print(f"=== ERRORS: {len(errors)} ===")
for e in errors: print('E', e)
print()
print(f"=== WARNINGS: {len(warnings)} ===")
for w in warnings: print('W', w)

# save sample for follow-up steps
with open(os.path.join(ROOT, 'data', 'qa_sample.json'), 'w', encoding='utf-8') as f:
    json.dump([{'tradition': r['tradition'], 'id': r['id'], 'source_url': (r.get('source') or {}).get('url'),
                'work': (r.get('source') or {}).get('work'), 'period': r.get('period'),
                'title': (r.get('title') or {}).get('en')} for r in sample],
              f, ensure_ascii=False, indent=1)
print(f"\nSample list saved to data/qa_sample.json")

# per-tradition sample counts
cnt = {}
for r in sample: cnt[r['tradition']] = cnt.get(r['tradition'], 0) + 1
print('\nPer-tradition sample:', dict(sorted(cnt.items())))
