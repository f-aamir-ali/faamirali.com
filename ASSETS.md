# Drop-in asset checklist

The site ships with **labeled placeholders** (no dead links). Filenames map to the captions you'd see on a placeholder tile.

## Images — DONE (live in `public/img/`)
| Where | Filename | Status |
|---|---|---|
| FleetBot — terminal tile | `fleetbot-terminal.jpg` | ✅ Wired, resized to 1600px wide + compressed (~164KB) |
| Surrey Summit — media tile | `summit-group.jpg` | ✅ Wired, resized to 1800px wide + compressed (~301KB). ⚠️ Contains a group of students — confirm consent for public web covers this exact photo. |
| AI Club — media tile | `club.jpg` | ✅ Wired, resized to 1600px wide + compressed (~280KB) |
| Home hero + About + OG + schema | `aamir.jpg` | ❌ Still needed — a clean real headshot. When it lands: drop into `public/img/aamir.jpg`, swap the `<Placeholder>` in `index.astro`/`about.astro` for an `<img>`, and re-add `image` to the Person schema in `src/data/site.js` (currently omitted so the schema has no dead URL). |
| Surrey Summit — (optional) | `summit-analytics.jpg` | Not wired — Instagram analytics screenshot backing the 22K+ views ledger row, if you want it as an image instead of just the stat. |
| Surrey Summit — (optional) | `summit-transfer.jpg` | Not wired — ⚠️ crop the account details before ever using the $650 transfer screenshot. |

## Video — DONE
| Where | Filename | Status |
|---|---|---|
| FleetBot — screen-recording tile | `public/video/fleetbot-demo.mp4` | ✅ Wired (already a compressed MP4, no MOV conversion needed — ~10MB, native controls, `preload="metadata"`). No poster frame set (shows black until played) — nice-to-have, not blocking. |

## Links — DONE (edited in `src/data/projects.js` + `src/data/site.js`)
| Where | Value | Status |
|---|---|---|
| FleetBot "Try the student demo" | `https://fleetbot.lovable.app` | ✅ Set |
| Summit live-site tile | Visit the event site → `surreyaisummit.vercel.app` | ✅ Set (short label now, not the raw URL — avoids overflow) |
| Footer "Instagram" pill | `https://www.instagram.com/f.aamir.ali/` (personal) | ✅ Set — separate from the Club's own Instagram link on the AI Club project page (`fpss_ai.club`, unchanged) |
| Club page "Club Instagram" | `instagram.com/fpss_ai.club` | Already set — still worth putting faamirali.com in the club bio (backlink bootstrap) |
| Summit site | (their side) | Add a "Built by F. Aamir Ali → faamirali.com" footer link ON that Vercel site (backlink bootstrap) |

## Footer / identity (edit `src/data/site.js`)
| Item | Status | Action |
|---|---|---|
| LinkedIn | renders **nothing** while empty (no disabled pill) | Set `LINKEDIN` to the profile URL → the footer link appears; also add it to schema `sameAs`. |
| Email | `fatehaamirali@gmail.com` | Confirm it's the inbox you want public. Plain `mailto:` will attract some scraper spam — a dedicated public alias is the cheap later upgrade. |

## PDFs (regenerate with `npm run make:pdfs` after editing the source case studies)
Four PDFs from the NEW `*_f.md` case studies: `fleetbot-student-`, `fleetbot-staff-`, `surrey-ai-summit-`, `ai-club-case-study.pdf`. Substance is not rewritten (privacy scrub + club count 12→20 only) — they intentionally carry more detail than the site copy (e.g. "co-founder", the honest lessons), since the PDFs are the long-form record.

## Content flagged for your confirmation
- **Model strings** in the case studies (GPT-5 Mini/Nano, Gemini 2.5 Flash, GPT-4o Mini) — verify exact provider names.
- **Club case study internal inconsistencies** (in your source file, worth fixing there): top bullet says **20** members but Results says **12**; headline says **~13** meetings but The Solution says **~15**. Site + PDF use 20 / ~13.
- **Exact Summit headcount** — replace `~70` in `projects.js` + the source case study if you get the real number.
- **Summit group photo consent** — the photo is now live on the site; if any student in it hasn't confirmed they're OK with public web use, swap it back to the placeholder.

## Launch runbook (after the headshot lands — needs the live domain)
1. Deploy → confirm faamirali.com serves over HTTPS with the `vercel.json` security headers.
2. Google Search Console: verify → submit `sitemap.xml` → request indexing.
3. Bing Webmaster Tools: import from GSC → submit sitemap → enable IndexNow (key file already at site root: `public/d07e1d09c51ac598aefa66e2f051e40a.txt`) → watch the AI Performance dashboard.
4. GA4 + GTM: events for project clicks, PDF opens, demo clicks, mailto; saved exploration for AI referrers (chatgpt.com / perplexity.ai / claude.ai / gemini.google.com). IP anonymization on.
5. LinkedIn Post Inspector + Meta Sharing Debugger on all 5 URLs; Rich Results Test on `/` and `/about`.
6. Real-phone pass (LCP, 375px) + send a real test email.

## Nice-to-have later (not blocking)
- A poster frame for the FleetBot demo video (currently shows black until played).
- Self-host subset `woff2` fonts instead of the Google Fonts CDN link (in `src/layouts/Base.astro`) for best LCP/privacy.
- Swap the text-only OG cards (`public/og/*.png`, regenerate via `npm run make:og`) for photo-based ones.
- Delete `src/components/DevEditor.astro` + its two references in `Base.astro` once typography is locked.
