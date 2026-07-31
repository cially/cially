# ---- Base image ----
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Install dependencies ----
FROM base AS deps
WORKDIR /app

# Copy lockfile and package manifests for all workspaces
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/

# Install dependencies (all workspaces)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build web ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter=@cially/web build

# ---- Web image ----
FROM base AS web
WORKDIR /app

# Add lightweight init system for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system cially && adduser --system --ingroup cially cially

# Copy necessary build output with non-root ownership
COPY --from=build --chown=cially:cially /app/apps/web/public ./apps/web/public
COPY --from=build --chown=cially:cially /app/apps/web/.next/standalone ./
COPY --from=build --chown=cially:cially /app/apps/web/.next/static ./apps/web/.next/static

USER cially
EXPOSE 3000

ENV NODE_PATH=/app/node_modules
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/web/server.js"]
