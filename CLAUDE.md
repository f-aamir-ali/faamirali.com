# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The personal site & long-term hub of **F. Aamir Ali** — builder & founder. A fast, static, multi-page Astro site. Built from a canonical spec: `C:\Users\fateh\Downloads\faamirali-master-blueprint-v2.md` (the "Master Blueprint v2"). Every fact on the site must trace back to the four source case studies and the principal's recommendation letter at `C:\Users\fateh\Downloads\College Applications\Main Projects\` — nothing goes on the site that isn't in those documents.

The non-negotiable technical constraint driving every decision: **all page text must be static server-rendered HTML, never injected client-side.** This serves the two hardest requirements simultaneously — page-load speed and readability by AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc. often don't execute JS).

## Commands

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/ (static output, deploy this)
npm run preview      # preview the built dist/

npm run make:og      # regenerate branded 1200x630 OG images → public/og/ (uses sharp)
npm run make:pdfs    # regenerate filtered case-study PDFs → public/pdf/ (uses Playwright/Chromium)
```

There is no test suite or linter configured. Verify changes with `npm run build` (must complete with 5 static routes) and by checking the dev server in a browser.

The dev-server launch config lives at `.claude/launch.json` (name: `faamirali`, port 4321) — use the Preview tool's `preview_start` with that name rather than invoking `npm run dev` directly via Bash.

## Architecture

**Stack:** Astro, static output only (`astro.config.mjs` — no SSR adapter). `astro.config.mjs` also whitelists the project's absolute path for Vite's fs-serving check, because the folder name contains a space (`faamirali website`) — don't remove that `fs.allow` entry.

**Content is data-driven, not hardcoded into pages.** The two files under `src/data/` are the actual editorial surface:
- `src/data/site.js` — sitewide identity/contact (`SITE_URL`, `EMAIL`, `LINKEDIN`, `INSTAGRAM`), the `CANONICAL_DESCRIPTION` string (must stay byte-identical across schema, `llms.txt`, and `/about` — this sameness is deliberate, it's what makes AI engines converge on one accurate description), and the `Person`/`ProfilePage` JSON-LD builders.
- `src/data/projects.js` — single source of truth for the three project pages (FleetBot, Surrey Youth AI Summit, AI & Innovation Club) as an array of objects (summary paragraphs, stats, media placeholders, live-link, PDF path, quote/note tile). `src/pages/work/[slug].astro` uses `getStaticPaths()` over this array to generate all three project pages — **to edit project copy or add proof tiles, edit `projects.js`, not the page template.**

**Page → component flow:** every page wraps `src/layouts/Base.astro`, which renders the `<head>` via `src/components/Seo.astro` (title/description/canonical/OG/Twitter/JSON-LD — all static, no client JS) plus the sticky `Header.astro` and dark "terminal" `Footer.astro`. Route files: `src/pages/index.astro` (home/hub), `src/pages/about.astro` (full bio — the legitimate home for the long-form canonical text), `src/pages/work/[slug].astro` (project template, reads from `projects.js`).

**Bento proof grid:** `src/components/ProofGrid.astro` renders each project's stats/media/quote/note tiles from the `projects.js` object shape — it's a 12-column CSS grid, not a bespoke layout per project. New tile types need a new conditional block matching the existing pattern (`proj.quote`, `proj.note`, `proj.media2`, etc.), not a new component.

**Placeholders, not broken links:** `src/components/Placeholder.astro` is a pure-CSS labeled tile standing in for any not-yet-dropped-in photo/video. `public/img/` and `public/video/` don't exist yet — nothing references a missing file. When real assets land, swap the `<Placeholder>` usage for a real `<img>`/`<video>` per the mapping in `ASSETS.md`, not before.

**Discovery/AI-visibility layer** (see blueprint §5) lives partly as static files in `public/` (`robots.txt` explicitly allow-lists AI crawlers; `llms.txt`; `sitemap.xml`) and partly as JSON-LD emitted per-page by `Seo.astro` using the builders in `site.js`. `sameAs` in the Person schema is intentionally left empty until a real LinkedIn exists — don't populate it with placeholders; inflated/mismatched schema reduces trust more than an empty field.

**Generated assets, not checked-in source:** `scripts/make-pdfs.mjs` reads the four case-study Markdown files from `C:\Users\fateh\Downloads\College Applications\Main Projects\...` (an absolute path outside the repo — that's expected, it's Aamir's local source-of-truth folder), lightly filters out future/planning sections (the site only shows completed work) and normalizes the club member count to 20, then prints each to `public/pdf/*.pdf` via headless Chromium. `scripts/make-og.mjs` renders one branded SVG→PNG per page into `public/og/`. Re-run these after editing the source Markdown or the `pages` array inside `make-og.mjs`; their output is committed to `public/` since it's served directly.

## Content rules (baked into the data files — preserve these when editing)

- **Only already-completed work.** No `/now` page, no "what's next"/succession/"do it again" copy — this is a deliberate deviation from the blueprint (which specced a `/now` page); the working decision was to ship only finished work.
- Club member count is **20** everywhere (site, PDFs, quotes) — the letter and case study once disagreed (16 vs 20); 20 was chosen and normalized in `make-pdfs.mjs`'s replacements.
- "First" claims are attributed to the principal's letter or caveated ("as far as I could find") — never asserted in Aamir's own voice as an unqualified "first ever."
- FleetBot credit stays honest in first-person copy: a friend hand-coded the staff front-end + API connection; only quote the letter's stronger "independently developed" as *her* words, not his.
- The Best Buy Teen Tech Challenge entry explicitly states it **didn't win**.
- Banned words: aspiring, passionate, enthusiast, leverage, synergy, revolutionary, game-changing, cutting-edge. Voice is confident, specific, plain-spoken, actual-17 — numbers and named tools do the bragging, not adjectives.

## Design tokens

`src/styles/global.css` defines the full palette/type system as CSS custom properties (`--canvas`, `--ink`, `--accent` `#d9402a`, `--card`, `--dark`, etc.) plus shared primitives (`.wrap`, `.section`, `.btn`, `.eyebrow`, `.tag`, `.status`). Component-scoped `<style>` blocks in each `.astro` file build on these tokens rather than redefining colors — match that pattern for new UI. Fonts (`Instrument Serif` italic accents, `Schibsted Grotesk` body, `IBM Plex Mono` labels) load via Google Fonts CDN in `Base.astro`; self-hosting subset `woff2` is a known later perf tweak, not yet done. `prefers-reduced-motion` is globally honored in `global.css` — don't add motion that bypasses it.

## Where things stand (see ASSETS.md for the live checklist)

Structure, copy, discovery layer (robots.txt/llms.txt/sitemap.xml/JSON-LD/OG), and generated PDFs are done. Still pending before launch: real headshot, FleetBot terminal photo, summit/club photos (consent flags on group photos — see blueprint §11), the FleetBot demo video (MOV→MP4 conversion), the live student-demo link, and the LinkedIn URL. `ASSETS.md` has the exact filename → location mapping for each.
