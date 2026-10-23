# SEO playbook (rules borrowed from vetted open-source skills)

Distilled on 2026-10-22 from MIT-licensed skills, read and vetted first (see `seo/TOOLS.md`). Copied as rules, not installed,
so nothing upstream can change what the bot does. Agents read the section for their role.
Sources: AgriciDaniel/claude-seo (`seo-programmatic`, `seo-hreflang`, `seo-schema`, `seo-content`),
coreyhaines31/marketingskills (`programmatic-seo`), Illyism/seo-skills (`seo-title-optimization`; no licence file, ideas only, no text copied).

## 1. Scaled-content safety (all writers + QA)
- **Standalone value test:** would this page be worth publishing if no similar page existed? If not, don't ship it.
- **Uniqueness gate (enforced by `npm run check`):** a page's own writing (verse quotes excluded) must be ≥ 30% unique vs every
  other page in its language (error below 30%, warning below 40%). See the numbers with `UNIQ_REPORT=1 node scripts/check.mjs`.
- **Thin warning:** under 300 words of own writing (Chinese: 600 characters). Topic pages should normally be 450–700 words.
- **No mad-libs:** never reuse a sibling's intro or reflection structure with the topic word swapped.
- **Progressive rollout:** the governor already limits speed. Never batch-publish more than 10 pages in one run, ever.
- **Cannibalization:** one search intent = one page. Before writing, grep `content/` and `seo/keywords/` for a page that already
  serves the intent ("verses for worry" vs "verses for anxiety"). If one exists, improve it instead of making a new page.

## 2. Titles (writers + analyst quick wins)
- Formula: primary keyword near the front + modifier/benefit. Aim for 40–55 characters (CJK: 15–28 characters).
- Title, H1, meta description and slug all about the same topic; the H1 may be shorter than the title.
- Match the page type: listicle ("17 Bible Verses for…"), definition ("What Is a…?"), how-to ("How to…"), comparison ("X vs Y"),
  best-of ("Best … for …"). One pattern per page.
- Vary patterns across a language: if more than 60% of titles start the same way, `npm run check` warns. Alternate e.g.
  "Bible Verses for Anxiety: 17 Promises…", "What the Bible Says About Fear (16 Verses)", "Short Bible Verses for…".
- Primary keyword appears in the first 100 words of the intro, naturally. No density targets: repetition reads as stuffing.
- When rewriting a title for CTR (positions 4–20, low CTR): write 3 options, pick one, log the old title as the experiment baseline.
  Never change the slug for a title change.

## 3. Who / How / Why (QA, and writers when relevant)
Google's quality raters ask: **who** made this, **how**, and **why**. Our honest answers:
- Who: the Bible Verse Alarm team (Organization byline). Never invent a pastor, author or credential.
- How: verses quoted from named public-domain Bibles; reflections written for the page. No fake "reviewed by" claims.
- Why: to help someone find Scripture for what they're facing. The page must serve that before it promotes the app.
- Pages on anxiety, depression, grief or health are "your money or your life"-adjacent: be careful, point to real help, no promises.

## 4. Keyword patterns worth templating (scouts)
From the programmatic-SEO playbooks, the patterns that fit us:
- **Topic:** "bible verses about/for [feeling, struggle, virtue]": the main engine.
- **Persona:** "bible verses for [women, men, teens, moms, nurses, students, couples]": only with persona-specific verses and reflections.
- **Occasion/time:** "[morning, bedtime, birthday, exam, wedding, funeral, new year] bible verses".
- **Short/format:** "short bible verses about X", "bible verses to memorize": a real distinct intent (short, memorable verses).
- **Curation/comparison:** "best christian apps", "[app] alternatives", "X vs Y": feature pages, facts from App Store pages only.
- **Definition/glossary:** "what is a devotional / quiet time / 큐티 / 靈修": answer-first explainer feature pages.
Before scheduling a cluster, look at who ranks (WebSearch the keyword). If page 1 is all giant sites with exactly this page,
prefer a longer, more specific variant.

## 5. Hreflang + technical (tech-auditor)
- Every page lists itself and all alternates; every alternate links back; hreflang only on canonical URLs; URLs match the canonical
  exactly. (`npm run check` enforces self-ref, return tags and canonical = URL.)
- Codes: ISO 639-1 language (+ optional ISO 15924 script, + optional ISO 3166-1 region). Ours: `en`, `x-default`, `es`,
  `zh-Hant`/`zh-TW`/`zh-HK`, `zh-Hans`/`zh-SG`/`zh-MY`, `ko`. Never `es-LA` (not a country), `en-UK`, or a region without a language.
- hreflang is a hint, not a directive. Search Console's country targeting was removed in 2022; don't look for it.
- Sitemap `lastmod` must be the content's real `updated` date, never the build time. Noindexed pages never go in sitemaps.
- Hub pages are lists by design: thin-content warnings on hubs are fine.

## 6. Schema (tech-auditor)
- Keep: Article, BreadcrumbList, CollectionPage/ItemList, WebPage, Organization, MobileApplication.
- FAQPage: keep it (visible FAQ must match). Upstream reports Google retired FAQ rich results for all sites in May 2026, which we
  haven't confirmed. Either way it costs nothing and AI engines read it. Don't expect FAQ snippets in Google.
- Never add HowTo (rich result removed 2023) or any deprecated type.
- MobileApplication only gets an app rich result with `offers` + `aggregateRating`. We can't state prices (live A/B tests) and
  must never invent ratings, so we accept no app rich result.
