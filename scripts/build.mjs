// Builds bibleversealarm.com into public/.
// static/ is copied as-is (the original hand-written pages keep their URLs).
// content/ holds one JSON file per page; verse text is ALWAYS pulled from the
// public-domain Bibles in data/bibles at build time, never typed by hand.
// zh-hans pages are generated from zh-hant copy with OpenCC + the Simplified CUV.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as OpenCC from 'opencc-js';
import { renderCards } from './cards.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public');
const SITE = 'https://bibleversealarm.com';
const APP_ID = '6789787366';
const INDEXNOW_KEY = '14d6e2adce657fe0f943140ed48f2740';

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const openccHans = OpenCC.Converter({ from: 'twp', to: 'cn' });
// Simplified readers in SG/MY use curly quotes, not corner brackets.
const toHans = (s) => openccHans(s).replace(/「/g, '“').replace(/」/g, '”').replace(/『/g, '‘').replace(/』/g, '’');

// ---------- Locales ----------
// appLocalized: false until the app build with this language is LIVE on the
// App Store. While false, CTAs must not promise an in-app Bible in this language.
export const LOCALES = {
  en: {
    lang: 'en', hreflang: ['en', 'x-default'], prefix: '', ogLocale: 'en_US',
    bible: 'bsb', bibleName: 'Berean Standard Bible (BSB)', appLocalized: true,
    hub: '/bible-verses-about',
    t: {
      home: 'Home', hub: 'Bible verses by topic', related: 'Related topics', faq: 'Frequently asked questions',
      updated: 'Updated', translation: 'Scripture quotations', download: 'Download on the', store: 'App Store',
      ctaTitle: 'Wake up to verses like these',
      ctaBody: 'Bible Verse Alarm keeps ringing until you complete a short Bible verse — so you get out of bed with Scripture instead of your feed.',
      ctaButton: 'Get Bible Verse Alarm', languages: 'Languages', verses: 'verses',
      hubIntro: 'Hand-picked Bible verses for what you are facing, each with a short reflection.',
      privacy: 'Privacy', terms: 'Terms', support: 'Support',
    },
  },
  es: {
    lang: 'es', hreflang: ['es'], prefix: '/es', ogLocale: 'es_419',
    bible: 'rvr1909', bibleName: 'Reina-Valera 1909', appLocalized: false,
    hub: '/es/versiculos-biblicos',
    t: {
      home: 'Inicio', hub: 'Versículos bíblicos por tema', related: 'Temas relacionados', faq: 'Preguntas frecuentes',
      updated: 'Actualizado', translation: 'Citas bíblicas', download: 'Descárgala en el', store: 'App Store',
      ctaTitle: 'Despierta con la Palabra',
      ctaBody: 'Bible Verse Alarm sigue sonando hasta que completas un versículo corto. Así empiezas el día con la Biblia y no con el celular.',
      ctaButton: 'Descargar Bible Verse Alarm', languages: 'Idiomas', verses: 'versículos',
      hubIntro: 'Versículos de la Biblia elegidos a mano para lo que estás viviendo, cada grupo con una breve reflexión.',
      privacy: 'Privacidad', terms: 'Términos', support: 'Ayuda',
    },
  },
  'zh-hant': {
    lang: 'zh-Hant', hreflang: ['zh-Hant', 'zh-TW', 'zh-HK'], prefix: '/zh-hant', ogLocale: 'zh_TW',
    bible: 'cuv-hant', bibleName: '和合本（1919）', appLocalized: false,
    hub: '/zh-hant/jingwen',
    t: {
      home: '首頁', hub: '主題經文', related: '相關主題', faq: '常見問題',
      updated: '更新於', translation: '經文出處', download: '下載於', store: 'App Store',
      ctaTitle: '每天早上，被神的話叫醒',
      ctaBody: 'Bible Verse Alarm 會一直響，直到你完成一節短短的經文。起床的第一件事是讀經，不是滑手機。',
      ctaButton: '下載 Bible Verse Alarm', languages: '語言', verses: '節經文',
      hubIntro: '依照你正在面對的處境，精選的聖經經文，每一組都附上簡短的默想。',
      privacy: '隱私權', terms: '條款', support: '支援',
    },
  },
  'zh-hans': {
    lang: 'zh-Hans', hreflang: ['zh-Hans', 'zh-SG', 'zh-MY'], prefix: '/zh-hans', ogLocale: 'zh_SG',
    bible: 'cuv-hans', bibleName: '和合本（1919）', appLocalized: false,
    hub: '/zh-hans/jingwen', derivedFrom: 'zh-hant',
  },
  ko: {
    // Korean Bible text is on hold until the 개역한글 licence is confirmed (seo/LICENSES.md).
    lang: 'ko', hreflang: ['ko'], prefix: '/ko', ogLocale: 'ko_KR',
    bible: null, bibleName: null, appLocalized: false,
    hub: '/ko/seonggu',
    t: {
      home: '홈', hub: '주제별 성경 구절', related: '관련 주제', faq: '자주 묻는 질문',
      updated: '업데이트', translation: '성경 본문', download: '다운로드', store: 'App Store',
      ctaTitle: '말씀으로 시작하는 아침',
      ctaBody: 'Bible Verse Alarm은 짧은 성경 구절을 완성해야 알람이 꺼져요. 눈 뜨자마자 휴대폰 피드 대신 말씀을 만나세요.',
      ctaButton: 'Bible Verse Alarm 받기', languages: '언어', verses: '구절',
      hubIntro: '지금 겪고 있는 상황에 맞게 고른 성경 구절과 짧은 묵상.',
      privacy: '개인정보', terms: '약관', support: '지원',
    },
  },
};
LOCALES['zh-hans'].t = Object.fromEntries(Object.entries(LOCALES['zh-hant'].t).map(([k, v]) => [k, toHans(v)]));

// ---------- Bible lookup ----------
const BOOK_NAMES = read('data/book-names.json');
const bibles = {};
function bible(id) {
  if (!bibles[id]) bibles[id] = read(`data/bibles/${id}.json`);
  return bibles[id];
}
function cleanCUV(s) {
  s = s.replace(/\|/g, '');
  for (const [o, c] of [['「', '」'], ['『', '』']]) {
    if (s.split(o).length !== s.split(c).length) s = s.split(o).join('').split(c).join('');
  }
  return s;
}
export function verse(ref, bibleId) {
  const m = ref.match(/^(.+) (\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`Bad reference "${ref}"`);
  const [, book, ch, v1, v2] = m;
  const b = bible(bibleId);
  const parts = [];
  for (let v = +v1; v <= +(v2 || v1); v++) {
    const text = b[`${book} ${ch}:${v}`];
    if (!text) throw new Error(`"${book} ${ch}:${v}" not found in ${bibleId}`);
    parts.push(bibleId.startsWith('cuv') ? cleanCUV(text) : text.trim());
  }
  return parts.join(bibleId.startsWith('cuv') ? '' : ' ');
}
function refLabel(ref, loc) {
  const m = ref.match(/^(.+) (\d+:.+)$/);
  const key = { es: 'es', 'zh-hant': 'zh-Hant', 'zh-hans': 'zh-Hans', ko: 'ko' }[loc];
  const name = key ? BOOK_NAMES[m[1]]?.[key] : m[1];
  if (!name) throw new Error(`No ${loc} name for book "${m[1]}"`);
  return `${name} ${m[2]}`;
}

// ---------- Helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE + (p || '/');
const storeLink = (loc, slug) => {
  const ct = `seo_${loc}_${slug}`.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 40);
  return `https://apps.apple.com/app/id${APP_ID}?ct=${ct}`;
};
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const pages = []; // {loc, path, kind, group, updated, html}
const cards = []; // verse cards to render (scripts/cards.mjs); also listed in public/social.json for the weekly social pack
const cardBase = (loc, kind, slug) => `/cards/${loc}/${kind}/${slug}`;
// The card verse: content may pin one with "card_ref"; otherwise the first ref short enough to read on a phone.
function heroRef(refs, loc, pinned) {
  const max = loc.startsWith('zh') || loc === 'ko' ? 70 : 200;
  return pinned || refs.find((r) => verse(r, LOCALES[loc].bible).length <= max) || refs[0];
}
const alternates = new Map(); // group -> {loc: path}

function register(group, loc, p) {
  if (!alternates.has(group)) alternates.set(group, {});
  alternates.get(group)[loc] = p;
}

function storeBadge(loc, slug, id) {
  const t = LOCALES[loc].t;
  return `<a class="appstore" href="${storeLink(loc, slug)}" id="${id}" aria-label="${esc(t.ctaButton)}">
<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M17.05 12.54c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.69-3.16-1.71-1.34-.14-2.62.79-3.3.79-.68 0-1.73-.77-2.85-.75-1.46.02-2.82.85-3.57 2.16-1.53 2.65-.39 6.56 1.09 8.71.72 1.05 1.58 2.23 2.71 2.19 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.17-.02 1.92-1.07 2.63-2.12.83-1.22 1.17-2.4 1.19-2.46-.03-.01-2.28-.88-2.3-3.49zM14.9 5.87c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.04 1.67-.91 2.65.96.07 1.94-.49 2.54-1.2z"/></svg>
<span><span class="a-top">${esc(t.download)}</span><span class="a-main">${t.store}</span></span></a>`;
}

function cta(loc, slug, id) {
  const t = LOCALES[loc].t;
  return `<aside class="cta-card"><h2>${esc(t.ctaTitle)}</h2><p>${esc(t.ctaBody)}</p>${storeBadge(loc, slug, id)}</aside>`;
}

function layout({ loc, path: p, group, title, description, body, schema = [], ogType = 'article', image }) {
  const L = LOCALES[loc];
  const t = L.t;
  const alts = alternates.get(group) || { [loc]: p };
  const hreflang = Object.entries(alts)
    .flatMap(([l, ap]) => LOCALES[l].hreflang.map((h) => `<link rel="alternate" hreflang="${h}" href="${abs(ap)}" />`))
    .join('\n');
  const langNav = Object.entries(alts).length > 1
    ? `<nav class="lang-nav" aria-label="${esc(t.languages)}">${Object.entries(alts)
        .map(([l, ap]) => `<a href="${ap || '/'}" hreflang="${LOCALES[l].lang}" lang="${LOCALES[l].lang}"${l === loc ? ' aria-current="page"' : ''}>${LANG_LABEL[l]}</a>`)
        .join('')}</nav>`
    : '';
  const homeHref = L.prefix || '/';
  return `<!DOCTYPE html>
<html lang="${L.lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${abs(p)}" />
${hreflang}
<meta name="apple-itunes-app" content="app-id=${APP_ID}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${abs(p)}" />
<meta property="og:locale" content="${L.ogLocale}" />
<meta property="og:image" content="${image ? SITE + image : `${SITE}/assets/icon.png`}" />
${image ? '<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n' : ''}<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
<meta name="theme-color" content="#14112C" />
<link rel="icon" href="/assets/icon.png" />
<link rel="apple-touch-icon" href="/assets/icon.png" />
<link rel="stylesheet" href="/styles.css" />
<link rel="stylesheet" href="/pages.css" />
${schema.map(ld).join('\n')}
</head>
<body>
<header><div class="wrap nav">
<a class="brand" href="${homeHref}"><img src="/assets/icon.png" alt="" width="34" height="34" /> Bible Verse Alarm</a>
<nav class="nav-links">${hubLocales.has(loc) ? `<a href="${L.hub}">${esc(t.hub)}</a>` : ''}<a class="nav-cta" href="${storeLink(loc, 'nav')}">${esc(t.store)}</a></nav>
</div></header>
${body}
<footer><div class="wrap foot-simple">
<span>© 2026 Bible Verse Alarm</span>
${langNav}
<nav>${hubLocales.has(loc) ? `<a href="${L.hub}">${esc(t.hub)}</a>` : ''}${(featureLinks[loc] || []).map((f) => `<a href="${f.path}">${esc(f.label)}</a>`).join('')}<a href="/privacy">${esc(t.privacy)}</a><a href="/terms">${esc(t.terms)}</a><a href="/support">${esc(t.support)}</a></nav>
</div></footer>
</body>
</html>
`;
}

const LANG_LABEL = { en: 'English', es: 'Español', 'zh-hant': '繁體中文', 'zh-hans': '简体中文', ko: '한국어' };

function breadcrumbs(loc, trail) {
  const html = `<nav class="crumbs" aria-label="breadcrumb">${trail
    .map((c, i) => (i < trail.length - 1 ? `<a href="${c.path || '/'}">${esc(c.name)}</a><span aria-hidden="true">›</span>` : `<span aria-current="page">${esc(c.name)}</span>`))
    .join('')}</nav>`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
  return { html, schema };
}

// ---------- Content loading ----------
// A locale's copy for one page. zh-hans is derived from zh-hant.
function copyFor(entry, loc) {
  const src = LOCALES[loc].derivedFrom;
  if (!src) return entry.locales[loc];
  const base = entry.locales[src];
  if (!base) return null;
  return JSON.parse(JSON.stringify(base), (k, v) => (typeof v === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(v) && !['slug', 'refs'].includes(k) ? toHans(v) : v));
}
const pathFor = (loc, kind, slug) => (kind === 'topic' ? `${LOCALES[loc].hub}/${slug}` : kind === 'feature' ? `${LOCALES[loc].prefix}/${slug}` : LOCALES[loc].prefix);

const topics = fs.readdirSync(path.join(ROOT, 'content/topics')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ file: f, ...read(`content/topics/${f}`) }));
// Feature pages: app-intent landing pages ("christian alarm clock"), and pages without verse lists.
const features = fs.existsSync(path.join(ROOT, 'content/features'))
  ? fs.readdirSync(path.join(ROOT, 'content/features')).filter((f) => f.endsWith('.json')).sort().map((f) => ({ file: f, ...read(`content/features/${f}`) }))
  : [];
const RESERVED = new Set(['privacy', 'support', 'terms', 'feedback', 'assets', 'sitemaps', 'es', 'ko', 'zh-hant', 'zh-hans', 'bible-verses-about', 'versiculos-biblicos', 'jingwen', 'seonggu']);
const homes = fs.existsSync(path.join(ROOT, 'content/home'))
  ? fs.readdirSync(path.join(ROOT, 'content/home')).filter((f) => f.endsWith('.json')).map((f) => ({ loc: f.replace('.json', ''), ...read(`content/home/${f}`) }))
  : [];

const builtLocales = (entry) => Object.keys(LOCALES).filter((loc) => {
  const c = copyFor(entry, loc);
  if (!c) return false;
  const usesVerses = (c.groups || []).length > 0 || (c.sections || []).some((s) => s.refs?.length);
  if (usesVerses && !LOCALES[loc].bible) throw new Error(`${entry.file}: ${loc} has verses but no licensed Bible yet`);
  return true;
});

// Register alternates first so every page can emit full reciprocal hreflang.
register('home', 'en', '');
for (const h of homes) {
  register('home', h.loc, LOCALES[h.loc].prefix);
  if (h.loc === 'zh-hant') register('home', 'zh-hans', LOCALES['zh-hans'].prefix);
}
for (const tp of topics) for (const loc of builtLocales(tp)) register(`topic:${tp.id}`, loc, pathFor(loc, 'topic', copyFor(tp, loc).slug));
const hubLocales = new Set(topics.flatMap(builtLocales));
const featureLinks = {}; // loc -> [{path, label}] shown in every footer of that locale (keeps them linked sitewide)
for (const ft of features) {
  for (const loc of builtLocales(ft)) {
    const c = copyFor(ft, loc);
    if (RESERVED.has(c.slug)) throw new Error(`${ft.file}: slug "${c.slug}" is reserved`);
    register(`feature:${ft.id}`, loc, pathFor(loc, 'feature', c.slug));
    (featureLinks[loc] ||= []).push({ path: pathFor(loc, 'feature', c.slug), label: c.nav || c.h1 });
  }
}
for (const loc of hubLocales) register('hub', loc, LOCALES[loc].hub);

// ---------- Topic pages ----------
for (const tp of topics) {
  for (const loc of builtLocales(tp)) {
    const L = LOCALES[loc];
    const c = copyFor(tp, loc);
    const p = pathFor(loc, 'topic', c.slug);
    const count = c.groups.reduce((n, g) => n + g.refs.length, 0);
    const n = (c.title.match(/\d+/) || [])[0];
    if (n && +n !== count) throw new Error(`${tp.file} ${loc}: title says ${n} but page has ${count} verses`);
    const crumbs = breadcrumbs(loc, [
      { name: L.t.home, path: L.prefix }, { name: L.t.hub, path: L.hub }, { name: c.h1, path: p },
    ]);
    const groups = c.groups.map((g) => `<section class="vgroup"><h2>${esc(g.heading)}</h2><p class="reflection">${esc(g.reflection)}</p>
${g.refs.map((r) => `<blockquote class="verse"><p>${esc(verse(r, L.bible))}</p><cite>${esc(refLabel(r, loc))}</cite></blockquote>`).join('\n')}
</section>`);
    // CTA after the first group, once readers have something; second CTA at the end.
    groups.splice(1, 0, cta(loc, c.slug, 'appstore-mid'));
    const related = (tp.related || [])
      .map((id) => topics.find((x) => x.id === id))
      .filter((x) => x && builtLocales(x).includes(loc))
      .map((x) => { const xc = copyFor(x, loc); return `<li><a href="${pathFor(loc, 'topic', xc.slug)}">${esc(xc.h1)}</a></li>`; });
    const faq = c.faq || [];
    const body = `<main class="article wrap-narrow">
${crumbs.html}
<h1>${esc(c.h1)}</h1>
<p class="lede">${esc(c.intro)}</p>
<p class="meta">${count} ${esc(L.t.verses)} · ${esc(L.t.translation)}: ${esc(L.bibleName)} · ${esc(L.t.updated)} <time datetime="${c.updated}">${c.updated}</time></p>
${groups.join('\n')}
${faq.length ? `<section class="faq"><h2>${esc(L.t.faq)}</h2>${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
${related.length ? `<section class="related"><h2>${esc(L.t.related)}</h2><ul>${related.join('')}<li><a href="${L.hub}">${esc(L.t.hub)}</a></li></ul></section>` : ''}
${cta(loc, c.slug, 'appstore-end')}
</main>`;
    const schema = [
      {
        '@context': 'https://schema.org', '@type': 'Article', headline: c.h1, description: c.description,
        inLanguage: L.lang, datePublished: c.published || c.updated, dateModified: c.updated,
        mainEntityOfPage: abs(p), image: `${SITE}/assets/icon.png`,
        author: { '@type': 'Organization', name: 'Bible Verse Alarm', url: SITE },
        publisher: { '@type': 'Organization', name: 'Bible Verse Alarm', logo: { '@type': 'ImageObject', url: `${SITE}/assets/icon.png` } },
      },
      crumbs.schema,
    ];
    if (faq.length) schema.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
    const allRefs = c.groups.flatMap((g) => g.refs);
    const hero = heroRef(allRefs, loc, c.card_ref);
    const card = cardBase(loc, 'topics', c.slug);
    cards.push({ loc, slug: `topics/${c.slug}`, kind: 'topic', url: abs(p), h1: c.h1, title: c.title, description: c.description,
      label: c.h1, verse: verse(hero, L.bible), ref: refLabel(hero, loc), sub: `${count} ${L.t.verses}`, image: card });
    pages.push({ loc, path: p, kind: 'topics', updated: c.updated, html: layout({ loc, path: p, group: `topic:${tp.id}`, title: c.title, description: c.description, body, schema, image: `${card}-og.png` }) });
  }
}

// ---------- Feature pages ----------
for (const ft of features) {
  for (const loc of builtLocales(ft)) {
    const L = LOCALES[loc];
    const c = copyFor(ft, loc);
    const p = pathFor(loc, 'feature', c.slug);
    const crumbs = breadcrumbs(loc, [{ name: L.t.home, path: L.prefix }, { name: c.h1, path: p }]);
    const paras = (text) => text.split(/\n\n+/).map((x) => `<p>${esc(x)}</p>`).join('');
    const sections = c.sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${paras(s.body)}
${(s.refs || []).map((r) => `<blockquote class="verse"><p>${esc(verse(r, L.bible))}</p><cite>${esc(refLabel(r, loc))}</cite></blockquote>`).join('\n')}</section>`);
    sections.splice(2, 0, cta(loc, c.slug, 'appstore-mid'));
    const related = (ft.related || [])
      .map((id) => topics.find((x) => x.id === id))
      .filter((x) => x && builtLocales(x).includes(loc))
      .map((x) => { const xc = copyFor(x, loc); return `<li><a href="${pathFor(loc, 'topic', xc.slug)}">${esc(xc.h1)}</a></li>`; });
    const faq = c.faq || [];
    const body = `<main class="article wrap-narrow">
${crumbs.html}
<h1>${esc(c.h1)}</h1>
<p class="lede">${esc(c.intro)}</p>
${storeBadge(loc, c.slug, 'appstore-top')}
${sections.join('\n')}
${faq.length ? `<section class="faq"><h2>${esc(L.t.faq)}</h2>${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
${related.length ? `<section class="related"><h2>${esc(L.t.related)}</h2><ul>${related.join('')}</ul></section>` : ''}
${cta(loc, c.slug, 'appstore-end')}
</main>`;
    const schema = [
      {
        '@context': 'https://schema.org', '@type': 'WebPage', name: c.h1, description: c.description, inLanguage: L.lang, url: abs(p),
        dateModified: c.updated,
        about: { '@type': 'MobileApplication', name: 'Bible Verse Alarm', operatingSystem: 'iOS', applicationCategory: 'LifestyleApplication', installUrl: `https://apps.apple.com/app/id${APP_ID}` },
      },
      crumbs.schema,
    ];
    if (faq.length) schema.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
    const fRefs = c.sections.flatMap((s) => s.refs || []);
    const fHero = fRefs.length ? heroRef(fRefs, loc, c.card_ref) : null;
    const card = cardBase(loc, 'features', c.slug);
    cards.push({ loc, slug: `features/${c.slug}`, kind: 'feature', url: abs(p), h1: c.h1, title: c.title, description: c.description,
      label: c.nav || c.h1, verse: fHero ? verse(fHero, L.bible) : c.intro, ref: fHero ? refLabel(fHero, loc) : '', sub: '', image: card });
    pages.push({ loc, path: p, kind: 'features', updated: c.updated, html: layout({ loc, path: p, group: `feature:${ft.id}`, title: c.title, description: c.description, body, schema, ogType: 'website', image: `${card}-og.png` }) });
  }
}

// ---------- Hub pages ----------
for (const loc of hubLocales) {
  const L = LOCALES[loc];
  const items = topics.filter((tp) => builtLocales(tp).includes(loc)).map((tp) => ({ c: copyFor(tp, loc), tp }));
  const crumbs = breadcrumbs(loc, [{ name: L.t.home, path: L.prefix }, { name: L.t.hub, path: L.hub }]);
  const body = `<main class="article wrap-narrow">
${crumbs.html}
<h1>${esc(L.t.hub)}</h1>
<p class="lede">${esc(L.t.hubIntro)}</p>
<ul class="topic-grid">${items.map(({ c }) => `<li><a href="${pathFor(loc, 'topic', c.slug)}"><strong>${esc(c.h1)}</strong><span>${esc(c.description)}</span></a></li>`).join('')}</ul>
${cta(loc, 'hub', 'appstore-end')}
</main>`;
  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: L.t.hub, inLanguage: L.lang, url: abs(L.hub),
      mainEntity: { '@type': 'ItemList', itemListElement: items.map(({ c }, i) => ({ '@type': 'ListItem', position: i + 1, name: c.h1, url: abs(pathFor(loc, 'topic', c.slug)) })) },
    },
    crumbs.schema,
  ];
  const updated = items.map(({ c }) => c.updated).sort().at(-1);
  pages.push({ loc, path: L.hub, kind: 'hubs', updated, html: layout({ loc, path: L.hub, group: 'hub', title: `${L.t.hub} | Bible Verse Alarm`, description: L.t.hubIntro, body, schema, ogType: 'website' }) });
}

// ---------- Locale home pages ----------
for (const h of homes) {
  for (const loc of [h.loc, ...(h.loc === 'zh-hant' ? ['zh-hans'] : [])]) {
    const L = LOCALES[loc];
    const c = loc === h.loc ? h : copyFor({ locales: { 'zh-hant': h } }, 'zh-hans');
    const topicLinks = topics.filter((tp) => builtLocales(tp).includes(loc)).slice(0, 8)
      .map((tp) => { const tc = copyFor(tp, loc); return `<li><a href="${pathFor(loc, 'topic', tc.slug)}">${esc(tc.h1)}</a></li>`; });
    const body = `<section class="hero"><div class="hero-sun"></div><div class="hero-inner">
<h1>${esc(c.h1)}</h1>
<p class="sub">${esc(c.sub)}</p>
${storeBadge(loc, 'home', 'appstore-hero')}
<p class="hero-note">${esc(c.note)}</p>
<div class="phone"><img src="/assets/screenshot-onboarding.jpg" alt="${esc(c.screenshotAlt)}" width="300" height="652" /></div>
</div></section>
<main class="article wrap-narrow">
${c.sections.map((s) => `<section><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`).join('\n')}
${topicLinks.length ? `<section class="related"><h2>${esc(L.t.hub)}</h2><ul>${topicLinks.join('')}<li><a href="${L.hub}">${esc(L.t.hub)} →</a></li></ul></section>` : ''}
${c.faq?.length ? `<section class="faq"><h2>${esc(L.t.faq)}</h2>${c.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
</main>`;
    const schema = [{
      '@context': 'https://schema.org', '@type': 'MobileApplication', name: 'Bible Verse Alarm', operatingSystem: 'iOS',
      applicationCategory: 'LifestyleApplication', inLanguage: L.lang, description: c.description,
      url: abs(L.prefix), installUrl: `https://apps.apple.com/app/id${APP_ID}`, image: `${SITE}/assets/icon.png`,
    }];
    if (c.faq?.length) schema.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
    pages.push({ loc, path: L.prefix, kind: 'core', updated: c.updated, html: layout({ loc, path: L.prefix, group: 'home', title: c.title, description: c.description, body, schema, ogType: 'website' }) });
  }
}

// ---------- Write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });

// The hand-written English home gets the generated hreflang block + hub link.
const homeAlts = alternates.get('home');
const homeHead = Object.entries(homeAlts).flatMap(([l, ap]) => LOCALES[l].hreflang.map((h) => `<link rel="alternate" hreflang="${h}" href="${abs(ap)}" />`)).join('\n  ');
const indexPath = path.join(OUT, 'index.html');
fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replace('<!-- HREFLANG -->', homeHead));

for (const pg of pages) {
  const file = path.join(OUT, pg.path || 'index', 'index.html');
  if (!pg.path) throw new Error('Generated page cannot overwrite the English home');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, pg.html);
}

// Sitemaps: one per locale per page type, plus the hand-written English core pages.
const sm = {};
const add = (name, loc, updated) => (sm[name] ||= []).push({ loc, updated });
add('en-core', abs(''), '2026-10-22');
for (const p of ['/support', '/privacy', '/terms']) add('en-core', abs(p), '2026-10-22');
for (const pg of pages) add(`${pg.loc}-${pg.kind}`, abs(pg.path), pg.updated);
fs.mkdirSync(path.join(OUT, 'sitemaps'), { recursive: true });
for (const [name, urls] of Object.entries(sm)) {
  fs.writeFileSync(path.join(OUT, 'sitemaps', `${name}.xml`), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u.loc}</loc>${u.updated ? `<lastmod>${u.updated}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(sm).sort().map((n) => `<sitemap><loc>${SITE}/sitemaps/${n}.xml</loc></sitemap>`).join('\n')}
</sitemapindex>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /feedback\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

renderCards(OUT, cards);
fs.writeFileSync(path.join(OUT, 'social.json'), JSON.stringify(cards.map(({ label, sub, ...c }) => ({ ...c, pin: `${SITE}${c.image}-pin.png`, og: `${SITE}${c.image}-og.png` })), null, 1));

// pages.json lets CI diff two builds and ping IndexNow only for changed URLs.
const manifest = Object.fromEntries(pages.map((pg) => [abs(pg.path), crypto.createHash('sha1').update(pg.html).digest('hex').slice(0, 12)]));
fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(manifest, null, 1));

console.log(`Built ${pages.length} generated pages (${[...new Set(pages.map((p) => p.loc))].join(', ')})`);
