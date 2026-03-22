FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma client
RUN npm run prisma:generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5001/health || exit 1

# Wait for dependencies and run migrations
CMD ["sh", "-c", "npm run prisma:migrate && npm start"]
