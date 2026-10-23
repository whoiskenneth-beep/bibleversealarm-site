# Tools

Rule: every third-party package/skill/MCP is vetted before install (code read, stars, recent commits, issues) and logged here.
The bot runs unattended with push rights, so fewer dependencies = less supply-chain risk. Default: build it ourselves when it's small.

## Installed
| Tool | Why | Vetting |
|---|---|---|
| `opencc-js` 1.4.2 (npm) | Traditional → Simplified Chinese conversion (Taiwan phrases → mainland/SG/MY wording) for zh-hans pages | github.com/nk2028/opencc-js: 361★, last push 2026-09-21, 2 open issues, MIT + Apache-2.0, pure JS, no install scripts. Pinned exact version. |
| `@resvg/resvg-js` 2.6.2 (npm) | Renders the verse-card SVGs to PNG at build time (Pinterest/Threads cards + og:image) | github.com/thx/resvg-js: 2,003★, last push 2026-06-30, MPL-2.0, prebuilt native binaries per platform via optionalDependencies, no install scripts. Pinned exact version. |
| Fonts in `data/fonts/` | Fraunces (Latin) + Noto Serif TC/SC/KR, all SIL Open Font License (`data/fonts/OFL.txt`) | Downloaded from github.com/google/fonts (Google's official repo). Weights pinned and subset offline with fonttools 4.60.1 to the CUV/KRV Bible characters + Big5/GB2312/KS X 1001 common sets + site content (65 MB → 6 MB). If a card shows a missing (tofu) character, re-run the subset with that text added. |
| `ai-seo` skill (vendored, `.claude/skills/ai-seo/`) | GEO/AEO playbook the bot follows for AI-answer work: extractability checklist, citations vs recommendations, format volatility, multilingual AEO, prompt portfolio | From github.com/coreyhaines31/marketingskills (56k★, MIT, last push 2026-10-19, v2.10.1). Read in full: pure Markdown, no scripts, no remote calls, no keys; claims are dated and source-weighted. Compared against zubair-trabzada/geo-seo-claude (11k★; good but agency-sales extras + English-only Python scorer) and AgriciDaniel/claude-seo (20k★; GEO is one module of a large suite). Update by re-copying after reading the diff (see VENDORED.md). |

## Built in-house (no dependencies)
| Script | Does |
|---|---|
| `scripts/build.mjs` | Static generator: locales, reciprocal hreflang + x-default, canonicals, per-locale/per-type sitemaps, robots.txt, JSON-LD (Article, BreadcrumbList, FAQPage, CollectionPage/ItemList, MobileApplication), Smart App Banner, `ct=` App Store campaign links, IndexNow key file, pages.json manifest |
| `scripts/check.mjs` | Merge gate: broken internal links, hreflang reciprocity/self-ref, canonical = URL, unique titles/descriptions, orphans, sitemap drift, JSON-LD validity, 150KB page budget |
| `scripts/gsc_pull.mjs` | Search Console Search Analytics + URL Inspection via service-account JWT (no googleapis SDK) |
| `scripts/suggest.mjs` | Google autocomplete (per language/country) + Naver autocomplete keyword expansion |
| `scripts/cards.mjs` | Verse cards: 1000×1500 pin + 1200×630 og image per topic/feature page (`public/cards/`) |
| `scripts/social_pack.mjs` | Weekly posting pack: Pinterest bulk-upload CSV + Threads copy-paste posts (`seo/social/packs/`) |
| `scripts/indexnow.mjs` | IndexNow ping for changed URLs only (covers Bing, Naver, Yandex, Seznam) |

| `scripts/geo_panel.mjs` | AI-answer prompt panel via the Gemini API with Google Search grounding (free tier; quota changes often, check AI Studio's rate-limit page). Other engines have no free API tier → manual checklist. |

## Evaluated, not installed
| Tool | Why not (yet) |
|---|---|
| Next.js / Astro / Eleventy | Overkill for static pages; a 400-line generator is easier for the bot to reason about. |
| Lighthouse CI | Heavy in CI; pages are tiny static HTML with no JS. Use the free PageSpeed Insights API weekly instead (tech-auditor). Revisit if CWV fail. |
| `googleapis` npm SDK | Huge dependency for two endpoints; replaced by ~40 lines of fetch + JWT. |
| Paid SEO MCPs (Ahrefs, Semrush, DataForSEO) | Not free. |
| Firecrawl plugin | Free tier too small for daily use; needs auth. |
| Google Indexing API | Only for job postings/livestreams. Never use it for these pages. |
| Postiz / Pinterest + Threads APIs | Kenneth chose a manual weekly pack instead (2026-10-22): no developer apps, tokens or approvals. Revisit if the pack brings clicks. |
