# ---------- Stage 1: Dependencies ----------
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone output includes only what's needed to run — no full node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]