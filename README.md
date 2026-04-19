# pbeta.me

个人技术站点。前端 Next.js 16，后端 NestJS 11，内容基于 MDX 文件管理。

## 项目结构

```
apps/
  web/          Next.js 16 前端（Turbopack，content-collections）
  api/          NestJS 11 后端（BullMQ、Prisma 7、Redis）
packages/
  shared/       前后端共用类型（ServiceEntry、CommentEntry 等）
  content/      内容 schema 类型 + status 枚举常量
content/
  notes/        随笔 MDX
  projects/     项目 MDX
  research/     研究 MDX
infra/          部署配置（Railway）
```

## 本地开发

**前提：** Node >= 20、pnpm >= 10、OrbStack（PostgreSQL + Redis）

```bash
# 安装依赖
pnpm install

# 启动前端（http://localhost:3000）
cd apps/web && pnpm dev

# 启动后端（http://localhost:3001）
cd apps/api && pnpm dev

# Swagger 文档（开发环境）
open http://localhost:3001/api/docs
```

**环境变量**

`apps/api/.env`（参考下方）：
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
API_KEY=...
```

`apps/web/.env.local`：
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 技术决策摘要

**为何用独立的 NestJS API 而非 Next.js Route Handlers**
BullMQ 服务监控 worker 需要常驻进程，Cron job 在 serverless 环境不可靠，rate limiting 需要共享 Redis 状态。Next.js API Routes 无法满足这三点。

**Prisma 7 Driver Adapters**
Prisma 7 移除了内置 binary engine，必须通过 driver adapter（`@prisma/adapter-pg`）传入连接。Schema 里不再写 `url`，runtime 连接串通过 `PrismaService` 构造函数注入。生产环境使用 Neon pooled connection。

**Auth 模式：全局 JWT guard + `@Public()` 白名单**
所有新路由默认私有。公开路由显式加 `@Public()` 装饰器——比默认公开更安全，漏加装饰器时立即返回 401 而非意外暴露数据。

**content-collections + Next.js 16 Turbopack**
Turbopack 不支持 webpack alias，通过 `tsconfig.paths` 指向 `.content-collections/generated/index.js` 解决。Status 枚举定义在 `packages/content`，`content-collections.ts` 用 `z.enum(NOTE_STATUSES)` 引用，保证 schema 与类型不漂移。

**测试策略**
Jest 单元测试（mock PrismaService，因 Prisma 7 生成代码含 `import.meta.url` 与 CJS Jest 不兼容）+ Vitest E2E（原生 ESM，需 Docker 运行真实 DB）。

## API 文档

本地开发时访问 `http://localhost:3001/api/docs`（Swagger UI）。

主要端点：

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /api/v1/services | 公开 | 所有服务状态 |
| GET | /api/v1/services/:id/history | 公开 | 服务历史记录 |
| POST | /api/v1/services | JWT | 新增服务 |
| PUT | /api/v1/services/:id | JWT | 更新服务 |
| DELETE | /api/v1/services/:id | JWT | 删除服务 |
| POST | /api/v1/services/check | JWT | 手动触发检查 |
| POST | /api/v1/comments | 公开 | 提交评论（3/min） |
| GET | /api/v1/comments | 公开 | 按 slug 获取评论 |
| DELETE | /api/v1/comments/:id | JWT | 删除评论 |
| POST | /api/v1/feedback | 公开 | 提交反馈（5/min） |
| GET | /api/v1/feedback | JWT | 查看所有反馈 |
| GET | /api/v1/health | 公开 | 健康检查 |
| POST | /api/v1/auth/login | 公开 | 登录获取 JWT |

## 部署

前端部署至 Railway（`output: 'standalone'`），后端同 Railway，数据库 Neon（PostgreSQL），Redis Upstash。详见 `infra/RAILWAY.md`。
