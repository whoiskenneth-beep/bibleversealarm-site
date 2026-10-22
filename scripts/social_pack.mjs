// Weekly posting pack for Kenneth: no APIs, he uploads/pastes it himself.
//   seo/social/packs/<date>/pinterest.csv  -> Pinterest "Create pins in bulk" (Settings > Bulk create Pins)
//   seo/social/packs/<date>/threads.md     -> copy-paste posts for the Threads app
// Picks pages not used before (seo/social/posted.json), newest topics first, from public/social.json
// (written by build.mjs, so run `npm run build` first).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cfg = read('seo/social/config.json');
const posted = read('seo/social/posted.json');
const cards = read('public/social.json');
const today = new Date().toISOString().slice(0, 10);
const dir = path.join(ROOT, 'seo/social/packs', today);

const utm = (url, source) => `${url}?utm_source=${source}&utm_medium=social&utm_campaign=verse_card`;
const csv = (s) => `"${String(s).replace(/"/g, '""')}"`;
const fresh = (channel, locs) => cards.filter((c) => locs.includes(c.loc) && !posted[channel][c.url]);

const MORE = { en: 'More verses like this:', es: 'Más versículos como este:', 'zh-hant': '更多相關經文：', 'zh-hans': '更多相关经文：', ko: '관련 말씀 더 보기:' };
const quote = (c) => (c.loc.startsWith('zh') ? `「${c.verse}」` : `“${c.verse}”`);

const out = [];
// Pinterest: one pin per page, verse card image, links back to the page.
const pins = fresh('pinterest', Object.keys(cfg.pinterest.boards)).slice(0, cfg.pinterest.per_week);
if (pins.length) {
  const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
  for (const c of pins) {
    const desc = `${quote(c)} ${c.ref ? `(${c.ref}) ` : ''}${c.description}`.slice(0, 500);
    rows.push([c.h1.slice(0, 100), c.pin, cfg.pinterest.boards[c.loc], '', desc, utm(c.url, 'pinterest'), '', '']);
    posted.pinterest[c.url] = today;
  }
  out.push(['pinterest.csv', rows.map((r) => r.map(csv).join(',')).join('\n') + '\n']);
}
// Threads: short text post (verse + link). The card image is optional to attach.
const threads = fresh('threads', cfg.threads.locales).slice(0, cfg.threads.per_week);
if (threads.length) {
  const md = [`# Threads posts · week of ${today}`, '', 'Post one a day. Copy the text block; attaching the image is optional (long-press the link to save it).', ''];
  threads.forEach((c, i) => {
    md.push(`## ${i + 1}. ${c.h1}`, '', '```', `${quote(c)}${c.ref ? `\n— ${c.ref}` : ''}`, '', `${MORE[c.loc]} ${utm(c.url, 'threads')}`, '```', '', `Image: ${c.pin}`, '');
    posted.threads[c.url] = today;
  });
  out.push(['threads.md', md.join('\n')]);
}

if (!out.length) { console.log('social pack: nothing new this week'); process.exit(0); }
fs.mkdirSync(dir, { recursive: true });
for (const [f, body] of out) fs.writeFileSync(path.join(dir, f), body);
fs.writeFileSync(path.join(ROOT, 'seo/social/posted.json'), JSON.stringify(posted, null, 1) + '\n');
console.log(`social pack ${today}: ${pins.length} pins, ${threads.length} threads posts -> seo/social/packs/${today}/`);
