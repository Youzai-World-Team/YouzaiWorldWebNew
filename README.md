# YouzaiWorldWebNew — 悠哉世界官网

> 「悠哉世界」（Youzai World）Minecraft 服务器官方门户网站，为玩家提供服务器信息、聊天互动、状态监控、整合包下载、教程与捐赠等一站式服务。

---

## 📖 项目概述

| 项目 | 说明 |
|------|------|
| 名称 | **YouzaiWorldWebNew（悠哉世界官网）** |
| 类型 | Nuxt 4 静态站（SSG）+ Rust 部署/API 后端 |
| 定位 | 「悠哉世界」Minecraft 服务器的官方门户，面向玩家与访客 |
| 网站 | https://mcyzw.top |
| 服务器地址 | `play.mcyzw.top:25565`（Minecraft Fabric 26.2） |
| 许可证 | Apache-2.0 |

**核心能力**：

- **信息门户**：关于服务器、玩法特性一览、可游玩世界、团队介绍、服务器优势、加入指引
- **实时互动**：首页聊天区（访客 / 玩家 / 管理员三种身份，Cloudflare Turnstile 人机验证）
- **状态监控**：服务器在线人数、节点 CPU/内存、延迟、协议版本，以及 24 小时历史可用性曲线
- **数据展示**：服务器动态（活动日志）、玩家处罚记录、捐赠者榜单，全部由外部 API 实时拉取
- **下载中心**：Windows / Android 双平台整合包（按"带配置 / 无配置"细分）与第三方启动器推荐
- **教程中心**：快速游玩指南（内置目录导航的图文教程）

**目标用户**：服务器玩家与访客（浏览官网、加入服务器、下载整合包）、服务器运维/管理（维护内容与数据）。

---

## ✨ 功能模块

### 1. 主页（`/`）

- **Hero 区**：Three.js 像素方块 3D Logo（读取 `public/logo.png` 逐像素建模，跟随鼠标视差旋转，支持 `prefers-reduced-motion`）
- **聊天区（ChatBoard）**：实时留言板，详见下方「聊天系统」
- **关于服务器**：服务器发展历程（2025-06 开服 → 2026-01 由 Bedrock 迁移至 Java 版）
- **服务器展示 / 近期活动 / 上月玩家之最**：预留内容位（当前显示占位提示）
- **服务器动态**：预览最新 3 条动态，跳转 `/trend` 查看全部
- **玩法特性一览**：Swiper 双联轮播（背景淡入 + 内容自动播放），15 项玩法特性（世界冒险、属性加成、机械动力、传送石碑、农夫乐事、四季变换等）
- **可游玩世界**：生存 / 创造 / 建筑世界切换浏览（含 WorldEdit 权限申请入口）
- **我们的团队**：服主、运维、管理、开发成员卡片（头像、职责、社交链接）
- **我们的优势**：公益、快速、友善、更新、生电五项优势
- **加入服务器**：IP 一键复制、版本信息、在线状态内联显示、QQ 群（895689642）入口、快速游玩指南入口

### 2. 聊天系统（ChatBoard）

- **三种身份**：访客（自定义昵称）、玩家（游戏账户登录）、管理员（后台代发，带专属头像）
- **人机验证**：Cloudflare Turnstile（`chat` / `chat-login` 两个 action），站点密钥由 API 服务端下发，脚本按需加载
- **本地状态**：昵称（180 天）与玩家会话令牌（7 天，仅 HTTPS）写入 cookie；离线校验会话有效性
- **像素头像**：按昵称 FNV-1a 哈希在本地确定性生成对称像素头像（SVG data URI，零网络请求）
- **限速提示**：本地 60 秒内最多 5 条（服务端为唯一权威）
- 消息字段：`id / name / content / avatar / role / location / time`

### 3. 服务器状态监控（`/status`）

- **详细状态**：MCSM 节点（EQAD-003）系统信息与 CPU/内存使用率（进度条），MC 服务器在线人数、版本、延迟、协议号；加载动画（最少 2 秒）
- **历史状态**：96 点（24 小时）可用性条状图，hover 显示时间与状态，自动计算可用率百分比（颜色分级）
- 每 5 分钟自动刷新，支持手动刷新

### 4. 玩家处罚记录（`/banlist`）

- 数据源：`https://api.mcyzw.top/api/bans`
- 统计卡：当前有效处罚、今日新增、封禁数、禁言数
- 筛选：关键词搜索（玩家 / 原因）+ 类型（封禁/禁言/踢出/警告）+ 状态（生效/已过期）+ 操作员
- 解封时间智能解析：`永久 / permanent / -` 视为永久生效；超过当前时间自动判定为已过期
- 每 60 秒自动刷新

### 5. 服务器动态（`/trend`）

- 数据源：`https://api.mcyzw.top/api/activities`
- 动态类型：成功 / 警告 / 信息 / 错误（对应图标与颜色徽章）
- 搜索 + 类型筛选、每次加载 5 条、统计（总动态数 / 最近更新时间）

### 6. 下载中心（`/download`）

- **资源包**（v1.2.1，托管于蓝奏云）：
  - Windows：完整版 / 不带材质 / 不带光影 / 仅必要资源
  - Android：Mobile Glues 渲染器专用版（完整/不带材质/不带光影/仅必要）+ 通用渲染器版（完整/仅必要）
  - 每张卡片提供「带配置（含 options.txt）/ 无配置」双下载链接，附新手/高阶玩家选择建议
- **启动器**：Windows（PCL 2、HMCL、BakaXL、官方 Launcher）、Android（FCL、ZL 2）

### 7. 教程中心（`/tutorial` 与 `/tutorials/quick_play_guide`）

- 教程中心主页：教程卡片（当前置顶「快速游玩指南」），支持搜索与分类筛选
- 快速游玩指南：内嵌静态 HTML 图文教程（`app/assets/guide/quick-play-guide.html`），含 30+ 小节目录侧边栏（Xbox 账号注册、客户端下载安装、服务器玩法：领地/公会/等级/传送/交易/经济/决斗/双码/签到/统计/管理员菜单等），目录仅显示 HTML 中实际存在的章节

### 8. 捐赠页（`/donate`）

- 微信扫码捐赠 + 捐赠说明（需向管理员登记玩家代号与截图）
- 数据源：`https://api.mcyzw.top/api/donors`
- 统计：总捐赠人数、捐赠总额、平均捐赠额；金额区间筛选（10-50 / 51-100 / 101-250 / 251-500 / 501+ 元）
- 每 60 秒自动刷新

### 9. 错误页（`error.vue`）

- 统一 403 / 404 处理：错误插画、状态码、返回主页 / 上一页、快捷导航（首页 / 处罚记录 / 教程 / 状态监控）

---

## 🖥️ 外部 API 对接

前端为纯静态站，数据全部通过运行时 `fetch` 获取（部分经后端同源代理转发）。

| 接口 | 用途 | 来源 |
|------|------|------|
| `POST /api/craftping/get_status` | MC 服务器状态查询（同源代理，CORS 全放开） | 本地 Rust 后端 |
| `GET https://api.mcyzw.top/api/activities` | 服务器动态列表 | 外部 API 服务 |
| `GET/POST https://api.mcyzw.top/api/chat` | 聊天记录拉取 / 发言（`/login` `/session` `/logout` 子路径） | 外部 API 服务 |
| `GET https://api.mcyzw.top/api/chat/turnstile` | 下发 Turnstile 站点密钥 | 外部 API 服务 |
| `GET https://api.mcyzw.top/api/bans` | 玩家处罚记录 | 外部 API 服务 |
| `GET https://api.mcyzw.top/api/donors` | 捐赠者列表 | 外部 API 服务 |
| `GET https://api.eqad.fun/mcsm/api/services/` | MCSM 节点状态 | 外部监控服务 |
| `GET https://api.eqad.fun/monitor` | 节点历史可用性 | 外部监控服务 |
| `https://assets.mcyzw.top/...` | 静态资源（图片 / 字体 / 图标）CDN | 独立资源站 |

---

## 🔧 技术栈与依赖

### 前端（`app/`）

| 依赖 | 版本 | 用途 |
|------|------|------|
| Nuxt | ^4.4.8 | SSR + SSG 框架（`ssr: true`，`nitro.prerender` 预渲染） |
| Vue | ^3.5.39 | 视图层 |
| vue-router | ^5.1.0 | 路由（自定义 `scrollBehavior`：hash 锚点平滑滚动） |
| Three.js | ^0.185.1 | Hero 区 3D 像素 Logo（`@types/three`） |
| Swiper | ^11.2.6 | 玩法特性双联轮播 |
| Sass | ^1.83.4 | SCSS 样式体系 |
| TypeScript | 由 Nuxt 提供 | `~` 别名、自动导入 composables/utils |

- 包管理器：**pnpm**（`only-allow pnpm` 强制，pnpm@10.32.1）
- 开发端口：`3400`（`nuxt.config.ts`）

### 后端（`backend/`，Rust）

| 依赖 | 版本 | 用途 |
|------|------|------|
| actix-web | 4.13.0 | HTTP 服务框架 |
| actix-cors | 0.7.1 | CORS（全放开） |
| actix-files | 0.6.10 | 静态文件服务（`./static`，index `index.html`，自定义 404） |
| config | 0.15.22 | TOML 配置加载（`config.toml` + `APP_` 前缀环境变量覆盖） |
| serde / serde_json | 1.x | 序列化 |
| tokio | 1.52.1 | 异步运行时 |
| chrono | 0.4.44 | 日志时间戳 |
| craftping | 0.7.0 | Minecraft Server List Ping 协议握手 |
| hickory-resolver | 0.24 | `_minecraft._tcp.` SRV 记录解析 |
| zip | 2 | 部署包解压（含路径穿越防护） |
| subtle | 2 | 部署令牌常量时间比较（防时序攻击） |
| base64 | 0.22 | favicon base64 编码 |
| num_cpus | 1.13.0 | 默认 worker 数 |

---

## 🏗️ 项目结构

```
YouzaiWorldWebNew/
├── package.json / pnpm-lock.yaml        # pnpm 项目（only-allow pnpm）
├── nuxt.config.ts                       # Nuxt 配置（SSR、端口 3400、prerender、全局样式）
├── tsconfig.json                        # 引用 .nuxt 生成的类型配置
├── .gitignore
├── LICENSE                              # Apache-2.0
├── README.md / README.EN.md             # 本文件（中 / 英）
├── AGENTS.md                            # AI 开发助手上下文
│
├── app/                                 # Nuxt 前端（srcDir）
│   ├── app.vue                          # 根组件（NuxtLayout + NuxtPage + 路由播报）
│   ├── error.vue                        # 403/404 错误页
│   ├── router.options.ts                # 滚动行为（hash 锚点平滑滚动，顶部偏移 80px）
│   ├── layouts/default.vue              # 默认布局（Loader + Navbar + main + Footer + 点击特效）
│   ├── assets/
│   │   ├── scss/                        # ⭐ 样式体系
│   │   │   ├── _tokens.scss             #   设计令牌（主色 #a8e6cf/#6bb39b/#345e54…、断点、@font-face）
│   │   │   ├── _shared.scss             #   通用组件样式
│   │   │   ├── _animations.scss         #   动画
│   │   │   ├── main.scss                #   入口（引入全部 + 页面过渡）
│   │   │   └── pages/                   #   按页面拆分（_home / _guide / _error）
│   │   └── guide/quick-play-guide.html  #   快速游玩指南静态图文内容（?raw 导入）
│   ├── components/
│   │   ├── AppLoader.vue                #   首屏加载动画
│   │   ├── AppNavbar.vue                #   导航栏（滚动变色、桌面下拉菜单、移动端汉堡菜单）
│   │   ├── AppFooter.vue                #   页脚（快速链接、友链 EQAD/MSCPO、运行时长、ICP 备案）
│   │   ├── ClickEffect.vue / ClickTilt.vue   #   全局点击特效
│   │   ├── download/PackCard.vue        #   资源包卡片（带配置/无配置单选）
│   │   ├── home/
│   │   │   ├── HeroSection.vue          #   Hero 区
│   │   │   ├── PixelLogoScene.vue       #   Three.js 像素 3D Logo
│   │   │   ├── ChatBoard.vue            #   聊天区（完整收发 + 登录）
│   │   │   ├── FeatureCarousel.vue      #   玩法特性 Swiper 双联轮播
│   │   │   └── WorldsExplorer.vue       #   世界切换浏览
│   │   └── ui/
│   │       ├── Breadcrumbs.vue          #   面包屑
│   │       ├── CountUp.vue              #   数字滚动动画
│   │       ├── NoticeBanner.vue         #   提示横幅
│   │       ├── PageHero.vue             #   内页 Hero（标题 + 副标题）
│   │       └── ServerStatusInline.vue   #   内联服务器状态
│   ├── composables/
│   │   ├── useServerStatus.ts           #   MC 状态 / MCSM 节点 / 可用性 API
│   │   ├── useChat.ts                   #   聊天读写 / 玩家登录会话
│   │   ├── useTurnstile.ts              #   Cloudflare Turnstile 封装（按需加载）
│   │   ├── useActivities.ts             #   服务器动态拉取
│   │   ├── useUptime.ts                 #   站点运行时长倒计时
│   │   ├── useClipboard.ts              #   复制（clipboard API + 降级）
│   │   └── useScrollReveal.ts           #   ⭐ 滚动进入动画 + 数字滚动 + 状态卡逐卡出现
│   ├── pages/
│   │   ├── index.vue                    #   主页（聚合全部 home 组件与区块）
│   │   ├── status.vue                   #   服务器状态监控（详细 / 历史双 tab）
│   │   ├── banlist.vue                  #   玩家处罚记录
│   │   ├── trend.vue                    #   服务器动态
│   │   ├── download.vue                 #   下载中心
│   │   ├── tutorial.vue                 #   教程中心主页
│   │   ├── tutorials/quick_play_guide.vue  #   快速游玩指南（HTML 导入 + 目录）
│   │   └── donate.vue                   #   捐赠页
│   ├── utils/
│   │   ├── site.ts                      #   导航 / 页脚链接 / 友链 / 站点起始时间
│   │   ├── home.ts                      #   世界信息 / 玩法特性 / 团队 / 优势数据
│   │   ├── downloads.ts                 #   资源包 / 启动器卡片数据（蓝奏云链接）
│   │   ├── trends.ts                    #   动态类型 → 文案 / 类名 / 图标
│   │   └── chat-avatar.ts               #   昵称哈希 → 像素头像（SVG data URI）
│   └── types/
│       ├── index.ts                     #   ⭐ 全部领域类型（Trend/WorldInfo/TeamMember/DownloadCard/ChatMessage/PenaltyRecord/Donator…）
│       └── turnstile.d.ts               #   window.turnstile 类型声明
│
├── backend/                             # Rust 部署/API 后端
│   ├── Cargo.toml                       # 依赖清单（actix-web 等）
│   ├── config.toml                      # 运行配置（端口 3003、workers、deploy key）
│   └── src/
│       ├── main.rs                      # ⭐ 入口：中间件链（日志/压缩/指标）、/api 路由、静态文件服务、统计落盘
│       ├── config.rs                    #   AppConfig 加载（config.toml + APP_ 环境变量）
│       ├── monitoring.rs                #   Metrics（请求数/连接数/错误数/平均耗时）+ /api/health /api/metrics
│       ├── craftping.rs                 #   POST /api/craftping/get_status（SRV 解析 + 协议握手，5s 超时）
│       └── deploy.rs                    #   POST /api/deploy（令牌校验 → 备份 → zip 解压，路径穿越防护）
│
├── public/                              # 静态根（直接对外）
│   ├── CNAME                           #   mcyzw.top
│   ├── robots.txt                       #   允许全部
│   ├── favicon.ico
│   └── logo.png                         #   Hero 3D Logo 的像素源图
│
└── .github/workflows/release.yml        # CI：Release 发布 → 构建 → 打包 → 部署
```

---

## ⚙️ 常用命令

> 项目强制使用 pnpm（`preinstall` 钩子 `only-allow pnpm`），请勿使用 npm/yarn 安装依赖。

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖（`postinstall` 自动执行 `nuxt prepare`） |
| `pnpm dev` | 启动开发服务器（http://localhost:3400） |
| `pnpm build` | 生产构建 |
| `pnpm generate` | 静态站点预渲染生成（输出 `.output/public/`） |
| `pnpm preview` | 预览生成产物 |

后端（`backend/`）：

| 命令 | 说明 |
|------|------|
| `cargo run` | 启动后端（读取 `config.toml`，默认端口 3003） |
| `cargo build --release` | 编译发布版 |

---

## 🚀 部署流程

```
GitHub Release (published)
   └─ .github/workflows/release.yml
        ├─ pnpm install --frozen-lockfile
        ├─ pnpm generate                  # 生成 .output/public/
        ├─ zip 打包
        └─ curl -H "X-Deploy-Token: $DEPLOY_TOKEN" \
             --data-binary @deploy.zip "$DEPLOY_URL/api/deploy"
             └─ Rust 后端 /api/deploy
                  ├─ 校验 X-Deploy-Token（常量时间比较）
                  ├─ 清空 bak/ → 备份当前 static/ 至 bak/
                  ├─ 解压 zip 至 static/（enclosed_name + 路径前缀双重防穿越）
                  └─ 返回 {"ok":true}
```

- 前端静态产物由 CI 打包为 zip，通过 `POST /api/deploy` 推送到 Rust 后端解压到 `static/` 目录对外服务（`mcyzw.top` 经 Cloudflare 代理）。
- 部署令牌：GitHub Secrets `DEPLOY_TOKEN` 与 `DEPLOY_URL`；后端 `config.toml` 的 `[deploy] key` 必须与之匹配。
- 历史版本自动留存于后端 `bak/` 目录，可手动回滚。
- 静态资源（图片/字体/图标）托管于独立资源站 `assets.mcyzw.top`（见 `utils/` 中全部 `assets.mcyzw.top` 引用）。

---

## 🌐 相关链接

- 官网：https://mcyzw.top
- 服务器地址：`play.mcyzw.top:25565`
- 资源站：https://assets.mcyzw.top
- 友链：https://eqad.fun ｜ https://dev.mscpo.org
- 团队主页：https://github.com/Youzai-World-Team
- 核心模组仓库：https://github.com/Youzai-World-Team/YouzaiWorldCore
- Nuxt 文档：https://nuxt.com/docs
- Actix Web 文档：https://actix.rs/docs

---

## 🤝 贡献者

由 **Youzai World Team** 维护。团队成员（详见官网首页「我们的团队」）：

- **zxaBinbin** — 服主 · 主要维护者
- **ress2338396** — 运维
- **GrantedCar81239** — 管理
- **Maskviva** — 开发（MOD / 玩法开发及维护）

> 正在招聘开发、维护和管理等成员，有意者请联系服主。
