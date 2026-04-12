# 1of10

AI-Native E-Commerce Platform für Software-Lizenzen mit "Gamified Refund" — jeder 10. Kauf wird erstattet.

## Tech-Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | Next.js 15 (App Router), Tailwind CSS |
| Backend / Agents | Python 3.12, FastAPI, LangGraph |
| Datenbank | PostgreSQL 16 (Neon in Prod) |
| Cache | Redis 7 |
| ORM | Prisma |
| Payment | Stripe |
| Monorepo | Turborepo + pnpm |

## Voraussetzungen

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker** + Docker Compose
- **Python** ≥ 3.12 (für Agents)

## Quick Start

### 1. Erstmalige Einrichtung

```bash
make setup
```

Das macht automatisch:
- `pnpm install` — Dependencies installieren
- Docker Compose starten (PostgreSQL + Redis)
- `.env` aus `.env.example` erstellen
- DB-Schema synchronisieren
- Produkte seeden

Alternativ: `bash scripts/setup.sh` (mit ausführlicher Ausgabe und Voraussetzungsprüfung).

### 2. Tägliche Entwicklung

```bash
make dev
```

Startet **alles** in einem Befehl:
- PostgreSQL + Redis (Docker)
- Next.js Dev-Server → http://localhost:3000
- FastAPI Agents → http://localhost:8000

Stoppen mit `Ctrl+C`.

### 3. Tests

```bash
make test
```

### 4. Weitere Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `make db-push` | DB-Schema synchronisieren |
| `make seed` | Produkte seeden |
| `make down` | Docker-Services stoppen |
| `make clean` | Services stoppen + DB-Daten löschen |

## Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Variablen. Die wichtigsten:

| Variable | Beschreibung | Default |
|----------|--------------|---------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://postgres:postgres@localhost:5432/oneoften` |
| `REDIS_URL` | Redis Connection String | `redis://localhost:6379` |
| `STRIPE_MOCK` | Stripe im Mock-Modus | `true` |
| `AGENTS_API_URL` | URL der Python-Agents | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` | Öffentliche App-URL | `http://localhost:3000` |

## Projektstruktur

```
├── apps/
│   ├── web/          # Next.js 15 — Shop + Admin UI
│   └── agents/       # Python FastAPI — KI-Agenten
├── packages/
│   ├── db/           # Prisma ORM + Schema
│   └── policy/       # Risikoklassen & Policy-Enforcement
├── scripts/          # Deploy- & Setup-Scripts
├── docker-compose.yml    # Dev: PostgreSQL
├── docker-compose.prod.yml  # Prod-Konfiguration
├── Caddyfile         # Reverse Proxy
└── Makefile          # Ein-Befehl-Entwicklung
```

## Deployment

- **Frontend**: Vercel (automatisch bei Push auf `main`)
- **Agents**: `scripts/deploy-agents.sh`

## Hinweise

- Die Python-Agents (`apps/agents`) benötigen einen `OPENAI_API_KEY` in `.env` für volle LLM-Funktionalität. Ohne API-Key laufen die Agents als Stubs, die Anfragen entgegennehmen aber nicht inhaltlich verarbeiten.
- **Datenbank**: Neon (Managed PostgreSQL)

## Kontakt

Michael Hahnel — info@medialess.de
