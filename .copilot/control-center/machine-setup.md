# Pro-Maschine Setup-Checklist

> Du arbeitest mit Clawpilot von **mehreren PCs** (OneDrive-synced). Diese Liste hilft, jeden PC einsatzbereit zu machen.

## Empfehlung: zwei Maschinen-Klassen

### A) "Clawpilot-Only" (Steuerungs-PC)
Du **denkst und entscheidest** hier. Keine Builds, keine Container.
**Pflicht:**
- ✅ Clawpilot installiert + M365 sign-in (`m_m365_status`)
- ✅ VS Code (für gelegentliches manuelles Lesen)
- ✅ Python 3.11+ (für Ad-hoc-Scripts wie Margenanalyse)
- ✅ Git for Windows (`git` in PATH)
- ✅ GitHub CLI (`gh auth login`)
- ✅ Browser für Vercel/Neon/Stripe-Dashboards

**Optional:**
- Node.js + pnpm — nur wenn du lokal builden willst
- Docker Desktop — nur wenn du DB/Redis lokal laufen lässt

### B) "Full-Dev" (Build-PC)
Hier laufen Tests, Builds, Container.
**Zusätzlich:**
- Node.js 20+ (`node`, `npm`)
- pnpm 9+
- Docker Desktop (mit WSL2-Backend)
- Vercel CLI (`npm i -g vercel`)
- Stripe CLI (https://stripe.com/docs/stripe-cli)
- (optional) Python venv in `apps/agents/.venv`

## Aktuelle Maschine prüfen

```powershell
# In PowerShell:
foreach ($t in 'git','gh','node','pnpm','docker','vercel','stripe','python','code') {
  $f = Get-Command $t -ErrorAction SilentlyContinue
  "{0,-10} {1}" -f $t, ($(if ($f) { $f.Source } else { 'MISSING' }))
}
```

## Erstes Setup (frischer PC)

```powershell
# 1. Git + GitHub CLI (Winget)
winget install --id Git.Git -e
winget install --id GitHub.cli -e

# 2. Node.js + pnpm (nur Klasse B)
winget install --id OpenJS.NodeJS.LTS -e
npm install -g pnpm@9

# 3. Vercel + Stripe CLIs (nur Klasse B)
npm install -g vercel
winget install --id Stripe.StripeCLI -e

# 4. Auth
gh auth login          # GitHub
vercel login           # Vercel
stripe login           # Stripe (öffnet Browser)

# 5. Repo-Setup (im OneDrive-Ordner)
cd "C:\Users\$env:USERNAME\OneDrive - Microsoft\Documents\Clawpilot\1of10"
Copy-Item .env.example .env.local
# .env.local manuell mit echten Werten füllen
pnpm install
pnpm --filter @repo/db db:generate
```

## OneDrive-Hinweise

- `node_modules/` ist **gitignored** und sollte **nicht** in OneDrive synchronisieren — sonst extreme Sync-Performance-Probleme.
  → `node_modules` im OneDrive-Settings als "immer auf diesem Gerät behalten" markieren ist OK; *Ausschluss* von Sync nur wenn bekannt wie.
- `.env.local` ist gitignored, **wird aber** über OneDrive synced — das kann nützlich sein (Secrets auf allen PCs gleich) oder gefährlich. Entscheidung: bewusst.
  - **Empfehlung:** `.env.local` in OneDrive **OK**, aber 2FA + Bitlocker auf allen PCs.

## Diese Maschine (mhahnel @ aktuell, 2026-05-01)

```
git    MISSING
gh     MISSING
node   MISSING
pnpm   MISSING
docker MISSING
vercel MISSING
stripe MISSING
python C:\…\Python312\python.exe   ✅
code   C:\…\Microsoft VS Code\bin\code.cmd  ✅
```

→ Diese Maschine ist aktuell **Klasse A "Clawpilot-Only"**. Für Builds/Deploys nutzen wir die Cloud (GitHub Actions, Vercel-Auto-Deploy on Push).
Falls du hier doch lokal arbeiten willst → folge "Erstes Setup" oben.
