// Weekly report, written by a script so it never depends on a bot run having budget left.
// Runs inside the daily data workflow; writes seo/reports/weekly/<Monday, MYT>.md once per week
// (skips if this week's file exists, so a missed day is simply caught up the next day).
// Numbers come only from seo/rankings/history.csv, seo/governor.json, geo/sov.json,
// seo/experiments.csv and seo/NEEDS_HUMAN.md. Search Console lags 2-3 days, so each window
// ends at the latest date present in the data, not today.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const day = (d) => d.toISOString().slice(0, 10);
const addDays = (iso, n) => day(new Date(Date.parse(iso) + n * 864e5));

// Monday of the current week in Malaysia time (the schedule's market).
const myt = new Date(Date.now() + 8 * 3600e3);
const monday = day(new Date(myt - ((myt.getUTCDay() + 6) % 7) * 864e5));
const out = path.join(ROOT, 'seo/reports/weekly', `${monday}.md`);
if (fs.existsSync(out) && !process.argv.includes('--force')) {
  console.log(`weekly report ${monday} already exists`);
  process.exit(0);
}

// ---------- CSV ----------
const parseCsv = (text) => {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
};

const hist = parseCsv(read('seo/rankings/history.csv'));
const end = hist.map((r) => r.date).sort().at(-1);
const win = (fromBack, len = 7) => [addDays(end, -fromBack - len + 1), addDays(end, -fromBack)];
const windows = { now: win(0), prev: win(7), m4: win(28) };
const LOCALES = ['en', 'es', 'zh-hant', 'zh-hans', 'ko'];

function stats(locale, [a, b]) {
  const rows = hist.filter((r) => r.date >= a && r.date <= b && (!locale || r.locale === locale));
  const imp = rows.reduce((s, r) => s + +r.impressions, 0);
  const clk = rows.reduce((s, r) => s + +r.clicks, 0);
  const pos = imp ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / imp : null;
  const byQ = {};
  for (const r of rows) { const q = (byQ[r.keyword] ||= [0, 0]); q[0] += +r.impressions; q[1] += r.position * r.impressions; }
  const qpos = Object.values(byQ).map(([i, w]) => w / i);
  return { imp, clk, pos, top3: qpos.filter((p) => p <= 3).length, top10: qpos.filter((p) => p <= 10).length, top20: qpos.filter((p) => p <= 20).length };
}
const fmtPos = (p) => (p == null ? '–' : p.toFixed(1));
const delta = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)}%` : a ? 'new' : '–');

const gov = JSON.parse(read('seo/governor.json'));
const L = [];
L.push(`# Weekly report ${monday}`, '');
L.push(`Automatic (scripts/weekly_report.mjs). Search data ${windows.now[0]} to ${windows.now[1]} (Search Console lags 2–3 days); compared with the 7 days before, and the same 7 days four weeks earlier.`, '');

const all = { now: stats(null, windows.now), prev: stats(null, windows.prev), m4: stats(null, windows.m4) };
L.push(`**Whole site:** ${all.now.imp} impressions (${delta(all.now.imp, all.prev.imp)} vs last week, ${delta(all.now.imp, all.m4.imp)} vs 4 weeks ago) · ${all.now.clk} clicks · avg position ${fmtPos(all.now.pos)}`, '');

L.push('| Locale | Impressions (vs last wk) | Clicks | Avg position | Queries top 3 / 10 / 20 | Indexed / published | New pages/day |', '|---|---|---|---|---|---|---|');
for (const loc of LOCALES) {
  const n = stats(loc, windows.now), p = stats(loc, windows.prev);
  const g = gov.locales[loc] || {};
  const idx = g.published ? `${g.indexed}/${g.published} (${Math.round((100 * g.indexed) / g.published)}%)` : '–';
  L.push(`| ${loc} | ${n.imp} (${delta(n.imp, p.imp)}) | ${n.clk} | ${fmtPos(n.pos)} | ${n.top3} / ${n.top10} / ${n.top20} | ${idx} | ${g.new_pages_per_day ?? g.derived_from ?? '–'} |`);
}

// Best positions this week (single queries; low volume, so these are early signals, not stable ranks)
const best = hist.filter((r) => r.date >= windows.now[0]).sort((a, b) => a.position - b.position || b.impressions - a.impressions);
const seen = new Set();
L.push('', '## Best positions this week', '');
for (const r of best) {
  const k = `${r.keyword}|${r.page}`;
  if (seen.has(k)) continue;
  seen.add(k);
  L.push(`- #${(+r.position).toFixed(0)} · ${r.locale} · "${r.keyword}" → ${r.page.replace('https://bibleversealarm.com', '')} (${r.impressions} imp, ${r.clicks} clicks)`);
  if (seen.size >= 10) break;
}
const clicks = hist.filter((r) => r.date >= windows.now[0] && +r.clicks > 0);
if (clicks.length) L.push('', `**Clicks this week:** ${clicks.map((r) => `"${r.keyword}" → ${r.page.replace('https://bibleversealarm.com', '')} (${r.clicks})`).join('; ')}`);

// AI visibility
try {
  const sov = JSON.parse(read('geo/sov.json'));
  const weeks = [...new Set(sov.map((r) => r.week))].sort().slice(-4);
  L.push('', '## AI assistants (Gemini panel: answers naming Bible Verse Alarm)', '');
  L.push(weeks.map((w) => { const rs = sov.filter((r) => r.week === w); return `${w}: ${rs.reduce((s, r) => s + r.hits, 0)}/${rs.reduce((s, r) => s + r.runs, 0)}`; }).join(' · '));
} catch {}

// Experiments due for a verdict
try {
  const today = day(myt);
  const due = parseCsv(read('seo/experiments.csv')).filter((e) => e.review_after && e.review_after <= today && (!e.verdict || e.verdict === 'pending'));
  L.push('', `## Experiments due for a verdict: ${due.length}`, '');
  for (const e of due.slice(0, 8)) L.push(`- ${e.date} ${e.locale} ${e.page}: ${e.change.slice(0, 90)} (baseline: ${e.baseline.slice(0, 60)})`);
} catch {}

// Open human items
try {
  const open = read('seo/NEEDS_HUMAN.md').split('\n').filter((l) => /^## \d+\./.test(l) && !/DONE/i.test(l));
  L.push('', `## Open items for Kenneth: ${open.length}`, '', ...open.map((l) => `- ${l.replace(/^## /, '')}`));
} catch {}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, L.join('\n') + '\n');
console.log(`wrote ${path.relative(ROOT, out)}`);
