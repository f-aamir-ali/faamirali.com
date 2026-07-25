// Generate the linked case-study PDFs from the source Markdown.
//
// The source now lives IN THE REPO at src/content/case-studies/ and is shared
// with the on-site HTML case-study pages through src/data/caseStudies.js. It
// used to be read from an absolute path in the owner's Downloads folder, which
// meant this script only ran on one machine and the case-study text could
// never take part in a clean checkout or a Vercel build.
//
// The PDF is the FULL record: only `factFixes` are applied here (corrections
// where the markdown contradicted a locked fact). The `siteEdits` layer — the
// site's no-negatives rule — is deliberately NOT applied, so the setbacks,
// the usage curve and the competition result stay in the downloadable
// document. That asymmetry is the whole design: the page is the summary, the
// PDF is the unabridged version.
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { marked } from 'marked';
import { chromium } from 'playwright';
import { caseStudies, renderSource, assertAllApplied } from '../src/data/caseStudies.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'pdf');
const SRC = join(__dirname, '..', 'src', 'content', 'case-studies');

// Print skin — matches the site (cream-adjacent paper kept white for
// print, typewriter ink, single dark-brown accent, ruled heads).
const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  :root{ --ink:#1a1813; --accent:#4a2f1d; --muted:#5c574b; --line:#e3ded2; }
  * { box-sizing: border-box; }
  body { font-family:'Archivo',system-ui,sans-serif; color:var(--ink); font-size:10.6pt; line-height:1.62; margin:0; }
  .brand { display:flex; align-items:center; gap:9px; font-family:'IBM Plex Mono',monospace; font-size:9pt; letter-spacing:0.06em; color:var(--muted); text-transform:uppercase; padding-bottom:14px; margin-bottom:26px; border-bottom:2px solid var(--ink); }
  .brand .bdot { width:8px; height:8px; border-radius:50%; background:var(--accent); display:inline-block; }
  h1 { font-size:24pt; font-weight:800; letter-spacing:-0.01em; line-height:1.12; margin:0 0 6px; }
  h2 { font-size:14.5pt; font-weight:700; letter-spacing:-0.01em; margin:26px 0 8px; padding-top:8px; border-top:1px solid var(--line); }
  h3 { font-size:11.5pt; font-weight:700; margin:18px 0 6px; }
  p { margin:0 0 10px; }
  a { color:var(--accent); text-decoration:none; }
  strong { font-weight:700; }
  em { font-style:italic; }
  blockquote { margin:14px 0; padding:6px 0 6px 16px; border-left:3px solid var(--accent); color:var(--muted); font-style:italic; font-family:'Newsreader',Georgia,serif; font-size:12.5pt; }
  ul, ol { margin:0 0 12px; padding-left:20px; }
  li { margin:3px 0; }
  code { font-family:'IBM Plex Mono',monospace; font-size:9pt; background:#f2efe7; padding:1px 5px; border-radius:3px; }
  pre { background:#f2efe7; padding:12px 14px; border-radius:4px; overflow:auto; }
  pre code { background:none; padding:0; }
  table { width:100%; border-collapse:collapse; margin:12px 0; font-size:9.6pt; }
  th, td { border:1px solid var(--line); padding:7px 10px; text-align:left; vertical-align:top; }
  th { background:#f2efe7; font-weight:700; }
  hr { border:none; border-top:1px solid var(--line); margin:22px 0; }
  h1, h2, h3 { break-after:avoid; }
  table, blockquote, pre { break-inside:avoid; }
`;

function htmlDoc(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@1,6..72,400..600&display=swap" rel="stylesheet">
  <style>${PRINT_CSS}</style></head>
  <body><div class="brand"><span class="bdot"></span> F. Aamir Ali · faamirali.com · Case study</div>${body}</body></html>`;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  for (const doc of caseStudies) {
    const raw = await readFile(join(SRC, doc.file), 'utf8');
    const { markdown, applied } = renderSource(raw, doc, { forSite: false });
    // A factFix that stopped matching means the PDF is about to ship a number
    // the site contradicts. Fail loudly rather than publish the mismatch.
    assertAllApplied(doc, applied, { forSite: false });
    const body = marked.parse(markdown);
    const html = htmlDoc(doc.docTitle, body);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: join(OUT, doc.pdf),
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="font-size:8px;color:#9a948a;width:100%;padding:0 16mm;text-align:right;font-family:monospace;">faamirali.com · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '18mm', bottom: '16mm', left: '16mm', right: '16mm' },
    });
    await page.close();
    console.log('pdf →', doc.pdf);
  }
} finally {
  await browser.close();
}
console.log('done');
