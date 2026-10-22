// Pings IndexNow (Bing, Naver, Yandex, Seznam share it) with URLs whose page
// hash changed between two builds' pages.json files.
// Usage: node scripts/indexnow.mjs <old pages.json | -> <new pages.json>
import fs from 'node:fs';

const KEY = '14d6e2adce657fe0f943140ed48f2740';
const [oldPath, newPath] = process.argv.slice(2);
const before = oldPath && oldPath !== '-' && fs.existsSync(oldPath) ? JSON.parse(fs.readFileSync(oldPath, 'utf8')) : {};
const after = JSON.parse(fs.readFileSync(newPath, 'utf8'));
const changed = Object.keys(after).filter((u) => before[u] !== after[u]);
// Sitemaps change whenever any page does.
if (changed.length) changed.push('https://bibleversealarm.com/sitemap.xml');

if (!changed.length) {
  console.log('IndexNow: nothing changed');
  process.exit(0);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'bibleversealarm.com', key: KEY, keyLocation: `https://bibleversealarm.com/${KEY}.txt`, urlList: changed.slice(0, 10000) }),
});
console.log(`IndexNow: ${changed.length} URL(s) -> HTTP ${res.status}`);
console.log(changed.join('\n'));
// 200/202 = accepted. 422/403 usually means the key file is not live yet; not fatal.
