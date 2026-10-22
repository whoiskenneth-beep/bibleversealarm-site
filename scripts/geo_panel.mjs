// AI-answer prompt panel: asks each prompt in geo/prompts/<locale>.csv to Gemini with Google Search
// grounding (free tier), 3 runs each, and appends to geo/results.csv whether Bible Verse Alarm was
// mentioned or cited and which competitor apps were named. Then recomputes geo/sov.json.
// Env: GEMINI_API_KEY (skips cleanly if missing), GEO_LOCALES=en,es (default all), GEO_RUNS=3.
// Gemini is the only engine with a usable free API tier (2026-10); ChatGPT, Perplexity, Copilot,
// Google AI Mode and Naver are checked by hand (seo/NEEDS_HUMAN.md).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const KEY = process.env.GEMINI_API_KEY;
// Free tier allows only ~20 requests/day (2026-10), so default = app prompts, 1 run, one locale per day.
const RUNS = +(process.env.GEO_RUNS || 1);
const TYPES = (process.env.GEO_TYPES || 'app').split(',');
const LOCS = (process.env.GEO_LOCALES || 'en,es,zh,ko').split(',');
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Our name is also a generic phrase ("a Bible verse alarm app"), so a mention counts only as the proper
// name (exact capitals) or the domain; when the prompt itself says "verse alarm", only a listed product
// (**Bible Verse Alarm** in markdown) or the domain counts.
const US_STRICT = [/\*\*Bible Verse Alarm\*\*/, /bibleversealarm/i];
const US_NAME = [/Bible Verse Alarm(?! (?:apps?|Clock|clock)\b)/, /bibleversealarm/i]; // "Bible Verse Alarm Clock" is an unrelated Android app
const COMPETITORS = ['YouVersion', 'Bible App', 'Glorify', 'Hallow', 'Abide', 'Pray.com', 'Alarmy', 'Dwell', 'Lectio 365',
  'Bible Memory', 'Verses', 'Scripture Typer', 'Remember Me', 'Fighter Verses', 'Bible Gateway', 'Olive Tree', 'Logos',
  'Daily Bible Verse', 'iDisciple', 'First 5', 'Bible Chat', 'Faith Alarm', 'Christian Alarm', 'Morning Prayer'];

const parseCsv = (txt) => txt.trim().split('\n').slice(1).map((l) => {
  const [id, type, market, ...rest] = l.split(',');
  return { id, type, market, prompt: rest.join(',').replace(/^"|"$/g, '') };
});
const csv = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

async function ask(prompt, model = MODEL, search = SEARCH) {
  try { return await askOnce(prompt, model, search); } catch (e) { return { error: `network: ${e.cause?.code || e.name}` }; }
}
async function askOnce(prompt, model, search) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], ...(search ? { tools: [{ google_search: {} }] } : {}) }),
    signal: AbortSignal.timeout(90000),
  });
  if (res.status === 429 && !/prepayment/i.test(await res.clone().text())) return { quota: true };
  if (!res.ok) return { error: `${res.status} ${(await res.text()).replace(/\s+/g, ' ').slice(0, 300)}` };
  const j = await res.json();
  const cand = j.candidates?.[0] || {};
  const text = (cand.content?.parts || []).map((p) => p.text || '').join('');
  const chunks = (cand.groundingMetadata?.groundingChunks || []).map((c) => c.web?.title || c.web?.uri || '');
  return { text, chunks };
}

function score(text, chunks, prompt) {
  const US = /verse alarm|鬧鐘|闹钟|알람|alarma/i.test(prompt) ? US_STRICT : US_NAME;
  const hits = US.map((re) => text.search(re)).filter((i) => i >= 0);
  const named = COMPETITORS.map((n) => ({ n, i: text.toLowerCase().indexOf(n.toLowerCase()) })).filter((x) => x.i >= 0);
  const cited = chunks.find((c) => /bibleversealarm/i.test(c)) || '';
  let position = '';
  if (hits.length) {
    const ours = Math.min(...hits);
    position = 1 + named.filter((x) => x.i < ours).length; // rank among apps named in the answer
  }
  const snippet = hits.length ? text.slice(Math.max(0, Math.min(...hits) - 120), Math.min(...hits) + 180).replace(/\s+/g, ' ') : '';
  return { snippet, mentioned: hits.length ? 'y' : 'n', cited, position, competitors: named.sort((a, b) => a.i - b.i).map((x) => x.n).join('|') };
}

if (!KEY) { console.log('GEMINI_API_KEY not set; skipping prompt panel'); process.exit(0); }

// Model names change often; ask the API which models this key can use and take the newest plain Flash.
async function pickModel() {
  if (process.env.GEO_MODEL) return process.env.GEO_MODEL;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${KEY}`);
  if (!res.ok) throw new Error(`list models: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const names = ((await res.json()).models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
    .filter((n) => /^gemini-[\d.]+-flash(-lite)?$/.test(n));
  if (!names.length) throw new Error('no Gemini Flash model available for this key');
  const ver = (n) => parseFloat((n.match(/gemini-([\d.]+)/) || [, '0'])[1]);
  const newest = (lite) => names.filter((n) => n.endsWith('-lite') === lite).sort((a, b) => ver(b) - ver(a))[0];
  return [newest(true), newest(false)].filter(Boolean); // lite first: bigger free quota
}
// Free-tier access to Search grounding varies by model and changes often. Probe in order of usefulness:
// search+Flash, search+Flash-Lite, then plain answers (model knowledge only, no live citations).
let MODEL, SEARCH;
for (const search of [true, false]) {
  for (const m of await pickModel()) {
    const r = await ask('Say OK.', m, search);
    if (!r.error && !r.quota) { MODEL = m; SEARCH = search; break; }
    console.log(`probe ${m}${search ? '+search' : ''}: ${(r.error || 'quota').slice(0, 90)}`);
  }
  if (MODEL) break;
}
if (!MODEL) { console.log('No free Gemini access for this key (see seo/NEEDS_HUMAN.md #9)'); process.exit(1); }
const ENGINE = `gemini:${MODEL}${SEARCH ? '+search' : ''}`;
console.log(`engine: ${ENGINE}`);
const out = path.join(ROOT, 'geo/results.csv');
if (!fs.existsSync(out)) fs.writeFileSync(out, 'date,engine,locale,prompt_id,type,run,mentioned,cited_url,position,competitors,snippet\n');

let quotaHit = false;
let errors = 0;
for (const loc of LOCS) {
  const prompts = parseCsv(fs.readFileSync(path.join(ROOT, 'geo/prompts', `${loc}.csv`), 'utf8')).filter((p) => TYPES.includes(p.type));
  let n = 0, m = 0;
  for (const p of prompts) {
    for (let run = 1; run <= RUNS && !quotaHit; run++) {
      let r = await ask(p.prompt);
      if (/^50[03]|^network/.test(r.error || '')) { await sleep(20000); r = await ask(p.prompt); } // model busy: one retry
      if (r.quota) { quotaHit = true; console.log(`quota reached at ${loc}/${p.id}; stopping (partial results kept)`); break; }
      if (r.error) { console.log(`${p.id} run ${run}: ${r.error}`); if (++errors >= 6 && n === 0) { console.log('6 errors before any success; stopping'); process.exit(1); } await sleep(7000); continue; }
      const s = score(r.text, r.chunks, p.prompt);
      fs.appendFileSync(out, [today, ENGINE, loc, p.id, p.type, run, s.mentioned, csv(s.cited), s.position, csv(s.competitors), csv(s.snippet)].join(',') + '\n');
      n++; if (s.mentioned === 'y' || s.cited) m++;
      await sleep(7000); // stay under free-tier requests-per-minute
    }
  }
  console.log(`${loc}: ${m}/${n} runs mention or cite us`);
}

// Share of voice per locale x engine x prompt type, per week (latest 12 weeks).
const rows = fs.readFileSync(out, 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));
const sov = {};
for (const [date, engine, loc, , type, , mentioned, cited] of rows) {
  const d = new Date(date); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const wk = d.toISOString().slice(0, 10);
  const k = `${wk}|${engine}|${loc}|${type}`;
  sov[k] ||= { week: wk, engine, locale: loc, type, runs: 0, hits: 0 };
  sov[k].runs++; if (mentioned === 'y' || (cited && cited !== '""')) sov[k].hits++;
}
const list = Object.values(sov).map((x) => ({ ...x, share: +(x.hits / x.runs).toFixed(3) })).sort((a, b) => (a.week < b.week ? 1 : -1));
fs.writeFileSync(path.join(ROOT, 'geo/sov.json'), JSON.stringify(list.slice(0, 12 * 8 * 2), null, 1) + '\n');
