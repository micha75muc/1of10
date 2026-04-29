# ADR-003 — Vendor-Account-Pflicht: 3-Touchpoint-UX

- **Status:** Accepted
- **Datum:** 2025-Q4
- **Entscheidet:** Felix (Frontend), Bea (Behavioral), Michael (Founder)
- **Verwandt:** `Product.requiresVendorAccount`, `apps/web/app/(shop)/products/[slug]/page.tsx`,
  `apps/web/lib/email.ts → orderConfirmationEmail`

## Kontext

**~104 von 119 SKUs** in unserem DSD-Katalog (~87%) erfordern dass der
Endkunde einen kostenlosen Account beim Hersteller anlegt, bevor er den
Lizenzschlüssel aktivieren kann. Beispiele: NordVPN, ExpressVPN,
Bitdefender, Norton, Kaspersky, McAfee, …

Das ist **keine Eigenheit von 1of10**, sondern eine Branchenkonvention
für SaaS-/Subscription-Lizenzen — die Hersteller wollen den Kunden
selbst onboarden für Renewal/Upsell.

Vor dem Audit war die Information "Du musst ein Konto beim Hersteller
anlegen" nur in der Bestätigungsmail erwähnt — Käufer bemerkten erst
**nach** dem Bezahlen, dass sie einen Extra-Schritt machen müssen.
Beschwerden wurden zu Refund-Anfragen.

## Entscheidung

Wir kommunizieren die Vendor-Account-Pflicht an **drei Touchpoints**:

1. **Produktseite** (vor Kauf):
   - Banner direkt unter dem Buy-Button:
     "🔑 Setzt ein kostenloses {Vendor}-Konto voraus."
   - Soll Käufer-Erwartung kalibrieren BEVOR sie ihre Karte zücken.

2. **Bestellbestätigungsseite** (nach Kauf):
   - 3-Schritt-Anleitung: "1. Lizenzkey aus Mail. 2. Konto bei {Vendor}
     anlegen. 3. Aktivieren bei {vendorActivationUrl}."
   - Direkt-Link zum Hersteller-Aktivierungsportal.

3. **Bestätigungs-E-Mail**:
   - Gleicher 3-Schritt-Block + Link.
   - Nochmal explizit: "Falls du noch kein Konto bei {Vendor} hast — du
     brauchst eines, bevor der Key funktioniert."

Pro Produkt steuern drei DB-Felder die UX:

- `requiresVendorAccount: boolean` — Master-Flag, schaltet die Banner ein
- `vendorName: string?` — Anzeigename (zb. "NordVPN")
- `vendorActivationUrl: string?` — Direkt-Link zum Onboarding-Portal

## Konsequenzen

- ✅ **Drastische Reduktion von Beschwerden** — User wissen vor dem Kauf
  Bescheid (Erwartungs-Management).
- ✅ **Keine SKU-Erweiterung nötig** — über DB-Flags steuerbar, nicht im
  Code.
- ✅ **DSGVO-konform** — Keine Daten werden vorab an den Hersteller
  geschickt; der Kunde legt sein Konto selbst an.
- ⚠️ **Conversion-Drop möglich** — Banner kann abschrecken. Mitigation:
  positiv formulieren ("kostenlos", "branchenüblich") statt Negativ.
- ⚠️ **Pflege-Aufwand** — bei neuem SKU müssen `vendorName` + `vendorActivationUrl`
  manuell gepflegt werden. Nestor-Agent macht das im Procurement-Workflow.

## Alternativen die verworfen wurden

- **Nur in der Mail erwähnen** — Status quo vor dem Audit. Kunden
  beschwerten sich.
- **Aktiv für den Kunden Account anlegen** — Datenschutz + AGB der
  Hersteller verbieten das in den meisten Fällen.
- **Vendor-Account-Pflicht zentral als Footer-Banner** — geht in der
  generischen Wahrnehmung unter; muss kontextspezifisch zur SKU sein.
