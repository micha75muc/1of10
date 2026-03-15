# 1of10 — AI-Native E-Commerce Platform

## Architektur
Headless E-Commerce für Software-Lizenzen mit "Gamified Refund" (10% Gewinnchance).

### Monorepo-Struktur (Turborepo + pnpm)
- `apps/web` — Next.js 15 (App Router), Tailwind, Shop + Admin UI
- `apps/agents` — Python 3.12, FastAPI, LangGraph (7 KI-Agenten)
- `packages/db` — Prisma ORM, PostgreSQL (Product, Order, ApprovalItem)
- `packages/policy` — TypeScript Risikoklassen 1-4, Policy-Enforcement

### Datenmodell (Prisma)
- **Product**: id, sku, name, costPrice, sellPrice, minimumMargin, stockLevel
- **Order**: id, stripeSessionId, productId, customerEmail, amountTotal, status, bgbWiderrufOptIn, dsgvoOptIn, isWinner, refundStatus
- **ApprovalItem**: id, agentId, riskClass, actionType, payload, status, approvedBy

### Risikoklassen (Policy-Layer)
1. READ_ONLY — Keine Genehmigung nötig
2. DRAFT_PROPOSAL — Geloggt, keine Blockierung
3. OPERATIONAL_WRITE — Geloggt in DB, Ausführung erlaubt
4. HIGH_RISK_EXECUTION — Blockiert, Approval Queue

### Regulatorik
- BGB §356 Abs. 5 — Widerrufsverzicht für digitale Inhalte (Pflicht-Checkbox)
- DSGVO — Datenschutz-Einwilligung (Pflicht-Checkbox)
- EU AI Act — Transparenz über KI-gesteuerte Entscheidungen

### Befehle
```bash
pnpm install                    # Dependencies installieren
docker compose up -d            # PostgreSQL + Redis starten
pnpm --filter @repo/db db:push  # DB-Schema synchronisieren
pnpm --filter @repo/web dev     # Next.js Dev-Server (Port 3000)

# Python Agents
cd apps/agents
source .venv/bin/activate
uvicorn main:app --reload       # FastAPI Dev-Server (Port 8000)
```
