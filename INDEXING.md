# Search & AI-visibility runbook

The goal of this site is reach and recognition: when someone searches
**"F. Aamir Ali"**, or asks an AI **"who is Aamir Ali from Surrey"**, the answer
should come from here and should be accurate.

This file is the plan for getting there. It's ordered by leverage, not by
difficulty. Read the "One hard truth" section first, because it changes where
you should spend your time.

---

## One hard truth about AI Overviews

Google's own documentation is blunt about this:

> There are no additional requirements to appear in AI Overviews or AI Mode, nor
> other special optimizations necessary. There's also no special schema.org
> structured data that you need to add.

There is no secret markup that gets you into AI Overviews or AI Mode. Anyone
selling "AI Overview schema" is selling nothing. What actually decides whether
an AI answer is *about you and correct* is:

1. **Are you indexed at all** (nothing else matters until this is true),
2. **Is it unambiguous which entity you are** — one person, one description, one
   set of facts, corroborated somewhere other than your own website, and
3. **Is the specific claim easy to extract** — a direct sentence with a number
   and a date beats a paragraph of atmosphere.

The site now does #1 and #3 well. **#2 is your bottleneck, and it is not a code
problem.** See "Phase 3", which is the part that actually moves the needle and
the part only you can do.

Also, a correction worth having straight: **Google Analytics has nothing to do
with indexing.** GA4 tells you who visited *after* they found you. **Google
Search Console** is the indexing tool. Set up Search Console first; GA4 is
optional and can wait.

---

## Phase 1 — Before you deploy (30 minutes, do it once)

### 1.1 Pick ONE canonical hostname and force it

Decide now: `https://faamirali.com` (no `www`). The whole site is already built
around that exact string — `site` in `astro.config.mjs`, every canonical tag,
the sitemap, `llms.txt`, and every `@id` in the schema graph.

In Vercel → Domains, add both `faamirali.com` and `www.faamirali.com`, and set
**`www` to redirect to the apex**. If both hostnames serve content, you have
split your own ranking signal in half for no benefit.

### 1.2 Verify the trailing-slash behaviour matches your canonicals

The build emits directories (`/about/index.html`), but every canonical tag says
`/about` with **no** trailing slash. Vercel normally serves the no-slash form
and 308-redirects the slash form, which matches — but **confirm it after the
first deploy** rather than assuming:

```bash
curl -sIL https://faamirali.com/about | grep -iE "^HTTP|^location"
```

You want to end on a single `200`, at `/about`. If you instead see a redirect
*to* `/about/`, set `"trailingSlash": true` in `vercel.json` and change the
canonicals to match. Either choice is fine; a mismatch between them is not.

### 1.3 Confirm nothing is accidentally blocked

```bash
curl -s https://faamirali.com/robots.txt
curl -sI https://faamirali.com/ | grep -i x-robots-tag   # must return nothing
```

`robots.txt` already allows everything and explicitly welcomes GPTBot,
OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended and Applebot-Extended.
An `X-Robots-Tag: noindex` header would silently override all of it — Vercel
adds one to preview deployments, so make sure you're testing production.

---

## Phase 2 — Get indexed (day one, then wait)

### 2.1 Google Search Console — the one that matters

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add a **Domain** property (`faamirali.com`), not a URL-prefix property. Domain
   properties cover every subdomain and both protocols, so you only do this once.
3. Verify with the **DNS TXT record** it gives you. If your domain is on Vercel
   DNS, add it under the domain's DNS settings. Verification can take up to an
   hour to propagate.
4. **Sitemaps** → submit `sitemap.xml`.
5. **URL Inspection** → paste `https://faamirali.com/` → **Request indexing**.

Then use Request Indexing on these four, and then stop:

- `https://faamirali.com/`
- `https://faamirali.com/about`
- `https://faamirali.com/work/fleetbot`
- `https://faamirali.com/honours`

Request Indexing is rate-limited and is a *hint*, not a command. Spending it on
all 11 URLs signals nothing about which pages matter. The sitemap handles the
rest; internal links do the actual work.

**Expect a few days to a couple of weeks for a brand-new domain with no inbound
links.** This is normal and there is no way to buy speed. Do not resubmit daily.

### 2.2 Bing Webmaster Tools — this is how you get into ChatGPT

Don't skip this thinking Bing is irrelevant. **ChatGPT's search leans on a
Bing-backed index**, so Bing coverage is the practical route into ChatGPT
answers.

1. [bing.com/webmasters](https://www.bing.com/webmasters) → add the site.
2. Use **"Import from Google Search Console"** — it carries the verification
   across and takes about a minute.
3. Submit `https://faamirali.com/sitemap.xml`.

### 2.3 IndexNow — already wired, just use it

The key file is already live at
`/d07e1d09c51ac598aefa66e2f051e40a.txt`. After any deploy that changes content,
one request tells Bing (and therefore ChatGPT's index) immediately:

```bash
curl -s "https://api.indexnow.org/indexnow?url=https://faamirali.com/&key=d07e1d09c51ac598aefa66e2f051e40a"
```

For several URLs at once, POST the JSON form:

```bash
curl -s -X POST https://api.indexnow.org/indexnow -H "Content-Type: application/json" -d '{"host":"faamirali.com","key":"d07e1d09c51ac598aefa66e2f051e40a","urlList":["https://faamirali.com/","https://faamirali.com/about","https://faamirali.com/work/fleetbot","https://faamirali.com/work/surrey-ai-summit","https://faamirali.com/work/ai-club","https://faamirali.com/honours","https://faamirali.com/case-study/fleetbot-student","https://faamirali.com/case-study/fleetbot-staff","https://faamirali.com/case-study/surrey-ai-summit","https://faamirali.com/case-study/ai-club"]}'
```

Google does not participate in IndexNow. That's fine — this is for Bing/ChatGPT.

### 2.4 Validate the structured data

Once live, run the two official tools. Both are free and take a minute:

- [Rich Results Test](https://search.google.com/test/rich-results) — run
  `/work/surrey-ai-summit`. It should detect **Event** and **Breadcrumbs**.
- [Schema Markup Validator](https://validator.schema.org/) — run `/` and
  `/case-study/fleetbot-staff`. Expect zero errors. Warnings about optional
  properties are fine and can be ignored.

---

## Phase 3 — The part that actually decides whether this works

Everything above is table stakes. **This is the bottleneck.**

Right now, every fact about you exists in exactly one place: this website. A
search engine has no way to distinguish "a real person with a verifiable record"
from "a website that says impressive things about itself." Entity confidence
comes from **corroboration** — the same facts, about the same person, appearing
somewhere you don't control.

You currently have **zero off-site corroboration and zero inbound links.** That,
not markup, is why an AI might hedge or get you wrong.

In order of leverage:

### 3.1 The LinkedIn — wired up, but only half-done ⚠️

`https://www.linkedin.com/in/f-aamir-ali` is now live in `Person.sameAs` (first
in the array) and in the footer. LinkedIn profiles rank extremely well for
personal-name queries and are the strongest entity anchor available here.

**What's still outstanding is the half that does the actual work.** Right now the
site claims "that profile is me" and nothing corroborates it. Google treats a
one-way `sameAs` as an unverified assertion; a *reciprocal* pair is what it
treats as confirmation. So, on the LinkedIn profile itself:

1. **Put `faamirali.com` in the profile's website field.** This is the single
   step that closes the loop. Without it, the schema edge is doing maybe a third
   of the work it could.
2. **Use wording consistent with the site.** Same titles (Co-Founder & Lead
   Organizer of the summit; founder of the AI & Innovation Club), same project
   names, same numbers (1,500-student school, 150+ queries, ~70 students from 14
   schools, 20 club members). Two sources agreeing is the entire point; a profile
   that says something slightly different weakens both.
3. **Post the case studies there.** LinkedIn posts get indexed and are the
   cheapest inbound links available — each one linking a `/case-study/` URL.

The same reciprocity logic applies to Instagram (link in bio → faamirali.com).

**Other `sameAs` edges now shipping**, each on its own node — never on the
Person, since `sameAs` asserts identity:

| Node | `sameAs` | Why it helps |
|---|---|---|
| `HighSchool` | `surreyschools.ca/fltsec` | The school already exists in Google's index independently. This resolves "his school" to a real third-party-published place instead of a name string. |
| `Event` (Summit) | `surreyaisummit.vercel.app` | Ties the summit record here to the event's own public site. |
| `Organization` (Club) | the club's Instagram | The club's own audience-facing presence. |

The home page and `/about` now also **define** all three project entities inline
(`SoftwareApplication` / `Event` / `Organization`), not just link to them — so a
crawler that reads only `faamirali.com/` gets the complete model: who he is, and
what each of the three things is.

### 3.2 Get the headshot done — it's blocking your Knowledge Panel

`Person.image` is intentionally omitted from the schema because
`public/img/aamir.jpg` doesn't exist, and a schema URL that 404s costs more trust
than a missing property. A Person entity with no image is far less likely to get
a Knowledge Panel card.

When the photo lands: drop it in as `public/img/aamir.jpg`, then re-add
`image: \`${SITE_URL}/img/aamir.jpg\`` to `personJsonLd` and swap the
`<Placeholder>` on the home page and `/about` for a real `<img>`. Also re-run
`npm run make:og`. See `ASSETS.md`.

### 3.3 Chase the third-party mentions you have a real claim to

These are ordered by how likely they are to actually happen:

- **Generation AI** sponsored the Summit and it's a relationship both sides want
  to continue. Ask them to link the Summit — and your name — from their site or
  a recap post. A sponsor's own page describing the event is exactly the kind of
  independent corroboration that's missing.
- **Your school / district.** A newsletter item, a school-website post, or a
  district communications mention about the FleetBot terminal or the Summit.
  School domains carry real authority.
- **Local press.** "Grade 11 student builds AI assistant deployed in his
  1,500-student school, then runs Surrey's first youth AI summit for 70 students
  from 14 schools" is a genuine local-news story. Surrey Now-Leader, Peace Arch
  News, Vancouver Sun education desk. One pitch email, the numbers, the
  principal's letter, and a link.
- **The Summit site.** `surreyaisummit.vercel.app` is a site you control that
  isn't this domain. It should link to `faamirali.com` and name you as
  co-founder and Lead Organizer. Free, immediate, and it corroborates the
  single claim most worth corroborating.
- **UBC / Dr. Ostafichuk**, if there's any keynote recap or Generation AI writeup
  that could name the event and its organizers.

One good school or news link is worth more than any amount of further markup
work on this repo.

---

## Phase 4 — Ongoing

### Every time you change content

1. `npm run build` — must finish with **11 routes** and zero errors.
2. `npm run make:og` — the OG cards render text, so stale copy means stale
   share images.
3. Bump the `updated` date on any project or case study whose content actually
   changed (`src/data/projects.js`, `src/data/caseStudies.js`). It feeds
   `dateModified` and the sitemap's `lastmod`.
4. Deploy, then fire the IndexNow request from §2.3.

### What to watch in Search Console (weekly at first, then monthly)

- **Pages** report: "Indexed" should reach 10 pages (everything except the 404).
  If a page sits in *Discovered – currently not indexed*, it means Google found
  it and judged it not worth crawling yet — that's a signal about site authority,
  which Phase 3 fixes, not something to fix with markup.
- **Performance** → filter queries containing `aamir`. This is the report that
  tells you whether the name query is actually yours yet.
- **Enhancements**: Breadcrumbs, and Events on the Summit page.

### Don't bother with

- **`llms.txt`.** It's in `public/` and it's accurate, so leave it. But be
  realistic: an Ahrefs study of 137,000 sites found **97% of `llms.txt` files got
  zero AI-crawler requests**, and no major provider — Google, OpenAI, Anthropic —
  has committed to reading it. Google has stated it does not use it for
  crawling, indexing or ranking. It costs nothing and may help agent tooling.
  It is not a strategy.
- **Paid "AI SEO" / "GEO" tools and indexing services.** For a 10-page personal
  site with no backlinks, they solve nothing that Phase 3 doesn't.
- **Submitting to search-engine "submit URL" directories.** Obsolete.

---

## Recommended next content move (your call — needs your voice)

The single most citation-friendly structure for AI answers is a **direct
question with a direct answer in the first sentence**, backed by
`FAQPage` schema. The site has no page that answers *"Who is F. Aamir Ali?"* as
a literal question-and-answer.

That's a real gap for AI-Mode-style queries — but it's visible copy on your
`/about` page, so it's your decision and your voice, not mine to add unasked.
If you want it, the shape is: 4–5 Q&As on `/about`, each answer 40–80 words,
leading with the fact and the number.

The questions worth answering, in priority order:

1. Who is F. Aamir Ali?
2. What is FleetBot?
3. What is the Surrey Youth AI Summit?
4. What is the AI & Innovation Club?
5. What has F. Aamir Ali built?

Say the word and I'll draft it in your voice and wire up the `FAQPage` node
(`site.js` already has the `graph()` helper it would slot into).

---

## Reference: current technical state

| Item | State |
|---|---|
| Static HTML, zero client-side text rendering | Yes — required, since OpenAI's crawlers don't run JS |
| Indexable pages | 10 (+ 404) |
| Case studies as crawlable HTML | Yes — 4 pages, ~4,600 words total, previously PDF-only |
| Sitemap | Generated at build; 15 URLs including the 5 PDFs |
| `robots.txt` | Allows all, AI crawlers named explicitly |
| Canonical tags | Every page, absolute URLs |
| One `@graph` per page | Person, WebSite, HighSchool + page-specific nodes |
| Typed project entities | SoftwareApplication, Event, Organization |
| Breadcrumbs | Project + case-study pages |
| `datePublished` / `dateModified` | Every Article |
| `Person.sameAs` | LinkedIn + Instagram — **reciprocal back-links still needed** (§3.1) |
| Other `sameAs` edges | School → district page; Event → summit site; Club → its Instagram |
| `Person.image` | **Omitted — headshot missing** (§3.2) |
| Titles ≤ 62 chars, descriptions ≤ 165 | Yes, all pages |
| Inbound links / off-site corroboration | **None — this is the bottleneck** (Phase 3) |
| Security headers (HSTS, nosniff, referrer, frame-ancestors) | Set in `vercel.json` |
