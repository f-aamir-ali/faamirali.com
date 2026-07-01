// Single source of truth for the three projects.
// Content rules applied: only already-completed work (no future/now/planning),
// "first" claims attributed/caveated, FleetBot credit kept honest, banned words avoided.

export const projects = [
  {
    slug: 'fleetbot',
    order: '01',
    name: 'FleetBot',
    status: 'Deployed',
    statusTone: 'green',
    // --- home card ---
    cardLine: 'An AI assistant I built & deployed inside my 1,500-student high school.',
    cardTag: '1,500 students',
    // --- project page ---
    seoTitle: 'FleetBot — AI assistant deployed in a 1,500-student school | F. Aamir Ali',
    seoDescription:
      'An AI assistant I built and deployed on a front-office terminal in my 1,500-student high school — 150+ staff queries in its first 10 days, and an honest account of adoption.',
    ogImage: '/og/fleetbot.png',
    tagline: 'An AI assistant I built and deployed inside my 1,500-student high school.',
    summary: [
      'FleetBot answers what a 1,500-student school asks all day — schedules, rooms, policies, who to email. I prepped 27 messy PDFs into 35 clean Markdown files, built the retrieval and the system prompt, and wired a live athletics-calendar integration, then got it running on a real mini-PC terminal in the front office.',
      'A friend hand-coded the staff front-end and the API connection; the rest was mine. The honest lesson came after launch: shipping the build was the easy half — getting people to actually use it was the real test. It was a vitamin, not a painkiller, and the usage numbers showed it.',
    ],
    stats: [
      { n: '1,500', l: 'students it serves' },
      { n: '150+', l: 'staff queries in its first 10 days' },
      { n: '27→35', l: 'PDFs cleaned into Markdown for accuracy' },
    ],
    media: { label: 'fleetbot-demo.mp4', sub: 'screen recording — drop in', video: true, corner: 'REC' },
    media2: { label: 'fleetbot-terminal.jpg', sub: 'office terminal photo — drop in' },
    live: { label: 'Try the student demo', note: 'live link', href: '' },
    pdf: '/pdf/fleetbot-case-study.pdf',
    quote: {
      text: '“Aamir’s most impressive achievement is FleetBot, a fully functional AI assistant he developed for our school.”',
      attr: 'Jodie Perry, Principal, Fleetwood Park Secondary',
    },
    note: null,
  },

  {
    slug: 'surrey-ai-summit',
    order: '02',
    name: 'Surrey Youth AI Summit',
    status: 'Shipped',
    statusTone: 'accent',
    cardLine: 'A one-day youth AI summit I founded — ~70 students from 14 schools.',
    cardTag: '70 · 14',
    seoTitle: 'Surrey Youth AI Summit — ~70 students, 14 schools | F. Aamir Ali',
    seoDescription:
      'A one-day youth AI summit I founded and ran end to end: ~70 students from 14 schools, a $650 sponsor, a UBC keynote, and real AI built in a single day.',
    ogImage: '/og/surrey-ai-summit.png',
    tagline: '~70 students. 14 schools. One day building real AI — an event I founded and ran end to end.',
    summary: [
      'I founded the Surrey Youth AI Summit and ran it end to end. ~70 students from 14 schools spent one day using no-code AI tools to build working websites and chatbots for real Surrey businesses. I built the event site myself, secured a $650 sponsor and a UBC keynote, planned three workshops and five business challenges, and handled 81 sign-ups down to 50 spots.',
      'When my acceptance emails silently went to spam, I rerouted everything important through Instagram, a backup contact field, and the post-event survey, so no one got turned away at the door. As far as I could find, it was the first youth AI summit in Surrey. Running it taught me more about logistics — and about getting people to actually show up — than any build has.',
    ],
    stats: [
      { n: '~70', l: 'students, from 14 schools' },
      { n: '$650', l: 'sponsor secured, plus 2 scholarships' },
      { n: '1 day', l: 'to learn, build, and demo' },
    ],
    media: { label: 'summit-group.jpg', sub: 'group photo (~70) — drop in', video: false },
    media2: null,
    live: { label: 'See the event site', note: 'live · vercel', href: 'https://surreyaisummit.vercel.app' },
    pdf: '/pdf/surrey-ai-summit-case-study.pdf',
    quote: null,
    note: {
      eyebrow: 'Instagram reach',
      big: '~13,500 reel views',
      sub: 'across the 5 summit reels · 4,227 accounts reached · 64 link taps → 81 sign-ups → ~70 in the room.',
    },
  },

  {
    slug: 'ai-club',
    order: '03',
    name: 'AI & Innovation Club',
    status: 'Active',
    statusTone: 'green',
    cardLine: 'The club I founded & lead to teach students to build with AI.',
    cardTag: 'Founder',
    seoTitle: 'AI & Innovation Club — founder & president | F. Aamir Ali',
    seoDescription:
      'The club I founded and lead to teach students to actually build with AI — no-code sites, automations, chatbots, and prompt engineering. The platform the Surrey Youth AI Summit grew out of.',
    ogImage: '/og/ai-club.png',
    tagline: 'The club I founded and lead to teach students to actually build with AI — not just talk about it.',
    summary: [
      "I founded the AI & Innovation Club after FleetBot to pass on the tools I'd taught myself: no-code site builders (Lovable, Bolt), automations (n8n, Make.com), chatbots (Chatbase), and prompt engineering. Every meeting is hands-on — the goal is that a member walks out able to ship a working site or automation, not just nod at a slideshow.",
      'It is the platform the rest of my work grew out of: the Surrey Youth AI Summit was co-hosted by this club. We also entered the Best Buy Teen Tech “Create with AI” Challenge, which I ran as an internal contest first to choose our school’s entry.',
    ],
    stats: [
      { n: '20', l: 'active members' },
      { n: '2025', l: 'founded, still running' },
      { n: '~15', l: 'hands-on meetings a year' },
    ],
    media: { label: 'club.jpg', sub: 'club photo (20 members) — drop in', video: false },
    media2: null,
    live: { label: 'Club Instagram', note: 'instagram', href: 'https://www.instagram.com/fpss_ai.club/' },
    pdf: '/pdf/ai-club-case-study.pdf',
    quote: null,
    note: {
      eyebrow: 'Best Buy Teen Tech Challenge',
      big: '22 students built AI videos',
      sub: 'I opened it as an internal contest to choose our school’s single entry, up against 40+ schools across Canada. We didn’t win — the point was 22 people who built something with AI who maybe wouldn’t have otherwise.',
    },
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
