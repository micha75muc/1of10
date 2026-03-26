# Manueller Fulfillment-Prozess (Interim)

> Nestor (Procurement): Bis die DSD-API-Automatik funktioniert, liefern wir Keys manuell.

## Voraussetzungen
- DSD Europe Login: https://www.dsdeurope.nl/ (Account: medialess_apitest)
- Zugang zum 1of10 Admin-Dashboard: https://1of10.de/admin
- Zugang zu Stripe Dashboard: https://dashboard.stripe.com

## Prozess bei eingehender Bestellung

### 1. Bestellung erkennen (< 1 Minute)
- Stripe sendet Webhook → Order wird in DB erstellt
- Admin-Dashboard zeigt neue Bestellung unter "Letzte Bestellungen"
- E-Mail-Benachrichtigung via Stripe (falls aktiviert)

### 2. Key bei DSD bestellen (< 5 Minuten)
1. DSD Portal einloggen
2. Produkt suchen (SKU-Mapping siehe `apps/agents/tools/dsd_sku_mapping.json`)
3. "Quick Order" → Menge 1 → Referenz: `1of10-{OrderID}`
4. Key/Lizenz wird sofort aktiviert und als Certificate angezeigt
5. Activation Code kopieren

### 3. Key an Kunden senden (< 2 Minuten)
1. E-Mail an Kunde senden (Vorlage unten)
2. Order-Status im Admin auf "DELIVERED" setzen (wenn Feld existiert)

### E-Mail-Vorlage

**Betreff:** Ihr Lizenzschlüssel von 1of10 — {Produktname}

```
Hallo,

vielen Dank für Ihren Kauf bei 1of10.de!

Ihr Lizenzschlüssel für {Produktname}:

🔑 {LIZENZ-KEY}

Aktivierung:
1. Gehen Sie auf die Website des Herstellers ({Hersteller-URL})
2. Erstellen Sie ein Konto oder loggen Sie sich ein
3. Geben Sie den Lizenzschlüssel ein
4. Folgen Sie den Installationsanweisungen

Bei Fragen antworten Sie einfach auf diese E-Mail.

Viele Grüße
Michael Hahnel
1of10.de
```

### Hersteller-Aktivierungs-URLs
| Marke | Aktivierungs-URL |
|-------|-----------------|
| Norton | https://my.norton.com/extspa/dashboard |
| McAfee | https://home.mcafee.com/root/landingpage.aspx |
| Bitdefender | https://central.bitdefender.com |
| Trend Micro | https://account.trendmicro.com |
| Panda | https://myaccount.pandasecurity.com |
| F-Secure | https://my.f-secure.com |
| Microsoft 365 | https://setup.office.com |
| Microsoft Office | https://setup.office.com |
| Windows | Einstellungen → Aktivierung → Product Key ändern |
| Parallels | In-App Aktivierung nach Installation |

### 4. Bei Erstattungs-Gewinnern
- Refund wird automatisch via Stripe verarbeitet
- Kunde behält den Key trotzdem (das ist das 1of10-Versprechen)
- KEIN manueller Eingriff nötig

## SLA-Ziel
- Lieferzeit: < 30 Minuten nach Zahlungseingang (während Geschäftszeiten)
- Außerhalb Geschäftszeiten: < 12 Stunden

## Eskalation
- DSD nicht erreichbar → Key aus eigenem Vorrat (wenn vorhanden)
- Kein Vorrat → Kunde per E-Mail informieren + Lieferzeitschätzung
