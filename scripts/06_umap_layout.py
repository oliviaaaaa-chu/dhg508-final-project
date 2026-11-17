import json
from pathlib import Path

import numpy as np
import umap

ROOT = Path(__file__).resolve().parent.parent

SPANS_2D = [400, 260]
SPANS_3D = [400, 260, 380]
N_NEIGHBORS = 15
MIN_DIST = 0.25
SEED = 42


def main():
    emb_path = ROOT / "data" / "generated" / "embeddings.json"
    if not emb_path.exists():
        print("data/generated/embeddings.json missing — run scripts/03_embed.py first; keeping existing layout")
        return
    emb_raw = json.loads(emb_path.read_text(encoding="utf-8"))
    cache_path = ROOT / "public" / "semantic-cache.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8"))

    by_text = {}
    for row in emb_raw:
        by_text.setdefault(row["textId"], []).append(row["vector"])

    ids, X = [], []
    for p in cache["emb3"]["points"]:
        vs = by_text.get(p["id"])
        if not vs:
            print(f"missing embeddings for {p['id']} — skipped")
            continue
        m = np.mean(np.array(vs, dtype=np.float64), axis=0)
        norm = np.linalg.norm(m) or 1.0
        ids.append(p["id"])
        X.append(m / norm)
    X = np.array(X)
    print(f"text vectors: {X.shape}")

    print(f"UMAP 3D (n_neighbors={N_NEIGHBORS}, min_dist={MIN_DIST})...")
    Y3 = umap.UMAP(
        n_components=3, metric="cosine", n_neighbors=N_NEIGHBORS,
        min_dist=MIN_DIST, random_state=SEED,
    ).fit_transform(X)
    print("UMAP 2D...")
    Y2 = umap.UMAP(
        n_components=2, metric="cosine", n_neighbors=N_NEIGHBORS,
        min_dist=MIN_DIST, random_state=SEED,
    ).fit_transform(X)

    def build(Y, spans):
        Y = Y - Y.mean(axis=0)
        rms = np.sqrt((Y**2).mean(axis=0))
        p975 = np.percentile(np.abs(Y), 97.5, axis=0)
        spreads = np.maximum(p975, rms)
        spreads = np.where(spreads > 0, spreads, 1.0)
        lims = [s * 1.5 for s in spans]
        points = []
        for i, tid in enumerate(ids):
            q = {"id": tid}
            for d in range(Y.shape[1]):
                v = Y[i, d] * (spans[d] / spreads[d])
                q["xyz"[d]] = float(min(max(v, -lims[d]), lims[d]))
            points.append(q)
        out = {"points": points}
        for d, span in enumerate(spans):
            out[f"var{d + 1}"] = 0
        return out

    cache["emb2"] = build(Y2, SPANS_2D)
    cache["emb3"] = build(Y3, SPANS_3D)
    cache_path.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    print(f"updated {cache_path.relative_to(ROOT)} — UMAP layout, sim graph + fingerprint unchanged")


if __name__ == "__main__":
    main()
