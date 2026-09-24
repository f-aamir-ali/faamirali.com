// Single source of truth for the three project pages.
// Facts trace to the four case studies (src/content/case-studies/*.md) and
// the principal's letter.
// Voice rules (owner decisions): first person; the Summit is "co-founded" and
// he is its Lead Organizer, blended into the sentence, with Yuvraj Bains /
// Panorama Ridge credited (this REVERSED an earlier "planned and executed"
// wording, then reverted CEO -> Lead Organizer while keeping co-founder); no
// negatives on the site (declines / losses / what-broke stay in the linked
// case-study PDFs); explain things for a reader who's never heard of them.
//
// `published` / `updated` feed Article schema. Crawlers and AI search weight
// explicit dates heavily, and a page with no date at all is treated as
// undated rather than as fresh — so these are real dates, kept current.

export const projects = [
  {
    slug: 'fleetbot',
    name: 'FleetBot',
    fileLine: 'Launched Jan 11, 2026 (student) · Deployed Apr 22, 2026 (staff) · Sole builder',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'An AI assistant I built and deployed at my school so students and staff could get instant answers to everyday questions.',
    seoTitle: 'FleetBot: an AI assistant in my school | F. Aamir Ali',
    seoDescription:
      'Two AI assistants I built for my 1,500-student school: a chatbot whose beta ran on $2.76 with zero errors, and a staff assistant that took 150+ questions in 10 days.',
    ogImage: '/og/fleetbot.png',
    published: '2026-01-11',
    updated: '2026-07-26',
    tagline:
      'Two builds, one school: a chatbot for 1,500 students, then a staff assistant running on a computer in the front office.',
    acts: [
      {
        kicker: 'The student build · launched Jan 2026',
        title: 'A chatbot for 1,500 students',
        paras: [
          "Every school buries the things students actually need, like the daily schedule, who teaches what, and which clubs exist, inside PDFs nobody ever opens. FleetBot answers those questions in plain English, pulled straight from the school's own documents. I built the whole thing myself and launched it school-wide through the AI Club's Instagram.",
          // The $5-per-20-messages comparison is what makes $2.76 legible: on
          // its own it is just a small number, and a reader has no scale for
          // it. "Engineered" was also doing the wrong positioning work here
          // (it files this as an engineering result rather than a product
          // decision), so the sentence now leads with the rebuild.
          'The real challenge was making it cheap and reliable enough to run for an entire school at once. My first version burned through $5 every 20 messages, so I rebuilt it from scratch, and the whole public beta ended up costing $2.76 in total across hundreds of messages. I also wrote the rules that stop it from ever guessing an answer or replying to anything unsafe.',
        ],
      },
      {
        kicker: 'The staff build · deployed Apr 2026',
        title: 'An assistant in the front office',
        paras: [
          "The student launch proved it worked, so I pitched the principal on a version for staff. The hard part wasn't the code, it was trust. A school won't run a student's AI unless it's certain the information stays private, so I rebuilt it to keep everything under the school's own control. That's what earned the green light.",
          "The staff version answers questions straight from the school's official documents, and checks all six athletics calendars live to answer “when's the next game?” in about four seconds. I got each answer down to under half a cent and roughly two and a half seconds. A friend hand-coded the staff-facing website and connected it to the system I built.",
          'It went live on a dedicated computer in the school’s main office and handled over 150 real staff questions in its first ten days.',
        ],
      },
    ],
    intro: null,
    // Centred logo above the proof grid. Rendered only once the file is
    // actually on disk (ProofGrid checks) — never a broken image.
    logo: { src: '/img/FleetBot0b.png', alt: 'FleetBot logo' },
    // Two labelled proof groups so the student numbers and the staff numbers
    // never read as one mixed pile. `tone` is a tint of the single site
    // accent (no second hue) — see ProofGrid's .tone-* rules.
    proofGroups: [
      { key: 'student', label: 'The student build', kicker: 'Launched Jan 2026', tone: 'light' },
      { key: 'staff', label: 'The staff build', kicker: 'Deployed Apr 2026', tone: 'wash' },
    ],
    // NOTE: order is load-bearing — ledger[0] is the home card's headline
    // stat. Group display order comes from `proofGroups`, not this array, so
    // 150+ stays the home headline while the student group still renders first.
    ledger: [
      {
        n: '150+',
        l: 'Real staff questions answered in its first 10 days in the office',
        src: "principal's letter",
        group: 'staff',
      },
      {
        n: '$2.76',
        l: 'Total cost to run the entire student beta, across hundreds of messages',
        src: 'Botpress dashboard',
        group: 'student',
      },
      {
        n: '$0.005',
        l: 'The cost of a staff answer after I rebuilt it, down from $0.45, and about 2.5 seconds instead of 12',
        src: 'staff build',
        group: 'staff',
      },
      {
        n: '6',
        l: 'School sports calendars it checks live to answer “when’s the next game?” in about 4 seconds',
        src: 'staff build',
        group: 'staff',
      },
      {
        // The case study's figure is 112 *unique visitors* to the site (77 from
        // Instagram, 31 direct, 2 from Facebook), not 112 confirmed students —
        // so this says visitors. 66 of them went on to chat.
        n: '112',
        l: 'Visitors in the launch window, 66 of whom stayed to chat with it',
        src: 'site analytics',
        group: 'student',
      },
    ],
    // `ratio` is the asset's TRUE aspect ratio — the media tile is sized to it
    // so nothing is ever cropped or stretched. Measured, not guessed:
    // the demo video is 1280x720, the terminal photo 1600x1200.
    media: {
      label: 'FleetBot in action', sub: 'screen recording', video: true, corner: 'REC',
      src: '/video/fleetbot-demo.mp4',
      alt: 'Screen recording of FleetBot answering a question',
      ratio: '16 / 9',
      group: 'student',
    },
    media2: {
      label: 'The staff terminal', sub: 'in the school’s main office',
      src: '/img/fleetbot-terminal.jpg', w: 1600, h: 1200,
      alt: "FleetBot running on a dedicated computer in the school's main office, April 2026",
      ratio: '4 / 3',
      group: 'staff',
    },
    // A click-through carousel of the launch post, Instagram-style.
    carousel: {
      id: 'fb-marketing',
      label: 'Marketing post student',
      sub: '5 slides',
      group: 'student',
      // Slides are 1080x1350 (4:5), the default aspect.
      slides: [1, 2, 3, 4, 5].map((n) => ({
        src: `/img/${n}.png`,
        alt: `Slide ${n} of 5 from the FleetBot student launch post`,
      })),
    },
    live: null,
    pdfs: [
      { label: 'Student build', href: '/pdf/fleetbot-student-case-study.pdf', group: 'student' },
      { label: 'Staff build', href: '/pdf/fleetbot-staff-case-study.pdf', group: 'staff' },
    ],
    quote: {
      text: '“Aamir’s most impressive achievement is FleetBot, a fully functional AI assistant he developed for our school.”',
      attr: 'Jodie Perry, Principal, Fleetwood Park Secondary',
    },
    note: null,
  },

  {
    slug: 'surrey-ai-summit',
    name: 'Surrey Youth AI Summit',
    fileLine: 'Ran June 23, 2026 · Co-Founder & Lead Organizer',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'Co-Founder & Lead Organizer of a one-day event where students with no coding experience built real AI tools for local businesses.',
    seoTitle: 'Surrey Youth AI Summit: 70 students, 14 schools | F. Aamir Ali',
    seoDescription:
      'The first youth AI summit in Surrey, which I co-founded and lead: about 70 students from 14 schools built and pitched working AI in a single day.',
    ogImage: '/og/surrey-ai-summit.png',
    published: '2026-06-23',
    updated: '2026-07-25',
    tagline:
      'About 70 students, 14 schools, and one day to build real AI for local businesses: the first youth AI summit in Surrey.',
    acts: null,
    intro: [
      'On June 23, 2026, about 70 students from 14 different schools spent a single day building working AI tools for local businesses, then pitched what they had made to a panel of judges. Nothing like it had been run for students in Surrey before.',
      "I co-founded the event with Yuvraj Bains from Panorama Ridge, and I'm the Lead Organizer of the entire summit. I ran it end to end, from the first planning meeting to the closing pitches on the day.",
      'The first piece was the platform. I designed and built the website the summit ran on, which is where every participant registered and where all the event information lived.',
      'The second piece was funding and credibility. I brought in Generation AI, a group that runs AI-education programs, as our sponsor. They put up the prize money, sent professional judges to score the final pitches, and helped line up a UBC professor to give the keynote.',
      'Most of the students who arrived that morning had little to no coding experience. By the end of the day, every team had something that actually worked, and they got up and pitched it themselves.',
    ],
    ledger: [
      {
        n: '~70',
        l: 'Students from 14 schools who showed up to build for a day',
        src: 'group photo',
      },
      {
        n: '1st',
        l: 'The first youth AI summit in Surrey',
      },
      {
        n: '$650',
        l: 'Sponsorship I secured, which paid for the cash prizes and two student scholarships',
        src: 'transfer record',
      },
      {
        // Was "views on our launch reels", which the case study does not
        // support: 22,062 is the campaign's TOTAL views (the five summit reels
        // were ~13,500 of it). Attributing all 22K to the reels overstated a
        // number that is already strong on its own.
        n: '22K+',
        l: 'Views across the launch campaign that filled every seat',
        src: 'Instagram insights',
      },
    ],
    media: {
      label: 'The full cohort', sub: 'about 70 students, 14 schools', video: false,
      src: '/img/summit-group.jpg', w: 1800, h: 1350,
      alt: 'Group photo of about 70 students at the Surrey Youth AI Summit, June 23, 2026',
      ratio: '4 / 3',
    },
    media2: null,
    // 19 photos, 2.jpg through 20.jpg. Mostly 4:3 landscape with a couple of
    // portrait shots — slides use object-fit: contain, so the portraits letterbox
    // cleanly inside the 4:3 window instead of being cropped.
    carousel: {
      id: 'summit-recap',
      label: 'Summit recap',
      sub: '19 photos',
      aspect: '4 / 3',
      slides: Array.from({ length: 19 }, (_, i) => ({
        src: `/img/${i + 2}.jpg`,
        alt: `Photo ${i + 2} from the Surrey Youth AI Summit, June 23, 2026`,
      })),
    },
    live: {
      label: 'Visit the event site',
      note: 'live · site I built',
      href: 'https://surreyaisummit.vercel.app',
    },
    pdfs: [{ label: 'Full case study', href: '/pdf/surrey-ai-summit-case-study.pdf' }],
    quote: null,
    note: {
      eyebrow: 'The keynote',
      big: 'Dr. Peter Ostafichuk',
      sub: 'Professor of Teaching at UBC, Chair of First-Year Engineering, and a co-founder of Generation AI. Students voted his keynote the best part of the day.',
    },
  },

  {
    slug: 'ai-club',
    name: 'AI & Innovation Club',
    fileLine: 'Active since September 2025 · Founder & president',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'A club I founded where students learn and build with AI, not just talk about it.',
    seoTitle: 'AI & Innovation Club: founder & president | F. Aamir Ali',
    seoDescription:
      'The club I founded to teach students to build with AI: 20 members, a real build every meeting, and 22 who made AI videos for a national Best Buy challenge.',
    ogImage: '/og/ai-club.png',
    published: '2025-09-01',
    updated: '2026-09-22',
    tagline:
      'The club I founded so building with AI stops being a niche skill: every meeting ends with something that works.',
    acts: null,
    intro: [
      'I started the club in September 2025. Building FleetBot had taught me something I did not expect: almost nobody around me knew what these tools could already do, let alone how to build with them. The club exists to close that gap.',
      'Every meeting is hands-on. Members use no-code tools to put together working websites, automations, and chatbots, and everyone leaves with something they built themselves rather than a slideshow they sat through.',
      "When the Best Buy Teen Tech “Create with AI” Challenge (run with Microsoft) let each school enter only once, I opened it up as an internal contest instead of hand-picking a few people. In the end, 22 members made AI videos, and the one that won our internal contest became the school's single national entry, up against more than 40 other schools across Canada.",
    ],
    ledger: [
      {
        n: '20',
        // NOT "every month" — the club meets BI-WEEKLY (~15 sessions since
        // Sept 2025), so "monthly" understated the cadence and contradicted
        // both case studies. This label is ledger[0], so it also renders on the
        // home card; the error was live in two places.
        l: 'Active members, building something at every meeting',
        src: "principal's letter",
      },
      {
        n: '~15',
        l: 'Hands-on sessions run since I started the club',
        src: 'club record',
      },
      {
        n: '22',
        l: 'Members who made AI videos for a national Best Buy challenge',
        src: 'submission record',
      },
      {
        n: '40+',
        l: 'Schools across Canada our entry went up against',
        src: 'Best Buy challenge',
      },
    ],
    media: {
      label: 'The club', sub: '20 active members', video: false,
      src: '/img/club.jpg', w: 1600, h: 1200,
      alt: 'Group photo of the AI & Innovation Club, 20 active members',
      ratio: '4 / 3',
    },
    media2: null,
    live: { label: 'Club Instagram', note: '@fpss_ai.club', href: 'https://www.instagram.com/fpss_ai.club/' },
    pdfs: [{ label: 'Full case study', href: '/pdf/ai-club-case-study.pdf' }],
    quote: null,
    note: {
      eyebrow: 'The through-line',
      big: 'FleetBot → the club → the Summit',
      sub: "FleetBot showed me the gap, the club taught the tools, and that work grew into the Surrey Youth AI Summit: one school's skills spreading to fourteen.",
    },
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
