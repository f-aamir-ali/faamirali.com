# faamirali.com

The personal site & long-term hub of **F. Aamir Ali** — builder & founder. Fast, static, multi-page, and readable by AI crawlers (all content is server-rendered into the HTML, no client-side rendering).

Built with **Astro** (static output). Design: light editorial — warm cream canvas, `Instrument Serif` italic accents, `IBM Plex Mono` labels, a red `#d9402a` accent, a frosted floating-pill header, and a dark "terminal" footer.

## Run it
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/  (static, deploy this)
npm run preview    # preview the built dist/
```

## Regenerate assets
```bash
npm run make:og     # branded 1200x630 OG images → public/og/
npm run make:pdfs   # filtered case-study PDFs → public/pdf/  (uses Playwright/Chromium)
```

## Structure
```
src/
  layouts/Base.astro        # html shell, <head> (fonts + SEO), header, footer
  components/
    Header.astro            # sticky frosted-pill nav (firms up on scroll)
    Footer.astro            # dark terminal footer + status dot + contact
    Seo.astro               # title/meta/canonical/OG/Twitter/JSON-LD
    ProjectRow.astro        # home "selected work" row
    ProofGrid.astro         # project-page bento proof grid
    Placeholder.astro       # labeled photo/video placeholder tile
  data/
    site.js                 # identity, contact, canonical description, JSON-LD
    projects.js             # the 3 projects (single source of truth) — EDIT CONTENT HERE
  pages/
    index.astro             # home
    about.astro             # full bio (canonical description lives here)
    work/[slug].astro       # the project-page template (3 pages)
public/
  robots.txt llms.txt sitemap.xml favicon.svg
  og/  pdf/  (generated)    img/ video/ (drop-in assets — see ASSETS.md)
scripts/  make-og.mjs  make-pdfs.mjs
```

## Content rules baked in
- **Only already-completed work** — no `/now` page, no "what's next" / succession / "do it again" copy.
- Honesty: "first" claims are attributed (principal) or caveated ("as far as I could find"); FleetBot credit notes a friend coded the staff front-end + API; the Best Buy challenge says it didn't win; club count is **20** everywhere.
- Voice avoids the banned words (aspiring, passionate, leverage, revolutionary, …).

## Deploy
`npm run build`, then host `dist/` on Vercel / Netlify / Cloudflare Pages (HTTPS automatic). Point **faamirali.com** at it. After launch: verify in Google Search Console + submit `sitemap.xml`, add GA4 (with an AI-referrer view), and run each URL through the LinkedIn Post Inspector + Meta Sharing Debugger.

See **ASSETS.md** for the drop-in checklist (headshot, photos, video, demo link, LinkedIn).

## Notes
- Fonts load via the Google Fonts CDN (matches the design source). Self-hosting subset `woff2` is a later perf/privacy tweak.
- A `postcss.config.cjs` (empty) isolates this project's CSS from the parent directory's Tailwind config.
