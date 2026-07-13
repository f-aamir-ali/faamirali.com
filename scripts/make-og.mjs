// Generate branded 1200x630 Open Graph images (one per page) with sharp.
// Text-only, on-brand cards (ledger skin: manila paper, ink, bottle-green
// accent, ruled head) — swap in photo-based OG later if desired.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og');

const W = 1200, H = 630;
const CANVAS = '#f1ede5', INK = '#1a1813', MUTED = '#54504a', ACCENT = '#4a2f1d', FAINT = '#6f6a5f';
const SANS = "'Segoe UI','Helvetica Neue',system-ui,Arial,sans-serif";
const MONO = "'Consolas','Courier New',monospace";

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

const pages = [
  { file: 'home', eyebrow: 'BUILDER & FOUNDER · SURREY, BC', title: 'F. Aamir Ali', sub: 'I turn ideas into real, deployed things that people actually use.' },
  { file: 'default', eyebrow: 'BUILDER & FOUNDER · SURREY, BC', title: 'F. Aamir Ali', sub: 'I turn ideas into real, deployed things that people actually use.' },
  { file: 'about', eyebrow: 'ABOUT · F. AAMIR ALI', title: 'The story.', sub: 'Builder & founder from Surrey, BC: the full record.' },
  { file: 'fleetbot', eyebrow: 'F. AAMIR ALI · WORK', title: 'FleetBot', sub: 'Two AI assistants deployed in a 1,500-student school.' },
  { file: 'surrey-ai-summit', eyebrow: 'F. AAMIR ALI · WORK', title: 'Surrey Youth AI Summit', sub: 'About 70 students. 14 schools. One day building real AI.' },
  { file: 'ai-club', eyebrow: 'F. AAMIR ALI · WORK', title: 'AI & Innovation Club', sub: 'Teaching students to build with AI: a real build every meeting.' },
  { file: 'honours', eyebrow: 'F. AAMIR ALI · HONOURS', title: 'Honours', sub: "A recommendation letter, certificates, and scholarship wins." },
];

function svgFor(p) {
  const len = p.title.length;
  const titleSize = len > 18 ? 72 : len > 12 ? 88 : 104;
  const subTspans = wrap(p.sub, 48).slice(0, 3)
    .map((l, i) => `<tspan x="90" dy="${i === 0 ? 0 : 46}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${CANVAS}"/>
    <rect x="86" y="96" width="${W - 172}" height="3" fill="${INK}"/>
    <rect x="90" y="126" width="10" height="10" fill="${ACCENT}"/>
    <text x="116" y="137" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${FAINT}">${esc(p.eyebrow)}</text>
    <text x="86" y="322" font-family="${SANS}" font-weight="800" font-size="${titleSize}" letter-spacing="-2" fill="${INK}">${esc(p.title)}</text>
    <text x="90" y="426" font-family="${SANS}" font-size="34" fill="${MUTED}">${subTspans}</text>
    <rect x="86" y="524" width="${W - 172}" height="1" fill="rgba(28,26,20,0.25)"/>
    <text x="90" y="566" font-family="${MONO}" font-size="22" letter-spacing="2" fill="${FAINT}">faamirali.com</text>
  </svg>`;
}

await mkdir(OUT, { recursive: true });
for (const p of pages) {
  await sharp(Buffer.from(svgFor(p))).png().toFile(join(OUT, `${p.file}.png`));
  console.log('og →', `${p.file}.png`);
}
console.log('done');
