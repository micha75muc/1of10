# Credentials & Zugänge — Checkliste

> **Diese Datei enthält KEINE Secrets.** Sie dokumentiert nur, **was** wir brauchen, **wo** es liegt und ob es vorhanden ist. Echte Werte → `.env.local` / Vercel / 1Password.

Letzter Stand: 2026-05-01 (post E2E dry-run)

## Quick-Check

| ID | Wofür | Wo gespeichert | Lokal vorhanden? | Production gesetzt? |
|---|---|---|---|---|
| `DATABASE_URL` | Neon Postgres (Production) | Vercel + `.env.local` | ✅ | ✅ Production+Preview+Development (rotiert 2026-05-01 nach GitGuardian-Alert) |
| `DATABASE_URL_READONLY` | Neon Read-Only Branch (Analyse) | `.env.local` | ❌ Noch nicht angelegt | n/a |
| `REDIS_URL` | Redis (Cache + BullMQ) | Vercel + `.env.local` | ❓ | ❓ |
| `STRIPE_SECRET_KEY` | Stripe API (Live oder Test) | Vercel + `.env.local` | ❌ Placeholder | ⚠️ STRIPE_MOCK=true (Mock-Modus) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Frontend | Vercel + `.env.local` | ❌ Placeholder | ⚠️ Mock-Modus |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook-Verifikation | Vercel + `.env.local` | ❌ Placeholder | ⚠️ Mock-Modus (synthetic webhook) |
| `STRIPE_MOCK` | Mock-Stripe in Production | Vercel | n/a | ✅ `true` (Test-Phase) |
| `TEST_MODE` | Globaler Test-Bypass | Vercel | n/a | ✅ `true` (Test-Phase) |
| `STRIPE_RESTRICTED_KEY_RO` | Read-only Key für Reports/Analysen | `.env.local` | ❌ Noch nicht angelegt | n/a |
| `RESEND_API_KEY` | Kunden-E-Mails | Vercel + `.env.local` | ❌ Placeholder | ⚠️ EMAIL_MOCK=true (Mock-Modus, Konsole-Log) |
| `RESEND_FROM_EMAIL` | Absender (z.B. `1of10 <noreply@medialess.de>`) | Vercel + `.env.local` | ❓ | ❓ Domain-Verify in Resend ausstehend (GOAL-AUDIT Kritisch #1) |
| `EMAIL_MOCK` | Mock-Email in Production | Vercel | n/a | ✅ `true` (Test-Phase, gated by TEST_MODE) |
| `OPENAI_API_KEY` | LangGraph-Agents (LLM-Calls) | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `AGENTS_INTERNAL_SECRET` | Web↔Agents shared secret | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `ADMIN_EMAIL` | Admin-Login | Vercel + `.env.local` | ✅ `michael.hahnel@medialess.de` | ✅ Production |
| `ADMIN_PASSWORD_HASH` | Admin-Login (bcrypt) | Vercel + `.env.local` | ✅ | ✅ Production |
| `SESSION_SECRET` | HMAC für Admin-Session-Cookie | Vercel + `.env.local` | ✅ | ✅ Production |
| `ADMIN_API_KEY` | Header-Auth für Deploy-Scripts | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `DSD_API_USERNAME` | DSD Europe Login | Vercel + `.env.local` | ❌ | ❌ Sandbox-Creds noch nicht gesetzt (Live-Fulfillment offen) |
| `DSD_API_PASSWORD` | DSD Europe Passwort | Vercel + `.env.local` | ❌ | ❌ siehe oben |
| `DSD_API_BASE_URL` | DSD Endpoint (sandbox vs live) | Vercel + `.env.local` | ❌ | ❌ |
| `DSD_FULFILMENT_MODE` | `quickorder` (default) | `.env.local` | n/a | ❌ Default OK, aber TEST_MODE liefert Dummy-Keys |
| `MIROFISH_LLM_API_KEY` | Customer-Simulation (optional) | `.env.local` | ❌ Optional | n/a |
| `GH_TOKEN` | GitHub CLI / API | Windows Credential Manager (via `gh auth login`) | ✅ (mhahnel_microsoft + micha75muc) | n/a |
| `VERCEL_TOKEN` | Vercel CLI / API | User Env Var | ✅ (rotiert 2026-05-01) | n/a |

## E2E Dry-Run Status (2026-05-01)

Mit `STRIPE_MOCK=true`, `TEST_MODE=true`, `EMAIL_MOCK=true` sind **alle Pfade getestet**:

- ✅ Mock checkout (`/api/checkout`) → 200, Stripe-Session erzeugt
- ✅ Synthetic webhook → Order persistiert mit Lizenz-Key (`DUMMY-TEST-*`)
- ✅ `/bestellstatus` → Lookup per session_id+email rendert Key + Betrag
- ✅ Resend (`POST /api/orders/{id}/resend`) → `{ok:true}`
- ✅ Refund-Flow (Winner) → `isWinner=true`, `status=REFUNDED`, `refundStatus=COMPLETED`
- ✅ CSV-Export, Admin-Analytics, Admin-Health (207 spiegelt 3 historische DELIVERY_FAILED korrekt)
- ✅ Admin Orders-Liste (`/admin/orders`) mit Email-/Status-Filter

**Was vor Live-Schaltung noch zwingend nötig ist:**

1. **Resend Domain-Verify** für `medialess.de` (oder eigene `1of10.de` Domain)
2. **DSD Sandbox-Creds** + ein echter `quickOrder`-Roundtrip mit echtem Lizenz-Key
3. `STRIPE_MOCK` und `EMAIL_MOCK` auf `false` setzen, echte Stripe-Keys hinterlegen, Webhook-Secret konfigurieren
4. `TEST_MODE=false` — sonst werden Dummy-Keys ausgeliefert
5. 52 Produkte ohne `dsdProductCode` aktuell ausgeblendet — entweder mappen (`packages/db/scripts/map-dsd-codes.mjs`) oder dauerhaft akzeptieren


## Externe Accounts (Owner-Zugang)

| Service | Owner-Account | 2FA aktiv? | Notiz |
|---|---|---|---|
| GitHub Org `gim-home` | michael@... | ❓ | Repo `1of10` private |
| Vercel | michael@... | ❓ | Projekt: `1of10` |
| Neon | michael@... | ❓ | DB: `oneoften` |
| Stripe | michael@... | ❓ | Live + Test Mode |
| Resend | info@medialess.de | ❓ | Verified Domain `medialess.de` |
| DSD Europe | medialess (API: `medialess`, Sandbox: `medialess_apitest`) | n/a | Kontakt: Jody van Gils |
| Domain `medialess.de` | michael@... | ❓ | Registrar TBD |
| OneDrive (Workspace) | mhahnel@microsoft.com | ✅ Microsoft | Dieser Ordner |

## Was Clawpilot direkt nutzen kann

- **M365-Adressbuch** (Outlook/Teams) → über `m365_*` Tools
- **Repo-Inhalt** → über `view`/`edit`/`grep`
- **Web-Fetch** → für öffentliche APIs (DSD, Stripe-Status, Vercel-Status)

## Was Clawpilot **nicht** sehen kann (bewusst)

- Inhalte von `.env.local` (sollte gitignored bleiben)
- Inhalte von Windows Credential Manager / 1Password
- Live-Production-DB ohne explizite Connection-String-Übergabe

## Wenn ich Clawpilot Zugriff geben will

1. **Neon Read-Only Branch:** Branch in Neon Console anlegen → `DATABASE_URL_READONLY` in `.env.local` setzen → "Clawpilot, query Neon mit dem Read-Only String"
2. **Stripe Restricted Key:** Dashboard → Developers → API Keys → Restricted Key (read-only Charges/Refunds/BalanceTx) → in `.env.local`
3. **GitHub:** `gh auth login` einmalig auf der Maschine → Clawpilot kann `gh` Befehle nutzen
4. **Vercel:** `vercel login` einmalig → Clawpilot kann deployen/Env-Vars lesen

Sobald gesetzt, **niemals** in den Chat/Repo posten.
