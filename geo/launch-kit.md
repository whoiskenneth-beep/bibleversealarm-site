# Launch kit: get Bible Verse Alarm listed where AI engines look

How it runs: you log into each site once in Chrome → Claude fills every form and stops before the final button →
you approve a batch in chat ("submit 1, 2, 3") → Claude submits exactly those. Pitches (section C) are emails/DMs
you send yourself. Status is tracked in `geo/targets.csv` (the bot adds new targets weekly).

Always use the name **"Bible Verse Alarm for iPhone"** on first mention (an unrelated Android app is called
"Bible Verse Alarm Clock"). Never state prices or trial lengths (live A/B tests).

---

## A. Directories: Claude fills, you approve submit

| # | Site | What we submit | Cost | Account | Store link to use |
|---|---|---|---|---|---|
| 1 | [AlternativeTo](https://alternativeto.net) | New app listing, then "Add alternative" on: Alarmy, I Can't Wake Up!, YouVersion Bible App, Glorify, Abide | Free | Yes (you create) | `https://apps.apple.com/app/id6789787366?ct=dir_alternativeto` |
| 2 | [Product Hunt](https://www.producthunt.com) | Product launch (pick a Tuesday–Thursday, 00:01 PT) | Free | Yes, maker account | `…?ct=dir_producthunt` |
| 3 | [SaaSHub](https://www.saashub.com) | App listing + alternatives | Free | Yes | `…?ct=dir_saashub` |
| 4 | [Indie Hackers](https://www.indiehackers.com) | Product page | Free | Yes | `…?ct=dir_indiehackers` |
| 5 | [faith.tools](https://faith.tools/posts/selection-criteria) | Christian app directory (curated, 11 criteria) | **Paid** review fee (amount on their form) | Form | `…?ct=dir_faithtools` |

> #5 costs money. My recommendation: skip for now; it's the most on-topic directory, so revisit once the free ones are live.
> Screenshots for galleries: app repo `store/screenshots/framed/v4-*.png` (1320×2868). Wide images: `https://bibleversealarm.com/cards/en/features/christian-alarm-clock-og.png` (1200×630). Icon: `https://bibleversealarm.com/assets/icon.png`.

---

## B. Copy (paste-ready)

### English
- **Name:** Bible Verse Alarm
- **Tagline (≤60):** The iPhone alarm that wakes you with a Bible verse
- **Short (≤160):** An iPhone alarm that keeps ringing until you complete a short Bible verse, so your first minute of the day goes to God's Word, not your phone.
- **Long:**
  Bible Verse Alarm for iPhone is an alarm that won't stop until you finish a short Bible verse. When it rings, you rebuild the verse word by word (or type it), so by the time it's quiet you're awake, and you've already read Scripture.
  - Rings through Silent and Focus (Apple AlarmKit)
  - Choose the verses each alarm uses
  - No account, and the Bible works offline
  - NIV, WEB, KJV and BSB, plus Reina-Valera 1909, 和合本 and 개역한글
  - In English, Spanish, Chinese and Korean
  - Family Sharing supported
- **Tags:** christian, bible, alarm clock, morning routine, devotional, scripture memory, habit, iOS
- **Category:** iOS · Lifestyle / Productivity (Product Hunt topics: iOS, Productivity, Spirituality if available)
- **Website:** https://bibleversealarm.com/christian-alarm-clock
- **Product Hunt maker comment:**
  Hi Product Hunt! I built Bible Verse Alarm because my first minute every morning went to notifications, not to God. The alarm won't turn off until you rebuild a short Bible verse, so you're awake, and you've read Scripture before you've opened anything else. It rings through Silent/Focus, needs no account, and works offline in English, Spanish, Chinese and Korean. I'd love feedback on the first-morning experience: what would make it easier to keep using?

### Español
- **Nombre:** Bible Verse Alarm
- **Lema:** La alarma de iPhone que te despierta con un versículo
- **Corta:** Una alarma para iPhone que sigue sonando hasta que completas un versículo corto de la Biblia, para que tu primer minuto del día sea para la Palabra de Dios y no para el celular.
- **Larga:**
  Bible Verse Alarm para iPhone no se apaga hasta que completas un versículo corto. Cuando suena, armas el versículo palabra por palabra (o lo escribes), y cuando por fin se calla ya estás despierto y ya leíste la Biblia.
  - Suena aunque el iPhone esté en silencio o en modo Concentración
  - Eliges los versículos de cada alarma
  - Sin cuenta, y la Biblia funciona sin internet
  - Reina-Valera 1909, además de NIV, KJV y otras en inglés
  - App en español, inglés, chino y coreano
- **Web:** https://bibleversealarm.com/es

### 繁體中文（台灣、香港）
- **名稱：** Bible Verse Alarm
- **標語：** 用聖經經文叫你起床的 iPhone 鬧鐘
- **簡介：** 一款 iPhone 鬧鐘，必須完成一節短短的經文才會停止，讓你每天的第一分鐘留給神的話，而不是手機。
- **完整介紹：**
  鬧鐘響起時，你要把經文一個詞一個詞拼回去（或自己打字輸入），鬧鐘才會停。等它安靜下來，你已經醒了，也已經讀過經文。
  - iPhone 靜音、專注模式也會響（Apple AlarmKit）
  - 可以選擇每個鬧鐘要用的經文
  - 不用註冊帳號，聖經離線也能用
  - 內建和合本，也有 NIV、KJV 等英文譯本
  - 支援中文、英文、西班牙文、韓文
- **網站：** https://bibleversealarm.com/zh-hant

### 简体中文（马来西亚、新加坡）
- **标语：** 用圣经经文叫你起床的 iPhone 闹钟
- **简介：** 一款 iPhone 闹钟，必须完成一节短短的经文才会停止，让你每天的第一分钟留给神的话，而不是手机。
- **完整介绍：** 闹钟响起时，你要把经文一个词一个词拼回去（或自己打字输入），闹钟才会停。等它安静下来，你已经醒了，也已经读过经文。（功能列表同上，简体）
- **网站：** https://bibleversealarm.com/zh-hans

### 한국어
- **이름:** Bible Verse Alarm
- **한 줄 소개:** 성경 구절로 깨워주는 아이폰 알람
- **짧은 소개:** 짧은 성경 구절을 완성해야 꺼지는 아이폰 알람. 하루의 첫 1분을 휴대폰이 아닌 하나님의 말씀에 드리세요.
- **긴 소개:**
  알람이 울리면 성경 구절을 단어 하나씩 맞추거나 직접 입력해야 꺼져요. 알람이 멈출 때쯤이면 잠은 이미 깼고, 말씀도 이미 읽은 셈이에요.
  - 무음·집중 모드에서도 울려요 (Apple AlarmKit)
  - 알람마다 원하는 구절을 고를 수 있어요
  - 회원가입 없이, 성경은 오프라인에서도 볼 수 있어요
  - 개역한글, 그리고 NIV·KJV 등 영어 성경
  - 한국어·영어·스페인어·중국어 지원
- **웹사이트:** https://bibleversealarm.com/ko

---

## C. Pitches: you send (find the contact on each site; don't guess emails)

| Site | Article | Angle |
|---|---|---|
| [ReachRight](https://reachrightstudios.com/blog/best-christian-apps/) | "16 Best Christian Apps for Growth (2026)" | Fits their **Habits** category |
| [Bible In A Year](https://bibleinyear.com/blog/best-bible-apps) | "Best Bible Apps in 2026" | A habit tool next to the reading apps |
| [Learn of Christ](https://learnofchrist.com/directory/best-bible-apps) | Bible apps directory (32 reviewed) | Ask to be reviewed |
| [The Lead Pastor (ES)](https://theleadpastor.com/es/tools/mejores-aplicaciones-biblicas/) | "Mejores aplicaciones bíblicas" | Spanish + Reina-Valera 1909 |
| [TechEconomy](https://techeconomy.ng/10-must-have-apps-for-every-christian) | "10 Must-Have Apps for Every Christian" | Morning-routine angle |

**Template (EN):**
> Subject: A Bible-verse alarm for your "[article title]"
>
> Hi [name], I enjoyed your [article title]. I make **Bible Verse Alarm for iPhone**: an alarm that keeps ringing until you
> complete a short Bible verse, so your first minute goes to Scripture instead of notifications. It would fit your [section]
> section. Happy to send free access for a review.
> App Store: https://apps.apple.com/app/id6789787366?ct=pitch_[site] · More: https://bibleversealarm.com/christian-alarm-clock
> Thanks, Kenneth

**Plantilla (ES):**
> Asunto: Una alarma con versículos para su lista "[título]"
>
> Hola [nombre]: leí su artículo "[título]". Hago **Bible Verse Alarm para iPhone**, una alarma que sigue sonando hasta que completas
> un versículo corto de la Biblia, con la Reina-Valera 1909 y en español. Creo que encaja en su lista; con gusto le doy acceso gratuito para probarla.
> App Store: https://apps.apple.com/app/id6789787366?ct=pitch_[site] · Más: https://bibleversealarm.com/es
> Saludos, Kenneth

Free access: create **offer codes** in App Store Connect → your app → Subscriptions → Offer Codes (one-time codes, free
for the reviewer). Don't promise them until you've created a few.

Chinese and Korean media tips (news-tip forms, you send): 基督教論壇報 (ct.org.tw), 時代論壇 (christiantimes.org.hk),
국민일보 미션라이프 (kmib.co.kr). The bot drafts tips in each language in `geo/outreach/` on Mondays.
