#!/usr/bin/env bash
# Deploy 1of10 Agents to Hetzner VPS
# Usage: ./scripts/deploy-agents.sh
set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────
VPS_HOST="${VPS_HOST:-agents.1of10.de}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="/opt/1of10"

echo "╔══════════════════════════════════════════════════╗"
echo "║  1of10 Agent Deploy → ${VPS_HOST}               ║"
echo "╚══════════════════════════════════════════════════╝"

# ── 1. Sync files to VPS ───────────────────────────────────────────
echo "[1/4] Syncing files to VPS..."
rsync -avz --delete \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.turbo' \
    --exclude='.next' \
    --exclude='apps/web' \
    --exclude='packages' \
    -e ssh \
    ./ "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

# ── 2. Copy .env (if not exists on server) ─────────────────────────
echo "[2/4] Ensuring .env is present..."
ssh "${VPS_USER}@${VPS_HOST}" "test -f ${REMOTE_DIR}/.env || echo 'WARNING: .env missing on server!'"

# ── 3. Build & restart ─────────────────────────────────────────────
echo "[3/4] Building and restarting containers..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml build --no-cache agents"
ssh "${VPS_USER}@${VPS_HOST}" "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d"

# ── 4. Health check ────────────────────────────────────────────────
echo "[4/4] Waiting for health check..."
sleep 5
if ssh "${VPS_USER}@${VPS_HOST}" "curl -sf http://localhost:8000/health" > /dev/null 2>&1; then
    echo "✓ Agents are healthy!"
else
    echo "✗ Health check failed — check logs:"
    echo "  ssh ${VPS_USER}@${VPS_HOST} 'docker compose -f ${REMOTE_DIR}/docker-compose.prod.yml logs agents'"
    exit 1
fi

echo ""
echo "Deploy complete. Agents running at https://${VPS_HOST}"
