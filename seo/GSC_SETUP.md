# Search Console + Bing setup (done 2026-10-22)

Status: **working**. Google Search Console (GSC) and Bing Webmaster Tools are both verified for bibleversealarm.com, and the bot account can read GSC data through the API.

## Key facts

| Thing | Value |
|---|---|
| Google Cloud project | ID `triple-backbone-509`, number `377002055736`, name "My Project" |
| APIs enabled | Google Search Console API (`searchconsole.googleapis.com`), PageSpeed Insights API (`pagespeedonline.googleapis.com`). The Indexing API is **not** enabled and should not be. |
| Service account | `seo-bot@triple-backbone-509.iam.gserviceaccount.com` (no Cloud IAM roles; its access is granted inside GSC only) |
| Service account key | `~/.config/bibleversealarm/gsc-sa.json` (chmod 600, outside every repo) |
| GSC property | **Domain property** `sc-domain:bibleversealarm.com` (covers http/https, www and every subdomain) |
| GSC owner | whoiskenneth@gmail.com (verified owner) |
| seo-bot permission in GSC | **Full** (can read all data and submit sitemaps; cannot add/remove users or verify) |
| Verification method | DNS TXT record at Cloudflare: `@  TXT  google-site-verification=HcbzbqVMi0A1uZrnIFVfZgi7YjFhZsWmyjg36obaCKQ` |
| Bing site | `https://bibleversealarm.com/` imported from GSC, verified |
| Bing API key | `~/.config/bibleversealarm/bing-api-key` (chmod 600, outside every repo) |

### Where DNS lives

DNS for bibleversealarm.com is on **Cloudflare** (nameservers `kara.ns.cloudflare.com`, `maciej.ns.cloudflare.com`), not on Vercel. Vercel lists `ns1/ns2.vercel-dns.com` as its "intended" nameservers, but that doesn't matter: the A records in Cloudflare point to Vercel (`76.76.21.21`), so the site is served correctly. **`vercel dns add` has no effect on this domain.** DNS changes must be made in the Cloudflare dashboard.

**Do not delete the `google-site-verification` TXT record.** If it's removed, Google un-verifies the property and the pipeline loses access.

## What was tested (all passed on 2026-10-22)

Calls made with the seo-bot key (JWT signed with the key, scope `https://www.googleapis.com/auth/webmasters`):

1. `sites.list` returned `sc-domain:bibleversealarm.com` with `permissionLevel: siteFullUser`.
2. `searchAnalytics.query`, last 7 days, dimension `query`: HTTP 200 with no rows yet. That's expected for a property added today. Data shows up after about 2–3 days.
3. `sitemaps.list`: HTTP 200.
4. `sitemaps.submit` for `https://bibleversealarm.com/sitemap.xml`: HTTP 204. Google fetched it straight away: it's a sitemap index with 13 child sitemaps, 0 errors and 0 warnings.
5. Bing API `GetUserSites` with the API key lists `https://bibleversealarm.com/` as verified. `SubmitFeed` for the same sitemap was accepted (status "Pending" in Bing).

## Notes for the pipeline / GitHub Action

- Site URL to use in GSC API calls: `sc-domain:bibleversealarm.com` (URL-encode it as `sc-domain%3Abibleversealarm.com`).
- For read-only jobs, request the scope `https://www.googleapis.com/auth/webmasters.readonly`. Use the `webmasters` scope only for a job that submits sitemaps.
- GitHub secret `GSC_SERVICE_ACCOUNT_JSON` = the full contents of `~/.config/bibleversealarm/gsc-sa.json`. To add it without pasting:
  `gh secret set GSC_SERVICE_ACCOUNT_JSON --repo whoiskenneth-beep/bibleversealarm-site < ~/.config/bibleversealarm/gsc-sa.json`
- Optional Bing secret: `gh secret set BING_WEBMASTER_API_KEY --repo whoiskenneth-beep/bibleversealarm-site < ~/.config/bibleversealarm/bing-api-key`
  The Bing API base is `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=...` (for example `GetQueryStats`, `GetRankAndTrafficStats`, `GetCrawlStats`).
- PageSpeed Insights API is enabled in the same project. To use it from the Action, create an API key in Cloud Console (APIs & Services → Credentials), restricted to the PageSpeed Insights API. This wasn't done yet because nothing needs it yet. It also works without a key at a low rate limit.
- **Never commit the key files.** Both live in `~/.config/bibleversealarm/`, outside the repo.

## Still open / for Kenneth

- **Nothing is blocking.** GSC performance data will start to appear in 2–3 days. Bing's dashboards can take up to 48 hours.
- Bing was given **view-only** access to Kenneth's Search Console (for the import and for keeping sitemaps in sync). Kenneth approved this. To revoke it later: myaccount.google.com/permissions → Bing.
- Only bibleversealarm.com was imported into Bing. Kenneth's other GSC sites (planhourly.com, trackmy.codes, realmoment.ai) were deliberately left unchecked.
- If the key ever leaks, revoke it: Cloud Console → IAM & Admin → Service accounts → seo-bot → Keys → delete the key. Then create a new key and update the GitHub secret.
- Google recommends Workload Identity Federation (keyless) over JSON keys for GitHub Actions. It's free and safer, but more setup. Worth doing later if you want no long-lived key at all.
