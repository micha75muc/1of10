# Iteration 3 – 🛡️ Sven (Security)
## Datum: 2026-03-22

## Status: ✅ Abgeschlossen

## Durchgeführte Verbesserungen:

### CRITICAL Fixes
1. **C1: Admin API Key aus Client-Code entfernt** — `approval-table.tsx` hatte `"dev-admin-key-change-in-production"` hardcoded in `"use client"` Komponente → an jeden Browser ausgeliefert. Fix: Key entfernt, `credentials: "include"` für Session-Cookie stattdessen.
2. **C2: Default-Key in Python-Agenten entfernt** — `http_client.py` hatte Fallback-Key. Fix: `os.environ.get()` mit Warning wenn nicht gesetzt.

### HIGH Fixes
3. **H2: Order-Status API Rate-Limited** — `/api/order-status` war ohne Rate-Limiting und gab `orderId` + `amountTotal` zurück. Fix: 10 req/min Rate-Limit, Response auf `status`, `isWinner`, `refundStatus`, `productName` reduziert.
4. **H3: Inkonsistenter Auth-Header** — Analytics nutzte `x-api-key`, Rest `x-admin-api-key`. Fix: Analytics auf `x-admin-api-key` vereinheitlicht.
5. **H4: CSP `unsafe-eval` entfernt** — Stripe braucht kein `eval()`. Fix: Nur noch `'unsafe-inline'` (für Tailwind/Next.js nötig).
6. **H5: Newsletter Rate-Limiting** — `/api/newsletter` war unbegrenzt. Fix: 5 req/min per IP.

### MEDIUM Fixes
7. **M1: JSON-LD XSS-Schutz** — `dangerouslySetInnerHTML` mit `JSON.stringify()` escaped kein `</script>`. Fix: `.replace(/</g, "\\u003c")` auf allen JSON-LD Ausgaben (3 Dateien).
8. **M2: Image Proxy SSRF geschlossen** — `hostname: "**"` erlaubte beliebige Image-Optimierung. Fix: Nur `1of10.de` als erlaubter Host.

### LOW Fixes
9. **L2: E-Mail in Logs maskiert** — Newsletter-Signups loggen jetzt `te***@example.com` statt Klartext.
10. **L4: Stripe Mock Production Guard** — `STRIPE_MOCK=true` in Production wirft jetzt expliziten Error.

### Dependency Updates
11. **Next.js 15.5.12 → 15.5.14** — 2 CVEs gefixt (HTTP Request Smuggling, Disk Cache DoS)
12. **Prisma 6.19.2 → 6.x latest** — Aktuell, effect-CVE ist in Prisma-Dev-Dependency (kein Runtime-Risiko)

## Nicht gefixt (bewusst akzeptiert):
- `hono` CVEs (8 moderate/high) — transitive Dev-Dependencies von `@prisma/dev`, kein Runtime-Code
- `unsafe-inline` in CSP — benötigt von Tailwind CSS inline Styles und Next.js
- CSRF auf API-Routes — Checkout leitet zu Stripe weiter (begrenztes Risiko), Newsletter hat jetzt Rate-Limit
- Admin-Middleware — aktuell ok mit per-Route-Checks, Risiko steigt bei neuen Routes

## Dateien geändert:
- `apps/web/app/(admin)/admin/approvals/approval-table.tsx` — API Key entfernt
- `apps/agents/core/http_client.py` — Default-Key entfernt
- `apps/web/app/api/admin/analytics/route.ts` — Header vereinheitlicht
- `apps/web/app/api/order-status/route.ts` — Rate-Limit + Response minimiert
- `apps/web/app/api/newsletter/route.ts` — Rate-Limit + E-Mail maskiert
- `apps/web/next.config.ts` — CSP unsafe-eval entfernt, Image-Proxy eingeschränkt
- `apps/web/lib/stripe.ts` — Production Mock Guard
- `apps/web/app/(shop)/products/[sku]/page.tsx` — JSON-LD XSS Fix
- `apps/web/app/layout.tsx` — JSON-LD XSS Fix
- `apps/web/package.json` — Next.js 15.5.14

## Metriken:
- **Vulnerabilities:** 3 Runtime → 0 Runtime (12 Dev-only in hono/effect bleiben)
- **Tests:** 63/63 ✅
- **OWASP Top 10 Coverage:** A01 Broken Access ✅, A02 Crypto ✅, A03 Injection ✅, A05 Misconfig ✅, A07 Auth ✅, A10 SSRF ✅

## Nächste Iteration für Sven:
- Admin-Middleware (`middleware.ts`) für zentrale Auth
- CSP Nonces statt `unsafe-inline`
- bcrypt/argon2 für Admin-Passwort
- E2E Penetration Test (manuell)
