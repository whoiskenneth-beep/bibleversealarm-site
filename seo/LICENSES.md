# Bible text licences

Only translations marked **USE** may appear on the site. `scripts/build.mjs` maps each locale to one Bible.
Files in `data/bibles/` were copied from the app repo (`BibleVerseAlarm/Resources/`); they are not edited by hand.

| Translation | File | Locale | Status | Basis |
|---|---|---|---|---|
| Berean Standard Bible (BSB) | `bsb.json` | en | **USE** | Dedicated to the public domain by the Berean Bible publishers (April 2023). No attribution required; we credit it anyway. |
| World English Bible (WEB) | `web.json` | en (spare) | **USE** | Public domain by its publisher (eBible.org). |
| King James Version (KJV) | `kjv.json` | en (spare) | USE outside UK concerns | Public domain except in the UK (Crown letters patent). Not used on pages; prefer BSB/WEB. |
| Reina-Valera 1909 | `rvr1909.json` | es | **USE** | Published 1909; public domain. (Do NOT use RVR1960: copyrighted by the United Bible Societies.) |
| Chinese Union Version 和合本 (1919) | `cuv-hant.json`, `cuv-hans.json` | zh-hant, zh-hans | **USE** | Published 1919; public domain. (Do NOT use 和合本修訂版 RCUV 2010: copyrighted by the Hong Kong Bible Society.) |
| 개역한글 Korean Revised Version (1961) | not copied | ko | **HOLD** | Widely treated as public domain since 2012 (Korea's 50-year term for works published in 1961 ran out at the end of 2011, and the 2013 extension to 70 years didn't bring back terms that had already expired). The Korean Bible Society has disputed this. Kenneth decides: seo/NEEDS_HUMAN.md #2. Note: app 2.4.0 also bundles `krv.json`, so this decision affects the app too. |
| New International Version (NIV) | not copied | — | **NEVER on the site** | Biblica licence covers the app only. |
| 개역개정 / 새번역 / RVR1960 / NVI / 新譯本 / 現代中文譯本 | — | — | **NEVER** | Copyrighted. |

Short quotations from copyrighted translations are not "fair use by default" across all markets. Don't do it.
