# 1of10 — AI-Native E-Commerce Platform

## Kontext
Lies `/memories/repo/project-log.md` für vollständigen Projektstatus.

## Business
- **1of10** — "Wir erstatten jeden 10. Kauf" (Kulanz, KEIN Gewinnspiel)
- Shuffle-Bag: Variabel 7-13, SHA-256 Audit-Hash
- Kleinunternehmer §19 UStG, Michael Hahnel, München
- Distributor: DSD Europe

## Stack
- `apps/web` — Next.js 15, Tailwind, Stripe (Live)
- `apps/agents` — Python 3.12, FastAPI
- `packages/db` — Prisma, Neon PostgreSQL
- `packages/policy` — TypeScript Risk Classes
- **Live:** https://1of10.de (Vercel)

## Befehle
```bash
pnpm install
cd apps/web && npx next build    # Build (OHNE --turbopack)
cd apps/web && npx next dev      # Dev-Server
cd apps/web && npx vitest run    # Tests
python3 scripts/deploy-vercel.py # Deploy
```

## Regeln
- Sprache: Deutsch
- Agent macht alles — User führt nichts manuell aus
- Nach Code-Änderungen IMMER Build testen
- Agent-Namen mit Zuständigkeit: "Felix (Frontend)"
- Anti-Faulheit: Fixes unter 30 Min → SOFORT. Kein "nächste Iteration"
- Einzige Ausnahme für "nicht gefixt": externe Blocker (DSD, Anwalt)
