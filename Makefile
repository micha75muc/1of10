.PHONY: dev setup db-push seed test down clean

# ─────────────────────────────────────────────
# 1of10 — Lokale Entwicklungsumgebung
# ─────────────────────────────────────────────

## Alles starten: DB + Web-App + Agents
dev:
	@echo "🚀 Starte Infrastruktur (PostgreSQL + Redis)..."
	docker compose up -d
	@echo "⏳ Warte auf DB-Readiness..."
	@until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "📦 DB-Schema synchronisieren..."
	pnpm --filter @repo/db db:push
	@echo "🌐 Starte Next.js (Port 3000) + Agents (Port 8000)..."
	@trap 'kill 0' EXIT; \
		pnpm --filter @repo/web dev & \
		cd apps/agents && if [ -d .venv ]; then . .venv/bin/activate; fi && uvicorn main:app --reload & \
		wait

## Erstmalige Einrichtung
setup:
	@echo "🔧 1of10 Setup wird gestartet..."
	@echo ""
	@echo "📋 Prüfe Voraussetzungen..."
	@command -v node > /dev/null 2>&1 || { echo "❌ Node.js nicht gefunden"; exit 1; }
	@command -v pnpm > /dev/null 2>&1 || { echo "❌ pnpm nicht gefunden"; exit 1; }
	@command -v docker > /dev/null 2>&1 || { echo "❌ Docker nicht gefunden"; exit 1; }
	@echo "✅ Alle Voraussetzungen erfüllt"
	@echo ""
	@echo "📦 Installiere Dependencies..."
	pnpm install
	@echo ""
	@echo "🐳 Starte PostgreSQL + Redis..."
	docker compose up -d
	@echo "⏳ Warte auf DB-Readiness..."
	@until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo ""
	@if [ ! -f .env ]; then \
		echo "📄 Erstelle .env aus .env.example..."; \
		cp .env.example .env; \
	else \
		echo "📄 .env existiert bereits — übersprungen"; \
	fi
	@echo ""
	@echo "🗃️  Synchronisiere DB-Schema..."
	pnpm --filter @repo/db db:push
	@echo ""
	@echo "🌱 Seede Produkte..."
	pnpm --filter @repo/db seed
	@echo ""
	@echo "═══════════════════════════════════════════"
	@echo "✅ Setup abgeschlossen!"
	@echo ""
	@echo "  Starte Entwicklung mit:  make dev"
	@echo "  Tests ausführen mit:     make test"
	@echo "═══════════════════════════════════════════"

## DB-Schema synchronisieren
db-push:
	pnpm --filter @repo/db db:push

## Produkte seeden
seed:
	pnpm --filter @repo/db seed

## Tests laufen lassen
test:
	pnpm test

## Alles stoppen
down:
	@echo "⏹️  Stoppe alle Services..."
	docker compose down
	@echo "✅ Gestoppt"

## Alles stoppen + Volumes löschen (DB-Daten weg!)
clean:
	@echo "⚠️  Stoppe Services und lösche Volumes..."
	docker compose down -v
	@echo "✅ Bereinigt"
