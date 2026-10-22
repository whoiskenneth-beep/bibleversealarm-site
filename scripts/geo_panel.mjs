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
const MODEL = process.env.GEO_MODEL || 'gemini-2.5-flash';
const ENGINE = `gemini:${MODEL}+search`;
const RUNS = +(process.env.GEO_RUNS || 3);
const LOCS = (process.env.GEO_LOCALES || 'en,es,zh,ko').split(',');
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const US = [/bible\s*verse\s*alarm/i, /bibleversealarm/i];
const COMPETITORS = ['YouVersion', 'Bible App', 'Glorify', 'Hallow', 'Abide', 'Pray.com', 'Alarmy', 'Dwell', 'Lectio 365',
  'Bible Memory', 'Verses', 'Scripture Typer', 'Remember Me', 'Fighter Verses', 'Bible Gateway', 'Olive Tree', 'Logos',
  'Daily Bible Verse', 'iDisciple', 'First 5', 'Bible Chat', 'Faith Alarm', 'Christian Alarm', 'Morning Prayer'];

const parseCsv = (txt) => txt.trim().split('\n').slice(1).map((l) => {
  const [id, type, market, ...rest] = l.split(',');
  return { id, type, market, prompt: rest.join(',').replace(/^"|"$/g, '') };
});
const csv = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

async function ask(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
  });
  if (res.status === 429) return { quota: true };
  if (!res.ok) return { error: `${res.status} ${(await res.text()).slice(0, 120)}` };
  const j = await res.json();
  const cand = j.candidates?.[0] || {};
  const text = (cand.content?.parts || []).map((p) => p.text || '').join('');
  const chunks = (cand.groundingMetadata?.groundingChunks || []).map((c) => c.web?.title || c.web?.uri || '');
  return { text, chunks };
}

function score(text, chunks) {
  const hits = US.map((re) => text.search(re)).filter((i) => i >= 0);
  const named = COMPETITORS.map((n) => ({ n, i: text.toLowerCase().indexOf(n.toLowerCase()) })).filter((x) => x.i >= 0);
  const cited = chunks.find((c) => /bibleversealarm/i.test(c)) || '';
  let position = '';
  if (hits.length) {
    const ours = Math.min(...hits);
    position = 1 + named.filter((x) => x.i < ours).length; // rank among apps named in the answer
  }
  return { mentioned: hits.length ? 'y' : 'n', cited, position, competitors: named.sort((a, b) => a.i - b.i).map((x) => x.n).join('|') };
}

if (!KEY) { console.log('GEMINI_API_KEY not set; skipping prompt panel'); process.exit(0); }
const out = path.join(ROOT, 'geo/results.csv');
if (!fs.existsSync(out)) fs.writeFileSync(out, 'date,engine,locale,prompt_id,type,run,mentioned,cited_url,position,competitors\n');

let quotaHit = false;
for (const loc of LOCS) {
  const prompts = parseCsv(fs.readFileSync(path.join(ROOT, 'geo/prompts', `${loc}.csv`), 'utf8'));
  let n = 0, m = 0;
  for (const p of prompts) {
    for (let run = 1; run <= RUNS && !quotaHit; run++) {
      const r = await ask(p.prompt);
      if (r.quota) { quotaHit = true; console.log(`quota reached at ${loc}/${p.id}; stopping (partial results kept)`); break; }
      if (r.error) { console.log(`${p.id} run ${run}: ${r.error}`); await sleep(7000); continue; }
      const s = score(r.text, r.chunks);
      fs.appendFileSync(out, [today, ENGINE, loc, p.id, p.type, run, s.mentioned, csv(s.cited), s.position, csv(s.competitors)].join(',') + '\n');
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
