// Single source of truth for the three project pages.
// Facts trace to the four case studies (the "_f" versions) and the letter.
// Voice rules (owner decisions): first person; the Summit is "planned and
// executed" (Yuvraj/Panorama Ridge credited once, naturally); no negatives
// on the site (declines / losses / what-broke live in the case-study PDFs);
// explain things for a reader who's never heard of them — don't dump lists.

export const projects = [
  {
    slug: 'fleetbot',
    name: 'FleetBot',
    fileLine: 'Launched Jan 11, 2026 (student) · Deployed Apr 22, 2026 (staff) · Sole builder',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'An AI assistant I built and deployed at my school so students and staff could get instant answers to everyday questions.',
    seoTitle: 'FleetBot: AI assistants deployed in a 1,500-student school | F. Aamir Ali',
    seoDescription:
      'Two AI assistants I built for my 1,500-student school: a student chatbot whose public beta ran on $2.76 with zero errors, and a staff assistant deployed on a front-office terminal that handled 150+ real questions in its first 10 days.',
    ogImage: '/og/fleetbot.png',
    tagline:
      'Two builds, one school: a chatbot for 1,500 students, then a staff assistant running on a computer in the front office.',
    acts: [
      {
        kicker: 'The student build · launched Jan 2026',
        title: 'A chatbot for 1,500 students',
        paras: [
          "Every school buries the things students actually need, like the daily schedule, who teaches what, and which clubs exist, inside PDFs nobody ever opens. FleetBot answers those questions in plain English, pulled straight from the school's own documents. I built the whole thing myself and launched it school-wide through the AI Club's Instagram.",
          'The real challenge was making it cheap and reliable enough to run for an entire school at once. I engineered the whole public beta to cost just $2.76 in total, across hundreds of messages, with zero errors, and I wrote the rules that stop it from ever guessing an answer or replying to anything unsafe.',
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
    ledger: [
      {
        n: '150+',
        l: 'real staff questions it answered in its first 10 days in the office',
        src: "principal's letter",
      },
      {
        n: '$2.76',
        l: 'total cost to run the entire student beta, across hundreds of messages, with zero errors',
        src: 'Botpress dashboard',
      },
      {
        n: '$0.005',
        l: 'the cost of a staff answer after I rebuilt it, down from $0.45, and it now takes about 2.5 seconds instead of 12',
        src: 'staff build',
      },
      {
        n: '6',
        l: 'school sports calendars it checks live to answer “when’s the next game?” in ~4s',
        src: 'staff build',
      },
      {
        n: '112',
        l: 'students who tried it in the first week; 66 stayed to chat with it',
        src: 'site analytics',
      },
    ],
    media: {
      label: 'fleetbot-demo.mp4', sub: 'screen recording', video: true, corner: 'REC',
      src: '/video/fleetbot-demo.mp4',
      alt: 'Screen recording of FleetBot answering a question',
    },
    media2: {
      label: 'fleetbot-terminal.jpg', sub: 'the computer in the main office',
      src: '/img/fleetbot-terminal.jpg',
      alt: "FleetBot running on a dedicated computer in the school's main office, April 2026",
    },
    live: { label: 'Try the student demo', note: 'live link', href: 'https://fleetbot.lovable.app' },
    pdfs: [
      { label: 'Student build: full case study', href: '/pdf/fleetbot-student-case-study.pdf' },
      { label: 'Staff build: full case study', href: '/pdf/fleetbot-staff-case-study.pdf' },
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
    fileLine: 'Ran June 23, 2026 · Planned & executed end to end',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'A one-day event I planned and executed, where students with no coding experience built real AI tools for local businesses.',
    seoTitle: 'Surrey Youth AI Summit: about 70 students, 14 schools | F. Aamir Ali',
    seoDescription:
      'The first youth AI summit in Surrey: a one-day event I planned and executed, with about 70 students from 14 schools, a real sponsor, professional judges, and a UBC keynote, building and pitching working AI in a single day.',
    ogImage: '/og/surrey-ai-summit.png',
    tagline:
      'About 70 students, 14 schools, and one day to build real AI for local businesses: the first youth AI summit in Surrey.',
    acts: null,
    intro: [
      'The first youth AI summit in Surrey: one day where about 70 students from 14 schools, most of whom had never written a line of code, built real, working AI tools for local businesses and pitched them to a panel of judges.',
      'I planned and executed the whole event with Yuvraj from Panorama Ridge. I built the website it ran on and brought in Generation AI, a group that runs AI-education programs, to fund the prizes, judge the projects, and deliver a keynote from a UBC professor. I wrote the five real business challenges the teams built against, then ran the day itself. Beginners walked in curious and walked out having actually shipped something.',
    ],
    ledger: [
      {
        n: '~70',
        l: 'students, from 14 schools, who showed up to build for a day',
        src: 'group photo',
      },
      {
        n: '1st',
        l: 'the first youth AI summit in Surrey',
      },
      {
        n: '$650',
        l: 'in sponsorship I landed, enough to fund cash prizes and two scholarships',
        src: 'transfer record',
      },
      {
        n: '22K+',
        l: 'views on our launch reels, the campaign that filled every seat',
        src: 'Instagram insights',
      },
    ],
    media: {
      label: 'summit-group.jpg', sub: 'group photo, ~70 students', video: false,
      src: '/img/summit-group.jpg',
      alt: 'Group photo of about 70 students at the Surrey Youth AI Summit, June 23, 2026',
    },
    media2: null,
    live: {
      label: 'Visit the event site',
      note: 'live · site I built',
      href: 'https://surreyaisummit.vercel.app',
    },
    pdfs: [{ label: 'Full case study', href: '/pdf/surrey-ai-summit-case-study.pdf' }],
    quote: null,
    note: {
      eyebrow: 'The keynote',
      big: 'A UBC professor, live',
      sub: 'I lined up Dr. Peter Ostafichuk, a UBC professor of teaching and one of the people behind Generation AI, to give the keynote. In the post-event survey, students named it the best part of the day.',
    },
  },

  {
    slug: 'ai-club',
    name: 'AI & Innovation Club',
    fileLine: 'Active since September 2025 · Founder & president',
    // Plain, one-sentence summary for the home card — no jargon, not truncated.
    cardLine: 'A club I founded where students learn to actually build with AI, not just talk about it.',
    seoTitle: 'AI & Innovation Club: founder & president | F. Aamir Ali',
    seoDescription:
      'The club I founded to teach students to build with AI: 20 members, a real build every meeting, and 22 members who made AI videos for a national Best Buy challenge against more than 40 schools across Canada.',
    ogImage: '/og/ai-club.png',
    tagline:
      'The club I founded so building with AI stops being a niche skill: every meeting ends with something that works.',
    acts: null,
    intro: [
      'I started the club in September 2025, after building FleetBot showed me how few students actually knew how to build with AI. Every meeting is hands-on: members use no-code tools to build real websites, automations, and chatbots, and they leave having shipped something that works instead of just watching a slideshow.',
      "When the Best Buy Teen Tech “Create with AI” Challenge (run with Microsoft) let each school enter only once, I opened it up as an internal contest instead of hand-picking a few people. In the end, 22 members made AI videos, and our winning entry represented the school against more than 40 others across Canada.",
    ],
    ledger: [
      {
        n: '20',
        l: 'active members who build something real every meeting',
        src: "principal's letter",
      },
      {
        n: '~13',
        l: 'hands-on sessions run since I started the club',
        src: 'club record',
      },
      {
        n: '22',
        l: 'members who made AI videos for a national Best Buy challenge',
        src: 'submission record',
      },
      {
        n: '40+',
        l: 'schools across Canada our entry went up against',
        src: 'Best Buy challenge',
      },
    ],
    media: {
      label: 'club.jpg', sub: 'club photo, 20 members', video: false,
      src: '/img/club.jpg',
      alt: 'Group photo of the AI & Innovation Club, 20 active members',
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
