# Playbook: Deploy

## TL;DR

**Standardweg:** `git push origin main` → Vercel deployt automatisch. Fertig.

**Wenn das nicht reicht:** siehe Varianten unten.

## Variante 1 — Auto-Deploy via Push (Standard)

1. Lokal Änderungen committen
2. `git push origin main` (oder PR mergen)
3. Vercel webhook → Build → Deploy
4. Status prüfen:
   - Vercel Dashboard, oder
   - `vercel ls` (CLI)

**Clawpilot kann das, wenn `git` + `gh` installiert sind.**

## Variante 2 — Manueller Deploy via Vercel CLI

```powershell
cd 1of10
vercel --prod
```

Prompts:
- Link to existing project? → ja, `1of10`
- Override settings? → nein

## Variante 3 — Re-Run eines GitHub Actions Workflows

```powershell
gh workflow list
gh workflow run <workflow-name>.yml
gh run watch
```

## Variante 4 — Hotfix-Branch

```powershell
git checkout -b hotfix/<beschreibung>
# … fix …
git commit -am "hotfix: <was>"
git push -u origin HEAD
gh pr create --fill --base main
gh pr merge --squash --auto
```

## Pre-Flight-Check

Vor jedem Production-Deploy prüfen:

| Check | Wie |
|---|---|
| Tests grün | `pnpm test` lokal oder GH Actions |
| Build grün | `pnpm build` lokal oder Vercel-Preview |
| `STRIPE_MOCK=false` in Vercel? | Vercel Dashboard → Settings → Env |
| `EMAIL_MOCK=false` in Vercel? | Vercel Dashboard → Settings → Env |
| Migration vorhanden? | `packages/db/prisma/migrations/` |
| DSD IP-Whitelist OK? | offen — siehe contacts.md (Jody) |

## Rollback

Vercel: Dashboard → Deployments → "Promote to Production" auf vorigen Build klicken.
Oder CLI:

```powershell
vercel rollback
```

## Was Clawpilot ohne CLIs leisten kann

- PRs **vorbereiten** (Code ändern, Commit-Message schreiben)
- Pre-Flight-Checks **dokumentieren**
- **Nicht:** ohne `gh`/`vercel` push/deploy auslösen — du musst die Tools nachinstallieren oder es manuell tun.
