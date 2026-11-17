# Open questions / unresolved issues

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
