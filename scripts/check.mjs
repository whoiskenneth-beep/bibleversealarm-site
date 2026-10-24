// Fails the build on SEO regressions: broken internal links, non-reciprocal
// hreflang, wrong canonicals, duplicate titles/descriptions, orphan pages,
// sitemap drift, bad JSON-LD, oversized pages. Run after build.mjs.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public');
const SITE = 'https://bibleversealarm.com';
const errors = [];
const warn = [];
const err = (m) => errors.push(m);

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
})(OUT);

const urlOf = (file) => {
  let rel = '/' + path.relative(OUT, file).replace(/\\/g, '/');
  rel = rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return SITE + (rel || '/');
};
const exists = (p) => {
  const clean = p.split(/[?#]/)[0].replace(/\/$/, '');
  if (clean === '') return true;
  const f = path.join(OUT, clean);
  return fs.existsSync(f + '.html') || fs.existsSync(path.join(f, 'index.html')) || (fs.existsSync(f) && fs.statSync(f).isFile());
};

const pages = {};
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const url = urlOf(file);
  const get = (re) => (html.match(re) || [])[1];
  const pg = {
    file: path.relative(OUT, file), html,
    title: get(/<title>([^<]*)<\/title>/),
    desc: get(/<meta name="description" content="([^"]*)"/),
    canonical: get(/<link rel="canonical" href="([^"]*)"/),
    lang: get(/<html lang="([^"]*)"/),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    alts: [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({ hl: m[1], href: m[2] })),
    links: [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]),
  };
  pages[url] = pg;
}

const indexable = Object.entries(pages).filter(([u, p]) => !p.noindex && !u.endsWith('/feedback'));
const seenTitle = {};
const seenDesc = {};
for (const [url, p] of indexable) {
  if (!p.lang) err(`${p.file}: missing <html lang>`);
  if (!p.title) err(`${p.file}: missing <title>`);
  if (!p.desc) err(`${p.file}: missing meta description`);
  if (p.canonical !== url) err(`${p.file}: canonical ${p.canonical} != ${url}`);
  if (p.title) (seenTitle[p.title] ||= []).push(p.file);
  if (p.desc) (seenDesc[p.desc] ||= []).push(p.file);
  const cjk = /^(zh|ja|ko)/.test(p.lang || "");
  if (p.desc && (p.desc.length < (cjk ? 25 : 50) || p.desc.length > (cjk ? 110 : 180))) warn.push(`${p.file}: description length ${p.desc.length}`);
  if (Buffer.byteLength(p.html) > 150_000) err(`${p.file}: page is ${Buffer.byteLength(p.html)} bytes (>150KB)`);
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { err(`${p.file}: invalid JSON-LD`); }
  }
  // hreflang: self-reference + reciprocity
  if (p.alts.length) {
    if (!p.alts.some((a) => a.href === url)) err(`${p.file}: hreflang set does not include itself`);
    if (!p.alts.some((a) => a.hl === 'x-default') && p.alts.some((a) => a.hl === 'en')) err(`${p.file}: has en but no x-default`);
    for (const a of p.alts) {
      const target = pages[a.href];
      if (!target) { err(`${p.file}: hreflang ${a.hl} -> ${a.href} does not exist`); continue; }
      if (!target.alts.some((b) => b.href === url)) err(`${p.file}: ${a.href} does not link back (hreflang not reciprocal)`);
    }
  }
}
for (const [t, f] of Object.entries(seenTitle)) if (f.length > 1) err(`duplicate title "${t}": ${f.join(', ')}`);
for (const [d, f] of Object.entries(seenDesc)) if (f.length > 1) err(`duplicate description: ${f.join(', ')}`);

// Internal links + orphans
const inbound = {};
for (const [url, p] of Object.entries(pages)) {
  for (const href of p.links) {
    if (/^(mailto:|https?:|#)/.test(href) && !href.startsWith(SITE)) continue;
    const local = href.startsWith(SITE) ? href.slice(SITE.length) || '/' : href;
    if (!local.startsWith('/')) {
      const resolved = path.posix.join(path.posix.dirname('/' + p.file), local);
      if (!exists(resolved)) err(`${p.file}: broken link ${href}`);
      continue;
    }
    if (!exists(local)) err(`${p.file}: broken link ${href}`);
    const target = SITE + (local.split(/[?#]/)[0].replace(/\/$/, '') || '/');
    if (target !== url) (inbound[target] ||= new Set()).add(url);
  }
}
for (const [url, p] of indexable) if (url !== SITE + '/' && !inbound[url]) err(`${p.file}: orphan page (no internal links point to it)`);

// Sitemaps
const sitemapUrls = new Set();
const index = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
for (const m of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const f = path.join(OUT, m[1].slice(SITE.length));
  if (!fs.existsSync(f)) { err(`sitemap index lists missing ${m[1]}`); continue; }
  for (const u of fs.readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(u[1]);
}
for (const u of sitemapUrls) if (!pages[u]) err(`sitemap lists ${u} but no page exists`);
for (const [url, p] of indexable) if (!sitemapUrls.has(url)) err(`${p.file}: indexable page missing from sitemaps`);

// Uniqueness (adapted from AgriciDaniel/claude-seo seo-programmatic gates): share of a page's own writing
// (main content minus quoted verses) whose 5-grams appear on no other generated page in the same locale.
// < 30% = scaled-content risk (error), < 40% = warn. Thin pages (< 300 words of own writing; CJK: < 600 chars) warn.
const ownText = (html) => (html.match(/<main[\s\S]*?<\/main>/) || [''])[0]
  .replace(/<blockquote[\s\S]*?<\/blockquote>/g, ' ').replace(/<aside[\s\S]*?<\/aside>/g, ' ')
  .replace(/<nav[\s\S]*?<\/nav>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const grams = (text, cjk) => {
  const toks = cjk ? [...text.replace(/[\s\p{P}]/gu, '')] : text.toLowerCase().split(/[^\p{L}\p{N}']+/u).filter(Boolean);
  const n = cjk ? 8 : 5;
  const out = [];
  for (let i = 0; i + n <= toks.length; i++) out.push(toks.slice(i, i + n).join(cjk ? '' : ' '));
  return { toks: toks.length, set: new Set(out), list: out };
};
const generated = indexable.filter(([u]) => /\/(bible-verses-about|versiculos-biblicos|jingwen|seonggu)\/|\/(es|ko|zh-hant|zh-hans)\/[^/]+$|^https:\/\/bibleversealarm\.com\/[^/]+$/.test(u)
  && !/\/(privacy|support|terms|feedback|es|ko|zh-hant|zh-hans|bible-verses-about|versiculos-biblicos|jingwen|seonggu)$/.test(u));
const byLang = {};
for (const [url, p] of generated) {
  const cjk = /^zh/.test(p.lang || '');
  (byLang[p.lang] ||= []).push({ url, p, cjk, g: grams(ownText(p.html), cjk) });
}
for (const list of Object.values(byLang)) {
  for (const a of list) {
    const others = new Set();
    for (const b of list) if (b !== a) for (const x of b.g.set) others.add(x);
    const uniq = a.g.list.length ? a.g.list.filter((x) => !others.has(x)).length / a.g.list.length : 1;
    const pct = Math.round(uniq * 100);
    if (process.env.UNIQ_REPORT) console.log(`${pct}% unique, ${a.g.toks} ${a.cjk ? 'chars' : 'words'}: ${a.p.file}`);
    if (list.length > 1 && pct < 30) err(`${a.p.file}: only ${pct}% unique writing vs sibling pages (scaled-content risk, min 30%)`);
    else if (list.length > 1 && pct < 40) warn.push(`${a.p.file}: ${pct}% unique writing vs siblings (aim for 40%+)`);
    if (a.g.toks < (a.cjk ? 600 : 300)) warn.push(`${a.p.file}: thin, ${a.g.toks} ${a.cjk ? 'chars' : 'words'} of own writing`);
  }
}
// Metadata shape: one title pattern on most pages of a locale reads as templated (claude-seo metadata_template idea).
for (const [lang, list] of Object.entries(byLang)) {
  if (list.length < 5) continue;
  const shape = (t) => (t || '').replace(/\d+/g, '#').split(/\s+/).slice(0, 3).join(' ');
  const counts = {};
  for (const a of list) counts[shape(a.p.title)] = (counts[shape(a.p.title)] || 0) + 1;
  const [top, n] = Object.entries(counts).sort((x, y) => y[1] - x[1])[0];
  if (n / list.length > 0.6) warn.push(`${lang}: ${n}/${list.length} titles start "${top}…"; vary title patterns`);
}

// --inventory: page inventory for audits (seo/data/inventory.csv).
if (process.argv.includes('--inventory')) {
  const csvq = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const rows = [['url', 'lang', 'title', 'title_len', 'h1', 'words_or_chars', 'updated', 'internal_in', 'internal_out', 'canonical_ok']];
  for (const [url, p] of indexable) {
    const text = p.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const size = /^(zh|ja|ko)/.test(p.lang || '') ? text.replace(/\s/g, '').length : text.split(' ').length;
    const h1 = (p.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
    const updated = (p.html.match(/<time datetime="([^"]+)"/) || [, ''])[1];
    rows.push([url, p.lang, p.title, (p.title || '').length, h1, size, updated, inbound[url]?.size || 0, new Set(p.links).size, p.canonical === url]);
  }
  const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../seo/data/inventory.csv');
  fs.writeFileSync(out, rows.map((r) => r.map(csvq).join(',')).join('\n') + '\n');
  console.log(`inventory: ${rows.length - 1} pages -> seo/data/inventory.csv`);
}

for (const w of warn) console.warn('warn:', w);
if (errors.length) {
  console.error(errors.map((e) => 'ERROR: ' + e).join('\n'));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`check ok: ${indexable.length} indexable pages, ${sitemapUrls.size} in sitemaps`);
