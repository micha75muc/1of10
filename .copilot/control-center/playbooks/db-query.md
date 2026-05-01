# Playbook: Datenbank-Queries (Neon Postgres)

## Setup einmalig

1. **Neon Console** → Project `oneoften` → "Branches" → neuen Branch `analytics-readonly` anlegen (Cost: 0 €, kopiert das Schema)
2. Connection-String kopieren (sieht aus wie `postgresql://user:pwd@ep-...neon.tech/oneoften?sslmode=require`)
3. In `.env.local` einfügen als `DATABASE_URL_READONLY=...`
4. (Optional) `psql` installieren: `winget install PostgreSQL.PostgreSQL`

## Variante A — Neon SQL Editor (Browser)

Schnell, ohne lokale Tools. https://console.neon.tech → Branch wählen → SQL Editor.
Beispiele unten einfach reinkopieren.

## Variante B — `psql` CLI

```powershell
$env:PGURL = (Get-Content .env.local | Select-String 'DATABASE_URL_READONLY=' | ForEach-Object { ($_ -replace '^DATABASE_URL_READONLY=','' -replace '^"','' -replace '"$','') })
psql $env:PGURL
```

## Variante C — Python ad-hoc (auf dieser Maschine ✅)

```python
# scripts/clawpilot/db.py
import os, psycopg2, sys
from dotenv import load_dotenv
load_dotenv(".env.local")
conn = psycopg2.connect(os.environ["DATABASE_URL_READONLY"])
cur = conn.cursor()
cur.execute(sys.argv[1])
for row in cur.fetchall():
    print(row)
```

## Beispiel-Queries

### Echte Refund-Quote (letzte 30 Tage)

```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'paid')                   AS paid,
  COUNT(*) FILTER (WHERE status = 'refunded')               AS refunded,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'refunded')
              / NULLIF(COUNT(*) FILTER (WHERE status IN ('paid','refunded')), 0), 2) AS refund_pct
FROM "Order"
WHERE "createdAt" >= NOW() - INTERVAL '30 days';
```

### Top SKUs nach Umsatz

```sql
SELECT p.brand, p.title, COUNT(*) AS sales, SUM(o.amount)/100.0 AS gross_eur
FROM "Order" o JOIN "Product" p ON p.id = o."productId"
WHERE o.status = 'paid' AND o."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY p.brand, p.title
ORDER BY gross_eur DESC
LIMIT 20;
```

### Margen-Realität (statt Schätzung)

```sql
-- benötigt cost-Spalte; falls fehlend: über DSD-Snapshot joinen
SELECT
  p.brand,
  ROUND(AVG(o.amount/100.0), 2)                                          AS avg_sell,
  ROUND(AVG(p.cost), 2)                                                  AS avg_cost,
  ROUND(AVG(0.9 * o.amount/100.0 - p.cost - 0.25), 2)                    AS avg_eff_margin
FROM "Order" o JOIN "Product" p ON p.id = o."productId"
WHERE o.status = 'paid'
GROUP BY p.brand
ORDER BY avg_eff_margin DESC;
```

### Funnel: Visit → Cart → Order

(setzt PostHog/Plausible-Daten in DB voraus — sonst aus Plausible-Dashboard)

## Sicherheit

- **Niemals** `DROP`, `DELETE`, `UPDATE` auf Production-Branch von Clawpilot aus.
- Read-Only Branch ist genau dafür da.
- Wenn Schreib-Operation nötig: PR mit Migration → Vercel Build → Production-Deploy.
