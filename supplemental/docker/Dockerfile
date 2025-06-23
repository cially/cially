# ---- Base image ----
FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Install dependencies (shared cache) ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY cially-bot/package.json cially-bot/
COPY cially-web/package.json cially-web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build cially-bot ----
FROM deps AS build-bot
WORKDIR /app
COPY . .
RUN pnpm deploy --filter=cially-bot --prod /prod/cially-bot

# ---- Build cially-web ----
FROM deps AS build-web
WORKDIR /app
COPY . .
RUN pnpm run --filter=cially-web build

# ---- cially-bot image ----
FROM base AS cially-bot
WORKDIR /app
RUN addgroup --system cially && adduser --system --ingroup cially cially
COPY --from=build-bot /prod/cially-bot .
USER cially
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["node", "index.js"]

# ---- cially-web image ----
FROM base AS cially-web
WORKDIR /app
RUN addgroup --system cially && adduser --system --ingroup cially cially
COPY --from=build-web --chown=cially:cially /app/cially-web/public ./cially-web/public
COPY --from=build-web --chown=cially:cially /app/cially-web/.next/standalone ./
COPY --from=build-web --chown=cially:cially /app/cially-web/.next/static ./cially-web/.next/static
USER cially
EXPOSE 3000
ENV NODE_PATH=/app/node_modules
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "cially-web/server.js"]
