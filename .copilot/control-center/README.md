# 1of10 Control Center

> **Zweck:** Ein zentraler Ort, von dem aus du (oder Clawpilot in deinem Auftrag) **das gesamte 1of10-Projekt steuern** kannst — Code, Daten, Deploys, Kommunikation, Agents.

## Wo bin ich?

Du bist in `1of10/.copilot/control-center/`. Diese Doku liegt **im Repo**, ist also auf jeder Maschine via OneDrive verfügbar und git-versioniert. Secrets liegen **nicht** hier — siehe [`credentials.md`](./credentials.md).

## Was steuern wir von hier aus?

| Bereich | Wo | Werkzeug |
|---|---|---|
| **Code** | `1of10/` | Clawpilot view/edit/grep |
| **Git/PRs** | github.com/gim-home/1of10 | `gh` CLI oder Web |
| **Datenbank** | Neon (Production + Branches) | Neon Console / `psql` |
| **Deploys** | Vercel (web) + GitHub Actions | `vercel` CLI / `gh workflow run` |
| **Payments** | Stripe (Test + Live) | Stripe Dashboard / `stripe` CLI |
| **Distributor** | DSD Europe API | Eigener Client in `apps/agents/` |
| **E-Mails (eingehend)** | Outlook/M365 | Clawpilot M365-Tools |
| **E-Mails (an Kunden)** | Resend | API + `content/email-*.md` |
| **Agents** | LangGraph in `apps/agents/` + GitHub Coding Agents in `.github/agents/` | Python lokal oder `gh` |
| **Logs/Errors** | Vercel + Sentry | Web-UI / API |

## Schnellstart-Tabelle

| Ich will… | Lies… |
|---|---|
| Wissen, was wofür benötigt wird | [`credentials.md`](./credentials.md) |
| Einen Partner kontaktieren | [`contacts.md`](./contacts.md) |
| Auf einem neuen PC starten | [`machine-setup.md`](./machine-setup.md) |
| Deployen | [`playbooks/deploy.md`](./playbooks/deploy.md) |
| Echte Daten aus Neon lesen | [`playbooks/db-query.md`](./playbooks/db-query.md) |
| Mail an Jody / DSD schreiben | [`playbooks/email-jody.md`](./playbooks/email-jody.md) |
| Einen Agent laufen lassen | [`playbooks/agent-run.md`](./playbooks/agent-run.md) |
| Einen Refund auslösen | [`playbooks/refund.md`](./playbooks/refund.md) |
| Den Tagesstatus prüfen | [`playbooks/health-check.md`](./playbooks/health-check.md) |

## Sicherheits-Grundregel

> **NIEMALS** echte Secrets (API-Keys, Passwörter, DB-URLs mit Credentials) in dieses Verzeichnis committen.
>
> Secrets gehören in:
> - **Lokal:** `.env.local` (gitignored)
> - **Vercel:** Environment Variables im Dashboard
> - **GitHub:** Actions Secrets
> - **Persönlich:** 1Password / Windows Credential Manager

`credentials.md` listet **was wir brauchen**, nicht **was es ist**.

## Wartung

Wenn ein Playbook unvollständig oder veraltet wird: in derselben Datei oben unter `## Status` einen Datums-Eintrag mit `⚠️ outdated` und kurzem Hinweis. Clawpilot prüft das beim Lesen.
