# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is written so that an AI with **zero prior context on this project** can add a new project, a new section, or a new page and get the layout, data shape, and voice exactly right on the first try — no misaligned dividers, no gappy bento grids, no copy that violates the owner's locked decisions.

**Read this whole file before touching anything.** Most bugs in this project's history came from skipping a convention documented here (see "Gotchas learned the hard way" — every one of those was a real bug that shipped and had to be fixed).

## What this is

The personal site & long-term hub of **F. Aamir Ali** — builder & founder, Grade 11, Surrey BC. A fast, static, multi-page Astro site. Every fact on the site must trace back to the four case-study files (the `*_f.md` files under `C:\Users\fateh\Downloads\College Applications\Main Projects\`) or the principal's recommendation letter — nothing goes on the site that isn't sourced from those documents or explicitly given by the owner in conversation.

**⛔ Old-case-study guard:** if a case-study file contains "70% of the whole thing myself", "smallest of my projects", or "least flashy thing", it is a RETIRED old version — stop and tell the owner. Only the `*_f.md` files are valid sources.

The non-negotiable technical constraint driving every decision: **all page text must be static server-rendered HTML, never injected client-side.** This serves two goals simultaneously — page-load speed, and readability by AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc. often don't execute JS). Never add a framework, a client-side data-fetch, or a JS-rendered content block. The client JS on the site is `ClientRouter` (page transitions), two tiny inline scripts in `Header.astro` (scroll-detach + smooth-scroll-to-contact), and the GA4 tag in `Base.astro` (analytics beacon only, renders nothing, production-build-only — see the Analytics section below). None of these render page content, so the AI-crawler guarantee holds.

## Commands

```bash
npm install
npm run dev          # http://localhost:4321 (honors PORT env var)
npm run build        # → dist/ (static output, deploy this) — must produce 11 routes
                     #    (6 pages + 404 + 4 case studies) plus a generated sitemap.xml
npm run preview      # preview the built dist/
npm run verify       # PRE-DEPLOY GATE — run after build. Checks routes, titles,
                     #   descriptions, canonicals, h1/heading order, JSON-LD @id
                     #   integrity, every internal link, that all carousels/logos/
                     #   photos actually rendered (not placeholders), the
                     #   byte-identical canonical description, fact consistency
                     #   across site/PDF/llms.txt, the no-negatives split, and the
                     #   sitemap. Exits non-zero on failure.

npm run make:og      # regenerate branded 1200x630 OG images → public/og/ (uses sharp)
npm run make:pdfs    # regenerate the case-study PDFs → public/pdf/ (uses Playwright/Chromium)
```

There is no test suite or linter configured, so **`npm run build && npm run verify` is the closest thing to one — always run both.** A green build alone is NOT enough: the build has twice reported success while silently breaking the site (see the `publicAssets` gotcha below, where an Astro upgrade made all 24 carousel photos vanish). Then check the dev server in a browser at a few widths (desktop / ~768px tablet / 375px mobile).

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
    site.js        — sitewide identity, contact, canonical description, and the WHOLE
                     schema layer: Person / WebSite / HighSchool nodes, graph(),
                     breadcrumbJsonLd(), projectEntityJsonLd() (see "Schema" below)
    projects.js     — THE single source of truth for the 3 project pages + home cards (see schema below)
    caseStudies.js  — config + render pipeline for the 4 long-form case studies:
                      which markdown file, which PDF, and the two edit layers
                      (factFixes / siteEdits). Shared by the PDF script AND the
                      on-site HTML page so they can't disagree (see §7)
  content/
    case-studies/   — the 4 source markdown files, IN THE REPO (see §7)
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
    case-study/[slug].astro — the long-form case studies as crawlable HTML (§7)
    sitemap.xml.js  — GENERATES the sitemap at build time (no static file any more)
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
- `--font-sans` (Archivo) for all headings and body copy. Project-page display headings are condensed/uppercase via `font-stretch` + `text-transform: uppercase` — see `.p-name` for the pattern. **The home hero (`.hero-title`) is the deliberate exception**: it is mixed case at `font-stretch: 100%`, because condensed widths exist to stop ALL-CAPS sprawling and at 82% the lowercase came out pinched. If you ever set another masthead in mixed case, open the width back to 100% with it — the two settings go together.
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

Not a symmetrical grid: `grid-auto-rows: 78px` (a base row unit) with per-tile row spans and `grid-auto-flow: row dense`, so differently-sized tiles pack tightly.

**⚠️ Columns are now an EXPLICIT count per breakpoint (5 / 4 / 3 / 2 / 1), not `auto-fill`.** This reverses the original "zero manual breakpoints" design, and the reversal is deliberate: with `auto-fill` the live column count depended on the container width *minus the scrollbar*, so it was environment-dependent and unknowable from the CSS. Tile spans only tessellate against a known column count, so span rules written for "the 4-column case" silently applied at 3 columns and left holes (measured 4 empty cells where 0 were intended). Don't restore `auto-fill` — the column count must stay knowable. Breakpoints: `≥1240px` 5 cols, `1024–1239` 4, `820–1023` 3, `600–819` 2, `<600` 1. **Any rule keyed to a column count MUST use these exact boundaries.**

**Tile sizing vocabulary — every tile is a multiple of the 78px row unit:**
| Tile type | Class | Span | Used for |
|---|---|---|---|
| Stat | `.tile.stat` | 1 col × 2 rows | Each `ledger` entry. First one also gets `.stat--lead` (2 col span, bigger number) — always put your most impressive/headline number first in the `ledger` array, it becomes the lead tile automatically. |
| Action | `.tile.action.action--dark` / `.action--light` | 1 col × 2 rows | The `live` link (dark) and each `pdfs` entry (light) |
| Media | `.tile.media` | 2 col × 3 rows | Each of `media`/`media2` — a photo or video |
| Quote | `.tile.quote` | full row × 3 rows | `proj.quote` (a pull-quote with attribution) |
| Highlight | `.tile.highlight` | **varies per column count** | `proj.note` (a wide callout with eyebrow/big-text/sub) |

**Why the highlight's span varies (and the general rule for closing rows):** every other tile is 2 rows tall, so a 3-row tile can never tessellate at a column count where the others sum to a full row — that mismatch left a dead column beside the keynote card *and* a dead strip under its neighbours (5 empty cells). It is now `span 3 × 2 rows` at 5 columns, full-width × 2 rows at 4, `span 2 × 3 rows` at 3, full-width × 3 rows below. The 3-row variants exist because `span 2` is too narrow to fit the copy in 2 rows — **if you change a highlight's text, re-check `scrollHeight > clientHeight`**, since `.tile` is `overflow:hidden` and will silently clip.

Separately, a band that **ends on an action tile** leaves its leftover columns empty (the stray gap beside a lone "Read the PDF"). Contained rules widen that trailing action per column count. Note `grid-column: auto / -1` does **not** work for this — with an auto start the span stays 1, so it just pins the tile to the last column and moves the gap in front of it.

**Rule for adding a new tile type:** always span rows in multiples of the 2-row or 3-row units already established (never span 1 or an odd number that breaks the `dense` packing), and always add it as a new block in the `.map()`/conditional chain in `ProofGrid.astro`, driven by a new optional field on the project object in `projects.js` — never hardcode per-project content into `ProofGrid.astro` itself. The component must stay generic; all copy/data lives in `projects.js`.

**Media does NOT live in the bento — it lives in `.media-row` (§2d).** The bento's fixed 78px row unit forced every asset into the same ~1.77 box, so a 4:3 photo got cropped *and* left dead space under it. Media is now its own band, sized to each asset's true `ratio`.

**Media tiles — never distort or crop a photo/video.** `.m-fill` is still `position:absolute; inset:0; width:100%; height:100%; object-fit:cover;`, but the tile's box is now set to the asset's **own** `ratio`, so `cover` crops nothing — it only absorbs sub-pixel rounding. Captions/corner tags over a **real** photo or video get a dark semi-opaque chip (`.m-badge`) so they stay legible regardless of what's underneath; over the **placeholder** diagonal-stripe pattern (no `src` yet) they're plain text with no chip. This distinction is handled automatically by whether `m.src` is set — don't add a chip manually or remove it when a placeholder gets a real photo, just add `src`+`alt` to the data and the component does the rest.

### 2b. Grouped proof mode — when one project has two distinct builds

`ProofGrid` has two render modes, same tile vocabulary:

- **flat** (default, Summit + Club): one bento holding every tile.
- **grouped** (FleetBot): set `proofGroups` on the project and tag items with a matching `group`. Each group renders its own labelled bento (mono accent label + hairline filler rule), so numbers from two different builds never read as one mixed pile. Untagged items fall through to a final unlabelled bento — that's where FleetBot's principal quote lives, closing out both groups.

Two things about grouping that are easy to get wrong:

1. **Don't reorder `ledger` to group it.** `ledger[0]` is the home card's headline stat. Grouping is done by the `group` tag and display order comes from `proofGroups`, so the array order stays free to serve the home card. FleetBot keeps `150+` at index 0 (home card) while the *student* group still renders first (matching the two-act narrative), because the lead tile is computed per group, not globally.
2. **Re-measure occupancy after any change to what's in a group.** Grouping splits one bento into several smaller ones, which makes empty cells much likelier. A mid-session state where media still lived in the bento measured **~35% empty cells** and needed the column track widened to compensate; once media moved out to `.media-row`, the remaining tiles (all 1-col except the 2-col lead and the full-width quote) pack cleanly at the standard 220px track — currently 2 empty cells out of 35. So there is **no `.grouped .bento` override any more**: both modes use the same 220px track. If you add or remove tiles in a group, measure occupancy (method in the gotcha below) instead of eyeballing it.

**Colour:** group `tone` is `'light'` (plain card) or `'wash'` (`rgba(74,47,29,.06)`, i.e. the site's single accent at low opacity). It is a **tint of the one accent, never a second hue** — the one-accent rule still holds.

### 2c. Multi-slide posts (`Carousel.astro`)

A click-through Instagram-style post, driven by `carousel` in `projects.js`. Two hard rules baked in:

- **Zero client JS.** State is a native radio group; slide position, arrow visibility and the active dot are all resolved in CSS via `#root:has(#id-N:checked)`. The generated state rules are emitted as one `<style is:inline set:html>` block scoped under the carousel's unique id. This keeps it inside the static-HTML constraint, works with JS off, ships all slides as real `<img>` markup for crawlers, and gets keyboard support free (the radios stay focusable, so arrow keys move slides). Don't "improve" this with a JS slider.
- **Slides use `object-fit: contain`, not the `.m-fill` cover treatment.** A marketing post has copy baked into the image; cropping to fill would cut its own text off. This is the one deliberate exception to the cover rule in §2.

It renders **outside** the bento, as an item in `.media-row` (§2d). It was a 2×6 bento tile first, which forced a 2×3 void beside it that `dense` had nothing left to backfill. Its width is `calc(var(--mh) * var(--post-ar))` — derived from the media band's row height and the post's own aspect — so the slide window lands at exactly the band height and lines up with the photo or video beside it. `--post-ar` is computed in `ProofGrid` from the `aspect` string, so setting `aspect: '4 / 3'` on a carousel is all that's needed for it to match 4:3 media.

### 2d. The media band (`.media-row`)

A flex row where **every item keeps its own aspect ratio at a shared height** (`--mh`, 380px desktop / 300px ≤1000px), so widths differ but tops align like a filmstrip. Nothing is cropped, nothing is stretched, and no tile is left with dead space under a photo that doesn't fill it.

- **`ratio` on each `media`/`media2` entry is required in practice** — it is the asset's *measured* ratio, not a guess. Current values: the demo video is 1280×720 (`16 / 9`); every real photo is 4:3 (`4 / 3`). Falls back to `4 / 3` if omitted. Measure a new asset before adding it (`sharp().metadata()` for images; for MP4 there's no ffprobe here — read the `tkhd` box: `width = readUInt32BE(boxStart + 84) / 65536`).
- Below 700px the row becomes a single column: `height: auto; width: 100%`, with `aspect-ratio` still holding the true shape.
- **Captions must never be filenames.** `label`/`sub` are human copy shown *on top of the image* (e.g. "The staff terminal · in the school's main office"). A caption reading `fleetbot-terminal.jpg` shipped once and looked unfinished.

**On-disk gating (applies to `carousel` and `logo`):** both call **`publicAssetExists()` / `missingPublicAssets()` from `src/data/publicAssets.js`** at build time and fall back to a labelled stripe placeholder that names the exact files it wants. Never a broken `<img>`, and the real asset lights up on the next reload with no code change. Reuse this pattern — **and specifically that helper** — for any future not-yet-supplied asset. Do **not** hand-roll the path from `import.meta.url`; that is what silently deleted every carousel photo once (see Gotchas).

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

### 7. The case studies: one markdown source, two different outputs

The four long-form case studies live at `src/content/case-studies/*.md` **inside
the repo**. They used to be read from an absolute path in the owner's Downloads
folder, which meant `npm run make:pdfs` only ran on one machine and the text
could never take part in a clean checkout or a Vercel build. Don't move them
back out. The `*_f.md` originals in Downloads are the upstream drafts; the repo
copies are what ships.

Each one now produces **two** outputs from that single source, both routed
through `src/data/caseStudies.js`:

| Output | Built by | Edit layers applied |
|---|---|---|
| `/case-study/<slug>` (HTML, indexable) | `src/pages/case-study/[slug].astro` | `factFixes` **+** `siteEdits` |
| `/pdf/<slug>-case-study.pdf` (the full record) | `scripts/make-pdfs.mjs` | `factFixes` only |

- **`factFixes`** are corrections applied to *both*: places where the markdown
  contradicted a locked fact. A reader of the PDF and a reader of the site must
  never be told two different numbers. (Current ones: the Summit's role line
  credited only "Lead Organizer" against the site's Co-Founder & Lead
  Organizer; the club's Results said 12 members and its Solution said ~15
  meetings, against the locked 20 and ~13.)
- **`siteEdits`** apply to the HTML page **only**, and exist to enforce the
  locked no-negatives rule (see Content rules). The setbacks, the accuracy
  split, the usage-decline curve and the competition result are real and stay in
  the downloadable PDF — the page is the summary, the PDF is unabridged. Every
  entry is written out in the file with a comment naming the rule it serves;
  nothing is stripped silently.

**Both rule types are matched by PARAGRAPH PREFIX, and an unmatched rule is a
build ERROR** (`assertAllApplied`). This matters: the source is full of em
dashes, curly quotes and `→` arrows, so exact full-string matching silently
stops working after an innocent edit — and a silently-skipped `siteEdit` would
republish a passage the owner had decided to keep off the site. Keep prefixes
short and ASCII-only. If you edit a case study's markdown and the build fails
with "siteEdits never matched", fix the prefix; do not delete the rule.

**Adding a case study:** drop the markdown in `src/content/case-studies/`, add an
entry to `caseStudies.js` (`slug`, `project`, `file`, `pdf`, `title`, `blurb`,
`published`, `updated`), and that's it — the route, the sitemap entry, the card
on the project page and the PDF all derive from it.

## Schema / structured data

All of it lives in `src/data/site.js`. Every page emits **one** `@graph` block
(via `graph(...)`), not several loose `<script>` tags, so nodes can reference
each other by `@id` and a parser sees one consistent entity model:

- Always in the graph: `personJsonLd`, `websiteJsonLd`, `schoolJsonLd`.
- Project pages add a typed entity via `projectEntityJsonLd(proj)` —
  **SoftwareApplication** for FleetBot, **Event** for the Summit,
  **Organization** for the club — plus `Article` and `BreadcrumbList`.
- Case-study pages emit that *same* entity node again (same `@id`) and point
  `Article.about` at it.

Three rules that are easy to break:

1. **`sameAs` only ever gets REAL, live profiles, and only for the SAME
   entity.** It is the single strongest entity-resolution signal on the site —
   it's how Google ties this domain to off-site profiles that corroborate it.
   `Person.sameAs` is LinkedIn (`/in/f-aamir-ali`) then Instagram, built via
   `.filter(Boolean)` so an unset constant is dropped rather than shipped as a
   dead URL (same reasoning as the omitted `Person.image` — a knowingly-dead
   schema URL costs trust). **Never put a related-but-different entity's URL on
   the Person**: the school's district page lives on `schoolJsonLd.sameAs`, the
   summit's own site on the `Event`, the club's Instagram on the club
   `Organization`. `sameAs` asserts identity, so mixing entities is the fastest
   way to make a knowledge graph distrust the whole file. Reciprocity is what
   converts these from claims into verification — each profile's own website
   field should point back at `faamirali.com`.
2. **Cross-page `@id` references must also be *defined* on the page that uses
   them.** A bare `{'@id': ...}` pointing at a node declared only on another page
   is legal JSON-LD (an `@id` is a global URI) but a consumer parsing that page
   alone sees an untyped dangling pointer. Emit the node, don't just reference it.
3. **`datePublished` / `dateModified` are required on every Article.** An
   undated page is treated as undated, not as fresh. They come from
   `published` / `updated` in `projects.js` and `caseStudies.js` — update
   `updated` when you meaningfully change a page's content.

See `INDEXING.md` for the search/AI-visibility runbook that sits on top of this.

## Content rules (voice, honesty, locked decisions)

- **First person** in all visible copy ("I built…"). **Third person only** in `CANONICAL_DESCRIPTION` (`src/data/site.js`), the JSON-LD schema, and `llms.txt` (including the `/about` "On the record" lead, which IS the canonical string, byte-for-byte).
- **Byte-identical canonical description** — `CANONICAL_DESCRIPTION` in `site.js`, the `description` in `personJsonLd`, the top blockquote in `public/llms.txt`, and the "On the record" block on `/about` must all be the exact same string. If you edit one, edit all four. This sameness is deliberate — it's what makes AI systems converge on one accurate description instead of paraphrasing differently in different places. Verify after any edit: `schemaDesc === llmsTxtLine === aboutPageText`.
- **The Surrey Youth AI Summit is "co-founded", and the owner is its Lead Organizer.** ⚠️ **This title has flipped twice** — the site originally said "planned and executed" and explicitly banned "co-founded"; the owner overrode that to "co-founded ... and leads it as CEO"; the owner then overrode *that* to drop CEO in favour of Lead Organizer, while explicitly keeping "co-founded". If you're touching this copy, use **Co-Founder & Lead Organizer** and don't reintroduce CEO. Every occurrence has been migrated (`projects.js` intro + `fileLine` + `cardLine` + `seoDescription`, `site.js` canonical, `llms.txt` ×3, `/about`, `caseStudies.js`'s Summit `factFixes`). Yuvraj **Bains** from Panorama Ridge is the co-founder and must stay credited — don't erase him. **Blend the phrasing into the sentence** rather than dropping the words in: third-person surfaces read "he co-founded … and leads it as its Lead Organizer", first-person reads "I co-founded … and I'm the Lead Organizer of the entire summit". The summit is still stated **confidently** as "the first youth AI summit in Surrey" — no hedge. Never inflate to "first ever AI summit" unqualified; it is the first *youth* summit *in Surrey*.
- **⚠️ Exception — verbatim quoted documents are exempt from the site's own voice rules.** The recommendation letter on `/honours` is a direct, word-for-word reproduction of a third party's signed letter. It keeps her exact wording — including "co-founder and lead organizer," which now happens to agree with the site's own phrasing but must be left alone regardless of which way the site's voice swings. **Never edit the text of a quoted document to match site style** — that would misrepresent what was actually written and signed. If you ever need to transcribe another quoted document (an award letter, a certificate, etc.), the same rule applies: reproduce it exactly, don't launder someone else's words through the site's voice guide.
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
| `ledger` | array | yes | `{ n, l, src?, group? }[]` — **order matters, most impressive first** (`ledger[0]` IS the home card's headline stat; the first entry *within each group* becomes that group's lead bento tile) |
| `media` / `media2` | object or null | no | `{ label, sub, video, ratio, corner?, src?, alt?, group? }` — `ratio` is the asset's **measured** aspect (see §2d); `label`/`sub` are human captions, **never filenames**; omit `src`/`alt` for a not-yet-dropped-in placeholder; `video:true` needs `corner:'REC'` styling convention |
| `live` | object or null | no | `{ label, note, href, group? }` — empty `href` renders a dark "· coming soon" placeholder tile; `null` omits the tile entirely (FleetBot has no live link) |
| `pdfs` | array | yes | `{ label, href, group? }[]` — can have more than one (FleetBot links two separate PDFs) |
| `quote` | object or null | no | `{ text, attr }` — a pull-quote tile; always spans the full bento row |
| `note` | object or null | no | `{ eyebrow, big, sub }` — a wide highlight tile |
| `logo` | object or null | no | `{ src, alt }` — wordmark in the **top-right of the title block** (rendered by `work/[slug].astro`, not `ProofGrid`), filling the empty column beside the H1/tagline. Gets `border-radius: var(--r)` so a hard-edged PNG matches every other surface. Rendered **only if the file exists on disk** (build-time `fs` check), so a not-yet-added asset never becomes a broken image |
| `carousel` | object or null | no | `{ id, label, sub, group?, slides: [{ src, alt }], aspect? }` — a click-through multi-slide post (see §7). Same on-disk gating as `logo`; falls back to a labelled placeholder listing the filenames it wants |
| `proofGroups` | array or null | no | `{ key, label, kicker?, tone? }[]` — opts the project into **grouped proof mode** (see §2b). Any `ledger`/`pdfs`/`media`/`carousel`/`live` entry tagged with a matching `group` renders inside that group; untagged items fall to a final unlabelled bento. `tone` is `'light'` or `'wash'` — a tint of the single accent, never a second hue |

## Assets

Real photos/video live in `public/img/` and `public/video/`, referenced by `src` in the `media`/`media2` fields above. When dropping in a new real asset:
1. **Resize + compress first** — use `sharp` (already a devDependency): `.rotate()` (respects EXIF orientation from phone photos) `.resize({ width: 1600–1800, withoutEnlargement: true }) .jpeg({ quality: 82, mozjpeg: true })`. Real source photos from a phone are often 3000–5700px wide and 2–4MB; compressed output should land around 150–300KB.
2. **Write specific, factual alt text** — what the image proves, not a generic label (e.g. "FleetBot running on a dedicated computer in the school's main office, April 2026", not "photo of computer").
3. Video: MP4/H.264 is fine as-is if already reasonably encoded — no forced re-encode needed if the source is already an MP4 (this project's FleetBot demo video came in already as a compressed MP4, not a `.MOV`, so no conversion step was needed — check the actual file before assuming a conversion step is required).
4. `Placeholder.astro` is the pure-CSS fallback (diagonal stripe pattern + mono label) for anything not yet dropped in — never leave a broken `<img>` reference; always gate on whether the data has a `src` (see ProofGrid's `isPhoto`/`isVideo` pattern).

**Reading a PDF that turns out to be a scanned/signed document:** `pdf-parse` (or any text-layer extractor) returns empty text for a scanned/signed PDF — there's no text layer to extract. Don't conclude the file is empty or corrupt. Render it to an image instead and transcribe visually: this project used Windows' built-in `Windows.Data.Pdf.PdfDocument` WinRT API via PowerShell (no extra install needed on Windows) to rasterize the page to a PNG, then read that PNG. Playwright/Chromium's native PDF viewer does *not* reliably screenshot local `file://` PDFs in headless mode (it tries to download the file instead) — don't waste time on that path.

**Fonts that aren't on Google Fonts (e.g. a Canva-exclusive font like "Frekoda"):** never attempt to download or source a non-Google, possibly-licensed font from the internet on the owner's behalf — that's a licensing risk. If asked to use one, search the local filesystem first (the owner may have it downloaded already); if it genuinely isn't present anywhere, say so plainly and ask the owner to supply the actual font file to self-host via `@font-face`. Don't silently substitute a different font under the requested name.

## Discovery / AI-visibility layer

Lives partly as static files in `public/` (`robots.txt` allow-lists AI crawlers; `llms.txt`; `sitemap.xml`; an IndexNow key file) and partly as JSON-LD emitted per-page by `Seo.astro`. `sameAs` carries only real, live profiles — never invent one, and never add an unverified URL. After **any** copy change on any page, or after adding a page: re-run `npm run make:og` (OG cards render text, so stale copy = stale share cards) and re-verify `dist/` with a grep sweep for the old text plus a route-count check.

**Whenever a new page is added, update all of these in lockstep** (this is the full checklist, don't do a partial job):
1. `src/components/Header.astro` — nav link (and dropdown link if it's a project)
2. `src/pages/404.astro` — add it to the `nf-links` list
3. `src/pages/sitemap.xml.js` — standalone pages need one line in the `entries` array (projects and case studies appear automatically, see below)
4. `public/llms.txt` — new bullet under `## Pages`
5. `scripts/make-og.mjs` — new entry in the `pages` array, then run `npm run make:og`
6. This file's route count (`npm run build` output and the two mentions of "11 routes" above)

`public/sitemap.xml` no longer exists — the sitemap is **generated** by
`src/pages/sitemap.xml.js` from `projects.js` + `caseStudies.js`, so a new
project or case study appears in it automatically (and its `lastmod` comes from
that entry's real `updated` date, not from whenever someone last remembered to
touch a static file). A brand-new *standalone* page still needs one line added
to that endpoint's `entries` array.

## Analytics

**Google Analytics 4** (`gtag.js`), not Vercel Analytics — Vercel's Hobby-tier
analytics only retains 3 months of data, useless for a site whose whole point
is a long-term record. GA4's ID lives in `src/data/site.js`
(`GA_MEASUREMENT_ID`), the tag itself is inlined at the top of `<head>` in
`Base.astro`, and it's gated on `import.meta.env.PROD` so local `astro dev` /
`astro preview` browsing never inflates real numbers — only an actual Vercel
production build fires it. It's a fire-and-forget beacon script that renders
no page content, so it doesn't touch the static-HTML/AI-crawler guarantee
above; it's still counted in the "client JS on this site" inventory for
completeness, not because it's a risk to that guarantee.

**Google Search Console** is verified as a **Domain property**
(`faamirali.com`), which covers every subdomain and protocol automatically —
`www.faamirali.com` included. The apex-vs-`www` redirect direction (see
`vercel.json` / Vercel's Domains settings) has no effect on Search Console
coverage; don't re-verify a second property if that redirect direction ever
changes.

## Security / cleanup already done — don't reintroduce

- `npm audit` must show 0 vulnerabilities. The `astro` range is `^7.0.6` but the **installed version must be ≥ 7.1.x**: 7.0.6 itself is affected by GHSA-4g3v-8h47-v7g6 (reflected XSS via unescaped View Transition animation properties), which is a live concern here because the site uses `ClientRouter`. `npm audit fix` resolves it, along with a postcss path-traversal and an svgo script-stripping advisory. Re-run `npm audit` before any deploy — a fresh `npm install` against the old lockfile can reintroduce these.
- No secrets/API keys anywhere in the repo (there's nothing that needs one — this is a fully static site with no backend calls).
- `src/components/DevEditor.astro` (a dev-only in-browser typography editor built earlier in this project's history) has been **deleted**, along with its two references in `Base.astro`. Astro's built-in dev toolbar is **disabled** (`devToolbar: { enabled: false }` in `astro.config.mjs`). Do not re-add either of these — the owner explicitly asked for all dev-tool popups gone.
- The `--font-nav` / Berthold Akzidenz-Grotesk BE variable that once existed in `Header.astro` (an unlicensed commercial font, never actually loaded) has been removed. Don't reintroduce a reference to a font that isn't actually self-hosted or loaded via Google Fonts.

## Gotchas learned the hard way (read before you debug something "weird")

- **Divider/rule misalignment across sibling cards** → almost always a variable-height text block above the divider. Fix with `min-height: calc(<line-height>em * <max-lines>)` on every such block (§1 above). This is the #1 thing to check before adding any new card/row component with a shared divider.
- **A bento/grid with visible gaps or awkwardly-tall empty tiles** → check that every tile's `grid-row: span N` is a clean multiple of the base row unit, and that `grid-auto-flow: row dense` hasn't been accidentally removed. Then check the **column count vs. tile count** — too many columns for too few tiles is unfixable by `dense` (§2b). **Measure, don't eyeball:** derive each tile's grid cell from geometry (`col = round(x / (colWidth + gap))`, `rowSpan = round((height + gap) / 92)`), mark an occupancy map, and count empty cells. Eyeballing a screenshot hid a 35%-empty grid here; a naive "sum of tile widths per row" check gave false positives too, because multi-row tiles only appear in their starting row band.
- **A stray `---` rendering as text at the top-left of every page** → an `.astro` file whose frontmatter fence was opened but never closed. `Header.astro` had a lone `---` on line 1 with no closing fence and no script, so Astro emitted it as literal body content sitewide. A component with no frontmatter needs **no fence at all**. Check with `node -e` on `dist/index.html` for what directly follows `<body>`.
- **The nav (or any centred element) sitting slightly off-centre in a padded container** → a `1fr auto 1fr` grid centres its middle track within the **content box**, so uneven left/right padding offsets it by half the difference. The header had `padding: 0 8px 0 22px` and the nav sat 7px left of the pill's visual centre. Keep the container padding symmetric and carry any asymmetric inset on the child instead.
- **New page's content hugging the left edge with dead space on the right** → it's sitting directly in the full-width `.wrap` and needs its own `max-width + margin:0 auto` inner wrapper (§5 above).
- **A flex row squeezing two children onto one line instead of stacking on mobile, even though a `@media` rule exists for it** → `flex-wrap: wrap` only wraps when the content doesn't fit; if it *does* fit at a given width (common with two short elements), it won't stack, and it'll look cramped/broken at exactly that width. Force it explicitly with `flex-direction: column` in the media query rather than relying on wrap. (This exact bug shipped in the footer's CTA row and had to be fixed.)
- **Astro's `ClientRouter` breaks in-page hash-anchor scrolling.** Never rely on a bare `href="#id"` for same-page navigation if the target is meant to be reachable from other pages too (like the footer's `#contact`, which is present on every page via the layout) — write a manual `scrollIntoView` handler (see §4 above).
- **A stale "X is not defined" error in the dev server after a big edit** → restart the dev server fully (stop + start), don't debug code that's actually fine. Vite's HMR can serve a cached compiled module from a botched intermediate write.
- **⚠️ The same staleness also hits SCOPED CSS, and that version is far more convincing — it looks like a real layout bug rather than an obvious error.** A long dev session that edited one component's `<style>` several times left the dev server serving **two** copies of the same scoped rule: the current one, and a superseded one from several commits earlier. Both carry the *same* `data-astro-cid-*` hash, so both match the element and the cascade order decides — and that order differed between a `ClientRouter` client-side navigation and a full reload. The symptom was the `/about` headshot rendering small on first click and big after a refresh, which reads exactly like a view-transition bug. It was neither: the built output was correct the whole time.
  **Diagnose it in this order, before touching any code:**
  1. Check the **built** CSS, not the dev server: `npm run build`, then grep `dist/` for the selector. One rule per breakpoint = your code is fine.
  2. Confirm against the real thing: `npx astro preview --port 4399` and test the same click path. `dist/` is what ships; the dev server is not.
  3. Count the live rules in the browser — walk `document.styleSheets`, recursing into `rule.media`, and list every rule matching the selector. **Two base rules with the same scope hash is the tell.**
  4. Fix: stop the dev server (`npx astro dev stop`), `rm -rf node_modules/.vite`, start it again. Editing the component will NOT clear it.

  Note that after a clean restart you may still see the same rule listed twice on a client-side navigation — that is normal (the swapped-in inline `<style>` plus Vite's HMR copy) and harmless because the two are **identical**. Duplicates only matter when their contents *differ*.
- **`preview_screenshot` at a custom (non-preset) viewport size can render inaccurately** in this tool's automation — if a screenshot looks wrong after a resize but the change should be simple CSS, verify with real layout math (`getBoundingClientRect()`, `getComputedStyle()`, `scrollWidth - clientWidth` for overflow) before concluding there's a real bug. Trust computed layout over a screenshot pixel-count when they disagree.
- **⚠️ CSS transitions do NOT advance while the browser pane is hidden, and this WILL fake a bug.** If the pane isn't displayed, `document.visibilityState === 'hidden'` and the compositor never ticks, so any transitioned property (`transform`, `opacity`, colour) stays frozen at its **start** value forever. `getComputedStyle` keeps reporting the pre-transition value even after a forced reflow and even after re-parsing the stylesheet. This cost real time here: the pure-CSS carousel looked completely broken (radio flipped correctly, selector verified matching via `.matches()`, specificity correct — yet `transform` never left identity) purely because the pane was hidden. **Before concluding a transitioned property is broken:** (1) check `document.visibilityState`; (2) check `el.getAnimations().length` — a stuck pending transition is the tell; (3) neutralise it by injecting `*{transition:none!important}` (or `el.style.transition='none'` + `getAnimations().forEach(a=>a.finish())`), then re-measure the committed end state. Also note reading a value in the **same** JS call as the click always returns frame 0 — put the click and the read in separate tool calls, or kill transitions first.
- **A scanned/signed PDF has no extractable text layer** — see the Assets section above for the correct way to read one (rasterize + read visually, don't assume `pdf-parse` returning empty means the file is broken).
- **⚠️ NEVER build a filesystem path from `import.meta.url` in an `.astro` file.** This is the single most dangerous pattern in this codebase and it has bitten twice, in two different ways. At render time the component has been bundled into `dist/.prerender/chunks/`, so a relative hop resolves against the *output* tree, not `src/`.
  - **Loud version:** `fs.readFileSync(new URL('../../content/...', import.meta.url))` fails the build outright with `ENOENT .../dist/content/...`. Annoying but obvious. Fix: inline the contents with Vite's `import.meta.glob('../../content/**/*.md', { query: '?raw', import: 'default', eager: true })`.
  - **Silent version — much worse:** the same broken path inside an `fs.existsSync` *asset gate*. `Carousel.astro` and the logo check used `new URL('../../public/', import.meta.url)`, which resolved correctly from the Astro 7.0 bundle depth and then stopped resolving after a routine upgrade to 7.1. Because a missing file legitimately means "the owner hasn't supplied this asset yet," every gate fell back to a labelled placeholder: **all 24 carousel photos and the FleetBot logo disappeared from the built pages, and the build still printed success.** Fix: `src/data/publicAssets.js` resolves `public/` from `process.cwd()` (the project root for both `astro dev` and `astro build`) and **throws** if `public/` isn't there, so "can't find the directory" can never masquerade as "24 missing files." Use `publicAssetExists()` / `missingPublicAssets()` for any new asset gate — never re-derive the path. `npm run verify` asserts the carousels/logo actually rendered, which is what turns this back into a loud failure.
- **You cannot grep the generated PDFs to verify their text.** Playwright embeds *subsetted* fonts, so the text-showing operators contain glyph IDs rather than ASCII — inflating the streams and searching for a phrase returns "not found" for text that is definitely on the page, which reads as a false failure for every single assertion. Verify at the render layer instead (call `renderSource()` and assert on the markdown it returns), which is what actually feeds the PDF.
- **An element can measure as off-centre by exactly the scrollbar width and still be perfectly centred.** `innerWidth` includes the scrollbar; `documentElement.clientWidth` doesn't. Comparing `rect.left` against `innerWidth - rect.right` reported a 15px asymmetry on a correctly-centred column. Always measure the right-hand gap against `clientWidth`.

## Where things stand

Structure, copy (rewritten from the case studies), the design system described above, the discovery layer, security headers, 404, the case-study PDFs, and the `/honours` page (recommendation letter typed in full, `public/pdf/recommendation-letter.pdf`) are all done. The FleetBot terminal photo, the Surrey Summit group photo, the AI Club photo, and the FleetBot demo video are all real assets wired into `public/img/`/`public/video/` and referenced from `projects.js` — only the homepage/About headshot is still a placeholder (`aamir.jpg` doesn't exist yet; `Person.image` in the schema is intentionally omitted until it does). Dev tools (DevEditor, Astro dev toolbar) are fully removed.

**Asset note:** the FleetBot post slides are `1.png`–`5.png` and the Summit recap photos are `2.jpg`–`20.jpg`, so `2`–`5` exist in both sets — **the extensions are what keep them apart, don't rename either set.** The Summit photos arrived as raw camera files (57.4 MB total, up to 8064px and 8.5 MB each) and were compressed to 4.3 MB per the Assets rules; originals are kept untracked in `website assets/summit-raw/`. **Always check the weight of dropped-in photos** — the carousel puts all 19 in the DOM, so raw uploads would have shipped ~57 MB on one page.

**Still pending (owner's tasks, not code work):** the real headshot photo; a self-hosted "Frekoda" font file for the header, if the owner still wants it (currently blocked — see Assets section); GSC/Bing/GA4 setup on the live domain once deployed; adding real certificates/scholarships to `/honours` as they're awarded (as a real section when there's real content — not a placeholder now, see §6).

`ASSETS.md` has the exact current asset-by-asset mapping and launch-runbook checklist.
