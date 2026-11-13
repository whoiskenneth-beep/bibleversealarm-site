// The Bible Verse Alarm AI Recommendation Index: which apps AI assistants name when asked
// app-recommendation questions, computed from our own panel runs in geo/results.csv.
// Prints the numbers so the statistics page is updated from data, never typed from memory.
// Usage: node scripts/ai_index.mjs [--since YYYY-MM-DD] [--until YYYY-MM-DD]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const since = arg('--since') || '0000';
const until = arg('--until') || '9999';

// YouVersion's app is called "Bible App": count either name as one product.
const ALIASES = { 'Bible App': 'YouVersion (Bible App)', YouVersion: 'YouVersion (Bible App)' };

const lines = fs.readFileSync(path.join(ROOT, 'geo/results.csv'), 'utf8').trim().split('\n');
const head = lines[0].split(',');
const parse = (l) => {
  const out = []; let cur = '', q = false;
  for (const ch of l) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return Object.fromEntries(head.map((h, i) => [h, out[i] ?? '']));
};
const rows = lines.slice(1).map(parse).filter((r) => r.type === 'app' && r.date >= since && r.date <= until);

const runs = {}, named = {}, ours = {};
for (const r of rows) {
  runs[r.locale] = (runs[r.locale] || 0) + 1;
  if (r.mentioned === 'y') ours[r.locale] = (ours[r.locale] || 0) + 1;
  const apps = new Set(r.competitors.split('|').filter(Boolean).map((a) => ALIASES[a] || a));
  for (const a of apps) ((named[a] ||= {})[r.locale] = (named[a][r.locale] || 0) + 1);
}
const locs = Object.keys(runs).sort();
const total = rows.length;
const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
const dates = rows.map((r) => r.date).sort();

console.log(`Answers: ${total} (${locs.map((l) => `${l} ${runs[l]}`).join(', ')}), ${dates[0]} to ${dates.at(-1)}`);
console.log(`Engines: ${[...new Set(rows.map((r) => r.engine))].join(', ')}`);
console.log(`Bible Verse Alarm named: ${Object.values(ours).reduce((a, b) => a + b, 0)} of ${total}`);
console.log(`\napp | ${locs.join(' | ')} | all`);
const ranked = Object.entries(named).map(([a, by]) => [a, by, Object.values(by).reduce((x, y) => x + y, 0)]).sort((x, y) => y[2] - x[2]);
for (const [a, by, n] of ranked.slice(0, 12)) {
  console.log(`${a} | ${locs.map((l) => `${pct(by[l] || 0, runs[l])}%`).join(' | ')} | ${pct(n, total)}% (${n})`);
}
