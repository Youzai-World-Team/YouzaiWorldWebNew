# AGENTS.md — YouzaiWorldWebNew AI 开发助手上下文

> 本文件为 AI 开发助手（Claude Code / Copilot / Cursor 等）提供快速理解本项目所需的集中上下文。
> 面向人类的完整功能说明见 [README.md](./README.md)（中文）与 [README.EN.md](./README.EN.md)（英文）。

---

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| 名称 | **YouzaiWorldWebNew（悠哉世界官网）** |
| 类型 | Nuxt 4 静态站（SSG）+ Rust（Actix-web）部署/API 后端 |
| 定位 | 「悠哉世界」Minecraft 服务器官方门户，面向玩家与访客 |
| 网站 | https://mcyzw.top（Cloudflare 代理，`public/CNAME`） |
| 服务器地址 | `play.mcyzw.top:25565`（Minecraft Fabric 26.2，配套模组见 YouzaiWorldCore 仓库） |
| 许可证 | Apache-2.0 |

**核心事实**：

- **前端是纯静态站**：数据全部来自外部 API（`api.mcyzw.top` / `api.eqad.fun`），运行时不写库、不持状态；本地持久化仅 cookie（聊天昵称与玩家会话令牌）。
- **后端仅做三件事**：托管静态文件（`./static`）、提供 MC 服务器状态查询代理（`/api/craftping/get_status`）、接收 CI 推送的部署包（`/api/deploy`）。
- **静态资源独立托管**：图片 / 字体 / 图标统一引用 `https://assets.mcyzw.top/...`（独立 Cloudflare Pages 项目），不在本仓库存放业务图片。
- **包管理器为 pnpm**（`preinstall` 钩子 `only-allow pnpm` 强制），项目锁定了 pnpm@10.32.1。

---

## 2. 技术栈

| 依赖 | 版本 | 来源 / 用途 |
|------|------|------------|
| Nuxt | ^4.4.8 | `package.json`；SSR + SSG，`srcDir` 为 `app/` |
| Vue | ^3.5.39 | 视图层 |
| vue-router | ^5.1.0 | 路由（`app/router.options.ts` 自定义滚动） |
| Three.js | ^0.185.1 | `components/home/PixelLogoScene.vue` 3D 像素 Logo（`@types/three`） |
| Swiper | ^11.2.6 | `components/home/FeatureCarousel.vue` 双联轮播 |
| Sass | ^1.83.4 | `app/assets/scss/` 设计体系 |
| Rust (edition 2024) | — | `backend/`：actix-web 4.13、craftping 0.7、hickory-resolver 0.24、zip、subtle 等 |
| Node | 22（CI） | `.github/workflows/release.yml` |

**运行端口**：前端 dev 3400（`nuxt.config.ts`）；后端 3003（`backend/config.toml`）。

**CI 流程**（`.github/workflows/release.yml`）：GitHub Release 发布 → `pnpm generate` → zip 打包 → `curl` 推送到 `${DEPLOY_URL}/api/deploy`（需 Secrets：`DEPLOY_TOKEN`、`DEPLOY_URL`）。

---

## 3. 项目结构

```
YouzaiWorldWebNew/
├── package.json / pnpm-lock.yaml        # pnpm（only-allow pnpm 强制）
├── nuxt.config.ts                       # SSR、dev 端口 3400、prerender（crawlLinks + '/'，忽略 /tools/ECRFLU）、全局 scss
├── tsconfig.json                        # 引用 .nuxt 生成的 4 份类型配置（勿手工修改）
├── README.md / README.EN.md             # 面向用户的完整功能文档
├── AGENTS.md                            # 本文件
│
├── app/                                 # Nuxt 前端（srcDir）
│   ├── app.vue · error.vue · router.options.ts
│   ├── layouts/default.vue              # Loader + Navbar + main + Footer + 点击特效
│   ├── assets/
│   │   ├── scss/
│   │   │   ├── _tokens.scss             # ⭐ 设计令牌（色板/断点/@font-face），改主题色先改这里
│   │   │   ├── _shared.scss · _animations.scss · main.scss
│   │   │   └── pages/（_home/_guide/_error）
│   │   └── guide/quick-play-guide.html  # 快速游玩指南静态内容（?raw 导入，目录自动过滤不存在的章节）
│   ├── components/
│   │   ├── AppLoader / AppNavbar / AppFooter / ClickEffect / ClickTilt
│   │   ├── download/PackCard.vue        # 资源包卡片（带配置/无配置单选，链接在 utils/downloads.ts）
│   │   ├── home/（HeroSection / PixelLogoScene / ChatBoard / FeatureCarousel / WorldsExplorer）
│   │   └── ui/（Breadcrumbs / CountUp / NoticeBanner / PageHero / ServerStatusInline）
│   ├── composables/                     # ⭐ 全部数据获取与交互逻辑
│   │   ├── useServerStatus.ts           #   MC 状态（/api/craftping 同源代理）+ MCSM 节点 + 可用性
│   │   ├── useChat.ts                   #   聊天读写 / 玩家登录会话（Authorization: Bearer）
│   │   ├── useTurnstile.ts              #   Cloudflare Turnstile（站点密钥由 API 下发，按需加载）
│   │   ├── useActivities.ts / useUptime.ts / useClipboard.ts
│   │   └── useScrollReveal.ts           #   滚动进入动画 / 数字滚动 / 状态卡逐卡出现
│   ├── pages/                           # 首页 + status + banlist + trend + download + tutorial + donate
│   │   └── tutorials/quick_play_guide.vue
│   ├── utils/                           # 静态数据与工具（site/home/downloads/trends/chat-avatar）
│   └── types/                           # ⭐ 全部领域类型（index.ts）+ turnstile.d.ts
│
├── backend/                             # Rust 部署/API 后端
│   ├── Cargo.toml · config.toml（端口/workers/deploy key）
│   └── src/
│       ├── main.rs                      # 中间件链（日志/压缩/指标统计）、/api 路由、静态文件、404
│       ├── config.rs                    # config.toml + APP_ 环境变量覆盖
│       ├── monitoring.rs                # Metrics + /api/health + /api/metrics
│       ├── craftping.rs                 # SRV 解析 + MC 协议握手（5s 超时）
│       └── deploy.rs                    # 令牌校验 → 备份 → zip 解压（路径穿越防护）
│
├── public/                              # CNAME（mcyzw.top）/ robots.txt / favicon.ico / logo.png
└── .github/workflows/release.yml        # Release 触发部署
```

---

## 4. 开发规范

### 4.1 协作边界（强制）

- **不要自己构建和运行 dev 服务器，仅做静态验证**。AI 助手不执行 `pnpm dev` / `pnpm build` / `pnpm generate` / `cargo run`；修改后通过阅读代码、类型检查与静态分析验证正确性，由开发者本人执行构建与运行。
- 后端 Cargo 编译同理：不代跑 `cargo build`。

### 4.2 前端开发约定

- **数据统一走 composables**：新增外部接口时在 `app/composables/` 下建对应的 `useXxx.ts`，统一负责 `fetch`、错误处理与类型映射；页面/组件不直接散写 `fetch` 调用。已有各 API 的完整地址见「外部 API 一览」。
- **领域类型集中在 `app/types/index.ts`**：所有接口返回结构与跨文件共享的数据形状（`Trend` / `ChatMessage` / `PenaltyRecord` / `Donator` / `DownloadCard` 等）在此定义并复用，禁止在页面里临时定义重复结构。
- **静态数据集中在 `app/utils/`**：导航、团队、世界、资源包卡片、动态类型映射等展示数据放 `site.ts` / `home.ts` / `downloads.ts` / `trends.ts`；有硬编码业务数据时要替换为 API 时也遵循此规则。
- **样式走设计令牌**：颜色一律用 `var(--primary-color)` 等 CSS 变量（定义于 `_tokens.scss`），不要硬编码色值；需要新增全局动效时按 `_animations.scss` 的既有风格补充。
- **外部资源一律走 `assets.mcyzw.top`**：新增图片/图标/字体引用统一使用 `https://assets.mcyzw.top/...` 前缀，不把二进制资源放进本仓库。
- **`?raw` 导入的静态 HTML**（快速游玩指南）：只改 `app/assets/guide/quick-play-guide.html` 内容；`quick_play_guide.vue` 中的 `allToc` 目录清单会自动过滤 HTML 中不存在的章节（`guideContent.includes('id="..."')`），新增章节时需同步补目录条目。

### 4.3 日志与调试（前端）

- 现有数据拉取逻辑统一使用 `[youzai-web/<模块>]` 前缀的 `console.log/error/warn`（如 `[youzai-web/activities]`、`[youzai-web/chat]`、`[youzai-web/bans]`、`[youzai-web/donors]`、`[youzai-web/turnstile]`）。新增数据模块沿用该风格。
- 错误处理约定：用户可见的错误文案直接抛 `Error`（服务端 `statusMessage` 优先），组件层展示；后台静默失败（如会话校验、登出）以 `try/catch + console.error` 兜底，不阻塞 UI。

### 4.4 后端开发约定（Rust）

- **配置一律走 `AppConfig`**（`config.rs`，读取 `config.toml`，支持 `APP_` 前缀环境变量覆盖）；新增配置项同步更新 `config.rs` 结构体与 `config.toml`。
- **`/api` 路由在 `main.rs` 注册**；业务模块拆分为独立文件（如 `craftping.rs`、`deploy.rs`），模块内通过 `web::Data` 取 `AppConfig` / `Metrics`。
- **部署安全不可降级**：`/api/deploy` 必须校验 `X-Deploy-Token`（`subtle` 常量时间比较）；解压必须用 `file.enclosed_name()` + `out_path.starts_with(static_dir)` 双重路径穿越防护；部署前先备份 `static/` 到 `bak/`（先清空重建）。
- **超时与错误处理**：外部网络操作（MC 握手、SRV 解析）必须套 `tokio::time::timeout`（现状 5s），失败返回语义化状态码（400/502/504）与中文错误文案。
- 日志写入 `logs/`：`requests.log`（每请求一行，含耗时）、`stats.log`（每 10 秒一行统计）；不要改动该格式，依赖方按行解析。

### 4.5 命名约定

| 对象 | 约定 | 示例 |
|------|------|------|
| 前端页面 | `kebab-case.vue` | `quick_play_guide.vue`（注意教程子页用下划线） |
| 组件 | PascalCase，按域分子目录 | `home/ChatBoard.vue`、`ui/PageHero.vue` |
| composable | `use<名>.ts`，默认导出具名函数 | `useTurnstile(action)`、`useClipboard()` |
| 工具函数 | `utils/<域>.ts` 导出常量/函数 | `chatAvatar(name)` |
| 类型 | `types/index.ts` 导出 interface | `ChatMessage`、`PenaltyRecord` |
| API 常量 | 模块内 `const XXX_API = '...'` 大写下划线 | `ACTIVITIES_API`、`DONORS_API` |
| 日志前缀 | `[youzai-web/<模块>]` | `[youzai-web/chat]` |
| Rust 模块 | `snake_case.rs`，服务用 `#[post("/path")]` 宏 | `craftping.rs`、`deploy.rs` |

### 4.6 提交与分支

- **主分支 `main`**，直接在 `main` 上开发并推送；PR 亦合入 `main`。
- **提交信息为中文**，惯用形式（无强制 Conventional Commits）：
  - `功能：首页聊天区接入 Turnstile 人机验证`
  - `为状态监控页添加 24 小时可用性图表`
  - `修复 /api/deploy 解压路径穿越问题` / `fix`（小修）
- 一次提交聚焦一个功能点，正文说明"改了什么 + 为什么"。

---

## 5. 常用命令

> 项目约定由开发者本人执行构建与运行，AI 助手默认不代为执行（见 §4.1）。

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖（postinstall 自动 `nuxt prepare`） |
| `pnpm dev` | 开发服务器（http://localhost:3400） |
| `pnpm generate` | 静态站预渲染（输出 `.output/public/`） |
| `pnpm build` / `pnpm preview` | 生产构建 / 预览 |
| `cd backend && cargo run` | 启动 Rust 后端（config.toml，端口 3003） |
| `cd backend && cargo build --release` | 编译发布版 |

**环境要求**：Node 22+（CI 用 22）、pnpm 10、Rust 2024 edition toolchain（后端）。

---

## 6. 架构说明

### 6.1 前后端边界（最关键的设计决策）

```
浏览器（mcyzw.top）
 ├─ Nuxt 静态站（app/）── 纯展示，无状态
 │    ├─ 同源代理：POST /api/craftping/get_status → Rust 后端（绕过 CORS 查 MC 状态）
 │    └─ 直连外部：api.mcyzw.top（activities/chat/bans/donors/turnstile）
 │                 api.eqad.fun（MCSM 节点 / monitor 历史可用性）
 │                 静态资源 → assets.mcyzw.top（独立资源站）
 │
 └─ Rust 后端（backend/，端口 3003）
      ├─ GET /api/health · GET /api/metrics      # 监控
      ├─ POST /api/craftping/get_status          # MC 状态代理（SRV 解析 + 协议握手）
      ├─ POST /api/deploy                        # CI 部署（令牌 + 备份 + 解压）
      └─ Files "/" → ./static（index.html，自定义 404）
```

- 前端为 **SSR + prerender 静态站**：`ssr: true`，`nitro.prerender.crawlLinks` 预渲染全站路由；动态数据（聊天、状态、处罚、捐赠）在客户端运行时 `fetch`，SSR 阶段不依赖外部 API 可用性。
- **后端不存储业务数据**：静态文件即网站内容，`bak/` 仅存部署备份；聊天/处罚/捐赠等数据归属外部 API 服务（不在本仓库）。
- **CORS**：后端 `/api` 全放开（`allow_any_origin`），前端依赖同源代理仅用于 `/api/craftping`。

### 6.2 数据流

```
页面挂载
  └─ composables/useXxx.ts
       ├─ fetch(外部 API)  → 类型映射（types/index.ts）→ ref 状态
       ├─ 失败 → console.error('[youzai-web/<模块>] …') + 页面错误态
       └─ 定时器刷新：status 5min · bans/donors 60s · chat 60s
```

### 6.3 部署流（CI → 后端）

```
GitHub Release → actions → pnpm generate → zip .output/public
  → curl -H "X-Deploy-Token: <secret>" --data-binary @deploy.zip <DEPLOY_URL>/api/deploy
  → Rust: 常量时间校验令牌 → 清空重建 bak/ → 备份 static/ → 解压（防穿越）→ {"ok":true}
```

- 回滚：手动将 `bak/` 内容复制回 `static/`。
- 域名与 CDN：`mcyzw.top` 由 Cloudflare 代理（`public/CNAME` + `robots.txt` 全放行）；后端服务本身可置于内网/独立端口。

### 6.4 关键设计决策

1. **静态站 + 外部 API 分离**：官网不持有业务数据，数据接口全部外置（`api.mcyzw.top`），聊天区读写、登录会话、人机验证均在 API 服务端完成，官网只做展示与提交——这让前端可以整站预渲染并随意搬迁。
2. **Turnstile 密钥不下发到前端源码**：站点密钥由 `GET /api/chat/turnstile` 动态获取，脚本在用户真正要发言时才加载（按需加载，避免首页访客都付一次外部请求）。
3. **聊天身份三轨制**：访客仅昵称；玩家用游戏账户登录（`Bearer` 令牌，7 天 cookie，仅 HTTPS）；管理员由后台代发。前端不做权威判定，`role` 由服务端按凭据给出。
4. **头像零请求**：访客像素头像由昵称 FNV-1a 哈希在浏览器本地生成（`chat-avatar.ts`），确定性且无网络请求；管理员头像才用 API 返回的相对路径拼域名。
5. **后端部署安全**：令牌校验用常量时间比较；zip 解压双重路径穿越防护；部署前自动备份到 `bak/`，支持手工回滚。
6. **`public/` 与 `assets.mcyzw.top` 分工**：本仓库 `public/` 只放站点级文件（CNAME、robots、favicon、logo 源图），业务图片/字体/图标全部走独立资源站，前端引用一律 `https://assets.mcyzw.top/...`。

---

## 7. 常见问题

### 环境与构建
- 依赖安装必须用 **pnpm**：`npm install` / `yarn` 会被 `only-allow pnpm` 直接拒绝（`ERR_PNPM_ONLY_ALLOW_PNPM`）。
- `tsconfig.json` 引用的 `.nuxt/tsconfig.*.json` 由 `nuxt prepare` 生成；如果类型检查报"找不到配置"先执行 `pnpm install`（触发 postinstall）。
- 后端编译需要 Rust 2024 edition 工具链；`config.toml` 缺字段或环境变量 `APP_*` 冲突时以 `try_deserialize` 报错为准。

### 前端调试
- **聊天区"验证通过却发不出去"**：Turnstile 令牌约 5 分钟过期，`useTurnstile` 已实现过期自动 reset 换新令牌；若仍异常检查 API 服务端是否配置了对应 action（`chat` / `chat-login`）的站点密钥。
- **图片不显示**：确认引用走 `https://assets.mcyzw.top/...`（资源站未包含时需先发布到资源站仓库，而非本仓库）。
- **数据页显示加载失败**：`banlist` / `donate` / `trend` 依赖外部 API，先确认 `api.mcyzw.top` 对应接口可达；`status` 页同时依赖 `api.eqad.fun` 与本后端 `/api/craftping`。
- **修改静态教程 HTML 后目录没变**：目录由 `allToc` 与 HTML `id=` 匹配过滤生成，确认新章节在 `quick_play_guide.vue` 的 `allToc` 里有对应 `{id, label}` 条目。

### 后端与部署
- **`/api/deploy` 返回 401**：`config.toml` 的 `[deploy] key` 与 CI Secrets `DEPLOY_TOKEN` 不一致。
- **部署后站点 404 / 空白**：确认 zip 内容以 `index.html` 开头（CI 是在 `.output/public` 内打包，不要把外层目录打进去）；`actix-files` 只服务 `./static` 下的文件。
- **后端端口占用**：`config.toml` 的 `[server] port`（默认 3003）；前端代理 `/api/craftping` 需保证浏览器可达该端口（生产环境通常由反向代理统一对外）。
- **日志不落盘**：后端工作目录需可写 `logs/`（`requests.log` / `stats.log`）；`create_dir_all("logs")` 失败会直接报错退出。

### 版本控制
- `.nuxt`、`.output`、`dist`、`node_modules`、`logs`、`backend/target`、`backend/Cargo.lock` 均已 gitignore，勿提交。
- `public/CNAME` 是 Cloudflare Pages 自定义域绑定文件，**不要删除或改名**。

---

## 8. 参考资料

### 项目内文档
| 文件 | 内容 |
|------|------|
| [README.md](./README.md) | 面向用户的完整功能文档（中文，含全部页面/API/结构/部署说明） |
| [README.EN.md](./README.EN.md) | 上述内容的英文版 |
| `app/types/index.ts` | 全部领域类型定义（接口返回结构的事实来源） |
| `app/composables/` | 各数据源获取逻辑与 API 地址（事实来源） |
| `backend/src/main.rs` | 后端路由与中间件总览 |
| `nuxt.config.ts` | SSR / prerender / 端口配置 |

### 外部文档
- Nuxt 文档：https://nuxt.com/docs
- Vue 文档：https://vuejs.org/
- Three.js：https://threejs.org/docs/
- Swiper：https://swiperjs.com/vue
- Cloudflare Turnstile：https://developers.cloudflare.com/turnstile/
- Actix Web：https://actix.rs/docs
- craftping crate：https://crates.io/crates/craftping
- 核心模组仓库：https://github.com/Youzai-World-Team/YouzaiWorldCore
