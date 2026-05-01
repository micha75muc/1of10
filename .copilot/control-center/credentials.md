# Credentials & Zugänge — Checkliste

> **Diese Datei enthält KEINE Secrets.** Sie dokumentiert nur, **was** wir brauchen, **wo** es liegt und ob es vorhanden ist. Echte Werte → `.env.local` / Vercel / 1Password.

Letzter Stand: 2026-05-01

## Quick-Check

| ID | Wofür | Wo gespeichert | Lokal vorhanden? | Production gesetzt? |
|---|---|---|---|---|
| `DATABASE_URL` | Neon Postgres (Production) | Vercel + `.env.local` | ❓ TBD | ❓ TBD |
| `DATABASE_URL_READONLY` | Neon Read-Only Branch (Analyse) | `.env.local` | ❌ Noch nicht angelegt | n/a |
| `REDIS_URL` | Redis (Cache + BullMQ) | Vercel + `.env.local` | ❓ | ❓ |
| `STRIPE_SECRET_KEY` | Stripe API (Live oder Test) | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Frontend | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook-Verifikation | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `STRIPE_RESTRICTED_KEY_RO` | Read-only Key für Reports/Analysen | `.env.local` | ❌ Noch nicht angelegt | n/a |
| `RESEND_API_KEY` | Kunden-E-Mails | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `RESEND_FROM_EMAIL` | Absender (z.B. `1of10 <noreply@medialess.de>`) | Vercel + `.env.local` | ❓ | ❓ |
| `OPENAI_API_KEY` | LangGraph-Agents (LLM-Calls) | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `AGENTS_INTERNAL_SECRET` | Web↔Agents shared secret | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` | Admin-Login | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `SESSION_SECRET` | HMAC für Admin-Session-Cookie | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `ADMIN_API_KEY` | Header-Auth für Deploy-Scripts | Vercel + `.env.local` | ❌ Placeholder | ❓ |
| `DSD_API_USERNAME` | DSD Europe Login | Vercel + `.env.local` | ❓ | ❓ |
| `DSD_API_PASSWORD` | DSD Europe Passwort | Vercel + `.env.local` | ❓ | ❓ |
| `DSD_FULFILMENT_MODE` | `quickorder` (default) | `.env.local` | n/a | ✅ Doku |
| `MIROFISH_LLM_API_KEY` | Customer-Simulation (optional) | `.env.local` | ❌ Optional | n/a |
| `GH_TOKEN` | GitHub CLI / API | Windows Credential Manager (via `gh auth login`) | ❌ Diese Maschine | n/a |
| `VERCEL_TOKEN` | Vercel CLI / API | `.vercel/` (via `vercel login`) | ❌ Diese Maschine | n/a |

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
