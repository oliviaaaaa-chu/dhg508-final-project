"""QA validator for deep narrative records (fieldwork extension).

Validates every batch in data/raw/:
  - JSON parse errors
  - base fields are validated separately by 01_build_corpus.py
  - a record carrying a 'narrative' object is a DEEP record and must satisfy:
      * narrative.en word count: <50 words -> STUB (error), 50-399 -> below target (warning), >2500 -> warning
      * >=1 primary_sources entry AND >=1 secondary_sources entry
      * >=1 variant, each with name + summary
      * every source_urls entry carries an accessed date (YYYY-MM-DD)
      * sensitivity_flag present (+ guidance when flag != none)
      * provenance.record_status in {complete, reconstructed, stub};
        'reconstructed' requires >=1 reconstructed_segments entry citing the restoration
  - motif ids cross-checked against src/data/motifs.json (warning on unknown ids)
  - coverage report over the project's target tradition list; traditions with
    zero deep records are reported as pending (stub), not errors.

Usage:  py scripts/04_qa_narratives.py
Exit 1 on any error; warnings alone exit 0.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
MOTIFS = ROOT / "src" / "data" / "motifs.json"

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FLAGS = {"none", "living_tradition_low", "living_tradition_high",
         "indigenous_oral_consent", "colonial_era_collection_caution"}

# Target tradition list (DHG508 brief, 2026). slug -> label for the report.
TARGET_TRADITIONS = [
    ("hebrew", "Judaism (Hebrew tradition)"),
    ("christian", "Christianity"),
    ("islamic", "Islam"),
    ("hindu", "Hinduism"),
    ("buddhist", "Buddhism"),
    ("taoist", "Taoism"),
    ("yoruba", "Yoruba / Ifa"),
    ("afroatlantic", "Afro-Atlantic diaspora (Vodou, Santeria, Candomble)"),
    ("zoroastrian", "Zoroastrianism"),
    ("greek", "Greek"),
    ("norse", "Norse"),
    ("chinese", "Chinese"),
    ("maori", "Maori"),
    ("japanese", "Japanese"),
    ("maya", "Maya"),
    ("egyptian", "Egyptian"),
    ("sumerian", "Mesopotamian: Sumerian"),
    ("babylonian", "Mesopotamian: Babylonian"),
    ("aztec", "Aztec / Mexica"),
    ("slavic", "Slavic"),
    ("celtic", "Celtic"),
    ("korean", "Korean"),
    ("hawaiian", "Hawaiian"),
    ("polynesian", "Polynesian / Maui figure"),
    ("melanesian", "Melanesian"),
    ("indonesian", "Indonesian"),
    ("philippine", "Philippine"),
    ("inca", "Inca / Andean"),
    ("amazonian", "Amazonian"),
    ("baltic", "Baltic"),
    ("ugaritic", "Ugaritic"),
    ("hittite", "Hittite"),
    ("vietnamese", "Vietnamese"),
    ("thai", "Thai"),
    ("san", "San (Khoisan)"),
    ("woodland", "Northeast Woodlands (Iroquoian & Algonquian)"),
    ("persian", "Persian (Shahnameh)"),
    ("tibetan", "Tibetan"),
]

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def word_count(text):
    return len(re.findall(r"\S+", text))


def load_motif_ids():
    try:
        data = json.loads(MOTIFS.read_text(encoding="utf-8"))
        return {m["id"] for m in data}
    except Exception as exc:  # motif file optional for QA
        warn(f"could not load motifs.json ({exc}); motif cross-check skipped")
        return None


def check_deep(tx, motif_ids):
    tid = tx.get("id", "?")
    narrative = tx.get("narrative") or {}
    text = narrative.get("en", "")
    if not text.strip():
        err(f"{tid}: deep record has empty narrative.en")
        return
    wc = word_count(text)
    if wc < 50:
        err(f"{tid}: narrative is {wc} words -> STUB (complete narratives require 400-2500)")
    elif wc < 400:
        warn(f"{tid}: narrative is {wc} words -> below the 400-word target")
    elif wc > 2500:
        warn(f"{tid}: narrative is {wc} words -> above the 2500-word target")

    if not tx.get("primary_sources"):
        err(f"{tid}: no primary_sources (>=1 required)")
    if not tx.get("secondary_sources"):
        err(f"{tid}: no secondary_sources (>=1 required)")

    variants = tx.get("variants") or []
    if not variants:
        warn(f"{tid}: no variants recorded (all major named variants should be summarized)")
    for i, v in enumerate(variants, 1):
        if not isinstance(v, dict) or not v.get("name") or not v.get("summary"):
            err(f"{tid}: variants[{i}] missing name or summary")

    for i, u in enumerate(tx.get("source_urls") or [], 1):
        if not isinstance(u, dict) or not u.get("url"):
            err(f"{tid}: source_urls[{i}] missing url")
        elif not DATE_RE.match(str(u.get("accessed", ""))):
            err(f"{tid}: source_urls[{i}] missing/access date (YYYY-MM-DD) for {u.get('url')}")

    flag = tx.get("sensitivity_flag")
    if flag is None:
        warn(f"{tid}: sensitivity_flag missing (mandatory for living/sacred traditions; use 'none' where truly inapplicable)")
    elif flag not in FLAGS:
        err(f"{tid}: unknown sensitivity_flag '{flag}'")
    if flag and flag != "none" and not tx.get("sensitivity_guidance"):
        err(f"{tid}: sensitivity_flag '{flag}' requires sensitivity_guidance")

    prov = tx.get("provenance") or {}
    status = prov.get("record_status")
    if status not in {"complete", "reconstructed", "stub"}:
        err(f"{tid}: provenance.record_status must be complete|reconstructed|stub")
    elif status == "reconstructed":
        segs = prov.get("reconstructed_segments") or []
        if not segs:
            err(f"{tid}: record_status 'reconstructed' requires reconstructed_segments citing the restoration")
        for i, s in enumerate(segs, 1):
            if not isinstance(s, dict) or not s.get("segment") or not s.get("restored_in"):
                err(f"{tid}: reconstructed_segments[{i}] missing segment or restored_in")

    if not tx.get("language"):
        warn(f"{tid}: 'language' of the primary source not recorded")
    if not tx.get("canonical_translation"):
        warn(f"{tid}: 'canonical_translation' not recorded")

    if motif_ids is not None:
        for m in tx.get("motifs") or []:
            if m not in motif_ids:
                warn(f"{tid}: motif id '{m}' not in src/data/motifs.json")

    for i, p in enumerate(tx.get("passages") or [], 1):
        low = p.get("text", "").lower()
        if ("paraphrase" in low or "condensed" in low) and not p.get("note"):
            err(f"{tid}: passages[{i}] looks like a paraphrase but lacks a 'note' label")


def main():
    motif_ids = load_motif_ids()
    batches = sorted(RAW.glob("*.json")) if RAW.exists() else []
    if not batches:
        print("No batches found in data/raw/.")
        return 1

    seen = {}
    deep_by_tradition = {}
    base_total = deep_total = 0

    for bf in batches:
        try:
            batch = json.loads(bf.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError as exc:
            err(f"{bf.name}: invalid JSON -> {exc}")
            continue
        for tx in batch.get("texts", []):
            tid = tx.get("id", "?")
            if tid in seen:
                err(f"{bf.name}: duplicate id '{tid}' (first seen in {seen[tid]})")
            seen[tid] = bf.name
            if "narrative" in tx:
                deep_total += 1
                deep_by_tradition.setdefault(tx.get("tradition", "?"), []).append(tid)
                check_deep(tx, motif_ids)
            else:
                base_total += 1

    print(f"Checked {len(batches)} batch files: {base_total} base + {deep_total} deep records.\n")

    print("=== Coverage vs target tradition list ===")
    for slug, label in TARGET_TRADITIONS:
        ids = deep_by_tradition.get(slug, [])
        if ids:
            print(f"  [deep] {label}: {len(ids)} -> {', '.join(ids)}")
        else:
            print(f"  [pending] {label}: no deep narrative record yet (stub until collected)")

    print("\n=== Warnings ===")
    for w in warnings:
        print(f"  WARN: {w}")
    if not warnings:
        print("  (none)")

    if errors:
        print("\n=== ERRORS ===")
        for e in errors:
            print(f"  ERROR: {e}")
        print(f"\nQA FAILED: {len(errors)} error(s), {len(warnings)} warning(s).")
        return 1

    print(f"\nQA PASSED with {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
