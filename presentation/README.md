# Presentation — Motif Atlas final project (7 min)

Built with **DAIHUM Reslides** (same engine as the Week 10 course deck) — a single
`slides.md` deck with per-slide timed speaker notes.

## Run it

From this folder (`presentation/`), in **Git Bash** or with the full path quoted:

```bash
node "C:\Users\olivie\OneDrive\文件\lingnan\DHGA sem 1\DHG508 Critical Digital History\DHG508 opencode\dhg508-workspace\artifacts\reslides\packages\slidev\bin\reslides.mjs" slides.md --open
```

- Slideshow: <http://localhost:3030/>
- **Presenter mode (notes + countdown timer):** <http://localhost:3030/presenter/>
- Overview grid: <http://localhost:3030/overview/>

The deck is configured for a **7-minute countdown** (`duration: 7min`, `timer: countdown`).

> Note: `slides.md` must be plain UTF-8 (no BOM) — edit it with VS Code or an editor
> that doesn't add one, or the cover frontmatter will render as slide text.

## Pre-open before class (per the Week 10 checklist)

| # | Tab / window | Used for |
|---|---|---|
| 1 | https://motif-atlas-jwp.pages.dev | live URL + views (project overview) |
| 2 | `docs/architecture-explainer.html` opened in a tab (or use the slide's embedded iframe) | Loop 1 schematic |
| 3 | `docs/plan.md` + `docs/user-feedback.md` in the editor | Loop 1 / Loop 4 evidence |
| 4 | Terminal with `npx vitest run` ready | Loop 2 |
| 5 | Terminal with `npx playwright test` ready (and `E2E_BASE_URL=https://motif-atlas-jwp.pages.dev npx playwright test` for the live smoke test) | Loop 2 / Loop 3 |

## Talk plan (5 min demo + 2 min Q&A)

1. **0:00–0:30** Cover
2. **0:30–1:30** Project overview → *switch to live site tab*
3. **1:30–2:30** Loop 1 · plan + /goal + schematic → *show `docs/plan.md`*
4. **2:30–3:30** Loop 2 · test suite → *run vitest + playwright in terminal*
5. **3:30–4:00** Loop 3 · browser loop → *live-URL smoke test / screenshot*
6. **4:00–5:00** Loop 4 · friends' feedback table → *show `docs/user-feedback.md`*
7. **5:00–5:30** Concrete difficulty (Cloudflare 25 MiB wasm limit)
8. **Q&A** Known-limits slide stays up

Full spoken script is in the HTML comments on each slide (visible in presenter mode).
