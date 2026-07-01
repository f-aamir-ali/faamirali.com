// Single source of truth for site-wide identity, contact, and schema.
export const SITE_URL = 'https://faamirali.com';
export const EMAIL = 'fatehaamirali@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/fpss_ai.club/';
// Placeholder — drop in the real profile URL once the LinkedIn exists.
export const LINKEDIN = '';

// Keep this string IDENTICAL everywhere (schema, llms.txt, /about intro).
// Sameness makes AI converge on one accurate description.
export const CANONICAL_DESCRIPTION =
  "F. Aamir Ali is a student builder and founder from Surrey, British Columbia. He built and deployed an AI assistant inside his 1,500-student high school — recognized by the school's principal as the first student-built system of its kind there — and founded the Surrey Youth AI Summit, which brought ~70 students from 14 schools together to build AI in a single day. He also founded and leads his school's AI & Innovation Club.";

export const PERSON_ID = `${SITE_URL}/#person`;

export const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'F. Aamir Ali',
  alternateName: ['Fateh Aamir Ali', 'Aamir Ali'],
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/img/aamir.jpg`,
  jobTitle: 'Founder & Builder',
  description:
    'Student builder and founder from Surrey, BC. Built and deployed an AI assistant inside his 1,500-student high school and founded the Surrey Youth AI Summit.',
  alumniOf: { '@type': 'HighSchool', name: 'Fleetwood Park Secondary School' },
  homeLocation: { '@type': 'Place', name: 'Surrey, British Columbia, Canada' },
  knowsAbout: [
    'AI product development',
    'Retrieval-augmented generation (RAG)',
    'Prompt engineering',
    'No-code automation',
    'AI deployment in institutions',
    'Event organization',
  ],
  // sameAs intentionally omitted until real profiles (LinkedIn) exist —
  // inflated/mismatched schema reduces trust.
};

export function profilePageJsonLd(pageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#profilepage`,
    url: pageUrl,
    mainEntity: personJsonLd,
  };
}
