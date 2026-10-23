# SEO changelog

Newest first. One line per shipped change: date, run, locale, what, why.

- 2026-10-23 manual (es, zh-hant, zh-hans, ko): approved About bios live (/es/acerca-de, /zh-hant/about, /zh-hans/about, /ko/about); bylines link to the About page in the page's own language.
- 2026-10-23 manual: Kenneth Foo as named author (byline on every topic/feature page, Person in schema, Organization.founder) + English /about page (approved bio, Matthew 22:37). Also strips stray closing quotes the BSB data leaves on some verses.
- 2026-10-23 manual: reviewed top GitHub SEO skills (marketingskills, claude-seo, geo-seo-claude, seo-skills). Rules copied into seo/PLAYBOOK.md and wired into all agents; check.mjs now gates uniqueness (<30% error, <40% warn), flags thin pages and repeated title shapes. All 19 generated pages score 80–96% unique.
- 2026-10-23 manual: vendored the `ai-seo` skill (marketingskills, MIT) for GEO work; comparison page reordered leader-first (YouVersion, then where we go further) per its citations-vs-recommendations guidance; listicle variants put on hold (ChatGPT listicle citations −50% in Aug 2026); app-faq "official" page made the top GEO priority.
- 2026-10-22 run A (en): new explainer feature page /what-is-a-bible-verse-alarm (GEO trio: app-explainer); QA REJECT then PASS on rewrite. No optimizations (no GSC data yet in history.csv); governor held.
- 2026-10-22 run A (es): /es/que-es-una-alarma-biblica REJECTED twice by QA (bare verse quotes without reflection, imprecise Deuteronomy 6:6-7 gloss, keyword density); change deleted, keyword stays planned.
- 2026-10-23 manual (en): /best-christian-apps-iphone, a fair 11-app comparison (disclosed; facts from each App Store page, checked 2026-10-23). Targets "best christian apps (for iphone)", which has much more search demand than "bible verse alarm app". Feature pages now support tables.
- 2026-10-22 manual: GEO module: robots.txt AI crawler groups, Organization+MobileApplication entity graph (@id, sameAs), llms.txt, visible updated date on feature pages, ct=ai_<engine> store-link tagging for AI referrals, prompt panel (4×40) + weekly Gemini runner, GSC searchAppearance capture, answer-first rules, GEO page trio queued per locale. Also: App Store 2.4.0 is live with es/zh/ko, so locale homes + APP_FACTS updated (no more "app in English").
- 2026-10-22 run B (zh-hant): new feature page /zh-hant/shengjing-naozhong (+ zh-hans generated; keywords 聖經鬧鐘 App, 基督徒鬧鐘); QA REJECT then PASS on rewrite.
- 2026-10-22 run B (ko): feature page /ko/bible-alarm-app REJECTED twice by QA (Korean-Bible claim not backed by APP_FACTS); change deleted, keyword stays planned. No optimizations (no GSC data yet).
- 2026-10-22 manual: verse-card generator (pin + og image for every topic/feature page; og:image now per page) and weekly social pack (Pinterest bulk CSV + Threads posts, Mondays). First pack: seo/social/packs/2026-10-22/.
- 2026-10-22 run A (en): new page /bible-verses-about/encouragement (16 verses, QA PASS); scouted 10 planned keywords. Linked from anxiety/morning/strength.
- 2026-10-22 run A (es): new page /es/versiculos-biblicos/dormir (17 verses); scouted 10 planned keywords. Linked from sibling pages.
- 2026-10-22 run A: no optimization done (no GSC data yet in history.csv); governor held.
- 2026-10-22 setup (ship pipeline verified): site moved to its own repo; generator + checks + 5 locale homes; 3 topic pages (morning, anxiety, strength) in en/es/zh-hant/zh-hans; hreflang, sitemaps, schema, IndexNow, Smart App Banner, ct= store links.
