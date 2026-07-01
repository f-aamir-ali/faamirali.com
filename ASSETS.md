# Drop-in asset checklist

The site ships with **labeled placeholders** (no dead links). Replace each below to go fully live. Filenames map to the captions you see on the placeholder tiles.

## Images (drop into `public/img/`, then swap the placeholder tile for an `<img>`)
| Where | Filename | Notes / honesty flag |
|---|---|---|
| Home hero + About + OG + schema | `aamir.jpg` | A clean real headshot. Schema (`src/data/site.js`) and OG already point at `/img/aamir.jpg`. |
| FleetBot — terminal tile | `fleetbot-terminal.jpg` | Photo of the mini-PC in the main office (proves real deployment). |
| Surrey Summit — media tile | `summit-group.jpg` | ⚠️ Contains minors — confirm consent for public web, or blur/crop faces first. |
| Surrey Summit — (optional) | `summit-analytics.jpg` | Instagram analytics screenshot, if you want to show it as an image. |
| Surrey Summit — (optional) | `summit-transfer.jpg` | ⚠️ Crop the account details before using the $650 transfer screenshot. |
| AI Club — media tile | `club.jpg` | Club photo (you chose **20 members** site-wide — keep it consistent). |

> To wire an image: in the relevant file (`src/components/ProofGrid.astro` or `src/components/Placeholder.astro` usage), replace the placeholder `<div>`/`<Placeholder>` with `<img src="/img/<name>.jpg" alt="…" width=… height=… loading="lazy">`.

## Video
| Where | Filename | Action |
|---|---|---|
| FleetBot — screen-recording tile | `public/video/fleetbot-demo.mp4` + poster | Convert your `.MOV` → compressed 720p MP4 (H.264). Then swap the placeholder for a `<video preload="none" poster=… controls>` (lazy). |

## Links (edit `src/data/projects.js`)
| Where | Field | Action |
|---|---|---|
| FleetBot "Try the student demo" | `live.href` (currently `''` → shows "drop in") | Paste the live student-bot URL. |
| Summit "See the event site" | already set → `surreyaisummit.vercel.app` | Confirm it's the final URL. |
| Club "Club Instagram" | already set → `instagram.com/fpss_ai.club` | Confirm. |

## Footer / identity (edit `src/data/site.js`)
| Item | Status | Action |
|---|---|---|
| LinkedIn | placeholder pill ("coming soon") | Set `LINKEDIN` to the profile URL → it becomes a real link, and add it to schema `sameAs`. |
| Email | `fatehaamirali@gmail.com` | Confirm it's the inbox you want public. |

## Content to confirm before launch
- **Model strings** in the FleetBot copy/PDFs (GPT-5 Mini/Nano, Gemini 2.5 Flash, GPT-4o Mini) — verify exact provider names.
- **Exact Summit headcount** — replace `~70` in `projects.js` + PDFs if you get the real number from the group photo.
- The case-study **PDFs were lightly filtered** (succession / "do it again" / future to-dos removed; club count set to 20). Give them a final read.

## Nice-to-have later (not blocking)
- Self-host subset `woff2` fonts instead of the Google Fonts CDN link (in `src/layouts/Base.astro`) for best LCP/privacy.
- Swap the text-only OG cards (`public/og/*.png`, regenerate via `npm run make:og`) for photo-based ones.
