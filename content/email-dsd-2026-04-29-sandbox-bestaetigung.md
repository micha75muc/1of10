# Antwort-Mail an Jody van Gils — Sandbox bestätigt

**An:** jody@dsdeurope.nl
**Von:** info@medialess.de
**Betreff:** Re: medialess_apitest Sandbox-Account — funktioniert, herzlichen Dank!

---

Hallo Jody,

vielen Dank für die schnelle Freischaltung von **medialess_apitest** als
Test-Account! Wir haben die End-to-End-Pipeline erfolgreich durchgespielt:

- ✅ `login.json` — Cookie wird persistiert
- ✅ `quickOrder.json` (DSD150002 — Trend Micro Internet Security) → Zertifikat **5368308**
- ✅ `quickOrder.json` (DSD300031 — AVG TuneUp) → Zertifikat **5368309**
- ✅ `getActivationCodes.json` — Dummy-Key `XXXX-XXXX-XXXX-XXXX` korrekt zurückgeliefert
- ✅ Vollständiger Stripe-Checkout → Webhook → DSD-Sandbox → Datenbank-Eintrag mit License-Key

Damit ist unser kompletter Bestellprozess validiert, ohne dass echtes Geld
oder Pre-Stock im Spiel war. Genau was wir gebraucht haben.

Eine kleine Lessons-Learned-Notiz: Die **client_mandatory** Felder variieren
zwischen Produkten — DSD150002 verlangt `phone`, DSD300031 hingegen
`company`. Wir senden jetzt prophylaktisch alle Felder immer mit. Falls es
irgendwo eine Übersicht der Pflichtfelder pro Produktgruppe gibt, wäre das
für uns hilfreich.

> **Update 30. April:** Danke für den Hinweis auf `mandatoryClientFields` in
> `view.json` (Handbuch §3.2) — wir lesen das Feld jetzt pro Produkt und
> validieren vor jedem `quickOrder`, ob alle Pflichtfelder vorhanden sind.
> Hat sich erledigt.

**Eine Bitte zum Thema Produktbilder:** Wir haben für 41 unserer Produkte
die `packshotImage`-URLs aus dem Katalog automatisch synchronisiert
(super, vielen Dank!). Für folgende SKUs liefert die API allerdings ein
Platzhalter-Bild (`no-image.jpg`):

- **DSD300029** — AVG Internet Security
- **DSD300031** — AVG TuneUp
- **DSD310025** — AVG Ultimate
- **DSD180092** — (bitte prüfen, welcher Hersteller)
- **460025** — (bitte prüfen)
- **GDSA-AR** — G DATA AntiVirus

Falls von den Herstellern aktuelle Packshot-Bilder vorliegen, wären wir
sehr dankbar, wenn ihr sie in den Katalog einpflegen könntet — wir ziehen
sie dann automatisch nach.

Zu deinem Hinweis bezüglich eines separaten Live-Accounts: Sehr gerne,
sobald wir live gehen. Wir melden uns mit den Daten, sobald es soweit ist.

Nochmals herzlichen Dank für die unkomplizierte Unterstützung!

Beste Grüße
Michael Hahnel
1of10 / medialess
info@medialess.de
