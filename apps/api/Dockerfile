FROM golang:1.24-alpine AS go-builder
WORKDIR /src
COPY . .
RUN cd services/engine && CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/engine main.go

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npx turbo run build --filter=api

FROM base AS deploy
WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
RUN pnpm --filter api --prod deploy --legacy pruned

FROM node:20-slim AS runner
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deploy /usr/src/app/pruned ./
COPY --from=go-builder /app/engine ./engine
RUN chmod +x ./engine

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000
CMD ["node", "dist/server.js"]
