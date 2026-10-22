// Verse-card images for every topic/feature page, rendered at build time:
//   <slug>-pin.png  1000x1500  Pinterest / Threads card (hero verse)
//   <slug>-og.png   1200x630   link preview (og:image)
// SVG -> PNG with resvg; fonts are bundled in data/fonts (subset Noto Serif CJK + Fraunces, OFL).
// resvg can't wrap text, so lines are broken here with approximate glyph widths.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const font = (f) => path.join(ROOT, 'data/fonts', f);
const FONTS = {
  latin: [font('Fraunces-SemiBold.ttf')],
  'zh-hant': [font('NotoSerifTC-SemiBold.ttf'), font('Fraunces-SemiBold.ttf')],
  'zh-hans': [font('NotoSerifSC-SemiBold.ttf'), font('Fraunces-SemiBold.ttf')],
  ko: [font('NotoSerifKR-SemiBold.ttf'), font('Fraunces-SemiBold.ttf')],
};
const FAMILY = { 'zh-hant': 'Noto Serif TC', 'zh-hans': 'Noto Serif SC', ko: 'Noto Serif KR' };
const isCJK = (loc) => loc.startsWith('zh');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function charWidth(ch) {
  if (/[　-鿿가-힣＀-￯]/.test(ch)) return 1;
  if (/[ilI.,;:'!|·]/.test(ch)) return 0.28;
  if (/[mwMW]/.test(ch)) return 0.82;
  if (/[A-Z]/.test(ch)) return 0.66;
  if (ch === ' ') return 0.26;
  return 0.52;
}
const width = (s, size) => [...s].reduce((w, ch) => w + charWidth(ch), 0) * size;

// Chinese breaks between any characters (but never puts closing punctuation at a line start);
// Latin and Korean break at spaces.
function wrap(text, maxW, size, loc) {
  const tokens = isCJK(loc) ? [...text] : text.split(/(?<= )/);
  const lines = [];
  let line = '';
  for (const tk of tokens) {
    if (line && width(line + tk, size) > maxW && !/^[，。、；：？！」』）》]/.test(tk)) {
      lines.push(line.trimEnd());
      line = tk.trimStart();
    } else line += tk;
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}
function fit(text, maxW, maxH, loc, sizes) {
  for (const size of sizes) {
    const lines = wrap(text, maxW, size, loc);
    if (lines.length * size * 1.4 <= maxH) return { size, lines };
  }
  const size = sizes.at(-1);
  return { size, lines: wrap(text, maxW, size, loc) };
}

const SKY = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#14112C"/><stop offset="0.55" stop-color="#241F52"/>
<stop offset="0.82" stop-color="#5A3C7C"/><stop offset="1" stop-color="#B9607A"/></linearGradient>
<radialGradient id="sun" cx="0.5" cy="1" r="0.6"><stop offset="0" stop-color="#FFC24B" stop-opacity="0.55"/>
<stop offset="0.5" stop-color="#FF8A5C" stop-opacity="0.18"/><stop offset="1" stop-color="#FF8A5C" stop-opacity="0"/></radialGradient>`;

function textBlock(lines, x, y, size, attrs) {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * size * 1.4}" font-size="${size}" ${attrs}>${esc(l)}</text>`).join('');
}

function pinSvg({ loc, label, verse, ref }) {
  const fam = FAMILY[loc] || 'Fraunces';
  const v = fit(verse, 800, 820, loc, isCJK(loc) ? [64, 58, 52, 46, 40] : [62, 56, 50, 45, 40, 36]);
  const blockH = v.lines.length * v.size * 1.4;
  const top = 300 + (820 - blockH) / 2 + v.size;
  const lab = fit(label, 820, 90, loc, [34, 30, 26]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
<defs>${SKY}</defs>
<rect width="1000" height="1500" fill="url(#sky)"/><rect width="1000" height="1500" fill="url(#sun)"/>
${textBlock(lab.lines, 500, 170, lab.size, `text-anchor="middle" font-family="${fam}" fill="#FFC98F" letter-spacing="${isCJK(loc) || loc === 'ko' ? 2 : 1}"`)}
<rect x="470" y="235" width="60" height="4" rx="2" fill="#FFC24B"/>
${textBlock(v.lines, 500, top, v.size, `text-anchor="middle" font-family="${fam}" fill="#FFFFFF"`)}
<text x="500" y="${top + blockH + 30}" font-size="38" text-anchor="middle" font-family="${fam}" fill="#FFC24B">${esc(ref)}</text>
<text x="500" y="1395" font-size="38" text-anchor="middle" font-family="Fraunces" fill="#FFFFFF">Bible Verse Alarm</text>
<text x="500" y="1445" font-size="26" text-anchor="middle" font-family="Fraunces" fill="#FFFFFF" fill-opacity="0.75">bibleversealarm.com</text>
</svg>`;
}

function ogSvg({ loc, title, sub }) {
  const fam = FAMILY[loc] || 'Fraunces';
  const t = fit(title, 1040, 300, loc, isCJK(loc) ? [72, 64, 56, 48] : [76, 68, 60, 52, 46]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>${SKY}</defs>
<rect width="1200" height="630" fill="url(#sky)"/><rect width="1200" height="630" fill="url(#sun)"/>
<rect x="80" y="90" width="60" height="4" rx="2" fill="#FFC24B"/>
${textBlock(t.lines, 80, 130 + t.size, t.size, `font-family="${fam}" fill="#FFFFFF"`)}
${sub ? `<text x="80" y="500" font-size="32" font-family="${fam}" fill="#FFC98F">${esc(sub)}</text>` : ''}
<text x="80" y="565" font-size="30" font-family="Fraunces" fill="#FFFFFF" fill-opacity="0.8">Bible Verse Alarm · bibleversealarm.com</text>
</svg>`;
}

function png(svg, loc) {
  return new Resvg(svg, {
    font: { fontFiles: FONTS[loc] || FONTS.latin, loadSystemFonts: false, defaultFontFamily: FAMILY[loc] || 'Fraunces' },
  }).render().asPng();
}

// cards: [{ loc, slug (may contain a folder, e.g. topics/anxiety), label, verse, ref, title, sub }] -> writes public/cards/<loc>/<slug>-{pin,og}.png
export function renderCards(outDir, cards) {
  for (const c of cards) {
    const base = path.join(outDir, 'cards', c.loc, c.slug);
    fs.mkdirSync(path.dirname(base), { recursive: true });
    fs.writeFileSync(`${base}-pin.png`, png(pinSvg(c), c.loc));
    fs.writeFileSync(`${base}-og.png`, png(ogSvg(c), c.loc));
  }
}
