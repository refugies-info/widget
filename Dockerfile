FROM node:24.14.0-alpine AS base

  RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
  WORKDIR /app

#
# Build the backend and the front
#
FROM base AS builder

  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY front/package.json front/
  RUN pnpm install --frozen-lockfile

  COPY . .

  # The front links to the site of the environment, so it is built once per environment
  ARG VITE_SITE_URL
  ENV VITE_SITE_URL=$VITE_SITE_URL
  RUN pnpm build:front && pnpm build

#
# Install the dependencies of the backend only
#
FROM base AS dependencies

  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY front/package.json front/
  RUN pnpm install --frozen-lockfile --prod --filter widget

#
# Run the service (no build tools)
#
FROM node:24.14.0-alpine AS runner

  ENV NODE_ENV=production
  WORKDIR /app

  COPY --from=dependencies /app/node_modules ./node_modules
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/front/dist ./front/dist
  COPY package.json ./

  USER node
  EXPOSE 3000
  CMD ["node", "dist/server.js"]
