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

## Feature page (`content/features/<id>.json`): app-intent and non-verse pages
For keyword clusters starting with `app-` (e.g. "christian alarm clock app", "bible memory app") and `comparison`.
```
{ "id": "christian-alarm-clock", "related": ["morning"],   // related = topic ids
  "locales": { "<loc>": {
      "slug": "christian-alarm-clock",   // served at <locale prefix>/<slug>; reserved words are refused by the build
      "nav": "Christian alarm clock",    // short label: every footer in that locale links to every feature page
      "title": "...", "description": "...", "h1": "...", "intro": "...", "published": "...", "updated": "...",
      "sections": [ { "heading": "...", "body": "paragraphs split by a blank line", "refs": ["Psalms 5:3"] } ],  // refs optional
      "faq": [ { "q": "...", "a": "..." } ] } } }
```
Rules: ONE feature page per cluster per locale. Phrasings of the same intent ("bible verse alarm app", "alarm that makes you
read the bible") all point at the same page via `target_page`. Making near-duplicate pages per phrasing = doorway pages = penalty.
Every app claim must be in `seo/APP_FACTS.md`. Comparison pages: only facts checkable on each app's App Store page, no knocking competitors.
Korean may ship feature pages now if no section has `refs` (the build refuses refs without a licensed Bible).
Example: `content/features/christian-alarm-clock.json` (en).

## Locale home (`content/home/<locale>.json`)
Feature landing page per locale. English home is hand-written in `static/index.html`.

## Planned templates (not built yet)
- (Feature pages are built: see above.)
- Book key-verses pages ("Psalms key verses") — needs a `content/books/` type in build.mjs.
- Verse-of-the-day archive.
