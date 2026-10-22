# SEO state: read this first, every run

## What this is
bibleversealarm.com is a static site generated from `content/` by `scripts/build.mjs` and deployed by Vercel from `main`.
Goal: rank in English, Spanish, Chinese (TW/HK in Traditional, MY/SG in Simplified) and Korean, and turn visits into App Store installs.
Owner: Kenneth (beginner-friendly explanations, concise). Budget: $0 (only free tools/APIs). Claude plan: **Pro**, so runs are LEAN.

## How it runs (no computer needed)
| When (MYT) | UTC | What | Where |
|---|---|---|---|
| 04:00 daily | 20:00 | `data.yml`: GSC rankings + indexation, autocomplete, App Store languages → commits `seo/` | GitHub Actions (free, public repo) |
| 06:00 daily | 22:00 | **Run A**: en + es (see `seo/RUN.md`) | Claude cloud routine |
| 18:00 daily | 10:00 | **Run B**: zh-hant (→ zh-hans) + ko | Claude cloud routine |
| Mon 08:30 weekly | 00:30 | `social.yml`: weekly posting pack → `seo/social/packs/<date>/` (Kenneth posts it by hand) | GitHub Actions |
| Mon–Thu 09:00 | 01:00 | `geo.yml`: AI-answer prompt panel on Gemini free tier (Mon en, Tue es, Wed zh, Thu ko; 20 app prompts, 1 run) → `geo/results.csv`, `geo/sov.json` | GitHub Actions |
| on every bot push | | `ship.yml`: guard → build → checks → merge to main → wait for deploy → IndexNow | GitHub Actions |

Bot runs push to a `claude/seo-*` branch, never to `main`. `ship.yml` is the only path to `main`.
A failed ship leaves its branch on the remote. The next run must fix or drop it before new work.

## Speed governor
Tracked in `seo/governor.json` (indexation filled in daily by `gsc_pull.mjs`; velocity set by the analyst).
- No decisions until a locale has 14+ days of GSC data: hold starting velocity.
- Indexed ≥ 80% and new pages get impressions within 14 days → raise `new_pages_per_day` by 50% (round up). Pro cap: max 2 new pages per run total.
- Indexed 50–80% → hold velocity; half of each run goes to improving existing pages.
- Indexed < 50%, or sitewide clicks/impressions down > 20% week over week → `status: "stop"` for that locale. No new pages. Diagnose (thin? duplicate? crawl?), fix, log the diagnosis in the daily report.
Every change to velocity is appended to `governor.json.history` with the date and reason.

## Decisions (locked)
- English stays at the root (`/`, `/bible-verses-about/...`) so the App Store-linked URLs `/`, `/privacy`, `/support`, `/terms`, `/feedback` never move. Other locales: `/es`, `/zh-hant`, `/zh-hans`, `/ko`.
- Chinese: write Traditional (Taiwan voice) once; `zh-hans` is auto-converted (OpenCC) with native Simplified CUV verses. No mainland China/Baidu.
- Spanish: Latin America, neutral `tú` voice (Kenneth may override; see NEEDS_HUMAN).
- Korean: homepage + feature pages (no verse text) until the 개역한글 licence decision (LICENSES.md).
- Lean on Pro: 1 new page per locale per day; qa-gatekeeper on every new page; scouts weekly.

## GEO (AI answer engines): see `geo/README.md`
Priority #1: app-recommendation prompts in all 4 languages. Every locale's queue starts with the GEO trio (`app-compare`,
`app-explainer`, `app-faq`). All pages are written answer-first (`seo/templates/README.md`). Entity facts: `seo/entity.json`.

## Backlog (highest impact first)
1. GSC + Bing connected (separate session doing it; see `seo/GSC_SETUP.md` when it exists). Then add GitHub secret `GSC_SERVICE_ACCOUNT_JSON`.
2. More topic pages per keyword map: peace, fear, hope, sleep/night, comfort, grief, healing, gratitude, encouragement, faith, love, patience, forgiveness, marriage, family, work, exams, birthdays, new year.
3. App-intent feature pages first in every locale (`app-alarm`, `app-memorize`, `app-devotional` clusters): they're the install drivers. "bible app" itself is rejected (YouVersion owns it; it's an App Store/ASO fight).
4. DONE 2026-10-22: verse cards + og images; weekly Pinterest/Threads pack. Next: outreach drafts (item 7).
5. Book key-verses template; verse-of-the-day archive.
6. Comparison pages (factual): "Bible verse alarm apps", vs. Alarmy/Glorify-style alternatives.
7. Embeddable verse-of-the-day widget + printable verse sets (linkable assets); outreach drafts in `seo/outreach/`.

## Status
- 2026-10-22: Phase 0 + Phase 1 shipped (see changelog). 24 indexable pages.
