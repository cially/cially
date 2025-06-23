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
RUN pnpm deploy --filter=bot --prod /prod/bot

# ---- bot image ----
FROM base AS bot
WORKDIR /app
RUN addgroup --system cially && adduser --system --ingroup cially cially
COPY --from=build /prod/bot .
USER cially
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["node", "index.js"]
