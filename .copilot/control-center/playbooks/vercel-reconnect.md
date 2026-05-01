# 🔌 Vercel ↔ GitHub Auto-Deploy reparieren

**Status (2026-05-01):** 🔴 **P0 — Production stale.**
Die Hardening-Merges Round 1-6 (PR #7, #8, #9, #22, #26, #27) sind in `main`, aber **nicht** auf 1of10.de deployed.

## Diagnose

```powershell
gh api repos/gim-home/1of10/deployments
# → []  (sollte: Liste mit recent deployments)

gh api repos/gim-home/1of10/commits/$(git rev-parse main)/check-runs --jq '.check_runs | length'
# → 0  (sollte: ≥ 1, "Vercel" check)
```

Production-Site liefert `x-vercel-cache: HIT` mit `age` > 12h auf `/`, und neue Strings (Trust-Bar, Cookie-Banner-Wording, Live-Bag-Block) fehlen im HTML obwohl `MISS` zurückkommt → der **Build** ist alt, nicht nur der Cache.

## Ursache (wahrscheinlich)

- Vercel-Project ist mit einem **anderen Repo** verknüpft (z.B. ältere Fork/Mirror), oder
- GitHub-Vercel-App wurde **deinstalliert / OAuth widerrufen**, oder
- `Production Branch` im Vercel-Dashboard zeigt nicht auf `main`.

## Fix-Schritte (User-Action im Vercel-Dashboard nötig)

1. **Vercel-Dashboard öffnen** → Projekt `1of10` → **Settings → Git**
2. Prüfen:
   - **Connected Git Repository** = `gim-home/1of10`?
     - Falls anderes Repo / leer → "Connect Git Repository" → GitHub → `gim-home/1of10` auswählen
   - **Production Branch** = `main`?
3. **Settings → Integrations → GitHub** prüfen:
   - Vercel-App muss auf `gim-home`-Org installiert sein
   - Repo-Access muss `1of10` einschließen
4. **Force-Deploy auslösen:**
   - Dashboard → **Deployments** → **"⋯" auf letztem Deploy → Redeploy** (mit aktuellem Commit), ODER
   - Trivialen Commit auf `main` pushen (z.B. Whitespace) → sollte automatisch deployen

## Verifikation (von Clawpilot aus)

Nach Reconnect:

```powershell
# 1. Aktuelle main-SHA holen
$sha = git rev-parse main; $shaShort = $sha.Substring(0,7)
"Expecting SHA: $shaShort"

# 2. /api/build-info auf prod fragen (existiert ab Round 7)
$bi = Invoke-RestMethod -Uri "https://1of10.de/api/build-info" -TimeoutSec 30
"Live SHA:     $($bi.shaShort)  ref=$($bi.ref)  builtAt=$($bi.respondedAt)"

# 3. Deployments-Liste in GitHub
gh api repos/gim-home/1of10/deployments --jq '.[0:3] | .[] | {sha: .sha[0:7], env: .environment, created: .created_at}'
```

**Erwartung:** `bi.shaShort == $shaShort` (oder eines der letzten 1-2 main-Commits, falls gerade Build läuft).

## Fallback: Manueller Deploy ohne GitHub-Integration

Falls die Integration sich nicht reparieren lässt:

1. Vercel CLI installieren (nicht auf Class-A-Maschine, andere Dev-Box):
   ```bash
   npm i -g vercel
   vercel login
   cd 1of10
   vercel --prod
   ```
2. Vercel-Token in GitHub Secrets ablegen + Deploy-Workflow `.github/workflows/deploy.yml` schreiben.

→ Aber der saubere Fix ist die Reconnection im Dashboard.
