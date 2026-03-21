#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────
# MiroFish Setup Script
# Klont, baut und startet die MiroFish Customer Simulation Engine
# Lizenz: AGPL-3.0 (kompatibel mit 1of10 Open Source auf GitHub)
# ─────────────────────────────────────────────────────────

REPO_URL="https://github.com/666ghj/MiroFish.git"
TARGET_DIR="services/mirofish"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "╔══════════════════════════════════════════════════╗"
echo "║   MiroFish — Customer Simulation Engine Setup    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Voraussetzungen prüfen ──────────────────────────────

check_command() {
    if ! command -v "$1" &>/dev/null; then
        echo "❌ Fehlt: $1"
        echo "   Bitte installieren: $2"
        exit 1
    fi
}

check_command git "apt install git"
check_command docker "https://docs.docker.com/get-docker/"
check_command docker "docker compose (Docker Desktop oder Plugin)"

if ! docker compose version &>/dev/null; then
    echo "❌ 'docker compose' Plugin nicht gefunden."
    echo "   Bitte Docker Compose V2 installieren."
    exit 1
fi

echo "✅ Voraussetzungen erfüllt"
echo ""

# ── Repository klonen ───────────────────────────────────

if [ -d "$TARGET_DIR" ]; then
    echo "📁 $TARGET_DIR existiert bereits."
    read -rp "   Aktualisieren? (git pull) [y/N]: " UPDATE
    if [[ "$UPDATE" =~ ^[Yy]$ ]]; then
        echo "   ↻ Aktualisiere..."
        git -C "$TARGET_DIR" pull --ff-only
    fi
else
    echo "📥 Klone MiroFish nach $TARGET_DIR ..."
    mkdir -p services
    git clone --depth 1 "$REPO_URL" "$TARGET_DIR"
fi

echo "✅ Repository bereit"
echo ""

# ── Lizenzhinweis ───────────────────────────────────────

echo "⚖️  LIZENZ: MiroFish steht unter AGPL-3.0."
echo "   Da 1of10 selbst Open Source auf GitHub ist,"
echo "   ist die Nutzung unkritisch."
echo ""

# ── Umgebungsvariablen prüfen ───────────────────────────

if [ -f .env ]; then
    if grep -q "MIROFISH_LLM_API_KEY=.\+" .env; then
        echo "✅ MIROFISH_LLM_API_KEY in .env gefunden"
    else
        echo "⚠️  MIROFISH_LLM_API_KEY ist nicht gesetzt in .env"
        echo "   MiroFish benötigt einen LLM-API-Key (Qwen-Plus oder OpenAI-kompatibel)."
        echo "   Bitte in .env eintragen: MIROFISH_LLM_API_KEY=dein-key-hier"
        echo ""
    fi
else
    echo "⚠️  Keine .env Datei gefunden. Kopiere .env.example:"
    echo "   cp .env.example .env"
    echo "   Dann MIROFISH_LLM_API_KEY setzen."
    echo ""
fi

# ── Docker Build ────────────────────────────────────────

echo "🐳 Baue MiroFish Docker-Image..."

# Compose-Datei mit uncommented mirofish Service temporär erstellen
# oder direkt bauen:
if [ -f "$TARGET_DIR/Dockerfile" ]; then
    docker build -t mirofish:local "$TARGET_DIR"
elif [ -f "$TARGET_DIR/docker-compose.yml" ]; then
    echo "   → Nutze vorhandene docker-compose.yml aus MiroFish"
    docker compose -f "$TARGET_DIR/docker-compose.yml" build
else
    echo "⚠️  Kein Dockerfile gefunden. Erstelle minimales Dockerfile..."
    cat > "$TARGET_DIR/Dockerfile" <<'DOCKERFILE'
FROM python:3.12-slim

WORKDIR /app

# System-Abhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gcc && \
    rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Anwendung kopieren
COPY . .

EXPOSE 5001

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

CMD ["python", "main.py"]
DOCKERFILE
    docker build -t mirofish:local "$TARGET_DIR"
fi

echo "✅ Docker-Image gebaut"
echo ""

# ── Hinweis zum Starten ─────────────────────────────────

echo "╔══════════════════════════════════════════════════╗"
echo "║   Setup abgeschlossen!                          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Nächste Schritte:"
echo ""
echo "  1. MIROFISH_LLM_API_KEY in .env setzen"
echo "  2. In docker-compose.yml den mirofish-Service uncomment-en"
echo "  3. Starten: docker compose up -d mirofish"
echo "  4. Backend:  http://localhost:5001"
echo "     Frontend: http://localhost:3001"
echo ""
echo "Production (Hetzner VPS):"
echo "  1. In docker-compose.prod.yml den mirofish-Service uncomment-en"
echo "  2. In Caddyfile die sim.1of10.de Route uncomment-en"
echo "  3. docker compose -f docker-compose.prod.yml up -d"
echo ""
