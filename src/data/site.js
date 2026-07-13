// Single source of truth for site-wide identity, contact, and schema.
export const SITE_URL = 'https://faamirali.com';
export const EMAIL = 'fatehaamirali@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/f.aamir.ali/';
// Placeholder — drop in the real profile URL once the LinkedIn exists.
export const LINKEDIN = '';

// Keep this string IDENTICAL everywhere (schema, llms.txt, /about lead).
// Sameness makes AI converge on one accurate description.
export const CANONICAL_DESCRIPTION =
  "F. Aamir Ali is a student builder and founder from Surrey, British Columbia. He built and deployed an AI assistant inside his 1,500-student high school, a system his principal recognized as the first of its kind built by a student there, and he planned and executed the first youth AI summit in Surrey, bringing about 70 students from 14 schools together to build AI in a single day. He also founded and leads his school's AI & Innovation Club.";

export const PERSON_ID = `${SITE_URL}/#person`;

export const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'F. Aamir Ali',
  alternateName: ['Fateh Aamir Ali', 'Aamir Ali'],
  url: `${SITE_URL}/`,
  // `image` intentionally omitted until the real headshot lands at
  // /img/aamir.jpg — a knowingly-dead schema URL violates the
  // don't-inflate rule. Re-add: image: `${SITE_URL}/img/aamir.jpg`
  jobTitle: 'Founder & Builder',
  // Byte-identical to llms.txt and the /about lead — sameness is the point.
  description: CANONICAL_DESCRIPTION,
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
