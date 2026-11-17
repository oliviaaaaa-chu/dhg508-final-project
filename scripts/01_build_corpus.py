import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "src" / "data" / "texts.json"

REQUIRED_FIELDS = ["id", "title", "tradition", "region", "lat", "lon", "period", "source", "summary", "motifs", "passages", "category"]
CATEGORIES = {"myth", "religious", "myth-religion"}
PURE_RELIGION = {"hebrew", "christian", "islamic", "buddhist", "taoist"}
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def fail(msg):
    print(f"ERROR: {msg}")
    sys.exit(1)


def validate_text(tx, existing_ids):
    for field in REQUIRED_FIELDS:
        if field not in tx:
            fail(f"text '{tx.get('id', '?')}' missing required field: {field}")
    if not ID_RE.match(tx["id"]):
        fail(f"bad id '{tx['id']}' (lowercase letters/digits, hyphens only)")
    if tx["id"] in existing_ids:
        fail(f"duplicate id '{tx['id']}'")
    sensitivity = tx.get("sensitivity") or {}
    if sensitivity.get("restricted", False):
        fail(f"text '{tx['id']}' is marked restricted — exclude it from the corpus entirely")
    if tx.get("category") not in CATEGORIES:
        fail(f"text '{tx['id']}' has category '{tx.get('category')}' — must be one of: myth, religious, myth-religion")
    if tx["category"] == "religious" and tx["tradition"] not in PURE_RELIGION:
        fail(
            f"text '{tx['id']}' has category 'religious' but tradition '{tx['tradition']}' — "
            f"'religious' is reserved for {', '.join(sorted(PURE_RELIGION))}; use 'myth' instead"
        )
    src_url = (tx.get("source") or {}).get("url", "")
    if "wikipedia.org" in src_url.lower():
        fail(f"text '{tx['id']}' uses Wikipedia as source.url — not allowed (Wikisource is fine)")
    for su in tx.get("source_urls") or []:
        if "wikipedia.org" in str(su.get("url", "")).lower():
            fail(f"text '{tx['id']}' lists a Wikipedia URL in source_urls — not allowed (Wikisource is fine)")
    if not (-90 <= tx["lat"] <= 90 and -180 <= tx["lon"] <= 180):
        fail(f"text '{tx['id']}' has out-of-range coordinates")
    for idx, p in enumerate(tx["passages"], start=1):
        if not p.get("text", "").strip():
            fail(f"text '{tx['id']}' has an empty passage")
        p.setdefault("id", str(idx))


def main():
    existing = []
    if OUT.exists():
        existing = json.loads(OUT.read_text(encoding="utf-8"))
        merged = {tx["id"]: tx for tx in existing}
        order = [tx["id"] for tx in existing]
        print(f"Seeding from {OUT.relative_to(ROOT)}: {len(existing)} existing texts")
    else:
        merged = {}
        order = []

    if not RAW.exists():
        print("No data/raw/ directory yet. Copy data/template/corpus.template.json, fill it in, and save batches to data/raw/.")
        sys.exit(0)

    for batch_file in sorted(RAW.glob("*.json")):
        batch = json.loads(batch_file.read_text(encoding="utf-8-sig"))
        for tx in batch.get("texts", []):
            others = set(order) - {tx["id"]}
            validate_text(tx, others)
            tx.pop("_coords_comment", None)
            if tx["id"] not in merged:
                order.append(tx["id"])
            merged[tx["id"]] = tx
            print(f"  + {tx['id']} ({tx['tradition']}, {len(tx['passages'])} passages)")

    if not merged:
        print("data/raw/ contains no texts. Fill in the template first.")
        sys.exit(0)

    OUT.write_text(json.dumps([merged[i] for i in order], ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {len(merged)} texts to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
