# bibleversealarm.com

Static multilingual SEO site for the Bible Verse Alarm iOS app. Unattended bot runs follow `seo/RUN.md`; start with `seo/STATE.md`.

- `npm run build` → `public/` · `npm run check` = build + SEO merge gate. Must pass before any push.
- Content is data: `content/topics/*.json`, `content/home/*.json` (schema: `seo/templates/README.md`). Verse text comes from `data/bibles/` at build time.
- English lives at the root; `/es`, `/zh-hant`, `/zh-hans` (generated from zh-hant, never hand-written), `/ko`.
- Quality rules (uniqueness, titles, cannibalization, hreflang, schema): `seo/PLAYBOOK.md`.
- Licences: `seo/LICENSES.md`. App claims: `seo/APP_FACTS.md`. Things only Kenneth can do: `seo/NEEDS_HUMAN.md`.
- Push only to `claude/seo-*` branches; `.github/workflows/ship.yml` merges to `main`.

Quality bar for every page: real search intent, curated verses with original reflections, native voice for its market (not translated), unique vs. every sibling page, accurate about Scripture and the app.
