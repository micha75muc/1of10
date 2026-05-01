# Playbook: Resend Domain-Verifikation

> Pflicht-Schritt vor Live-Schaltung. Solange die Versand-Domain bei Resend
> nicht verifiziert ist, bleibt `EMAIL_MOCK=true` — Resend liefert sonst
> Order-Confirmations entweder gar nicht aus oder sie landen in Spam.
>
> Quelle: GOAL-AUDIT.md → Kritisch #1.

## Entscheidung: welche Domain?

| Option | Pro | Contra |
|---|---|---|
| **`medialess.de`** (empfohlen) | DNS-Kontrolle haben wir; Marken-Identität für Geschäftsmails | Mischt Marken (1of10 vs medialess) — könnte Kunden irritieren |
| `1of10.de` | Konsistent mit Domain — Absender wäre `noreply@1of10.de` | DNS-Records pflegen wir hier ohnehin (Vercel-Domain), zweiter Verifizierungsweg |

**Empfehlung:** Beide verifizieren. Primärer Versender: `noreply@1of10.de`,
Fallback / Reply-To: `info@medialess.de`. So bleibt Vertrauen an der Domain
des Shops.

## 0. Voraussetzungen

- Resend-Account-Login → https://resend.app/login (Owner: `info@medialess.de`)
- DNS-Provider-Zugang für die Domain
  - `medialess.de` → Registrar (steht laut credentials.md noch als TBD —
    vor dem Schritt klären!)
  - `1of10.de` → vermutlich derselbe Registrar, plus Vercel-Domain-Anbindung
- Neuen Resend API-Key, sobald die Domain grün ist (alter Test-Key wird
  nach Verify durch den verifizierten ersetzt)

## 1. Domain hinzufügen (UI)

1. Resend Dashboard → **Domains** → **Add Domain**
2. Domain: `1of10.de` (bzw. `medialess.de`) — keine Sub-Domain.
   Resend nutzt automatisch `send.<domain>` für DKIM-Selektoren, das
   ist OK so.
3. Region wählen: **EU (Frankfurt)** wegen DSGVO. Standard ist US — das
   ist wichtig zu ändern.
4. Resend zeigt nach „Add" eine Liste DNS-Records (typischerweise 3-4):
   - `MX` Record (für Bounces, optional)
   - `TXT` SPF (oder Update, falls schon einer existiert)
   - `TXT` DKIM (`resend._domainkey` o.Ä.)
   - `TXT` DMARC (empfohlen, eigener Record)

## 2. DNS-Records setzen

**Beispielwerte** (echte Werte kommen aus dem Resend-UI — niemals
copy-paste aus diesem Doc!):

| Type | Name | Value (Beispiel) |
|---|---|---|
| TXT | `send.1of10.de` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `resend._domainkey.1of10.de` | `resend._domainkey.resendlabs.com` |
| MX | `send.1of10.de` | `10 feedback-smtp.eu-west-1.amazonses.com` |
| TXT | `_dmarc.1of10.de` | `v=DMARC1; p=none; rua=mailto:dmarc@1of10.de` |

**Wichtig:**
- Falls bereits ein SPF-TXT existiert, nicht doppeln — bestehenden
  Record erweitern um `include:amazonses.com`.
- DKIM-Records sind oft mehrere — alle setzen.
- Bei Vercel-Domain (`1of10.de`): Records am Registrar setzen, nicht
  bei Vercel — Vercel DNS leitet nur an Vercel-Edge weiter, nicht an
  Resend.

## 3. Verifizieren

1. Resend Dashboard → Domain → **Verify DNS Records**
2. Wenn alles grün:
   - ✅ DKIM verified
   - ✅ SPF verified
   - (optional) ✅ MX verified
3. Wenn rot: TTL abwarten (manche Registrare brauchen 5-30 min, einige
   sogar 24 h), dann erneut auf „Verify" klicken.

## 4. API-Key + From-Email auf Vercel setzen

Nach erfolgreicher Verifikation:

1. Resend Dashboard → **API Keys** → **Create**
   - Permission: **Sending access** (nicht Full)
   - Domain: `1of10.de` (gerade verifiziert)
   - Name: `1of10-prod-2026-05`
2. Vercel-Env aktualisieren (oder über Vercel-CLI):
   ```
   RESEND_API_KEY=<neuer Key>
   RESEND_FROM_EMAIL=1of10 <noreply@1of10.de>
   ```
3. `EMAIL_MOCK` aus Production löschen ODER auf `false` setzen.
4. Deploy triggern (oder Vercel macht das automatisch bei Env-Änderung
   — siehe playbooks/deploy.md).

## 5. Rauchtest nach Live-Schaltung

```powershell
# Mit echten Stripe-Test-Keys (sk_test_), TEST_MODE=false, EMAIL_MOCK=false
$env:Path = "C:\Program Files\Python312-arm64;" + $env:Path
python C:\Users\mhahnel\AppData\Local\Temp\1of10-e2e.py
```

- Mock-Checkout an `michael.hahnel@medialess.de` schicken
- Im Postfach prüfen: Mail kommt rein, Absender ist `noreply@1of10.de`,
  DKIM gegen `1of10.de` grün (Gmail: „Show original" → SPF/DKIM=PASS).
- Kein Spam-Folder!

## 6. Falls Verifikation hängt

- DNS-Propagation prüfen:
  ```powershell
  nslookup -type=TXT _dmarc.1of10.de 1.1.1.1
  nslookup -type=CNAME resend._domainkey.1of10.de 1.1.1.1
  ```
- Resend-Status: https://status.resend.com
- Notfall-Fallback: temporärer Versand über `<irgendwer>@medialess.de`
  via Outlook-SMTP (manueller Resend an Kunden, bis Resend live ist).

## Status (2026-05-01)

- [ ] Registrar `medialess.de` geklärt
- [ ] Registrar `1of10.de` geklärt (Vercel-Domain, Records am Registrar
  setzen)
- [ ] Resend Domain `1of10.de` hinzugefügt
- [ ] DNS-Records gesetzt
- [ ] Domain verifiziert
- [ ] Neuer API-Key + RESEND_FROM_EMAIL auf Vercel
- [ ] EMAIL_MOCK aus Production entfernt
- [ ] Rauchtest ✅
