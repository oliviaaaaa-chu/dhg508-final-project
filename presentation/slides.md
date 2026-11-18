---
layout: cover
kicker: DHG508 · Final Project · Live Demo
meta: 7 minutes · 5 live demo + 2 Q&A
minutes: 0.5
---

# Motif Atlas: four feedback loops made myth and religion comparable at scale.

A comparative-mythology explorer over a frozen 5,494-text public-domain corpus — live at `motif-atlas-jwp.pages.dev`.

::by::

Olivia Chu · Lingnan University · github.com/oliviaaaaa-chu/dhg508-final-project

<!--
0:00–0:30

Good morning. My final project is Motif Atlas — a comparative mythology and religion explorer. It lets anyone search, compare, map and graph 5,494 myth and religious texts across 39 traditions, and everything you will see is live at motif-atlas-jwp.pages.dev.

In the next five minutes I will show all four feedback loops live: ideation and schematic, the automated test suite, the automatic browser loop, and friends' feedback locked into regression tests — plus one concrete difficulty I hit.
-->

::read::

Motif Atlas is a comparative mythology explorer (search, compare, map, network, embedding, notebook, character chat) over a frozen 5,494-text public-domain corpus across 39 traditions, demonstrated live with all four course feedback loops.

---
kicker: 0 · The Project in 60 Seconds
minutes: 1
---

# Myth and religion are compared through shared motifs, not through databases that keep them apart.

<div class="body col">
  <div class="route">
    <div class="step"><span class="yr">01</span><p class="what">Collect</p><p class="how">public-domain archives · source + URL + license per text</p></div>
    <div class="arrow">→</div>
    <div class="step"><span class="yr">02</span><p class="what">Structure</p><p class="how">Python builder validates ids, coordinates, motif tags</p></div>
    <div class="arrow">→</div>
    <div class="step red"><span class="yr">03</span><p class="what">Verify</p><p class="how">tests assert every claim before it ships</p></div>
  </div>

  <div class="grid" style="--n:3">
    <div class="frame"><span class="label">Corpus · frozen this cycle</span><div class="text"><strong>5,494 texts</strong> · 39 traditions · 270 motifs — every passage verbatim from a public-domain source</div></div>
    <div class="frame"><span class="label">Comparison engine</span><div class="text">TF-IDF search + pre-computed semantic embeddings; <em>myth / religious / myth-religion</em> is an explicit interpretive label</div></div>
    <div class="frame hot"><span class="label">7 live views</span><div class="text">Search · Compare · Map · Network · Embedding · Notebook · Character Chat (fictional, labelled)</div></div>
  </div>
</div>

::foot::

Corpus: `src/data/texts.json` · plan: `docs/plan.md` · live: https://motif-atlas-jwp.pages.dev

<!--
0:30–1:30 · SWITCH TO: live site tab (https://motif-atlas-jwp.pages.dev) — scroll Search, open Compare once.

The comparison logic: instead of filing myth and religion into separate silos, Motif Atlas compares texts through shared motifs — Thompson motif codes where they exist. Each text carries source archive, exact work, translator, working URL, and license. The myth / religious / myth-religion label is interpretive, and the pipeline validates every text before it can even load.

[Say while scrolling the live site:] Here is the deployed app — 5,494 texts, 39 traditions.
-->

::read::

Motif Atlas compares myth and religion through shared motif tags rather than separate databases. The frozen corpus holds 5,494 texts, 39 traditions and 270 motifs, each with verbatim public-domain passages and recorded provenance; comparison runs on TF-IDF plus pre-computed semantic embeddings across seven views.

---
kicker: Loop 1 · Ideation & Schematic
minutes: 1
---

# Loop 1: every line of code started from a plan the agent restated back to me.

<div class="body col">
  <div class="grid" style="--n:2">
    <div class="frame"><span class="label">Plan-mode Q&A → locked plan</span><div class="text">

- Agent **restated the scope**, I confirmed; open questions answered in a decisions table
- Frozen in `docs/plan.md` → anchors the `/goal` statement, so autonomous runs cannot drift
- Red lines written **before** code: no accounts, restricted traditions excluded, chatbot always labelled fictional

</div></div>
    <div class="frame hot"><span class="label">Agent-generated schematic · docs/architecture-explainer.html</span>
      <iframe
        src="/architecture-explainer.html"
        title="Motif Atlas architecture schematic"
        style="width: 100%; flex: 1; min-height: 330px; border: 0; background: #fff;"
      />
    </div>
  </div>
</div>

::foot::

`docs/plan.md` §1–§4 · schematic drawn by the agent in the HTML-diagram loop (commit `ca6b7a7`)

<!--
1:30–2:30 · SHOW: docs/plan.md in the editor, then the schematic already embedded here (or tab 2).

Loop 1 happened before any code. In Plan mode the agent restated my project back to me, we answered its open questions in a decisions table, and the result is locked in docs/plan.md — that file anchors the /goal statement so the agent cannot drift when it runs autonomously. The agent then drew this architecture schematic in the HTML-diagram loop: corpus builder at the top, TF-IDF and embedding search in the middle, the seven views at the bottom. I did not write this diagram — the agent did, from our conversation.
-->

::read::

Loop 1 (Ideation & Schematic): a Plan-mode Q&A produced `docs/plan.md` with a decisions table, non-goals and the `/goal` anchor, and the agent generated the project's architecture schematic as a self-contained HTML explainer.

---
kicker: Loop 2 · Automated Test Suite
minutes: 1
---

# Loop 2: 30 unit/integration tests and 9 E2E tests guard the history, not just the code.

<div class="term">
<div class="term-bar"><span>OpenCode · motif-atlas · run live</span></div>
<pre>
<span class="blk">$ npx vitest run</span>
<span class="ok">✓ tests/corpus.test.js  (9 tests)</span>  <span class="dim">unique ids · source archive+work+URL · coordinates · motif ids · policy</span>
<span class="ok">✓ tests/engine.test.js  (21 tests)</span>  <span class="dim">stemmer · name equivalents Zeus=Jupiter · policy excludes traditions</span>
<span class="blk">$ npx playwright test</span>
<span class="ok">✓ tests/e2e/app.spec.js  (9 tests) — 0 console errors, 0 page errors</span>
</pre>
<div class="term-foot">Test gate from AGENTS.md · every change, before commit · E2E also runs against the live URL</div>
</div>

<div class="frame" style="margin-top: 14px;"><span class="label">What the tests assert about history — 据 / 推断 / 设</span><div class="text">

- **据 (evidence)** — every passage is verbatim from a named public-domain archive; source, work and URL required or the build fails · **推断 (inference)** — map pins are interpretive claims, labelled in the UI · **设 (convention)** — restricted traditions are excluded by the curatorial policy, and *tests enforce the exclusion, not my memory*

</div></div>

::foot::

`tests/corpus.test.js` · `tests/engine.test.js` · `tests/e2e/app.spec.js`

<!--
2:30–3:30 · SWITCH TO: terminal — run `npx vitest run` then `npx playwright test` live; show the green lines.

[Run the terminal live here — this slide stays up as the map of what they are looking at.]

This is not just code testing. The corpus tests are historical guardrails: unique ids, every text must have archive, work and URL, coordinates in range, every motif tag must exist. The engine tests lock the interpretive decisions: the stemmer, and Greek and Roman names resolving to the same stories. And the boundary rules — 据, verbatim passages from named archives; 推断, map pins labelled as interpretive; 设, restricted traditions excluded by policy — are all asserted in code, so the agent cannot quietly violate them.
-->

::read::

Loop 2 (Tests): 9 corpus guardrail tests, 21 engine tests and 9 Playwright E2E tests run as a commit gate. They assert historical boundaries — verbatim public-domain passages (据), labelled interpretive map pins (推断), and policy-enforced exclusion of restricted traditions (设) — alongside program logic like the stemmer and name-equivalent resolution.

---
kicker: Loop 3 · Automatic Browser Loop
minutes: 0.5
---

# Loop 3: a browser loop checks the page, the console and the screenshots — with no eyeballs.

<div class="grid" style="--n:2">
<div class="frame"><span class="label">@playwright/mcp · exploration</span><div class="text">

- agent opens the real page through the browser MCP, reads the accessibility tree, **clicks and observes** like a user

</div></div>
<div class="frame hot"><span class="label">Headless Playwright · repeatable</span><div class="text">

- E2E visits **every view** on `localhost:4173` **and** the live URL, asserts **0 console errors / 0 page errors**, captures screenshots on failure

</div></div>
</div>

::foot::

One-time exploration via MCP → converted into repeatable E2E assertions, so nothing depends on manual checking

<!--
3:30–4:00 · SWITCH TO: terminal — `E2E_BASE_URL=https://motif-atlas-jwp.pages.dev npx playwright test` (or show a Playwright trace/screenshot from the last run).

First I explored with the @playwright/mcp browser — the agent sees the page like a user. Then anything I saw more than once became a headless Playwright test: every view must open, with zero console errors and zero page errors, against both the preview server and the deployed Cloudflare URL. Screenshots are captured automatically on failure — I never eyeball a broken page.
-->

::read::

Loop 3 (Browser): @playwright/mcp is used for exploratory observation of the real page; repeated findings are converted into headless Playwright E2E checks that open every view on both the preview server and the live URL, asserting zero console and page errors with automatic screenshots.

---
kicker: Loop 4 · Friends' Feedback → Regression Tests
minutes: 1
---

# Loop 4: two friends' raw feedback on the live URL, five fixes, seven permanent tests.

| Raw feedback (verbatim) | Fix shipped | Regression test |
|---|---|---|
| A: *"Can't open the link."* (phone, Canada) | corpus out of the JS bundle: **23.4 MB → 1.19 MB**, lazy fetch + loading screen | E2E `first load transfers a small JS payload` — fails above 3 MB |
| A: *"pressing network … makes the entire thing freeze"* | simulate only edge-connected nodes, cap 500 edges, deferred threshold | E2E `network view stays responsive while re-thresholding` |
| A: *"No expand function in the Database"* | explicit **Open details** button on every card | E2E `database cards offer an explicit full-text open` |
| A: *"someone steals apples"* found Hercules but not Eden; *"apple/appl"* both shown | stemmer fixed; stems mapped back to real words; **Zeus/Jupiter name table** | 4 unit tests incl. `Greek and Roman names resolve to the same stories` |
| B: *"better to have a Traditional Chinese version"* | EN / 繁體中文 toggle re-enabled, 24 strings translated | E2E `language switch renders Traditional Chinese and persists` |

::foot::

Full log with diagnoses: `docs/user-feedback.md` · Eden gap (corpus, not a bug) tracked in `questions.md`

<!--
4:00–5:00 · SHOW: docs/user-feedback.md in the editor (raw reports on top) — this slide is the summary.

Loop 4 closed the loop with real users. Tester A, in Canada on a phone, could not even open the site — the diagnosis was a 23-megabyte bundle, now 1.19 megabytes, with a permanent E2E budget test. Tester B froze the network view, could not expand database cards, and typed "someone steals apples" — which exposed three real search bugs and, importantly, one corpus gap: there is no Garden of Eden text at all. That is honest: a data gap, logged in questions.md for the next expansion round, not papered over. Every single fix above is locked in by a test that will fail if it regresses.

That is all four loops. One concrete difficulty —
-->

::read::

Loop 4 (Feedback): raw reports from two friends on the deployed URL produced five fixes — a 23.4 MB→1.19 MB lazy-load bundle, a network-freeze fix, a database expand button, stemmer and name-equivalent search fixes, and a re-enabled Traditional Chinese toggle — each locked in by a permanent unit or E2E regression test; one finding was correctly identified as a corpus gap, not a bug.

---
kicker: The Concrete Difficulty
minutes: 0.5
---

# Difficulty: Cloudflare Pages refused my 25.6 MB file — the fix is pinned, not pretty.

<div class="grid" style="--n:2">
<div class="frame hot"><span class="label">The wall</span><div class="text">

Cloudflare Pages enforces a **25 MiB per-file limit**. The ONNX runtime wasm for semantic search is **25.6 MiB** — deploy silently impossible; `wrangler pages deploy` rejects the bundle.

</div></div>
<div class="frame"><span class="label">The fix + what it costs</span><div class="text">

- `scripts/slim_dist.mjs` strips the wasm from `dist/`; it loads at runtime from **jsDelivr**, pinned to the exact installed `onnxruntime-web` build
- Consequence written down: **upgrade the dependency → must update the CDN pin**, or semantic search breaks

</div></div>
</div>

::foot::

`questions.md` · commit `56f2b81 fix(deploy): load ORT wasm from jsDelivr to fit Cloudflare Pages 25MiB limit`

<!--
5:00–5:30 (end of live demo · open the floor)

The concrete difficulty I want to name: Cloudflare Pages refuses any file over 25 mebibytes, and the ONNX wasm that powers semantic search is 25.6. The fix — strip it from the build and load it from jsDelivr, pinned to the exact installed version — works, but it introduces a hidden coupling: if I ever upgrade onnxruntime-web and forget the pin, semantic search breaks. I recorded that consequence in questions.md rather than trusting future me to remember it.
-->

::read::

Concrete difficulty: Cloudflare Pages' 25 MiB per-file limit blocks the 25.6 MB ONNX wasm; it is stripped by `scripts/slim_dist.mjs` and loaded at runtime from a version-pinned jsDelivr path — a working fix whose maintenance cost (updating the pin on dependency upgrades) is documented in `questions.md`.

---
kicker: Q&A · Known Limits (on the record)
minutes: 0
---

# Known limits I am not hiding: a data gap, an un-audited field, and a rendering choice.

<div class="grid" style="--n:2">
<div class="frame"><span class="label">Corpus gap · Eden</span><div class="text">

The corpus has **no Adam & Eve text** — "someone steals apples" now *searches* correctly but cannot find a text we do not have. Next expansion: public-domain Genesis translation.

</div></div>
<div class="frame"><span class="label">Honest gap · sensitivity field</span><div class="text">

The README claims a per-text `sensitivity` field; exclusion is actually enforced by the curatorial policy list, and **tests assert the policy behaviour**. Decide: build the field or fix the README.

</div></div>
<div class="frame"><span class="label">In progress · license audit</span><div class="text">

All sources are public-domain archives, but per-text `license` proof is incomplete — tracked, not claimed as done.

</div></div>
<div class="frame"><span class="label">Interpretation · Maya vs Mayan</span><div class="text">

Academic convention: **Maya** for the people/civilization, **Mayan** for the language family — label changed on a tester's request; a good example of feedback touching historiography, not just UX.

</div></div>
</div>

::foot::

Everything above is tracked in `questions.md` — unresolved on purpose, on the record

<!--
Q&A (2 minutes) — keep this slide up.

If asked "what would you fix next": the Eden corpus gap first, then the per-text sensitivity audit and the license audit. If asked why TF-IDF and not a live model: the vectors are pre-computed at build time into static float16 files, so runtime cost is zero and search is instant — same principle the Week 10 slides call pre-computing. If asked about the chatbot: always labelled fictional; scholarly mode cites only the project corpus and reports confidence.
-->

::read::

Open, tracked limits: the corpus lacks any Garden of Eden text (a data gap, queued for expansion); the per-text sensitivity field described in the README is not yet built (exclusion is enforced and tested via the curatorial policy list); the per-text license audit is incomplete; and the Maya/Mayan label follows the tester's request, illustrating how user feedback can touch historiographical convention.
