# ---- Base image ----
FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Install dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/bot/package.json apps/bot/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
WORKDIR /app
COPY . .
# 1. Compile TypeScript into dist/
RUN pnpm --filter=@cially/bot build
# 2. Deploy isolated production build to /prod/bot
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=@cially/bot --prod /prod/bot

# ---- Bot image ----
FROM base AS bot
WORKDIR /app

# Add lightweight init system for proper signal handling
RUN apk add --no-cache dumb-init

RUN addgroup --system cially && adduser --system --ingroup cially cially
COPY --chown=cially:cially --from=build /prod/bot .

USER cially
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV API_PORT=3001

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
