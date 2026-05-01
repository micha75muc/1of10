# Playbook — DB Backup & Restore (Neon Postgres)

> O4 — Pre-Launch Backup-Strategie. Wird **vor** Live-Schaltung aktiviert.

## Was wird gesichert?

Alle relevanten Tabellen liegen auf **Neon Postgres** (Region: EU). Inhalte:

- `Product` — Katalog (Recoverable from seed/scripts)
- `Order` — **kritisch** (10-Jahre Aufbewahrungsfrist §147 AO)
- `ApprovalItem` — Audit-Trail KI-Entscheidungen (EU AI Act)
- `ShuffleBag` — Provably-fair Beweiskette (`/transparenz`)
- `NewsletterSignup` — DSGVO-Einwilligungen
- `Approval` — sonstige Admin-Entscheidungen

## Strategie

### 1. Neon Point-in-Time Recovery (automatisch, eingebaut)

Neon Free Tier behält **7 Tage Branching-History**. Pro-Tier erweitert auf 30 Tage.

→ **Action vor Launch:** Auf Pro-Tier upgraden (wenn Umsatz das rechtfertigt) und in Neon-UI bestätigen, dass `Restore window: 30 days` aktiv ist.

### 2. Wöchentlicher Logical Dump (extern)

Zusätzlich zum Neon-internen Backup ziehen wir **wöchentlich** einen `pg_dump` und legen ihn in einem separaten Storage ab (S3-kompatibel, idealerweise nicht beim selben Anbieter).

#### Manuell (jetzt sofort möglich)

```bash
# Voraussetzung: psql + pg_dump installiert (pg17)
# DATABASE_URL aus Vercel-Env oder Neon-Console
export DATABASE_URL="postgres://..."

DATE=$(date +%Y%m%d-%H%M)
pg_dump --format=custom --no-owner --no-acl \
        --file="1of10-$DATE.dump" \
        "$DATABASE_URL"

# Verschlüsseln (gpg, symmetric):
gpg --symmetric --cipher-algo AES256 "1of10-$DATE.dump"
# Hochladen zu Backup-Storage (Beispiel: cloudflare R2, Backblaze B2, …)
```

Backup-Datei landet als `1of10-YYYYMMDD-HHMM.dump.gpg`.

#### Automatisiert (vor Launch einrichten)

GitHub Actions Workflow `.github/workflows/db-backup.yml`:

```yaml
name: DB Backup
on:
  schedule:
    - cron: "0 4 * * 1"  # Montag 04:00 UTC
  workflow_dispatch:

jobs:
  dump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Install pg17
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client-17
      - name: Dump
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BACKUP_GPG_PASSPHRASE: ${{ secrets.BACKUP_GPG_PASSPHRASE }}
        run: |
          DATE=$(date +%Y%m%d-%H%M)
          pg_dump --format=custom --no-owner --no-acl \
                  --file="1of10-$DATE.dump" \
                  "$DATABASE_URL"
          gpg --batch --passphrase "$BACKUP_GPG_PASSPHRASE" \
              --symmetric --cipher-algo AES256 "1of10-$DATE.dump"
      - name: Upload to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.BACKUP_S3_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.BACKUP_S3_SECRET }}
        run: |
          aws s3 cp "1of10-*.dump.gpg" "s3://1of10-backups/" \
              --endpoint-url ${{ secrets.BACKUP_S3_ENDPOINT }}
```

**Secrets** (in GitHub Settings → Actions):
- `DATABASE_URL` — Neon Production
- `BACKUP_GPG_PASSPHRASE` — separates Passwort, nirgends sonst genutzt
- `BACKUP_S3_KEY` / `BACKUP_S3_SECRET` / `BACKUP_S3_ENDPOINT` — Bucket bei alternativem Provider

## Restore

### Restore in neue Neon-Branch (zum Sichten)

1. In Neon-Console: `Branches → Create from point in time` → gewünschten Zeitpunkt wählen
2. Neuer Connection-String wird angezeigt
3. Lokal verbinden: `psql "$NEW_BRANCH_URL"` → SQL-Queries gegen Snapshot

### Restore aus pg_dump

```bash
# 1. Dump entschlüsseln
gpg --output 1of10.dump --decrypt 1of10-20260501-0400.dump.gpg

# 2. Neuen Branch in Neon erzeugen ODER lokal Postgres starten
# 3. Schema vorbereiten (Prisma):
pnpm --filter @repo/db prisma db push

# 4. Daten zurückspielen
pg_restore --no-owner --no-acl \
           --dbname="$DATABASE_URL" \
           1of10.dump
```

**Wichtig:** `--no-owner --no-acl` weglassen wenn der Ziel-User eine andere Identität hat.

## Disaster-Recovery-Test (vor Launch ausführen)

Quartalsweiser Drill:

1. Letztes Backup runterladen, entschlüsseln
2. In neue Neon-Branch restoren
3. App lokal gegen den Restore-Branch starten
4. Stichprobe: letzten 10 Orders pro `customerEmail` finden, License-Keys prüfen
5. Restore-Zeit messen (Ziel: < 15 min)

Ergebnis dokumentieren in `.copilot/control-center/dr-tests/YYYY-MM-DD.md`.

## Was NICHT gesichert wird

- **Stripe-Daten** (Charges, Refunds): liegen bei Stripe, von dort jederzeg rekonstruierbar
- **Resend-Logs** (E-Mails): nur 30 Tage bei Resend, danach weg — bewusst keine PII bei uns horten
- **Vercel-Edge-Cache**: stateless, kein Backup nötig

## Verantwortlich

- Daniel (DB-Agent) bekommt Hinweis-Action wenn ein Backup-Run fehlschlägt (via O3-Alert).
- Manuell: Michael Hahnel.
