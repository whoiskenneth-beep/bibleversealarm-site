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

for (const w of warn) console.warn('warn:', w);
if (errors.length) {
  console.error(errors.map((e) => 'ERROR: ' + e).join('\n'));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`check ok: ${indexable.length} indexable pages, ${sitemapUrls.size} in sitemaps`);
