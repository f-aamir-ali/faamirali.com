// The long-form record, in the repo so the build is reproducible anywhere.
//
// Why this file exists: the case studies used to be read from a folder in the
// owner's Downloads directory, which meant `npm run make:pdfs` only worked on
// one machine and the case-study text could never be part of a CI/Vercel
// build. The markdown now lives at src/content/case-studies/*.md, and BOTH
// outputs (the PDF and the on-site HTML page) are generated from it through
// this one module — so they can't drift apart.
//
// Two edit layers, deliberately separate:
//
//   factFixes  — corrections applied to EVERY output. These are places where
//                the source markdown contradicts a locked, letter-backed fact.
//                A reader of the PDF and a reader of the site must not be told
//                two different numbers.
//
//   siteEdits  — applied to the ON-SITE HTML only. The site has a locked
//                no-negatives rule (setbacks, declines and losses are real and
//                stay in the downloadable PDF, which is the full record). The
//                site page is the indexable summary, so these passages are
//                reframed there. Every entry is listed here in the open rather
//                than silently stripped, and each says which rule it serves.
//
// Matching is by PARAGRAPH PREFIX, not by full-string equality: the source is
// full of em dashes, curly quotes and arrows, and exact-matching those is how
// a replacement silently stops applying after an innocent edit. Prefixes are
// kept ASCII-only for the same reason. An unmatched rule is a build ERROR, not
// a silent no-op — see assertAllApplied().

export const caseStudies = [
  {
    slug: 'fleetbot-student',
    project: 'fleetbot',
    file: 'fleetbot-student.md',
    pdf: 'fleetbot-student-case-study.pdf',
    title: 'FleetBot (Student)',
    docTitle: 'FleetBot (Student): Case Study',
    blurb:
      'The full engineering record of the student chatbot: three platforms evaluated, the deterministic rebuild that cut cost to cents per message, and the launch numbers.',
    published: '2026-01-11',
    updated: '2026-07-26',
    factFixes: [],
    siteEdits: [
      {
        // No-negatives rule: the bounce rate and the "some left before typing"
        // framing are a setback reading. The real numbers all stay.
        startsWith: 'The launch window drew',
        with:
          'The launch window drew **112 unique visitors** (~7.5% of the ~1,500-student school): **77** from Instagram, **31** direct, and **2** from Facebook. Of those, **66** went on to chat with the bot, generating **227 messages** across **1,007 LLM calls**, for **$2.76** in total AI cost (see: Botpress dashboard, website analytics).',
      },
    ],
  },

  {
    slug: 'fleetbot-staff',
    project: 'fleetbot',
    file: 'fleetbot-staff.md',
    pdf: 'fleetbot-staff-case-study.pdf',
    title: 'FleetBot (Staff)',
    docTitle: 'FleetBot (Staff): Case Study',
    blurb:
      'The privacy rebuild that won the school over, retrieval tuning that cut a query from $0.45 to under half a cent, and one live integration across six calendars.',
    published: '2026-04-22',
    updated: '2026-09-22',
    factFixes: [],
    siteEdits: [
      {
        // No-negatives rule: keeps every real figure, drops the accuracy split
        // and the usage-decline curve (both stay in the PDF).
        startsWith: 'Launch week (week of April 20, 2026)',
        with:
          'Launch week (week of April 20, 2026) drew **269 messages, 9 users, 34 sessions**. In its first 10 days the terminal handled **150+ real staff queries**, answering specific questions such as "Who is the head of the math department?" cleanly, with a citation back to the document each answer came from. Over three months it logged **363 messages across 37 users and 84 sessions** (see: 3-month analytics file).',
      },
      {
        // No-negatives rule: this whole paragraph is the usage-decline
        // narrative. It is genuinely the most interesting thing in the
        // document, which is exactly why it stays in the linked PDF.
        startsWith: 'That decline was the most useful result.',
        with: null,
      },
      {
        // No-negatives rule: reframes a blocked approval as a designed build
        // plus the recommendation letter that closed the pilot.
        //
        // This version ALSO gives the paragraph an ending. The previous one
        // stopped at "was its own piece of engineering" and never said what
        // happened, so a reader waiting for the outcome read the silence as a
        // hidden failure — worse than the real answer. The real answer is a
        // structural access boundary (a district does not grant a student
        // account write access to confidential staff data), which is a systems
        // fact rather than a setback, and it is the site's stated
        // differentiator: knowing how institutions actually work.
        startsWith: 'That next build',
        with:
          'The next build, automated iPad-cart booking, was fully designed: same-tenant Outlook calendar sharing, Make.com scenarios for check, create and cancel, and a navigated Microsoft OAuth 2.0 admin-consent request routed through the principal to district IT. Getting a request like that through a real school district is its own piece of engineering, and it ran up against the boundary every student account eventually meets: the athletics calendars shipped because they were public and read-only, while booking needs write access to a private staff calendar, and that access stays with staff. Knowing exactly where that line sits is the most useful thing this pilot taught me about building inside an institution. It closed with a Letter of Recommendation from the principal referencing the project.',
      },
      {
        // No-negatives rule. This retrospective paragraph still named "the
        // stalled approval", "the IT rejection" and "the cost blowup", which
        // re-introduced the setbacks the edits above had just removed. The
        // insight is the valuable part and is kept in full; only the
        // setback framing goes. Full version stays in the PDF.
        startsWith: 'Two patterns held across the build.',
        with:
          'Two patterns held across the build. Privacy and cost both have to be designed in from the start rather than bolted on late, which is what the Voiceflow rebuild and the retrieval tuning each taught me. And the moments that decided whether the system shipped at all were not code: the privacy conversation, the approval process, and the district IT review were engineering problems in everything but name.',
      },
    ],
  },

  {
    slug: 'surrey-ai-summit',
    project: 'surrey-ai-summit',
    file: 'surrey-ai-summit.md',
    pdf: 'surrey-ai-summit-case-study.pdf',
    title: 'Surrey Youth AI Summit',
    docTitle: 'Surrey Youth AI Summit: Case Study',
    blurb:
      'The full record of the summit: the sponsorship and keynote, the judging design that kept the result credible, and the marketing funnel that filled every seat.',
    published: '2026-06-23',
    updated: '2026-07-26',
    factFixes: [
      // The site states Co-Founder & Lead Organizer (locked owner decision,
      // matching the principal's letter, which says "co-founder and lead
      // organizer"). The source markdown's Role line credits only "Lead
      // Organizer", missing the co-founder credit the site gives him.
      ['**Role:** Lead Organizer', '**Role:** Co-Founder & Lead Organizer'],
      // Yuvraj stays credited, with his school, matching the site.
      ['Yuvraj (co-founder)', 'Yuvraj Bains (co-founder, Panorama Ridge)'],
    ],
    siteEdits: [
      {
        // No-negatives rule: the decision here is the buffer planning, which
        // is the part worth reading. Retitled off the email failure.
        //
        // The paragraph used to end "...and why the important information
        // moved onto an Instagram post, a second contact field on the forms,
        // and certificate delivery through the post-event survey." Cut: those
        // three changes were caused by the acceptance emails going to spam,
        // and this edit layer had just removed that cause — so the sentence
        // claimed a seating buffer explained them, which no reader can follow.
        // A trimmed edit layer has to remove causes AND their effects.
        startsWith: '**Accepting more students than the room held',
        with:
          '**Accepting more students than the room held.**\nThe challenge: 81 sign-ups, a room with a hard cap, and a free event on the first days of summer break, where a large share of people flake. Options considered: accept exactly to the cap (rejected, because no-shows would leave the room half-empty); first-come-first-served with no buffer (rejected, same problem). What was chosen: over-accept against expected no-shows, 50 accepted and 30 waitlisted, with the waitlist as backfill. That buffer is why there was room to take in every student who showed up on the day.',
      },
      {
        // No-negatives rule: keeps the keynote result, drops the deliverability
        // post-mortem (it stays in the PDF).
        startsWith: 'The acceptance-email failure is the clearest lesson:',
        with:
          'In the post-event survey, most students named the keynote as the best part of the day.',
      },
      {
        // No-negatives rule. The three "What I Learned" bullets are one
        // markdown block, so they're replaced together. Only the second one
        // changed: it named the spam-filtered acceptance emails outright, which
        // put back the setback the edit above had just taken out. The principle
        // it teaches is kept; the incident stays in the PDF.
        startsWith: '- On a volunteer team',
        with:
          "- On a volunteer team, nothing is done until it's confirmed done. So I stopped assuming, built buffer time into every deadline, and put a single owner on anything that couldn't be allowed to slip.\n- One channel that can fail silently should never be the only way something important gets through. I now run a backup path for anything that has to arrive.\n- Credibility compounds: a real website, receipts kept clean, and judging I didn't control each removed a separate reason for someone to doubt the event, and together they did more than any single one would have.",
      },
    ],
  },

  {
    slug: 'ai-club',
    project: 'ai-club',
    file: 'ai-club.md',
    pdf: 'ai-club-case-study.pdf',
    title: 'AI & Innovation Club',
    docTitle: 'AI & Innovation Club: Case Study',
    blurb:
      'The full record of the club: why every meeting ships something, why no-code beat teaching programming first, and how the Best Buy entry became an open contest.',
    published: '2025-09-01',
    updated: '2026-09-22',
    // No factFixes any more: the source itself now says 20 members and ~15
    // meetings throughout (owner-confirmed, Sept 2026). The two fixes that
    // used to live here patched a source that contradicted itself; with the
    // source corrected they would never match, which is a build error.
    factFixes: [],
    siteEdits: [
      {
        // No-negatives rule: drops the competition result, keeps the scale of
        // what the members actually built and shipped.
        startsWith: '20 active members;',
        with:
          '20 active members; ~15 bi-weekly meetings since September 2025. For the Best Buy challenge, 22 students produced AI videos and the school competed against 40+ schools across Canada. The submission was a full national-competition entry, an artist statement, a storyboard and a 1 to 4.5 minute AI-enhanced video, built and shipped by students who mostly would not have started otherwise.',
      },
      {
        // Locked decision: no succession or "what's next" copy on the site.
        startsWith: 'The club started after FleetBot showed',
        with:
          'The club started after FleetBot showed how few students knew how to use these tools, and it became the launchpad for the Surrey Youth AI Summit: ~70 students from 14 schools. (Both FleetBots and the Summit were separate personal builds, not club group projects. The club is where those skills get taught and passed on.)',
      },
    ],
  },
];

export function getCaseStudy(slug) {
  return caseStudies.find((c) => c.slug === slug);
}

export function caseStudiesFor(projectSlug) {
  return caseStudies.filter((c) => c.project === projectSlug);
}

// Split on blank lines. Fenced code blocks are held together so a blank line
// inside one can't be mistaken for a paragraph break.
function toBlocks(md) {
  const out = [];
  let buf = [];
  let fence = false;
  const flush = () => {
    const s = buf.join('\n').trim();
    if (s) out.push(s);
    buf = [];
  };
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (!fence && line.trim() === '') flush();
    else buf.push(line);
  }
  flush();
  return out;
}

/**
 * Apply factFixes (always) and, for the on-site page, siteEdits.
 * Returns { markdown, applied } where `applied` reports which rules fired, so
 * a stale rule surfaces as a build failure instead of vanishing quietly.
 */
export function renderSource(raw, doc, { forSite }) {
  let md = raw;
  const applied = { factFixes: [], siteEdits: [] };

  for (const [from, to] of doc.factFixes ?? []) {
    if (md.includes(from)) {
      md = md.split(from).join(to);
      applied.factFixes.push(from);
    }
  }

  if (!forSite) return { markdown: md, applied };

  const blocks = toBlocks(md).flatMap((block) => {
    const rule = (doc.siteEdits ?? []).find((r) => block.startsWith(r.startsWith));
    if (!rule) return [block];
    applied.siteEdits.push(rule.startsWith);
    return rule.with === null ? [] : [rule.with];
  });

  return { markdown: blocks.join('\n\n'), applied };
}

/** Throws if a configured rule didn't match — a stale rule is a real bug. */
export function assertAllApplied(doc, applied, { forSite }) {
  const missedFacts = (doc.factFixes ?? [])
    .map(([from]) => from)
    .filter((f) => !applied.factFixes.includes(f));
  if (missedFacts.length)
    throw new Error(`${doc.file}: factFixes never matched: ${missedFacts.join(' | ')}`);

  if (!forSite) return;
  const missedSite = (doc.siteEdits ?? [])
    .map((r) => r.startsWith)
    .filter((s) => !applied.siteEdits.includes(s));
  if (missedSite.length)
    throw new Error(`${doc.file}: siteEdits never matched: ${missedSite.join(' | ')}`);
}
