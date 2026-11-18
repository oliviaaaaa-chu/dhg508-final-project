# User feedback — external playtest

Live URL tested: https://motif-atlas-jwp.pages.dev

## Tester A — 2026-11-18

**Report (relayed by the project owner):** "Can't open the link."

**Status: diagnosing.**

**Diagnosis so far:**
- The production URL returns HTTP 200 and serves the full app when tested
  from the developer's machine — the deployment itself is healthy.
- `*.pages.dev` subdomains are widely unreachable from mainland-China
  networks (DNS blocking). The tester's location/network is being confirmed.

**Triage questions sent to the tester:**
1. Which device and browser?
2. Does it fail on both Wi-Fi and mobile data?
3. Does another `*.pages.dev` site open (to distinguish "the domain is
   blocked" from "something is wrong with this project")?
4. Exact error: spinning forever, "site can't be reached", or an error page?

**Candidate fixes (in order of preference):**
1. **GitHub Pages mirror** of the same `dist/` build — usually reachable from
   mainland networks. The `/api/chat` Pages Function will not exist there, so
   Character Chat will fall back to the offline mock replies (already
   implemented and covered by an E2E test).
2. **Custom domain** attached to the Cloudflare Pages project (~US$10/yr) —
   bypasses the `pages.dev` domain block, keeps chat live.
3. Tester-side: retry on a different network (mobile data), or confirm whether
   the failure also happens outside mainland China.

**Fix to apply:** pending triage answers.
