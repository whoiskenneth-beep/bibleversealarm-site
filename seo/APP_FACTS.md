# App facts (the only claims pages may make about the app)

Writers and QA check every claim about the app against this list. If it isn't here, don't say it.

**True now (App Store version 2.3.0)**
- iPhone app. No Android version yet (don't promise one).
- An alarm that keeps ringing until you complete a short Bible "mission". Default mission: rebuild a verse word by word. Another: type the verse. (A prayer mission exists in the code; confirm it is in the live build before mentioning it.)
- Uses Apple's AlarmKit: rings even when the phone is on Silent or in a Focus mode.
- No account, no login. The Bible text is bundled and works offline.
- English Bibles in the app: NIV, WEB, KJV, BSB.
- Verses tab with scenes you unlock by waking up; Practice tab to rehearse verses.
- Family Sharing is supported.
- Positioning: "Scripture before the scroll", your first minute goes to God's Word, not your feed.

**Not yet true. Don't claim it**
- The app's interface is English only. Spanish (Reina-Valera 1909), Chinese (和合本) and Korean (개역한글) are built for version 2.4.0 but NOT live yet.
  `seo/data/app_store.json` (daily) lists the live languages. When ES/ZH/KO show up there, flip `appLocalized` in `scripts/build.mjs` and update the locale home FAQ.
- Never state prices, free-trial lengths or discounts (they are under live A/B tests).
- No "90% better" style statistics on the web.
- No steps/squats/hunt missions (removed).
