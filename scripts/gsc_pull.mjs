// Pulls Google Search Console data into the repo (run daily by .github/workflows/data.yml).
//  - seo/rankings/history.csv   one row per date x query x page x country (appended, deduped by date)
//  - seo/data/indexation.json   URL Inspection verdict for every sitemap URL
//  - seo/governor.json          indexation rate per locale (velocity itself is set by the analyst)
// Needs env GSC_SERVICE_ACCOUNT_JSON (the service-account key JSON). No deps.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROPERTY = process.env.GSC_PROPERTY || 'sc-domain:bibleversealarm.com';
const SITE = 'https://bibleversealarm.com';
const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!raw) { console.log('GSC_SERVICE_ACCOUNT_JSON not set; skipping GSC pull'); process.exit(0); }
const sa = JSON.parse(raw);

async function token() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}
const tok = await token();
const api = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return res.json();
};

const localeOf = (page) => {
  const p = page.replace(SITE, '');
  return (p.match(/^\/(es|ko|zh-hant|zh-hans)(\/|$)/) || [, 'en'])[1];
};
const day = (offset) => new Date(Date.now() - offset * 864e5).toISOString().slice(0, 10);

// ---- Search analytics: last 10 days (GSC lags 2-3 days; re-pulling overwrites partial days) ----
const start = day(10), end = day(1);
const rows = [];
for (let startRow = 0; ; startRow += 25000) {
  const r = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
    startDate: start, endDate: end, dimensions: ['date', 'query', 'page', 'country'], rowLimit: 25000, startRow, dataState: 'all',
  });
  rows.push(...(r.rows || []));
  if (!r.rows || r.rows.length < 25000) break;
}
const histPath = path.join(ROOT, 'seo/rankings/history.csv');
const header = 'date,locale,keyword,position,clicks,impressions,page,country';
const csv = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : s);
const kept = fs.existsSync(histPath)
  ? fs.readFileSync(histPath, 'utf8').trim().split('\n').slice(1).filter((l) => l && l.slice(0, 10) < start)
  : [];
const fresh = rows.map(({ keys: [d, q, page, country], position, clicks, impressions }) =>
  [d, localeOf(page), csv(q), position.toFixed(1), clicks, impressions, csv(page), country].join(','));
fs.mkdirSync(path.dirname(histPath), { recursive: true });
fs.writeFileSync(histPath, [header, ...kept, ...fresh].join('\n') + '\n');
console.log(`GSC: ${rows.length} rows for ${start}..${end}`);

// ---- Search appearance (AI Overviews / AI Mode show up here if Google exposes them for our property) ----
try {
  const sa = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
    startDate: day(28), endDate: end, dimensions: ['searchAppearance'], rowLimit: 100, dataState: 'all',
  });
  fs.mkdirSync(path.join(ROOT, 'seo/data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'seo/data/search_appearance.json'), JSON.stringify({ checked: day(0), rows: sa.rows || [] }, null, 1));
  console.log('Search appearance types:', (sa.rows || []).map((r) => r.keys[0]).join(', ') || 'none yet');
} catch (e) { console.log('search appearance:', String(e.message).slice(0, 120)); }

// ---- URL Inspection for every sitemap URL (quota 2000/day; fine at our size) ----
const urls = [];
for (const sm of fs.readdirSync(path.join(ROOT, 'public/sitemaps'))) {
  for (const m of fs.readFileSync(path.join(ROOT, 'public/sitemaps', sm), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
}
const idxPath = path.join(ROOT, 'seo/data/indexation.json');
const prev = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : {};
const out = {};
for (const url of urls.slice(0, 1900)) {
  try {
    const r = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: PROPERTY });
    const s = r.inspectionResult?.indexStatusResult || {};
    out[url] = { verdict: s.verdict, coverage: s.coverageState, lastCrawl: s.lastCrawlTime || null, firstSeen: prev[url]?.firstSeen || day(0), checked: day(0) };
  } catch (e) {
    out[url] = { ...(prev[url] || {}), error: String(e.message).slice(0, 200), firstSeen: prev[url]?.firstSeen || day(0) };
  }
}
fs.mkdirSync(path.dirname(idxPath), { recursive: true });
fs.writeFileSync(idxPath, JSON.stringify(out, null, 1));

// ---- Indexation per locale into governor.json (velocity fields are left to the analyst) ----
const govPath = path.join(ROOT, 'seo/governor.json');
const gov = JSON.parse(fs.readFileSync(govPath, 'utf8'));
for (const loc of Object.keys(gov.locales)) {
  const mine = Object.entries(out).filter(([u]) => localeOf(u) === loc);
  const indexed = mine.filter(([, v]) => v.verdict === 'PASS').length;
  gov.locales[loc].published = mine.length;
  gov.locales[loc].indexed = indexed;
  gov.locales[loc].indexation_rate = mine.length ? +(indexed / mine.length).toFixed(2) : null;
}
gov.indexation_updated = day(0);
fs.writeFileSync(govPath, JSON.stringify(gov, null, 2) + '\n');
console.log('Indexation:', Object.fromEntries(Object.entries(gov.locales).map(([l, v]) => [l, `${v.indexed}/${v.published}`])));
