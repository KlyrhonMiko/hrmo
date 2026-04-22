# Frontend Dockerfile for Next.js application
FROM node:20-slim AS builder

WORKDIR /app

# Accept build-time environment variables
ARG NODE_ENV=production
ARG BACKEND_API_URL
ARG NEXT_PUBLIC_BACKEND_URL

# Set environment variables for the build
ENV NODE_ENV=${NODE_ENV}
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
