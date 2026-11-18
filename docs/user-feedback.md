# User feedback — external playtest

Live URL tested: https://motif-atlas-jwp.pages.dev

## Tester A — 2026-11-18

**Report (relayed by the project owner):** "Can't open the link."
**Location: Canada** — this rules out mainland-China `*.pages.dev` blocking.

**Status: diagnosing.**

**Diagnosis so far:**
- The production URL returns HTTP 200 and serves the full app when tested
  from the developer's machine — the deployment itself is healthy.
- The main JavaScript bundle is ~23.4 MB (the 5,494-text corpus, motifs and
  characters are all inlined into `assets/index-*.js` by Vite). On a mobile
  connection this can take minutes or never finish, which presents as "the
  link won't open".
- Waiting on tester confirmation of device, network and exact error.

**Candidate fixes (in order of preference):**
1. **Split the corpus out of the JS bundle** — emit `texts.json` as a static
   asset fetched at startup with a visible loading state. First meaningful
   paint drops from ~24 MB to ~1 MB. Fix applies to every visitor, not just
   this tester.
2. Confirm tester-side issue (DNS, old link, app-browser) with triage
   questions above.
