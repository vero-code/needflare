FROM node:22-alpine
WORKDIR /app

# Install all dependencies (including tsx to run typescript agent server)
COPY package*.json ./
RUN npm ci

# Copy project source
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run server with tsx
CMD ["npx", "tsx", "src/server.ts"]
