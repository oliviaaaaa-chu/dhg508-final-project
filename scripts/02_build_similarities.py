import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "src" / "data" / "texts.json"

STOP = set(
    "the a an and of to in on at for from with by as is are was were be been it its his her their they them "
    "he she we you i that this these those not no nor but or if then than so such into over under out up down "
    "about against between through during before after above below all any both each few more most other some "
    "only own same too very can will just should now when where which who whom why how once here there upon "
    "while also thus yet said says".split()
)


def tokenize(s):
    s = re.sub(r"[^\w\s]", " ", s.lower())
    out = []
    for w in s.split():
        if w in STOP:
            continue
        out.append(w)
        if len(w) > 4:
            out.append(w.rstrip("s"))
    return out


def main():
    try:
        texts = json.loads(TEXTS.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print("src/data/texts.json not found — run scripts/01_build_corpus.py first.")
        sys.exit(1)

    docs = []
    for tx in texts:
        for p in tx["passages"]:
            docs.append({"textId": tx["id"], "pid": p["id"], "tokens": tokenize(p["text"])})

    n_docs = len(docs)
    df = Counter()
    for d in docs:
        df.update(set(d["tokens"]))
    idf = {tk: math.log(1 + n_docs / (c + 1)) for tk, c in df.items()}

    for d in docs:
        tf = Counter(d["tokens"])
        vec = {tk: c * idf.get(tk, math.log(1 + n_docs)) for tk, c in tf.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        d["vec"] = {tk: v / norm for tk, v in vec.items() if v > 1e-9}

    by_text = {}
    for d in docs:
        by_text.setdefault(d["textId"], []).append(d)

    def cos(a, b):
        small, large = (a, b) if len(a) <= len(b) else (b, a)
        return sum(v * large.get(tk, 0.0) for tk, v in small.items())

    pairs = []
    ids = list(by_text)
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            a, b = ids[i], ids[j]
            max_pass = max((cos(x["vec"], y["vec"]) for x in by_text[a] for y in by_text[b]), default=0.0)
            pairs.append({"a": a, "b": b, "sim": round(max_pass, 4)})

    threshold = float(sys.argv[1]) if len(sys.argv) > 1 else 0.35
    kept = [p for p in pairs if p["sim"] >= threshold]
    out = {
        "_comment": f"Passage-level TF-IDF cosine similarities >= {threshold}. Regenerate with the embeddings pipeline for semantic quality.",
        "threshold": threshold,
        "pairs": sorted(kept, key=lambda p: -p["sim"]),
    }
    out_path = ROOT / "data" / "generated" / "similarities.json"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(kept)} pairs (of {len(pairs)}) to {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
