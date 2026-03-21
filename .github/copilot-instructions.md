# 1of10 — AI-Native E-Commerce Platform

## ⚠️ PFLICHT: Bei jedem neuen Chat ZUERST Memory laden!
Lies IMMER als allererste Aktion `/memories/repo/project-log.md` — dort steht der vollständige Projektstatus, alle Entscheidungen, offene Punkte, Infrastruktur-Details, Produkt-Sortiment, und Agenten-Team. Ohne dieses Log fehlt dir der Kontext aus allen bisherigen Chats.

## Business-Modell
- **1of10** — "Wir erstatten jeden 10. Kauf" (freiwillige Kulanzleistung, KEIN Gewinnspiel)
- Shuffle-Bag-Mechanik: Variable Größe 7-13, SHA-256 Audit-Hash, Bot-sicher
- Kleinunternehmer §19 UStG, Einzelunternehmer Michael Hahnel, München
- Distributor: **DSD Europe** (Jody van Gils, DACH Account Manager)

## Architektur
Headless E-Commerce für digitale Produkte (Security-Software, VPN, Backup, Optimierung).

### Monorepo-Struktur (Turborepo + pnpm)
- `apps/web` — Next.js 15 (App Router), Tailwind, Shop + Admin UI
- `apps/agents` — Python 3.12, FastAPI, LangGraph
- `packages/db` — Prisma ORM, Neon PostgreSQL (Product, Order, ApprovalItem, ShuffleBag)
- `packages/policy` — TypeScript Risikoklassen 1-4, Policy-Enforcement
- `autoresearch/` — Autonomes Verbesserungssystem (CPU-only)

### 21 Agenten-Team
Business: Michael (Orchestrator), Nestor (Procurement), Elena (Finance), Inge (Marketing), Martin (IT-Ops), Denny (Compliance)
Growth: Aria (AI-Citation), Bea (Gamification), Clara (Content), Gregor (Growth), Kai (Social), Lena (LinkedIn), Rico (Reddit), Sophie (SEO)
Engineering: Felix (Frontend), Daniel (Database), David (DevOps), Sven (Security), Tanja (Testing), Konrad (Code Review), Uwe (UI Design)

### Infrastruktur
- **Live:** https://1of10.de (Vercel)
- **DB:** Neon PostgreSQL
- **E-Mail:** Resend (onboarding@resend.dev, Domain-Verifizierung vertagt)
- **Payment:** Stripe Live-Modus (Webhook-Signatur aktiv)
- **DNS:** Strato (A→Vercel, CNAME www→Vercel)

### Datenmodell (Prisma)
- **Product**: id, sku, name, costPrice, sellPrice, minimumMargin, stockLevel, brand, category, description, imageUrl
- **Order**: id, stripeSessionId, productId, customerEmail, amountTotal, status, bgbWiderrufOptIn, dsgvoOptIn, isWinner, refundStatus
- **ApprovalItem**: id, agentId, riskClass, actionType, payload, status, approvedBy
- **ShuffleBag**: id, slots, currentIndex, isActive, slotsHash

### Regulatorik
- BGB §356 Abs. 5 — Widerrufsverzicht für digitale Inhalte (Pflicht-Checkbox)
- DSGVO — Datenschutz-Einwilligung (Pflicht-Checkbox)
- EU AI Act — Transparenz über KI-gesteuerte Entscheidungen
- §4a UWG — Erstattung als "Kulanz", NICHT als "kostenlos/Gewinn"
- PAngV — Preise sind "Endpreise" (Kleinunternehmer)
- TTDSG §25 Abs. 2 — Kein Cookie-Banner nötig (nur technisch notwendige Cookies)

### Befehle
```bash
pnpm install                    # Dependencies installieren
pnpm --filter @repo/db db:push  # DB-Schema synchronisieren
cd apps/web && npx next build   # Build (NICHT next dev --turbopack, Prisma-Bug!)
cd apps/web && npx next dev     # Dev-Server (Port 3000, OHNE --turbopack)

# Vercel Deploy (Monorepo-Workaround über /tmp/1of10-deploy)
# Siehe /memories/repo/project-log.md für den vollständigen Deploy-Flow
```

### User-Präferenzen
- Sprache: Deutsch
- Will NICHTS im Terminal manuell ausführen — Agent macht alles selbst
- Agent-only Betrieb, maximale Automatisierung
- Bei jedem Agenten die Zuständigkeit in Klammern nennen (z.B. "Felix (Frontend)")
- Nach Code-Änderungen IMMER Build testen bevor "es funktioniert" gesagt wird
