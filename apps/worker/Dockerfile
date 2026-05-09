FROM golang:1.24-alpine AS go-build
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
RUN npx turbo run build --filter=worker

FROM base AS deploy
WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
RUN pnpm --filter worker --prod deploy --legacy pruned

FROM node:20-slim AS runner
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deploy /usr/src/app/pruned ./
COPY --from=go-build /app/engine ./engine
RUN chmod +x ./engine

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
