# Playbook: Refund / Stripe-Operationen

> **⚠️ Echtgeld-Operationen.** Niemals automatisiert ohne explizite Bestätigung.

## Refund-Typen

| Typ | Wann | Wer löst aus |
|---|---|---|
| **Gewinn-Refund** (10 %-Mechanik) | jeder 10. Kauf, automatisch | App-Backend |
| **Kulanz-Refund** | Kunde unzufrieden, Bug | manuell, Owner-Entscheidung |
| **Chargeback / Dispute** | Stripe meldet Dispute | manuell + Doku |
| **Test-Cleanup** | Sandbox-Tests | `scripts/cleanup-test-orders.mjs` |

## Read-Only Checks von Clawpilot aus

Mit Stripe Restricted Key (read-only):

```powershell
# Charges der letzten 24h
stripe charges list --limit 50 --created.gte (Get-Date).AddDays(-1).ToUnixTime()

# Refunds der letzten 7 Tage
stripe refunds list --limit 100

# Eine bestimmte Order prüfen
stripe payment_intents retrieve pi_XXXXXXXXXXXX
```

Oder per Stripe Dashboard (Browser).

## Refund auslösen

### Via Admin-UI (empfohlen)
`/admin/orders/<orderId>` → "Refund" Button → bestätigt durch Admin-Login.

### Via Stripe CLI (Notfall)
```powershell
stripe refunds create --payment-intent pi_XXXXXX --reason requested_by_customer
```

### Via API in Code
`apps/web/src/app/api/admin/refund/route.ts` — POST `{ orderId }`.

## Pre-Flight für Refund

| Check | Wie |
|---|---|
| Order existiert in DB? | DB-Query |
| Charge ist `succeeded`? | `stripe payment_intents retrieve` |
| Noch nicht refunded? | DB + Stripe |
| DSD Lizenz-Key bereits ausgeliefert? | `Order.licenseKey` in DB |
| → Falls ja: Key invalidieren? (DSD-Policy) | mit Jody klären |

## Stripe-Webhooks debuggen

```powershell
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# In zweitem Terminal:
stripe trigger checkout.session.completed
```

## Was Clawpilot ohne Stripe-CLI tun kann

- Read-only Queries via API (mit Restricted Key) per `curl`/Python-Snippet
- Order-Daten aus Neon ziehen
- Refund-**Antrag** als Issue/Markdown vorbereiten — du löst final aus
