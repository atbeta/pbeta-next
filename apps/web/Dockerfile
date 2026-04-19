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
# Prune the workspace for the web app
RUN turbo prune @pbeta/web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm@10.30.3
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Copy content folder explicitly because it's outside of apps/web but required for build
# (Though 'out/full' should contain it if it was part of the context, 
#  but 'turbo prune' might exclude non-package files if not carefully configured.
#  Since content/ is not a package, we need to ensure it's present for content-collections)
COPY content ./content

# Build only the web
RUN pnpm turbo run build --filter=@pbeta/web

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy content for runtime access if needed (though usually baked into build by content-collections)
# content-collections bakes data into .content-collections/generated, which is part of the build output.

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
