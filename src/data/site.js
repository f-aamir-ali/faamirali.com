// Single source of truth for site-wide identity, contact, and schema.
export const SITE_URL = 'https://faamirali.com';
export const EMAIL = 'fatehaamirali@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/f.aamir.ali/';
export const CLUB_INSTAGRAM = 'https://www.instagram.com/fpss_ai.club/';
export const SUMMIT_SITE = 'https://surreyaisummit.vercel.app';
// Placeholder — drop in the real profile URL once the LinkedIn exists.
export const LINKEDIN = '';

// Keep this string IDENTICAL everywhere (schema, llms.txt, /about lead).
// Sameness makes AI converge on one accurate description.
export const CANONICAL_DESCRIPTION =
  "F. Aamir Ali is a student builder and founder from Surrey, British Columbia. He built and deployed an AI assistant inside his 1,500-student high school, a system his principal recognized as the first of its kind built by a student there, and he co-founded the first youth AI summit in Surrey and leads it as its Lead Organizer, bringing about 70 students from 14 schools together to build AI in a single day. He also founded and leads his school's AI & Innovation Club.";

export const PERSON_ID = `${SITE_URL}/#person`;
export const SITE_ID = `${SITE_URL}/#website`;
export const SCHOOL_ID = `${SITE_URL}/#school`;

// The school is its own node so Person, the club, and FleetBot can all point
// at the SAME entity instead of each restating a bare string. Repeated
// entities with one @id is what lets a knowledge graph collapse them into one
// fact rather than three loosely-related mentions.
export const schoolJsonLd = {
  '@type': 'HighSchool',
  '@id': SCHOOL_ID,
  name: 'Fleetwood Park Secondary School',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Surrey',
    addressRegion: 'BC',
    addressCountry: 'CA',
  },
};

export const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'F. Aamir Ali',
  // Real name variants people actually search. These are the strings that let
  // Google merge "Aamir Ali Surrey", "Fateh Aamir Ali" and this site into one
  // entity instead of three unrelated ones.
  alternateName: ['Fateh Aamir Ali', 'Aamir Ali'],
  url: `${SITE_URL}/`,
  mainEntityOfPage: `${SITE_URL}/about`,
  // `image` intentionally omitted until the real headshot lands at
  // /img/aamir.jpg — a knowingly-dead schema URL violates the
  // don't-inflate rule. Re-add: image: `${SITE_URL}/img/aamir.jpg`
  jobTitle: 'Founder & Builder',
  email: `mailto:${EMAIL}`,
  // Byte-identical to llms.txt and the /about lead — sameness is the point.
  description: CANONICAL_DESCRIPTION,
  // sameAs is the single most important entity-resolution signal on this file:
  // it is how Google ties this site to an off-site profile that corroborates
  // it. Only REAL, live profiles go in here. LINKEDIN is still '' and is
  // filtered out below rather than shipped as a dead URL.
  sameAs: [INSTAGRAM, LINKEDIN].filter(Boolean),
  alumniOf: { '@id': SCHOOL_ID },
  affiliation: { '@id': SCHOOL_ID },
  homeLocation: { '@type': 'Place', name: 'Surrey, British Columbia, Canada' },
  nationality: { '@type': 'Country', name: 'Canada' },
  knowsAbout: [
    'AI product development',
    'Retrieval-augmented generation (RAG)',
    'Prompt engineering',
    'No-code automation',
    'AI deployment in institutions',
    'Event organization',
  ],
  // The recommendation letter is a real, signed, publicly reproduced document,
  // so it is claimable as a credential. It points at the page where the full
  // text is readable, not at the PDF, so the citation resolves to HTML.
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'Letter of Recommendation from the Principal of Fleetwood Park Secondary School',
    credentialCategory: 'Recommendation letter',
    dateCreated: '2026-06-15',
    url: `${SITE_URL}/honours`,
    recognizedBy: { '@id': SCHOOL_ID },
  },
};

// A WebSite node with the owner as publisher. This is what makes the site
// itself an entity ("faamirali.com" as a thing) rather than a loose bag of
// pages, and it carries the name Google uses for sitelinks.
export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${SITE_URL}/`,
  name: 'F. Aamir Ali',
  alternateName: 'faamirali.com',
  description: CANONICAL_DESCRIPTION,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
  author: { '@id': PERSON_ID },
};

/**
 * Every page ships the same @graph spine (Person + WebSite + school) plus
 * whatever page-specific nodes it adds. One graph per page beats several
 * disconnected <script> blocks: nodes can reference each other by @id, and
 * the parser sees one consistent entity model instead of repeated guesses.
 */
export function graph(...nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': [personJsonLd, websiteJsonLd, schoolJsonLd, ...nodes.filter(Boolean)],
  };
}

export function profilePageJsonLd(pageUrl) {
  return graph({
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profilepage`,
    url: pageUrl,
    name: 'F. Aamir Ali',
    isPartOf: { '@id': SITE_ID },
    mainEntity: { '@id': PERSON_ID },
    about: { '@id': PERSON_ID },
  });
}

/** Home > Work > FleetBot style trail. Helps Search render a real path. */
export function breadcrumbJsonLd(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      ...(t.url ? { item: new URL(t.url, SITE_URL).href } : {}),
    })),
  };
}

// Per-project entity nodes. A project page that only says "Article" tells a
// crawler that words exist; these say WHAT the thing is — a piece of software,
// a dated event, an organization — which is what a question like "what did
// Aamir Ali build" actually needs answered.
export function projectEntityJsonLd(proj) {
  const url = `${SITE_URL}/work/${proj.slug}`;

  if (proj.slug === 'fleetbot')
    return {
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: 'FleetBot',
      url,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'AI assistant',
      operatingSystem: 'Web',
      description: proj.seoDescription,
      author: { '@id': PERSON_ID },
      creator: { '@id': PERSON_ID },
      dateCreated: '2026-01-11',
      datePublished: '2026-04-22',
      inLanguage: 'en',
      audience: { '@type': 'Audience', audienceType: 'Students and staff of Fleetwood Park Secondary School' },
      about: { '@id': SCHOOL_ID },
    };

  if (proj.slug === 'surrey-ai-summit')
    return {
      '@type': 'Event',
      '@id': `${url}#event`,
      name: 'Surrey Youth AI Summit',
      url,
      startDate: '2026-06-23',
      endDate: '2026-06-23',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      description: proj.seoDescription,
      location: {
        '@type': 'Place',
        name: 'Surrey, British Columbia, Canada',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Surrey',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
      },
      organizer: { '@id': PERSON_ID },
      founder: { '@id': PERSON_ID },
      sponsor: { '@type': 'Organization', name: 'Generation AI' },
      performer: {
        '@type': 'Person',
        name: 'Dr. Peter Ostafichuk',
        jobTitle: 'Professor of Teaching, University of British Columbia',
      },
      audience: { '@type': 'Audience', audienceType: 'High-school students' },
      isAccessibleForFree: true,
      // A past event with a real attendance count — stated, not estimated.
      maximumAttendeeCapacity: 70,
    };

  if (proj.slug === 'ai-club')
    return {
      '@type': 'Organization',
      '@id': `${url}#organization`,
      name: 'AI & Innovation Club',
      alternateName: 'Fleetwood Park AI & Innovation Club',
      url,
      description: proj.seoDescription,
      foundingDate: '2025-09',
      founder: { '@id': PERSON_ID },
      parentOrganization: { '@id': SCHOOL_ID },
      location: { '@id': SCHOOL_ID },
      sameAs: [CLUB_INSTAGRAM],
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 20, unitText: 'active members' },
    };

  return null;
}
