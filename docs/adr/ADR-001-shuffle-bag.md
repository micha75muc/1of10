# ADR-001 — Shuffle-Bag mit variabler Größe (7-13)

- **Status:** Accepted
- **Datum:** 2025-Q4
- **Entscheidet:** Michael (Founder)
- **Verwandt:** `apps/web/lib/shuffle-bag.ts`, `packages/db/prisma/schema.prisma → ShuffleBag`

## Kontext

1of10 ist als **Kulanz-Modell** konzipiert: jeder 10. Kauf wird komplett
erstattet. Das ist *kein* Gewinnspiel im juristischen Sinne — sondern eine
freiwillige Geschäftsbedingung des Verkäufers (vgl. § 346 BGB Rückgewähr
+ § 19 UStG Kleinunternehmer; siehe `legal/`).

Der naheliegende Algorithmus ist `Math.random() < 0.1`. Den haben wir
bewusst **nicht** gewählt:

1. **Streuung** — Zufalls-IID-Ziehung erzeugt Cluster: 50 Gewinner in
   1000 Käufen, aber lokal manchmal 0/100 oder 5/100. Das verzerrt die
   Cashflow-Planung.
2. **Beweisbarkeit** — Bei einem Kunden-Streit ("ich war der 10., warum
   habe ich nichts bekommen?") können wir nicht zeigen, dass der Würfel
   fair war.
3. **Vertrauen** — "Wir erstatten ungefähr jeden 10. Kauf" liest sich
   anders als "garantiert jeden 10.".

## Entscheidung

Wir verwenden einen **Shuffle-Bag** (auch: "bag randomization"):

- Beim Anlegen: erzeuge einen Array `[1, 0, 0, …, 0]` mit Länge `n` wo
  `n` zufällig zwischen **7 und 13** gewählt wird.
- Mische via Fisher-Yates (`crypto.randomInt`-basiert, nicht
  `Math.random`).
- Speichere `slotsHash = SHA-256(JSON.stringify(slots))` zusammen mit
  dem Bag in der DB.
- Jeder Kauf zieht Slot `currentIndex`, inkrementiert und ist Gewinner
  wenn der Slot `1` ist.
- Wenn der Bag erschöpft ist (`currentIndex === slots.length`), wird
  ein neuer Bag erzeugt.

### Warum 7-13 statt fix 10?

Variable Größe verhindert, dass jemand mit Auto-Buys den Gewinn-Slot
exakt vorhersagen kann ("ich kaufe immer als 10. nach Bag-Reset"). Der
Erwartungswert bleibt bei 1/10 — nur die Varianz steigt.

### Warum SHA-256-Audit-Hash?

Der Hash wird zur Bag-Erstellung berechnet und gespeichert. Bei einem
Streit können wir die Slots öffentlich machen und der Kunde kann den
Hash nachrechnen — das beweist, dass wir nach der Tatsache nichts
manipuliert haben.

## Konsequenzen

- ✅ **Beweisbar fair** — Hash in DB, Slots nachprüfbar.
- ✅ **Berechenbarer Cashflow** — exakt `n/10` Gewinner pro Bag, nicht
  ungefähr.
- ✅ **Kunden-Vertrauen** — auf der Transparenz-Seite zeigen wir den
  aktuellen Bag-Hash live.
- ⚠️ **Komplexer als Math.random** — der Bag muss via DB-Transaktion
  gezogen werden (sonst Race-Condition bei zwei parallelen Käufen).
- ⚠️ **Kein perfekter Erwartungswert pro Bag** — bei 7er-Bag ist die
  Quote 1/7 ≠ 1/10. Über viele Bags konvergiert das aber gegen 1/10.

## Alternativen die verworfen wurden

- **`Math.random() < 0.1`** — siehe Kontext, Streuung und Beweisbarkeit.
- **Fixe 10er-Bags** — vorhersagbar, gamebar.
- **Live-Random via Random.org-API** — externe Abhängigkeit, schlechter
  Cashflow.
