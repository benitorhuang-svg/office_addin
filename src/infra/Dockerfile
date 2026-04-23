# Nexus Center: Industrial Zenith Dual-Engine Container (2026)
# Standard: Node 24 + Python 3.12 Architecture
# OPTIMIZATION: Option A (Layer Caching & Dependency Carry-over)

# --- Stage 1: Build & Package Resolution ---
FROM node:24-bookworm AS builder

WORKDIR /app

# 1. Cache Package Resolution (High-Fidelity Layering)
COPY package*.json ./
COPY src/infra/mocks ./src/infra/mocks
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --legacy-peer-deps --include=dev

# 2. Build Industrial Assets (Cache-Busting Force)
# Explicitly invalidate cache for the assets folder
COPY . .
# We remove any internal cache that might skew the build
RUN rm -rf node_modules/.cache
RUN npm run build:server
RUN npm run build -- --mode production

# --- Stage 2: Final Production Environment ---
FROM node:24-bookworm-slim

WORKDIR /app

# 1. Non-root security hardening
RUN addgroup --system nexus && adduser --system --ingroup nexus --home /home/nexus nexus

# 2. Install Python Skill Layer
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 3. Secure Workspace Setup
RUN mkdir -p /opt/nexus-venv && chown -R nexus:nexus /opt/nexus-venv /app

USER nexus
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# 4. Create Python venv for Expert Libraries
RUN uv venv /opt/nexus-venv
ENV PATH="/opt/nexus-venv/bin:$PATH"
COPY --chown=nexus:nexus src/infra/requirements.txt /tmp/requirements.txt
RUN uv pip install --no-cache-dir -r /tmp/requirements.txt

# 5. Direct Carry-over: Import production assets and modules
COPY --chown=nexus:nexus --from=builder /app/node_modules ./node_modules
COPY --chown=nexus:nexus --from=builder /app/dist-server ./dist-server
COPY --chown=nexus:nexus --from=builder /app/dist ./dist
COPY --chown=nexus:nexus --from=builder /app/package*.json ./
COPY --chown=nexus:nexus --from=builder /app/src/infra/mocks ./src/infra/mocks
COPY --chown=nexus:nexus --from=builder /app/src/skills ./src/skills
COPY --chown=nexus:nexus --from=builder /app/src/scripts ./src/scripts
COPY --chown=nexus:nexus --from=builder /app/manifest.xml ./

# 6. Environment Matrix
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

USER nexus

# 7. Execute Command HUD
CMD ["sh", "-c", "node src/infra/scripts/core/patch-copilot-sdk.mjs && node dist-server/index.mjs"]
