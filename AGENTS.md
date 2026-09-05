# AGENTS.md — YouzaiWorldWebNew AI 开发助手上下文

> 本文件为 AI 开发助手（Claude Code / Copilot / Cursor / WorkBuddy 等）提供快速理解本项目所需的集中上下文。
> 面向人类的完整说明见 [README.md](./README.md)（中文）与 [README.EN.md](./README.EN.md)（英文）。

---

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| 名称 | **YouzaiWorldWebNew（悠哉世界官网）** |
| 包名 | `youzai-world`（package.json） |
| 类型 | Minecraft 服务器 **官方网站**（前端）+ **Rust 后端 API/部署服务** |
| 目标 | 为「悠哉世界」（mcyzw.top）提供官网门户：服务器状态监控、聊天区、动态、活动、下载中心、教程中心、处罚记录、赞助页等 |
| 域名 | https://mcyzw.top（前端静态站点部署于 Cloudflare Pages，`public/CNAME` 固定域名） |
| 静态资源域名 | https://assets.mcyzw.top（图片/字体等已拆分至独立项目 YouzaiWorldWebAssets，本项目代码中大量直接引用该域名） |
| 许可证 | 见 LICENSE |

**主要功能域**：

- **门户首页**：Hero 区、像素 Logo Three.js 场景、世界/特性轮播、聊天板、动态与活动列表
- **服务器信息**：状态监控（`/status`，由状态 Worker 聚合）、玩家处罚记录（`/banlist`）、可用性/在线率（`/trend`）
- **加入与教程**：下载中心（`/download`，聚合 PCL2 / HMCL / BakaXL 等启动器）、教程中心（`/tutorial`、`/tutorials/quick_play_guide`）
- **其他**：赞助页（`/donate`）、Turnstile 人机校验、点击特效/滚动入场动画、页面过渡

---

## 2. 技术栈

### 前端（根目录，Nuxt 4）

| 依赖 | 版本 | 用途 |
|------|------|------|
| Nuxt | ^4.4.8（SSR 开启，`ssr: true`） | 框架，Nitro 预渲染（`crawlLinks: true`，入口 `/`，忽略 `/tools/ECRFLU`） |
| Vue | ^3.5.39 | 视图层 |
| vue-router | ^5.1.0 | 路由（经 Nuxt） |
| Three.js | ^0.185.1 | 首页像素 Logo 3D 场景（`PixelLogoScene.vue`） |
| Swiper | ^11.2.6 | 轮播组件 |
| Sass | ^1.83.4（dev） | 样式，`app/assets/scss/main.scss` 全局引入，含 `_tokens.scss` 设计变量 |

- 包管理器：**pnpm@10.32.1**（`preinstall` 强制 `only-allow pnpm`）
- 开发服务器端口：**3400**（`devServer.port`）
- `router.options.ts`：自定义滚动行为（锚点偏移 80px，`#hero` 为 0）

### 后端（`backend/`，Rust）

| 依赖 | 用途 |
|------|------|
| actix-web 4.13 + actix-cors + actix-files | HTTP 服务、CORS、静态文件托管 |
| craftping + hickory-resolver | Minecraft 服务器状态查询（SRV 解析 + protocol ping） |
| zip + subtle | `/api/deploy` 接收 zip 包部署静态站点（constant-time token 校验，防路径穿越） |
| config + serde + tokio + chrono | 配置加载、序列化、异步运行时、指标日志 |

- 配置文件：`backend/config.toml`（`[server] port=3003, workers`；`[deploy] key, static_dir, bak_dir`）
- API 端点：`GET /api/health`、`GET /api/metrics`、`POST /api/deploy`（Header `X-Deploy-Token`）、`POST /api/craftping/get_status`
- 运行日志：每 10s 追加统计到 `logs/stats.log`

---

## 3. 项目结构

```
YouzaiWorldWebNew/
├── nuxt.config.ts                # Nuxt 配置（端口 3400、SSR、预渲染、head meta、资产域名）
├── package.json                  # 脚本与依赖（pnpm 强制）
├── tsconfig.json
├── public/                       # 极少量根级站点文件（CNAME、robots、域名验证）；图片统一由 assets.mcyzw.top 托管
├── backend/                      # Rust 后端（actix-web）
│   ├── Cargo.toml / config.toml
│   └── src/                      # main.rs、config.rs、craftping.rs、deploy.rs、monitoring.rs
└── app/                          # Nuxt 4 app 目录（srcDir）
    ├── app.vue / error.vue       # 根组件与全局错误页
    ├── router.options.ts         # 滚动行为定制
    ├── assets/
    │   ├── scss/                 # main.scss + _tokens/_shared/_animations + pages/（按页面拆分）
    │   └── guide/                # 快速游玩指南内嵌 HTML（图片走 assets.mcyzw.top）
    ├── components/
    │   ├── AppNavbar.vue / AppFooter.vue / AppLoader.vue
    │   ├── ClickEffect.vue / ClickTilt.vue
    │   ├── home/                 # HeroSection、PixelLogoScene、FeatureCarousel、WorldsExplorer、ChatBoard
    │   ├── ui/                   # Breadcrumbs、CountUp、NoticeBanner、PageHero、ServerStatusInline
    │   └── download/             # 下载页组件
    ├── composables/              # useActivities、useChat、useClipboard、useDownloads、
    │                             # useScrollReveal、useServerStatus、useTurnstile、useUptime
    ├── layouts/default.vue
    ├── pages/                    # index、banlist、trend、download、tutorial、donate
    │   └── tutorials/quick_play_guide.vue
    ├── types/                    # index.ts、turnstile.d.ts
    └── utils/                    # site.ts（导航/页脚配置）、downloads.ts、home.ts、trends.ts、chat-avatar.ts
```

**关键约定**：

- 导航与页脚链接集中在 `app/utils/site.ts`，新增页面需同步更新
- 外部图片/字体统一走 `https://assets.mcyzw.top`，不要把大体积静态资源放进 `public/`
- SCSS 采用 tokens + shared + 按页面拆分的组织方式，颜色/字体优先引用 `_tokens.scss` 变量
- 页面路由为文件式路由；预渲染由 Nitro `crawlLinks` 自动发现，新增页面默认会被爬取

---

## 4. 开发与验证

| 任务 | 命令 |
|------|------|
| 安装依赖 | `pnpm install`（preinstall 强制 pnpm；postinstall 执行 `nuxt prepare`） |
| 开发服务器 | `pnpm dev`（端口 3400） |
| 生产构建 | `pnpm build`（Nitro） |
| 静态生成 | `pnpm generate` |
| 预览构建产物 | `pnpm preview` |
| 后端运行 | 在 `backend/` 下 `cargo run`（需先填写 `config.toml` 的 deploy key） |

> **⚠️ 重要：AI 助手仅做静态验证即可，无需启动开发服务器。**
> 验证手段限于：阅读源码、TypeScript/模板静态检查、`pnpm generate` 或 `nuxt build` 等一次性构建命令（如确有必要）。不要运行 `pnpm dev` 常驻进程，也不要访问 localhost 端口进行验证。

---

## 5. 编码规范

- `<script setup lang="ts">` 组合式 API；数据获取优先封装在 `composables/`，页面组件保持薄
- 类型定义集中在 `app/types/`，composable 返回值带明确类型
- 样式使用 SCSS，禁止内联硬编码颜色/字体，统一从 `_tokens.scss` 取值
- 用户可见文案为简体中文；代码标识符与技术术语保留英文
- 后端 Rust 使用 `anyhow::Result` 错误处理；对外 JSON 统一 `{ok: bool, ...}` 形态
- `deploy.rs` 涉及文件写入，务必保留路径穿越防护与 constant-time token 比对，不得简化
