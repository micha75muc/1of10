#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# 1of10 — Setup-Script für Neueinrichtung
# ─────────────────────────────────────────────

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "═══════════════════════════════════════════"
echo "  1of10 — Entwicklungsumgebung einrichten"
echo "═══════════════════════════════════════════"
echo ""

# ── Voraussetzungen prüfen ──────────────────
info "Prüfe Voraussetzungen..."

command -v node  > /dev/null 2>&1 || error "Node.js nicht gefunden. Bitte installieren: https://nodejs.org"
command -v pnpm  > /dev/null 2>&1 || error "pnpm nicht gefunden. Installieren: npm install -g pnpm"
command -v docker > /dev/null 2>&1 || error "Docker nicht gefunden. Bitte installieren: https://docs.docker.com/get-docker/"

NODE_VERSION=$(node -v)
info "  Node.js:  $NODE_VERSION"
info "  pnpm:     $(pnpm -v)"
info "  Docker:   $(docker --version | cut -d' ' -f3 | tr -d ',')"

if command -v python3 > /dev/null 2>&1; then
  info "  Python:   $(python3 --version | cut -d' ' -f2)"
else
  warn "Python3 nicht gefunden — Agents können nicht lokal gestartet werden"
fi

echo ""

# ── Dependencies installieren ───────────────
info "Installiere Node-Dependencies..."
pnpm install
echo ""

# ── Docker starten ──────────────────────────
info "Starte PostgreSQL + Redis via Docker Compose..."
docker compose up -d

info "Warte auf Datenbank-Readiness..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    error "Datenbank nicht erreichbar nach 30 Versuchen"
  fi
  sleep 1
done
info "Datenbank ist bereit"
echo ""

# ── .env erstellen ──────────────────────────
if [ ! -f .env ]; then
  info "Erstelle .env aus .env.example..."
  cp .env.example .env
  info ".env erstellt — Bitte bei Bedarf anpassen"
else
  info ".env existiert bereits — übersprungen"
fi
echo ""

# ── DB-Schema synchronisieren ───────────────
info "Synchronisiere Datenbank-Schema..."
pnpm --filter @repo/db db:push
echo ""

# ── Seeding ─────────────────────────────────
info "Seede Produkte..."
pnpm --filter @repo/db seed
echo ""

# ── Python venv (optional) ──────────────────
if command -v python3 > /dev/null 2>&1; then
  if [ ! -d apps/agents/.venv ]; then
    info "Erstelle Python Virtual Environment..."
    python3 -m venv apps/agents/.venv
    info "Installiere Python-Dependencies..."
    apps/agents/.venv/bin/pip install -r apps/agents/requirements.txt
  else
    info "Python venv existiert bereits"
  fi
fi
echo ""

# ── Fertig ──────────────────────────────────
echo "═══════════════════════════════════════════"
echo -e "${GREEN}  ✅ Setup abgeschlossen!${NC}"
echo ""
echo "  Starte Entwicklung:   make dev"
echo "  Tests ausführen:      make test"
echo "  Services stoppen:     make down"
echo ""
echo "  Web-App:   http://localhost:3000"
echo "  Agents:    http://localhost:8000"
echo "  DB Studio: pnpm --filter @repo/db db:studio"
echo "═══════════════════════════════════════════"
