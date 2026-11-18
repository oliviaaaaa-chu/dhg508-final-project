# User feedback — external playtest

Live URL tested: https://motif-atlas-jwp.pages.dev

## Tester A — 2026-11-18

**Report:** "Can't open the link." (on a phone; tester is in Canada)

**Diagnosis:** the site itself was healthy, but the first visit tried to
download and run a ~24 MB JavaScript bundle (the whole 5,494-text corpus was
compiled into it), plus a blocking top-level `await` that delayed the first
pixel until an 8.8 MB cache had loaded — on a phone this presents as "the
page never opens".

**Fix:** the corpus now lives outside the JavaScript (`public/corpus.json`,
fetched lazily with a visible loading screen); the similarity cache hydrates
in the background instead of blocking startup. Main bundle: 23.4 MB →
**1.19 MB**; first paint no longer waits for anything.

**Regression test:** E2E `first load transfers a small JS payload` — sums
every script response on a fresh load and fails above 3 MB.

## Tester B — 2026-11-18

**Reports and what was done about each:**

1. **No expand function in the Database to read the full text.** → Added an
   explicit "Open details" button on every database card (the cards were
   also hidden inside collapsed tradition groups, which made them easy to
   miss). *Regression test:* E2E `database cards offer an explicit
   full-text open` — expands a group, clicks the button, expects the
   passages panel.

2. **Character-chat picker: inconsistent upper/lower case in the category
   list.** → Root cause: six figures from traditions the curatorial policy
   excludes (aztec, hittite, zoroastrian, vietnamese, ugaritic, thai) were
   still in the roster, and their slugs have no display label, so the raw
   lowercase slug was rendered. The roster is now filtered through the same
   policy as the corpus — which also restores the "restricted traditions
   stay excluded" rule for chat. *Regression test:* unit
   `excludes the traditions the curatorial policy excludes`.

3. **"It's the Philippines, S is not plural here; also Mayan not Maya."** →
   Labels fixed (`Philippines`, `Mayan`). Note for the write-up: academically
   "Maya" is standard for the people/civilization and "Mayan" for the
   language family — changed on the tester's request, worth one sentence in
   the critical discussion.

4. **Compare accuracy — "someone steals apples" surfaced Hercules but not
   the Garden of Eden; "apple/appl" both appeared; "fighting a lion" didn't
   find Hercules vs the Nemean lion.** → Three real bugs fixed:
   - The stemmer split "apples" and "apple" into two different index terms,
     so singular and plural queries ranked different texts. Stemmer fixed;
     singular/plural queries now return the same set.
   - Matched-terms display showed internal stems ("appl"); it now maps back
     to the actual words in the passage ("apples").
   - "Hercules" and "Heracles" now resolve to the same stories in every
     search mode (theological name-equivalent table: Zeus/Jupiter,
     Athena/Minerva, etc.).
   - **Garden of Eden: the corpus contains no Adam & Eve text at all** — that
     is a corpus gap, not a search bug. Logged in `questions.md`; candidate
     for the next corpus expansion round.
   *Regression tests:* unit `stems plurals so "apples" and "apple" find the
   same texts`, `matched terms display real words, not stems`, `Greek and
   Roman names resolve to the same stories`, `fighting a lion surfaces the
   Nemean lion story`.

5. **Both Greek and Roman names of the same figure would be better.** →
   Covered by the name-equivalent table above (same fix).

6. **"When pressing network it makes the entire thing freeze."** → The
   Network view was simulating all ~5,400 texts (including thousands of
   invisible degree-0 dots) for 420 force-layout ticks, synchronously, on
   every threshold change. Now only edge-connected nodes are simulated,
   edges are capped at the 500 strongest, the layout settles after 120
   ticks, and threshold dragging is deferred so the slider never blocks.
   *Regression test:* E2E `network view stays responsive while
   re-thresholding` — sweeps the threshold slider five times and then
   requires the app to react immediately.

## Tester A (second report) — 2026-11-18

**Report:** "Would be better to have a Traditional Chinese version."

**Fix:** the bilingual dictionaries were already complete in `src/i18n/`
(they had been switched off with a stub `setLang`); the EN / 繁體中文 toggle
is re-enabled in the sidebar and the mobile header, persists in localStorage,
and the 24 interface strings that had no Traditional Chinese yet were
translated. *Regression test:* E2E `language switch renders Traditional
Chinese and persists` — switches, asserts nav labels in Chinese, reloads and
expects the choice to stick.
