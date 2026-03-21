# Iteration 1 – 🛡️ Sven (Security)
## Datum: 2026-03-21

## Status: ✅ Abgeschlossen

## Durchgeführte Verbesserungen:
1. Webhook-Endpoint Rate-Limiting (30 req/min) hinzugefügt
2. Informationsleck behoben: `isWinner` wird nicht mehr in Webhook-Response zurückgegeben
3. Admin-Approvals POST-Endpoint mit Auth-Check abgesichert (war offen!)
4. Security-Headers in next.config.ts: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
5. API-Routen Cache-Control: no-store
6. Checkout-Fallback-URL von localhost auf https://1of10.de geändert

## Dateien geändert:
- `apps/web/app/api/webhooks/stripe/route.ts` — Rate-Limiting, Info-Leak fix
- `apps/web/app/api/admin/approvals/route.ts` — Auth auf POST
- `apps/web/app/api/checkout/route.ts` — URL-Fallback fix
- `apps/web/next.config.ts` — Security-Headers

## Bereits vorhanden (kein Fix nötig):
- ✅ Webhook-Signaturprüfung (stripe.webhooks.constructEvent)
- ✅ Idempotenz (stripeSessionId unique check)
- ✅ Rate-Limiting auf Checkout (5/min)
- ✅ Server-side Compliance-Validierung
- ✅ Admin-API-Key rotiert (kein dev-Key mehr)
- ✅ VPS Firewall (UFW)

## Nächste Iteration für Sven:
- CSP Header (Content-Security-Policy) — braucht Analyse welche Domains benötigt werden
- Dependency Audit (npm audit)
- Fail2Ban auf VPS konfigurieren
- SSH Key-Only Auth auf VPS
