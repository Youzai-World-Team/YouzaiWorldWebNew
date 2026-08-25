# YouzaiWorldWebNew — Official Website of Youzai World

> The official portal of the "Youzai World" Minecraft server, providing players with server information, live chat, status monitoring, modpack downloads, tutorials, and donation features in one place.

---

## 📖 Project Overview

| Item | Description |
|------|-------------|
| Name | **YouzaiWorldWebNew (Youzai World Official Website)** |
| Type | Nuxt 4 static site (SSG) + Rust deploy/API backend |
| Role | Official portal of the "Youzai World" Minecraft server |
| Website | https://mcyzw.top |
| Server Address | `play.mcyzw.top:25565` (Minecraft Fabric 26.2) |
| License | Apache-2.0 |

**Core Capabilities**:

- **Information Portal**: about the server, feature overview, playable worlds, team members, strengths, and join instructions
- **Live Interaction**: homepage chat board (guest / player / admin identities, Cloudflare Turnstile verification)
- **Status Monitoring**: online player count, node CPU/memory, latency, protocol version, plus a 24-hour availability history chart
- **Data Display**: server activities (change log), ban records, and donor rankings — all fetched live from external APIs
- **Download Center**: Windows / Android modpacks (subdivided by "with config / without config") and third-party launcher recommendations
- **Tutorial Center**: quick play guide (rich-text tutorial with a table of contents sidebar)

**Target Audience**: server players and visitors (browsing the site, joining the server, downloading modpacks) and server operators (maintaining content and data).

---

## ✨ Feature Modules

### 1. Homepage (`/`)

- **Hero Section**: Three.js pixel-cube 3D logo (built voxel-by-voxel from `public/logo.png`, parallax rotation following the pointer, respects `prefers-reduced-motion`)
- **Chat Board**: live message board, see the "Chat System" section below
- **About the Server**: server history (opened 2025-06, migrated from Bedrock to Java in 2026-01)
- **Gallery / Events / Player Ranking**: reserved content slots (currently showing placeholder text)
- **Server Trends**: previews the latest 3 activities, links to `/trend`
- **Feature Overview**: dual Swiper carousel (fading background + autoplay content), 15 gameplay features (world adventure, attribute bonuses, Create mod, teleport steles, Farmer's Delight, seasons, etc.)
- **Playable Worlds**: switchable browsing of Survival / Creative / Building worlds (with WorldEdit permission application entry)
- **Our Team**: cards for the owner, ops, admin, and developer (avatar, duty, social links)
- **Our Strengths**: non-profit, fast, friendly, up-to-date, redstone-friendly
- **Join the Server**: one-click IP copy, version info, inline online status, QQ group (895689642) entry, and quick play guide entry

### 2. Chat System (ChatBoard)

- **Three Identities**: guest (custom nickname), player (logged in with game account), admin (posted from the backend with a dedicated avatar)
- **Human Verification**: Cloudflare Turnstile (`chat` and `chat-login` actions); the site key is issued by the API server and the script loads on demand
- **Local State**: nickname (180 days) and player session token (7 days, HTTPS-only) stored in cookies; session validity checked offline
- **Pixel Avatars**: deterministic symmetric pixel avatars generated locally from an FNV-1a hash of the nickname (SVG data URI, zero network requests)
- **Rate Hint**: local 5-message-per-60s limit (the server remains the single source of truth)
- Message fields: `id / name / content / avatar / role / location / time`

### 3. Server Status Monitoring (`/status`)

- **Detailed Status**: MCSM node (EQAD-003) system info and CPU/memory usage (progress bars), MC server online players, version, latency, protocol; loading animation (minimum 2 s)
- **Availability History**: 96-point (24-hour) bar chart with hover tooltips, auto-calculated uptime percentage (color-coded)
- Auto-refresh every 5 minutes, manual refresh supported

### 4. Ban List (`/banlist`)

- Data source: `https://api.mcyzw.top/api/bans`
- Stat cards: active penalties, new today, bans, mutes
- Filters: keyword search (player / reason) + type (ban/mute/kick/warning) + status (active/expired) + operator
- Smart unban date parsing: `permanent / 永久 / -` means permanent; past dates are automatically marked expired
- Auto-refresh every 60 seconds

### 5. Server Trends (`/trend`)

- Data source: `https://api.mcyzw.top/api/activities`
- Trend types: success / warning / info / error (with matching icons and colored badges)
- Search + type filter, 5 items per load, statistics (total / latest update)

### 6. Download Center (`/download`)

- **Modpacks** (v1.2.1, hosted on Lanzou Cloud):
  - Windows: complete / no textures / no shaders / essentials only
  - Android: Mobile Glues renderer edition (complete / no textures / no shaders / essentials only) + universal renderer edition (complete / essentials only)
  - Each card offers "with config (includes options.txt) / without config" download links, with advice for new and advanced players
- **Launchers**: Windows (PCL 2, HMCL, BakaXL, official Launcher), Android (FCL, ZL 2)

### 7. Tutorial Center (`/tutorial` and `/tutorials/quick_play_guide`)

- Tutorial hub: tutorial cards (currently featuring the pinned "Quick Play Guide"), search and category filtering
- Quick Play Guide: embedded static HTML tutorial (`app/assets/guide/quick-play-guide.html`) with a 30+-section sidebar (Xbox account registration, client download/install, server gameplay: land claims, guilds, levels, teleportation, trading, economy, duels, invite codes/CDK, daily sign-in, statistics, admin menu, etc.); the TOC only shows sections that actually exist in the HTML

### 8. Donation Page (`/donate`)

- WeChat QR code donation + instructions (players must report their in-game name and payment screenshot to admins)
- Data source: `https://api.mcyzw.top/api/donors`
- Statistics: total donors, total amount, average amount; amount range filter (10-50 / 51-100 / 101-250 / 251-500 / 501+ CNY)
- Auto-refresh every 60 seconds

### 9. Error Page (`error.vue`)

- Unified 403 / 404 handling: error illustration, status code, back-to-home / back buttons, quick navigation (home / ban list / tutorials / status)

---

## 🖥️ External API Integration

The frontend is a pure static site; all data is fetched at runtime (partly proxied through the backend for CORS).

| Endpoint | Purpose | Source |
|----------|---------|--------|
| `POST /api/craftping/get_status` | MC server status query (same-origin proxy, permissive CORS) | Local Rust backend |
| `GET https://api.mcyzw.top/api/activities` | Server activity list | External API service |
| `GET/POST https://api.mcyzw.top/api/chat` | Fetch / post chat messages (`/login` `/session` `/logout` sub-paths) | External API service |
| `GET https://api.mcyzw.top/api/chat/turnstile` | Issue Turnstile site key | External API service |
| `GET https://api.mcyzw.top/api/bans` | Penalty records | External API service |
| `GET https://api.mcyzw.top/api/donors` | Donor list | External API service |
| `GET https://api.eqad.fun/mcsm/api/services/` | MCSM node status | External monitoring service |
| `GET https://api.eqad.fun/monitor` | Node availability history | External monitoring service |
| `https://assets.mcyzw.top/...` | Static assets (images / fonts / icons) CDN | Standalone asset site |

---

## 🔧 Tech Stack & Dependencies

### Frontend (`app/`)

| Dependency | Version | Purpose |
|------------|---------|---------|
| Nuxt | ^4.4.8 | SSR + SSG framework (`ssr: true`, `nitro.prerender`) |
| Vue | ^3.5.39 | View layer |
| vue-router | ^5.1.0 | Routing (custom `scrollBehavior`: smooth-scroll to hash anchors) |
| Three.js | ^0.185.1 | Hero 3D pixel logo (`@types/three`) |
| Swiper | ^11.2.6 | Dual-carousel feature slides |
| Sass | ^1.83.4 | SCSS design system |
| TypeScript | provided by Nuxt | `~` alias, auto-imported composables/utils |

- Package manager: **pnpm** (enforced via `only-allow pnpm`, pnpm@10.32.1)
- Dev port: `3400` (`nuxt.config.ts`)

### Backend (`backend/`, Rust)

| Dependency | Version | Purpose |
|------------|---------|---------|
| actix-web | 4.13.0 | HTTP server framework |
| actix-cors | 0.7.1 | CORS (permissive) |
| actix-files | 0.6.10 | Static file serving (`./static`, `index.html`, custom 404) |
| config | 0.15.22 | TOML config loading (`config.toml` + `APP_`-prefixed env overrides) |
| serde / serde_json | 1.x | Serialization |
| tokio | 1.52.1 | Async runtime |
| chrono | 0.4.44 | Log timestamps |
| craftping | 0.7.0 | Minecraft Server List Ping handshake |
| hickory-resolver | 0.24 | `_minecraft._tcp.` SRV record resolution |
| zip | 2 | Deploy archive extraction (with path traversal protection) |
| subtle | 2 | Constant-time deploy token comparison (timing-attack safe) |
| base64 | 0.22 | favicon base64 encoding |
| num_cpus | 1.13.0 | Default worker count |

---

## 🏗️ Project Structure

```
YouzaiWorldWebNew/
├── package.json / pnpm-lock.yaml        # pnpm project (only-allow pnpm)
├── nuxt.config.ts                       # Nuxt config (SSR, port 3400, prerender, global styles)
├── tsconfig.json                        # references generated .nuxt type configs
├── .gitignore
├── LICENSE                              # Apache-2.0
├── README.md / README.EN.md             # this file (CN / EN)
├── AGENTS.md                            # AI assistant context
│
├── app/                                 # Nuxt frontend (srcDir)
│   ├── app.vue                          # root component (NuxtLayout + NuxtPage + route announcer)
│   ├── error.vue                        # 403/404 error page
│   ├── router.options.ts                # scroll behavior (hash anchors, 80px offset)
│   ├── layouts/default.vue              # default layout (Loader + Navbar + main + Footer + click FX)
│   ├── assets/
│   │   ├── scss/                        # ⭐ design system
│   │   │   ├── _tokens.scss             #   design tokens (#a8e6cf/#6bb39b/#345e54…, breakpoints, @font-face)
│   │   │   ├── _shared.scss             #   shared component styles
│   │   │   ├── _animations.scss         #   animations
│   │   │   ├── main.scss                #   entry (imports all + page transitions)
│   │   │   └── pages/                   #   per-page styles (_home / _guide / _error)
│   │   └── guide/quick-play-guide.html  #   static tutorial content (imported with ?raw)
│   ├── components/
│   │   ├── AppLoader.vue                #   first-screen loading animation
│   │   ├── AppNavbar.vue                #   navbar (scroll color shift, desktop dropdowns, mobile hamburger)
│   │   ├── AppFooter.vue                #   footer (quick links, friend links, uptime, ICP filing)
│   │   ├── ClickEffect.vue / ClickTilt.vue   #   global click effects
│   │   ├── download/PackCard.vue        #   modpack card (with/without config radio)
│   │   ├── home/
│   │   │   ├── HeroSection.vue          #   hero section
│   │   │   ├── PixelLogoScene.vue       #   Three.js pixel 3D logo
│   │   │   ├── ChatBoard.vue            #   chat board (full send/receive + login)
│   │   │   ├── FeatureCarousel.vue      #   feature dual-carousel
│   │   │   └── WorldsExplorer.vue       #   world switcher
│   │   └── ui/
│   │       ├── Breadcrumbs.vue          #   breadcrumbs
│   │       ├── CountUp.vue              #   count-up animation
│   │       ├── NoticeBanner.vue         #   notice banner
│   │       ├── PageHero.vue             #   inner-page hero (title + subtitle)
│   │       └── ServerStatusInline.vue   #   inline server status
│   ├── composables/
│   │   ├── useServerStatus.ts           #   MC status / MCSM nodes / availability APIs
│   │   ├── useChat.ts                   #   chat read/write / player login sessions
│   │   ├── useTurnstile.ts              #   Cloudflare Turnstile wrapper (on-demand loading)
│   │   ├── useActivities.ts             #   server activities fetch
│   │   ├── useUptime.ts                 #   site uptime counter
│   │   ├── useClipboard.ts              #   copy helper (clipboard API + fallback)
│   │   └── useScrollReveal.ts           #   ⭐ scroll-reveal + count-up + staggered cards
│   ├── pages/
│   │   ├── index.vue                    #   homepage (aggregates all home components/sections)
│   │   ├── status.vue                   #   status monitoring (detailed / history tabs)
│   │   ├── banlist.vue                  #   penalty records
│   │   ├── trend.vue                    #   server trends
│   │   ├── download.vue                 #   download center
│   │   ├── tutorial.vue                 #   tutorial hub
│   │   ├── tutorials/quick_play_guide.vue  #   quick play guide (HTML import + TOC)
│   │   └── donate.vue                   #   donation page
│   ├── utils/
│   │   ├── site.ts                      #   nav / footer links / friend links / site start time
│   │   ├── home.ts                      #   worlds / features / team / strengths data
│   │   ├── downloads.ts                 #   modpack / launcher card data (Lanzou URLs)
│   │   ├── trends.ts                    #   trend type → label / class / icon
│   │   └── chat-avatar.ts               #   nickname hash → pixel avatar (SVG data URI)
│   └── types/
│       ├── index.ts                     #   ⭐ all domain types (Trend/WorldInfo/TeamMember/DownloadCard/ChatMessage/PenaltyRecord/Donator…)
│       └── turnstile.d.ts               #   window.turnstile type declarations
│
├── backend/                             # Rust deploy/API backend
│   ├── Cargo.toml                       # dependency manifest (actix-web, etc.)
│   ├── config.toml                      # runtime config (port 3003, workers, deploy key)
│   └── src/
│       ├── main.rs                      # ⭐ entry: middleware chain (logger/compress/metrics), /api routes, static files, stats dump
│       ├── config.rs                    #   AppConfig loading (config.toml + APP_ env vars)
│       ├── monitoring.rs                #   Metrics (requests/connections/errors/avg duration) + /api/health /api/metrics
│       ├── craftping.rs                 #   POST /api/craftping/get_status (SRV resolve + handshake, 5s timeout)
│       └── deploy.rs                    #   POST /api/deploy (token check → backup → zip extract, traversal-safe)
│
├── public/                              # static root (served directly)
│   ├── CNAME                           #   mcyzw.top
│   ├── robots.txt                       #   allow all
│   ├── favicon.ico
│   └── logo.png                         #   pixel source image for the hero 3D logo
│
└── .github/workflows/release.yml        # CI: on Release → build → package → deploy
```

---

## ⚙️ Common Commands

> pnpm is enforced (`preinstall` hook `only-allow pnpm`); do not use npm/yarn to install dependencies.

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies (`postinstall` runs `nuxt prepare`) |
| `pnpm dev` | Start the dev server (http://localhost:3400) |
| `pnpm build` | Production build |
| `pnpm generate` | Pre-render the static site (outputs to `.output/public/`) |
| `pnpm preview` | Preview the generated output |

Backend (`backend/`):

| Command | Description |
|---------|-------------|
| `cargo run` | Start the backend (reads `config.toml`, default port 3003) |
| `cargo build --release` | Compile a release binary |

---

## 🚀 Deployment Flow

```
GitHub Release (published)
   └─ .github/workflows/release.yml
        ├─ pnpm install --frozen-lockfile
        ├─ pnpm generate                  # produces .output/public/
        ├─ zip packaging
        └─ curl -H "X-Deploy-Token: $DEPLOY_TOKEN" \
             --data-binary @deploy.zip "$DEPLOY_URL/api/deploy"
             └─ Rust backend /api/deploy
                  ├─ verify X-Deploy-Token (constant-time comparison)
                  ├─ clear bak/ → back up current static/ to bak/
                  ├─ extract zip into static/ (enclosed_name + prefix double traversal guard)
                  └─ respond {"ok":true}
```

- The frontend static build is zipped by CI and pushed to the Rust backend via `POST /api/deploy`, then extracted into `static/` and served publicly (behind Cloudflare at `mcyzw.top`).
- Deploy token: GitHub Secrets `DEPLOY_TOKEN` and `DEPLOY_URL`; the backend `[deploy] key` in `config.toml` must match.
- Previous versions are kept under `bak/` for manual rollback.
- Static assets (images/fonts/icons) are hosted on the standalone asset site `assets.mcyzw.top` (see all `assets.mcyzw.top` references under `utils/`).

---

## 🌐 Related Links

- Website: https://mcyzw.top
- Server address: `play.mcyzw.top:25565`
- Asset site: https://assets.mcyzw.top
- Friend links: https://eqad.fun ｜ https://dev.mscpo.org
- Team org: https://github.com/Youzai-World-Team
- Core mod repository: https://github.com/Youzai-World-Team/YouzaiWorldCore
- Nuxt docs: https://nuxt.com/docs
- Actix Web docs: https://actix.rs/docs

---

## 🤝 Contributors

Maintained by **Youzai World Team**. Team members (see the "Our Team" section on the homepage):

- **zxaBinbin** — Server Owner · Lead Maintainer
- **ress2338396** — Operations
- **GrantedCar81239** — Administration
- **Maskviva** — Development (mod / gameplay development & maintenance)

> We are recruiting developers, maintainers, and admins — contact the server owner for details.
