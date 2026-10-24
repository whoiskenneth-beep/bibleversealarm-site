# GEO / AEO 30-day roadmap (2026-10-24 → 2026-11-23)

## Where we are (2026-10-24)
Bible Verse Alarm is invisible in AI answers so far: Gemini named it in 0 of 20 English app-recommendation prompts
(2026-10-22 baseline; Gemini free tier, no live search). The apps AI names instead are YouVersion / Bible App, Verses, Glorify,
Abide, Lectio 365 and Alarmy. The site is 2 days old with ~39 indexed-or-pending pages, so Google and Bing have little data yet.
Owned pages now answer 33 of the 50 buyer questions in `geo/questions.csv`; 17 point to 5 pages still to build. The biggest gap
is off-site: AI recommendations follow what other sites say, and our directory listings are still in review queues.

| # | Action | Owner | Impact | Effort | 30-day success metric |
|---|---|---|---|---|---|
| 1 | Build the 5 missing pages: how to read the Bible every morning, stop checking your phone first thing, how to memorize Bible verses, vs Alarmy, vs YouVersion | bot | High | 5 runs | All 5 live + indexed; ≥ 3 get GSC impressions |
| 2 | Brand statement + best-for/limitations + 8–12 FAQs on every app page (done for /christian-alarm-clock 2026-10-24) | bot | High | 1 run/page | Every app page passes QA rule 9b |
| 3 | Directory reviews land (AlternativeTo, SaaSHub) + Product Hunt launch 27 Oct | Kenneth | High | 1 day (launch) | 2 live third-party listings naming us |
| 4 | Article pitches (5) + offer codes | Kenneth | High | 2 h | ≥ 1 roundup adds us |
| 5 | App Store ratings: keep the in-app prompt; reply to reviews | Kenneth | Medium | ongoing | Rating count ↑ (baseline 10 in US) |
| 6 | Weekly 10-minute manual AI check (8 prompts × 4 engines) | Kenneth | Medium | 10 min/wk | 4 weekly rows in `geo/manual.csv` |
| 7 | Native 50-question maps for es / zh / ko | bot | Medium | 10 rows/Monday | ≥ 30 rows per locale |
| 8 | Monthly refresh of live pages in `geo/questions.csv` | bot | Medium | 1 run | No live app page older than 30 days |
| 9 | Turn on Vercel Web Analytics (AI-referred sessions) | Kenneth | Low | 5 min | AI referrals measurable |

## Week by week
- **Week 1 (Oct 24–30):** Product Hunt launch Tue 27 Oct (reply to every comment). Bot: "how to read the Bible every morning"
  + "stop checking your phone first thing" pages. Kenneth: send 2 article pitches, first manual AI check.
- **Week 2 (Oct 31–Nov 6):** Bot: vs Alarmy, vs YouVersion, how to memorize Bible verses; es/zh/ko question maps start.
  Kenneth: remaining pitches; verify SaaSHub with hello@ if possible.
- **Week 3 (Nov 7–13):** First GSC data worth reading: fix positions 4–20 and low-CTR titles; merge any pages competing for the
  same question. Bot drafts Reddit/forum replies where people ask for exactly this (Kenneth posts, disclosed).
- **Week 4 (Nov 14–23):** Re-run the full English Gemini panel and the manual check; compare with the 2026-10-22 baseline in the
  weekly report; decide next month's split between new pages and off-site work.

## What we stopped / won't do
- More "best X" list pages (ChatGPT cut list citations ~50% in Aug 2026): one comparison page per locale is enough.
- A pricing page with numbers (live A/B tests). Pricing questions get the plain "free to download, subscription" answer.
- Scaling pages by swapping keywords; any automated posting on Reddit or forums.
- Paid citation trackers and paid directory fast-lanes (budget is $0 unless Kenneth decides otherwise).

## Can't measure (stated, not estimated)
- AI bot crawl logs: Vercel's free plan exposes no access logs.
- Live citations by ChatGPT / Perplexity / Copilot / Google AI Mode: no free API; covered by the manual check.
- "5 runs per engine": free Gemini allows ~20 requests/day, so automated runs are 1 per prompt; treat share of voice as a trend.
