# Motif Atlas — Project Plan (Week 10)

Written after a Plan-mode discussion on 2026-11-18. This file anchors the
`/goal` statement for autonomous agent runs so they cannot drift.

## 1. Scope (restated by the agent, confirmed by the student)

A single-page comparative mythology explorer that lets anyone search, compare,
map, graph and annotate mythological and religious texts across traditions,
with a fictional character chat for interpretive exploration.

- **Views:** Search (keyword + semantic), Compare, Database, Map, Network,
  Embedding, Notebook, Character Chat.
- **Frozen corpus for this cycle:** 5,494 texts · 39 traditions · 270 motifs
  (`src/data/texts.json` / `motifs.json`, built from public-domain sources in
  `data/raw/` via `scripts/01_build_corpus.py`).
- **Stack:** Vite + React, Tailwind, Leaflet, d3-force, Zustand;
  TF-IDF engine in `src/lib/search.js`; semantic vectors pre-computed into
  `data/generated/embeddings.json` (loaded at build/run, not recomputed).

## 2. Historical boundaries

- Only **public-domain** sources; each text records archive, exact work,
  translator, working URL, license.
- Every text carries a mandatory **sensitivity flag**; restricted traditions
  are blocked at data-validation time — exclusion is enforced by the pipeline,
  not by memory.
- Motif tags reuse Thompson's Motif-Index codes where possible; applying them
  to non-Western traditions is treated as an interpretive act, not data.
- Map pins for myth places are interpretive claims, labelled as such.

## 3. Non-goals / red lines

- No user accounts, no server-side writes, no editing other people's data.
- Restricted traditions stay excluded — no exceptions, no "just one text".
- The chatbot is **always labelled fictional**; scholarly mode cites only the
  project corpus and reports confidence.
- Public-domain sources only; no scraping of restricted archives.
- API keys never enter browser JavaScript.

## 4. Decisions made in the planning exchange

| Question | Answer |
|---|---|
| Freeze the corpus for this deploy-and-test cycle? | **Yes — frozen at 5,494 texts.** No new batches this week. |
| Character Chat on the public deployed site? | **Offline mock chat for now** (`src/lib/mockChat.js` fallback). Live DeepSeek via Cloudflare Worker is a later step — the chat feature still has known issues to fix first. |
| Non-goals as listed above? | **Confirmed.** |

## 5. Step plan (Week 10)

1. [x] Git repo initialised and pushed to
       `github.com/oliviaaaaa-chu/dhg508-final-project` (branch `main`).
2. [x] Plan file + architecture schematic committed (this file and
       `docs/architecture-explainer.html`).
3. [ ] Deploy the production build (`npm run build` → `dist/`) to
       Cloudflare Pages; verify the live URL on another device.
4. [ ] Test layers: static build gate recorded in `AGENTS.md`; `vitest` unit
       tests for the search engine and corpus validation (sensitivity flags,
       source URLs, coordinates); Playwright E2E smoke test (0 console
       errors, every view loads) against `localhost` **and** the live URL.
5. [ ] Send live URL to two friends; record findings in
       `docs/user-feedback.md`; fix ≥ 2 issues; convert each fix into a
       permanent regression test.

## 6. Goal statement (for `/goal`)

> Implement the remaining Week 10 steps 3–5 in `docs/plan.md` for Motif Atlas.
> Keep the corpus frozen at `src/data/texts.json` as committed; do not add
> batches, accounts, or live API keys. Respect the non-goals in §3. After
> every change run the test gate recorded in `AGENTS.md` and ensure
> `npx vitest run` and `npx playwright test` pass before committing.

## Open questions carried forward

- Character Chat has known issues to fix before a live LLM can be wired
  through a Cloudflare Worker (tracked as this week's main difficulty).
- Motif coverage is uneven across traditions; a coverage audit could inform
  the final write-up (not this week's deliverable).
