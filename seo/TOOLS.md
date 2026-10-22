# Tools

Rule: every third-party package/skill/MCP is vetted before install (code read, stars, recent commits, issues) and logged here.
The bot runs unattended with push rights, so fewer dependencies = less supply-chain risk. Default: build it ourselves when it's small.

## Installed
| Tool | Why | Vetting |
|---|---|---|
| `opencc-js` 1.4.2 (npm) | Traditional → Simplified Chinese conversion (Taiwan phrases → mainland/SG/MY wording) for zh-hans pages | github.com/nk2028/opencc-js: 361★, last push 2026-09-21, 2 open issues, MIT + Apache-2.0, pure JS, no install scripts. Pinned exact version. |

## Built in-house (no dependencies)
| Script | Does |
|---|---|
| `scripts/build.mjs` | Static generator: locales, reciprocal hreflang + x-default, canonicals, per-locale/per-type sitemaps, robots.txt, JSON-LD (Article, BreadcrumbList, FAQPage, CollectionPage/ItemList, MobileApplication), Smart App Banner, `ct=` App Store campaign links, IndexNow key file, pages.json manifest |
| `scripts/check.mjs` | Merge gate: broken internal links, hreflang reciprocity/self-ref, canonical = URL, unique titles/descriptions, orphans, sitemap drift, JSON-LD validity, 150KB page budget |
| `scripts/gsc_pull.mjs` | Search Console Search Analytics + URL Inspection via service-account JWT (no googleapis SDK) |
| `scripts/suggest.mjs` | Google autocomplete (per language/country) + Naver autocomplete keyword expansion |
| `scripts/indexnow.mjs` | IndexNow ping for changed URLs only (covers Bing, Naver, Yandex, Seznam) |

## Evaluated, not installed
| Tool | Why not (yet) |
|---|---|
| Next.js / Astro / Eleventy | Overkill for static pages; a 400-line generator is easier for the bot to reason about. |
| Lighthouse CI | Heavy in CI; pages are tiny static HTML with no JS. Use the free PageSpeed Insights API weekly instead (tech-auditor). Revisit if CWV fail. |
| `googleapis` npm SDK | Huge dependency for two endpoints; replaced by ~40 lines of fetch + JWT. |
| Paid SEO MCPs (Ahrefs, Semrush, DataForSEO) | Not free. |
| Firecrawl plugin | Free tier too small for daily use; needs auth. |
| Google Indexing API | Only for job postings/livestreams. Never use it for these pages. |
| `@resvg/resvg-js` (OG/verse-card images) | Candidate for per-page OG images + Pinterest cards. Needs vetting + CJK fonts. Backlog. |
