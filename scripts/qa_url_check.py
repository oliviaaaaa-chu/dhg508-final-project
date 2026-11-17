# Bulk HTTP status check for sampled source URLs
import json, os
from concurrent.futures import ThreadPoolExecutor
import urllib.request, urllib.error, ssl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sample = json.load(open(os.path.join(ROOT, 'data/qa_sample.json'), encoding='utf-8'))
urls = sorted({x['source_url'] for x in sample if x.get('source_url')})

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
hdrs = {'User-Agent': 'Mozilla/5.0 (QA link check; corpus project)'}

def check(u):
    try:
        req = urllib.request.Request(u, headers=hdrs, method='GET')
        with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
            return u, r.status, len(r.read())
    except urllib.error.HTTPError as e:
        return u, e.code, 0
    except Exception as e:
        return u, f'ERR {type(e).__name__}', 0

with ThreadPoolExecutor(16) as ex:
    results = list(ex.map(check, urls))

bad = [r for r in results if not (isinstance(r[1], int) and 200 <= r[1] < 400 and r[2] > 200)]
print(f'checked {len(urls)} urls; OK {len(results)-len(bad)}; problem {len(bad)}\n')
for u, st, n in bad:
    print(f'{st} {n:>8} {u}')
