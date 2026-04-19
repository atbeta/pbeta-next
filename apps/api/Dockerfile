# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-alpine AS base

# Install turbo
RUN npm install turbo --global

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
# Prune the workspace for the api app
RUN turbo prune --scope=@pbeta/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build only the api
RUN pnpm turbo run build --filter=@pbeta/api

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the built artifacts
COPY --from=installer /app/apps/api/package.json .
COPY --from=installer /app/apps/api/prisma ./prisma
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
# We need node_modules for runtime dependencies
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main"]
