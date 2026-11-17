import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print(
        "sentence-transformers is not installed.\n"
        "Install it with:\n"
        "  pip install sentence-transformers\n"
        "Then re-run this script. Until then the site uses the built-in TF-IDF engine,\n"
        "and scripts/02_build_similarities.py can precompute a TF-IDF graph."
    )
    sys.exit(1)

TEXTS = ROOT / "src" / "data" / "texts.json"
MODEL = "all-MiniLM-L6-v2"


def main():
    texts = json.loads(TEXTS.read_text(encoding="utf-8"))
    print(f"Loading model '{MODEL}' (first run downloads ~90 MB)...")
    model = SentenceTransformer(MODEL)

    passages = []
    for tx in texts:
        for p in tx["passages"]:
            passages.append({"textId": tx["id"], "pid": p["id"], "text": p["text"]})

    print(f"Encoding {len(passages)} passages...")
    vectors = model.encode([p["text"] for p in passages], normalize_embeddings=True)

    out = []
    for p, v in zip(passages, vectors):
        out.append({"textId": p["textId"], "pid": p["pid"], "vector": [round(float(x), 5) for x in v]})

    out_path = ROOT / "data" / "generated" / "embeddings.json"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(out)} embedding vectors to {out_path.relative_to(ROOT)}")
    print("Next: serve these to the site (or precompute cosine similarities for the network view).")


if __name__ == "__main__":
    main()
