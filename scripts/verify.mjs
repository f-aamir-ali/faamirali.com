// Pre-deploy verification gate. Run AFTER `npm run build`:
//
//   npm run verify
//
// This project has no test suite, and it has already shipped two classes of
// silent regression that a passing build did not catch:
//
//   1. An Astro minor upgrade changed the bundle depth, which broke a
//      build-time `fs` path, which made every carousel image fall back to a
//      "not supplied yet" placeholder. 24 photos vanished; the build said OK.
//   2. Case-study facts drifted from the site's locked numbers, so a PDF and a
//      page stated different figures for the same thing.
//
// Everything below exists because of a real failure. Exit code is non-zero on
// any FAIL so this can gate a deploy.
import fs from 'node:fs';
import path from 'node:path';
import { projects } from '../src/data/projects.js';
import { caseStudies, renderSource } from '../src/data/caseStudies.js';
import { CANONICAL_DESCRIPTION } from '../src/data/site.js';

const DIST = 'dist';
const fails = [];
const warns = [];
const ok = (m) => console.log('  ok    ' + m);
const fail = (m) => {
  fails.push(m);
  console.log('  FAIL  ' + m);
};
const warn = (m) => {
  warns.push(m);
  console.log('  warn  ' + m);
};
const section = (t) => console.log('\n' + t + '\n' + '-'.repeat(t.length));

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const read = (f) => fs.readFileSync(f, 'utf8');
const pageOf = (f) =>
  f.split(path.sep).join('/').replace(`${DIST}/`, '').replace('/index.html', '') || '/';
const strip = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<');

// ---------------------------------------------------------------- routes
section('Routes');
const EXPECTED_ROUTES = 3 + projects.length + caseStudies.length + 1; // pages + projects + studies + 404
if (htmlFiles.length === EXPECTED_ROUTES) ok(`${htmlFiles.length} routes built`);
else fail(`expected ${EXPECTED_ROUTES} routes, built ${htmlFiles.length}`);

for (const p of projects)
  fs.existsSync(path.join(DIST, 'work', p.slug, 'index.html'))
    ? ok(`/work/${p.slug}`)
    : fail(`missing /work/${p.slug}`);
for (const c of caseStudies)
  fs.existsSync(path.join(DIST, 'case-study', c.slug, 'index.html'))
    ? ok(`/case-study/${c.slug}`)
    : fail(`missing /case-study/${c.slug}`);

// ------------------------------------------------------------ head / meta
section('Titles, descriptions, canonicals, schema');
for (const f of htmlFiles) {
  const h = read(f);
  const page = pageOf(f);
  if (page === '404.html') continue;
  const title = decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((h.match(/name="description" content="([^"]*)"/) || [])[1] || '');
  if (!title) fail(`${page}: no <title>`);
  else if (title.length > 62) fail(`${page}: title ${title.length} chars (>62, truncates in SERP)`);
  if (!desc) fail(`${page}: no meta description`);
  else if (desc.length > 165) fail(`${page}: description ${desc.length} chars (>165, truncates)`);
  if (!/rel="canonical"/.test(h)) fail(`${page}: no canonical`);
  if (!/application\/ld\+json/.test(h)) fail(`${page}: no JSON-LD`);
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(`${page}: ${h1s} <h1> elements (must be exactly 1)`);
  let prev = 0;
  for (const m of h.matchAll(/<h([1-6])[\s>]/g)) {
    const lvl = +m[1];
    if (prev && lvl > prev + 1) fail(`${page}: heading skip h${prev} -> h${lvl}`);
    prev = lvl;
  }
}
if (!fails.length) ok('every page: one h1, no heading skips, title/desc/canonical/JSON-LD present');

// ------------------------------------------------------------- JSON-LD graph
section('Schema graph');
for (const f of htmlFiles) {
  const h = read(f);
  const page = pageOf(f);
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const b of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(b[1]);
    } catch (e) {
      fail(`${page}: invalid JSON-LD (${e.message})`);
      continue;
    }
    const ids = new Set();
    const refs = [];
    (function walkNode(n) {
      if (Array.isArray(n)) return n.forEach(walkNode);
      if (n && typeof n === 'object') {
        if (n['@id'] && n['@type']) ids.add(n['@id']);
        if (n['@id'] && !n['@type'] && Object.keys(n).length === 1) refs.push(n['@id']);
        for (const [k, v] of Object.entries(n)) if (k !== '@context') walkNode(v);
      }
    })(parsed);
    const dangling = [...new Set(refs)].filter((r) => !ids.has(r));
    if (dangling.length) fail(`${page}: dangling @id ref(s) ${dangling.join(', ')}`);
  }
}
ok('all @id references resolve on the page that uses them');

// ------------------------------------------------------- internal link targets
section('Internal links and assets');
const exists = (u) => {
  const rel = u.split(/[?#]/)[0].replace(/^\/+/, '');
  const p = path.join(DIST, rel);
  return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html'));
};
let broken = 0;
for (const f of htmlFiles) {
  const h = read(f);
  for (const m of [...h.matchAll(/(?:href|src)="(\/[^"]*)"/g)])
    if (!exists(m[1])) {
      fail(`${pageOf(f)}: broken reference ${m[1]}`);
      broken++;
    }
}
if (!broken) ok('every internal href/src resolves to a real file');

for (const f of htmlFiles)
  for (const m of read(f).matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0]))
      fail(`${pageOf(f)}: <img> without alt (${(m[0].match(/src="([^"]*)"/) || [])[1]})`);
  }

// ---------------------------------------------- assets that must NOT regress
// This is the check that would have caught the Astro-upgrade regression.
section('Asset rendering (the silent-regression guard)');
for (const p of projects) {
  const h = read(path.join(DIST, 'work', p.slug, 'index.html'));
  if (p.carousel) {
    const n = (h.match(/type="radio"/g) || []).length;
    const want = p.carousel.slides.length;
    n === want
      ? ok(`/work/${p.slug}: carousel renders all ${want} slides`)
      : fail(`/work/${p.slug}: carousel has ${n} slides, expected ${want} — asset gating broke`);
    if (!h.includes(`:has(#${p.carousel.id}-`))
      fail(`/work/${p.slug}: carousel state CSS missing (slides won't move)`);
  }
  if (p.logo)
    h.includes(p.logo.src)
      ? ok(`/work/${p.slug}: logo renders`)
      : fail(`/work/${p.slug}: logo fell back to placeholder — asset gating broke`);
  for (const m of [p.media, p.media2].filter((x) => x?.src))
    if (!h.includes(m.src)) fail(`/work/${p.slug}: media ${m.src} not in page`);
  if (h.includes('drop into /public/img/'))
    warn(`/work/${p.slug}: a placeholder is still rendering — intended only for unsupplied assets`);
}

// --------------------------------------------------- canonical description
section('Canonical description (must be byte-identical in 4 places)');
{
  const about = read(path.join(DIST, 'about', 'index.html'));
  const home = read(path.join(DIST, 'index.html'));
  const llms = read(path.join(DIST, 'llms.txt'));
  const jsonForm = JSON.stringify(CANONICAL_DESCRIPTION).slice(1, -1);
  const checks = {
    'llms.txt': llms.includes(CANONICAL_DESCRIPTION),
    '/about visible text': strip(about).includes(CANONICAL_DESCRIPTION),
    '/about JSON-LD': about.includes(jsonForm),
    'home JSON-LD': home.includes(jsonForm),
  };
  for (const [k, v] of Object.entries(checks))
    v ? ok(k) : fail(`canonical description differs in ${k}`);
}

// ------------------------------------------------- fact + no-negatives split
section('Fact consistency: site vs PDF-bound text vs llms.txt');
{
  const siteText = htmlFiles.map(read).map(strip).join(' ');
  const pdfText = caseStudies
    .map((d) =>
      renderSource(fs.readFileSync(path.join('src/content/case-studies', d.file), 'utf8'), d, {
        forSite: false,
      }).markdown,
    )
    .join(' ')
    .replace(/\s+/g, ' ');
  const llms = read(path.join(DIST, 'llms.txt')).replace(/\s+/g, ' ');
  const surfaces = { site: siteText, pdf: pdfText, 'llms.txt': llms };

  // Values that must appear NOWHERE — each was a real contradiction once.
  const forbidden = [
    ['12 active members', 'club count is 20 everywhere'],
    ['~13 bi-weekly meetings', 'meeting count is ~15 everywhere (owner-confirmed Sept 2026)'],
    // Owner decision: the Summit role is Co-Founder & Lead Organizer. This has
    // flipped twice now (Lead Organizer -> Co-Founder & CEO -> back to
    // Co-Founder & Lead Organizer) — check the CURRENT locked wording in
    // CLAUDE.md before "fixing" this the other way again.
    ['CEO', 'the Summit role is Co-Founder & Lead Organizer, not CEO'],
    ['planned and executed', 'superseded by the co-founded/Lead Organizer wording'],
    ['Views on our launch reels', '22K is the whole campaign, not just the reels'],
  ];
  for (const [needle, why] of forbidden) {
    const hits = Object.entries(surfaces).filter(([, t]) => t.includes(needle));
    hits.length
      ? fail(`"${needle}" appears in ${hits.map(([k]) => k).join(', ')} — ${why}`)
      : ok(`"${needle}" absent everywhere (${why})`);
  }

  // The no-negatives rule: PDF keeps these, the site must not.
  //
  // NOTE: exact-phrase checks alone are not enough and once gave a false pass.
  // The Results paragraphs were correctly scrubbed, but a LATER retrospective
  // paragraph still said "the stalled approval, and the IT rejection", and a
  // "What I Learned" bullet still said "the spam-filtered acceptance emails" —
  // the same setbacks, different words. Both slipped through. The concept-level
  // sweep below exists to catch that shape of leak; keep both.
  const pdfOnly = [
    '70% right',
    'vitamin, not a painkiller',
    'not among the four winners',
    'landed in spam',
    'spam-filtered acceptance emails',
    '87% bounce',
    'usage dropping sharply',
    'usage flatlined',
    'the IT rejection',
    'stalled approval',
    'blocked at the approval stage',
    'cost blowup, I paid for it',
    'outlasts its founder',
  ];
  for (const n of pdfOnly) {
    const inSite = siteText.includes(n);
    const inPdf = pdfText.includes(n);
    if (inSite) fail(`"${n}" leaked onto the site (no-negatives rule)`);
    else if (!inPdf) fail(`"${n}" missing from the PDF record (should stay unabridged)`);
    else ok(`"${n}": PDF only, as intended`);
  }

  // Concept-level sweep over the site-rendered case-study text. Reports any
  // sentence that reads as a setback about HIS OWN outcomes, so a reworded leak
  // still surfaces. Deliberately a WARNING, not a failure: "Options considered:
  // X (rejected because ...)" is a design decision, and "the model's failure
  // modes" is a thing he engineered against — both are strengths, and both
  // legitimately trip a keyword scan. Read the list; don't blanket-silence it.
  const setback =
    /\b(flatlin\w*|dropping sharply|not among|didn'?t win|stalled|blowup|spam-filtered|bounce rate|IT rejection|% wrong)\b/i;
  const noise = /Options considered|failure modes?\b|refused|wrong answer|wrong integration/i;
  const leaked = [];
  for (const doc of caseStudies) {
    const site = renderSource(
      fs.readFileSync(path.join('src/content/case-studies', doc.file), 'utf8'),
      doc,
      { forSite: true },
    ).markdown;
    for (const s of site.split(/(?<=[.!?])\s+/))
      if (setback.test(s) && !noise.test(s)) leaked.push(`${doc.slug}: ${s.replace(/\s+/g, ' ').trim().slice(0, 120)}`);
  }
  leaked.length
    ? leaked.forEach((l) => warn(`possible setback phrasing on the site — ${l}`))
    : ok('concept-level sweep: no setback phrasing on the site pages');
}

// ------------------------------------------------------------------ sitemap
section('Sitemap');
{
  const sm = read(path.join(DIST, 'sitemap.xml'));
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const wanted = [
    '/',
    '/about',
    '/honours',
    ...projects.map((p) => `/work/${p.slug}`),
    ...caseStudies.map((c) => `/case-study/${c.slug}`),
    ...caseStudies.map((c) => `/pdf/${c.pdf}`),
  ];
  for (const w of wanted)
    locs.some((l) => l.endsWith(w))
      ? null
      : fail(`sitemap missing ${w}`);
  ok(`${locs.length} URLs listed, all expected pages present`);
  for (const l of locs) {
    const rel = l.replace('https://faamirali.com', '');
    if (rel.endsWith('.pdf') && !fs.existsSync(path.join(DIST, rel.replace(/^\/+/, ''))))
      fail(`sitemap lists ${rel} but the file is not in dist/`);
  }
  const bad = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)]
    .map((m) => m[1])
    .filter((d) => Number.isNaN(Date.parse(d)) || new Date(d) > new Date(Date.now() + 864e5));
  bad.length ? fail(`sitemap has invalid/future lastmod: ${bad.join(', ')}`) : ok('all lastmod dates valid');
}

// ------------------------------------------------------------------ summary
console.log('\n' + '='.repeat(58));
if (fails.length) {
  console.log(`${fails.length} FAILURE(S):`);
  fails.forEach((f) => console.log('  - ' + f));
}
if (warns.length) {
  console.log(`${warns.length} warning(s):`);
  warns.forEach((w) => console.log('  - ' + w));
}
if (!fails.length) console.log('ALL CHECKS PASSED — safe to deploy.');
process.exit(fails.length ? 1 : 0);
