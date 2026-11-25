# Agent Instructions — Motif Atlas (DHG508 final project)

Comparative mythology explorer. Read `docs/plan.md` first: the corpus is
**frozen at 5,494 texts** (5,468 served after the curatorial policy filter) for
this deploy-and-test cycle. Non-goals and historical boundaries are listed
there — do not violate them (no accounts, restricted traditions stay excluded,
chatbot always labelled fictional, public-domain sources only, API keys never
in browser JavaScript).

## Test gate (run after every change, before committing)

```bash
npx vitest run                 # unit + integration (corpus guardrails, search engine, chat fallback)
npx playwright test            # E2E against the production build (spins up vite preview on :4173)
E2E_BASE_URL=https://motif-atlas-jwp.pages.dev npx playwright test   # smoke test against the live site
```

Both must pass with zero failures **and** the E2E suite asserts zero console
errors / page errors. Static gate: `npm run build` (also runs
`scripts/slim_dist.mjs`, which strips files over Cloudflare Pages' 25 MiB
limit — currently the ORT wasm, loaded from jsDelivr at runtime instead).

## Common commands

```bash
npm run dev      # dev server (http://localhost:5173, DeepSeek proxy on /api/chat)
npm run build    # semantic cache + vite build + slim dist
npm run preview  # serve dist/ (what Playwright E2E uses)
npx wrangler pages deploy dist --project-name=motif-atlas   # publish to the live URL
```

## Layout

- `public/corpus.json` — served copy of the corpus, fetched lazily by the app
  (regenerate with `node scripts/emit_corpus.mjs`, which runs inside
  `npm run build` and `npm run dev`; never hand-edit the public copy)
- `src/data/texts.json` — frozen corpus (built by `scripts/01_build_corpus.py`
  from curated batches in `data/raw/batch-*.json`; edit batches, not this file,
  unless fixing a data bug in place — then fix the batch too)
- `src/lib/search.js` — TF-IDF engine + semantic query path
  (`semantic-embeddings.json` in `public/`, model from Hugging Face, ORT wasm
  from jsDelivr). The corpus and the similarity matrix hydrate lazily —
  `ensureCorpus()` before anything renders, `ensureMatrix()` before
  Network/Embedding/related-parallels. Do not reintroduce module-level
  blocking work: the app must paint before the corpus arrives.
- `public/semantic-embeddings.json` — one 384-dim MiniLM vector per served
  story (committed to Git; regenerate with `npm run embed` — only needed when
  the corpus changes, ~15 min, checkpointed). Powers semantic search AND —
  via the cache below — Compare/Network parallels and the Embedding Map.
- `public/semantic-cache.json` — similarity matrix + 2D/3D projection, built
  from those story vectors by `scripts/04_semantic_cache.py` (runs inside
  `npm run build`; falls back to TF-IDF if the embeddings are missing/stale).
  Pair display values are percentile ranks among kept parallels, so the
  Network threshold slider spans its full range. Bump `CACHE_KEY` in
  `search.js` when the cache format changes — the corpus fingerprint alone
  will not evict visitors' stale localStorage copies.
- `src/lib/mockChat.js` — character chat; live API via `/api/chat`
  (`functions/api/chat.js` in production, dev proxy in `vite.config.js`)
- `tests/corpus.test.js`, `tests/engine.test.js` — the historical guardrails
- `tests/e2e/app.spec.js` — browser checks (also run against the deployed URL)
- `docs/plan.md`, `docs/architecture-explainer.html` — Week 10 ideation loop

## Rules

- Keep API keys and large binaries (`artifacts/`, `.model-cache/`) out of Git.
- `data/generated/` is regenerable; the raw source texts in `data/raw/` are
  not — treat them as read-only research material.
- Record unresolved issues in `questions.md`.
