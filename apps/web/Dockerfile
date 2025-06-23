# ---- Base image ----
FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Install dependencies (shared cache) ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build web ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm run --filter=web build

# ---- web image ----
FROM base AS web
WORKDIR /app
RUN addgroup --system cially && adduser --system --ingroup cially cially
COPY --from=build --chown=cially:cially /app/web/public ./web/public
COPY --from=build --chown=cially:cially /app/web/.next/standalone ./
COPY --from=build --chown=cially:cially /app/web/.next/static ./web/.next/static
USER cially
EXPOSE 3000
ENV NODE_PATH=/app/node_modules
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "web/server.js"]
