import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOTIF = {
    "id": "betrayal",
    "code": "K231",
    "name": { "en": "Betrayal / treachery", "zh": "背叛" },
    "description": {
        "en": "A trusted companion, kinsman, or follower betrays another — a lord, host, husband, or master — often for gain, fear, or another's command.",
        "zh": "受信任的同伴、親屬或追隨者背叛他人——主君、主人、丈夫或恩主——常為利益、恐懼或他人之命。",
    },
    "keywords": ["betrayal", "betray", "betrays", "betrayed", "betraying", "judas", "thirty pieces of silver", "treachery", "treacherous", "traitor", "背叛", "出賣"],
}
TAG = [
    "christian-judas-field-blood",
    "christian-gethsemane",
    "christian-dante-lucifer-cocytus",
    "norse-volsunga-saga-full",
    "norse-gripir-prophecy",
    "greek-apollodorus-comaetho",
    "greek-apollodorus-seven-against-thebes",
    "greek-apollodorus-sisyphus-corinth",
    "celtic-lomna-head-ogham",
    "celtic-quicken-trees-miodac-riddles",
    "greek-odyssey-suitors-slain",
    "greek-odyssey-bow-contest",
]
TAGSET = set(TAG)


def transform(data):
    changed = 0
    texts = data["texts"] if isinstance(data, dict) and isinstance(data.get("texts"), list) else (data if isinstance(data, list) else None)
    if texts is None:
        return 0
    for tx in texts:
        if isinstance(tx, dict) and tx.get("id") in TAGSET and "betrayal" not in tx.get("motifs", []):
            tx["motifs"].append("betrayal")
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
if not any(m["id"] == "betrayal" for m in motifs):
    motifs.append(MOTIF)
    mp.write_text(json.dumps(motifs, ensure_ascii=False, indent=2), encoding="utf-8")
    print("added betrayal motif to motifs.json")

n = process(ROOT / "src" / "data" / "texts.json")
print(f"texts.json: tagged {n}")
for batch in sorted((ROOT / "data" / "raw").rglob("*.json")):
    n = process(batch)
    if n:
        print(f"  {batch.relative_to(ROOT)}: tagged {n}")

texts = json.loads((ROOT / "src" / "data" / "texts.json").read_text(encoding="utf-8-sig"))
out = []
sys_enc = []
for tx in texts:
    if "betrayal" in tx.get("motifs", []):
        out.append(tx["id"])
print("tagged total:", len(out))
for i in out:
    print("  +", i)
