# Page templates

Templates live in code (`scripts/build.mjs`); data lives in `content/`.

## Topic page (`content/topics/<id>.json`) — "Bible verses about X" / "for X"
```
{ "id": "anxiety",                       // stable, English, never changes (used for hreflang grouping)
  "related": ["peace", "worry"],          // 3-5 sibling ids; links only render if the sibling exists in that locale
  "locales": {
    "<en|es|zh-hant|ko>": {               // zh-hans is generated from zh-hant; never write it by hand
      "slug": "anxiety",                  // URL slug; never change once published (redirect in vercel.json if you must)
      "title": "17 Bible Verses ...",     // <title>; any number in it MUST equal the verse count (build enforces)
      "description": "...",               // meta description, unique sitewide
      "h1": "...", "intro": "...",
      "published": "YYYY-MM-DD", "updated": "YYYY-MM-DD",
      "groups": [ { "heading": "...", "reflection": "original text", "refs": ["Philippians 4:6-7"] } ],
      "faq": [ { "q": "...", "a": "..." } ] } } }
```
Refs use English book names from `data/book-names.json` keys, `Book C:V` or `Book C:V-V`. Verse text is
pulled from the locale's public-domain Bible at build time. Never type verse text into content.

URLs: en `/bible-verses-about/<slug>`, es `/es/versiculos-biblicos/<slug>`, zh `/zh-hant|zh-hans/jingwen/<slug>`, ko `/ko/seonggu/<slug>`.

## Locale home (`content/home/<locale>.json`)
Feature landing page per locale. English home is hand-written in `static/index.html`.

## Planned templates (not built yet)
- Book key-verses pages ("Psalms key verses") — needs a `content/books/` type in build.mjs.
- Verse-of-the-day archive.
- Editorial/how-to pages (no verse lists) — needed for Korean while the Bible licence is pending.
