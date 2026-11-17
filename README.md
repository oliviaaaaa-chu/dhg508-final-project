# Motif Atlas — Comparative Mythology Explorer

DHG508 Critical Digital History final project. A single-page app for searching, comparing, mapping and visualizing comparative mythology texts, with a personal notebook and interpretive character chat.

**Currently running on a 40-text public-domain sample corpus across 19 traditions** (`data/raw/batch-01-expansion.json` shows the exact format). All functions work out of the box; grow or replace the corpus with your own research data as you collect it.

## Quick start

```bash
npm install     # already done
npm run dev     # start the dev server (usually http://localhost:5173)
npm run build   # production build to dist/
```

Interface: English only. (Bilingual EN/Traditional-Chinese dictionaries remain in `src/i18n/` and can be re-enabled if needed.)

## What each view does

| View | Function | Data used |
|---|---|---|
| Search | Keyword + semantic query, "why matched" explanations | `src/data/texts.json`, `src/data/motifs.json` |
| Compare | Paste a passage → ranked similar texts + shared motifs + quotes | same |
| Map | Leaflet map, motif/keyword filters, region clustering | lat/lon in texts.json |
| Network | Force-directed similarity graph, threshold slider | computed client-side (TF-IDF) |
| Notebook | Saved texts/excerpts/map clips/network picks/chat citations, notes, JSON + Markdown export | browser localStorage |
| Character Chat | 153 fictional figures across 41 traditions — 3–5 voices each (tiered roster in `src/data/characters.json`), scholarly (cites + confidence) vs dramatic modes | `src/lib/mockChat.js` |

## Your job: replace the sample corpus

1. Copy `data/template/corpus.template.json`, fill it with your researched texts, save batches to `data/raw/` (e.g. `data/raw/batch-01.json`). Remove `_comment` fields.
2. Run:

   ```bash
   python scripts/01_build_corpus.py
   ```

   It validates required fields, ids, coordinates and sensitivity flags, then merges into `src/data/texts.json` (existing texts are kept; re-running a batch updates its texts in place). Refresh the browser — search, map and network pick up new texts automatically, including new motifs if you add them to `src/data/motifs.json` and new traditions in `src/lib/colors.js`.

What to research per text (the fields in the template):

- **id / title / tradition** — pick a slug; register new traditions in `src/lib/colors.js`.
- **category** — `myth`, `religious`, or `myth-religion` (for traditions — e.g. Hindu, Norse, Yoruba, Afro-Atlantic, Celtic — where myth and religion share one origin and are not separable). Shown in the Database view; the division is interpretive, so note your reasoning if ambiguous.
- **region + lat/lon** — approximate or symbolic location; note how you chose it. Symbolic/otherworldly places: pick a neutral inland spot and say so.
- **period** — date of composition/recording, not just "ancient".
- **source** — archive, exact work, translator, **working URL**, license. Record these at collection time.
- **summary (en/zh)** — 1–3 sentences each language.
- **motifs** — tag with ids from `src/data/motifs.json`; add new motifs there (include a Thompson/ATU code where one exists).
- **sensitivity** — mandatory field. Traditions with restricted content are excluded by design (`restricted: true` fails validation).
- **passages** — 1–4 verbatim public-domain excerpts (preferred) or clearly-labeled condensations, 40–200 words.

Good public-domain sources: Project Gutenberg (Bulfinch, Frazer, Popol Vuh translations), Internet Sacred Texts Archive, Perseus Digital Library, Wikisource, HathiTrust. Verify URLs as you collect — retrofitting them later is painful.

## Optional upgrades (when sample works)

### Real embeddings for semantic search

The site ships with a TF-IDF engine (`src/lib/search.js`) — works fine for small corpora, no setup. For true semantic matching:

```bash
pip install sentence-transformers
python scripts/03_embed.py            # writes data/generated/embeddings.json
python scripts/02_build_similarities.py   # TF-IDF pair graph for reference
```

Then swap `search()`/`buildQueryVector()` in `src/lib/search.js` to load precomputed vectors (keep the same JSON interface).

### Real chatbot

`src/lib/mockChat.js` is a rule-based demo with the full scholarly/dramatic/citation/confidence structure. To go live (DeepSeek is pre-wired):

1. Paste your key into `.env.local` (git-ignored) as `DEEPSEEK_API_KEY=sk-...` from platform.deepseek.com. **Never commit the key** and never prefix it with `VITE_` — the dev proxy in `vite.config.js` (`/api/chat`) keeps it server-side. If the key is missing, the chat falls back to the offline demo replies.
2. The system prompt already includes: character framing (from `src/data/characters.json`), the fictionality banner, and — for scholarly mode — the retrieved corpus passages to cite.
3. Same return shape as before: `{ text, confidence, citations[] }`.

## Critical Digital History notes (for your write-up)

- **Bias of motif indexes**: Thompson's Motif-Index is Euro-American in origin; applying its codes to non-Western traditions is itself an interpretive act. Discuss what the tags hide.
- **Symbolic geography**: map pins for myth places are interpretive claims, not data points — the map subtitle says so.
- **Fictionality**: the chatbot is labeled fictional in the header of every conversation; scholarly mode cites only the project corpus and reports confidence.
- **Excluded material**: restricted traditions are blocked at data-validation time (`restricted: true`), so silence is enforced by the pipeline, not by memory.

## Project layout

```
src/
  data/          texts.json, motifs.json      ← your corpus lands here
  lib/           search.js (TF-IDF engine), mockChat.js, colors.js
  store/         notebook.js (Zustand + localStorage)
  components/    Sidebar, TextDetail, SaveButton, MotifChip, Highlight, Icons
  views/         Search, Compare, Map, Network, Notebook, Chat
  i18n/          en.js, zh-TW.js, provider
scripts/         01_build_corpus.py, 02_build_similarities.py, 03_embed.py
data/            template/corpus.template.json, raw/ (your batches), generated/
```
