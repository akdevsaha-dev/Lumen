# Stage 1: Build Go Engine
FROM golang:alpine AS go-builder
WORKDIR /src
COPY . .
# Build the engine binary from the correct entry point within its module
RUN cd services/engine && go build -o /app/engine main.go

# Stage 2: Node.js Base
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 3: Build Node.js App
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npx turbo run build --filter=api

# Stage 4: Deploy (Prune)
FROM base AS deploy
WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
RUN pnpm --filter api --prod deploy --legacy pruned

# Stage 5: Final Production Runner
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# Copy the pruned Node.js application
COPY --from=deploy /usr/src/app/pruned ./

# Copy the Go engine binary to the current working directory
COPY --from=go-builder /app/engine ./engine
RUN chmod +x ./engine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# Start the application
CMD ["node", "dist/server.js"]
