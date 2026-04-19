# Railway Deployment Guide

This project is optimized for deployment on [Railway](https://railway.app), which provides an all-in-one solution for hosting the frontend (Next.js), backend (NestJS), database (PostgreSQL), and cache (Redis).

## Architecture on Railway

Instead of using 4 separate services (Vercel, Fly, Neon, Upstash), we consolidate everything into a single Railway Project with 4 services:

1.  **PostgreSQL**: Managed database service
2.  **Redis**: Managed cache service
3.  **API**: NestJS backend (built from `apps/api/Dockerfile`)
4.  **Web**: Next.js frontend (built from `apps/web/Dockerfile`)

All services communicate over a private network within the Railway project.

## Setup Steps

### 1. Create Project & Database

1.  Go to [Railway Dashboard](https://railway.app/dashboard).
2.  Click **New Project** -> **Provision PostgreSQL**.
3.  Right click on the canvas -> **Add Service** -> **Redis**.

### 2. Connect Repository

1.  Right click on the canvas -> **Add Service** -> **GitHub Repo**.
2.  Select `pbeta-next`.
3.  This will create a service for the repo. We will configure this as the **API** service first.

### 3. Configure API Service

1.  Click the repo service card -> **Settings**.
2.  **Root Directory**: `/` (Leave as root, Dockerfile handles the rest).
3.  **Build**:
    - Builder: `Dockerfile`
    - Dockerfile Path: `apps/api/Dockerfile`
4.  **Variables**:
    - `DATABASE_URL`: `${{PostgreSQL.DATABASE_URL}}` (Auto-injected)
    - `REDIS_URL`: `${{Redis.REDIS_URL}}` (Auto-injected)
    - `JWT_SECRET`: Generate a secret
    - `API_KEY`: Generate a key
    - `NODE_ENV`: `production`
    - `CORS_ORIGIN`: `https://pbeta.me,https://pbeta-web-production.up.railway.app` (replace with your real web domains)
5.  **Networking**:
    - Generate Domain: e.g., `pbeta-api-production.up.railway.app` (This is your public API URL)

### 4. Configure Web Service

1.  Right click on the canvas -> **Add Service** -> **GitHub Repo** (Select `pbeta-next` again).
2.  Click the new service card -> **Settings**.
3.  **Root Directory**: `/` (Leave as root).
4.  **Build**:
    - Builder: `Dockerfile`
    - Dockerfile Path: `apps/web/Dockerfile`
5.  **Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://pbeta-api-production.up.railway.app` (Use API base domain only, no `/api/v1`)
    - `AUTH_SECRET`: Generate a secret
6.  **Networking**:
    - Generate Domain: e.g., `pbeta-web-production.up.railway.app`
    - Add Custom Domain: `pbeta.me`

## Advantages

- **Unified Billing**: One bill for all services.
- **Private Networking**: Redis and Postgres are not exposed to the public internet by default; only your apps can access them.
- **Monorepo Support**: Easy to deploy multiple apps from the same repo.
- **Persistent Storage**: Railway volumes can be attached if needed.

## Local Development vs Production

- **Local**: Uses `docker-compose.yml` for Postgres/Redis.
- **Production**: Uses Railway managed services.

## Cost Optimization (Recommended for $5 Hobby Plan)

The Railway Hobby plan includes $5 of usage per month. Running all 4 services (Web, API, Postgres, Redis) might consume close to or slightly more than $5 depending on traffic (estimated ~$6-8/month).

**To keep costs strictly under $5/month:**

1.  **Keep Web & API on Railway**: These consume compute resources (RAM/CPU) and benefit from Railway's deployment workflow.
2.  **Move Database to Neon (Free)**: Use the free tier of Neon for PostgreSQL.
3.  **Move Redis to Upstash (Free)**: Use the free tier of Upstash for Redis.

**How to switch to this hybrid mode:**

1.  Delete the Postgres and Redis services in your Railway project.
2.  Update the `DATABASE_URL` and `REDIS_URL` variables in your Railway API service to point to your external Neon/Upstash instances.
3.  This reduces Railway usage to just the compute (Web + API), which typically fits comfortably within the $5 limit.
