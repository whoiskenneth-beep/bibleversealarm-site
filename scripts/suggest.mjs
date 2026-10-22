// Free keyword expansion: Google autocomplete per language/country (+ Naver for Korean).
// Reads seo/keywords/seeds.json, expands each seed with a-z / question prefixes,
// writes raw suggestions to seo/data/suggest/<locale>.json for keyword-scout to classify.
// Rotates through seeds so each daily run stays small and polite (~1 req / 400ms).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const seeds = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/keywords/seeds.json'), 'utf8'));
const PER_RUN = +(process.env.SUGGEST_SEEDS_PER_LOCALE || 3);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MARKETS = {
  en: [{ hl: 'en', gl: 'us' }],
  es: [{ hl: 'es', gl: 'mx' }, { hl: 'es', gl: 'co' }],
  zh: [{ hl: 'zh-TW', gl: 'tw' }, { hl: 'zh-TW', gl: 'hk' }, { hl: 'zh-CN', gl: 'my' }, { hl: 'zh-CN', gl: 'sg' }],
  ko: [{ hl: 'ko', gl: 'kr' }],
};

async function google(q, { hl, gl }) {
  const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const buf = Buffer.from(await res.arrayBuffer());
  try { return JSON.parse(new TextDecoder('utf-8').decode(buf))[1] || []; } catch { return []; }
}
async function naver(q) {
  const res = await fetch(`https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(q)}&q_enc=UTF-8&st=100&r_format=json&r_enc=UTF-8`);
  if (!res.ok) return [];
  try { return ((await res.json()).items?.[0] || []).map((x) => x[0]); } catch { return []; }
}

for (const [loc, list] of Object.entries(seeds)) {
  const outPath = path.join(ROOT, 'seo/data/suggest', `${loc}.json`);
  const store = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : { cursor: 0, suggestions: {} };
  const batch = list.slice(store.cursor, store.cursor + PER_RUN);
  store.cursor = store.cursor + PER_RUN >= list.length ? 0 : store.cursor + PER_RUN;
  const mods = loc === 'en' || loc === 'es' ? ['', ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => ` ${c}`)] : [''];
  const prefixes = { en: ['how', 'what', 'why', 'best'], es: ['cómo', 'qué', 'mejores'], zh: [], ko: [] }[loc] || [];
  for (const seed of batch) {
    const qs = [...mods.map((m) => seed + m), ...prefixes.map((p) => `${p} ${seed}`)];
    for (const q of qs) {
      for (const mkt of MARKETS[loc]) {
        for (const s of await google(q, mkt)) (store.suggestions[s] ||= { seed, markets: [] }).markets.includes(mkt.gl) || store.suggestions[s].markets.push(mkt.gl);
        await sleep(400);
      }
      if (loc === 'ko') { for (const s of await naver(q)) (store.suggestions[s] ||= { seed, markets: [] }).markets.includes('naver') || store.suggestions[s].markets.push('naver'); await sleep(400); }
    }
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(store, null, 1));
  console.log(`${loc}: seeds ${batch.join(' | ')} -> ${Object.keys(store.suggestions).length} total suggestions`);
}
