# GEO: AI answer engines

Goal: Bible Verse Alarm gets named and cited when people ask AI assistants for app recommendations ("best Bible verse alarm app") in en/es/zh/ko.

| File | What |
|---|---|
| `prompts/<locale>.csv` | 40–60 native prompts per locale (`type` = app or topic). The bot adds Bing grounding queries over time. |
| `results.csv` | Automated weekly runs: Gemini + Google Search grounding (free tier), 3 runs per prompt. `scripts/geo_panel.mjs`, `.github/workflows/geo.yml` (Mon en+es, Tue zh+ko). |
| `sov.json` | Share of voice = % of runs where we're mentioned or cited, per week × engine × locale × type. A trend, not a rank. |
| `manual.csv` | Kenneth's weekly hand checks of engines with no free API (ChatGPT, Perplexity, Copilot, Google AI Mode, Naver). |
| `bing/` | Weekly CSV exports from Bing Webmaster Tools → AI Performance, if available. |
| `outreach/` | Reply/pitch drafts for Kenneth. The bot never posts or sends. |

Store clicks from AI engines are re-tagged on the page (`ct=ai_<engine>_<page>`), so installs per AI engine show in
App Store Connect → Analytics → Acquisition → Campaigns. Mainland-China engines (DeepSeek, Doubao, Kimi, Baidu) are out of scope (not targeted).
