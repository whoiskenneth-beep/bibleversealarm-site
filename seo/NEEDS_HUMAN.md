# Needs Kenneth

Only things that need your login or your decision. The bot works around all of these and keeps going.
Each item: what, why it matters, exact steps, and my recommendation.

## 0. BLOCKER: give Claude's GitHub App access to this repo (2 minutes)
**Why:** the cloud bot can write pages but can't push them. Its first test run (2026-10-22) made a "peace" page in English + Spanish and lost it on a 403 error.
1. Open https://github.com/apps/claude/installations/select_target and pick your account (whoiskenneth-beep).
2. Under "Repository access", either choose "All repositories" or add `bibleversealarm-site` to the selected list → Save.
3. Tell Claude "re-run the SEO bot" (or just wait: it runs by itself at 06:00 and 18:00 MYT).

## 1. Google Search Console + Bing: DONE 2026-10-22
Verified (`sc-domain:bibleversealarm.com`), sitemap submitted to Google and Bing, key stored as GitHub secret
`GSC_SERVICE_ACCOUNT_JSON`, first daily pull succeeded. Don't delete the `google-site-verification` DNS TXT record.
Old notes below kept for reference.
**Why:** without it the bot is flying blind. No rankings, no indexation numbers, so the speed governor can't work.
A separate Claude session is setting it up with Google Cloud project 377002055736. When it finishes, the key file
is at `~/.config/bibleversealarm/gsc-sa.json`. Then one command (Claude can run it for you) puts it into GitHub:
```
gh secret set GSC_SERVICE_ACCOUNT_JSON --repo whoiskenneth-beep/bibleversealarm-site < ~/.config/bibleversealarm/gsc-sa.json
```

## 2. Korean Bible licence: decide whether to use 개역한글 (Korean Revised Version 1961)
**Why:** Korean pages can't show verses until this is decided. This also affects app 2.4.0, which bundles the same text.
- Case for "yes": Korean copyright for a 1961 work by an organisation lasted 50 years, so it ran out at the end of 2011, and the 2013 law change to 70 years didn't bring expired works back. Many Korean sites and Korean Wikisource treat it as public domain.
- Case for caution: the Korean Bible Society (대한성서공회) has publicly claimed rights over it.
- **My recommendation: ask the Korean Bible Society directly** (email is free, and their answer covers the app too): "Is 개역한글 (1961) free to quote on a website and in an app?". Meanwhile the bot only publishes Korean pages without verses.
To approve: tell any Claude session "approve 개역한글". It will copy `krv.json`, mark it USE in `seo/LICENSES.md` and unblock Korean.

## 3. Social posting: weekly pack (about 10 min/week)
Every Monday 08:30 MYT the bot puts a new folder in `seo/social/packs/<date>/` (view it on GitHub:
https://github.com/whoiskenneth-beep/bibleversealarm-site/tree/main/seo/social/packs). The first pack is already there.
**Pinterest (one-time setup, then 2 min/week):**
1. Create a free **Pinterest Business** account (pinterest.com/business/create). Claim the website bibleversealarm.com, and send the meta tag Pinterest gives you to Claude so it can add it to the site.
2. Create two boards with EXACTLY these names: `Bible Verses` and `Versículos de la Biblia`.
3. Each week: Pinterest → Settings → **Bulk create Pins** → upload that week's `pinterest.csv`. If Pinterest complains about a column, download its template, tell Claude, and the bot's file will be adjusted.
**Threads (2 min/day, or schedule them all at once in the Threads app):** open `threads.md` and paste one post a day. The image is optional.
Later, once Korean is unblocked: Naver Blog. Naver ranks its own blogs above most websites.

## 4. Naver Search Advisor (Korea's main search engine)
1. Go to searchadvisor.naver.com, sign in with a Naver account (making one needs a Korean phone number or a foreign email signup).
2. Add site `https://bibleversealarm.com` and pick "HTML tag" verification. Send the meta tag to Claude, who adds it to the site.
3. After verifying: Requests → Submit sitemap → `https://bibleversealarm.com/sitemap.xml`.
(IndexNow already notifies Naver, so this is about seeing Naver's data.)

## 5. Spanish market: confirm Latin America
Defaulted to Latin America (neutral "tú", "celular"), which also reads fine in Spain. Tell Claude if you want Spain-first instead.

## 6. Tidy-up (no rush)
The old `site/` folder in the app repo (`bible-alarm/site`) is now stale: the live site deploys from this repo.
Delete it in a future app commit so nobody edits the wrong copy.

## 7. AI training crawlers: confirm "allow" (decision)
robots.txt always allows AI *search* bots (ChatGPT search, Perplexity, Claude, Copilot, Gemini/Google), so we can be cited.
Separately, it currently also **allows AI *training* crawlers** (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot).
**My recommendation: keep allowing.** Our pages are marketing for the app, and verse text is public domain; letting future models
learn "Bible Verse Alarm = the alarm that makes you finish a verse" helps recommendations. To block instead: tell Claude
"block AI training" (flips `allow_training` in `seo/entity.json`).

## 8. Social profile links + one consistent name (5 min)
Send Claude the public URLs of your Facebook page, YouTube channel, TikTok, Threads and (later) Pinterest. They go into
`seo/entity.json` → the site's schema `sameAs`, which helps Google and AI engines know these are all the same app.
Keep the name **"Bible Verse Alarm"** and the one-liner in `seo/entity.json` identical on every profile bio and directory listing.

## 9. Gemini key: DONE 2026-10-22 (free tier, account 2)
Works on the free tier, with two limits: no Google Search grounding (free quota is 0) and only ~20 requests/day. So the
tracker checks what Gemini *knows* (20 app prompts, one language per day), not live citations. Live citations are covered by your
manual check (#10). Never add billing to that project unless you decide to pay (~$25–30/month for the full search-grounded panel).

## 10. Weekly 10-minute AI check (engines with no free API)
Every Monday, ask these 8 prompts in **ChatGPT, Perplexity, Microsoft Copilot and Google AI Mode** (and Naver for the Korean ones),
logged out or in a private window: `en01, en03, en05, es01, es03, zh01, zh15, ko01` (text in `geo/prompts/`).
Note: did it name or link Bible Verse Alarm (y/n), and which apps did it name? Either add rows to `geo/manual.csv` on GitHub,
or just paste the notes to Claude. Skipping a week is fine; this is a trend.

## 11. Bing AI Performance export (optional, 2 min/week)
If Bing Webmaster Tools shows an **AI Performance** report for bibleversealarm.com, export it weekly as CSV and upload it to
`geo/bing/` on GitHub (Add file → Upload). The bot feeds its grounding queries into keywords and prompts.

## 12. See AI referral visits: turn on Vercel Web Analytics? (decision)
Installs from AI engines are already tracked: store links get `ct=ai_chatgpt_...` etc., visible in App Store Connect → Campaigns.
What we *can't* see is visits. **My recommendation: turn on Vercel Web Analytics** (free on your plan, cookieless, no consent banner):
Vercel dashboard → project "site" → Analytics → Enable, then tell Claude, who adds the one-line script.
(Server logs per AI crawler aren't available on Vercel's free plan, so that part of the plan is skipped.)

## 13. Author: DONE 2026-10-23
Kenneth Foo is the named author on every page (byline + Person schema), with an English About page at /about.
Spanish, Chinese (Traditional + auto Simplified) and Korean bios approved and live 2026-10-23. Korean mentions Matthew 22:37
without quoting it until the 개역한글 decision (#2). Still open: an optional real headshot (send one to Claude; until then the page uses the app icon).

## 14. PageSpeed Insights API key (optional, 3 min)
The anonymous PSI quota was exhausted on 2026-10-26 (HTTP 429), so weekly Core Web Vitals could not be read. A free Google Cloud API key, added as GitHub/routine secret `PSI_API_KEY`, fixes it.
