# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is written so that an AI with **zero prior context on this project** can add a new project, a new section, or a new page and get the layout, data shape, and voice exactly right on the first try — no misaligned dividers, no gappy bento grids, no copy that violates the owner's locked decisions.

**Read this whole file before touching anything.** Most bugs in this project's history came from skipping a convention documented here (see "Gotchas learned the hard way" — every one of those was a real bug that shipped and had to be fixed).

## What this is

The personal site & long-term hub of **F. Aamir Ali** — builder & founder, Grade 11, Surrey BC. A fast, static, multi-page Astro site. Every fact on the site must trace back to the four case-study files (the `*_f.md` files under `C:\Users\fateh\Downloads\College Applications\Main Projects\`) or the principal's recommendation letter — nothing goes on the site that isn't sourced from those documents or explicitly given by the owner in conversation.

**⛔ Old-case-study guard:** if a case-study file contains "70% of the whole thing myself", "smallest of my projects", or "least flashy thing", it is a RETIRED old version — stop and tell the owner. Only the `*_f.md` files are valid sources.

The non-negotiable technical constraint driving every decision: **all page text must be static server-rendered HTML, never injected client-side.** This serves two goals simultaneously — page-load speed, and readability by AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc. often don't execute JS). Never add a framework, a client-side data-fetch, or a JS-rendered content block. The only client JS on the entire site is `ClientRouter` (page transitions) and two tiny inline scripts in `Header.astro` (scroll-detach + smooth-scroll-to-contact).

## Commands

```bash
npm install
npm run dev          # http://localhost:4321 (honors PORT env var)
npm run build        # → dist/ (static output, deploy this) — must produce 7 routes (6 pages + 404)
npm run preview      # preview the built dist/

npm run make:og      # regenerate branded 1200x630 OG images → public/og/ (uses sharp)
npm run make:pdfs    # regenerate the case-study PDFs → public/pdf/ (uses Playwright/Chromium)
```

There is no test suite or linter configured. Verify every change with `npm run build` (must complete with 7 static routes, zero errors) and by checking the dev server in a browser at a few widths (desktop / ~768px tablet / 375px mobile).

The dev-server launch config lives at `.claude/launch.json` (name: `faamirali`) — use the Preview tool's `preview_start` with that name rather than invoking `npm run dev` directly via Bash.

**If the dev server shows a stale error after a large edit** (e.g. "X is not defined" for a variable that clearly exists in the file), it's Vite serving a cached compiled module from a half-written intermediate state, not a real bug. Fully stop the preview server and start a fresh one rather than debugging code that's actually correct — this has happened multiple times in this project's history and cost real time chasing a phantom.

## Architecture

**Stack:** Astro 7 (`^7.0.6` — pinned at this version specifically to clear a set of XSS/SSRF CVEs; don't downgrade), static output only (`astro.config.mjs` — no SSR adapter, no server islands). `astro.config.mjs` also:
- honors an external `PORT` env var (`server.port`) — Astro doesn't do this by default
- whitelists the project's absolute path for Vite's fs-serving check (`vite.server.fs.allow`), because the folder name contains a space (`faamirali website`) — **don't remove that entry**, dev tooling that resolves the 8.3 short path will break without it
- sets `devToolbar: { enabled: false }` — the owner explicitly asked for Astro's dev toolbar popup removed; don't re-enable it

`vercel.json` sets security headers (HSTS, nosniff, referrer policy, `frame-ancestors 'none'`, permissions policy) on all routes — don't remove these when touching deploy config.

**No SSR, no client framework, no test/lint tooling installed.** Don't introduce React/Vue/Svelte islands, a CMS, or a state library — every page here is plain Astro + scoped `<style>` blocks.

### File map (what lives where)

```
src/
  data/
    site.js        — sitewide identity, contact, canonical description, Person/ProfilePage JSON-LD
    projects.js     — THE single source of truth for the 3 project pages + home cards (see schema below)
  components/
    Header.astro    — floating dual-pill nav (persists across page transitions)
    Footer.astro    — dark CTA block, id="contact" anchor target
    Seo.astro       — per-page <head>: title/description/canonical/OG/Twitter/JSON-LD, all static
    ProjectRow.astro— the home-page work card (title → stat → divider → sentence)
    ProofGrid.astro — the fluid bento grid on each /work/[slug] page
    Placeholder.astro — pure-CSS labeled tile standing in for a not-yet-dropped-in photo/video
  layouts/
    Base.astro      — <html> shell: fonts, Seo, ClientRouter, Header, <slot/>, Footer
  pages/
    index.astro     — home (hero, work cards, recommendation pull-quote)
    about.astro     — canonical record + first-person story
    honours.astro   — recommendation letter typed in full + "View original PDF" button
    work/[slug].astro — project page template, reads from projects.js
    404.astro       — "No record on file."
  styles/
    global.css      — design tokens (see below) + shared primitives (.btn, .eyebrow, .meta-line, .serif, .wrap, .section)
scripts/
  make-og.mjs       — generates public/og/*.png (edit the `pages` array when adding a route)
  make-pdfs.mjs     — generates public/pdf/*-case-study.pdf from the source case-study markdown
public/
  img/, video/, pdf/ — real dropped-in assets (see Assets section)
  robots.txt, llms.txt, sitemap.xml, favicon.svg, an IndexNow key file
```

## Design tokens (current, live — `src/styles/global.css`)

```css
--canvas: #f1ede5;      /* cream paper — page background */
--ink: #1a1813;         /* near-black — body text, headings */
--card: #fbf9f4;        /* off-white — every card/tile background */
--accent: #4a2f1d;      /* dark brown — the ONE accent color, site-wide */
--accent-hover: #34210f;
--muted: #6f6a5f; --muted-2: #54504a; --faint: #a39d90;   /* 3-step gray scale for secondary text */
--line: rgba(26,24,19,.09); --line-2: rgba(26,24,19,.14); /* hairline borders, two strengths */
--dark: #16140f; --dark-text: #ece8df; --dark-muted: #948e82; /* the dark footer only */
--maxw: 1180px;         /* page content max-width */
--r: 24px; --r-card: 24px;   /* card/tile corner radius — same value, keep them equal */
--r-pill: 999px;        /* fully rounded — buttons, tags, nav pills */
--font-sans: 'Archivo', ...      /* body + headings */
--font-serif: 'Newsreader', ...  /* ONLY for quotes/signatures — see below */
--font-mono: 'IBM Plex Mono', ...  /* eyebrows, meta lines, sources, nav links */
```

**Rounding rule — this is load-bearing, don't violate it:** *everything* rounded corner uses either `var(--r)` (24px, for cards/tiles/media/buttons-as-blocks) or `var(--r-pill)` (999px, for pill-shaped buttons/tags/nav). There is no intermediate radius anywhere. If you add a new card or tile, it gets `border-radius: var(--r)`. This was deliberately reverted from an earlier "4px rectangles, ledger-table" design the owner tried and rejected — do not reintroduce sharp corners or a second design language.

**Color rule:** one accent color, full stop. Never add a second accent (no green, no red, no colored status dots). Status/state is communicated with **text** (a mono `fileLine`/`meta-line`), never a colored dot or pill-with-dot.

**Type rule:**
- `--font-sans` (Archivo) for all headings and body copy. Display headings (h1s) are condensed/uppercase via `font-stretch` + `text-transform: uppercase` — see `.hero-title`, `.p-name` for the pattern.
- `--font-mono` (IBM Plex Mono) for: eyebrows (`.eyebrow`), meta lines (`.meta-line`), nav links, button labels, ledger/stat source lines, media captions. This is "the documentation voice" — small, uppercase, letter-spaced.
- `--font-serif` (Newsreader, italic) is reserved **only** for quote/signature moments: the recommendation pull-quote on the home page, the FleetBot principal quote, and the signature name on `/honours`. Don't use it for body paragraphs or headings beyond the single italic word already used in each page's `<h1>` (e.g. "Built & *shipped.*", "The *story.*", "Honours & *recognition.*" — one italic serif word per h1 is the pattern, not a rule to expand).

**Motion:** `prefers-reduced-motion` is globally honored (see the media query at the bottom of `global.css` — it nukes all transitions/animations). Never add motion that bypasses this. `:focus-visible` outlines are global — don't override them away.

## Component patterns — read before adding anything visual

### 1. Home-page work cards (`ProjectRow.astro`) — divider alignment

Order is fixed: **title → headline number (from `ledger[0]`) → short label → divider → one plain sentence (`cardLine`)**. No dates, no meta-line clutter, no truncated/clamped text.

**The bug this project actually shipped and had to fix:** the title and the stat label can each wrap to 1 or 2 lines depending on their text length. If you let them size naturally, the divider below them lands at a different height on every card, and a row of 3 cards looks visibly broken (misaligned hairlines). **The fix, and the rule for any future card-like element:** reserve a fixed height for any text block that sits *above* a divider/rule, sized for the worst case (here, 2 lines), using **em units** so it scales with the font's own `clamp()`:

```css
.card-name { line-height: 1.15; min-height: calc(1.15em * 2); }
.stat-l    { line-height: 1.4;  min-height: calc(1.4em * 2); }
```

If you add a 4th home-page card (a new project) or restyle this component, this `min-height` pattern must be preserved on every variable-height text element that precedes a shared divider. Test it by comparing 3 cards side by side where one title is 1 word and another is 4 words — the hairline dividers must be pixel-identical across all cards (verify with `getBoundingClientRect()`, not just eyeballing a screenshot — see "Gotchas" below).

The grid itself (`src/pages/index.astro`, `.work-grid`) is `display:grid; grid-template-columns: repeat(3, 1fr)` on desktop, 2 columns ≤860px, 1 column ≤600px. Adding a 4th project just adds a 4th card to the same grid — no other change needed as long as the new card's `projects.js` entry has a `ledger` array (see schema below).

### 2. Project-page proof section (`ProofGrid.astro`) — the fluid bento

This is **not** a fixed/symmetrical grid and must never become one. It's `grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr))` with `grid-auto-rows: 78px` (a base row unit) and `grid-auto-flow: row dense` so tiles of different sizes pack tightly with no vertical gaps, and the column count adjusts itself per viewport (desktop gets 4–5 columns, tablet 2, phone 1) with zero manual breakpoint tuning beyond the one `@media (max-width: 480px)` rule that collapses span-2 tiles to full width.

**Tile sizing vocabulary — every tile is a multiple of the 78px row unit:**
| Tile type | Class | Span | Used for |
|---|---|---|---|
| Stat | `.tile.stat` | 1 col × 2 rows | Each `ledger` entry. First one also gets `.stat--lead` (2 col span, bigger number) — always put your most impressive/headline number first in the `ledger` array, it becomes the lead tile automatically. |
| Action | `.tile.action.action--dark` / `.action--light` | 1 col × 2 rows | The `live` link (dark) and each `pdfs` entry (light) |
| Media | `.tile.media` | 2 col × 3 rows | Each of `media`/`media2` — a photo or video |
| Quote | `.tile.quote` | 2 col × 3 rows | `proj.quote` (a pull-quote with attribution) |
| Highlight | `.tile.highlight` | 2 col × 3 rows | `proj.note` (a wide callout with eyebrow/big-text/sub) |

**Rule for adding a new tile type:** always span rows in multiples of the 2-row or 3-row units already established (never span 1 or an odd number that breaks the `dense` packing), and always add it as a new block in the `.map()`/conditional chain in `ProofGrid.astro`, driven by a new optional field on the project object in `projects.js` — never hardcode per-project content into `ProofGrid.astro` itself. The component must stay generic; all copy/data lives in `projects.js`.

**Media tiles — never distort a photo/video.** `.m-fill` is `position:absolute; inset:0; width:100%; height:100%; object-fit:cover;`. This crops to fill the tile's fixed 2×3-unit box (which is a fixed landscape aspect from the row/col spans, not a data-driven `ratio` — an earlier version tried a per-media `ratio` field and it went unused/dead once the row-span system replaced it; don't resurrect it). A photo of any aspect ratio just drops in via `src`+`alt` and looks right automatically. Captions/corner tags over a **real** photo or video get a dark semi-opaque chip (`.m-badge`) so they stay legible regardless of what's underneath; over the **placeholder** diagonal-stripe pattern (no `src` yet) they're plain text with no chip. This distinction is handled automatically by whether `m.src` is set — don't add a chip manually or remove it when a placeholder gets a real photo, just add `src`+`alt` to the data and the component does the rest.

### 3. Adding a new project (the whole recipe)

1. Add an entry to the `projects` array in `src/data/projects.js` with this exact shape:

```js
{
  slug: 'kebab-case-slug',              // → /work/kebab-case-slug
  name: 'Display Name',
  fileLine: 'Status line · dates · role',   // shown as small mono text at top of the project page
  cardLine: 'One plain, complete sentence — no jargon, understandable by anyone, not truncated.',
  seoTitle: '... | F. Aamir Ali',
  seoDescription: '...',                // ~150-160 chars, factual
  ogImage: '/og/kebab-case-slug.png',   // must exist — see make-og.mjs below
  tagline: 'One italic sub-headline sentence shown under the H1.',
  acts: null,                            // OR an array (see FleetBot for the two-act pattern) — mutually exclusive with `intro`
  intro: ['Paragraph 1...', 'Paragraph 2...'],  // OR `acts` — mutually exclusive
  ledger: [
    { n: '150+', l: 'plain description of what this number is', src: "principal's letter" }, // src is optional
    // MOST IMPRESSIVE NUMBER FIRST — becomes the lead bento tile automatically
  ],
  media: { label: 'file.jpg', sub: 'caption', video: false, src: '/img/file.jpg', alt: 'factual alt text' }, // or video:true + corner:'REC' + .mp4 src
  media2: null,                          // optional second media tile, same shape
  live: { label: 'Button text', note: 'small note above it', href: '' },  // href:'' shows an "— drop in" dark placeholder tile automatically
  pdfs: [{ label: 'Full case study', href: '/pdf/kebab-case-slug-case-study.pdf' }],
  quote: null,                           // OR { text, attr } — mutually exclusive-ish with `note` (both CAN coexist, they're separate tiles)
  note: null,                            // OR { eyebrow, big, sub }
}
```

2. `work/[slug].astro` auto-generates the route from `getStaticPaths()` — nothing to touch there.
3. Add the project's name to the "More work" cross-links automatically (also handled by `[slug].astro` — it filters `projects` by slug).
4. Add a nav dropdown link in `Header.astro`'s `.dropdown` block (`Work` hover menu).
5. Add an entry to `scripts/make-og.mjs`'s `pages` array, then run `npm run make:og`.
6. Add the URL to `public/sitemap.xml` and `public/llms.txt`.
7. If there's a real case-study PDF, add it to `scripts/make-pdfs.mjs`'s `docs` array and run `npm run make:pdfs`.
8. Run `npm run build` and confirm the route count went up by exactly one, and check the new project's proof-bento in a browser at desktop/tablet/mobile.

### 4. Adding a new nav item / header link

`Header.astro`'s nav order is: `Work` (hover dropdown) → `About` → `Honours` → `Contact` (CTA pill, solid accent background). A new top-level nav item goes as a plain `<a class="nav-link" href="/slug">Label</a>` between the last content link and the `Contact` CTA. Don't add more than 4-5 nav items total — the pill has to fit on a 375px phone (verified working at 4 items + CTA as of this doc; test overflow with `document.documentElement.scrollWidth - clientWidth` if you add a 5th).

**Gotcha:** if the new page needs to route to an in-page anchor elsewhere (like `Contact` does, which scrolls to the footer's `id="contact"`), a plain `href="#anchor"` will NOT work reliably — Astro's `ClientRouter` intercepts hash links as a page transition and resets scroll to top. Copy the pattern already in `Header.astro`'s `<script>` block: give the link an `id`, `e.preventDefault()` on click, `document.getElementById(target).scrollIntoView({ behavior, block: 'start' })`, then `history.pushState(null, '', '#anchor')` manually.

### 5. Adding a new page (like `/honours`) with narrower content in a full-width `.wrap`

`.wrap` is `max-width: var(--maxw)` (1180px) — that's the outer page width. If a page has content that should read as a narrower centered column (a letter, a long-form article, anything that isn't a grid), **don't just drop it in `.wrap` at full width** — it'll hug the left edge and look broken (this literally happened and had to be fixed on `/honours`). Wrap it in its own inner container:

```css
.letter-inner { max-width: 900px; margin: 0 auto; }
```

...nested inside the outer `.wrap`. Pick a `max-width` in the 700–900px range depending on content (prose reads best around 60-75ch; the `/honours` letter uses 900px because it's set in a padded card with wide margins).

### 6. Empty/future-content sections — don't add them speculatively

An earlier draft of `/honours` had "Certificates" and "Scholarships" sections with an honest "No certificates on file yet." placeholder box, reserving visual space for content that doesn't exist yet. **The owner explicitly removed this** — don't add empty placeholder sections for hypothetical future content unless the owner asks for it. When there's a real certificate or scholarship to add, add a real section then; don't pre-build empty scaffolding.

## Content rules (voice, honesty, locked decisions)

- **First person** in all visible copy ("I built…"). **Third person only** in `CANONICAL_DESCRIPTION` (`src/data/site.js`), the JSON-LD schema, and `llms.txt` (including the `/about` "On the record" lead, which IS the canonical string, byte-for-byte).
- **Byte-identical canonical description** — `CANONICAL_DESCRIPTION` in `site.js`, the `description` in `personJsonLd`, the top blockquote in `public/llms.txt`, and the "On the record" block on `/about` must all be the exact same string. If you edit one, edit all four. This sameness is deliberate — it's what makes AI systems converge on one accurate description instead of paraphrasing differently in different places. Verify after any edit: `schemaDesc === llmsTxtLine === aboutPageText`.
- **The Surrey Youth AI Summit is "planned and executed"** in the owner's own voice — never "founded" or "co-founded" in first-person site copy (a collaborator, Yuvraj from Panorama Ridge, is credited once, naturally, in the About page and the project intro — don't erase him, just don't use "co-founded" as the verb). The summit is also now stated **confidently** as "the first youth AI summit in Surrey" — no hedge like "as far as I could find." Never inflate this to "first ever AI summit" (unqualified) anywhere — it is specifically the first *youth* summit *in Surrey*.
- **⚠️ Exception — verbatim quoted documents are exempt from the site's own voice rules.** The recommendation letter on `/honours` is a direct, word-for-word reproduction of a third party's signed letter. It keeps her exact wording — including "co-founder and lead organizer," which contradicts the site's own "planned and executed" phrasing elsewhere. **Never edit the text of a quoted document to match site style** — that would misrepresent what was actually written and signed. If you ever need to transcribe another quoted document (an award letter, a certificate, etc.), the same rule applies: reproduce it exactly, don't launder someone else's words through the site's voice guide.
- **Lineage is FleetBot → the club → the Summit** (FleetBot came first and inspired the club; the club then launched the Summit). Never say "the club is the platform my work grew out of" — that's backwards.
- **AI & Innovation Club member count is 20** everywhere (site + PDFs); **~13** bi-weekly meetings (not "~15/year" — a stray inconsistency in the source case study, corrected on the site).
- **FleetBot credit stays honest:** a friend hand-coded the staff front-end + API connection — say so. Never use credit-percentages ("70% of the work"), never self-diminish ("smallest project," "least flashy"), never criticize a teammate, never erase a collaborator.
- **No negatives on the site, period** (owner decision): no "we didn't win" (Best Buy Teen Tech Challenge), no usage-decline narrative ("it was a vitamin, not a painkiller"), no "what broke" (the Summit's spam-filtered acceptance emails). This honest detail is real and important — it just lives in the case-study PDFs (`public/pdf/*.pdf`), not in the site's visible copy. When rewriting any project copy, actively scan for and remove anything that reads as a setback, failure, decline, or loss, even if factually true and even if it was in the source case study.
- **Explain, don't dump.** Visible copy explains a thing for a reader who has never heard of it (e.g., say what Generation AI *is* — "a group that runs AI-education programs" — before naming it) instead of listing five things back to back with no context (an earlier draft literally listed "the event site, the sponsorship, the program — three workshops, five briefs, a 100-point rubric, scholarships, certificates, marketing, day-of ops" in one run-on sentence; this was rejected and rewritten as 1-2 sentences that lead with the single most impressive/understandable fact). One clear paragraph beats an inventory.
- Banned words: aspiring, passionate, enthusiast, motivated, leverage, synergy, revolutionary, game-changing, cutting-edge, innovative-as-self-praise.
- Only already-completed work. No `/now` page, no "what's next"/succession copy (locked decision).

## `projects.js` field reference (authoritative — read §3 above for the full add-a-project recipe)

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes | kebab-case, becomes `/work/<slug>` |
| `name` | string | yes | display name everywhere |
| `fileLine` | string | yes | small mono status line at top of project page |
| `cardLine` | string | yes | ONE complete plain sentence for the home card — no jargon, not clamped/truncated |
| `seoTitle` / `seoDescription` | string | yes | `<title>` and meta description |
| `ogImage` | string | yes | must have a matching entry in `make-og.mjs` |
| `tagline` | string | yes | italic sub-headline under the H1 |
| `acts` | array or null | one of `acts`/`intro` | `{ kicker, title, paras: [] }[]` — for a project with distinct phases/builds (see FleetBot) |
| `intro` | array or null | one of `acts`/`intro` | plain paragraph strings — for a single-arc project (see Summit, Club) |
| `ledger` | array | yes | `{ n, l, src? }[]` — **order matters, most impressive first** (becomes the lead bento tile and the home card's headline stat) |
| `media` / `media2` | object or null | no | `{ label, sub, video, corner?, src?, alt? }` — omit `src`/`alt` for a not-yet-dropped-in placeholder; `video:true` needs `corner:'REC'` styling convention |
| `live` | object | yes | `{ label, note, href }` — empty `href` renders a dark "— drop in" placeholder tile automatically |
| `pdfs` | array | yes | `{ label, href }[]` — can have more than one (FleetBot links two separate PDFs) |
| `quote` | object or null | no | `{ text, attr }` — a pull-quote tile |
| `note` | object or null | no | `{ eyebrow, big, sub }` — a wide highlight tile |

## Assets

Real photos/video live in `public/img/` and `public/video/`, referenced by `src` in the `media`/`media2` fields above. When dropping in a new real asset:
1. **Resize + compress first** — use `sharp` (already a devDependency): `.rotate()` (respects EXIF orientation from phone photos) `.resize({ width: 1600–1800, withoutEnlargement: true }) .jpeg({ quality: 82, mozjpeg: true })`. Real source photos from a phone are often 3000–5700px wide and 2–4MB; compressed output should land around 150–300KB.
2. **Write specific, factual alt text** — what the image proves, not a generic label (e.g. "FleetBot running on a dedicated computer in the school's main office, April 2026", not "photo of computer").
3. Video: MP4/H.264 is fine as-is if already reasonably encoded — no forced re-encode needed if the source is already an MP4 (this project's FleetBot demo video came in already as a compressed MP4, not a `.MOV`, so no conversion step was needed — check the actual file before assuming a conversion step is required).
4. `Placeholder.astro` is the pure-CSS fallback (diagonal stripe pattern + mono label) for anything not yet dropped in — never leave a broken `<img>` reference; always gate on whether the data has a `src` (see ProofGrid's `isPhoto`/`isVideo` pattern).

**Reading a PDF that turns out to be a scanned/signed document:** `pdf-parse` (or any text-layer extractor) returns empty text for a scanned/signed PDF — there's no text layer to extract. Don't conclude the file is empty or corrupt. Render it to an image instead and transcribe visually: this project used Windows' built-in `Windows.Data.Pdf.PdfDocument` WinRT API via PowerShell (no extra install needed on Windows) to rasterize the page to a PNG, then read that PNG. Playwright/Chromium's native PDF viewer does *not* reliably screenshot local `file://` PDFs in headless mode (it tries to download the file instead) — don't waste time on that path.

**Fonts that aren't on Google Fonts (e.g. a Canva-exclusive font like "Frekoda"):** never attempt to download or source a non-Google, possibly-licensed font from the internet on the owner's behalf — that's a licensing risk. If asked to use one, search the local filesystem first (the owner may have it downloaded already); if it genuinely isn't present anywhere, say so plainly and ask the owner to supply the actual font file to self-host via `@font-face`. Don't silently substitute a different font under the requested name.

## Discovery / AI-visibility layer

Lives partly as static files in `public/` (`robots.txt` allow-lists AI crawlers; `llms.txt`; `sitemap.xml`; an IndexNow key file) and partly as JSON-LD emitted per-page by `Seo.astro`. `sameAs` in the Person schema stays empty until a real LinkedIn exists — don't invent one. After **any** copy change on any page, or after adding a page: re-run `npm run make:og` (OG cards render text, so stale copy = stale share cards) and re-verify `dist/` with a grep sweep for the old text plus a route-count check.

**Whenever a new page is added, update all of these in lockstep** (this is the full checklist, don't do a partial job):
1. `src/components/Header.astro` — nav link (and dropdown link if it's a project)
2. `src/pages/404.astro` — add it to the `nf-links` list
3. `public/sitemap.xml` — new `<url>` entry with today's date as `lastmod`
4. `public/llms.txt` — new bullet under `## Pages`
5. `scripts/make-og.mjs` — new entry in the `pages` array, then run `npm run make:og`
6. This file's route count (`npm run build` output and the two mentions of "7 routes" above)

## Security / cleanup already done — don't reintroduce

- `npm audit` must show 0 vulnerabilities (Astro pinned to `^7.0.6` specifically to clear known CVEs — don't downgrade).
- No secrets/API keys anywhere in the repo (there's nothing that needs one — this is a fully static site with no backend calls).
- `src/components/DevEditor.astro` (a dev-only in-browser typography editor built earlier in this project's history) has been **deleted**, along with its two references in `Base.astro`. Astro's built-in dev toolbar is **disabled** (`devToolbar: { enabled: false }` in `astro.config.mjs`). Do not re-add either of these — the owner explicitly asked for all dev-tool popups gone.
- The `--font-nav` / Berthold Akzidenz-Grotesk BE variable that once existed in `Header.astro` (an unlicensed commercial font, never actually loaded) has been removed. Don't reintroduce a reference to a font that isn't actually self-hosted or loaded via Google Fonts.

## Gotchas learned the hard way (read before you debug something "weird")

- **Divider/rule misalignment across sibling cards** → almost always a variable-height text block above the divider. Fix with `min-height: calc(<line-height>em * <max-lines>)` on every such block (§1 above). This is the #1 thing to check before adding any new card/row component with a shared divider.
- **A bento/grid with visible gaps or awkwardly-tall empty tiles** → check that every tile's `grid-row: span N` is a clean multiple of the base row unit, and that `grid-auto-flow: row dense` hasn't been accidentally removed.
- **New page's content hugging the left edge with dead space on the right** → it's sitting directly in the full-width `.wrap` and needs its own `max-width + margin:0 auto` inner wrapper (§5 above).
- **A flex row squeezing two children onto one line instead of stacking on mobile, even though a `@media` rule exists for it** → `flex-wrap: wrap` only wraps when the content doesn't fit; if it *does* fit at a given width (common with two short elements), it won't stack, and it'll look cramped/broken at exactly that width. Force it explicitly with `flex-direction: column` in the media query rather than relying on wrap. (This exact bug shipped in the footer's CTA row and had to be fixed.)
- **Astro's `ClientRouter` breaks in-page hash-anchor scrolling.** Never rely on a bare `href="#id"` for same-page navigation if the target is meant to be reachable from other pages too (like the footer's `#contact`, which is present on every page via the layout) — write a manual `scrollIntoView` handler (see §4 above).
- **A stale "X is not defined" error in the dev server after a big edit** → restart the dev server fully (stop + start), don't debug code that's actually fine. Vite's HMR can serve a cached compiled module from a botched intermediate write.
- **`preview_screenshot` at a custom (non-preset) viewport size can render inaccurately** in this tool's automation — if a screenshot looks wrong after a resize but the change should be simple CSS, verify with real layout math (`getBoundingClientRect()`, `getComputedStyle()`, `scrollWidth - clientWidth` for overflow) before concluding there's a real bug. Trust computed layout over a screenshot pixel-count when they disagree.
- **A scanned/signed PDF has no extractable text layer** — see the Assets section above for the correct way to read one (rasterize + read visually, don't assume `pdf-parse` returning empty means the file is broken).

## Where things stand

Structure, copy (rewritten from the case studies), the design system described above, the discovery layer, security headers, 404, the case-study PDFs, and the `/honours` page (recommendation letter typed in full, `public/pdf/recommendation-letter.pdf`) are all done. The FleetBot terminal photo, the Surrey Summit group photo, the AI Club photo, and the FleetBot demo video are all real assets wired into `public/img/`/`public/video/` and referenced from `projects.js` — only the homepage/About headshot is still a placeholder (`aamir.jpg` doesn't exist yet; `Person.image` in the schema is intentionally omitted until it does). Dev tools (DevEditor, Astro dev toolbar) are fully removed.

**Still pending (owner's tasks, not code work):** the real headshot photo; a self-hosted "Frekoda" font file for the header, if the owner still wants it (currently blocked — see Assets section); GSC/Bing/GA4 setup on the live domain once deployed; adding real certificates/scholarships to `/honours` as they're awarded (as a real section when there's real content — not a placeholder now, see §6).

`ASSETS.md` has the exact current asset-by-asset mapping and launch-runbook checklist.
