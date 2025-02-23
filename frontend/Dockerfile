# =========================
# Stage 1: Build stage
# =========================
# Platform can be overridden during build with --build-arg PLATFORM=<platform>
# Common platforms:
# - MacOS M1/M2/M3 (Apple Silicon): linux/arm64
# - Intel/AMD processors: linux/amd64
# - Raspberry Pi: linux/arm/v7 (32-bit) or linux/arm64 (64-bit)
# If no platform is specified, it will automatically use your system's architecture
ARG PLATFORM
FROM --platform=${PLATFORM:-$BUILDPLATFORM} node:23-alpine AS builder
# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install a pinned version of pnpm (for reproducibility)
RUN npm install -g pnpm@10.3.0

# Install dependencies using a frozen lockfile to ensure reproducible installs.
# The --frozen-lockfile flag tells pnpm to only use the exact versions in pnpm-lock.yaml.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# =========================
# Stage 2: Production stage
# =========================
FROM --platform=${PLATFORM:-$BUILDPLATFORM} node:23-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Build arguments for user configuration with defaults
ARG USER_ID=1242
ARG GROUP_ID=1242
ARG USER_NAME=nextjs

# Create a non-root user and group based on provided build arguments
RUN addgroup --system --gid ${GROUP_ID} ${USER_NAME} && \
    adduser --system --uid ${USER_ID} -G ${USER_NAME} ${USER_NAME}

# Copy necessary assets from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to the non-root user for improved security
USER ${USER_ID}

# Set default environment variables for runtime configuration
ENV PORT=3342 \
    HOSTNAME="0.0.0.0"

# Expose the application port
EXPOSE ${PORT}

# Start the Next.js server
CMD ["node", "server.js"]
