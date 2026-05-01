# Playbook: Daily Health-Check

> Tägliches "ist alles grün?"-Check. Clawpilot kann den Großteil davon selbst ausführen.

## Schnell-Check (5 Min)

| # | Check | Tool | Status-Quelle |
|---|---|---|---|
| 1 | Vercel Production läuft | `vercel ls --prod` oder Dashboard | Vercel |
| 2 | Letzte Deploys grün | `gh run list -L 5` | GitHub Actions |
| 3 | Stripe Webhook funktioniert | Stripe Dashboard → Webhooks → Recent | Stripe |
| 4 | DSD-API erreichbar | `python apps/agents/test_dsd_connection.py` | DSD |
| 5 | Sentry: keine neuen Errors | sentry.io Dashboard | Sentry |
| 6 | Plausible: Visits laufen | plausible.io/medialess.de | Plausible |
| 7 | Neon DB: keine Connection-Errors | Neon Dashboard | Neon |
| 8 | Resend: Mails kommen durch | resend.com/emails | Resend |

## Was Clawpilot **direkt** prüfen kann (ohne Tool-Install)

```python
# scripts/clawpilot/health.py
import requests, json
from datetime import datetime

checks = []

# Public site
r = requests.get("https://medialess.de", timeout=10)
checks.append(("medialess.de", r.status_code == 200, r.status_code))

# DSD public reachability
r = requests.get("https://www.dsdeurope.nl/api2s/login.json", timeout=10)
checks.append(("DSD api", r.status_code in (200, 401, 405), r.status_code))

# Stripe status page
r = requests.get("https://status.stripe.com/api/v2/status.json", timeout=10)
checks.append(("Stripe", r.json()["status"]["indicator"] == "none", r.json()["status"]["description"]))

# Vercel status
r = requests.get("https://www.vercel-status.com/api/v2/status.json", timeout=10)
checks.append(("Vercel", r.json()["status"]["indicator"] == "none", r.json()["status"]["description"]))

print(f"{datetime.now().isoformat()} health-check")
for name, ok, detail in checks:
    print(f"  {'✅' if ok else '❌'} {name:12s} {detail}")
```

Aufruf:
```powershell
python 1of10/scripts/clawpilot/health.py
```

## Erweiterter Check (15 Min)

Zusätzlich:
- Neon DB-Größe + Branch-Status (Console)
- Stripe Balance (Live + Test) (Dashboard)
- DSD Stock-Check für Top-10 SKUs (`@nestor` Issue oder direkter API-Call)
- 24h-Sales aus DB (siehe `playbooks/db-query.md`)
- Letzte Customer-Mails in Resend
- Open PRs und ihre CI-Status: `gh pr list`

## Auto-Trigger

Optional als GitHub Action `daily-health.yml` (cron) oder als Clawpilot-Automation (m_create_automation, schedule "every weekday at 9am").

## Bei Rotem Status

| Was | Wer | Wo |
|---|---|---|
| Vercel down | warten, Status-Page | vercel-status.com |
| DSD down | Mail an Jody | `playbooks/email-jody.md` |
| Stripe Webhook fail | `stripe events resend evt_…` | Stripe Dashboard |
| DB Connection-Limit | Neon Branch limits prüfen | Neon Dashboard |
| Errors in Sentry | Konrad/Sven dispatchen | `playbooks/agent-run.md` |
