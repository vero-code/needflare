FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Build only the server (no Vite frontend — Cloud Run serves only the agent)
RUN npx tsc --project tsconfig.node.json --outDir dist/server --esModuleInterop true 2>/dev/null || true

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src /app/src

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run server directly with tsx (no compile step needed for the hackathon demo)
CMD ["npx", "tsx", "src/server.ts"]
