# Build stage
FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm run build

# Production stage
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1242 nodejs
RUN adduser --system --uid 1242 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3342

ENV PORT=3342
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
