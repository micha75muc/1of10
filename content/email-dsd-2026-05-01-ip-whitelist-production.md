# IP-Whitelist für Production-Account

**An:** jody@dsdeurope.nl
**Von:** info@medialess.de
**CC:** —
**Betreff:** IP-Whitelist für Production-Zugriff `medialess` — bitte um Freischaltung
**Status:** draft

---

Hallo Jody,

unsere Sandbox-Tests mit `medialess_apitest` sind abgeschlossen — der
komplette E2E-Pfad läuft (Stripe-Checkout → Webhook → DSD `quickOrder`
→ `getActivationCodes` → DB → Kunden-Mail). Wir bereiten jetzt die
Live-Schaltung von 1of10.de vor.

Bevor wir auf Production umstellen, brauchen wir eine IP-Whitelist
für den Production-Account `medialess`. Aktuell antwortet die Production
auf API-Calls aus unserer Infrastruktur mit HTTP 403.

**Unsere ausgehenden IPs (alle, die `quickOrder` aufrufen können):**

- Hetzner Agents-Container (Cloud, IPv4): `<bitte einsetzen vor Versand>`
- Hetzner Agents-Container (Cloud, IPv6): `<bitte einsetzen vor Versand>`
- (Vercel-Webhooks rufen DSD nicht direkt auf — alles geht über Hetzner)

Falls eine IP hinzukommt (z. B. Failover-Region), melden wir uns vorher.

**Sicherheits-/Audit-Setup auf unserer Seite:**

- DSD-Aufrufe nur aus dem Agents-Container, nicht aus dem Web-Frontend
- Credentials in `AGENTS_INTERNAL_SECRET`-gegated Service, nicht in der
  Vercel-Edge erreichbar
- `quickOrder` ist Risk-Class 4 — jeder Call wird in unserer DB als
  `OrderEvent` mit `productCode`, `certificate_id`, `referenceId` und
  Timestamp protokolliert

**Bitte nochmal bestätigen, was du für die Whitelist brauchst:**

1. Statische ausgehende IPv4 (haben wir, kein Carrier-NAT)
2. Optional: ein Test-Call aus der Whitelist-IP, mit dem wir prüfen
   können, dass der `403` weg ist?

Sobald die Whitelist steht, schalten wir `DSD_API_USERNAME=medialess`
auf der Hetzner-Seite scharf und machen einen letzten kontrollierten
`quickOrder` mit kleinem Produkt (z. B. DSD300031, EK ~2,40 €), bevor
1of10.de live geht.

Vielen Dank vorab!

Beste Grüße
Michael Hahnel
1of10 / medialess
info@medialess.de
