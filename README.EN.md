# Youzai World — Official Website

The official website of the **Youzai World** Minecraft multiplayer server, featuring live server status monitoring, a chat board, server trends & events, a download center, and tutorials. The frontend is built with **Nuxt 4** (SSR + prerendering); the backend API & deployment service is built with **Rust (actix-web)**.

- Live site: <https://mcyzw.top>
- Static assets: <https://assets.mcyzw.top> (separate project **YouzaiWorldWebAssets**, hosted on Cloudflare Pages)

> 本项目文档另提供[中文版本](./README.md)。

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero section, Three.js pixel-logo scene, feature carousel, worlds explorer, chat board, server trends & events |
| Server Status | `https://status.mcyzw.top` | Aggregated node, public service, and CraftPing game status |
| Ban List | `/banlist` | Public player punishment records |
| Trends | `/trend` | Server availability & player trends |
| Downloads | `/download` | Curated launcher downloads (PCL2, HMCL, BakaXL, and more) |
| Tutorials | `/tutorial`, `/tutorials/quick_play_guide` | Tutorial hub and the illustrated Quick Play Guide |
| Donate | `/donate` | Support the server |

Other highlights: Cloudflare Turnstile verification, page transitions, scroll-reveal and click effects, responsive layout, and a global error page.

---

## Tech Stack

**Frontend**

- [Nuxt 4](https://nuxt.com) (Vue 3, SSR + Nitro prerendering)
- Three.js (home 3D scene), Swiper (carousels)
- Sass (design tokens + per-page style organization)

**Backend (`backend/`)**

- Rust + actix-web 4
- craftping: Minecraft server status queries (with SRV record resolution)
- zip + subtle: zip-upload static-site deployment endpoint (token verification + path-traversal protection)

---

## Getting Started

### Frontend

```bash
# Install dependencies (pnpm is enforced)
pnpm install

# Start the dev server (http://localhost:3400)
pnpm dev

# Production build / static generation
pnpm build
pnpm generate
```

### Backend

```bash
cd backend
# Edit config.toml first: fill in the [deploy] key, etc.
cargo run
```

The backend listens on port `3003` by default and exposes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Runtime metrics |
| `/api/craftping/get_status` | POST | Query Minecraft server status |
| `/api/deploy` | POST | Upload a zip to deploy the static site (Header: `X-Deploy-Token`) |

---

## Project Structure

```
YouzaiWorldWebNew/
├── nuxt.config.ts        # Nuxt config (port 3400, SSR, prerendering)
├── app/                  # Nuxt 4 app directory
│   ├── components/       # Navbar/footer + home/ + ui/ grouped by domain
│   ├── composables/      # Data fetching & interactions (status, chat, downloads, Turnstile…)
│   ├── pages/            # File-based routed pages
│   ├── assets/scss/      # Design tokens and page styles
│   └── utils/            # Navigation config, download info, site constants
├── backend/              # Rust backend (actix-web)
│   ├── config.toml       # Runtime config (port, deploy key)
│   └── src/              # main / config / craftping / deploy / monitoring
└── public/               # Root-level static files (CNAME, favicon, robots.txt)
```

---

## Related Projects

- **YouzaiWorldCore**: the server's core mod (<https://github.com/Youzai-World-Team/YouzaiWorldCore>)
- **YouzaiWorldWebAssets**: static assets project (images, fonts), served at `assets.mcyzw.top`

## License

See [LICENSE](./LICENSE).
