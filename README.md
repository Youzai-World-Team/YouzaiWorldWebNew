# 悠哉世界 — Youzai World 官网

「悠哉世界」Minecraft 多人服务器的官方网站，提供服务器状态监控、聊天区、动态与活动展示、下载中心、教程中心等内容。前端基于 **Nuxt 4**（SSR + 预渲染），后端 API 与部署服务基于 **Rust（actix-web）**。

- 线上地址：<https://mcyzw.top>
- 静态资源：<https://assets.mcyzw.top>（独立项目 YouzaiWorldWebAssets，部署于 Cloudflare Pages）

---

## 功能一览

| 页面 | 路由 | 说明 |
|------|------|------|
| 门户首页 | `/` | Hero 区、Three.js 像素 Logo 场景、玩法特性轮播、世界一览、聊天板、服务器动态与活动列表 |
| 服务器状态 | `/status` | 通过状态 Worker 聚合节点、公共服务与 CraftPing 游戏状态 |
| 处罚记录 | `/banlist` | 玩家处罚（封禁）记录公示 |
| 趋势监控 | `/trend` | 服务器可用性与在线趋势 |
| 下载中心 | `/download` | 聚合 PCL2、HMCL、BakaXL 等主流启动器下载入口 |
| 教程中心 | `/tutorial`、`/tutorials/quick_play_guide` | 教程导航与图文《快速游玩指南》 |
| 赞助页 | `/donate` | 支持服务器运营 |

其他特性：Turnstile 人机校验、页面过渡动画、滚动入场与点击特效、响应式布局、全局错误页。

---

## 技术栈

**前端**

- [Nuxt 4](https://nuxt.com)（Vue 3，SSR + Nitro 预渲染）
- Three.js（首页 3D 场景）、Swiper（轮播）
- Sass（设计 tokens + 按页面组织的样式体系）

**后端（`backend/`）**

- Rust + actix-web 4
- craftping：Minecraft 服务器状态查询（支持 SRV 记录解析，供状态 Worker 采集游戏状态）
- zip + subtle：接收 zip 包的静态站点部署接口（token 校验 + 路径穿越防护）

---

## 快速开始

### 前端

```bash
# 安装依赖（强制使用 pnpm）
pnpm install

# 启动开发服务器（http://localhost:3400）
pnpm dev

# 生产构建 / 静态生成
pnpm build
pnpm generate
```

### 后端

```bash
cd backend
# 先编辑 config.toml，填写 [deploy] key 等
cargo run
```

后端默认监听 `3003` 端口，提供以下 API：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/metrics` | GET | 运行指标 |
| `/api/craftping/get_status` | POST | 查询 Minecraft 服务器状态 |
| `/api/deploy` | POST | 上传 zip 部署静态站点（Header：`X-Deploy-Token`） |

---

## 目录结构

```
YouzaiWorldWebNew/
├── nuxt.config.ts        # Nuxt 配置（端口 3400、SSR、预渲染）
├── app/                  # Nuxt 4 应用目录
│   ├── components/       # 导航/页脚 + home/ + ui/ 按域拆分
│   ├── composables/      # 数据获取与交互逻辑（状态、聊天、下载、Turnstile 等）
│   ├── pages/            # 文件式路由页面
│   ├── assets/scss/      # 设计 tokens 与页面样式
│   └── utils/            # 导航配置、下载信息、站点常量
├── backend/              # Rust 后端（actix-web）
│   ├── config.toml       # 运行配置（端口、部署 key）
│   └── src/              # main / config / craftping / deploy / monitoring
└── public/               # 根级站点文件（CNAME、robots.txt、域名验证文件；图片统一由 assets.mcyzw.top 托管）
```

---

## 相关项目

- **YouzaiWorldCore**：服务器核心模组（<https://github.com/Youzai-World-Team/YouzaiWorldCore>）
- **YouzaiWorldWebAssets**：静态资源项目（图片、字体），部署于 `assets.mcyzw.top`

## 许可证

见 [LICENSE](./LICENSE)。
