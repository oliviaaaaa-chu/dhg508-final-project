import base64
import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

try:
    import numpy as np
except ImportError:
    print("Installing numpy...")
    subprocess.run([sys.executable, "-m", "pip", "install", "numpy"], check=True)
    import numpy as np

# Pairs below this raw cosine never enter the similarity matrix. MiniLM
# story vectors sit far above TF-IDF cosines for unrelated pairs (median
# pairwise cosine ~0.32 across the corpus, p95 ~0.50), so this floor is
# what separates "shares a real parallel" from background relatedness.
# 0.50 keeps ~0.7M of the 14.9M possible pairs (~10 MB of JSON); 0.45
# would already push the file past ~25 MB.
SIM_FLOOR = 0.50

MOTIFS = json.loads((ROOT / "src" / "data" / "motifs.json").read_text(encoding="utf-8-sig"))
MOTIF_BY_ID = {m["id"]: m for m in MOTIFS}

POLICY = {
    "excluded": {"aztec", "hittite", "zoroastrian", "vietnamese", "ugaritic", "thai"},
    "merges": {"maori": "polynesian", "hawaiian": "polynesian", "baltic": "slavic", "sumerian": "mesopotamian", "babylonian": "mesopotamian"},
    "recategorizeByTradition": {"tibetan": "myth-religion", "islamic": "myth-religion", "afroatlantic": "myth-religion"},
    "pureReligion": {"hebrew", "christian", "islamic", "buddhist", "taoist"},
}

STOP = set(
    ("the a an and of to in on at for from with by as is are was were be been being it its his her their they them he she we you i "
     "that this these those not no nor but or if then than so such into over under out up down about against between through during "
     "before after above below all any both each few more most other some only own same too very can will just should now when where "
     "which who whom why how once here there upon while also thus yet said says made come came went go").split()
)


def tokenize(s):
    s = re.sub(r"[^\w\s]", " ", str(s).lower(), flags=re.UNICODE)
    s = s.replace("_", " ")
    out = []
    for w in s.split():
        if any("\u4e00" <= ch <= "\u9fff" for ch in w):
            out.append(w)
            for i in range(len(w) - 1):
                out.append(w[i : i + 2])
        else:
            if w in STOP:
                continue
            out.append(w)
            if len(w) > 4:
                w2 = re.sub(r"ies$", "y", w)
                w2 = re.sub(r"(?:ing|ed|es|s)$", "", w2)
                out.append(w2)
    return out


def add(counter, tokens, weight):
    for tk in tokens:
        counter[tk] = counter.get(tk, 0) + weight


def load_texts():
    raw = json.loads((ROOT / "src" / "data" / "texts.json").read_text(encoding="utf-8-sig"))
    texts = []
    for tx in raw:
        if not isinstance(tx, dict):
            continue
        if tx.get("tradition") in POLICY["excluded"]:
            continue
        ps = tx.get("passages")
        if not isinstance(ps, list) or len(ps) == 0:
            continue
        if not all(isinstance(p, dict) and isinstance(p.get("text"), str) and p["text"].strip() for p in ps):
            continue
        if not isinstance(tx.get("motifs"), list) or not tx.get("title", {}).get("en") or not tx.get("region") or not isinstance(tx.get("lat"), (int, float)) or not isinstance(tx.get("lon"), (int, float)) or not isinstance(tx.get("period"), str) or not tx.get("source"):
            continue
        tx = dict(tx)
        tx["tradition"] = POLICY["merges"].get(tx["tradition"], tx["tradition"])
        if tx["category"] == "religious" and tx["tradition"] not in POLICY["pureReligion"]:
            tx["category"] = "myth"
        if tx["tradition"] in POLICY["recategorizeByTradition"]:
            tx["category"] = POLICY["recategorizeByTradition"][tx["tradition"]]
        texts.append(tx)
    return texts


def load_story_embeddings(texts, fp):
    # The per-story vectors built by `npm run embed` (scripts/embed_corpus.mjs):
    # one L2-normalized 384-dim MiniLM vector per served text, in the same
    # order. When they exist and match the corpus, the similarity matrix and
    # the Embedding Map projection are built from MEANING rather than shared
    # keywords. Missing/stale file -> TF-IDF fallback, so a fresh clone
    # (these JSONs are gitignored) still builds a working cache.
    path = ROOT / "public" / "semantic-embeddings.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if data.get("fp") != fp:
            print(f"embeddings stale (fp {data.get('fp')!r} != {fp!r})")
            return None
        ids = data["ids"]
        if ids != [t["id"] for t in texts]:
            print("embedding id order does not match the served corpus")
            return None
        dim = int(data["dim"])
        E = np.frombuffer(base64.b64decode(data["vecs"]), dtype=np.float32)
        if E.size != len(ids) * dim:
            print("embedding byte length does not match ids x dim")
            return None
        return E.reshape(len(ids), dim)
    except Exception as e:
        print(f"embeddings unreadable ({e})")
        return None


def build_emb_from_scores(scores, lams, ids, spans):
    # Same scaling contract as the TF-IDF path: columns ordered by spread,
    # each scaled so the max(|p975|, rms) lands on the span, clipped to
    # 1.5x the span. Points are plain {id, x[, y[, z]]} objects.
    n, k = scores.shape
    lam = np.clip(lams[:k], 0, None)
    raw = np.array(scores, dtype=np.float64)
    raw = raw - raw.mean(axis=0)
    rms = np.sqrt((raw ** 2).mean(axis=0))
    p975 = np.percentile(np.abs(raw), 97.5, axis=0)
    spreads = np.maximum(p975, rms)
    spreads = np.where(spreads > 0, spreads, 1.0)
    order = np.argsort(-spreads)
    lims = [s * 1.5 for s in spans]
    points = []
    for i in range(n):
        q = {"id": ids[i]}
        for d in range(k):
            src = int(order[d])
            v = raw[i, src] * (spans[d] / spreads[src])
            q["xyz"[d]] = float(min(max(v, -lims[d]), lims[d]))
        points.append(q)
    return {"points": points, **{f"var{d + 1}": float(lam[int(order[d])] / n) for d in range(k)}}


def build_semantic_cache(texts, E):
    ids = [t["id"] for t in texts]
    n = len(texts)

    # Rows are L2-normalized by embed_corpus.mjs; renormalize defensively so
    # the matmul below is a true cosine even if that ever changes.
    norms = np.linalg.norm(E, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    En = E / norms

    print("computing cosine matrix (chunked matmul)...")
    G = np.empty((n, n), dtype=np.float32)
    block = 512
    for start in range(0, n, block):
        end = min(start + block, n)
        G[start:end] = En[start:end] @ En.T

    print(f"extracting similarity pairs (raw floor {SIM_FLOOR})...")
    iu_j = np.triu_indices(n, k=1)
    tri_vals = G[iu_j].astype(np.float64)
    del G
    max_raw = float(np.max(tri_vals)) if tri_vals.size else 0.0
    if max_raw <= SIM_FLOOR:
        print("no pairs above the similarity floor — check the embeddings")
        sys.exit(1)
    print(f"max raw cosine: {max_raw:.3f}")
    mask = tri_vals >= SIM_FLOOR
    ii = iu_j[0][mask]
    jj = iu_j[1][mask]
    vv = tri_vals[mask]
    del tri_vals, mask

    # Display calibration: the kept raw cosines are extremely skewed (most
    # sit just above the floor; only near-duplicate pairs approach 1.0), so
    # neither max-normalization nor a linear remap uses the [0, 1] scale.
    # Instead each pair's display value is its PERCENTILE RANK among all
    # kept parallels: monotonic (ordering and symmetry are preserved), the
    # Network threshold slider spans its whole range (0.55 = "closer than
    # 55% of all stored parallels"), and the % readouts rank a parallel
    # against the corpus instead of exposing a raw cosine visitors cannot
    # interpret anyway.
    order = np.sort(vv)
    pos = np.searchsorted(order, vv, side="left")
    disp = (pos + 0.5) / len(vv)
    sim_flat = []
    for a, b, s in zip(ii.tolist(), jj.tolist(), disp.tolist()):
        sim_flat.extend([a, b, int(round(s * 1000))])
    print(f"similarity pairs kept: {len(ii)}")
    del ii, jj, disp

    print("PCA projection of the story embeddings...")
    Ec = En.astype(np.float64)
    Ec -= Ec.mean(axis=0)
    # U columns scaled by the singular values are the principal-component
    # coordinates — the same quantity the TF-IDF path got from the
    # eigendecomposition of the Gram matrix (eigvec * sqrt(lambda)).
    U, S, _ = np.linalg.svd(Ec, full_matrices=False)
    scores = U[:, :3] * S[:3]
    lams = S[:3] ** 2

    emb2 = build_emb_from_scores(scores[:, :2], lams[:2], ids, [400, 260])
    emb3 = build_emb_from_scores(scores, lams, ids, [400, 260, 380])
    return sim_flat, emb2, emb3


def build_tfidf_cache(texts):
    # Fallback for builds without public/semantic-embeddings.json: the
    # original keyword-vector pipeline (similarity matrix + projection from
    # stemmed TF-IDF text vectors).
    n_texts = len(texts)
    docs = []
    for tx in texts:
        title_tok = tokenize(f"{tx['title']['en']} {tx['title'].get('zh', '')}")
        summary_tok = tokenize(f"{tx['summary']['en']} {tx['summary'].get('zh', '')}")
        motif_tok = []
        for m in tx["motifs"]:
            mo = MOTIF_BY_ID.get(m)
            if mo:
                motif_tok.extend(tokenize(" ".join(mo["keywords"])))
        for p in tx["passages"]:
            counts = {}
            add(counts, tokenize(p["text"]), 1.0)
            add(counts, title_tok, 1.4)
            add(counts, summary_tok, 0.6)
            add(counts, motif_tok, 1.2)
            docs.append({"textId": tx["id"], "counts": counts})
    n_docs = len(docs)

    df = {}
    for d in docs:
        for tk in d["counts"]:
            df[tk] = df.get(tk, 0) + 1
    idf_default = math.log(1 + n_docs)

    def to_vec(counts):
        vec = {}
        n2 = 0.0
        for tk, w in counts.items():
            v = w * math.log(1 + n_docs / (df.get(tk, 0) + 1))
            if v > 1e-9:
                vec[tk] = v
                n2 += v * v
        norm = math.sqrt(n2) or 1.0
        return {tk: v / norm for tk, v in vec.items()}

    for d in docs:
        d["vec"] = to_vec(d["counts"])

    vecs_by_text = {}
    for d in docs:
        vecs_by_text.setdefault(d["textId"], []).append(d["vec"])

    text_df = {}
    for tid, vecs in vecs_by_text.items():
        seen = set()
        for v in vecs:
            seen.update(v.keys())
        for tk in seen:
            text_df[tk] = text_df.get(tk, 0) + 1

    df_floor = 5
    df_cap = max(3, round(n_texts * 0.25))
    vocab = [tk for tk, c in text_df.items() if df_floor <= c <= df_cap]
    tok_index = {tk: i for i, tk in enumerate(vocab)}
    V = len(vocab)
    print(f"vocab (similarity space): {V}")

    n = n_texts
    M = np.zeros((n, V), dtype=np.float32)
    for i, tx in enumerate(texts):
        vecs = vecs_by_text[tx["id"]]
        merged = {}
        for v in vecs:
            for tk, w in v.items():
                idx = tok_index.get(tk)
                if idx is not None:
                    merged[idx] = merged.get(idx, 0.0) + w
        n2 = math.sqrt(sum(w * w for w in merged.values())) or 1.0
        for idx, w in merged.items():
            M[i, idx] = w / n2

    print("computing Gram matrix (chunked matmul)...")
    G = np.empty((n, n), dtype=np.float32)
    block = 512
    for start in range(0, n, block):
        end = min(start + block, n)
        G[start:end] = M[start:end] @ M.T

    print("eigendecomposition (PCA axes)...")
    eigvals, eigvecs = np.linalg.eigh(G.astype(np.float64))
    top = eigvals[::-1][:3]
    axes = eigvecs[:, ::-1][:, :3]
    ids = [t["id"] for t in texts]

    scores = axes * np.sqrt(np.clip(top, 0, None))[None, :]
    emb2 = build_emb_from_scores(scores[:, :2], top[:2], ids, [400, 260])
    emb3 = build_emb_from_scores(scores, top, ids, [400, 260, 380])

    print("extracting similarity pairs...")
    iu_j = np.triu_indices(n, k=1)
    tri_vals = G[iu_j].astype(np.float64)
    del G
    max_raw = float(np.max(tri_vals)) if tri_vals.size else 0.0
    del tri_vals
    if max_raw <= 0:
        print("no positive similarities — check vectors")
        sys.exit(1)

    # Same rule as the original pipeline: normalize by the max raw cosine,
    # keep the top 8%.
    print("extracting similarity pairs...")
    iu_j = np.triu_indices(n, k=1)
    tri_vals = G[iu_j].astype(np.float64)
    del G
    max_raw = float(np.max(tri_vals)) if tri_vals.size else 0.0
    if max_raw <= 0:
        print("no positive similarities — check vectors")
        sys.exit(1)
    norm = np.clip(tri_vals / max_raw, 0.0, 1.0)
    del tri_vals
    mask = norm >= 0.08
    ii = iu_j[0][mask]
    jj = iu_j[1][mask]
    vv = norm[mask]
    del norm, mask
    sim_flat = []
    for a, b, s in zip(ii.tolist(), jj.tolist(), vv.tolist()):
        sim_flat.extend([a, b, int(round(s * 1000))])
    print(f"similarity pairs kept: {len(ii)}")
    return sim_flat, emb2, emb3


def main():
    texts = load_texts()
    n_texts = len(texts)
    print(f"valid texts after policy: {n_texts}")
    if n_texts == 0:
        sys.exit(1)
    n_docs = sum(len(t["passages"]) for t in texts)
    print(f"passage docs: {n_docs}")

    fp = f"{n_texts}|{n_docs}|{texts[0]['id']}|{texts[-1]['id']}"

    E = load_story_embeddings(texts, fp)
    if E is not None:
        print("building the cache from the per-story embeddings (semantic path)")
        sim_flat, emb2, emb3 = build_semantic_cache(texts, E)
    else:
        print(
            "WARNING: public/semantic-embeddings.json is missing or stale — "
            "falling back to the TF-IDF pipeline. Run `npm run embed` to "
            "regenerate the story vectors."
        )
        sim_flat, emb2, emb3 = build_tfidf_cache(texts)

    out = {"fp": fp, "sim": sim_flat, "emb2": emb2, "emb3": emb3}
    out_path = ROOT / "public" / "semantic-cache.json"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {out_path.relative_to(ROOT)} ({out_path.stat().st_size / 1e6:.1f} MB)")
    print(f"fingerprint: {fp}")

    check = subprocess.run(
        [
            "node", "-e",
            "const es=require('esbuild');"
            "es.buildSync({entryPoints:['src/lib/search.js'],bundle:true,format:'esm',outfile:'fp-check.mjs',loader:{'.json':'json'},platform:'node',target:'es2022'});"
            "globalThis.__SKIP_MATRIX__=true;"
            # search.js hydrates lazily since the corpus was moved out of the
            # bundle — the parity check must hydrate from the same raw JSON
            # the python side reads, or fingerprint() reports an empty corpus.
            "import('./fp-check.mjs').then(s=>{"
            "const fs=require('fs');"
            "const raw=JSON.parse(fs.readFileSync('src/data/texts.json','utf8'));"
            "s.hydrateCorpusFromRaw(raw);"
            "console.log(s.fingerprint());"
            "process.exit(0)"
            "}).catch(e=>{console.error(e.message);process.exit(1)})",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    js_fp = check.stdout.strip().splitlines()[-1] if check.stdout.strip() else ""
    Path(ROOT / "fp-check.mjs").unlink(missing_ok=True)
    if js_fp == fp:
        print("fingerprint parity: OK")
    else:
        print(f"fingerprint parity FAILED: js='{js_fp}' python='{fp}'")
        print("The POLICY in this script is out of sync with src/data/traditionPolicy.js — update it.")
        sys.exit(1)


if __name__ == "__main__":
    main()
