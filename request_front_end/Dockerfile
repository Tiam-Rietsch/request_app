FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build Next.js app
RUN pnpm build

# Production stage with PM2
FROM node:20-alpine

WORKDIR /app

# Install PM2 and wget globally
RUN npm install -g pm2 && apk add --no-cache wget

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/ecosystem.config.js ./

EXPOSE 3002

CMD ["pm2-runtime", "start", "ecosystem.config.js"]

