# Anwalts-Checklist — 1of10.de

## Status: ⏳ Noch kein Anwalt kontaktiert

## Priorität: 🔴 KRITISCH — VOR dem ersten echten Verkauf klären

---

## 1. Erstattungsmechanik (Shuffle Bag)

### Fragen an den Anwalt:
- [ ] Ist die "Wir erstatten jeden 10. Kauf" Mechanik nach deutschem Recht ein **Gewinnspiel** (§4a UWG)?
- [ ] Ist es eine **unzulässige Zugabe** nach UWG?
- [ ] Greift das **Glücksspielrecht** (GlüStV), da der Kunde nicht weiß ob er erstattet wird?
- [ ] Ist die Formulierung als "freiwillige Kulanzleistung" ausreichend, um KEIN Gewinnspiel zu sein?
- [ ] Muss "ohne Rechtsanspruch" in den AGB stehen? (Steht bereits drin)
- [ ] Ist die **PAngV** (Preisangabenverordnung) eingehalten? Der angezeigte Preis ist immer der zu zahlende Preis.

### Aktueller Status im Code:
- ✅ AGB §5: "freiwillige Kulanzleistung ohne Rechtsanspruch"
- ✅ Kein "kostenlos/GRATIS"-Wording (UWG-safe)
- ✅ Preis ist immer der verbindliche Kaufpreis
- ✅ Erstattung erfolgt nachträglich und einseitig

---

## 2. Widerrufsrecht bei digitalen Inhalten

### Fragen an den Anwalt:
- [ ] Ist der BGB §356 Abs. 5 Widerrufsverzicht-Checkbox korrekt implementiert?
- [ ] Muss der Kunde **aktiv** auf den Widerrufsverzicht klicken (nicht vorausgewählt)?
- [ ] Ist die Formulierung "Ich stimme zu, dass mit der Ausführung des Vertrags begonnen wird, und mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere" rechtlich korrekt?
- [ ] Gilt das 14-Tage-Widerrufsrecht trotzdem, wenn der Key noch nicht eingelöst wurde?

### Aktueller Status:
- ✅ Checkbox "BGB-Widerrufsverzicht" (nicht vorausgewählt)
- ✅ Server-side Validierung (beide Checkboxen müssen aktiv sein)
- ✅ Widerrufsbelehrung auf /widerruf Seite

---

## 3. Impressum und Pflichtangaben

### Fragen an den Anwalt:
- [ ] Sind alle Pflichtangaben nach §5 TMG / DDG vorhanden?
- [ ] Ist der Kleinunternehmer-Hinweis (§19 UStG) korrekt formuliert?
- [ ] Fehlt eine **Streitschlichtungsplattform**-Verlinkung (EU-Verordnung 524/2013)?

### Aktueller Status:
- ✅ Impressum mit echten Daten (Michael Hahnel, Adresse, E-Mail, Telefon)
- ✅ Kleinunternehmer-Hinweis
- ⚠️ EU-Streitschlichtungsplattform-Link fehlt möglicherweise

---

## 4. AGB und Datenschutz

### Fragen an den Anwalt:
- [ ] Sind die AGB für einen Online-Shop für digitale Güter vollständig?
- [ ] Ist die Datenschutzerklärung DSGVO-konform (Art. 13/14)?
- [ ] Sind alle Drittanbieter (Stripe, Resend, Neon, Vercel) korrekt aufgeführt?
- [ ] Ist die Cookie-Regelung korrekt ("nur technisch notwendige Cookies, kein Banner nötig")?

### Aktueller Status:
- ✅ AGB auf /agb (9 Paragraphen)
- ✅ Datenschutz auf /datenschutz (10 Abschnitte)
- ✅ Stripe-Cookie-Hinweis (TTDSG §25)
- ✅ Kein Cookie-Banner (nur technisch notwendige Cookies)

---

## 5. Button-Lösung und Checkout

### Fragen an den Anwalt:
- [ ] Ist "Zahlungspflichtig bestellen" als Button-Text korrekt (§312j BGB)?
- [ ] Sind die Produktinformationen vor dem Kauf vollständig sichtbar?
- [ ] Sind die "Endpreis"-Angaben PAngV-konform?

### Aktueller Status:
- ✅ Button "Zahlungspflichtig bestellen"
- ✅ "Endpreis" statt "inkl. MwSt." (Kleinunternehmer)

---

## 6. Empfohlene Anwälte (E-Commerce / München)

Für die Erstberatung (~200-300 €):
1. **Kanzlei Dr. Schwenke** — spezialisiert auf E-Commerce-Recht, DSGVO
2. **IT-Recht Kanzlei** (eshop-anwalt.de) — bekannt für Online-Shop-Rechtsprüfung
3. **Händlerbund** — Komplettpaket Rechtstexte + Abmahnschutz (~15 €/Monat)

### Budget: ~300 € für Erstberatung
### Nächster Schritt: Termin vereinbaren und diese Checklist als Gesprächsgrundlage nutzen
