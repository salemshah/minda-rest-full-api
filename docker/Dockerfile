# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY src/prisma ./src/prisma
RUN npx prisma generate

# Copy TypeScript configuration and source files, then build the application
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app

# Install netcat and curl for healthchecks
RUN apk add --no-cache netcat-openbsd curl

# Copy built application and node_modules from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json (if needed for runtime scripts)
COPY package*.json ./

# Copy the Prisma schema to the runtime container
COPY --from=builder /app/src/prisma ./src/prisma

# Copy the entrypoint script
COPY entrypoint.sh ./

# Set environment variables
ENV NODE_ENV=production

# Expose the application's port
EXPOSE 8000

# Give execution permissions to the entrypoint script
RUN chmod +x entrypoint.sh

# Define the entrypoint
ENTRYPOINT ["./entrypoint.sh"]
