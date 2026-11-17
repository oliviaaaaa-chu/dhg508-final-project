import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOTIF = {
    "id": "patricide",
    "code": "S26",
    "name": {"en": "Patricide / kin-killing of the father", "zh": "弒父"},
    "description": {
        "en": "A child or younger kinsman kills, castrates, or overthrows the father — often unwittingly and often foretold by prophecy.",
        "zh": "子女或年幼親屬殺害、閹割或推翻父親——常出於無意，且常有神諭預言。",
    },
    "keywords": [
        "patricide", "kills his father", "killed his father", "killing his father", "killing father",
        "slew his father", "murdered his father", "murdered his own father", "father-killer",
        "castrated his own father", "would kill his father", "弒父", "殺父",
    ],
}
TAG = [
    "greek-apollodorus-oedipus-cycle",
    "greek-apollodorus-lemnos-women",
    "greek-theogony-aphrodite-foam",
    "greek-apollodorus-perseus-quest",
    "greek-apollodorus-atreus-lamb",
    "kumarbi-succession",
    "sigurd-dragon",
    "tibetan-jivaka-anger-cure",
    "tibetan-bhadra-nirgranthas",
    "tibetan-vaidehi-patricide-omen",
    "buddhist-jataka-530-samkicca",
    "woodland-handsomelake-moving-bullet",
]
TAGSET = set(TAG)


def transform(data):
    changed = 0
    texts = data["texts"] if isinstance(data, dict) and isinstance(data.get("texts"), list) else (data if isinstance(data, list) else None)
    if texts is None:
        return 0
    for tx in texts:
        if isinstance(tx, dict) and tx.get("id") in TAGSET and "patricide" not in tx.get("motifs", []):
            tx["motifs"].append("patricide")
            changed += 1
    return changed


def process(path):
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    n = transform(data)
    if n:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return n


mp = ROOT / "src" / "data" / "motifs.json"
motifs = json.loads(mp.read_text(encoding="utf-8-sig"))
if not any(m["id"] == "patricide" for m in motifs):
    motifs.append(MOTIF)
    mp.write_text(json.dumps(motifs, ensure_ascii=False, indent=2), encoding="utf-8")
    print("added patricide motif to motifs.json")

n = process(ROOT / "src" / "data" / "texts.json")
print(f"texts.json: tagged {n}")
for batch in sorted((ROOT / "data" / "raw").rglob("*.json")):
    n = process(batch)
    if n:
        print(f"  {batch.relative_to(ROOT)}: tagged {n}")

texts = json.loads((ROOT / "src" / "data" / "texts.json").read_text(encoding="utf-8-sig"))
tagged = [tx for tx in texts if "patricide" in tx.get("motifs", [])]
print("tagged total:", len(tagged))
for tx in tagged:
    print("  +", tx["id"], "|", tx["title"]["en"])
