# ADR-002 — DSD `quickOrder` statt `activateProduct`

- **Status:** Accepted
- **Datum:** 2025-Q4
- **Entscheidet:** Michael (Founder), Nestor (Procurement-Agent)
- **Verwandt:** `apps/agents/tools/dsd_client.py`, `apps/web/lib/key-delivery.ts`,
  Env: `DSD_FULFILMENT_MODE`

## Kontext

DSD Europe ist unser exklusiver Distributor (sandbox: `medialess_apitest`,
prod: `medialess`). Die DSD-API bietet zwei relevante Endpunkte zum
Liefern eines Lizenzschlüssels:

1. **`activateProduct`** — Klassischer "ich habe schon Keys auf meinem
   Konto, aktiviere einen davon für diesen Endkunden".
   - Voraussetzung: Wir müssen Keys vorab in Schüttungen einkaufen,
     auf unserem DSD-Konto lagern und in unsere DB synchronisieren.
2. **`quickOrder`** — "Bestelle einen Key für den Endkunden, DSD
   kümmert sich um Bezahlung + Aktivierung in einem Schritt".
   - Voraussetzung: Wir liefern Endkunden-Daten (Name, E-Mail,
     optional Adresse + Phone) mit der Bestellung.

## Entscheidung

Wir nutzen **`quickOrder` als Default-Modus** (`DSD_FULFILMENT_MODE=quickorder`).

Begründung:

- **Kein Working-Capital gebunden** — Wir kaufen Keys erst nach dem
  Stripe-Charge des Kunden. Bei 119 SKUs in unserem Katalog wäre Pre-Stock
  (zb. 10 Keys × 119 SKUs × 30€) ~36k€ totes Kapital ohne Garantie auf
  Verkauf.
- **Kein Sync-Drift** — Der DB-State "Wie viele Keys habe ich noch?" ist
  bei `activateProduct` eine zusätzliche Konsistenz-Achse, die jederzeit
  drift kann (manuelle Käufe in DSD-Portal, Test-Aktivierungen, …).
- **Keine Ablauf-Probleme** — Manche Hersteller (RX2, Norton) ziehen
  Keys nach 90 Tagen Inaktivität ein. Bei `quickOrder` kann das nicht
  passieren weil der Key direkt zum Endkunden geht.

### Trade-off

`quickOrder` legt den Endkunden bei DSD an. Das ist datenschutz-rechtlich
sauber abgedeckt (DSD ist Auftragsverarbeiter, AVV existiert), erhöht
aber den Datenfluss: bei Mock-Mode würden Tests **echte** Endkundendaten
verarbeiten, deshalb ist Mock-Mode strikt auf `medialess_apitest`
sandbox limitiert.

### Fallback-Modus

`DSD_FULFILMENT_MODE=activateProduct` bleibt als Notfall-Ventil bestehen
für SKUs, bei denen wir Keys vorab zum Sonderkonditions-Preis bekommen
(zb. Bundle-Aktionen). Wechseln wir dafür einzelne Produkte um, läuft
das im DSD-Tools-Code als if-Branch.

## Konsequenzen

- ✅ **Skalierbar** — neue SKUs sind nur ein DB-INSERT mit
  `dsdProductCode`, kein Pre-Stock.
- ✅ **Kein Working-Capital** — Geld fließt erst nach Stripe-Charge zu DSD.
- ✅ **Saubere Sandbox-Tests** — `medialess_apitest` liefert Dummy-Keys
  `XXXX-XXXX-XXXX-XXXX` ohne echte Aktivierung.
- ⚠️ **DSD-Verfügbarkeit ist kritischer Pfad** — wenn DSD down ist,
  scheitert Lieferung. Mitigation: `deliveryError` wird geloggt,
  Status `DELIVERY_FAILED`, manueller Retry möglich, Order **nicht**
  gestornoiert.
- ⚠️ **Endkundendaten gehen an DSD** — AVV + Datenschutzhinweis nötig
  (Datenschutzerklärung erwähnt es).

## Alternativen die verworfen wurden

- **`activateProduct` mit Pre-Stock** — Working-Capital + Sync-Drift,
  siehe oben.
- **Eigenes Key-Repository** — DSD hat exklusive Distributorenkonditionen,
  Eigen-Repo wäre teurer pro Lizenz.
