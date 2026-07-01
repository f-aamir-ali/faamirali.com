// Generate the linked case-study PDFs from the source Markdown.
// Lightly filtered: removes explicitly future/planning sections so the PDFs
// match the site's "only what's already done" rule. Club count normalized to 20.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { marked } from 'marked';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'pdf');
const SRC = 'C:/Users/fateh/Downloads/College Applications/Main Projects';

const studentPath = `${SRC}/FleetBot (Student)/FleetBot Student Case Study.md`;
const staffPath = `${SRC}/FleetBot (Staff)/FleetBot Staff Case Study.md`;
const syaisPath = `${SRC}/SYAIS/SYAIS Case Study.md`;
const clubPath = `${SRC}/AI Club/AI Club Case Study.md`;

// --- filtering helpers ---
function dropSections(lines, headings) {
  for (const h of headings) {
    const start = lines.findIndex((l) => l.startsWith('## ') && l.includes(h));
    if (start !== -1) {
      let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
      if (end === -1) end = lines.length;
      lines.splice(start, end - start);
    }
  }
  return lines;
}
function dropBlocks(lines, markers) {
  for (const m of markers) {
    let i = lines.findIndex((l) => l.includes(m));
    while (i !== -1) {
      let end = i + 1;
      while (end < lines.length && !(lines[end].trim() === '---' || lines[end].startsWith('## '))) end++;
      lines.splice(i, end - i);
      i = lines.findIndex((l) => l.includes(m));
    }
  }
  return lines;
}
function filterMd(md, { sections = [], blocks = [], lines: dropLines = [], replacements = [] } = {}) {
  let lines = md.split('\n');
  lines = dropSections(lines, sections);
  lines = dropBlocks(lines, blocks);
  if (dropLines.length) lines = lines.filter((l) => !dropLines.some((d) => l.includes(d)));
  let out = lines.join('\n');
  for (const [a, b] of replacements) out = out.split(a).join(b);
  return out;
}

const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  :root{ --ink:#1a1813; --accent:#d9402a; --muted:#5a564e; --line:#e4dfd4; }
  * { box-sizing: border-box; }
  body { font-family:'Schibsted Grotesk',system-ui,sans-serif; color:var(--ink); font-size:10.6pt; line-height:1.62; margin:0; }
  .brand { display:flex; align-items:center; gap:9px; font-family:'IBM Plex Mono',monospace; font-size:9pt; letter-spacing:0.04em; color:var(--muted); text-transform:uppercase; padding-bottom:14px; margin-bottom:26px; border-bottom:1px solid var(--line); }
  .brand .bdot { width:8px; height:8px; border-radius:50%; background:var(--accent); display:inline-block; }
  h1 { font-size:25pt; font-weight:800; letter-spacing:-0.02em; line-height:1.1; margin:0 0 6px; }
  h2 { font-size:15pt; font-weight:700; letter-spacing:-0.01em; margin:26px 0 8px; padding-top:6px; }
  h3 { font-size:12pt; font-weight:700; margin:18px 0 6px; }
  h2 { border-top:1px solid var(--line); }
  p { margin:0 0 10px; }
  a { color:var(--accent); text-decoration:none; }
  strong { font-weight:700; }
  em { font-style:italic; }
  blockquote { margin:14px 0; padding:6px 0 6px 16px; border-left:3px solid var(--accent); color:var(--muted); font-style:italic; font-family:'Instrument Serif',Georgia,serif; font-size:13pt; }
  ul, ol { margin:0 0 12px; padding-left:20px; }
  li { margin:3px 0; }
  code { font-family:'IBM Plex Mono',monospace; font-size:9pt; background:#f4f1ea; padding:1px 5px; border-radius:4px; }
  pre { background:#f4f1ea; padding:12px 14px; border-radius:8px; overflow:auto; }
  pre code { background:none; padding:0; }
  table { width:100%; border-collapse:collapse; margin:12px 0; font-size:9.6pt; }
  th, td { border:1px solid var(--line); padding:7px 10px; text-align:left; vertical-align:top; }
  th { background:#f4f1ea; font-weight:700; }
  hr { border:none; border-top:1px solid var(--line); margin:22px 0; }
  h1, h2, h3 { break-after:avoid; }
  table, blockquote, pre { break-inside:avoid; }
  .page-break { break-before:page; }
`;

function htmlDoc(title, bodies) {
  const inner = bodies.join('\n<div class="page-break"></div>\n');
  return `<!doctype html><html><head><meta charset="utf-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Schibsted+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${PRINT_CSS}</style></head>
  <body><div class="brand"><span class="bdot"></span> F. Aamir Ali · faamirali.com · Case study</div>${inner}</body></html>`;
}

const docs = [
  {
    out: 'fleetbot-case-study.pdf',
    title: 'FleetBot — Case Study',
    sources: [
      { path: studentPath, filters: { blocks: ['What I could still add'] } },
      { path: staffPath, filters: { blocks: ['What would make it even stronger'] } },
    ],
  },
  {
    out: 'surrey-ai-summit-case-study.pdf',
    title: 'Surrey Youth AI Summit — Case Study',
    sources: [
      {
        path: syaisPath,
        filters: {
          lines: ['Set things up with Generation AI to', 'both of us want to run it again', 'The relationship is the long game'],
          blocks: ["Stuff worth grabbing while it's fresh"],
        },
      },
    ],
  },
  {
    out: 'ai-club-case-study.pdf',
    title: 'AI & Innovation Club — Case Study',
    sources: [
      {
        path: clubPath,
        filters: {
          sections: ['Making sure it survives after me'],
          blocks: ['worth grabbing to make it stronger'],
          lines: ['Building an exec selection and handover process'],
          replacements: [
            ['16 active members', '20 active members'],
            ['all 16 members', 'all 20 members'],
            ['(the number of people in our group photo)', '(active, hands-on members)'],
          ],
        },
      },
    ],
  },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  for (const doc of docs) {
    const bodies = [];
    for (const s of doc.sources) {
      const md = await readFile(s.path, 'utf8');
      bodies.push(marked.parse(filterMd(md, s.filters)));
    }
    const html = htmlDoc(doc.title, bodies);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: join(OUT, doc.out),
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="font-size:8px;color:#9a948a;width:100%;padding:0 16mm;text-align:right;font-family:monospace;">faamirali.com · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '18mm', bottom: '16mm', left: '16mm', right: '16mm' },
    });
    await page.close();
    console.log('pdf →', doc.out);
  }
} finally {
  await browser.close();
}
console.log('done');
