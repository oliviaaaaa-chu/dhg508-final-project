# Open questions / unresolved issues

- **[RESOLVED 2026-11-25] `public/semantic-embeddings.json` was a 110-byte
  stub with the current fingerprint but zero vectors** — a leftover from the
  5,466→5,468 corpus bump: the file was never regenerated, so
  `hydrateSemantic` silently rejected it and "semantic" search/compare had
  been falling back to keyword matching ever since. Regenerated for real
  with `node scripts/embed_corpus.mjs` (now batched per text — one forward
  pass instead of one per passage). To avoid this silent failure recurring,
  `ensureSemantic()` now reports failure through the visible
  "semanticFallback" notice instead of dying quietly.
- **Search/Compare now understand the request before searching** (this
  cycle): `src/lib/understand.js` strips conversational scaffolding (EN +
  繁中), honours negation ("flood stories without a boat" excludes boat
  texts), detects mentioned traditions, splits pasted stories into beats,
  and recognizes motifs from wording; the semantic engine adds
  meaning-level motif detection (MiniLM vs the 270 embedded motif
  descriptions, K-best rule over a floor — tuned by
  `scripts/tune_meaning_motifs.mjs`). Both engines consume the same
  understanding, and the "How the engine read your input" panel makes it
  visible. Known limitation: negation parsing is a deterministic window
  (≤6 words / idioms handled), so exotic phrasings can still be misread —
  the panel makes misreads inspectable.
- **Passage translations are 90% complete (12,440 of 13,875).** The DeepSeek
  batch job stopped with `402 Insufficient Balance`; ~1,435 passages (about
  US$1–2 of credit) remain. The script is resumable — top up the account,
  re-run `node scripts/translate_passages.mjs`, then
  `node scripts/merge_passages_zh.mjs`, rebuild and redeploy. Until then the
  affected passages display the English original in Chinese mode.
- **The corpus has no Garden of Eden / Adam & Eve text.** A tester expected
  "someone steals apples" to surface it in Compare; the search now works
  (stemmer + alias fixes), but the corpus simply contains no Eden story
  (Hebrew tradition is covered only for the flood, exodus and revelation).
  Candidate for the next corpus expansion round: add an Eden text from a
  public-domain Genesis translation, with the usual source/URL/motif fields.
- **Sensitivity flags are claimed but not present.** The README says every text
  carries a mandatory `sensitivity` field and that restricted traditions are
  blocked "at data-validation time". In reality `src/data/texts.json` has no
  `sensitivity` field at all, and exclusion is enforced only by the
  curatorial `POLICY.excluded` list in `src/data/traditionPolicy.js`
  (aztec, hittite, zoroastrian, vietnamese, ugaritic, thai). Exclusion is
  real but the per-text sensitivity audit the README describes was never
  built. Decide: either add the field to the schema and the builder, or
  correct the README. Tests currently assert the policy behaviour, not the
  README's claim.
- **No license field on most texts.** Only some batches carry `license`; the
  corpus test asserts archive/work/url, not license. A full license audit is
  future work (all sources are public-domain archives, but per-text proof is
  incomplete).
- **Cloudflare Pages 25 MiB limit** forced the ORT wasm (25.6 MiB) out of the
  bundle: it now loads from jsDelivr (`env.backends.onnx.wasm.wasmPaths` in
  `src/lib/search.js`), pinned to the installed onnxruntime-web dev build.
  If the dependency is ever upgraded, the pinned CDN path must be updated too,
  and `scripts/slim_dist.mjs` must stay in the build pipeline.
- **Character Chat quality**: the live DeepSeek replies pass through the same
  system prompt as the mock, but long conversations (11-turn cap in
  `functions/api/chat.js`) and dramatic-mode drift still need human review —
  listed as this week's main difficulty.
- **[DONE 2026-11-25] Search, Compare, Network parallels and the Embedding
  Map now all run on the same per-story embeddings.** `scripts/04_semantic_cache.py`
  builds the similarity matrix and the 2D/3D projection from
  `public/semantic-embeddings.json` (MiniLM, 384-dim) instead of TF-IDF
  keyword vectors; TF-IDF remains as fallback when the embeddings file is
  missing/stale. Pair display values are percentile ranks among kept
  parallels (raw MiniLM cosines are too skewed for a linear scale);
  `CACHE_KEY` bumped to v4 to evict stale localStorage copies.
- **Deploy flow for the semantic layer.** Both semantic JSONs are committed
  to Git (13 MB cache + 10.8 MB vectors), so a plain `npm run build` →
  `npx wrangler pages deploy dist --project-name=motif-atlas` ships the full
  semantic layer. Only when the corpus itself changes must `npm run embed`
  run first (~15 min, checkpointed) and the regenerated
  `semantic-embeddings.json` be committed before rebuilding. Note the cache
  script *falls back* to TF-IDF (with a loud warning) rather than failing on
  stale vectors — always read the build output; a diff of
  `public/semantic-cache.json` is the reliable commit signal.
- **Embedding neighbours skew same-tradition.** MiniLM story vectors cluster
  strongly by tradition/genre (e.g. Deucalion's top parallels are all Greek),
  so "closest parallels" surfaces fewer cross-tradition matches than the
  comparative framing of the atlas suggests. A possible future refinement:
  tradition-centred vectors (subtract each tradition's mean vector) for
  parallel retrieval, keeping raw vectors for the Embedding Map.
