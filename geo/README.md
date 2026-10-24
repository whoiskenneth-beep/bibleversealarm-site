# GEO: AI answer engines

Goal: Bible Verse Alarm gets named and cited when people ask AI assistants for app recommendations ("best Bible verse alarm app") in en/es/zh/ko.

| File | What |
|---|---|
| `questions.csv` | The 50 high-intent buyer questions per locale (en done): stage, target page, status, competitors AI names, gap, fix. One question → one page. |
| `ROADMAP.md` | 30-day plan, owners, success metrics, what we stopped. |
| `prompts/<locale>.csv` | 40–60 native prompts per locale (`type` = app or topic). The bot adds Bing grounding queries over time. |
| `results.csv` | Automated runs on Gemini's free tier (`scripts/geo_panel.mjs`, `.github/workflows/geo.yml`): the 20 app prompts of one locale per day (Mon en, Tue es, Wed zh, Thu ko), 1 run each. The free tier has **no Search grounding and ~20 requests/day**, so this measures what the model itself knows about us (training data), not live citations. `snippet` holds the text around each mention for auditing. |
| `sov.json` | Share of voice = % of runs where we're mentioned or cited, per week × engine × locale × type. A trend, not a rank. |
| `manual.csv` | Kenneth's weekly hand checks of engines with no free API (ChatGPT, Perplexity, Copilot, Google AI Mode, Naver). |
| `bing/` | Weekly CSV exports from Bing Webmaster Tools → AI Performance, if available. |
| `launch-kit.md` / `targets.csv` | Listing sites + roundup articles, paste-ready copy in 4 languages, and per-target status. Claude fills forms in Kenneth's Chrome; Kenneth approves each submit. |
| `outreach/` | Reply/pitch drafts for Kenneth. The bot never posts or sends. |

Store clicks from AI engines are re-tagged on the page (`ct=ai_<engine>_<page>`), so installs per AI engine show in
App Store Connect → Analytics → Acquisition → Campaigns. Mainland-China engines (DeepSeek, Doubao, Kimi, Baidu) are out of scope (not targeted).

Name collision: an unrelated Android app is called "Bible Verse Alarm Clock". The detector ignores it; content should keep saying "Bible Verse Alarm for iPhone" to stay distinct.
