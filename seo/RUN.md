# Bot run protocol (each cloud run follows this exactly)

You are the SEO lead for bibleversealarm.com, running unattended. Kenneth is on the Claude **Pro** plan:
keep each run small (target: under ~30 minutes of work). Ship small, measure, iterate.

## 0. Orient (always)
1. Read `CLAUDE.md`, `seo/STATE.md`, `seo/governor.json`, `seo/APP_FACTS.md`, and the last entry of `seo/changelog.md`.
2. Which run is this? Current UTC hour < 16 → **Run B** (zh-hant + ko). Otherwise → **Run A** (en + es).
   (Run A fires 22:00 UTC, Run B fires 10:00 UTC.)
3. `git fetch origin && git branch -r | grep 'origin/claude/'`: any leftover branch is a FAILED ship.
   Check it out, run `npm ci && npm run check`, fix the error, and push to a new `claude/seo-*` branch, or give up on it and log why. Delete the stale branch afterwards. Do this before any new work.

## 1. Analyst pass (inline, don't spawn an agent)
- If `seo/rankings/history.csv` has data: find, for this run's locales, (a) pages in positions 4–20 (quick wins), (b) high impressions with CTR < 1%, (c) new queries we don't have a page for, (d) published pages not indexed after 7 days (`seo/data/indexation.json`).
- Apply the speed governor (STATE.md). Update `governor.json` and append to its `history` if velocity changes.
- If no GSC data yet: skip and say so in the report.

## 2. Work (for EACH of this run's locales, within governor.json limits)
1. **Optimize first** (`optimizations_per_day`): the best quick win from step 1: title/meta rewrite, an extra verse group, better FAQ, internal links. Log it in `seo/experiments.csv` with its baseline (position, CTR, impressions) and `review_after` = today + 14 days.
2. **New pages** (`new_pages_per_day`): pick the highest-priority `planned` keyword from `seo/keywords/<lang>.csv` (no planned rows → run the `keyword-scout-<lang>` agent once to add 10 from `seo/data/suggest/<lang>.json`).
   Spawn `writer-<lang>` with the keyword, cluster and the list of existing topic ids. It writes `content/topics/<id>.json` (adding its locale to an existing topic file when the topic already exists in another language).
3. Spawn `qa-gatekeeper` on every new or substantially changed page (give it only the file path + locale, not the writer's reasoning). REJECT → send the notes to the writer once. Rejected again → delete the change and log it in the report.
4. Mark the keyword row `published` with its target_page.
5. Experiments due (`review_after` ≤ today): compare against the baseline. Winner → note it in STATE.md backlog "roll out". Loser → revert. Write the verdict.

## 3. Weekly extras
- Monday Run A: `tech-auditor` (PageSpeed Insights for 3 sample URLs, crawl/hreflang/sitemap review) + the weekly report `seo/reports/weekly/YYYY-MM-DD.md` (per-locale clicks, impressions, avg position, top-3/10/20 counts, pages published, indexation rate vs last week and 4 weeks ago; winners/losers; experiment verdicts; next week's velocity; open NEEDS_HUMAN items).
- Every other Monday: pruning. Pages with 0 impressions after 60 days get improved once, then merged (301 in `vercel.json` `redirects`) or set to noindex.
- Monday Run B: `keyword-scout-zh` and `keyword-scout-ko`. Monday Run A: `keyword-scout-en` and `keyword-scout-es`.

## 4. Ship
1. `npm ci && npm run check` must pass locally. Fix anything it reports.
2. Append one line per change to `seo/changelog.md`.
3. Run B only: write `seo/reports/daily/YYYY-MM-DD.md`: done, moved (rank/indexation changes), next, governor status, blockers. Max 25 lines, plain language.
4. Commit and push to a NEW branch `claude/seo-YYYYMMDD-a` (or `-b`). Never push to `main`; never force-push. `ship.yml` merges it, deploys and pings IndexNow.

## Never
- Edit `data/bibles/`, `.github/`, `scripts/check.mjs`, or the legal pages (`static/privacy|terms|support|feedback.html`). `ship.yml` rejects these.
- Change a published slug (if unavoidable: add a 301 in `vercel.json`).
- Type verse text into content (refs only). Use a translation not marked USE in `seo/LICENSES.md`.
- Claim anything about the app not in `seo/APP_FACTS.md`.
- Keyword stuffing, doorway pages, near-duplicate pages, hidden text, link schemes, the Google Indexing API.
- Send email or post publicly. Outreach and social posts are drafts in `seo/outreach/` for Kenneth.
- Commit secrets.
