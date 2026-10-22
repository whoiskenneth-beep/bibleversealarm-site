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

## 3. Social accounts to prepare (for verse-card posts that link back)
In order of value:
1. **Pinterest Business account** (English + Spanish). Pinterest is the biggest free traffic source for "Bible verses about…" searches. Steps: pinterest.com/business/create → claim the website bibleversealarm.com (Pinterest gives you a meta tag: send it to Claude, who adds it to the site).
2. **Threads** (Traditional Chinese for Taiwan/HK, plus English). Needs an Instagram account. Threads is big in Taiwan, as you said.
3. **Instagram**: required for Threads anyway; reuse the same cards.
4. **Facebook Page** (Spanish / Latin America, where Facebook is still strong for devotional content).
5. Later, once Korean is unblocked: **Naver Blog**. Naver ranks its own blogs above most websites.
Connect each one to **Postiz** (you already use it for the quiz shorts). The bot then drafts posts there for you to approve, the same flow as your videos.

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
