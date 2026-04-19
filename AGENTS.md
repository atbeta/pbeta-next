# AGENTS.md — pbeta-next 项目交接文档

> 面向 AI agent 和接手开发者的完整参考。本文档反映截至 2026-03-17 的**实际已完成**状态。

---

## 项目概述

pbeta.me 的个人网站全栈重建。四个公开区域：**Projects**、**Notes**、**Research**（暂时隐藏）、**Services**。后端支持服务健康监控和 Feedback 收集。私有 Dashboard 已实现（V1 Minimal），支持 Services 管理。

---

## 仓库结构

```
pbeta-next/
├── apps/
│   ├── web/                  Next.js 16 — 前端网站 ✅ 已完成
│   └── api/                  NestJS 11 — 后端 API ✅ 已完成（含测试）
├── content/                  MDX 内容源文件（放在仓库根，不在 apps/web 内）
│   ├── notes/                4 篇占位笔记
│   ├── projects/             3 个占位项目
│   └── research/             2 篇占位研究
├── docs/
│   └── adr/                  架构决策记录 ADR 0001–0006
├── infra/
│   ├── docker-compose.yml    本地开发：postgres:17 + redis:7
│   └── DEPLOY.md             生产部署指南（Vercel / Fly.io / Neon / Upstash）
├── AGENTS.md                 本文件
├── package.json              Monorepo 根（turbo + prettier）
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 常用命令

```bash
# ── 本地环境 ─────────────────────────────────────
docker compose -f infra/docker-compose.yml up -d   # 启动 PostgreSQL + Redis

pnpm install                                        # 安装所有依赖

# ── 开发服务器 ────────────────────────────────────
pnpm dev                                           # 同时启动 web + api
pnpm --filter @pbeta/web dev                       # 只启动前端（端口 3000）
pnpm --filter @pbeta/api dev                       # 只启动后端（端口 3001）

# ── 构建 ─────────────────────────────────────────
cd apps/web && pnpm next build                     # ⚠️ 必须从 apps/web 目录运行
pnpm --filter @pbeta/api build

# ── 测试（API）───────────────────────────────────
pnpm --filter @pbeta/api test                      # 单元测试（Jest，无需 Docker）
pnpm --filter @pbeta/api test:e2e                  # E2E 测试（Vitest，需要 Docker）

# ── 类型检查 ──────────────────────────────────────
pnpm type-check
cd apps/web && npx tsc --noEmit                    # 单独检查前端

# ── 数据库迁移 ────────────────────────────────────
cd apps/api && npx prisma migrate dev --name <name>
cd apps/api && npx prisma generate                 # schema 变更后重新生成 client
```

---

## 前端（apps/web）— 完整状态

### 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.1.6 | **Turbopack 为默认构建器**（非 webpack）|
| React | 19.2.3 | Server Components + Client Components |
| Tailwind CSS | v4.2 | 使用 `@theme inline` 风格 |
| `@content-collections` | 0.14 / next 0.2.11 | MDX 内容管道 |
| `next-themes` | 0.4.6 | 暗色/亮色主题切换 |

### 页面结构

```
src/app/
├── page.tsx                  首页（Hero + Areas + 最近 Notes + 活跃 Projects）
├── layout.tsx                根布局（ThemeProvider + Nav + Footer）
├── globals.css               设计 token + 动效 + 主题变量
├── notes/
│   ├── page.tsx              Notes 列表页
│   └── [slug]/page.tsx       Note 详情（MDX 渲染）
├── projects/
│   ├── page.tsx              Projects 卡片网格（按状态分组）
│   └── [slug]/page.tsx       Project 详情
├── research/
│   ├── page.tsx              Research 列表
│   └── [slug]/page.tsx       Research 详情（含摘要 block）
└── services/page.tsx         Services 状态页（静态占位，待接 API）

src/components/
├── nav.tsx                   粘性导航（主题切换 + 活跃指示器）
├── footer.tsx                页脚（GitHub / Email / RSS 链接）
├── theme-toggle.tsx          日/夜切换按钮（动画图标）
├── providers.tsx             ThemeProvider 客户端包装
├── mdx-content.tsx           MDX 渲染器（'use client'）
├── tag.tsx                   标签 pill 组件

src/types/
└── content-collections.d.ts  content-collections 虚拟模块的类型声明
```

### 主题系统

- **默认主题**：暗色（`defaultTheme="dark"`），同时支持系统偏好（`enableSystem`）
- **切换方式**：`next-themes` 写入 `<html class="dark">`，CSS 变量随之切换
- **变量命名**：`--background`, `--foreground`, `--surface`, `--muted`, `--muted-foreground`, `--border`, `--border-strong`, `--accent`, `--accent-muted`, `--accent-foreground`

### 动效类（globals.css 定义）

```css
.anim-fade-up    /* 入场：从下方淡入 */
.anim-fade-in    /* 入场：纯淡入 */
.anim-slide-r    /* 入场：从左滑入 */
.delay-1 ~ .delay-6   /* 0.06s 步长的延迟阶梯 */
.bg-grid         /* CSS 网格背景 */
.bg-dot          /* CSS 点阵背景 */
```

---

## content-collections 关键配置——必读

### ⚠️ 三个非显而易见的坑

**1. 路径必须用字符串相对路径（不能用 `import.meta.url` 或 `__dirname`）**

```typescript
// ✅ 正确 — content-collections 相对 config 文件位置解析
const notes = defineCollection({
  directory: '../../content/notes',   // 相对于 apps/web/content-collections.ts
  ...
})

// ❌ 错误 — import.meta.url 在 builder 环境中解析为空
const __dirname = path.dirname(fileURLToPath(import.meta.url))  // 不要这样做
```

**2. defineConfig 必须用 `content`，不是 `collections`**

```typescript
// ✅ 正确
export default defineConfig({ content: [notes, projects, research] })

// ❌ 已弃用（会导致 TypeScript 类型全部变 never）
export default defineConfig({ collections: [...] })
```

**3. MDX 内容中不能有裸露的 `<` 后跟数字**

MDX 将 `<50ms` 解析为 JSX 标签开始，会报错。用反引号包裹：`` `<50ms` ``

### content-collections 模块解析（TypeScript + Turbopack）

由于 `content-collections` 是虚拟模块（运行时由 `.content-collections/generated/index.js` 提供），需要两处配置：

**1. `apps/web/tsconfig.json` — 让 Turbopack 找到模块：**
```json
"paths": {
  "@/*": ["./src/*"],
  "content-collections": ["./.content-collections/generated/index.js"]
}
```

**2. `apps/web/src/types/content-collections.d.ts` — 让 TypeScript 得到正确类型：**
```typescript
declare module 'content-collections' {
  type Configuration = typeof import('../../content-collections').default
  type GetTypeByName<C, N extends string> = import('@content-collections/core').GetTypeByName<C, N>
  export type Note = GetTypeByName<Configuration, 'notes'>
  export type Project = GetTypeByName<Configuration, 'projects'>
  export type Research = GetTypeByName<Configuration, 'research'>
  export const allNotes: Array<Note>
  export const allProjects: Array<Project>
  export const allResearch: Array<Research>
}
```

> **为什么不用生成的 `.d.ts`？** 生成的 `index.d.ts` 中 `GetTypeByName<typeof configuration, "notes">` 在 TypeScript 路径解析上下文中求值为 `never`。手写 ambient declaration 绕过这个问题，行为一致。

**3. `apps/web/next.config.ts` — webpack（非 Turbopack 路径）的别名：**
```typescript
webpack: (config) => {
  config.resolve.alias['content-collections'] = path.resolve(
    process.cwd(), '.content-collections/generated/index.js'
  )
  return config
},
```

### MDXContent 渲染器工作原理

```typescript
// 'use client' 是必须的——new Function 需要在客户端/Node 确定环境运行
// 编译后的 MDX 代码把 react/jsx-runtime 称为 `_jsx_runtime`（自由变量）
// 必须把它作为参数名注入，不是作为调用参数传递

const fn = new Function('_jsx_runtime', code)  // ✅
const mod = fn(runtime)                          // 返回 { __esModule: true, default: Component }
const MDXComponent = mod?.default ?? mod         // 取 .default
```

---

## 后端（apps/api）— 完整状态

### 技术栈

| 技术 | 版本 |
|------|------|
| NestJS | 11 |
| Prisma | 7.5（driver adapters，无 `url` in schema）|
| PostgreSQL | 17（本地 Docker，生产用 Neon）|
| Redis | 7（本地 Docker，生产用 Upstash）|
| BullMQ | 5.71（任务队列）|
| `@nestjs/schedule` | Cron 调度 |
| `@nestjs/throttler` | 限流 |
| `@nestjs/terminus` | 健康检查 |

### API 端点

```
GET  /api/v1/health               公开，健康检查
GET  /api/v1/services             公开，获取所有服务状态
GET  /api/v1/services/:id/history 公开，获取服务历史
POST /api/v1/services/check       私有（JWT），手动触发检查
POST /api/v1/feedback             公开，限流 5次/min
GET  /api/v1/feedback             私有（JWT），获取 Feedback 列表
```

### Auth 模式

JWT Guard 作为 `APP_GUARD` 全局应用，默认所有路由私有：

```typescript
@Public()     // 公开路由加此装饰器
@Get('...')
handler() {}

@Get('...')   // 私有路由无需装饰器，需 Bearer token
adminOnly() {}
```

### Prisma 7 关键差异

1. `schema.prisma` 的 `datasource db {}` **不含 `url` 字段**（仅 `provider`）
2. 运行时必须用 driver adapter：`new PrismaClient({ adapter: new PrismaPg(pool) })`
3. 生成的 client 是 ESM 文件，含 `import.meta.url`，**不能在 Jest CJS 模式下 import**

### 测试策略

| 层级 | 工具 | 命令 | 需要 Docker |
|------|------|------|------------|
| 单元 | Jest + ts-jest | `pnpm test` | 否 |
| E2E | Vitest | `pnpm test:e2e` | 是 |

Jest `moduleNameMapper` 将 Prisma 生成 client 映射到 `test/mocks/prisma-client.mock.ts`，单元测试不触碰真实数据库。

---

## 环境变量

**`apps/api/.env`（复制自 `.env.example`）：**

| 变量 | 本地值 | 生产 |
|------|--------|------|
| `DATABASE_URL` | `postgresql://pbeta:pbeta_dev@localhost:5432/pbeta` | Neon 连接串 |
| `REDIS_URL` | `redis://localhost:6379` | Upstash `rediss://...` |
| `JWT_SECRET` | 任意 ≥16 字符 | `openssl rand -base64 64` |
| `JWT_EXPIRES_IN` | `7d` | `7d` |
| `API_KEY` | 任意 ≥8 字符 | `openssl rand -base64 32` |

**`apps/web/.env.local`（如需要）：**

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001`（本地）/ `https://api.pbeta.me`（生产）|

---

## 生产部署

本项目采用 **Railway** 作为全栈部署平台，将前端、后端、数据库和缓存统一管理。

| 服务 | 平台 | 备注 |
|------|------|------|
| `apps/web` | Railway | Docker 构建（Standalone 模式）|
| `apps/api` | Railway | Docker 构建 |
| PostgreSQL | Railway | 托管服务（内网通信）|
| Redis | Railway | 托管服务（内网通信）|

完整指南见 `infra/RAILWAY.md`。

---

## 待完成工作（优先级排序）

### 🔴 高优先级

1. **`/services` 接 API**
   - 当前 `apps/web/src/app/services/page.tsx` 是静态数据
   - 改为 `fetch('/api/v1/services')` 获取实时状态
   - 需要在 `apps/api` 中先录入真实服务数据（`POST /api/v1/services` 或直接 seed DB）

2. **API 生产部署**
   - `apps/api/Dockerfile` 尚未创建
   - `fly.toml` 尚未创建
   - 参考 `infra/DEPLOY.md` 中的指引

### 🟡 中优先级

3. **内容替换**
   - `content/notes/`、`content/projects/`、`content/research/` 中的占位内容需要替换为真实内容
   - MDX frontmatter schema 参见 `apps/web/content-collections.ts`

4. **`/archive` 旧文章页**
   - 路径：`/archive`，加 `<meta name="robots" content="noindex">`
   - 展示旧博客文章，不计入 Notes 内容流

5. **RSS Feed**
   - Footer 已有 RSS 链接指向 `/rss.xml`，但该路由不存在
   - Next.js App Router 用 `app/rss.xml/route.ts` 实现

6. **Services 后端数据录入**
   - 需要通过 Prisma 或 API 在数据库中创建服务记录
   - `Service` 模型字段：`name`, `url`, `category`, `status`

### 🟢 低优先级 / 长期

7. **`/dashboard` 私有工作台**
   - Auth 基础设施已就绪（JWT Guard + `@Public()` 模式）
   - 只需要写前端 UI 和对应的私有 API 端点

8. **全文搜索**
   - 计划用 Meilisearch，等内容量增长后再接入

9. **`packages/ui` 跨应用组件库**
   - 目前是占位目录，暂不需要

---

## 已知的非显而易见问题

### 构建必须从 `apps/web` 目录执行

```bash
# ✅ 正确
cd apps/web && pnpm next build

# ❌ 错误（content-collections 会找不到 MDX 文件，输出"0 documents"）
pnpm --filter @pbeta/web build   # 在 monorepo 根运行 turbo 时也有此问题
```

**原因**：`content-collections.ts` 中的路径 `'../../content/notes'` 是相对于 content-collections 构建器运行时的 `cwd`（即 `apps/web/`）解析的。若从其他目录运行，路径会错位。

### `next-themes` 与 SSR 的 hydration

`layout.tsx` 的 `<html>` 标签必须有 `suppressHydrationWarning`，否则服务端渲染的 `class=""` 与客户端写入的 `class="dark"` 会产生 hydration mismatch 警告：

```tsx
<html lang="zh-CN" suppressHydrationWarning>
```

### content-collections 弃用警告

运行 build 时会看到：
```
[CC DEPRECATED]: The implicit addition of a content property to schemas is deprecated.
```
**不影响功能**。修复方式是在每个 schema 中加 `content: z.string()` 字段，但目前代码不使用 `content` 字段（只用编译后的 `mdx` 字段），可暂时忽略。

---

## ADR 索引（架构决策记录）

详见 `docs/adr/`:

| ADR | 决策 |
|-----|------|
| 0001 | Monorepo with Turborepo |
| 0002 | NestJS API 独立于 Next.js |
| 0003 | Prisma 7 driver adapters（关键——记录 Breaking Changes）|
| 0004 | Jest 单元 + Vitest E2E 双测试框架 |
| 0005 | 全局 JWT Guard + `@Public()` opt-out |
| 0006 | MDX content 放在仓库根 `content/` |
