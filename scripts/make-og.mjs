// Generate branded 1200x630 Open Graph images (one per page) with sharp.
// Text-only, on-brand cards — swap in photo-based OG later if desired.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og');

const W = 1200, H = 630;
const CANVAS = '#f1ede5', INK = '#1a1813', MUTED = '#54504a', ACCENT = '#d9402a', FAINT = '#6f6a5f';
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
  { file: 'home', eyebrow: 'BUILDER & FOUNDER · SURREY, BC', title: 'F. Aamir Ali', sub: 'I find hard problems and turn them into things that work.' },
  { file: 'default', eyebrow: 'BUILDER & FOUNDER · SURREY, BC', title: 'F. Aamir Ali', sub: 'I find hard problems and turn them into things that work.' },
  { file: 'about', eyebrow: 'ABOUT · F. AAMIR ALI', title: 'The story.', sub: 'Builder & founder from Surrey, BC — the full background.' },
  { file: 'fleetbot', eyebrow: 'F. AAMIR ALI · WORK', title: 'FleetBot', sub: 'An AI assistant I built & deployed in a 1,500-student school.' },
  { file: 'surrey-ai-summit', eyebrow: 'F. AAMIR ALI · WORK', title: 'Surrey Youth AI Summit', sub: '~70 students. 14 schools. One day building real AI.' },
  { file: 'ai-club', eyebrow: 'F. AAMIR ALI · WORK', title: 'AI & Innovation Club', sub: 'Teaching students to actually build with AI.' },
];

function svgFor(p) {
  const len = p.title.length;
  const titleSize = len > 18 ? 72 : len > 12 ? 88 : 104;
  const subTspans = wrap(p.sub, 48).slice(0, 3)
    .map((l, i) => `<tspan x="90" dy="${i === 0 ? 0 : 46}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${CANVAS}"/>
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="28" fill="none" stroke="rgba(26,24,19,0.12)"/>
    <circle cx="98" cy="133" r="7" fill="${ACCENT}"/>
    <text x="116" y="141" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${FAINT}">${esc(p.eyebrow)}</text>
    <text x="86" y="322" font-family="${SANS}" font-weight="800" font-size="${titleSize}" letter-spacing="-2" fill="${INK}">${esc(p.title)}</text>
    <text x="90" y="426" font-family="${SANS}" font-size="34" fill="${MUTED}">${subTspans}</text>
    <text x="90" y="566" font-family="${MONO}" font-size="22" letter-spacing="2" fill="${FAINT}">faamirali.com</text>
  </svg>`;
}

await mkdir(OUT, { recursive: true });
for (const p of pages) {
  await sharp(Buffer.from(svgFor(p))).png().toFile(join(OUT, `${p.file}.png`));
  console.log('og →', `${p.file}.png`);
}
console.log('done');
