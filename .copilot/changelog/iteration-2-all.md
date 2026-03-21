# Iteration 2 – Alle Agenten
## Datum: 2026-03-21

## Status: ✅ Abgeschlossen

## Durchgeführte Verbesserungen:

### 🛡️ Sven (Security)
- Content-Security-Policy Header (Stripe, Resend, Neon whitelisted)
- Strict-Transport-Security (HSTS) mit preload
- Next.js 15.5.12 → 15.5.14 (3 Vulnerabilities gefixt)
- Fail2Ban auf VPS installiert und konfiguriert (SSH: max 5 Versuche, 1h Ban)
- Unattended-upgrades auf VPS aktiviert

### 🧪 Tanja (Testing)
- @vitest/coverage-v8 installiert
- Coverage-Report funktioniert (100% auf checkout, shuffle-bag, rate-limit, approvals/[id])

### 📊 Elena (Finance)
- Margen-Übersicht im Admin-Dashboard (EK/VK/Marge/nach-Erstattung/Lager pro Produkt)
- Produkte mit <15% Marge nach Erstattung werden rot hervorgehoben

### Bereits vorhanden (kein Fix nötig):
- David: CI Pipeline (.github/workflows/ci.yml)
- Felix: Product Filter + Search Bar
- Sophie: FAQ Schema.org

## Metriken:
- Tests: 53/53 ✅
- Vulnerabilities: 3 → 0
- VPS: Fail2Ban aktiv, Auto-Updates aktiv
- CSP: Aktiv mit Stripe/Resend/Neon Whitelist

## Nächste Iteration:
- Sven: npm audit --fix auf allen Packages, SSH Key-Only Auth
- Tanja: Tests für email.ts, analytics.ts, action-dispatcher.ts
- Elena: CSV-Export für Steuerberater
- Felix: Product comparison page
- Clara: 2 weitere Blog-Artikel
