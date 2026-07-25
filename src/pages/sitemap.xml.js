// The sitemap is GENERATED, not hand-maintained.
//
// It used to be a static file in public/, which drifted twice: it carried
// lastmod dates from weeks before the content actually changed, and it would
// have silently omitted every new page unless someone remembered to add it by
// hand. Deriving it from the same data the pages are built from means a new
// project or case study appears in the sitemap the moment it exists.
//
// The PDFs are listed too. Google does index PDFs, but it has to find them
// first, and they are only linked from deep inside a page's proof grid.
import { projects } from '../data/projects.js';
import { caseStudies } from '../data/caseStudies.js';
import { SITE_URL } from '../data/site.js';

const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Newest of the dates we actually know about, so lastmod is never a date in
// the future and never older than the content it describes.
const newest = (...dates) => dates.filter(Boolean).sort().at(-1);

export function GET() {
  const entries = [
    { loc: '/', lastmod: BUILD_DATE, priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', lastmod: BUILD_DATE, priority: '0.9', changefreq: 'monthly' },
    { loc: '/honours', lastmod: BUILD_DATE, priority: '0.7', changefreq: 'monthly' },

    ...projects.map((p) => ({
      loc: `/work/${p.slug}`,
      lastmod: newest(p.updated, p.published) ?? BUILD_DATE,
      priority: '0.8',
      changefreq: 'monthly',
    })),

    ...caseStudies.map((cs) => ({
      loc: `/case-study/${cs.slug}`,
      lastmod: newest(cs.updated, cs.published) ?? BUILD_DATE,
      priority: '0.7',
      changefreq: 'yearly',
    })),

    ...caseStudies.map((cs) => ({
      loc: `/pdf/${cs.pdf}`,
      lastmod: newest(cs.updated, cs.published) ?? BUILD_DATE,
      priority: '0.4',
      changefreq: 'yearly',
    })),

    { loc: '/pdf/recommendation-letter.pdf', lastmod: '2026-06-15', priority: '0.4', changefreq: 'yearly' },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
