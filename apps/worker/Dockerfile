# Stage 1: Build the Go binary (Engine)
FROM golang:alpine AS go-build
WORKDIR /src
COPY . .
# Build the engine binary from the correct entry point within its module
RUN cd services/engine && go build -o /app/engine main.go

# Stage 2: Base Node.js image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 3: Build Node.js worker
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npx turbo run build --filter=worker

# Stage 4: Prune for production
FROM base AS deploy
WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
RUN pnpm --filter worker --prod deploy --legacy pruned

# Stage 5: Final hybrid runner
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# Copy the pruned Node.js worker
COPY --from=deploy /usr/src/app/pruned ./

# Copy the Go engine binary to the current working directory
COPY --from=go-build /app/engine ./engine
RUN chmod +x ./engine

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
